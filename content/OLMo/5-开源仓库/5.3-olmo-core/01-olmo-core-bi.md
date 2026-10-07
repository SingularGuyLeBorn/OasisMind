---
title: "OLMo-core 官方文档对照译稿"
category: "开源仓库"
tags: ["OLMo", "OLMo-core", "对照译稿", "训练框架"]
published: true
excerpt: "固定到提交 5f6f58a 的 OLMo-core README 与数据加载指南选段英中对照，覆盖安装、官方训练脚本、推理、开发及内置数据管线。"
---

# OLMo-core 官方文档对照译稿

对照原文来自本地官方源码快照 `data/sources/OLMo-core/repo`，固定提交为 `5f6f58a133e7ef577d596295f2c8db4651c27857`。内容覆盖 `README.md` 的 **Installation、Official training scripts、Inference、Evaluation、Development** 五个连续章节，以及 `docs/source/guides/data_loading.rst` 开头至 **Using a custom data loader** 的连续正文；标题、段落、列表与代码块均依原顺序保留。

## README.md：Installation

> First install PyTorch according to the instructions specific to your operating system and hardware.

第一步按照与你的操作系统和硬件相匹配的说明安装 PyTorch。

> For development, we recommend installing from source:

用于开发时，官方建议从源码安装：

```bash
git clone https://github.com/allenai/Olmo-core.git
cd Olmo-core
pip install -e .[all]
```

> Or you can install from PyPI with:

也可以从 PyPI 安装：

```bash
pip install ai2-olmo-core
```

> There are a number of optional dependencies that must be installed to use certain functionality as well, including:

若要使用某些功能，还必须安装对应的可选依赖，包括：

- `flash-attn`、`ring-flash-attn` 和 TransformerEngine：用于对应的注意力后端。
- Liger-Kernel：用于低显存的 fused-linear 损失实现。
- `torchao`：用于 float8 训练。
- `grouped_gemm`：用于不丢 token 的 MoE；在其 PR #21 发布前可能需要从源码编译。
- QuACK：用于部分基于 CuTe 的 kernel。

> The published Docker images contain all core and optional dependencies, and are regularly tested on our in-house H100 clusters. But there are several things to keep in mind if you intend to use these images:

官方发布的 Docker 镜像包含全部核心依赖与可选依赖，并定期在内部 H100 集群上测试。不过使用这些镜像时要注意：

- 镜像没有安装 OLMo-core 包本身，只安装了依赖，以便适应代码的频繁变化。
- 如果你的硬件或驱动、CUDA 版本不同，镜像可能无法在你的集群上工作。

> If the published images do not work for your use-case for any of the above reasons, you could adapt our Dockerfile to build your own images.

如果官方镜像因上述原因不适用，可以修改仓库的 Dockerfile 来构建自己的镜像。

## README.md：Official training scripts

> Official training scripts for released models can be found in `src/scripts/official/`.

已发布模型的官方训练脚本位于 `src/scripts/official/`。

> These scripts are meant to be launched with `torchrun`, or with Olmo-core's Beaker launch CLI if you have access to Beaker.

这些脚本应通过 `torchrun` 启动；如果能够使用 Beaker，也可以通过 OLMo-core 的 Beaker 启动命令行运行。

```bash
torchrun --nproc-per-node=8 src/scripts/official/OLMo2/OLMo-2-0325-32B-train.py \
  --save-folder=/path/to/save/checkpoints
```

> You can override most configuration options from the command-line. For example, to override the learning rate you could launch the script like this:

大多数配置项都可以在命令行覆盖。例如可这样覆盖学习率：

```bash
torchrun --nproc-per-node=8 src/scripts/official/OLMo2/OLMo-2-0325-32B-train.py \
  --save-folder=/path/to/save/checkpoints \
  --train_module.optim.lr=6e-3
```

> To continue annealing from a checkpoint, we use a separate script which can be launched like this:

若要从某个 checkpoint 继续退火，官方使用单独的脚本：

```bash
torchrun --nproc-per-node=8 src/scripts/official/OLMo2/OLMo-2-0325-32B-anneal.py \
  --save-folder=/path/to/save/checkpoints \
  --checkpoint=https://storage.googleapis.com/ai2-llm/peteish32/step721901
```

