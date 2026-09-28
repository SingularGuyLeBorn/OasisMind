import { describe, expect, it } from "vitest";
import {
  formatToolErrorHint,
  formatToolResultHint,
  formatToolTimingHint,
  isToolResultFailed,
  parseApprovalPending,
} from "../toolResultHint.js";

describe("formatToolTimingHint", () => {
  it("web_search 摘要", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 120,
      engine: "tavily",
      enginesAttempted: ["bing_crawler", "tavily"],
      searchPhase: "smart-search",
      query: "test",
      total: 3,
    });
    expect(hint).toContain("120ms");
    expect(hint).toContain("tavily");
    expect(hint).toContain("bing_crawler→tavily");
  });

  it("web_search 信息源 scoped 摘要", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 200,
      provider: "tavily",
      searchPhase: "infoSource-scoped",
      infoSourcesUsed: [{ name: "DeepSeek 官方" }, { name: "掘金" }],
      total: 2,
    });
    expect(hint).toContain("2 信息源");
    expect(hint).toContain("infoSource-scoped");
  });

  it("错误结果生成失败摘要", () => {
    expect(formatToolErrorHint({ error: "url 不能为空", elapsedMs: 5 })).toContain("失败");
    expect(formatToolTimingHint({ error: "fail" })).toBeNull();
  });

  it("formatToolResultHint 成功与失败", () => {
    expect(formatToolResultHint({ elapsedMs: 10, engine: "tavily" })).toContain("10ms");
    expect(formatToolResultHint({ error: "timeout" })).toContain("失败");
  });

  it("审批挂起不是失败摘要", () => {
    expect(
      parseApprovalPending({
        error: "需要人工审批",
        approvalPending: { approvalId: "appr_1", toolName: "memory_create" },
      })?.approvalId,
    ).toBe("appr_1");
    expect(
      formatToolResultHint({
        error: "需要人工审批",
        approvalPending: { approvalId: "appr_1", toolName: "memory_create" },
      }),
    ).toBe("待审批");
  });

  it("todo_write 结果优先用 summary", () => {
    expect(
      formatToolResultHint({
        summary: "待办 3项 · 1进行中 · 1完成",
        total: 3,
        todos: [],
      }),
    ).toBe("待办 3项 · 1进行中 · 1完成");
  });

  it("压缩卡摘要是「全文已存」，零命中不展示", () => {
    expect(
      formatToolResultHint({
        offloaded: true,
        path: "data/tool-results/s/c.json",
        originalChars: 12000,
        hitCount: 2,
      }),
    ).toBe("全文已存 · 12000 字 · 2 处关键词");
    expect(
      formatToolResultHint({
        offloaded: true,
        path: "data/tool-results/s/c.json",
        originalChars: 5642,
        hitCount: 0,
        metadata: { title: "自注意力机制" },
      }),
    ).toBe("全文已存 · 5642 字 · 自注意力机制");
  });

  it("未压缩的写盘注解不当成「已落盘」，列表结果走条数", () => {
    expect(
      formatToolResultHint({
        _om_persisted: true,
        _om_result_path: "data/tool-results/s/c.json",
        _om_original_chars: 80,
      }),
    ).toBeNull();
    expect(
      formatToolResultHint({
        _om_persisted: true,
        _om_result_path: "data/tool-results/s/c.json",
        _om_original_chars: 1904,
        total: 61,
        page: 1,
        items: [{ id: "1" }],
      }),
    ).toBe("61 条");
    expect(
      formatToolResultHint({
        items: [{ jobId: "j1", status: "completed" }],
      }),
    ).toBe("1 个任务");
  });

  it("read_article 摘要含平台、作者与方法", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 890,
      platform: "jianshu",
      author: "老吴学技术",
      method: "jianshu-mobile",
      contentChars: 8502,
    });
    expect(hint).toContain("890ms");
    expect(hint).toContain("jianshu");
    expect(hint).toContain("老吴学技术");
    expect(hint).toContain("jianshu-mobile");
    expect(hint).toContain("8502 字");
  });

  it("read_article 摘要含平台与方法（无作者）", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 890,
      platform: "juejin",
      method: "http",
      contentChars: 4200,
      contentTruncated: true,
    });
    expect(hint).toContain("890ms");
    expect(hint).toContain("juejin");
    expect(hint).toContain("http");
    expect(hint).toContain("4200 字");
    expect(hint).toContain("已截断");
  });

  it("read_article 短正文 warning 与 suggestedTool", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 500,
      platform: "bilibili",
      contentChars: 120,
      contentWarning: "正文较短",
      suggestedTool: "scrape_web_page",
    });
    expect(hint).toContain("120 字");
    expect(hint).toContain("正文较短");
    expect(hint).toContain("→scrape_web_page");
  });

  it("scrape_web_page 摘要含 textChars", () => {
    const hint = formatToolTimingHint({ elapsedMs: 900, textChars: 3500, textTruncated: false });
    expect(hint).toContain("900ms");
    expect(hint).toContain("3500 字");
  });

  it("scrape_web_page 摘要含 method 与 platform", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 1100,
      method: "playwright",
      platform: "unknown",
      textChars: 2899,
    });
    expect(hint).toContain("1100ms");
    expect(hint).toContain("playwright");
    expect(hint).toContain("2899 字");
  });

  it("browser_screenshot 摘要含截图字节与 suggestedTool", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 400,
      path: "content/uploads/screenshots/x.png",
      bytes: 2048,
      suggestedTool: "read_image",
    });
    expect(hint).toContain("400ms");
    expect(hint).toContain("截图 2048B");
    expect(hint).toContain("→read_image");
  });

  it("read_image 摘要含 source 与字数", () => {
    const hint = formatToolTimingHint({
      elapsedMs: 120,
      source: "ocr",
      textChars: 88,
    });
    expect(hint).toContain("ocr");
    expect(hint).toContain("88 字");
  });

  it("sleep 结果摘要含等待时长", () => {
    const hint = formatToolTimingHint({
      waitedMs: 20000,
      waitedSeconds: 20,
      message: "定时时间20s到了，请继续完成任务",
    });
    expect(hint).toContain("等待");
    expect(hint).toMatch(/20s|20\.0s/);
  });

  it("grep / arxiv 形用全集条数；长文 count 不是条数", () => {
    expect(formatToolResultHint({ pattern: "TODO", total: 8, results: [{}, {}] })).toContain("8 条");
    expect(formatToolResultHint({ query: "mamba", count: 10, papers: new Array(10).fill({}) })).toContain(
      "10 条",
    );
    expect(
      formatToolResultHint({ count: 3842, content: "hello", title: "线性注意力机制" }) ?? "",
    ).not.toContain("3842 条");
  });

  it("压缩失败卡给人看失败，不是全文已存；成功 message 不标失败", () => {
    expect(
      formatToolResultHint({
        offloaded: true,
        originalChars: 4000,
        metadata: {
          hasError: true,
          shortFields: { error: "文件不存在: foo.md" },
          fieldSizes: {},
        },
      }),
    ).toBe("失败 · 文件不存在: foo.md");
    expect(
      isToolResultFailed({
        offloaded: true,
        metadata: { hasError: true, shortFields: { error: "文件不存在: foo.md" } },
      }),
    ).toBe(true);
    expect(
      isToolResultFailed({
        offloaded: true,
        originalChars: 5000,
        metadata: { hasError: false, shortFields: { message: "Agent 被创建", total: "61" } },
      }),
    ).toBe(false);
  });

  it("压缩列表卡摘要带条数", () => {
    expect(
      formatToolResultHint({
        offloaded: true,
        originalChars: 9000,
        hitCount: 0,
        metadata: {
          title: "ignored-if-we-prefer-count",
          shortFields: { total: "61" },
          fieldSizes: { items: 5 },
        },
      }),
    ).toContain("61 条");
  });

  it("error:null 不当失败；空列表+total=0 是 0 条", () => {
    expect(isToolResultFailed({ error: null, elapsedMs: 10 })).toBe(false);
    expect(formatToolResultHint({ total: 0, items: [] })).toBe("0 条");
    expect(
      formatToolResultHint({
        data: { total: 61, items: [{}, {}, {}, {}, {}] },
      }),
    ).toBe("61 条");
  });

  it("未压缩的对象 error / ok:false 也是失败摘要", () => {
    expect(formatToolResultHint({ error: { message: "ENOENT: foo.md" } })).toContain("ENOENT: foo.md");
    expect(isToolResultFailed({ error: { message: "ENOENT: foo.md" } })).toBe(true);
    expect(formatToolResultHint({ ok: false, message: "权限不足" })).toBe("失败 · 权限不足");
  });
});
