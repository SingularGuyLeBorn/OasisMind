/**
 * Agent 可见工具错误文案约定。
 *
 * 铁律：
 * - error 必须是完整中文原因 + 可执行下一步，禁止纯错误码当主文案。
 * - 参数/格式错误必须附带「正确示例」（可照抄的 JSON），避免模型空转重试。
 * - 禁止「A 或 B」含糊二选一：必须写清优先级 / 互斥规则。
 * - 禁止泄漏内部实现名（prisma、StreamHub、sendOneBotApi）当作主错误。
 * - 底层原文放 detail；机器码放 code。
 */

export type AgentToolError = {
  error: string;
  detail?: string;
  code?: string;
  /** 可照抄的正确入参示例（参数/格式错误时必填） */
  correctExample?: Record<string, unknown>;
  [key: string]: unknown;
};

/** 构造 Agent 可见错误；code 仅作机器标签，主阅读面永远是 error 中文句。 */
export function agentToolError(
  error: string,
  opts?: {
    detail?: string;
    code?: string;
    correctExample?: Record<string, unknown>;
  } & Record<string, unknown>,
): AgentToolError {
  const { detail, code, correctExample, ...rest } = opts ?? {};
  return {
    error,
    ...(code ? { code } : {}),
    ...(detail ? { detail } : {}),
    ...(correctExample ? { correctExample } : {}),
    ...rest,
  };
}

/** 把正确示例拼进 error 正文（LLM 主读面） */
export function appendCorrectExample(
  reason: string,
  correctExample: Record<string, unknown>,
  nextStep = "请按「正确示例」改参后只重试一次；禁止无改动连打。",
): string {
  const json = JSON.stringify(correctExample, null, 2);
  return `${reason}\n\n正确示例（可照抄，按需替换具体值）：\n${json}\n\n${nextStep}`;
}

/**
 * 参数缺失 / 格式错误专用：error 含示例正文，并带 correctExample 字段。
 */
export function agentParamError(opts: {
  reason: string;
  correctExample: Record<string, unknown>;
  got?: unknown;
  code?: string;
  nextStep?: string;
}): AgentToolError {
  const head =
    opts.got !== undefined
      ? `${opts.reason}（当前收到：${summarizeGot(opts.got)}）`
      : opts.reason;
  return agentToolError(appendCorrectExample(head, opts.correctExample, opts.nextStep), {
    code: opts.code ?? "INVALID_PARAMS",
    correctExample: opts.correctExample,
    ...(opts.got !== undefined ? { got: opts.got } : {}),
  });
}

function summarizeGot(got: unknown): string {
  if (got === undefined) return "undefined";
  if (got === null) return "null";
  if (typeof got === "string") {
    const s = got.length > 80 ? `${got.slice(0, 80)}…` : got;
    return JSON.stringify(s);
  }
  try {
    const s = JSON.stringify(got);
    return s.length > 120 ? `${s.slice(0, 120)}…` : s;
  } catch {
    return String(got);
  }
}

/** 从字段 description 里抠「例 "…" / 例 \"…\" / 例如 …」 */
export function extractExampleFromDescription(description: string | undefined): unknown | undefined {
  if (!description) return undefined;
  const patterns = [
    /例\s*[：:=]?\s*"([^"]+)"/,
    /例\s*[：:=]?\s*'([^']+)'/,
    /例如\s*[：:=]?\s*"([^"]+)"/,
    /example\s*[：:=]\s*"([^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = description.match(re);
    if (m?.[1]) return m[1];
  }
  // 例 1234567890（无引号数字）
  const num = description.match(/例\s*[：:=]?\s*(\d{5,})/);
  if (num?.[1]) {
    const n = Number(num[1]);
    return Number.isSafeInteger(n) ? n : num[1];
  }
  return undefined;
}

type JsonSchemaProp = {
  description?: string;
  type?: string | string[];
  enum?: unknown[];
  examples?: unknown[];
  default?: unknown;
};

function placeholderForProp(field: string, prop: JsonSchemaProp | undefined): unknown {
  if (!prop) return `<${field}>`;
  if (Array.isArray(prop.examples) && prop.examples.length > 0) return prop.examples[0];
  if (prop.default !== undefined) return prop.default;
  if (Array.isArray(prop.enum) && prop.enum.length > 0) return prop.enum[0];
  const fromDesc = extractExampleFromDescription(prop.description);
  if (fromDesc !== undefined) return fromDesc;
  const t = Array.isArray(prop.type) ? prop.type[0] : prop.type;
  if (t === "number" || t === "integer") return 1;
  if (t === "boolean") return true;
  if (t === "array") return [];
  if (t === "object") return {};
  // 常见字段名启发式
  if (/url/i.test(field)) return "https://example.com/path";
  if (/path|file/i.test(field)) return "content/uploads/example.txt";
  if (/userId|openid/i.test(field)) return "14A17D731DD2B1A0CC57FC8EDBFFC50B";
  if (/groupId/i.test(field)) return "A1B2C3D4E5F6789012345678ABCDEF01";
  if (/messageId/i.test(field)) return "1234567890";
  if (/keyword|query|text|content|name$/i.test(field)) return "示例文本";
  return `<${field}>`;
}

