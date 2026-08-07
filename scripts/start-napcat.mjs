import crypto from "crypto";
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { fileURLToPath } from "url";
import {
  notifyQqOfflineNeedHuman,
  notifyQqOnlineSuccess,
} from "./qq-offline-notify.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

/** 独立运行脚本时也需加载根目录 .env；已存在环境变量不覆盖。 */
function loadRootEnv() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
loadRootEnv();

const QQ_ACCOUNT = (process.env.ONEBOT_QQ_ACCOUNT || "").trim();
const QQ_PASSWORD = (process.env.ONEBOT_QQ_PASSWORD || process.env.NAPCAT_QUICK_PASSWORD || "").trim();
const HTTP_URL = (process.env.ONEBOT_HTTP_URL || "http://127.0.0.1:3001").trim();
const QQ_EXE = (process.env.ONEBOT_QQ_EXE || "D:\\Program Files\\Tencent\\QQNT\\QQ.exe").trim();
const KILL_ON_MISMATCH = (process.env.ONEBOT_QQ_KILL_ON_MISMATCH || "false").trim().toLowerCase() !== "false";
const WEBHOOK_URL = (process.env.ONEBOT_WEBHOOK_URL || "http://localhost:3010/api/webhooks/onebot").trim();
const QQ_MULTI_OPEN = (process.env.ONEBOT_QQ_MULTI_OPEN || "false").trim().toLowerCase() !== "false";
const QQ_AUTO_OPEN = (process.env.ONEBOT_QQ_AUTO_OPEN || "true").trim().toLowerCase() !== "false";
const QQ_LOGIN_TIMEOUT_MS = Math.max(30000, parseInt(process.env.ONEBOT_QQ_LOGIN_TIMEOUT_MS || "120000", 10));
/** 发出扫码邮件后，额外等待人工扫码的毫秒（默认 10min） */
const QQ_SCAN_WAIT_MS = Math.max(
  60_000,
  parseInt(process.env.ONEBOT_QQ_SCAN_WAIT_MS || String(10 * 60_000), 10),
);
/** 登录成功后是否长驻监控掉线并自动重登（远程无人值守场景默认开） */
const QQ_WATCHDOG = (process.env.ONEBOT_QQ_WATCHDOG || "true").trim().toLowerCase() !== "false";
const WATCHDOG_INTERVAL_MS = Math.max(10000, parseInt(process.env.ONEBOT_QQ_WATCHDOG_INTERVAL_MS || "30000", 10));
/** 两次硬重启最短间隔，避免风控连环踢 */
const RECOVER_MIN_INTERVAL_MS = Math.max(30000, parseInt(process.env.ONEBOT_QQ_RECOVER_MIN_INTERVAL_MS || "90000", 10));
const RECOVER_MAX_PER_HOUR = Math.max(1, parseInt(process.env.ONEBOT_QQ_RECOVER_MAX_PER_HOUR || "6", 10));
/**
 * 是否允许 L3 taskkill 硬杀 QQ 后重新注入登录（默认开）。
 * 本机实测：session 已信任时硬杀 → 快速登录通常可秒登；设 false 则只软登/软重启。
 */
const HARD_RESTART = (process.env.ONEBOT_QQ_HARD_RESTART || "true").trim().toLowerCase() !== "false";
/** 验证码/新设备后，密码+原生窗填表冷却（默认 20min，防连环风控） */
const CAPTCHA_COOLDOWN_MS = Math.max(
  60_000,
  parseInt(process.env.ONEBOT_QQ_CAPTCHA_COOLDOWN_MS || "1200000", 10),
);
const WEBUI_URL = (process.env.ONEBOT_WEBUI_URL || "http://127.0.0.1:6099").trim().replace(/\/$/, "");
const WEBUI_TOKEN_ENV = (process.env.ONEBOT_WEBUI_TOKEN || process.env.NAPCAT_WEBUI_SECRET_KEY || "").trim();

const napcatRoot = path.resolve(projectRoot, "tools/napcat_framework");
const configDir = path.join(napcatRoot, "config");
const webuiConfigPath = path.join(configDir, "webui.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @type {import('child_process').ChildProcess | null} */
let napcatChild = null;
/** @type {string | null} */
let webuiCredential = null;
let webuiCredentialAt = 0;
/** WebUI /api/auth/login 被限流后的冷却截止（避免叠一屏 login rate limit） */
let webuiAuthCooldownUntil = 0;
const recoverTimestamps = [];
let recovering = false;
let logReadOffset = 0;
/** 最近一次 need-captcha / need-new-device 时间戳；冷却期内禁止密码+原生窗狂登 */
let lastHumanGateAt = 0;
/** 本进程是否已对原生窗做过一次账密填表（避免每 20s 点一次） */
let nativePasswordUiUsed = false;
/** 本进程是否已自动打开过验证码/WebUI 链接 */
let humanGateBrowserOpened = false;
/**
 * 启动时若目标账号已在线则进入 attach-only（不主动 spawn）。
 * 掉线且 HARD_RESTART=true 时会解除 attach-only，硬杀后重新注入。
 */
let attachOnlyMode = false;
const LOG_PATH = path.join(napcatRoot, "napcat.log");
const NEED_HUMAN_PATH = path.join(napcatRoot, "NEED_HUMAN_LOGIN.txt");
/** 日志踢线扫描间隔（对齐 NapCat WebUI 约 5s 轮询 online） */
const LOG_SCAN_INTERVAL_MS = Math.max(3000, parseInt(process.env.ONEBOT_QQ_LOG_SCAN_INTERVAL_MS || "5000", 10));
/** 启动时探测「已在线则 attach」的最长等待（默认 8s，避免 OneBot 晚就绪误判去 spawn） */
const ATTACH_PROBE_MS = Math.max(2000, parseInt(process.env.ONEBOT_QQ_ATTACH_PROBE_MS || "8000", 10));

function humanGateActive() {
  if (fs.existsSync(NEED_HUMAN_PATH)) return true;
  return lastHumanGateAt > 0 && Date.now() - lastHumanGateAt < CAPTCHA_COOLDOWN_MS;
}

function markHumanGate(reason, detail, opts = {}) {
  lastHumanGateAt = Date.now();
  writeNeedHuman(reason, detail);
  if (opts.skipMail) return;
  // 掉线/验证码：截 QQ 窗 / 拉二维码发邮件（冷却内不重复刷屏）
  notifyQqOfflineNeedHuman(reason, detail || "").catch((err) => {
    console.log(
      `ℹ️  掉线邮件通知异常：${err instanceof Error ? err.message : String(err)}`,
    );
  });
}

/**
 * 探测到重新上线：发成功确认邮件 + QQ 私聊。
 * 踢线/硬杀/扫码恢复路径强制通知（即使此前邮件失败未写 awaiting 标记）。
 */
function notifyOnlineIfPending(detail = "") {
  const force =
    /hard-restart|kick|scan-login|recovered|login-restored/i.test(String(detail || ""));
  notifyQqOnlineSuccess(detail, { force }).catch((err) => {
    console.log(
      `ℹ️  上线确认异常：${err instanceof Error ? err.message : String(err)}`,
    );
  });
}

function getHttpConfig() {
  const url = new URL(HTTP_URL);
  return {
    enable: true,
    name: "OasisMind OneBot API",
    host: url.hostname === "127.0.0.1" || url.hostname === "localhost" ? "0.0.0.0" : url.hostname,
    port: Number(url.port) || 3001,
    token: "",
    enableCors: true,
    enableWebsocket: false,
    messagePostFormat: "array",
  };
}

function readJsonFile(filePath) {
  let buf = fs.readFileSync(filePath);
  // PowerShell Set-Content -Encoding UTF8 会写 BOM，导致 JSON.parse 失败 → token 读空
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    buf = buf.subarray(3);
  }
  return JSON.parse(buf.toString("utf8"));
}

