/**
 * 工具调用死循环检测（DeerFlow LoopDetection 启发）。
 * 纯函数：同参连续 / 同名变参刷屏 / 双指纹交替 → 提醒（由调用方决定是否软警告，不硬拦执行）。
 */

export type ToolCallFingerprintInput = {
  name: string;
  args: Record<string, unknown>;
};

export type LoopGuardState = {
  /** fingerprint → 连续命中次数（中间被不同 call 打断则归零该链） */
  streakFp: string | null;
  streakCount: number;
  /** 同工具名连续次数（忽略 args，防微调参数刷屏） */
  lastName: string | null;
  nameStreak: number;
  /** 本 run 已见过的指纹历史（最近 N） */
  recent: string[];
  /** 本轮死循环提醒已发过的 warnKey（避免同模式连刷提示） */
  lastWarnedKey: string | null;
};

export type LoopGuardVerdict =
  | { blocked: false; state: LoopGuardState }
  | {
      blocked: true;
      state: LoopGuardState;
      fingerprint: string;
      /** 稳定键：同模式只提醒一次 */
      warnKey: string;
      /** 是否应注入一条提醒（同 warnKey 已提醒过则为 false） */
      shouldWarn: boolean;
      message: string;
    };

const DEFAULT_STREAK = 3;
/** 同名不同参连续上限（默认 2× 同参阈值） */
const DEFAULT_NAME_STREAK = 6;
const RECENT_CAP = 32;
const OSCILLATION_WINDOW = 6;

/**
 * 知识库勘察类只读工具：连续 list/read 不同路径是正常推进，
 * 不计入「同名变参刷屏」与「双指纹交替」；仍受同参 fingerprint 检测约束。
 */
const EXPLORE_READONLY_TOOLS = new Set([
  "list_directory",
  "read_file",
  "post_list",
  "garden_list",
  "garden_get",
  "search_files",
  "glob_files",
  // 连续换 URL/关键词勘察也是推进，不是死循环
  "read_article",
  "scrape_web_page",
  "memory_search",
  "memory_daily_search",
  "todo_read",
  "browser_login_status",
  "web_search",
  "search_arxiv",
  "fetch_arxiv",
  "search_huggingface",
  "literature_search",
  "literature_get",
  "video_transcript",
  "media_download",
  "audio_transcribe",
  "video_notes",
  "tikhub_request",
  "inbox_list",
  "inbox_stats",
  "inbox_enrich",
  "inbox_capture_url",
  "inbox_capture_urls",
  "inbox_scan_screenshots",
  "inbox_platform_sync_status",
  "inbox_sync_zhihu",
  "inbox_sync_xhs",
  "inbox_sync_bilibili",
  "session_search",
  "rss_fetch",
  // 场景 B 资料员：连存多页 / 连截多屏是推进
  "save_webpage",
  "download_file",
  "article_import",
  "browser_screenshot",
  "scroll_screenshot",
  "read_image",
  "vision_describe",
  // 状态轮询（换 jobId / 平台）
  "async_task_status",
  "platform_login",
  "agent_inspect",
  // 连续换命令勘察/抓取是推进（同 command 指纹仍受同参检测）
  "run_shell",
  "dokobot_read",
  "dokobot_search",
  "webbridge_status",
  "webbridge_start",
  "webbridge_command",
]);

function isExploreReadonlyTool(name: string): boolean {
  return EXPLORE_READONLY_TOOLS.has(String(name || "").replace(/^native:/, ""));
}

