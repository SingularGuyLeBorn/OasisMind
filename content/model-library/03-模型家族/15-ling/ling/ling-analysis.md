---
title: "Ling 技术解析"
category: "模型库"
tags: ["Ling", "技术解析"]
published: true
excerpt: "页头写蚂蚁集团的开源组织，方向是 AGI。能读到的计数是关注者 1.5k，仓库 68，成员 People 1。"
---
这是 GitHub 上 inclusionAI 的组织页抓取，4 页，不是 Ling 的技术报告。

## 1. 这一页是组织壳

页头写蚂蚁集团的开源组织，方向是 AGI。能读到的计数是关注者 1.5k，仓库 68，成员 **People 1**. 1.5k 链到关注者列表，People 1 链到成员页，两个数不是同一件事。

标语是 「AI Built By Everyone, For Everyone」。README 把组织介绍又写了一遍，并点了大语言模型，强化学习，训练和推理系统。这些是目录级的话，没有模型规格。

## 2. 链接印成了好几套

网站出现两个字符串：页头 `https://inclusion-ai.org`，标语下 `https://www.inclusion-ai.org/`. Hugging Face 是 `huggingface.co/inclusionAI`. ModelScope 那条在 md 里被截成 `organizat…`。

社交链接也对不上同一个名字。第 1 页的 X 是 `x.com/TheInclusionAI`。第 2 页正文写 Twitter，链接是 `x.com/ant_oss`，旁边还有一个 Discord 邀请。Robbyant 被写成蚂蚁集团下面的另一个组织，不在这 68 个仓库的已列出名单里。

## 3. 置顶的五个仓库

LLaDA2.X 的说明第一句是 LLaDA2.0，星 528，复刻 29。仓库名和说明里的版本号不是同一个字符串。第 3 页另有 LLaDA2.0-Uni，说明是 「Understanding and Generation the World.」

Ling-V2.5 星 28，复刻 4. Ring-V2.5 星 47，复刻 6。两张卡片都只有一行 Python，没有参数量。Ming 写在 Ling LLM 上做多模态，星 672，复刻 60，是置顶里星数最高的一个。Zooming-without-Zooming 写 ICML 2026 和 ZoomBench，performance 被印成 performace，星 190，复刻 3。

## 4. 列表里的十个名字和 68

第 3 到 4 页继续列出 Avernet, sandboxd, AWorld, AReno, AKernel, Ming-Image, LLaDA2.0-Uni, distill-fs, ling-cookbook, Realtime-Venus。加上置顶 5 个，这 4 页一共 15 个仓库名。页头是 68. 68 减 15 等于 53，这是算出来的差，剩余名单不在这页，只给了 「View all repositories」。

AReno 印了星 318，复刻 127，许可证 Apache-2.0. AKernel 也写了 Apache-2.0。其他仓库没有在这页重复许可证。

## 5. 相对时间不是发布日

Avernet 写 Updated **1 minute ago**，sandboxd 写 **17 hours ago**，另外几条是 yesterday 或 **2 days ago**。这些是抓取时的相对时间。页面没有绝对日期，不能把它们排成发布时间。

话题行是 rl, llm, machine-learning, moe, environment. moe 是 topic 搜索链接，不是结构表。这一页没有专家个数，也没有把这个标签接到 Ling-V2.5 或 Ring-V2.5 上。

## 6. 和 Ling 论文的边界

Ling 在这页只出现三处：置顶仓库 Ling-V2.5，指南仓库 ling-cookbook，Ming 那句 built upon the Ling LLM。没有 16B，没有 1T，没有评测分数。那些数字如果出现，只能来自别的目录，不能记在这 4 页上。

15 张图里，多数是标签图标，语言标识和星标。文件名常常取自旁边的链接或下一句说明，例如 updated-yesterday 和 Avernet 的仓库地址。它们不是结构图，也不是评测图。
