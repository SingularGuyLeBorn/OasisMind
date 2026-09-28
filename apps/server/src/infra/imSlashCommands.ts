/**
 * IM 通道斜杠指令（网关层拦截，不进 LLM）。
 * QQ / 飞书等共用；手机远程指挥场景优先短回复。
 */

export type ImSlashCommand =
  | { type: "new"; topicLabel: string }
  | { type: "clear" }
  | { type: "stop" }
  | { type: "help" }
  | { type: "ping" }
  | { type: "status" }
  | { type: "where" }
  | { type: "id" }
  | { type: "queue"; action: "list" | "clear" }
  | { type: "none" };

export const IM_SLASH_HELP_TEXT = [
  "见微 IM 指令（系统直接处理，不进对话）：",
  "",
  "/help · /帮助 — 本说明",
  "/ping — 探活",
  "/status · /状态 — 是否在回复、排队几条",
  "/where · /会话 — 当前 Agent / 会话",
  "/id · /whoami — 你的 openid（配白名单用）",
  "/new [主题] · /新话题 — 开干净会话（可带主题）",
  "/clear · /重置 — 清空当前会话消息",
  "/stop · /cancel — 强制打断当前回复",
  "/queue · /队列 — 看排队",
  "/queue clear · /flush — 清空排队（不打断正在跑的）",
  "",
  "群聊须 @机器人；图文不便同条时：先发图 → 引用再 @。",
].join("\n");

/**
 * 解析 IM 文本是否为斜杠/同义指令。
 * 「新话题」无斜杠前缀仍识别（兼容旧习惯）；其它指令必须 / 开头，避免误伤正常聊天。
 */
export function parseImSlashCommand(text: string): ImSlashCommand {
  const t = text.trim();
  if (!t) return { type: "none" };

  const newTopicMatch = t.match(
    /^(?:\/(?:new|新话题|newtopic|换话题|开启新话题|开启一个新话题)|新话题|开启新话题|开启一个新话题|换话题)\s*(.*)/i,
  );
  if (newTopicMatch) {
    return { type: "new", topicLabel: (newTopicMatch[1] || "").trim() };
  }

  if (/^\/(?:clear|重置|清空|reset)\s*$/i.test(t)) return { type: "clear" };
  if (/^\/(?:stop|force|cancel|停止|强制停止|取消)\s*$/i.test(t)) return { type: "stop" };
  if (/^\/(?:help|帮助|命令|cmds|commands)\s*$/i.test(t)) return { type: "help" };
  if (/^\/(?:ping|pong)\s*$/i.test(t)) return { type: "ping" };
  if (/^\/(?:status|状态|stat)\s*$/i.test(t)) return { type: "status" };
  if (/^\/(?:where|会话|session|here)\s*$/i.test(t)) return { type: "where" };
  if (/^\/(?:id|whoami|我的id|openid)\s*$/i.test(t)) return { type: "id" };

  const queueMatch = t.match(/^\/(?:queue|队列|flush)(?:\s+(clear|清空|flush))?$/i);
  if (queueMatch) {
    const isFlushCmd = /^\/flush$/i.test(t);
    const actionRaw = (queueMatch[1] || "").toLowerCase();
    const clear =
      isFlushCmd || actionRaw === "clear" || actionRaw === "清空" || actionRaw === "flush";
    return { type: "queue", action: clear ? "clear" : "list" };
  }

  return { type: "none" };
}
