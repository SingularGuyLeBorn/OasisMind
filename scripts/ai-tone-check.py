#!/usr/bin/env python3
"""扫描读者可见 Markdown 中的禁忌表达与常见 AI 写作痕迹。

HARD 命中会直接失败；SOFT 只提供人工复核线索。脚本负责定位，不能代替
上下文判断，也不能把机械删词当作改写。
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


HARD_PATTERNS = {
    "机械隐喻": re.compile(
        r"写死|钉死|锁死|焊死|打死|钉在一起|焊在一起|一笔账|两笔账|三笔账|"
        r"工程账|机制账|系统账|算法账|训练账|成本账|算力账|通信账|显存账|"
        r"一本总账|第二本账|同一本账|同一笔账|两张账|账本|记账|往下钻"
    ),
    "审核元评论": re.compile(
        r"叙事边界|事实边界|证据状态|顺带把.{0,20}说清楚|这里不拿.{0,30}替代|"
        r"不是论文.{0,30}结论|不是.{0,20}(?:学术|技术)排名|不可量化的学术排名|"
        r"作者对同期.{0,20}(?:观察|判断)|传播声量|热搜替代引用|"
        r"无法从.{0,30}确认|没有官方.{0,20}确认|(?:不能|不宜)写死|"
        r"本次(?:修改|检查|审计)|本轮(?:修改|检查|审计)|旧稿|改稿|交叉核对|"
        r"(?:审稿|编辑|核查|复核)(?:过程|现场|口径|记录)|"
        r"这里能写|可以写死|不能写死|未找到一手来源|二手报道|"
        r"(?:本文|本篇|本章|本节)(?:不从|不另|不搬|不编|不重复|只写|只保留)|"
        r"本次未打开|本会话|核对要点|不要把.{0,30}写成|缺的格不编"
    ),
    "禁用模板": re.compile(
        r"本篇只钉|只钉|钉成|若只记三件事|有三处值得记住|"
        r"一座桥|一律外链|不在此重推|不注水|架构精读|这里我卡住了|别混账|"
        r"(?:写成|另写|另有|已有|放在)[^。！？\n]{0,20}专文"
    ),
    "协作口吻": re.compile(
        r"接下来我们|下面我们|我们先来|我们来看|希望这能|如果你愿意|"
        r"读者需要记住|请注意|让我们"
    ),
}

SOFT_PATTERNS = {
    "机械二分": re.compile(
        r"不是[^。！？\n]{0,60}(?:而是|只是)|并不是[^。！？\n]{0,60}(?:而是|只是)|"
        r"不在于[^。！？\n]{0,60}而在于|并非[^。！？\n]{0,60}而是"
    ),
    "连续否定": re.compile(
        r"不是[^。！？\n]{0,80}不是|不只是[^。！？\n]{0,80}也不是|"
        r"既不是[^。！？\n]{0,80}也不是"
    ),
    "编辑元评论": re.compile(
        r"本文的安排|本章的安排|本节的安排|本库(?:编排|安排|组织|结构)|"
        r"正确的(?:读法|姿势)|读法是|顺带(?:说明|交代|澄清)|"
        r"这里(?:先|再)?(?:只想说|想强调|补一句|交代一句|负责检查)|"
        r"把[^。！？\n]{0,40}(?:钉在|钉住)|坑同款"
    ),
    "审稿腔": re.compile(
        r"准确地说|严格来说|需要说明的是|需要强调的是|这里需要(?:明确|说明)|"
        r"为了避免误解|不应被理解为|作者(?:认为|观察)|笔者(?:认为|观察)"
    ),
    "讲义路标": re.compile(
        r"值得注意的是|需要指出的是|不难发现|显而易见|总而言之|"
        r"从某种意义上(?:说)?|换句话说|说白了|首先|其次|最后"
    ),
    "模板动作": re.compile(
        r"本文将|本章将|本节将|接下来(?:讨论|介绍|分析)|"
        r"先看[^。！？\n]{0,30}再看|分为以下"
    ),
    "空泛强调": re.compile(
        r"至关重要|尤为重要|深刻改变|开启新篇章|革命性|颠覆性|"
        r"底层逻辑|形成闭环|重要抓手|宏大叙事|赛道"
    ),
    "面试模板": re.compile(
        r"面试(?:高频|必问|重点|热门|超高频|新方向|标准答案|推荐答案)|"
        r"出现率极高|出现频率(?:上升|下降)"
    ),
}

FENCE_RE = re.compile(r"^\s*(```|~~~)")


@dataclass(frozen=True)
class Finding:
    severity: str
    category: str
    path: Path
    line: int
    excerpt: str


def iter_markdown(inputs: list[str]) -> list[Path]:
    files: set[Path] = set()
    for raw in inputs:
        path = Path(raw)
        if path.is_file() and path.suffix.lower() == ".md":
            files.add(path)
        elif path.is_dir():
            files.update(p for p in path.rglob("*.md") if p.is_file())
    return sorted(files)


def scan_file(path: Path) -> list[Finding]:
    findings: list[Finding] = []
    in_fence = False
    text = path.read_text(encoding="utf-8")
    for line_no, line in enumerate(text.splitlines(), 1):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence or line.lstrip().startswith(("http://", "https://")):
            continue
        for category, pattern in HARD_PATTERNS.items():
            # 双语论文稿忠实保留原作者的第一人称叙述。
            if path.name.endswith("-bi.md") and category == "协作口吻":
                continue
            if pattern.search(line):
                findings.append(Finding("HARD", category, path, line_no, line.strip()))
        for category, pattern in SOFT_PATTERNS.items():
            if pattern.search(line):
                findings.append(Finding("SOFT", category, path, line_no, line.strip()))
    return findings


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", help="Markdown 文件或目录")
    parser.add_argument("--fail-on-soft", action="store_true", help="SOFT 命中也返回失败")
    parser.add_argument("--summary", action="store_true", help="只输出分类计数和总计")
    parser.add_argument(
        "--by-file",
        action="store_true",
        help="按文件汇总 HARD/SOFT 数量，便于决定人工朗读顺序",
    )
    args = parser.parse_args()

    files = iter_markdown(args.paths)
    findings = [item for path in files for item in scan_file(path)]
    if args.by_file:
        by_file: dict[Path, tuple[int, int]] = {}
        for item in findings:
            hard_count, soft_count = by_file.get(item.path, (0, 0))
            if item.severity == "HARD":
                hard_count += 1
            else:
                soft_count += 1
            by_file[item.path] = (hard_count, soft_count)
        for path, (hard_count, soft_count) in sorted(
            by_file.items(),
            key=lambda pair: (-(pair[1][0] + pair[1][1]), str(pair[0])),
        ):
            print(f"FILE\thard={hard_count}\tsoft={soft_count}\t{path}")
    elif not args.summary:
        for item in findings:
            print(f"{item.severity}\t{item.category}\t{item.path}:{item.line}\t{item.excerpt[:240]}")
    else:
        counts: dict[tuple[str, str], int] = {}
        for item in findings:
            key = (item.severity, item.category)
            counts[key] = counts.get(key, 0) + 1
        for (severity, category), count in sorted(counts.items()):
            print(f"{severity}\t{category}\t{count}")
    hard = sum(item.severity == "HARD" for item in findings)
    soft = len(findings) - hard
    print(f"SUMMARY\tfiles={len(files)}\thard={hard}\tsoft={soft}")
    return 1 if hard or (args.fail_on_soft and soft) else 0


if __name__ == "__main__":
    sys.exit(main())
