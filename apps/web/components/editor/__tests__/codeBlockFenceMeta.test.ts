import { describe, expect, it } from "vitest";
import {
  fenceLanguageOnly,
  parseFenceMeta,
  serializeFenceMeta,
} from "@/components/editor/codeBlockFenceMeta";

describe("codeBlockFenceMeta", () => {
  it("parses bare language", () => {
    expect(parseFenceMeta("python")).toEqual({ language: "python", title: "" });
  });

  it("parses title= quoted meta", () => {
    expect(parseFenceMeta('python title="数据并行"')).toEqual({
      language: "python",
      title: "数据并行",
    });
  });

  it("round-trips serialize/parse", () => {
    const raw = serializeFenceMeta("ts", 'say "hi"');
    expect(parseFenceMeta(raw)).toEqual({ language: "ts", title: 'say "hi"' });
  });

  it("fenceLanguageOnly ignores title", () => {
    expect(fenceLanguageOnly('viz title="demo"')).toBe("viz");
    expect(fenceLanguageOnly("kp-board")).toBe("kp-board");
  });
});
