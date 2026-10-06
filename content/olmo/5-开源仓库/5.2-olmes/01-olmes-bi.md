---
title: "OLMES 官方文档对照译稿"
category: "开源仓库"
tags: ["OLMo", "OLMES", "对照译稿", "模型评测"]
published: true
excerpt: "固定到提交 5a51f50 的 OLMES README 安装、使用、任务/套件配置与输出文档逐段英中对照。"
---

# OLMES 官方文档对照译稿

本文依据本地官方快照 `data/sources/olmes/repo`，提交 `5a51f502d463b8cdc4a2dcad7d7096c41ff1197e`。对照范围为 `README.md` 从项目说明至 `Evaluation output` 的连续正文与示例，以及 `OUTPUT_FORMATS.md` 的结果层级说明。任务清单命令原样保留；重复的各发布套件命令按段翻译，不把外部网页内容补入。

## README：项目说明

> The OLMES repository is used within Ai2's Open Language Model efforts to evaluate base and instruction-tuned LLMs on a range of tasks.

OLMES（Open Language Model Evaluation System）用于 Ai2 的开放语言模型工作，在一系列任务上评测基础模型和指令微调模型。

> The repository includes code to faithfully reproduce evaluation results for OLMo 3, OLMo 2, TÜLU 3, OLMES and OLMo.

仓库包含用于忠实复现 OLMo 3、OLMo 2、TÜLU 3、OLMES 与 OLMo 评测结果的代码。该提交中 OLMo 3 的标题和引用仍写为 TBD。

> The code base uses helpful features from lm-evaluation-harness, with modifications and enhancements.

代码借用了 EleutherAI `lm-evaluation-harness` 的功能，并扩展了：任务变体的深层配置；更详细的实例级预测数据（如 logprob）；自定义指标与聚合；外部结果存储集成。

## Setup

```sh
git clone https://github.com/allenai/olmes.git
cd olmes
uv sync
uv sync --group gpu
# 或
pip install -e .
pip install -e ".[gpu]"
```

使用 uv 或 pip 均可安装；GPU 分组/extra 用于 vLLM 支持。

## Usage

```bash
olmes \
  --model allenai/OLMo-2-0425-1B \
  --task arc_challenge::olmes \
  --output-dir workspace
```

> This launches the standard OLMES version of ARC Challenge, using a curated 5-shot example, trying both multiple-choice and cloze formulations, and reporting the max.

该命令以 OLMo 2 1B 运行标准 OLMES 版 ARC Challenge：使用人工整理的 5-shot 示例，同时尝试多选与 cloze 表述，并报告二者最大值，结果保存在 `workspace`。

多个任务可依次写在 `--task` 后。`--inspect` 会显示样例 prompt，并用小型 Pythia 做 5 个实例的检查；`--dry-run` 展示实际启动命令而不运行。完整参数见 `olmes --help`。

## Running Eval Suites

发布模型的完整套件定义在 `oe_eval/configs/task_suites.py`。

OLMo 3 基础模型分为 `base_easy`（小规模实验的 code/math BPB、QA 阅读理解与 QA BPB）、`base`（STEM/非 STEM 多选、生成、数学、代码和 FIM）以及 `heldout`。Instruct 模型运行 `olmo3:adapt`；SimpleQA、AlpacaEval 等 LLM judge 需要 OpenAI API key。安全评测使用 `hf-safety-eval`，普通模型示例上下文/生成上限为 2048，reasoning 模型注释建议 32768。

OLMo 2 套件命令组合 `core_9mcqa::olmes`、`mmlu:mc::olmes`、`olmo_2_generative::olmes` 与 `olmo_2_heldout::olmes`。TÜLU 3 使用 `tulu_3_dev` 与 `tulu_3_unseen`。OLMES 论文的标准十项多选由 core 9 MCQA 加 MMLU。早期 OLMo 论文结果使用 `main_suite::olmo1` 和 `mmlu::olmo1`。这些名字既是任务集合，也编码对应发布协议。

## New Models / Tasks

> Models can be directly referenced by their Hugging Face model path, or by their key in the model library.

模型可直接用 Hugging Face 路径，也可用 `oe_eval/configs/models.py` 的模型键；后者能附带最大上下文、局部路径等额外配置。默认模型类型使用 Hugging Face，也可用 `--model-type vllm`，或用 `--model-type litellm` 运行 API 模型。

```bash
olmes --model google/gemma-2b \
  --model-args '{"trust_remote_code": true, "add_bos_token": true}' ...
```

命令行可传任意 JSON 可解析模型参数。`oe-eval --list-models` 列出模型，后接正则子串可过滤。

> To specify a task, use the task library in `oe_eval/configs/tasks.py`.

任务库条目可指定 `task_name`、split、primary metric、shot 数、few-shot 来源和 metadata regime。例如 ARC RC 的 OLMES 版本使用 test split、`acc_uncond`、5-shot 与 `OLMES:ARC-Challenge`。此外可用 `context_kwargs` 控制 prompt，`generation_kwargs` 控制生成，`metric_kwargs` 控制指标；`primary_metric` 决定任务报告的主分数。

任务参数可由命令行全局覆盖，也能逐任务传 JSON。复杂命令建议先 `--dry-run`。`oe-eval --list-tasks` 列任务并支持正则过滤。

> To define a suite, use `oe_eval/configs/task_suites.py`.

套件配置列出子任务，并指定怎样聚合指标。例如 `mmlu:mc::olmes` 展开所有 MMLU 学科，主指标为 macro。套件不是简单字符串别名，它固定任务集合与汇总语义。

## Evaluation output

结果写入 `--output-dir`，详细格式见 `OUTPUT_FORMATS.md`。此外可用 `--gsheet` 写 Google Sheet（认证来自 `GDRIVE_SERVICE_ACCOUNT_JSON`），用 `--hf-save-dir` 写 Hugging Face dataset 目录，用 `--remote-output-dir` 写 S3 等远程位置，用 `--wandb-run-path` 写 W&B 项目。

`OUTPUT_FORMATS.md` 区分运行级配置/汇总、任务级指标与实例级预测。实例记录包含模型输入、目标、预测、logprob 或生成信息及指标细节，因而可以从总分下钻到样本。不同后端或任务不一定填充完全相同字段，消费端应读取 schema/version，而不是假设所有 JSON 行同构。

## 译校边界

本文保留 `task::variant`、metric key、模型 ID 与命令，不把“报告 max”解释为统计置信上界。README 中的外部模型、论文与 API 服务可能更新；固定提交只冻结 OLMES 侧配置。复现还需冻结数据集 revision、模型 revision、依赖与远程 judge。
