---
title: "Xiaomi MiMo 产品站: 一面论文墙串起的家族时间线"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "英雄区只放两张卡."
---
# Xiaomi MiMo 产品站: 一面论文墙串起的家族时间线

> 源文 `mimo.md` 是 Xiaomi MiMo 官网首页抓取 (9 页标记, 无图, 约 2700 字符): 两张 Series 卡, 三个体验入口, 八篇论文题名与日期, 八条博客标题, 招聘与邮箱. 页面没有层数, 路由, 训练 token 或榜单分, 唯一的硬数字是博客标题里 UltraSpeed 的 1T 参数与 1000 TPS. 涉及具体机制的地方, 数字取自同族目录的技术报告源文或外部论文页, 逐处标明出处.

来源: 同目录 `mimo.md`. 对照译稿见 `mimo-bi.md`. 同族技术报告: `../mimo-7b/mimo-7b.md`, `../mimo-v2-flash/mimo-v2-flash.md`, `../mimo-v2-6/mimo-v2-6.md`.

## 1. 首页与论文墙

### 1.1. 首页把访客送到哪里

英雄区只放两张卡. **MiMo-V2.6 Series** 的口号是 「Frontier intelligence, all the modalities, built in public」, **MiMo-V2.5-TTS Series** 的口号是 「Give your agent a voice. Give it a soul.」 快速体验给三个入口: Web 对话, API 接入, 以及 MiMo Gallery, 后者明写 「走进 MiMo-V2.6 创造的世界」. 页脚把团队目标写成 「小米的通用智能基座 MiMo」, 招聘区按预训练, 后训练, AI Infra, 音频与语音, 多模态, 数据六类岗位分组, 联系邮箱 mimo@xiaomi.com.

从这几处能读出的只是产品线的主次: 旗舰是全模态的 V2.6, 语音合成单列一条 TTS 线, 两者在首页平级展示. 页面没有说 V2.6 与 V2.5-TTS 是否共用底座, 也没有给任何一代的规格. 「built in public」 这句口号在 V2.6 技术报告里有对应物: 报告开源了 MiMo-V2.6-Distill-Qwen-9B, RL 环境, 训练框架与 mini-harness, 并公开了 RL 运行日志页面. 首页本身只有口号, 开源的具体内容要到报告里看.

### 1.2. 论文墙按时间倒过来读

论文表按编号 01–08 倒序排列, 从 2026年6月29日 到 2025年5月12日. 正过来读, 这八篇大致对应家族的三个阶段. 第一阶段是 2025 年上半年的 7B 稠密模型与模态专报: **MiMo** (推理模型从预训练到后训练, 2025-05-12), **MiMo-VL** (2025-06-04), **MiMo-Audio** (2025-09-19). 同目录的 MiMo-7B 报告给出了这一代的主线: 25T token 推理密度语料, 单层 MTP, DAPO 式 GRPO 与 Seamless Rollout. 后面几代的视觉与音频前端都能追到这两篇模态专报: V2.6 报告写明 MiMo-ViT 改自 MiMo-VL-7B 的窗口注意力, 音频 tokenizer 沿用 MiMo-Audio 的训练配方.

第二阶段转向 MoE 与 RL 稳定性. **Stabilizing MoE Reinforcement Learning by Aligning Training and Inference Routers** (2025-10-21) 就是 R3 (Rollout Routing Replay) 那篇, 它记录推理引擎选的专家, 训练时重放, 处理 MoE 在两个引擎间路由不一致的问题. 三个月后的 **MiMo-V2-Flash Technical Report** (2026-01-08) 把 R3 用进了 309B MoE 的 RL, 同时公开了 Hybrid SWA (窗 128, 5:1), 轻量 MTP 与多教师在线蒸馏 MOPD. 按日期看, R3 先于 Flash 单独发表, Flash 报告在 RL 基础设施一节直接引用它.

