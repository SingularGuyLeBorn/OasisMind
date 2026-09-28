import os
import shutil

root = r"D:\ALL IN AI\OasisMind-full-clone"
src = os.path.join(root, "content", "models", "03-模型家族")
guide = os.path.join(root, "content", "llm-guide")
garden = os.path.join(root, "content", "model-library")
order = ["deepseek", "kimi", "qwen", "stepfun", "mimo", "olmo"]
vendors = sorted(d for d in os.listdir(src) if os.path.isdir(os.path.join(src, d)))
seq = order + [v for v in vendors if v not in order]

os.makedirs(os.path.join(garden, "01-模型比较与选型"), exist_ok=True)
os.makedirs(os.path.join(garden, "02-选择与使用方法"), exist_ok=True)
chapter = os.path.join(garden, "03-模型家族")
os.makedirs(chapter, exist_ok=True)
imported = os.path.join(garden, "_imported")
os.makedirs(imported, exist_ok=True)

moves = [
    ("05-模型家族与选型", "05-模型家族与选型"),
    ("5-主流模型全解", "5-主流模型全解"),
    ("14-主流开源模型全景解析与技术报告精读", "14-主流开源模型"),
]
for src_name, dst_name in moves:
    source = os.path.join(guide, src_name)
    dest = os.path.join(imported, dst_name)
    if os.path.isdir(source) and not os.path.exists(dest):
        shutil.move(source, dest)
        print("moved", src_name)
    else:
        print("skip", src_name, os.path.isdir(source), os.path.exists(dest))

for index, vendor in enumerate(seq, 1):
    dest = os.path.join(chapter, f"{index:02d}-{vendor}")
    os.makedirs(dest, exist_ok=True)
    leaves = []
    base = os.path.join(src, vendor)
    if os.path.isdir(base):
        for dirpath, _, files in os.walk(base):
            if "site-packages" in dirpath or "baseenv" in dirpath or f"{os.sep}Lib{os.sep}" in dirpath:
                continue
            if os.path.basename(dirpath) + ".md" in files:
                leaves.append(os.path.basename(dirpath))
    body = "\n".join(f"- {name}" for name in leaves)
    text = (
        "---\n"
        f'title: "{vendor}"\n'
        "published: false\n"
        "---\n"
        f"# {vendor}\n\n"
        "每个模型四份，目录名用模型 slug：\n\n"
        "- `<slug>.pdf` 技术报告或模型卡原文\n"
        "- `<slug>.md` MinerU 转出的带图 Markdown\n"
        "- `<slug>-bi.md` 逐段意译对照，难懂处就地写短解析\n"
        "- `<slug>-analysis.md` 技术报告详解\n\n"
        f"待写模型 {len(leaves)} 个：\n\n"
        f"{body}\n"
    )
    with open(os.path.join(dest, "_index.md"), "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    print(f"{index:02d}", vendor, len(leaves))

garden_text = """---
title: "模型库"
published: true
---
# 模型库

从 llm-guide 里和模型家族重合的三章移出，按模型重写。第三章是正文。

## 四份

每个模型一个目录，里面只放这四份：

1. `<slug>.pdf`：技术报告或模型卡原文。没有论文时用官方博客或模型卡。
2. `<slug>.md`：MinerU 转出的 Markdown，图留在原位。
3. `<slug>-bi.md`：逐段意译。段落不合并、不删。术语没有稳定中文名就保留英文。难懂的句子后面用一两句说清楚。
4. `<slug>-analysis.md`：把这份报告当成一篇笔记写完，不拆成卡片。

## 家族顺序

`03-模型家族` 里 DeepSeek、Kimi、Qwen、StepFun、MiMo、OLMo 在前，其余家族接在后面。
"""
with open(os.path.join(garden, "_garden.md"), "w", encoding="utf-8", newline="\n") as handle:
    handle.write(garden_text)
print("families", len(seq))
