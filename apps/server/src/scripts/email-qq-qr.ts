/**
 * 截取 QQ 窗口；若未登录则向 WebUI 拉二维码 PNG，附图发到 EMAIL_TO。
 * pnpm --filter @oasismind/server exec tsx src/scripts/email-qq-qr.ts
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { loadRootEnv } from "../infra/config.js";

loadRootEnv();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const proxy =
  process.env.OM_HTTPS_PROXY?.trim() ||
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  "http://127.0.0.1:7890";
/** 仅 AgentMail 走代理；本地 WebUI 绝不能走 Clash，否则 status=null */
const mailDispatcher = new ProxyAgent(proxy);

const to = process.env.EMAIL_TO?.trim() || process.env.AGENTMAIL_ASK_TO?.trim() || "";
const apiKey = process.env.AGENTMAIL_API_KEY?.trim() || "";
const inbox = process.env.AGENTMAIL_INBOX_ID?.trim() || "";
const webui = (process.env.ONEBOT_WEBUI_URL || "http://127.0.0.1:6099").replace(/\/$/, "");
const shotDir = path.join(root, "tools/napcat_framework/.offline-mail-shots");
fs.mkdirSync(shotDir, { recursive: true });

function readWebUiToken() {
  try {
    let buf = fs.readFileSync(path.join(root, "tools/napcat_framework/config/webui.json"));
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3);
    return String(JSON.parse(buf.toString("utf8")).token || "").trim();
  } catch {
    return process.env.ONEBOT_WEBUI_TOKEN?.trim() || "";
  }
}

function captureWindows() {
  const prefix = `qr-${crypto.randomBytes(2).toString("hex")}`;
  const ps1 = path.join(root, "scripts/qq-capture-window.ps1");
  const r = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1, "-OutDir", shotDir, "-Prefix", prefix],
    { encoding: "utf8", windowsHide: true, timeout: 45_000 },
  );
  if (r.status !== 0) {
    console.log("capture stderr:", (r.stderr || "").slice(0, 400));
  }
  const paths: string[] = [];
  for (const line of `${r.stdout || ""}${r.stderr || ""}`.split(/\r?\n/)) {
    if (!line.startsWith("WROTE|")) continue;
    const p = line.split("|")[1];
    if (p && fs.existsSync(p)) paths.push(p);
  }
  return paths;
}

async function webUiCredential() {
  const token = readWebUiToken();
  const h = crypto.createHash("sha256").update(`${token}.napcat`).digest("hex");
  const res = await fetch(`${webui}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash: h }),
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json().catch(() => ({}))) as { data?: { Credential?: string } };
  return data?.data?.Credential || "";
}

type LoginStatus = {
  isLogin: boolean;
  isOffline: boolean;
  qrcodeurl: string;
  loginError: string;
  nick?: string;
  uin?: string;
};

async function getLoginStatus(cred: string): Promise<LoginStatus | null> {
  try {
    const res = await fetch(`${webui}/api/QQLogin/CheckLoginStatus`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cred}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { data?: LoginStatus };
    const info = await fetch(`${webui}/api/QQLogin/GetQQLoginInfo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cred}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.json() as Promise<{ data?: { uin?: string; nick?: string } }>).catch(() => null);
    return {
      isLogin: !!data?.data?.isLogin,
      isOffline: !!data?.data?.isOffline,
      qrcodeurl: data?.data?.qrcodeurl || "",
      loginError: data?.data?.loginError || "",
      uin: info?.data?.uin,
      nick: info?.data?.nick,
    };
  } catch {
    return null;
  }
}

/** 未登录时向 WebUI 拉二维码 PNG */
async function fetchQrPng(cred: string): Promise<string | null> {
  try {
    const res = await fetch(`${webui}/api/QQLogin/GetQQLoginQrcode`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cred}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json().catch(() => ({}))) as {
      code?: number;
      message?: string;
      data?: { qrcode?: string; url?: string; base64?: string; qrcodeurl?: string };
      qrcode?: string;
    };
    if (data?.code === -1 || /logined/i.test(data?.message || "")) {
      console.log("WebUI:", data.message || "already logged in — no QR");
      return null;
    }
    const b64 =
      data?.data?.qrcode ||
      data?.data?.base64 ||
      data?.qrcode ||
      "";
    if (!b64) {
      console.log("WebUI QR payload:", JSON.stringify(data).slice(0, 300));
      return null;
    }
    const clean = b64.replace(/^data:image\/\w+;base64,/, "");
    const out = path.join(shotDir, `webui-qr-${Date.now()}.png`);
    fs.writeFileSync(out, Buffer.from(clean, "base64"));
    console.log("saved WebUI QR →", out);
    return out;
  } catch (e) {
    console.log("WebUI QR failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function sendMail(attachments: string[], status: LoginStatus | null) {
  const online = status?.isLogin && !status?.isOffline;
  const subject = online
    ? "[OasisMind] QQ 当前在线（窗口截图，无登录二维码）"
    : "[OasisMind] QQ 登录二维码 / 窗口截图 — 请扫码";
  const text = [
    online
      ? `机器人 QQ ${status?.uin || "2871732121"}（${status?.nick || ""}）当前已在线，WebUI 不会再生成登录二维码。`
      : "附件含登录二维码或 QQ 登录窗口截图，请用手机 QQ 扫码登录 2871732121。",
    `时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    `截图数: ${attachments.length}`,
    status?.loginError ? `登录错误: ${status.loginError}` : "",
    "",
    "掉线需要扫码时：跑 pnpm napcat 触发离线通知，或再执行本脚本。",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await undiciFetch(
    `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`,
    {
      method: "POST",
      dispatcher: mailDispatcher,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: [to],
        subject,
        text,
        html: `<p>${text.replace(/\n/g, "<br/>")}</p>`,
        attachments: attachments.slice(0, 4).map((p, i) => ({
          filename: path.basename(p) || `shot-${i + 1}.png`,
          content_type: "image/png",
          content: fs.readFileSync(p).toString("base64"),
        })),
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  const body = await res.text();
  console.log("SEND", res.status, body.slice(0, 240));
  if (!res.ok) process.exit(1);
}

if (!to || !apiKey || !inbox) {
  console.error("缺少 EMAIL_TO / AGENTMAIL_*");
  process.exit(1);
}

console.log("proxy=", proxy, "to=", to);
const cred = await webUiCredential();
const status = cred ? await getLoginStatus(cred) : null;
console.log("login status=", status);

const shots = captureWindows();
console.log("window shots=", shots.length, shots.map((p) => path.basename(p)).join(", "));

let qr: string | null = null;
if (cred && !(status?.isLogin && !status?.isOffline)) {
  qr = await fetchQrPng(cred);
}

const all = [...(qr ? [qr] : []), ...shots];
if (!all.length) {
  console.error("没有截到任何图（QQ 窗口可能最小化到托盘）。请先点开 QQ 主窗口再跑。");
  process.exit(1);
}
await sendMail(all, status);
console.log("✅ 已发送到", to);
for (const p of all) console.log("ATTACH", p);