### Available Training Scripts

| Model Family | Directory | Description |
|---|---|---|
| OLMo-2 | `src/scripts/official/OLMo2/` | OLMo-2 32B 模型的训练脚本与模型卡 |
| OLMo-3 | `src/scripts/official/OLMo3/` | OLMo-3 7B 与 32B 模型的训练脚本与模型卡 |

## README.md：Inference

> With Hugging Face Transformers. You can use our Hugging Face transformers integration to run inference on the OLMo checkpoints.

使用 Hugging Face Transformers：可通过其集成对 OLMo checkpoint 运行推理，要求 `transformers>=4.57.0`。README 给出的完整示例如下：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
olmo = AutoModelForCausalLM.from_pretrained("allenai/Olmo-3-1125-32B")
tokenizer = AutoTokenizer.from_pretrained("allenai/Olmo-3-1125-32B")
message = ["Language modeling is "]
inputs = tokenizer(message, return_tensors='pt', return_token_type_ids=False)
response = olmo.generate(**inputs, max_new_tokens=100, do_sample=True, temperature=1.0, top_p=0.7)
print(tokenizer.batch_decode(response, skip_special_tokens=True)[0])
```

> Alternatively, with the Hugging Face pipeline abstraction:

也可以使用 Hugging Face 的 pipeline 抽象：

```python
from transformers import pipeline
olmo_pipe = pipeline("text-generation", model="allenai/Olmo-3-1125-32B")
print(olmo_pipe("Language modeling is"))
```

> With vLLM. vLLM provides high-throughput inference for OLMo models. You can use it for offline batched inference.

使用 vLLM：vLLM 为 OLMo 模型提供高吞吐推理，可用于离线批量推理，README 要求 `vllm>=0.11.0`。

> With Olmo-core (beta). Autoregressive generation is supported directly in Olmo-core. Using this capability, we provide a chat-loop demo that can be used to interact with models in an interactive chat session.

使用 OLMo-core（beta）：仓库直接支持自回归生成，并提供交互式聊天循环演示：

```bash
python -m olmo_core.generate.chat https://olmo-checkpoints.org/ai2-llm/Olmo-3-1025-7B/stage3/step11921/ --max-new-tokens 512
```

## README.md：Evaluation 与 Development

> Additional tools for evaluating OLMo models are available at the OLMo Eval and olmes repositories.

用于评测 OLMo 模型的其他工具位于 OLMo Eval 与 olmes 仓库。

> The Python library source code is located in `src/olmo_core`. The corresponding tests are located in `src/test`. The library docs are located in `docs`. You can build the docs locally with `make docs`.

Python 库源码位于 `src/olmo_core`，对应测试位于 `src/test`，库文档位于 `docs`；可执行 `make docs` 在本地构建文档。

> We use `pytest` to run tests. We use `isort` and `black` for code formatting. We use `ruff` as our primary linter. We use `mypy` as our type checker.

项目用 `pytest -v src/test` 运行全部测试，也可指定单个测试文件；用 isort 与 Black 格式化代码，可运行 `make style-check` 校验；以 Ruff 为主要 lint 工具，对应 `make lint-check`；以 mypy 做类型检查，对应 `make type-check`。

## data_loading.rst：Datasets and Data loading

> Most of this guide is specific to text-based data, however the Trainer can be used with other modalities as well by creating a custom data loader subclass of DataLoaderBase.

本指南大部分内容针对文本数据；不过，只要创建 `DataLoaderBase` 的自定义子类，`Trainer` 也能用于其他模态。

### Data preparation

> Olmo-core's builtin data loading functionality requires you to pre-tokenize your data into 1D numpy arrays of token IDs. These arrays should include all special tokens already—such as EOS tokens—except for padding tokens.

OLMo-core 的内置数据加载功能要求预先把数据分词为 token ID 的一维 NumPy 数组。数组应已经包含 EOS 等全部特殊 token，但不包含 padding token。

```python
import numpy as np
documents = ["Hello, World!", "The quick brown fox jumped over the fence"]
token_ids = []
for doc in documents:
    token_ids.extend(tokenizer.encode(doc))
