/**
 * 换叶世代：view/prefetch 若在换叶前发出，返回后不得覆盖活跃路径。
 * 与 reducer 的 droppedOffPath 互补（那边挡住换叶后的陈旧快照）。
 */

const epochs = new Map<string, number>();

export function bumpSessionMessageHydrateEpoch(sessionId: string): number {
  const next = (epochs.get(sessionId) ?? 0) + 1;
  epochs.set(sessionId, next);
  return next;
}

export function getSessionMessageHydrateEpoch(sessionId: string): number {
  return epochs.get(sessionId) ?? 0;
}

export function resetSessionMessageHydrateEpochForTests(): void {
  epochs.clear();
}
