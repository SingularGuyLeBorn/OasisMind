import os

root = r"D:\ALL IN AI\OasisMind-full-clone"
src = os.path.join(root, "content", "models", "03-模型家族")
chapter = os.path.join(root, "content", "model-library", "03-模型家族")
order = ["deepseek", "kimi", "qwen", "stepfun", "mimo", "OLMo"]
vendors = sorted(d for d in os.listdir(src) if os.path.isdir(os.path.join(src, d)))
sequence = order + [vendor for vendor in vendors if vendor not in order]

for index, vendor in enumerate(sequence, 1):
    dest = os.path.join(chapter, f"{index:02d}-{vendor}")
    os.makedirs(dest, exist_ok=True)
    seen = []
    base = os.path.join(src, vendor)
    if os.path.isdir(base):
        for dirpath, _, files in os.walk(base):
            if "site-packages" in dirpath or "baseenv" in dirpath or f"{os.sep}Lib{os.sep}" in dirpath:
                continue
            name = os.path.basename(dirpath)
            if name + ".md" not in files or name in seen:
                continue
            seen.append(name)
    for slug in seen:
        os.makedirs(os.path.join(dest, slug), exist_ok=True)
    listing = "\n".join(f"- {slug}/" for slug in seen)
    text = (
        "---\n"
        f'title: "{vendor}"\n'
        "published: false\n"
        "---\n"
        f"# {vendor}\n\n"
        f"{len(seen)} 个模型。每个目录四份：`<slug>.pdf`、`<slug>.md`、`<slug>-bi.md`、`<slug>-analysis.md`。\n\n"
        f"{listing}\n"
    )
    with open(os.path.join(dest, "_index.md"), "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    print(f"{index:02d} {vendor} {len(seen)}")
