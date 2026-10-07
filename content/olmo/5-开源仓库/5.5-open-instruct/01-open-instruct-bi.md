---
title: "Open Instruct 官方文档对照译稿"
category: "开源仓库"
tags: ["OLMo", "Open Instruct", "对照译稿", "后训练"]
published: true
excerpt: "固定到提交 1182625 的 README 项目定位、安装、训练、污染检查、开发与许可章节，以及 OLMo 3 tokenizer 设置文档的逐段英中对照。"
---

# Open Instruct 官方文档对照译稿

源码范围固定为 `data/sources/open-instruct/repo`，提交 `11826255077617a46919ce75cadf1f3d53f30dac`。本文完整对照 README 从标题至项目论文说明、`Setup` 至 `Acknowledgements` 的连续公开正文；模型链接大表和历史 News 只保留用途说明，不逐项重排。另完整对照 `docs/olmo3.md` 的 `Tokenizer Settings` 与末尾 TLDR。代码、路径、配置键和模型 ID 保持原文。

## README：项目定位

> Training Open Instruction-Following Language Models

训练开放的指令遵循语言模型。

> This repo serves as an open effort on instruction-tuning and post-training popular pretrained language models on publicly available datasets.

本仓库是一项开放工作：使用公开可用数据集，对流行预训练语言模型进行指令微调与后训练。仓库持续发布：统一格式下的最新微调方法和指令数据代码；DPO、偏好微调与可验证奖励强化学习（RLVR）代码；以及探索过程中产生的 checkpoint 和其他有用制品。

> We also support some evaluations natively in the codebase, but these are now unmaintained and instead we suggest using OLMES, which we used for TÜLU 3.

代码库原生支持部分评测，但这些实现已不再维护；官方改为建议使用 TÜLU 3 所采用的 OLMES。

> The latest details on open post-training are found in TÜLU 3. Please see our first paper ... our second paper ... For more recent results involving PPO and DPO please see our third paper.

开放后训练的最新细节见 TÜLU 3 论文。项目第一篇论文研究公开资源上的指令微调，第二篇以 Llama 2 和 DPO 构建 Tulu 2，第三篇则比较偏好反馈学习中的 PPO 与 DPO 实践。README 随后列出 Base、SFT、DPO、RLVR 最终模型和奖励模型的 Hugging Face 链接；这些链接展示的是多阶段产物链，而非声称每个模型都由同一脚本生成。

## README：Setup

> Our setup follows our Dockerfile. Note that Open Instruct is a research codebase and does not guarantee backward compatibility.

环境设置以仓库 Dockerfile 为准。Open Instruct 是研究代码库，不保证向后兼容。

> We use uv for installation and running code. You can install with `uv sync`.

项目使用 uv 安装和运行代码，可执行 `uv sync`。运行测试还需安装 Git LFS，并在克隆前执行 `git lfs install`。

> Docker installation: You can also use the Dockerfile to build a Docker image.

也可通过 Dockerfile 构建镜像：

```bash
docker build . \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD) \
  -t open_instruct_dev
```

若在 Ai2 内部，可把镜像发布到 Beaker。内部用户也可使用持续自动构建的 `nathanl/open_instruct_auto` 镜像。

## README：Training

> After having setup the environment, you are ready to launch some experiments. We provide a few examples below. To learn more about how to reproduce the Tulu 3 models, please refer to the Tulu 3 README.

环境准备完成后即可启动实验。复现 Tulu 3 应阅读 `docs/tulu3.md`，Tulu 1 和 Tulu 2 则见 `docs/tulu1_tulu2.md`。

### Finetuning

> You can run the following command for getting started:

入门微调命令如下：

```bash
# train an 8B tulu3 model using 8 GPU
bash scripts/train/tulu3/finetune_8b.sh
```

> OLMo-core SFT: For supported models (OLMo, OLMoE, Qwen3), we recommend the more GPU-efficient OLMo-core SFT implementation. See `open_instruct/olmo_core_utils.py` for the list of supported models.

OLMo-core SFT：对支持的 OLMo、OLMoE、Qwen3，官方推荐 GPU 效率更高的 OLMo-core SFT 实现；支持模型清单以 `open_instruct/olmo_core_utils.py` 为准。

### Preference Tuning

```bash
# train an 8B tulu3 model using 8 GPU
bash scripts/train/tulu3/dpo_8b.sh
```

以上命令启动 8 卡的 Tulu 3 8B 偏好训练。

### Reinforcement Learning with Verifiable Rewards

> We train with `open_instruct/grpo_fast.py`. Launch via `scripts/train/build_image_and_launch.sh`, which builds the Beaker image from your current commit and runs the chosen script.

RLVR 使用 `open_instruct/grpo_fast.py` 训练。通过 `scripts/train/build_image_and_launch.sh` 启动；它会从当前提交构建 Beaker 镜像，再运行指定脚本。

```bash
./scripts/train/build_image_and_launch.sh scripts/train/debug/single_gpu_on_beaker.sh
./scripts/train/build_image_and_launch.sh scripts/train/debug/large_test_script.sh
```

第一条是 Beaker 单 GPU 冒烟测试，第二条是 Qwen2.5-7B 代码 RLVR 的双节点 8 GPU 测试。

## README：污染检查、开发、结构与许可

> We release our scripts for measuring the overlap between instruction tuning datasets and evaluation datasets in `./decontamination`.

仓库在 `decontamination/` 发布测量指令训练数据与评测数据重叠的脚本，细节见其中 README。

