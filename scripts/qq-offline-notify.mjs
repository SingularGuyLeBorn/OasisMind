/**
 * QQ / NapCat 掉线人工协助通知：
 *   掉线 →（可选）杀进程重拉由 start-napcat 负责 → 拉 WebUI 二维码 + 截窗 → 邮件附图
 *   上线 → 截 QQ 主界面邮件 + 给主人发一条 QQ 私聊
 *
 *   node scripts/qq-offline-notify.mjs offline "kicked"
 *   node scripts/qq-offline-notify.mjs online
 *   node scripts/qq-offline-notify.mjs qr          # 只拉二维码发邮件（强制，忽略冷却）
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const AGENTMAIL_API_BASE = "https://api.agentmail.to/v0";

function loadRootEnv() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  let raw = fs.readFileSync(envPath);
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) raw = raw.subarray(3);
  for (const rawLine of raw.toString("utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadRootEnv();

let mailDispatcher = null;
async function ensureMailDispatcher() {
  if (mailDispatcher) return mailDispatcher;
  const proxyUrl =
    process.env.KP_HTTPS_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim() ||
    process.env.KP_HTTP_PROXY?.trim() ||
    "";
  if (!proxyUrl) return null;
  try {
    const undiciPath = path.join(projectRoot, "apps/server/node_modules/undici");
    const undici = require(fs.existsSync(undiciPath) ? undiciPath : "undici");
    mailDispatcher = new undici.ProxyAgent(proxyUrl);
    return mailDispatcher;
  } catch (err) {
    console.warn(
      `[qq-offline-notify] 代理初始化失败: ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

/** AgentMail 走代理；本地 WebUI / OneBot 绝不能走 Clash */
async function mailFetch(url, init = {}) {
  const dispatcher = await ensureMailDispatcher();
  if (dispatcher) {
    try {
      const undiciPath = path.join(projectRoot, "apps/server/node_modules/undici");
      const undici = require(fs.existsSync(undiciPath) ? undiciPath : "undici");
      return undici.fetch(url, { ...init, dispatcher });
    } catch {
      /* fall through */
    }
  }
  return fetch(url, init);
}

const ENABLED = (process.env.ONEBOT_QQ_OFFLINE_MAIL || "true").trim().toLowerCase() !== "false";
const COOLDOWN_MS = Math.max(
  60_000,
  parseInt(process.env.ONEBOT_QQ_OFFLINE_MAIL_COOLDOWN_MS || String(20 * 60_000), 10),
);
const WEBUI_URL = (process.env.ONEBOT_WEBUI_URL || "http://127.0.0.1:6099").trim().replace(/\/$/, "");
const HTTP_URL = (process.env.ONEBOT_HTTP_URL || "http://127.0.0.1:3001").trim().replace(/\/$/, "");
const ACCESS_TOKEN = (process.env.ONEBOT_ACCESS_TOKEN || "").trim();
const STATE_PATH = path.join(projectRoot, "tools/napcat_framework/offline-mail-state.json");
const CAPTURE_DIR = path.join(projectRoot, "tools/napcat_framework/.offline-mail-shots");
const CAPTURE_PS1 = path.join(projectRoot, "scripts/qq-capture-window.ps1");
const DISMISS_PS1 = path.join(projectRoot, "scripts/qq-dismiss-offline-dialog.ps1");

function readState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeState(patch) {
  const next = { ...readState(), ...patch, updatedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function recipient() {
  return (
    process.env.ONEBOT_QQ_OFFLINE_MAIL_TO?.trim() ||
    process.env.AGENTMAIL_ASK_TO?.trim() ||
    process.env.EMAIL_TO?.trim() ||
    ""
  );
}

/** 主人 QQ：登录成功后 Bot 私聊通知的对象 */
function ownerQq() {
  const explicit =
    process.env.ONEBOT_QQ_OWNER?.trim() ||
    process.env.ONEBOT_QQ_NOTIFY_USER?.trim() ||
    "";
  if (explicit && /^\d{5,}$/.test(explicit)) return explicit;
  const mail = recipient();
  const m = mail.match(/^(\d{5,})@qq\.com$/i);
  if (m) return m[1];
  const allowed = (process.env.ONEBOT_ALLOWED_USERS || "")
    .split(",")
    .map((s) => s.trim())
    .find((s) => /^\d{5,}$/.test(s));
  return allowed || "";
}

function readWebUiToken() {
  try {
    const p = path.join(projectRoot, "tools/napcat_framework/config/webui.json");
    let buf = fs.readFileSync(p);
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3);
    return String(JSON.parse(buf.toString("utf8")).token || "").trim();
  } catch {
    return process.env.ONEBOT_WEBUI_TOKEN?.trim() || process.env.NAPCAT_WEBUI_SECRET_KEY?.trim() || "";
  }
}

function runPs1(scriptPath, args = []) {
  if (!fs.existsSync(scriptPath)) return { ok: false, out: `missing ${scriptPath}` };
  const r = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    { encoding: "utf8", windowsHide: true, timeout: 45_000 },
  );
  return {
    ok: r.status === 0,
    status: r.status,
    out: `${r.stdout || ""}${r.stderr || ""}`.trim(),
  };
}

