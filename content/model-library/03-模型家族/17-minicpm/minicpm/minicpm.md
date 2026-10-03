---
title: "MiniCPM · 源文"
category: "模型库"
tags: ["MiniCPM", "源文"]
published: true
excerpt: "MiniCPM 公开材料的 MinerU 抓取原文。"
---
<!-- page 1 of 10 -->

![Image block](images/p01-2026-9-25-13-41.png)

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

[OpenBMB](https://github.com/OpenBMB) / [**MiniCPM**](https://github.com/OpenBMB/MiniCPM) **Public**

[**Code**](https://github.com/OpenBMB/MiniCPM)

[Issues **12**](https://github.com/OpenBMB/MiniCPM/issues)

[Pull requests](https://github.com/OpenBMB/MiniCPM/pulls)

![Image block](images/p01-discussions-https-github-com-openbmb-minicpm-discussions.png)

[Discussions](https://github.com/OpenBMB/MiniCPM/discussions)

[Actions](https://github.com/OpenBMB/MiniCPM/actions)

[Projects](https://github.com/OpenBMB/MiniCPM/projects)

**main**

[**4 Branches**](https://github.com/OpenBMB/MiniCPM/branches)

![Image block](images/p01-2-tags-https-github-com-openbmb-minicpm-tags.png)

[**2 Tags**](https://github.com/OpenBMB/MiniCPM/tags)

![Image block](images/p01-go-to-file.png)

Go to file

**Go to file**

<table><tbody><tr><td colspan="2">hansjohn Merge pull request #381 from OpenBMB/minicpm5-2b</td><td>316cfb1 · 4 days ago</td></tr><tr><td>.github/ISSUE_TEMPLATE</td><td>fix syntax error in bug report issue template</td><td>2 years ago</td></tr><tr><td>assets</td><td>docs(readme): remove radar chart and relate…</td><td>3 weeks ago</td></tr><tr><td>demo</td><td>Update README_en.md</td><td>last year</td></tr><tr><td>docs</td><td>docs: update ms-swift fine-tuning guide for …</td><td>4 days ago</td></tr><tr><td>finetune</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr><tr><td>minicpm_sala</td><td>[New Model] Release MiniCPM-SALA (#335)</td><td>7 months ago</td></tr><tr><td>quantize</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr><tr><td>skills</td><td>docs: update ms-swift fine-tuning guide for …</td><td>4 days ago</td></tr><tr><td>tool_parsers</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr><tr><td>.gitattributes</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr><tr><td>.gitignore</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr><tr><td>LICENSE</td><td>Update LICENSE</td><td>2 years ago</td></tr><tr><td>README-cn.md</td><td>docs: update sampling parameters in READ…</td><td>2 weeks ago</td></tr><tr><td>README.md</td><td>docs: update sampling parameters in READ…</td><td>2 weeks ago</td></tr><tr><td>requirements.txt</td><td>[New Model] Release MiniCPM5-1B (#348)</td><td>4 months ago</td></tr></tbody></table>

**README** Apache-2.0 license

# 面壁小钢炮MiniCPM

[中文](https://github.com/OpenBMB/MiniCPM/blob/main/README-cn.md) **| English**

[MiniCPM Tech Report](https://arxiv.org/pdf/2506.07900) | [MiniCPM Wiki (in Chinese)](https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D?fromScene=spaceOverview) | [MiniCPM-V Repo](https://github.com/OpenBMB/MiniCPM-V/) | [UltraData](https://ultradata.openbmb.cn/) | [Online Demo](https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo)

Join our [discord](https://discord.gg/3cGQn9b3YM) and [Feishu/Lark](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=559o65ab-9086-442a-96c9-cf382e80b22d) | [Join Us](https://mp.weixin.qq.com/s/KIhH2nCURBXuFXAtYRpuXg?poc_token=HBIsUWijxino8oJ5s6HcjcfXFRi0Xj2LJlxPYD9c)

https://github.com/OpenBMB/MiniCPM

1/10

<!-- page 2 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

## ✨ Highlights

We are releasing **MiniCPM5-2B**, the second model in the **MiniCPM5** series, following [MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B). It is a dense 2B Transformer that scales up the same training recipe, built for on-device, local deployment, and resource-constrained scenarios, reaching 2B-class open-source SOTA.

🏆 **2B-class open-source SOTA**: compared with strong open-source models of similar size, MiniCPM5-2B achieves SOTA performance within this comparison set. It remains competitive with 4B-class models overall, while showing its advantages over models of comparable size in coding, mathematics, long-context understanding, tool use, and agentic tasks.

Code Reasoning

![Chart block](images/p02-open-high-quality-data-alongside-the-model-we-are.png)

📂 **Open High-Quality Data**: Alongside the model, we are releasing the high-quality training datasets behind it as part of the [UltraData](https://ultradata.openbmb.cn/) family: [UltraX](https://huggingface.co/datasets/openbmb/UltraX-Preview), a high-quality web pre-training dataset; [UltraData-Code](https://huggingface.co/datasets/openbmb/UltraData-Code), featuring L0–L3 tiered code data management to drive a significant leap in coding capabilities; [UltraData-SFT-Agent-2609](https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609), comprising 500K agent training samples to enhance comprehensive on-device agent capabilities; and [UltraData-RL-2609](https://huggingface.co/datasets/openbmb/UltraData-RL-2609), with 80K+ high-quality RL training samples covering mathematics, code, general knowledge, and long context reasoning.

## 🔥 Changelog

📌 [2026.09.07] [**MiniCPM5-2B**](https://huggingface.co/openbmb/MiniCPM5-2B) is released: a compact 2B-class dense model for on-device and resource-constrained use, paired with deployment / fine-tuning [Agent Skills](https://github.com/OpenBMB/MiniCPM/blob/main/skills).

[2026.05.19] [**MiniCPM5-1B**](https://huggingface.co/openbmb/MiniCPM5-1B) is released: a compact 1B-class dense model for on-device and resource-constrained use, paired with deployment / fine-tuning [Agent Skills](https://github.com/OpenBMB/MiniCPM/blob/main/skills)

[2026.02.11] [**MiniCPM-SALA**](https://huggingface.co/openbmb/MiniCPM-SALA) is released: a sparse-and-linear hybrid attention model for million-token context modeling and efficient inference.

[2025.09.05] [**MiniCPM4.1 series**](https://huggingface.co/collections/openbmb/minicpm-4-6841ab29d180257e940baa9b) is released: a trainable sparse-attention model with hybrid reasoning.

[2025.06.06] [**MiniCPM4**](https://huggingface.co/collections/openbmb/minicpm-4-6841ab29d180257e940baa9b) is released: an end-side model with over 5x generation acceleration on typical edge chips.

https://github.com/OpenBMB/MiniCPM

2/10

<!-- page 3 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

Older entries (2024 + InfLLM-V2 paper)

## 🧭 Quick Links

<u>✨ Highlights</u>

<u>🔥 Changelog</u>

<u>📦 Model Downloads</u>

<u>🚀 MiniCPM5-2B</u>

<u>Introduction</u>

<u>Evaluation Results</u>

<u>Training Recipe</u>

<u>What does RL + OPD bring?</u>

<u>Quickstart</u>

<u>Deployment and Fine-tuning Cookbooks and Agent Skills</u>

<u>Other Supported Frameworks</u>

<u>🚀 MiniCPM5-1B</u>

<u>🧪 MiniCPM-SALA</u>

<u>⚡ MiniCPM4 & MiniCPM4.1 Series</u>

[Legacy topics →](https://github.com/OpenBMB/MiniCPM/blob/main/docs/README-legacy.md): BitCPM4 quantization, MiniCPM4 applications

<u>📄 LICENSE</u> · <u>🏛 Institutions</u> · <u>📚 Citation</u>

## 📦 Model Downloads

**Current release: MiniCPM5-2B / MiniCPM5-1B**（BF16 / GGUF / MLX）:

MiniCPM5-2B

| HuggingFace | ModelScope |
| --- | --- |
| MiniCPM5-2B | MiniCPM5-2B |
| MiniCPM5-2B-SFT | MiniCPM5-2B-SFT |
| MiniCPM5-2B-Midtrain | MiniCPM5-2B-Midtrain |
| MiniCPM5-2B-Base | MiniCPM5-2B-Base |
| MiniCPM5-2B-GGUF | MiniCPM5-2B-GGUF |
| MiniCPM5-2B-MLX | MiniCPM5-2B-MLX |
| MiniCPM5-2B-GPTQ | MiniCPM5-2B-GPTQ |
| MiniCPM5-2B-DSpark | MiniCPM5-2B-DSpark |

MiniCPM5-1B

| HuggingFace | ModelScope |
| --- | --- |
| MiniCPM5-1B | MiniCPM5-1B |
| MiniCPM5-1B-SFT | MiniCPM5-1B-SFT |
| MiniCPM5-1B-Base | MiniCPM5-1B-Base |
| MiniCPM5-1B-GGUF | MiniCPM5-1B-GGUF |
| MiniCPM5-1B-MLX | MiniCPM5-1B-MLX |

Other key releases:

| HuggingFace | ModelScope |
| --- | --- |
| MiniCPM-SALA | MiniCPM-SALA |

https://github.com/OpenBMB/MiniCPM

3/10

<!-- page 4 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

| HuggingFace | ModelScope |
| --- | --- |
| MiniCPM4.1-8B | MiniCPM4.1-8B |
| MiniCPM4-0.5B | MiniCPM4-0.5B |

V 📋 Click to view earlier MiniCPM releases: 4, BitCPM, applications, MiniCPM3 / 2B / 1B

## MiniCPM5-2B

## Introduction

MiniCPM5-2B is the second checkpoint in the MiniCPM5 series, scaling the MiniCPM5-1B recipe up to 2B parameters for users who can afford larger footprint in exchange for stronger capability. It is designed for local assistants, coding agents, tool-use workflows, and reasoning scenarios where a compact model is preferred. The model keeps a small deployment footprint while providing native long-context support.

| Architecture | Standard LlamaForCausalLM |
| --- | --- |
| Parameters | 2,516,756,480 (non-embedding: 1,981,982,720) |
| Layers | 42 |
| Attention Heads (GQA) | 16 Q / 2 KV |
| Context Length | 131,072 |

## Evaluation Results

We compare **MiniCPM5-2B** with strong open-source models in the same size class, including **LFM2.5-2.6B**, **Qwen3.5-2B**, and **Gemma-4-E2B-it** while also listing larger models such as **Qwen3.5-4B**, **granite-4.2-3B**, **Nemotron-3-Nano-4B**, **Gemma-4-E4B-it**, and **LFM2.5-8B-A1B** for reference.

Within this comparison set, MiniCPM5-2B reaches 2B-class open-source SOTA with an average score of **53.9**, and also exceeds all of the larger models included here (the highest is **51.1**). Its advantages are most visible in code reasoning, math reasoning, long-context understanding, too use, and multiple agentic tasks.

https://github.com/OpenBMB/MiniCPM

4/10

<!-- page 5 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

Evaluation Results of MiniCPM5-2B and Baselines

<table><tr><td rowspan="2"></td><td rowspan="2">MiniCPM5-2B</td><td colspan="3">2B-class Models</td><td colspan="5">4B-class Models</td></tr><tr><td>LFM2.5-2.6B</td><td>Qwen3.5-2B</td><td>Gemma-4-E2B-it</td><td>Qwen3.5-4B</td><td>granite-4.2-3B</td><td>Nemotron-3-Nano-4B</td><td>Gemma-4-E4B-it</td><td>LFM2.5-8B-A1B</td></tr><tr><td>Average</td><td>53.9</td><td>33.2</td><td>28.0</td><td>24.6</td><td>51.1</td><td>42.7</td><td>32.6</td><td>31.2</td><td>28.4</td></tr><tr><td colspan="10">Code Reasoning</td></tr><tr><td>LiveCodeBench v6</td><td>69.1</td><td>42.1</td><td>20.2</td><td>42.9</td><td>56.4</td><td>58.9</td><td>50.7</td><td>53.9</td><td>39.8</td></tr><tr><td>LCB-Pro 25Q2 (Easy)</td><td>68.0</td><td>30.9</td><td>10.3</td><td>27.1</td><td>58.3</td><td>54.6</td><td>51.6</td><td>45.8</td><td>27.8</td></tr><tr><td>LCB-Pro 25Q2 (Medium)</td><td>17.5</td><td>0.0</td><td>0.0</td><td>0.0</td><td>7.0</td><td>5.3</td><td>5.3</td><td>1.8</td><td>0.0</td></tr><tr><td>OJBench</td><td>32.5</td><td>11.2</td><td>2.6</td><td>11.6</td><td>24.8</td><td>21.8</td><td>20.0</td><td>19.0</td><td>8.2</td></tr><tr><td>SciCode (wbg)</td><td> $26.3^+$ </td><td> $14.2^+$ </td><td> $2.8^+$ </td><td> $20.9^+$ </td><td> $16.1^+$ </td><td> $24.9^+$ </td><td> $16.4^+$ </td><td> $24.4^+$ </td><td> $7.8^+$ </td></tr><tr><td colspan="10">Math Reasoning</td></tr><tr><td>AIME 2025</td><td>86.5</td><td>41.9</td><td>29.6</td><td>31.7</td><td>78.8</td><td>79.4</td><td>56.3</td><td>37.1</td><td>46.0</td></tr><tr><td>AIME 2026</td><td>86.5</td><td>45.2</td><td>29.0</td><td>39.8</td><td>82.7</td><td>83.5</td><td>62.1</td><td>45.0</td><td>56.7</td></tr><tr><td>HMMT Feb 2026</td><td>63.8</td><td>33.7</td><td>20.5</td><td>17.8</td><td>64.0</td><td>60.8</td><td>51.3</td><td>30.1</td><td>38.5</td></tr><tr><td>MATH-500</td><td>94.6</td><td>89.6</td><td>85.8</td><td>85.4</td><td>99.0</td><td>97.0</td><td>91.6</td><td>88.2</td><td>93.2</td></tr><tr><td colspan="10">Instruction Following</td></tr><tr><td>IFBench</td><td>66.3</td><td>59.0</td><td>46.0</td><td>25.7</td><td>59.0</td><td>73.0</td><td>58.3</td><td>28.3</td><td>51.0</td></tr><tr><td>IFEval</td><td>86.7</td><td>93.4</td><td>77.5</td><td>31.4</td><td>90.2</td><td>93.7</td><td>88.0</td><td>44.4</td><td>90.8</td></tr><tr><td>Multi-IF</td><td>71.8</td><td>76.8</td><td>57.1</td><td>40.3</td><td>73.6</td><td>75.9</td><td>65.9</td><td>45.9</td><td>71.4</td></tr><tr><td colspan="10">General Knowledge</td></tr><tr><td>MMLU-Pro</td><td>70.8</td><td>65.2</td><td>64.3</td><td>56.0</td><td>78.0</td><td>65.8</td><td>65.7</td><td>68.3</td><td>63.1</td></tr><tr><td>MMLU-Redux</td><td>84.7</td><td>80.0</td><td>80.0</td><td>71.8</td><td>88.7</td><td>78.9</td><td>79.8</td><td>83.7</td><td>80.0</td></tr><tr><td>HLE</td><td> $8.9^+$ </td><td> $6.2^+$ </td><td> $2.6^+$ </td><td> $4.8^+$ </td><td> $9.9^+$ </td><td> $6.6^+$ </td><td> $4.9^+$ </td><td> $3.8^+$ </td><td> $6.9^+$ </td></tr><tr><td>GPQA-Diamond</td><td> $70.2^+$ </td><td> $55.8^+$ </td><td> $45.6^+$ </td><td> $43.3^+$ </td><td> $77.1^+$ </td><td> $55.9^+$ </td><td> $51.3^+$ </td><td> $57.6^+$ </td><td> $51.3^+$ </td></tr><tr><td>SuperGPQA</td><td>40.8</td><td>26.2</td><td>38.6</td><td>30.3</td><td>52.8</td><td>39.9</td><td>37.8</td><td>38.7</td><td>34.5</td></tr><tr><td colspan="10">Long Context</td></tr><tr><td>AA-LCR</td><td> $59.0^+$ </td><td> $5.3^+$ </td><td> $28.7^+$ </td><td> $17.0^+$ </td><td> $61.0^+$ </td><td> $24.3^+$ </td><td> $17.3^+$ </td><td> $33.0^+$ </td><td> $0.0^+$ </td></tr><tr><td>NoLiMa</td><td>68.1</td><td>0.7</td><td>17.1</td><td>3.9</td><td>43.5</td><td>5.1</td><td>1.1</td><td>2.3</td><td>0.5</td></tr><tr><td>LongBenchPro</td><td>44.8</td><td>23.7</td><td>8.2</td><td>42.2</td><td>58.4</td><td>34.8</td><td>27.9</td><td>53.5</td><td>19.6</td></tr><tr><td>LongBench v2</td><td>43.7</td><td>30.3</td><td>24.9</td><td>33.2</td><td>47.3</td><td>36.0</td><td>32.0</td><td>42.7</td><td>30.4</td></tr><tr><td colspan="10">Tool Use</td></tr><tr><td> $\tau^3$ -Bench Banking</td><td> $20.8^+$ </td><td> $7.2^+$ </td><td>2.1</td><td>3.9</td><td> $6.8^+$ </td><td> $5.6^+$ </td><td>1.2</td><td>4.1</td><td>3.4</td></tr><tr><td> $\tau^2$ -Bench Telecom</td><td>97.1</td><td>90.4</td><td> $69.0^+$ </td><td> $20.8^+$ </td><td> $92.1^+$ </td><td>40.9</td><td> $28.1^+$ </td><td> $20.8^+$ </td><td> $16.1^+$ </td></tr><tr><td>BFCL v4</td><td>66.6</td><td>61.1</td><td>43.6</td><td>36.6</td><td>56.8</td><td>52.2</td><td>43.7</td><td>47.0</td><td>49.2</td></tr><tr><td colspan="10">Coding Agent</td></tr><tr><td>SWE-bench Verified</td><td>46.4</td><td>6.0</td><td>5.0</td><td>2.0</td><td>33.6</td><td>36.8</td><td>3.0</td><td>15.0</td><td>0.4</td></tr><tr><td>SWE-bench Pro</td><td>14.4</td><td>0.6</td><td>0.8</td><td>0.0</td><td>28.2</td><td>12.3</td><td>0.1</td><td>3.3</td><td>0.4</td></tr><tr><td>Terminal-Bench v2.1</td><td> $8.6^+$ </td><td> $4.5^+$ </td><td> $3.0^+$ </td><td> $0.4^+$ </td><td> $25.8^+$ </td><td> $13.9^+$ </td><td> $3.8^+$ </td><td> $1.9^+$ </td><td>1.9</td></tr><tr><td colspan="10">Search Agent</td></tr><tr><td>BrowseComp-ZH</td><td>43.5</td><td>9.8</td><td>18.2</td><td>4.7</td><td>39.6</td><td>21.1</td><td>3.3</td><td>7.0</td><td>13.2</td></tr><tr><td>BrowseComp Top100</td><td>39.7</td><td>13.7</td><td>19.3</td><td>6.0</td><td>33.3</td><td>19.0</td><td>4.7</td><td>6.3</td><td>9.7</td></tr><tr><td>GAIA Text-103</td><td>88.7</td><td>49.5</td><td>47.9</td><td>30.1</td><td>78.6</td><td>57.3</td><td>26.5</td><td>39.5</td><td>41.1</td></tr><tr><td colspan="10">General Agent</td></tr><tr><td>GDPval-AA v2</td><td> $19.6^+$ </td><td>4.5</td><td>0.0</td><td>0.0</td><td>11.7</td><td> $0.0^+$ </td><td>0.0</td><td>0.0</td><td>0.0</td></tr><tr><td>Claw-Gym</td><td>59.2</td><td>19.3</td><td>25.5</td><td>31.3</td><td>51.6</td><td>60.0</td><td>33.7</td><td>37.9</td><td>2.7</td></tr><tr><td>WildClaw</td><td>23.9</td><td>10.2</td><td>9.2</td><td>8.9</td><td>17.0</td><td>20.0</td><td>8.9</td><td>14.3</td><td>4.5</td></tr><tr><td>QwenClaw</td><td>42.9</td><td>19.3</td><td>18.2</td><td>14.5</td><td>37.1</td><td>36.4</td><td>16.8</td><td>16.7</td><td>4.5</td></tr></table>

1. Blue bold indicates the best result across all models in the row (including 4B-class models); Black bold indicates the best result among 2B-class models. 2. Scores marked  come from the official Artificial Analysis release; all others are reproduced internally.

**Training Recipe**

https://github.com/OpenBMB/MiniCPM

5/10

<!-- page 6 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

The training of MiniCPM5-2B is a full-stack practice of [**UltraData Tiered Data Management**](https://arxiv.org/pdf/2602.09003), covering three stages: base training, mid-training, and post-training.

During **base training**, the model goes through stable training and decay training to build core language capability and training stability. It then enters **mid-training** to further strengthen target capabilities and adapt to the target data distribution. The training corpus is released alongside the model as [Ultra-FineWeb](https://huggingface.co/datasets/openbmb/Ultra-FineWeb), [Ultra-FineWeb-L3](https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3), [UltraX](https://huggingface.co/datasets/openbmb/UltraX-Preview), [UltraData-Code](https://huggingface.co/datasets/openbmb/UltraData-Code) and [UltraData-Math](https://huggingface.co/datasets/openbmb/UltraData-Math)

During **post-training**, we proceed in three steps: **SFT**, **RL**, and **OPD**. We first use **400B tokens of deep-thinking SFT** to establish deep-thinking and general chat abilities; the SFT data is released as [UltraData-SFT-2605](https://huggingface.co/datasets/openbmb/UltraData-SFT-2605) and Agent SFT data as [UltraData-SFT-Agent-2609](https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609). We then train specialized **RL teachers** for math, code, agentic tasks, writing, and related domains(with the corresponding data also open-sourced as [UltraData-RL-2609](https://huggingface.co/datasets/openbmb/UltraData-RL-2609)), and use **On-Policy Distillation (OPD)** to distill these teachers back into one release model.

![Image block](images/p06-what-does-rl-opd-bring.png)

What does RL + OPD bring?

**RL + OPD** is a key part of MiniCPM5-2B post-training. During the **RL** stage, we adopted the critic-based algorithm described in [JustRL II](https://panhaoxuan.notion.site/justrl-ii-scaling-small-llms-to-128k-reasoning-with-a-critic), substantially improving training stability and achieving significant gains across multiple domains. On the benchmarks listed below, RL + OPD improves reasoning and general capabilities by an average of **↑10.96 points**, and agentic capabilities by **↑6.96 points**.

**OPD** merges the capabilities of 16 expert models produced by RL training, including 5 agentic expert models. At each response position, we compute the full-vocabulary reverse KL divergence between student and teacher logits as the advantage estimate, replacing the original verification-based advantage. OPD directly reuses the prompts used to train each RL teacher as distillation data, so no additional corpus construction is required.

https://github.com/OpenBMB/MiniCPM

6/10

<!-- page 7 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub Score Gains from RL + OPD

![Chart block](images/p07-chart.png)

![Chart block](images/p07-quickstart.png)

## Quickstart

We recommend using the following sets of sampling parameters for generation: temperature=1.0, top\_p=0.95, min\_p=0.0 .

If you encounter repetitive outputs, try: temperature=1.0, top\_p=0.95, min\_p=0.0, repetition\_penalty=1.05 .

Please note that the support for sampling parameters varies according to inference frameworks.

https://github.com/OpenBMB/MiniCPM

7/10

<!-- page 8 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

```txt
vLLM
```

```batch
pip install "vllm>=0.21"
vllm serve openbmb/MiniCPM5-2B --port 8000
```

```python
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openbmb/MiniCPM5-2B",
    "messages": [{"role": "user", "content": "Who are you? Please briefly introduce yourself."}],
    "max_tokens": 128,
    "temperature": 1.0, "top_p": 0.95
  }'
```

## SGLang

```batch
pip install "sglang[srt]>=0.5.16"
python -m sglang.launch_server --model-path openbmb/MiniCPM5-2B --port 30000
```

```shell
curl http://localhost:30000/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "model": "openbmb/MiniCPM5-2B",
  "messages": [{"role": "user", "content": "Who are you? Please briefly introduce yourself."}],
  "max_tokens": 128,
  "temperature": 1.0, "top_p": 0.95
}'
```

**Speculative decoding (DSpark)**: we also release [MiniCPM5-2B-DSpark](https://huggingface.co/openbmb/MiniCPM5-2B-DSpark), a DSpark draft model trained for MiniCPM5-2B. Enable it in SGLang to accelerate decoding while keeping the target model's outputs unchanged:

```shell
python -m sglang.launch_server \
  --model-path openbmb/MiniCPM5-2B \
  --trust-remote-code \
  --speculative-algorithm DSPARK \
  --speculative-draft-model-path openbmb/MiniCPM5-2B-DSpark \
  --speculative-dspark-block-size 7 \
  --port 30000
```

## Llama.cpp

```batch
llama-server -m MiniCPM5-2B-F16.gguf -a MiniCPM5-2B --port 8080 -ngl 99 -c 8192 --jinja
```

-c 8192 sets the context length. You can adjust this value as needed.

```txt
curl http://localhost:8080/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
        "model": "MiniCPM5-2B",
        "messages": [{"role": "user", "content": "1+1=?"}],
        "temperature": 1.0, "top_p": 0.95, "min_p": 0.0, "max_tokens": 256
    }'
```

In llama.cpp, the default min\_p=0.05 can lead to repetitive output: it filters out tokens whose probability is below 5% of the highest-probability token, potentially discarding the exact tokens needed to break out of a repetition loop. To prevent this, we set min\_p=0.0 .

## Transformers

```batch
pip install -U "transformers>=5.6" accelerate torch
```

https://github.com/OpenBMB/MiniCPM

8/10

<!-- page 9 of 10 -->

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
model_id = "openbmb/MiniCPM5-2B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype="auto",
    device_map="auto",
)
messages = [{"role": "user", "content": "Who are you? Please briefly introduce yourself."}]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    enable_thinking=True,
    return_dict=True,
    return_tensors="pt",
).to(model.device)
outputs = model.generate(**inputs, max_new_tokens=128)
print(tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True))
```

## Tool Calling

For tool / function calling, **SGLang is the recommended backend**. MiniCPM5-2B emits XML-style tool calls and SGLang's built-in minicpm5 parser converts them to OpenAI-compatible tool\_calls natively:

```shell
python -m sglang.launch_server --model-path openbmb/MiniCPM5-2B --port 30000 \
    --tool-call-parser minicpm5      # or: --tool-call-parser auto
```

## GitHub Cookbooks and Agent Skills

MiniCPM5-2B uses the **standard LlamaForCausalLM architecture**, so mainstream inference engines can load it directly: **no custom kernels, no model-code fork**. For step-by-step deployment and fine-tuning instructions, use the GitHub cookbooks below. Agent Skills are linked as GitHub resources for users working with Cursor / Claude Code style coding agents.

## Deployment

| Backend | Model format / use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| Transformers | BF16 / FP16 local Python inference, GPU + CPU | transformers.md | minicpm5-deploy-transformers |
| vLLM | BF16 / FP16 OpenAI server | vllm.md | minicpm5-deploy-vllm |
| SGLang | BF16 / FP16 OpenAI server, recommended for tool calling | sglang.md | minicpm5-deploy-sglang |
| llama.cpp | GGUF local inference, CPU/GPU | llama_cpp.md | minicpm5-deploy-llama-cpp |
| Ollama | GGUF local on-device runtime | ollama.md | minicpm5-deploy-ollama |
| LM Studio | GGUF Mac desktop app and OpenAI server | lmstudio.md | minicpm5-deploy-lmstudio |
| MLX | MLX / 4bit local inference on Apple Silicon | mlx.md | minicpm5-deploy-mlx |
| ArcLight | GGUF local on-device, CPU, Desktop &amp; Server | arclight.md | minicpm5-deploy-arclight |
| LiteRT-LM | .litertlm on-device runtime: Android / iOS / desktop / IoT, CPU + GPU | litert.md | minicpm5-deploy-litert |
| vLLM Ascend | BF16 / FP16 OpenAI server | vllm_ascend.md | minicpm5-deploy-vllm-ascend |

**Fine-tuning**

| Framework | Use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| TRL + PEFT | LoRA / SFT fine-tuning | trl.md | minicpm5-finetune-trl |

https://github.com/OpenBMB/MiniCPM

9/10

<!-- page 10 of 10 -->

![Image block](images/p10-2026-9-25-13-41.png)

2026/9/25 13:41

GitHub - OpenBMB/MiniCPM: MiniCPM5: SOTA on-device LLMs, small yet powerful. · GitHub

| Framework | Use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| LLaMA-Factory | Fine-tuning | llamafactory.md | minicpm5-finetune-llamafactory |
| ms-swift | Fine-tuning | ms_swift.md | minicpm5-finetune-ms-swift |
| unsloth | Fine-tuning | unsloth.md | minicpm5-finetune-unsloth |

## Other Supported Frameworks

In addition to the deployment and fine-tuning frameworks listed above, MiniCPM5-2B is also supported by FlagOS for multi-chip deployment.

## FlagOS Overview

To enable large-scale deployment across different AI chips, Beijing Zhiyuan Research Institute, together with numerous research institutions chip manufacturers, system vendors, and algorithm and software organizations both domestically and internationally, jointly initiated and established the FlagOS Open Source Community.

The FlagOS community is dedicated to building a unified, open-source system software stack for various AI chips, encompassing core open-source projects such as a large-scale operator library, a unified AI compiler, parallel training and inference frameworks, and a unified communication library. It aims to create an open technology ecosystem connecting the “model-system-chip” layers. By enabling “develop once deploy across chips”, FlagOS unlocks the computational potential of hardware, breaks down the ecosystem silos between different chip software stacks, and effectively reduces migration costs for developers.The FlagOS community fosters an AI hardware and software ecosystem, overcomes single-vendor closed-source monopolies, promotes widespread deployment of AI hardware technologies, and is committed to rooted in China while embracing global collaboration.

Official website express: [https://flagos io](https://flagos.io/)

## [Releases](https://github.com/OpenBMB/MiniCPM/releases) 2

[**MiniCPM5-1B Latest** 4 months ago](https://github.com/OpenBMB/MiniCPM/releases/tag/5.0)

[+ 1 release](https://github.com/OpenBMB/MiniCPM/releases)

## [Contributors](https://github.com/OpenBMB/MiniCPM/graphs/contributors) 41

![Image block](images/p10-27-contributors-https-github-com-openbmb-minicpm-graphs.png)

[+ 27 contributors](https://github.com/OpenBMB/MiniCPM/graphs/contributors)

## Languages

[**Jupyter Notebook** 50.7%](https://github.com/OpenBMB/MiniCPM/search?l=jupyter-notebook) [**Python** 45.8%](https://github.com/OpenBMB/MiniCPM/search?l=python) [**Shell** 3.5%](https://github.com/OpenBMB/MiniCPM/search?l=shell)

https://github.com/OpenBMB/MiniCPM

10/10