/**
 * IntentContract：reveal / revision / switch。
 * 纯函数分类 + 一处写 goalState。compact 必须读 superseded，禁止当现行约束。
 */
import type { SessionGoalState } from "@oasismind/shared";
import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";

export type IntentKind = "reveal" | "revision" | "switch";

export type ClassifiedIntent = {
  kind: IntentKind;
  reason: string;
  nextArguments: Record<string, unknown>;
  nextFunction?: string;
  nextGoalText?: string;
};

const REVISION_RE = /改成|不要.+改做|不要.+改成|改做/;
const SWITCH_RE = /另外做|另外一个|另外写|换个任务|新开一个|开一个新/;

export function classifyIntentByRules(userText: string): IntentKind | null {
  const t = userText.trim();
  if (SWITCH_RE.test(t)) return "switch";
  if (REVISION_RE.test(t)) return "revision";
  return null;
}

export function extractRevisionPair(userText: string): { next?: string; drop?: string } {
  const next = userText.match(/改成([^，,。\s]+)/)?.[1];
  const drop = userText.match(/不要([^，,。\s]+)/)?.[1];
  return { next, drop };
}

export function applyRevisionToGoalText(oldText: string, userText: string): string {
  const { next, drop } = extractRevisionPair(userText);
  if (next && drop && oldText.includes(drop)) return oldText.split(drop).join(next);
  if (next) return `${oldText}（已修订为${next}）`;
  return oldText;
}

export function extractSwitchGoalText(userText: string): string {
  const stripped = userText.replace(/^(另外(做|一个|写一个)?|换个任务|新开一个|开一个新)\s*/u, "").trim();
  return stripped || userText.trim();
}

export function classifyIntent(userText: string): ClassifiedIntent {
  const kind = classifyIntentByRules(userText) ?? "reveal";
  const { next, drop } = extractRevisionPair(userText);
  if (kind === "revision") {
    return {
      kind,
      reason: userText.trim().slice(0, 200),
      nextArguments: { topic: next ?? userText.trim(), dropped: drop },
      nextGoalText: undefined,
    };
  }
  if (kind === "switch") {
    const text = extractSwitchGoalText(userText);
    return {
      kind,
      reason: userText.trim().slice(0, 200),
      nextArguments: {},
      nextFunction: text.slice(0, 200),
      nextGoalText: text,
    };
  }
  return {
    kind: "reveal",
    reason: "补全现行 arguments",
    nextArguments: {},
  };
}

export function buildSupersededCompactHint(goal: SessionGoalState | null): string {
  const superseded = goal?.intent?.superseded ?? [];
  if (superseded.length === 0) return "";
  const tombs = superseded
    .map((s) => JSON.stringify(s.oldArguments))
    .filter((s) => s && s !== "{}");
  if (tombs.length === 0) return "";
  return [
    "【Intent tombstone】以下旧约束已 superseded，摘要中禁止当作现行目标/约束：",
    ...tombs.map((t) => `- ${t}`),
  ].join("\n");
}

/** setGoal 时常 arguments={}；首次 revision 必须把旧 goal 正文钉进 tombstone。 */
function snapshotOldArguments(goal: SessionGoalState): Record<string, unknown> {
  const args = { ...(goal.intent?.arguments ?? {}) };
  if (Object.keys(args).length > 0) return args;
  const text = goal.text.trim();
  return text ? { goal: text } : {};
}

export function assertSummaryOmitsSuperseded(summary: string, goal: SessionGoalState): void {
  const dropped = (goal.intent?.superseded ?? [])
    .flatMap((s) => Object.values(s.oldArguments))
    .map((v) => String(v).trim())
    .filter((v) => v.length >= 1);
  for (const token of dropped) {
    if (token && summary.includes(token)) {
      throw new Error(`compact/摘要把 superseded 约束「${token}」当成了现行内容`);
    }
  }
}

