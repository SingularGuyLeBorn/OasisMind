import { describe, expect, it } from "vitest";
import { messageUpsertPayload } from "../infra/entityServices/messageService.js";

describe("messageUpsertPayload", () => {
  it("带上 finishReason，停止后前端才能画「已停止生成」", () => {
    const payload = messageUpsertPayload({
      id: "cabcdefghijklmnopqrstuvwx",
      role: "assistant",
      content: "半截",
      createdAt: new Date("2026-08-28T00:00:00.000Z"),
      finishReason: "aborted",
    });
    expect(payload.finishReason).toBe("aborted");
  });
});
