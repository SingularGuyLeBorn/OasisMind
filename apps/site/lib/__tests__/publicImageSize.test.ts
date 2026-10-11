import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readPublicImageSize } from "../publicImageSize";

const roots: string[] = [];
const hash = "a1" + "b".repeat(62);
const src = `/api/v1/assets/a1/${hash}.webp`;
const gifSrc = `/api/v1/assets/a1/${hash}.gif`;

function root() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "om-site-image-size-"));
  roots.push(directory);
  fs.mkdirSync(path.join(directory, "api/v1/assets/a1"), { recursive: true });
  return directory;
}

function writeWebp(directory: string, chunk: "VP8 " | "VP8X" | "VP8L", width: number, height: number) {
  const header = Buffer.alloc(30);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(22, 4);
  header.write("WEBP", 8, "ascii");
  header.write(chunk, 12, "ascii");
  header.writeUInt32LE(10, 16);
  if (chunk === "VP8 ") {
    header.set([0x9d, 0x01, 0x2a], 23);
    header.writeUInt16LE(width, 26);
    header.writeUInt16LE(height, 28);
  } else if (chunk === "VP8X") {
    header.writeUIntLE(width - 1, 24, 3);
    header.writeUIntLE(height - 1, 27, 3);
  } else {
    header[20] = 0x2f;
    header.writeUInt32LE(((height - 1) << 14) | (width - 1), 21);
  }
  fs.writeFileSync(path.join(directory, `api/v1/assets/a1/${hash}.webp`), header);
}

function writeGif(directory: string, width: number, height: number) {
  const header = Buffer.alloc(30);
  header.write("GIF89a", 0, "ascii");
  header.writeUInt16LE(width, 6);
  header.writeUInt16LE(height, 8);
  fs.writeFileSync(path.join(directory, `api/v1/assets/a1/${hash}.gif`), header);
}

afterEach(() => {
  for (const directory of roots.splice(0)) {
    const target = path.resolve(directory);
    const temp = path.resolve(os.tmpdir());
    if (path.dirname(target) !== temp || !path.basename(target).startsWith("om-site-image-size-")) {
      throw new Error(`测试临时目录不在预期范围：${target}`);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
});

describe("公开图片固有尺寸", () => {
  it("读取 VP8 文件头，带查询参数的同一图片仍用真实尺寸", () => {
    const directory = root();
    writeWebp(directory, "VP8 ", 1280, 720);
    expect(readPublicImageSize(`${src}?variant=reader`, directory)).toEqual({ width: 1280, height: 720 });
    expect(readPublicImageSize(`/OasisMind${src}?variant=reader`, directory, "/OasisMind")).toEqual({ width: 1280, height: 720 });
  });

  it("读取 VP8X 扩展文件头的 24 位尺寸", () => {
    const directory = root();
    writeWebp(directory, "VP8X", 1600, 900);
    expect(readPublicImageSize(src, directory)).toEqual({ width: 1600, height: 900 });
  });

  it("读取 VP8L 无损头的两段 14 位尺寸", () => {
    const directory = root();
    writeWebp(directory, "VP8L", 12345, 6789);
    expect(readPublicImageSize(src, directory)).toEqual({ width: 12345, height: 6789 });
  });

  it("读取公开 GIF 文件头，并为 Pages 基路径保留宽高", () => {
    const directory = root();
    writeGif(directory, 952, 531);
    expect(readPublicImageSize(gifSrc, directory)).toEqual({ width: 952, height: 531 });
    expect(readPublicImageSize(`/OasisMind${gifSrc}`, directory, "/OasisMind")).toEqual({ width: 952, height: 531 });
  });

  it("外链不猜尺寸，公开哈希文件丢失则明确失败", () => {
    const directory = root();
    expect(readPublicImageSize("https://example.com/figure.webp", directory)).toBeUndefined();
    expect(() => readPublicImageSize(src, directory)).toThrow(/公开图片缺失/);
  });
});