function readWebUiToken() {
  if (WEBUI_TOKEN_ENV) return WEBUI_TOKEN_ENV;
  try {
    if (!fs.existsSync(webuiConfigPath)) return "";
    const parsed = readJsonFile(webuiConfigPath);
    return String(parsed.token || "").trim();
  } catch {
    return "";
  }
}

/** 写入 WebUI 自动登录账号；可选固定 token，便于脚本调 WebUI API 重登 */
function configureWebUiAutoLogin() {
  if (!QQ_ACCOUNT) return;
  let data = {
    host: "::",
    port: 6099,
    token: WEBUI_TOKEN_ENV || crypto.randomBytes(6).toString("hex"),
    loginRate: 120,
    autoLoginAccount: QQ_ACCOUNT,
  };
  if (fs.existsSync(webuiConfigPath)) {
    try {
      const parsed = readJsonFile(webuiConfigPath);
      data = { ...parsed, autoLoginAccount: QQ_ACCOUNT, loginRate: parsed.loginRate || 120 };
      if (WEBUI_TOKEN_ENV) data.token = WEBUI_TOKEN_ENV;
      if (!data.token) data.token = crypto.randomBytes(6).toString("hex");
    } catch {
      /* 用默认骨架 */
    }
  }
  fs.writeFileSync(webuiConfigPath, JSON.stringify(data, null, 4), "utf8");
  console.log(`✅ 已写入 WebUI autoLoginAccount=${QQ_ACCOUNT}（快速登录优先，密码回退）`);
}

function configureNapCat() {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  const webhookConfig = {
    enable: true,
    name: "OasisMind Webhook",
    url: WEBHOOK_URL,
    token: "",
    secret: "",
    headers: {},
  };

  const httpServerConfig = getHttpConfig();

  const baseNetwork = {
    httpServers: [httpServerConfig],
    httpSseServers: [],
    httpClients: [webhookConfig],
    websocketServers: [],
    websocketClients: [],
    plugins: [],
  };

  if (QQ_ACCOUNT) {
    // 单账号模式：只为指定账号生成配置，并清理其他 onebot11_*.json，避免启动错号
    const accountPath = path.join(configDir, `onebot11_${QQ_ACCOUNT}.json`);
    const accountConfig = {
      network: baseNetwork,
      musicSignUrl: "",
      enableLocalFile2Url: false,
      parseMultMsg: false,
      imageDownloadProxy: "",
      timeout: {
        baseTimeout: 10000,
        uploadSpeedKBps: 256,
        downloadSpeedKBps: 256,
        maxTimeout: 1800000,
      },
    };
    fs.writeFileSync(accountPath, JSON.stringify(accountConfig, null, 2), "utf8");
    console.log(
      `✅ 已生成单账号配置 onebot11_${QQ_ACCOUNT}.json (API ${httpServerConfig.host}:${httpServerConfig.port} ↔ Webhook ${WEBHOOK_URL})`,
    );

    const files = fs.readdirSync(configDir);
    for (const f of files) {
      if (f.startsWith("onebot11_") && f.endsWith(".json") && f !== `onebot11_${QQ_ACCOUNT}.json`) {
        fs.rmSync(path.join(configDir, f), { force: true });
        console.log(`🧹 已清理非目标账号配置 ${f}`);
      }
    }
  } else {
    const defaultPath = path.join(configDir, "onebot11.json");
    let defaultData = {
      network: baseNetwork,
      musicSignUrl: "",
      enableLocalFile2Url: false,
      parseMultMsg: false,
      imageDownloadProxy: "",
      timeout: {
        baseTimeout: 10000,
        uploadSpeedKBps: 256,
        downloadSpeedKBps: 256,
        maxTimeout: 1800000,
      },
    };

    if (fs.existsSync(defaultPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(defaultPath, "utf8"));
        if (!parsed.network) parsed.network = {};
        parsed.network.httpServers = [httpServerConfig];
        parsed.network.httpClients = [webhookConfig];
        defaultData = parsed;
      } catch {
        /* ignore */
      }
    }
    fs.writeFileSync(defaultPath, JSON.stringify(defaultData, null, 2), "utf8");
    console.log("✅ 已自动同步模版 onebot11.json");

    const files = fs.readdirSync(configDir);
    for (const f of files) {
      if (f.startsWith("onebot11_") && f.endsWith(".json")) {
        const fullPath = path.join(configDir, f);
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
          if (!content.network) content.network = {};
          content.network.httpServers = [httpServerConfig];
          content.network.httpClients = [webhookConfig];
          fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), "utf8");
          console.log(`✅ 已强制启用端口与 Webhook 到 ${f}`);
        } catch (e) {
          console.error(`解析 ${f} 失败:`, e);
        }
      }
    }
  }

  configureWebUiAutoLogin();
}

async function fetchLoginInfo(timeoutMs = 3000) {
  const url = `${HTTP_URL.replace(/\/$/, "")}/get_login_info`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const selfId = String(data.data?.user_id ?? data.data?.self_id ?? "");
    return selfId ? { selfId, viaOneBot: true } : { selfId: null, viaOneBot: true };
  } catch {
    return { selfId: null, viaOneBot: false };
  }
}

/** OneBot get_status：部分适配器在假在线时 login_info 仍通，online=false 才是真掉线 */
async function fetchOneBotOnline(timeoutMs = 3000) {
  const url = `${HTTP_URL.replace(/\/$/, "")}/get_status`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false, online: null };
    const data = await res.json();
    const online = data?.data?.online;
    if (typeof online === "boolean") return { ok: true, online };
    return { ok: true, online: null };
  } catch {
    return { ok: false, online: null };
  }
}

function isTargetOnline(info) {
  return Boolean(QQ_ACCOUNT && info.selfId === QQ_ACCOUNT);
}

function webUiUrlHint() {
  const token = readWebUiToken();
  return token ? `${WEBUI_URL}/webui/?token=${encodeURIComponent(token)}` : `${WEBUI_URL}/webui/`;
}

function writeNeedHuman(reason, detail = "") {
  const body = [
    `reason=${reason}`,
    `account=${QQ_ACCOUNT}`,
    `at=${new Date().toISOString()}`,
    `webui=${webUiUrlHint()}`,
    detail ? `detail=${detail}` : "",
    "",
    "完成一次人工验证（验证码/新设备扫码）后删除本文件；守护进程会继续自动重登。",
    "",
  ]
    .filter(Boolean)
    .join("\n");
  try {
    fs.writeFileSync(NEED_HUMAN_PATH, body, "utf8");
  } catch {
    /* ignore */
  }
  console.error(`🚨 需要人工介入：${reason}`);
  console.error(`   WebUI: ${webUiUrlHint()}`);
  console.error(`   标记文件: ${NEED_HUMAN_PATH}`);
}

function clearNeedHuman() {
  try {
    if (fs.existsSync(NEED_HUMAN_PATH)) fs.rmSync(NEED_HUMAN_PATH, { force: true });
  } catch {
    /* ignore */
  }
  lastHumanGateAt = 0;
  humanGateBrowserOpened = false;
  // nativePasswordUiUsed 故意保留：同进程内仍避免反复点原生窗
  // 若此前发过掉线协助邮件，清门禁时附带发「重登成功」确认（内部有 awaiting 门闩）
  notifyOnlineIfPending("login-restored");
}

