"""论文入库第一步: 下载 PDF → MinerU 转换 → 按页重建带页标记的英文源文 + images/.
用法: python scripts/paper-ingest.py <arxiv-id | pdf 路径 | pdf URL> <输出目录> [--slug <slug>] [--tmp D:/tmp/papers]
输出: <输出目录>/<slug>.md 与 <输出目录>/images/; PDF 留在 tmp, 不进 content/.
MinerU 的 markdown.md 在 Windows 上会丢非 ASCII 符号, 所以从 structured_content.json 重建."""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
import zipfile

sys.stdout.reconfigure(encoding="utf-8")
MINERU = r"D:\python-envs\mineru\Scripts\mineru-kit.exe"
CAP_RE = r"\**\s*(Figure|Fig\.|Table)\s*\d+"

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--slug")
ap.add_argument("--tmp", default=r"D:\tmp\papers")
a = ap.parse_args()
slug = a.slug or os.path.basename(os.path.normpath(a.dst))
work = os.path.join(a.tmp, slug)
os.makedirs(work, exist_ok=True)
pdf = os.path.join(work, f"{slug}.pdf")

if os.path.isfile(a.src):
    shutil.copyfile(a.src, pdf)
elif not os.path.exists(pdf):
    url = a.src if a.src.startswith("http") else f"https://arxiv.org/pdf/{a.src}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    open(pdf, "wb").write(urllib.request.urlopen(req, timeout=300).read())
if open(pdf, "rb").read(5) != b"%PDF-":
    sys.exit(f"不是 PDF: {pdf}")

out_dir = os.path.join(work, "mineru")
x = os.path.join(work, "x")
if not os.path.exists(os.path.join(x, "structured_content.json")):
    subprocess.run([MINERU, "parse", pdf, "-p", "all", "-f", "zip", "-o", out_dir], check=True)
    z = glob.glob(os.path.join(out_dir, "**", "*.zip"), recursive=True)
    if not z:
        sys.exit(f"MinerU 没产出 zip: {out_dir}")
    zipfile.ZipFile(z[0]).extractall(x)

data = json.load(open(os.path.join(x, "structured_content.json"), encoding="utf-8"))
pages = data["pages"]
total = len(pages)
flat = [(p["page_idx"] + 1, b) for p in pages for b in p["blocks"]]


def slugify(text, limit=8):
    text = re.sub(r"<[^>]+>|\$[^$]*\$|\*\*|[`*_]", " ", text)
    return "-".join(re.findall(r"[A-Za-z0-9]+", text.lower())[:limit])


def cap_text(cap):
    return (cap.get("content", "") if isinstance(cap, dict) else str(cap)).strip()


used, names = set(), {}
for i, (page, b) in enumerate(flat):
    if b["type"] not in ("image", "chart"):
        continue
    caps = [cap_text(c) for c in (b.get("captions") or [])]
    caption = next((c for c in caps if re.match(CAP_RE, c)), "")
    for _, nb in ([] if caption else flat[i + 1:i + 4]):
        if nb["type"] in ("text", "paragraph_title") and re.match(CAP_RE, nb.get("content", "")):
            caption = nb["content"]
            break
    if caption:
        m = re.match(r"\**\s*(Figure|Fig\.|Table)\s*(\d+)\**[:.]?\**\s*(.*)", caption, re.S)
        base = f"p{page:02d}-{m.group(1).lower().rstrip('.')}-{m.group(2)}-{slugify(m.group(3), 7)}".rstrip("-")
    elif caps and slugify(caps[0], 8):
        base = f"p{page:02d}-{slugify(caps[0], 8)}"
    else:
        base = f"p{page:02d}-{b['type']}"
    name, k = base, 2
    while name in used:
        name, k = f"{base}-{k}", k + 1
    used.add(name)
    names[b["image_source"]] = f"images/{name}{os.path.splitext(b['image_source'])[1]}"

out, current = [f"<!-- page 1 of {total} -->"], 1
for page, b in flat:
    if page != current:
        out.append(f"<!-- page {page} of {total} -->")
        current = page
    t, c = b["type"], b.get("content", "")
    if t == "page_number":
        continue
    if t == "doc_title":
        out.append("# " + c.strip())
    elif t == "paragraph_title":
        out.append("#" * max(2, min(int(b.get("level", 2)), 4)) + " " + c.strip())
    elif t == "equation":
        out.append("$$\n" + c.strip() + "\n$$")
    elif t in ("image", "chart"):
        out.append(f"![Image block]({names[b['image_source']]})")
        out += [cap_text(n) for n in (b.get("captions") or []) + (b.get("footnotes") or []) if cap_text(n)]
    elif c.strip():
        out.append(c.strip())

os.makedirs(os.path.join(a.dst, "images"), exist_ok=True)
text = "\n\n".join(out) + "\n"
open(os.path.join(a.dst, f"{slug}.md"), "w", encoding="utf-8", newline="\n").write(text)
bad = []
for s, d in names.items():
    tp = os.path.join(a.dst, d)
    shutil.copyfile(os.path.join(x, s), tp)
    head = open(tp, "rb").read(4)
    if not (head[:2] == b"\xff\xd8" or head == b"\x89PNG"):
        bad.append(d)
print(f"pages {total}, images {len(names)}, chars {len(text)}, pdf {pdf}")
for d in bad:
    print("BAD IMAGE", d)
