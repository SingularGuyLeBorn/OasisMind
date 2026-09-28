/**
 * 进程内 mock-llm 命中环。单测断言「真打了哪条场景 / 系统提示」时用，禁止 spy llmClient。
 */

const HIT_RING = 32;

export type InProcessMockHit = {
  scenario: string;
  lastUserText: string;
  lastSystemText: string;
  transcriptText: string;
  status: number;
  finishReason?: string | null;
  requestId?: string;
  provider?: string;
  model?: string;
  stream: boolean;
  tools: string[];
};

const hits: InProcessMockHit[] = [];

export function resetInProcessMockHits(): void {
  hits.length = 0;
}

export function getInProcessMockHits(): InProcessMockHit[] {
  return hits.slice();
}

export function recordInProcessMockHit(hit: InProcessMockHit): void {
  hits.unshift(hit);
  if (hits.length > HIT_RING) hits.length = HIT_RING;
}
