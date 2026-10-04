"""检查每张图下面有没有图注.
图注 = 图片 (或一组连续子图的最后一张) 下一个非空行以「图 N」「表 N」「Figure N」「(a)」「图注」「图源」开头 (可带 > 与加粗), 且不是「图 N 解析」.
不查 content/uploads/ 与 MinerU 英文原稿 (同目录有 <stem>-bi.md 的 <stem>.md).
用法: python scripts/caption-check.py [路径...]  缺图注时列出 文件:行 并以 1 退出."""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
IMG = re.compile(r"^\s*(!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>)\s*$")
CAP = re.compile(r"^\s*(>\s*)?[*_]*\s*((图|表)\s*\d+(\.\d+)*[a-z]?|(Figure|Fig\.|Table)\s*\d+|\(?[a-h]\)\s|图注|图源)", re.I)
ANA = re.compile(r"^\s*(>\s*)?[*_]*\s*图\s*\d+(\.\d+)*\s*解析")


def files(paths):
    for root in paths:
        if os.path.isfile(root):
            yield root
            continue
        for dp, ds, fs in os.walk(root):
            if "uploads" in dp.replace("\\", "/").split("/"):
                continue
            for f in fs:
                if f.endswith(".md") and not os.path.exists(os.path.join(dp, f[:-3] + "-bi.md")):
                    yield os.path.join(dp, f)


def missing(path):
    lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    out, fence = [], False
    for i, l in enumerate(lines):
        if l.lstrip().startswith(("```", "~~~")):
            fence = not fence
        if fence or not IMG.match(l):
            continue
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        nxt = lines[j] if j < len(lines) else ""
        if IMG.match(nxt) or (CAP.match(nxt) and not ANA.match(nxt)):
            continue
        out.append(i + 1)
    return out


if __name__ == "__main__":
    total = 0
    for p in files(sys.argv[1:] or ["content"]):
        for n in missing(p):
            print(f"{p}:{n}")
            total += 1
    print(f"缺图注 {total}")
    sys.exit(1 if total else 0)