第三阶段是 2026 年的三篇专题. **HySparse** (2026-02-03) 属于注意力结构的下一步探索: 按其论文摘要, 它让每个稀疏层直接复用前一全局层的 token 选择与 KV 缓存, 在 80B MoE (49 层中只有 5 层全注意力) 上 KV 存储降近 10×, 并称优于全注意力与 hybrid SWA 基线. 这些数字来自外部论文页, 首页只有题名. **ARL-Tangram** (2026-03-13) 题名指向 Agent RL 的资源效率, 首页没有摘要, 同族报告也没有引用它, 这里只能记下题名. **MOPD** (2026-06-29) 是多教师在线蒸馏的单独成文; V2.6 报告在介绍 MOPD2 时同时引用了 Flash 报告与这篇 MOPD 论文 (Ma et al. 2026).

## 2. 博客墙与首页的边界

### 2.1. 博客墙: 应用, 系统与语音

八条博客里有三条讲应用. 01 是 V2.6 系列发布, 与英雄区同句. 02 写 MiMo-V2.6-Pro 用于新材料研发, 从文献调研, 分子设计到自动完成计算模拟的 「干实验」, 场景是捕捉 PFAS 的新材料. **03 MiMo Code** 把编程 Agent 扩到长程任务, 标题下列了计算, 记忆, 进化三个主题. 这三个词和 V2.6 报告的内容能对上一部分: 报告的 multi-harness 训练把 MiMo Code 列为生产 harness 的例子, 并解释了为什么 RL 不直接在它上面训. 博客正文不在抓取范围内, 三个主题各指什么, 首页没有写.

系统类有两条. 04 的标题是 「MiMo-V2.5-Pro-UltraSpeed: 将 1T 参数模型的生成速度推向 1000 TPS」, 摘要句写 UltraSpeed 模式 「通过模型与系统极致 Codesign 突破 1000tps」, 两处大小写不同, 保持原样. 05 写 V2.5 系列推理全链路优化, 「将 Hybrid SWA 效率推向极致」. 首页没有给 UltraSpeed 的 batch, 上下文长度或硬件, 也没把 1000 TPS 归因到哪一层设计. 放进谱系里看, Hybrid SWA 从 Flash 起就是这个家族降推理开销的主手段, V2.5-Pro 的 1T 参数与 V2.6 报告里 Pro 档的 1.02T 一致; 但 UltraSpeed 的吞吐是在什么条件下测的, 这里没有依据可写.

语音与 Pro 各有一条收尾. **MiMo-V2.5-ASR** 开源, 支持中英双语, 方言, 歌词等复杂场景; **MiMo-V2.5-TTS Series** 主张 「让声音表现可以被语言自由调度」; **MiMo-V2.5-Pro** 的英文句是 「A leap in agentic and long horizon coherence」. 音频背景可对照 [音频与语音模型](../../../../LargeLanguageModelGuide/8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md). ASR 与 TTS 的参数量, 词表, 评测都不在首页上.

### 2.2. 这张首页能回答什么

能回答的: 家族当前的旗舰是 V2.6 Series, 语音线单列; 研究时间线从 2025 年 5 月的 7B 推理模型, 经模态专报, MoE 稳定性, Flash 技术报告, 走到 2026 年的稀疏注意力, Agent RL 资源效率与多教师蒸馏; UltraSpeed 宣称 1T 参数 1000 TPS; Hybrid SWA 被当作 V2.5 推理优化的核心. 后训练主线从 GRPO 规则奖励到 MOPD 再到 MOPD2 的演化, 要到同目录各型号报告里读; 背景可对照 [On-Policy Distillation 深度解析](../../../../LargeLanguageModelGuide/4-后训练/4.9-OPD/4.9.1-OPD方法与落地/01-OPD基础原理/01-OPD基础原理.md) 与 [高效与稀疏注意力](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.3-注意力的高效实现/2.3-注意力的高效实现.md).

不能回答的: 任何一代的层数, 专家数, 窗口与训练 token; MOPD, HySparse, ARL-Tangram 的公式和表; UltraSpeed 的测法; V2.6 与 V2.5-TTS 是否同底座. 这些问题要么在同族的 7B, Flash, V2.6 报告与 V2.5 / V2.5-Pro 产品页里有答案, 要么目前没有公开材料. 首页的价值在于给出日期顺序: R3 早于 Flash, HySparse 晚于 Flash, MOPD 单独成文晚于 Flash 半年, 这个顺序和各报告内部的引用关系是一致的.