/** @returns {string[]} png paths */
function captureQqWindows(prefix) {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
  runPs1(DISMISS_PS1);
  const shot = runPs1(CAPTURE_PS1, ["-OutDir", CAPTURE_DIR, "-Prefix", prefix]);
  const paths = [];
  for (const line of shot.out.split(/\r?\n/)) {
    if (!line.startsWith("WROTE|")) continue;
    const p = line.split("|")[1];
    if (p && fs.existsSync(p)) paths.push(p);
  }
  return paths;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function webUiCredential() {
  const token = readWebUiToken();
  if (!token) return "";
  const hash = crypto.createHash("sha256").update(`${token}.napcat`).digest("hex");
  const res = await fetch(`${WEBUI_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return data?.data?.Credential || "";
}

async function webUiPost(cred, apiPath, body = {}) {
  const res = await fetch(`${WEBUI_URL}/api${apiPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cred}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && (data?.code === undefined || data?.code === 0), status: res.status, data };
}

/**
 * 从 NapCat WebUI 拉登录二维码图（qrcode 字段是 URL / dataURL）。
 * @returns {Promise<string|null>} png path
 */
export async function fetchWebUiLoginQrPng() {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
  try {
    const cred = await webUiCredential();
    if (!cred) {
      console.log("[qr] WebUI 登录失败（无 Credential）");
      return null;
    }
    // 先刷新，尽量拿到新码
    await webUiPost(cred, "/QQLogin/RefreshQRcode", {}).catch(() => null);
    await new Promise((r) => setTimeout(r, 800));

    let qrPayload = await webUiPost(cred, "/QQLogin/GetQQLoginQrcode", {});
    if (!qrPayload.ok) {
      // 已登录则无码
      const msg = String(qrPayload.data?.message || "");
      if (/logined/i.test(msg)) {
        console.log("[qr] QQ 已登录，无二维码可拉");
        return null;
      }
      // CheckLoginStatus 里也可能带 qrcodeurl
      const st = await webUiPost(cred, "/QQLogin/CheckLoginStatus", {});
      const url = st.data?.data?.qrcodeurl || "";
      if (!url) {
        console.log("[qr] GetQQLoginQrcode 失败:", msg || qrPayload.status);
        return null;
      }
      qrPayload = { ok: true, data: { data: { qrcode: url } } };
    }

    const qrcode = qrPayload.data?.data?.qrcode || qrPayload.data?.qrcode || "";
    if (!qrcode) {
      console.log("[qr] 空 qrcode 字段");
      return null;
    }

    let buf;
    if (/^data:image\/\w+;base64,/i.test(qrcode)) {
      buf = Buffer.from(qrcode.replace(/^data:image\/\w+;base64,/i, ""), "base64");
    } else if (/^https?:\/\//i.test(qrcode) || qrcode.startsWith("/")) {
      const abs = qrcode.startsWith("/") ? `${WEBUI_URL}${qrcode}` : qrcode;
      const imgRes = await fetch(abs, { signal: AbortSignal.timeout(15000) });
      if (!imgRes.ok) {
        console.log("[qr] 下载二维码 URL 失败", imgRes.status);
        return null;
      }
      buf = Buffer.from(await imgRes.arrayBuffer());
    } else if (/^[A-Za-z0-9+/=]{200,}$/.test(qrcode)) {
      buf = Buffer.from(qrcode, "base64");
    } else {
      // 少数实现直接给原始 URL 文本，用 qrcode 库不引入依赖——写 URL 到旁路 txt，仍截窗
      console.log("[qr] 未知 qrcode 形态:", String(qrcode).slice(0, 80));
      return null;
    }

    const out = path.join(CAPTURE_DIR, `webui-qr-${Date.now()}.png`);
    fs.writeFileSync(out, buf);
    console.log(`[qr] 已保存 WebUI 登录二维码 → ${out}`);
    return out;
  } catch (e) {
    console.log(`[qr] 拉取失败: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function loadNodemailer() {
  const candidates = [
    path.join(projectRoot, "apps/server/node_modules/nodemailer"),
    path.join(projectRoot, "node_modules/nodemailer"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return require(p);
    } catch {
      /* try next */
    }
  }
  return null;
}

async function sendViaSmtp({ to, subject, text, html, shotPaths }) {
  const nodemailer = loadNodemailer();
  if (!nodemailer?.createTransport) {
    return { ok: false, error: "nodemailer 未安装（apps/server）" };
  }
  const user = process.env.EMAIL_SMTP_USER?.trim() || "";
  const pass = process.env.EMAIL_SMTP_PASS?.trim() || "";
  if (!user || !pass) {
    return { ok: false, error: "SMTP 未配置 EMAIL_SMTP_USER / EMAIL_SMTP_PASS" };
  }
  if (!to) return { ok: false, error: "收件人未配置" };

  const host = process.env.EMAIL_SMTP_HOST || "smtp.qq.com";
  const port = Number(process.env.EMAIL_SMTP_PORT || "465");
  const secure =
    process.env.EMAIL_SMTP_SECURE !== undefined
      ? process.env.EMAIL_SMTP_SECURE === "true"
      : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const attachments = (shotPaths || []).slice(0, 4).map((p, i) => ({
    filename: path.basename(p) || `shot-${i + 1}.png`,
    path: p,
    cid: `qqshot${i}@knowpilot`,
  }));

  let htmlBody = html;
  if (attachments.length) {
    htmlBody +=
      "<hr/>" +
      attachments
        .map((a) => `<p><img src="cid:${a.cid}" alt="${escapeHtml(a.filename)}" style="max-width:100%"/></p>`)
        .join("");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_SMTP_FROM || user,
    to,
    subject,
    text,
    html: htmlBody,
    attachments,
  });
  return { ok: true, channel: "smtp" };
}

async function sendViaAgentMail({ to, subject, text, html, shotPaths }) {
  const apiKey = process.env.AGENTMAIL_API_KEY?.trim();
  const inboxId = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!apiKey) return { ok: false, error: "AGENTMAIL_API_KEY 未配置" };
  if (!inboxId) return { ok: false, error: "AGENTMAIL_INBOX_ID 未配置" };
  if (!to) return { ok: false, error: "收件人未配置" };

  const attachments = (shotPaths || []).slice(0, 4).map((p, i) => ({
    filename: path.basename(p) || `shot-${i + 1}.png`,
    content_type: "image/png",
    content: fs.readFileSync(p).toString("base64"),
  }));

  const res = await mailFetch(
    `${AGENTMAIL_API_BASE}/inboxes/${encodeURIComponent(inboxId)}/messages/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 OasisMind-NapCat/1.0",
      },
      body: JSON.stringify({
        to: [to],
        subject,
        text,
        html: html || `<pre>${escapeHtml(text)}</pre>`,
        ...(attachments.length ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      res.status === 403
        ? "（本机访问 api.agentmail.to 被拦，需 Clash 代理 KP_HTTPS_PROXY）"
        : "";
    return {
      ok: false,
      error: `AgentMail HTTP ${res.status} ${body.error || body.message || ""}${hint}`.trim(),
    };
  }
  return {
    ok: true,
    channel: "agentmail",
    messageId: body.message_id || body.messageId,
  };
}

async function sendViaNtfy({ subject, text, shotPaths }) {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return { ok: false, error: "NTFY_TOPIC 未配置" };
  const base = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(topic)}`;
  const headers = {
    Title: subject.slice(0, 250),
    Priority: process.env.NTFY_PRIORITY?.trim() || "high",
    Tags: "warning,qq",
  };
  const token = process.env.NTFY_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const first = shotPaths?.[0];
  if (first && fs.existsSync(first)) {
    headers.Filename = path.basename(first);
    headers["Content-Type"] = "image/png";
    headers.Message = text.slice(0, 4000);
    const res = await mailFetch(url, {
      method: "PUT",
      headers,
      body: fs.readFileSync(first),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `ntfy HTTP ${res.status} ${t.slice(0, 200)}` };
    }
    return { ok: true, channel: "ntfy" };
  }

  const res = await mailFetch(url, {
    method: "POST",
    headers,
    body: text,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, error: `ntfy HTTP ${res.status} ${t.slice(0, 200)}` };
  }
  return { ok: true, channel: "ntfy" };
}

async function sendNotifyPayload(payload) {
  const errors = [];
  const smtp = await sendViaSmtp(payload).catch((e) => ({
    ok: false,
    error: e instanceof Error ? e.message : String(e),
  }));
  if (smtp.ok) return smtp;
  errors.push(`smtp: ${smtp.error}`);

  const am = await sendViaAgentMail(payload).catch((e) => ({
    ok: false,
    error: e instanceof Error ? e.message : String(e),
  }));
  if (am.ok) return am;
  errors.push(`agentmail: ${am.error}`);

  const ntfy = await sendViaNtfy(payload).catch((e) => ({
    ok: false,
    error: e instanceof Error ? e.message : String(e),
  }));
  if (ntfy.ok) return ntfy;
  errors.push(`ntfy: ${ntfy.error}`);

  return { ok: false, error: errors.join(" | ") };
}

/** 登录成功后用 Bot 给主人发一条 QQ 私聊（本地 OneBot，不走代理） */
export async function sendOwnerQqMessage(text) {
  const userId = ownerQq();
  if (!userId) {
    return { ok: false, error: "未配置 ONEBOT_QQ_OWNER（或无法从邮箱推导）" };
  }
  const headers = { "Content-Type": "application/json" };
  if (ACCESS_TOKEN) headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  try {
    const res = await fetch(`${HTTP_URL}/send_private_msg`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: Number(userId) || userId,
        message: String(text || "").slice(0, 3500),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || (body.retcode !== undefined && body.retcode !== 0)) {
      return {
        ok: false,
        error: `OneBot send_private_msg HTTP ${res.status} ret=${body.retcode} ${body.message || body.wording || ""}`.trim(),
      };
    }
    console.log(`💬 已向主人 QQ ${userId} 发送上线确认私聊`);
    return { ok: true, userId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function collectOfflineShots(prefix) {
  const shots = [];
  const qr = await fetchWebUiLoginQrPng();
  if (qr) {
    shots.push(qr);
    // 已有 WebUI 二维码图时不再碰 QQ 窗口（硬抢焦点曾导致 QQ NT 卡死）
    return shots;
  }
  // 无二维码时才软截一张桌面/窗（脚本已去掉 AttachThreadInput / TOPMOST）
  for (const p of captureQqWindows(prefix)) {
    if (!shots.includes(p)) shots.push(p);
  }
  return shots;
}

/**
 * 掉线 / 需扫码：优先 WebUI 二维码图 + 窗口截图，邮件通知（带冷却）。
 * @param {{ force?: boolean }} [opts]
 */
export async function notifyQqOfflineNeedHuman(reason = "offline", detail = "", opts = {}) {
  if (!ENABLED) return { sent: false, skipped: "ONEBOT_QQ_OFFLINE_MAIL=false" };
  const force = opts.force === true;
  const st = readState();
  const now = Date.now();
  if (!force && st.lastOfflineMailAt && now - Number(st.lastOfflineMailAt) < COOLDOWN_MS) {
    return {
      sent: false,
      skipped: `cooldown ${Math.ceil((COOLDOWN_MS - (now - Number(st.lastOfflineMailAt))) / 1000)}s`,
    };
  }

  const account = (process.env.ONEBOT_QQ_ACCOUNT || "").trim() || "unknown";
  const webuiToken = readWebUiToken();
  const webui = webuiToken
    ? `http://127.0.0.1:6099/webui/?token=${webuiToken}`
    : "http://127.0.0.1:6099/webui/";

  const shots = await collectOfflineShots(`offline-${crypto.randomBytes(2).toString("hex")}`);
  const to = recipient();
  const subject = `[OasisMind QQ掉线] ${account} 请扫码重登`;
  const text = [
    `QQ 账号 ${account} 已掉线，已尝试杀进程并重新拉起登录。`,
    `原因: ${reason}`,
    detail ? `详情: ${detail}` : "",
    "",
    "请用手机 QQ 扫描附件第一张「登录二维码」。",
    "扫码确认后，本机会自动检测上线，再给你发：",
    "  1) 邮件附图（QQ 主界面）",
    "  2) 一条 QQ 私聊「重登成功」",
    "",
    `本机 WebUI: ${webui}`,
    `截图: ${shots.length} 张 → ${CAPTURE_DIR}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><b>QQ ${escapeHtml(account)}</b> 掉线 — 请扫码重登</p>
    <p>原因：${escapeHtml(reason)}${detail ? `<br/>详情：${escapeHtml(detail)}` : ""}</p>
    <p><b>请扫附件中的登录二维码</b>（第一张优先是 WebUI 二维码）。</p>
    <p>扫码成功后会再发确认邮件，并用 Bot 给你发一条 QQ 私聊。</p>
    <p>WebUI：<a href="${escapeHtml(webui)}">${escapeHtml(webui)}</a></p>
  `;

  const result = await sendNotifyPayload({
    to,
    subject,
    text,
    html,
    shotPaths: shots,
  });

  if (!result.ok) {
    console.error(`📧 掉线通知失败：${result.error}`);
    console.error(`   截图已保存在：${CAPTURE_DIR}`);
    // 即使邮件失败也标记 awaiting，方便上线后仍尝试 QQ 私聊/补发
    writeState({
      awaitingOnlineMail: true,
      lastOfflineReason: reason,
      lastOfflineMailError: result.error,
    });
    return { sent: false, error: result.error, shots: shots.length };
  }

  writeState({
    lastOfflineMailAt: now,
    awaitingOnlineMail: true,
    lastOfflineReason: reason,
    lastOfflineChannel: result.channel || "",
  });
  console.log(
    `📧 已发掉线协助通知（${result.channel}）→ ${to || process.env.NTFY_TOPIC || "?"}，附图 ${shots.length} 张`,
  );
  return { sent: true, channel: result.channel, shots: shots.length };
}

/**
 * 重登成功：邮件附图 + QQ 私聊主人。
 */
export async function notifyQqOnlineSuccess(detail = "", opts = {}) {
  if (!ENABLED && opts.force !== true) return { sent: false, skipped: "disabled" };
  const st = readState();
  if (!st.awaitingOnlineMail && opts.force !== true) {
    return { sent: false, skipped: "no-pending-offline-mail" };
  }

  const account = (process.env.ONEBOT_QQ_ACCOUNT || "").trim() || "unknown";
  const shots = captureQqWindows(`online-${crypto.randomBytes(2).toString("hex")}`);
  const to = recipient();
  const subject = `[OasisMind QQ已上线] ${account} 重登成功`;
  const text = [
    `QQ 账号 ${account} 已重新在线 ✅`,
    detail ? `详情: ${detail}` : "",
    `时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    `截图: ${shots.length} 张`,
    "",
    "同时会给你发一条 QQ 私聊确认。守护进程继续监控。",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><b>QQ ${escapeHtml(account)}</b> 已重登成功 ✅</p>
    <p>${escapeHtml(detail || "OneBot online=true")}</p>
    <p>时间：${escapeHtml(new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }))}</p>
  `;

  const result = await sendNotifyPayload({
    to,
    subject,
    text,
    html,
    shotPaths: shots,
  });

  const qqMsg = [
    `【见微/OasisMind】QQ ${account} 已重登成功 ✅`,
    detail ? `详情: ${detail}` : "",
    `时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    "掉线扫码流程完成，守护继续运行。",
  ]
    .filter(Boolean)
    .join("\n");
  const qq = await sendOwnerQqMessage(qqMsg);

  if (!result.ok) {
    console.error(`📧 上线确认邮件失败：${result.error}`);
  } else {
    console.log(`📧 已发重登成功通知（${result.channel}）→ ${to || process.env.NTFY_TOPIC || "?"}`);
  }
  if (!qq.ok) {
    console.error(`💬 上线 QQ 私聊失败：${qq.error}`);
  }

  writeState({
    awaitingOnlineMail: false,
    lastOnlineMailAt: Date.now(),
    lastOnlineQqAt: qq.ok ? Date.now() : undefined,
  });

  return {
    sent: result.ok || qq.ok,
    channel: result.channel,
    shots: shots.length,
    mail: result,
    qq,
  };
}

async function mainCli() {
  const mode = (process.argv[2] || "").trim();
  const reason = process.argv[3] || "";
  const detail = process.argv.slice(4).join(" ") || "";
  if (mode === "offline" || mode === "qr") {
    const r = await notifyQqOfflineNeedHuman(reason || mode, detail, { force: mode === "qr" });
    console.log(JSON.stringify(r));
    process.exit(r.sent || r.skipped ? 0 : 1);
  }
  if (mode === "online") {
    if (process.env.ONEBOT_QQ_OFFLINE_MAIL_FORCE === "true" || process.argv.includes("--force")) {
      writeState({ awaitingOnlineMail: true });
    }
    const r = await notifyQqOnlineSuccess(detail || "cli-test", {
      force: process.argv.includes("--force"),
    });
    console.log(JSON.stringify(r));
    process.exit(r.sent || r.skipped ? 0 : 1);
  }
  console.error("Usage: node scripts/qq-offline-notify.mjs offline|online|qr [reason] [detail]");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  mainCli().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
