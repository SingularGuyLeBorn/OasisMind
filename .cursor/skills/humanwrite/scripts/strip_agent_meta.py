# Mechanical strip of agent-facing meta in reader Markdown.
# Does not rewrite voice. Skip notes/.

from pathlib import Path

ROOTS = [
    Path(r"D:\ALL IN AI\OasisMind\content\llm-guide"),
    Path(r"D:\ALL IN AI\OasisMind\content\rsi"),
]
SKIP_PARTS = {"notes"}

REPLACEMENTS = [
    ("**材料类型（2026-08）**：", ""),
    ("**材料类型**：", ""),
    ("禁止假装有全文翻译", "没有全文可译"),
    ("是 **B 档 SKU**，不新开目录", "是云上产品名，这里不另开目录"),
    ("**B 档 SKU**", "云上产品档"),
    ("**B 档，禁止 mkdir。**", "不另开目录。"),
    ("（勿平行第三份）", ""),
    (" · 积木本体：", " · "),
    (" · 方法本体：", " · "),
    ("**P3。** ", ""),
    ("**P2（2026-08）。** ", ""),
    ("地图（只读、不改）：", ""),
    ("本体（本篇只链）", "详见"),
    ("本篇只链不改", "本篇只对照，不改邻居正文"),
]

changed = []
for root in ROOTS:
    for p in root.rglob("*.md"):
        if any(part in SKIP_PARTS for part in p.parts):
            continue
        text = p.read_text(encoding="utf-8")
        new = text
        for a, b in REPLACEMENTS:
            new = new.replace(a, b)
        if new != text:
            p.write_text(new, encoding="utf-8", newline="\n")
            changed.append(str(p.relative_to(root.parent.parent)))

print(f"updated {len(changed)} files")
for c in changed[:80]:
    print(c)
if len(changed) > 80:
    print(f"... and {len(changed) - 80} more")