/**
 * 社区成熟探测：多信号交叉验证（对齐 NapCat WebUI 每 5s 看 online + CheckLoginStatus）。
 * @returns {Promise<{ online: boolean, reason: string, signals: Record<string, unknown> }>}
 */
async function probeHealth() {
  const signals = {};
  const info = await fetchLoginInfo(3500);
  signals.loginInfo = info.selfId || null;
  signals.loginInfoReachable = info.viaOneBot;

  const status = await fetchOneBotOnline(3500);
  signals.oneBotOnline = status.online;

  let webUiOnline = null;
  let webUiIsLogin = null;
  let webUiIsOffline = null;
  let webUiUp = false;
  // auth 冷却期跳过 WebUI API，只用 OneBot 判在线，避免叠 rate limit
  const skipWebUiApi = Date.now() < webuiAuthCooldownUntil || humanGateActive();
  try {
    webUiUp = skipWebUiApi ? false : await waitForWebUi(3000);
    signals.webUiUp = webUiUp;
    signals.webUiSkipped = skipWebUiApi;
    if (webUiUp) {
      const loginInfo = await webUiPost("/QQLogin/GetQQLoginInfo", {});
      if (loginInfo.ok) {
        webUiOnline = loginInfo.data?.data?.online;
        signals.webUiOnline = webUiOnline;
      }
      const st = await webUiPost("/QQLogin/CheckLoginStatus", {});
      if (st.ok || st.data?.data) {
        webUiIsLogin = st.data?.data?.isLogin;
        webUiIsOffline = st.data?.data?.isOffline;
        signals.webUiIsLogin = webUiIsLogin;
        signals.webUiIsOffline = webUiIsOffline;
      }
    }
  } catch {
    signals.webUiError = true;
    webUiUp = false;
  }

  const targetOk = isTargetOnline(info);
  if (targetOk && status.online === false) {
    return { online: false, reason: "onebot-status-offline", signals };
  }
  if (targetOk && webUiOnline === false) {
    return { online: false, reason: "webui-online-false", signals };
  }
  if (targetOk && webUiIsOffline === true) {
    return { online: false, reason: "webui-isOffline", signals };
  }
  if (targetOk) {
    return { online: true, reason: "ok", signals };
  }
  if (info.selfId && info.selfId !== QQ_ACCOUNT) {
    return { online: false, reason: `wrong-account:${info.selfId}`, signals };
  }

  // 裸 QQ：进程在但 OneBot/WebUI 全死 = NapCat 已卸载（常见于踢线弹「下线通知」后）
  const qqRunning = isProcessRunning("QQ.exe");
  const oneBotDead = !info.viaOneBot && !status.ok;
  const webUiDead = !webUiUp || signals.webUiError === true;
  signals.qqRunning = qqRunning;
  signals.oneBotDead = oneBotDead;
  signals.webUiDead = webUiDead;
  if (qqRunning && oneBotDead && webUiDead) {
    return { online: false, reason: "bare-qq-napcat-unloaded", signals };
  }

  return { online: false, reason: "login-info-miss", signals };
}

/** 扫 napcat.log 增量，秒级捕获 KickedOffLine（比纯轮询更贴社区排障习惯） */
function scanNapCatLogForKick() {
  try {
    if (!fs.existsSync(LOG_PATH)) return null;
    const stat = fs.statSync(LOG_PATH);
    if (stat.size < logReadOffset) logReadOffset = 0; // 日志轮转
    if (stat.size === logReadOffset) return null;
    const start = Math.max(logReadOffset, Math.max(0, stat.size - 256_000));
    const fd = fs.openSync(LOG_PATH, "r");
    const len = stat.size - start;
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, start);
    fs.closeSync(fd);
    logReadOffset = stat.size;
    const text = buf.toString("utf8");
    // ASCII 模式优先（日志常为 GBK，中文 utf8 解码会花，但 KickedOffLine / DLL Unloading 仍可匹配）
    const patterns = [
      /\[KickedOffLine\]/i,
      /NapiBoot DLL Unloading/i,
      /DLL Unloading/i,
      /登录已失效/,
      /下线通知/,
      /账号状态变更为离线/,
      /帐号当前登录已失效/,
      /账号当前登录已失效/,
    ];
    for (const re of patterns) {
      if (re.test(text)) {
        const lines = text.split(/\r?\n/).filter((l) => patterns.some((p) => p.test(l)));
        return lines[lines.length - 1] || "KickedOffLine";
      }
    }
    // GBK 兜底：只找 ASCII 踢线标记在原始字节旁的行
    if (buf.includes(Buffer.from("KickedOffLine")) || buf.includes(Buffer.from("DLL Unloading"))) {
      return "KickedOffLine(bin)";
    }
  } catch {
    /* ignore */
  }
  return null;
}

function isProcessRunning(imageName) {
  try {
    const stdout = execSync(`tasklist /FI "IMAGENAME eq ${imageName}" /NH`, { stdio: ["pipe", "pipe", "ignore"] });
    return String(stdout).toLowerCase().includes(imageName.toLowerCase());
  } catch {
    return false;
  }
}

function killNapCatOnly() {
  console.log("🧹 清理旧 NapCat 进程…");
  try {
    execSync("taskkill /F /IM napimain.exe", { stdio: "ignore" });
  } catch {
    /* ignore */
  }
}

function killProcessTree(pid) {
  if (!pid) return;
  console.log(`🧹 关闭本次启动的进程树 (PID ${pid})…`);
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
  } catch {
    /* ignore */
  }
}

function passwordMd5() {
  if (!QQ_PASSWORD) return "";
  return crypto.createHash("md5").update(QQ_PASSWORD, "utf8").digest("hex");
}

/**
 * @deprecated 坐标点 QQNT 原生窗不是成熟方案（Electron 无障碍树空、DPI/多屏易点空）。
 * 社区正道：NapCat WebUI `/QQLogin/PasswordLogin`（内核密码登录，与扫码窗无关）。
 * 仅当 ONEBOT_QQ_NATIVE_UI=true 时才启用（调试用）。
 */
/** 关掉 QQ「下线通知」弹窗，避免挡自动重登 */
function dismissQqOfflineDialog() {
  if (process.platform !== "win32") return { ok: false, reason: "not-win32" };
  if (!isProcessRunning("QQ.exe")) return { ok: false, reason: "qq-not-running" };
  const ps1 = path.join(projectRoot, "scripts", "qq-dismiss-offline-dialog.ps1");
  if (!fs.existsSync(ps1)) return { ok: false, reason: "script-missing" };
  try {
    const stdout = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1}"`, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 12000,
      encoding: "utf8",
    });
    const detail = String(stdout || "").trim();
    console.log(`🖱️  关闭下线通知：${detail || "ok"}`);
    return { ok: !/NO_OFFLINE_DIALOG/.test(detail), reason: detail };
  } catch (err) {
    const detail = String(err?.stdout || err?.stderr || err?.message || err).trim();
    if (/NO_OFFLINE_DIALOG/.test(detail)) return { ok: false, reason: "no-dialog" };
    console.log(`ℹ️  关闭下线通知跳过：${detail.slice(0, 200)}`);
    return { ok: false, reason: "ui-error", detail };
  }
}

