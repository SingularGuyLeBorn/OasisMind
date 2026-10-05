#!/usr/bin/env python3
"""Scan reader-facing Markdown for forbidden wording and common AI-style traces.

Hard findings violate docs/writing-spec.md and make the command fail. Soft
findings are review prompts: they need context-aware rewriting, not blind
deletion. Generated reports can be redirected to work/ for batch cleanup.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


HARD_PATTERNS = {
    "禁用词": re.compile(
        r"本篇只钉|只钉|钉成|写死|钉死|焊死|打死|缺的格不编|若只记三件事|有三处值得记住|"
        r"值得记住的|往下钻|工程账|机制账|一本总账|第二本账|记账|"
        r"一座桥|一律外链|不在此重推|不注水|架构精读|这里我卡住了|"
        r"别混账|系统账|算法账|训练账|成本账|算力账|通信账|显存账|"
        r"同一笔账|两张账|说清|专文"
    ),
    "面试腔": re.compile(r"(?<!求职|招聘)面试"),
    "审计元评论": re.compile(
        r"叙事边界|事实边界|证据状态|这里能写|可以写死|不能写死|"
        r"不写死|没有写死|官方页面确认|交叉核对|二手报道|"
        r"本次(?:修改|检查|审计)|本轮(?:修改|检查|审计)|旧稿|改稿|"
        r"本文(?:不会|不再)讨论|(?:本文|本篇|本章|本节)(?:不从|不另|不搬|不编|不重复|只写|只保留)|"
        r"这里只(?:负责|检查)|留给后文|待补|TODO|"
        r"未找到一手来源(?:之前)?|(?:不要|不能|可以)抄(?:到)?|工作点可以抄|"
        r"本篇不抄|本篇能钉|本篇因此|实践建议仍是|"
        r"(?:本篇|那篇)(?:写|负责)|(?:和|与)其他(?:知识)?库的分工|(?:文章|章节|本库)分工"
    ),
    "协作口吻": re.compile(
        r"接下来我们|下面我们|我们先来|我们来看|希望这能|如果你愿意|"
        r"读者需要记住|请注意|让我们"
    ),
}

SOFT_PATTERNS = {
    "稿件旁白": re.compile(r"本篇|本花园|单独成篇"),
    "账类隐喻": re.compile(r"账本|账|锁死|焊在一起"),
    "面试模板": re.compile(
        r"面试(?:高频|必问|重点|热门|超高频|新方向)|(?:标准|推荐)答案|"
        r"面试官(?:更倾向|通常|一定|必然)|出现率极高|出现频率(?:上升|下降)"
    ),
    "编辑元评论": re.compile(
        r"这是本篇[^。！？\n]{0,40}(?:原因|位置|作用)|"
        r"本篇(?:方法|要求|自己|的位置|的作用|的安排|的组织|的结构)|"
        r"本文(?:的安排|的组织|的结构)|"
        r"本章(?:的安排|的组织|的结构)|"
        r"本节(?:的安排|的组织|的结构)|"
        r"本库(?:编排|安排|组织|结构)|"
        r"(?:正确|推荐)的(?:读法|姿势)|读法上|"
        r"顺带(?:说明|交代|澄清)|"
        r"把(?:要求|结论|内容|讨论)收成[^。！？\n]{0,30}(?:模板|清单)|"
        r"这里只想说|这里想强调|这里先交代|这里补一句|"
        r"(?:把|将)[^。！？\n]{0,40}钉在|钉的是|钉住|坑同款|"
        r"锁(?:定|死)?[^。！？\n]{0,20}(?:配方|采样器|口径)|"
        r"(?:预训练|算力|训练|工程|系统)(?:账|账本)|焊在一起"
    ),
    "机械二分": re.compile(
        r"不是[^。！？\n]{0,60}(?:而是|只是)|"
        r"并不是[^。！？\n]{0,60}(?:而是|只是)|"
        r"不在于[^。！？\n]{0,60}而在于|"
        r"并非[^。！？\n]{0,60}而是"
    ),
    "讲义路标": re.compile(
        r"值得注意的是|需要指出的是|不难发现|显而易见|总而言之|"
        r"从某种意义上(?:说)?|换句话说|说白了|首先|其次|最后"
    ),
    "审稿腔": re.compile(
        r"准确地说|严格来说|需要强调的是|这里需要(?:明确|说明)|"
        r"为了避免误解|不能简单地|不应被理解为|不可量化|"
        r"作者(?:认为|观察)|笔者(?:认为|观察)"
    ),
    "模板动作": re.compile(
        r"本文将|本章将|本节将|接下来(?:讨论|介绍|分析)|"
        r"先看[^。！？\n]{0,30}再看|从三个方面|分为以下"
    ),
    "空泛强调": re.compile(
        r"至关重要|尤为重要|深刻改变|开启新篇章|革命性|颠覆性|"
        r"底层逻辑|形成闭环|重要抓手|宏大叙事|赛道"
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
            # 双语稿忠实保留论文作者的第一人称；“我们提出/观察到”在这里是
            # 原文叙述，不是站点作者与读者套近乎。其他硬规则仍照常执行。
            if path.name.endswith("-bi.md") and category == "协作口吻":
                continue
            # llm-interview 的主题本来就是求职面试；库内出现“面试”不构成
            # 禁词命中，但“高频/必问/标准答案”等表述仍需作为软项人工复核。
            if "llm-interview" in path.parts and category == "面试腔":
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
    parser.add_argument("paths", nargs="+", help="Markdown file or directory")
    parser.add_argument(
        "--fail-on-soft", action="store_true", help="also fail when review prompts remain"
    )
    args = parser.parse_args()

    files = iter_markdown(args.paths)
    findings = [item for path in files for item in scan_file(path)]
    for item in findings:
        excerpt = item.excerpt[:240]
        print(f"{item.severity}\t{item.category}\t{item.path}:{item.line}\t{excerpt}")

    hard = sum(item.severity == "HARD" for item in findings)
    soft = len(findings) - hard
    print(f"SUMMARY\tfiles={len(files)}\thard={hard}\tsoft={soft}")
    return 1 if hard or (args.fail_on_soft and soft) else 0


if __name__ == "__main__":
    sys.exit(main())
