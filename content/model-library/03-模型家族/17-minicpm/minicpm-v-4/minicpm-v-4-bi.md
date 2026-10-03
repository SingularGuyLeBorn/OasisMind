---
title: "MiniCPM-V 4.0 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-V 4.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
# MiniCPM-V 4.0 模型卡对照稿

源文是 Hugging Face 上 openbmb/MiniCPM-V-4 模型页的浏览器打印件，9 页，12 张图，由 MinerU 转成 Markdown。每页页眉的打印时间 2026/9/25 13:32 和页面标题 「openbmb/MiniCPM-V-4 · Hugging Face」，页脚的网址和 「k/9」 页码，都是打印时浏览器加上的，本稿删去。MinerU 识别错的地方按同目录 PDF 的文字层改回，改动处在该段中文里说明。正文三条特点和几处标题前的装饰性表情符号一律省去。

<!-- page 1 of 9 -->

![Hugging Face 页头左上角的三横线菜单图标](images/p01-image.png)

![社区讨论数的黑底角标，数字 5](images/p01-image-2.png)

![社区讨论入口的橙色手掌图标](images/p01-2026-9-25-13-32.png)

![Hugging Face 的笑脸抱抱 logo](images/p01-search-models-datasets-users.png)

页头的三个小图标：菜单按钮，社区讨论数角标，社区入口图标，再加上 Hugging Face 的 logo。数字 5 在 PDF 文字层里紧跟 Community，是社区讨论帖的数量。手掌图标 MinerU 按页眉的打印时间命名成 2026-9-25-13-32，logo 按旁边的搜索框命名，文件名和图的内容无关。

Search models, datasets, users...

搜索框里的占位文字：搜索模型，数据集，用户。

openbmb/MiniCPM-V-4 · Like 464 · Follow OpenBMB 5.36k

仓库名是组织 openbmb 下的 MiniCPM-V-4。点赞 464 次，关注 OpenBMB 组织的有 5.36k 人。