function switchQqNativeToPasswordLogin(fill = true) {
  const enabled = (process.env.ONEBOT_QQ_NATIVE_UI || "false").trim().toLowerCase() === "true";
  if (!enabled) {
    return { ok: false, reason: "native-ui-disabled" };
  }
  if (process.platform !== "win32") return { ok: false, reason: "not-win32" };
  if (!isProcessRunning("QQ.exe")) return { ok: false, reason: "qq-not-running" };

  const ps1 = path.join(projectRoot, "scripts", "qq-native-password-login.ps1");
  if (!fs.existsSync(ps1)) return { ok: false, reason: "script-missing" };

  try {
    const env = {
      ...process.env,
      ONEBOT_QQ_ACCOUNT: QQ_ACCOUNT || "",
      ONEBOT_QQ_PASSWORD: fill && QQ_PASSWORD ? QQ_PASSWORD : "",
      QQ_SWITCH_ONLY: fill ? "0" : "1",
    };
    const stdout = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1}"`,
      { env, stdio: ["pipe", "pipe", "pipe"], timeout: 30000, encoding: "utf8" },
    );
    const detail = String(stdout || "").trim();
    console.log(`🖱️  QQ 原生窗账密切换（实验）：\n${detail}`);
    if (/NO_QQ_LOGIN_WINDOW/.test(detail)) return { ok: false, reason: "no-login-window", detail };
    return { ok: true, reason: /SUBMITTED|SWITCHED_NO_FILL/.test(detail) ? "clicked" : "ran", detail };
  } catch (err) {
    const detail = String(err?.stdout || err?.stderr || err?.message || err).trim();
    console.log(`⚠️  QQ 原生窗账密切换失败：${detail.slice(0, 300)}`);
    return { ok: false, reason: "ui-error", detail };
  }
}

/** 默认不开浏览器（避免远程/调试时乱弹 WebUI）；显式 ONEBOT_QQ_OPEN_BROWSER=true 才开 */
const OPEN_BROWSER = (process.env.ONEBOT_QQ_OPEN_BROWSER || "false").trim().toLowerCase() === "true";

function openUrlBestEffort(url) {
  if (!url || !OPEN_BROWSER) {
    if (url && !OPEN_BROWSER) {
      console.log(`ℹ️  需人工打开（未设 ONEBOT_QQ_OPEN_BROWSER=true）：${url}`);
    }
    return;
  }
  try {
    if (process.platform === "win32") {
      execSync(`cmd /c start "" "${url.replace(/"/g, "")}"`, { stdio: "ignore" });
    }
  } catch {
    /* ignore */
  }
}

function webUiPasswordHash(token) {
  return crypto.createHash("sha256").update(`${token}.napcat`).digest("hex");
}

async function ensureWebUiCredential(force = false) {
  const token = readWebUiToken();
  if (!token) throw new Error("WebUI token 不可用（检查 tools/napcat_framework/config/webui.json）");

  const fresh = webuiCredential && Date.now() - webuiCredentialAt < 45 * 60 * 1000;
  if (!force && fresh) return webuiCredential;
  if (Date.now() < webuiAuthCooldownUntil) {
    if (webuiCredential) return webuiCredential;
    throw new Error("WebUI auth rate-limited（冷却中，勿狂点登录）");
  }

  const hash = webUiPasswordHash(token);
  const res = await fetch(`${WEBUI_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json().catch(() => ({}));
  const msg = String(data?.message || data?.msg || "");
  if (/rate limit/i.test(msg) || res.status === 429) {
    webuiAuthCooldownUntil = Date.now() + 90_000;
    throw new Error("WebUI login rate limit（已冷却 90s）");
  }
  if (!res.ok) throw new Error(`WebUI 登录 HTTP ${res.status}`);
  const credential = data?.data?.Credential;
  if (!credential) throw new Error(msg || "WebUI 登录未返回 Credential");
  webuiCredential = credential;
  webuiCredentialAt = Date.now();
  webuiAuthCooldownUntil = 0;
  return credential;
}

async function webUiPost(apiPath, body = {}) {
  const tryOnce = async (forceAuth) => {
    const credential = await ensureWebUiCredential(forceAuth);
    const res = await fetch(`${WEBUI_URL}/api${apiPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text.slice(0, 200) };
    }
    return { res, data };
  };

  let { res, data } = await tryOnce(false);
  if (res.status === 401 || String(data?.message || "").toLowerCase().includes("unauthorized")) {
    ({ res, data } = await tryOnce(true));
  }
  // NapCat sendError 也回 HTTP 200，业务成败看 code（0=成功，-1=失败）
  const code = data?.code;
  const ok = res.ok && (code === undefined || code === 0);
  return { ok, status: res.status, data, code };
}

