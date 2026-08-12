/**
 * Comment 文章轻留言 Service（仅 DB，不落 Markdown）。
 */

import type {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsInput,
  Comment,
} from "@knowpilot/shared";
import { BaseService, ServiceValidationError } from "../../services.js";
import { failure } from "../../trpc/result.js";

export class CommentService extends BaseService<
  CreateCommentInput,
  UpdateCommentInput & { id: string },
  ListCommentsInput,
  Comment
> {
  readonly entityName = "comment";
  protected get delegate() {
    return this.prisma.comment;
  }

  protected formatEntity(raw: any): Comment {
    return {
      id: raw.id,
      postId: raw.postId,
      authorName: raw.authorName,
      content: raw.content,
      status: raw.status === "hidden" ? "hidden" : "approved",
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  protected buildListWhere(input: ListCommentsInput) {
    const where: Record<string, unknown> = {};
    if (input.postId) where.postId = input.postId;
    if (input.status) where.status = input.status;
    return where;
  }

  protected buildCreateData(input: CreateCommentInput) {
    return {
      postId: input.postId,
      authorName: input.authorName.trim(),
      content: input.content.trim(),
      status: "approved",
    };
  }

  protected buildUpdateData(input: UpdateCommentInput & { id: string }) {
    const { id: _id, ...data } = input;
    return data;
  }

  protected override async validateCreate(input: CreateCommentInput): Promise<void> {
    const post = await this.prisma.post.findFirst({
      where: { id: input.postId, deletedAt: null },
      select: { id: true, published: true },
    });
    if (!post) {
      throw new ServiceValidationError(
        failure({
          code: "COMMENT_POST_NOT_FOUND",
          message: "文章不存在，无法留言",
          suggestion: "请确认文章仍存在且未被删除。",
          retryable: false,
          operation: "create",
          entity: this.entityName,
        }),
      );
    }
    if (!post.published) {
      throw new ServiceValidationError(
        failure({
          code: "COMMENT_POST_UNPUBLISHED",
          message: "仅已发布文章可留言",
          suggestion: "请先发布文章，或在访客博客中打开已发布文章再留言。",
          retryable: false,
          operation: "create",
          entity: this.entityName,
        }),
      );
    }
  }

  /** 访客可见：仅 approved */
  async listForPost(postId: string, page = 1, pageSize = 50) {
    return this.list({ page, pageSize, postId, status: "approved" });
  }

  async hide(id: string) {
    return this.update({ id, status: "hidden" });
  }
}