> When submitting a PR, we check the core code in `open_instruct/` for style with `make style` and `make quality`. Run the tests with `uv run pytest`.

提交 PR 时，核心代码通过 `make style` 与 `make quality` 检查；测试使用 `uv run pytest`。可用 `uv add pre-commit --dev` 安装 pre-commit，再运行 `uv run pre-commit install`；首次设置后建议执行 `uv run pre-commit run --all-files`。

> Repo structure

仓库结构中，`assets/` 放图像与许可，`configs/` 放 Beaker、DeepSpeed 和训练配置，`decontamination/` 放训练—评测重叠测量脚本，`human_eval/` 是已不维护的人评界面，`open_instruct/` 是扁平源码目录，`scripts/` 放核心训练与评测脚本，Dockerfile 定义容器环境。

> This codebase is licensed under Apache 2.0. V1 model licenses ... V2 models are licensed under the low-risk AI2 ImpACT license.

代码库按 Apache 2.0 许可。V1 模型还要结合基础模型许可与 `assets/model_licenses/tulu_license.txt`；V2 模型使用低风险 AI2 ImpACT 许可。代码许可与模型许可并非同一个判断。

> Open Instruct benefited from many open-source projects and libraries.

致谢指出：微调脚本改编自 Hugging Face Trainer；偏好训练借鉴 TRL 和 Eric Mitchell 的 DPO；PPO 核心借鉴 OpenAI 的人类偏好与反馈总结代码及其复现工作；70B PPO/RLVR 的 Ray + vLLM 分布式代码借鉴 OpenRLHF。

## docs/olmo3.md：Tokenizer Settings

> When releasing multiple models and using two different codebases for post-training, there are many steps needed to get exact chat templates right.

当同时发布 instruct/think 多种模型、又用 OLMo-core 做 SFT、Open Instruct 做 DPO 与 RL 时，必须经过多步才能让 chat template 精确一致。最终公开模板还可能用不同 system prompt 保持模型身份。本文档记录 OLMo 3 的已知设置。

> Olmo 3 Instruct Models

OLMo 3 Instruct：7B 与 32B 都用 `allenai/olmo-3-tokenizer-instruct-dev` 分词和中间评测。7B 在 Hugging Face 发布该 tokenizer，演示可加入 OLMo 身份 system prompt；32B 的 SFT/DPO 用该 tokenizer，RL/Playground 的最终模型模板加入修改过的身份提示。差异来自需要让公开模型与演示行为匹配，理想状态仍是二者一致。

> Olmo 3 Thinking Models

7B Think 的 SFT 使用带 OLMo 身份的 `olmo_thinker_no_think_7b`，阶段交接中的小沟通失误使 DPO/RL 模板略有不同，最终发布模型反映了这种差异。32B Think 用不含身份提示的 `olmo_thinker_no_think_sft_tokenization` 训练，发布时再在 `add_generation_prompt` 加 think token。团队后来认识到不应把身份固化进训练提示，但已无预算重训 7B。

> Olmo 3.2+ models

Olmo 3.2+ 的 Think SFT/DPO 用 instruct-dev 模板，它不含 `<think>`，避免分词时把 `<think>` 错误掩蔽。Think 评测用 `olmo-3.2-tokenizer-think-dev`，它在生成提示中加入 `<think>`；发布用 think-release，再加入身份 system prompt。Instruct 发布用 instruct-release，它同样是在 dev 基础上增加身份提示。

> Assistant labels and Olmo 3.5

SFT/DPO 可用 `{% generation %}` 标记渲染后的 assistant 输出。标记应位于 assistant header 之后、任何 `<think>` 之前，覆盖 reasoning、答案、序列化工具调用与结束 token，而仅推理使用的 `add_generation_prompt` 应留在标记外。工具调用以 `<|im_end|>` 训练控制权交接，普通答案以 EOS 结束。所有权含糊、结束 token 放在块外会使样本被记录并丢弃。

生成标注随 tokenizer 保存，但消费者必须支持 Jinja generation 扩展。OLMo 3.5 tokenizer 修订 `8b9717061fae09d5be814373d189919a62a9a00d` 已带标注；更老修订会回退到 prefix labeling，仍可能掩蔽开头 `<think>`。Transformers 内部渲染 API 升级后必须重跑渲染与标签测试。

> Note on `chat_template.jinja` vs `tokenizer_config.json`

若 Hugging Face 仓库同时有 `chat_template.jinja` 与 `tokenizer_config.json` 的 `chat_template` 字段，Transformers 优先前者。两份必须同步，或只保留一份；`diff_tokenizers.py` 会比较它们。

> There are two main issues ... think token chopping ... identity issue.

模板漂移有两个主因：分词代码曾把第一个 `<think>` 当提示的一部分而错误掩蔽；训练与发布又需要不同身份 system prompt。

### TLDR

- instruct-dev 是具有工具能力的 instruct 与 think 模型分词主模板。
- Instruct 训练/评测使用 instruct-dev；发布使用增加身份的 instruct-release。
- Think SFT/DPO 使用 instruct-dev 以避开 `<think>` 掩蔽错误；Think 评测与 RL prompt 使用增加 `<think>` 的 think-dev；发布使用增加身份的 think-release。

```bash
python scripts/tokenizers/diff_tokenizers.py allenai/olmo-3-tokenizer-instruct-dev allenai/olmo-3-tokenizer-instruct-release
```

以上命令用于验证两个 tokenizer 仓库是否只在预期位置不同。