/** 已知工具的高质量示例（覆盖启发式不够准的情况） */
export const TOOL_CORRECT_EXAMPLES: Record<string, Record<string, unknown>> = {
  send_qq_text: {
    text: "备份已完成，报告见知识库。",
    userId: "14A17D731DD2B1A0CC57FC8EDBFFC50B",
  },
  send_qq_image: {
    file: "content/uploads/screenshots/demo.jpg",
    userId: "14A17D731DD2B1A0CC57FC8EDBFFC50B",
  },
  send_qq_video: {
    file: "content/uploads/demo.mp4",
    userId: "14A17D731DD2B1A0CC57FC8EDBFFC50B",
  },
  send_qq_file: {
    file: "content/uploads/qq-text/report.txt",
    name: "调研报告.txt",
    userId: "14A17D731DD2B1A0CC57FC8EDBFFC50B",
  },
  send_qq_voice: {
    provider: "cosyvoice",
    voice: "cosyvoice-v3-flash-hikari-7d55a0404bf0487aa1d316cd3b6e1823",
    text: "私はただの科学者だ。",
    language: "ja",
    tone: "gentle",
  },
  send_qq_voice_synth: {
    provider: "cosyvoice",
    voice: "cosyvoice-v3-flash-hikari-7d55a0404bf0487aa1d316cd3b6e1823",
    text: "私はただの科学者だ。",
    language: "ja",
    tone: "angry",
  },
  delete_qq_message: {
    messageId: "1234567890",
  },
  skill_view: {
    name: "daily-fragments-workspace",
  },
  skill_manage: {
    action: "patch",
    name: "daily-fragments-workspace",
    old_string: "旧片段原文",
    new_string: "替换后的新片段",
  },
};

/** 若有预置示例则优先用预置覆盖同名字段 */
export function resolveToolExample(
  toolName: string,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  const preset = TOOL_CORRECT_EXAMPLES[toolName];
  if (!preset) return fallback;
  return { ...fallback, ...preset };
}

/**
 * 缺必填参数：用 schema description/examples 拼出可照抄的 correctExample。
 */
export function formatMissingRequiredWithExample(
  toolName: string,
  missing: string[],
  parameters: Record<string, unknown>,
): AgentToolError {
  const props =
    parameters.properties && typeof parameters.properties === "object"
      ? (parameters.properties as Record<string, JsonSchemaProp>)
      : {};
  const required = Array.isArray(parameters.required)
    ? parameters.required.map(String)
    : missing;

  const built: Record<string, unknown> = {};
  for (const field of required) {
    built[field] = placeholderForProp(field, props[field]);
  }
  for (const field of missing) {
    if (!(field in built)) {
      built[field] = placeholderForProp(field, props[field]);
    }
  }
  const correctExample = resolveToolExample(toolName, built);

  const lines = missing.map((field) => {
    const desc = props[field]?.description?.trim();
    if (desc) return `- ${field}（必填）：${desc}`;
    return `- ${field}（必填）：必须提供，见下方正确示例。`;
  });

  const reason =
    `工具 ${toolName} 缺少必填参数，无法执行。\n` + lines.join("\n");

  return agentParamError({
    reason,
    correctExample,
    code: "MISSING_REQUIRED_PARAMS",
    nextStep: "请按「正确示例」补全缺失字段后只重试一次；不要传 null，不要无改动连打。",
  });
}

/** 缺服务端会话/DB 上下文时的统一说法（禁止写 prisma） */
export const ERR_NEED_CHAT_CONTEXT = agentToolError(
  "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。" +
    "请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。",
  { code: "NEED_CHAT_CONTEXT" },
);

/** 缺流式服务时的统一说法（禁止写 StreamHub） */
export const ERR_STREAM_NOT_READY = agentToolError(
  "流式对话服务尚未就绪，无法恢复或订阅会话。" +
    "请用户重启 OasisMind server，打开新会话后再试；你不要连续重试本工具。",
  { code: "STREAM_NOT_READY" },
);
