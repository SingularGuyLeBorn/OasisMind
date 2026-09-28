# -*- coding: utf-8 -*-
"""Build bilingual md from mineru md + old bi translations. Temporary helper."""
from __future__ import annotations

import re
from pathlib import Path

OUT = Path(__file__).resolve().parent
MD = (OUT / "deepseek-coder-v2.md").read_text(encoding="utf-8")
OLD_BI = Path(
    r"D:\ALL IN AI\OasisMind-full-clone\content\models\03-模型家族\deepseek\02-v2\deepseek-coder-v2\deepseek-coder-v2-bi.md"
).read_text(encoding="utf-8")


def split_blocks(text: str) -> list[str]:
    parts = re.split(r"\n\s*\n", text.strip())
    return [p.strip() for p in parts if p.strip()]


def looks_chinese(s: str) -> bool:
    cjk = sum(1 for ch in s if "\u4e00" <= ch <= "\u9fff")
    bare = len(re.sub(r"\s", "", s))
    return cjk >= max(3, int(bare * 0.12))


def normalize_en(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace("DeepSeek V2", "DeepSeek-V2")
    s = s.replace("DeepSeek-Coder-v2", "DeepSeek-Coder-V2")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    return s.lower()


def build_en2cn(old_bi: str) -> dict[str, str]:
    blocks = split_blocks(old_bi)
    en2cn: dict[str, str] = {}
    i = 0
    while i < len(blocks):
        b = blocks[i]
        if b.startswith("---") or b.startswith("title:") or b.startswith("category:") or b.startswith("published:") or b.startswith("excerpt:") or b.startswith("# 3.3"):
            i += 1
            continue
        if looks_chinese(b) and not b.startswith("#"):
            i += 1
            continue
        if i + 1 < len(blocks) and looks_chinese(blocks[i + 1]):
            en2cn[normalize_en(b)] = blocks[i + 1]
            i += 2
        else:
            i += 1
    return en2cn


HEADING_CN = {
    "# DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence": "# DeepSeek-Coder-V2：打破代码智能领域的闭源壁垒",
    "## Abstract": "## 摘要",
    "## 1. Introduction": "## 1. 引言",
    "## 1.1. Contributions": "## 1.1. 贡献",
    "## 1.2. Summary of Evaluations and Metrics": "## 1.2. 评测与指标摘要",
    "## 2. Data Collection": "## 2. 数据收集",
    "## 3. Training Policy": "## 3. 训练策略",
    "## 3.1. Training Strategy": "## 3.1. 训练策略",
    "## 3.2. Model Architecture": "## 3.2. 模型架构",
    "## 3.3. Training Hyper-Parameters": "## 3.3. 训练超参数",
    "## 3.4. Long Context Extension": "## 3.4. 长上下文扩展",
    "## 3.5. Alignment": "## 3.5. 对齐",
    "## 3.5.1. Supervised Fine-Tuning": "## 3.5.1. 监督微调",
    "## 3.5.2. Reinforcement Learning": "## 3.5.2. 强化学习",
    "## 4. Experimental Results": "## 4. 实验结果",
    "## 4.1. Code Generation": "## 4.1. 代码生成",
    "## 4.2. Code Completion": "## 4.2. 代码补全",
    "## 4.2.1. Repository-Level Code Completion Evaluation": "## 4.2.1. 仓库级代码补全评测",
    "## 4.2.2. Fill-in-the-Middle Code Completion": "## 4.2.2. Fill-in-the-Middle 代码补全",
    "## 4.3. Code Fixing": "## 4.3. 代码修复",
    "## 4.4. Code Understanding and Reasoning": "## 4.4. 代码理解与推理",
    "## 4.5. Mathematical Reasoning": "## 4.5. 数学推理",
    "## 4.6. General Natural Language": "## 4.6. 通用自然语言",
    "## 5. Conclusion": "## 5. 结论",
    "## References": "## 参考文献",
    "## A. Supported Programming Languages": "## A. 支持的编程语言",
}

CAPTION_CN = {
    "Figure 1 | The Performance of DeepSeek-Coder-V2 on math and code benchmarks.": "图 1｜DeepSeek-Coder-V2 在数学与代码基准上的表现。",
    'Figure 2 | Evaluation results on the "Needle In A Haystack" (NIAH) tests. DeepSeek-Coder-V2 performs well across all context window lengths up to 128K.': "图 2｜“Needle In A Haystack”（NIAH）测试结果。DeepSeek-Coder-V2 在直至 128K 的各上下文窗口长度上表现良好。",
    "Figure 3 | Performances of Different Methods": "图 3｜不同方法的表现",
    "Table 1 | Performance of 1B base model between DeepSeek-Coder and DeepSeek-Coder-V2.": "表 1｜1B 基座模型上 DeepSeek-Coder 与 DeepSeek-Coder-V2 的对比。",
    "Table 2 | Training Setting of DeepSeek-Coder-V2.": "表 2｜DeepSeek-Coder-V2 的训练设置。",
    "Table 3 | Performance Metrics for Various Models on HumanEval and MBPP Benchmarks": "表 3｜各模型在 HumanEval 与 MBPP 基准上的指标。",
    "Table 4 | Performance on the LiveCodeBench (LCB) and USACO benchmarks.": "表 4｜LiveCodeBench（LCB）与 USACO 基准上的表现。",
    "Table 5 | Performance of different models on December subset of RepoBench v1.1.": "表 5｜各模型在 RepoBench v1.1 十二月子集上的表现。",
    "Table 6 | Performance of different approaches on the FIM-Tasks.": "表 6｜各方法在 FIM 任务上的表现。",
    "Table 7 | Performances of different models on repair benchmarks. We do not evaluate Llama3-Instruct on SWE-Bench as it just supports 8K context length.": "表 7｜各模型在修复基准上的表现。未评测 Llama3-Instruct 的 SWE-Bench，因其仅支持 8K 上下文。",
    "Table 8 | Performance of different models on the CruxEval benchmark.": "表 8｜各模型在 CruxEval 基准上的表现。",
    "Table 9 | Performance of different models on the mathematical reasoning. DeepSeek-Coder-V2-Instruct can achieve 5/30 on AIME 2024 with maj@64.": "表 9｜各模型的数学推理表现。DeepSeek-Coder-V2-Instruct 在 AIME 2024 上用 maj@64 可达 5/30。",
    "Table 10 | A Comparison of DeepSeek-Coder-V2 Instruct with DeepSeek-V2 Chat.": "表 10｜DeepSeek-Coder-V2 Instruct 与 DeepSeek-V2 Chat 的对比。",
}


def fuzzy_get(en2cn: dict[str, str], key: str) -> str | None:
    if key in en2cn:
        return en2cn[key]
    for k, v in en2cn.items():
        if key[:100] == k[:100]:
            return v
        if len(key) > 100 and len(k) > 100 and (key[:100] in k or k[:100] in key):
            return v
    return None


def translate(b: str, en2cn: dict[str, str]) -> str | None:
    if b.startswith("<!--") and "page" in b:
        m = re.search(r"page\s+(\d+)\s+of\s+(\d+)", b)
        if m:
            return f"（第 {m.group(1)} / {m.group(2)} 页）"
        return "（分页标记）"
    if re.fullmatch(r"\d{1,2}", b):
        return f"（页码 {b}）"
    if b.startswith("![Chart") or b.startswith("!["):
        m = re.search(r"\(([^)]+)\)", b)
        path = m.group(1) if m else ""
        return f"![图]({path})"
    if b.strip() == "Qdeepseek":
        return "（页眉/水印残留）"
    if "docvortex-page-footnote" in b or b.startswith("<small>"):
        t = re.sub(r"<[^>]+>", "", b).strip()
        if "Core contributors" in t:
            return "＊主要贡献者"
        low = t.lower()
        if "stackoverflow" in low:
            return "¹ https://stackoverflow.com"
        if "pytorch" in low:
            return "² https://pytorch.org/docs"
        if "stackexchange" in low or "math.stack" in low:
            return "³ https://math.stackexchange.com"
        if "please complete the python" in low or "unfinished function" in low:
            return "⁴ HumanEval 指令模板：请完成下方 Python 函数，最终完整版本须放在代码块中返回（原文模板见上）。"
        if "first generated line" in low:
            return "⁵ 评测取首行生成结果而非整块，故与 DeepSeek-Coder 结果略有差异。"
        if "defects4j" in low:
            return "⁷ https://github.com/rjust/defects4j"
        if "aider" in low and "github" in low:
            return "⁸ https://github.com/paul-gauthier/aider"
        if "boxed" in low or "reason step by step" in low:
            return "⁹ 四个数学基准均用 zero-shot chain-of-thought；题后拼接：请逐步推理，并把最终答案放在 \\boxed{} 中。"
        return f"（脚注）{t[:160]}"
    if b.startswith("|") or b.startswith("<table") or b.startswith("$$"):
        return "（表格/公式结构同原文；数字、符号、URL 不改。）"
    if b.startswith("ABAP,") or (b.startswith("ABAP") and "Zig" in b):
        return "附录 A：支持的编程语言列表（与原文相同，不另译各名称）。"
    if b.strip() in HEADING_CN:
        return HEADING_CN[b.strip()]
    for k, v in HEADING_CN.items():
        if b.strip() == k or normalize_en(b) == normalize_en(k):
            return v
    # captions with curly quotes variants
    bn = b.replace("\u201c", '"').replace("\u201d", '"')
    if bn.strip() in CAPTION_CN:
        return CAPTION_CN[bn.strip()]
    for k, v in CAPTION_CN.items():
        if normalize_en(b)[:70] == normalize_en(k)[:70]:
            return v
    if b.startswith("DeepSeek-AI"):
        return "DeepSeek-AI"
    if b.startswith("https://github.com/deepseek-ai/DeepSeek-Coder-V2"):
        return "https://github.com/deepseek-ai/DeepSeek-Coder-V2"
    if b.startswith("arXiv:"):
        return b
    if b.startswith("In summary, our main contributions"):
        return "主要贡献如下："
    # author lines: keep names, light CN
    if "Qihao Zhu" in b and "DeepSeek" not in b[:20]:
        return "作者列表同原文（＊为核心贡献者）。"
    hit = fuzzy_get(en2cn, normalize_en(b))
    if hit:
        return hit
    return None


# Extra hand translations for mineru-split fragments not in old bi
EXTRA: dict[str, str] = {
    normalize_en(
        "• We introduce DeepSeek-Coder-V2 with 16B and 236B parameters based on the DeepSeek-"
    ): "• 推出基于 DeepSeek-MoE 的 DeepSeek-Coder-V2，含 16B 与 236B 两档，",
    normalize_en(
        "MoE framework, which has activation parameters of only 2.4B and 21B, efficiently supporting diverse computational and application needs. Additionally, DeepSeek-Coder-V2 supports 338 programming languages and a maximum context length of 128K tokens."
    ): "激活参数仅 2.4B / 21B，兼顾不同算力需求；并支持 338 种编程语言、最长 128K 上下文。",
    normalize_en(
        "We use two training objectives for DeepSeek-Coder-v2 16B: Next-Token-Prediction and Fill-In-Middle (FIM) (Bavarian et al., 2022; Guo et al., 2024; Li et al., 2023b). For DeepSeek-Coder-v2"
    ): "DeepSeek-Coder-V2 16B 使用 Next-Token-Prediction 与 Fill-In-Middle（FIM）两个训练目标（Bavarian et al., 2022; Guo et al., 2024; Li et al., 2023b）。对 DeepSeek-Coder-V2",
    normalize_en(
        "236B, we only utilize the Next-Token-Prediction objective. Here we give a brief introduction of the FIM training policy. We adopt the FIM training approach for the development of DeepSeek-Coder-v2-16B, leveraging the PSM (Prefix, Suffix, Middle) mode. This method structures the content reconstruction in the sequence: Prefix, Suffix, and Middle, as illustrated below:"
    ): "236B 则只用 Next-Token-Prediction。下面简述 FIM 策略：16B 采用 PSM（Prefix, Suffix, Middle）模式，按前缀、后缀、中间的顺序重构内容，示意如下：",
    normalize_en(
        "Reward Modeling Reward models play crucial roles in the RL training. In terms of mathematical preference data, we obtain them using the ground-truth labels. In terms of code preference data, although the code compiler itself can already provide 0-1 feedback (whether the code pass all test cases or not), some code prompts may have a limited number of test cases, and do not provide full coverage, and hence directly using 0-1 feedback from the compiler may be noisy and sub-optimal. Therefore, we still decide to train a reward model on the data provided by the compiler, and use the reward model to provide signal during RL training, which is more robust"
    ): "**奖励建模** 奖励模型在 RL 中很关键。数学偏好数据用 ground-truth 标签；代码侧虽有编译器 0-1 反馈（是否通过全部测试），但部分题测试覆盖不足，直接用编译器信号可能噪声大、并非最优。因此仍在编译器数据上训练奖励模型，用它在 RL 中给信号，更稳健",
    normalize_en(
        "and has better generalization ability, in comparison with raw compiler signal. As illustrated in Figure 3, in our in-house test sets (Leetcode and Leetcode-zh), using a reward model to provide RL training signal clearly outperforms using raw compiler signal. Hence, we use reward model signal rather than compiler signal in all subsequent experiments."
    ): "且泛化通常好于原始编译器信号。如图 3，在内部测试集（Leetcode 与 Leetcode-zh）上，奖励模型信号明显优于原始编译器信号；后续实验一律用奖励模型信号。",
    normalize_en(
        "Table 3 provides an extensive overview of the performance metrics for various models across multiple programming languages on the HumanEval and MBPP<sup>+</sup> Benchmarks. The DeepSeek Coder-V2-Instruct demonstrates exceptional performance, securing the second-highest average"
    ): "表 3 汇总了各模型在 HumanEval 与 MBPP+ 多语言上的指标。DeepSeek-Coder-V2-Instruct 表现突出，平均分位列第二，",
    normalize_en(
        "score of 75.3%. This performance is notable as it breaks the dominance typically seen from closed-source models, standing out as a leading open-source contender. It is surpassed only by GPT-4o, which leads with an average score of 76.4%. DeepSeek-Coder-V2-Instruct shows top-tier results across a variety of languages, including the highest scores in Java and PHP, and strong performances in Python, C++, C#, TypeScript, and JavaScript, underscoring its robustness and versatility in handling diverse coding challenges."
    ): "达 75.3%。在闭源模型长期占优的格局里，它是开源侧的有力竞争者，仅次于平均 76.4% 的 GPT-4o。Java、PHP 最高，Python、C++、C#、TypeScript、JavaScript 也很强，说明多语言代码能力扎实。",
    normalize_en(
        "main metric for this evaluation was the line exact match accuracy<sup>5</sup>."
    ): "主指标为行级 exact match 准确率⁵。",
    normalize_en(
        'It should be noted here we upsample long context data ratio during long context extension. As shown in Figure 2, the results on the “Needle In A Haystack” (NIAH) tests indicate that DeepSeek-Coder-V2 performs well across all context window lengths up to 128K.'
    ): "长上下文扩展阶段会上采样长上下文数据比例。如图 2，“Needle In A Haystack”（NIAH）结果显示，DeepSeek-Coder-V2 在直至 128K 的各窗口长度上表现良好。",
    normalize_en(
        "HumanEval and MBPP Benchmarks. The HumanEval (Chen et al., 2021) <sup>4</sup> and MBPP (Austin et al., 2021b) benchmarks are commonly utilized for assessing the performance of code-generating Large Language Models (LLMs). HumanEval comprises 164 Python tasks that are verified through test cases to evaluate the performance of Code LLMs in a zero-shot scenario. For MBPP, we use the MBPP-Plus version (Liu et al., 2023a) to evaluate the models. To test the multilingual abilities of models, we extended the HumanEval benchmark problems into seven additional languages: C++, Java, PHP, TypeScript, C#, Bash, JavaScript, Swift, R, Julia, D, Rust and Racket. For both benchmarks, we employed a greedy search strategy and recreated the baseline results using identical scripts and environments to ensure a fair comparison."
    ): "**HumanEval 与 MBPP。** HumanEval（Chen et al., 2021）⁴ 与 MBPP（Austin et al., 2021b）常用来评测代码生成 LLM。HumanEval 含 164 个带测试用例的 Python 题，零样本评测；MBPP 用 MBPP-Plus（Liu et al., 2023a）。为测多语言能力，把 HumanEval 题扩展到 C++、Java、PHP、TypeScript、C#、Bash、JavaScript、Swift、R、Julia、D、Rust、Racket 等。两端均用 greedy search，并用同一脚本与环境复现基线以保证公平。",
    normalize_en(
        "We use RepoBench (Liu et al., 2023b) to evaluate the capabilities of currently available open-source code models with sizes below 35B in repository-level code completion tasks. This dataset is constructed from a diverse set of real-world, open-sourced, permissively licensed repositories in two popular programming languages: Python and Java. Notably, the latest version (v1.1) of RepoBench sources its data from GitHub repositories created between October 6th and December 31st, 2023, while our pre-training data includes code created before November 2023. To ensure this dataset was not present in our pre-training data and avoid data leakage, we only use data from December 2023."
    ): "用 RepoBench（Liu et al., 2023b）评测 35B 以下开源代码模型的仓库级补全。数据来自真实、宽松许可的 Python/Java 仓库。v1.1 取自 2023-10-06 至 2023-12-31 新建仓库，而预训练含 2023-11 前代码；为防泄漏，只用 2023-12 的数据。",
    normalize_en(
        "To evaluate the bug-fixing capabilities of the model, we used the Defects4J <sup>7</sup>, SWE-bench (Jimenez et al., 2023), and Aider <sup>8</sup> datasets for testing. Defects4J is a widely used dataset in the field of software engineering, specifically designed for the purpose of evaluating and testing program repair techniques. It consists of a collection of real-world software bugs from various open-source projects, including but not limited to Apache Commons, JFreeChart, and Closure Compiler. Each bug in the dataset is accompanied by test suites that can be used to validate the effectiveness of program repair tools. Since the original bugs in Defec4J may need modify several files in the repository resulting in a long context, we collect 238 bugs that only need to modify one method from this benchmark."
    ): "代码修复用 Defects4J⁷、SWE-bench（Jimenez et al., 2023）与 Aider⁸。Defects4J 是常用程序修复数据集，含 Apache Commons、JFreeChart、Closure Compiler 等真实缺陷及测试套件。原题常需改多文件、上下文很长，故从中筛出只需改一个方法的 238 个 bug。",
    normalize_en(
        "In this paper, we introduce DeepSeek-Coder-V2 to further advance the field of code intelligence, which is continually pre-trained from DeepSeek-V2 with 6 trillion tokens sourced from a highquality and multi-source corpus. Through this continued pre-training, we find that DeepSeek-"
    ): "本文介绍 DeepSeek-Coder-V2：从 DeepSeek-V2 出发，用高质量多源语料再继续预训练 6 万亿 token，以推进代码智能。持续预训练后发现，DeepSeek-",
    normalize_en(
        "A. Anthropic. The claude 3 model family: Opus, sonnet, haiku. Claude-3 Model Card, 2024."
    ): "A. Anthropic. The claude 3 model family: Opus, sonnet, haiku. Claude-3 Model Card, 2024.（文献条目同原文）",
    normalize_en(
        "J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference"
    ): "J. Liu 等. Is your code generated by chatGPT really correct? … In Thirty-seventh Conference",
    normalize_en(
        "on Neural Information Processing Systems, 2023a. URL https://openreview.net/forum?id=1qvx610Cu7."
    ): "on Neural Information Processing Systems, 2023a. URL https://openreview.net/forum?id=1qvx610Cu7.",
    normalize_en(
        "A. Lozhkov, R. Li, L. B. Allal, F. Cassano, J. Lamy-Poirier, N. Tazi, A. Tang, D. Pykhtar, J. Liu, Y. Wei, et al. Starcoder 2 and the stack v2: The next generation. arXiv preprint arXiv:2402.19173, 2024."
    ): "A. Lozhkov 等. Starcoder 2 and the stack v2: The next generation. arXiv:2402.19173, 2024.",
    normalize_en(
        "Meta. Introducing meta llama 3: The most capable openly available llm to date. https://ai.meta.com/blog/meta-llama-3/, April 2024."
    ): "Meta. Introducing meta llama 3… https://ai.meta.com/blog/meta-llama-3/, April 2024.",
    normalize_en(
        "Netmind.AI. Odyssey-math. https://github.com/protagolabs/odyssey-math/tree/main, 2024. Accessed: April 22, 2024."
    ): "Netmind.AI. Odyssey-math. https://github.com/protagolabs/odyssey-math/tree/main, 2024. Accessed: April 22, 2024.",
}


def main() -> None:
    en2cn = build_en2cn(OLD_BI)
    en2cn.update(EXTRA)
    print("old+extra pairs", len(en2cn))
    blocks = split_blocks(MD)
    out: list[str] = []
    missing: list[str] = []
    for b in blocks:
        out.append(b)
        cn = translate(b, en2cn)
        if cn is None:
            missing.append(b)
            out.append("<<<MISSING>>>")
        else:
            out.append(cn)
    print("blocks", len(blocks), "missing", len(missing))
    miss_path = OUT / "_bi_missing.txt"
    miss_path.write_text("\n\n====\n\n".join(missing), encoding="utf-8")
    print("wrote", miss_path, "n=", len(missing))
    # write draft even with missing markers for inspection
    (OUT / "deepseek-coder-v2-bi.md").write_text("\n\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
