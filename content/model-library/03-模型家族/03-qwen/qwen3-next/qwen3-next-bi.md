<!-- page 1 of 12 -->

![Image block](images/p01-compare-providers-https-huggingface-co-inference-models.png)

[Compare providers](https://huggingface.co/inference/models?model=Qwen%2FQwen3-Next-80B-A3B-Instruct)

[比较服务商](https://huggingface.co/inference/models?model=Qwen%2FQwen3-Next-80B-A3B-Instruct)

**Spaces using Qwen/Qwen3-Next-80B-A3B-Instruct** 100

**使用 Qwen/Qwen3-Next-80B-A3B-Instruct 的 Spaces** 100

**Collection including Qwen/Qwen3-Next-80B-A3B-Instruct**

**收录 Qwen/Qwen3-Next-80B-A3B-Instruct 的 Collection**

[**Qwen3-Next** Collection](https://huggingface.co/collections/Qwen/qwen3-next)

[**Qwen3-Next** Collection](https://huggingface.co/collections/Qwen/qwen3-next)

<!-- page 2 of 12 -->

```txt
4 items · Updated Dec 31, 2025 · △ 186
```

## Papers for Qwen/Qwen3-Next-80B-A3B-Instruct 与 Qwen/Qwen3-Next-80B-A3B-Instruct 相关的论文

```txt
Qwen3 Technical Report
Paper • 2505.09388 • Published May 14, 2025 • △ 347

Qwen2.5-1M Technical Report
Paper • 2501.15383 • Published Jan 26, 2025 • △ 71

RULER: What's the Real Context Size of Your Long-Context Language Models?
Paper • 2404.06654 • Published Apr 9, 2024 • △ 42

YaRN: Efficient Context Window Extension of Large Language Models
Paper • 2309.00071 • Published Aug 31, 2023 • △ 88
```

## Evaluation results 评测结果

```txt
ldavidrein/gpqa · Gpqa Diamond leaderboard 72.9
thamilvendhan/signalbench
    Src source SRC overall; deterministi... 0.58*
    Time source family=time; n=12 0.83*
    Access Deny source family=access_deny; n=12 0.5*
+3 more
.eval_results/mmlu_pro.yaml error
```

# Qwen3-Next-80B-A3B-Instruct

Qwen Chat

Over the past few months, we have observed increasingly clear trends toward scaling both total parameters and context lengths in the pursuit of more powerful and agentic artificial intelligence (AI). We are excited to share our latest advancements in addressing these demands, centered on improving scaling efficiency through innovative model architecture. We call this next-generation foundation models **Qwen3-Next**.

过去数月, 官方观察到: 为追求更强, 更偏 agentic 的 AI, 总参数与上下文长度两侧的缩放趋势越来越清晰. 本稿分享的最新进展, 核心是用新模型架构提高缩放效率. 这一代 foundation models 被命名为 **Qwen3-Next**.

## Highlights 亮点

**Qwen3-Next-80B-A3B** is the first installment in the Qwen3-Next series and features the following key enchancements:

**Qwen3-Next-80B-A3B** 是 Qwen3-Next 系列的首发型号, 关键增强如下 (源文拼写 enchancements):

**Hybrid Attention**: Replaces standard attention with the combination of **Gated DeltaNet** and **Gated Attention**, enabling efficient context modeling for ultra-long context length.

**Hybrid Attention**: 用 **Gated DeltaNet** 与 **Gated Attention** 的组合替换标准 attention, 以支撑超长上下文上的高效建模.

**High-Sparsity Mixture-of-Experts (MoE)**: Achieves an extreme low activation ratio in MoE layers, drastically reducing FLOPs per token while preserving model capacity.

**High-Sparsity MoE**: 在 MoE 层做到极低激活比, 大幅压低每 token 的 FLOPs, 同时保留模型容量.

<!-- page 3 of 12 -->

**Stability Optimizations**: Includes techniques such as **zero-centered and weightdecayed layernorm**, and other stabilizing enhancements for robust pre-training and post-training.

**Stability Optimizations**: 含 **zero-centered and weight-decayed layernorm** 等稳定化手段, 覆盖预训练与后训练.

**Multi-Token Prediction (MTP)**: Boosts pretraining model performance and accelerates inference.

**Multi-Token Prediction (MTP)**: 抬预训练表现, 并加速推理.

We are seeing strong performance in terms of both parameter efficiency and inference speed for Qwen3-Next-80B-A3B:

就参数效率与推理速度两端, 官方对 Qwen3-Next-80B-A3B 给出如下主张:

Qwen3-Next-80B-A3B-Base outperforms Qwen3-32B-Base on downstream tasks with 10% of the total training cost and with 10 times inference throughput for context over 32K tokens.

Qwen3-Next-80B-A3B-Base 在下游任务上超过 Qwen3-32B-Base, 总训练成本约为后者的 10%, 且在超过 32K tokens 的上下文上推理吞吐约为 10 倍.

Qwen3-Next-80B-A3B-Instruct performs on par with Qwen3-235B-A22B-Instruct-2507 on certain benchmarks, while demonstrating significant advantages in handling ultra-long-context tasks up to 256K tokens.

Qwen3-Next-80B-A3B-Instruct 在部分基准上与 Qwen3-235B-A22B-Instruct-2507 持平, 并在最长约 256K tokens 的超长上下文任务上写明显著优势.

![Chart block](images/p03-for-more-details-please-refer-to-our-blog-post-qwen3.png)

For more details, please refer to our blog post [Qwen3-Next](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list).

更多细节见博客 [Qwen3-Next](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list).

> **想:** 开篇把 「scaling both total parameters and context lengths」 与 「improving scaling efficiency」 并提, 这里的缩放是指部署前训练/架构侧效率, 还是推理时 TestingTime 多花算力?
> 指部署前. 同页卖点是 Hybrid Attention, High-Sparsity MoE, Stability Optimizations, MTP; Base 句写的是 「10% of the total training cost」 与长上下文吞吐, 不是推理期多采样/多步思考预算. 卡面也声明 Instruct 只走 non-thinking, 不生成 `<think></think>` 块.

## Model Overview 模型概览

**Qwen3-Next-80B-A3B-Instruct** supports only instruct (non-thinking) mode and does not generate **&lt;think&gt;&lt;/think&gt;** blocks in its output.

**Qwen3-Next-80B-A3B-Instruct** 只支持 instruct (non-thinking) 模式, 输出不生成 **&lt;think&gt;&lt;/think&gt;** 块.

**Qwen3-Next-80B-A3B-Instruct** has the following features:

**Qwen3-Next-80B-A3B-Instruct** 规格如下:

Type: Causal Language Models

类型: Causal Language Models

Training Stage: Pretraining (15T tokens) & Post-training

训练阶段: Pretraining (15T tokens) & Post-training

Number of Parameters: 80B in total and 3B activated

参数量: 总计 80B, 激活 3B

Number of Paramaters (Non-Embedding): 79B

非嵌入参数量: 79B (源文拼写 Paramaters)

Hidden Dimension: 2048

Hidden Dimension: 2048

Number of Layers: 48

层数: 48

Hybrid Layout: 12 \* (3 \* (Gated DeltaNet -> MoE) -> 1 \* (Gated Attention -> MoE))

Hybrid Layout: 12 \* (3 \* (Gated DeltaNet -> MoE) -> 1 \* (Gated Attention -> MoE))

> **问:** Hybrid Layout 写成 `12 * (3 * (Gated DeltaNet -> MoE) -> 1 * (Gated Attention -> MoE))`, 48 层里 Gated Attention 与 Gated DeltaNet 各占多少?
> 按卡面公式: 每组 3 个 Gated DeltaNet 块 + 1 个 Gated Attention 块, 重复 12 次, 合计 Gated DeltaNet 36 层侧, Gated Attention 12 层侧; 且每条路径后都接 MoE. 卡没有另给层宽公式或状态维度推导, 只给这串布局与后文 head / expert 数.

<!-- page 4 of 12 -->

Gated Attention:

Gated Attention:

Number of Attention Heads: 16 for Q and 2 for KV

Attention Heads: Q 为 16, KV 为 2

Head Dimension: 256

Head Dimension: 256

Rotary Position Embedding Dimension: 64

Rotary Position Embedding Dimension: 64

Gated DeltaNet:

Gated DeltaNet:

Number of Linear Attention Heads: 32 for V and 16 for QK

Linear Attention Heads: V 为 32, QK 为 16

Head Dimension: 128

Head Dimension: 128

Mixture of Experts:

Mixture of Experts:

Number of Experts: 512

专家数: 512

Number of Activated Experts: 10

激活专家数: 10

Number of Shared Experts: 1

共享专家数: 1

Expert Intermediate Dimension: 512

Expert Intermediate Dimension: 512

Context Length: 262,144 natively and extensible up to 1,010,000 tokens

上下文长度: 原生 262,144, 可外推至 1,010,000 tokens

![Image block](images/p04-performance.png)

Performance

性能

> **核对:** High-Sparsity MoE 写 「extreme low activation ratio」, 规格是 512 experts / 10 activated / 1 shared, 卡有没有直接给出数值激活比?
> 没有单独写出如 「1:50」 的比值句. 能核对的是: 总参 80B, 激活 3B, 以及 MoE 侧 512 / 10 / 1 shared 与 Expert Intermediate Dimension 512. 「extreme low」 是定性宣传; 数值激活比需自行用上列数推, 卡正文未再给公式.

<!-- page 5 of 12 -->

|  | Qwen3-30B-A3B-Instruct-2507 | Qwen3-32BNon-Thinking | Qwen3-235B-A22B-Instruct-2507 | Qwen3-Next-80B-A3B-Instruct |
| --- | --- | --- | --- | --- |
| Knowledge |  |  |  |  |
| MMLU-Pro | 78.4 | 71.9 | 83.0 | 80.6 |
| MMLU-Redux | 89.3 | 85.7 | 93.1 | 90.9 |
| GPQA | 70.4 | 54.6 | 77.5 | 72.9 |
| SuperGPQA | 53.4 | 43.2 | 62.6 | 58.8 |
| Reasoning |  |  |  |  |
| AIME25 | 61.3 | 20.2 | 70.3 | 69.5 |
| HMMT25 | 43.0 | 9.8 | 55.4 | 54.1 |
| LiveBench20241125 | 69.0 | 59.8 | 75.4 | 75.8 |
| Coding |  |  |  |  |
| LiveCodeBenchv6(25.02-25.05) | 43.2 | 29.1 | 51.8 | 56.6 |
| MultiPL-E | 83.8 | 76.9 | 87.9 | 87.8 |
| Aider-Polyglot | 35.6 | 40.0 | 57.3 | 49.8 |
| Alignment |  |  |  |  |
| IFEval | 84.7 | 83.2 | 88.7 | 87.6 |
| Arena-Hardv2* | 69.0 | 34.1 | 79.2 | 82.7 |
| Creative Writingv3 | 86.0 | 78.3 | 87.5 | 85.3 |
| WritingBench | 85.5 | 75.4 | 85.2 | 87.3 |
| Agent |  |  |  |  |
| BFCL-v3 | 65.1 | 63.0 | 70.9 | 70.3 |
| TAU1-Retail | 59.1 | 40.1 | 71.3 | 60.9 |
| TAU1-Airline | 40.0 | 17.0 | 44.0 | 44.0 |
| TAU2-Retail | 57.0 | 48.8 | 74.6 | 57.3 |
| TAU2-Airline | 38.0 | 24.0 | 50.0 | 45.5 |
| TAU2-Telecom | 12.3 | 24.6 | 32.5 | 13.2 |
| Multilingualism |  |  |  |  |
| MultiIF | 67.9 | 70.7 | 77.5 | 75.8 |
| MMLU-ProX | 72.0 | 69.3 | 79.4 | 76.7 |
| INCLUDE | 71.9 | 70.9 | 79.5 | 78.9 |
| PolyMATH | 43.1 | 22.5 | 50.2 | 45.9 |

(表结构与源文一致; 数字一字不改.)

> **看表:** 亮点写 Instruct 「performs on par with Qwen3-235B-A22B-Instruct-2507 on certain benchmarks」, 同表 LiveCodeBench 与 Arena-Hardv2* 是否支持 「持平」, Agent 组是否也支持?
> 部分格支持, 不能读成全表持平. LiveCodeBenchv6 Next 56.6 高于 235B 的 51.8; Arena-Hardv2* Next 82.7 高于 235B 的 79.2; AIME25 69.5 接近 70.3. 但 Aider-Polyglot 49.8 低于 57.3; TAU2-Telecom 13.2 远低于 32.5; MMLU-Pro 80.6 也低于 83.0. 「certain benchmarks」 必须按格引用.

<!-- page 6 of 12 -->

\*: For reproducibility, we report the win rates evaluated by GPT-4.1.

\*: 为可复现, 胜率由 GPT-4.1 评判.

## Quickstart 快速上手

The code for Qwen3-Next has been merged into the main branch of Hugging Face **transformers**.

Qwen3-Next 相关代码已合入 Hugging Face **transformers** 的 main 分支.

```txt
pip install git+https://github.com/huggingface/transformers.git@main
```

With earlier versions, you will encounter the following error:

使用较早版本会遇到:

```yaml
KeyError: 'qwen3_next'
```

The following contains a code snippet illustrating how to use the model generate content based on given inputs.

下方代码片段演示如何按给定输入生成内容.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-Next-80B-A3B-Instruct"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    dtype="auto",
    device_map="auto",
)

# prepare the model input
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "user", "content": prompt},
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
    max_new_tokens=16384,
)
output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()

content = tokenizer.decode(output_ids, skip_special_tokens=True)

print("content:", content)
```

<!-- page 7 of 12 -->

Multi-Token Prediction (MTP) is not generally available in Hugging Face Transformers.

Multi-Token Prediction (MTP) 在 Hugging Face Transformers 中一般不可用.

The efficiency or throughput improvement depends highly on the implementation. It is recommended to adopt a dedicated inference framework, e.g., SGLang and vLLM, for inference tasks.

效率或吞吐增益高度依赖实现. 推理任务建议用专用框架, 例如 SGLang 与 vLLM.

Depending on the inference settings, you may observe better efficiency with [**flashlinear-attention**](https://github.com/fla-org/flash-linear-attention#installation) and [**causal-conv1d**](https://github.com/Dao-AILab/causal-conv1d). See the links for detailed instructions and requirements.

按推理设置, 配合 [**flash-linear-attention**](https://github.com/fla-org/flash-linear-attention#installation) 与 [**causal-conv1d**](https://github.com/Dao-AILab/causal-conv1d) 可能看到更好效率. 安装与要求见链接.

> **确认:** Highlights 把 MTP 写成既抬预训练又加速推理, Quickstart 又说 MTP 「not generally available in Hugging Face Transformers」, 两条如何同时成立?
> 卡内拆成两层: 训练侧卖点仍写 MTP; 默认 `transformers` 推理路径不保证带上 MTP 加速, 要吞吐需走 SGLang / vLLM 等专用框架, 并视设置叠加 flash-linear-attention / causal-conv1d. 卡没有给出 MTP 深度, 草稿长度或接受率数字.

## Deployment 部署

For deployment, you can use the latest **sglang** or **vllm** to create an OpenAIcompatible API endpoint.

部署可用最新 **sglang** 或 **vllm** 创建 OpenAI 兼容 API 端点.

### SGLang

[SGLang](https://github.com/sgl-project/sglang) is a fast serving framework for large language models and vision language models. SGLang could be used to launch a server with OpenAI-compatible API service.

[SGLang](https://github.com/sgl-project/sglang) 是面向大语言模型与视觉语言模型的快速 serving 框架, 可拉起 OpenAI 兼容 API 服务.

**sglang>=0.5.2** is required for Qwen3-Next, which can be installed using:

Qwen3-Next 需要 **sglang>=0.5.2**, 安装示例:

**pip install 'sglang[all]>=0.5.2'**

See [its documentation](https://docs.sglang.ai/get_started/install.html) for more details.

详见 [文档](https://docs.sglang.ai/get_started/install.html).

The following command can be used to create an API endpoint at

可用如下命令在

**http://localhost:30000/v1** with maximum context length 256K tokens using tensor parallel on 4 GPUs.

**http://localhost:30000/v1** 起端点, 最大上下文 256K tokens, 4 GPU tensor parallel.

**python -m sglang.launch\_server --model-path Qwen/Qwen3-Next-80B-A3B-Ins**

The following command is recommended for MTP with the rest settings the same as above:

启用 MTP 时推荐如下命令, 其余设置同上 (源文命令在页边界截断):

**python -m sglang.launch\_server --model-path Qwen/Qwen3-Next-80B-A3B-Ins**

The default context length is 256K. Consider reducing the context length to a smaller value, e.g., **32768** , if the server fails to start.

默认上下文长度为 256K. 若服务起不来, 可考虑降到更小值, 例如 **32768**.

Please also refer to SGLang's usage guide on [Qwen3-Next](https://docs.sglang.ai/basic_usage/qwen3.html).

另见 SGLang 的 [Qwen3-Next](https://docs.sglang.ai/basic_usage/qwen3.html) 用法指南.

### vLLM

[vLLM](https://github.com/vllm-project/vllm) is a high-throughput and memory-efficient inference and serving engine for LLMs. vLLM could be used to launch a server with OpenAI-compatible API service.

[vLLM](https://github.com/vllm-project/vllm) 是高吞吐, 省显存的 LLM 推理与 serving 引擎, 可拉起 OpenAI 兼容 API 服务.

<!-- page 8 of 12 -->

**vllm>=0.10.2** is required for Qwen3-Next, which can be installed using:

Qwen3-Next 需要 **vllm>=0.10.2**, 安装示例:

```batch
pip install 'vllm>=0.10.2'
```

See [its documentation](https://docs.vllm.ai/en/stable/getting_started/installation/index.html) for more details.

详见 [文档](https://docs.vllm.ai/en/stable/getting_started/installation/index.html).

The following command can be used to create an API endpoint at **http://localhost:8000/v1** with maximum context length 256K tokens using tensor parallel on 4 GPUs.

可用如下命令在 **http://localhost:8000/v1** 起端点, 最大上下文 256K tokens, 4 GPU tensor parallel.

```txt
vllm serve Qwen/Qwen3-Next-80B-A3B-Instruct --port 8000 --tensor-paral:
```

The following command is recommended for MTP with the rest settings the same as above:

启用 MTP 时推荐如下命令, 其余设置同上 (源文在页边界截断):

```txt
vllm serve Qwen/Qwen3-Next-80B-A3B-Instruct --port 8000 --tensor-parall
```

The default context length is 256K. Consider reducing the context length to a smaller value, e.g., **32768** , if the server fails to start.

默认上下文长度为 256K. 若服务起不来, 可考虑降到更小值, 例如 **32768**.

Please also refer to vLLM's usage guide on [Qwen3-Next](https://docs.vllm.ai/projects/recipes/en/latest/Qwen/Qwen3-Next.html).

另见 vLLM 的 [Qwen3-Next](https://docs.vllm.ai/projects/recipes/en/latest/Qwen/Qwen3-Next.html) 用法指南.

## Agentic Use Agentic 用法

Qwen3 excels in tool calling capabilities. We recommend using [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) to make the best use of agentic ability of Qwen3. Qwen-Agent encapsulates tool-calling templates and tool-calling parsers internally, greatly reducing coding complexity.

Qwen3 在 tool calling 上表现突出. 官方推荐用 [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) 发挥 agentic 能力; 其内部封装 tool-calling 模板与解析器, 降低编码复杂度.

To define the available tools, you can use the MCP configuration file, use the integrated tool of Qwen-Agent, or integrate other tools by yourself.

定义可用工具时, 可用 MCP 配置文件, 用 Qwen-Agent 内置工具, 或自行集成其他工具.

```python
from qwen_agent.agents import Assistant

# Define LLM
llm_cfg = {
    'model': 'Qwen3-Next-80B-A3B-Instruct',


    # Use a custom endpoint compatible with OpenAI API:
    'model_server': 'http://localhost:8000/v1',  # api_base
    'api_key': 'EMPTY',
}

# Define Tools
tools = [
    {'mcpServers': {  # You can specify the MCP configuration file
        'time': {
            'command': 'uvx',
            'args': ['mcp-server-time', '--local-timezone=Asia/Share)
        },
    }
}
```

> **回看:** Base 句写相对 Qwen3-32B-Base 「10% of the total training cost」 与 「10 times inference throughput for context over 32K」, Instruct 句写相对 235B 「on par ... on certain benchmarks」, 两条对照轴是否同一?
> 不是同一对照轴. Base 对照是稠密 32B 与训练成本 / 长上下文吞吐; Instruct 对照是 235B-A22B-Instruct-2507 与部分基准分 / 最长约 256K 任务优势. 不得把 Base 的 10% 成本句直接挪到 Instruct 对 235B 的叙事上.

<!-- page 9 of 12 -->

```python
"fetch": {
            "command": "uvx",
            "args": ["mcp-server-fetch"]
        }
    }
},
'code_interpreter', # Built-in tools

# Define Agent
bot = Assistant(llm=llm_cfg, function_list=tools)

# Streaming generation
messages = [{'role': 'user', 'content': 'https://qwenlm.github.io/blog,
for responses in bot.run(messages=messages):
    pass
print(responses)
```

## Processing Ultra-Long Texts 处理超长文本

Qwen3-Next natively supports context lengths of up to 262,144 tokens. For conversations where the total length (including both input and output) significantly exceeds this limit, we recommend using RoPE scaling techniques to handle long texts effectively. We have validated the model's performance on context lengths of up to 1 million tokens using the [YaRN](https://arxiv.org/abs/2309.00071) method.

Qwen3-Next 原生支持最长 262,144 tokens 的上下文. 当对话总长 (含输入与输出) 明显超过该上限时, 建议用 RoPE scaling 技术处理长文本. 官方用 [YaRN](https://arxiv.org/abs/2309.00071) 在最长约 1 million tokens 上做了验证.

YaRN is currently supported by several inference frameworks, e.g., **transformers**, **vllm** and **sglang**. In general, there are two approaches to enabling YaRN for supported frameworks:

YaRN 目前被 **transformers**, **vllm**, **sglang** 等推理框架支持. 启用方式大体两类:

Modifying the model files: In the **config.json** file, add the **rope\_scaling** fields:

改模型文件: 在 **config.json** 中加入 **rope\_scaling** 字段:

```json
{
    ...,
    "rope_scaling": {
        "rope_type": "yarn",
        "factor": 4.0,
        "original_max_position_embeddings": 262144
    }
}
```

Passing command line arguments:

传命令行参数:

For **vllm**, you can use

对 **vllm** 可用

```txt
VLLM_ALLOW_LONG_MAX_MODEL_LEN=1 vllm serve ... --rope-scaling '{"r0
```

For **sglang**, you can use

对 **sglang** 可用

**SGLANG\_ALLOW\_OVERWRITE\_LONGER\_CONTEXT\_LEN=1 python -m sglang.launch**

> **停一下:** 示例 `factor: 4.0` 配 `original_max_position_embeddings: 262144`, 与概览 「extensible up to 1,010,000 tokens」 是否同一条外推叙事?
> 是同一产品线的外推档. 262144 × 4 ≈ 1,048,576, 与卡上 1,010,000 同量级; 后文又举例典型上下文 524,288 时建议 `factor` 取 2.0. 卡没有另给 Dual Chunk Attention 作为本系列 1M 路径; 本卡 1M 写明走 YaRN.

<!-- page 10 of 12 -->

All the notable open-source frameworks implement static YaRN, which means the scaling factor remains constant regardless of input length, **potentially impacting performance on shorter texts.** We advise adding the **rope\_scaling** configuration only when processing long contexts is required. It is also recommended to modify the **factor** as needed. For example, if the typical context length for your application is 524,288 tokens, it would be better to set **factor** as 2.0.

主流开源框架实现的是 static YaRN, 即缩放因子不随输入长度变化, **可能影响较短文本上的表现.** 官方建议仅在需要处理长上下文时才加 **rope\_scaling**, 并按需改 **factor**. 例如应用典型上下文为 524,288 tokens 时, 更好是把 **factor** 设为 2.0.

## Long-Context Performance 长上下文表现

We test the model on an 1M version of the [RULER](https://arxiv.org/abs/2404.06654) benchmark.

在 [RULER](https://arxiv.org/abs/2404.06654) 的 1M 版本上评测.

| Model Name | Acc avg | 4k | 8k | 16k | 32k | 64k | 96k | 128k | 192k | 256k | 384k | 512k |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Qwen3-30B-A3B-Instruct-2507 | 86.8 | 98.0 | 96.7 | 96.9 | 97.2 | 93.4 | 91.0 | 89.1 | 89.8 | 82.5 | 83.6 | 78.4 |
| Qwen3-235B-A22B-Instruct-2507 | 92.5 | 98.5 | 97.6 | 96.9 | 97.3 | 95.8 | 94.9 | 93.9 | 94.5 | 91.0 | 92.2 | 90.9 |
| Qwen3-Next-80B-A3B-Instruct | 91.8 | 98.5 | 99.0 | 98.0 | 98.7 | 97.6 | 95.0 | 96.0 | 94.0 | 93.5 | 91.7 | 86.9 |

Qwen3-Next are evaluated with YaRN enabled. Qwen3-2507 models are evaluated with Dual Chunk Attention enabled.

Qwen3-Next 评测开启 YaRN; Qwen3-2507 系列评测开启 Dual Chunk Attention.

Since the evaluation is time-consuming, we use 260 samples for each length (13 sub-tasks, 20 samples for each).

因评测耗时, 每个长度用 260 条样本 (13 子任务, 每任务 20 条).

> **再看:** RULER 同表把 Next (YaRN) 与 2507 (Dual Chunk Attention) 并排, Acc avg Next 91.8, 235B 92.5, 能否直接读成 「同一外推内核下的架构胜负」?
> 不能. 卡自己脚注写明两侧启用技术不同: Next 开 YaRN, 2507 开 Dual Chunk Attention. 平均分接近只说明在各自推荐长上下文配置下的公开结果接近; 不是消融同内核后的纯架构对比. 表列到 512k, 没有把 1M 点写进同一张 Acc 表.

> **对一下:** LiveCodeBench 上 Next 56.6 高于 235B 的 51.8, 但 TAU2-Telecom 13.2 远低于 235B 的 32.5, 「ultra-long-context ... significant advantages」 能否覆盖 Agent 组弱势格?
> 不能覆盖. 超长优势句指向最长约 256K 的上下文任务与后文 RULER; Agent 组是另一块基准. TAU2-Telecom 等格说明 Instruct 对照 235B 并非全面领先, 须与 Coding / Alignment 亮点格分开引用.

## Best Practices 最佳实践

To achieve optimal performance, we recommend the following settings:

为达最佳表现, 官方建议:

1. Sampling Parameters:

## 1. 采样参数:

We suggest using **Temperature=0.7**, **TopP=0.8**, **TopK=20**, and **MinP=0**.

建议 **Temperature=0.7**, **TopP=0.8**, **TopK=20**, **MinP=0**.

For supported frameworks, you can adjust the **presence\_penalty** parameter between 0 and 2 to reduce endless repetitions. However, using a higher value may occasionally result in language mixing and a slight decrease in model performance.

在支持的框架上, 可将 **presence\_penalty** 调在 0 到 2 之间以减少死循环重复; 偏高偶尔会导致语言混杂, 并轻微降低模型表现.

2. **Adequate Output Length**: We recommend using an output length of 16,384 tokens for most queries, which is adequate for instruct models.

2. **足够的输出长度**: 多数查询建议输出长度 16,384 tokens, 对 instruct 模型通常够用.

<!-- page 11 of 12 -->

3. **Standardize Output Format**: We recommend using prompts to standardize model outputs when benchmarking.

3. **标准化输出格式**: 做基准评测时, 建议用提示词规范模型输出.

**Math Problems**: Include "Please reason step by step, and put your final answer within \boxed{}." in the prompt.

**数学题**: 提示中加入 「Please reason step by step, and put your final answer within \boxed{}.」

**Multiple-Choice Questions**: Add the following JSON structure to the prompt to standardize responses: "Please show your choice in the **answer** field with only the choice letter, e.g., **"answer": "C"**."

**选择题**: 在提示中加入如下 JSON 结构以规范回答: 「Please show your choice in the **answer** field with only the choice letter, e.g., **"answer": "C"**.」

> **想:** Arena-Hardv2* 脚注是 GPT-4.1 评的 win rates, 同表 IFEval 87.6 是准确率口径, 两格能否横比证明 Alignment 「全面更强」?
> 不能横比成同一度量. 星号脚注只约束 Arena-Hardv2*; IFEval / WritingBench 等是另一套打分. Next 在 Arena-Hardv2* (82.7) 与 WritingBench (87.3) 高于或接近 235B, Creative Writingv3 (85.3) 略低于 235B 的 87.5. 引用须带脚注与分项.

## Citation

If you find our work helpful, feel free to give us a cite.

若本文有帮助, 欢迎引用.

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
    author={An Yang and Bowen Yu and Chengyuan Li and Dayiheng Liu an
    journal={arXiv preprint arXiv:2501.15383},
    year={2025}
}
```

> **问:** Papers / Citation 同时挂 Qwen3 Technical Report 与 Qwen2.5-1M / YaRN / RULER, 这张 Next 卡本身算不算带式号的架构专报?
> 不算. 正文是 Hub 模型卡加部署说明: 有 Hybrid Layout 字符串与 head/expert 表, 没有层宽推导, DeltaNet 更新式, 路由负载均衡或后训练课表. Citation 指向底座与长上下文相关报告, 读架构细节应回那些论文, 不能把本卡当专报正文.

## System theme

<!-- page 12 of 12 -->
