---
title: "Baichuan-13B · 对照译稿"
category: "模型库"
tags: ["Baichuan", "对照译稿"]
published: true
excerpt: "Baichuan-13B 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 8 -->

![Image block](images/p01-image.png)

![Image block](images/p01-baichuan-inc-https-github-com-baichuan-inc-baichuan-13b.png)

[baichuan-inc](https://github.com/baichuan-inc) / [**Baichuan-13B**](https://github.com/baichuan-inc/Baichuan-13B) **Public**

[Discussions](https://github.com/baichuan-inc/Baichuan-13B/discussions)

[Actions](https://github.com/baichuan-inc/Baichuan-13B/actions)

**main**

Go to file

<table><tbody><tr><td colspan="2">GradientGuru Update README.md</td><td>21017d5 · 3 years ago</td></tr><tr><td>media</td><td>Update Wechat QRCode</td><td>3 years ago</td></tr><tr><td>LICENSE</td><td>Create LICENSE</td><td>3 years ago</td></tr><tr><td>README.md</td><td>Update README.md</td><td>3 years ago</td></tr><tr><td>README_EN.md</td><td>Update README_EN.md</td><td>3 years ago</td></tr><tr><td>cli_demo.py</td><td>add: add vim input for multiline</td><td>3 years ago</td></tr><tr><td>requirements.txt</td><td>first commit</td><td>3 years ago</td></tr><tr><td>web_demo.py</td><td>alleviate mps device memory leakage issue</td><td>3 years ago</td></tr></tbody></table>

**README** Apache-2.0 license

# Baichuan-13B

🤗 [Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base) • 🤗 [Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat) • 🤖 [ModelScope](https://modelscope.cn/organization/baichuan-inc) • 💬 [WeChat](https://github.com/baichuan-inc/Baichuan-13B/blob/main/media/wechat.jpeg?raw=true)

[license Apache-2.0](https://github.com/Baichuan-inc/baichuan-13B/blob/main/LICENSE)

Chinese **|** [**English**](https://github.com/baichuan-inc/Baichuan-13B/blob/main/README_EN.md)

中文 **|** [**English**](https://github.com/baichuan-inc/Baichuan-13B/blob/main/README_EN.md)

## Updates · 更新信息

[2023.09.06] We have released our new generation of open-source models, [Baichuan 2](https://github.com/baichuan-inc/Baichuan2), available in 7B and 13B sizes 🔥

[2023.09.06] 我们发布了新一代开源模型 [Baichuan 2](https://github.com/baichuan-inc/Baichuan2), 包含 7B, 13B 尺寸 🔥

[2023.08.01] We updated the weights of the aligned model [Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat), improving its results in some scenarios.

[2023.08.01] 更新了对齐模型 [Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat) 权重, 优化了部分场景的效果.

> **想:** 2023.08.01 这条说 Chat 权重换过一版. 后面 C-Eval, MMLU, CMMLU 三张表里的 Baichuan-13B-Chat 行, 测的是换版前还是换版后的权重?
> 页内没有交代. 更新信息只有一句 「优化了部分场景的效果」, Benchmark 节既没写评测日期, 也没给 checkpoint 或 revision. 引用 Chat 分数时只能说 「README 表内的 Chat 行」, 不能默认它就是 08.01 之后那版. 本页 Base 没有换版记录, Base 行的归属没有这个问题.

## Contents · 目录

<u>Introduction</u>

<u>Benchmark Results</u>

<u>Benchmark结果</u>

• <u>Model Details</u>

• <u>模型细节</u>

<u>Inference and Deployment</u>

<u>推理和部署</u>

<u>Fine-tuning the Model</u>

<u>对模型进行微调</u>

<u>Disclaimer</u>

<u>声明</u>

<u>License</u>

<u>协议</u>

## Introduction

Baichuan-13B is an open-source, commercially usable large language model with 13 billion parameters, developed by Baichuan Intelligence as the successor to [Baichuan-7B](https://github.com/baichuan-inc/baichuan-7B). It achieves the best results among models of its size on authoritative Chinese and English benchmarks. This release contains two versions: a pre-trained one ([Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base)) and an aligned one ([Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat)). Baichuan-13B has the following features:

Baichuan-13B 是百川智能继 [Baichuan-7B](https://github.com/baichuan-inc/baichuan-7B) 之后开发的开源可商用大规模语言模型, 参数量 130 亿, 在权威的中文和英文 benchmark 上都取得了同尺寸最好的效果. 本次发布包含预训练 ([Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base)) 和对齐 ([Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat)) 两个版本. Baichuan-13B 有以下几个特点:

1. Larger size, more data: building on [Baichuan-7B](https://github.com/baichuan-inc/baichuan-7B), Baichuan-13B further scales the parameter count up to 13 billion and is trained on 1.4 trillion tokens of high-quality corpus, 40% more than LLaMA-13B, which makes it the open-source 13B-size model trained on the most data so far. It supports both Chinese and English, uses ALiBi positional encoding, and has a context window length of

1. 更大尺寸, 更多数据: Baichuan-13B 在 [Baichuan-7B](https://github.com/baichuan-inc/baichuan-7B) 的基础上把参数量进一步扩大到 130 亿, 并在高质量语料上训练了 1.4 万亿 tokens, 比 LLaMA-13B 多 40%, 是当前开源 13B 尺寸里训练数据量最多的模型. 支持中英双语, 使用 ALiBi 位置编码, 上下文窗口长度为

<!-- page 2 of 8 -->

4096.

4096.

> **问:** 「超过 LLaMA-13B 40%」 的基数在哪里? 从 7B 到 13B, 数据量又是怎么跟着参数一起变的?
> 页内没有写 LLaMA-13B 的训练量, 按 40% 倒推基数是 1.0 万亿, 这是读者算出来的, 不是页面给的. 页 3 模型细节表只有 Baichuan 两行: 参数 7,000,559,616 → 13,264,901,120, 约 1.89 倍; 数据 1.2 万亿 → 1.4 万亿, 只多了 0.2 万亿. 每个参数分到的 token 从约 171 降到约 106. 页内没有给 Scaling Laws 层面的配比理由, 这组数只能记成发布事实, 不能读成最优配比.

2. Open-sourcing both the pre-trained and the aligned model: the pre-trained model is the "base" suited to developers, while most ordinary users have a stronger demand for an aligned model with conversational ability. So in this release we also publish the aligned model (Baichuan-13B-Chat). It has strong dialogue ability, works out of the box, and can be deployed with just a few lines of code.

2. 同时开源预训练和对齐模型: 预训练模型是面向开发者的 「基座」, 而广大普通用户更需要有对话功能的对齐模型. 因此本次开源同时发布了对齐模型 (Baichuan-13B-Chat), 对话能力强, 开箱即用, 几行代码就能部署.

3. More efficient inference: to serve a wider range of users, we also open-source int8 and int4 quantized versions. Compared with the non-quantized version, they greatly lower the hardware threshold for deployment with almost no loss in quality, and can be deployed on consumer GPUs such as the Nvidia 3090.

3. 更高效的推理: 为了让更多用户用得上, 我们同时开源了 int8 和 int4 的量化版本. 与非量化版本相比, 效果几乎没有损失, 部署所需的机器资源门槛却大大降低, 可以部署在 Nvidia 3090 这样的消费级显卡上.

> **核对:** 「可以部署在 3090」 对应哪个精度? 页 5 显存表给出 bf16 / fp16 26.0, int8 15.8, int4 9.7 (GB).
> 页内没写 3090 的显存. 按 3090 常见的 24GB 算, fp16 的 26.0 放不下, int8 与 int4 都放得下. 所以这句应读成量化版本的主张, 这也和它所在的这一条 「同时开源了 int8 和 int4 的量化版本」 对得上. 显存表没写生成长度和 batch, 长上下文下的余量还要再打折扣.

4. Open source, free, and commercially usable: Baichuan-13B is fully open for academic research, and developers only need to apply by email and obtain an official commercial license to use it commercially for free.

4. 开源免费可商用: Baichuan-13B 对学术研究完全开放, 开发者只需邮件申请并获得官方商用许可, 即可免费商用.

> **拆开:** 页 1 仓库栏写 「README Apache-2.0 license」, 徽章也是 license Apache-2.0; 这一条却要求 「邮件申请并获得官方商用许可」. 二者矛盾吗?
> 要分两层读. Apache-2.0 挂在仓库的 LICENSE 文件和 README 徽章上, 而页 1 文件列表里只有 cli_demo.py, web_demo.py, requirements.txt, media 和 README, 权重放在 Hugging Face. 第 4 条讲的是模型商用许可. 页内没有贴出权重许可正文, 目录里的 「协议」 一节也没出现在这 8 页里. 所以只能记成: 仓库代码 Apache-2.0, 权重商用走邮件申请. 不能把 Apache-2.0 读成权重可以无条件商用.

## Benchmark Results · Benchmark结果

We ran 5-shot evaluations on authoritative Chinese and English benchmarks for large language models. The results are as follows:

我们在各个权威大语言模型的中英文 benchmark 上做了 5-shot 评测. 结果如下:

### [C-Eval](https://cevalbenchmark.com/index.html#home)

| Model 5-shot | STEM | Social Sciences | Humanities | Others | Average |
| --- | --- | --- | --- | --- | --- |
| Baichuan-7B | 38.2 | 52.0 | 46.2 | 39.3 | 42.8 |
| Chinese-Alpaca-Plus-13B | 35.2 | 45.6 | 40.0 | 38.2 | 38.8 |
| Vicuna-13B | 30.5 | 38.2 | 32.5 | 32.5 | 32.8 |
| Chinese-LLaMA-Plus-13B | 30.3 | 38.0 | 32.9 | 29.1 | 32.1 |
| Ziya-LLaMA-13B-Pretrain | 27.6 | 34.4 | 32.0 | 28.6 | 30.0 |
| LLaMA-13B | 27.0 | 33.6 | 27.7 | 27.6 | 28.5 |
| moss-moon-003-base (16B) | 27.0 | 29.1 | 27.2 | 26.9 | 27.4 |
| Baichuan-13B-Base | 45.9 | 63.5 | 57.2 | 49.3 | 52.4 |
| Baichuan-13B-Chat | 43.7 | 64.6 | 56.2 | 49.2 | 51.5 |

> **看表:** 把 Baichuan-13B-Base 四大类直接平均, 得到 53.975, 表里 Average 却是 52.4; Baichuan-7B 四类平均 43.925, 表里是 42.8. Average 是怎么来的?
> Average 不是四大类的算术平均. 两行都比四类均值低, 差值约 1.6 和 1.1, 方向一致; 四类里 STEM 又都是最低的一格. 这和 「按学科数或题数加权, STEM 权重更大」 的算法相容, 但页内只写了 5-shot, 没写加权方式, 这个解释只是相容, 不是页内结论. 引用时直接用 Average 列, 不要拿四列自己重算.

### [MMLU](https://arxiv.org/abs/2009.03300)

| Model 5-shot | STEM | Social Sciences | Humanities | Others | Average |
| --- | --- | --- | --- | --- | --- |
| Vicuna-13B | 40.4 | 60.5 | 49.5 | 58.4 | 52.0 |
| LLaMA-13B | 36.1 | 53.0 | 44.0 | 52.8 | 46.3 |
| Chinese-Alpaca-Plus-13B | 36.9 | 48.9 | 40.5 | 50.5 | 43.9 |
| Ziya-LLaMA-13B-Pretrain | 35.6 | 47.6 | 40.1 | 49.4 | 42.9 |
| Baichuan-7B | 35.6 | 48.9 | 38.4 | 48.1 | 42.3 |
| Chinese-LLaMA-Plus-13B | 33.1 | 42.8 | 37.0 | 44.6 | 39.2 |
| moss-moon-003-base (16B) | 22.4 | 22.8 | 24.2 | 24.4 | 23.6 |
| Baichuan-13B-Base | 41.6 | 60.9 | 47.4 | 58.5 | 51.6 |
| Baichuan-13B-Chat | 40.9 | 60.9 | 48.8 | 59.0 | 52.1 |

Note: we adopted the official MMLU [evaluation scheme](https://github.com/hendrycks/test).

说明: 我们采用了 MMLU 官方的[评测方案](https://github.com/hendrycks/test).

> **对一下:** 开篇说 「在权威的中文和英文 benchmark 上均取得同尺寸最好的效果」. MMLU 表里 Vicuna-13B 排在第一行, 这句话在英文榜上还成立吗?
> 只对 Chat 成立. 按本表 Average, Chat 比 Vicuna-13B 高 0.1, Base 比 Vicuna-13B 低 0.4, 所以 「同尺寸最好」 在 MMLU 上是靠 Chat 这一行撑住的, 优势也只在小数点后一位. 还有一处方向变化: Chat 在 MMLU 和 CMMLU 上略高于 Base, 在 C-Eval 上却略低于 Base. 页内没有解释对齐前后为什么有升有降.

### [CMMLU](https://github.com/haonan-li/CMMLU)

| Model 5-shot | STEM | Humanities | Social Sciences | Others | China Specific | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Baichuan-7B | 34.4 | 47.5 | 47.6 | 46.6 | 44.3 | 44.0 |
| Vicuna-13B | 31.8 | 36.2 | 37.6 | 39.5 | 34.3 | 36.3 |
| Chinese-Alpaca-Plus-13B | 29.8 | 33.4 | 33.2 | 37.9 | 32.1 | 33.4 |

<!-- page 3 of 8 -->

| Model 5-shot | STEM | Humanities | Social Sciences | Others | China Specific | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Chinese-LLaMA-Plus-13B | 28.1 | 33.1 | 35.4 | 35.1 | 33.5 | 33.0 |
| Ziya-LLaMA-13B-Pretrain | 29.0 | 30.7 | 33.8 | 34.4 | 31.9 | 32.1 |
| LLaMA-13B | 29.2 | 30.8 | 31.6 | 33.0 | 30.5 | 31.2 |
| moss-moon-003-base (16B) | 27.2 | 30.4 | 28.8 | 32.6 | 28.7 | 29.6 |
| Baichuan-13B-Base | 41.7 | 61.1 | 59.8 | 59.0 | 56.4 | 55.3 |
| Baichuan-13B-Chat | 42.8 | 62.6 | 59.7 | 59.0 | 56.1 | 55.8 |

Note: CMMLU is a comprehensive Chinese evaluation benchmark designed specifically to assess the knowledge and reasoning abilities of language models in a Chinese context. We adopted its official [evaluation scheme](https://github.com/haonan-li/CMMLU).

说明: CMMLU 是一个综合性的中文评估基准, 专门用来评估语言模型在中文语境下的知识和推理能力. 我们采用了它官方的[评测方案](https://github.com/haonan-li/CMMLU).

> **确认:** CMMLU 的列序是 STEM, Humanities, Social Sciences, Others, China Specific; C-Eval 和 MMLU 是 STEM, Social Sciences, Humanities, Others. 这张表还被页 2 / 页 3 的分页切成两段. 三张表横着比, 会不会错列?
> 会. 按列位置读, C-Eval 第 3 列是 Humanities, CMMLU 第 3 列却是 Social Sciences, 同一个 「第三格」 在两张表里是两个学科. 跨表比较必须按列名对齐, 不能按位置对齐. 分页处 CMMLU 的第二段重复了表头, 数据行是连续的: 前段 3 行, 后段 6 行, 合起来 9 行, 与 C-Eval, MMLU 的行数一致.

## Model Details · 模型细节

Columns: model name, hidden size, number of layers, number of attention heads, vocabulary size, total parameters, training data (tokens), positional encoding, maximum length.

| 模型名称 | 隐藏层维度 | 层数 | 注意力头数 | 词表大小 | 总参数量 | 训练数据(tokens) | 位置编码 | 最大长度 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baichuan-7B | 4,096 | 32 | 32 | 64,000 | 7,000,559,616 | 1.2 万亿 | RoPE | 4,096 |
| Baichuan-13B | 5,120 | 40 | 40 | 64,000 | 13,264,901,120 | 1.4 万亿 | ALiBi | 4,096 |

> **回看:** 表给了隐藏层维度 5,120, 层数 40, 词表 64,000 和精确到个位的总参 13,264,901,120, 唯独没给 FFN 宽度. 能从总参反推吗?
> 页内不给, 只能在假设下反推. 假设每层是注意力 4h² 加 SwiGLU 三个矩阵 3·h·f, 每层两个 RMSNorm, 末层一个 norm, 无 bias, 输入 embedding 与输出头不共享 (合计 2·V·h). 13B: 2×64,000×5,120 = 655,360,000, 余 12,609,541,120; 去掉末层 norm 5,120 后除以 40, 每层 315,238,400; 减去注意力 104,857,600 和两个 norm 10,240, 余 210,370,560, 除以 3×5,120 得 f = 13,696, 恰好整除. 同法代入 7B 得 f = 11,008, 也恰好整除. 两行都整除, 说明表内总参和这套假设自洽; 但 SwiGLU, 无 bias, 不共享 embedding 都是假设, 页内唯一的结构旁证是页 7 LoRA 脚本里的 `--lora_target W_pack`. 另外两行的头维度相同: 5,120/40 = 4,096/32 = 128.

## Inference and Deployment · 推理和部署

The model weights, source code, and configuration required for inference have been published on Hugging Face: [Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base) and [Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat). Below, we take Baichuan-13B-Chat as an example to demonstrate several ways of running inference. The program automatically downloads the required resources from Hugging Face.

推理所需的模型权重, 源码和配置已发布在 Hugging Face: [Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base) 和 [Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat). 下面以 Baichuan-13B-Chat 为例示范几种推理方式. 程序会自动从 Hugging Face 下载所需资源.

Please install the dependencies before running inference:

推理前请安装依赖:

```batch
pip install -r requirements.txt
```

### Python Code · Python代码方式

```python
>>> import torch
>>> from transformers import AutoModelForCausalLM, AutoTokenizer
>>> from transformers.generation.utils import GenerationConfig
>>> tokenizer = AutoTokenizer.from_pretrained("baichuan-inc/Baichuan-13B-Chat", use_fast=False, trust_remote_code=True)
>>> model = AutoModelForCausalLM.from_pretrained("baichuan-inc/Baichuan-13B-Chat", device_map="auto", torch_dtype=torch.float16
>>> model.generation_config = GenerationConfig.from_pretrained("baichuan-inc/Baichuan-13B-Chat")
>>> messages = []
>>> messages.append({"role": "user", "content": "世界上第二高的山峰是哪座"})
>>> response = model.chat(tokenizer, messages)
>>> print(response)
乔戈里峰。世界第二高峰——乔戈里峰西方登山者称其为k2峰，海拔高度是8611米，位于喀喇昆仑山脉的中巴边境上
```

In the code above, the model is loaded with device\_map='auto', which uses all available GPUs. To choose specific devices, you can control it with something like export CUDA\_VISIBLE\_DEVICES=0,1 (which uses GPUs 0 and 1).

上面的代码加载模型时指定了 device\_map='auto', 会用上所有可用显卡. 如需指定设备, 可以用类似 export CUDA\_VISIBLE\_DEVICES=0,1 (使用 0, 1 号显卡) 的方式控制.

> **停一下:** 代码里加载模型那一行停在 `torch_dtype=torch.float16`, 缺右括号, 也看不到 `trust_remote_code`; 上一行 tokenizer 却写了 `use_fast=False, trust_remote_code=True`. 模型这行到底带不带 `trust_remote_code`?
> 本页抓取在 float16 处截断, 后面的参数看不到, 不能拿它当 「模型加载不需要 trust_remote_code」 的证据. 同页后文的量化示例和页 6 的 CPU 示例都带 `trust_remote_code=True`, 其中 CPU 那一行是完整的. 复现时以 CPU 行的写法为准, 把 dtype 换回 float16, 再加上本行的 device_map="auto".

### Command-Line Tool · 命令行工具方式

python cli\_demo.py

The final output looks like this:

最后输出示例如下:

<!-- page 4 of 8 -->

![Image block](images/p04-baichuan.png)

Baichuan: The world is full of splendor, the mortal realm rolls on, yet you alone set my heart racing. Since we first met, your graceful figure, like moonlight shining over rivers and mountains, has held me spellbound and impossible to forget. I adore your talent and admire your character even more; I wish to spend this life with you, hand in hand, smiling at the shifting winds and clouds.

Baichuan: 世间繁华, 红尘滚滚, 唯卿一人, 令我心驰神往. 自相识以来, 汝之倩影, 如月华映照江山, 令人陶醉其中, 无法忘怀. 吾倾慕于汝之才情, 更钦佩汝之品性, 愿与汝共度此生, 携手笑看风云变幻

Looking back, the years pass like a dream; our meeting with a smile has already become eternal. I often wonder what virtue or merit I have to meet such a beauty. Yet I know fate is decided by heaven and not by human effort. Now I wish to offer a sincere heart in exchange for yours, to clear thorns and brambles for you, and to set out together on life's journey.

忆往昔, 岁月如梦, 相逢一笑, 已成永恒. 吾常思量 何德何能, 得遇佳人? 然知晓缘分天定, 非人力所能左右. 今吾欲以真诚之心, 换取汝之芳心, 愿为汝披荆斩棘, 共赴人生之旅.

Ten miles of spring breeze are no match for your smile; flowers as rich as brocade cannot compare with your beauty. I would become a butterfly, dancing with you on the branches, watching the flowers bloom and fall; I would become a zither, playing the most beautiful music, for you alone.

春风十里, 不如汝之一笑; 繁花似锦, 不及汝之美貌. 吾愿化作蝶儿, 伴随汝舞动枝头, 共赏花开花落; 吾愿化作琴瑟, 奏出最美妙的乐章, 只为汝而奏响.

The world is noisy and hearts are hard to read; only your company can put me at ease. I would spend a lifetime cherishing you and loving you, so that you feel a love as warm as spring. Whether through wind, rain and thunder, or through the vicissitudes of the world, I will face it all with you and share our time together

世间纷扰, 人心难测, 惟有汝之陪伴, 方能让我安心. 吾愿用一生的时间, 去呵护汝, 疼爱汝, 让汝感受到温暖如春的爱情. 无论风雨雷霆, 还是世事沧桑, 吾都愿与汝共同面对, 共度时光

Beauty fades easily and youth is short; I would engrave your beauty in my heart forever as an eternal memory. When our hair has turned white and we look back, I will still be deeply moved, and my love for you will be as it was at the start.

红颜易老, 青春短暂, 吾愿将汝之美丽永远镌刻在心间, 成为永恒的回忆. 待白发苍苍之时, 回首往事, 仍能感慨万千, 心中那份对汝的爱意, 依然如初.

I wish to hold your hand and grow old with you. I will spend all my courage and strength to guard this beautiful love; as long as your heart is happy, that is enough for me.

愿执子之手, 与子偕老. 吾愿用尽毕生的勇气和力量, 去守护这份美好的爱情只愿汝心欢喜, 吾便足矣.

> **再看:** 页 4 这张图的标题是 Baichuan-13B-Chat, 首句 「您好, 我是百川大模型」, 底部输入框里是小红书婴幼儿洗发水软文的 prompt, 和页 4–5 「网页 demo 方式 / 效果如下」 下面的文字一模一样, 却排在命令行节里. 那命令行这段情书对应的 prompt 在哪?
> 页内没有. 这张图是网页 demo 的截图, 抽取时落进了命令行节; 情书段只有以 「Baichuan:」 开头的回复, 看不到用户输入, 也看不到采样参数. 阅读时应把截图归到网页 demo 一节, 情书段只当文风样例, 不能据此判断指令遵循能力.

### Web Demo · 网页 demo 方式

Run the following command with streamlit; it starts a local web service, and you can open it by putting the address printed in the console into your browser.

依靠 streamlit 运行以下命令, 会在本地启动一个 web 服务, 把控制台给出的地址放进浏览器即可访问.

streamlit run web\_demo.py

**It looks like this: 效果如下:**

Baichuan-13B-Chat

Hello, I am the Baichuan large model, happy to be of service

您好, 我是百川大模型, 很高兴为您服务

You are a top product promoter on Xiaohongshu. Write a promotional post for the newly launched baby shampoo from the Tiger Baby brand, highlighting that it is eco-friendly and healthy, and gentle and harmless to children

你是小红书的带货达人, 要为老虎宝宝品牌下新出的婴幼儿洗发水写一个软文, 突出环保健康, 对小朋友无刺激无伤害

<!-- page 5 of 8 -->

### Baichuan-13B-Chat Sample Outputs · Baichuan-13B-Chat 示例输出

Content creation

内容创作

Advertising copy

广告文案

Precise Q&A

精准问答

Language understanding

语言理解

### Inference Performance · 推理性能

Baichuan-13B uses ALiBi linear biases, which require less computation than Rotary Embedding and significantly improve inference performance. Compared with the standard LLaMA-13B, the measured average inference speed (tokens/s) is 31.6% higher:

Baichuan-13B 使用了 ALiBi 线性偏置技术, 相比 Rotary Embedding 计算量更小, 对推理性能提升明显; 与标准 LLaMA-13B 相比, 平均推理速度 (tokens/s) 实测提升 31.6%:

| Model | tokens/s |
| --- | --- |
| LLaMA-13B | 19.4 |
| Baichuan-13B | 25.4 |

Test environment and parameters: GPU A100-SXM4-80G, PyTorch 2.0.0+cu117, transformers 4.29.1, batch size = 1, generation length = 2048, precision fp16, based on Baichuan-13B-Base

测试环境和参数: GPU A100-SXM4-80G, PyTorch 2.0.0+cu117, transformers 4.29.1, batch size = 1, 生成长度 = 2048, 精度 fp16, 基于 Baichuan-13B-Base

> **核对:** 表里 25.4 / 19.4 = 1.309, 即提升 30.9%, 和正文的 31.6% 差了 0.7 个百分点. 哪个对?
> 用表内两个数算不出 31.6%. 反过来按 31.6% 算, LLaMA-13B 的 19.4 应对应约 25.5. 正文说的是 「平均推理速度」, 可能是多次测量逐次求比再平均, 表里两数又各自四舍五入到一位小数; 页内没有给出单次数据, 无法判定. 引用时要注明口径: 表值之比 30.9%, 文案 31.6%.

> **想:** 正文把提速归功于 ALiBi 「相对于 Rotary Embedding 计算量更小」. 25.4 对 19.4 能直接算到位置编码头上吗?
> 不能. 这是两个完整模型的端到端对比: Baichuan-13B 词表 64,000, LLaMA-13B 的词表页内没给; Baichuan 走自带的 remote code, 页 7 还露出 W_pack 这种打包投影, 实现路径可能都不一样. 页内没有 「同一个模型只换 RoPE / ALiBi」 的消融. 测量条件也很窄: batch size = 1, 生成 2048, fp16, 单张 A100, 基于 Base. 另外模型细节表里 7B 用 RoPE, 13B 换成 ALiBi, 两者最大长度都是 4,096, 页内没说换 ALiBi 是为了外推到 4,096 以上.

### Quantized Deployment · 量化部署

Baichuan-13B supports int8 and int4 quantization; users only need to change two lines of the inference code.

Baichuan-13B 支持 int8 和 int4 量化, 用户只需在推理代码里简单改两行即可.

Users of quantization, please take special note!

使用量化的用户请务必注意!

Please read the sample code below carefully, especially the model-loading part on the first line, which differs from the inference example above.

请仔细阅读接下来的示例代码, 尤其是第一行的模型加载部分, 它和上面的推理示例不同.

Developers may change how the model is loaded to suit their needs, but note: if you quantize in order to save GPU memory, you should load the original-precision model onto the **CPU** first and then quantize; **from\_pretrained  device\_map='auto'  GPU**

开发者可以按自己的需求修改模型的加载方式, 但请注意: 如果量化是为了节省显存, 应先把原始精度模型加载到 **CPU** 上再开始量化; **from\_pretrained  device\_map='auto'  GPU**

To use int8 quantization:

如需使用 int8 量化:

model = AutoModelForCausalLM.from\_pretrained("baichuan-inc/Baichuan-13B-Chat", torch\_dtype=torch.float16, trust\_remote\_code=True model = model.quantize(8).cuda()

Likewise, to use int4 quantization:

同样, 如需使用 int4 量化:

model = AutoModelForCausalLM.from\_pretrained("baichuan-inc/Baichuan-13B-Chat", torch\_dtype=torch.float16, trust\_remote\_code=True model = model.quantize(4).cuda()

In addition, if you would rather not call quantize for online quantization, we provide a pre-quantized int8 Chat model: [Baichuan-13B-Chat-int8](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat-int8):

另外, 如果你不想调用 quantize 在线量化, 我们提供了量化好的 int8 Chat 模型: [Baichuan-13B-Chat-int8](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat-int8):

model = AutoModelForCausalLM.from\_pretrained("baichuan-inc/Baichuan-13B-Chat-int8", torch\_dtype=torch.float16, trust\_remote\_code

> **问:** 警示句末尾的加粗只剩 「from_pretrained」, 「device_map='auto'」, 「GPU」 三个碎片, 中间的字丢了. 结合下面的代码应该怎么读?
> 碎片前一句是 「应先把原始精度模型加载到 CPU 上再开始量化」. 下面 int8, int4 两段代码的 from_pretrained 都没有 device_map, 只带 `torch_dtype=torch.float16` 与 `trust_remote_code=True`, 先 `quantize(8)` / `quantize(4)`, 最后才 `.cuda()`. 与代码顺序相容的读法是: 在线量化时不要在 from_pretrained 里用 device_map='auto' 把原精度权重直接放上 GPU. 这只是和代码一致的推断, 缺掉的原文页内看不到, 不补字. 两段代码本身也在 `trust_remote_code=True` 后缺右括号, 两条语句被抽取成了一行.

GPU memory usage before and after quantization:

量化前后的显存占用如下:

| Precision | GPU Mem (GB) |
| --- | --- |
| bf16 / fp16 | 26.0 |
| int8 | 15.8 |
| int4 | 9.7 |

> **看表:** int8 是 fp16 的 0.61 倍, int4 是 0.37 倍, 都不是 1/2 和 1/4. fp16 的 26.0 又和参数量对得上吗?
> 按模型细节表, 13,264,901,120 个参数乘 2 字节约 26.5 GB (十进制), 约 24.7 GiB, 表里的 26.0 和两种单位都不严格吻合. 页内没说单位是 GB 还是 GiB, 也没说是否计入 CUDA 上下文和生成时的 KV cache. 量化版不按比例缩小, 页内同样没说哪些模块保留 fp16 (比如 embedding 和输出头). 这张表只能当实测占用来用, 不能反推每层的比特分配.

The results of the quantized versions on each benchmark, compared with the original version, are as follows:

量化后在各个 benchmark 上的结果与原始版本对比如下:

<!-- page 6 of 8 -->

| Model 5-shot | C-Eval | MMLU | CMMLU |
| --- | --- | --- | --- |
| Baichuan-13B-Base | 52.4 | 51.6 | 55.3 |
| Baichuan-13B-Base-int8 | 51.2 | 49.9 | 54.5 |
| Baichuan-13B-Base-int4 | 47.6 | 46.0 | 51.0 |

> **确认:** 页 2 说量化版 「几乎没有效果损失」. 这张表支持这个说法到什么程度?
> int8 三项分别降 1.2, 1.7, 0.8, 基本配得上 「几乎无损」. int4 三项降 4.8, 5.6, 4.3, 其中 MMLU 掉到 46.0, 已略低于 MMLU 表里的 LLaMA-13B (46.3). 这张表只评测了 Base 的在线量化, 可以直接下载的 Baichuan-13B-Chat-int8 没有分数. 所以 「几乎无损」 应限定在 int8 Base 上, 不能推到 int4, 也不能推到 Chat-int8.

### CPU Deployment · CPU 部署

Baichuan-13B supports CPU inference, but it should be stressed that CPU inference is relatively slow. Change the model-loading code as follows:

Baichuan-13B 支持 CPU 推理, 但要强调, CPU 的推理速度相对较慢. 需按如下方式修改模型加载:

```python
model = AutoModelForCausalLM.from_pretrained("baichuan-inc/Baichuan-13B-Chat", torch_dtype=torch.float32, trust_remote_code=True)
```

CPU inference needs about 60GB of memory.

使用 CPU 推理大约需要 60GB 内存.

> **拆开:** CPU 这行用的是 `torch_dtype=torch.float32`, 约 60GB. 这个数和参数量能对上吗?
> 13,264,901,120 个参数乘 4 字节约 53.1 GB, 60GB 比纯权重多出约 7GB, 页内写的是 「大概」, 多出的部分可以理解为运行时开销, 但页内没拆. 页内也没解释 CPU 为什么用 float32 而不用 float16, 没给 CPU 的 tokens/s, 只说 「相对较慢」.

## Fine-tuning the Model · 对模型进行微调

Developers can fine-tune either Baichuan-13B-Base or Baichuan-13B-Chat. Here we tested [LLaMA Efficient Tuning](https://github.com/hiyouga/LLaMA-Efficient-Tuning), a fine-tuning tool compatible with Baichuan-13B, and provide two demonstrations: **full-parameter fine-tuning** and LoRA **fine-tuning**.

开发者可以对 Baichuan-13B-Base 或 Baichuan-13B-Chat 做微调. 我们在此测试了与 Baichuan-13B 兼容的微调工具 [LLaMA Efficient Tuning](https://github.com/hiyouga/LLaMA-Efficient-Tuning), 并给出 **全量微调** 和 LoRA **微调** 两种示范.

Before starting, developers need to download the LLaMA Efficient Tuning project and [install the dependencies](https://github.com/hiyouga/LLaMA-Efficient-Tuning#getting-started) as it requires.

开始之前, 开发者需下载 LLaMA Efficient Tuning 项目, 并按它的要求[安装依赖](https://github.com/hiyouga/LLaMA-Efficient-Tuning#getting-started).

The input data are json files placed in the project's data directory, specified with the --dataset option (see the example below); multiple input files are separated by ,. An example of the json format and a description of its fields follow:

输入数据是放在项目 data 目录下的 json 文件, 用 --dataset 选项指定 (参考下面的示例), 多个输入文件用 , 分隔. json 文件的示例格式和字段说明如下:

```json
[
    {
        "instruction": "What are the three primary colors?",
        "input": "",
        "output": "The three primary colors are red, blue, and yellow."
    },
    ....
]
```

The json file stores a list, and each element of the list is a sample. instruction is the user input, and input is optional; if the developer specifies both instruction and input, the two are joined with \n to form the user input; output is the expected model output.

json 文件里存的是一个列表, 列表的每个元素是一个 sample. 其中 instruction 代表用户输入, input 是可选项, 如果开发者同时指定了 instruction 和 input, 会把二者用 \n 连接起来作为用户输入; output 代表期望的模型输出.

Below we give demonstration scripts that were tested to run end to end in the two fine-tuning scenarios.

下面给出两种微调场景下测试跑通的示范脚本.

### Full-Parameter Fine-tuning · 全量微调

We tested full-parameter fine-tuning in an environment with 8 \* Nvidia A100 80 GB + deepspeed.

我们在 8 \* Nvidia A100 80 GB + deepspeed 的环境下做了全量微调测试.

Example training launch script:

训练启动脚本示例:

```shell
deepspeed --num_gpus=8 src/train_bash.py \
    --stage sft \
    --model_name_or_path baichuan-inc/Baichuan-13B-Base \
    --do_train \
    --dataset alpaca_gpt4_en,alpaca_gpt4_zh \
    --finetuning_type full \
    --output_dir path_to_your_sft_checkpoint \
    --overwrite_cache \
    --per_device_train_batch_size 4 \
    --per_device_eval_batch_size 4 \
    --gradient_accumulation_steps 8 \
    --preprocessing_num_workers 16 \
    --lr_scheduler_type cosine \
    --logging_steps 10 \
    --save_steps 100 \
    --eval_steps 100 \
    --learning_rate 5e-5 \
    --max_grad_norm 0.5 \
```

凸

<!-- page 7 of 8 -->

```shell
--num_train_epochs 2.0 \
--dev_ratio 0.01 \
--evaluation_strategy steps \
--load_best_model_at_end \
--plot_loss \
--fp16 \
--deepspeed deepspeed.json
```

> **再看:** 全量脚本每次更新吃进 4 (per_device) × 8 (gradient_accumulation) × 8 卡 = 256 条样本; 后面的 LoRA 脚本是 4 × 8 × 1 卡 = 32 条. 两份脚本的学习率却都是 5e-5, cosine, max_grad_norm 0.5, 2.0 个 epoch. 这是调过的配方吗?
> 页内只说是 「测试跑通的示范脚本」. 等效 batch 差 8 倍而学习率不变, 页内没有解释; 两份脚本都开了 `--plot_loss` 和 `--load_best_model_at_end`, 但没贴出 loss 曲线或微调后的评测分数. 数据集是 alpaca_gpt4_en 和 alpaca_gpt4_zh, 而上面的 json 样例只有英文一条. 把它们读成能跑通的模板, 不要读成给 Baichuan-13B 调好的 SFT 配方.

Example deep\_speed.json configuration:

deep\_speed.json 配置示例:

```json
{
  "train_micro_batch_size_per_gpu": "auto",
  "zero_allow_untested_optimizer": true,
  "fp16": {
    "enabled": "auto",
    "loss_scale": 0,
    "initial_scale_power": 16,
    "loss_scale_window": 1000,
    "hysteresis": 2,
    "min_loss_scale": 1
  },
  "zero_optimization": {
    "stage": 2,
    "allgather_partitions": true,
    "allgather_bucket_size": 5e8,
    "overlap_comm": false,
    "reduce_scatter": true,
    "reduce_bucket_size": 5e8,
    "contiguous_gradients" : true
  }
}
```

> **停一下:** 标题写 deep_speed.json, 启动脚本最后一行传的却是 `--deepspeed deepspeed.json`. 配置里 ZeRO 用 stage 2, 8 张 80 GB 装得下 13B 的全量微调吗?
> 文件名一处带下划线一处不带, 照抄会找不到配置文件, 应以脚本实际传入的 deepspeed.json 统一命名. ZeRO stage 2 只切分优化器状态和梯度, 每张卡仍存整份 fp16 权重: 13,264,901,120 × 2 字节约 26.5 GB. 页内没写优化器; 若按 Adam 保留 fp32 主权重与两阶矩, 每参数 12 字节, 约 159 GB, 切 8 份约 19.9 GB; fp16 梯度 26.5 GB 切 8 份约 3.3 GB. 合计约 50 GB, 80 GB 里还给激活留了余量, 与 「8 \* A100 80 GB 跑通」 相容. `"zero_allow_untested_optimizer": true` 说明用的优化器不是 DeepSpeed 自带实现, 具体是哪个页内没写. fp16 段 `loss_scale: 0` 表示动态 loss scale, 起点是 2^16.

### LoRA Fine-tuning · LoRA微调

We tested LoRA fine-tuning on a single Nvidia A100 80G GPU.

我们在单张 Nvidia A100 80G 显卡上做了 LoRA 微调测试.

Example training launch script:

训练启动脚本示例:

```shell
CUDA_VISIBLE_DEVICES=0 python src/train_bash.py \
    --stage sft \
    --model_name_or_path baichuan-inc/Baichuan-13B-Base \
    --do_train \
    --dataset alpaca_gpt4_en,alpaca_gpt4_zh \
    --finetuning_type lora \
    --lora_rank 8 \
    --lora_target W_pack \
    --output_dir path_to_your_sft_checkpoint \
    --overwrite_cache \
    --per_device_train_batch_size 4 \
    --per_device_eval_batch_size 4 \
    --gradient_accumulation_steps 8 \
    --preprocessing_num_workers 16 \
    --lr_scheduler_type cosine \
    --logging_steps 10 \
    --save_steps 100 \
    --eval_steps 100 \
    --learning_rate 5e-5 \
    --max_grad_norm 0.5 \
    --num_train_epochs 2.0 \
    --dev_ratio 0.01 \
    --evaluation_strategy steps \
    --load_best_model_at_end \
    --plot_loss \
    --fp16
```

> **回看:** LoRA 只挂了一个目标 `--lora_target W_pack`, rank 8. W_pack 是什么, 为什么只挂它?
> 页内没解释 W_pack. 它是 Baichuan 自带模型代码里的模块名, 从名字看是把几路投影打包成一个矩阵. 结合页 3 反推里用到的注意力 4h² 项, 最可能被打包的是 Q, K, V 三个 h×h 矩阵, 输出投影另成一个模块; 这一点是推断, 页内只给模块名. 按这个读法, LoRA 只动注意力的输入投影, 不碰 FFN 和输出投影. 若 W_pack 形状是 5,120 → 15,360, rank 8 的增量每层 8 × (5,120 + 15,360) = 163,840 个参数, 40 层共 6,553,600 个. 页内只说单张 A100 80G 跑通, 没给 LoRA 训练的显存占用.

For more detailed usage of LLaMA Efficient Tuning, please refer to its project homepage.

关于 LLaMA Efficient Tuning 更详细的用法, 请参阅其项目主页说明.

凸

<!-- page 8 of 8 -->

## Disclaimer · 声明

We hereby declare that our development team has not developed any application based on the Baichuan-13B model, whether on iOS, Android, the web, or any other platform. We strongly call on all users not to use the Baichuan-13B model for any activity that endangers national or social security or is illegal. In addition, we also ask users not to use the Baichuan-13B model for un

我们在此声明, 我们的开发团队并未基于 Baichuan-13B 模型开发任何应用, 无论是在 iOS, Android, 网页或任何其他平台. 我们强烈呼吁所有使用者, 不要利用 Baichuan-13B 模型进行任何危害国家社会安全或违法的活动. 另外, 我们也要求使用者不要将 Baichuan-13B 模型用于未经适

[**Releases**](https://github.com/baichuan-inc/Baichuan-13B/releases)

No releases published

尚未发布 Release

[**Contributors**](https://github.com/baichuan-inc/Baichuan-13B/graphs/contributors) 5

[**Python** 100%](https://github.com/baichuan-inc/Baichuan-13B/search?l=python)

![Image block](images/p08-languages.png)

**Languages**

> **对一下:** 声明段在 「未经适」 处断掉; 目录里列了 「协议」 一节, 8 页里却没有出现. 旁边 Releases 写 No releases published, Contributors 5, Python 100%. 这些怎么读?
> 第 8 页只抓到声明的前两句半, 后文和 「协议」 一节都不在这 8 页里, 不补写. 仓库没有 GitHub Release, 权重分发走页 1 与页 3 的 Hugging Face, ModelScope 链接; 页 1 文件列表里仓库只有 cli_demo.py, web_demo.py 等 demo 与依赖文件, 所以 Python 100% 指的是这些 demo 代码, 模型实现代码 (trust_remote_code 拉取的那部分) 不在这个仓库里.
