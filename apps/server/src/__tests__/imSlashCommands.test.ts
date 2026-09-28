import { describe, expect, it } from "vitest";
import { parseImSlashCommand } from "../infra/imSlashCommands.js";

describe("parseImSlashCommand", () => {
  it("识别核心指令", () => {
    expect(parseImSlashCommand("/help")).toEqual({ type: "help" });
    expect(parseImSlashCommand("/帮助")).toEqual({ type: "help" });
    expect(parseImSlashCommand("/ping")).toEqual({ type: "ping" });
    expect(parseImSlashCommand("/status")).toEqual({ type: "status" });
    expect(parseImSlashCommand("/where")).toEqual({ type: "where" });
    expect(parseImSlashCommand("/id")).toEqual({ type: "id" });
    expect(parseImSlashCommand("/stop")).toEqual({ type: "stop" });
    expect(parseImSlashCommand("/cancel")).toEqual({ type: "stop" });
    expect(parseImSlashCommand("/clear")).toEqual({ type: "clear" });
    expect(parseImSlashCommand("/new 写周报")).toEqual({ type: "new", topicLabel: "写周报" });
    expect(parseImSlashCommand("新话题")).toEqual({ type: "new", topicLabel: "" });
    expect(parseImSlashCommand("/queue")).toEqual({ type: "queue", action: "list" });
    expect(parseImSlashCommand("/queue clear")).toEqual({ type: "queue", action: "clear" });
    expect(parseImSlashCommand("/flush")).toEqual({ type: "queue", action: "clear" });
  });

  it("普通聊天不误伤", () => {
    expect(parseImSlashCommand("帮我 stop 一下进程")).toEqual({ type: "none" });
    expect(parseImSlashCommand("状态怎么样")).toEqual({ type: "none" });
  });
});
