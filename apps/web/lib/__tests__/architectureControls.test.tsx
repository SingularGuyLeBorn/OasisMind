import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EightConnectionPorts, EightResizeHandles } from "../../../algo-viz/src/components/EditableArchitectureGraph";

const renders = vi.hoisted(() => ({ resize: 0, port: 0 }));
vi.mock("@xyflow/react", async importOriginal => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  return {
    ...actual,
    NodeResizeControl: ({ minWidth, minHeight, position }: { minWidth: number; minHeight: number; position: string }) => {
      renders.resize++;
      return <div data-resize={position} data-min-width={minWidth} data-min-height={minHeight} />;
    },
    Handle: ({ children, id, style, onPointerEnter, onPointerLeave }: React.HTMLAttributes<HTMLDivElement>) => {
      renders.port++;
      return <div data-port={id} style={style} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>{children}</div>;
    },
  };
});

afterEach(() => vi.useRealTimers());

describe("层号无关的编辑控件", () => {
  it("父节点切层不重绘相同控件，尺寸下限与端口颜色变化仍更新", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const render = (layer: number, minWidth = 100, color = "#37685a") => <div data-layer={layer}>
      <EightResizeHandles minWidth={minWidth} minHeight={40} />
      <EightConnectionPorts color={color} />
    </div>;
    renders.resize = 0;
    renders.port = 0;
    try {
      await act(async () => root.render(render(1)));
      expect(renders).toEqual({ resize: 12, port: 16 });
      const controls = [...container.querySelectorAll("[data-resize], [data-port]")];
      await act(async () => root.render(render(15)));
      expect(renders).toEqual({ resize: 12, port: 16 });
      expect([...container.querySelectorAll("[data-resize], [data-port]")]).toEqual(controls);
      await act(async () => root.render(render(29, 320, "#112233")));
      expect(renders).toEqual({ resize: 24, port: 32 });
      expect(container.querySelector("[data-resize]")?.getAttribute("data-min-width")).toBe("320");
      expect(container.querySelector<HTMLElement>("[data-port] span")?.style.color).toBe("rgb(17, 34, 51)");
    } finally { await act(async () => root.unmount()); }
  });

  it("复用后仍按 0.5 秒悬停显示加号，离开隐藏，卸载取消待显示", async () => {
    vi.useFakeTimers();
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      await act(async () => root.render(<EightConnectionPorts />));
      const port = container.querySelector<HTMLElement>("[data-port]")!;
      const plus = port.firstElementChild as HTMLElement;
      await act(async () => port.dispatchEvent(new MouseEvent("pointerover", { bubbles: true })));
      await act(async () => vi.advanceTimersByTime(499));
      expect(plus.style.opacity).toBe("0");
      await act(async () => vi.advanceTimersByTime(1));
      expect(plus.style.opacity).toBe("1");
      await act(async () => port.dispatchEvent(new MouseEvent("pointerout", { bubbles: true })));
      expect(plus.style.opacity).toBe("0");
      await act(async () => port.dispatchEvent(new MouseEvent("pointerover", { bubbles: true })));
      expect(vi.getTimerCount()).toBe(1);
    } finally { await act(async () => root.unmount()); }
    expect(vi.getTimerCount()).toBe(0);
  });
});
