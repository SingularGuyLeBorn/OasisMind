/**
 * 通知通道探测：pnpm email:test / pnpm --filter @knowpilot/server email:test
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAppConfig, loadRootEnv } from "../infra/config.js";
import { getNotifyStatus, sendTestNotification } from "../infra/emailNotifier.js";
import { initGlobalProxy } from "../infra/proxyDispatcher.js";

loadRootEnv();
initGlobalProxy();

// 保险：再扫一遍 monorepo 根 .env（loadRootEnv 已处理则跳过）
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
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

const toOverride = (process.argv[2] || "").trim() || undefined;
const config = getAppConfig();
const status = getNotifyStatus(config);

console.log("—— 通知配置 ——");
console.log(`provider: ${status.provider}`);
console.log(`EMAIL_TO: ${status.to || "(空)"}`);
console.log(`AGENTMAIL_ASK_TO: ${status.askTo || "(空)"}`);
for (const c of status.channels) {
  console.log(`  [${c.configured ? "✓" : "·"}] ${c.name}: ${c.detail}`);
}
if (status.hint) console.log(`hint: ${status.hint}`);

console.log("\n—— 发送测试 ——");
const result = await sendTestNotification(config, undefined, { to: toOverride });
if ("error" in result) {
  console.error("FAIL:", result.error);
  process.exit(1);
}
console.log("OK:", result.message);
if (result.messageId) console.log("messageId:", result.messageId);
