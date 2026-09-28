/**
 * Kimi WebBridge 域 — 元工具驱动本机真实浏览器（navigate/click/fill/snapshot）。
 * 不拆成十几条 MCP 工具，避免 schema 膨胀。
 */

import type { NativeToolContext, NativeToolDefinition } from "./types.js";
import { registerNativeDomain } from "./registerDomain.js";
import {
  getWebbridgeStatus,
  runWebbridgeCommand,
  startWebbridgeDaemon,
  WEBBRIDGE_INSTALL_HINT,
} from "../../webbridgeClient.js";

async function webbridgeStatusTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const result = await getWebbridgeStatus({
    timeoutMs: args.timeout != null ? Number(args.timeout) : undefined,
  });
  if (!result.ok) {
    return {
      error: result.code,
      message: result.message,
      installHint: result.installHint,
      note: "未安装时请引导用户打开 WebBridge 安装页；只读网页可改用 dokobot_read / read_article。",
    };
  }
  return {
    running: result.running,
    extensionConnected: result.extensionConnected,
    port: result.port,
    version: result.version,
    extensionId: result.extensionId,
    extensionVersion: result.extensionVersion,
    uptimeSeconds: result.uptimeSeconds,
    updateAvailable: result.updateAvailable,
    bin: result.bin,
    baseUrl: result.baseUrl,
    installHint: result.extensionConnected ? undefined : WEBBRIDGE_INSTALL_HINT,
    note: result.running
      ? result.extensionConnected
        ? "daemon + 扩展已连接，可用 webbridge_command。"
        : "daemon 已起但扩展未 Connected——请打开浏览器并确认扩展图标。"
      : "daemon 未运行：先 webbridge_start，再确认扩展 Connected。",
  };
}

async function webbridgeStartTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const result = await startWebbridgeDaemon({
    timeoutMs: args.timeout != null ? Number(args.timeout) : undefined,
  });
  if (!result.ok) {
    return {
      error: result.code,
      message: result.message,
      installHint: result.installHint,
      body: result.body,
    };
  }
  const status = await getWebbridgeStatus();
  return {
    started: true,
    message: result.message,
    bin: result.bin,
    status: status.ok
      ? {
          running: status.running,
          extensionConnected: status.extensionConnected,
          port: status.port,
          version: status.version,
        }
      : { error: status.code, message: status.message },
    note: "勿自动 stop/restart/uninstall。扩展仍未连时请用户打开 https://www.kimi.com/zh-cn/features/webbridge",
  };
}

async function webbridgeCommandTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const action = String(args.action ?? "").trim();
  const session = String(args.session ?? "").trim();
  let commandArgs: Record<string, unknown> = {};
  if (args.args != null) {
    if (typeof args.args === "string") {
      try {
        const parsed = JSON.parse(args.args) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          commandArgs = parsed as Record<string, unknown>;
        }
      } catch {
        return {
          error: "WEBBRIDGE_BAD_ARGS",
          message: "args 若为字符串必须是合法 JSON 对象",
          installHint: WEBBRIDGE_INSTALL_HINT,
        };
      }
    } else if (typeof args.args === "object" && !Array.isArray(args.args)) {
      commandArgs = args.args as Record<string, unknown>;
    }
  }

  const result = await runWebbridgeCommand({
    action,
    args: commandArgs,
    session,
    timeoutMs: args.timeout != null ? Number(args.timeout) : undefined,
  });

  if (!result.ok) {
    return {
      error: result.code,
      message: result.message,
      installHint: result.installHint,
      statusCode: result.statusCode,
      body: result.body,
      suggestedFallback:
        result.code === "WEBBRIDGE_DAEMON_DOWN"
          ? "webbridge_start"
          : action === "snapshot" || action === "navigate"
            ? "dokobot_read"
            : undefined,
      note:
        result.code === "WEBBRIDGE_DAEMON_DOWN"
          ? "先调用 webbridge_start（可重复，已在跑则 no-op），再重试本命令。"
          : result.code === "WEBBRIDGE_NOT_CONNECTED"
            ? "请用户确认浏览器扩展 Connected 后重试。"
            : undefined,
    };
  }

  return {
    action: result.action,
    session: result.session,
    statusCode: result.statusCode,
    data: result.data,
    note:
      "流程：同任务固定 session → navigate(newTab+group_title) → snapshot 取 @e → click/fill。截图 path 再用 read_image。结束仅在用户要求时 close_session。",
  };
}

const WEBBRIDGE_DEFS: NativeToolDefinition[] = [
  {
    name: "webbridge_status",
    concurrencyClass: "B",
    description:
      "探测 Kimi WebBridge：daemon 是否在跑、扩展是否 Connected。操作浏览器前可先查；未装则返回 installHint。",
    parameters: {
      type: "object",
      properties: {
        timeout: { type: "number", description: "超时毫秒，默认 8000" },
      },
    },
  },
  {
    name: "webbridge_start",
    concurrencyClass: "A",
    description:
      "启动本机 kimi-webbridge daemon（已在跑通常 no-op）。连接拒绝时先调此工具再 webbridge_command；禁止自动 stop/restart。",
    parameters: {
      type: "object",
      properties: {
        timeout: { type: "number", description: "超时毫秒，默认 15000" },
      },
    },
  },
  {
    name: "webbridge_command",
    concurrencyClass: "A",
    description:
      "经 Kimi WebBridge 控制用户真实浏览器。POST action+args+session。常用 action：navigate(url,newTab,group_title)、find_tab、snapshot、click(selector)、fill(selector,value)、evaluate、screenshot、list_tabs、close_tab、close_session。同一任务固定 session；先 snapshot 用 @e 再点填。中文内容走本工具（勿 shell 内联 JSON）。只需读正文优先 dokobot_read。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description:
            "navigate|find_tab|snapshot|click|fill|evaluate|cdp|screenshot|network|upload|save_as_pdf|list_tabs|close_tab|close_session",
        },
        args: {
          type: "object",
          description:
            "动作参数对象。例 navigate:{url,newTab,group_title}；click:{selector}；fill:{selector,value}；snapshot 可 {}",
        },
        session: {
          type: "string",
          description: "任务级会话名（顶层字段）。整任务固定一个，如 phone-compare",
        },
        timeout: { type: "number", description: "超时毫秒，默认 120000" },
      },
      required: ["action", "session"],
    },
  },
];

const WEBBRIDGE_HANDLERS = {
  webbridge_status: webbridgeStatusTool,
  webbridge_start: webbridgeStartTool,
  webbridge_command: webbridgeCommandTool,
};

export function registerWebbridgeTools(): void {
  registerNativeDomain(WEBBRIDGE_DEFS, WEBBRIDGE_HANDLERS);
}