data_mmap = np.memmap("data001.npy", mode="w+", dtype=np.uint32, shape=(len(token_ids),))
data_mmap[:] = token_ids
data_mmap.flush()
```

> The dolma project includes an optimized toolkit for pre-processing data into this format.

Dolma 项目提供了把数据预处理为这种格式的优化工具。

### Train data loading

> The built-in data loading strategies can be broadly categorized into two types: fixed sequence length (FSL) training and variable sequence length (VSL) training.

内置加载策略大体分为固定序列长度（FSL）与可变序列长度（VSL）两类。`NumpyFSLDataLoader` 和 `ComposableDataLoader` 可用于 FSL，`NumpyVSLDataLoader` 用于 VSL。前者接收负责从预分词 NumPy 文件加载和采样的 `NumpyDatasetBase` 子类；组合式加载器则接收一个或多个 `InstanceSource`。

### Numpy fixed sequence length datasets

> Concatenate and chunk: all tokenized documents are concatenated together and then chunked into training instances of the desired sequence length.

“拼接后切块”把全部已分词文档连在一起，再按目标长度切成训练样本。它简单高效，但文档可能跨样本断开；同一样本也可能含多个文档，使模型发生跨文档注意。`NumpyFSLDatasetMixture` 可生成由多个数据源细粒度混合的数据集。

> Concatenate and chunk + intra-document masking.

“拼接后切块 + 文档内掩码”通过 `generate_doc_lengths=True` 解决跨文档注意问题。模型的 `forward()` 必须接收 `doc_lens` 与 `max_doc_lens` 并在内部应用文档内掩码。

> Document packing uses the Optimized Best-Fit Decreasing bin-packing algorithm to pack documents into instances without fragmentation and with minimal padding.

文档打包以 OBFD 装箱算法把文档装入样本，除长度超过目标序列的文档外不做切碎，并尽量减少 padding。长文档可截断丢弃超长部分，也可回退到跨样本切分。默认逐源文件打包；大于 1GB 的源文件通常能取得较高紧凑度，也便于并行。设置 `source_group_size>1` 可把多个相邻源文件一起打包。

> Document padding creates fixed-length training instances by padding each document to the target sequence length.

文档填充把每篇短文档补到目标长度，长文档则切成多个样本。它彻底避免跨文档注意，但文档长度差异大时 padding 浪费严重，因此一般更推荐 `NumpyPackedFSLDataset`。

> Interleaved documents forms instances by chunking documents and then interleaving these chunks.

交错文档策略先切块再交错，目的是迫使模型关注训练样本中距离很远的 token，可能改善长距离依赖；它不支持文档内掩码，因为那会抵消交错的目的。

### Numpy variable sequence length training

> There is only one built-in dataset for VSL training: NumpyVSLDataset. This dataset is used to inject a sequence length-based curriculum during training.

VSL 训练只有一个内置数据集 `NumpyVSLDataset`，用于在训练中注入按序列长度组织的课程。每个样本都是单篇文档 token 的唯一子集，因此不需要文档内掩码。`min_sequence_length` 和 `max_sequence_length` 必须都是 2 的幂；每个 batch 内的样本长度相同，并使总 token 数等于 `Trainer.global_batch_size`。模型必须支持最大长度，`VSLCurriculum` 控制不同长度在一个 epoch 中的采样概率。

### Using a custom data loader

> Using a custom data loader with Trainer just requires implementing your own DataLoaderBase subclass.

自定义加载器只需实现自己的 `DataLoaderBase` 子类。实现 `_iter_batches` 时必须保证每个 batch 只包含当前 rank 的本地部分，且 token 数恰好等于 `rank_batch_size`。还应实现 `state_dict()` 与 `load_state_dict()`，使恢复后能从 epoch 中断处继续。真实示例可参考 `NumpyDataLoaderBase`。

## 译校说明

本译稿把项目名、类名、配置键、命令、路径和代码保持为原文；“checkpoint”保留英文以免与单纯的权重文件混淆。文档只证明这个固定提交公开承诺和展示的接口，不证明任意硬件环境都能复现实验吞吐，也不把 README 中指向外部项目的链接视为本地已审计代码。