/** 稳定序列化：键排序，避免同参不同字段序误判为不同 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function toolCallFingerprint(call: ToolCallFingerprintInput): string {
  const name = String(call.name || "").replace(/^native:/, "");
  return `${name}::${stableStringify(call.args ?? {})}`;
}

export function createLoopGuardState(): LoopGuardState {
  return {
    streakFp: null,
    streakCount: 0,
    lastName: null,
    nameStreak: 0,
    recent: [],
    lastWarnedKey: null,
  };
}

/** 最近 window 条是否在两个指纹间严格交替（A/B/A/B…） */
export function detectOscillation(recent: string[], window = OSCILLATION_WINDOW): string | null {
  if (recent.length < window || window < 4) return null;
  const slice = recent.slice(-window);
  const a = slice[0]!;
  const b = slice[1]!;
  if (!a || !b || a === b) return null;
  for (let i = 0; i < window; i++) {
    if (slice[i] !== (i % 2 === 0 ? a : b)) return null;
  }
  return `${a.slice(0, 60)} ⇄ ${b.slice(0, 60)}`;
}

function withWarn(
  state: LoopGuardState,
  warnKey: string,
  fingerprint: string,
  message: string,
): LoopGuardVerdict {
  const shouldWarn = state.lastWarnedKey !== warnKey;
  return {
    blocked: true,
    state: { ...state, lastWarnedKey: warnKey },
    fingerprint,
    warnKey,
    shouldWarn,
    message,
  };
}

/**
 * 检查本批 tool calls；命中死循环模式则 blocked=true（提醒用，不硬拦）。
 * 1) 同 fingerprint 连续 ≥ streakLimit
 * 2) 同工具名连续 ≥ nameStreakLimit（变参刷屏）
 * 3) 最近 window 条双指纹交替
 */
export function checkToolLoop(
  state: LoopGuardState,
  calls: ToolCallFingerprintInput[],
  streakLimit = DEFAULT_STREAK,
  nameStreakLimit = DEFAULT_NAME_STREAK,
): LoopGuardVerdict {
  let streakFp = state.streakFp;
  let streakCount = state.streakCount;
  let lastName = state.lastName;
  let nameStreak = state.nameStreak;
  let lastWarnedKey = state.lastWarnedKey;
  const recent = [...state.recent];

  for (const call of calls) {
    const name = String(call.name || "").replace(/^native:/, "");
    const fp = toolCallFingerprint(call);

    if (streakFp === fp) {
      streakCount += 1;
    } else {
      streakFp = fp;
      streakCount = 1;
    }

    const explore = isExploreReadonlyTool(name);
    if (!explore) {
      if (lastName === name) {
        nameStreak += 1;
      } else {
        lastName = name;
        nameStreak = 1;
      }
    } else {
      // 勘察工具打断「写/搜」类同名 streak，避免读完目录后误连坐
      lastName = null;
      nameStreak = 0;
    }

    recent.push(fp);
    while (recent.length > RECENT_CAP) recent.shift();

    const next: LoopGuardState = {
      streakFp,
      streakCount,
      lastName,
      nameStreak,
      recent,
      lastWarnedKey,
    };

    if (streakCount >= streakLimit) {
      return withWarn(
        next,
        `fp:${fp}`,
        fp,
        `【提醒】检测到疑似工具死循环：连续 ${streakCount} 次相同调用（${fp.slice(0, 120)}）。` +
          `工具仍会照常执行；请留意是否卡在同一步，尽量换策略或换参数，避免无意义重复。`,
      );
    }

    if (!explore && nameStreak >= nameStreakLimit) {
      return withWarn(
        next,
        `name:${name}`,
        fp,
        `【提醒】检测到疑似工具死循环：连续 ${nameStreak} 次调用同一工具「${name}」（参数在变）。` +
          `工具仍会照常执行；请确认是否真有进展，必要时换工具或换思路。`,
      );
    }

    // 勘察类 A/B 交替读文件是常态，不做乒乓检测
    if (!explore) {
      const osc = detectOscillation(recent);
      if (osc) {
        return withWarn(
          next,
          `osc:${osc}`,
          fp,
          `【提醒】检测到疑似工具死循环：在两种调用间交替（${osc}）。` +
            `工具仍会照常执行；请避免乒乓调用，换策略或向用户说明卡点。`,
        );
      }
    }
  }

  return {
    blocked: false,
    state: {
      streakFp,
      streakCount,
      lastName,
      nameStreak,
      recent,
      lastWarnedKey: null,
    },
  };
}
