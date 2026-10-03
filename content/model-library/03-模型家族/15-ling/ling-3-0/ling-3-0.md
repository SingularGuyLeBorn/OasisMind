---
title: "Ling 3.0 · 源文"
category: "模型库"
tags: ["Ling", "源文"]
published: true
excerpt: "Ling 3.0 公开材料的 MinerU 抓取原文."
---
<!-- page 1 of 13 -->

![Image block](images/p01-image.png)

![Image block](images/p01-search-models-datasets-users.png)

Search models, datasets, users...

## [inclusionAI](https://huggingface.co/inclusionAI)/[Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)

Like

417

Follow

inclusionAI

3.07k

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

[Safetensors](https://huggingface.co/models?library=safetensors)

[bailing\_hybrid](https://huggingface.co/models?other=bailing_hybrid)

[conversational](https://huggingface.co/models?other=conversational)

[custom\_code](https://huggingface.co/models?other=custom_code)

[Eval Results](https://huggingface.co/models?other=eval-results)

License: mit

Deploy

Copy to bucket **NEW**

Use this model

[**Model card**](https://huggingface.co/inclusionAI/Ling-3.0-flash)

[Files](https://huggingface.co/inclusionAI/Ling-3.0-flash/tree/main)

[**xet**](https://huggingface.co/inclusionAI/Ling-3.0-flash/tree/main)

Community

Downloads last month

**16,399**

![Image block](images/p01-safetensors.png)

**Safetensors**

Model size

127B params

Tensor type

F32 · BF16

<u>Chat template</u>

<u>Files info</u>

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

Novita

[Text Generation](https://huggingface.co/tasks/text-generation)

Examples

Input a message to start chatting with **inclusionAI/Ling-3.0-flash**.

Your prompt here...

View Code

Send

[Compare providers](https://huggingface.co/inference/models?model=inclusionAI%2FLing-3.0-flash)

## Model tree for inclusionAI/Ling-3.0-flash

<!-- page 2 of 13 -->

![Image block](images/p02-txt.png)

```txt
Ling 3.0 Collection
Ling 3.0 • 20 items • Updated about 20 hours ago • △ 23
```

[4 models](https://huggingface.co/models?other=base_model:finetune:inclusionAI/Ling-3.0-flash) [44 models](https://huggingface.co/models?other=base_model:quantized:inclusionAI/Ling-3.0-flash)

## Spaces using inclusionAI/Ling-3.0-flash 21

[🟩 embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer)

[📈 DeepImagix/self-trained2](https://huggingface.co/spaces/DeepImagix/self-trained2)

[🤖 Jindrich3/openajaj](https://huggingface.co/spaces/Jindrich3/openajaj)

[🗑 ️ patrickleenyc/fucc-boi-bench](https://huggingface.co/spaces/patrickleenyc/fucc-boi-bench)

\+ 16 Spaces

## 品 Collection including inclusionAI/Ling-3.0-flash

## Evaluation results

- [ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=inclusionAI/Ling-3.0-flash&leaderboard_task_id=SWE_Bench_Pro) → 56.6
- [MathArena/aime\_2026](https://huggingface.co/datasets/MathArena/aime_2026) · MathArena Aime 2026 [leaderboard](https://huggingface.co/datasets/MathArena/aime_2026?eval_result=inclusionAI/Ling-3.0-flash&leaderboard_task_id=MathArena/aime_2026) → 93.2
- [cais/hle](https://huggingface.co/datasets/cais/hle) · Hle 22.7
- [MathArena/hmmt\_feb\_2026](https://huggingface.co/datasets/MathArena/hmmt_feb_2026) · MathArena Hmmt Feb 2026 [leaderboard](https://huggingface.co/datasets/MathArena/hmmt_feb_2026?eval_result=inclusionAI/Ling-3.0-flash&leaderboard_task_id=MathArena/hmmt_feb_2026) → 87
- [SWE-bench/SWE-bench\_Multilingual](https://huggingface.co/datasets/SWE-bench/SWE-bench_Multilingual) · Swe Bench Multilingual Resolved [leaderboard](https://huggingface.co/datasets/SWE-bench/SWE-bench_Multilingual?eval_result=inclusionAI/Ling-3.0-flash&leaderboard_task_id=swe_bench_multilingual_%_resolved) → 72.4

![Chart block](images/p02-chart.png)

![Image block](images/p02-hugging-face.png)

Hugging Face

![Image block](images/p02-modelscope-https-modelscope-cn-organization-inclusionai.png)

🤖 [ModelScope](https://modelscope.cn/organization/inclusionAI)

OpenRouter

## Introduction

<!-- page 3 of 13 -->

We're introducing Ling-3.0-flash, our next-generation native hybrid reasoning model. Operating with **124B** total and **5.1B** active parameters (\~12.4% and \~8.1% of our previous 1T-class flagship Ring-2.6-1T), Ling-3.0-flash matches or outperforms its predecessor across key benchmarks.

Key highlights of the model are summarized below:

**Native Hybrid-Linear Architecture:** Ling-3.0 adopts a native hybrid linear attention architecture from the very start of pretraining (5:1 alternating stacking of Kimi Delta Attention (KDA) and MLA), upgraded with KDA fine-grained diagonal gating and 1/64 sparse MoE. With 124B total parameters and 5.1B activated parameters, it achieves a synergistic leap in long-context efficiency and computational cost.

**Remarkable Efficiency & Performance:** Engineered for speed, compute efficiency, and production deployment, Ling-3.0-flash delivers class-defying performance against both larger SOTA competitors and previous-generation flagships. Activating only 5.1B parameters per token, it provides impressive reasoning, instruction following, and long-context capabilities to empower complex agentic workflows in production environments.

**Comprehensive Agentic Evolution:** Tailored for real-world productivity workflows, the model incorporates 10,000+ interactive training environments to achieve end-to-end closed-loop execution across Coding, General, and Deep Research Agent tasks. It natively integrates the SGLang HiCache + Mooncake hierarchical caching architecture (featuring physical dual-pools and a clustershared L3 cache), eliminating redundant recomputation during long-horizon interactions and reducing Time to First Token (TTFT) by 60% to over 80% in longinput scenarios.

<!-- page 4 of 13 -->

SWE-Bench Pro

SWE-Bench Multilingual

![Chart block](images/p04-note-thinking-mode-is-enabled-by-default.png)

Note: Thinking mode is enabled by default.

## Model Overview

The model summary information and architecture diagram are as follows:

| Architecture | Hybrid-linearMoE |
| --- | --- |
| ParameterScale | Total124B,Activated5.1B |
| TransformerLayers | 35KDA+7GatedMLA(5:1) |
| NumberofDense Layers | 2 |
| NumberofRoutedExperts | 512 |
| NumberofSharedExperts | 1 |
| NumberofActivatedExperts | 8 |
| AttentionHeads | 32 |
| HiddenSize | 2560 |

<!-- page 5 of 13 -->

| Architecture | Hybrid-linearMoE |
| --- | --- |
| ExpertIntermediate Size | 768 |
| Dense Intermediate Size | 6144 |
| VocabularySize | 157184 |
| ContextTrainingSchedule | 8K->32K->256K |

## Ling-3.0-flash Architecture

![Image block](images/p05-evaluation.png)

## Evaluation

We have conducted a comprehensive evaluation of Ling-3.0-flash across multiple authoritative benchmarks. **Ling-3.0-flash** performs strongly on representative code/agent benchmarks such as **SWE-Bench Pro, SWE-Bench Multilingual, Tau3-**

<!-- page 6 of 13 -->

**banking-AA**, **MCP-Atlas** and **SkillsBench, etc**. In practice, Ling-3.0-flash delivers a strong user experience across frameworks including **Claude Code**,**Kilo Code**,**Qwen Code**,**Hermes Agent**,and **OpenClaw**, etc. Beyond agentic tasks, Ling-3.0-flash also delivers strong performance across **general knowledge**,**mathematical reasoning**,**instruction following**,and **long-context understanding**.

<!-- page 7 of 13 -->

<table><tr><td></td><td>Ling-3.0-flash</td><td>Ring-2.6-1T (xhigh)</td><td>MiniMax-M2.7</td><td>Step-3.7-Flash (high)</td><td>Deepseek-V4-Flash-Preview (max)</td><td>Nemotron-3-Super-120B-A12B</td><td>GPT-5.4-mini (high)</td><td>Claude-Sonnet-4.6 (max)</td></tr><tr><td>Size</td><td>124B-A5.1B</td><td>1T-A63B</td><td>230B-A10B</td><td>198B-A11B</td><td>284B-A13B</td><td>120B-A12B</td><td>-</td><td>-</td></tr><tr><td colspan="9">Coding Agent</td></tr><tr><td>SWE-Bench Pro</td><td>56.6</td><td>53.9</td><td>56.2</td><td>56.3</td><td>52.6</td><td>34.1</td><td>47.9</td><td>48.3</td></tr><tr><td>SWE-Bench Multilingual</td><td>72.4</td><td>56.7</td><td>76.5</td><td>72.4</td><td>73.3</td><td>42.7</td><td>71.0</td><td>75.9</td></tr><tr><td>Terminal-Bench 2.1</td><td>57.0</td><td>43.1</td><td>55.0</td><td>39.3</td><td>62.0</td><td>39.0</td><td>55.8</td><td>71.2</td></tr><tr><td>ArtifactsBench</td><td>77.0</td><td>65.1</td><td>55.8</td><td>59.2</td><td>64.0</td><td>51.6</td><td>66.8</td><td>68.7</td></tr><tr><td>MiniAppBench</td><td>25.3</td><td>19.2</td><td>20.7</td><td>28.0</td><td>14.8</td><td>5.8</td><td>58.8</td><td>46.3</td></tr><tr><td>AntSWEBench</td><td>52.2</td><td>46.4</td><td>-</td><td>-</td><td>48.6</td><td>-</td><td>-</td><td>-</td></tr><tr><td colspan="9">General Agent</td></tr><tr><td>Tau3-banking-AA</td><td>28.0</td><td>14.6</td><td>8.9</td><td>11.3</td><td>22.9</td><td>10.1</td><td>11.3</td><td>30.5</td></tr><tr><td>MCP-Atlas</td><td>65.5</td><td>61.2</td><td>53.6</td><td>52.6</td><td>69.0</td><td>49.4</td><td>55.2</td><td>66.7</td></tr><tr><td>SkillsBench</td><td>44.8</td><td>11.9</td><td>28.4</td><td>24.9</td><td>53.5</td><td>20.3</td><td>44.8</td><td>54.4</td></tr><tr><td>BFCL-v4</td><td>73.0</td><td>64.8</td><td>63.6</td><td>65.4</td><td>59.5</td><td>60.6</td><td>68.3</td><td>73.1</td></tr><tr><td>GDPVal v2-AA</td><td>1107</td><td>920</td><td>1159</td><td>1017</td><td>1189</td><td>699</td><td>-</td><td>1377</td></tr><tr><td colspan="9">Search Agent</td></tr><tr><td>WideSearch</td><td>73.6</td><td>62.2</td><td>75.2</td><td>56.8</td><td>74.4</td><td>19.5</td><td>70.2</td><td>79.5</td></tr><tr><td>BrowseComp</td><td>72.2 (w/ ctx) 82.0 (MA)</td><td>71.7</td><td>76.3</td><td>75.8</td><td>73.2</td><td>31.3</td><td>-</td><td>74.0 (w/ ctx) 82.1 (MA)</td></tr><tr><td>Draco</td><td>70.4</td><td>-</td><td>66.8</td><td>-</td><td>71.3</td><td>-</td><td>61.3</td><td>75.8</td></tr><tr><td colspan="9">Instruction Following</td></tr><tr><td>IFBench</td><td>74.5</td><td>44.6</td><td>75.7</td><td>67.3</td><td>79.2</td><td>72.6</td><td>69.0</td><td>56.6</td></tr><tr><td>SysBench</td><td>93.6</td><td>86.5</td><td>86.2</td><td>91.4</td><td>93.9</td><td>90.7</td><td>93.3</td><td>94.9</td></tr><tr><td>LIFEBench</td><td>77.3</td><td>72.5</td><td>66.9</td><td>71.3</td><td>74.1</td><td>60.2</td><td>69.2</td><td>71.8</td></tr><tr><td colspan="9">Reasoning</td></tr><tr><td>AIME26</td><td>93.2</td><td>95.8</td><td>94.2</td><td>95.0</td><td>96.5</td><td>91.7</td><td>92.9</td><td>94.4</td></tr><tr><td>HMMT-Feb26</td><td>87.0</td><td>93.5</td><td>71.9</td><td>87.9</td><td>94.8</td><td>84.9</td><td>83.9</td><td>85.6</td></tr><tr><td>IMO-AnswerBench</td><td>83.7</td><td>86.1</td><td>66.9</td><td>-</td><td>87.0</td><td>77.0</td><td>74.5</td><td>82.1</td></tr><tr><td>HLE</td><td>22.7</td><td>18.3</td><td>28.1</td><td>19.9</td><td>34.8</td><td>18.3</td><td>20.6</td><td>30.0</td></tr><tr><td>LiveCodeBench (2408-2505)</td><td>82.8</td><td>87.0</td><td>75.6</td><td>78.1</td><td>91.6</td><td>78.7</td><td>80.8</td><td>83.7</td></tr><tr><td colspan="6">Long Context &amp; Multi-Turn Dialogue</td><td></td><td></td><td></td></tr><tr><td>MRCR_128K</td><td>90.8</td><td>90.1</td><td>27.7</td><td>39.2</td><td>88.5</td><td>40.8</td><td>56.1</td><td>92.5</td></tr><tr><td>MRCR_256k</td><td>81.1</td><td>76.5</td><td>-</td><td>25.7</td><td>84.3</td><td>35.8</td><td>50.5</td><td>92.7</td></tr><tr><td>AA-LCR</td><td>65.1</td><td>64.3</td><td>68.7</td><td>63.7</td><td>63.0</td><td>58.3</td><td>63.4</td><td>70.7</td></tr><tr><td>Multi-IF</td><td>87.7</td><td>89.3</td><td>82.9</td><td>84.6</td><td>86.2</td><td>82.3</td><td>84.6</td><td>84.8</td></tr></table>

<!-- page 8 of 13 -->

**Thinking mode is enabled by default. Unless otherwise specified, the default parameters for Ling-3.0-flash are as follows: temperature=0. 6, top\_p=0. 95, top\_k=20.**

**SWE-Bench Series: Evaluated using OpenHands as the agent harness with tailored prompts. Decoding uses temperature=0. 6, top\_p=0. 95,**, with a 256K context window.

**Terminal-Bench 2.1: Evaluated under the Artificial Analysis (AA) protocol using the default Terminus 2 harness, a unified 2-hour timeout, the provided JSON parser in preserve-thinking mode, and 3 runs per task (mean). Decoding uses**, with a 256K context **window.**

**MiniAppBench: A 500-task coding benchmark evaluating whether models can turn a single user request into complete, usable interactive HTML apps in real-world application-generation scenarios. Evaluated with temperature=1. 0, top\_p=1. 0, max\_tokens=128K.**

**AntSWEBench: AntSWEBench is an internally used software engineering benchmark that covers mainstream programming languages such as Java, JavaScript, and Python, including various development scenarios like new feature, bug fix, and code refactoring.**

**Tau3-banking-AA: Aligned with the AA leaderboard, utilizing GPT-5.4-mini (medium reasoning) for both the user simulator and the natural-language assertion judge.**

**MCP-Atlas: Evaluated on the 500-task public set using the official v1 harness with a 20-turn limit and Gemini-2.5-Pro as the claim-coverage judger.**

**SkillsBench: Evaluated via kilo-code on 87 tasks (excluding external API-dependent tasks), averaged over 3 runs.**

**GDPval v2-AA: Evaluated on the public 220-task benchmark using the official Stirrup harness, with a 250-turn limit and a 5-hour timeout.**

**Search-agent: For all search‑agent tasks, evaluations are performed using an internal harness. The basic ReAct paradigm is adopted for single-agent evaluation, while a multi-agent setup is employed for BrowseComp. The reported metric is the average pass@1.**

**WideSearch: Evaluated using the official prompt and the official judge model GPT-4.1 on the corrected version of the dataset.**

**Draco: Scored based on official rubrics per question, with the final score calculated as the average across all questions using Claude Opus 4.6 as the scoring model.**

<!-- page 9 of 13 -->

![Image block](images/p09-browsecomp-single-agent-evaluated-using-a-resume.png)

**BrowseComp (Single-Agent): Evaluated using a resume strategy for context management: once the context reaches a 64K-token threshold, the trajectory is summarized, the original history is discarded, and execution is resumed from the summary.**

**BrowseComp (Multi-Agent): Evaluated using an internal multi-agent search harness based on SearchSwarm/Tongyi DeepResearch, configured with**, and main/sub-agent **context windows of 128K and 64K, respectively.**

## $\mathcal { Q }$ Quickstart

## $\mathcal { Q }$ SGLang

The hardware- and recipe-specific launch matrix (BF16/FP8 × Low-Latency / High Throughput / HiCache + Mooncake), with a live command generator and verified configurations, lives in the SGLang cookbook:

**Cookbook:** [https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash](https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash)

## $\mathcal { Q }$ Install SGLang

Use the pre-built image that tracks the Ling-3.0 runtime:

**docker pull lmsysorg/sglang:dev-Ling-3.0-flash**

## Run Inference

Recommended low-latency recipe (built-in MTP / NEXTN, 256K YaRN context) on 4× 141GB-class GPUs (H20-3e) or 4-GPU Blackwell nodes:

```shell
docker run --rm --gpus all --ipc=host --shm-size 32g \
    -p 30000:30000 \
    -e HF_TOKEN=<your-hf-token> \
    lmsysorg/sglang:dev-Ling-3.0-flash \
    env SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1 \
```

<!-- page 10 of 13 -->

```shell
python3 -m sglang.launch_server \
  --model-path inclusionAI/Ling-3.0-flash \
  --tp 4 \
  --context-length 262144 \
  --speculative-algorithm NEXTN \
  --mem-fraction-static 0.8 \
  --host 0.0.0.0 \
  --port 30000
```

On 80GB cards (H100 / H800) use **--tp 8** with the same flags; see the cookbook cell for your hardware.

## Client

Thinking is enabled by default by both the chat template and the **ling3** reasoning parser. Disable it per request with **"chat\_template\_kwargs": {"enable\_thinking": false}**. We recommend the sampling parameters **temperature=0.6**, **top\_p=0.95**, and **top\_k=20**.

```python
curl -s http://localhost:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "inclusionAI/Ling-3.0-flash",
           "messages": [{"role": "user", "content": "hello!"}],
           "stream": true,
           "temperature": 0.6,
           "top_k": 20,
           "top_p": 0.95
      }'
```

For **--reasoning-parser ling3** / **--tool-call-parser ling3**, the HiCache + Mooncake L3 setup, and GSM8K / **bench\_serving** reproduction commands, see the cookbook page linked above.

```txt
vLLM
```

<!-- page 11 of 13 -->

```shell
pip install uv

uv venv ~/my_ling_env

source ~/my_ling_env/bin/activate

git clone https://github.com/vllm-project/vllm.git

cd vllm

VLLM_USE_PRECOMPILED=1 uv pip install --editable . --torch-backend=aut
```

## Run Inference

Here is the example to run Ling-3.0-flash with 4 GPUs, where the server port is **\${PORT}**:

## Server

Since the model is trained with MTP, we recommend enabling MTP during inference (i.e., --speculative-config) for lower latency.

```shell
vllm serve "$MODEL_PATH" \
    --port "$PORT" \
    --trust-remote-code \
    --served-model-name auto \
    --tensor-parallel-size 4 \
    --gpu-memory-utilization 0.85 \
    --enable-prefix-caching \
    --mamba-cache-mode align \
    --enable-auto-tool-choice \
    --tool-call-parser ling3 \
    --reasoning-parser ling3 \
    --speculative-config '{"method":"mtp","num_speculative_tokens":3}'
```



<!-- page 12 of 13 -->

## Client

We recommend using the sampling parameters **temperature=0.6**, **top\_p=0.95**, and **top\_k=20**, and enabling **enable\_thinking** for better performance.

```shell
curl -s http://${MASTER_IP}:${PORT}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "auto",
              "messages": [{"role": "user", "content": "hello!"}],
              "chat_template_kwargs": {"enable_thinking": true},
              "stream": true,
              "temperature": 0.6,
              "top_k": 20,
              "top_p": 0.95
    }'
```

## Training content summary

The public training-content summary identifying **Ling-3.0-flash** is available below. Please refer to the document for its covered model versions, training-content scope, summary version, and update date.

[Training-content summary (PDF)](https://huggingface.co/inclusionAI/AI-Transparency/resolve/main/Ling-3.0-LLM_TDS-Summary.pdf)

[Training-content documentation index](https://huggingface.co/inclusionAI/AI-Transparency)

This summary concerns training-content disclosure; it does not replace the model’s technical documentation, usage terms, or license.

System theme

Company

<!-- page 13 of 13 -->

## Website

![Image block](images/p13-image.png)