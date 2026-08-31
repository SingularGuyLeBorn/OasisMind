---
title: RSI 全谱系调研：田渊栋 / Anthropic / OpenAI / 各实验室
category: null
published: false
excerpt: >-
  RSI 领域全景：田渊栋 RSI 公司（46.5 亿估值、8 联创、latent space 路线）、Anthropic When AI Builds
  Itself（80%+ 代码 Claude 写、Mythos 52x）、OpenAI 2026-09/2028-03 时间表、周星星三层框架（Harness
  是主战场）、各实验室动态与待核实项。
tags:
  - RSI
  - 自我改进
  - 田渊栋
  - Anthropic
  - OpenAI
  - 自进化
---
# RSI 全谱系调研：田渊栋 / Anthropic / OpenAI / 各实验室

> 整理自用户调研笔记（2026-08-04）。Recursive Self-Improvement（递归自我改进）领域全景：从公司到实验室、从理论到实践、从乐观到泼冷水。

## 一、田渊栋 & RSI 公司（Recursive Superintelligence）

**"tianyuandong" = 田渊栋，公司 Recursive Superintelligence（RSI）**，[recursive.com](https://www.recursive.com)：

- 2026 年初成立，首轮 **6.5 亿美元、估值 46.5 亿**（GV/Greycroft 领投，英伟达/AMD 参投，[量子位报道](https://www.qbitai.com/2026/05/417468.html)）
- 8 位联创：CEO Richard Socher（You.com 创始人）、田渊栋、施天麟（姚班）、Tim Rocktäschel、Dosovitskiy（ViT 作者）、Josh Tobin、Caiming Xiong、Jeff Clune（DGM 作者）
- 路线：latent space 自我改进（latent token 取代语言 token）；第一步造「5 万博士级」系统自动化 AI 科研
- 近期输出：[《再访田渊栋：46.5 亿美金估值的 RSI，与 AI 自进化》](https://zhuanlan.zhihu.com/p/2061941323532349594)（2026-06-05 访谈）、AGI Summit 2026 炉边对话（07-18）；学术侧有 NeurIPS 2025《Reasoning by Superposition》

## 二、Anthropic

- [《When AI Builds Itself》](https://www.anthropic.com/institute/recursive-self-improvement)（2026-06-04，Jack Clark）——首次披露内部数据：**80%+ 合入代码由 Claude 撰写**、自主任务时长每 4 个月翻倍（原 7 个月）、训练加速任务 Mythos 达 52x（人类 4-8 小时才 4x）；判断缺口在「目标选择与判断力」而非执行
- [《An Automated Weak-to-Strong Researcher》](https://alignment.anthropic.com/2026/automated-w2s-researcher/)（2026-04）——多 Agent 自主完成开放式对齐研究：恢复 97% 性能差距 vs 人类研究员一周 23%
- Jack Clark 预测：2028 年底前 RSI 有望实现

## 三、OpenAI

- 2025-10-28 官方直播时间表——**2026-09 实习研究员级、2028-03 完全自动化 AI 研究员**（[LessWrong 引文整理](https://www.lesswrong.com/posts/EF5zBhaptNebzhwr3/quotes-on-openai-s-timelines-to-automated-research-safety)）
- Altman《The Gentle Singularity》（2025-06）
- [GPT-Red 自对弈红队](https://cdn.openai.com/pdf/gpt-red-automated-red-teaming-via-self-play-at-scale.pdf)（2026-07-15，self-play RL，提示注入漏洞命中率 84% vs 人类 13%）

## 四、周星星的 RSI 三层框架

[《自进化（Self-evolving／RSI），一篇就够了》](https://zhuanlan.zhihu.com/p/2065227313973825752)（2026-07-30，[全文镜像](https://qingkeai.online/archives/Self-evolving)）：

- **Artifacts 层**：AlphaEvolve / autoresearch（自我改进产物）
- **Harness 层**：prompt / memory / tool / skill——**判断为近期主战场**
- **Model 层**：自训练 / 自对弈 / TTC（Test-Time Compute）
- 结论：「够得上『递归』的例子依然很少，这事还早」

## 五、各实验室动态

- **DeepMind**：AlphaEvolve（已反哺 Gemini 训练，「RSI 已在生产中悄悄发生」；但 Pichai 2026-06 公开泼冷水）
- **Sakana**：DGM（SWE-bench 20%→50%）+ 2026-06 成立专门 RSI Lab
- **Meta**：小扎称看到「自我改进初步迹象」
- **国内**：智谱唐杰（自改进是最有前景道路）、清华 SkillEvolver / SEAGym、MiniMax M2.7、陈天桥 Apodex、Weco AI AIDE²（自称首个 RSI Level 1 实证）
- 入门索引综述：[arXiv:2508.07407](https://arxiv.org/abs/2508.07407)

## 六、待核实（二手转述，引用前查原始公告）

OpenAI "RSI Index" 指标、Sakana RHI 细节、MiniMax M2.7 自迭代数字、腾讯 Hyra-1.0——均来自周星星文转述，未独立核实。

## 关联阅读

- 本库《LLM 仍主要由模仿学习驱动》——RLVR vs 模仿学习的背景讨论，关系 RSI 的能力来源判断。
- multiagent 库《周星星的多 Agent 架构观》——Harness 层主战场的具体实践视角。
