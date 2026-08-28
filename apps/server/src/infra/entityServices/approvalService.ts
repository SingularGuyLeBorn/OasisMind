/**
 * Approval 审批 Service（从 services.ts 拆出的叶子）。
 */

import type {
  CreateApprovalInput,
  UpdateApprovalInput,
  ListApprovalsInput,
} from "@oasismind/shared";
import { BaseService, ServiceValidationError } from "../../services.js";
import { failure } from "../../trpc/result.js";
import { notifyApprovalResolved } from "../approvalGate.js";
import { deriveDecisionScope } from "../approvalScope.js";

/** 审批状态转移：终态 executed/rejected 不可回退；禁止 pending 直接 executed。 */
export function isAllowedApprovalStatusTransition(from: string, to: string): boolean {
  if (from === to) return true;
  if (from === "pending" && (to === "approved" || to === "rejected")) return true;
  if (from === "approved" && (to === "executed" || to === "rejected")) return true;
  if (from === "user_replied" && to === "executed") return true;
  return false;
}

export class ApprovalService extends BaseService<CreateApprovalInput, UpdateApprovalInput, ListApprovalsInput, any> {
  readonly entityName = "approval";
  protected get delegate() { return this.prisma.approval; }
  protected formatEntity(raw: any) { return raw; }
  protected buildListWhere(input: ListApprovalsInput) {
    const where: any = {};
    if (input.status) where.status = input.status;
    return where;
  }
  protected buildCreateData(input: CreateApprovalInput) {
    // W3：服务端派生 decisionScope（LLM/客户端不可传业务语义；已有则保留）
    const args =
      input.args && typeof input.args === "object" && !Array.isArray(input.args)
        ? (input.args as Record<string, unknown>)
        : {};
    const decisionScope =
      typeof input.decisionScope === "string" && input.decisionScope.trim()
        ? input.decisionScope.trim()
        : deriveDecisionScope(input.toolName, args);
    return { ...input, decisionScope };
  }
  protected buildUpdateData(input: UpdateApprovalInput) {
    const { id: _id, rememberScope: _remember, ...data } = input;
    // 审批决策审计：进入决策终态（approved/rejected）时统一盖决策者与时间戳。
    // 当前单用户本地场景固定 "local-user"（AUTH_MODE=password 亦为同一本地账户）。
    if (input.status === "approved" || input.status === "rejected") {
      return { ...data, decidedBy: "local-user", decidedAt: new Date() };
    }
    if (input.status === "executed") {
      return { ...data, executedAt: new Date() };
    }
    return data;
  }

  protected override async validateUpdate(input: UpdateApprovalInput, existing: any): Promise<void> {
    if (!input.status) return;
    if (!isAllowedApprovalStatusTransition(String(existing.status), input.status)) {
      throw new ServiceValidationError(
        failure({
          code: "APPROVAL_ILLEGAL_TRANSITION",
          message: `审批状态不能从 ${existing.status} 改为 ${input.status}`,
          suggestion: "pending 只能批/拒；approved 只能执行或改拒；已执行/已拒绝不可回退。",
          retryable: false,
          operation: "update",
          entity: this.entityName,
        }),
      );
    }
  }

  /**
   * W11：人工拒绝是审批决策点——发 approval_resolved 显式事件，
   * 唤醒挂在该审批上的 run（awaiting_human → llm，注入拒绝消息让 LLM 收尾）。
   * approved 不在此发：执行完成（executeApprovedOperation）才发，携带执行结果。
   */
  protected override async afterCreate(entity: any, input: CreateApprovalInput): Promise<void> {
    await super.afterCreate(entity, input);
    const { notifyApprovalUpdated } = await import("../uiStateNotify.js");
    await notifyApprovalUpdated(this.prisma, entity.id, entity.status);
  }

  protected override async afterUpdate(entity: any, existing: any, input: UpdateApprovalInput): Promise<void> {
    await super.afterUpdate(entity, existing, input);
    if (input.status === "rejected") {
      notifyApprovalResolved(entity.id, {
        outcome: "rejected",
        approvalId: entity.id,
        toolName: entity.toolName ?? "unknown",
      });
    }
    const { notifyApprovalUpdated } = await import("../uiStateNotify.js");
    await notifyApprovalUpdated(this.prisma, entity.id, entity.status);
  }
}
