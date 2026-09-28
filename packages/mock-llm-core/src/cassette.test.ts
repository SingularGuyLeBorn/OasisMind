import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  appendCassette,
  cassetteKey,
  canonicalCassetteRequest,
  findCassette,
  getCassetteMode,
} from "./cassette.js";

describe("cassette", () => {
  afterEach(() => {
    delete process.env.MOCK_LLM_CASSETTE;
    delete process.env.MOCK_LLM_CASSETTE_DIR;
  });

  it("同一请求指纹稳定", () => {
    const req = { protocol: "chat.completions", model: "mock-llm", messages: [{ role: "user", content: "hi" }] };
    const a = cassetteKey(canonicalCassetteRequest(req));
    const b = cassetteKey(canonicalCassetteRequest({ ...req }));
    expect(a).toBe(b);
    expect(a).toMatch(/^cas_[0-9a-f]+$/);
  });

  it("record 后 replay 能按指纹找回", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-cas-"));
    const req = {
      protocol: "chat.completions",
      model: "mock-llm",
      stream: false,
      messages: [{ role: "user", content: "你好" }],
    };
    appendCassette(dir, {
      request: req,
      status: 200,
      json: { ok: true },
      scenario: "greeting",
    });
    const hit = findCassette(dir, req);
    expect(hit?.scenario).toBe("greeting");
    expect(hit?.json).toEqual({ ok: true });
  });

  it("未设 env 时 mode=off", () => {
    expect(getCassetteMode()).toBe("off");
    process.env.MOCK_LLM_CASSETTE = "record";
    expect(getCassetteMode()).toBe("record");
  });
});
