/**
 * Run 执行记录 Service（从 services.ts 拆出的叶子）。
 */

import type { CreateRunInput, UpdateRunInput, ListRunsInput } from "@oasismind/shared";
import { BaseService, ServiceValidationError } from "../../services.js";
import { failure } from "../../trpc/result.js";

/** 同一 Run 行不可从终态假装续跑；interrupted 只能留在本行，新任务走新 Run。 */
export function isAllowedRunStatusTransition(from: string, to: string): boolean {
  if (from === to) return true;
  if (from === "pending" && (to === "running" || to === "cancelled" || to === "failed")) return true;
  if (
    from === "running" &&
    (to === "success" || to === "failed" || to === "cancelled" || to === "interrupted")
  ) {
    return true;
  }
  return false;
}

export class RunService extends BaseService<CreateRunInput, UpdateRunInput, ListRunsInput, any> {
  readonly entityName = "run";
  protected get delegate() {
    return this.prisma.run;
  }
  protected formatEntity(raw: any) {
    return raw;
  }
  protected buildListWhere(input: ListRunsInput) {
    const where: any = {};
    if (input.agentId) where.agentId = input.agentId;
    if (input.sessionId) where.sessionId = input.sessionId;
    if (input.status) where.status = input.status;
    return where;
  }
  protected buildCreateData(input: CreateRunInput) {
    return input;
  }
  protected buildUpdateData(input: UpdateRunInput) {
    const { id: _id, ...data } = input;
    return data;
  }

  protected override async validateUpdate(input: UpdateRunInput, existing: any): Promise<void> {
    if (!input.status) return;
    if (!isAllowedRunStatusTransition(String(existing.status), input.status)) {
      throw new ServiceValidationError(
        failure({
          code: "RUN_ILLEGAL_TRANSITION",
          message: `Run 状态不能从 ${existing.status} 改为 ${input.status}`,
          suggestion: "终态（成功/失败/取消/已中断）不可回退；重启中断后请新开一轮，不要在本行上假装续跑。",
          retryable: false,
          operation: "update",
          entity: this.entityName,
        }),
      );
    }
  }

  protected override async afterCreate(entity: any, input: CreateRunInput): Promise<void> {
    await super.afterCreate(entity, input);
    await this.pushRunUi(entity);
  }

  protected override async afterUpdate(entity: any, existing: any, input: UpdateRunInput): Promise<void> {
    await super.afterUpdate(entity, existing, input);
    await this.pushRunUi(entity);
  }

  private async pushRunUi(entity: { id: string; sessionId?: string | null; status?: string; output?: unknown }): Promise<void> {
    try {
      const { notifyRunUpdated } = await import("../uiStateNotify.js");
      const phase =
        entity.output && typeof entity.output === "object" && entity.output !== null && "phase" in entity.output
          ? String((entity.output as { phase?: unknown }).phase ?? "")
          : undefined;
      await notifyRunUpdated(this.prisma, {
        runId: entity.id,
        sessionId: entity.sessionId,
        status: entity.status,
        phase: phase || undefined,
      });
    } catch {
      /* PUSH 失败不回滚已写库 */
    }
  }

  // Runs 列表保留 output（phase/blockedScopes）；input/toolCalls/error 裁剪
  protected override getListSelect(): any {
    return {
      id: true,
      agentId: true,
      sessionId: true,
      status: true,
      durationMs: true,
      toolCallCount: true,
      tokenUsage: true,
      output: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
