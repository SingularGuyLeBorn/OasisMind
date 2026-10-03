---
title: "Llama · 对照译稿"
category: "模型库"
tags: ["Llama", "对照译稿"]
published: true
excerpt: "Llama 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 5 -->

| .github |
| --- |
| docs |
| models |
| .gitignore |
| .pre-commit-config.yaml |
| .ruff.toml |
| CODE_OF_CONDUCT.md |
| CONTRIBUTING.md |
| LICENSE |
| Llama_Repo.jpeg |
| MANIFEST.in |
| README.md |
| SECURITY.md |
| llama_models |
| pyproject.toml |
| requirements.txt |
| uv.lock |

第 1 页是仓库根目录的文件清单, 一共 17 个名字. MinerU 把第一个名字 .github 放进了表头, 剩下 16 个排在表身. 依次是 docs, models, .gitignore, .pre-commit-config.yaml, .ruff.toml, CODE_OF_CONDUCT.md, CONTRIBUTING.md, LICENSE, Llama_Repo.jpeg, MANIFEST.in, README.md, SECURITY.md, llama_models, pyproject.toml, requirements.txt, uv.lock.

![Image block](images/p01-models-on-hugging-face-https-huggingface-co-meta-llama.png)

(图: 一张照片风格的插图. 木板墙前站着三只羊驼, 左边白色, 中间紫色, 右边白色并戴一顶蓝色尖顶帽. 右下角桌上有一只装着橙黄色液体的玻璃杯, 紫色羊驼身上挂着金色彩带.)

> **想:** 这一页是不是论文?
> 不是. 这一页只有文件名和一张图, 没有标题, 没有作者, 没有摘要. 第 2 页开头是 Hugging Face, Blog, Website 这类链接, 接着是 README 正文. 整份材料是 GitHub 上 llama-models 仓库的首页, 不是技术报告.

> **核对:** 这张图是不是图标?
> 不是图标. 它是一张完整的插图, 三只羊驼占满画面, 有背景, 有道具. 文件名 models-on-hugging-face-https-huggingface-co-meta-llama 取自第 2 页第一条链接的文字和地址, 和画面内容无关. 文件清单里有 Llama_Repo.jpeg, 但页面没有写这张图就是那个文件.

> **拆开:** 清单里哪些是目录, 哪些是文件?
> md 里没有标类型. docs, models, llama_models 没有扩展名, LICENSE 也没有扩展名, 光看名字分不出来. 第 3 页写了示例脚本在 models/{ llama3, llama4 }/scripts/ 下面, 这能说明 models 是目录. 其他几个页面没有交代.

<!-- page 2 of 5 -->

