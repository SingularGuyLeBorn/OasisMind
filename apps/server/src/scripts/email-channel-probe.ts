/**
 * 对比直连 vs 代理下 AgentMail 是否可达，并尝试发一封测试信。
 * pnpm --filter @oasismind/server exec tsx src/scripts/email-channel-probe.ts
 */
import { setGlobalDispatcher, ProxyAgent, Agent } from "undici";
import { loadRootEnv } from "../infra/config.js";

loadRootEnv();

const key = process.env.AGENTMAIL_API_KEY?.trim() || "";
const inbox = process.env.AGENTMAIL_INBOX_ID?.trim() || "";
const to = process.env.EMAIL_TO?.trim() || process.env.AGENTMAIL_ASK_TO?.trim() || "";
const proxy =
  process.env.OM_HTTPS_PROXY?.trim() ||
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  "http://127.0.0.1:7890";

console.log("—— 你记得的两条邮件相关通道 ——");
console.log("1) AgentMail（agentmail.to）：国外 API，发到 EMAIL_TO，不需要你开 SMTP");
console.log("2) SMTP（QQ 邮箱授权码）：可选备用发信通道；.env 里目前是注释+空密码");
console.log("另有 NTFY 推送（可选），不是邮箱。");
console.log("");
console.log(`EMAIL_TO=${to}`);
console.log(`AGENTMAIL_INBOX=${inbox}`);
console.log(`试探代理=${proxy}`);
console.log("");

async function probe(label: string) {
  const url = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        "User-Agent": "OasisMind-probe/1.0",
      },
      signal: AbortSignal.timeout(20_000),
    });
    const text = (await res.text()).slice(0, 160).replace(/\s+/g, " ");
    console.log(`[${label}] GET inbox → HTTP ${res.status} ${text}`);
    return res.ok;
  } catch (e) {
    console.log(`[${label}] GET inbox → ERR ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

async function send(label: string) {
  const url = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "OasisMind-probe/1.0",
      },
      body: JSON.stringify({
        to: [to],
        subject: `[OasisMind] AgentMail 通道测试 ${label}`,
        text: `这是 AgentMail 通道测试（${label}），收件人应为 ${to}。\n时间 ${new Date().toISOString()}`,
        html: `<p>AgentMail 通道测试（${label}）→ <b>${to}</b></p>`,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const text = (await res.text()).slice(0, 300).replace(/\s+/g, " ");
    console.log(`[${label}] SEND → HTTP ${res.status} ${text}`);
    return res.ok;
  } catch (e) {
    console.log(`[${label}] SEND → ERR ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

if (!key || !inbox || !to) {
  console.error("缺少 AGENTMAIL_API_KEY / INBOX / EMAIL_TO");
  process.exit(1);
}

// 1) 直连
setGlobalDispatcher(new Agent());
const directOk = await probe("直连");
if (directOk) await send("直连");

// 2) 走本地代理
setGlobalDispatcher(new ProxyAgent(proxy));
const proxyOk = await probe(`代理 ${proxy}`);
if (proxyOk) {
  const sent = await send(`代理 ${proxy}`);
  if (sent) {
    console.log("\n✅ 代理下 AgentMail 可发。建议在 .env 加：OM_HTTPS_PROXY=http://127.0.0.1:7890");
    process.exit(0);
  }
}

console.log("\n结论：");
console.log(`  直连 AgentMail: ${directOk ? "可达" : "失败（常见 CloudFront 403）"}`);
console.log(`  代理 AgentMail: ${proxyOk ? "可达" : "失败"}`);
console.log("  SMTP 备用: 未启用（.env 里 EMAIL_SMTP_* 仍是注释）");
process.exit(1);
