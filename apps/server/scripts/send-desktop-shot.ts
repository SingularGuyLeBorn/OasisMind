import path from "path";
import {
  createOneBotAdapter,
  __resetOneBotOutboundPaceForTests,
  listRecentOutboundMessages,
} from "../src/infra/channels/onebotBot.js";

__resetOneBotOutboundPaceForTests();
process.env.ONEBOT_SEND_MIN_INTERVAL_MS = process.env.ONEBOT_SEND_MIN_INTERVAL_MS || "5000";

const owner = (process.env.ONEBOT_QQ_OWNER || "2635495642").trim();
const shot =
  process.argv[2] ||
  path.resolve(process.cwd(), "../../content/uploads/screenshots/desktop-1786114913360.png");

const adapter = createOneBotAdapter({
  httpUrl: process.env.ONEBOT_HTTP_URL || "http://127.0.0.1:3001",
  accessToken: "",
  secret: "",
  enabled: true,
  allowedUsers: [owner],
  allowedGroups: [],
  groupMessageTypes: ["text"],
  groupRequireAt: true,
  qqAccount: process.env.ONEBOT_QQ_ACCOUNT || "2871732121",
}) as ReturnType<typeof createOneBotAdapter> & {
  sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<{ data?: { message_id?: number }; retcode?: number }>;
  sendImage: (p: { userId: string; file: string }) => Promise<{ data?: { message_id?: number }; retcode?: number }>;
  deleteMessage: (id: string | number) => Promise<unknown>;
};

const skipText = process.argv.includes("--image-only");
let textRes: { data?: { message_id?: number }; retcode?: number } | null = null;

if (!skipText) {
  const t0 = Date.now();
  textRes = await adapter.sendOneBotApi("/send_private_msg", {
    user_id: Number(owner),
    message: "[OasisMind] 当前桌面截图如下（发送间隔 ≥5s 防风控）",
  });
  console.log("text", textRes.retcode, textRes.data?.message_id, "t", Date.now() - t0);
}

const t1 = Date.now();
try {
  const imgRes = await adapter.sendImage({ userId: owner, file: shot });
  console.log("image", imgRes.retcode, imgRes.data?.message_id, "gapMs", Date.now() - t1);
} catch (err) {
  console.error("image FAILED", err instanceof Error ? err.message : err, "gapMs", Date.now() - t1);
}

console.log("recent", listRecentOutboundMessages(5));

if (process.argv.includes("--recall-text") && textRes?.data?.message_id != null) {
  const del = await adapter.deleteMessage(textRes.data.message_id);
  console.log("recalled text probe", del);
}

await adapter.stop();
console.log("done shot=", shot);