[Image-Text-to-Text](https://huggingface.co/models?pipeline_tag=image-text-to-text) · [Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · openbmb/RLAIF-V-Dataset · [multilingual](https://huggingface.co/models?language=multilingual) · [minicpmv](https://huggingface.co/models?other=minicpmv) · [minicpm-v](https://huggingface.co/models?other=minicpm-v) · [vision](https://huggingface.co/models?other=vision) · [multi-image](https://huggingface.co/models?other=multi-image) · [conversational](https://huggingface.co/models?other=conversational) · License: apache-2.0

页面标签：任务类型是图文进，文本出（Image-Text-to-Text）；加载库 Transformers；权重格式 Safetensors；训练数据集 openbmb/RLAIF-V-Dataset；多语言；模型类型 minicpmv；minicpm-v；视觉；多图；对话。许可证 Apache-2.0. PDF 文字层在这一行还多出 feature-extraction，ocr，video，custom_code 四个标签，MinerU 没有识别出来。

> **想：** 标签里有 custom_code，这个模型能不能直接用 Transformers 自带的类加载？
> 不能完全靠自带类。第 6 页的加载代码写了 trust_remote_code=True，要执行仓库里附带的模型代码，和 custom_code 标签对得上。

Deploy · Copy to bucket **NEW** · Use this model

页面按钮：部署，复制到存储桶（新功能），使用此模型。

[**Model card**](https://huggingface.co/openbmb/MiniCPM-V-4) · Files · [**xet**](https://huggingface.co/openbmb/MiniCPM-V-4/tree/main) · Community

标签页：模型卡，文件，xet 存储标识，社区。Files 这一项 MinerU 漏了，按 PDF 文字层补上。

Downloads last month: 63,594

上个月下载量 63,594 次。MinerU 把标题和数字各识别成一个二级标题，这里合成一行。

Safetensors · Model size: 4B params · Tensor type: BF16

权重格式 Safetensors；页面自动统计的模型大小是 4B 参数；张量类型 BF16。

<u>Chat template</u> · <u>Files info</u>

两个链接：对话模板，文件信息。

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)（推理服务商）

[Image-Text-to-Text](https://huggingface.co/tasks/image-text-to-text)

This model isn't deployed by any Inference Provider.

[Ask for provider support](https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/new?title=openbmb/MiniCPM-V-4&description=React%20to%20this%20comment%20with%20an%20emoji%20to%20vote%20for%20%5Bopenbmb%2FMiniCPM-V-4%5D%28%2Fopenbmb%2FMiniCPM-V-4%29%20to%20be%20supported%20by%20Inference%20Providers.%0A%0A%28optional%29%20Which%20providers%20are%20you%20interested%20in%3F%20%28Novita%2C%20Hyperbolic%2C%20Together%E2%80%A6%29%0A)

推理服务商栏：任务类型图文进，文本出。目前没有任何推理服务商部署这个模型，下面是一个 「请求服务商支持」 的链接，点进去是在 Hugging Face 的讨论区投票。

## Model tree for openbmb/MiniCPM-V-4（模型谱系）

**Adapters** [1 model](https://huggingface.co/models?other=base_model:adapter:openbmb/MiniCPM-V-4) · **Finetunes** [4 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-V-4) · **Quantizations** [7 models](https://huggingface.co/models?other=base_model:quantized:openbmb/MiniCPM-V-4)

以这个模型为基座的衍生模型：适配器 1 个，微调模型 4 个，量化模型 7 个。

## Dataset used to train openbmb/MiniCPM-V-4（训练用数据集）

[**openbmb/RLAIF-V-Dataset**](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset)

[Viewer • Updated Oct 14, 2025 • 83.1k • 1.87k • 219](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset)

训练用到的数据集是 openbmb/RLAIF-V-Dataset。数据集卡片上写着：有在线预览，2025 年 10 月 14 日更新，83.1k 条数据，1.87k 次下载，219 个赞。三个数字没有单位，这里按 Hugging Face 数据集卡片的固定排列读。

> **问：** 侧栏只列了一个数据集，是不是说 MiniCPM-V 4.0 只用 RLAIF-V 训练？
> 页面没这么说。侧栏只显示仓库元数据里登记的数据集，83.1k 条的 RLAIF-V 从名字看是偏好对齐数据，预训练和 SFT 用了什么，9 页里没有写。

<!-- page 2 of 9 -->

**Spaces using openbmb/MiniCPM-V-4** 12

prithivMLmods/Multimodal-VLM-Thinking · eduagarcia/multilingual-tokenizer-leaderboard · vmedi/Floorplanvlm · build-small-hackathon/tabras · build-small-hackathon/scam-court-ai · + 7 Spaces

有 12 个 Space 用到了这个模型，页面列出 5 个，另外 7 个折叠成 「+ 7 Spaces」。MinerU 把这一串识别成 powershell 代码块，这里改回普通文字；PDF 文字层里每个 Space 名前面有一个表情图标。

**Collection including openbmb/MiniCPM-V-4**

MiniCPM-o & MiniCPM-V Collection · Multimodal models with leading perform... • 32 items • Updated 10 days ago • 86

收录本模型的合集：「MiniCPM-o & MiniCPM-V」，简介是 「性能领先的多模态模型」（页面截断），32 个条目，10 天前更新，86 个赞。MinerU 把赞的图标识别成三角形，按 PDF 文字层改回数字。

## A GPT-4V Level MLLM for Single Image, Multi Image and Video on Your Phone（手机上的 GPT-4V 级多模态大模型）

模型卡正文标题：一个能在手机上跑的，达到 GPT-4V 水平的多模态大语言模型，支持单图，多图和视频。

[GitHub](https://github.com/OpenBMB/MiniCPM-o) | [MiniCPM Wiki(Chinese)](https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D) | [Demo](http://211.93.21.133:8889/)

三个链接：GitHub 仓库（OpenBMB/MiniCPM-o），飞书上的中文 MiniCPM Wiki，在线演示。

## MiniCPM-V 4.0

**MiniCPM-V 4.0** is the latest efficient model in the MiniCPM-V series. The model is built based on SigLIP2-400M and MiniCPM4-3B with a total of 4.1B parameters. It inherits the strong single-image, multi-image and video understanding performance of MiniCPM-V 2.6 with largely improved efficiency. Notable features of MiniCPM-V 4.0 include:

**MiniCPM-V 4.0** 是 MiniCPM-V 系列里最新的高效模型。它以 SigLIP2-400M 和 MiniCPM4-3B 为基础搭建，总参数 4.1B. 它继承了 MiniCPM-V 2.6 在单图，多图和视频理解上的强表现，效率又大幅提高。MiniCPM-V 4.0 的主要特点如下：

> **核对：** SigLIP2-400M 加 MiniCPM4-3B，按名字相加是多少，和 4.1B 对得上吗？
> 按名字是 0.4B + 3B = 3.4B，比 4.1B 少 0.7B；侧栏自动统计又写 4B. 两个组件的实际参数和连接模块各占多少，本页没有给。

**Leading Visual Capability.** With only 4.1B parameters, MiniCPM-V 4.0 achieves an average score of 69.0 on OpenCompass, a comprehensive evaluation of 8 popular benchmarks, **outperforming GPT-4.1-mini-20250414, MiniCPM-V 2.6 (8.1B params, OpenCompass 65.2) and Qwen2.5-VL-3B-Instruct (3.8B params, OpenCompass 64.5)**. It also shows good performance in multi-image understanding and video understanding.

**领先的视觉能力。** MiniCPM-V 4.0 只有 4.1B 参数，在 OpenCompass 上拿到 69.0 的平均分。OpenCompass 是一个汇总 8 个常用基准的综合评测。这个分数 **超过了 GPT-4.1-mini-20250414, MiniCPM-V 2.6（8.1B 参数，OpenCompass 65.2）和 Qwen2.5-VL-3B-Instruct（3.8B 参数，OpenCompass 64.5）**。它在多图理解和视频理解上表现也不错。

> **看表：** 三个对手里，GPT-4.1-mini 为什么只有名字没有分数？
> 这一段只给了 MiniCPM-V 2.6 和 Qwen2.5-VL-3B 的分数。GPT-4.1-mini-20250414 的分数应在 OpenCompass 结果表里，第 3 页那张表是折叠的，打印件没展开，超过它多少在本页算不出来。

**Superior Efficiency.** Designed for on-device deployment, MiniCPM-V 4.0 runs smoothly on end devices. For example, it devlivers **less than 2s first token delay and more than 17 token/s decoding on iPhone 16 Pro Max**, without heating problems. It also shows superior throughput under concurrent requests.

**效率更高。** MiniCPM-V 4.0 为端侧部署设计，在终端设备上运行流畅。比如在 iPhone 16 Pro Max 上，**首 token 延迟不到 2 秒，解码速度超过每秒 17 个 token**，而且没有发热问题。在并发请求下它的吞吐量也更高。原文 devlivers 是 delivers 的拼写错误；这句话在打印件里跨第 2, 3 页，这里接回一段。

> **拆开：** 「不到 2 秒」 和 「每秒 17 个 token」 是在什么输入下测的？
> 本页没写图片分辨率，提示长度和量化方式。只能换算出每个 token 约 59 毫秒（1000 / 17），并发吞吐 「更高」 也没有给对比对象和数字。

<!-- page 3 of 9 -->

**Easy Usage.** MiniCPM-V 4.0 can be easily used in various ways including **llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory and local web demo** etc. We also open-source iOS App that can run on iPhone and iPad. Get started easily with our well-structured [Cookbook](https://github.com/OpenSQZ/MiniCPM-V-CookBook), featuring detailed instructions and practical examples.

**易于使用。** MiniCPM-V 4.0 有多种用法，包括 **llama.cpp，Ollama，vLLM，SGLang，LLaMA-Factory 和本地网页演示** 等。团队还开源了能在 iPhone 和 iPad 上运行的 iOS App。结构清楚的 [Cookbook](https://github.com/OpenSQZ/MiniCPM-V-CookBook) 里有详细说明和实用示例，上手很容易。

## Evaluation（评测）

Click to view single image results on OpenCompass.

点击查看 OpenCompass 上的单图评测结果。

Click to view single image results on ChartQA, MME, RealWorldQA, TextVQA, DocVQA, MathVision, DynaMath, WeMath, Object HalBench and MM Halbench.

点击查看 ChartQA，MME，RealWorldQA，TextVQA，DocVQA，MathVision，DynaMath，WeMath，Object HalBench 和 MM Halbench 上的单图评测结果。

Click to view multi-image and video understanding results on Mantis, Blink and Video-MME.

点击查看 Mantis，Blink 和 Video-MME 上的多图与视频理解结果。

> **确认：** 评测一节是不是只有这三行字？
> 是。三个 「Click to view」 都是网页上的折叠块，打印时没有展开，PDF 文字层在这一页也只有这三行。所以本页能引用的分数只有第 2 页那三个 OpenCompass 平均分。

## Examples（示例）

下面三组示例在网页上是并排的三栏截图，MinerU 把三栏的文字交错成一串，本稿按 「图，提问，回答」 重新归到各自的示例下。三栏顶端都标着 MiniCPM-V 4.0，表示下面是模型的回答。

<!-- page 4 of 9 -->

![餐厅黑板菜单，分汉堡，热狗，配菜三栏，带价格](images/p04-i-want-to-order-a-bacon-cheddar-dog-two-hamburgers-and.png)

I want to order a bacon cheddar dog, two hamburgers and a fried pickle. How much should I pay?

用户提问：我想点一份培根切达热狗，两个汉堡和一份炸酸黄瓜，要付多少钱？

MiniCPM-V 4.0:

To determine the total cost of ordering a bacon cheddar dog, two hamburgers, and a fried pickle, we need to add the prices of these items together.

模型回答：要算出一份培根切达热狗，两个汉堡和一份炸酸黄瓜的总价，需要把这几样的价格加起来。

1. Identify the price of each item:
   - Bacon Cheddar Dog: \$6.75
   - Hamburger (2): 2 x \$9.50 = \$19.00
   - Fried Pickle: \$8.50
2. Add the prices together:
   - Total Cost = Price of Bacon Cheddar Dog + Price of Two Hamburgers + Price of Fried Pickle
   - Total Cost = \$6.75 + \$19.00 + \$8.50
3. Perform the addition:
   - Total Cost = \$6.75 + \$19.00 + \$8.50 = \$34.25

第一步，找出每样的价格：培根切达热狗 6.75 美元；汉堡两个，2 x 9.50 = 19.00 美元；炸酸黄瓜 8.50 美元。第二步，把价格加起来：总价 = 热狗价格 + 两个汉堡的价格 + 炸酸黄瓜价格 = 6.75 + 19.00 + 8.50。第三步，做加法，得 34.25 美元。MinerU 把第 2 步识别成二级标题，这里改回列表。

Therefore, you should pay \$34.25 for your order.

所以这一单你应付 34.25 美元。

> **回看：** 回答里的三个单价和黑板上写的一致吗？
> 一致。菜单图上 HAMBURGER 9.50，BACON CHEDDAR DOG 6.75，FRIED PICKLES 8.50，加总 6.75 + 19.00 + 8.50 = 34.25 也对。

![餐厅小票特写，列出菜品，小计，服务费，税和总计](images/p04-extract-the-food-price-and-total-price-on-the-receipt.png)

The Tack Room 145 Lincoln Road Lincoln, MA 01773

小票顶部的店名和地址：The Tack Room，马萨诸塞州 Lincoln 市 Lincoln Road 145 号，邮编 01773。这行字截图里在小票上方，MinerU 识别成了二级标题。

Extract the food, price, and total price on the receipt and output them in markdown format

用户提问：提取小票上的菜品，价格和总价，用 markdown 格式输出。

MiniCPM-V 4.0:

| Item | Price |
|---|---|
| BBQ Potato Chips | \$7.00 |
| Diet Coke | \$3.00 |
| Trillium Fort Point | \$10.00 |
| Fried Chicken Sandwich | \$34.00 |
| Famous Duck Grilled Cheese | \$25.00 |
| Mac & Cheese | \$17.00 |
| Burger of the moment | \$18.00 |
| Subtotal | \$114.00 |
| Admin Fee (3.00%) | \$3.42 |
| Tax | \$7.11 |
| Total | \$124.53 |

模型输出一张两列 markdown 表，列名是菜品和价格：烧烤味薯片 7.00，健怡可乐 3.00, Trillium Fort Point（一款啤酒）10.00，炸鸡三明治 34.00，招牌鸭肉烤芝士三明治 25.00，芝士通心粉 17.00，当日汉堡 18.00；小计 114.00，管理费（3.00%）3.42，税 7.11，总计 124.53，单位都是美元。MinerU 把表头分隔行识别成 「i ---|---|」，还丢了几处竖线，这里补成完整的表。截图最上面还有一个 OCR 残字 「Do」，已删去。

> **停一下：** 小票上炸鸡三明治前面写着 2，模型的表里怎么只有单价列？
> 小票原文是 「2 Fried Chicken Sandwich \$34.00」，34.00 是两份的合计。模型把数量丢了，金额照抄没错；七项相加 114.00, 114 x 3% = 3.42, 114.00 + 3.42 + 7.11 = 124.53，都和小票一致。

![汽车仪表盘，中间屏幕显示 Engine Coolant Over Temperature 警告](images/p04-image.png)

我的仪表盘为什么出现这个？

用户提问（源文是中文，照录）：问仪表盘为什么出现这个警告。这组示例的提问和回答原本就是中文，下面照录原文，不再翻译。

MiniCPM-V 4.0:

你的仪表板显示「发动机冷却液过热」的警告，这意味着发动机冷却系统可能存在问题。这可能是由于冷却液不足、冷却系统泄漏或散热器堵塞等原因导致的。

以下是可能导致此警告的原因：

1. 冷却液水平低：如果车辆的冷却液水平不足，它无法有效地吸收发动机产生的热量，导致过热。
2. 冷却系统泄漏：冷却系统中的任何泄漏都会减少冷却液的可用量，使发动机过热。
3. 散热器堵塞：散热器中的堵塞会导致冷却液流动受阻，从而引起过热。
4. 温度传感器故障：温度传感器可能出现故障，导致发动机控制单元错误地感知发动机温度过高。
5. 泵故障：冷却液泵可能故障，无法将冷却液循环到发动机上。

建议尽快进行以下步骤：

1. 检查冷却液水平：确保冷却液达到正确的标记。如果水平低，添加冷却液。
2. 检查冷却系统：查找任何可见的泄漏或损坏。
3. 检查散热器：确保散热器没有堵塞。
4. 更换温度传感器：如果怀疑传感器故障，可以考虑更换。
5. 检查冷却液泵：确保泵正常工作。

如果问题持续存在，最好将车辆送至专业技师进行诊断和维修。

模型先把屏幕上的英文警告 「Engine Coolant Over Temperature」 译成 「发动机冷却液过热」，然后列出五个可能原因和五条处理建议，最后建议送修。MinerU 把这段回答拆成三截插在另外两组示例中间，「建议尽快进行以下步骤」 还被识别成二级标题，这里接回一段并改回普通文字。

Run locally on iPhone 16 Pro Max with [iOS demo](https://github.com/OpenSQZ/MiniCPM-V-CookBook/blob/main/demo/ios_demo/ios.md).

以上示例用 [iOS 演示程序](https://github.com/OpenSQZ/MiniCPM-V-CookBook/blob/main/demo/ios_demo/ios.md) 在 iPhone 16 Pro Max 本地运行。

<!-- page 5 of 9 -->

Welcome to MiniCPM-V

欢迎使用 MiniCPM-V. 这行字是下面两张手机截图各自的标题，MinerU 识别出两遍，这里只留一行。

![两张 iPhone 上 MiniCPM-V App 的欢迎页截图，右边一张输入栏多一个摄像按钮](images/p05-https-huggingface-co-openbmb-minicpm-v-4.png)

两张截图是 MiniCPM-V iOS App 的空白对话页。标题下的中文说明是 「让我协助你了解知识，获得灵感，提升效率，我可以进行多轮对话与互动，根据图片给出信息并进一步解读」，下面有两个示例提示 「请描述图片中的内容」 和 「Describe the image」。左图输入栏只有图片按钮，右图多了一个摄像按钮。截图底部写着 「Generated by AI, not our views. Do not remove this notice.」（内容由 AI 生成，不代表我们的观点，请勿删除此提示）。这一页在网页上是一段录屏，打印出来只剩首帧。

<!-- page 6 of 9 -->

![又一组两张 MiniCPM-V App 欢迎页截图，录屏时间不同](images/p06-usage.png)

这张图 MinerU 按下方的 Usage 标题命名，内容其实是第 5 页那段录屏的另一组画面：左右两台手机的状态栏时间是 16:34 和 19:44，界面和第 5 页相同。

## Usage（用法）

```python
from PIL import Image
import torch
from transformers import AutoModel, AutoTokenizer

model_path = 'openbmb/MiniCPM-V-4'
model = AutoModel.from_pretrained(model_path, trust_remote_code=True,
                                  # sdpa or flash_attention_2, no eager
                                  attn_implementation='sdpa', torch_dty
model = model.eval().cuda()
tokenizer = AutoTokenizer.from_pretrained(
    model_path, trust_remote_code=True)
```

加载代码：用 Transformers 的 AutoModel 和 AutoTokenizer 从 openbmb/MiniCPM-V-4 加载，需要 trust_remote_code=True。注释说注意力实现可选 sdpa 或 flash_attention_2，不支持 eager，示例用 sdpa。模型切到推理模式并放到 GPU 上。注释里的 「no eager」 MinerU 误识别成 「no eagle」，按 PDF 文字层改回。第二个参数行在网页上超出代码框宽度，打印件只到 「torch_dty」 就截断了，后面的内容本页看不到。

> **再看：** torch_dty 后面是什么值，能不能按侧栏的 BF16 补上？
> 不补。打印件在这里被代码框截断，侧栏 BF16 说的是权重文件的张量类型，不等于示例代码里写的加载精度。本稿照印出来的样子留着。

<!-- page 7 of 9 -->

```python
image = Image.open('./assets/single.png').convert('RGB')

# First round chat
question = "What is the landform in the picture?"
msgs = [{'role': 'user', 'content': [image, question]}]

answer = model.chat(
    msgs=msgs,
    image=image,
    tokenizer=tokenizer
)
print(answer)

# Second round chat, pass history context of multi-turn conversation
msgs.append({"role": "assistant", "content": [answer]})
msgs.append({"role": "user", "content": [
            "What should I pay attention to when traveling here?"]})

answer = model.chat(
    msgs=msgs,
    image=None,
    tokenizer=tokenizer
)
print(answer)
```

对话代码：读入一张图片转成 RGB。第一轮问 「图里是什么地形？」，消息的 content 是一个列表，图片和问题文字放在一起；调用 model.chat 得到回答并打印。第二轮把第一轮的回答作为 assistant 消息追加进历史，再追加用户问题 「来这里旅行要注意什么？」，这次 image 传 None，图片已经在历史消息里。MinerU 把两处 msgs=msgs 识别成 msgs=news，把 image=image 识别成 image(image，都按 PDF 文字层改回。

## License（许可证）

## Model License（模型许可证）

The MiniCPM-o/V model weights and code are open-sourced under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM-V/blob/main/LICENSE) license.

MiniCPM-o 和 MiniCPM-V 的模型权重与代码以 [Apache-2.0](https://github.com/OpenBMB/MiniCPM-V/blob/main/LICENSE) 许可证开源。MinerU 把大标题 License 识别成代码块，这里改回标题。

<!-- page 8 of 9 -->

To help us better understand and support our users, we would deeply appreciate it if you could consider optionally filling out a brief registration ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g).

为了更好地了解和支持用户，如果你愿意填一份简短的登记 [「问卷」](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g)，我们会非常感谢。问卷是自愿的。

## Statement（声明）

As an LMM, MiniCPM-V 4.0 generates contents by learning a large mount of multimodal corpora, but it cannot comprehend, express personal opinions or make value judgement. Anything generated by MiniCPM-V 4.0 does not represent the views and positions of the model developers

MiniCPM-V 4.0 是一个大型多模态模型（LMM），它通过学习大量多模态语料来生成内容，但它不能理解内容，不能表达个人观点，也不能做价值判断。MiniCPM-V 4.0 生成的任何内容都不代表模型开发者的观点和立场。原文 「large mount」 应为 「large amount」，句末也少了句号。

We will not be liable for any problems arising from the use of the MinCPM-V models, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

对使用 MiniCPM-V 模型引起的任何问题，我们不承担责任，包括但不限于数据安全问题，舆论风险，以及因模型被误导，误用，传播或滥用而产生的任何风险和问题。原文 MinCPM-V 少了一个 i，misuse 也重复出现了两次。

## Key Techniques and Other Multimodal Projects（关键技术与其他多模态项目）

Welcome to explore key techniques of MiniCPM-V 2.6 and other multimodal projects of our team:

欢迎了解 MiniCPM-V 2.6 的关键技术，以及我们团队的其他多模态项目：

[VisCPM](https://github.com/OpenBMB/VisCPM/tree/main) | [RLHF-V](https://github.com/RLHF-V/RLHF-V) | [LLaVA-UHD](https://github.com/thunlp/LLaVA-UHD) | [RLAIF-V](https://github.com/RLHF-V/RLAIF-V)

四个项目链接：VisCPM, RLHF-V, LLaVA-UHD, RLAIF-V。

> **对一下：** 这是 4.0 的模型卡，关键技术为什么指向 MiniCPM-V 2.6?
> 这一节没有写 4.0 自己的技术，只指向 2.6 和团队的四个项目。本页关于 4.0 结构的全部信息就是第 2 页那句 「SigLIP2-400M 加 MiniCPM4-3B」，连接方式和训练流程都不在这 9 页里。

## Citation（引用）

If you find our work helpful, please consider citing our papers and liking this project!

如果我们的工作对你有帮助，请考虑引用我们的论文并给这个项目点个赞！

![引用说明句末的红色爱心和感叹号](images/p08-2026-9-25-13-32.png)

句末的爱心图标。MinerU 按页眉打印时间给它命名，并把它放在这一页开头，这里挪回它所在的句子后面。原句里的书写表情也一并省去。

```bib
@article{yao2024minicpm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and
  journal={Nat Commun 16, 5509 (2025)},
  year={2025}
}
```

BibTeX 条目：论文题目 「MiniCPM-V：手机上的 GPT-4V 级多模态大模型」，作者前四位是 Yao Yuan，Yu Tianyu，Zhang Ao，Wang Chongyi，后面的作者被代码框截断；发表于 Nature Communications 第 16 卷，文章号 5509, 2025 年。引用键写的是 yao2024minicpm，年份字段是 2025。

<!-- page 9 of 9 -->

System theme

![网站页脚的显示器图标，用于切换跟随系统主题](images/p09-company.png)

页脚的主题切换：跟随系统主题。图标 MinerU 按下一行命名成 company。

## Company（公司）

[TOS](https://huggingface.co/terms-of-service) · [Privacy](https://huggingface.co/privacy) · [About](https://huggingface.co/huggingface) · [Careers](https://apply.workable.com/huggingface/)

公司栏：服务条款，隐私政策，关于，招聘。

## Website（网站）

[Models](https://huggingface.co/models) · [Datasets](https://huggingface.co/datasets) · [Spaces](https://huggingface.co/spaces) · [Pricing](https://huggingface.co/pricing) · [Docs](https://huggingface.co/docs)

网站栏：模型，数据集，Space，定价，文档。

![页脚的 Hugging Face 笑脸抱抱 logo](images/p09-https-huggingface-co-openbmb-minicpm-v-4.png)

页脚的 Hugging Face logo，MinerU 按页脚网址给它命名。