🤗 [Models on Hugging Face](https://huggingface.co/meta-Llama)  | [Blog](https://ai.meta.com/blog/)  | [Website](https://llama.meta.com/)  | [Get Started](https://llama.meta.com/get-started/)  | [Llama Cookbook](https://github.com/meta-llama/llama-cookbook)

页头一排五个链接: Hugging Face 上的模型, Blog, Website, Get Started, Llama Cookbook. 第一条的地址印成 huggingface.co/meta-Llama, L 是大写.

## Llama Models

Llama is an accessible, open large language model (LLM) designed for developers, researchers, and businesses to build, experiment, and responsibly scale their generative AI ideas. Part of a foundational system, it serves as a bedrock for innovation in the global community. A few key aspects:

Llama 是一个容易拿到的开放大语言模型 (LLM), 面向开发者, 研究者和企业, 让他们搭建和试验生成式 AI 的想法, 并负责任地把规模做大. 它是一个基础系统的一部分, 页面说它是全球社区创新的基石. 下面列了几个要点:

1. **Open access**: Easy accessibility to cutting-edge large language models, fostering collaboration and advancements among developers, researchers, and organizations

2. **Broad ecosystem**: Llama models have been downloaded hundreds of millions of times, there are thousands of community projects built o Llama and platform support is broad from cloud providers to startups - the world is building with Llama!

3. **Trust & safety**: Llama models are part of a comprehensive approach to trust and safety, releasing models and tools that are designed to enable community collaboration and encourage the standardization of the development and usage of trust and safety tools for generative AI

1. **开放获取:** 容易拿到前沿的大语言模型, 推动开发者, 研究者和机构之间的合作与进展.

2. **生态广:** Llama 模型被下载了几亿次, 社区里有几千个基于 Llama 的项目, 平台支持从云厂商一直覆盖到初创公司. 原句结尾是 「the world is building with Llama!」.

3. **信任与安全:** Llama 模型属于一套完整的信任与安全做法. 发布的模型和工具意在促进社区协作, 并推动生成式 AI 信任与安全工具在开发和使用上的标准化.

Our mission is to empower individuals and industry through this opportunity while fostering an environment of discovery and ethical AI advancements. The model weights are licensed for researchers and commercial entities, upholding the principles of openness.

页面说使命是借这个机会给个人和产业赋能, 同时营造探索和合乎伦理的 AI 进步的环境. 模型权重向研究者和商业机构发放许可, 坚持开放原则.

> **停一下:** 「hundreds of millions」 和 「thousands」 是多少?
> 页面没有给具体数. 下载量只写到几亿次这个量级, 社区项目只写几千个, 没有统计口径, 没有截止日期. 同一句里 「built o Llama」 少了一个 n, 应当是 built on, 这是原文的错字.

**Llama Models**

同一个标题在这里又印了一次, 下面是模型表. 上一处同名标题下面是介绍文字.

| Model | Launch date | Model sizes | Context Length | Tokenizer | Acceptable use policy | License | Model Card |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Llama 2 | 7/18/2023 | 7B, 13B, 70B | 4K | Sentencepiece | Use Policy | License | Model Card |
| Llama 3 | 4/18/2024 | 8B, 70B | 8K | TikToken-based | Use Policy | License | Model Card |
| Llama 3.1 | 7/23/2024 | 8B, 70B, 405B | 128K | TikToken-based | Use Policy | License | Model Card |
| Llama 3.2 | 9/25/2024 | 1B, 3B | 128K | TikToken-based | Use Policy | License | Model Card |
| Llama 3.2- Vision | 9/25/2024 | 11B, 90B | 128K | TikToken-based | Use Policy | License | Model Card |
| Llama 3.3 | 12/04/2024 | 70B | 128K | TikToken-based | Use Policy | License | Model Card |
| Llama 4 | 4/5/2025 | Scout-17B-16E,Maverick-17B-128E | 10M, 1M | TikToken-based | Use Policy | License | Model Card |

| 模型 | 发布日期 (原样) | 规模 | 上下文长度 | 分词器 |
| --- | --- | --- | --- | --- |
| Llama 2 | 7/18/2023 | 7B, 13B, 70B | 4K | Sentencepiece |
| Llama 3 | 4/18/2024 | 8B, 70B | 8K | TikToken-based |
| Llama 3.1 | 7/23/2024 | 8B, 70B, 405B | 128K | TikToken-based |
| Llama 3.2 | 9/25/2024 | 1B, 3B | 128K | TikToken-based |
| Llama 3.2- Vision | 9/25/2024 | 11B, 90B | 128K | TikToken-based |
| Llama 3.3 | 12/04/2024 | 70B | 128K | TikToken-based |
| Llama 4 | 4/5/2025 | Scout-17B-16E, Maverick-17B-128E | 10M, 1M | TikToken-based |

后三列 (可接受使用政策, 许可证, 模型卡) 每一行都只印了链接文字 Use Policy, License, Model Card, 中文表里省去.

> **看表:** 这张表列出了哪些模型名?
> 七行: Llama 2, Llama 3, Llama 3.1, Llama 3.2, Llama 3.2- Vision, Llama 3.3, Llama 4. Llama 4 那一行的规模格里又出现两个名字: Scout-17B-16E 和 Maverick-17B-128E. 其余各行的规模格只有数字加 B: 7B, 13B, 70B, 8B, 405B, 1B, 3B, 11B, 90B. 表里没有 Llama 1.

> **问:** Scout-17B-16E 里的 17B 和 16E 各是什么意思?
> 页面没有解释. 两个名字都带 17B, 后缀一个是 16E, 一个是 128E. 表头写的是 Model sizes, 可 17B 是不是整个模型的参数量, E 代表什么, 这 5 页都没说. 我不把别的资料里的解释搬进来.

> **对一下:** 上下文长度 「10M, 1M」 分别对应哪一个?
> 页面没有逐个配对. 规模格的顺序是 Scout 在前, Maverick 在后, 上下文格是 10M 在前, 1M 在后. 按顺序读会得到 Scout 10M, Maverick 1M, 但这是按排列推的, 原文没有写出这句对应关系.

> **再看:** 日期是按月/日/年写的吗?
> 表头没有说格式. 7/18/2023, 4/18/2024, 7/23/2024, 9/25/2024 的第二段都大于 12, 只能是日, 所以这几行是月/日/年. 12/04/2024 按同样读法是 12 月 4 日. 只有这一行给日补了前导 0, 4/5/2025 没有补.

> **确认:** 「Llama 3.2- Vision」 是单独一行型号吗?
> 是单独一行. 它和 Llama 3.2 同一天 9/25/2024, 规模是 11B, 90B, 和 Llama 3.2 的 1B, 3B 不重叠. 名字里连字符后面多了一个空格, 看上去是转写留下的. 页面没有写 Vision 支持哪些输入.

> **核对:** 后三列的链接在 md 里还在吗?
> 不在. 七行的 Use Policy, License, Model Card 都只剩文字, 没有地址. 所以这 5 页读不到任何一版许可证的条款, 也读不到模型卡里的内容.

**Download**

To download the model weights and tokenizer:

下载模型权重和分词器的步骤:

1. Visit the [Meta Llama website](https://llama.meta.com/llama-downloads/).

2. Read and accept the license.

3. Once your request is approved you will receive a signed URL via email.

4. Install the Llama Models CLI: pip install llama-models . (**<-- Start Here if you have received an email already.**)

5. Run llama-model list to show the latest available models and determine the model ID you wish to download. **NOTE**: If you want older versions of models, run llama-model list --show-all to show all the available Llama models.

6. Run: llama-model download --source meta --model-id CHOSEN\_MODEL\_ID

1. 打开 [Meta Llama 网站](https://llama.meta.com/llama-downloads/).

2. 阅读并接受许可证.

3. 申请通过以后, 会收到一封带签名 URL 的邮件.

4. 安装 Llama Models 命令行工具: pip install llama-models . (**已经收到邮件的话, 从这一步开始.**)

5. 运行 llama-model list, 查看最新可用的模型, 确定要下载的 model ID. **注意:** 想要旧版本, 运行 llama-model list --show-all, 列出全部可用的 Llama 模型.

6. 运行: llama-model download --source meta --model-id CHOSEN\_MODEL\_ID

<!-- page 3 of 5 -->

7. Pass the URL provided when prompted to start the download.

7. 出现提示时, 粘贴邮件里给的 URL, 下载就开始.

Remember that the links expire after 24 hours and a certain amount of downloads. You can always re-request a link if you start seeing errors such as 403: Forbidden .

链接在 24 小时后失效, 下载到一定次数也会失效. 如果开始出现 403: Forbidden 这类错误, 可以重新申请链接.

> **想:** 「a certain amount of downloads」 是几次?
> 页面没写. 24 小时是明确的数字, 次数上限只写了 「a certain amount」. 出错时给的例子是 403: Forbidden, 也没有说达到上限后会返回哪个错误码.

**CLI Commands Reference**

Once installed, the llama-model CLI provides the following commands:

装好以后, llama-model 命令行提供下面这些命令:

```shell
llama-model list          # List available models
llama-model list --show-all   # List all models (including older versions)
llama-model describe -m MODEL_ID      # Show detailed information about a model
llama-model download           # Download models from Meta or Hugging Face
llama-model verify-download   # Verify integrity of downloaded models
llama-model remove -m MODEL_ID       # Remove a downloaded model
llama-model prompt-format -m MODEL_ID  # Show the prompt format for a model
```

七条命令: list 列出可用模型. list --show-all 列出全部模型, 含旧版本. describe -m MODEL_ID 显示某个模型的详细信息. download 从 Meta 或 Hugging Face 下载模型. verify-download 校验下载文件是否完整. remove -m MODEL_ID 删除已下载的模型. prompt-format -m MODEL_ID 显示某个模型的提示词格式.

For detailed help on any command, run llama-model COMMAND --help

任何一条命令的详细帮助, 运行 llama-model COMMAND --help.

**Running the models**

In order to run the models, you will need to install dependencies after checking out the repository.

要运行模型, 先把仓库拉下来, 再安装依赖.

```txt
# Run this within a suitable Python environment (uv, conda, or virtualenv)
pip install .[torch]
```

注释说在合适的 Python 环境 (uv, conda 或 virtualenv) 里运行, 命令是 pip install .[torch].

Example scripts are available in models/{ llama3, llama4 }/scripts/ sub-directory. Note that the Llama4 series of models require at least 4 GPUs to run inference at full (bf16) precision.

示例脚本在 models/{ llama3, llama4 }/scripts/ 子目录里. 注意: Llama4 系列用全精度 (bf16) 推理, 至少要 4 张 GPU.

```shell
#!/bin/bash

NGPUS=4
CHECKPOINT_DIR=~/.llama/checkpoints/Llama-4-Scout-17B-16E-Instruct
PYTHONPATH=\$(git rev-parse --show-toplevel) \
torchrun --nproc_per_node=\$NGPUS \
-m models.llama4.scripts.chat_completion \$CHECKPOINT_DIR \
--world_size \$NGPUS
```

脚本设 NGPUS=4, 检查点目录是 ~/.llama/checkpoints/Llama-4-Scout-17B-16E-Instruct, 用 torchrun 按 4 个进程启动 models.llama4.scripts.chat_completion, world_size 也是 4.

The above script should be used with an Instruct (Chat) model. For a Base model, update the CHECKPOINT\_DIR path and use the script models.llama4.scripts.completion .

上面这个脚本配 Instruct (Chat) 模型用. 换成 Base 模型时, 改 CHECKPOINT\_DIR 路径, 并改用 models.llama4.scripts.completion 脚本.

> **回看:** 「at least 4 GPUs」 是多大显存的卡?
> 这句没写显存. 80GB 只出现在下一节量化那段, 说的是 FP8 要 2 张 80GB, Int4 要 1 张 80GB. bf16 的 4 张卡是什么型号, 每张多少显存, 页面没交代. 示例脚本里 NGPUS=4 和这句一致.

**Running inference with FP8 and Int4 Quantization**

You can reduce the memory footprint of the models at the cost of minimal loss in accuracy by running inference with FP8 or Int4 quantization. Use the --quantization-mode flag to specify the quantization mode. There are two modes:

用 FP8 或 Int4 量化推理, 可以减少模型占用的显存, 代价是精度有很小的损失. 用 --quantization-mode 参数指定量化模式, 一共两种:

fp8\_mixed : Mixed precision inference with FP8 for some weights and bfloat16 for activations.

fp8\_mixed: 混合精度推理, 部分权重用 FP8, 激活用 bfloat16.

int4\_mixed : Mixed precision inference with Int4 for some weights and bfloat16 for activations.

int4\_mixed: 混合精度推理, 部分权重用 Int4, 激活用 bfloat16.

Using FP8, running Llama-4-Scout-17B-16E-Instruct requires 2 GPUs with 80GB of memory. Using Int4, you need a single GPU with 80GB of memory.

用 FP8 跑 Llama-4-Scout-17B-16E-Instruct 要 2 张 80GB 显存的 GPU. 用 Int4 只要 1 张 80GB 显存的 GPU.

> **拆开:** 两段脚本里的 `\$` 和 `$` 为什么不一样?
> 第一段 bf16 脚本把变量写成 `\$NGPUS`, `\$CHECKPOINT_DIR`, `\$(git rev-parse ...)`, 第二段量化脚本写成 `$NGPUS`, `$MODE`. 前一种在 bash 里会把 $ 当普通字符, 变量不会展开. 页面没有解释这个差别, 看上去是转写时多加的反斜杠.

```shell
MODE=fp8_mixed  # or int4_mixed
if [ $MODE == "fp8_mixed" ]; then
    NGPUS=2
else
    NGPUS=1
fi
CHECKPOINT_DIR=~/.llama/checkpoints/Llama-4-Scout-17B-16E-Instruct
PYTHONPATH=$(git rev-parse --show-toplevel) \
    torchrun --nproc_per_node=$NGPUS \
    -m models.llama4.scripts.chat_completion $CHECKPOINT_DIR \
```

脚本先设 MODE=fp8_mixed, 注释说也可以换成 int4_mixed. fp8_mixed 时 NGPUS=2, 否则 NGPUS=1. 检查点目录同上, 同样用 torchrun 启动 chat_completion. 这一段在第 3 页末尾断开, 后两行在第 4 页.

<!-- page 4 of 5 -->

```shell
--world_size $NGPUS \
--quantization-mode $MODE
```

续上的两行: world_size 取 NGPUS, 量化模式取 MODE.

> **问:** 「minimal loss in accuracy」 损失多少?
> 页面没有给数. 没有评测表, 没有和 bf16 对比的分数, 只有 「minimal」 这一个形容词. FP8 和 Int4 哪个损失更大, 也没写.

For more flexibility in running inference (including using other providers), please see the [Llama Stack](https://github.com/meta-llama/llama-stack) toolset.

想要更灵活地推理 (包括用其他服务商), 去看 [Llama Stack](https://github.com/meta-llama/llama-stack) 工具集.

**Access to Hugging Face**

We also provide downloads on [Hugging Face](https://huggingface.co/meta-llama), in both transformers and native llama4 formats. To download the weights from Hugging Face, please follow these steps:

[Hugging Face](https://huggingface.co/meta-llama) 上也能下载, 有 transformers 和原生 llama4 两种格式. 从 Hugging Face 下载权重的步骤如下:

Visit one of the repos, for example [meta-llama/Llama-4-Scout-17B-16E](https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E)

打开其中一个仓库, 比如 [meta-llama/Llama-4-Scout-17B-16E](https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E).

Read and accept the license. Once your request is approved, you'll be granted access to all Llama 3.1 models as well as previous versions. Note that requests used to take up to one hour to get processed.

阅读并接受许可证. 申请通过以后, 可以访问全部 Llama 3.1 模型以及更早的版本. 注意, 以前处理申请最长要一小时.

> **对一下:** 示例仓库是 Llama 4, 批准后却说能访问 Llama 3.1?
> 原文就是这样印的. 上一句的例子是 meta-llama/Llama-4-Scout-17B-16E, 这一句写 「all Llama 3.1 models as well as previous versions」. 页面没有说 Llama 3.2, 3.3, 4 的授权是否也包括在内. 「used to take up to one hour」 用的是过去时, 现在要多久也没写.

To download the original native weights to use with this repo, click on the "Files and versions" tab and download the contents of the original folder. You can also download them from the command line if you pip install huggingface-hub :

要下载配合本仓库使用的原生权重, 点 「Files and versions」 标签页, 下载 original 文件夹里的内容. 装了 huggingface-hub (pip install huggingface-hub) 以后, 也可以用命令行下载:

huggingface-cli download meta-llama/Llama-4-Scout-17B-16E-Instruct-Original --local-dir meta-llama/Llama-4-Scout-17B-16E-Instruc

命令是 huggingface-cli download, 仓库名是 meta-llama/Llama-4-Scout-17B-16E-Instruct-Original, 本地目录参数 --local-dir 后面的路径原样照抄.

> **核对:** --local-dir 后面的路径完整吗?
> 不完整. 仓库名结尾是 Instruct-Original, 本地目录结尾印成 Instruc, 少了 t, 也没有 -Original. 页面没有说明本地目录是否有意取别的名字, 看上去是抓取时截断了.

To use with transformers, the following snippet will download and cache the weights:

配合 transformers 使用时, 下面这段代码会下载并缓存权重:

```python
# inference.py
from transformers import AutoTokenizer, Llama4ForConditionalGeneration
import torch

model_id = "meta-llama/Llama-4-Scout-17B-16E-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)

messages = [
    {"role": "user", "content": "Who are you?"},
]
inputs = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, return_tensors="pt", return_dict=True)
)

model = Llama4ForConditionalGeneration.from_pretrained(
    model_id, device_map="auto", torch_dtype=torch.bfloat16
)

outputs = model.generate(**inputs.to(model.device), max_new_tokens=100)
outputs = tokenizer.batch_decode(outputs[:, inputs["input_ids"].shape[-1] :])
print(outputs[0])
```

这段代码文件名是 inference.py. 它导入 AutoTokenizer 和 Llama4ForConditionalGeneration, 模型 ID 是 meta-llama/Llama-4-Scout-17B-16E-Instruct. 用户消息是 「Who are you?」, 经 apply_chat_template 套上对话模板. 模型用 device_map=「auto」 和 torch.bfloat16 加载, 最多新生成 100 个 token, 解码时去掉输入部分, 打印第一条输出.

> **再看:** apply_chat_template 那一行的括号对得上吗?
> 对不上. `return_dict=True)` 已经把调用括号关上了, 下一行又单独多出一个 `)`. 按原样运行会报语法错误. 页面没有更正, 这里照原样保留.

```txt
torchrun --nnodes=1 --nproc_per_node=8 inference.py
```

启动命令: torchrun 单节点, 每节点 8 个进程, 跑 inference.py.

> **想:** 这里为什么是 8 个进程?
> 页面没解释. 代码里用的是 device_map=「auto」, 前面原生脚本 bf16 写的是至少 4 张卡, 这里命令写 nproc_per_node=8. 8 和 4 之间的关系, 以及 device_map=「auto」 配合多进程怎么分配, 这 5 页都没说.

**Installations**

You can install this repository as a [package](https://pypi.org/project/llama-models/) by just doing pip install llama-models

这个仓库也可以当作 [包](https://pypi.org/project/llama-models/) 安装, 只要 pip install llama-models.

**Responsible Use**

Llama models are a new technology that carries potential risks with use. Testing conducted to date has not — and could not — cover all scenarios. To help developers address these risks, we have created the [Responsible Use Guide](https://ai.meta.com/static-resource/responsible-use-guide/).

Llama 模型是一项新技术, 使用中有潜在风险. 到目前为止做过的测试没有, 也不可能覆盖所有场景. 为了帮开发者应对这些风险, 页面给了 [负责任使用指南](https://ai.meta.com/static-resource/responsible-use-guide/).

**Issues**

Please report any software "bug" or other problems with the models through one of the following means:

模型的软件 「bug」 或其他问题, 请通过下面任一渠道反馈:

Reporting issues with the model: [https://github.com/meta-llama/llama-models/issues](https://github.com/meta-llama/llama-models/issues)

反馈模型问题: [https://github.com/meta-llama/llama-models/issues](https://github.com/meta-llama/llama-models/issues)

Reporting risky content generated by the model: [developers.facebook.com/llama\_output\_feedback](http://developers.facebook.com/llama_output_feedback)

反馈模型生成的风险内容: [developers.facebook.com/llama\_output\_feedback](http://developers.facebook.com/llama_output_feedback)

<!-- page 5 of 5 -->

Reporting bugs and security concerns: [facebook.com/whitehat/info](http://facebook.com/whitehat/info)

反馈 bug 和安全问题: [facebook.com/whitehat/info](http://facebook.com/whitehat/info)

**Questions**

For common questions, the FAQ can be found [here](https://llama.meta.com/faq), which will be updated over time as new questions arise.

常见问题见 [FAQ](https://llama.meta.com/faq), 有新问题时会陆续更新.

**Releases**

**Packages**

**Used by**

**Contributors**

**Languages**

页尾是 GitHub 侧栏的五个标签: Releases, Packages, Used by, Contributors, Languages.

> **确认:** 页尾这五个标签下面有内容吗?
> 没有. md 里只剩五行加粗标题, 没有版本号, 没有包名, 没有贡献者名单, 也没有语言占比. 所以这 5 页读不到仓库的发布版本和代码语言构成.

> **回看:** 5 页读完, 有没有架构或训练数据?
> 没有. 能读到的模型信息只有第 2 页那张表: 名字, 日期, 规模, 上下文长度, 分词器. 没有层数, 没有注意力结构, 没有训练数据量, 没有评测分数. 其余篇幅是下载, 命令行, 推理脚本, 量化和反馈渠道.