async function waitForWebUi(timeoutMs = 60000) {
  const start = Date.now();
  // 禁止用 /api/auth/login 当探针——假 hash 也会吃 loginRate，叠出「login rate limit」
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${WEBUI_URL}/webui/`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      if (res.status > 0) return true;
    } catch {
      try {
        const res2 = await fetch(`${WEBUI_URL}/`, {
          method: "GET",
          signal: AbortSignal.timeout(2000),
        });
        if (res2.status > 0) return true;
      } catch {
        /* retry */
      }
    }
    await sleep(1500);
  }
  return false;
}

/**
 * 通过 NapCat WebUI 尝试无人值守重登。
 * @param {{ allowPassword?: boolean, allowNativeUi?: boolean }} [opts]
 * - 默认：快速登录 →（非人工门禁冷却期）WebUI PasswordLogin 一次（不点原生扫码窗）
 * - 验证码冷却期内：只做快速登录，禁止密码/点窗（防风控连环踢）
 */
async function tryAutoLoginViaWebUi(opts = {}) {
  if (!QQ_ACCOUNT) return { ok: false, reason: "no-account" };

  const gate = humanGateActive();
  const allowPassword = opts.allowPassword !== false && !gate;
  const allowNativeUi = opts.allowNativeUi !== false && !gate && !nativePasswordUiUsed;

  const webUiUp = await waitForWebUi(20000);
  if (!webUiUp) return { ok: false, reason: "webui-down" };

  try {
    await webUiPost("/QQLogin/SetQuickLoginQQ", { uin: QQ_ACCOUNT });
  } catch {
    /* 非致命 */
  }

  const status = await webUiPost("/QQLogin/CheckLoginStatus", {});
  if (status.data?.data?.isLogin) {
    const info = await fetchLoginInfo(3000);
    if (isTargetOnline(info)) return { ok: true, reason: "already-login" };
    console.log("ℹ️  WebUI 报已登录，但 OneBot 未确认目标账号，继续尝试重登…");
  }

  console.log(`🔑 尝试 WebUI 快速登录 ${QQ_ACCOUNT}…`);
  const quick = await webUiPost("/QQLogin/SetQuickLogin", { uin: QQ_ACCOUNT });
  if (quick.ok) {
    for (let i = 0; i < 20; i++) {
      const health = await probeHealth();
      if (health.online) {
        clearNeedHuman();
        return { ok: true, reason: "quick-login" };
      }
      await sleep(1500);
    }
  } else {
    const msg = String(quick.data?.message || quick.data?.msg || `HTTP ${quick.status}`);
    console.log(`⚠️  快速登录未成功：${msg}`);
    if (/logined|已登录/i.test(msg)) {
      return { ok: false, reason: "stale-login-status" };
    }
  }

  if (!allowPassword) {
    if (gate) {
      console.log(
        `⏳ 人工门禁/验证码冷却中（${Math.ceil(CAPTCHA_COOLDOWN_MS / 60000)}min）：跳过密码与原生窗，避免加重风控`,
      );
      return { ok: false, reason: "awaiting-human" };
    }
    return { ok: false, reason: "password-disabled" };
  }

  const md5 = passwordMd5();
  if (!md5) {
    markHumanGate("need-password-or-scan", "未配置 ONEBOT_QQ_PASSWORD，且快速登录失败");
    return { ok: false, reason: "need-password-or-scan" };
  }

  console.log(
    `🔑 快速登录失败 → NapCat WebUI 密码登录（成熟路径；不点 QQ 原生扫码窗）…`,
  );
  // 原生窗坐标点击默认关闭；仅 ONEBOT_QQ_NATIVE_UI=true 时尝试（不可靠）
  if (allowNativeUi) {
    const native = switchQqNativeToPasswordLogin(true);
    if (native.ok) nativePasswordUiUsed = true;
    else if (native.reason !== "native-ui-disabled") {
      console.log(`ℹ️  原生窗切换跳过（${native.reason}），继续 WebUI PasswordLogin`);
    }
  }

  const pwd = await webUiPost("/QQLogin/PasswordLogin", { uin: QQ_ACCOUNT, passwordMd5: md5 });
  const payload = pwd.data?.data || {};
  if (payload.needCaptcha) {
    const captchaHint = payload.proofWaterUrl
      ? `密码登录需要验证码；滑块页: ${payload.proofWaterUrl}`
      : "密码登录需要验证码（请在 QQ 窗或 NapCat WebUI 完成）";
    markHumanGate("need-captcha", captchaHint);
    if (!humanGateBrowserOpened) {
      humanGateBrowserOpened = true;
      openUrlBestEffort(webUiUrlHint());
      if (payload.proofWaterUrl) openUrlBestEffort(payload.proofWaterUrl);
    }
    return { ok: false, reason: "need-captcha" };
  }
  if (payload.needNewDevice) {
    markHumanGate(
      "need-new-device",
      payload.jumpUrl ? `密码登录需要新设备扫码: ${payload.jumpUrl}` : "密码登录需要新设备扫码",
    );
    if (!humanGateBrowserOpened) {
      humanGateBrowserOpened = true;
      if (payload.jumpUrl) openUrlBestEffort(payload.jumpUrl);
      else openUrlBestEffort(webUiUrlHint());
    }
    return { ok: false, reason: "need-new-device" };
  }
  if (!pwd.ok) {
    const msg = pwd.data?.message || pwd.data?.msg || `HTTP ${pwd.status}`;
    console.log(`⚠️  密码登录失败：${msg}`);
    if (/logined|已登录/i.test(String(msg))) {
      return { ok: false, reason: "stale-login-status" };
    }
    return { ok: false, reason: "password-failed" };
  }

  for (let i = 0; i < 30; i++) {
    const health = await probeHealth();
    if (health.online) {
      clearNeedHuman();
      return { ok: true, reason: "password-login" };
    }
    await sleep(1500);
  }
  return { ok: false, reason: "login-timeout-after-password" };
}

/** NapCat WebUI 官方掉线恢复：Process/Restart（比 taskkill 更轻，保留 QQ 数据目录） */
async function softRestartViaWebUi() {
  console.log("🔄 尝试 NapCat WebUI 软重启（/Process/Restart → /QQLogin/RestartNapCat）…");
  webuiCredential = null;
  let ok = false;
  try {
    const r1 = await webUiPost("/Process/Restart", {});
    ok = r1.ok;
    if (!ok) {
      const r2 = await webUiPost("/QQLogin/RestartNapCat", {});
      ok = r2.ok;
    }
  } catch (err) {
    console.log(`ℹ️  软重启 API 调用异常：${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
  if (!ok) {
    console.log("ℹ️  WebUI 软重启未确认成功");
    return false;
  }
  console.log("⏳ 等待 NapCat 软重启后 WebUI / OneBot 恢复…");
  await sleep(5000);
  const up = await waitForWebUi(90000);
  if (!up) return false;
  // 软重启后重新走快速/密码（env 仍在原进程时可能丢失；硬重启才带 env——此处靠 webui.json autoLogin + 我们主动调）
  const login = await tryAutoLoginViaWebUi();
  if (login.ok) {
    const health = await probeHealth();
    return health.online;
  }
  // 再等一轮探测（有时登录异步完成）
  for (let i = 0; i < 20; i++) {
    const health = await probeHealth();
    if (health.online) return true;
    await sleep(1500);
  }
  return false;
}

function canHardRestart() {
  const now = Date.now();
  while (recoverTimestamps.length && now - recoverTimestamps[0] > 3600_000) {
    recoverTimestamps.shift();
  }
  if (recoverTimestamps.length >= RECOVER_MAX_PER_HOUR) {
    return false;
  }
  const last = recoverTimestamps[recoverTimestamps.length - 1] || 0;
  return now - last >= RECOVER_MIN_INTERVAL_MS;
}

function markHardRestart() {
  recoverTimestamps.push(Date.now());
}

function spawnNapCat() {
  if (attachOnlyMode) {
    console.log("🛡️ attach-only：拒绝 spawn 新 NapCat/QQ");
    return null;
  }
  if (!fs.existsSync(QQ_EXE)) {
    throw new Error(`QQ 可执行文件不存在：${QQ_EXE}，请设 ONEBOT_QQ_EXE`);
  }

  const dllPath = path.join(napcatRoot, "napiloader.dll");
  const cjsPath = path.join(napcatRoot, "nativeLoader.cjs");
  const exePath = path.join(napcatRoot, "napimain.exe");

  if (!fs.existsSync(exePath)) {
    throw new Error(`NapCat 启动器不存在：${exePath}`);
  }

  console.log("🚀 启动 NapCat Framework 守护引擎…");

  const logFile = path.join(napcatRoot, "napcat.log");
  const outFd = fs.openSync(logFile, "a");

  const childEnv = {
    ...process.env,
    NAPCAT_QUICK_ACCOUNT: QQ_ACCOUNT || process.env.NAPCAT_QUICK_ACCOUNT || "",
  };
  if (QQ_PASSWORD) {
    childEnv.NAPCAT_QUICK_PASSWORD = QQ_PASSWORD;
  }
  const webuiToken = readWebUiToken();
  if (webuiToken) {
    childEnv.NAPCAT_WEBUI_SECRET_KEY = webuiToken;
  }

  const child = spawn(exePath, [QQ_EXE, dllPath, cjsPath], {
    cwd: napcatRoot,
    stdio: ["ignore", outFd, outFd],
    detached: true,
    env: childEnv,
  });
  child.unref();
  napcatChild = child;
  return child;
}

async function pollSelfId(timeoutMs = QQ_LOGIN_TIMEOUT_MS) {
  if (!QQ_ACCOUNT) return { ok: true, selfId: null };
  const start = Date.now();
  let lastNotify = 0;
  let lastSelfId = null;
  let nextAutoLoginAt = start + 8000;
  console.log(`🔍 校验 NapCat 登录账号是否为目标 ${QQ_ACCOUNT}…`);
  console.log(
    `⏳ 等待登录 ${QQ_ACCOUNT}（${timeoutMs / 1000}s）：优先自动快速/密码登录；若需验证码请打开 WebUI`,
  );
  while (Date.now() - start < timeoutMs) {
    const health = await probeHealth();
    if (health.online) {
      clearNeedHuman();
      console.log(`✅ 登录态检测成功：当前登录账号 ${QQ_ACCOUNT}`);
      return { ok: true, selfId: QQ_ACCOUNT };
    }
    if (health.signals.loginInfo && health.signals.loginInfo !== QQ_ACCOUNT) {
      if (health.signals.loginInfo !== lastSelfId) {
        console.log(
          `⚠️  检测到非目标账号 ${health.signals.loginInfo}，继续等待目标 ${QQ_ACCOUNT} 登录…`,
        );
        lastSelfId = health.signals.loginInfo;
        lastNotify = Date.now() - start;
      }
    }

    // 周期性重试：验证码门禁期完全停 WebUI 登录（只轮询 OneBot），避免 rate limit
    if (Date.now() >= nextAutoLoginAt) {
      const gated = humanGateActive();
      nextAutoLoginAt = Date.now() + (gated ? 90_000 : 25_000);
      if (gated) {
        if (Date.now() - start - lastNotify >= 25000) {
          console.log(
            "⏳ 等待你完成短信/滑块验证（门禁中，不再打 WebUI 登录接口）…" +
              `\n   验证页见启动日志；完成后守护会自动接管`,
          );
          lastNotify = Date.now() - start;
        }
      } else try {
        const result = await tryAutoLoginViaWebUi({});
        if (result.ok) {
          console.log(`✅ 自动登录成功（${result.reason}）`);
          clearNeedHuman();
          return { ok: true, selfId: QQ_ACCOUNT };
        }
        if (result.reason === "stale-login-status" && !gated) {
          console.log("ℹ️  登录状态陈旧，尝试 WebUI 软重启后再登…");
          if (await softRestartViaWebUi()) {
            clearNeedHuman();
            return { ok: true, selfId: QQ_ACCOUNT };
          }
        }
        console.log(`ℹ️  自动登录暂未成功（${result.reason}），继续轮询…`);
      } catch (err) {
        console.log(`ℹ️  自动登录调用异常：${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const elapsed = Date.now() - start;
    if (elapsed - lastNotify >= 10000) {
      console.log(
        `⏳ 等待登录中… 已等待 ${Math.round(elapsed / 1000)}s / ${timeoutMs / 1000}s` +
          `（probe=${health.reason}）`,
      );
      lastNotify = elapsed;
    }
    await sleep(1500);
  }
  if (lastSelfId) {
    console.error(
      `❌ 登录超时：在 ${timeoutMs / 1000}s 内未检测到目标账号 ${QQ_ACCOUNT}；` +
        `最后检测到账号 ${lastSelfId}。`,
    );
  } else {
    console.error(
      `❌ 登录超时：在 ${timeoutMs / 1000}s 内未确认目标账号在线；WebUI: ${webUiUrlHint()}`,
    );
  }
  return { ok: false, selfId: lastSelfId };
}

/**
 * 自动登录失败后：拉 WebUI 二维码发邮件，再额外等扫码。
 * @returns {Promise<boolean>} 是否在扫码等待期内上线
 */
async function requestQrAndWaitScan(reason) {
  console.log("📷 自动登录未成 → 拉登录二维码发邮件，等待你手机扫码…");
  markHumanGate("need-scan-qr", reason, { skipMail: true });
  try {
    await notifyQqOfflineNeedHuman("need-scan-qr", reason, { force: true });
  } catch (err) {
    console.log(`ℹ️  二维码邮件异常：${err instanceof Error ? err.message : String(err)}`);
  }
  const { ok } = await pollSelfId(QQ_SCAN_WAIT_MS);
  if (ok) {
    clearNeedHuman();
    notifyOnlineIfPending(`scan-login after ${reason}`);
    return true;
  }
  console.error(
    `❌ 扫码等待超时（${QQ_SCAN_WAIT_MS / 1000}s）。可再跑: node scripts/qq-offline-notify.mjs qr`,
  );
  return false;
}

async function hardRestartNapCat(reason) {
  if (!HARD_RESTART) {
    console.log(`🛡️ ONEBOT_QQ_HARD_RESTART=false：拒绝硬重启（${reason}）`);
    return false;
  }
  if (attachOnlyMode) {
    console.log("♻️  掉线硬重启：解除 attach-only，杀 QQ 后重新注入自动登录…");
    attachOnlyMode = false;
  }
  if (!canHardRestart()) {
    console.error(
      `⛔ 硬重启节流：每小时最多 ${RECOVER_MAX_PER_HOUR} 次、间隔 ≥ ${RECOVER_MIN_INTERVAL_MS / 1000}s。原因：${reason}`,
    );
    // 节流时仍尽量把当前二维码发给用户
    try {
      await notifyQqOfflineNeedHuman("recover-throttled", reason, { force: false });
    } catch {
      /* ignore */
    }
    return false;
  }
  markHardRestart();
  // 无论秒登还是扫码，重登成功后都要邮件+QQ 私聊（notify 模块用 awaitingOnlineMail 门闩）
  try {
    const { writeFileSync, mkdirSync, existsSync: ex } = fs;
    const stPath = path.join(napcatRoot, "offline-mail-state.json");
    let st = {};
    if (ex(stPath)) {
      try {
        st = JSON.parse(fs.readFileSync(stPath, "utf8"));
      } catch {
        st = {};
      }
    }
    st.awaitingOnlineMail = true;
    st.lastOfflineReason = String(reason || "hard-restart");
    st.updatedAt = new Date().toISOString();
    mkdirSync(path.dirname(stPath), { recursive: true });
    writeFileSync(stPath, JSON.stringify(st, null, 2), "utf8");
  } catch {
    /* ignore */
  }
  console.log(`♻️  硬杀 QQ/NapCat 并重新登录（${reason}）…`);
  if (napcatChild?.pid) {
    killProcessTree(napcatChild.pid);
  }
  killNapCatOnly();
  if (isProcessRunning("QQ.exe")) {
    console.log("🧹 关闭 QQ.exe 以便 NapCat 干净注入…");
    try {
      execSync("taskkill /F /IM QQ.exe", { stdio: "ignore" });
    } catch {
      /* ignore */
    }
  }
  napcatChild = null;
  webuiCredential = null;
  await sleep(2500);
  const child = spawnNapCat();
  if (!child) return false;

  // 等 WebUI 起来再尝试自动登录
  await waitForWebUi(90000);
  const { ok } = await pollSelfId(QQ_LOGIN_TIMEOUT_MS);
  if (ok) {
    clearNeedHuman();
    notifyOnlineIfPending(`hard-restart auto-login (${reason})`);
    return true;
  }
  // 杀进程重拉后仍未上线 → 二维码邮件 + 延长等待扫码
  return requestQrAndWaitScan(reason);
}

/**
 * 目标账号已在 OneBot 上在线 → attach-only（不 spawn / 不杀 QQ）。
 * 多探几次，避免 HTTP 晚就绪时误判去拉新实例。
 */
async function attachIfTargetAlreadyOnline() {
  if (!QQ_ACCOUNT) return false;
  const deadline = Date.now() + ATTACH_PROBE_MS;
  let attempt = 0;
  console.log(`🔍 attach 探测：目标 ${QQ_ACCOUNT} 是否已在线（≤${ATTACH_PROBE_MS / 1000}s）…`);
  while (Date.now() <= deadline) {
    attempt += 1;
    const health = await probeHealth();
    if (health.online) {
      attachOnlyMode = true;
      console.log(
        `✅ 目标 QQ ${QQ_ACCOUNT} 已在线 → attach-only 守护` +
          `（不 spawn、不杀进程；probe=#${attempt} reason=${health.reason}）`,
      );
      return true;
    }
    // login_info 已是目标号但 status 抖动：再信一次 login_info
    if (health.signals.loginInfo === QQ_ACCOUNT && health.signals.loginInfoReachable) {
      const info = await fetchLoginInfo(2500);
      if (isTargetOnline(info) && health.signals.oneBotOnline !== false) {
        attachOnlyMode = true;
        console.log(
          `✅ 目标 QQ ${QQ_ACCOUNT} 已在线（login_info）→ attach-only 守护（不 spawn、不杀进程）`,
        );
        return true;
      }
    }
    await sleep(1000);
  }
  console.log(`ℹ️  attach 探测未确认在线，将按需决定是否启动实例`);
  return false;
}

/**
 * 掉线恢复阶梯：
 * L1 快速 →（冷却外）密码一次
 * L2（仅 HARD_RESTART=false）：WebUI 软重启
 * L3（默认）：taskkill QQ → NapCat 重新注入 → 自动登录
 * 人工门禁期：只快速登录，禁止硬杀连环踢
 */
async function recoverFromOffline(reason) {
  if (recovering) {
    console.log("ℹ️  已有恢复流程在进行，跳过并发恢复");
    return false;
  }
  if (humanGateActive()) {
    console.log("⏳ 人工门禁期内：只尝试快速登录，不做硬杀");
    recovering = true;
    try {
      const soft = await tryAutoLoginViaWebUi({ allowPassword: false, allowNativeUi: false });
      if (soft.ok && (await probeHealth()).online) {
        clearNeedHuman();
        console.log(`✅ 软重登成功（${soft.reason}）`);
        return true;
      }
      return false;
    } catch (err) {
      // token BOM / rate-limit 等不得打崩整个 pnpm napcat
      console.log(
        `ℹ️  门禁期软重登异常：${err instanceof Error ? err.message : String(err)}（继续守护）`,
      );
      return false;
    } finally {
      recovering = false;
    }
  }

  recovering = true;
  console.log(`🔌 检测到掉线（${reason}），进入恢复…`);
  try {
    // NapCat 已卸/裸 QQ：WebUI 必挂，先关「下线通知」再硬杀重注，别空等 L1
    const napcatDead =
      /bare-qq|napcat-unloaded|webui-down|DLL Unload|KickedOffLine/i.test(String(reason));
    if (napcatDead) {
      dismissQqOfflineDialog();
      console.log("⚡ NapCat 已卸载或踢线 → 跳过 L1，直接硬杀重注自动登录");
      if (!HARD_RESTART) {
        console.log("🛡️  HARD_RESTART=false：无法硬杀；请手动重启 pnpm napcat");
        return false;
      }
      return hardRestartNapCat(reason);
    }

    try {
      const soft = await tryAutoLoginViaWebUi({ allowPassword: true, allowNativeUi: false });
      if (soft.ok) {
        const health = await probeHealth();
        if (health.online) {
          console.log(`✅ L1 软重登成功（${soft.reason}）`);
          clearNeedHuman();
          return true;
        }
      } else if (
        soft.reason === "need-captcha" ||
        soft.reason === "need-new-device" ||
        soft.reason === "awaiting-human"
      ) {
        console.error("⛔ 需要人工验证：停止本轮硬杀（避免风控连环踢）");
        // markHumanGate 内已发邮件；此处兜底（部分路径只 return reason）
        notifyQqOfflineNeedHuman(soft.reason, reason).catch(() => {});
        return false;
      } else if (soft.reason === "webui-down") {
        dismissQqOfflineDialog();
        console.log("⚡ WebUI 不可达 → 跳过软重登，硬杀重注");
        if (HARD_RESTART) return hardRestartNapCat(`webui-down:${reason}`);
      } else {
        console.log(`ℹ️  L1 失败（${soft.reason}）→ ${HARD_RESTART ? "L3 硬杀重登" : "L2 软重启"}`);
      }
    } catch (err) {
      console.log(
        `ℹ️  L1 异常：${err instanceof Error ? err.message : String(err)} → ${HARD_RESTART ? "L3" : "L2"}`,
      );
    }

    if (!HARD_RESTART) {
      try {
        if (await softRestartViaWebUi()) {
          console.log("✅ L2 WebUI 软重启 + 重登成功");
          clearNeedHuman();
          return true;
        }
      } catch (err) {
        console.log(`ℹ️  L2 异常：${err instanceof Error ? err.message : String(err)}`);
      }
      console.log("🛡️  HARD_RESTART=false：跳过硬杀，等待快速登录/人工验证");
      return false;
    }

    return hardRestartNapCat(reason);
  } finally {
    recovering = false;
  }
}

async function runWatchdog() {
  // 从当前日志末尾开始扫，避免把历史 KickedOffLine 当新事件
  try {
    if (fs.existsSync(LOG_PATH)) logReadOffset = fs.statSync(LOG_PATH).size;
  } catch {
    logReadOffset = 0;
  }

  console.log(
    `\n🛡️  QQ 掉线守护：` +
      `\n   · 多信号探测：get_login_info + get_status + WebUI online/isOffline` +
      `\n   · 日志秒级踢线：每 ${LOG_SCAN_INTERVAL_MS / 1000}s 扫 napcat.log` +
      `\n   · 恢复：快速 → 密码(冷却外一次)` +
      (HARD_RESTART
        ? ` → 硬杀重登(≤${RECOVER_MAX_PER_HOUR}/时，间隔≥${RECOVER_MIN_INTERVAL_MS / 1000}s)`
        : ` → 软重启（硬杀关：ONEBOT_QQ_HARD_RESTART=true 开启）`) +
      `\n   · 验证码冷却 ${Math.ceil(CAPTCHA_COOLDOWN_MS / 60000)}min；扫码等待 ${Math.ceil(QQ_SCAN_WAIT_MS / 60000)}min` +
      `\n   · 掉线：杀进程→登不上就邮件发二维码→上线后邮件附图+QQ私聊主人` +
      `\n   · 标记：${NEED_HUMAN_PATH}`,
  );

  let consecutiveMiss = 0;
  let lastProbeAt = 0;

  for (;;) {
    await sleep(LOG_SCAN_INTERVAL_MS);

    // 1) 日志瞬时踢线 → 立即恢复（不必等下一轮完整 interval）
    const kickLine = scanNapCatLogForKick();
    if (kickLine && !recovering) {
      console.log(`⚡ 日志捕获踢线：${kickLine.slice(0, 160)}`);
      if (fs.existsSync(NEED_HUMAN_PATH)) {
        console.log("⏳ 已有人工验证标记 → 补发二维码邮件，等待扫码");
        notifyQqOfflineNeedHuman("awaiting-human", kickLine.slice(0, 200)).catch(() => {});
        consecutiveMiss += 1;
      } else {
        const recovered = await recoverFromOffline("log:KickedOffLine");
        if (recovered) {
          consecutiveMiss = 0;
          notifyOnlineIfPending("recovered-from-kick");
        } else {
          consecutiveMiss += 1;
        }
      }
      lastProbeAt = Date.now();
      continue;
    }

    // 2) 周期性多信号探测
    if (Date.now() - lastProbeAt < WATCHDOG_INTERVAL_MS) continue;
    lastProbeAt = Date.now();

    const health = await probeHealth();
    if (health.online) {
      if (consecutiveMiss > 0) {
        console.log(`✅ 目标 QQ ${QQ_ACCOUNT} 已恢复在线`);
        notifyOnlineIfPending(`probe-recovered after miss=${consecutiveMiss}`);
      }
      consecutiveMiss = 0;
      clearNeedHuman();
      continue;
    }

    consecutiveMiss += 1;
    console.log(
      `⚠️  健康探测失败 #${consecutiveMiss}：${health.reason}` +
        ` signals=${JSON.stringify(health.signals)}`,
    );

    // 人工门禁优先：验证码期间绝不硬杀（否则短信页作废 + 再打一波 rate limit）
    if (humanGateActive()) {
      if (consecutiveMiss % 6 === 0) {
        console.log(
          "⏳ 人工门禁中：请完成短信/滑块；完成后 OneBot 上线即自动清除门禁（不狂打 WebUI 登录）",
        );
        // 门禁期周期性补发协助邮件（受冷却约束，不会狂发）
        notifyQqOfflineNeedHuman("awaiting-human", health.reason).catch(() => {});
      }
      continue;
    }

    // 裸 QQ / NapCat 卸载：一次即恢复（不必等连续两次）
    if (health.reason === "bare-qq-napcat-unloaded") {
      console.log("⚡ 探测到裸 QQ（NapCat 已卸载 / 下线通知态）→ 立即恢复");
      dismissQqOfflineDialog();
      const recovered = await recoverFromOffline(health.reason);
      consecutiveMiss = recovered ? 0 : consecutiveMiss + 1;
      continue;
    }

    // 连续两次再恢复，避免瞬时空窗；日志踢线已走快速路径
    if (consecutiveMiss < 2) continue;

    const recovered = await recoverFromOffline(health.reason);
    consecutiveMiss = recovered ? 0 : consecutiveMiss;
  }
}

async function main() {
  console.log("⚙️ 自动校验与配置 OneBot 闭环通信…");

  if (QQ_ACCOUNT) {
    console.log(
      `🤖 单账号模式：目标 QQ ${QQ_ACCOUNT}` +
        (QQ_PASSWORD ? "（已配置密码；冷却外可密码回退）" : "（未配置密码：仅快速登录/扫码）"),
    );
  } else {
    console.log("🤖 兼容模式：未配置 ONEBOT_QQ_ACCOUNT，保留多账号配置");
  }
  console.log(
    `🛡️  风控策略：硬杀=${HARD_RESTART ? "开" : "关"} · 多开=${QQ_MULTI_OPEN ? "开" : "关"} · 验证码冷却=${Math.ceil(CAPTCHA_COOLDOWN_MS / 60000)}min`,
  );
  if (QQ_MULTI_OPEN) {
    console.log("⚠️  ONEBOT_QQ_MULTI_OPEN=true 易互踢/风控；远程 Bot 建议 false（单账号）");
  }

  if (!QQ_AUTO_OPEN) {
    console.log("🔕 ONEBOT_QQ_AUTO_OPEN=false，不主动打开 QQ/NapCat 新实例。");
  }

  configureNapCat();

  // 正确账号已在线：只 attach 守护，完全不 spawn / 不杀
  if (await attachIfTargetAlreadyOnline()) {
    if (QQ_WATCHDOG) {
      await runWatchdog();
    } else {
      console.log("ℹ️  ONEBOT_QQ_WATCHDOG=false，attach 确认后退出");
    }
    return;
  }

  const existing = await fetchLoginInfo(3000);
  const existingSelfId = existing.selfId;
  if (existingSelfId) {
    console.log(`ℹ️ 检测到已有一个 QQ 实例在线：${existingSelfId}（不会关闭它）。`);
  }

  if (!QQ_AUTO_OPEN) {
    if (existingSelfId) {
      console.log(`ℹ️ 当前已有 QQ 在线：${existingSelfId}，自动打开已关闭，不执行多开。`);
    } else {
      console.log("⚠️ 未检测到任何 QQ 在线，且自动打开已关闭。请手动启动 NapCat/QQ 后重试。");
    }
    if (QQ_WATCHDOG && QQ_ACCOUNT) {
      // 未确认目标号时仍可挂守护：一旦出现正确账号只 attach 恢复，不 spawn
      attachOnlyMode = true;
      console.log("🛡️ AUTO_OPEN=false → 强制 attach-only 守护（不会 spawn 新实例）");
      await runWatchdog();
    }
    return;
  }

  const qqRunning = isProcessRunning("QQ.exe");

  if (qqRunning) {
    if (!QQ_MULTI_OPEN) {
      const webUiAlive = await waitForWebUi(5000);
      if (webUiAlive) {
        console.log(
          `⚠️ 检测到 QQ.exe 正在运行${existingSelfId ? `（已登录 ${existingSelfId}）` : "（无法确认账号）"}，` +
            "且 NapCat WebUI 可达 → attach-only（不 spawn）。",
        );
        attachOnlyMode = true;
        // QQ 在跑但未登录时：立刻走 WebUI 快速/密码（成熟路径），不要干等 watchdog
        if (QQ_ACCOUNT && !existingSelfId) {
          console.log("🔑 attach 现有 QQ：立即尝试 WebUI 快速/密码登录…");
          try {
            const soft = await tryAutoLoginViaWebUi({ allowPassword: true, allowNativeUi: false });
            if (soft.ok && (await probeHealth()).online) {
              console.log(`✅ attach 现有 QQ 登录成功（${soft.reason}）`);
              clearNeedHuman();
            } else {
              console.log(`ℹ️  首轮自动登录未成功（${soft.reason}）；进入守护继续恢复`);
            }
          } catch (err) {
            console.log(`ℹ️  首轮自动登录异常：${err instanceof Error ? err.message : String(err)}`);
          }
        }
        if (QQ_WATCHDOG && QQ_ACCOUNT) {
          await runWatchdog();
        }
        return;
      }
      // 裸 QQ（无 NapCat）：attach 无意义，必须关进程再用 napimain 注入启动
      console.log(
        "⚠️ QQ.exe 在跑但 NapCat WebUI 不可达（裸 QQ / 未注入）。" +
          " 关闭 QQ 后用 NapCat 重新注入启动…",
      );
      killNapCatOnly();
      try {
        execSync("taskkill /F /IM QQ.exe", { stdio: "ignore" });
      } catch {
        /* ignore */
      }
      await sleep(2000);
    } else {
      console.log(
        `⚠️ 检测到 QQ.exe 已在运行${existingSelfId ? `（已登录 ${existingSelfId}）` : "（无法确认账号）"}，` +
          " ONEBOT_QQ_MULTI_OPEN=true，尝试多开一个新的 Bot 实例…",
      );
      console.log("   提示：NapCat 应注入到新启动的 QQ 实例；若附到已运行的 QQ 上，脚本会报错。");
    }
  } else {
    killNapCatOnly();
    await sleep(1500);
  }

  const child = spawnNapCat();
  if (!child) {
    console.error("❌ spawn 被拒绝（attach-only？）；改为守护现有实例");
    attachOnlyMode = true;
    if (QQ_WATCHDOG && QQ_ACCOUNT) await runWatchdog();
    return;
  }

  const { ok, selfId } = await pollSelfId();
  if (!ok) {
    if (selfId && selfId === existingSelfId) {
      console.error(
        "❌ 校验失败：NapCat 附加到了已运行的 QQ 实例上，而非新启动的 Bot 实例。" +
          " 请关闭该 QQ 后重试，或检查 NapCat 多开注入逻辑。",
      );
    } else if (selfId) {
      console.error(`❌ 账号不匹配：当前登录为 ${selfId}，但配置要求 ${QQ_ACCOUNT}。`);
    } else {
      console.error(
        `❌ 在 ${QQ_LOGIN_TIMEOUT_MS / 1000}s 内未检测到 NapCat /get_login_info 返回；请检查 QQ 是否已登录。`,
      );
    }
    if (KILL_ON_MISMATCH) {
      console.log("⚠️ ONEBOT_QQ_KILL_ON_MISMATCH=true，关闭本次启动的 NapCat/QQ 进程树…");
      killProcessTree(child.pid);
    } else {
      console.log("⚠️ ONEBOT_QQ_KILL_ON_MISMATCH=false，保留已启动的 QQ 进程。");
    }
    // 即便首登失败，远程场景也进入守护，方便稍后扫一次码后自动接管
    if (QQ_WATCHDOG && QQ_ACCOUNT) {
      console.log("🛡️  首登未完成，仍进入掉线守护（完成一次人工验证后可自动续命）…");
      await runWatchdog();
      return;
    }
    process.exit(1);
  }

  console.log("\n🎉 【全自动闭环成功】NapCat HTTP API 已启用，Webhook 反向绑定！");
  if (QQ_WATCHDOG) {
    await runWatchdog();
  }
}

main().catch((err) => {
  console.error("启动失败:", err);
  process.exit(1);
});
