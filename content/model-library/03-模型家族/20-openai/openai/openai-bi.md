---
title: "OpenAI Models 页 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "OpenAI Models 页 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
# OpenAI 开发者文档 Models 页对照稿

源文是 OpenAI 开发者站 Models 页的浏览器打印件, 1 页, 1 张图, 由 MinerU 转成 Markdown. 这是模型选购入口页, 没有参数, 价格, 上下文长度和评测分数, 本稿只对照页面上印出来的文字. 页面上的数字只有型号里的 「6」. MinerU 漏掉或顺序不同的地方按同目录 PDF 的文字层核对, 改动处在该段中文里说明.

<!-- page 1 of 1 -->

OpenAI Developers

页首站点名: OpenAI 开发者站.

> **想:** PDF 文字层的开头是空行, 没有 「OpenAI Developers」 这几个字, md 里这一行从哪来?
> 应该是页首 logo 区的字样, PDF 里以图形呈现, 没有文字层, MinerU 做了识别. 内容本身没问题, 只是来源和正文不同.

## Models (模型)

页面大标题: 模型.

## Choosing a model (怎么选模型)

If you're not sure where to start, use [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra), our flagship model for complex reasoning and coding. Choose [GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol) to balance intelligence and cost, or [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) for cost-sensitive, high-volume workloads.

如果不知道从哪开始, 就用 GPT-6 Astra, 这是 OpenAI 面向复杂推理和编程的旗舰模型. 想在智能和成本之间取平衡, 选 GPT-6 Sol. 对成本敏感, 调用量大的场景, 用 GPT-6 Luna.

> **问:** 三档之间差多少, 页面给了价格, 上下文长度或速度吗?
> 没有. 三档的区别只用 「complex reasoning and coding」, 「balance intelligence and cost」, 「cost-sensitive, high-volume」 三句话描述, 一个数字都没印.

All latest OpenAI models support text and image input, text output, multilingual capabilities, and vision. Models are available via the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) and our [Client SDKs](https://developers.openai.com/api/docs/libraries).

OpenAI 最新一代模型都支持文本和图像输入, 文本输出, 多语言能力和视觉能力. 这些模型可以通过 Responses API 和官方 Client SDKs 调用.

> **核对:** 「image input」 和 「vision」 并列写了两次, 是不是一回事?
> 页面把它们分开列, 没有解释区别. 按字面看, 前者说输入模态, 后者说能力, 但这句话本身不足以断定两者有什么不同.

## Flagship models (旗舰模型)

Start with GPT-6 Astra for complex reasoning and coding, choose GPT-6 Sol to balance intelligence and cost, or use GPT-6 Luna for cost-sensitive, high-volume workloads.

复杂推理和编程从 GPT-6 Astra 开始, 智能和成本取平衡选 GPT-6 Sol, 成本敏感, 调用量大的场景用 GPT-6 Luna.

> **看表:** 这一节下面有 「Compare models」 按钮, 对比表印出来了吗?
> 没有. 打印件只到按钮本身, 点进去的对比表不在这一页, 三档的规格对比无从核对.

> **拆开:** 这段和上一节 「Choosing a model」 的第一段有什么不同?
> 拆开逐句比, 三档的定位措辞完全一致, 只差开头的 「If you're not sure where to start, use」 换成 「Start with」, 以及少了 「our flagship model」 这个称呼. 信息量没有增加.

**View all**

查看全部 (按钮).

**Compare models**

对比模型 (按钮).

> **确认:** 这两个按钮在 md 里排在图前面, PDF 里排在哪?
> PDF 文字层里 「View all」 和 「Compare models」 排在 Astra 卡片之后, 靠近页尾. md 把它们提到了图前, 本稿保留 md 的顺序, 两者没有内容差别.

![GPT-6 Astra 卡片头图: 星空旋涡背景上的白色 Astra 字样](images/p01-gpt-6-astra-https-developers-openai-com-api-docs-models.png)

> **回看:** 图的文件名里带着一整段网址, 画面里有网址吗?
> 没有. 画面只有 「Astra」 一个词和星空背景. MinerU 按图旁边的链接文字给图命名, 所以文件名里混进了 developers-openai-com-api-docs-models 这段路径.

[GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)

卡片标题: GPT-6 Astra.

[Our most capable model, built for the hardest end-to-end work](https://developers.openai.com/api/docs/models/gpt-6-astra)

卡片简介: OpenAI 能力最强的模型, 为最难的端到端工作而打造.

> **停一下:** PDF 文字层在这句简介后面还有一行 「M d l ID」, md 里没有, 这是什么?
> 看字形是 「Model ID」 被截断后剩下的字母, 后面本该跟模型 ID 的取值, 但打印件在这里断了, ID 本身没有印出来. md 直接丢掉了这一行.

Ask AI

页面上的 「问 AI」 按钮, 不是正文.

> **再看:** 卡片区只有 Astra 一张, Sol 和 Luna 的卡片去哪了?
> 打印件只截到第一张卡片. 前文两次提到 Sol 和 Luna, 但它们的卡片, 简介和 ID 都不在这一页.
