import { describe, expect, it } from "vitest";
import { isScrollbarClick } from "@/components/editor/mathBlockNodeView";

function fakeEl(opts: {
  scrollWidth: number;
  clientWidth: number;
  scrollHeight?: number;
  clientHeight: number;
  width: number;
  height: number;
  top?: number;
  left?: number;
}) {
  const top = opts.top ?? 100;
  const left = opts.left ?? 40;
  return {
    scrollWidth: opts.scrollWidth,
    clientWidth: opts.clientWidth,
    scrollHeight: opts.scrollHeight ?? opts.clientHeight,
    clientHeight: opts.clientHeight,
    getBoundingClientRect: () => ({
      x: left,
      y: top,
      top,
      left,
      right: left + opts.width,
      bottom: top + opts.height,
      width: opts.width,
      height: opts.height,
      toJSON() {
        return this;
      },
    }),
  };
}

describe("isScrollbarClick", () => {
  it("宽公式底部横条点击算滚动条", () => {
    const el = fakeEl({
      scrollWidth: 900,
      clientWidth: 400,
      clientHeight: 80,
      width: 400,
      height: 92,
    });
    expect(isScrollbarClick({ clientX: 200, clientY: 186 }, el)).toBe(true);
    expect(isScrollbarClick({ clientX: 200, clientY: 140 }, el)).toBe(false);
  });

  it("没有溢出时不算滚动条", () => {
    const el = fakeEl({
      scrollWidth: 400,
      clientWidth: 400,
      clientHeight: 80,
      width: 400,
      height: 80,
    });
    expect(isScrollbarClick({ clientX: 200, clientY: 175 }, el)).toBe(false);
  });

  it("右侧竖条点击算滚动条", () => {
    const el = fakeEl({
      scrollWidth: 400,
      clientWidth: 400,
      scrollHeight: 200,
      clientHeight: 80,
      width: 412,
      height: 80,
    });
    expect(isScrollbarClick({ clientX: 447, clientY: 140 }, el)).toBe(true);
    expect(isScrollbarClick({ clientX: 200, clientY: 140 }, el)).toBe(false);
  });
});
