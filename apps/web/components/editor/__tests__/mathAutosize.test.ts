import { describe, expect, it } from "vitest";
import {
  clampAutosizeHeight,
  MATH_SOURCE_MIN_HEIGHT_PX,
} from "@/components/editor/mathBlockNodeView";

describe("clampAutosizeHeight", () => {
  it("短公式也至少抬到最小高度，避免编辑区只露一行", () => {
    expect(clampAutosizeHeight(20, MATH_SOURCE_MIN_HEIGHT_PX, 320)).toBe(
      MATH_SOURCE_MIN_HEIGHT_PX,
    );
  });

  it("内容高于最小值时跟 scrollHeight", () => {
    expect(clampAutosizeHeight(140, MATH_SOURCE_MIN_HEIGHT_PX, 320)).toBe(140);
  });

  it("不超过 CSS max-height", () => {
    expect(clampAutosizeHeight(900, MATH_SOURCE_MIN_HEIGHT_PX, 320)).toBe(320);
  });
});
