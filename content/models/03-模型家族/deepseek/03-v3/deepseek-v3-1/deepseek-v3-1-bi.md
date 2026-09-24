---
title: "3.3.7.2 · 对照：DeepSeek-V3.1"
category: "主流模型"
published: true
excerpt: "DeepSeek-V3.1 官方发布说明与模型卡的中英对照。英文段落后紧跟中文，公告图留在原位。"
---

# 3.3.7.2 · 对照：DeepSeek-V3.1

V3.1 没有单独的技术报告。下面两份都是官方原文：2025-08-21 的 API 文档公告，以及 Hugging Face 模型卡。

这一版没有独立技术报告。对照分两段：先是 2025-08-21 的发布说明，然后是模型卡。

## 1. Release note

Source: [https://api-docs.deepseek.com/news/news250821](https://api-docs.deepseek.com/news/news250821)

出处：[https://api-docs.deepseek.com/news/news250821](https://api-docs.deepseek.com/news/news250821)

# DeepSeek-V3.1 Release

DeepSeek-V3.1 发布说明。

Introducing DeepSeek-V3.1: our first step toward the agent era!

DeepSeek-V3.1 被官方称为迈向 Agent 时代的第一步。

- Hybrid inference: Think & Non-Think — one model, two modes
- Faster thinking: DeepSeek-V3.1-Think reaches answers in less time vs. DeepSeek-R1-0528
- Stronger agent skills: Post-training boosts tool use and multi-step agent tasks

三条卖点：一套模型里同时有思考和非思考两种模式；思考模式比 DeepSeek-R1-0528 更早给出答案；后训练加强了工具调用和多步 Agent。

Try it now — toggle Think/Non-Think via the "DeepThink" button: [https://chat.deepseek.com/](https://chat.deepseek.com/)

网页版用 DeepThink 按钮切换两种模式：[https://chat.deepseek.com/](https://chat.deepseek.com/)

## API Update

接口怎么接。

- deepseek-chat → non-thinking mode
- deepseek-reasoner → thinking mode
- 128K context for both
- Anthropic API format supported: [https://api-docs.deepseek.com/guides/anthropic_api](https://api-docs.deepseek.com/guides/anthropic_api)
- Strict Function Calling supported in Beta API: [https://api-docs.deepseek.com/guides/tool_calls](https://api-docs.deepseek.com/guides/tool_calls)
- More API resources, smoother API experience

`deepseek-chat` 走非思考，`deepseek-reasoner` 走思考，两边上下文都是 128K。另外支持 Anthropic 接口格式，Beta 里支持严格函数调用。公告还说接口资源变多、调用更顺，没有给具体配额。

## Tools & Agents Upgrades

工具和 Agent。

- Better results on SWE / Terminal-Bench
- Stronger multi-step reasoning for complex search tasks
- Big gains in thinking efficiency

SWE 和 Terminal-Bench 更好，复杂搜索的多步推理更强，思考效率提升很大。具体分数在下面三张图里，公告正文没有再写数字。

![](./images/v31-benchmark-1.webp)

图 1｜代码 Agent。DeepSeek-V3.1 / V3-0324 / R1-0528：SWE-bench Verified 66.0 / 45.4 / 44.6，SWE-bench Multilingual 54.5 / 29.3 / 30.5，Terminal-Bench 31.3 / 13.3 / 5.7。

![](./images/v31-benchmark-2.webp)

图 2｜搜索 Agent，只比 V3.1 与 R1-0528。BrowseComp 30.0 / 8.9，BrowseComp_zh 49.2 / 35.7，HLE 29.8 / 24.8，xbench-DeepSearch 71.2 / 55.0，Frames 83.7 / 82.0，SimpleQA 93.4 / 92.3，Seal0 42.6 / 29.7。其中 xbench-DeepSearch、Frames、Seal0 只出现在这张公告图里，模型卡的评测表没有这三行。

![](./images/v31-benchmark-3.webp)

图 3｜思考模式的输出 token。柱顶括号里是准确率。AIME 2025：R1-0528 为 22,615（87.5%），V3.1-Think 为 15,889（88.4%）。GPQA Diamond：7,678（81.0%）对 4,122（80.1%）。LiveCodeBench：19,352（73.3%）对 13,977（74.8%）。

## Model Update

模型本身改了什么。

- V3.1 Base: 840B tokens continued pretraining for long context extension on top of V3
- Tokenizer & chat template updated — new tokenizer config: [https://huggingface.co/deepseek-ai/DeepSeek-V3.1/blob/main/tokenizer_config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3.1/blob/main/tokenizer_config.json)
- V3.1 Base open-source weights: [https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base)
- V3.1 open-source weights: [https://huggingface.co/deepseek-ai/DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)

V3.1-Base 在 V3 上继续预训练 840B token，用来拉长上下文。分词器和 chat template 换了。Base 和正式权重都开源。

## Pricing Changes

价格。

- New pricing starts & off-peak discounts end at Sep 5th, 2025, 16:00 (UTC Time)
- Until then, APIs follow current pricing
- Pricing page: [https://api-docs.deepseek.com/quick_start/pricing/](https://api-docs.deepseek.com/quick_start/pricing/)

新价格从 2025-09-05 16:00（UTC）开始，同时停掉非高峰折扣。在那之前仍按当时的价格。

![](./images/v31-price.jpeg)

图 4｜公告里的价目图。数字以图为准。

## 2. Model card

Source: [https://huggingface.co/deepseek-ai/DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)

出处：[https://huggingface.co/deepseek-ai/DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)

# DeepSeek-V3.1

## Introduction

DeepSeek-V3.1 is a hybrid model that supports both thinking mode and non-thinking mode. Compared to the previous version, this upgrade brings improvements in multiple aspects:

DeepSeek-V3.1 是同时支持思考和非思考的混合模型。相对上一版，这一次的改动有几处。

- **Hybrid thinking mode**: One model supports both thinking mode and non-thinking mode by changing the chat template.
- **Smarter tool calling**: Through post-training optimization, the model's performance in tool usage and agent tasks has significantly improved.
- **Higher thinking efficiency**: DeepSeek-V3.1-Think achieves comparable answer quality to DeepSeek-R1-0528, while responding more quickly.

混合思考：换 chat template 就能在两种模式之间切换。工具调用：后训练把工具使用和 Agent 任务做上去了。思考效率：V3.1-Think 的答案质量与 R1-0528 相当，但回应更快。

DeepSeek-V3.1 is post-trained on the top of DeepSeek-V3.1-Base, which is built upon the original V3 base checkpoint through a two-phase long context extension approach, following the methodology outlined in the original DeepSeek-V3 report. We have expanded our dataset by collecting additional long documents and substantially extending both training phases. The 32K extension phase has been increased 10-fold to 630B tokens, while the 128K extension phase has been extended by 3.3x to 209B tokens.

V3.1 的后训练接在 V3.1-Base 上。Base 从原始 V3 底座出发，按 V3 报告里的两阶段长上下文方法继续训。官方补了更多长文档，两段都加长了：32K 阶段扩大 10 倍，到 630B token；128K 阶段扩大 3.3 倍，到 209B token。

Additionally, DeepSeek-V3.1 is trained using the **UE8M0 FP8 scale data format on both model weights and activations** to ensure compatibility with microscaling data formats. Please refer to [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM) for more details.

权重和激活的 FP8 scale 都改成 UE8M0，为的是和微缩数据格式对齐。细节指向 [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM)。

## Model Downloads

| **Model** | **#Total Params** | **#Activated Params** | **Context Length** | **Download** |
| :------------: | :------------: | :------------: | :------------: | :------------: |
| DeepSeek-V3.1-Base | 671B | 37B | 128K | [HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base) \| [ModelScope](https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1-Base) |
| DeepSeek-V3.1 | 671B | 37B | 128K | [HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-V3.1) \| [ModelScope](https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1) |

表 1｜下载表。Base 和正式版都是 671B 总参数、37B 激活、128K 上下文。

## Chat Template

The details of our chat template is described in `tokenizer_config.json` and `assets/chat_template.jinja`. Here is a brief description.

模板细节在 `tokenizer_config.json` 和 `assets/chat_template.jinja`。下面是模型卡自己的简写。

### Non-Thinking

#### First-Turn

Prefix:

`<｜begin▁of▁sentence｜>{system prompt}<｜User｜>{query}<｜Assistant｜></think>`

With the given prefix, DeepSeek V3.1 generates responses to queries in non-thinking mode. Unlike DeepSeek V3, it introduces an additional token `</think>`.

非思考的首轮前缀在 `<｜Assistant｜>` 后面直接接 `</think>`。相对 V3，多了这一个 token。模型被直接告知思考已经结束。

#### Multi-Turn

Context:

`<｜begin▁of▁sentence｜>{system prompt}<｜User｜>{query}<｜Assistant｜></think>{response}<｜end▁of▁sentence｜>...<｜User｜>{query}<｜Assistant｜></think>{response}<｜end▁of▁sentence｜>`

Prefix:

`<｜User｜>{query}<｜Assistant｜></think>`

By concatenating the context and the prefix, we obtain the correct prompt for the query.

多轮时，历史轮只保留 `</think>` 和最终回答。把上面的 context 和 prefix 接起来，就是下一轮的提示。

### Thinking

#### First-Turn

Prefix:

`<｜begin▁of▁sentence｜>{system prompt}<｜User｜>{query}<｜Assistant｜><think>`

The prefix of thinking mode is similar to DeepSeek-R1.

思考模式的首轮前缀接近 R1：`<｜Assistant｜>` 后面接 `<think>`。

#### Multi-Turn

Context:

`<｜begin▁of▁sentence｜>{system prompt}<｜User｜>{query}<｜Assistant｜></think>{response}<｜end▁of▁sentence｜>...<｜User｜>{query}<｜Assistant｜></think>{response}<｜end▁of▁sentence｜>`

Prefix:

`<｜User｜>{query}<｜Assistant｜><think>`

The multi-turn template is the same with non-thinking multi-turn chat template. It means the thinking token in the last turn will be dropped but the `</think>` is retained in every turn of context.

思考模式的多轮 context 和非思考一样：上一轮的思考内容丢掉，每一轮上下文里仍留着 `</think>`。当前轮的 prefix 才重新打开 `<think>`。

### ToolCall

Toolcall is supported in non-thinking mode. The format is:

`<｜begin▁of▁sentence｜>{system prompt}\n\n{tool_description}<｜User｜>{query}<｜Assistant｜></think>`

where the tool_description is:

工具调用只在非思考模式里支持。工具说明插在 system prompt 和用户问题之间，助手前缀仍然以 `</think>` 结尾。

```
## Tools
You have access to the following tools:

### {tool_name1}
Description: {description}

Parameters: {json.dumps(parameters)}

IMPORTANT: ALWAYS adhere to this exact format for tool use:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>tool_call_name<｜tool▁sep｜>tool_call_arguments<｜tool▁call▁end｜>{additional_tool_calls}<｜tool▁calls▁end｜>

Where:
- `tool_call_name` must be an exact match to one of the available tools
- `tool_call_arguments` must be valid JSON that strictly follows the tool's Parameters Schema
- For multiple tool calls, chain them directly without separators or spaces
```

函数名必须和可用工具完全一致，参数必须是符合 schema 的 JSON。多次调用直接串联，中间不加分隔符或空格。

### Code-Agent

We support various code agent frameworks. Please refer to the above toolcall format to create your own code agents. An example is shown in `assets/code_agent_trajectory.html`.

代码 Agent 沿用上面的工具格式。示例在仓库的 `assets/code_agent_trajectory.html`。

### Search-Agent

We design a specific format for searching toolcall in thinking mode, to support search agent.

官方为思考模式单独设计了搜索工具的调用格式。

For complex questions that require accessing external or up-to-date information, DeepSeek-V3.1 can leverage a user-provided search tool through a multi-turn tool-calling process.

需要外部或最新信息时，模型可以按用户提供的搜索工具做多轮调用。

Please refer to the `assets/search_tool_trajectory.html` and `assets/search_python_tool_trajectory.html` for the detailed template.

具体模板见 `assets/search_tool_trajectory.html` 和 `assets/search_python_tool_trajectory.html`。

## Evaluation

| Category | Benchmark (Metric) | DeepSeek V3.1-NonThinking | DeepSeek V3 0324 | DeepSeek V3.1-Thinking | DeepSeek R1 0528 |
|---|---|---|---|---|---|
| General | MMLU-Redux (EM) | 91.8 | 90.5 | 93.7 | 93.4 |
| General | MMLU-Pro (EM) | 83.7 | 81.2 | 84.8 | 85.0 |
| General | GPQA-Diamond (Pass@1) | 74.9 | 68.4 | 80.1 | 81.0 |
| General | Humanity's Last Exam (Pass@1) | - | - | 15.9 | 17.7 |
| Search Agent | BrowseComp | - | - | 30.0 | 8.9 |
| Search Agent | BrowseComp_zh | - | - | 49.2 | 35.7 |
| Search Agent | Humanity's Last Exam (Python + Search) | - | - | 29.8 | 24.8 |
| Search Agent | SimpleQA | - | - | 93.4 | 92.3 |
| Code | LiveCodeBench (2408-2505) (Pass@1) | 56.4 | 43.0 | 74.8 | 73.3 |
| Code | Codeforces-Div1 (Rating) | - | - | 2091 | 1930 |
| Code | Aider-Polyglot (Acc.) | 68.4 | 55.1 | 76.3 | 71.6 |
| Code Agent | SWE Verified (Agent mode) | 66.0 | 45.4 | - | 44.6 |
| Code Agent | SWE-bench Multilingual (Agent mode) | 54.5 | 29.3 | - | 30.5 |
| Code Agent | Terminal-bench (Terminus 1 framework) | 31.3 | 13.3 | - | 5.7 |
| Math | AIME 2024 (Pass@1) | 66.3 | 59.4 | 93.1 | 91.4 |
| Math | AIME 2025 (Pass@1) | 49.8 | 51.3 | 88.4 | 87.5 |
| Math | HMMT 2025 (Pass@1) | 33.5 | 29.2 | 84.2 | 79.4 |

表 2｜模型卡评测。四列依次是 V3.1 非思考、V3-0324、V3.1 思考、R1-0528。横线表示模型卡该格留空。

Note:

- Search agents are evaluated with our internal search framework, which uses a commercial search API + webpage filter + 128K context window. Seach agent results of R1-0528 are evaluated with a pre-defined workflow.
- SWE-bench is evaluated with our internal code agent framework.
- HLE is evaluated with the text-only subset.

搜索 Agent 用官方内部框架：商业搜索 API、网页过滤、128K 上下文。R1-0528 的搜索分数用预定义工作流测。原文把 Search 写成了 Seach。SWE-bench 用内部代码 Agent 框架。HLE 只测纯文本子集。

### Usage Example

```python
import transformers

tokenizer = transformers.AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V3.1")

messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Who are you?"},
    {"role": "assistant", "content": "<think>Hmm</think>I am DeepSeek"},
    {"role": "user", "content": "1+1=?"}
]

tokenizer.apply_chat_template(messages, tokenize=False, thinking=True, add_generation_prompt=True)
# '<｜begin▁of▁sentence｜>You are a helpful assistant<｜User｜>Who are you?<｜Assistant｜></think>I am DeepSeek<｜end▁of▁sentence｜><｜User｜>1+1=?<｜Assistant｜><think>'

tokenizer.apply_chat_template(messages, tokenize=False, thinking=False, add_generation_prompt=True)
# '<｜begin▁of▁sentence｜>You are a helpful assistant<｜User｜>Who are you?<｜Assistant｜></think>I am DeepSeek<｜end▁of▁sentence｜><｜User｜>1+1=?<｜Assistant｜></think>'
```

`thinking=True` 时，当前轮前缀以 `<think>` 结尾；`thinking=False` 时以 `</think>` 结尾。历史轮里的思考内容都被收成 `</think>`。

## How to Run Locally

The model structure of DeepSeek-V3.1 is the same as DeepSeek-V3. Please visit [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) repo for more information about running this model locally.

结构与 V3 相同。本地运行的说明指向 [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) 仓库。

**Usage Recommendations:**

1. **The `mlp.gate.e_score_correction_bias` parameters should be loaded and computed in FP32 precision.**
2. **Ensure that FP8 model weights and activations are formatted using the UE8M0 scale format.**

两条硬要求：`mlp.gate.e_score_correction_bias` 用 FP32 加载和计算；FP8 权重与激活按 UE8M0 scale 格式化。

## License

This repository and the model weights are licensed under the MIT License.

仓库和权重都是 MIT。

## Citation

The model card cites the V3 technical report, not a V3.1 paper:

模型卡引用的是 V3 技术报告，没有 V3.1 自己的论文。

```
@misc{deepseekai2024deepseekv3technicalreport,
      title={DeepSeek-V3 Technical Report},
      author={DeepSeek-AI},
      year={2024},
      eprint={2412.19437},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2412.19437},
}
```

## Contact

If you have any questions, please raise an issue or contact us at [service@deepseek.com](mailto:service@deepseek.com).

联系方式是 [service@deepseek.com](mailto:service@deepseek.com)。
