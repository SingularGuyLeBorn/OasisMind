---
title: "Qwen3-235B-A22B-Instruct-2507 · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen3-235B-A22B-Instruct-2507 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 17 -->

![Image block](images/p01-image.png)

![Image block](images/p01-image-2.png)

![Image block](images/p01-s.png)

S

Search models, datasets, users...

搜索模型, 数据集, 用户...

Follow Qwen 107k

关注 Qwen 107k

Like

803

赞 803

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

[Transformers](https://huggingface.co/models?library=transformers)

[Safetensors](https://huggingface.co/models?library=safetensors)

[qwen3\_moe](https://huggingface.co/models?other=qwen3_moe)

[conversational](https://huggingface.co/models?other=conversational)

[Eval Results](https://huggingface.co/models?other=eval-results)

arxiv:5 papers

License: apache-2.0

许可证: apache-2.0

Deploy

部署

Copy to bucket

复制到 bucket

NEW

Use this model

使用此模型

[**Model card**](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507)

[Files](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507/tree/main)

[**xet**](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507/tree/main)

![Image block](images/p01-community.png)

Community

社区

Downloads last month

上月下载量

211,272

**Safetensors**

Model size

模型规模

235B params

235B 参数

Tensor type

张量类型

BF16

<u>Chat template</u>

<u>对话模板</u>

<u>Files info</u>

<u>文件信息</u>

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers) 推理服务商

Novita

+1

[Text Generation](https://huggingface.co/tasks/text-generation)

Examples

示例

Input a message to start chatting with **Qwen/Qwen3-235B-A22B-Instruct-2507**.

输入一条消息, 开始与 **Qwen/Qwen3-235B-A22B-Instruct-2507** 对话.

Your prompt here...

在此输入提示...

Send

发送

View Code

查看代码

[Compare providers](https://huggingface.co/inference/models?model=Qwen%2FQwen3-235B-A22B-Instruct-2507)

> **想:** 换成 `config_1m.json` 之后, 概览里的原生 262,144 还算不算同一套长度外推 / 稀疏注意力参数?
> 不算同一套部署配置. Overview 写 Context Length 为 **262,144 natively and extendable up to 1,010,000 tokens**; Step 1 要求用 `config_1m.json` 替换 `config.json`, 并写明该文件 「includes the config for length extrapolation and sparse attention」. 1M 路径靠另换配置启用外推与稀疏, 不是默认原生 config 已带齐那套参数.

<!-- page 2 of 17 -->

## Model tree for Qwen/Qwen3-235B-A22B-Instruct-2507 模型树

**Adapters** [9 models](https://huggingface.co/models?other=base_model:adapter:Qwen/Qwen3-235B-A22B-Instruct-2507)

适配器 [9 models](https://huggingface.co/models?other=base_model:adapter:Qwen/Qwen3-235B-A22B-Instruct-2507)

**Finetunes** [20 models](https://huggingface.co/models?other=base_model:finetune:Qwen/Qwen3-235B-A22B-Instruct-2507)

微调衍生 [20 models](https://huggingface.co/models?other=base_model:finetune:Qwen/Qwen3-235B-A22B-Instruct-2507)

**Quantizations** [67 models](https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen3-235B-A22B-Instruct-2507)

量化衍生 [67 models](https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen3-235B-A22B-Instruct-2507)

## Spaces using Qwen/Qwen3-235B-A22B-Instruct-2507 100 使用该模型的 Spaces

[📚 Fugmek25/hf-daily-papers-ja](https://huggingface.co/spaces/Fugmek25/hf-daily-papers-ja)

[✒️ 💨 multimodalart/Qwen-Image-Edit-Fast](https://huggingface.co/spaces/multimodalart/Qwen-Image-Edit-Fast)

[🏢 burtenshaw/karpathy-llm-council](https://huggingface.co/spaces/burtenshaw/karpathy-llm-council)

[🖼 ️ multimodalart/Qwen-Image-Fast](https://huggingface.co/spaces/multimodalart/Qwen-Image-Fast)

[✒️ linoyts/Qwen-Image-Edit-Inpaint](https://huggingface.co/spaces/linoyts/Qwen-Image-Edit-Inpaint)

\+ 95 Spaces

品 **Collection including Qwen/Qwen3-235B-A22B-Instruct-2507**

收录该模型的合集

## [Qwen3 Collection](https://huggingface.co/collections/Qwen/qwen3)

[84 items • Updated Dec 31, 2025 • 1.86k](https://huggingface.co/collections/Qwen/qwen3)

## Papers for Qwen/Qwen3-235B-A22B-Instruct-2507 相关论文

### [Qwen3 Technical Report](https://huggingface.co/papers/2505.09388)

```txt
Paper • 2505.09388 • Published May 14, 2025 • △ 347
```

### [Qwen2.5-1M Technical Report](https://huggingface.co/papers/2501.15383)

```txt
Paper • 2501.15383 • Published Jan 26, 2025 • △ 71
```

[**MInference 1.0: Accelerating Pre-filling for Long-Context LLMs via Dynamic Sparse Atte…**](https://huggingface.co/papers/2407.02490)

[Paper • 2407.02490 • Published Jul 2, 2024 • 25](https://huggingface.co/papers/2407.02490)

[**RULER: What's the Real Context Size of Your Long-Context Language Models?**](https://huggingface.co/papers/2404.06654)

```txt
Paper • 2404.06654 • Published Apr 9, 2024 • △ 42
```

### [Training-Free Long-Context Scaling of Large Language Models](https://huggingface.co/papers/2402.17463)

```txt
Paper • 2402.17463 • Published Feb 27, 2024 • △ 24
```

## Evaluation results 评测结果

> **问:** 相关论文列表里既有 Qwen3 TR 又有 Qwen2.5-1M, 这份卡是不是把底座与长上下文外推拆成两篇引用?
> 是. 卡末 Citation 也同时给了 `2505.09388` 与 `2501.15383`; 1M 路径正文还指向 DCA 与 MInference 两篇外链.

<!-- page 3 of 17 -->

[TIGER-Lab/MMLU-Pro](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro) · Mmlu Pro [source](https://huggingface.co/datasets/evaleval/EEE_datastore/blob/192329fb7d6b15b7b0936a1a58ae862aa7e8ba24/flat/objects/df/98/df9861f7-59cf-4b5e-8988-571481f47d14.json) [leaderboard](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro?eval_result=Qwen/Qwen3-235B-A22B-Instruct-2507&leaderboard_task_id=mmlu_pro)

83

# Qwen3-235B-A22B-Instruct-2507

Qwen Chat

## Highlights 亮点

We introduce the updated version of the **Qwen3-235B-A22B non-thinking mode**, named **Qwen3-235B-A22B-Instruct-2507**, featuring the following key enhancements:

我们发布 **Qwen3-235B-A22B non-thinking mode** 的更新版, 命名为 **Qwen3-235B-A22B-Instruct-2507**, 主要增强如下:

**Significant improvements** in general capabilities, including **instruction following, logical reasoning, text comprehension, mathematics, science, coding and tool usage**.

通用能力有**显著提升**, 覆盖**指令遵循, 逻辑推理, 文本理解, 数学, 科学, 编程与工具使用**.

**Substantial gains** in long-tail knowledge coverage across **multiple languages**.

跨**多语言**的长尾知识覆盖有**实质增益**.

**Markedly better alignment** with user preferences in **subjective and open-ended tasks**, enabling more helpful responses and higher-quality text generation.

在**主观与开放式任务**上与用户偏好的对齐**明显更好**, 回复更有帮助, 文本生成质量更高.

**Enhanced capabilities** in **256K long-context understanding**.

256K 长上下文理解能力增强.

![Chart block](images/p03-model-overview.png)

> **核对:** 「non-thinking mode」 更新版, 是不是意味着这张卡不谈 thinking / `<think>` 输出路径?
> 是. 后文 NOTE 写明只支持 non-thinking, 且不再生成 `<think></think>` 块; 也写明不必再设 `enable_thinking=False`.

<!-- page 4 of 17 -->

## Model Overview 模型概览

Qwen3-235B-A22B-Instruct-2507 has the following features: 该型号具备以下特征:

Type: Causal Language Models

类型: 因果语言模型

Training Stage: Pretraining & Post-training

训练阶段: 预训练与后训练

Number of Parameters: 235B in total and 22B activated

参数量: 总计 235B, 激活 22B

Number of Paramaters (Non-Embedding): 234B

参数量 (不含嵌入): 234B

Number of Layers: 94

层数: 94

Number of Attention Heads (GQA): 64 for Q and 4 for KV

注意力头数 (GQA): Q 为 64, KV 为 4

Number of Experts: 128

专家数: 128

Number of Activated Experts: 8

激活专家数: 8

Context Length: **262,144 natively and extendable up to 1,010,000 tokens**

上下文长度: **原生 262,144, 可外推至 1,010,000 tokens**

**NOTE: This model supports only non-thinking mode and does not generate &lt;think&gt; &lt;/think&gt; blocks in its output. Meanwhile, specifying enable\_thinking=False is no longer required.**

**注意: 该模型只支持 non-thinking mode, 输出中不会生成 &lt;think&gt; &lt;/think&gt; 块. 同时, 不再需要指定 enable\_thinking=False.**

For more details, including benchmark evaluation, hardware requirements, and inference performance, please refer to our [blog](https://qwenlm.github.io/blog/qwen3/), [GitHub](https://github.com/QwenLM/Qwen3), and [Documentation](https://qwen.readthedocs.io/en/latest/).

更多细节, 含基准评测, 硬件需求与推理性能, 见 [blog](https://qwenlm.github.io/blog/qwen3/), [GitHub](https://github.com/QwenLM/Qwen3), 与 [Documentation](https://qwen.readthedocs.io/en/latest/).

## Performance 性能

|  | Deepseek-V3-0324 | GPT-4o-0327 | Claude Opus 4 Non-thinking | Kimi K2 | Qwen3-235B-A22B Non-thinking | Qwen3-235B-A22B-Instruct-2507 |
| --- | --- | --- | --- | --- | --- | --- |
| Knowledge |  |  |  |  |  |  |
| MMLU-Pro | 81.2 | 79.8 | 86.6 | 81.1 | 75.2 | 83.0 |
| MMLU-Redux | 90.4 | 91.3 | 94.2 | 92.7 | 89.2 | 93.1 |

> **看表:** 相对本系列 Non-thinking 旧栏, MMLU-Pro 从 75.2 到 83.0, 是否把 Claude Opus 4 Non-thinking 的 86.6 也超过了?
> 没有. 83.0 高于旧栏 75.2 与 Deepseek-V3-0324 的 81.2, 仍低于 Claude Opus 4 Non-thinking 的 86.6.

<!-- page 5 of 17 -->

|  | Deepseek-V3-0324 | GPT-4o-0327 | ClaudeOpus4Non-thinking | KimiK2 | Qwen3-235B-A22BNon-thinking | Qwen3-235B-A22B-Instruct-2507 |
| --- | --- | --- | --- | --- | --- | --- |
| GPQA | 68.4 | 66.9 | 74.9 | 75.1 | 62.9 | 77.5 |
| SuperGPQA | 57.3 | 51.0 | 56.5 | 57.2 | 48.2 | 62.6 |
| SimpleQA | 27.2 | 40.3 | 22.8 | 31.0 | 12.2 | 54.3 |
| CSimpleQA | 71.1 | 60.2 | 68.0 | 74.5 | 60.8 | 84.3 |
| Reasoning |  |  |  |  |  |  |
| AIME25 | 46.6 | 26.7 | 33.9 | 49.5 | 24.7 | 70.3 |
| HMMT25 | 27.5 | 7.9 | 15.9 | 38.8 | 10.0 | 55.4 |
| ARC-AGI | 9.0 | 8.8 | 30.3 | 13.3 | 4.3 | 41.8 |
| ZebraLogic | 83.4 | 52.6 | - | 89.0 | 37.7 | 95.0 |
| LiveBench20241125 | 66.9 | 63.7 | 74.6 | 76.4 | 62.5 | 75.4 |
| Coding |  |  |  |  |  |  |
| LiveCodeBenchv6(25.02-25.05) | 45.2 | 35.8 | 44.6 | 48.9 | 32.9 | 51.8 |
| MultiPL-E | 82.2 | 82.7 | 88.5 | 85.7 | 79.3 | 87.9 |
| Aider-Polyglot | 55.1 | 45.3 | 70.7 | 59.0 | 59.6 | 57.3 |
| Alignment |  |  |  |  |  |  |
| IFEval | 82.3 | 83.9 | 87.4 | 89.8 | 83.2 | 88.7 |
| Arena-Hardv2* | 45.6 | 61.9 | 51.5 | 66.1 | 52.0 | 79.2 |
| Creative Writing v3 | 81.6 | 84.9 | 83.8 | 88.1 | 80.4 | 87.5 |

> **确认:** SimpleQA 从旧 Non-thinking 的 12.2 跳到 54.3, 是不是表内最大相对跳变之一?
> 是. 同组知识项里 SimpleQA 与 CSimpleQA (60.8→84.3) 跳幅都很显眼; 源文未给消融, 只能当对照分数读.

> **回看:** Aider-Polyglot 旧栏 59.6, 新栏 57.3, Claude 是 70.7, 是不是 Coding 组并非全线上涨?
> 是. LiveCodeBenchv6 与 MultiPL-E 上涨, Aider-Polyglot 相对旧 Non-thinking 略降, 且仍低于 Claude Opus 4 Non-thinking.

<!-- page 6 of 17 -->

|  | Deepseek-V3-0324 | GPT-4o-0327 | ClaudeOpus4Non-thinking | KimiK2 | Qwen3-235B-A22BNon-thinking | Qwen3-235B-A22B-Instruct-2507 |
| --- | --- | --- | --- | --- | --- | --- |
| WritingBench | 74.5 | 75.5 | 79.2 | 86.2 | 77.0 | 85.2 |
| Agent |  |  |  |  |  |  |
| BFCL-v3 | 64.7 | 66.5 | 60.1 | 65.2 | 68.0 | 70.9 |
| TAU1-Retail | 49.6 | 60.3# | 81.4 | 70.7 | 65.2 | 71.3 |
| TAU1-Airline | 32.0 | 42.8# | 59.6 | 53.5 | 32.0 | 44.0 |
| TAU2-Retail | 71.1 | 66.7# | 75.5 | 70.6 | 64.9 | 74.6 |
| TAU2-Airline | 36.0 | 42.0# | 55.5 | 56.5 | 36.0 | 50.0 |
| TAU2-Telecom | 34.0 | 29.8# | 45.2 | 65.8 | 24.6 | 32.5 |
| Multilingualism |  |  |  |  |  |  |
| MultiIF | 66.5 | 70.4 | - | 76.2 | 70.2 | 77.5 |
| MMLU-ProX | 75.8 | 76.2 | - | 74.5 | 73.2 | 79.4 |
| INCLUDE | 80.1 | 82.1 | - | 76.9 | 75.6 | 79.5 |
| PolyMATH | 32.2 | 25.5 | 30.0 | 44.8 | 27.0 | 50.2 |

\*: For reproducibility, we report the win rates evaluated by GPT-4.1.

\*: 为可复现, 我们报告由 GPT-4.1 评定的胜率.

#: Results were generated using GPT-4o-20241120, as access to the native function calling API of GPT-4o-0327 was unavailable.

#: 结果用 GPT-4o-20241120 生成, 因为无法访问 GPT-4o-0327 的原生 function calling API.

## Quickstart 快速开始

The code of Qwen3-MoE has been in the latest Hugging Face **transformers** and we advise you to use the latest version of **transformers**.

Qwen3-MoE 的代码已进入最新 Hugging Face **transformers**, 建议使用最新版 **transformers**.

> **停一下:** TAU2-Telecom 新栏 32.5 仍低于 Kimi K2 的 65.8 与 Claude 的 45.2, Agent 组是不是也不能读成全面领先?
> 是. BFCL-v3 与若干 TAU 零售/航司项上涨, 但 TAU2-Telecom 仍明显落后 Kimi K2; 脚注还提醒 GPT-4o 列用了不同 API 日期.

<!-- page 7 of 17 -->

With **transformers<4.51.0**, you will encounter the following error:

若使用 **transformers<4.51.0**, 会遇到如下错误:

```yaml
KeyError: 'qwen3_moe'
```

The following contains a code snippet illustrating how to use the model generate content based on given inputs.

下面给出一段代码示例, 说明如何用该模型基于给定输入生成内容.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-235B-A22B-Instruct-2507"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

# prepare the model input
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

# conduct text completion
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=16384
)
```

> **再看:** Arena-Hardv2* 的 79.2 能否和同表 IFEval 的 88.7 按同一套准确率口径横比?
> 不能. 脚注 * 写明 「For reproducibility, we report the win rates evaluated by GPT-4.1.」; IFEval 无星号, 是另一套对齐指标. 同表并列不代表同一评测协议.

<!-- page 8 of 17 -->

```python
output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()

content = tokenizer.decode(output_ids, skip_special_tokens=True)

print("content:", content)
```

For deployment, you can use **sglang>=0.4.6.post1** or **vllm>=0.8.5** or to create an OpenAI-compatible API endpoint:

部署可用 **sglang>=0.4.6.post1** 或 **vllm>=0.8.5** 创建 OpenAI 兼容 API 端点:

```txt
- SGLang:
```

```batch
python -m sglang.launch_server --model-path Qwen/Qwen3-235B-A22B-I
```

```txt
• vLLM:
```

```txt
vllm serve Qwen/Qwen3-235B-A22B-Instruct-2507 --tensor-parallel-siz
```

**Note: If you encounter out-of-memory (OOM) issues, consider reducing the context length to a shorter value, such as 32,768.**

**注意: 若遇到 out-of-memory (OOM), 可考虑把上下文长度降到更短, 例如 32,768.**

For local use, applications such as Ollama, LMStudio, MLX-LM, llama.cpp, and KTransformers have also supported Qwen3.

本地使用方面, Ollama, LMStudio, MLX-LM, llama.cpp, KTransformers 等应用也已支持 Qwen3.

## Agentic Use 智能体用法

Qwen3 excels in tool calling capabilities. We recommend using [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) to make the best use of agentic ability of Qwen3. Qwen-Agent encapsulates tool-calling templates and tool-calling parsers internally, greatly reducing coding complexity.

Qwen3 在工具调用上表现突出. 建议用 [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) 发挥其 agentic 能力. Qwen-Agent 内部封装了工具调用模板与解析器, 大幅降低编码复杂度.

To define the available tools, you can use the MCP configuration file, use the integrated tool of Qwen-Agent, or integrate other tools by yourself.

定义可用工具时, 可用 MCP 配置文件, 用 Qwen-Agent 内置工具, 或自行集成其他工具.

<!-- page 9 of 17 -->

```python
from qwen_agent.agents import Assistant

# Define LLM
llm_cfg = {
    'model': 'Qwen3-235B-A22B-Instruct-2507',


    # Use a custom endpoint compatible with OpenAI API:
    'model_server': 'http://localhost:8000/v1',  # api_base
    'api_key': 'EMPTY',
}

# Define Tools
tools = [
    {'mcpServers': {  # You can specify the MCP configuration file
        'time': {
            'command': 'uvx',
            'args': ['mcp-server-time', '--local-timezone=Asia/Shar
        },
        "fetch": {
            "command": "uvx",
            "args": ["mcp-server-fetch"]
        }
    }
},
'code_interpreter',  # Built-in tools

# Define Agent
bot = Assistant(llm=llm_cfg, function_list=tools)

# Streaming generation
messages = [{"role': 'user', 'content': 'https://qwenlm.github.io/blog,
for responses in bot.run(messages=messages):
    pass
print(responses)
```

<!-- page 10 of 17 -->

## Processing Ultra-Long Texts 处理超长文本

To support **ultra-long context processing** (up to **1 million tokens**), we integrate two key techniques:

为支持**超长上下文处理**(最高约 **1 million tokens**), 我们集成两项关键技术:

[Dual Chunk Attention](https://arxiv.org/abs/2402.17463) **(DCA)**: A length extrapolation method that splits long sequences into manageable chunks while preserving global coherence.

[Dual Chunk Attention](https://arxiv.org/abs/2402.17463) **(DCA)**: 一种长度外推方法, 把长序列切成可管理的块, 同时保持全局一致性.

[MInference](https://arxiv.org/abs/2407.02490): A sparse attention mechanism that reduces computational overhead by focusing on critical token interactions.

[MInference](https://arxiv.org/abs/2407.02490): 一种稀疏注意力机制, 通过聚焦关键 token 交互降低计算开销.

Together, these innovations significantly improve both **generation quality** and **inference efficiency** for sequences beyond 256K tokens. On sequences approaching 1M tokens, the system achieves up to a **3× speedup** compared to standard attention implementations.

二者合用, 对超过 256K tokens 的序列同时明显改善**生成质量**与**推理效率**. 在接近 1M tokens 的序列上, 相对标准注意力实现, 系统最高可获得约 3× 加速.

For full technical details, see the [Qwen2.5-1M Technical Report](https://arxiv.org/abs/2501.15383).

完整技术细节见 [Qwen2.5-1M Technical Report](https://arxiv.org/abs/2501.15383).

### How to Enable 1M Token Context 如何启用 1M Token 上下文

To effectively process a 1 million token context, users will require approximately 1000 GB of total GPU memory. This accounts for model weights, KV-cache storage, and peak activation memory demands.

要有效处理 1 million token 上下文, 用户大约需要合计 1000 GB 的 GPU 显存. 这覆盖模型权重, KV-cache 存储与峰值激活显存需求.

#### Step 1: Update Configuration File 步骤 1: 更新配置文件

Download the model and replace the content of your **config.json** with **config\_1m.json**, which includes the config for length extrapolation and sparse attention.

下载模型, 并用 **config\_1m.json** 替换 **config.json** 内容; 其中含长度外推与稀疏注意力配置.

```shell
export MODELNAME=Qwen3-235B-A22B-Instruct-2507
huggingface-cli download Qwen/\${MODELNAME} --local-dir \${MODELNAME}
mv \${MODELNAME}/config.json \${MODELNAME}/config.json.bak
mv \${MODELNAME}/config_1m.json \${MODELNAME}/config.json
```

#### Step 2: Launch Model Server 步骤 2: 启动模型服务

> **问:** 原生窗口写 262,144, 亮点又写 256K, 1M 路径另要换 config\_1m.json, 三者是不是同一条产品线的不同档?
> 是. 原生约 256K/262,144; 冲 1,010,000 要换 1M 配置并开 DCA / 稀疏注意力服务参数, 不是默认 config 自动到 1M.

<!-- page 11 of 17 -->

![Image block](images/p11-after-updating-the-config-proceed-with-either-vllm-or.png)

After updating the config, proceed with either **vLLM** or **SGLang** for serving the model.

更新配置后, 用 **vLLM** 或 **SGLang** 任一路径提供模型服务.

**Option 1: Using vLLM**

**选项 1: 使用 vLLM**

To run Qwen with 1M context support:

要以 1M 上下文支持运行 Qwen:

```shell
pip install -U vllm \
    --torch-backend=auto \
    --extra-index-url https://wheels.vllm.ai/nightly
```

Then launch the server with Dual Chunk Flash Attention enabled:

然后启用 Dual Chunk Flash Attention 启动服务:

```shell
VLLM_ATTENTION_BACKEND=DUAL_chunk_FLASH_ATTN VLLM_USE_V1=0 \
vllm serve ./Qwen3-235B-A22B-Instruct-2507 \
    --tensor-parallel-size 8 \
    --max-model-len 1010000 \
    --enable-chunked-prefill \
    --max-num-batched-tokens 131072 \
    --enforce-eager \
    --max-num-seqs 1 \
    --gpu-memory-utilization 0.85
```

Key Parameters

关键参数

| Parameter | Purpose |
| --- | --- |
| VLLM_ATTENTION_BACKEND=DUAL_CHUNK_FLASH_ATTN | Enablesthe customattention kernelforlong-context efficiency |
| --max-model-len 1010000 | Setsmaximumcontextlengthto~1Mtokens |
| --enable-chunked-prefill | Allowschunkedprefillforvery longinputs(avoidsOOM) |

<!-- page 12 of 17 -->

| Parameter | Purpose |
| --- | --- |
| --max-num-batched-tokens 131072 | Controlsbatchsize during prefill;balancesthroughputand memory |
| --enforce-eager | DisablesCUDAgraphcapture (requiredfordualchunk attention) |
| --max-num-seqs 1 | Limitsconcurrentsequences due toextreme memoryusage |
| --gpu-memory-utilization 0.85 | Setthe fractionofGPUmemory tobe usedforthe model executor |

**Option 2: Using SGLang 选项 2: 使用 SGLang**

First, clone and install the specialized branch:

先克隆并安装专用分支:

```batch
git clone https://github.com/sgl-project/sglang.git
cd sglang
pip install -e "python[all]"
```

Launch the server with DCA support:

以 DCA 支持启动服务:

```shell
python3 -m sglang.launch_server \
    --model-path ./Qwen3-235B-A22B-Instruct-2507 \
    --context-length 1010000 \
    --mem-frac 0.75 \
    --attention-backend dual_chunk_flash_attn \
    --tp 8 \
    --chunked-prefill-size 131072
```

Key Parameters

关键参数

> **拆开:** vLLM 路径强制 `--max-num-seqs 1` 且 `--enforce-eager`, 是不是为了 1M 显存与 dual chunk 内核约束而牺牲吞吐?
> 是. 表意写明极端显存下限制并发, 并因 dual chunk attention 需要关闭 CUDA graph capture.

<!-- page 13 of 17 -->

| Parameter | Purpose |
| --- | --- |
| --attention-backend | ActivatesDualChunkFlashAttention |
| dual_chunk_flash_attn |  |
| --context-length 1010000 | Definesmaxinputlength |
| --mem-frac 0.75 | The fractionofthe memoryusedforstaticallocation (modelweightsandKVcache memorypool).Usea smallervalue ifyousee out-of-memoryerrors. |
| --tp 8 | Tensorparallelismsize (matchesmodelsharding) |
| --chunked-prefill-size | Prefillchunksize forhandlinglonginputswithoutOOM |
| 131072 |  |

#### Troubleshooting: 排障

1. Encountering the error: "The model's max sequence length (xxxxx) is larger than the maximum number of tokens that can be stored in the KV cache." or "RuntimeError: Not enough memory. Please try to increase --mem-fraction-static."

1. 遇到错误: 「The model's max sequence length (xxxxx) is larger than the maximum number of tokens that can be stored in the KV cache.」 或 「RuntimeError: Not enough memory. Please try to increase --mem-fraction-static.」

The VRAM reserved for the KV cache is insufficient.

为 KV cache 预留的显存不足.

vLLM: Consider reducing the **max\_model\_len** or increasing the **tensor\_parallel\_size** and **gpu\_memory\_utilization**. Alternatively, you can reduce **max\_num\_batched\_tokens**, although this may significantly slow down inference.

vLLM: 可考虑减小 **max\_model\_len**, 或增大 **tensor\_parallel\_size** 与 **gpu\_memory\_utilization**. 也可减小 **max\_num\_batched\_tokens**, 但这可能显著拖慢推理.

SGLang: Consider reducing the **context-length** or increasing the **tp** and **mem-frac**. Alternatively, you can reduce **chunked-prefill-size**, although this may significantly slow down inference.

SGLang: 可考虑减小 **context-length**, 或增大 **tp** 与 **mem-frac**. 也可减小 **chunked-prefill-size**, 但这可能显著拖慢推理.

2. Encountering the error: "torch.OutOfMemoryError: CUDA out of memory."

2. 遇到错误: 「torch.OutOfMemoryError: CUDA out of memory.」

> **确认:** 排障第 1 条把 KV cache 不够与第 2 条 activation 不够分开写, 调参方向是否相反?
> 部分相反. 第 1 条可抬 `gpu_memory_utilization` / `mem-frac` 给 KV; 第 2 条写降低这两项可能腾出激活空间, 但会挤占 KV 可用显存.

<!-- page 14 of 17 -->

The VRAM reserved for activation weights is insufficient. You can try lowering **gpu\_memory\_utilization** or **mem-frac**, but be aware that this might reduce the VRAM available for the KV cache.

为激活权重预留的显存不足. 可尝试降低 **gpu\_memory\_utilization** 或 **mem-frac**, 但须知这可能减少 KV cache 可用显存.

3. Encountering the error: "Input prompt (xxxxx tokens) + lookahead slots (0) is too long and exceeds the capacity of the block manager." or "The input (xxx xtokens) is longer than the model's context length (xxx tokens)."

3. 遇到错误: 「Input prompt (xxxxx tokens) + lookahead slots (0) is too long and exceeds the capacity of the block manager.」 或 「The input (xxx xtokens) is longer than the model's context length (xxx tokens).」

The input is too lengthy. Consider using a shorter sequence or increasing the **max\_model\_len** or **context-length**.

输入过长. 可考虑用更短序列, 或增大 **max\_model\_len** / **context-length**.

## Long-Context Performance 长上下文性能

We test the model on an 1M version of the [RULER](https://arxiv.org/abs/2404.06654) benchmark.

我们在 [RULER](https://arxiv.org/abs/2404.06654) 的 1M 版本上测试该模型.

| Model Name | Acc avg | 4k | 8k | 16k | 32k | 64k | 96k | 128k | 192k | 256k | 384k | 512k |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Qwen3- | 83.9 | 97.7 | 96.1 | 97.5 | 96.1 | 94.2 | 90.3 | 88.5 | 85.0 | 82.1 | 79.2 | 74.4 |
| 235B- |  |  |  |  |  |  |  |  |  |  |  |  |
| A22B |  |  |  |  |  |  |  |  |  |  |  |  |
| (Non- |  |  |  |  |  |  |  |  |  |  |  |  |
| Thinking) |  |  |  |  |  |  |  |  |  |  |  |  |
| Qwen3- | 92.5 | 98.5 | 97.6 | 96.9 | 97.3 | 95.8 | 94.9 | 93.9 | 94.5 | 91.0 | 92.2 | 90.9 |
| 235B- |  |  |  |  |  |  |  |  |  |  |  |  |
| A22B- |  |  |  |  |  |  |  |  |  |  |  |  |
| Instruct- |  |  |  |  |  |  |  |  |  |  |  |  |
| 2507(Full |  |  |  |  |  |  |  |  |  |  |  |  |
| Attention) |  |  |  |  |  |  |  |  |  |  |  |  |
| Qwen3- | 91.7 | 98.5 | 97.2 | 97.3 | 97.7 | 96.6 | 94.6 | 92.8 | 94.3 | 90.5 | 89.7 | 89.5 |
| 235B- |  |  |  |  |  |  |  |  |  |  |  |  |
| A22B- |  |  |  |  |  |  |  |  |  |  |  |  |
| Instruct- |  |  |  |  |  |  |  |  |  |  |  |  |
| 2507 |  |  |  |  |  |  |  |  |  |  |  |  |

> **回看:** Full Attention 平均 92.5, Sparse Attention 91.7, 旧 Non-thinking 83.9, 稀疏路径是不是用约 0.8 分换效率?
> 大致如此. 两档 2507 都远高于旧 Non-thinking; Full 略高于 Sparse, 源文把稀疏写成效率侧手段, 并声明评测均开 Dual Chunk Attention.

<!-- page 15 of 17 -->

| Model Name | Acc avg | 4k | 8k | 16k | 32k | 64k | 96k | 128k | 192k | 256k | 384k | 512k |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (Sparse Attention) |  |  |  |  |  |  |  |  |  |  |  |  |

All models are evaluated with Dual Chunk Attention enabled.

所有模型评测时均启用 Dual Chunk Attention.

Since the evaluation is time-consuming, we use 260 samples for each length (13 sub-tasks, 20 samples for each).

因评测耗时, 每个长度用 260 条样本 (13 个子任务, 每个 20 条).

## Best Practices 最佳实践

To achieve optimal performance, we recommend the following settings:

为获得最佳性能, 建议如下设置:

1. Sampling Parameters: 1. 采样参数:

We suggest using **Temperature=0.7**, **TopP=0.8**, **TopK=20**, and **MinP=0**.

建议使用 **Temperature=0.7**, **TopP=0.8**, **TopK=20**, **MinP=0**.

For supported frameworks, you can adjust the **presence\_penalty** parameter between 0 and 2 to reduce endless repetitions. However, using a higher value may occasionally result in language mixing and a slight decrease in model performance.

在支持的框架里, 可将 **presence\_penalty** 调在 0 到 2 之间以减少无限重复. 不过, 取值偏高偶尔会导致语言混杂, 并轻微降低模型表现.

2. **Adequate Output Length**: We recommend using an output length of 16,384 tokens for most queries, which is adequate for instruct models.

2. **充足的输出长度**: 多数查询建议输出长度 16,384 tokens, 对 instruct 型号通常足够.

3. **Standardize Output Format**: We recommend using prompts to standardize model outputs when benchmarking.

3. **标准化输出格式**: 做基准评测时, 建议用提示词规范模型输出.

**Math Problems**: Include "Please reason step by step, and put your final answer within \boxed{}." in the prompt.

**数学题**: 在提示中加入 「Please reason step by step, and put your final answer within \boxed{}.」

**Multiple-Choice Questions**: Add the following JSON structure to the prompt to standardize responses: "Please show your choice in the **answer** field with only the choice letter, e.g., **"answer": "C"**."

**选择题**: 在提示中加入如下 JSON 结构以规范作答: 「Please show your choice in the **answer** field with only the choice letter, e.g., **"answer": "C"**.」

> **停一下:** RULER 表列到 512k, 宣称可到 1,010,000, 表里有没有 768k/1M 列?
> 没有. 公开表停在 512k; 1M 能力写在配置与显存需求里, 不在这张 Acc 表的列上.

> **再看:** presence_penalty 调高可能 language mixing, 与亮点里的多语言长尾增益是不是同一层机制?
> 不是. 亮点谈的是能力覆盖; 这里是采样超参副作用. 源文把两者分开写, 不要合成一条因果.

<!-- page 16 of 17 -->

```txt
Citation
```

If you find our work helpful, feel free to give us a cite.

若本工作对你有帮助, 欢迎引用.

```bib
@misc{qwen3technicalreport,
    title={Qwen3 Technical Report},
    author={Qwen Team},
    year={2025},
    eprint={2505.09388},
    archivePrefix={arXiv},
    primaryClass={cs.CL},
    url={https://arxiv.org/abs/2505.09388},
}

@article{qwen2.5-1m,
    title={Qwen2.5-1M Technical Report},
    author={An Yang and Bowen Yu and Chengyuan Li and Dayiheng Liu ar
    journal={arXiv preprint arXiv:2501.15383},
    year={2025}
}
```

> **对一下:** 接近 1M 时卡上的「最高约 3× 加速」是相对谁, 由哪几项技术合出的?
> 相对 「standard attention implementations」. Processing Ultra-Long Texts 写 DCA 与 MInference 「Together」 改善超过 256K tokens 的 generation quality 与 inference efficiency, 并在 sequences approaching 1M tokens 时 「the system achieves up to a 3× speedup」. 卡没有把 3× 拆成单技术贡献.

> **想:** 只换 `config_1m.json`、不设 Dual Chunk Flash Attention 后端, 是否符合卡上的 1M 启用步骤?
> 不符合完整步骤. Step 1 换配置后, Step 2 仍要求 vLLM 设 `VLLM_ATTENTION_BACKEND=DUAL_CHUNK_FLASH_ATTN` (参数表: Enables the custom attention kernel for long-context efficiency), 或 SGLang `--attention-backend dual_chunk_flash_attn`. 配置替换与服务端 dual chunk 后端是串联要求.

<!-- page 17 of 17 -->

System theme

系统主题

## Company 公司

[TOS](https://huggingface.co/terms-of-service)

[Privacy](https://huggingface.co/privacy)

[About](https://huggingface.co/huggingface)

[Careers](https://apply.workable.com/huggingface/)

## Website 网站

[Models](https://huggingface.co/models)

[Datasets](https://huggingface.co/datasets)

[Spaces](https://huggingface.co/spaces)

[Pricing](https://huggingface.co/pricing)

[Docs](https://huggingface.co/docs)

![Image block](images/p17-image.png)

> **问:** Quickstart 为何把 `transformers<4.51.0` 与 `KeyError: 'qwen3_moe'` 绑在一起讲?
> 因为前文写 「The code of Qwen3-MoE has been in the latest Hugging Face transformers」, 并 advise 用最新版; 低于 4.51.0 会遇到 `KeyError: 'qwen3_moe'`. 这张 MoE 卡的加载依赖已注册 `qwen3_moe` 架构的新版 transformers.
