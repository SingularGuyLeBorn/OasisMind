import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createMockLlmApp } from "./index.js";

function listen(): Promise<{ server: Server; url: string }> {
  const app = createMockLlmApp();
  const server = app.listen(0, "127.0.0.1");
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => {
      const port = (server.address() as AddressInfo).port;
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

describe("mock-llm HTTP OpenAI 协议", () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const started = await listen();
    server = started.server;
    url = started.url;
  });

  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()));
  });

  it("GET /health 与 /v1/models", async () => {
    const health = await fetch(`${url}/health`).then((r) => r.json());
    expect(health.status).toBe("ok");
    expect(health.scenarios).toBeGreaterThan(10);
    expect(typeof health.uptimeMs).toBe("number");
    expect(typeof health.pid).toBe("number");
    const models = await fetch(`${url}/v1/models`).then((r) => r.json());
    expect(models.data.some((m: { id: string }) => m.id === "mock-llm")).toBe(true);
  });

  it("非流式 completions 走 greeting，带回匹配 header", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "user", content: "你好" }],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("greeting");
    const body = await res.json();
    expect(body.object).toBe("chat.completion");
    expect(body.choices[0].message.content).toContain("Mock LLM");
    expect(body.choices[0].finish_reason).toBe("stop");
  });

  it("分支摘要提示词命中 branch_summary，不落 greeting", async () => {
    const { MOCK_BRANCH_SUMMARY_BODY } = await import("@oasismind/mock-llm-core");
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "你是 OasisMind 分支摘要助手。将以下被放弃的对话分支压缩为简洁中文摘要" },
          { role: "user", content: "请摘要以下被切换离开的对话分支：\n\n[助手]\nA2-fork" },
        ],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("branch_summary");
    const body = await res.json();
    expect(body.choices[0].message.content).toBe(MOCK_BRANCH_SUMMARY_BODY);
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].scenario).toBe("branch_summary");
    expect(ring.hits[0].lastSystemText).toContain("OasisMind 分支摘要助手");
    expect(ring.hits[0].lastUserText).toContain("请摘要以下被切换离开的对话分支");
    expect(ring.hits[0].transcriptText).toContain("OasisMind 分支摘要助手");
    expect(ring.hits[0].transcriptText).toContain("[助手]\nA2-fork");
  });

  it("被放弃正文带 FAIL token 时 HTTP 返回错误而不是问候", async () => {
    const { MOCK_BRANCH_SUMMARY_FAIL_TOKEN } = await import("@oasismind/mock-llm-core");
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "你是 OasisMind 分支摘要助手。" },
          {
            role: "user",
            content: `请摘要以下被切换离开的对话分支：\n\n[助手]\n${MOCK_BRANCH_SUMMARY_FAIL_TOKEN}`,
          },
        ],
      }),
    });
    expect(res.ok).toBe(false);
    expect(res.headers.get("x-mock-matched-scenario")).toBe("branch_summary");
  });

  it("流式 SSE 是 data: 行并以 data: [DONE] 结束，无自定义 event 名", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mock-llm",
        stream: true,
        messages: [{ role: "user", content: "你好" }],
      }),
    });
    const text = await res.text();
    expect(text).toContain("data: ");
    expect(text).toContain("data: [DONE]");
    expect(text.includes("event: chat.completion.chunk")).toBe(false);
    expect(text.includes('data: "[DONE]"')).toBe(false);
    const payloads = text
      .split("\n")
      .filter((l) => l.startsWith("data:") && !l.includes("[DONE]"))
      .map((l) => JSON.parse(l.slice(5).trim()));
    const content = payloads
      .map((p) => p.choices?.[0]?.delta?.content ?? "")
      .join("");
    expect(content).toContain("Mock LLM");
  });

  it("工具调用 delta 带 index，可按 OpenAI 规则拼接 arguments", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mock-llm",
        stream: true,
        messages: [{ role: "user", content: "请搜索 OasisMind" }],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
      }),
    });
    const text = await res.text();
    expect(res.headers.get("x-mock-matched-scenario")).toBe("web_search");
    const acc = new Map<number, { id: string; name: string; arguments: string }>();
    for (const line of text.split("\n")) {
      if (!line.startsWith("data:") || line.includes("[DONE]")) continue;
      const parsed = JSON.parse(line.slice(5).trim()) as {
        choices?: Array<{
          delta?: {
            tool_calls?: Array<{
              index: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }>;
          };
        }>;
      };
      for (const tc of parsed.choices?.[0]?.delta?.tool_calls ?? []) {
        const cur = acc.get(tc.index) ?? { id: "", name: "", arguments: "" };
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.name += tc.function.name;
        if (tc.function?.arguments) cur.arguments += tc.function.arguments;
        acc.set(tc.index, cur);
      }
    }
    expect(acc.get(0)?.name).toBe("web_search");
    expect(acc.get(0)?.arguments).toBeTruthy();
  });

  it("未知 x-mock-scenario → 400", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-scenario": "no_such" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("unknown_mock_scenario");
  });

  it("x-mock-fail=429 注入限流", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-fail": "429" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(429);
  });

  it("POST /v1/responses 非流式拆 output items", async () => {
    const res = await fetch(`${url}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mock-llm", input: "你好" }),
    });
    const body = await res.json();
    expect(body.object).toBe("response");
    expect(body.status).toBe("completed");
    expect(body.output.some((o: { type: string }) => o.type === "message")).toBe(true);
  });

  it("缺少 messages → 400", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mock-llm" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.type).toBe("invalid_request_error");
  });

  it("?scenario= 与 header 一样能强制场景", async () => {
    const res = await fetch(`${url}/v1/chat/completions?scenario=greeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "这段话本来会进目录而不是问候" }],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("greeting");
  });

  it("429 带 Retry-After", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-fail": "429" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("1");
  });

  it("429 注入记入 hits 环并带回 hit-id", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-fail": "429" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(429);
    const hitId = res.headers.get("x-mock-hit-id");
    expect(hitId).toMatch(/^hit_\d+$/);
    expect(res.headers.get("x-mock-matched-scenario")).toBe("fail:429");
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].id).toBe(hitId);
    expect(ring.hits[0].scenario).toBe("fail:429");
    expect(ring.hits[0].status).toBe(429);
  });

  it("GET /v1/models/:id 与 /debug/hits", async () => {
    const model = await fetch(`${url}/v1/models/mock-llm`).then((r) => r.json());
    expect(model.id).toBe("mock-llm");
    const missing = await fetch(`${url}/v1/models/no-such`);
    expect(missing.status).toBe(404);
    await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    });
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].scenario).toBe("greeting");
    expect(ring.hits[0].id).toMatch(/^hit_\d+$/);
    expect(typeof ring.hits[0].ms).toBe("number");
    expect(ring.hits[0].finishReason).toBe("stop");
    expect(ring.hits[0].status).toBe(200);
  });

  it("成功响应带 x-mock-hit-id，与 hits 环同一 id", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    });
    const hitId = res.headers.get("x-mock-hit-id");
    expect(hitId).toMatch(/^hit_\d+$/);
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].id).toBe(hitId);
  });

  it("n≠1 或 tools 非数组 → 400", async () => {
    const nRes = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n: 2, messages: [{ role: "user", content: "hi" }] }),
    });
    expect(nRes.status).toBe(400);
    const toolsRes = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools: "web_search", messages: [{ role: "user", content: "hi" }] }),
    });
    expect(toolsRes.status).toBe(400);
  });

  it("非法 JSON → 400 且 hits 记 invalid:json", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-request-id": "req-json" },
      body: "{",
    });
    expect(res.status).toBe(400);
    const hitId = res.headers.get("x-mock-hit-id");
    expect(hitId).toMatch(/^hit_\d+$/);
    expect(res.headers.get("x-mock-matched-scenario")).toBe("invalid:json");
    expect(res.headers.get("x-request-id")).toBe("req-json");
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].id).toBe(hitId);
    expect(ring.hits[0].scenario).toBe("invalid:json");
    expect(ring.hits[0].status).toBe(400);
    expect(ring.hits[0].requestId).toBe("req-json");
  });

  it("未知路径 JSON 404", async () => {
    const res = await fetch(`${url}/no-such`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("not_found");
  });

  it("tool_choice=none 不返回 tool_calls", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "请搜索 OasisMind" }],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
        tool_choice: "none",
      }),
    });
    const body = await res.json();
    expect(body.choices[0].finish_reason).toBe("stop");
    expect(body.choices[0].message.tool_calls).toBeUndefined();
  });

  it("tool_choice=required 在问候场景也补一次工具", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "你好" }],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
        tool_choice: "required",
      }),
    });
    const body = await res.json();
    expect(body.choices[0].finish_reason).toBe("tool_calls");
    expect(body.choices[0].message.tool_calls[0].function.name).toBe("web_search");
  });

  it("具名 tool_choice 覆盖场景想调的工具", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "请搜索 OasisMind" }],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
          {
            type: "function",
            function: { name: "read_article", description: "read", parameters: { type: "object" } },
          },
        ],
        tool_choice: { type: "function", function: { name: "read_article" } },
      }),
    });
    const body = await res.json();
    expect(body.choices[0].message.tool_calls).toHaveLength(1);
    expect(body.choices[0].message.tool_calls[0].function.name).toBe("read_article");
  });

  it("缺 role 的 message / 非法 delay 不炸", async () => {
    const bad = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ content: "hi" }] }),
    });
    expect(bad.status).toBe(400);
    const delay = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-delay-ms": "nope" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    });
    expect(delay.status).toBe(200);
    expect(delay.headers.get("x-mock-matched-scenario")).toBe("greeting");
  });

  it("GET /debug/scenarios 标出 catchAll", async () => {
    const body = await fetch(`${url}/debug/scenarios`).then((r) => r.json());
    expect(body.catchAll).toContain("greeting");
    expect(body.catchAll).toContain("reply_catalog");
    expect(body.scenarios).toContain("web_search");
    expect(body.customStream).toContain("stop_slow_stream");
    expect(body.items[0].name).toBe(body.scenarios[0]);
    expect(typeof body.items[0].index).toBe("number");
  });

  it("GET 生成接口返回 405", async () => {
    const res = await fetch(`${url}/v1/chat/completions`);
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    const body = await res.json();
    expect(body.error.code).toBe("method_not_allowed");
    const embeddings = await fetch(`${url}/v1/embeddings`);
    expect(embeddings.status).toBe(405);
    expect(embeddings.headers.get("allow")).toBe("POST");
  });

  it("POST /v1/responses 缺 input → 400", async () => {
    const res = await fetch(`${url}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mock-llm" }),
    });
    expect(res.status).toBe(400);
  });

  it("流式首帧带 role=assistant；/v1/responses 流式有 output_text.delta", async () => {
    const chat = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: true,
        messages: [{ role: "user", content: "你好" }],
      }),
    }).then((r) => r.text());
    const first = chat
      .split("\n")
      .find((l) => l.startsWith("data:") && !l.includes("[DONE]"));
    expect(first).toContain('"role":"assistant"');

    const resp = await fetch(`${url}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stream: true, input: "你好" }),
    }).then((r) => r.text());
    expect(resp).toContain("event: response.created");
    expect(resp).toContain("event: response.in_progress");
    expect(resp).toContain("event: response.output_text.delta");
    expect(resp).toContain("event: response.output_item.added");
    expect(resp).toContain("event: response.output_item.done");
    expect(resp).toContain("event: response.completed");
  });

  it("客户端 abort 慢流不会把连接挂死", async () => {
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 15);
    await expect(
      fetch(`${url}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mock-scenario": "stop_slow_stream" },
        body: JSON.stringify({
          stream: true,
          messages: [{ role: "user", content: "请慢慢说" }],
        }),
        signal: ac.signal,
      }).then((r) => r.text()),
    ).rejects.toThrow();
  });

  it("tools 缺 function.name → 400", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hi" }],
        tools: [{ type: "function" }],
      }),
    });
    expect(res.status).toBe(400);
  });

  it("Responses 多轮 function_call_output 走 web_search_final 而不是再搜一次", async () => {
    const res = await fetch(`${url}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: [
          { type: "message", role: "user", content: "请搜索 OasisMind" },
          {
            type: "function_call",
            call_id: "c1",
            name: "web_search",
            arguments: '{"query":"OasisMind"}',
          },
          { type: "function_call_output", call_id: "c1", output: "found oasis" },
        ],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("web_search_final");
    const body = await res.json();
    expect(body.output.some((o: { type: string }) => o.type === "function_call")).toBe(false);
    expect(JSON.stringify(body)).toContain("已完成 web_search");
  });

  it("stream_options.include_usage=false 时 finish 帧无 usage", async () => {
    const text = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: true,
        stream_options: { include_usage: false },
        messages: [{ role: "user", content: "你好" }],
      }),
    }).then((r) => r.text());
    expect(text).not.toContain("prompt_tokens");
  });

  it("Responses 顶层 name 的 tools 也能命中 web_search", async () => {
    const res = await fetch(`${url}/v1/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: "请搜索 OasisMind",
        tools: [{ type: "function", name: "web_search", parameters: { type: "object" } }],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("web_search");
    const body = await res.json();
    expect(body.output.some((o: { type: string; name?: string }) => o.type === "function_call" && o.name === "web_search")).toBe(
      true,
    );
  });

  it("未知 scenario 记入 hits 且 status=400", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-scenario": "no_such", "x-request-id": "req-abc" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("x-request-id")).toBe("req-abc");
    expect(res.headers.get("x-mock-hit-id")).toMatch(/^hit_\d+$/);
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].scenario).toBe("no_such");
    expect(ring.hits[0].status).toBe(400);
    expect(ring.hits[0].requestId).toBe("req-abc");
  });

  it("斜杠模型 id 能 GET /v1/models/:provider/:model", async () => {
    const chat = await fetch(`${url}/v1/models/deepseek-chat`);
    expect(chat.status).toBe(200);
    expect((await chat.json()).id).toBe("deepseek-chat");
    const local = await fetch(`${url}/v1/models/ollama/llama3.2`);
    expect(local.status).toBe(200);
    expect((await local.json()).id).toBe("ollama/llama3.2");
  });

  it("POST /debug/reset 清空 hits 环", async () => {
    await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    });
    const reset = await fetch(`${url}/debug/reset`, { method: "POST" }).then((r) => r.json());
    expect(reset.ok).toBe(true);
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits).toEqual([]);
  });

  it("GET /debug/reset 返回 405", async () => {
    const res = await fetch(`${url}/debug/reset`);
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    const body = await res.json();
    expect(body.error.code).toBe("method_not_allowed");
  });

  it("x-mock-fail=timeout 刷出 hit-id 头", async () => {
    const ac = new AbortController();
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-fail": "timeout" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      signal: ac.signal,
    });
    expect(res.headers.get("x-mock-hit-id")).toMatch(/^hit_\d+$/);
    expect(res.headers.get("x-mock-matched-scenario")).toBe("fail:timeout");
    ac.abort();
  });

  it("POST /v1/embeddings 返回空向量桩", async () => {
    const res = await fetch(`${url}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: ["a", "b"] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.object).toBe("list");
    expect(body.model).toBe("text-embedding-3-small");
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toEqual({ object: "embedding", index: 0, embedding: [0] });
    expect(body.data[1]).toEqual({ object: "embedding", index: 1, embedding: [0] });
    expect(body.usage).toEqual({ prompt_tokens: 0, total_tokens: 0 });
    const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
    expect(ring.hits[0].scenario).toBe("embeddings");
    expect(ring.hits[0].status).toBe(200);
  });

  it("校验失败 400 也进 hits 环并带回 hit-id", async () => {
    const cases: Array<{ scenario: string; body: Record<string, unknown> }> = [
      { scenario: "invalid:messages", body: { model: "mock-llm" } },
      { scenario: "invalid:n", body: { n: 2, messages: [{ role: "user", content: "hi" }] } },
      { scenario: "invalid:tools", body: { tools: "web_search", messages: [{ role: "user", content: "hi" }] } },
      { scenario: "invalid:tool_choice", body: { tool_choice: 3, messages: [{ role: "user", content: "hi" }] } },
    ];
    for (const c of cases) {
      const res = await fetch(`${url}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c.body),
      });
      expect(res.status).toBe(400);
      const hitId = res.headers.get("x-mock-hit-id");
      expect(hitId).toMatch(/^hit_\d+$/);
      expect(res.headers.get("x-mock-matched-scenario")).toBe(c.scenario);
      const ring = await fetch(`${url}/debug/hits`).then((r) => r.json());
      expect(ring.hits[0].id).toBe(hitId);
      expect(ring.hits[0].scenario).toBe(c.scenario);
      expect(ring.hits[0].status).toBe(400);
    }
  });

  it("按 model 回显 x-mock-provider，智谱 overflow 用中文超限体", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-fail": "overflow" },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("x-mock-provider")).toBe("zhipu");
    const body = await res.json();
    expect(JSON.stringify(body)).toMatch(/上下文/);
  });

  it("x-mock-provider 覆盖 model 推断", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-fail": "429",
        "x-mock-provider": "anthropic",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("x-mock-provider")).toBe("anthropic");
    const body = await res.json();
    expect(body.type).toBe("error");
    expect(body.error.type).toBe("rate_limit_error");
  });

  it("DeepSeek 工具流默认泄漏 DSML；x-mock-quirk=clean 关闭", async () => {
    const payload = {
      model: "deepseek-v4-flash",
      stream: true,
      messages: [{ role: "user", content: "请搜索 OasisMind" }],
      tools: [
        {
          type: "function",
          function: { name: "web_search", description: "search", parameters: { type: "object" } },
        },
      ],
    };
    const leaked = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.text());
    expect(leaked).toMatch(/DSML/);
    const clean = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-quirk": "clean" },
      body: JSON.stringify(payload),
    }).then((r) => r.text());
    expect(clean).not.toMatch(/DSML/);
  });

  it("DeepSeek 非流式工具回合 content 含 DSML，usage 带 cache 字段", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "user", content: "请搜索 OasisMind" }],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
      }),
    });
    expect(res.headers.get("x-mock-provider")).toBe("deepseek");
    expect(res.headers.get("ds-request-id")).toBeTruthy();
    const body = await res.json();
    expect(body.choices[0].message.content).toContain("DSML");
    expect(body.choices[0].message.tool_calls[0].function.name).toBe("web_search");
    expect(body.system_fingerprint).toBeNull();
    expect(body.usage.prompt_cache_miss_tokens).toBe(body.usage.prompt_tokens);
  });

  it("POST /debug/resolve 返回赢家与全部命中", async () => {
    const res = await fetch(`${url}/debug/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    });
    const body = await res.json();
    expect(body.winner).toBe("greeting");
    expect(body.matches.some((m: { name: string }) => m.name === "greeting")).toBe(true);
  });

  it("GET /debug/coverage 金表全绿", async () => {
    const body = await fetch(`${url}/debug/coverage`).then((r) => r.json());
    expect(body.ok).toBe(true);
    expect(body.rows.length).toBeGreaterThan(10);
  });

  it("你好 + 工具结果走 tool_followup 不是问候", async () => {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "你好" },
          { role: "tool", name: "web_search", content: "ok" },
        ],
        tools: [
          {
            type: "function",
            function: { name: "web_search", description: "search", parameters: { type: "object" } },
          },
        ],
      }),
    });
    expect(res.headers.get("x-mock-matched-scenario")).toBe("tool_followup");
    const body = await res.json();
    expect(body.choices[0].message.content).toContain("已根据工具结果继续处理");
    expect(body.choices[0].message.content).not.toContain("你好！我是 Mock LLM");
  });

  it("cassette record 后再 replay 同一请求", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-cas-http-"));
    process.env.MOCK_LLM_CASSETTE = "record";
    process.env.MOCK_LLM_CASSETTE_DIR = dir;
    const payload = {
      model: "mock-llm",
      messages: [{ role: "user", content: "这段话本来会进目录而不是问候" }],
    };
    const recorded = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    process.env.MOCK_LLM_CASSETTE = "replay";
    const replay = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(replay.headers.get("x-mock-cassette")).toBeTruthy();
    const body = await replay.json();
    expect(body.choices[0].message.content).toBe(recorded.choices[0].message.content);
    delete process.env.MOCK_LLM_CASSETTE;
    delete process.env.MOCK_LLM_CASSETTE_DIR;
  });
});