export async function applyIntentFromUserText(args: {
  sessionId: string;
  userText: string;
  config: AppConfig;
  services: ServiceContainer;
}): Promise<SessionGoalState | null> {
  const { readGoalState, writeGoalStateRaw, setSessionGoal } = await import("./goalLoop.js");
  const goal = await readGoalState(args.sessionId);
  if (!goal || (goal.status !== "active" && goal.status !== "paused")) return goal;

  const classified = classifyIntent(args.userText);
  if (classified.kind === "reveal") {
    const next: SessionGoalState = {
      ...goal,
      intent: {
        function: goal.intent?.function ?? goal.text.slice(0, 200),
        arguments: { ...(goal.intent?.arguments ?? {}), ...classified.nextArguments },
        kind: "reveal",
        superseded: goal.intent?.superseded ?? [],
      },
    };
    await writeGoalStateRaw(args.sessionId, next);
    return next;
  }

  if (classified.kind === "revision") {
    const oldArguments = snapshotOldArguments(goal);
    const nextText = applyRevisionToGoalText(goal.text, args.userText);
    const next: SessionGoalState = {
      ...goal,
      text: nextText,
      status: "active",
      pendingContinue: null,
      intent: {
        function: (goal.intent?.function ?? nextText).slice(0, 200),
        arguments: { ...(goal.intent?.arguments ?? {}), ...classified.nextArguments },
        kind: "revision",
        superseded: [
          ...(goal.intent?.superseded ?? []),
          {
            at: new Date().toISOString(),
            oldArguments,
            reason: classified.reason,
          },
        ],
      },
    };
    // 先组好 tombstone 再换叶：摘要系统提示才能带上刚 superseded 的旧约束
    await forkGoalBranchIfNeeded(args, next);
    await writeGoalStateRaw(args.sessionId, next);
    return next;
  }

  // switch：先组 tombstone 再换到 Goal 锚点叶（废枝摘要），再停旧续跑开新 goal
  const oldArguments = snapshotOldArguments(goal);
  const paused: SessionGoalState = {
    ...goal,
    status: "paused",
    pendingContinue: null,
    lastVerdict: { done: true, reason: "switched" },
    intent: {
      function: goal.intent?.function ?? goal.text.slice(0, 200),
      arguments: goal.intent?.arguments ?? {},
      kind: "switch",
      superseded: [
        ...(goal.intent?.superseded ?? []),
        {
          at: new Date().toISOString(),
          oldArguments,
          reason: classified.reason,
        },
      ],
    },
  };
  await forkGoalBranchIfNeeded(args, paused);
  await writeGoalStateRaw(args.sessionId, paused);
  const created = await setSessionGoal({
    services: args.services,
    config: args.config,
    sessionId: args.sessionId,
    text: classified.nextGoalText ?? args.userText,
    mode: goal.mode === "deep_research" || goal.mode === "autonomous" ? "goal" : goal.mode,
  });
  const next: SessionGoalState = {
    ...created,
    intent: {
      function: (classified.nextFunction ?? created.text).slice(0, 200),
      arguments: classified.nextArguments,
      kind: "switch",
      superseded: paused.intent?.superseded ?? [],
    },
  };
  await writeGoalStateRaw(args.sessionId, next, { replaceVerified: true });
  return next;
}

/** revision/switch：从 Goal 设立时的叶分叉，现行路径不再带上旧枝全文 */
export async function forkGoalBranchIfNeeded(
  args: {
    sessionId: string;
    config: AppConfig;
    services: ServiceContainer;
  },
  goal: SessionGoalState,
): Promise<void> {
  const anchor = goal.anchorLeafId;
  if (!anchor || !args.services.prisma) return;
  try {
    const { switchBranch } = await import("./chatTree.js");
    await switchBranch(args.services.prisma, args.config, {
      sessionId: args.sessionId,
      messageId: anchor,
      compactHint: buildSupersededCompactHint(goal),
      notify: false,
    });
  } catch (err) {
    console.warn(
      "[intentContract] forkGoalBranch 失败（Goal 仍写入）:",
      err instanceof Error ? err.message : err,
    );
  }
}
