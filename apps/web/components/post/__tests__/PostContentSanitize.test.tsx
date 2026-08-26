/**
 * PostContent HTML sanitize 测试（F7）
 *
 * - 危险标签/事件处理器/javascript 协议应被清洗
 * - 正常渲染依赖（className、id、data: 图片、表格、代码高亮、公式）应保持
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostContent } from "@/components/post/PostContent";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    post: {
      tree: {
        useQuery: () => ({ data: [] }),
      },
    },
  },
}));

describe("PostContent sanitize", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("剥掉 img onerror 事件处理器", async () => {
    await act(async () => {
      root.render(<PostContent content={'<img src="x" onerror="alert(1)">'} />);
    });
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.innerHTML).not.toMatch(/onerror/i);
  });

  it("剥掉 javascript: 链接", async () => {
    await act(async () => {
      root.render(<PostContent content={'<a href="javascript:alert(1)">click</a>'} />);
    });
    const a = container.querySelector("a");
    if (a) {
      expect(a.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
    }
    expect(container.innerHTML).not.toMatch(/javascript:/i);
  });

  it("剥掉 svg onload", async () => {
    await act(async () => {
      root.render(<PostContent content={'<svg onload="alert(1)"></svg>'} />);
    });
    expect(container.innerHTML).not.toMatch(/<svg/i);
    expect(container.innerHTML).not.toMatch(/onload/i);
  });

  it("剥掉 iframe", async () => {
    await act(async () => {
      root.render(<PostContent content={'<iframe src="https://example.com"></iframe>'} />);
    });
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("保留代码高亮 class", async () => {
    await act(async () => {
      root.render(<PostContent content={'```js\nconst x = 1;\n```'} />);
    });
    expect(container.innerHTML).toMatch(/hljs/);
  });

  it("保留 data: 图片", async () => {
    await act(async () => {
      root.render(<PostContent content={'![](data:image/png;base64,aaaa)'} />);
    });
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toMatch(/^data:image\/png/);
  });

  it("保留表格", async () => {
    await act(async () => {
      root.render(<PostContent content={'| a | b |\n|---|---|\n| 1 | 2 |'} />);
    });
    expect(container.querySelector("table")).not.toBeNull();
  });

  it("保留 heading id 用于 TOC", async () => {
    await act(async () => {
      root.render(<PostContent content={"## 标题\n"} />);
    });
    const h2 = container.querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.id).toBeTruthy();
  });
});
