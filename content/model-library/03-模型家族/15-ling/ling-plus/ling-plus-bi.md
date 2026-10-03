---
title: "Ling-plus · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ling-plus 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 5 -->

## inclusionAI/Ling-plus

Search box: "Search models, datasets, users...". Repository title: inclusionAI/Ling-plus. Like 48. Follow inclusionAI, 3.07k.

页顶是搜索框, 提示文字 「Search models, datasets, users...」. 仓库名 inclusionAI/Ling-plus. 点赞 48. 关注 inclusionAI 的人数 3.07k.

Tags: [Text Generation](https://huggingface.co/models?pipeline_tag=text-generation), [Transformers](https://huggingface.co/models?library=transformers), [Safetensors](https://huggingface.co/models?library=safetensors), [bailing_moe](https://huggingface.co/models?other=bailing_moe), [conversational](https://huggingface.co/models?other=conversational), [custom_code](https://huggingface.co/models?other=custom_code). arxiv:2503.05139. License: mit.

标签一行: Text Generation, Transformers, Safetensors, bailing_moe, conversational, custom_code. 论文编号 arxiv:2503.05139. 许可证标签写小写的 mit.

Buttons: Deploy, Copy to bucket (**NEW**), Use this model. Tabs: [Model card](https://huggingface.co/inclusionAI/Ling-plus), [Files](https://huggingface.co/inclusionAI/Ling-plus/tree/main), [xet](https://huggingface.co/inclusionAI/Ling-plus/tree/main), Community 3.

按钮有 Deploy, Copy to bucket (旁边标 NEW), Use this model. 标签页有 Model card, Files, xet, Community. PDF 上 Community 旁边印着 3, md 转写里丢了这个数. Files 和 xet 指向同一个 tree/main 地址.

Downloads last month: 315.

上个月下载量 315.

## Safetensors

Model size: **293B params**. Tensor type: **BF16**. Links: Chat template, Files info.

模型大小 **293B params**. 张量类型 **BF16**. 下面两个链接: Chat template 和 Files info.

> **对一下:** 293B, 290B, 300B 是同一个总参数吗?
> 页面没有把它们对齐. 293B 是这一页 Safetensors 面板印的 Model size. 第 2 页 Introduction 和第 3 页下载表都写 290B. 第 2 页论文题目写 300B. 三个数出自三个位置, 页面没有解释 293B 和 290B 之间差出来的 3B, 也没有说 300B 是不是取整.

## Inference Providers

Marked [NEW](https://huggingface.co/docs/inference-providers). Task: [Text Generation](https://huggingface.co/tasks/text-generation). "This model isn't deployed by any Inference Provider." Button: [1 Ask for provider support](https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/1025).

这一栏标 NEW, 任务是 Text Generation. 原句的意思: 这个模型没有被任何推理服务商部署. 下面一个按钮 「Ask for provider support」, 计数 1, 链到一条 InferenceSupport 讨论.

## Model tree for inclusionAI/Ling-plus

Finetunes: [2 models](https://huggingface.co/models?other=base_model:finetune:inclusionAI/Ling-plus). Quantizations: [1 model](https://huggingface.co/models?other=base_model:quantized:inclusionAI/Ling-plus).

以 Ling-plus 为底座的微调版本 2 个, 量化版本 1 个. 页面只给数, 没有列名字.

## Collection including inclusionAI/Ling-plus

[**Ling** Collection](https://huggingface.co/collections/inclusionAI/ling). 10 items • Updated 24 days ago • 20.

收录它的合集叫 Ling. 这一行写 10 items, Updated 24 days ago, 末尾是一个 20.

> **想:** 合集那行末尾的 20 是什么数?
> 页面没有标. 它和 「10 items」, 「Updated 24 days ago」 用圆点隔开, 没有单位, 也没有图标说明. Community 旁的 3 同样没写是讨论数还是别的. 「24 days ago」 是抓取当下的相对时间, 不是绝对日期.

## Paper for inclusionAI/Ling-plus

The heading sits at the bottom of page 1. The paper card itself falls onto page 2.

这个标题在第 1 页底部, 论文卡片落到第 2 页.

<!-- page 2 of 5 -->

[**Every FLOP Counts: Scaling a 300B Mixture-of-Experts LING LLM without Premium GPUs** Paper • 2503.05139 • Published Mar 7, 2025 • 6](https://huggingface.co/papers/2503.05139)

论文卡片的标题是 「Every FLOP Counts: Scaling a 300B Mixture-of-Experts LING LLM without Premium GPUs」, 意思是: 每个 FLOP 都算数, 不用高端 GPU 把一个 300B 的 Mixture-of-Experts 模型 LING 做大. 编号 2503.05139, 发布于 2025 年 3 月 7 日, 末尾一个 6, 没有单位.

**Ling**

![Chart block](images/p02-introduction.png)

(Image: a blue ring logo with a "Hugging Face" link below it.)

(图: 蓝色环形标识, 下面是一行 Hugging Face 链接. 文件名取自后面的 Introduction 标题, 图里没有表格, 也没有曲线.)

## Introduction

Ling is a MoE LLM provided and open-sourced by InclusionAI. We introduce two different sizes, which are Ling-Lite and Ling-Plus. Ling-Lite has 16.8 billion parameters with 2.75 billion activated parameters, while Ling-Plus has 290 billion parameters with 28.8 billion activated parameters. Both models demonstrate impressive performance compared to existing models in the industry.

Ling 是 InclusionAI 提供并开源的 MoE 大语言模型. 它有两个尺寸: Ling-Lite 和 Ling-Plus. Ling-Lite 总参数 16.8B, 激活参数 2.75B; Ling-Plus 总参数 290B, 激活参数 28.8B. 原文说两个模型和业内现有模型相比表现都很好.

Their structure makes it easy to scale up and down and adapt to different tasks, so users can use these models for a wide range of tasks, from processing natural language to solving complex problems. Furthermore, the open-source nature of Ling promotes collaboration and innovation within the AI community, fostering a diverse range of use cases and enhancements.

它们的结构便于放大或缩小, 也便于适配不同任务, 所以用户可以拿它们做很多事, 从处理自然语言到解决复杂问题. 另外, Ling 是开源的, 这会推动 AI 社区里的协作和创新, 带出各种用法和改进.

As more developers and researchers engage with the platform, we can expect rapid advancements and improvements, leading to even more sophisticated applications. This collaborative approach accelerates development and ensures that the models remain at the forefront of technology, addressing emerging challenges in various fields.

随着更多开发者和研究者参与进来, 原文期待进展和改进来得更快, 应用也更复杂. 这种协作方式加快开发, 让模型保持在技术前沿, 应对各领域新冒出来的问题.

> **拆开:** Ling-Plus, Ling-plus, LING, bailing_moe 指的是同一个东西吗?
> 页面只能对上一部分. Introduction 写 Ling-Plus (大写 P), 仓库名和下载表写 Ling-plus (小写 p), 论文题目写全大写的 LING, 第 1 页的标签是 bailing_moe. 前三个是同一系列的不同大小写, 论文卡片挂在 Ling-plus 页上可以作证. bailing_moe 是模型类型标签, 页面没有一句话解释 bailing 和 Ling 的关系.

> **确认:** 「Their structure makes it easy to scale up and down」 这句, 页面给了结构吗?
> 没有. 这 5 页关于结构只有两处: Introduction 里的 「MoE LLM」 和第 1 页的标签 bailing_moe. 没有层数, 没有专家个数, 没有每个 token 选几个专家, 没有注意力类型. 激活参数 28.8B 是唯一和稀疏激活沾边的数字, 页面没有说它怎么算出来.

## Model Downloads

The heading closes page 2. The table follows on page 3.

这个标题在第 2 页末尾, 表格在第 3 页.

<!-- page 3 of 5 -->

![Image block](images/p03-you-can-download-the-following-table-to-see-the-various.png)

(Image: a chain-link anchor icon.)

(图: 一个链接锚点图标. 文件名取自下一句正文, 像素只是标题旁的锚点.)

You can download the following table to see the various parameters for your use case. If you are located in mainland China, we also provide the model on ModelScope.cn to speed up the download process.

下面的表列出各个参数, 供你按用途挑选. 如果你在中国大陆, 模型也放在 ModelScope.cn 上, 下载会快一些.

| Model | #Total Params | #Activated Params | Context Length | Download |
| --- | --- | --- | --- | --- |
| Ling-plus-base | 290B | 28.8B | 64K | HuggingFace |
| Ling-plus | 290B | 28.8B | 64K | HuggingFace |

表里两行. Ling-plus-base: 总参数 290B, 激活参数 28.8B, 上下文长度 64K, 下载列写 HuggingFace. Ling-plus: 290B, 28.8B, 64K, 下载列同样写 HuggingFace.

> **看表:** 上面那句说大陆用户可以去 ModelScope.cn, 表里有 ModelScope 的链接吗?
> 没有. 原表每个模型在下载列占两行 (rowspan 2), 第一行是 HuggingFace, 第二行在 md 里是空单元格, PDF 上也只印了 HuggingFace. 空格里原来放什么, 抓取里没有字. 另外 base 和 Ling-plus 两行的 290B, 28.8B, 64K 完全相同, 表没有写两者差在哪一步训练.

## Evaluation

Detailed evaluation results are reported in our [technical report](https://github.com/inclusionAI/Ling/blob/master/Ling_Technical_Report_V1.pdf).

详细的评测结果写在技术报告里, 链接指向 GitHub 上的 Ling_Technical_Report_V1.pdf.

> **再看:** 这里说的 technical report 和第 2 页的 arXiv 论文是同一份吗?
> 页面没说. Evaluation 链到 GitHub 仓库里的 Ling_Technical_Report_V1.pdf, 论文卡片链到 huggingface.co/papers/2503.05139, 引用条目写 arXiv:2503.05139. 文件名带 V1, arXiv 编号没带版本号. 这一页本身一个评测分数也没有.

## Quickstart

The section carries one subsection, printed with a Hugging Face logo in front.

这一节下面只有一个小节, 小节标题前印着 Hugging Face 标识.

### Hugging Face Transformers

Here is a code snippet to show you how to use the chat model with **transformers**:

下面这段代码演示怎样用 **transformers** 调用对话模型:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "inclusionAI/Ling-lite"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "Give me a short introduction to large language models."
messages = [
    {"role": "system", "content": "You are Ling, an assistant created b
```

代码的前半段: 导入 AutoModelForCausalLM 和 AutoTokenizer, 指定模型名, 用 torch_dtype=「auto」 和 device_map=「auto」 加载模型, 再加载分词器. prompt 是 「给我简单介绍一下大语言模型」. system 消息写 「You are Ling, an assistant created b」, 行尾被页面宽度截断, 到第 3 页底为止.

> **核对:** 这是 Ling-plus 的模型卡, 示例代码加载的是哪个模型?
> model_name = 「inclusionAI/Ling-lite」. 页面标题, 下载表, Model tree 都写 Ling-plus, 示例里的字符串却是 Ling-lite. 照这段代码原样运行, 加载的是 Ling-lite 仓库, 不是这一页 Safetensors 面板上的 293B 权重.

<!-- page 4 of 5 -->

```python
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_
]
response = tokenizer.batch_decode(generated_ids, skip_special_tokens=Tr
```

代码的后半段: user 消息放 prompt. apply_chat_template 用 tokenize=False 和 add_generation_prompt=True 拼出文本, 分词后送到 model.device. generate 最多新生成 512 个 token. 然后从输出里切掉输入部分, batch_decode 时跳过特殊 token. zip 那行和 batch_decode 那行都被页面截断.

> **停一下:** 第 1 页有 custom_code 标签, 示例代码传了 trust_remote_code 吗?
> 没有. 模型的 from_pretrained 只传了 model_name, torch_dtype=「auto」, device_map=「auto」, 分词器那行只传 model_name. custom_code 标签和这段代码在同一个页面上, 页面没有解释两者怎么配合.

## Deployment

Please refer to [Github](https://github.com/inclusionAI/Ling/blob/master/README.md).

部署请看 GitHub, 链接指向 inclusionAI/Ling 仓库的 README.md.

## License

This code repository is licensed under [the MIT License](https://huggingface.co/inclusionAI/Ling-plus/blob/main/LICENCE).

这个代码仓库采用 MIT License, 链接指向本仓库 main 分支下的 LICENCE 文件.

> **问:** 「This code repository」 和第 1 页的 License: mit, 覆盖的是同一个范围吗?
> 页面只给了这两处. 标签写小写的 mit, 这一节写 MIT License, 链接的文件名拼作 LICENCE (英式拼法), 句子主语是 「code repository」. 这个仓库里放的是 293B 的 Safetensors 权重, 页面没有单独说权重适用什么条款.

## Citation

If you find our work helpful, feel free to give us a cite.

如果这项工作对你有帮助, 欢迎引用.

```bib
@article{ling,
    title   = {Every FLOP Counts: Scaling a 300B Mixture-of-Experts LIN
    author  = {Ling Team},
    journal = {arXiv preprint arXiv:2503.05139},
```

引用条目 key 是 ling, 作者 Ling Team, 期刊栏写 arXiv 预印本 2503.05139. title 一行被页面截在 「LIN」.

<!-- page 5 of 5 -->

```bib
    year    = {2025}
}
```

引用条目在第 5 页收尾: 年份 2025, 然后是闭合的花括号.

![Image block](images/p05-system-theme.png)

(Image: a small monitor icon for the theme switch.)

(图: 显示器形状的小图标, 旁边文字是 System theme, 属于主题切换.)

System theme

页脚的主题切换, 当前是 System theme (跟随系统).

## Company

[TOS](https://huggingface.co/terms-of-service), [Privacy](https://huggingface.co/privacy), [About](https://huggingface.co/huggingface), [Careers](https://apply.workable.com/huggingface/).

公司栏: 服务条款, 隐私, 关于, 招聘.

## Website

[Models](https://huggingface.co/models), [Datasets](https://huggingface.co/datasets), [Spaces](https://huggingface.co/spaces), [Pricing](https://huggingface.co/pricing), [Docs](https://huggingface.co/docs).

网站栏: 模型, 数据集, Spaces, 价格, 文档.

![Image block](images/p05-image.png)

(Image: the Hugging Face smiley logo.)

(图: Hugging Face 的笑脸标识, 在页脚最后.)

> **回看:** md 转写和 PDF 在哪些字上对不上?
> 至少七处. system 消息结尾 PDF 是 「created b」, md 是 「created I」. zip 那行 PDF 是 「zip(model_」, md 是 「zip(model Device)]」. skip_special_tokens 那行 PDF 是 「=Tr」, md 是 「=T:」. 引用标题 PDF 截在 「LIN」, md 是 「LII」. 第 5 页 PDF 顶上有 year = {2025} 和收尾的 }, md 这一页没有. Community 旁的 3 在 md 里丢了. 表头 「#Total Params」 在 md 里连成 「#TotalParams」. 本文的代码和引用按 PDF 的字形转写.
