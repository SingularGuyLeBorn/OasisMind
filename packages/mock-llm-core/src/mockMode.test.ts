import { afterEach, describe, expect, it } from "vitest";
import {
  MockLlmInvalidUrlError,
  enterInProcessMockLlm,
  getMockLlmHttpUrl,
  isInProcessMockLlm,
  mockLlmHttpHeaders,
} from "./mockMode.js";

describe("mock LLM 运行模式", () => {
  afterEach(() => {
    delete process.env.MOCK_LLM;
    delete process.env.MOCK_LLM_URL;
    delete process.env.MOCK_LLM_SCENARIO;
    delete process.env.MOCK_LLM_FAIL;
    delete process.env.MOCK_LLM_DELAY_MS;
    delete process.env.MOCK_LLM_STREAM_BREAK;
    delete process.env.MOCK_LLM_REQUEST_ID;
    delete process.env.MOCK_LLM_PROVIDER;
    delete process.env.MOCK_LLM_QUIRK;
    delete process.env.MOCK_LLM_CASSETTE;
    delete process.env.MOCK_LLM_CASSETTE_DIR;
  });

  it("非法 MOCK_LLM_URL 立刻抛错，不装成进程内", () => {
    process.env.MOCK_LLM_URL = "not-a-url";
    expect(() => getMockLlmHttpUrl()).toThrow(MockLlmInvalidUrlError);
  });

  it("enterInProcessMockLlm 清掉残留 HTTP 地址，退出时还原", () => {
    process.env.MOCK_LLM = "false";
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    process.env.MOCK_LLM_SCENARIO = "greeting";
    const restore = enterInProcessMockLlm({ scenario: "eval_judge" });
    expect(isInProcessMockLlm()).toBe(true);
    expect(process.env.MOCK_LLM_URL).toBeUndefined();
    expect(process.env.MOCK_LLM_SCENARIO).toBe("eval_judge");
    restore();
    expect(process.env.MOCK_LLM).toBe("false");
    expect(process.env.MOCK_LLM_URL).toBe("http://127.0.0.1:3999/v1");
    expect(process.env.MOCK_LLM_SCENARIO).toBe("greeting");
  });

  it("mockLlmHttpHeaders 只在 MOCK_LLM_URL 时附带注入，scenario 始终转发", () => {
    process.env.MOCK_LLM_SCENARIO = "web_search";
    process.env.MOCK_LLM_FAIL = "429";
    expect(mockLlmHttpHeaders()).toEqual({ "x-mock-scenario": "web_search" });
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3040/v1";
    process.env.MOCK_LLM_DELAY_MS = "12";
    process.env.MOCK_LLM_STREAM_BREAK = "after-3";
    process.env.MOCK_LLM_REQUEST_ID = "fixed-rid";
    expect(mockLlmHttpHeaders()).toEqual({
      "x-mock-scenario": "web_search",
      "x-mock-fail": "429",
      "x-mock-delay-ms": "12",
      "x-mock-stream-break": "after-3",
      "x-request-id": "fixed-rid",
    });
  });

  it("MOCK_LLM_URL 时转发 MOCK_LLM_PROVIDER / MOCK_LLM_QUIRK", () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3040/v1";
    process.env.MOCK_LLM_PROVIDER = "zhipu";
    process.env.MOCK_LLM_QUIRK = "clean";
    process.env.MOCK_LLM_REQUEST_ID = "rid";
    expect(mockLlmHttpHeaders()["x-mock-provider"]).toBe("zhipu");
    expect(mockLlmHttpHeaders()["x-mock-quirk"]).toBe("clean");
  });

  it("MOCK_LLM_URL 且无 REQUEST_ID 时每次调用生成新的 x-request-id", () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3040/v1";
    const a = mockLlmHttpHeaders()["x-request-id"];
    const b = mockLlmHttpHeaders()["x-request-id"];
    expect(a).toMatch(/^om-req-\d+$/);
    expect(b).toMatch(/^om-req-\d+$/);
    expect(a).not.toBe(b);
  });

  it("MOCK_LLM_REQUEST_ID 空白时回退到自生成 id", () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3040/v1";
    process.env.MOCK_LLM_REQUEST_ID = "  ";
    expect(mockLlmHttpHeaders()["x-request-id"]).toMatch(/^om-req-\d+$/);
  });

  it("enterInProcessMockLlm 清掉注入 env，退出时还原", () => {
    process.env.MOCK_LLM = "true";
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3040/v1";
    process.env.MOCK_LLM_FAIL = "429";
    process.env.MOCK_LLM_REQUEST_ID = "e2e-run";
    const restore = enterInProcessMockLlm({ scenario: "eval_judge" });
    expect(process.env.MOCK_LLM_FAIL).toBeUndefined();
    expect(process.env.MOCK_LLM_REQUEST_ID).toBeUndefined();
    expect(isInProcessMockLlm()).toBe(true);
    restore();
    expect(process.env.MOCK_LLM_FAIL).toBe("429");
    expect(process.env.MOCK_LLM_REQUEST_ID).toBe("e2e-run");
    expect(process.env.MOCK_LLM_URL).toBe("http://127.0.0.1:3040/v1");
  });
});
