---
title: "Tülu 3 对照译稿"
category: "后训练与奖励模型"
tags: ["Tülu 3", "指令微调", "偏好优化", "RLVR", "开放模型"]
published: true
excerpt: "Tülu 3 系统公开从提示策划、监督微调、偏好优化到可验证奖励强化学习的完整后训练配方与评测体系。"
---

# Tülu 3: Pushing Frontiers in Open Language Model Post-Training · 推进开放语言模型后训练前沿
<!-- arXiv 2411.15124; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/tulu-3/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 82 -->

Tülu 3: Pushing Frontiers in

Open Language Model Post-Training

NathanLambert♥1,∗ JacobMorrison♥1 ValentinaPyatkin♥1,2 ShengyiHuang♥1 HamishIvison♥1,2

内森·兰伯特♥1,*雅各布·莫里森♥1 瓦伦蒂娜·皮特金♥1,2 黄圣依♥1 哈米什·艾维森♥1,2

Faeze Brahman♥1 Lester James V. Miranda♥1

Alisa Liu2 Nouha Dziri1 Xinxi Lyu1 Yuling Gu1 Saumya Malik1 Victoria Graf2 Jena D. Hwang1

Alisa Liu2 Nouha Dziri1 Xinxi Lyu1 Yuling Gu1 Saumya Malik1 Victoria Graf2 Jena D. Hwang1

Jiangjiang Yang1 Ronan Le Bras1 Oyvind Tafjord1 Chris Wilhelm1

杨江江1 罗南·勒·布拉斯1 奥伊文德·塔峡湾1 克里斯·威廉1

Luca Soldaini1 Noah A. Smith1,2 Yizhong Wang1,2 Pradeep Dasigi1 Hannaneh Hajishirzi1,2

卢卡·索尔代尼1 诺亚·A·史密斯1,2 王一中1,2 普拉迪普·达西吉1 汉娜·哈吉什尔兹1,2

1Allen Institute for AI, 2University of Washington

∗Tülu 3 was a team effort. ♥marks core contributors. See full author contributions here. Contact tulu@allenai.org.

＊Tülu 3 是团队的努力. ♥标记核心贡献者.请在此处查看完整的作者贡献.请联系 tulu@allenai.org.

Tulu 3 8B: Llama-3.1-Tulu-3-8B Tulu 3 70B: Llama-3.1-Tulu-3-70B Tulu 3 405B: Llama-3.1-Tulu-3-405B Tulu 3 Data: tulu-3-datasets-673b8df14442393f7213f372 Tulu 3 Code: open-instruct Tülu 3 Eval: olmes Demo: playground.allenai.org

Abstract

arXiv:2411.15124v5  [cs.CL]  14 Apr 2025

Language model post-training is applied to refine behaviors and unlock new skills across a wide range of language models, but open recipes for applying these techniques lag behind proprietary ones. The underlying training data and recipes for post-training are simultaneously the most important pieces of the puzzle and the portion with the least transparency. To bridge this gap, we introduce Tülu 3, a family of fully-open state-of-the-art post-trained models, alongside its data, code, and training recipes, serving as a comprehensive guide for modern post-training techniques. Tülu 3, which builds on Llama 3.1 base models, achieves results surpassing the instruct versions of Llama 3.1, Qwen 2.5, Mistral, and even closed models such as GPT-4o-mini and Claude 3.5-Haiku. The training algorithms for our models include supervised finetuning (SFT), Direct Preference Optimization (DPO), and a novel method we call Reinforcement Learning with Verifiable Rewards (RLVR). With Tülu 3, we build a multi-task evaluation scheme for post-training with development and unseen evaluations, standard benchmark implementations, and substantial decontamination of existing open datasets on said benchmarks. We conclude with analysis and discussion of training methods that did not reliably improve performance. The Tülu 3 release includes model weights, a demo, and the complete recipe — datasets for diverse core skills, a robust toolkit for data curation and evaluation, the training code and infrastructure, and, most importantly, a detailed report for reproducing and further adapting the Tülu 3 approach to more domains.

语言模型后训练用于改进各种语言模型的行为并解锁新技能,但应用这些技术的开放方法落后于专有技术.底层训练数据和训练后的配方既是难题中最重要的部分,也是透明度最低的部分.为了弥补这一差距,我们引入了 Tülu 3,这是一系列完全开放的最先进的训练后模型及其数据、代码和训练方法,可作为现代训练后技术的综合指南. Tülu 3 基于 Llama 3.1 基础模型构建,取得的成绩超越了 Llama 3.1、Qwen 2.5、Mistral 的指令版本,甚至超越了 GPT-4o-mini 和 Claude 3.5-Haiku 等封闭模型.我们模型的训练算法包括监督微调 (SFT)、直接偏好优化 (DPO) 和一种我们称为可验证奖励强化学习 (RLVR) 的新颖方法.通过 Tülu 3,我们为训练后构建了一个多任务评估方案,包括开发和未见过的评估、标准基准实施以及对所述基准上现有开放数据集的大量净化.最后,我们对无法可靠提高绩效的培训方法进行了分析和讨论. Tülu 3 版本包括模型权重、演示和完整的配方 - 用于不同核心技能的数据集、用于数据管理和评估的强大工具包、训练代码和基础设施,以及最重要的一份详细报告,用于复制和进一步调整 Tülu 3 方法以适应更多领域.

1

<!-- page 2 of 82 -->

Contents

1 Introduction 5 · 简介5

2 Tülu 3 Overview 7 2.1 Tülu 3 Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7 2.2 Tülu 3 Evaluation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8 2.3 Tülu 3 Recipe . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8 2.4 Evaluation and Results . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11

2 Tülu 3 概述 7 2.1 Tülu 3 数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7 2.2 Tülu 3 评价. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8 2.3 图鲁 3 配方. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8 2.4 评估和结果. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11

3 Tülu 3 Data 11 3.1 Prompt Curation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11 3.1.1 Sourcing from Public Datasets . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11 3.1.2 Synthesizing for Target Skills . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13 3.2 Prompt Decontamination . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14

3 Tülu 3 数据 11 3.1 及时管理. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11 3.1.1 源自公共数据集. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11 3.1.2 目标技能综合. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13 3.2 及时净化. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14

4 Supervised Finetuning 15 4.1 SFT Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15 4.1.1 From Prompts to SFT Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15 4.1.2 The Tülu 3 SFT Mix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16 4.2 Key Data Experiments . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16 4.3 SFT Recipe and Analyses. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18 4.3.1 Key Training Experiments . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18 4.3.2 Batch Aggregation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19

4 有监督微调 15 4.1 SFT 数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15 4.1.1 从提示到SFT数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15 4.1.2 Tülu 3 SFT 混合. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16 4.2 关键数据实验. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16 4.3 SFT 配方和分析. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18 4.3.1 关键训练实验. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18 4.3.2 批量聚合. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19

5 Preference Finetuning 20 5.1 Background . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20 5.1.1 Setup . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20 5.1.2 Policy Optimization . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2 Tülu 3 Preference Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2.1 From Prompts to Preference Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2.2 The Tülu 3 Preference Mix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22 5.3 Key Findings of Data Ablations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23 5.4 Preference Tuning Recipe and Analyses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27 5.4.1 Hyperparameter and Algorithm Design . . . . . . . . . . . . . . . . . . . . . . . . . . 27 5.4.2 Infrastructure for Scaling DPO . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 29

5 偏好微调 20 5.1 背景. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20 5.1.1 设置. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20 5.1.2 政策优化. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2 Tülu 3 偏好数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2.1 从提示到偏好数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21 5.2.2 Tülu 3 偏好组合. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22 5.3 数据消融的主要发现. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23 5.4 偏好调整方法和分析. . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27 5.4.1 超参数和算法设计. . . . . . . . . . . . . . . . . . . . . . . . . . 27 5.4.2 用于扩展 DPO 的基础设施. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 29

6 Reinforcement Learning with Verifiable Rewards 30 6.1 RLVR Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 31 6.2 RLVR Recipe and Analyses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32 6.2.1 Key Findings . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 33 6.3 RLVR Infrastructure . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34 6.4 Final Experimental Results . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35

6 具有可验证奖励的强化学习 30 6.1 RLVR 数据. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 31 6.2 RLVR 配方和分析. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32 6.2.1 主要发现. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 33 6.3 RLVR 基础设施. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34 6.4 最终实验结果. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35

7 Tülu 3 Evaluation Framework 36 7.1 Open Language Model Evaluation System (OLMES) . . . . . . . . . . . . . . . . . . . . . . . 37 7.2 Tülu 3 Evaluation Suite - Development . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38 7.2.1 Safety Evaluation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 39 7.3 Tülu 3 Evaluation Suite - Unseen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 40 7.3.1 New Evaluation: IFEval-OOD . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 42 7.3.2 New Evaluation: HREF . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 43 7.4 Evaluating the Development Process Using the Unseen Suite . . . . . . . . . . . . . . . . . 44 7.4.1 Evaluating the design decisions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44 7.4.2 Comparison with public models . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 45

7 Tülu 3 评估框架 36 7.1 开放语言模型评估系统（OLMES）. . . . . . . . . . . . . . . . . . . . . . . 37 7.2 Tülu 3 评估套件 - 开发. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38 7.2.1 安全评价. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 39 7.3 Tülu 3 评估套件 - 看不见. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 40 7.3.1 新评估：IFEval-OOD. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 42 7.3.2 新评估：HREF. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 43 7.4 使用 Unseen Suite 评估开发过程. . . . . . . . . . . . . . . . . 44 7.4.1 评估设计决策. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44 7.4.2 与公共模型的比较. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 45

8 Discussions 46 · 讨论 46

2

<!-- page 3 of 82 -->

8.1 Scaling Tülu 3 Recipe to Llama 3.1 405B . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 46 8.2 Insights from the Unfruitful . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48 8.3 Future Work . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49

8.1 将 Tülu 3 配方缩放为 Llama 3.1 405B. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 46 8.2 来自无成果者的见解. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48 8.3 未来的工作. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49

9 Related Work 49 9.1 The Evolution of Post-training Recipes . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49 9.2 Training on Verifiable Rewards . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50

9 相关工作 49 9.1 培训后食谱的演变. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49 9.2 可验证奖励培训. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50

10 Conclusion 50 · 结论50

A Additional Hyperparameters 60 · 附加超参数 60

B Additional Dataset Analyses 60 B.1 Extra Distribution Plots . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.2 Contamination in Public Datasets . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.3 Chat Template Implementation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.4 RLVR IFEval overoptimization . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60

B 附加数据集分析 60 B.1 附加分布图. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.2 公共数据集中的污染. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.3 聊天模板实施. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60 B.4 RLVR IFEval 过度优化. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60

C Supervised Finetuning Data Details 61 C.1 Prompts . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 61

D Preference Tuning Data Details 61 · 首选项调整数据详细信息 61

E Additional RLVR Details 61 E.1 Testing Generalization to Target Evaluations . . . . . . . . . . . . . . . . . . . . . . . . . . 61 E.2 RM Training Hyperparameters . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62

E RLVR 附加详细信息 61 E.1 目标评估的测试泛化. . . . . . . . . . . . . . . . . . . . . . . . . . 61 E.2 RM 训练超参数. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62

F Evaluation Details 62 F.1 Detailed Safety Results . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62 F.2 Evaluation principles . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62 F.3 IFEval Out-of-Distribution Constraints . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 79 F.4 Subtask-level breakdown of HREF results . . . . . . . . . . . . . . . . . . . . . . . . . . . . 81

F 评估详细信息 62 F.1 详细的安全结果. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62 F.2 评价原则. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62 F.3 IFEval 分布外约束. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 79 F.4 HREF 结果的子任务级细分. . . . . . . . . . . . . . . . . . . . . . . . . . . . 81

3

<!-- page 4 of 82 -->

Table 1 Models, datasets, and code released with Tülu 3. Demo: https://playground.allenai.org/

Model Checkpoints

Stage Llama 3.1 8B Llama 3.1 70B Base Model meta-llama/Llama-3.1-8B meta-llama/Llama-3.1-70B SFT allenai/Llama-3.1-Tulu-3-8B-SFT allenai/Llama-3.1-Tulu-3-70B-SFT DPO allenai/Llama-3.1-Tulu-3-8B-DPO allenai/Llama-3.1-Tulu-3-70B-DPO

阶段 Llama 3.1 8B Llama 3.1 70B 基本型号 meta-llama/Llama-3.1-8B meta-llama/Llama-3.1-70B SFT allenai/Llama-3.1-Tulu-3-8B-SFT allenai/Llama-3.1-Tulu-3-70B-SFT DPO阿勒奈/Llama-3.1-Tulu-3-8B-DPO 阿勒奈/Llama-3.1-Tulu-3-70B-DPO

allenai/Llama-3.1-Tulu-3-70B

Final Model (RLVR) allenai/Llama-3.1-Tulu-3-8B RM: allenai/Llama-3.1-Tulu-3-8B-RM

最终模型 (RLVR) allenai/Llama-3.1-Tulu-3-8B RM: allenai/Llama-3.1-Tulu-3-8B-RM

Stage Llama 3.1 405B Base Model meta-llama/Llama-3.1-405B SFT allenai/Llama-3.1-Tulu-3-405B-SFT DPO allenai/Llama-3.1-Tulu-3-405B-DPO Final Model (RLVR) allenai/Llama-3.1-Tulu-3-405B RM: Same as 8B/70B

阶段 Llama 3.1 405B 基本模型 meta-llama/Llama-3.1-405B SFT allenai/Llama-3.1-Tulu-3-405B-SFT DPO allenai/Llama-3.1-Tulu-3-405B-DPO 最终模型 (RLVR) allenai/Llama-3.1-Tulu-3-405B RM：与8B/70B

Codebases / Tools

Type Link Training allenai/open-instruct Tülu 3 Eval allenai/olmes Decontamination allenai/open-instruct/tree/main/decontamination Preference Data Inference allenai/birr

类型链接 训练 allenai/open-instruct Tülu 3 评估 allenai/olmes 去污 allenai/open-instruct/tree/main/去污 偏好数据推理 allenai/birr

Instruction Datasets

Type Domain Link Full mix General allenai/tulu-3-sft-mixture

类型 域链接 完整混合 通用 allenai/tulu-3-sft-mix

Task Specific Precise Instruction Following allenai/tulu-3-sft-personas-instruction-following

任务特定精确指令遵循 allenai/tulu-3-sft-personas-instruction-following

Subsets MATH allenai/tulu-3-sft-personas-math Grade School Math allenai/tulu-3-sft-personas-math-grade Python Code allenai/tulu-3-sft-personas-code

子集 数学 allenai/tulu-3-sft-personas-math 小学数学 allenai/tulu-3-sft-personas-math-grade Python 代码 allenai/tulu-3-sft-personas-code

Preference Mixes

Model Link Llama 3.1 405B allenai/llama-3.1-tulu-3-405b-preference-mixture Llama 3.1 70B allenai/llama-3.1-tulu-3-70b-preference-mixture Llama 3.1 8B allenai/llama-3.1-tulu-3-8b-preference-mixture

模型链接 Llama 3.1 405B allenai/llama-3.1-tulu-3-405b-preference-mixture Llama 3.1 70B allenai/llama-3.1-tulu-3-70b-preference-mixture Llama 3.1 8B allenai/llama-3.1-tulu-3-8b-preference-mixture

Specific Preference Datasets

Domain Link Precise Instruction Following allenai/tulu-3-pref-personas-instruction-following General allenai/tulu-3-sft-prompts-ultrafeedback General allenai/tulu-3-wildchat-ultrafeedback

域链接精确指令 遵循 allenai/tulu-3-pref-personas-instruction-follow 常规 allenai/tulu-3-sft-prompts-ultrafeedback 常规 allenai/tulu-3-wildchat-ultrafeedback

RL with Verifiable Rewards Training Datasets

Domain Link Full Mix allenai/RLVR-GSM-MATH-IF-Mixed-Constraints GSM Only allenai/RLVR-GSM MATH Only allenai/RLVR-MATH IFeval Only allenai/RLVR-IFeval

域链接完全混合 allenai/RLVR-GSM-MATH-IF-混合约束 仅 GSM allenai/RLVR-GSM MATH 仅 allenai/RLVR-MATH IFeval 仅 allenai/RLVR-IFeval

4

<!-- page 5 of 82 -->

Curate prompts

Supervised finetuning Direct pref. optimization

RL with verifiable rewards

public datasets

data mixing

prompts with verifiable rewards

on-policy data off-policy data

persona-driven synthetic instructions

Base Model Tülu3-SFT Tülu3-DPO Tülu3

decontaminate

knowledge reasoning math

development evals

coding chat safety

Build evaluation suite

unseen evals

Identify core skills

Figure 1 An overview of the Tülu 3 recipe. This includes: data curation targeting general and target capabilities, training strategies and a standardized evaluation suite for development and final evaluation stage.

1 Introduction · 引言

“Just as the camel shares its burdens with others in the caravan, the wise share their insights to lighten the

“正如骆驼与商队中的其他人分担重担一样,智者分享他们的见解以减轻负担

load of ignorance.” – Proverb generated by Tülu 3.

Post-training — the collection of techniques including instruction tuning, reinforcement learning from human feedback, and other types of finetuning — has become a crucial step in building frontier language models (OpenAI, 2024; Anthropic, 2024), yet developments to these techniques are frequently not accompanied by open resources and recipes. Fully open source counterparts (e.g., Tülu 2 (Ivison et al., 2023) and Zephyr-β (Tunstall et al., 2023)) often rely on simpler-to-implement and cheaper pipelines and have become outdated on many metrics.

后期训练——包括指令调整、来自人类反馈的强化学习和其他类型的微调在内的技术集合——已成为构建前沿语言模型的关键步骤（OpenAI,2024；Anthropic,2024）,但这些技术的发展往往没有伴随开放资源和秘诀.完全开源的对应方案（例如,Tülu 2（Ivison 等人,2023）和 Zephyr-β（Tunstall 等人,2023））通常依赖于更易于实现和更便宜的管道,并且在许多指标上已经过时.

To close the gap between open and closed post training, we introduce Tülu1 3, a family of open state-of- the-art post-trained models, alongside all of the data, training recipes, code, infrastructure, and evaluation framework. Integrating partial details from proprietary methods with novel techniques and established academic research, Tülu 3 pushes the boundaries of research in post-training. The advancements of Tülu 3 are attributed to Tülu 3 Data, new permissively licensed training datasets targeting core skills, Tülu 3 Eval, an evaluation suite and tools to establish clear performance goals and guide improvement through training stages, and Tülu 3 Recipe, an advanced multi-stage training pipeline incorporating new algorithmic advancements in reinforcement learning, cutting-edge infrastructure, and rigorous experimentation to optimize data mixes, methods, and parameters across various training stages.

为了缩小开放式和封闭式后期培训之间的差距,我们引入了 Tülu1 3,这是一系列开放式最先进的后期培训模型,以及所有数据、培训配方、代码、基础设施和评估框架. Tülu 3 将专有方法的部分细节与新技术和既定的学术研究相结合,突破了培训后研究的界限. Tülu 3 的进步归功于 Tülu 3 Data（针对核心技能的新许可许可训练数据集）、Tülu 3 Eval（一种评估套件和工具,用于建立明确的性能目标并指导整个训练阶段的改进）以及 Tülu 3 Recipe（一种先进的多阶段训练管道）,它结合了强化学习、尖端基础设施和严格实验方面的新算法进步,以优化各个训练阶段的数据混合、方法和参数.

In order to build Tülu 3, we identify a set of core skills to improve after training (e.g., reasoning, math, coding, safety, precise instruction following, knowledge recall, etc.) and build an evaluation framework to establish clear performance goals and guide model improvement over a selection of development and unseen tasks. Tülu 3 benefits significantly from leveraging publicly available open data, generating diverse, skill-specific synthetic data at various training stages, and aggressively decontaminating them against our evaluation suite.

为了构建 Tülu 3,我们确定了一组在训练后需要改进的核心技能（例如推理、数学、编码、安全性、精确的指令遵循、知识回忆等）,并构建了一个评估框架来建立明确的性能目标,并指导模型针对一系列开发和未见任务的改进. Tülu 3 受益于利用公开可用的开放数据、在各个训练阶段生成多样化的、特定于技能的合成数据,并根据我们的评估套件积极地净化它们.

The Tülu 3 training recipe involves multiple stages, with each stage building upon the previous model and focusing on different types of data — namely, prompt-completion instances for supervised finetuning, preferences for preference tuning, or verifiable rewards for reinforcement learning. Our methodology facilitates identifying skill deficiencies and refining the data mix, methods and parameters, ensuring a balanced performance of core skills across the training process. Through rigorous, principled experimentation, we determine the best data mix for supervised finetuning, resulting in the Tülu 3 SFT checkpoint. Leveraging recent advances in preference tuning, we then train a model over carefully curated on-policy preference data from comparing Tülu 3 SFT completions against outputs from other language models. Furthermore, we introduce a new final finetuning stage – Reinforcement Learning with Verifiable Rewards (RLVR) - which employs a novel

Tülu 3 训练方案涉及多个阶段,每个阶段都建立在之前的模型之上,并专注于不同类型的数据,即用于监督微调的提示完成实例、用于偏好调整的偏好或用于强化学习的可验证奖励.我们的方法有助于识别技能缺陷并完善数据组合、方法和参数,确保整个培训过程中核心技能的平衡表现.通过严格、有原则的实验,我们确定了监督微调的最佳数据组合,从而产生了 Tülu 3 SFT 检查点.利用偏好调整方面的最新进展,我们通过将 Tülu 3 SFT 补全与其他语言模型的输出进行比较,在精心策划的策略偏好数据上训练模型.此外,我们引入了一个新的最终微调阶段——具有可验证奖励的强化学习（RLVR）——它采用了一种新颖的方法

1A tülu is a hybrid camel bred between Bactrian camel and dromedary: https://en.wikipedia.org/wiki/Hybrid_camel.

1A tülu 是双峰驼和单峰骆驼的杂交骆驼：https://en.wikipedia.org/wiki/Hybrid_camel.

5

<!-- page 6 of 82 -->

Claude

Tülu 3

GPT-3.5

GPT-4o

Skill Benchmark(eval) Tülu 3 8B

70B

Turbo

Mini

Qwen 2.5 7B Instruct

Llama 3.1 8B Instruct

Qwen 2.5 72B Instruct

Llama 3.1 70B Instruct

3.5 Haiku · 俳句

Avg. 65.1 66.5 62.9 76.2 72.8 74.1 64.7 69.6 75.3

Knowledge MMLU(0 shot, CoT) 68.2 76.6 71.2 83.1 85.5 85.3 70.2 82.2 81.8

PopQA(15 shot) 29.1 18.1 20.2 46.5 30.6 46.4 45.0 39.0 42.5

TruthfulQA(6 shot) 55.0 63.1 55.1 67.6 69.9 66.8 62.9♢ 64.8♢ 64.9♢

Reasoning BigBenchHard(3 shot, CoT) 69.0 70.2 71.9 85.0 80.4 83.0 66.6⊤ 65.9♢ 73.7⊤

DROP(3 shot) 62.6 54.4 61.5 74.3 34.2 77.0 70.2 36.3 78.4

Math MATH(4 shot CoT, Flex) 43.7 69.9 42.5 63.0 75.9 56.4 41.2 67.9 68.0

GSM8K(8 shot, CoT) 87.6 83.8 83.4 93.5 89.5 93.7 74.3 83.0 90.1

Coding HumanEval(pass@10) 83.9 93.1 86.3 92.4 94.0 93.6 87.1 90.4 90.8

HumanEval+(pass@10) 79.2 89.7 82.9 88.0 90.8 89.5 84.0 87.0 88.1

IF & chat IFEval(prompt loose) 82.4 74.7 80.6 83.2 87.6 88.0 66.9 83.5 86.3

AlpacaEval 2(LC % win) 34.5 29.0 24.2 49.8 47.7 33.4 38.7 49.7 47.3

Safety Safety(6 task avg.) 85.5 75.0 75.2 88.3 87.0 76.5 69.1 84.9 91.8

Table 2 Overview of results on Tülu 3 Eval suite, over both 8B and 70B models. The best performing model for each model size on each benchmark is bolded. Tülu 3 outperforms the state-of-the-art post-trained open-weight models of the same size and surpass Claude Haiku, GPT-3.5 Turbo, and GPT-4o Mini. ⊤indicates scores taken from Claude 3 Model Card and Claude 3.5 Model Card Addendum. ♢indicates score interpolated with Multiple Imputation by Chained Equations (MICE) with context of all other scores in the table, except averages. These scores were either subject to substantial formatting errors in our evaluation suite or not found in other major technical reports. Instruct versions of models shortened to Inst. Closed model versions: GPT-3.5-Turbo-0125, GPT-4o-mini-2024-07-18, Claude 3.5 Haiku 20241022

RL objective tailored to enhance specific skills with verifiable answers, such as mathematics and precise instruction following.

强化学习目标旨在通过可验证的答案来增强特定技能,例如数学和精确的指令遵循.

Our best performing recipe yields Tülu 3 models that outperform the state-of-the-art post-trained open-weight models of the same size such as Llama 3.1 Instruct (Dubey et al., 2024) or Mistral-Instruct (Mistral AI, 2024), and at the large 70B size Tülu matches the offerings of closed providers such as Claude 3.5 Haiku and GPT-4o mini. Furthermore, at 405B size our model performs competitively against DeepSeek v3 (DeepSeek-AI et al., 2024) and GPT 4o (11-24).

我们性能最佳的配方产生了 Tülu 3 模型,其性能优于相同尺寸的最先进的后训练开放重量模型,例如 Llama 3.1 Instruct（Dubey 等人,2024）或 Mistral-Instruct（Mistral AI,2024）,并且在大型 70B 尺寸下,Tülu 与封闭提供商的产品相匹配,例如 Claude 3.5 Haiku 和 GPT-4o迷你.此外,在 405B 大小下,我们的模型与 DeepSeek v3 (DeepSeek-AI et al., 2024) 和 GPT 4o (11-24) 相比具有竞争力.

In summary, Tülu 3 represents a family of state-of-the-art open language models, featuring a modern post-training framework with fully open-source data Tülu 3 Data, evaluation Tülu 3 Eval, training code Tülu 3 Code and development recipes Tülu 3 Recipe. Here are a few key contributions from the development of Tülu:

总之,Tülu 3 代表了一系列最先进的开放语言模型,具有现代后训练框架,具有完全开源的数据 Tülu 3 Data、评估 Tülu 3 Eval、训练代码 Tülu 3 Code 和开发配方 Tülu 3 Recipe.以下是 Tülu 开发的一些关键贡献：

• Extensive guidance and tooling for evaluation, decontamination, and recipe design,

• 用于评估、净化和配方设计的广泛指导和工具,

• Scaled, new synthetic instruction datasets,

• Scaling preference data with on-policy generations,

• Reinforcement learning with verifiable rewards, an RL-based method that only gets a reward if the model’s completions are verified to be correct, and

• 具有可验证奖励的强化学习,这是一种基于强化学习的方法,只有在模型完成情况被验证正确时才会获得奖励,以及

• Advanced infrastructure, details, and code to facilitate the successful implementation of large models.

• 先进的基础设施、细节和代码,以促进大型模型的成功实施.

The result of our work is completely open pipelines for finetuning language models. We release final models trained on Llama 3.1 base versions (Dubey et al., 2024), with intermediate checkpoints, training data, training code, and evaluation code (a full list of artifacts released is available in Table 1). With all the released resources, others can take open base models and finetune them to high-performance on any task of interest – laying the foundation of post-training research within complex, multi-objective and multi-stage training

我们的工作成果是完全开放的用于微调语言模型的管道.我们发布了在 Llama 3.1 基础版本（Dubey 等人,2024 年）上训练的最终模型,其中包含中间检查点、训练数据、训练代码和评估代码（表 1 中提供了已发布工件的完整列表）.利用所有已发布的资源,其他人可以采用开放基础模型并将其微调到任何感兴趣的任务上的高性能——为复杂、多目标和多阶段训练中的训练后研究奠定基础

regimes.

6

<!-- page 7 of 82 -->

Core Skill Development Unseen

Knowledge MMLU(em) MMLU-Pro(em) PopQA(EM) GPQA(em) TruthfulQA(MC2 em) Reasoning BigBenchHard(em) AGIEval English(em) DROP(F1) Math MATH(flex em) Deepmind Mathematics(em) GSM8K(em) Coding HumanEval(Pass@10) BigcodeBench(Pass@10) HumanEval+(Pass@10) Instruction Following (IF) IFEval(em) IFEval-OOD(Pass@1) AlpacaEval 2(winrate) HREF(winrate) Safety Tülu 3 Safety(avg*)

知识 MMLU(em) MMLU-Pro(em) PopQA(EM) GPQA(em) TruthfulQA(MC2 em) 推理 BigBenchHard(em) AGIEval 英语(em) DROP(F1) 数学 MATH(flex em) Deepmind 数学(em) GSM8K(em) 编码 HumanEval(Pass@10) BigcodeBench(Pass@10) HumanEval+(Pass@10) 指令遵循(IF) IFEval(em) IFEval-OOD(Pass@1) AlpacaEval 2(胜率) HREF(胜率) 安全性 Tülu 3 安全性(平均*)

Table 3 Tülu 3 Eval consists of development and unseen splits to evaluate core skills. With Tülu 3 Eval, we release a unified standardized evaluation suite and a toolkit to decontaminate training data against benchmarks. The subscript shows the metric we use for evaluation. Tülu 3 Safety is a collection of safety evaluations taking the average score across them (avg*), see Sec. 7.2.1 for details.

2 Tülu 3 Overview · Tülu 3 概览

Early work in language model post-training followed a standard recipe pioneered by models like Instruct- GPT (Ouyang et al., 2022), consisting of instruction-tuning followed by preference finetuning (PreFT) (Stiennon et al., 2020; Nakano et al., 2021; Askell et al., 2021; Ouyang et al., 2022). Since then, the sophistication and complexity of post-training approaches have continued to increase, moving towards multiple rounds of training, human data plus synthetic data, and multiple training algorithms and objectives (Touvron et al., 2023; Dubey et al., 2024; Gunter et al., 2024). However, most successful post-training models offer limited information about their training data, code, or recipes.2 Open post-training research, such as Tülu 2 (Ivison et al., 2023) and Zephyr-β (Tunstall et al., 2023), show strong results in some benchmarks and on chat evaluations such as AlpacaEval or Arena-Hard (Li et al., 2024a), but still lag behind in core capabilities such as MATH (Hendrycks et al., 2021), IFEval (Zhou et al., 2023) and GSM8K (Cobbe et al., 2021).

语言模型训练后的早期工作遵循 Instruct-GPT (Ouyang et al., 2022) 等模型开创的标准配方,包括指令调整和偏好微调 (PreFT) (Stiennon et al., 2020; Nakano et al., 2021; Askell et al., 2021; Ouyang et al., 2022).从那时起,训练后方法的复杂性不断增加,转向多轮训练、人类数据加合成数据以及多种训练算法和目标（Touvron et al., 2023; Dubey et al., 2024; Gunter et al., 2024）.然而,大多数成功的训练后模型提供的关于其训练数据、代码或配方的信息有限.2开放式训练后研究,例如 Tülu 2（Ivison 等人,2023）和 Zephyr-β（Tunstall 等人,2023）,在一些基准测试和聊天评估（例如 AlpacaEval 或 Arena-Hard）（Li 等人,2024a）中显示出强劲的结果,但在MATH（Hendrycks 等人,2021）、IFEval（Zhou 等人,2023）和 GSM8K（Cobbe 等人,2021）等核心功能.

Tülu 3 pushes the boundaries of research in post-training and closes the gap between open and closed finetuning recipes. With Tülu 3, we hope to uncover which paths for the open-source community will lead to success and which do not (by reporting negative results). It is a complex training process that integrates partial details from proprietary methods with novel techniques and combines it with established academic research. The key factors in the success of Tülu 3 are careful data curation, rigorous experimentation and evaluation, innovative methodologies, and improved training infrastructure. We followed systematic guidelines by scientifically evaluating this process through creating development and test sets for evaluation, and conduct careful decontamination of publicly available datasets.

Tülu 3 突破了训练后研究的界限,缩小了开放式和封闭式微调方法之间的差距.通过 Tülu 3,我们希望揭示开源社区的哪些路径将导致成功,哪些路径不会（通过报告负面结果）.这是一个复杂的培训过程,将专有方法的部分细节与新技术相结合,并将其与既定的学术研究相结合. Tülu 3 成功的关键因素是仔细的数据管理、严格的实验和评估、创新的方法以及改进的培训基础设施.我们遵循系统指南,通过创建用于评估的开发和测试集来科学地评估这一过程,并对公开的数据集进行仔细的净化.

Tülu 3 is not just an artifact, but a comprehensive suite of data and tools designed to advance the frontier of open post-training. By openly sharing our data, recipe and findings, we aim to empower the community to explore new and innovative post-training approaches. We list the extensive artifacts and tools released in Table 1.

Tülu 3 不仅仅是一个神器,而且是一套全面的数据和工具,旨在推进开放式后培训的前沿.通过公开分享我们的数据、配方和发现,我们的目标是让社区能够探索新的、创新的培训后方法.我们在表 1 中列出了发布的大量工件和工具.

2.1 Tülu 3 Data · 图鲁3数据

The Tülu 3 effort began with identifying key areas where open post-training recipes often fall behind and that are desirable capabilities for generalist language models. Table 3 outlines the core capabilities we aim to

Tülu 3 的工作首先是确定开放式训练后方法经常落后的关键领域,而这些领域是通才语言模型所需的功能.表 3 概述了我们目标的核心能力

2On LMSYS’s ChatBotArena, no model in the top 50 (as of November 20th, 2024) has released its post-training data (Chiang et al., 2024).

2在 LMSYS 的 ChatBotArena 上,前 50 名（截至 2024 年 11 月 20 日）的模型没有发布其训练后数据（Chiang et al., 2024）.

7

<!-- page 8 of 82 -->

Llama 3.1

Deepseek

Tülu 3 405B

Tülu 3 405B

Tülu 3 405B

Nous Hermes 3

Benchmark(eval)

V3

GPT 4o (11-24)

SFT

DPO

RLVR

405B Instruct

405B

Avg w/o Safety. 78.1 74.4 79.0 80.5 76.3 79.0 80.0

Avg w/ Safety. 79.0 73.5 75.9 81.6 77.5 79.6 80.7

MMLU(5 shot, CoT) 88.0 84.9 82.1 87.9 84.4 86.6 87.0

PopQA(3 shot) 52.9 54.2 44.9 53.6 55.7 55.4 55.5

BigBenchHard(0 shot, CoT) 87.1 87.7 89.5 83.3 88.0 88.8 88.6

MATH(4 shot, Flex) 66.6 58.4 72.5 68.8 63.4 59.9 67.3

GSM8K(8 shot, CoT) 95.4 92.7 94.1 91.7 93.6 94.2 95.5

HumanEval(pass@10) 95.9 92.3 94.6 97.0 95.7 97.2 95.9

HumanEval+(pass@10) 90.3 86.9 91.6 92.7 93.3 93.9 92.9

IFEval(loose prompt) 88.4 81.9 88.0 84.8 82.4 85.0 86.0

AlpacaEval 2(LC % win) 38.5 30.2 53.5 65.0 30.4 49.8 51.4

Safety(6 task avg.) 86.8 65.8 72.2 90.9 87.7 85.5 86.7

Table 4 Summary of Tülu 3 results relative to peer 405B models. The best-performing model on each benchmark (i.e., in each row) is bolded. Tülu 3-405B outperforms prior state-of-the-art models finetuned from Llama 3.1 405B

Base and rivals some leading, closed models. Progress across various checkpoints highlight the contribution of each stage of the training in improving core skills. Note that TruthfulQA and MMLU multiple choice numbers are not compatible with our infrastructure for running evaluations (via log-probs).

一些领先的封闭模型的基础和竞争对手.各个检查点的进展突显了培训每个阶段对提高核心技能的贡献.请注意,TruthfulQA 和 MMLU 多项选择数字与我们用于运行评估的基础设施（通过日志概率）不兼容.

enhance and the evaluation benchmarks selected to cover these skills. With Tülu 3, we focus on core skills of knowledge recall, reasoning, mathematics, coding, instruction following, general chat, and safety.

增强并选择涵盖这些技能的评估基准.在 Tülu 3 中,我们专注于知识回忆、推理、数学、编码、指令遵循、一般聊天和安全等核心技能.

We curate and collect Tülu 3 Data to target these core skills by sourcing from public data and synthetically

我们通过从公共数据中获取并综合来策划和收集 Tülu 3 数据,以针对这些核心技能

curating data. We use various data formats at different stages of training. Table 7 outlines the collection of datasets used to train our model, and further details are provided in Section section 3.

整理数据.我们在训练的不同阶段使用不同的数据格式.表 7 概述了用于训练我们的模型的数据集集合,第 3 节提供了更多详细信息.

2.2 Tülu 3 Evaluation · 图鲁3评测

A key factor in the success of our post-training approach is establishing clear performance goals and evaluation tools to guide improvement. With Tülu 3 Eval, we release a unified, standardized evaluation suite and a toolkit to guide the development of and assessment of final models while decontaminating training data against evaluation benchmarks.

我们的培训后方法成功的关键因素是建立明确的绩效目标和评估工具来指导改进.通过 Tülu 3 Eval,我们发布了统一、标准化的评估套件和工具包,以指导最终模型的开发和评估,同时根据评估基准净化训练数据.

Our framework consists of an open evaluation toolkit for reproducible evaluations (Section 7.1), a suite for evaluating core skills in instruction-tuned models with separate development (Section 7.2) and held-out evaluations (Section 7.3), and a set of recommended settings for evaluating on our evaluation suite based on our experiments with various models. Both splits cover all identified skills, except we have no unseen safety evaluation. Crucially, we did not examine scores on our unseen set when developing our models, allowing us to observe how much we may have overfit to particular evaluations in our decisions around data mixtures, algorithms, and hyperparameters.

我们的框架包括一个用于可重复评估的开放评估工具包（第 7.1 节）、一套用于评估具有单独开发的指令调整模型的核心技能（第 7.2 节）和保留评估（第 7.3 节）,以及一组基于我们对各种模型的实验来评估我们的评估套件的推荐设置.两种划分都涵盖了所有已确定的技能,但我们没有看不见的安全评估.至关重要的是,在开发模型时,我们没有检查看不见的集合上的分数,这使我们能够观察在数据混合、算法和超参数决策中,我们可能对特定评估有多少过度拟合.

Table 3 summarizes our evaluation suite. We provide further details on our evaluations in Section 7 and in Table 24. We publicly release our evaluation suite at https://github.com/allenai/olmes.

2.3 Tülu 3 Recipe · 图鲁 3 食谱

In this section, we provide an overview of the Tülu 3 recipe to obtain a state-of-the-art post-trained model. We produce Tülu 3 models through a four-stage post-training recipe on top of pretrained language models (see Figure 1). The Tülu 3 Recipe is an advanced multi-stage training pipeline incorporating new algorithmic

在本节中,我们概述了 Tülu 3 的配方,以获得最先进的训练后模型.我们通过基于预训练语言模型的四阶段后训练方法生成 Tülu 3 模型（见图 1）. Tülu 3 Recipe 是一个先进的多阶段训练管道,融合了新的算法

advancements in reinforcement learning, cutting-edge infrastructure, and rigorous experimentation to curate data and optimize data mixes, methods, and parameters across various training stages. Throughout all stages, we measure model performance using a carefully-chosen evaluation suite. The stages are as follows:

强化学习、尖端基础设施和严格实验的进步,以管理数据并优化各个训练阶段的数据组合、方法和参数.在所有阶段,我们使用精心选择的评估套件来衡量模型性能.阶段如下：

Stage 1: Data Curation (section 3) We curate a variety of prompts to be allocated across multiple stages of optimization. We create new synthetic prompts or, when available, source prompts from existing

第 1 阶段：数据管理（第 3 部分）我们策划了各种提示,以便在多个优化阶段进行分配.我们创建新的合成提示,或者在可用时从现有提示中获取源提示

8

<!-- page 9 of 82 -->

Hermes

Nemotron

Benchmark(eval)

Llama 3.1

Tülu 3 70B SFT Tülu 3 70B DPO Tülu 3

70B

Llama 3.1 70B Instruct

Qwen 2.5 72B Instruct

3 Llama 3.1 70B · 羊驼3.1 70B

70B

Avg. 74.1 72.8 68.5 72.0 72.6 76.2 76.2

MMLU(0 shot, CoT) 85.3 85.5 80.4 83.8 78.9 83.3 83.1

PopQA(15 shot) 46.4 30.6 48.1 36.4 48.6 46.3 46.5

TruthfulQA(6 shot) 66.8 69.9 66.5 62.6 55.7 67.9 67.6

BigBenchHard(3 shot, CoT) 83.0 80.4 83.6 78.5 82.6 84.8 85.0

DROP(3 shot) 77.0 34.2 73.2 68.8 77.2 74.1 74.3

MATH(4 shot CoT, Flex) 56.4 75.9 41.9 55.0 53.7 62.3 63.0

GSM8K(8 shot, CoT) 93.7 89.5 90.0 84.7 91.1 93.5 93.5

HumanEval(pass@10) 93.6 94.0 89.6 94.1 92.9 92.4 92.4

HumanEval+(pass@10) 89.5 90.8 85.9 85.5 87.3 88.4 88.0

IFEval(prompt loose) 88.0 87.6 76.0 79.9 82.1 82.6 83.2

AlpacaEval 2(LC % win) 33.4 47.7 28.4 66.1 26.3 49.6 49.8

Safety(6 task avg.) 76.5 87.0 57.9 69.0 94.4 89.0 88.3

Table 5 Summary of Tülu 3 results relative to peer 70B models. The best-performing model on each benchmark (i.e., in each row) is bolded. Tülu 3-70B significantly outperforms prior state-of-the-art 70B models. Progress across

various checkpoints highlight the contribution of each stage of the training in improving core skills. Nemotron Llama 3.1 70B is the only model in the table that fine-tuned from another post-trained model (in this case Llama 3.1 70B Instruct), while the others are from their respective base models. Many of the lowest values are caused by failing to follow the few-shot formatting required for the evaluation or other repetitive errors – for more details, see section 7.

各种检查点突出了培训每个阶段对提高核心技能的贡献. Nemotron Llama 3.1 70B 是表中唯一从另一个训练后模型（本例中为 Llama 3.1 70B Instruct）进行微调的模型,而其他模型则来自各自的基础模型.许多最低值是由于未能遵循评估所需的小样本格式或其他重复错误而导致的 - 有关更多详细信息,请参阅第 7 节.

datasets to target specific capabilities. We ensure prompts are not contaminated with our evaluation suite, Tülu 3 Eval.

针对特定功能的数据集.我们确保提示不会被我们的评估套件 Tülu 3 Eval 污染.

Stage 2: Supervised Finetuning (section 4) We perform supervised finetuning (SFT) on carefully selected prompts and completions. With thorough experimentation, the final SFT data and training hyperparameters are determined to enhance target core skills without significantly impacting the performance of others, guided by our evaluation framework.

第 2 阶段：监督微调（第 4 节）我们对精心选择的提示和完成进行监督微调 (SFT).通过彻底的实验,在我们的评估框架的指导下,最终的 SFT 数据和训练超参数被确定为增强目标核心技能,而不会显着影响其他人的表现.

Stage 3: Preference Tuning (section 5) We apply preference tuning, specifically DPO, to newly curated on-policy synthetically created preference data from selected prompts along with off-policy data. As in the SFT stage, we identify the best preference data mix through thorough experimentation, uncovering what formats of data, methods, or hyperparameters lead to improvements.

第 3 阶段：偏好调整（第 5 节）我们将偏好调整（特别是 DPO）应用于新策划的根据所选提示综合创建的策略内偏好数据以及离策略数据.与 SFT 阶段一样,我们通过彻底的实验确定最佳偏好数据组合,揭示哪些格式的数据、方法或超参数可以带来改进.

Stage 4: Reinforcement Learning with Verifiable Rewards (section 6) We introduce a new RL-based post-training stage which trains the model on verifiable rewards instead of a reward model, as is common for traditional RLHF training. We select tasks with verifiable outcomes, such as mathematical problem-solving, and only provide rewards when the model’s generations are verified to be correct. We then use RL to maximize these rewards.

第 4 阶段：具有可验证奖励的强化学习（第 6 节）我们引入了一个新的基于 RL 的后训练阶段,该阶段在可验证奖励上训练模型,而不是传统 RLHF 训练中常见的奖励模型.我们选择具有可验证结果的任务,例如解决数学问题,并且仅在模型的生成被验证正确时才提供奖励.然后我们使用强化学习来最大化这些奖励.

The key contributions of our Tülu 3 pipeline lie in improved data, methods, infrastructure, and rigorous evaluation. Key elements of our pipeline include:

我们的 Tülu 3 管道的主要贡献在于改进的数据、方法、基础设施和严格的评估.我们管道的关键要素包括：

• Data Quality, Provenance, and Scale (§3) We obtain prompts by carefully surveying available open-source datasets, analyzing their provenance, and decontaminating them, as well as curating synthetic prompts that target core skills. To ensure effectiveness, we conduct thorough experiments to study their impact on our development evaluation suite. We find targeted prompts to be influential to improve core skills, while real-world queries, e.g., WildChat (Zhao et al., 2024), are important to improve general chat capabilities. Using the Tülu 3 Eval decontamination tool, we ensure prompts are not contaminated against our evaluation suite.3

• 数据质量、来源和规模(§3) 我们通过仔细调查可用的开源数据集、分析其来源、净化它们以及策划针对核心技能的综合提示来获取提示.为了确保有效性,我们进行了彻底的实验来研究它们对我们的开发评估套件的影响.我们发现有针对性的提示对于提高核心技能具有影响力,而现实世界的查询,例如 WildChat（Zhao 等人,2024）,对于提高一般聊天能力非常重要.使用 Tülu 3 Eval 净化工具,我们确保提示不会受到我们的评估套件的污染.3

• Creating a Multi-Skill SFT Dataset (§4.1) The distribution of the prompts in the “general” and “skill-specific”

• 创建多技能SFT 数据集(§4.1) “一般”和“特定技能”中提示的分布

3We observe a non-trivial amount of contamination in a few open datasets with popular evaluation benchmarks. Details are provided in Table 37.

3我们在一些具有流行评估基准的开放数据集中观察到了大量的污染.详细信息参见表 37.

9

<!-- page 10 of 82 -->

Gemma

Magpie

Benchmark(eval)

8B

Tülu 3 8B SFT Tülu 3 8B DPO Tülu 3 8B

Llama 3.1 8B Instruct

Qwen 2.5 7B Instruct

2 9B Instruct

Minis- tral 8B Instruct

Avg. 62.9 66.5 49.3 60.4 59.6 60.6 64.7 65.1

MMLU(0 shot, CoT) 71.2 76.6 62.0 74.6 68.5 65.9 68.7 68.2

PopQA(15 shot) 20.2 18.1 22.5 28.3 20.2 29.3 29.3 29.1

TruthfulQA(6 shot) 55.1 63.1 57.0 61.4 55.5 46.8 56.1 55.0

BigBenchHard(3 shot, CoT) 71.9 70.2 55.2 64.9 70.8 69.7 68.7 69.0

DROP(3 shot) 61.5 54.4 49.4 58.8 56.2 61.3 62.5 62.6

MATH(4 shot CoT, Flex) 42.5 69.9 5.1 29.8 40.0 31.5 42.0 43.7

GSM8K(8 shot, CoT) 83.4 83.8 61.2 79.7 80.0 76.2 84.3 87.6

HumanEval(pass@10) 86.3 93.1 75.4 71.7 91.0 86.2 83.9 83.9

HumanEval+(pass@10) 82.9 89.7 69.1 67.0 88.5 81.4 78.6 79.2

IFEval(prompt loose) 80.6 74.7 38.8 69.9 56.4 72.8 81.1 82.4

AlpacaEval 2(LC % win) 24.2 29.0 49.0 43.7 31.4 12.4 33.5 34.5

Safety(6 task avg.) 75.2 75.0 46.4 75.5 56.2 93.1 87.2 85.5

Table 6 Summary of Tülu 3 results relative to peer 8B models. The best-performing model on each benchmark (i.e., in each row) is bolded. Tülu 3-8B significantly outperforms prior state-of-the-art 8B models. Progress across various checkpoints highlight the contribution of each stage of the training in improving core skills. Many of the lowest values are caused by failing to follow the few-shot formatting required for the evaluation or other repetitive errors – for more details, see section 7.

categories was refined by several rounds of supervised finetuning on various data mixtures. For example, to improve mathematical reasoning, we first establish an upper bound in our evaluation suite by creating math-specialized models, then mix data to bring the general models closer to this upper bound.

通过对各种数据混合物进行几轮监督微调来细化类别.例如,为了改进数学推理,我们首先通过创建数学专用模型在评估套件中建立上限,然后混合数据以使通用模型更接近该上限.

• Curating an On-Policy Preference Dataset (§5.2) We develop an on-policy data curation pipeline to scale our preference dataset generation. Concretely, we generate completions from Tülu 3-SFT and other models for given prompts, and obtain preference labels through their pairwise comparisons. Our approach extends and improves the off-policy preference data generation method by Cui et al. (2023). Careful multi-skill selection of preference data yields 354,192 instances for preference tuning demonstrating significant improvements in a range of tasks.

• 管理政策偏好数据集（§5.2） 我们开发了政策数据管理管道来扩展我们的偏好数据集生成.具体来说,我们根据给定提示从 Tülu 3-SFT 和其他模型生成补全,并通过它们的成对比较获得偏好标签.我们的方法扩展并改进了 Cui 等人的离策略偏好数据生成方法. （2023）.仔细的多技能偏好数据选择产生了 354,192 个偏好调整实例,展示了一系列任务的显着改进.

• Preference Tuning Algorithm Design (§5.4) We experiment with several preference tuning algorithms and observe improved performance in using length-normalized Direct Preference Optimization. We prioritized simplicity and efficiency in experimentation and used length-normalized DPO throughout the development process and training our final models, in lieu of more costly investigations into RL-based methods, such as PPO.

• 偏好调整算法设计（§5.4） 我们尝试了几种偏好调整算法,并观察到使用长度归一化直接偏好优化的性能有所提高.我们优先考虑实验的简单性和效率,并在整个开发过程中使用长度归一化 DPO 并训练我们的最终模型,而不是对基于 RL 的方法（例如 PPO）进行成本更高的研究.

• Skill-SpecificRLwithVerifiableRewards (§6) We adapt a new approach, leveraging a standard reinforcement- learning paradigm to target skills that can be evaluated against a ground-truth outcome (e.g., Math). We refer to this algorithm as Reinforcement Learning with Verifiable Rewards (RLVR); it obtains a constant reward value if a completion is successful. Our results show that RLVR can improve GSM8K, MATH, and IFEval performance.

• 具有可验证奖励的特定技能强化学习 (§6) 我们采用了一种新方法,利用标准强化学习范式来定位可以根据真实结果（例如数学）进行评估的技能.我们将该算法称为具有可验证奖励的强化学习（RLVR）；如果成功完成,它会获得恒定的奖励值.我们的结果表明,RLVR 可以提高 GSM8K、MATH 和 IFEval 性能.

• Training Infrastructure for Reinforcement Learning (§6.3): We implemented an asynchronous RL setup: we run LLM inference efficiently via vLLM while the learners perform gradient updates concurrently. Our RL codebase is also highly scalable and can train 70B and 405B RLVR policy models.

• 强化学习的训练基础设施（第6.3 节）：我们实现了异步RL 设置：我们通过vLLM 高效运行LLM 推理,同时学习器同时执行梯度更新.我们的 RL 代码库还具有高度可扩展性,可以训练 70B 和 405B RLVR 策略模型.

• Evaluation Framework: Tülu 3 Eval (§7) In addition to evaluating the final models, our evaluation framework is an open evaluation toolkit designed to guide the development progress through carefully selected evaluation suite and tools for decontamination.

• 评估框架：Tülu 3 Eval (§7) 除了评估最终模型之外,我们的评估框架是一个开放的评估工具包,旨在通过精心挑选的评估套件和去污工具来指导开发进度.

10

<!-- page 11 of 82 -->

2.4 Evaluation and Results · 评估与结果

When reporting scores throughout this work, we use the metrics identified in Table 3; higher is better. When

在报告整个工作的分数时,我们使用表 3 中确定的指标；越高越好.什么时候

computing overall performance, we simply average scores across all evaluations, treating each evaluation equally. For generative evaluations our output length is 4096.

计算整体表现时,我们只是简单地平均所有评估的分数,平等地对待每个评估.对于生成评估,我们的输出长度是 4096.

Tülu 3 trained on Llama 3 base models outperforms all other open-weight models in its size category on our development evaluation suite. Compared to closed models, Tülu 3 70B even surpasses closed models such as GPT-3.5-Turbo-0125 or GPT-4o-mini-2024-07-18, while approaching the performance of Claude 3.5 Haiku 20241022. The summary of Tülu 3 trained on Llama 3 at 8 and 70 billion parameters versus the leading models in their size classes is shown in Table 2. A per training stage breakdown of performance is shown for the 8B version in Table 6 and for 70B in Table 5.

在我们的开发评估套件中,在 Llama 3 基础模型上训练的 Tülu 3 优于其大小类别中的所有其他开放权重模型.与封闭模型相比,Tülu 3 70B 甚至超越了 GPT-3.5-Turbo-0125 或 GPT-4o-mini-2024-07-18 等封闭模型,同时接近 Claude 3.5 Haiku 20241022 的性能.表中显示了 Tülu 3 在 Llama 3 上以 8 和 700 亿个参数进行训练的总结及其尺寸类别中的领先模型2. 表 6 中显示了 8B 版本的每个训练阶段性能细分,表 5 中显示了 70B 版本的性能细分.

With our models trained from raw pretrained base models, we compare to instruct models trained on the same

通过从原始预训练基础模型训练我们的模型,我们将与在相同的基础上训练的指导模型进行比较

base models (e.g. Nous Hermes 3), instruct models on similar sized, but different base versions (e.g. Ministral 8B or Qwen 2.5 Instruct), and other finetuning recipes trained on an instruct version (e.g. Nemotron Llama 3.1). At 70B, we compare to and surpass Llama 3.1 70B Instruct, Qwen 2.5 72B Instruct (Qwen Team, 2024), Nous Hermes 3 70B (Teknium et al., 2024) (trained on Llama 3.1 70B), and Nemotron Llama 3.1 70B (Wang et al., 2024c) (trained on Llama 3.1 70B Instruct). At 8B, we compare to and surpass Llama 3.1 8B Instruct, Gemma 2 9B Instruct (Gemma Team et al., 2024), Nous Hermes 3 8B (trained on Llama 3.1 8B), Qwen 2 7B Instruct, and Ministral 8B Instruct 2410.

基础模型（例如 Nous Hermes 3）、大小相似但不同基础版本的指导模型（例如 Ministral 8B 或 Qwen 2.5 Instruct）以及在指导版本上训练的其他微调配方（例如 Nemotron Llama 3.1）.在 70B 上,我们比较并超越了 Llama 3.1 70B Instruct、Qwen 2.5 72B Instruct（Qwen Team,2024）、Nous Hermes 3 70B（Teknium 等人,2024）（在 Llama 3.1 70B 上训练）和 Nemotron Llama 3.1 70B（Wang 等人, 2024c)（在 Llama 3.1 70B Instruct 上进行培训）.在 8B 方面,我们比较并超越了 Llama 3.1 8B Instruct、Gemma 2 9B Instruct（Gemma Team et al., 2024）、Nous Hermes 3 8B（在 Llama 3.1 8B 上训练）、Qwen 2 7B Instruct 和 Ministral 8B Instruct 2410.

Artifacts Released. We release all artifacts associated with the Tülu 3 training recipe – including SFT, DPO, and RL model checkpoints, along with new SFT and DPO datasets. A summary of the artifacts released with Tülu 3 is included in Table 1.

文物已发布.我们发布了与 Tülu 3 训练方案相关的所有工件,包括 SFT、DPO 和 RL 模型检查点,以及新的 SFT 和 DPO 数据集.表 1 总结了随 Tülu 3 发布的工件.

3 Tülu 3 Data · Tülu 3 数据

Prompts represent the diverse ways users may interact with models and serve as the essential component for all post-training stages. We curate an extensive collection of millions of prompts as the starting point of Tülu 3 post-training recipe. Data selected for next stages of training are selected from these prompts. Table 7 summarizes the key information of these prompts. In this section, we describe our prompt curation process and the decontamination effort to ensure that our evaluations are not leaked in these prompts. In the following sections, we describe how prompts are used for supervised finetuning §4 and preference tuning §5.

提示代表了用户与模型交互的多种方式,并作为所有训练后阶段的重要组成部分.我们收集了数百万条提示,作为 Tülu 3 训练后配方的起点.为下一阶段的训练选择的数据是从这些提示中选择的.表 7 总结了这些提示的关键信息.在本节中,我们将描述我们的提示管理流程和净化工作,以确保我们的评估不会在这些提示中泄露.在以下部分中,我们将描述如何使用提示进行监督微调§4 和偏好调整§5.

3.1 Prompt Curation · 及时策展

To target the desired core skills, we curate a diverse and high quality set of prompts from publicly available datasets with clear provenance and synthetically generate prompts to fill any gaps.

为了针对所需的核心技能,我们从具有明确出处的公开数据集中策划了一组多样化且高质量的提示,并综合生成提示来填补任何空白.

3.1.1 Sourcing from Public Datasets · 来自公共数据集的采购

Since the release of our Tülu 2, the community has witnessed a large body of work creating datasets for post-training, in terms of both supervised finetuning and preference tuning. Tülu 3 aims to integrate and extend these resources to build stronger models. We start this process with a broad survey of public datasets, including those annotated by dedicated workers, sourced from real users, and synthesized with models. 4 We then manually review each individual dataset, and pick those with the following considerations.

自 Tülu 2 发布以来,社区见证了在监督微调和偏好调整方面为后期训练创建数据集的大量工作. Tülu 3 旨在整合和扩展这些资源,以构建更强大的模型.我们首先对公共数据集进行广泛调查,包括由专门工作人员注释、来自真实用户并与模型合成的数据集. 4 然后,我们手动检查每个单独的数据集,并根据以下考虑因素选择数据集.

Diversity. The diversity of training data is critical for eliciting models’ generalization, avoiding model forgetting, and making models robust to uncommon inputs (Wang et al., 2022c; Chung et al., 2024; Zhou et al., 2024). We pick datasets that can promote diversity, including: WildChat (Zhao et al., 2024), which is a large source of real-user interaction with models; Open Assistant (Köpf et al., 2024), which is created by volunteer workers for general chatting; No Robots (Rajani et al., 2023), which is annotated by expert workers for a broad range of open-ended categories; and FLAN v2 (Longpre et al., 2023), which is a big compilation of classical NLP tasks. We also include a decontaminated subset of UltraFeedback (Cui et al., 2023), which is

多样性.训练数据的多样性对于引发模型的泛化、避免模型遗忘以及使模型对不常见的输入具有鲁棒性至关重要（Wang et al., 2022c; Chung et al., 2024; Zhou et al., 2024）.我们选择可以促进多样性的数据集,包括： WildChat (Zhao et al., 2024),它是真实用户与模型交互的重要来源； Open Assistant（Köpf et al., 2024）,由志愿者创建,用于一般聊天； No Robots（Rajani 等人,2023）,由专家工作者针对广泛的开放式类别进行注释；和 FLAN v2（Longpre 等人,2023）,它是经典 NLP 任务的大型汇编.我们还包括 UltraFeedback 的一个净化子集（Cui 等人,2023）,它是

4The datasets we compiled and consider are available here: https://docs.google.com/spreadsheets/d/ 1E2ScaKWbTnlelzJzcddCzEtf7WrpF3a5ZP5ZvdsOZ4Y/edit?usp=sharing.

4我们编译和考虑的数据集可在此处获取：https://docs.google.com/spreadsheets/d/1E2ScaKWbTnlelzJzcddCzEtf7WrpF3a5ZP5ZvdsOZ4Y/edit?usp=sharing.

11

<!-- page 12 of 82 -->

# Prompts

# Prompts

Reference

Category Prompt Dataset Count

used in

used in

DPO

SFT

General Tülu 3 Hardcoded↑ 24 240 – –

OpenAssistant1,2,↓ 88,838 7,132 7,132 Köpf et al. (2024)

No Robots 9,500 9,500 9,500 Rajani et al. (2023)

WildChat (GPT-4 subset)↓ 241,307 100,000 100,000 Zhao et al. (2024)

UltraFeedbackα,2 41,635 – 41,635 Cui et al. (2023)

Knowledge FLAN v21,2,↓ 89,982 89,982 12,141 Longpre et al. (2023)

Recall SciRIFF↓ 35,357 10,000 17,590 Wadden et al. (2024)

TableGPT↓ 13,222 5,000 6,049 Zha et al. (2023)

Math Tülu 3 Persona MATH 149,960 149,960 – –

Reasoning Tülu 3 Persona GSM 49,980 49,980 – –

Tülu 3 Persona Algebra 20,000 20,000 – –

OpenMathInstruct 2↓ 21,972,791 50,000 26,356 Toshniwal et al. (2024)

NuminaMath-TIRα 64,312 64,312 8,677 Beeching et al. (2024)

Coding Tülu 3 Persona Python 34,999 34,999 – –

Evol CodeAlpacaα 107,276 107,276 14,200 Luo et al. (2023)

Safety Tülu 3 CoCoNot 10,983 10,983 10,983 Brahman et al. (2024)

& Non-Compliance Tülu 3 WildJailbreakα,↓ 50,000 50,000 26,356 Jiang et al. (2024)

Tülu 3 WildGuardMixα,↓ 50,000 50,000 26,356 Han et al. (2024)

Multilingual Aya↓ 202,285 100,000 32,210 Singh et al. (2024b)

Precise IF Tülu 3 Persona IF 29,980 29,980 19,890 –

Tülu 3 IF-augmented 65,530 – 65,530 –

Total 23,327,961 939,344 425,145γ

Table 7 Summary of our prompt dataset: data for training stages are selected from these prompts. New datasets released with Tülu 3 are color-coded for emphasis. Existing datasets we modified due to contamination are marked with α. Datasets with prompts used in Tülu 1 or 2 are marked with 1 or 2, respectively. Datasets marked with ↓are downsampled from their original datasets, datasets marked with ↑are upsampled. Note that all datasets were filtered to remove specific keywords (e.g., OpenAI) and empty messages, resulting in slightly lower than reported counts. All Tülu 3 datasets with Persona expand the methodology of Chan et al. (2024). The percentages listed per category are out of the total prompts. Preference count is marked with γ to note that not all prompts are used in both the 8B and 70B mixes – for exact details see Table 15.

a composition of several datasets (FalseQA (Hu et al., 2023), UltraChat (Ding et al., 2023), Evol-Instruct (Xu et al., 2023), FLAN v2 (Longpre et al., 2023)) and has shown strong performance for general preference tuning in early studies (Tunstall et al., 2023; Ivison et al., 2024).

它由多个数据集组成（FalseQA (Hu et al., 2023)、UltraChat (Ding et al., 2023)、Evol-Instruct (Xu et al., 2023)、FLAN v2 (Longpre et al., 2023)）,并在早期研究中表现出强大的一般偏好调整性能（Tunstall et al., 2023；Ivison et al., 2024）.

Target Skills. We especially consider enhancing several capabilities that can power common use cases and our specific needs. As shown in our earlier study (Wang et al., 2023), some capabilities, such as complex reasoning, coding, and precise instruction following, benefit from mixing in additional data. Therefore, we include the following datasets: OpenMathInstruct (Toshniwal et al., 2024) and NuminaMath (Beeching et al., 2024) for mathematical reasoning, Evol-CodeAlpaca for coding, a subset of Daring-Anteater (Wang et al., 2024d) for precise instruction following, Aya (Singh et al., 2024b) for multilinguality, SciRIFF (Wadden et al., 2024) for scientific literature understanding, and TableGPT (Zha et al., 2023) for processing table-related tasks. We have also considered other datasets for domains with plenty of published research (e.g., math), but they either did not bring additional benefits in our early supervised finetuning experiments or have restrictive licenses.

目标技能.我们特别考虑增强一些可以支持常见用例和我们的特定需求的功能.正如我们早期的研究（Wang 等人,2023）所示,一些能力,例如复杂推理、编码和精确的指令遵循,受益于混合附加数据.因此,我们包括以下数据集：用于数学推理的 OpenMathInstruct (Toshniwal et al., 2024) 和 NuminaMath (Beeching et al., 2024)、用于编码的 Evol-CodeAlpaca、用于精确指令跟踪的 Daring-Anteater (Wang et al., 2024d) 的子集、用于多语言的 Aya (Singh et al., 2024b), SciRIFF (Wadden et al., 2024) 用于科学文献理解,TableGPT (Zha et al., 2023) 用于处理表格相关任务.我们还考虑了具有大量已发表研究（例如数学）的领域的其他数据集,但它们要么没有在我们早期的监督微调实验中带来额外的好处,要么具有限制性许可.

12

<!-- page 13 of 82 -->

Data Provenance and Licenses. When sourcing prompts, we take careful consideration of the licenses of the original datasets and only allow those with clear and correct licenses. Since many publicly released datasets are compositions of other datasets, we have to manually track the provenance of subsets to verify their licenses and remove those that have issues. Specifically, the ShareGPT dataset5 is of questionable legal provenance as they were shared by users on the internet without an agreement to be used for model training or being released at all, so we exclude it and use WildChat instead. We also removed the relevant subset from UltraFeedback and decided not to use Helpsteer2 (Wang et al., 2024d) due to the use of ShareGPT in their prompts. All the datasets included in our final curation have clear licenses.

数据来源和许可证.当采购提示时,我们会仔细考虑原始数据集的许可证,并且只允许那些具有明确且正确许可证的数据集.由于许多公开发布的数据集是其他数据集的组合,因此我们必须手动跟踪子集的来源以验证其许可证并删除有问题的数据集.具体来说,ShareGPT 数据集5的法律来源有问题,因为它们是由互联网上的用户共享的,而没有同意用于模型训练或根本没有发布,因此我们将其排除并使用 WildChat 代替.我们还从 UltraFeedback 中删除了相关子集,并决定不使用 Helpsteer2（Wang 等人,2024d）,因为他们的提示中使用了 ShareGPT.我们最终管理中包含的所有数据集都有明确的许可证.

3.1.2 Synthesizing for Target Skills · 综合目标技能

To address the growing need for diverse and skill-specific datasets, we incorporate synthetic data generation as a complementary approach. Synthetic data generation has gained traction as a promising alternative to human-written data due to being cheaper to obtain, customizable for different purposes, and reflecting the vast knowledge of the underlying models (Dubey et al., 2024). However, generating diverse and high-quality data at scale is non-trivial, as LMs are susceptible to falling into repetitive modes or patterns, referred to as “mode collapse” (Kazdan et al., 2024). To ensure diversity in generation, we follow the recent persona-driven

为了满足对多样化和特定技能数据集不断增长的需求,我们将合成数据生成作为一种补充方法.合成数据生成作为人类编写数据的一种有前景的替代方案而受到关注,因为它获取成本更低,可以针对不同目的进行定制,并且反映了底层模型的丰富知识（Dubey 等人,2024）.然而,大规模生成多样化且高质量的数据并非易事,因为 LM 很容易陷入重复模式或模式,称为“模式崩溃”（Kazdan 等人,2024）.为了确保一代的多样性,我们遵循最近的角色驱动

methodology in Chan et al. (2024) to generate synthetic data. The key idea is to use different personas (e.g., “A machine learning researcher focused on neural networks”) with a data synthesis prompt (e.g., “create a coding problem”) to steer an LLM to synthesize data with corresponding perspectives. Specifically, we condition on ∼250K personas from Persona Hub (Chan et al., 2024) to generate prompts targeting specific skills such as precise instruction following, math and coding. We detail our procedure for each select skill below. Prompts used to generate these instructions can be found in Appendix C.1. Additionally, we build upon our previous efforts in Brahman et al. (2024); Han et al. (2024); Jiang et al. (2024), to generate noncompliance and safety data.

Chan 等人的方法论. （2024）生成合成数据.关键思想是使用不同的角色（例如,“专注于神经网络的机器学习研究员”）和数据合成提示（例如,“创建编码问题”）来引导法学硕士合成具有相应观点的数据.具体来说,我们以 Persona Hub（Chan 等人,2024）中的约 25 万个角色为条件,生成针对特定技能（例如精确遵循指令、数学和编码）的提示.我们在下面详细介绍了每项选定技能的程序.用于生成这些指令的提示可以在附录 C.1 中找到.此外,我们以 Brahman 等人之前的努力为基础. （2024）；韩等人. （2024）；江等人. （2024）,生成不合规和安全数据.

Precise Instruction Following. Precise instruction following is the ability to follow verifiable instructions in natural language, such as “your answer should contain exactly 3 paragraphs,” that can be automatically verified with heuristics. We use our persona-driven approach to synthetically generate verifiable instructions covering 25 different constraint types defined in IFEval benchmark (Zhou et al., 2023). More concretely, we start by manually writing 1-2 example instructions per constraint (e.g., number of words), resulting in total of 33 verifiable instructions which we used as seed prompts. We then generate new instructions using GPT-4o (OpenAI, 2024)6 given a data synthesis prompt, persona, and a single verifiable instruction as an example. Figures 30 and 31 show the exact prompts used to generate the instruction and its corresponding response, respectively. In total, we collected 29,980 verifiable instruction-response pairs which we call If- Persona-Sft. Lastly, we also generate another type of prompts targeted for constrained instruction following by randomly sampling instructions from the Tülu 2 SFT mix and combining them with constraints from the taxonomy in Zhou et al. (2023). We call that set IF-augmented. These prompts are only used for the DPO and RLVR stages.

精确遵循指令.精确指令遵循是指遵循自然语言中可验证的指令的能力,例如“您的答案应该恰好包含 3 个段落”,可以通过启发式自动验证.我们使用角色驱动的方法综合生成可验证的指令,涵盖 IFEval 基准中定义的 25 种不同约束类型（Zhou 等人,2023）.更具体地说,我们首先为每个约束（例如单词数）手动编写 1-2 条示例指令,总共得到 33 条可验证的指令,我们将其用作种子提示.然后,我们以数据合成提示、角色和单个可验证指令为例,使用 GPT-4o（OpenAI,2024）6 生成新指令.图 30 和 31 分别显示了用于生成指令及其相应响应的确切提示.我们总共收集了 29,980 个可验证的指令-响应对,我们称之为 If-Persona-Sft.最后,我们还通过从 Tülu 2 SFT 混合中随机采样指令,并将它们与 Zhou 等人的分类法的约束相结合,生成另一种类型的针对约束指令的提示. （2023）.我们称该集合为 IF 增强的.这些提示仅用于 DPO 和 RLVR 阶段.

Math and Coding. We follow a similar persona-driven approach to synthetically generate diverse math word and coding problems. Math problems include those that require advanced mathematical skills as well as grade school problems. For coding, we generate Python programming questions that are solvable by entry- to medium-level programmers. Unlike precise instruction following, we zero-shot prompt GPT-4o to generate problems that are unique and specific to a given persona input. Having generated the problems, we then generate multi-step math solutions using GPT-4o, and Python programs using claude-3-5-sonnet. Exact prompts used to generate problems and solutions are provided in Figures 33, 35, 34, and 36, respectively. In total, we collected ∼220K and 35K instances for math reasoning and coding.

数学和编码.我们遵循类似的角色驱动方法来综合生成不同的数学单词和编码问题.数学问题包括需要高级数学技能的问题以及小学问题.对于编码,我们生成初级到中级程序员可以解决的 Python 编程问题.与精确遵循指令不同,我们零样本提示 GPT-4o 生成针对给定角色输入的独特且特定的问题.生成问题后,我们使用 GPT-4o 生成多步数学解决方案,并使用 claude-3-5-sonnet 生成 Python 程序.图 33、35、34 和 36 分别提供了用于生成问题和解决方案的确切提示.我们总共收集了 ∼220K 和 35K 实例用于数学推理和编码.

Noncompliance and Safety. As we enhance models’ capabilities to assist users effectively, it is crucial to ensure they can reliably reject unsafe and appropriately handle nuanced and out of scope queries. To support this, we curate a set of noncompliance queries (Brahman et al., 2024) that the model ought to not comply with, alongside safety-related direct and adversarial prompts (Han et al., 2024; Jiang et al., 2024) covering

不合规与安全.当我们增强模型有效帮助用户的能力时,确保它们能够可靠地拒绝不安全并适当处理细微差别和超出范围的查询至关重要.为了支持这一点,我们策划了一组模型不应遵守的不合规查询（Brahman et al., 2024）,以及与安全相关的直接提示和对抗性提示（Han et al., 2024；Jiang et al., 2024）,涵盖

5ShareGPT data was initially used to build the Vicuna model (Chiang et al., 2023), but the exact dataset has not been released. Later work mainly used a community reproduced version at https://huggingface.co/datasets/anon8231489123/ ShareGPT_Vicuna_unfiltered/.

5ShareGPT 数据最初用于构建 Vicuna 模型（Chiang et al., 2023）,但确切的数据集尚未发布.后来的工作主要使用了社区转载版本https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered/.

6We use GPT-4o-2024-08-06 for all our persona-driven data synthesis, unless otherwise stated.

6除非另有说明,否则我们使用 GPT-4o-2024-08-06 进行所有角色驱动的数据合成.

13

<!-- page 14 of 82 -->

Dataset Eval. Link % ↓

Evol CodeAlpaca

Hu- manEval Orig: ise-uiuc/Magicoder-Evol-Instruct-110K

3.5

New: allenai/evol_codealpaca_heval_decontaminated · 新：allenai/evol_codealpaca_heval_decontamerated

WildChat GPT-4 Safety Orig: allenai/WildChat-1M-Full (GPT-4 instances only) 5.4

WildChat GPT-4 Safety Orig：allenai/WildChat-1M-Full（仅限 GPT-4 实例）5.4

New: allenai/wildchat_gpt4_converted_safety_decontaminated

新：allenai/wildchat_gpt4_converted_safety_decontamerated

WildJailbreak Safety Orig: allenai/wildjailbreak

0.7

New: allenai/wildjailbreak_safety_decontaminated

WildGuardmix Safety Orig: allenai/wildguardmix 1.1 New: allenai/wildguardmixtrain_safety_decontaminated NuminaMath- TIR MATH Orig: AI-MO/NuminaMath-TIR

WildGuardmix 安全原版：allenai/wildguardmix 1.1 新版：allenai/wildguardmixtrain_safety_decontamulated NuminaMath- TIR MATH 原版：AI-MO/NuminaMath-TIR

11.3

New: allenai/numinamath_tir_math_decontaminated

Table 8 Decontaminated datasets. % is the percent of the dataset removed.

both benign and harmful scenarios. Our noncompliance and safety prompts are either curated from existing datasets (Zhang and Choi, 2021; Zhao et al., 2024) or synthetically generated from the GPT model family. More specifically, our noncompliance prompts are obtained based on our contextual noncompliance taxonomy from Brahman et al. (2024), spanning multiple categories including incomplete, unsupported, indeterminate, and humanizing requests (in addition to unsafe requests). Our safety-related prompts are carefully selected among synthetic adversarial prompts, synthetic vanilla (direct) requests, real-world user-LLM interactions (In-The-Wild), and curated annotator-written examples to maximize coverage, diversity, and balance.

良性和有害的情况.我们的不合规和安全提示要么是根据现有数据集（Zhang 和 Choi,2021；Zhao 等人,2024）精心策划的,要么是根据 GPT 模型系列综合生成的.更具体地说,我们的不合规提示是根据 Brahman 等人的上下文不合规分类获得的. (2024),涵盖多个类别,包括不完整、不受支持、不确定和人性化的请求（除了不安全的请求）.我们的安全相关提示是在合成对抗性提示、合成普通（直接）请求、真实世界的用户与 LLM 交互（In-The-Wild）以及精心挑选的注释者编写的示例中精心挑选的,以最大限度地提高覆盖范围、多样性和平衡性.

3.2 Prompt Decontamination · 及时净化

One important consideration when curating our training mix was possible overlap between training prompts and evaluation sets. We quantify such overlap as follows and remove instances from our training mix as needed in order to prevent test set contamination.

在策划我们的培训组合时,一个重要的考虑因素是培训提示和评估集之间可能存在重叠.我们按如下方式量化此类重叠,并根据需要从训练组合中删除实例,以防止测试集污染.

Matching Method. We experimented with full-string, n-gram, and embedding-based matching and found that n-gram matching yielded the most useful results — while embedding-based methods can in principle identify non-trivial contamination like that due to paraphrasing (Yang et al., 2023), we found it difficult to distinguish mere distributional similarity from actual paraphrasing. Moreover, partial surface-level overlap using n-gram matching successfully identified cases of contamination where the instances were trivially different, e.g., a math problem where only the numbers differ.

匹配方法.我们尝试了全字符串、n-gram 和基于嵌入的匹配,发现 n-gram 匹配产生了最有用的结果 - 虽然基于嵌入的方法原则上可以识别由于释义而产生的非平凡污染（Yang 等人,2023）,但我们发现很难区分单纯的分布相似性和实际释义.此外,使用 n 元语法匹配的部分表面级重叠成功识别了实例略有不同的污染情况,例如,只有数字不同的数学问题.

Identifying Matching Instances. Since completions in training datasets are often regenerated using language models, we chose to compute overlap in the prompts alone (or more generally user turns in multi-turn dialogues). We used 8-gram matching for our contamination checks following (Dubey et al., 2024; Singh et al., 2024a). For each token in a test instance, we consider it to match a token in a train instance if the two instances share an 8-gram containing that token, and we consider the test instance itself to have significant overlap with a train instance if more than 50% of the test tokens have 8-gram matches with the same training instance.

识别匹配实例.由于训练数据集中的补全通常是使用语言模型重新生成的,因此我们选择单独计算提示中的重叠（或更一般地计算多轮对话中的用户轮次）.我们使用 8 克匹配进行以下污染检查（Dubey 等人,2024；Singh 等人,2024a）.对于测试实例中的每个标记,如果两个实例共享包含该标记的 8-gram,我们认为它与训练实例中的标记匹配,并且如果超过 50% 的测试标记与同一训练实例具有 8-gram 匹配,我们认为测试实例本身与训练实例有显着重叠.

Decontamination. We consider a training set to be contaminated if any number of its instances overlap with more than 2% of the instances in any of the evaluations in our development and unseen suites. We remove all the training sets that were contaminated with our unseen evaluations. For training sets that were contaminated with our development evaluations, we removed the entire dataset if doing so did not significantly impact the performance of the resulting model; otherwise, we removed the specific instances that match any

去污.如果训练集的任何数量的实例与我们的开发套件和未见过的套件中的任何评估中超过 2% 的实例重叠,我们认为训练集受到污染.我们删除了所有被我们看不见的评估污染的训练集.对于受到我们的开发评估污染的训练集,如果这样做不会显着影响最终模型的性能,我们会删除整个数据集；否则,我们删除了与任何匹配的特定实例

14

<!-- page 15 of 82 -->

Count

Tülu 3 Persona MATH Evol CodeAlpaca Aya WildChat

FLAN v2 NuminaMath-TIR OpenMathInstruct2 WildGuard

Tülu 3 Persona IF

WildJailbreak Tülu 3 Persona GSM Tülu 3 Persona Code

Other (<11,000 instances)

Tülu 3 Persona MATH - Algebra

Figure 2 The Tülu 3 final SFT mix by source and length of the prompt plus completion in tokens (using the Llama 3 tokenizer). Compare this distribution to previous open SFT training datasets in Fig. 26. Datasets with the most instances are on the bottom of the histogram.

test instance.

The list of datasets we decontaminated and the versions we released with overlapping samples removed is shown in Table 8. The full list of public datasets that we found to be significantly contaminated with our evaluation sets can be found in Table 37.

我们净化的数据集列表以及我们发布的删除了重叠样本的版本如表 8 所示.我们发现受到我们的评估集严重污染的公共数据集的完整列表可以在表 37 中找到.

4 Supervised Finetuning · 监督微调

Adapting pretrained base models to various tasks and user requests often relies on supervised finetuning (SFT), also known as instruction finetuning. A key challenge in this process is balancing the proportions of

使预训练的基础模型适应各种任务和用户请求通常依赖于监督微调（SFT）,也称为指令微调.这个过程中的一个关键挑战是平衡

mixed training datasets representing diverse skills. For Tülu 3, we conducted data mixture ablations and explored model merging techniques to develop an SFT training procedure that well balances performance across the core skills we prioritized. The following sections detail our experiments and findings.

代表不同技能的混合训练数据集.对于 Tülu 3,我们进行了数据混合消融并探索了模型合并技术,以开发 SFT 训练程序,该程序可以很好地平衡我们优先考虑的核心技能的性能.以下部分详细介绍了我们的实验和发现.

4.1 SFT Data · SFT数据

4.1.1 From Prompts to SFT Data · 从提示到 SFT 数据

To create our SFT mix, we collect or create responses for prompts described in Section 3 in two ways: filtering existing responses, and creating new responses.

为了创建我们的 SFT 组合,我们通过两种方式收集或创建第 3 节中描述的提示的响应：过滤现有响应和创建新响应.

For prompts with existing responses, we generally keep the original response if it was written by a human or a frontier model, like GPT-4o. For large datasets with subsets from frontier models (e.g. WildChat), we use the subset from the best models. We additionally filter empty responses and responses that contain information about models or their developers. If a set of prompts did not have responses, like our Persona prompts, or if the original responses were from a weaker model (e.g. WildGuardMix), we generate new responses using GPT-4o. We also hand-wrote responses to our hardcoded prompts.

对于具有现有响应的提示,如果原始响应是由人类或前沿模型（如 GPT-4o）编写的,我们通常会保留原始响应.对于具有前沿模型子集的大型数据集（例如 WildChat）,我们使用最佳模型的子集.我们还过滤空响应和包含有关模型或其开发人员信息的响应.如果一组提示没有响应（例如我们的 Persona 提示）,或者原始响应来自较弱的模型（例如 WildGuardMix）,我们会使用 GPT-4o 生成新响应.我们还手写了对硬编码提示的回复.

15

<!-- page 16 of 82 -->

80

60

Performance

40

20

Average BBH GSM8K IFEval MATH MMLU Safety 0

Tülu 2 Intermediate Mix 1 Intermediate Mix 2 Intermediate Mix 3 Intermediate Mix 4 Intermediate Mix 5 Tülu 3

Tülu 2 中间混合 1 中间混合 2 中间混合 3 中间混合 4 中间混合 5 Tülu 3

Figure 3 Average and selected skill-specific performance from training Llama 3.1 8B on our initial Tülu 2 SFT mix, and our intermediate and final Tülu 3 SFT mixes. Intermediate mixes 1, 2, and 3 were the result of adding new datasets to improve performance. Intermediate mixes 4 and 5 were the result of running multiple rounds of decontamination, causing small drops in performance.

4.1.2 The Tülu 3 SFT Mix · Tülu 3 SFT 组合

To develop our SFT mix, we first identified the skills that were lagging behind state of the art models using Llama 3.1 trained on Tülu 27 as our baseline. Targeting each of these skills in isolation, we collected high quality publicly available datasets and created synthetic datasets, as described in Section 3.1.2, and also removed some datasets that we identified to be of relatively lower quality compared to other more recent datasets.

为了开发我们的 SFT 组合,我们首先使用在 Tülu 27 上训练的 Llama 3.1 作为基线,确定落后于最先进模型的技能.针对这些技能中的每一项,我们收集了高质量的公开数据集并创建了合成数据集,如第 3.1.2 节中所述,并且还删除了一些我们认为与其他较新的数据集相比质量相对较低的数据集.

To design our final SFT mix, we first built skill-specific data mixtures and models, keeping the mixtures that led to the best performance on individual skills, ignoring other evaluations. This was done to approximate the upper bound for each evaluation given our setup.

为了设计最终的 SFT 组合,我们首先构建了特定于技能的数据混合和模型,保留导致个人技能最佳表现的混合,忽略其他评估.这样做是为了近似给定我们的设置的每个评估的上限.

We then combined these mixtures to create our initial Tülu 3 preview mix. We then continued to iterate on

然后,我们将这些混音组合起来,创建了最初的 Tülu 3 预览混音.然后我们继续迭代

the mixture by adding or removing datasets to improve lagging skills, decontaminating against our evaluations and downsampling particularly large datasets. We show the performance of major preview versions throughout development in Figure 3.

通过添加或删除数据集以提高滞后技能、对我们的评估进行净化以及对特别大的数据集进行下采样来混合.我们在图 3 中展示了整个开发过程中主要预览版本的性能.

Final SFT Results. In Table 9, we compare our final Tülu 3 8B SFT and Tülu 3 70B SFT models against other SFT-only models trained on Llama 3 8B or 70B. Our new SFT mix shows substantial improvements over the Tülu 2 mix at both model sizes, and is better on average the other competitive 8B SFT models.

SFT 最终结果.在表 9 中,我们将最终的 Tülu 3 8B SFT 和 Tülu 3 70B SFT 模型与在 Llama 3 8B 或 70B 上训练的其他仅 SFT 模型进行了比较.我们的新 SFT 组合在两种型号尺寸上都比 Tülu 2 组合有了显着改进,并且平均优于其他竞争性 8B SFT 型号.

4.2 Key Data Experiments · 关键数据实验

We also ran a series of controlled experiments after developing our final SFT mix to explore the importance of

在开发出最终的 SFT 组合后,我们还进行了一系列对照实验,以探索

different decisions made during data mixing and training.

在数据混合和训练过程中做出的不同决定.

Diverse Chat Data. In our mix we also emphasized adding diverse chat data, mainly from WildChat. We show the impact of removing WildChat in Table 10, and we see that there is a small but noticeable degradation on most skills, most noticeably on Alpaca Eval, highlighting the importance of diverse real-world data.

多样化的聊天数据.在我们的组合中,我们还强调添加多样化的聊天数据,主要来自 WildChat.我们在表 10 中展示了删除 WildChat 的影响,我们发现大多数技能都有小但明显的下降,尤其是在 Alpaca Eval 上,这凸显了多样化的现实世界数据的重要性.

Safety is Orthogonal. We found that our safety SFT data was generally orthogonal to our other datasets. We report the effect of removing our safety-specific datasets in Table 10, and we see that most skills stayed

安全是正交的.我们发现我们的安全 SFT 数据通常与其他数据集正交.我们在表 10 中报告了删除特定于安全的数据集的效果,我们发现大多数技能都保留了下来

roughly the same, except the safety average. We also found that adding contrastive prompts, such as those in CoCoNot, were helpful for preventing our models from over-refusing safe prompts.

除了安全平均值外,大致相同.我们还发现,添加对比提示（例如 CoCoNot 中的提示）有助于防止我们的模型过度拒绝安全提示.

7https://huggingface.co/allenai/llama-3.1-tulu-2-8b

16

<!-- page 17 of 82 -->

Model Avg. MMLU TQA PopQA BBH CHE CHE+ GSM DROP MATH IFEval AE 2 Safety

模型平均MMLU TQA PopQA BBH CHE CHE+ GSM DROP MATH IFEval AE 2 安全

Tülu 2 8B SFT 48.3 61.8 49.4 23.3 57.1 66.9 63.1 60.4 61.7 14.0 42.3 8.9 70.7 RLHFlow SFT V2 56.0 65.8 56.0 29.7 69.3 86.2 80.9 81.6 57.2 35.7 52.7 13.6 43.5 MAmmoTH2 8B 46.4 63.6 42.7 20.8 63.4 72.8 66.4 63.7 43.8 30.5 34.9 6.5 47.8

Tülu 3 8B SFT 60.1 62.1 46.8 29.3 67.9 86.2 81.4 76.2 61.3 31.5 72.8 12.4 93.1

Tülu 2 70B SFT 63.6 76.0 57.8 44.1 79.4 86.8 83.5 83.2 75.9 33.1 57.7 17.3 68.8

Tülu 3 70B SFT 72.6 79.4 55.7 48.6 82.7 92.9 87.3 91.1 77.2 53.7 82.1 26.3 94.4

Table 9 Summary of the performance of our Tülu 3 SFT models against comparable baselines. Our final SFT mixtures show strong performance, achieving a higher average score than other comparable mixes. All models, including Tülu 2 SFT, were trained on either Llama 3.0 or 3.1. Our final Tülu 3 70B model was used to help format this table.

Model Avg. MMLU TQA PopQA BBH CHE CHE+ GSM DROP MATH IFEval AE 2 Safety

模型平均MMLU TQA PopQA BBH CHE CHE+ GSM DROP MATH IFEval AE 2 安全

Tülu 3 8B SFT 60.1 62.1 46.8 29.3 67.9 86.2 81.4 76.2 61.3 31.5 72.8 12.4 93.1

→w/o WildChat 58.9 61.0 45.2 28.9 65.6 85.3 80.7 75.8 59.3 31.8 70.1 7.5 95.2 →w/o Safety 58.0 62.0 45.5 29.5 68.3 84.5 79.6 76.9 59.4 32.6 71.0 12.4 74.7 →w/o Persona Data 58.6 62.4 48.9 29.4 68.3 84.5 79.0 76.8 62.2 30.1 53.6 13.5 93.9 →w/o Math Data 58.2 62.2 47.1 29.5 68.9 86.0 80.5 64.1 60.9 23.5 70.6 12.0 93.5

Table 10 Performance during our SFT ablations, showing the effect of removing safety, WildChat, Persona, and Math data in isolation. We find that: 1) diverse chat data is beneficial for most skills, most noticeably Alpaca Eval, 2) safety performance is generally orthogonal to general performance, 3) our new Persona datasets improve all of the skills that they target, and 4) using mathematics as a test case, adding high quality skill-specific data substantially improves skill-specific performance.

New Persona Data. Our new Persona datasets were built to target specific skills: mathematics, coding, and instruction following. In Table 10 we show that performance on HumanEval(+), GSM8K, MATH, and IFEval drop after removing our Persona datasets, showing the value of creating diverse, skill-specific SFT datasets.

新角色数据.我们新的角色数据集是针对特定技能而构建的：数学、编码和指令遵循.在表 10 中,我们显示删除 Persona 数据集后,HumanEval(+)、GSM8K、MATH 和 IFEval 的性能下降,这显示了创建多样化、特定于技能的 SFT 数据集的价值.

Targeting Specific Skills. A large portion of our focus was on collecting or creating datasets targeting specific capabilities. Using mathematical reasoning as an illustrative example, we show in Table 10 the impact of our mathematics-specific data on both GSM8K and MATH. We see that our mathematics-specific SFT data substantially improves both GSM8K and MATH, showing the value of the data included in the final mix.

针对特定技能.我们的很大一部分重点是收集或创建针对特定功能的数据集.使用数学推理作为说明性示例,我们在表 10 中显示了数学特定数据对 GSM8K 和 MATH 的影响.我们看到我们的数学特定 SFT 数据极大地改进了 GSM8K 和 MATH,显示了最终组合中包含的数据的价值.

Amount of SFT Data. In Figure 4, we show the effect of taking stratified subsamples of our SFT mix. We find that our models continue to improve on average as more SFT data is included, and we see large

SFT 数据量.在图 4 中,我们展示了对 SFT 组合进行分层子样本的效果.我们发现,随着包含更多 SFT 数据,我们的模型平均继续改进,并且我们看到大量

improvements on metrics like GSM8K as we increase the amount of data to the full mix. Interestingly, TruthfulQA performance actually drops as the amount of data in the mix increases. We do not increase our SFT data size beyond the current mixture because we allocated other prompts for preference optimization.

随着我们增加完整组合的数据量,对 GSM8K 等指标的改进.有趣的是,随着混合数据量的增加,TruthfulQA 的性能实际上会下降.我们不会将 SFT 数据大小增加到超出当前混合物的范围,因为我们分配了其他提示以进行偏好优化.

Hyperparameter 8B 70B

Learning Rate 5 × 10-6 2 × 10-6

Learning Rate Schedule Linear Linear Batch Size (effective) 128 128 Max Token Length 4,096 4,096 Warm up ratio 0.03 0.03 Number of Epochs 2 2

学习率计划 线性 线性 批量大小（有效） 128 128 最大令牌长度 4,096 4,096 预热比率 0.03 0.03 时期数 2 2

Table 11 SFT Training Hyperparameters.

17

<!-- page 18 of 82 -->

4.3 SFT Recipe and Analyses. · SFT 配方和分析.

Training Settings To train our Tülu 3 models, we used between 4 and 16 8xH100 nodes with high speed interconnect. The final 8B model is trained on 32 GPUs for 6 hours and the 70B model was trained on 64 GPUs for 50 hours. We used an effective batch size of 128 and a maximum sequence length of 4,096 tokens. We trained for two epochs using a learning rate of 5e-6 for our 8B models, and 2e-6 for our 70B models, which we found after a hyperparameter search. Our hyperparameter settings are also summarized in Table 11. For merging experiments we used mergekit8 (Goddard et al., 2024), using linear weighted averaging.

训练设置 为了训练我们的 Tülu 3 模型,我们使用了 4 到 16 个具有高速互连的 8xH100 节点.最终的 8B 模型在 32 个 GPU 上训练 6 小时,70B 模型在 64 个 GPU 上训练 50 小时.我们使用的有效批量大小为 128,最大序列长度为 4,096 个标记.我们对 8B 模型使用 5e-6 的学习率进行两个 epoch 的训练,对 70B 模型使用 2e-6 的学习率进行训练,这是我们在超参数搜索后发现的.表 11 还总结了我们的超参数设置.对于合并实验,我们使用 mergekit8（Goddard 等人,2024）,使用线性加权平均.

4.3.1 Key Training Experiments · 重点训练实验

Choice of Base Model. We also test the effect of training different base pretrained models on mathematical performance using our full SFT mix. In Table 12, we show the impact of changing the model’s size by training on both Llama 3.1 8B and 70B, and the impact of adding domain-specific pretraining data by training on Qwen 2.5 7B and Qwen 2.5 Math 7B. In both cases, we see a substantial improvement in both GSM8K and MATH, highlighting the importance of both model size and pretraining data for downstream skills.

基本模型的选择.我们还使用完整的 SFT 组合来测试训练不同基础预训练模型对数学性能的影响.在表 12 中,我们展示了通过在 Llama 3.1 8B 和 70B 上进行训练来改变模型大小的影响,以及通过在 Qwen 2.5 7B 和 Qwen 2.5 Math 7B 上进行训练来添加特定于领域的预训练数据的影响.在这两种情况下,我们都看到 GSM8K 和 MATH 都有显着改进,凸显了模型大小和预训练数据对下游技能的重要性.

Base Model GSM8K MATH

Llama 3.1 8B 76.2 31.5 Llama 3.1 70B 91.1 53.7

Qwen 2.5 7B 79.2 49.4 Qwen 2.5 Math 7B 86.3 56.4

Table 12 Mathematical performance of different base models trained on our mix. We see that 1) training on larger models leads to better performance, and 2) adding skill-specific pretraining data also leads to improved performance, even for the same size model.

Chat Template Variation. During creating Tülu 3, we explored changing the chat template used to guide the generation of finetuned models. We made a small change to the chat template used in previous Tülu versions, specifically removing the new line at the end of the template (before the model response). The performance between different changes to the chat template is shown in Table 13 on an early version of our SFT setup. We found that replacing the newlines at the end of assistant messages with an eos token resulted in the best performance, but we opted not to use this to avoid generation inconsistency with later steps in our post-training pipeline. The chat template can be found in our codebase and we provide it in Appendix B.3.

聊天模板变体.在创建 Tülu 3 的过程中,我们探索了更改用于指导生成微调模型的聊天模板.我们对以前的 Tülu 版本中使用的聊天模板做了一个小小的更改,特别是删除了模板末尾的新行（在模型响应之前）.表 13 显示了我们 SFT 设置的早期版本中聊天模板不同更改之间的性能.我们发现,用 eos 令牌替换辅助消息末尾的换行符会带来最佳性能,但我们选择不使用它,以避免与训练后管道中的后续步骤产生不一致.聊天模板可以在我们的代码库中找到,并在附录 B.3 中提供.

Chat Template Avg.

Tülu (replace \n w/ eos) 53.0 Zephyr 52.9 Tülu 3 (no \n) 52.8 Tülu 2 template 52.6 Llama 3 template 51.6

Tülu（用 eos 替换 \n）53.0 Zephyr 52.9 Tülu 3（无 \n）52.8 Tülu 2 模板 52.6 Llama 3 模板 51.6

Table 13 The impact of different chat templates on SFT model performance, trained using an intermediate SFT mixture on Llama 3.0. While replacing the newline does best, we instead opted for simply removing the newline to avoid complexity.

Random Seeds and Model Soups. We also explored changing the random seed during SFT, and then using those models to create model soups (Wortsman et al., 2022). In Table 14, we compare training 8B and 70B models with multiple different seeds with the best model soup. We see that SFT performance noticeably varies based on the seed, highlighting the importance of multiple training runs, and that the best model soup does not always outperform the best single training run. Because of this, we use the best single SFT training run for each model size as our final SFT models.

随机种子和模型汤.我们还探索了在 SFT 期间更改随机种子,然后使用这些模型创建模型汤（Wortsman 等人,2022）.在表 14 中,我们比较了使用多种不同种子和最佳模型汤训练 8B 和 70B 模型.我们看到 SFT 性能根据种子的不同而显着变化,这凸显了多次训练运行的重要性,并且最好的模型汤并不总是优于最好的单次训练运行.因此,我们使用每个模型大小的最佳单次 SFT 训练作为最终的 SFT 模型.

8https://github.com/arcee-ai/mergekit

18

<!-- page 19 of 82 -->

Model Seed Average Model Seed Average

Tülu 3 8B SFT 42 (Default) 59.9 Tülu 3 70B SFT 42 (Default) 71.8 123 60.1 123 70.0 456 59.8 456 72.6 789 59.8 - - 1011 59.8 - - Best Model Soup 42 & 123 60.2 Best Model Soup 123 & 456 72.5

Table 14 Average performance of our 8B and 70B SFT models using random seeds, and compared against the best model soup using the models trained with different seeds. We find that the best random seed is comparable to the best model soup, so for consistency we use the best single SFT run as our final SFT model.

80

60

40

Performance

20

Avg. GSM8K HumanEval+ Safety TruthfulQA 0

5% 10% 25% 50% 75% 100%

Figure 4 Average and skill-specific performance on stratified subsamples of our final SFT mix. We find that our full mix performs best overall.

4.3.2 Batch Aggregation · 批量聚合

Early during training Tülu 3, we noticed a gap in performance between SFT models trained on our Open- Instruct framework and models trained in other settings such as on TPUs.9 We found this issue was largely due to a (recently widely-reported) issue with loss aggregation inside Transformers (Wolf et al., 2020): Averaging the loss across padding tokens without taking into account gradient accumulation or distributed training setups.

在训练 Tülu 3 的早期,我们注意到在 Open-Instruct 框架上训练的 SFT 模型与在 TPU 等其他设置中训练的模型之间存在性能差距.9 我们发现这个问题很大程度上是由于 Transformers 内部损失聚合的（最近广泛报道的）问题（Wolf 等人,2020）：在不考虑梯度累积或分布式训练设置的情况下平均填充令牌的损失.

Here, we illustrate the issue with an example. Assume we have two samples in a batch, with n1, n2 non-padding tokens and m1, m2 padding tokens. If we pass both samples into the default Transformers forward pass at the same time, we get:

这里,我们通过一个例子来说明这个问题.假设我们在一个批次中有两个样本,其中 n1、n2 个非填充标记和 m1、m2 个填充标记.如果我们同时将两个样本传递到默认的 Transformers 前向传递中,我们会得到：

L = ln1 + ln2

n1 + n2 (1)

However, if we apply gradient accumulation, feeding in the two samples separately, computing loss, and then dividing, our loss is instead computed like:

然而,如果我们应用梯度累积,分别输入两个样本,计算损失,然后除法,我们的损失计算如下：

ln1

ln2

n1 +

L =

n2 2 (2)

That is, in the second case we weight each example equally, while in the first we weight each token equally. As such, changing gradient accumulation can have large effects on performance due to effectively changing

也就是说,在第二种情况下,我们对每个示例进行同等的加权,而在第一种情况下,我们对每个标记进行同等的加权.因此,改变梯度累积会对性能产生很大影响,因为有效地改变了

9Relevant code: https://github.com/hamishivi/EasyLM

19

<!-- page 20 of 82 -->

sample weightings, as reported by Muennighoff et al. (2024). A similar issue occurs in distributed training due to cross-device averaging. We refer to recent reports on this issue for a more in-depth explanation.10

Muennighoff 等人报告的样本权重. （2024）.由于跨设备平均,分布式训练中也会出现类似的问题.我们参考最近有关此问题的报告以获得更深入的解释.10

To fix this issue, we opted generally to use a sum loss instead of averaging (‘mean loss’) when training. This removes the issue by simply removing the denominator from the above equations and requires an adjustment to learning rates. This effectively weights all tokens equally (which we found led to generally better performance for initial mixtures). We validated the perfomance of our setup by finetuning Llama 3.0 on the Tülu 2 SFT mixture using a variety of learning rates, epochs, and loss types as shown in Figures 5 and 6. Ultimately, we found that using a sum loss with a learning rate of 5.00E-06 worked best. Surprisingly, we additionally found that training for longer did not yield further improvements, and so used 2 epochs for training.

为了解决这个问题,我们在训练时通常选择使用总和损失而不是平均（“平均损失”）.只需从上述方程中删除分母即可解决该问题,并且需要调整学习率.这有效地对所有令牌进行了同等加权（我们发现这通常会导致初始混合的性能更好）.我们通过使用各种学习率、时期和损失类型在 Tülu 2 SFT 混合物上微调 Llama 3.0 来验证我们的设置的性能,如图 5 和 6 所示.最终,我们发现使用学习率为 5.00E-06 的总和损失效果最好.令人惊讶的是,我们还发现更长时间的训练并没有带来进一步的改进,因此使用了 2 个 epoch 进行训练.

52

50

51

45

50

Avg. Perf.

Avg. Perf.

40

49

Mean Loss Sum Loss

2.0x10^-6 5.0x10^-6 1.0x10^-5 2.0x10^-5 Learning Rate

2 3 4 5 6 7 Number of Epochs

Figure 5 Average performance when finetuning Llama 3.0 on the Tülu 2 mixture using differing loss types and learning rates. We find that a LR of 5e-6 with a sum loss works best.

Figure 6 Average performance when finetuning Llama 3.0 on the Tülu 2 mixture using sum loss and LR of 5e-6 for varying numbers of epochs. We find using 2 epochs works best.

5 Preference Finetuning · 偏好微调

For Tülu 3 we explore many approaches to preference finetuning with the goal of improving our entire evaluation suite. We explore multiple training algorithms, from Direct Preference Optimization (DPO) and its derivatives to reinforcement learning algorithms such as Proximal Policy Optimization (PPO). In this section, we detail the problem formulation of learning from human preferences and our optimizers. Next, we explain how to convert our prompts into synthetic preference data from both on-policy (Tülu 3 suite) and off-policy models (other instruct models). We show how to create preference data for specific skills of interest and how we improve our models robustly with DPO.

对于 Tülu 3,我们探索了多种偏好微调方法,目标是改进整个评估套件.我们探索多种训练算法,从直接偏好优化（DPO）及其衍生物到强化学习算法,例如近端策略优化（PPO）.在本节中,我们详细介绍了从人类偏好和优化器中学习的问题表述.接下来,我们解释如何将提示转换为来自在线策略（Tülu 3 套件）和离线策略模型（其他指令模型）的综合偏好数据.我们展示了如何为感兴趣的特定技能创建偏好数据,以及如何使用 DPO 稳健地改进我们的模型.

5.1 Background · 背景

Prior work has established training on preference data as a crucial step for improving model performance on benchmarks simulating human or synthetic preferences (Dubois et al., 2023; Ivison et al., 2023, 2024). The typical procedure is reinforcement learning from human or AI feedback11 (Ziegler et al., 2019; Stiennon et al., 2020; Ouyang et al., 2022; Bai et al., 2022).

先前的工作已将偏好数据训练作为提高模型在模拟人类或合成偏好的基准上性能的关键步骤（Dubois 等人,2023；Ivison 等人,2023、2024）.典型的过程是根据人类或人工智能反馈进行强化学习11 (Ziegler et al., 2019; Stiennon et al., 2020; Ouyang et al., 2022; Bai et al., 2022).

5.1.1 Setup · 设置

Preference Data. In the standard setup, there is some preference dataset D consisting of prompts x and two responses y, y′ per prompt. Some judge(s) will choose one of y, y′ as their preferred response yc, and label the other as a rejected response yr.

偏好数据.在标准设置中,有一些偏好数据集 D,其中包含提示 x 和每个提示的两个响应 y、y′.一些法官会选择 y、y′ 之一作为他们的首选响应 yc,并将另一个标记为拒绝响应 yr.

Reward Model. Given the preference dataset, a reward model (RM) rϕ is trained with the following objective:

奖励模型.给定偏好数据集,奖励模型 (RM) rψ 的训练目标如下：

max

rϕ E(x,yc,yr)∼D[log σ(rϕ(x, yc) −rϕ(x, yr))] (3)

10https://unsloth.ai/blog/gradient, https://muellerzr.github.io/blog/gradient_accumulation_part2.html

11Now colloquially referred to as synthetic feedback data as well.

11现在通俗地也称为综合反馈数据.

20

<!-- page 21 of 82 -->

where σ is the logistic function. The RM objective maximizes the difference between the rewards, and this difference represents the log-likelihood that yc will be preferred over yr (Ouyang et al., 2022). This reward model can help train policy models to output contents preferred by the RM’s judgments.

其中 σ 是逻辑函数. RM 目标最大化奖励之间的差异,这种差异代表 yc 比 yr 更受青睐的对数似然（Ouyang et al., 2022）.这个奖励模型可以帮助训练策略模型输出RM判断偏好的内容.

5.1.2 Policy Optimization · 政策优化

There are a plethora of options for optimizing language models with access to preference data. Today, the two categories can be abstracted as reinforcement learning algorithms, which learn from an internal representation of value or reward, and direct alignment algorithms, which learn directly from the data.

有很多选项可以通过访问偏好数据来优化语言模型.如今,这两类可以抽象为强化学习算法和直接对齐算法,前者从价值或奖励的内部表示中学习,后者直接从数据中学习.

Prior work (Ziegler et al., 2019; Stiennon et al., 2020; Ouyang et al., 2022) optimizes the policy πθ with the following objective:

之前的工作（Ziegler et al., 2019；Stiennon et al., 2020；Ouyang et al., 2022）优化了策略 πθ,目标如下：

max

πθ Ey∼πθ(x) [R(x, y)] = [rϕ(x, y) −βKL[πθ(y∣x)∥πref(y∣x)]] (4)

where πref is the initial reference policy and the β coefficient helps control the Kullback-Lieber divergence (KL) divergence between the reference policy and the training policy. Here, we explain PPO and DPO as

其中 πref 是初始参考策略,β 系数有助于控制参考策略和训练策略之间的 Kullback-Lieber 散度 (KL) 散度.在这里,我们将 PPO 和 DPO 解释为

representative examples.

Proximal Policy Optimization (PPO). An approach to address the above objective is to use online reinforcement learning (RL) like PPO (Schulman et al., 2017). In each training iteration of PPO, the policy needs to generate some samples, generate rewards using the RM on those samples, and maximize R(x, y) using the PPO algorithm. As PPO training loops are complex, we refer the reader to Ouyang et al. (2022); Ivison et al. (2024); Huang et al. (2024a) for more thorough descriptions of the setup and typical setups. We provide more

近端策略优化（PPO）.解决上述目标的一种方法是使用在线强化学习（RL）,如 PPO（Schulman 等人,2017）.在 PPO 的每次训练迭代中,策略需要生成一些样本,使用这些样本上的 RM 生成奖励,并使用 PPO 算法最大化 R(x, y).由于 PPO 训练循环很复杂,我们建议读者参考 Ouyang 等人的论文. （2022）；艾维森等人. （2024）；黄等人. (2024a) 有关设置和典型设置的更全面的描述.我们提供更多

implementation details in Sec 6.2.

Direct Preference Tuning (DPO) and Variants. Another approach is offline preference tuning. DPO (Rafailov et al., 2024) can directly optimizes for the RLHF objective with the following equivalent objective:

直接偏好调整 (DPO) 和变体.另一种方法是离线偏好调整. DPO（Rafailov et al., 2024）可以直接优化 RLHF 目标,具有以下等效目标：

max

πθ Eyc,yr∼D [log σ (β log πθ(yc∣x)

πref(yc∣x) −β log πθ(yr∣x)

πref(yr∣x))] . (5)

DPO trains an implicit reward model and a policy model simultaneously, without needing to use a trained reward model, do policy generations, and get rewards from the RM. Crucially, this allows offline preference finetuning, directly training a language model on preference pairs gathered from a variety of sources. Re- cently, much work has examined how to further improve the DPO objective, with a multitude of variants proposed (Meng et al., 2024; Xu et al., 2024a; Hong et al., 2024, inter alia). In this work, we explored two promising variants: SimPO (Meng et al., 2024) and length-normalized DPO12. We find (in Section 5.4) that length-normalized DPO works best, which uses the following objective:

DPO同时训练隐式奖励模型和策略模型,不需要使用训练好的奖励模型,进行策略生成,并从RM获得奖励.至关重要的是,这允许离线偏好微调,直接根据从各种来源收集的偏好对训练语言模型.最近,大量工作研究了如何进一步改进 DPO 目标,并提出了多种变体（Meng 等人,2024 年；Xu 等人,2024a；Hong 等人,2024 年等）.在这项工作中,我们探索了两种有前途的变体：SimPO（Meng 等人,2024）和长度归一化 DPO12.我们发现（在第 5.4 节中）长度归一化的 DPO 效果最好,它使用以下目标：

max

πθ Eyc,yr∼D [log σ ( β

∣yc∣log πθ(yc∣x)

πref(yc∣x) − β ∣yr∣log πθ(yr∣x)

πref(yr∣x))] . (6)

As seen, this is simply the DPO objective (Eq 5), but with log-probabilities normalized for length, which intuitively aids with mitigating the length bias common in human and model preferences (Singhal et al., 2024).

如图所示,这只是 DPO 目标（方程 5）,但具有长度标准化的对数概率,这直观地有助于减轻人类和模型偏好中常见的长度偏差（Singhal 等人,2024）.

When developing Tülu 3, we opted to use length-normalized DPO for tuning our preference data mixtures

在开发 Tülu 3 时,我们选择使用长度归一化 DPO 来调整我们的偏好数据混合

and generation methods due to its relative simplicity and speed compared to approaches such as PPO.

和生成方法,因为与 PPO 等方法相比,它相对简单且速度快.

5.2 Tülu 3 Preference Data · Tülu 3 偏好数据

5.2.1 From Prompts to Preference Data · 从提示到偏好数据

We create on-policy preference data (x, y, y′, label) given our prompts from section 3 by adapting and advancing

根据第 3 节的提示,我们通过调整和推进来创建符合策略的偏好数据（x、y、y′、标签）

the UltraFeedback pipeline (Cui et al., 2023). Our early experiments show the benefit of this pipeline in creating preference data, which leads to a high-quality, synthetic preference dataset (as observed by Ivison et al. (2024)). Our data creation pipeline (shown in Figure 7) consists of three stages: prompt selection,

UltraFeedback 管道（Cui 等人,2023）.我们的早期实验表明了该管道在创建偏好数据方面的优势,从而产生了高质量的综合偏好数据集（正如 Ivison 等人（2024）所观察到的）.我们的数据创建管道（如图 7 所示）由三个阶段组成：提示选择、

21

<!-- page 22 of 82 -->

Prompt Selection Response Generation Preference Annotation

提示选择响应生成偏好注释

GPT-4o-2024-08-06

Model Pool (22 models)

“Rate outputs from 1 to 5

On-policy data Off-policy data

based on this aspect...”

Prompts used in SFT

Helpfulness

Tülu 3

Chosen

SFT 8B

Prompts from datasets

Instruction Following

subsampled for SFT

Binarize

OR

Rejected

Truthfulness

Tülu 3

New OOD prompts (Ultrafeedback, Persona)

Honesty

SFT 70B

Sample four responses from different models for each prompt

针对每个提示从不同模型中抽取四个响应样本

Figure 7 Pipeline for generating and scaling preference data that is based from Ultrafeedback (Cui et al., 2023).

response generation from a pool of models, and preference annotation with LLM-as-a-judge to create (preferred, rejected) pairs.

从模型池中生成响应,并使用法学硕士作为法官进行偏好注释以创建（首选、拒绝）对.

• Stage 1: Prompt Selection The first step for preparing a dataset for preference finetuning is to select the prompts or user instructions to generate responses and obtain preferences for. Given the set of prompts in Table 7, we curate our selection to include prompts used during SFT, and prompts that were subsampled from the same sources, yet unused, for SFT. We also include prompts from other sources, such as a version of Ultrafeedback without TruthfulQA instances, or by adding new IF-constraints to a prompt.

• 第1 阶段：提示选择 为偏好微调准备数据集的第一步是选择提示或用户指令以生成响应并获取偏好.给定表 7 中的一组提示,我们精心挑选以包括 SFT 期间使用的提示,以及从相同源二次采样但未用于 SFT 的提示.我们还包括来自其他来源的提示,例如没有 TruthfulQA 实例的 Ultrafeedback 版本,或者通过向提示添加新的 IF 约束.

• Stage 2: Response Generation For a given prompt, we randomly sample four models from a model pool to generate responses. Our model selection is inspired by the Ultrafeedback pipeline which consists of open-source and proprietary models that vary across parameter size and model family. We update Ultrafeedback’s model pool by using recent versions of some models (Llama 2 →Llama 3.1), adding best-performing models to increase the pool size, and replacing currently inaccessible models such as WizardLM with open-source alternatives.

• 第2 阶段：响应生成 对于给定的提示,我们从模型池中随机抽取四个模型来生成响应.我们的模型选择受到 Ultrafeedback 管道的启发,该管道由开源和专有模型组成,这些模型因参数大小和模型系列而异.我们通过使用某些模型的最新版本（Llama 2→Llama 3.1）来更新 Ultrafeedback 的模型池,添加性能最佳的模型以增加池大小,并用开源替代方案替换当前无法访问的模型（例如 WizardLM）.

Finally, we also include on-policy data by sampling completions from the Tülu SFT model. We approach this by adding a selection of prompts where one response is generated from the on-policy model, and the other response from the off-policy models.

最后,我们还通过对 Tülu SFT 模型的完成采样来包含在策略数据.我们通过添加一系列提示来解决此问题,其中一个响应是从同策略模型生成的,另一个响应是从离策略模型生成的.

• Stage 3: Preference Annotation After generating four responses for each prompt, we use an LLM-as-a-judge (Zheng et al., 2023), specifically GPT-4o-2024-0806, to rate each response from 1 to 5 across four different

• 第 3 阶段：偏好注释为每个提示生成四个响应后,我们使用法学硕士作为法官（Zheng et al., 2023）,特别是 GPT-4o-2024-0806,对四个不同的每个响应进行从 1 到 5 的评分.

aspects: helpfulness, instruction-following, honesty, and truthfulness.

方面：乐于助人、遵守指示、诚实和诚实.

Appendix D shows the external models used to sample off-policy data and the prompt template for each aspect. In order to obtain binary preferences for DPO, we obtain the mean of preference ratings similar to Argilla’s binarization method13 and take the highest-rated response as the chosen response and randomly sample from the responses with the lower mean as the rejected response.

附录D展示了用于对离策略数据进行采样的外部模型以及各个方面的提示模板.为了获得 DPO 的二元偏好,我们获得类似于 Argilla 的二值化方法 13 的偏好评分平均值,并将评分最高的响应作为选择的响应,并从平均值较低的响应中随机抽样作为拒绝的响应.

5.2.2 The Tülu 3 Preference Mix · Tülu 3 偏好组合

We choose the final preference mix for the 8B and the 70B model, which maximizes average performance on

我们选择 8B 和 70B 模型的最终偏好组合,这可以最大限度地提高平均性能

the development evaluations, while also exceling at targeted skills. Most of the preference data mix ablations are run for the 8B model, We start with prompts used for SFT and generate on-policy and off-policy preference data, resulting in 96,911 (off-policy) and 19,444 (on-policy) preference instances. Given this preference base we ablate adding additional prompt sources to the mix and how these additions affect downstream evaluation performance, specifically targeting skills like precise instruction following, math and general chat performance on AlpacaEval. Table 16 shows how the inclusion or exclusion of preference datasets influences the average performance. Our final mixes for Tülu 3 8B DPO and Tülu 3 70B DPO are displayed in Table 15. In summary, our preference mixes come from different prompt sources, such as SFT data, WildChat and Persona

发展评估,同时还擅长有针对性的技能. Most of the preference data mix ablations are run for the 8B model, We start with prompts used for SFT and generate on-policy and off-policy preference data, resulting in 96,911 (off-policy) and 19,444 (on-policy) preference instances.考虑到这种偏好基础,我们消除了在组合中添加额外的提示源以及这些添加如何影响下游评估性能,特别是针对 AlpacaEval 上的精确指令遵循、数学和一般聊天性能等技能.表 16 显示了包含或排除偏好数据集如何影响平均性能. Our final mixes for Tülu 3 8B DPO and Tülu 3 70B DPO are displayed in Table 15. In summary, our preference mixes come from different prompt sources, such as SFT data, WildChat and Persona

12As proposed in the original Rafailov et al. (2024), but was not yet well optimized to successful hyperparameters until Meng et al. (2024).

12 正如 Rafailov 等人最初提出的. （2024）,但直到孟等人（2024）尚未对成功的超参数进行很好的优化. （2024）.

13https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences/blob/main/README.md

13https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences/blob/main/README.md

22

<!-- page 23 of 82 -->

Dataset Count 8B 70B

SFT Reused On-policy 19,444 ✓ ✓

SFT Reused Off-policy 96,911 ✓ ✓

IF-Augmented 65,530 ✓ ✓

WildChat IF 10,792 ✓ ✓

WildChat Reused 17,207 ✓ ✓

WildChat Unused 82,783 ✓

Ultrafeedback (Cleaned) 41,635 ✓ ✓

Persona IF 19,890 ✓

Total 354,192 271,409 334,302

Table 15 Summary of our best preference dataset mixes for Tülu 3 8B DPO and Tülu 3 70B DPO . IF is short for Instruction Following.

IF. It includes prompts seen during SFT training but also new, unseen prompts.

如果.它包括 SFT 训练期间看到的提示,但也包括新的、未见过的提示.

5.3 Key Findings of Data Ablations · 数据消融的主要发现

We perform several ablations to inform the design decisions of the synthetic preference pipeline (subsubsec-

我们进行了几次消融,以告知合成偏好管道（亚亚秒级）的设计决策

tion 5.2.1) and the composition of the Tülu 3 preference mix (subsubsection 5.2.2).

化 5.2.1）和 Tülu 3 偏好组合的组成（第 5.2.2 小节）.

80

80

60

60

40

40

Performance

Performance

20

20

AVG AE MATH GSM8k 0

AVG AE MATH GSM8k 0

Initial 8B SFT 5% 10% 25% 50% 75% 100%

Initial 8B SFT 64k 180k 383k

Figure 9 Effect of scaling a preference dataset by du- plicating prompts on downstream DPO performance using the Ultrafeedback dataset. All sizes have the same number of unique prompts (64k).

Figure 8 Effect of scaling the size of the preference dataset, specifically the number of unique prompts, on downstream DPO model performance (AE: AlpacaE- val).

Scaling the Number of Unique Prompts Improve Downstream DPO Performance. First, we investigate whether increasing the number of prompts will yield improvements in downstream DPO performance. To do so, we measure the downstream DPO model performance at different sizes of a fixed amount of preferences with unique prompts. Figure 8 shows that there are noticeable performance gains across several metrics as the size of the preference dataset increases. This suggests that dataset scaling is important to achieve improvements in downstream model performance: our final preference mixes (Table 15) contain more than 270k data points for the 8B model and more than 330k instances for the 70B model, which is considerably bigger than many available preference datasets.

扩展独特提示的数量可提高下游 DPO 性能.首先,我们研究增加提示数量是否会改善下游 DPO 性能.为此,我们使用独特的提示来测量不同大小的固定数量偏好下的下游 DPO 模型性能.图 8 显示,随着偏好数据集大小的增加,多个指标的性能都有显着提升.这表明数据集扩展对于实现下游模型性能的改进非常重要：我们的最终偏好组合（表 15）包含 8B 模型的超过 27 万个数据点和 70B 模型的超过 33 万个实例,这比许多可用的偏好数据集大得多.

We also explore whether duplicating prompts, i.e. same prompts with different responses, is a viable approach

我们还探讨了重复提示（即具有不同响应的相同提示）是否是一种可行的方法

to scaling the size of a preference dataset and whether it will lead to gains in downstream DPO performance. To do so, we expanded the Ultrafeedback dataset, which originally had four responses for each prompt, by

扩展偏好数据集的大小以及是否会提高下游 DPO 性能.为此,我们扩展了 Ultrafeedback 数据集,该数据集最初对每个提示有四个响应,方法是

23

<!-- page 24 of 82 -->

SFT Mix P-IF WildC.-IF SFT-IF WCβ WCα UFδ DA UF CocoNot Avg.

✓ ✓ ✓ ✓ ✓ 62.27 ✓ ✓ ✓ ✓ ✓ ✓ 61.99 ✓ ✓ ✓ ✓ 61.83 ✓ ✓ ✓ ✓ 61.76 ✓ ✓ ✓ 61.59 ✓ ✓ ✓ ✓ ✓ ✓ 61.55 ✓ ✓ 61.35 ✓ ✓ ✓ ✓ 61.29 ✓ ✓ ✓ ✓ ✓ 61.25 ✓ ✓ ✓ ✓ ✓ ✓ 61.17 ✓ ✓ 60.87 ✓ ✓ 60.86 ✓ ✓ 60.84 ✓ 60.54

Table 16 Some of our dataset mixing experiments to obtain the final preference dataset mix. We include prompts from DaringAnteater (DA), our SFT Mix (SFT), Ultrafeedback (UF), Persona prompts for different skills (P-IF, P-Code, P-Math), Tülu 3 instruction following prompts (Tülu 3-IF), i.e. IF-Augmented, CocoNot, the IF subset of Daring Anteater Wang et al. (2024d) and WildChat (WildC.). (α: prompts used during SFT, β: prompts from datasets subsampled, yet unused, for SFT, δ: only used the prompts, the completions and preferences were regenerated using the pipeline described in subsubsection 5.2.1).

creating additional pair combinations of responses. This expansion will naturally cause duplicated prompts, but with different chosen and rejected pairs sampled from the four responses in UltraFeedback, leading to preference datasets with 64k-, 180k-, and 383k instances. Figure 9 shows that, on average, the 383k-size preference dataset performs similarly to the 64k preference dataset. We also observe a slight performance degradation on DROP, GSM8k, and AlpacaEval as the number of duplicated prompts increase. This suggests that scaling via prompt duplication does not necessarily yield into significant gains in downstream DPO performance, and investing in the collection of unique prompts and proper mixing is more important for downstream evaluations.

创建额外的响应对组合.这种扩展自然会导致重复的提示,但会从 UltraFeedback 中的四个响应中采样不同的选择和拒绝对,从而产生具有 64k、180k 和 383k 实例的偏好数据集.图 9 显示,平均而言,383k 大小的偏好数据集的性能与 64k 大小的偏好数据集类似.我们还观察到,随着重复提示数量的增加,DROP、GSM8k 和 AlpacaEval 的性能略有下降.这表明,通过提示复制进行扩展并不一定会显着提高下游 DPO 性能,并且投资于独特提示的收集和适当的混合对于下游评估更为重要.

Unused Prompts Lead to Higher Performance vs. Reusing Prompts From SFT Mix. We then compare including new prompts and re-using prompts from the SFT stage on their effect on downstream DPO performance. To do so, we sampled 100k prompts from the SFT dataset mix that were used during training (as shown in Table 7) and compare it against prompts from the same open datasets (e.g., OpenAssistant, SciRIFF, Aya, Persona, WildChat, etc.) we subsampled from but left unused during SFT. Figure 10 shows that the unused dataset has a slightly higher performance as opposed to reusing prompts. This suggests that the presence of new prompts can help improve downstream DPO performance. Though, as seen in our best mix, combining unused and reused prompts seems to lead to the best result.

与重用 SFT Mix 中的提示相比,未使用的提示可带来更高的性能.然后,我们比较包含新提示和重复使用 SFT 阶段的提示对下游 DPO 性能的影响.为此,我们从训练期间使用的 SFT 数据集组合中采样了 100k 个提示（如表 7 所示）,并将其与来自我们进行二次采样但在 SFT 期间未使用的相同开放数据集（例如 OpenAssistant、SciRIFF、Aya、Persona、WildChat 等）的提示进行比较.图 10 显示,与重用提示相比,未使用的数据集具有稍高的性能.这表明新提示的存在有助于提高下游 DPO 性能.不过,正如我们的最佳组合所示,结合未使用和重复使用的提示似乎会带来最佳结果.

On-policy Data Improves Downstream DPO Performance. We investigate whether the inclusion of on-policy data, i.e., text generations from the SFT model that will be used as the base model for preference finetuning,

按策略数据提高下游 DPO 性能.我们研究是否包含政策数据,即来自 SFT 模型的文本生成,该模型将用作偏好微调的基础模型,

improves downstream model performance. Given the same set of prompts sourced from the SFT mix in section 4, we generate preferences from off-policy models and compared it to a mix that is strictly on-policy (i.e., one of the response is always from the Initial 8B SFT model, and the other response is from the off-policy

提高下游模型性能.给定来自第 4 节中的 SFT 组合的相同提示集,我们从离策略模型生成偏好,并将其与严格在策略的组合进行比较（即,其中一个响应始终来自初始 8B SFT 模型,另一个响应来自离策略）

models). We also compare it on a combination of both on-policy and off-policy data: we sample instances from the strict on-policy dataset and add it to the off-policy dataset so that the responses from each model is distributed equally. Figure 11 shows that including on-policy data improves aggregated downstream DPO performance compared to a completely off-policy dataset where prompt completions were sampled from other models.

模型）.我们还对在策略和离策略数据的组合进行比较：我们从严格的在策略数据集中采样实例,并将其添加到离策略数据集中,以便每个模型的响应均匀分布.图 11 显示,与完全脱离策略的数据集（其中从其他模型中采样即时完成数据）相比,包含策略内数据可以提高聚合的下游 DPO 性能.

24

<!-- page 25 of 82 -->

LLM Judge Avg. MMLU TQA PopQA BBH CHU CHU+ GSM8k Drop MATH IFEval AE Safety

法学硕士法官平均. MMLU TQA PopQA BBH CHU CHU+ GSM8k Drop MATH IFEval AE 安全

GPT-4o 57.3 64.8 56.1 30.1 66.3 87.0 80.7 75.3 62.7 20.3 60.4 20.6 62.7 LLama 3.1 405B 57.2 64.8 56.0 30.3 67.4 86.2 80.8 75.1 62.0 20.1 59.0 21.5 62.8 GPT-4 Turbo 57.0 64.6 55.7 30.1 66.4 86.6 79.4 75.5 62.6 20.1 59.9 20.6 62.2 GPT-4o Mini 56.9 64.4 55.4 30.4 66.2 86.6 79.8 74.8 60.7 20.9 60.1 21.4 61.6 Llama 3.1 70B 56.6 64.3 55.5 30.2 66.6 85.3 81.4 74.8 62.1 20.1 58.2 18.6 62.2

Table 17 Performance of DPO models trained on preference annotations by different LLM judges. Due to the proximity of the numbers, we have not bolded the max per evaluation.

Figure 10 Effect of reusing prompts from SFT mix and new prompts from the same datasets subsampled for the SFT dataset mix.

Figure 11 Effect of including on-policy data dur- ing the Response Generation stage of the synthetic preference data pipeline on downstream DPO model performance.

Performance Across LLM Judges are Similar, with GPT-4o Leading Slightly Ahead. In order to determine which judge to use for obtaining preference annotations, we test several commercial and open-source LLM judges such as GPT-4 (GPT-4-turbo-2024-04-09, GPT-4o-2024-08-06, gpt-4o-mini-2024-07-18) and Llama 3.1 (70B and 405B) on the same set of 10k randomly-sampled Ultrafeedback prompts and responses. In general,

LLM 评委的表现相似,GPT-4o 略微领先.为了确定使用哪个法官来获取偏好注释,我们在同一组 10k 上测试了几种商业和开源 LLM 法官,例如 GPT-4（GPT-4-turbo-2024-04-09、GPT-4o-2024-08-06、gpt-4o-mini-2024-07-18）和 Llama 3.1（70B 和 405B）随机采样的 Ultrafeedback 提示和响应.一般来说,

GPT-4o, Llama 3.1 405B, and GPT-4 Turbo perform similarly across all benchmarks, with GPT-4o leading slightly ahead on the aggregated average performance as shown in Table 17. In the synthetic preference pipeline for Tülu 3, we opted for GPT-4o-2024-08-06 due to its ease-of-use, cheaper cost per request, and batch inference speed via OpenAI’s Batch API.14

GPT-4o、Llama 3.1 405B 和 GPT-4 Turbo 在所有基准测试中的表现相似,其中 GPT-4o 在聚合平均性能方面略微领先,如表 17 所示.在 Tülu 3 的综合偏好管道中,我们选择了 GPT-4o-2024-08-06,因为它易于使用、每个请求的成本更便宜,并且通过 OpenAI 的 Batch 实现批量推理速度. API.14

Going Beyond Ultrafeedback. Previous work on preference learning using openly available datasets has shown that the UltraFeedback (Cui et al., 2023) preference dataset generally outperforms other preference datasets (Ivison et al., 2023). In Figure 12 we show that we were able to significantly surpass DPO training on UltraFeedback by training on our best mix. The improvement is greater for the 70B model (+3.3 vs. +1.8), we hypothesize that this is because UltraFeedback’s completions are mainly sourced from models that are less capable than the 70B model we are starting with. Helpsteer2 Wang et al. (2024d), another high-quality preference dataset, also performs lower than our best mix on the 8B model.

超越超反馈.先前使用公开数据集进行偏好学习的工作表明,UltraFeedback（Cui 等人,2023）偏好数据集通常优于其他偏好数据集（Ivison 等人,2023）.在图 12 中,我们展示了通过使用最佳组合进行训练,我们能够显着超越 UltraFeedback 上的 DPO 训练. 70B 模型的改进更大（+3.3 vs. +1.8）,我们假设这是因为 UltraFeedback 的补全主要来自能力不如我们开始的 70B 模型的模型. Helpsteer2 王等人. (2024d),另一个高质量的偏好数据集,在 8B 模型上的表现也低于我们的最佳组合.

Persona Preference Data. From the three persona preference datasets targeting instruction following, coding and math skills, only Tülu 3 Persona IF improves the average eval score and the targeted IFEval score (see Figure 13). Neither Tülu 3 Persona Math nor Tülu 3 Persona Code improve their respective targeted

角色偏好数据.在针对指令遵循、编码和数学技能的三个角色偏好数据集中,只有 Tülu 3 Persona IF 提高了平均评估分数和目标 IFEval 分数（见图 13）. Tülu 3 Persona Math 和 Tülu 3 Persona Code 都没有提高各自的目标

evaluations and slightly harm the average score. We therefore only include the Tülu 3 Persona IF preferences in our final mix.

评价并稍微损害平均分.因此,我们在最终组合中仅包含 Tülu 3 Persona IF 偏好.

Targeting IF. We created preference data targeted to improve a model’s precise instruction following skills.

靶向 IF.我们创建了偏好数据,旨在提高模型的精确指令跟随技能.

1. Persona IF: We take a subset of our collected instruction following SFT dataset, If-Persona-Sft and

1. Persona IF：我们采用 SFT 数据集、If-Persona-Sft 和 If-Persona-Sft 收集的指令的子集

14https://platform.openai.com/docs/guides/batch

25

<!-- page 26 of 82 -->

Figure 12 Effect of different DPO mixes on 8B and 70B models: UltraFeedback, Helpsteer2, and our best preference mix.

86.1

84.4

82.6

81.9

79.1

74.7

72.3

72.1

60.8

60.5

60.1

58.7

41.2

40.9

40.9

31.5

Performance (%)

Average IFEval MATH CHU

Figure 13 Adding persona preference data to the SFT Reused mix for DPO.

convert it into a preference dataset. Each example in If-Persona-Sft dataset contains a (prompt, constraints, response) tuple. We start by rewriting each prompt in the subset to relax one of the given constraints. More specifically, we prompt GPT-4o to generate rewrites such that the new response to the modified prompt is no longer a valid response for the original prompt (does not satisfy all the constraints). We then use the response to the new modified prompt as the rejected response, and create (chosen, rejected) pairs to form our If-Persona-Pref dataset containing close to 20K examples.

将其转换为偏好数据集. If-Persona-Sft 数据集中的每个示例都包含一个（提示、约束、响应）元组.我们首先重写子集中的每个提示以放宽给定的约束之一.更具体地说,我们提示 GPT-4o 生成重写,以便对修改后的提示的新响应不再是原始提示的有效响应（不满足所有约束）.然后,我们使用对新修改提示的响应作为被拒绝的响应,并创建（选择、拒绝）对以形成包含近 20K 个示例的 If-Persona-Pref 数据集.

2. IF-augmented: We randomly sample instructions from the Tülu 2 SFT mix and combine them with constraints from the taxonomy in Zhou et al. (2023). The chosen and rejected completions are obtained through the synthetic pipeline in §5.2.1.

2. IF 增强：我们从 Tülu 2 SFT 混合中随机抽取指令,并将它们与 Zhou 等人的分类法的约束相结合. （2023）.选择和拒绝的完井是通过第 5.2.1 节中的合成管道获得的.

3. WildChat IF: We sample instructions from WildChat (Zhao et al., 2024) which contain constraints. For this purpose we asked GPT-4 to extract whether or not a prompt includes a constraint.

3. WildChat IF：我们从 WildChat（Zhao 等人,2024）中抽取包含约束的指令样本.为此,我们要求 GPT-4 提取提示是否包含约束.

For IF-augmented, we run two analyses. We generate an additional set of more than 66k instances and we then run the chosen completions through constraint verifier functions, and only add those instances to the final set which actually fulfilled the constraint(s). This leaves us with a cleaned set of about 26k preferences, which we call IF-augmented-verified. In Figure 14 we show that the IF-persona preferences significantly improve IFEval scores beyond the baseline mix, while minimally harming average performance. The IF-augmented-verified dataset improves IFEval performance only by 1 point, while also slightly harming the average performance. Combining IF-persona with IF-augmented-verified leads to the best IFEval performance, but to a slightly lower average. We therefore choose to include IF-augmented (not verified) and Persona IF in the final 8B

对于 IF 增强,我们进行了两项分析.我们生成超过 66k 个实例的附加集合,然后通过约束验证器函数运行所选的完成,并且仅将这些实例添加到实际满足约束的最终集合中.这给我们留下了一组大约 26k 的偏好设置,我们称之为 IF 增强验证.在图 14 中,我们表明 IF 角色偏好显着提高了 IFEval 分数,超出了基线组合,同时对平均性能的影响最小. IF 增强验证数据集仅将 IFEval 性能提高了 1 个点,同时也略微损害了平均性能.将 IF-persona 与 IF-augmented-verified 相结合会产生最佳的 IFEval 性能,但平均值会稍低.因此,我们选择在最终的 8B 中包含 IF-augmented（未验证）和 Persona IF

26

<!-- page 27 of 82 -->

Original dataset Regen. using synthetic pipeline

Average IFEval

Figure 15 Comparing the use of the original completions to regenerating completions using our synthetic preference pipeline.

Figure 14 Performance of different IF-targeted preference mixes, average and IFEval. Best here consists of our final best mix for the 8B model (minus Persona-IF).

DPO mix, which leads to both a satisfiying average and IFEval score.

DPO 组合,可以获得令人满意的平均分和 IFEval 分数.

Wildchat. Our ablations show that adding preference data consisting of WildChat prompts and chosen/rejected pairs obtained using our synthetic preference data pipeline, generally improves DPO performance. Ablations in Figure 5.2.2 reveal that adding WildChat prompts seen during SFT training to the DPO mix leads to better average performance than combining the unused with the reused WildChat prompts.

野聊.我们的消融表明,添加由 WildChat 提示和使用我们的综合偏好数据管道获得的选择/拒绝对组成的偏好数据通常可以提高 DPO 性能.图 5.2.2 中的消融表明,将 SFT 训练期间看到的 WildChat 提示添加到 DPO 组合中,比将未使用的 WildChat 提示与重复使用的 WildChat 提示相结合可带来更好的平均性能.

Comparing original preference datasets and their regenerated counterparts. We also investigate whether the preference dataset generated by the synthetic pipeline in §5.2.1 can yield to gains in downstream DPO performance on existing datasets. To do so, we take the prompts from open-source datasets such as Helpsteer2, Ultrafeedback, and MultiPref (Miranda et al., 2024), then regenerate their completions and preference annotations using the synthetic data pipeline. Figure 15 shows that the downstream DPO performance of the regenerated dataset is better than the original dataset, suggesting that the synthetic pipeline itself can yield to performance gains.

比较原始偏好数据集和重新生成的对应数据集.我们还研究了第 5.2.1 节中的合成管道生成的偏好数据集是否可以提高现有数据集上的下游 DPO 性能.为此,我们从 Helpsteer2、Ultrafeedback 和 MultiPref（Miranda 等人,2024）等开源数据集获取提示,然后使用合成数据管道重新生成其补全和偏好注释.图 15 显示,重新生成的数据集的下游 DPO 性能优于原始数据集,这表明合成管道本身可以带来性能提升.

5.4 Preference Tuning Recipe and Analyses · 偏好调整方法和分析

5.4.1 Hyperparameter and Algorithm Design · 超参数与算法设计

In light of the significant amount of work on improving DPO and related algorithms since the release of Tülu 2, we revisited our hyperparameter and algorithm choices alongside our preference datasets. We ablated both algorithm and hyperparameter choices using an early SFT checkpoint and the UltraFeedback dataset. We explored using DPO, SimPO (Meng et al., 2024), and length-normalized DPO. Our results are shown

鉴于自 Tülu 2 发布以来在改进 DPO 和相关算法方面所做的大量工作,我们重新审视了我们的超参数和算法选择以及我们的偏好数据集.我们使用早期的 SFT 检查点和 UltraFeedback 数据集消除了算法和超参数选择.我们探索了使用 DPO、SimPO (Meng et al., 2024) 和长度归一化 DPO.我们的结果已显示

in Table 18. We found that only length-normalized DPO outperformed our base checkpoint overall, and so further tuned it, resulting in the final hyperparameters shown in Table 20.

在表 18 中.我们发现只有长度归一化的 DPO 总体上优于我们的基本检查点,因此进一步对其进行了调整,得到了表 20 中所示的最终超参数.

We lowered the learning rate and increased the batch size for the 70B training based on the fact that it is

我们降低了学习率并增加了 70B 训练的批量大小,因为它是

common to lower the learning rate and increase batch size when doing SFT with larger models (Touvron et al., 2023).

在使用较大模型进行 SFT 时,通常会降低学习率并增加批量大小（Touvron 等人,2023）.

The 8B DPO model is trained for 10 hours on 8 Nvidia H100 GPUs and the 70B DPO model is trained for 19 hours on 64 interconnected H100s.

8B DPO 模型在 8 个 Nvidia H100 GPU 上训练 10 小时,70B DPO 模型在 64 个互连的 H100 GPU 上训练 19 小时.

The DPO training uses a maximum sequence length of 2048.

27

<!-- page 28 of 82 -->

Algorithm LR γ −β ratio β Epochs Batch Size Average Score

SFT Base - - - - - 55.7

SimPO 5.00E-07 0.5 2 1 128 51.8 SimPO 5.00E-07 0.3 10 1 128 52.9 DPO 5.00E-07 - 0.1 3 32 55.2

PPO 1.00E-06 - 0.0325 1 64 54.5 PPO 1.00E-06 - 0.05 1 64 55.5

DPO-norm 1.00E-07 - 5 3 32 56.1 DPO-norm 5.00E-07 - 10 3 32 55.2 DPO-norm 5.00E-07 - 15 3 32 55.7 DPO-norm 5.00E-07 - 2 3 32 46.8 DPO-norm 5.00E-07 - 5 3 32 53.4 DPO-norm 5.00E-07 - 5 1 32 57.3

Table 18 Hyperparameters and algorithms examined for DPO tuning. We use UltraFeedback as the training dataset in all cases, and train on top of an early Tülu 3 version. DPO-norm refers to the length-normalized DPO variant proposed in Meng et al. (2024). We explore hyperparameters suggested by prior work (Meng et al., 2024; Ivison et al., 2023). For PPO, we train reward models on UltraFeedback and reuse prompts during online training, following the hyperparameters in Ivison et al. (2024). We find that length-normalized DPO performs best overall.

Data LR Avg. Performance

Hyperparameter 8B 70B

Learning Rate 5 × 10-7 2 × 10-7

Mix 1

5.0 × 10-7 72.74 2.0 × 10-7 71.17 1.5 × 10-7 71.12 1.0 × 10-7 71.06

Mix 2 5.0 × 10-7 71.14 2.0 × 10-7 74.35

Learning Rate Schedule Linear Linear Batch Size (effective) 128 128 Max Token Length 2,048 2,048 KL penalty coefficient β 5 5 Warm up ratio 0.1 0.1 Number of Epochs 1 1

学习率计划 线性 线性 批量大小（有效） 128 128 最大令牌长度 2,048 2,048 KL 惩罚系数 β 5 5 预热比率 0.1 0.1 时期数 1 1

Table 20 Final DPO Training Hyperparameters. We use the length-normalized variant of DPO pro- posed in Meng et al. (2024).

Table 19 Learning rate ablations for the 70B DPO model, for two different preference mixes: Mix 1: Tülu-3-Persona-IF, Tulu-3-Helpsteer2, Ultrafeedback, Tulu-3-SFT-reused (On- policy), Mix 2: Best 70B Mix (both trained on an older SFT base).

Learning Rate Ablations for 70B. We ran a small hyperparameter search over a set of leraning rates using a generally well performing preference data mix15 and our final best mix. Table 19 shows that either a learning rate of 2.0 × 10-7 or 5.0 × 10-7, depending on data mix, performs better than a lower learning rate. For our final DPO models we decided on using a learning rate of 2.0 × 10-7.

70B 的学习率消融.我们使用总体表现良好的偏好数据组合15和我们的最终最佳组合对一组学习率进行了小型超参数搜索.表 19 显示,根据数据混合,2.0 × 10-7 或 5.0 × 10-7 的学习率比较低的学习率表现更好.对于最终的 DPO 模型,我们决定使用 2.0 × 10-7 的学习率.

Comparison Between PPO and DPO. We also conducted a more in depth ablation study comparing PPO and DPO later in development. We anchored a DPO preference mix in the development history to train an RM. We use the same setup as Stiennon et al. (2020); Ouyang et al. (2022); Huang et al. (2024a), we only extract

PPO 和 DPO 的比较.我们还在开发后期进行了更深入的消融研究,比较了 PPO 和 DPO.我们在开发历史中锚定了 DPO 偏好组合来训练 RM.我们使用与 Stiennon 等人相同的设置. （2020）；欧阳等人. （2022）；黄等人. (2024a),我们只提取

√

the RM’s logits at the end-of-sequence (EOS) token as the reward model. Also, the linear head to output reward scalars is initialized with weights according to N(0, 1/

RM 在序列末尾（EOS）令牌处的 logits 作为奖励模型.此外,输出奖励标量的线性头根据 N(0, 1/

(dmodel + 1)). We use the same prompts in the DPO preference mix to make a controlled comparison between DPO and PPO.

(d模型+1)).我们在 DPO 偏好组合中使用相同的提示来对 DPO 和 PPO 进行受控比较.

The reward model was trained only once and we did not attempt to tune the RM’s performance. Evaluating RM’s performance can be tricky because strong RM performance on RM-specific benchmarks does not necessarily translate to better downstream performance for PPO (Ivison et al., 2024; Chen et al., 2024).

奖励模型只训练了一次,我们没有尝试调整 RM 的性能.评估 RM 的性能可能很棘手,因为在特定于 RM 的基准上强劲的 RM 性能并不一定会转化为 PPO 更好的下游性能（Ivison 等人,2024 年；Chen 等人,2024 年）.

15Tülu-3-Persona-IF, Tulu-3-Helpsteer2, Ultrafeedback, Tulu-3-SFT-Used (On-policy).

15Tülu-3-Persona-IF、Tulu-3-Helpsteer2、Ultrafeedback、Tulu-3-SFT-已使用（政策内）.

28

<!-- page 29 of 82 -->

Hyperparameters for optimizing a RM for optimizing against RLVR

用于优化 RM 以针对 RLVR 进行优化的超参数

-10.0 -10.0

Discount Factor γ 1.0 1.0 General Advantage Estimation λ 0.95 0.95 Mini-batches Nmb 1 1 PPO’s Clipping Coefficient ε 0.2 0.2 Value Function Coefficient c1 0.1 0.1 Gradient Norm Threshold 1.0 1.0 Learning Rate Schedule Linear Linear Generation Temperature 1.0 1.0 Max Token Length 2,048 2,048 Max Prompt Token Length 2,048 2,048 Penalty Reward Value for Responses without an EOS Token

贴现因子 γ 1.0 1.0 一般优势估计 λ 0.95 0.95 小批量 Nmb 1 1 PPO 的裁剪系数 ε 0.2 0.2 价值函数系数 c1 0.1 0.1 梯度范数阈值 1.0 1.0 学习率计划线性 线性生成温度 1.0 1.0 最大代币长度 2,048 2,048 最大提示令牌长度 2,048 2,048 没有 EOS 令牌的响应的惩罚奖励值

Learning Rate 3 × 10-7 3 × 10-7 (1 × 10-7 for 70B) Batch Size (effective) 224 224 (640 for 70B) PPO Update Iterations K 1 4 Response Length 1,024 2,048 (1,024 for GSM8K only) Total Episodes 300,000 100,000 KL penalty coefficient (β) [0.05, 0.03, 0.02, 0.01] [0.1, 0.05, 0.03, 0.01] Warm up ratio (ω) [0.1, 0.0] [0.0, 0.1]

Table 21 The hyperparameters of PPO used for 1) optimizing against a general RM and 2) optimizing against the verifiable reward function. The differences between the hyperparameters are highlighted. The final 8B RLVR model used β = 0.05 and ω = 0.0; the final 70B RLVR model used β = 0.07 and ω = 0.07

Furthermore, iterating with RM and PPO is more expensive than iterating with DPO, so we decided to do most of our preference tuning experiments via DPO. The hyperparameters for the RM and PPO can be found in Table 36 and Table 21. The results can be found in Figure 16.

此外,使用 RM 和 PPO 迭代比使用 DPO 迭代更昂贵,因此我们决定通过 DPO 进行大部分偏好调整实验. RM和PPO的超参数可以在表36和表21中找到.结果可以在图16中找到.

Here are our findings:

1. PPO Gets Similar Average Scores with DPO in this Non-Tuned Setup Overall, we found that PPO could reach a comparable level of performance to DPO (albeit slightly lower) in this controlled setup.

1. 在这种未调整的设置中,PPO 获得与 DPO 相似的平均分数 总体而言,我们发现在此受控设置中,PPO 可以达到与 DPO 相当的性能水平（尽管略低）.

2. PPO is More Computationally Expensive The PPO runtime is roughly 28 hours using two nodes, whereas the DPO runtime is about 4 hours using a single node.

2. PPO 的计算成本更高 使用两个节点时,PPO 运行时间约为 28 小时,而使用单个节点时,DPO 运行时间约为 4 小时.

If we use more computational budget or do more tuning, it is entirely possible that we can push up the PPO’s performance even higher. However, given limited resources and the subtlety in RM evaluation, using DPO for preference tuning seems more economical. We decide to use PPO primarily for RLVR, to be introduced in Section 6.

如果我们使用更多的计算预算或进行更多的调整,我们完全有可能将 PPO 的性能推得更高.然而,考虑到有限的资源和 RM 评估的微妙性,使用 DPO 进行偏好调整似乎更经济.我们决定主要将 PPO 用于 RLVR,将在第 6 节中介绍.

5.4.2 Infrastructure for Scaling DPO · 用于扩展 DPO 的基础设施

To run the 70B DPO training, we found it useful to implement two key optimizations for reducing the GPU footprint of DPO training:

为了运行 70B DPO 训练,我们发现实施两个关键优化以减少 DPO 训练的 GPU 占用非常有用：

1. Caching DPO Log Probs To reduce GPU memory usage, we pre-compute and cache log probabilities across the dataset using the initial model, rather than keeping a reference DPO model in memory during training like the canonical implementation (von Werra et al., 2020; Rafailov et al., 2024). This optimization eliminates the need to allocate GPU memory for the reference model.

1. 缓存 DPO 日志概率为了减少 GPU 内存使用,我们使用初始模型预先计算并缓存整个数据集中的日志概率,而不是像规范实现那样在训练期间将参考 DPO 模型保留在内存中（von Werra 等人,2020 年；Rafailov 等人,2024 年）.此优化无需为参考模型分配 GPU 内存.

2. Separate Forward Passes for Chosen and Rejected Sequences The canonical DPO implementation (von

2. 选择和拒绝序列的单独前向传递 规范的 DPO 实现 (von

29

<!-- page 30 of 82 -->

Figure 17 The peak GPU memory allocated can be reduced by caching the reference policy’s logprobs on the preference dataset and doing forward passes separately for the chosen and rejected pairs.

Figure 16 The average scores of PPO runs with different learning rate warm-up ratios ω, KL penalty coefficient β. PPO can get similar (though slightly lower) average scores as DPO.

Prompt Dataset Count Verification Reference

GSM8K Train 7,473 Exact match against extracted answer Cobbe et al. (2021)

GSM8K Train 7,473 与提取的答案 Cobbe 等人完全匹配. (2021)

MATH Train 7,500 Exact match against extracted answer Hendrycks et al. (2021)

MATH Train 7,500 与提取的答案完全匹配 Hendrycks 等人. (2021)

IF verifiable 14,973 Prompt-specific verifiers -

Total 29,946

Table 22 Summary of our verifiable prompt dataset. New datasets released with Tülu 3 are color-coded for emphasis.

Werra et al., 2020; Rafailov et al., 2024) also concatenates the chosen and rejected sequences during the

韦拉等人,2020； Rafailov et al., 2024) 还连接了选择和拒绝的序列

forward pass, effectively doubling the batch size and increasing GPU memory requirements. To save GPU memory, we simply perform the forward passes separately on the chosen and rejected completions.

前向传递,有效地将批量大小加倍并增加 GPU 内存需求.为了节省 GPU 内存,我们只需对选定和拒绝的完成分别执行前向传递.

We empirically validated these two techniques on the Llama 3.1 model and found they resulted in near

我们在 Llama 3.1 模型上凭经验验证了这两种技术,发现它们的结果接近

identical training losses. As expected, the model uses less GPU memory when using the two techniques on an 8xH100, as shown in Figure 17.

相同的训练损失.正如预期的那样,在 8xH100 上使用这两种技术时,模型使用的 GPU 内存更少,如图 17 所示.

6 Reinforcement Learning with Verifiable Rewards · 基于可验证奖励的强化学习

In Tülu 3, we introduce Reinforcement Learning with Verifiable Rewards (RLVR), a novel method for training language models on tasks with verifiable outcomes such as mathematical problem-solving and instruction following. RLVR leverages the existing RLHF objective but replaces the reward model with a verification function, as shown conceptually in Figure 18. When applied to domains with verifiable answers, such as mathematics and verifiable instruction following tasks (Zhou et al., 2023), RLVR demonstrates targeted improvements on benchmarks like GSM8K while maintaining performance across other tasks. RLVR can be seen as a simplified form of existing approaches for bootstrapping LM reasoning (Zelikman et al., 2022, 2024; Hoffman et al., 2023) or a simpler form of RL with execution feedback (Gehring et al., 2024), in which we simply use answer matching or constraint verification as a binary signal to train the model. While this has been done for improving math skills alone in prior work (Kazemnejad et al., 2024), we further extend RLVR to cover multiple evaluations and test how it can improve overall model performance, integrating it as a component of a generalist training pipeline.

在 Tülu 3 中,我们引入了可验证奖励的强化学习 (RLVR),这是一种针对具有可验证结果的任务（例如数学问题解决和指令遵循）训练语言模型的新方法. RLVR 利用现有的 RLHF 目标,但用验证函数取代了奖励模型,如图 18 中的概念性所示.当应用于具有可验证答案的领域时,例如数学和可验证的指令跟踪任务（Zhou 等人,2023）,RLVR 展示了对 GSM8K 等基准的有针对性的改进,同时保持其他任务的性能. RLVR 可以被视为现有引导 LM 推理方法的简化形式 (Zelikman et al., 2022, 2024; Hoffman et al., 2023) 或带有执行反馈的 RL 的更简单形式 (Gehring et al., 2024),其中我们简单地使用答案匹配或约束验证作为二进制信号来训练模型.虽然在之前的工作中这样做只是为了提高数学技能（Kazemnejad 等人,2024）,但我们进一步扩展了 RLVR 以涵盖多项评估并测试它如何提高整体模型性能,并将其集成为通才训练管道的组成部分.

RLVR is based on a simple principle, common in RL literature, applied to language models: the policy only

RLVR 基于 RL 文献中常见的简单原理,应用于语言模型：仅策略

30

<!-- page 31 of 82 -->

Verifiable Reward

Scalar Reward

Completions

Policy Training

data Prompts

Policy Update

Figure 18 An overview of how Reinforcement Learning with Verifiable Rewards (RLVR) works. We sample completions from a policy model given a set of prompts, and verify their correctness using a deterministic function. If the answer is verifiably correct, we provide reward of α, otherwise 0. We then train against this reward using PPO.

receives a reward when its generated responses are verifiably correct. More specifically, RLVR optimizes the following objective:16

当其生成的响应可验证正确时,它将获得奖励.更具体地说,RLVR 优化了以下目标：16

max

πθ Ey∼πθ(x) [RRLVR(x, y)] = [v(x, y) −βKL[πθ(y∣x)∥πref(y∣x)]] (7)

where v is the verifiable reward function. v takes in a prompt and completion pair (x, y), and checks if the answer is correct within the generated text:

其中 v 是可验证的奖励函数. v 接受提示和完成对 (x, y),并检查生成文本中的答案是否正确：

α if correct,

(8)

v(x, y) =

0 otherwise.

⎧⎪⎪⎪⎨⎪⎪⎪⎩

We train models with RLVR following preference finetuning, and we use the PPO (Schulman et al., 2017)

我们在偏好微调后使用 RLVR 训练模型,并使用 PPO (Schulman et al., 2017)

algorithm to optimize for the RLVR objective. We set α = 10 based on pilot experiments and did not tune it further.

针对 RLVR 目标进行优化的算法.我们根据试点实验设置 α = 10,没有进一步调整.

6.1 RLVR Data · RLVR数据

Creating data for RLVR entails obtaining prompts with an accompanying binary verifier (i.e., constructing a set of inputs x with accompanying verifier functions v). We focus on two domains (mathematics, exact instruction following) and three evaluations (GSM8K, MATH, IFEval) with relatively straightfoward methods for verification, and leave more complex verifiers to future work.17 In practice, the answer extraction and verification method is domain-dependent. We use three sources of training prompts and verifiers:

为 RLVR 创建数据需要使用随附的二进制验证器获取提示（即,使用随附的验证器函数 v 构建一组输入 x）.我们专注于两个领域（数学、精确指令遵循）和三个评估（GSM8K、MATH、IFEval）,采用相对直接的验证方法,并将更复杂的验证器留给未来的工作.17在实践中,答案提取和验证方法是依赖于领域的.我们使用三种来源的训练提示和验证器：

GSM8K. We use the GSM8k training set. We augment each sample with the standard 8-shot prompt using during evaluation to encourage the model to use chain-of-thought, and then extract the final number produced and compare to the ground-truth label to determine correctness.

GSM8K.我们使用 GSM8k 训练集.我们在评估过程中使用标准的 8 次提示来增强每个样本,以鼓励模型使用思维链,然后提取生成的最终数字并与真实标签进行比较以确定正确性.

MATH. We use the MATH training set. Similar to GSM8k, we augment each sample with the standard 3-shot CoT prompt used to encourage the model to generate chains of thought during evaluation, and then extract the answer and determine correctness following the ‘flex’ MATH evaluation logic.

数学.我们使用 MATH 训练集.与 GSM8k 类似,我们用标准的 3-shot CoT 提示来增强每个样本,用于鼓励模型在评估过程中生成思维链,然后按照“flex”数学评估逻辑提取答案并确定正确性.

IFEval. We randomly sample instructions from the Tülu 2 SFT mix and combine them with constraints from the taxonomy in Zhou et al. (2023). We have a verification function for each of the constraint templates that is able to verify whether a completion satisfies a constraint.

IFEval.我们从 Tülu 2 SFT 混合中随机抽取指令,并将它们与 Zhou 等人的分类法的约束相结合. （2023）.我们为每个约束模板都有一个验证函数,能够验证完成是否满足约束.

Given these prompts and verification functions, we then train the models via Proximal Policy Optimization (PPO) (Schulman et al., 2017) on these verifiable rewards. We combine all prompts together, results in a

考虑到这些提示和验证功能,我们然后通过近端策略优化 (PPO)（Schulman 等人,2017）根据这些可验证的奖励来训练模型.我们将所有提示组合在一起,结果是

16This is very similar to the standard KL-constrained RLHF objective, shown in Eq. 4, with a reward function instead of a learned reward model.

16这与标准 KL 约束 RLHF 目标非常相似,如方程 16 所示. 4、用奖励函数代替学习奖励模型.

17For example, recent work has found success in using code execution feedback to train models with RL (Gehring et al., 2024; Xu et al., 2024b).

17例如,最近的工作在使用代码执行反馈来训练 RL 模型方面取得了成功（Gehring 等人,2024；Xu 等人,2024b）.

31

<!-- page 32 of 82 -->

mixture of roughly 30,000 prompts with ground truth labels. We summarize our verifiable prompt mixture in Table 22.

大约 30,000 个带有真实标签的提示的混合.我们在表 22 中总结了可验证的提示混合物.

6.2 RLVR Recipe and Analyses · RLVR 配方和分析

Implementation Details. RL and RLHF have many subtle implementation details that can significantly impact training stability (Engstrom et al., 2020; Huang et al., 2022). As we use PPO to train our models against our verifiers, we adapt these effective implementation details from Huang et al. (2024a):

实施细节. RL 和 RLHF 有许多微妙的实现细节,可以显着影响训练稳定性（Engstrom 等人,2020；Huang 等人,2022）.当我们使用 PPO 来针对验证者训练我们的模型时,我们采用了 Huang 等人的这些有效的实现细节. （2024a）：

1. Initialize the Value model from a General RM We initialize the value model from the reward model for the RLVR setup (following the standard setup in Ziegler et al. (2019); Ouyang et al. (2022)).

1. 从通用 RM 初始化价值模型 我们从 RLVR 设置的奖励模型初始化价值模型（遵循 Ziegler 等人（2019）；Ouyang 等人（2022）中的标准设置）.

2. Disable Dropout We set the dropout probability to be 0 during RM and RL training (similar to Ziegler et al. (2019)). This ensures the token log probabilities can be computed deterministically during the forward passes of the policy model and reference model, allowing a more accurate estimation of the KL penalty. Furthermore, PPO calculates the token log probabilities in two phases: during the rollout phase and the learning phase. It is important to ensure the token log probabilities match up during these two phases: they produce a probability ratio of 1 during the first PPO epoch, so PPO can clip the ratio and apply the surrogate objective properly. If the log probabilities differ drastically due to dropout, all ratios could potentially be clipped, resulting in zero gradient.

2.禁用Dropout 我们在RM和RL训练期间将dropout概率设置为0（类似于Ziegler等人（2019））.这确保了在策略模型和参考模型的前向传递过程中可以确定地计算令牌对数概率,从而可以更准确地估计 KL 惩罚.此外,PPO 分两个阶段计算令牌日志概率：推出阶段和学习阶段.确保令牌日志概率在这两个阶段匹配非常重要：它们在第一个 PPO 时期产生的概率比为 1,因此 PPO 可以修剪该比率并正确应用代理目标.如果由于 dropout 而导致对数概率显着不同,则所有比率都可能被修剪,导致梯度为零.

3. Train with the SFT Dataset and Shuffle Between Epochs As pointed out in in Huang et al. (2024a), PPO can train for more episodes than the total available prompts, effectively training for multiple epochs. In our RLVR ablation experiments, we train for roughly 100, 000/7, 473 ≈13 epochs. We shuffle the prompts in between epochs. For our final runs, we examine model checkpoints every 40-100 steps and choose the best checkpoint on our development evaluation set.

3. 使用 SFT 数据集进行训练并在历元之间进行随机播放 正如 Huang 等人中指出的那样. (2024a),PPO 可以训练比可用提示总数更多的剧集,从而有效地训练多个时期.在我们的 RLVR 消融实验中,我们训练了大约 100, 000/7, 473 ≈13 epoch.我们在纪元之间随机排列提示.对于最终运行,我们每 40-100 步检查一次模型检查点,并在开发评估集上选择最佳检查点.

4. Non End-of-Sequence (EOS) Penalty During training, PPO typically sample a fixed amount of maximum tokens. If the sampled response does not end with an EOS token, we give a -10 penalty to encourage the model to always complete its responses.

4. 非序列结束（EOS）惩罚 在训练过程中,PPO 通常会采样固定数量的最大令牌.如果采样的响应不以 EOS 代币结束,我们将给予 -10 惩罚,以鼓励模型始终完成其响应.

5. Advantage Whitening / Normalization Like done in standard PPO implementation details literature (En- gstrom et al., 2020; Huang et al., 2022, 2024a), we normalize the advantages by subtracting its mean followed by dividing its standard deviation.

5.优势白化/归一化就像标准 PPO 实现细节文献中所做的那样（Engstrom et al., 2020; Huang et al., 2022, 2024a）,我们通过减去其均值然后除以其标准差来对优势进行归一化.

We start by anchoring a DPO model in the development history as the initial model for conducting experiments

我们首先在发展历史中锚定一个DPO模型作为进行实验的初始模型

for RLVR. We conducted several sets of experiments:

1. Individual Tasks we applied the RLVR recipe on GSM8K, MATH, and IFEval, respectively with a sweep of beta values [0.1, 0.05, 0.03, 0.01]. For evaluation, we look at the verifiable rewards, the KL divergence, and the response length.

1. 个别任务我们分别在 GSM8K、MATH 和 IFEval 上应用 RLVR 配方,并扫描 beta 值 [0.1、0.05、0.03、0.01].为了进行评估,我们查看可验证的奖励、KL 散度和响应长度.

2. ValueModelInitializationAblation We experimented with initializing PPO’s value model from 1) a general reward model or 2) the anchored DPO model, and ran a sweep of beta values [0.1, 0.05, 0.03, 0.01, 0.005, 0.001] on the GSM8K task. The general RM is trained with the UltraFeedback dataset (Cui et al., 2023). For evaluation, we examine the GSM8K test evaluation score and the average scores across all evaluation.

2. ValueModelInitializationAblation 我们尝试从 1) 一般奖励模型或 2) 锚定 DPO 模型初始化 PPO 的价值模型,并在 GSM8K 任务上运行一系列 beta 值 [0.1, 0.05, 0.03, 0.01, 0.005, 0.001].一般 RM 使用 UltraFeedback 数据集进行训练（Cui 等人,2023）.为了进行评估,我们检查了 GSM8K 测试评估分数以及所有评估的平均分数.

3. Scores from RM Ablations One possible implementation for RLVR is to add verifiable rewards on top of the scores from the reward model. We launch experiments also using a sweep of beta values [0.1, 0.05, 0.03, 0.01, 0.005, 0.001] on the GSM8K task.

3. RM Ablations 的分数 RLVR 的一种可能实现是在奖励模型的分数之上添加可验证的奖励.我们还在 GSM8K 任务上使用一系列 beta 值 [0.1、0.05、0.03、0.01、0.005、0.001] 启动实验.

4. Starting from Weaker Model The model’s base capabilities are also a confounding factor. We launch another set of experiments using an SFT model with lower average scores (from which the anchored DPO checkpoints were trained, so they share the same linearage) using beta values [0.1, 0.05, 0.03, 0.01].

4. 从较弱的模型开始模型的基本能力也是一个混杂因素.我们使用平均分数较低的 SFT 模型（从其中训练锚定 DPO 检查点,因此它们共享相同的线性）使用 beta 值 [0.1, 0.05, 0.03, 0.01] 启动另一组实验.

Unless otherwise specified, we use the following hyperparameters for PPO training in Table 21. To train reward models, we use the hyperparameters in Table 36.

除非另有说明,我们使用表 21 中的以下超参数进行 PPO 训练.为了训练奖励模型,我们使用表 36 中的超参数.

32

<!-- page 33 of 82 -->

RLVR on GSM8K

20

100

9.0

15

95

8.5

90

8.0

10

85

7.5

KL Divergence · KL散度

5

Response Length · 响应长度

Verifiable Rewards

80

7.0

0

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

RLVR on Math

4.75

600

40

4.50

500

30

4.25

400

4.00

20

300

3.75

KL Divergence · KL散度

Response Length

Verifiable Rewards

10

3.50

200

0

3.25

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

RLVR on Prompts with Constraints

250

25

8

20

200

6

15

150

10

4

100

KL Divergence

Response Length

5

Verifiable Rewards · 可验证的奖励

50

2

0

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

Episodes β = 0.01 β = 0.03 β = 0.05 β = 0.1

Figure 19 The top three rows show RLVR’s verifiable rewards, KL divergence, and response lengths on the train dataset of GSM8K, MATH, and prompts with constraints, when starting from a DPO checkpoint (i.e. an experimental,

not final DPO checkpoint). The bottom row shows the corresponding downstream test performance. RLVR can lead to higher verifiable rewards in the train datasets. Importantly, RLVR can also lead to higher scores in the corresponding test dataset, however, an increase in the average score across all evaluations is not guaranteed.

不是最终的 DPO 检查点）.底行显示相应的下游测试性能. RLVR 可以在训练数据集中带来更高的可验证奖励.重要的是,RLVR 还可以在相应的测试数据集中带来更高的分数,但是,不能保证所有评估的平均分数都会增加.

6.2.1 Key Findings · 主要发现

RLVR Can Improve Performance in Targeted Domains. Figure 19 shows training with RLVR results in improved test performance for all three settings. In all cases, we achieve models that outperform the initial model in

RLVR 可以提高目标域的性能.图 19 显示了使用 RLVR 进行训练可提高所有三种设置的测试性能.在所有情况下,我们实现的模型都优于初始模型

that particular evaluation. We also see that the verifiable rewards (i.e., correctness on the train set) improves consistently for all three settings. Interestingly, in GSM8K and MATH, we found that incurring more KL budget does not necessarily lead to improvements in verifiable rewards.

那个特定的评价.我们还看到,所有三种设置的可验证奖励（即训练集的正确性）都在持续改善.有趣的是,在 GSM8K 和 MATH 中,我们发现产生更多的 KL 预算并不一定会导致可验证奖励的改善.

Initializing RLVR’s Value Function from a General RM Works Best. Figure 21 shows that initializing the value from a general RM obtains the highest GSM8K test score and also higher average scores. This suggests the value function plays an important role in RLVR’s training.

从通用 RM 初始化 RLVR 的价值函数效果最佳.图 21 显示,从通用 RM 初始化值可以获得最高的 GSM8K 测试分数以及更高的平均分数.这表明价值函数在 RLVR 的训练中发挥着重要作用.

33

<!-- page 34 of 82 -->

RLVR on GSM8K

100

9

20

95

8

15

90

7

10

85

6

KL Divergence · KL散度

5

Response Length · 响应长度

Verifiable Rewards

80

5

0

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

0K 20K 40K 60K 80K 100K

Episodes

start = DPO, β = 0.03 start = DPO, β = 0.05 start = DPO, β = 0.01 start = DPO, β = 0.1 start = SFT, β = 0.03 start = SFT, β = 0.05 start = SFT, β = 0.01 start = SFT, β = 0.1

开始 = DPO,β = 0.03 开始​​ = DPO,β = 0.05 开始 = DPO,β = 0.01 开始 = DPO,β = 0.1 开始 = SFT,β = 0.03 开始​​ = SFT,β = 0.05 开始 = SFT,β = 0.01 开始 = SFT,β = 0.1

Figure 20 The comparison of RLVR’s performance on GSM8K between starting from a DPO checkpoint and starting from a weaker SFT checkpoint. We see that starting from both SFT and DPO can lead to the same level of verifiable rewards, but starting from SFT would incur a larger KL compared to starting from DPO when using the same β.

Do Not Use the Scores from RM. Figure 22 shows that using only the verifiable rewards outperforms using scores from the reward model. Training with verifiable rewards with the scores from RM seems to introduce more noise, especially in the average scores.

不要使用 RM 的分数.图 22 显示,仅使用可验证的奖励优于使用奖励模型的分数.使用 RM 分数进行可验证奖励的训练似乎会引入更多噪音,尤其是平均分数.

Starting from a Weaker Model Can Converge to the Same Verifiable Rewards. Figure 20 shows that starting from both SFT and DPO can lead to the same level of verifiable rewards, but starting from the SFT model would incur a larger KL compared to starting from the DPO model. This makes sense because the SFT model is further away from good at GSM8K than the DPO model. However, we find that starting from a stronger model usually results in better test set performance.

从较弱的模型开始可以收敛到相同的可验证奖励.图 20 显示,从 SFT 和 DPO 模型开始可以带来相同水平的可验证奖励,但与从 DPO 模型开始相比,从 SFT 模型开始会产生更大的 KL.这是有道理的,因为 SFT 模型在 GSM8K 方面比 DPO 模型距离更远.然而,我们发现从更强的模型开始通常会带来更好的测试集性能.

Overoptimization Happens. As we lower the KL penalty β, the trained model incurs more KL from the initial model. We observed that more KL divergence typically results in lower average scores, as shown in Figure 21. The exception is Figure 22, where the largest KL corresponds to the highest average score. Furthermore, we showcase overoptimization of prompts with constraints cases in Appendix B.4.

发生过度优化.当我们降低 KL 惩罚 β 时,训练后的模型会从初始模型中产生更多的 KL.我们观察到,较大的 KL 散度通常会导致较低的平均得分,如图 21 所示.图 22 是个例外,其中最大的 KL 对应于最高的平均得分.此外,我们在附录 B.4 中展示了带有约束条件的提示的过度优化.

6.3 RLVR Infrastructure · RLVR 基础设施

Our PPO setup follows best practices on implementation details (Huang et al., 2024a). To enable our implementation to scale to models up to 405B parameters, we also adapted model allocation techniques from existing distributed RLHF frameworks (Hu et al., 2024). Furthermore, we accelerate throughput by making RL training asynchronous (Noukhovitch et al., 2024).

我们的 PPO 设置遵循实施细节的最佳实践（Huang 等人,2024a）.为了使我们的实现能够扩展到高达 405B 参数的模型,我们还采用了现有分布式 RLHF 框架的模型分配技术（Hu 等人,2024）.此外,我们通过使 RL 训练异步来加速吞吐量（Noukhovitch 等人,2024）.

The final 8B reward model is trained in 9 hours on 8 H100 gpus, while the final 8B RL run takes 65 hours on 8 GPUs, the final 70B RL run takes 60 hours on 48 GPUs, and the final 405B RL run takes 46 hours on 256 GPUs. Note, for all of these models we took an earlier than final checkpoint from the run.

最终的 8B 奖励模型在 8 个 H100 GPU 上训练需要 9 小时,而最终的 8B RL 在 8 个 GPU 上运行需要 65 小时,最终的 70B RL 在 48 个 GPU 上运行需要 60 小时,最终的 405B RL 在 256 个 GPU 上运行需要 46 小时.请注意,对于所有这些模型,我们在运行中采用的检查点早于最终检查点.

Distributed Setup. Our PPO infrastructure leverages Zero Stage 3 (Rajbhandari et al., 2020) to fit the models and applicable optimizer states into the memory. In RLVR, we have 3 models: the policy model, the reference policy model, and the value model. The policy and value models need to be trained, but the reference policy model only performs inference. Often inference time is a bottleneck in RLHF infrastructure, so we allocate dedicated GPUs to do inference like done in OpenRLHF (Hu et al., 2024). In particular, we use Ray (Moritz et al., 2018) to allocate dedicated GPUs to run PagedAttention via vLLM (Kwon et al., 2023). PagedAttention helps reduce GPU memory fragmentation and redundant duplication leveraging virtual memory and paging techniques. As a result, it helps our PPO infrastructure run LLM inference using a much larger batch size and speed up inference. This setup allowed us to scale PPO policy training to the 405B scale. We share more 405B scaling details in Section 8.1.

分布式设置.我们的 PPO 基础设施利用零阶段 3（Rajbhandari 等人,2020）将模型和适用的优化器状态放入内存中.在RLVR中,我们有3个模型：策略模型、参考策略模型和价值模型.策略和价值模型需要训练,但参考策略模型仅执行推理.推理时间通常是 RLHF 基础设施的瓶颈,因此我们分配专用 GPU 来进行推理,就像在 OpenRLHF 中所做的那样（Hu 等人,2024）.特别是,我们使用 Ray（Moritz 等人,2018）分配专用 GPU 来通过 vLLM 运行 PagedAttention（Kwon 等人,2023）. PagedAttention 利用虚拟内存和分页技术帮助减少 GPU 内存碎片和冗余重复.因此,它可以帮助我们的 PPO 基础设施使用更大的批量大小运行 LLM 推理并加快推理速度.此设置使我们能够将 PPO 政策培训扩展到 405B 规模.我们在第 8.1 节中分享了更多 405B 扩展细节.

Asynchronous RL Training. Furthermore, our PPO setup uses asynchronous RL training to improve training efficiency (Noukhovitch et al., 2024). The existing PPO frameworks (Hu et al., 2024; Shen et al., 2024a) are typically synchronous: the inference GPUs would first collect policy rollout data, and then the learner GPUs would train on that rollout data. This setup would utilize GPU relatively well under a typical setup with

异步强化学习训练.此外,我们的 PPO 设置使用异步 RL 训练来提高训练效率（Noukhovitch 等人,2024）.现有的 PPO 框架（Hu 等人,2024；Shen 等人,2024a）通常是同步的：推理 GPU 将首先收集策略推出数据,然后学习器 GPU 将根据该推出数据进行训练.在典型设置下,此设置可以相对较好地利用 GPU

34

<!-- page 35 of 82 -->

Figure 22 Similar to Figure 21, but this is a comparison of 1) using scores from on top of the verifiable rewards and 2) using only the verifiable rewards. We found using the verifiable rewards performs better in GSM8K, and using scores and verifiable rewards to be more noisy.

Figure 21 The performance of RLVR vs KL Divergence under different value model initialization. Both initial- izations could improve the models compared to an initial DPO baseline model. However, as the model diverges more from the initial model, overoptimization happens as the average scores drop significantly.

Final RLVR Runs

25

600

6.5

20

500

6.0

15

5.5

400

10

KL Divergence · KL散度

Response Length

5

Verifiable Rewards · 可验证的奖励

5.0

300

0

0K 10K 20K 30K 40K 50K

0K 10K 20K 30K 40K 50K

0K 10K 20K 30K 40K 50K

Episodes

Final 8B run Final 70B run

Figure 23 Rewards, KL divergence, and average response length on GSM8k train set over episodes for our final RLVR runs. We mark the point we choose the 8B and 70B checkpoints with a green and purple star respectively.

Atari (Mnih et al., 2015). However, under the RLHF setup, inference computation typically requires different optimizations (e.g., PagedAttention), thus requiring different GPU memory allocation strategies. As a result, synchronous RL training means inference GPUs could be idling while the learner GPUs run, and vice versa. An alternative implementation is to use the same set of GPUs for training and inference, but it could incur additional overhead such as an additional copy of the policy parameters and compiling inference engine in the training GPUs (Shen et al., 2024a).

雅达利（Mnih 等人,2015）.然而,在 RLHF 设置下,推理计算通常需要不同的优化（例如 PagedAttention）,因此需要不同的 GPU 内存分配策略.因此,同步强化学习训练意味着推理 GPU 可能会在学习 GPU 运行时空闲,反之亦然.另一种实现是使用同一组 GPU 进行训练和推理,但它可能会产生额外的开销,例如策略参数的额外副本以及在训练 GPU 中编译推理引擎（Shen 等人,2024a）.

Our setup allocates GPUs specifically for inference and training, alleviating the need to compile an inference engine and save a copy of the policy parameters in the training GPUs. Furthermore, we run the inference computation concurrently with the training computation, thus reducing the GPU idle time. However, asynchronous RL training can introduce stale data, in cases where the inference can generate data much faster than training consumes (Espeholt et al., 2018), which can introduce reproducibility problems (Huang et al., 2023). To help make training more reproducible, our setup always trains the policy using the second latest inference data (Huang et al., 2023; Noukhovitch et al., 2024).

我们的设置专门为推理和训练分配 GPU,从而减少了编译推理引擎并在训练 GPU 中保存策略参数副本的需要.此外,我们将推理计算与训练计算同时运行,从而减少了 GPU 空闲时间.然而,异步强化学习训练可能会引入过时的数据,如果推理生成数据的速度比训练消耗的数据快得多（Espeholt 等人,2018）,这可能会引入再现性问题（Huang 等人,2023）.为了帮助提高训练的可重复性,我们的设置始终使用第二个最新的推理数据来训练策略（Huang 等人,2023 年；Noukhovitch 等人,2024 年）.

6.4 Final Experimental Results · 最终实验结果

Based on the above results, we ran our final RLVR runs using the combined verifiable prompt set, and used the best DPO models from the prior section as starting points. Specifically, at 8B scale, we tested the best overall DPO model and the best model with IFEval persona data mixed in during training, and at 70B scale

根据上述结果,我们使用组合的可验证提示集运行最终的 RLVR 运行,并使用上一节中的最佳 DPO 模型作为起点.具体来说,在 8B 规模下,我们测试了最佳整体 DPO 模型以及在训练期间混合了 IFEval 角色数据的最佳模型,以及在 70B 规模下

35

<!-- page 36 of 82 -->

Model Size 8B 70B

Tülu 3

Tülu 3

Tülu 3

Tülu 3

Llama 3.1

Category Benchmark(Eval Setting) Llama 3.1

DPO

RLVR

DPO

RLVR

Inst.

Inst.

Avg. 62.2 64.4 64.8 73.4 75.9 76.0

Knowledge MMLU(0 shot, CoT) 71.2 68.7 68.2 85.3 83.3 83.1

PopQA(15 shot) 20.2 29.3 29.1 46.4 46.3 46.5

TruthfulQA(6 shot) 55.1 56.1 55.0 66.8 67.9 67.6

Reasoning BigBenchHard(3 shot, CoT) 62.8 65.8 66.0 73.8 81.8 82.0

DROP(3 shot) 61.5 62.5 62.6 77.0 74.1 74.3

Math MATH(4 shot CoT, Flex) 42.5 42.0 43.7 56.4 62.3 63.0

GSM8K(8 shot, CoT) 83.4 84.3 87.6 93.7 93.5 93.5

Code HumanEval(pass@10) 86.3 83.9 83.9 93.6 92.4 92.4

HumanEval+(pass@10) 82.9 78.6 79.2 89.5 88.4 88.0

IF & Chat IFEval(Strict) 80.6 81.1 82.4 88.0 82.6 83.2

AlpacaEval 2(LC % win) 24.2 33.5 34.5 33.4 49.6 49.8

Safety Safety6 task avg. 75.2 87.2 85.5 76.5 89.0 88.3

Table 23 Final performance of RLVR-trained Tülu 3 models compared to Llama 3.1 and DPO starting points. The best-performing model on each benchmark (i.e., in each row) and of each size is bolded.

we use the best overall DPO model. For hyperparameters, for 8B models, we used the hyperparameters from Table 21, but tested higher KL penalty coefficients (up to 0.15) based on previous 8B RL development runs. For 70B models, we used the hyperparameters from Table 21, but with a 1 × 10-7 learning rate, 0.1 warmup ratio, 2048 response length, 400,000 episodes, 640 effective batch size, and β = 0.7 based on previous 70B RL development runs. We initialize our value model from a reward model trained on the same dataset as the best DPO model (the Tülu 3 8B preference mixture) starting from Tülu 3 SFT, using the same hyperparameters as in our ablation experiments (Table 36).

我们使用最好的整体 DPO 模型.对于超参数,对于 8B 模型,我们使用表 21 中的超参数,但根据之前的 8B RL 开发运行测试了更高的 KL 惩罚系数（高达 0.15）.对于 70B 模型,我们使用表 21 中的超参数,但基于之前的 70B RL 开发运行,采用 1 × 10-7 学习率、0.1 预热比、2048 响应长度、400,000 次训练、640 有效批量大小和 β = 0.7.我们从 Tülu 3 SFT 开始,使用与我们的消融实验中相同的超参数,从与最佳 DPO 模型（Tülu 3 8B 偏好混合物）相同的数据集上训练的奖励模型初始化我们的价值模型（表 36）.

We evaluated our models every 100 training steps (40 for 70B), and picked as our final 8B model the checkpoints with best overall performance on MATH and IFEval. We show the logs from RLVR training in Figure 23, and compare the final performance against their DPO starting points and Llama 3.1 in Table 23. RLVR results in non-trivial improvements at the 8B scale, improving all three of MATH, GSM8k, and IFEval. In fact, we observed that some 8B runs were able to achieve GSM8k scores of up to 89.4% and IFEval scores of up to 84.8% (although such models tended to perform worse in other metrics, dragging down their overall average). At the 70B scale, we observe more modest improvements in IFEval and MATH, and no improvement in GSM8k, likely due to the fact that it is already close to saturation (93.5%). Surprisingly, we find that our 70B run displays extremely low KL divergence, remaining well below 1 over the duration of run, probably due to the lower learning rate18.

我们每 100 个训练步骤（70B 为 40 个）评估我们的模型,并选择在 MATH 和 IFEval 上具有最佳整体性能的检查点作为我们的最终 8B 模型.我们在图 23 中显示了 RLVR 训练的日志,并将最终性能与表 23 中的 DPO 起点和 Llama 3.1 进行比较.RLVR 在 8B 规模上带来了不小的改进,改进了 MATH、GSM8k 和 IFEval 的所有三个.事实上,我们观察到一些 8B 运行能够获得高达 89.4% 的 GSM8k 分数和高达 84.8% 的 IFEval 分数（尽管此类模型在其他指标上往往表现较差,从而拉低了总体平均值）.在 70B 规模上,我们观察到 IFEval 和 MATH 的改进较为温和,而 GSM8k 没有改进,可能是因为它已经接近饱和 (93.5%).令人惊讶的是,我们发现我们的 70B 运行显示出极低的 KL 散度,在运行期间保持远低于 1,这可能是由于学习率较低18.

7 Tülu 3 Evaluation Framework · Tülu 3 评测框架

We designed our framework for evaluating Tülu 3 and the other models we compare against with the following

我们设计了评估 Tülu 3 和其他模型的框架,并与以下模型进行比较

goals: 1) Our evaluations should be reproducible. 2) We should evaluate models’ generalization to unseen tasks, not just the specific benchmarks we use for development. 3) Our evaluation setup (e.g., templates and strategies for prompting) should be fair to a wide range of models.

目标： 1）我们的评估应该是可重复的. 2）我们应该评估模型对未见过的任务的泛化能力,而不仅仅是我们用于开发的具体基准. 3）我们的评估设置（例如,模板和提示策略）应该对各种模型公平.

Accordingly, our framework consists of an open evaluation toolkit for reproducible evaluations (Section 7.1), a suite for evaluating core skills in instruction-tuned models with separate development (Section 7.2) and

因此,我们的框架包括一个用于可重复评估的开放评估工具包（第 7.1 节）、一套用于评估单独开发的指令调整模型中的核心技能（第 7.2 节）和

18We had attempted using a higher learning rate during the initial exploration but found that KL could explode initially and cause a non-trivial drop in average scores.

18我们在最初的探索过程中尝试使用更高的学习率,但发现 KL 最初可能会爆炸并导致平均分数显着下降.

36

<!-- page 37 of 82 -->

Category Benchmark CoT # Shots Chat Multiturn ICL Metric

类别 基准 CoT # 镜头 聊天 多圈 ICL 指标

Knowledge Recall MMLU ✓ 0 ✓ ✗ EM

PopQA ✗ 15 ✓ ✓ EM

TruthfulQA ✗ 6 ✓ ✗ MC2

Reasoning BigBenchHard ✓ 3 ✓ ✓ EM

DROP ✗ 3 ✗ N/A F1

Math GSM8K ✓ 8 ✓ ✓ EM

MATH ✓ 4 ✓ ✓ Flex EM

Development

Coding HumanEval ✗ 0 ✓ N/A Pass@10

HumanEval+ ✗ 0 ✓ N/A Pass@10

Instruction Following IFEval ✗ 0 ✓ N/A Pass@1 (prompt; loose)

AlpacaEval 2 ✗ 0 ✓ N/A LC Winrate

Safety Tülu 3 Safety ✗ 0 ✓ N/A Average∗

Knowledge Recall MMLU-Pro ✓ 0 ✓ N/A EM

GPQA ✓ 0 ✓ N/A EM

Reasoning AGIEval English ✓ 0 ✓ ✓ EM

Math Deepmind Mathematics ✓ 0 ✓ ✓ EM (Sympy)

Unseen

Coding BigCodeBench ✗ 0 ✓ N/A Pass@10

Instruction Following IFEval-OOD ✗ 0 ✓ N/A Pass@1 (prompt; loose)

遵循 IFEval-OOD 的指令 ✗ 0 ✓ N/A Pass@1（提示；松散）

HREF ✗ 0 ✓ N/A Winrate

Table 24 The Tülu 3 Evaluation Regime: settings for development (top) and unseen (bottom) portions of the evaluation suite. CoT are evaluations run with chain of thought prompting (Wei et al., 2022b). #Shots is the number of in-context examples in the evaluation template. Chat refers to whether we use a chat template while prompting the model. Multiturn ICL refers to a setting where we present each in-context example as a separate turn in a conversation (applicable only when a chat template is used and # Shots is not 0). ∗Average over multiple sub-evaluations – full

details of the safety evaluation are included in the Appendix.

安全评估的详细信息包含在附录中.

held-out evaluations (Section 7.3), and a set of recommended settings for evaluating on our evaluation suite that based on our experiments with various models, which we refer to as the Tülu 3 Evaluation Regime, summarized in Table 24.

保留的评估（第 7.3 节）,以及一组用于评估我们的评估套件的推荐设置,这些设置基于我们对各种模型的实验,我们将其称为 Tülu 3 评估制度,总结于表 24 中.

As described in Section 2.1, we split our evaluation suite into a development set and an unseen set, the former used for developing models, and the latter only for evaluating final models. This setup, along with our training data decontamination efforts (see Section 3.2) provide a fairer evaluation of our models generalization capabilities for each of the core skills we focus during development. However, in comparisons between our models and other models, we cannot rule out that any closed model has not trained on our evaluation suite, and hence cannot make clear judgments on models that have not publicly released finetuning data.

如2.1节所述,我们将评估套件分为开发集和未见集,前者用于开发模型,后者仅用于评估最终模型.这种设置以及我们的训练数据净化工作（参见第 3.2 节）为我们在开发过程中关注的每项核心技能的模型泛化能力提供了更公平的评估.然而,在我们的模型与其他模型的比较中,我们不能排除任何封闭模型没有在我们的评估套件上进行训练,因此无法对未公开发布微调数据的模型做出明确的判断.

7.1 Open Language Model Evaluation System (OLMES) · 开放语言模型评估系统（OLMES）

In an effort to make evaluations more standardized and reproducible, we are sharing the code base used to produce the evaluations in this work.19 The OLMES evaluation system supports:

为了使评估更加标准化和可重复,我们正在共享用于在这项工作中进行评估的代码库.19 OLMES 评估系统支持：

• A wide range of models and tasks, leveraging existing work in the Eleuther AI LM Evaluation Harness (Gao et al., 2024),

• 广泛的模型和任务,利用 Eleuther AI LM 评估工具中的现有工作（Gao 等人,2024）,

• Flexible configuration options for each task,

• Direct access to the specific task formulations used in this work (as well as in earlier work such as OLMo (Groeneveld et al., 2024) and the OLMES standard (Gu et al., 2024)), and

• 直接访问本工作中使用的特定任务公式（以及早期工作,例如 OLMo（Groeneveld 等人,2024 年）和 OLMES 标准（Gu 等人,2024 年））,以及

19See http://github.com/allenai/olmes.

37

<!-- page 38 of 82 -->

• Detailed instance-level output data for analysis of model predictions, confidences, etc

• 用于分析模型预测、置信度等的详细实例级输出数据

E.g., to reproduce our Llama-3.1-8B-Instruct numbers for MMLU-Pro, one would simply run something like “olmes –task mmlu_pro::tulu3 –model llama3.1-8b-instruct”.

例如,要为 MMLU-Pro 重现 Llama-3.1-8B-Instruct 编号,只需运行“olmes –task mmlu_pro::tulu3 –model llama3.1-8b-instruct”之类的命令.

7.2 Tülu 3 Evaluation Suite - Development · Tülu 3 评估套件 - 开发

We design the evaluation setup for the development partition of Tülu 3 Eval based on existing practices in

我们根据现有实践设计了 Tülu 3 Eval 开发分区的评估设置

current literature as well as insights during development. Where appropriate, we adapt the evaluation setup based on the nature of the task and take additional care to robustify our answer extraction and comparison approaches as described below.

当前的文献以及开发过程中的见解.在适当的情况下,我们根据任务的性质调整评估设置,并额外注意加强我们的答案提取和比较方法,如下所述.

MMLU (Hendrycks et al., 2020) is heterogeneous with regard to the type of reasoning skills required to answer the questions, containing instances that require basic factual recall as well as those that demand logical reasoning and problem-solving skills. We design a zero-shot CoT setting that asks the models to “summarize” its reasoning before answering the questions (see Table 44 for the prompt used). We find that among the various CoT settings, including prompting the model to think “step-by-step” and using no CoT, the prompt yields a systematic performance improvement over standard 5-shot multiple choice setting across tested models (See Table 46) and maximizes on the number of subject (knowledge categories) that the CoT benefits. This indicates that our “summarize” prompt is an effective strategy for dealing with the heterogeneity of the benchmark. See appendix F.2 for details. We compute a macro average over all the subjects in MMLU as the final task metric.

MMLU（Hendrycks 等人,2020）在回答问题所需的推理技能类型方面是异构的,包含需要基本事实回忆的实例以及需要逻辑推理和解决问题技能的实例.我们设计了一个零样本 CoT 设置,要求模型在回答问题之前“总结”其推理（有关所使用的提示,请参阅表 44）.我们发现,在各种 CoT 设置中,包括提示模型“逐步”思考和不使用 CoT,与测试模型中的标准 5 次多项选择设置相比,提示产生了系统的性能改进（参见表 46）,并且最大化了 CoT 受益的主题（知识类别）数量.这表明我们的“总结”提示是处理基准异质性的有效策略.详细信息参见附录 F.2.我们计算 MMLU 中所有科目的宏观平均值作为最终任务指标.

PopQA (Mallen et al., 2022) is an entity-centric question-answering benchmark that evaluates language models’ tendency to forget information about long-tail entities. We prompt the models in a 15-shot setting (as recommended in the dataset paper) without any additional instructions, with each QA demonstration

PopQA（Mallen 等人,2022）是一个以实体为中心的问答基准,用于评估语言模型忘记长尾实体信息的倾向.我们在每个 QA 演示中以 15 个镜头设置提示模型（按照数据集论文中的建议）,无需任何额外说明

presented in a different conversation turn, a setting that we refer to as Multiturn ICL henceforth, and use greedy sampling to obtain model predictions.

在不同的对话回合中呈现,我们将这种设置称为多回合 ICL,并使用贪婪采样来获得模型预测.

TruthfulQA (Lin et al., 2021) contains questions that humans tend to answer incorrectly due to common misconceptions. We use the multiple-choice version of this benchmark where the models being evaluated are presented with questions and options containing multiple correct answers (the MC2 setting).

TruthfulQA（Lin 等人,2021）包含人类由于常见误解而容易回答错误的问题.我们使用此基准的多项选择版本,其中向正在评估的模型提出包含多个正确答案的问题和选项（MC2 设置）.

HumanEval (Chen et al., 2021) and HumanEval+ (Liu et al., 2023) evaluate models’ ability to complete Python code given docstrings. HumanEval+ uses a more rigorous evaluation procedure than the original HumanEval benchmark with additional tests. We use samples from the models at a temperature of 0.8 and use pass@10 as the evaluation metric.

HumanEval（Chen 等人,2021）和 HumanEval+（Liu 等人,2023）评估模型在给定文档字符串的情况下完成 Python 代码的能力. HumanEval+ 使用比原始 HumanEval 基准更严格的评估程序以及额外的测试.我们使用温度为 0.8 的模型样本,并使用 pass@10 作为评估指标.

GSM8K (Cobbe et al., 2021) contains grade school math word problems. We use the 8-shot chain-of-thought prompt from Wei et al. (2022b), formatted for a multiturn ICL evaluation. We obtain model responses using greedy sampling and extract the last number in the model response as the predicted answer.

GSM8K（Cobbe 等人,2021）包含小学数学应用题.我们使用 Wei 等人的 8 次思维链提示. (2022b),针对多圈 ICL 评估进行格式化.我们使用贪婪采样获得模型响应,并提取模型响应中的最后一个数字作为预测答案.

MATH (Hendrycks et al., 2021) contains problems from mathematics competitions spanning various categories such as algebra and calculus. We use a 4-shot multi-turn setup with CoT from Lewkowycz et al. (2022), formatted for multiturn ICL, and greedy sampling for model completions. For determining the correctness of predictions, we use a ‘flex’ scheme that attempts to extract the answer in three different ways: (1) following the minerva format (Lewkowycz et al., 2022); (2) finding the last instance of ‘ < ans > ’; (3) taking the text between the last two ‘$’ tags. This is due to issues we found during development wherein models would often not follow the correct output format despite the few-shot examples, necessitating a varied answer extraction strategy. We find that moving from the minerva format alone to our ‘flex’ strategy can sometimes improve reported scores by up to 10 points, highlighting the need for this flexible strategy. We compute macro average across the subsections to obtain the final task metric.

MATH（Hendrycks 等人,2021）包含代数和微积分等各个类别的数学竞赛中的问题.我们使用来自 Lewkowycz 等人的带有 CoT 的 4 次多圈设置. (2022),针对多圈 ICL 进行格式化,并针对模型完成进行贪婪采样.为了确定预测的正确性,我们使用“flex”方案,尝试以三种不同的方式提取答案：（1）遵循 minerva 格式（Lewkowycz 等人,2022）； (2) 找到‘<ans>’的最后一个实例； (3) 获取最后两个‘$’标签之间的文本.这是由于我们在开发过程中发现的问题,其中尽管示例很少,但模型通常不会遵循正确的输出格式,因此需要采用不同的答案提取策略.我们发现,从单独的密涅瓦格式转向我们的“灵活”策略有时可以将报告的分数提高多达 10 分,这凸显了这种灵活策略的必要性.我们计算各个子部分的宏观平均值以获得最终的任务指标.

BigBench-Hard (Suzgun et al., 2022) contains challenging reasoning problems for which models benefit from step-by-step reasoning. We follow the setup described in the original paper and use 3-shot CoT prompts, formatted for multiturn ICL. We use greedy sampling for obtaining model predictions.

BigBench-Hard（Suzgun 等人,2022）包含具有挑战性的推理问题,模型可以从逐步推理中受益.我们遵循原始论文中描述的设置,并使用 3 次 CoT 提示,格式为多圈 ICL.我们使用贪婪采样来获得模型预测.

DROP (Dua et al., 2019) is a reading comprehension task that requires discrete reasoning. We draw 3 random few-shot examples from the train split following the setup used for Llama 3 (Dubey et al., 2024), and use greedy sampling to get model predictions.

DROP（Dua et al., 2019）是一项需要离散推理的阅读理解任务.我们按照 Llama 3（Dubey 等人,2024）使用的设置从训练分割中抽取 3 个随机的少数样本,并使用贪婪采样来获得模型预测.

38

<!-- page 39 of 82 -->

IFEval (Zhou et al., 2023) evaluates instruction following ability of models in a setting where each instruction corresponds to constraints such that the it can be programmatically verified whether the outputs satisfy those constraints. We use greedy decoding to generate model outputs give the instructions in the dataset, and measure the prompt-level accuracy of satisfying constraints in the loose evaluation setting.

IFEval（Zhou 等人,2023）在每条指令对应于约束的设置中评估模型的指令跟踪能力,以便可以以编程方式验证输出是否满足这些约束.我们使用贪婪解码来生成模型输出,给出数据集中的指令,并测量松散评估设置中满足约束的提示级准确性.

AlpacaEval 2 (Dubois et al., 2024) contains a set of prompts sourced that reflect real human usages of LMs, and compares model outputs to GPT-4 turbo responses with an additional length control to avoid longer answers being unfairly favoured. We generate responses using greedy decoding up to 8,192 tokens in length, following Ivison et al. (2023).

AlpacaEval 2（Dubois 等人,2024）包含一组反映人类真实使用 LM 的提示,并将模型输出与 GPT-4 Turbo 响应进行比较,并进行额外的长度控制,以避免较长的答案受到不公平的青睐.遵循 Ivison 等人的研究,我们使用贪婪解码生成长度最多为 8,192 个标记的响应. （2023）.

7.2.1 Safety Evaluation · 安全评价

We follow Han et al. (2024) and Jiang et al. (2024) to define our safety evaluation suite using the following

我们跟随 Han 等人. （2024）和Jiang等人. （2024）使用以下内容定义我们的安全评估套件

benchmarks.20. Each of these benchmarks evaluates whether models refuse to respond to unsafe requests, and in the case of XSTest and WildJailbreak, additionally evaluate whether they comply with benign requests. We use greedy sampling to get model responses for the prompts in each of the benchmarks, and compute the

基准.20.这些基准测试中的每一个都评估模型是否拒绝响应不安全的请求,对于 XSTest 和 WildJailbreak,还评估它们是否符合良性请求​​.我们使用贪婪采样来获取每个基准中提示的模型响应,并计算

accuracy (at refusal or compliance as appropriate). We report the macro average of the scores over all the benchmarks as our final safety evaluation metric.

准确性（酌情拒绝或遵守）.我们报告所有基准分数的宏观平均值作为我们的最终安全评估指标.

XSTest (Röttger et al., 2023) consists of 200 unsafe prompts and 250 prompts which are safe but superficially resemble unsafe prompts: these prompts use vocabulary similar to that of unsafe prompts. Categories include homonyms, figurative language, safe targets, safe contexts, definitions, real discrimination/nonsense group, nonsense discrimination/real group, historical events, public privacy, and fictional privacy. We report the overall accuracy score based on whether WildGuard (Han et al., 2024) classifies the response as a refusal or compliance.

XSTest（Röttger 等人,2023）由 200 个不安全提示和 250 个安全但表面上类似于不安全提示的提示组成：这些提示使用与不安全提示类似的词汇.类别包括同音异义词、比喻语言、安全目标、安全上下文、定义、真实歧视/无意义群体、无意义歧视/真实群体、历史事件、公共隐私和虚构隐私.我们根据 WildGuard（Han 等人,2024）将响应分类为拒绝还是合规来报告总体准确度得分.

HarmBench (Mazeika et al., 2024). We evaluated on a subset of harmful prompts which consists of 321 harmful prompts21 categorized into Functional and Semantic categories. Functional category includes two types of behavior: Standard behaviors, which are modeled after existing datasets of harmful behaviors such as AdvBench and the TDC 2023 Red Teaming Track dataset, and Copyright behaviors, which test the handling of copyrighted content. The semantic category comprises seven types of harmful behaviors: cybercrime, unau- thorized intrusion, chemical/biological weapons or drugs, copyright violations, misinformation/disinformation, harassment/bullying, illegal activities, and general harm. We use WildGuard to evaluate the model’s refusal to assist with harmful prompts.

HarmBench（Mazeika 等人,2024）.我们对有害提示的子集进行了评估,其中包含 321 个有害提示21,分为功能和语义类别.功能类别包括两种类型的行为：标准行为,根据现有有害行为数据集（例如 AdvBench 和 TDC 2023 Red Teaming Track 数据集）建模；以及版权行为,测试受版权内容的处理.语义类别包括七种有害行为：网络犯罪、未经授权的入侵、化学/生物武器或毒品、侵犯版权、错误信息/虚假信息、骚扰/欺凌、非法活动和一般伤害.我们使用 WildGuard 来评估模型拒绝协助有害提示的情况.

Do-Anything-Now (Shen et al., 2024b) consists of jailbreak prompts that were created by combining the jailbreak templates from DAN with harmful behaviors from HarmBench, and subsample 300 of them for testing. We report accuracy using the WildGuard classifier.

Do-Anything-Now（Shen 等人,2024b）由越狱提示组成,这些提示是通过将 DAN 的越狱模板与 HarmBench 的有害行为结合起来创建的,并对其中的 300 个子样本进行测试.我们使用 WildGuard 分类器报告准确性.

JailbreakTrigger (Huang et al., 2024b) incorporates prompts based on 13 distinct jailbreak attack methods. In total, the dataset22 consists of 400 examples, split evenly between two categories: "Questions about Bad Behaviors" and "Instructions to generate Toxic Content". This dataset serves to evaluate the effectiveness of LLMs’ defenses and measures the toxicity of responses under jailbreak scenarios. The reported metric is RTA measured by WildGuard.

JailbreakTrigger（Huang et al., 2024b）结合了基于 13 种不同越狱攻击方法的提示.数据集 22 总共包含 400 个示例,平均分为两类：“有关不良行为的问题”和“生成有毒内容的说明”.该数据集用于评估法学硕士防御的有效性并测量越狱场景下响应的毒性.报告的指标是由 WildGuard 测量的 RTA.

WildJailbreakTest (Jiang et al., 2024) is an adversarial evaluation set which contains a subset for adversarial benign queries (210 examples) and a subset for adversarial harmful queries (2000 examples). The adversarial benign queries are used to measure models’ exaggerated safety behaviors and the adversarial harmful queries are used to measure models’ safeguards regarding adversarial attacks. We measure RTA using WildGuard for both categories. For benign queries, RTA is expected to be (↓) and for harmful queries, the RTA is expected to be (↑).

WildJailbreakTest（Jiang et al., 2024）是一个对抗性评估集,其中包含对抗性良性查询的子集（210 个示例）和对抗性有害查询的子集（2000 个示例）.对抗性良性查询用于衡量模型夸大的安全行为,对抗性有害查询用于衡量模型对对抗性攻击的防护措施.我们使用 WildGuard 测量这两个类别的 RTA.对于良性查询,RTA 预计为 (↓),对于有害查询,RTA 预计为 (↑).

WildGuardTest (Han et al., 2024) contains 1725 items for prompt harm, response harm, and response refusal

WildGuardTest（Han et al., 2024）包含 1725 个即时伤害、响应伤害和拒绝响应的项目

20Built on Ai2 Safety Tool, forked to focus only on safety evals: https://github.com/nouhadziri/safety-eval-fork. Note that while WildGuard and WildJailbreak are popular training datasets, we use generations over the test set prompts as a test of compliance with a response filter such as the WildGuard model.

20基于 Ai2 安全工具构建,分叉仅专注于安全评估：https://github.com/nouhadziri/safety-eval-fork.请注意,虽然 WildGuard 和 WildJailbreak 是流行的训练数据集,但我们使用测试集提示上的生成来测试是否符合响应过滤器（例如 WildGuard 模型）.

21https://github.com/centerforaisafety/HarmBench/blob/main/data/behavior_datasets/harmbench_behaviors_text_ test.csv

21https://github.com/centerforaisafety/HarmBench/blob/main/data/behavior_datasets/harmbench_behaviors_text_test.csv

22https://huggingface.co/datasets/TrustLLM/TrustLLM-dataset

22https://huggingface.co/datasets/TrustLLM/TrustLLM-dataset

39

<!-- page 40 of 82 -->

Benchmarks Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B Instruct Instruct Instruct SFT DPO

基准 Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B Instruct Instruct Instruct SFT DPO

HarmBench 82.8 53.4 84.1 98.4 94.4 94.7

XSTest 92.7 85.6 91.8 90.4 92.4 93.3

WildGuardTest 86.2 68.1 85.0 99.2 98.9 98.5

Jailbreaktrigger 78.8 63.3 71.0 95.8 87.0 85.5

DoAnythingNow 45.0 16.0 61.7 88.3 69.7 62.0

WildjailbreakTest 65.6 50.7 56.2 86.7 81.1 78.8

Overall 75.2 56.2 75.0 93.1 87.2 85.5

Table 25 Breakdown of safety scores by benchmark of Tülu 3 8B models compared with similarly sized open weight models.

Benchmarks Llama 3.1 Qwen 2.5 Hermes 3 Nemotron Tülu 3 70B Tülu 3 70B Tülu 3 70B 70B 72B Llama 3.1 Llama 3.1 SFT DPO Instruct Instruct 70B 70B

HarmBench 80.6 86.3 54.7 84.4 98.8 97.8 97.8

XSTest 87.1 93.6 89.3 92.0 91.1 94.9 92.4

WildGuardTest 81.3 93.1 66.6 84.9 99.1 99.2 98.9

Jailbreaktrigger 71.0 89.8 56.3 60.5 95.3 87.0 86.7

DoAnythingNow 80.0 93.3 26.7 36.3 93.7 69.0 67.7

WildjailbreakTest 59.2 66.0 53.8 56.1 88.6 86.3 86.2

Overall 76.5 87.0 57.9 69.0 94.4 89.0 88.3

Table 26 Breakdown of safety scores by benchmark of Tülu 3 70B models compared with similarly sized open weight models.

classification tasks. 55% are vanilla prompts, and 45% are adversarial. The prompts are collected based on adversarial synthetic data and in-the-wild user-LLM (In-the-wild) interactions. We report RTA using WildGuard.

分类任务. 55% 是普通提示,45% 是对抗性提示.这些提示是根据对抗性合成数据和野外用户 LLM（野外）交互收集的.我们使用 WildGuard 报告 RTA.

7.3 Tülu 3 Evaluation Suite - Unseen · Tülu 3 评估套件 - Unseen

For the unseen evaluation suite, the task formulations were decided through an independent design process from that of development suite. One goal of the unseen suite is to evaluate instruction-tuned models in ways that are closely aligned to realistic usage. Specifically, we follow these general principles:

对于看不见的评估套件,任务公式是通过独立于开发套件的设计过程来决定的.这一看不见的套件的目标之一是以与实际使用紧密结合的方式评估指令调整模型.具体来说,我们遵循以下一般原则：

• Formulate tasks similar to how humans interact with the models. E.g., avoid few-shot examples presented as a dialog, or precise chain-of-thought (CoT) examples for how the model is “supposed” to think.

• 制定类似于人类与模型交互方式的任务.例如,避免以对话形式呈现的少量示例,或关于模型“应该”如何思考的精确思想链 (CoT) 示例.

• Prompt models with clear instructions that set the context, encourage concise reasoning, and specify how the final answer should be formatted.

• 提示模型具有明确的说明,可设置上下文、鼓励简洁推理并指定最终答案的格式.

• Apply reasonable heuristics for answer extraction and comparison to gold answers, to avoid penalizing models that do not exactly follow a syntax implied by the instructions (based on examining outputs from a wide set of existing baseline models).

• 应用合理的启发式方法提取答案并与黄金答案进行比较,以避免惩罚不完全遵循指令隐含语法的模型（基于检查大量现有基线模型的输出）.

We first apply these principles to some of the tasks in the development suite using a set of exploratory models (instruction-tuned models predating Tülu 3). On the exploratory models, we find that following the above

我们首先使用一组探索性模型（Tülu 3 之前的指令调整模型）将这些原则应用于开发套件中的一些任务.在探索性模型上,我们发现遵循上述

principles, in particular being more aligned to how human usage, generally does not degrade performance and often times allow most models to perform better on tasks (despite, e.g., removing few-shot examples). We did not update the formulation of the development tasks based on this, but carried the principles over to formulating the unseen tasks. More detailed analysis can be found in Appendix F.2.

原则,特别是更符合人类使用方式,通常不会降低性能,并且通常允许大多数模型在任务上表现更好（尽管,例如,删除少数样本）.我们并没有据此更新开发任务的制定,而是将这些原则延续到制定未见的任务上.更详细的分析可参见附录 F.2.

The task formulations in the Tülu 3 unseen suite are as follows. For all benchmarks which include multiple

Tülu 3 unseen 套件中的任务表述如下.对于所有包含多个的基准测试

40

<!-- page 41 of 82 -->

Model Llama 3.1 prompt Ours

Gemma 2 9B Inst 51.6 52.6 Gemma 2 9B Inst-SimPO 52.6 51.8 Llama 3.1 8B Inst 49.2 48.7 Llama 3.2 3B Inst 39.1 39.7 Ministral 2410 8B Inst 43.8 44.3 OLMo 0724 7B Inst 26.1 22.9 OLMoE 0924 1B 7B Inst 20.7 20.3 Qwen 2.5 7B Inst 56.2 54.2 Tulu 2 DPO 7B 25.4 22.2

Table 27 Comparing evaluating on MMLU-Pro using our 0-shot CoT prompt and the 5-shot prompt used in Llama3.1 evaluations, using macro average over tasks in both cases (the Llama3.1 evaluation used micro average).

Model Llama 3.1 prompt Ours

Gemma 2 9B Inst 35.7 35.5 Gemma 2 9B Inst-SimPO 35.0 35.7 Llama 3.1 8B Inst 29.5 29.5 Llama 3.1 70B Inst 46.2 44.0 Llama 3.2 3B Inst 33.5 27.7 Ministral 2410 8B Inst 31.0 31.5 OLMo 0724 7B Inst 27.2 27.9 OLMoE 0924 1B 7B Inst 24.6 24.8 Qwen 2.5 7B Inst 32.1 36.8 Tulu 2 DPO 7B 28.4 27.5

Table 28 Comparing evaluating on GPQA using our 0-shot CoT prompt and the prompt in Llama3.1.

sub tasks, we compute the average over the sub tasks (i.e., the “macro” average) to be consistent.

子任务,我们计算子任务的平均值（即“宏观”平均值）以保持一致.

AGIEval English (Zhong et al., 2024) includes the English language subset of the AGIEval benchmark, specifically these multiple-choice tasks: aqua-rat, logiqa-en, lsat-ar, lsat-lr, lsat-rc, sat-en, sat-math, and gaokao-english. We do not include the sat-en-without-passage task as we find these questions are typically

AGIEval English（Zhong et al., 2024）包括 AGIEval 基准的英语语言子集,特别是这些多项选择任务：aqua-rat、logiqa-en、lsat-ar、lsat-lr、lsat-rc、sat-en、sat-math 和 gaokao-english.我们不包括 sat-en-without-passage 任务,因为我们发现这些问题通常是

severely underspecified without access to the passage. We formulate the task using the a simple “zero-shot CoT” prompt which encourages concise reasoning ending with a clearly stated answer choice. In Appendix F.2, Figure 44, we provide the 0-shot reasoning prompt, used for the multiple-choice tasks in the unseen evaluation suite, including AGIEval English. The model’s answer choice is extracted by first matching to the requested format, with fallback patterns if the format was not followed precisely. Specifically, we first look for the exact phrase indicated in the prompt (“Therefore, the answer is [ANSWER]”) and grab the last such match. If that fails, we look for a sequence of softer variants, like “answer is [ANSWER]” or “answer: [ANSWER]” before falling back to the last letter in parenthesis found, and if that fails, the last stand-alone capital letter.

严重未指定而无法进入通道.我们使用简单的“零样本 CoT”提示来制定任务,该提示鼓励简洁的推理,并以明确陈述的答案选择结束.在附录 F.2,图 44 中,我们提供了 0-shot 推理提示,用于未见过的评估套件中的多项选择任务,包括 AGIEval 英语.模型的答案选择是通过首先匹配请求的格式来提取的,如果没有精确遵循格式,则使用后备模式.具体来说,我们首先查找提示中指示的确切短语（“因此,答案是 [ANSWER]”）并获取最后一个此类匹配.如果失败,我们会寻找一系列较软的变体,例如“答案是[ANSWER]”或“答案：[ANSWER]”,然后返回到找到的括号中的最后一个字母,如果失败,则寻找最后一个独立的大写字母.

MMLU-Pro (Wang et al., 2024b) is a 10-way multiple-choice extended version of the MMLU dataset. We use essentially the same prompt and answer extraction as used for our AGIEval setup, just adjusting for the number of answer choices. We generally find our formulation to be as effective as the traditional 5-shot CoT prompt (e.g., used in Llama 3.1 evaluations (Dubey et al., 2024)) despite being much shorter, more realistic, and easier for users to create (see Table 27 for a comparison across exploratory models).

MMLU-Pro（Wang et al., 2024b）是 MMLU 数据集的 10 路多项选择扩展版本.我们使用与 AGIEval 设置基本相同的提示和答案提取,只是调整答案选择的数量.我们通常发现我们的公式与传统的 5 次 CoT 提示（例如,用于 Llama 3.1 评估（Dubey 等人,2024））一样有效,尽管它更短、更现实且更容易用户创建（有关探索性模型的比较,请参见表 27）.

GPQA (Rein et al., 2023) is a set of very challenging multiple-choice questions written by domain experts in biology, physics, and chemistry. We use the same zero-shot prompt and answer extraction as for AGIEval.

GPQA (Rein et al., 2023) 是一组非常具有挑战性的多项选择题,由生物学、物理学和化学领域的专家编写.我们使用与 AGIEval 相同的零样本提示和答案提取.

41

<!-- page 42 of 82 -->

Model base-adapted, in context examples CoT prompt

Gemma 2 9B Inst 18.0 45.9 Gemma 2 9B Inst-SimPO 19.3 45.3 Llama 3.1 8B Inst 20.0 39.4 Llama 3.2 1B Inst 11.6 13.1 Llama 3.2 3B Inst 19.2 32.6 Ministral 2410 8B Inst 18.8 36.7 OLMo 0724 7B Inst 3.2 5.8 OLMoE 0924 1B 7B Inst 9.0 4.2 Qwen 2.5 7B Inst 21.2 54.7 Tulu 2 DPO 7B 9.6 6.0 Llama 3.1 Tulu 2 8B 21.7 13.6 Llama 3.1 Tulu 2 DPO 8B 18.6 14.5

Table 29 Comparing evaluating on DeepMind Mathematics using different prompts designed evaluation practices for instruction-tuned models, with minor variants. Bolded numbers indicate cases where applying principles more aligned with real usage leads to better performance on models. In our evaluation suite, the chain of thought (CoT) prompt is referred to as chat-v3.

This is similar to the approach used in Llama 3.1 evaluations, but with less prescription on how the reasoning should be structured. Figure 28 shows that across exploratory models, that our approach leads to comparable scores.

这与 Llama 3.1 评估中使用的方法类似,但对如何构建推理的规定较少.图 28 显示,在探索性模型中,我们的方法得出了可比较的分数.

Deepmind Mathematics (Saxton et al., 2019) is a dataset of 56 categories of math questions, testing mathematical and algebraic reasoning skills. We devised a “zero-shot CoT” prompt that sets the context of the task, explains the format expected for the answers (e.g., “x**2” for powers), and for each category included three example answers to specify the answer format. The prompt used and answer extraction heuristics were refined by examining example outputs from our exploratory models. As seen from Table 29, applying evaluation principles aligned with real usage (“chat” versions), often performs better than using a setup involving presenting few-shot examples adapted from base model evaluations (“base-adapted”). We provide the zero-shot reasoning prompt for the Deepmind Mathematics task in Appendix F.2, Figure 45. Aligned with the instructions for formatting in the prompt, when extracting the answer, we first look for an answer in the format “Therefore, the final answer is [answer]. I hope it is correct.” We look for this in a case-insensitive way, process the [answer] by stripping away any trailing period, and known math delimiters surrounding the answer (e.g., “$” ) based on outputs from our exploratory models. For answer comparison, we first compare the raw strings of the processed generated answer and gold answer to check if they are equal. In addition, we parse both using the SymPy (Meurer et al., 2017) package and compare the equivalence of the parsed outputs to check their mathematical equivalent. We also consider the generated answer to be correct if it is equal to the parsed gold answer after this parsing.

Deepmind Mathematics (Saxton et al., 2019) 是一个包含 56 类数学问题的数据集,用于测试数学和代数推理技能.我们设计了一个“零样本 CoT”提示,用于设置任务的上下文,解释答案的预期格式（例如,“x**2”代表幂）,并且对于每个类别都包含三个示例答案来指定答案格式.通过检查我们的探索性模型的示例输出,对所使用的提示和答案提取启发式进行了改进.从表 29 中可以看出,应用与实际使用情况一致的评估原则（“聊天”版本）通常比使用涉及呈现根据基本模型评估改编的少数样本示例（“基础改编”）的设置表现得更好.我们在附录 F.2,图 45 中为 Deepmind 数学任务提供了零样本推理提示.根据提示中的格式化说明,在提取答案时,我们首先以“因此,最终答案是 [答案].我希望它是正确的”格式寻找答案.我们以不区分大小写的方式寻找这一点,根据我们的探索性模型的输出,通过去除任何尾随句点和围绕答案的已知数学分隔符（例如“$”）来处理[答案].为了比较答案,我们首先比较处理后的生成答案和黄金答案的原始字符串,检查它们是否相等.此外,我们使用 SymPy (Meurer et al., 2017) 包解析两者,并比较解析输出的等价性以检查它们的数学等价性.如果生成的答案等于解析后的黄金答案,我们也认为它是正确的.

BigCodeBench (Zhuo et al., 2024) is a set of coding challenges. We focus on the “hard subset” of 148 (out of the total 1140) instances, using the “instruct” formulation of each task and the “calibrated” score. We follow the setup used for the original leaderboard for our implementation.

BigCodeBench（Zhuo et al., 2024）是一组编码挑战.我们使用每个任务的“指导”公式和“校准”分数,重点关注 148 个（总共 1140 个）实例的“硬子集”.我们遵循原始排行榜所使用的设置来进行实施.

7.3.1 New Evaluation: IFEval-OOD · 新评估：IFEval-OOD

In order to test precise instruction following abilities of LLMs and whether they are able to follow constraints that go beyond the 25 constraints included in IFEval (Zhou et al., 2023), we developed IFEval-OOD (IFEval Out-of-Distribution). IFEval-OOD consists of 52 constraints across six broad categories such as the examples in Table 30. A complete list of the constraints can be found in Appendix F.3. A portion of the constraints were sourced by asking a group of researchers for constraint ideas and others were written by authors of this paper. One of the six categories (“custom”) comprises manually written verifiable prompts to cover specific

为了测试法学硕士的精确指令跟随能力以及他们是否能够遵循超出IFEval（Zhou et al., 2023）中包含的25个约束的约束,我们开发了IFEval-OOD（IFEval Out-of-Distribution）. IFEval-OOD 由跨越六大类的 52 个约束组成,例如表 30 中的示例.完整的约束列表可以在附录 F.3 中找到.一部分约束是通过询问一组研究人员的约束想法而获得的,其他约束是由本文作者撰写的.六个类别之一（“自定义”）包括手动编写的可验证提示,以涵盖特定的

42

<!-- page 43 of 82 -->

Instruction Group Instruction Description

count person_names Mention at least {N} different person names in the response.

count person_names 在响应中至少提及 {N} 个不同的人名.

format emoji Please use an emoji at the end of every sentence.

格式表情符号 请在每个句子的末尾使用表情符号.

ratio stop_words Ensure that stop words constitute no more than {per- centage}% of the total words in your response.

ratio stop_words 确保停用词占您的回复中总单词数的比例不超过 {percentage}%.

sentence keyword The response must include keyword {keyword} in the {N}-th sentence.

句子关键字 响应必须在第 {N} 个句子中包含关键字 {keyword}.

words alphabet Each word in your response must start with the next letter of the alphabet, looping back to ‘A’ after ‘Z’.

字母表 回复中的每个单词必须以字母表中的下一个字母开头,在“Z”之后循环回到“A”.

custom csv_special_charac- ter

Generate CSV data: The column names are ["Produc- tID", "Category", "Brand", "Price", "Stock"], the data should be comma delimited. Please generate 14 rows. Add one field which contains a special character and enclose it in double quotes.

生成 CSV 数据：列名称为 [“ProductID”、“Category”、“Brand”、“Price”、“Stock”],数据应以逗号分隔.请生成 14 行.添加一个包含特殊字符的字段并将其用双引号引起来.

Table 30 Examples of IFEval out-of-distribution constraints. Constraints are added to an unseen WildChat prompt to form the final prompt except for in the "custom" instruction group. A complete list of constraints is provided in Appendix F.3.

sub-skills, such as CSV generation. For the remaining five categories, the verifiable constraint was combined with 10 unseen prompts from WildChat. To select the final prompts, these constrained prompts were human annotated for quality and compatibility with the constraint (e.g. a prompt to paraphrase a one-sentence reference text that doesn’t contain any names to begin with would not be compatible with a constraint to mention at least 23 different person names in the response). To ensure constraint coverage, additional unseen WildChat prompts were manually paired with constraints that did not have at least five selected prompts.

子技能,例如 CSV 生成.对于其余 5 个类别,可验证约束与来自 WildChat 的 10 个看不见的提示相结合.为了选择最终的提示,这些受约束的提示是为了质量和与约束的兼容性而进行人工注释的（例如,解释不包含任何名称的单句参考文本的提示将与在响应中提及至少 23 个不同人名的约束不兼容）.为了确保约束覆盖范围,额外的看不见的 WildChat 提示被手动与没有至少五个选定提示的约束配对.

Our evaluation dataset emphasizes broad coverage of constraint types to differentiate constraint-following abilities from overfitting on the existing IFEval constraints.

我们的评估数据集强调约束类型的广泛覆盖,以区分约束跟随能力和现有 IFEval 约束的过度拟合.

7.3.2 New Evaluation: HREF · 新评估：HREF

We constructed an automatic evaluation of instructability of language models, called Human Reference-guided Evaluation of instruction Following (HREF). HREF focuses on 11 instruction following tasks that language

我们构建了一种语言模型可指导性的自动评估,称为人类参考引导的指令跟随评估（HREF）. HREF 重点关注以下 11 条指令：

models are typically trained on, namely, Brainstorming, Open QA, Closed QA, Extraction, Generation, Rewriting, Summarization, Classification, Numerical Reasoning, Multi-document Synthesis, and Fact Checking. We obtained high quality human-written prompts and responses in these categories from professional instruction-

模型通常接受以下方面的训练：头脑风暴、开放式 QA、封闭式 QA、提取、生成、重写、总结、分类、数值推理、多文档综合和事实检查.我们从专业指导中获得了这些类别中高质量的人工书写提示和回复 -

tuning data creators, and developed a reliable automatic evaluation procedure. Following AlpacaFarm (Dubois et al., 2023), we use win-rate against a fixed baseline model as the evaluation metric. However, since we have a larger number of tasks in our benchmark than AlpacaFarm, and also because we have access to human-written references, we hypothesized that the setup used for win-rate computation may not be directly applicable to our new evaluation. So we experimented with various win-rate computation methods, and their details along multiple dimensions:

调整数据创建者,并开发了可靠的自动评估程序.继 AlpacaFarm（Dubois 等人,2023）之后,我们使用针对固定基线模型的胜率作为评估指标.然而,由于我们的基准测试中的任务数量比 AlpacaFarm 更多,而且我们可以访问人工编写的参考资料,因此我们假设用于胜率计算的设置可能无法直接适用于我们的新评估.因此,我们尝试了各种胜率计算方法及其多个维度的细节：

• Choice of LM Judge. We tried GPT-4, GPT-4 turbo, and Llama 3.1-Instruct models at 7B and 70B sizes as LM judges.

• LM 法官的选择.作为 LM 评委,我们尝试了 7B 和 70B 尺寸的 GPT-4、GPT-4 Turbo 和 Llama 3.1-Instruct 模型.

• LM-as-a-Judge vs. Direct Comparison with Human References. Using a large language model e.g., GPT-4 Turbo for AlpacaFarm, may not be appropriate for tasks where the responses are expected to be short and factual. We compared this setup with directly comparing the similarity of the responses from the target and the baseline models with the human-written references, according to a simpler embedding model (RoBERTa-Large (Liu, 2019)).

• LM 作为法官与与人类参考直接比较.使用大型语言模型（例如 AlpacaFarm 的 GPT-4 Turbo）可能不适合响应简短且真实的任务.根据更简单的嵌入模型（RoBERTa-Large（Liu,2019））,我们将此设置与直接比较目标和基线模型的响应与人类编写的参考的相似性进行了比较.

• Use of Human-Written References When Evaluating with LM-as-a-Judge. Since we have access to human- written references, we experimented with including those as additional context while prompting the LM

• 使用 LM 作为法官进行评估时使用人工编写的参考资料.由于我们可以访问人工编写的参考文献,因此我们尝试将这些参考文献作为附加上下文,同时提示 LM

43

<!-- page 44 of 82 -->

Skill 8B SFT 8B DPO 8B Final 70B SFT 70B DPO 70B Final

Dev. Uns. Dev. Uns. Dev. Uns. Dev. Uns. Dev. Uns. Dev. Uns.

Avg. 64.9 29.9 68.3 31.9 68.8 32.4 78.1 41.0 80.5 44.4 80.7 44.4

Knowledge Recall (MMLU →GPQA) 65.9 31.9 68.7 31.2 68.2 35.7 78.9 43.3 83.3 48.0 83.1 48.0

Reasoning (BBH →AGIEval) 67.9 56.2 65.8 61.8 66.0 59.3 82.7 73.2 81.8 75.0 82.0 75.0

Math (MATH →DM Mathematics) 31.5 32.3 42.0 33.0 43.7 35.4 53.7 49.7 62.3 49.4 63.0 49.8

Coding (HumanEval →BigCodeBench) 86.2 11.5 83.9 9.5 83.9 7.4 92.9 12.2 92.4 23.0 92.4 21.6

Inst. Following (IFEval →IFEval-OOD) 72.8 17.6 81.1 23.9 82.4 24.3 82.1 26.8 82.6 26.4 83.2 27.8

Table 31 Comparison of the performance of Tülu 3 SFT and DPO checkpoints and the final models on development and unseen tasks corresponding to each of the core skills. Table shows that our pipeline generalizes well to unseen evaluations.

judge.

To make decisions about the evaluation setup, we collected human judgments comparing responses from a diverse set of 16 models, when prompted using the instructions taken from a subset of our evaluation dataset. We collected four human judgments per each model response pair, and compared the agreement of each

为了做出有关评估设置的决策,当提示使用评估数据集子集的指令时,我们收集了人类判断,比较来自 16 个不同模型的响应.我们为每个模型响应对收集了四个人类判断,并比较了每个响应的一致性

evaluation setup with majority human judgments. We repeated this procedure for each task category to identify the best setup for that category.

大多数人的判断的评估设置.我们对每个任务类别重复此过程,以确定该类别的最佳设置.

Summary of the Final Evaluation Setup. We used Llama 3.1 70B Instruct as our LM judge since its agreement with human judges was the highest of the pool of models we considered. Our baseline model we used is Llama 3.1 405B Instruct. We found that using LM as a judge results in higher human agreement (compared to the embedding-based method) in all subtasks except Open QA and Fact Checking. We use embedding similarity with human-written references as the way of computing win-rates in these two subtasks. Of the remaining 9 subtasks, evaluation in Brainstorming and Summarization did not benefit from using human-written references while prompting the LM judge, and hence prompt LM judges with human references only for the remaining 7 subtasks. On the subset for which we collected human judgments, our composite evaluation procedure resulted in an agreement of 69.4% with humans, which is comparable to the inter-human agreement of 67%.

最终评估设置摘要.我们使用 Llama 3.1 70B Instruct 作为我们的 LM 判断,因为它与人类判断的一致性是我们考虑的模型池中最高的.我们使用的基线模型是 Llama 3.1 405B Instruct.我们发现,在除开放式 QA 和事实检查之外的所有子任务中,使用 LM 作为判断会产生更高的人类一致性（与基于嵌入的方法相比）.我们使用与人工编写的参考文献的嵌入相似性作为计算这两个子任务中获胜率的方式.在其余 9 个子任务中,头脑风暴和总结中的评估在提示 LM 判断时并没有从使用人类编写的参考中受益,因此仅针对其余 7 个子任务提示 LM 判断使用人类参考.在我们收集人类判断的子集上,我们的综合评估程序与人类的一致性为 69.4%,与人类间的一致性 67% 相当.

7.4 Evaluating the Development Process Using the Unseen Suite · 使用 Unseen Suite 评估开发过程

7.4 使用 Unseen Suite 评估开发过程

To evaluate how much and in what ways we over-fit to our development evaluations, we measure the performance of our models on unseen tasks that still correspond to the same set of core skills. We evaluate the checkpoints corresponding to various design decisions we made in the development process on the unseen suite to check whether our decisions overfit to the development evaluations, and summarize our findings in Section 7.4.1. In Section 7.4.2, we show a comparison between our final checkpoints and comparable public models.

为了评估我们在多大程度上以及以何种方式过度适应我们的发展评估,我们测量了我们的模型在仍然对应于同一组核心技能的看不见的任务上的性能.我们评估了与我们在开发过程中在看不见的套件上做出的各种设计决策相对应的检查点,以检查我们的决策是否过度适合开发评估,并在第 7.4.1 节中总结了我们的发现.在第 7.4.2 节中,我们展示了最终检查点和可比较的公共模型之间的比较.

7.4.1 Evaluating the design decisions · 评估设计决策

Training pipeline. Table 31 shows the performance of the SFT, DPO, and the final checkpoints of Tülu 3 at 8B and 70B sizes on one development and one unseen evaluation for each core skill. We see that our pipeline generalizes well to unseen evaluations, with the final checkpoints obtaining the best average performance on both the development and unseen evaluations. For Reasoning and Coding, where the SFT checkpoints have the best performance on development evaluations, the subsequent training stages still improve model performance on harder unseen evaluations.

培训管道.表 31 显示了 SFT、DPO 以及 Tülu 3 在 8B 和 70B 大小下在一项开发和每项核心技能的一次未见评估中的最终检查点的性能.我们看到我们的管道很好地推广到了未见的评估,最终的检查点在开发和未见的评估上都获得了最佳的平均性能.对于推理和编码,SFT 检查点在开发评估中具有最佳性能,后续训练阶段仍然可以提高模型在更难的未见评估中的性能.

Data mixing for SFT. To assess whether the data mixing choices we made for SFT generalize to unseen evaluations, we evaluate the performance of various data-ablated SFT models with the final SFT checkpoint, as shown in Table 32. For each core skill, we compare the model performance trends on a development and an unseen evaluation. We see that the data choices generalize on average, as indicated by the best average performances on both development and unseen evaluations by the final SFT checkpoint. In individual skills, we see that our choices overfit to the development evaluations in Precise Instruction Following, and to some extent in Knowledge Recall and Reasoning.

SFT 的数据混合.为了评估我们为 SFT 所做的数据混合选择是否泛化到未见的评估,我们使用最终的 SFT 检查点评估各种数据消融的 SFT 模型的性能,如表 32 所示.对于每项核心技能,我们比较开发和未见评估的模型性能趋势.我们看到数据选择平均而言具有概括性,正如最终 SFT 检查点的开发和未见评估的最佳平均性能所表明的那样.在个人技能方面,我们发现我们的选择过度适合精确指令跟随的发展评估,并且在某种程度上适合知识回忆和推理.

44

<!-- page 45 of 82 -->

Know. Recall Reasoning Math Coding Inst. Follow.

Model Dev.

Avg

Uns. Avg. MMLU GPQA BBH AGIE MATH DMM CHE BCB IFE IFEO

Tülu 3 8B SFT 64.1 29.9 62.1 31.9 67.9 56.2 31.5 32.3 86.2 11.5 72.8 17.6

w/o WildChat 62.8 28.8 61.0 31.5 65.6 53.1 31.8 31.2 85.3 7.4 70.1 20.8

w/o Safety 63.7 29.7 62.0 31.9 68.3 55.6 32.6 32.6 84.5 10.8 71.0 17.6

w/o Persona Data 59.8 29.4 62.4 29.5 68.3 56.9 30.1 31.8 84.5 10.8 53.6 18.0

w/o Math Data 62.2 27.4 62.2 32.6 68.9 54.1 23.5 23.3 86.0 8.8 70.6 18.3

Table 32 Comparison of the performance of data-source ablated SFT models with that of the final Tülu 3 8B SFT checkpoint. Numbers in bold reflect the best performance per column. AGIE is AGIEval, DMM is Deepmind Mathematics, CHE is Codex HumanEval, BCB is BigCodeBench, IFE is IFEval and IFEO is IFEval-OOD.

60

50

40

30

Performance

20

10

AVG (Dev) MATH AVG (Unseen) DeepMindMath-v3 0 · AVG（开发）数学 AVG（未见）DeepMindMath-v3 0

Initial 8B SFT 5% 10% 25% 50% 75% 100%

Figure 24 Effect of scaling the size of the preference dataset, specifically the number of unique prompts, on downstream DPO model performance in development and unseen evaluations. AVG are the averages of all the tasks in development and unseen suites. Also shown are the trends in MATH and Deepmind Mathematics.

Data scaling for preference tuning. We show the effect of scaling DPO data on development and unseen evaluations in Figure 24. We see that the scaling trends generalize on average to unseen evaluations. Of note is the trend we observed in the development and unseen Math evaluations, indicating that our development process overfit to MATH to some extent. We hypothesize this is mainly due to formatting differences between MATH and Deepmind Math. The former often requires solutions and answers to be output in LaTeX format, while the latter does not. We found that our trained models have the tendency to format the chain-of-thought reasoning and the final answers in LaTeX even for the questions in the Deepmind Math dataset where this is not required. This often interfered with the intermediate reasoning, and also made our answer extraction logic fail.

用于偏好调整的数据缩放.我们在图 24 中展示了扩展 DPO 数据对开发和未见评估的影响.我们看到扩展趋势平均概括为未见评估.值得注意的是我们在开发和看不见的数学评估中观察到的趋势,表明我们的开发过程在某种程度上过度适应数学.我们假设这主要是由于 MATH 和 Deepmind Math 之间的格式差异造成的.前者通常需要以 LaTeX 格式输出解决方案和答案,而后者则不需要.我们发现,我们训练的模型倾向于在 LaTeX 中格式化思维链推理和最终答案,即使对于 Deepmind 数学数据集中不需要这样做的问题也是如此.这往往会干扰中间推理,也使我们的答案提取逻辑失败.

7.4.2 Comparison with public models · 与公开型号的比较

Table 33 shows a comparison between Tülu 3 models, Llama 3.1 Instruct models, and Hermes 3 Llama 3.1 models at 8B and 70B sizes, and Table 48 shows a subtask-level breakdown of the performance of these models on HREF. It is important to note that while all these evaluations are unseen for the Tülu 3 models, we do not know if GPQA, MMLU-Pro, AGIEval, DeepMind Math, and BigCodeBench were used for developing the two other models. We summarize below our key takeaways from this comparison and from our qualitative analysis of the outputs of Tülu 3 models on these datasets:

Tülu 3 generalizes well to unseen evaluations. In almost all the evaluations, Tülu 3’s performance is generally comparable to that of the two other models we evaluate, often falling between the performance numbers of the two models. This suggests that our recipe of choosing representative evaluations for each core-skill and curating training datasets targeting those evaluations can lead to models that generalize well to other tasks that require the same skills.

Tülu 3 很好地概括了未见过的评估.在几乎所有的评测中,Tülu 3的性能总体上与我们评测的另外两款机型相当,往往落在两款机型的性能数字之间.这表明,我们为每个核心技能选择代表性评估并针对这些评估策划训练数据集的方法可以使模型能够很好地推广到需要相同技能的其他任务.

Models generally overfit to IFEval. We find that there is a significant difference between performance on IFEval and IFEval-OOD of all the models, even though we created the latter to be structured very similar to the

模型通常会过度拟合 IFEval.我们发现所有模型的 IFEval 和 IFEval-OOD 的性能之间存在显着差异,尽管我们创建的后者的结构与

45

<!-- page 46 of 82 -->

Tülu 3

Skill Benchmark(eval)

70B

Llama 3.1 8B Instruct

Hermes 3 Llama 3.1 8B Tülu 3 8B

Llama 3.1 70B Instruct

Hermes 3 Llama 3.1 70B

Avg. 36.4 30.7 34.2 51.3 43.1 47.2

Knowledge Recall GPQA(0 shot, CoT) 28.8 32.8 35.7 43.8 42.6 48.0 MMLU Pro(0 shot, CoT) 49.1 40.9 44.3 68.3 60.3 65.8 Reasoning AGIEval English(0 shot, CoT) 64.2 58.1 59.3 77.8 73.3 75.0 Math DeepMind Math(0 shot, CoT) 39.3 28.3 35.4 62.4 50.0 49.8 Coding BigCodeBench-Hard(Pass@10) 15.5 9.5 7.4 26.4 14.2 21.6 Instruct Following IFEval OOD(Prompt loose) 26.1 19.4 24.3 34.5 24.6 27.8 HREF(Winrate) 38.5 26.2 32.7 45.6 36.8 42.3

Table 33 Evaluation of a selection of open-weight and Tülu 3 models on our unseen evaluation suite. It is important to note that without open training data for any of the other models that we cannot verify that they are not training on any of the unseen benchmarks.

original dataset, just with a disjoint set of constraints. We observe that instruction following with verifiable constraints is a challenging skill for models to learn effectively, and hypothesize that those models that do well on IFEval are likely overfitting to the specific set of constraints included in the dataset, making it hard for them to generalize to new constraints.

原始数据集,仅具有一组不相交的约束.我们观察到,遵循可验证约束的指令对于模型有效学习来说是一项具有挑战性的技能,并假设那些在 IFEval 上表现良好的模型可能过度拟合数据集中包含的特定约束集,从而使其难以推广到新的约束.

Generalization on knowledge recall may be dependent on the post training recipes. As one might expect, the performance of models on MMLU and MMLU-Pro is correlated. We see that their performance on GPQA shows a different trend — all three models we compare here are post-trained from the same base model, suggesting that the post-training recipe may affect the generalization in knowledge-recall.

知识回忆的概括可能取决于培训后的食谱.正如人们所预料的那样,MMLU 和 MMLU-Pro 上的模型性能是相关的.我们看到它们在 GPQA 上的表现显示出不同的趋势——我们在这里比较的所有三个模型都是从同一基础模型进行后训练的,这表明后训练配方可能会影响知识回忆的泛化.

Instruction following performance varies across categories. We observe that the relative performance of Tülu 3 models on AlpacaEval is different from that on HREF. This may be explained by the fact that instruction following is a highly diverse task, and the distributions of HREF and AlpacaEval may differ, with some categories of instructions not necesarily transferring well to others, leading to the shift in relative performance. We do note that Tülu 3 70B outperforms Llama 3.1 70B Instruct on 5 out of 11 subtasks, as seen in Table 48 in the Appendix, which shows a breakdown of model performance across subtasks in HREF. Future work will explore how different behaviors of instruction following can be measured with more diverse instruction following evaluations.

不同类别的指令跟随性能有所不同.我们观察到 Tülu 3 模型在 AlpacaEval 上的相对性能与 HREF 上的相对性能不同.这可能是因为指令跟随是一项高度多样化的任务,并且 HREF 和 AlpacaEval 的分布可能不同,某些类别的指令不一定能很好地转移到其他类别,从而导致相对性能的变化.我们确实注意到,Tülu 3 70B 在 11 个子任务中的 5 个上优于 Llama 3.1 70B Instruct,如附录中的表 48 所示,该表显示了 HREF 中各子任务的模型性能细分.未来的工作将探索如何通过更多样化的指令跟随评估来衡量不同的指令跟随行为.

8 Discussions · 讨论

8.1 Scaling Tülu 3 Recipe to Llama 3.1 405B

Here, we demonstrate the scalability and effectiveness of our post-training recipe applied at 405B parameter scale. Scaling to this size required several engineering efforts and posed a number of challenges:

在这里,我们展示了在 405B 参数规模下应用的训练后配方的可扩展性和有效性.扩展到这种规模需要进行多项工程工作,并带来了许多挑战：

• Compute Requirements: Training Tülu 3 405B demanded 32 nodes (256 GPUs) running in parallel. While most of our codebase scaled well, we occasionally encountered NCCL timeout and synchronization

• 计算要求：训练Tülu 3 405B 需要32 个节点（256 个GPU）并行运行.虽然我们的大多数代码库都可以很好地扩展,但我们偶尔会遇到 NCCL 超时和同步问题

issues that required meticulous monitoring and intervention (especially with RL training). Using more GPUs increased the chances of encountering hardware failures, necessitating semi-frequent run restarts.

需要细致监控和干预的问题（尤其是强化学习训练）.使用更多 GPU 会增加遇到硬件故障的机会,从而需要半频繁地重新启动运行.

• RLVR Training: For inference, we deployed the model using vLLM with 16-way tensor parallelism, while utilizing the remaining 240 GPUs for training. After each iteration of RLVR update, the weights are synchronized to the vLLM engine using NCCL broadcast. Inference typically takes ∼550 seconds, weight transfer takes ∼25 seconds, and training takes ∼1,500 seconds. To reduce computational cost during the RLVR stage, we utilized an 8B value model. Future works can benefit from exploring larger value models or alternate value model-free RL algorithms such as GRPO (Shao et al., 2024).

• RLVR 训练：为了进行推理,我们使用具有 16 路张量并行性的 vLLM 部署模型,同时利用剩余的 240 个 GPU 进行训练.每次 RLVR 更新迭代后,权重都会使用 NCCL 广播同步到 vLLM 引擎.推理通常需要约 550 秒,权重转移需要约 25 秒,训练需要约 1,500 秒.为了降低 RLVR 阶段的计算成本,我们使用了 8B 值模型.未来的工作可以从探索更大的价值模型或替代的无价值模型的 RL 算法（例如 GRPO）中受益（Shao 等人,2024）.

• Hyperparameter Tuning Challenges: Given the computational costs, hyperparameter tuning was limited.

• 超参数调整挑战：考虑到计算成本,超参数调整受到限制.

46

<!-- page 47 of 82 -->

Hyperparameters 405B RLVR

Learning Rate 1 × 10-7

Hyperparameter 405B SFT 405B DPO

Learning Rate 2 × 10−6 2 × 10−7

Learning Rate Schedule Linear Linear Batch Size (effective) 256 256 Max Token Length 4,096 2,048 KL penalty coefficient β - 5 Warm up ratio 0.03 0.1 Number of Epochs 2 1

学习率计划 线性 线性 批量大小（有效） 256 256 最大令牌长度 4,096 2,048 KL 惩罚系数 β - 5 预热比率 0.03 0.1 时期数 2 1

Table 34 Hyperparameters for training Tülu 3 405B. We use a larger batch size due to the increased number of GPUs, and lower the SFT learning rate.

Discount Factor γ 1.0 General Advantage Estimation λ 0.95 Mini-batches Nmb 1 PPO’s Clipping Coefficient ε 0.2 Value Function Coefficient c1 0.1 Gradient Norm Threshold 1.0 Learning Rate Schedule Linear Generation Temperature 1.0 Batch Size (effective) 1,856 Max Token Length 2,048 Max Prompt Token Length 2,048 Penalty Reward Value for Responses without an EOS Token -10.0 PPO Update Iterations K 1 Response Length 1,024 Total Episodes 300,000 KL penalty coefficient (β) 0.05 Warm up ratio (ω) 0.0

折扣因子 γ 1.0 一般优势估计 λ 0.95 小批量 Nmb 1 PPO 裁剪系数 ε 0.2 价值函数系数 c1 0.1 梯度范数阈值 1.0 学习率计划 线性生成温度 1.0 批量大小（有效） 1,856 最大代币长度 2,048 最大提示代币长度 2,048 惩罚奖励没有 EOS 代币的响应价值 -10.0 PPO 更新迭代次数 K 1 响应长度 1,024 总集数 300,000 KL 惩罚系数 (β) 0.05 预热比率 (ω) 0.0

Table 35 The hyperparameters of PPO used for optimiz- ing against a general RM.

Following prior Tülu and Llama work, we opted to lower the LR for larger models, training with a “lighter touch”.

继之前的 Tülu 和 Llama 工作之后,我们选择降低较大模型的 LR,以“更轻的接触”进行训练.

Our training recipe for the 405B model followed very similarly to that of the 8B and 70B models,23 but with a different training dataset for RLVR. Given the model’s saturation of GSM8K from SFT and DPO training alone, we removed the GSM8K data, and we additionally found that the IFEval data did not help much in initial RLVR runs. As such, for Tülu 3 405B RLVR we only used the MATH train set. Surprisingly, we found that even with as few as 25 RLVR steps, MATH performance improved by over 5 points, and continued to increase with more training.

我们对 405B 模型的训练方法与 8B 和 70B 模型非常相似,23 但 RLVR 的训练数据集不同.考虑到仅通过 SFT 和 DPO 训练模型的 GSM8K 饱和度,我们删除了 GSM8K 数据,并且我们还发现 IFEval 数据在初始 RLVR 运行中没有多大帮助.因此,对于 Tülu 3 405B RLVR,我们仅使用 MATH 列车组.令人惊讶的是,我们发现即使 RLVR 步数只有 25 个,数学成绩也能提高超过 5 分,并且随着训练的增多而继续提高.

With the challenges of scaling the asynchronous RL infrastructure, we only trained for 75 steps, fewer than our

面对扩展异步 RL 基础设施的挑战,我们只训练了 75 个步骤,比我们的

smaller models. The RL reward, KL divergence, and response length per training batch are shown in Fig. 25. The training hyperparameters for the SFT and DPO stages are shown in Table 34. The hyperparameters for RL with verifiable rewards at this scale are shown in Table 35.

较小的型号.每个训练批次的 RL 奖励、KL 散度和响应长度如图 25 所示.SFT 和 DPO 阶段的训练超参数如表 34 所示.在此规模下具有可验证奖励的 RL 超参数如表 35 所示.

In Table 4, we compare Tülu 3 405B with prior state-of-the-art models finetuned from Llama 3.1 405B as well as DeepSeek-V3 (DeepSeek-AI et al., 2024) and GPT-4o. Generally, Tülu 3 405B results are improved compared to Tülu 3 70B.Tülu 3 405B achieves competitive or superior performance to both Deepseek v3 and GPT-4o, while also surpassing prior open-weight post-trained models of the same size including Llama 3.1 405B Instruct and Nous Hermes 3 405B (Teknium et al., 2024) on many standard benchmarks. We note that we ended RLVR training early due to compute constraints, and further training may further improve performance. In particular, we did not observe that MATH performance had saturated during training and testing (see Figure 25).

在表 4 中,我们将 Tülu 3 405B 与根据 Llama 3.1 405B 以及 DeepSeek-V3（DeepSeek-AI 等人,2024）和 GPT-4o 进行微调的先前最先进模型进行了比较.一般来说,与 Tülu 3 70B 相比,Tülu 3 405B 的结果有所提高.Tülu 3 405B 实现了与 Deepseek v3 和 GPT-4o 竞争或优越的性能,同时在许多方面也超越了之前相同大小的开放重量后训练模型,包括 Llama 3.1 405B Instruct 和 Nous Hermes 3 405B (Teknium et al., 2024)标准基准.我们注意到,由于计算限制,我们提前结束了 RLVR 训练,进一步的训练可能会进一步提高性能.特别是,我们没有观察到数学成绩在训练和测试期间已经饱和（见图 25）.

23DPO Preference Mixture for 405B: allenai/llama-3.1-tulu-3-405b-preference-mixture

405B 的 23DPO 偏好混合物：allenai/llama-3.1-tulu-3-405b-preference-mixture

47

<!-- page 48 of 82 -->

MATH Train Split MATH Test Split Final 405B Checkpoint

405B RL Run

450

7.0

400

10

6.5

350

5

KL Divergence · KL散度

6.0

Response Length · 响应长度

Verifiable Rewards

300

0

0K 50K 100K 150K

0K 50K 100K 150K

0K 50K 100K 150K

Episodes

Figure 25 Rewards on MATH, KL divergence, and the average response length for the final 405B training run. We mark the point with the final checkpoint with a star. We note that this was the last checkpoint saved – we intended to train longer but hit compute constraints. Note that technically the metrics in MATH test split is accuracy, but here we multiply the accuracy by 10 to convert to verifiable rewards.

8.2 Insights from the Unfruitful · 来自无果之人的见解

In this section, we discuss a number of methods and approaches we considered for Tülu 3 but did not ultimately make it into our final recipe for a variety of reasons.

在本节中,我们讨论了一些我们为 Tülu 3 考虑过的方法和方法,但由于各种原因最终没有将其纳入我们的最终方案.

Online DPO. Standard DPO methods use preference datasets that are usually collected ahead of time, often from a distinct language model, and are thus considered as offline. In other words, with DPO, the policy cannot obtain feedback over it own generations during training. This is in contrast to online methods like PPO where the RM provides online feedback to generations from the policy πθ being trained. To mitigate the distributional shift issue, recent works proposed Online DPO (Guo et al., 2024) following a three-step process: (1) sample 2 responses to a prompt from the current policy; (2) obtain online feedback over the response pair

在线 DPO.标准 DPO 方法使用通常提前收集的偏好数据集（通常来自不同的语言模型）,因此被视为离线.换句话说,对于DPO,策略在训练期间无法获得其自身代的反馈.这与 PPO 等在线方法形成鲜明对比,在 PPO 中,RM 根据正在训练的策略 πθ 向各代人提供在线反馈.为了缓解分配转移问题,最近的研究提出了在线 DPO（Guo 等人,2024）,遵循三个步骤：（1）对当前政策提示的样本 2 响应； (2) 获取响应对的在线反馈

to create pairwise data, and (3) use this pairwise data update the policy πθ via standard DPO loss. While the original paper proposed using online AI feedback for step 2, to better scale our experiments, we obtain feedback from a trained reward model.

创建成对数据,(3) 使用此成对数据通过标准 DPO 损失更新策略 πθ.虽然最初的论文建议在第 2 步中使用在线人工智能反馈,但为了更好地扩展我们的实验,我们从训练有素的奖励模型中获取反馈.

We tried online DPO both to enhance general, and target capabilities, i.e., mathematical reasoning. For

我们尝试在线 DPO 来增强一般能力和目标能力,即数学推理.为了

general capabilities, we train an RM for 1 epoch using the 82K preference data points from the Skywork.24 For targeting mathematical reasoning, we continue training the same RM on our synthetic on-policy math-specific preference data (described in §5.2.1). Training online DPO on top of one of our Tülu 3 DPO checkpoint for total of 200K episodes on math problems (prompts are taken from the same RM training data), resulted in no or little improvement on GSM8K and degradation on MATH performance (we experimented with various sampling temperatures and KL penalty coefficients). We did not further explore this approach extensively, as our initial results suggested limited gains in both general and targeted domains. Future work could investigate alternative training strategies, such as different sampling methods, or finetuning RM architectures, to better align the optimization process with the desired capabilities.

为了实现一般功能,我们使用来自 Skywork 的 82K 偏好数据点训练 RM 1 epoch.24 为了进行数学推理,我们继续在合成的策略特定数学偏好数据上训练相同的 RM（第 5.2.1 节中所述）.在我们的 Tülu 3 DPO 检查点之一之上进行在线 DPO 训练,总共 200K 集数学问题（提示取自相同的 RM 训练数据）,导致 GSM8K 没有或几乎没有改善,并且 MATH 性能下降（我们尝试了各种采样温度和 KL 惩罚系数）.我们没有进一步广泛地探索这种方法,因为我们的初步结果表明在一般领域和目标领域中的收益有限.未来的工作可以研究替代训练策略,例如不同的采样方法或微调 RM 架构,以更好地使优化过程与所需的功能保持一致.

Rejection Sampling. Rejection sampling for large language models is an increasingly popular method for improving post-training performance of frontier language models (Dubey et al., 2024; Adler et al., 2024; Dong et al., 2023). Using an initial SFT and preference data mix to train an initial model, that model is used to then generate n responses to each SFT prompt. These n responses, in addition to the original response, are then ranked using a reward model or an LLM as a judge, and the best response is kept. The other responses can then be used to create chosen/rejected pairs for preference optimization. The full post-training pipeline is then run on these datasets, and the process repeats until performance converges.

拒绝抽样.大型语言模型的拒绝采样是一种越来越流行的提高前沿语言模型训练后性能的方法（Dubey et al., 2024；Adler et al., 2024；Dong et al., 2023）.使用初始 SFT 和偏好数据组合来训练初始模型,然后使用该模型生成对每个 SFT 提示的 n 个响应.然后,除了原始响应之外,还使用奖励模型或LLM作为评判对这n个响应进行排名,并保留最佳响应.然后可以使用其他响应来创建选择/拒绝对以进行偏好优化.然后在这些数据集上运行完整的训练后管道,并重复该过程直到性能收敛.

We tried rejection sampling, but found that for our setup the performance gains were minimal for the amount

我们尝试了拒绝采样,但发现对于我们的设置来说,性能增益对​​于数量来说是最小的

of compute required, and thus we leave a deeper exploration for future work. Qualitatively, we found that strong judges are vital, and publicly available models can struggle to choose the best response out of the candidates. We also found that including the original response as a choice for the judge (in other words,

所需的计算量,因此我们为未来的工作留下了更深入的探索.定性地讲,我们发现强有力的评判至关重要,而公开可用的模型可能很难从候选人中选择最佳答案.我们还发现,将最初的回应作为法官的选择（换句话说,

24https://huggingface.co/datasets/Skywork/Skywork-Reward-Preference-80K-v0.1

24https://huggingface.co/datasets/Skywork/Skywork-Reward-Preference-80K-v0.1

48

<!-- page 49 of 82 -->

choosing the best response out of the n generations in addition to the original response) performed much better than only choosing from the newly generated responses.

除了原始响应之外,从 n 代中选择最佳响应）比仅从新生成的响应中进行选择要好得多.

8.3 Future Work · 未来的工作

While we aimed to cover a broad set of skills for Tülu 3, due to various limitations, we left some skills for

虽然我们的目标是涵盖 Tülu 3 的广泛技能,但由于各种限制,我们留下了一些技能

future iterations of Tülu. We discuss some of these skills below:

Tülu 的未来迭代.我们在下面讨论其中一些技能：

Long Context and Multi-turn. Currently, the data collected for Tülu 3 is relatively short and does not contain long multi-turn data (the average number of turns in our mixture is 2.4 turns and majority of samples are under 2,048 tokens in length). However, long-context has been popular area of focus in recent work (Pawar et al., 2024), as improving the context window of LMs enables new use-cases (Gemini Team, 2024) and more in-context examples, potentially improving performance (Agarwal et al., 2024). Relatedly, improving multi-turn capabilities can better improve end-user experience, with a non-trivial number of real-world user conversations with LMs going over 2 turns (Zhao et al., 2024). We hope to address both skills in the future with dedicated training and evaluations.

长上下文和多轮.目前,Tülu 3 收集的数据相对较短,并且不包含长的多圈数据（我们的混合物中的平均圈数为 2.4 圈,大多数样本长度低于 2,048 个令牌）.然而,长上下文一直是最近工作中的热门关注领域（Pawar 等人,2024）,因为改进 LM 的上下文窗口可以实现新的用例（Gemini Team,2024）和更多上下文示例,从而可能提高性能（Agarwal 等人,2024）.与此相关的是,改进多轮能力可以更好地改善最终用户体验,现实世界中用户与 LM 的对话数量不少于 2 轮（Zhao 等人,2024）.我们希望在未来通过专门的培训和评估来解决这两种技能.

Multilinguality. We specifically focus on English data and evaluations for Tülu 3 (although we do include the multilingual Aya (Üstün et al., 2024) dataset due to its high quality). However, this neglects the myriad languages apart from English spoken around the world, speakers of which may benefit from or desire LMs that can process their languages. Future work may examine the current multilingual abilities of Tülu 3 and how to further improve them. We also note that multilingual post-training can make use of different techniques to monolingual post-training – for example, cross-lingual alignment (Wu et al., 2024) or careful data balancing strategies (Li et al., 2024b). This makes multilingual post-training an interesting and impactful area for future work.

多语言能力.我们特别关注 Tülu 3 的英语数据和评估（尽管由于其高质量,我们确实包含了多语言 Aya（Üstün 等人,2024）数据集）.然而,这忽略了世界各地除英语之外的无数语言,这些语言的使用者可能会受益于或希望能够处理其语言的语言模型.未来的工作可能会检查 Tülu 3 目前的多语言能力以及如何进一步提高它们.我们还注意到,多语言后期培训可以利用与单语言后期培训不同的技术——例如,跨语言对齐（Wu et al., 2024）或仔细的数据平衡策略（Li et al., 2024b）.这使得多语言后培训成为未来工作有趣且有影响力的领域.

Tool Use and Agents. While we evaluate Tülu 3 on its own, LMs are being increasingly deployed as parts of larger systems, in which they have access to tools (Qu et al., 2024) or are themselves part of a larger ‘agent’ framework.25 Furthermore, training models to use tools is a natural way to dramatically improve their

工具使用和代理.虽然我们单独评估 Tülu 3,但 LM 越来越多地被部署为大型系统的一部分,在这些系统中它们可以访问工具（Qu 等人,2024）,或者它们本身就是更大“代理”框架的一部分. 25 此外,使用工具训练模型是显着提高模型性能的自然方式.

reasoning and mathematical skills (Gou et al., 2024), rather than trying to accomplish everything ‘in the weights.’ Future work involves training or evaluating Tülu 3 for tool-use either on its own or as part of a larger framework.

推理和数学技能（Gou 等人,2024）,而不是试图“在权重中”完成所有事情.未来的工作包括训练或评估 Tülu 3 的工具使用情况,无论是单独使用还是作为更大框架的一部分.

9 Related Work · 相关工作

9.1 The Evolution of Post-training Recipes · 训练后食谱的演变

Modern “post-training” has its roots in multi-task language model training, in particular instruction tuning (Mishra et al., 2022; Wei et al., 2022a; Sanh et al., 2022; Wang et al., 2022b; Longpre et al., 2023), in which

现代“后训练”源于多任务语言模型训练,特别是指令调优（Mishra et al., 2022; Wei et al., 2022a; Sanh et al., 2022; Wang et al., 2022b; Longpre et al., 2023）,其中

language models are trained on samples including task instructions and their corresponding responses, allowing the models to generalize ‘zero-shot’ to new tasks.26 Early instruction-tuning datasets tended to focus on more traditional NLP tasks (e.g., natural language inference) rather than more generic tasks that downstream users might perform (Wang et al., 2022a). With the rise of ChatGPT and chat-based LMs (Claude, Gemini, etc), post-training techniques evolved beyond instruction tuning to include preference tuning stages, with models undergoing both instruction tuning and then preference finetuning (PreFT) or “RLHF” (Ouyang et al., 2022).

语言模型在包括任务指令及其相应响应的样本上进行训练,从而使模型能够将“零样本”推广到新任务.26早期的指令调优数据集往往侧重于更传统的 NLP 任务（例如自然语言推理）,而不是下游用户可能执行的更通用的任务（Wang 等人,2022a）.随着 ChatGPT 和基于聊天的 LM（Claude、Gemini 等）的兴起,训练后技术的发展超越了指令调整,包括偏好调整阶段,模型先经历指令调整,然后进行偏好微调（PreFT）或“RLHF”（Ouyang 等人,2022）.

Early work in RLHF originated from experiments on Deep RL for control (Christiano et al., 2017; Ibarz et al., 2018; Leike et al., 2018) and typically involved first learning a reward model from human preferences, and then optimizing a language model via an RL framework using the learnt reward (Stiennon et al., 2020; Nakano et al., 2021; Askell et al., 2021; Ouyang et al., 2022). Recently, approaches that allow directly training a language model on such preferences have been developed (Rafailov et al., 2024; Zhao et al., 2023), reducing the complexity of incorporating PreFT into training. While early approaches to PreFT were extremely human-centric, using tens or hundreds of thousands of human-written instructions and human preference

RLHF 的早期工作源于用于控制的深度强化学习实验（Christiano 等人,2017 年；Ibarz 等人,2018 年；Leike 等人,2018 年）,通常涉及首先根据人类偏好学习奖励模型,然后使用学习到的奖励通过 RL 框架优化语言模型（Stiennon 等人,2020 年；Nakano 等人,2021 年；Asell 等人, 2021；欧阳等人,2022）.最近,已经开发出允许根据此类偏好直接训练语言模型的方法（Rafailov 等人,2024；Zhao 等人,2023）,从而降低了将 PreFT 纳入训练的复杂性.虽然早期的 PreFT 方法极其以人为中心,使用数万或数十万条人类编写的指令和人类偏好

25For example, the OpenHands platform (Wang et al., 2024a). 26The term “post-training” substantially predates modern chat language models (Moreau and Audiffren, 2016; Xu et al., 2019), but was recently popularized.

25例如,OpenHands 平台（Wang 等人,2024a）. 26“训练后”一词实质上早于现代聊天语言模型（Moreau 和 Audiffren,2016；Xu 等人,2019）,但最近才开始流行.

49

<!-- page 50 of 82 -->

labels, more recent work uses mixtures of human and synthetically generated preference data, along with multiple rounds of training and varied training algorithms (Touvron et al., 2023; Dubey et al., 2024; Gunter et al., 2024).

最近的工作使用人类和综合生成的偏好数据的混合,以及多轮训练和不同的训练算法（Touvron 等人,2023；Dubey 等人,2024；Gunter 等人,2024）.

During the evolution of RLHF primarily in closed laboratories, open recipes for post-training have lagged somewhat behind. Initial attempts at building ‘open post-training recipes’ focused on the instruction-tuning stage (Taori et al., 2023; Conover et al., 2023), finetuning openly released language models on synthetically generated or human made datasets. While combining these datasets could yield strong performance (Wang et al., 2023), incorporating a PreFT stage proved important for bridging the gap with closed models based on human evaluations (Ivison et al., 2023). Today, most popular adapted models with open recipes for PreFT use DPO (or one of its variants), and AI feedback data including Tülu 2 (Ivison et al., 2023), Zephyr-β (Tunstall et al., 2023), and Starling (Zhu et al., 2023). However, many of these models are outdated relative to closed post-training recipes both in terms of data and in performance: no open-recipe models exist in the top 50 of LMSYS’s ChatBotArena (as of November 20th, 2024) have released their post-training data (Chiang et al., 2024). Most of these open recipes use relatively little data and few rounds of training compared to closed post-training setups, which can involve multiple rounds of training with varied objectives, and millions of datapoints (Touvron et al., 2023; Dubey et al., 2024). For instance, Llama 3.1 trained on generated outputs from the previous model for multiple rounds with extensive human feedback data, and used strong models to write synthetic instructions (Dubey et al., 2024). Other recent developments includes rejection sampling for synthetic data and advanced reward modeling for step-wise assistant responses (Lightman et al., 2023).

在 RLHF 主要在封闭实验室中发展的过程中,训练后的开放方法有些落后.构建“开放式训练后配方”的初步尝试侧重于指令调整阶段（Taori 等人,2023；Conover 等人,2023）,在合成生成或人造数据集上微调公开发布的语言模型.虽然组合这些数据集可以产生强大的性能（Wang 等人,2023）,但事实证明,合并 PreFT 阶段对于缩小与基于人类评估的封闭模型的差距非常重要（Ivison 等人,2023）.如今,最流行的 PreFT 开放配方改编模型使用 DPO（或其变体之一）和 AI 反馈数据,包括 Tülu 2（Ivison 等人,2023）、Zephyr-β（Tunstall 等人,2023）和 Starling（Zhu 等人,2023）.然而,相对于封闭式训练后配方,这些模型中的许多模型在数据和性能方面都已经过时：LMSYS 的 ChatBotArena 的前 50 名中不存在开放式配方模型（截至 2024 年 11 月 20 日）已发布其训练后数据（Chiang 等人,2024）.与封闭式训练后设置相比,大多数开放式方法使用相对较少的数据和几轮训练,封闭式训练后设置可能涉及具有不同目标的多轮训练和数百万个数据点（Touvron 等人,2023 年；Dubey 等人,2024 年）.例如,Llama 3.1 使用大量人类反馈数据对先前模型生成的输出进行多轮训练,并使用强大的模型来编写合成指令（Dubey 等人,2024）.其他最新进展包括合成数据的拒绝采样和逐步辅助响应的高级奖励建模（Lightman 等人,2023）.

Whilst we do not entirely reach the size of these closed recipes, in this work we hope to push the state of open

虽然我们还没有完全达到这些封闭食谱的规模,但在这项工作中,我们希望推动开放状态

post-training recipes forward by building a recipe that matches or beats strong closed recipes, and releasing all related artefacts (code, models, data, etc) for further scientific study and use. Our pipeline is significantly larger and more complex than prior work, comprising of almost a million instruction tuning samples, hundreds of thousands of preference pairs, and a novel online RL training phase.

通过构建匹配或击败强大的封闭配方的配方,并发布所有相关的工件（代码、模型、数据等）以供进一步的科学研究和使用,来推进训练后配方.我们的流程比之前的工作要大得多、更复杂,包括近一百万个指令调整样本、数十万个偏好对和一个新颖的在线强化学习训练阶段.

9.2 Training on Verifiable Rewards · 可验证奖励培训

The RLVR approach proposed in this work relates to a variety of recent work on improving LM reasoning through RL-related techniques. Closely related is the self-taught reasoner (STaR) line of work (Zelikman et al., 2022, 2024) and TRICE (Hoffman et al., 2023), both of which examine using existing ground-truth answers as signals to generate better model rationales (or chains-of-thought). STaR can be seen as an approximation of a policy gradient algorithm, with Quiet-STaR extending the approach of training the model to use additional generations to improve generic language modelling (‘thinking before speaking’). TRICE (Hoffman et al., 2023) also aims to improve the likelihood of correct answers by training over multiple reasoning traces, using a custom MCMC-based EM algorithm. More recently, VinePPO (Kazemnejad et al., 2024) uses binary rewards from GSM8k and MATH correctness to test a novel PPO-based algorithm, and other recent work has explored using code feedback as a signal for training (Gehring et al., 2024; Xu et al., 2024b). In contrast, our proposed approach, RLVR simply uses an existing RL framework (PPO) for training, and runs entirely online with binary rewards (compared to the iterative approach of STaR or the log-likelihood rewards of Quiet-STaR). Additionally, we expand beyond the math domain, also finding that this approach can yield improvements in precise instruction following. Finally, we also carefully ablate a number of core components of RLVR, including value model initialization and using a general reward model with verifiable rewards. We hope to further develop and expand this technique in future work.

这项工作中提出的 RLVR 方法涉及最近通过 RL 相关技术改进 LM 推理的各种工作.密切相关的是自学推理机 (STaR) 工作线 (Zelikman et al., 2022, 2024) 和 TRICE (Hoffman et al., 2023),两者都使用现有的真实答案作为信号进行检查,以生成更好的模型原理（或思想链）. STaR 可以被视为策略梯度算法的近似,Quiet-STaR 扩展了训练模型的方法,以使用额外的代数来改进通用语言建模（“先思考后说话”）. TRICE（Hoffman 等人,2023）还旨在通过使用基于 MCMC 的自定义 EM 算法对多个推理轨迹进行训练来提高正确答案的可能性.最近,VinePPO（Kazemnejad 等人,2024）使用 GSM8k 和 MATH 正确性的二元奖励来测试基于 PPO 的新颖算法,并且最近的其他工作探索了使用代码反馈作为训练信号（Gehring 等人,2024；Xu 等人,2024b）.相比之下,我们提出的方法 RLVR 只是使用现有的 RL 框架（PPO）进行训练,并完全在线运行并具有二元奖励（与 STaR 的迭代方法或 Quiet-STaR 的对数似然奖励相比）.此外,我们扩展到数学领域之外,还发现这种方法可以提高精确指令跟踪的效果.最后,我们还仔细地消除了 RLVR 的一些核心组件,包括价值模型初始化和使用具有可验证奖励的通用奖励模型.我们希望在未来的工作中进一步发展和扩展这项技术.

10 Conclusion · 结论

We introduce Tülu 3, a family of fully open state-of-the-art language models, featuring a modern post-training

我们推出 Tülu 3,这是一系列完全开放的最先进的语言模型,具有现代的后训练功能

framework with fully open-source data Tülu 3 Data, evaluation Tülu 3 Eval, training code Tülu 3 Code and development recipes Tülu 3 Recipe. We release final models trained on Llama 3.1 base versions, with intermediate checkpoints, training data, training code, and evaluation code.

具有完全开源数据的框架 Tülu 3 数据、评估 Tülu 3 Eval、培训代码 Tülu 3 代码和开发配方 Tülu 3 Recipe.我们发布了在 Llama 3.1 基础版本上训练的最终模型,以及中间检查点、训练数据、训练代码和评估代码.

Tülu 3 bridges the gap between open and closed post-training methods, marking a new milestone in open post-training research. With the resources provided, others can build on open base models, finetune them for high performance across diverse tasks. This paves the way for advancing post-training research within

Tülu 3 弥合了开放式和封闭式培训后方法之间的差距,标志着开放式培训后研究的新里程碑.利用所提供的资源,其他人可以在开放基础模型的基础上进行构建,对其进行微调,以实现跨不同任务的高性能.这为推进培训后研究铺平了道路

50

<!-- page 51 of 82 -->

multi-objective, and multi-stage training frameworks.

Author Contributions

A successful team project like Tülu 3 would not be possible without the fluid contributions of many teammates across formal team boundaries. As not all of these can be captured, we indicate each authors’ primary contributing role in this project. Authors are listed in alphabetical order:

• For SFT model development, including training and data curation: Faeze Brahman, Shengyi Huang, Hamish Ivison, Nathan Lambert, Jacob Morrison, Yizhong Wang, and Chris Wilhelm.

• For preference-tuned model development, including training and data curation: Faeze Brahman, Shengyi Huang, Hamish Ivison, Nathan Lambert, Lester James V. Miranda, Valentina Pyatkin, Chris Wilhelm.

• For reinforcement-learning model development, including training and data curation: Shengyi Huang, Nathan Lambert, Hamish Ivison, Valentina Pyatkin, Faeze Brahman.

• For evaluation tooling support, decontaminating training datasets, and evaluating peer models in the ecosystem throughout: Pradeep Dasigi, Nouha Dziri, Victoria Graf, Shengyi Huang, Jena D. Hwang, Hamish Ivison, Ronan Le Bras, Alisa Liu, Xinxi Lyu, Saumya Malik, Valentina Pyatkin, Luca Soldaini, Oyvind Tafjord, Jiangjiang Yang.

• For management of communications, legal, and other release processes: Faeze Brahman, Pradeep Dasigi, Hannaneh Hajishirzi, Nathan Lambert, Luca Soldaini.

• For mentorship and advising: Pradeep Dasigi, Hannaneh Hajishirzi, Nathan Lambert, Valentina Pyatkin, Noah A. Smith, Luca Soldaini, Yizhong Wang.

Authorship for this work was determined by those making direct contributions to the Tülu models, related artifacts, and their release. Core contributors are recognized for their sustained, significant contributions critical to the success of the Tülu 3 project.

Acknowledgments

We thank John Schulman for extremely useful advice. We acknowledge the National Artificial Intelligence

Research Resource (NAIRR) Pilot and Microsoft Azure for contributing to the results in this work. We thank Niklas Muennighoff for helping with some experimentation on OLMoE. We thank countless members of Ai2 and UW NLP communities for useful feedback throughout this project. Research supported with Cloud TPUs from Google’s TPU Research Cloud (TRC). We thank the vLLM team (Kaichao You, Simon Mo, Woosuk Kwon, and Zhuohan Li) for their invaluable support in debugging NCCL weight transfer issues for RLVR. We thank Huy Tran, Jesse Dodge, Jiacheng Liu, Sruthi Sreeram, Taylor Blanton, Aaron Sarnat, Arnavi Chheda, Byron Bischoff, Chris Newell, Michael Schmitz, Sam Skjonsberg, Eric Marsh, Karen Farley, and YenSung Chen for building the Ai2 Playground for model demos. We also thank these others at Ai2 for many indirect contributions to the project: Kyle Lo, Taira Anderson, Jen Dumas, Crystal Nam, Sophie Lebrecht, Brooke Vlahos, Chris Wilhelm, Jenna James, Alex Buraczynski, Will Smith, Caitlin Wittlif, Carissa Schoenick, and Ali Farhadi.

References

B. Adler, N. Agarwal, A. Aithal, D. H. Anh, P. Bhattacharya, A. Brundyn, J. Casper, B. Catanzaro, S. Clay, J. Cohen,

et al. Nemotron-4 340b technical report. arXiv preprint arXiv:2406.11704, 2024.

R. Agarwal, A. Singh, L. M. Zhang, B. Bohnet, L. Rosias, S. C. Chan, B. Zhang, A. Anand, Z. Abbas, A. Nova, J. D. Co-

Reyes, E. Chu, F. Behbahani, A. Faust, and H. Larochelle. Many-shot in-context learning. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL https://openreview.net/forum?id=AB6XpMzvqH.

M. AI. Mistral introduces nemo, 2024. URL https://mistral.ai/news/mistral-nemo/. Accessed: 2024-11-21.

51

<!-- page 52 of 82 -->

E. Almazrouei, H. Alobeidli, A. Alshamsi, A. Cappelli, R. Cojocaru, M. Debbah, E. Goffinet, D. Heslow, J. Launay,

Q. Malartic, B. Noune, B. Pannier, and G. Penedo. Falcon-40B: an open large language model with state-of-the-art performance. 2023.

Anthropic. Introducing computer use, a new claude 3.5 sonnet, and claude 3.5 haiku. Anthropic, 2024. URL https://www.anthropic.com/news/3-5-models-and-computer-use. Accessed: 2024-10-22.

A. Askell, Y. Bai, A. Chen, D. Drain, D. Ganguli, T. Henighan, A. Jones, N. Joseph, B. Mann, N. DasSarma, et al. A

general language assistant as a laboratory for alignment. arXiv preprint arXiv:2112.00861, 2021.

Y. Bai, S. Kadavath, S. Kundu, A. Askell, J. Kernion, A. Jones, A. Chen, A. Goldie, A. Mirhoseini, C. McKinnon,

et al. Constitutional ai: Harmlessness from ai feedback. arXiv preprint arXiv:2212.08073, 2022.

E. Beeching, S. C. Huang, A. Jiang, J. Li, B. Lipkin, Z. Qina, K. Rasul, Z. Shen, R. Soletskyi, and L. Tunstall.

Numinamath 7b tir. https://huggingface.co/AI-MO/NuminaMath-7B-TIR, 2024.

F. Brahman, S. Kumar, V. Balachandran, P. Dasigi, V. Pyatkin, A. Ravichander, S. Wiegreffe, N. Dziri, K. Chandu,

J. Hessel, et al. The art of saying no: Contextual noncompliance in language models. arXiv preprint arXiv:2407.12043, 2024.

Z. Cai, M. Cao, H. Chen, K. Chen, K. Chen, X. Chen, X. Chen, Z. Chen, Z. Chen, P. Chu, X. Dong, H. Duan, Q. Fan,

Z. Fei, Y. Gao, J. Ge, C. Gu, Y. Gu, T. Gui, A. Guo, Q. Guo, C. He, Y. Hu, T. Huang, T. Jiang, P. Jiao, Z. Jin, Z. Lei, J. Li, J. Li, L. Li, S. Li, W. Li, Y. Li, H. Liu, J. Liu, J. Hong, K. Liu, K. Liu, X. Liu, C. Lv, H. Lv, K. Lv, L. Ma, R. Ma, Z. Ma, W. Ning, L. Ouyang, J. Qiu, Y. Qu, F. Shang, Y. Shao, D. Song, Z. Song, Z. Sui, P. Sun, Y. Sun, H. Tang, B. Wang, G. Wang, J. Wang, J. Wang, R. Wang, Y. Wang, Z. Wang, X. Wei, Q. Weng, F. Wu, Y. Xiong, C. Xu, R. Xu, H. Yan, Y. Yan, X. Yang, H. Ye, H. Ying, J. Yu, J. Yu, Y. Zang, C. Zhang, L. Zhang, P. Zhang, P. Zhang, R. Zhang, S. Zhang, S. Zhang, W. Zhang, W. Zhang, X. Zhang, X. Zhang, H. Zhao, Q. Zhao, X. Zhao, F. Zhou, Z. Zhou, J. Zhuo, Y. Zou, X. Qiu, Y. Qiao, and D. Lin. Internlm2 technical report, 2024.

X. Chan, X. Wang, D. Yu, H. Mi, and D. Yu. Scaling synthetic data creation with 1,000,000,000 personas. arXiv

preprint arXiv:2406.20094, 2024.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph,

G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. 2021.

Y. Chen, D. Zhu, Y. Sun, X. Chen, W. Zhang, and X. Shen. The accuracy paradox in rlhf: When better reward

models don’t yield better language models. arXiv preprint arXiv:2410.06554, 2024.

W.-L. Chiang, Z. Li, Z. Lin, Y. Sheng, Z. Wu, H. Zhang, L. Zheng, S. Zhuang, Y. Zhuang, J. E. Gonzalez, I. Stoica,

and E. P. Xing. Vicuna: An open-source chatbot impressing gpt-4 with 90%* chatgpt quality, March 2023. URL https://lmsys.org/blog/2023-03-30-vicuna/.

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez,

et al. Chatbot arena: An open platform for evaluating llms by human preference. arXiv preprint arXiv:2403.04132, 2024.

P. F. Christiano, J. Leike, T. Brown, M. Martic, S. Legg, and D. Amodei. Deep reinforcement learning from human

preferences. Advances in neural information processing systems, 30, 2017.

H. W. Chung, L. Hou, S. Longpre, B. Zoph, Y. Tay, W. Fedus, Y. Li, X. Wang, M. Dehghani, S. Brahma, et al. Scaling

instruction-finetuned language models. Journal of Machine Learning Research, 25(70):1–53, 2024.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano,

C. Hesse, and J. Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

M. Conover, M. Hayes, A. Mathur, J. Xie, J. Wan, S. Shah, A. Ghodsi, P. Wendell, M. Zaharia, and R. Xin. Free

dolly: Introducing the world’s first truly open instruction-tuned llm, 2023. URL https://www.databricks.com/ blog/2023/04/12/dolly-first-open-commercially-viable-instruction-tuned-llm.

G. Cui, L. Yuan, N. Ding, G. Yao, W. Zhu, Y. Ni, G. Xie, Z. Liu, and M. Sun. Ultrafeedback: Boosting language

models with high-quality feedback. arXiv preprint arXiv:2310.01377, 2023.

52

<!-- page 53 of 82 -->

DeepSeek-AI, A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, D. Dai, D. Guo,

D. Yang, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Bao, H. Xu, H. Wang, H. Zhang, H. Ding, H. Xin, H. Gao, H. Li, H. Qu, J. L. Cai, J. Liang, J. Guo, J. Ni, J. Li, J. Wang, J. Chen, J. Chen, J. Yuan, J. Qiu, J. Li, J. Song, K. Dong, K. Hu, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Xu, L. Xia, L. Zhao, L. Wang, L. Zhang, M. Li, M. Wang, M. Zhang, M. Zhang, M. Tang, M. Li, N. Tian, P. Huang, P. Wang, P. Zhang, Q. Wang, Q. Zhu, Q. Chen, Q. Du, R. J. Chen, R. L. Jin, R. Ge, R. Zhang, R. Pan, R. Wang, R. Xu, R. Zhang, R. Chen, S. S. Li, S. Lu, S. Zhou, S. Chen, S. Wu, S. Ye, S. Ye, S. Ma, S. Wang, S. Zhou, S. Yu, S. Zhou, S. Pan, T. Wang, T. Yun, T. Pei, T. Sun, W. L. Xiao, W. Zeng, W. Zhao, W. An, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, X. Q. Li, X. Jin, X. Wang, X. Bi, X. Liu, X. Wang, X. Shen, X. Chen, X. Zhang, X. Chen, X. Nie, X. Sun, X. Wang, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yu, X. Song, X. Shan, X. Zhou, X. Yang, X. Li, X. Su, X. Lin, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. X. Zhu, Y. Zhang, Y. Xu, Y. Xu, Y. Huang, Y. Li, Y. Zhao, Y. Sun, Y. Li, Y. Wang, Y. Yu, Y. Zheng, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Tang, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Wu, Y. Ou, Y. Zhu, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Zha, Y. Xiong, Y. Ma, Y. Yan, Y. Luo, Y. You, Y. Liu, Y. Zhou, Z. F. Wu, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Huang, Z. Zhang, Z. Xie, Z. Zhang, Z. Hao, Z. Gou, Z. Ma, Z. Yan, Z. Shao, Z. Xu, Z. Wu, Z. Zhang, Z. Li, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Gao, and Z. Pan. Deepseek-v3 technical report, 2024. URL https://arxiv.org/abs/2412.19437.

N. Ding, Y. Chen, B. Xu, Y. Qin, Z. Zheng, S. Hu, Z. Liu, M. Sun, and B. Zhou. Enhancing chat language models by

scaling high-quality instructional conversations. arXiv preprint arXiv:2305.14233, 2023.

H. Dong, W. Xiong, D. Goyal, Y. Zhang, W. Chow, R. Pan, S. Diao, J. Zhang, K. Shum, and T. Zhang. Raft: Reward

ranked finetuning for generative foundation model alignment, 2023. URL https://arxiv.org/abs/2304.06767.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark

requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, June 2019. Association

for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL https://aclanthology.org/N19-1246.

A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathur, A. Schelten, A. Yang, A. Fan, et al.

The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

Y. Dubois, X. Li, R. Taori, T. Zhang, I. Gulrajani, J. Ba, C. Guestrin, P. Liang, and T. Hashimoto. Alpacafarm:

A simulation framework for methods that learn from human feedback. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL https://openreview.net/forum?id=4hturzLcKX.

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled alpacaeval: A simple way to debias

automatic evaluators. arXiv preprint arXiv:2404.04475, 2024.

L. Engstrom, A. Ilyas, S. Santurkar, D. Tsipras, F. Janoos, L. Rudolph, and A. Madry. Implementation matters

in deep rl: A case study on ppo and trpo. In International Conference on Learning Representations, 2020. URL https://openreview.net/forum?id=r1etN1rtPB.

L. Espeholt, H. Soyer, R. Munos, K. Simonyan, V. Mnih, T. Ward, Y. Doron, V. Firoiu, T. Harley, I. Dunning,

et al. Impala: Scalable distributed deep-rl with importance weighted actor-learner architectures. In International conference on machine learning, pages 1407–1416. PMLR, 2018.

L. Gao, J. Tow, B. Abbasi, S. Biderman, S. Black, A. DiPofi, C. Foster, L. Golding, J. Hsu, A. Le Noac’h, H. Li,

K. McDonell, N. Muennighoff, C. Ociepa, J. Phang, L. Reynolds, H. Schoelkopf, A. Skowron, L. Sutawika, E. Tang, A. Thite, B. Wang, K. Wang, and A. Zou. A framework for few-shot language model evaluation, 07 2024. URL https://zenodo.org/records/12608602.

J. Gehring, K. Zheng, J. Copet, V. Mella, T. Cohen, and G. Synnaeve. Rlef: Grounding code llms in execution

feedback with reinforcement learning, 2024. URL https://arxiv.org/abs/2410.02089.

Gemini Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context, 2024. URL

https://arxiv.org/abs/2403.05530.

Gemma Team, M. Riviere, S. Pathak, P. G. Sessa, C. Hardin, S. Bhupatiraju, L. Hussenot, T. Mesnard, B. Shahriari,

A. Ramé, et al. Gemma 2: Improving open language models at a practical size. arXiv preprint arXiv:2408.00118, 2024.

C. Goddard, S. Siriwardhana, M. Ehghaghi, L. Meyers, V. Karpukhin, B. Benedict, M. McQuade, and J. Solawetz.

Arcee’s mergekit: A toolkit for merging large language models. arXiv preprint arXiv:2403.13257, 2024.

53

<!-- page 54 of 82 -->

Z. Gou, Z. Shao, Y. Gong, yelong shen, Y. Yang, M. Huang, N. Duan, and W. Chen. ToRA: A tool-integrated reasoning

agent for mathematical problem solving. In The Twelfth International Conference on Learning Representations, 2024. URL https://openreview.net/forum?id=Ep0TtjVoap.

D. Groeneveld, I. Beltagy, P. Walsh, A. Bhagia, R. Kinney, O. Tafjord, A. Jha, H. Ivison, I. Magnusson, Y. Wang,

S. Arora, D. Atkinson, R. Authur, K. R. Chandu, A. Cohan, J. Dumas, Y. Elazar, Y. Gu, J. Hessel, T. Khot, W. Merrill, J. D. Morrison, N. Muennighoff, A. Naik, C. Nam, M. E. Peters, V. Pyatkin, A. Ravichander, D. Schwenk, S. Shah, W. Smith, E. Strubell, N. Subramani, M. Wortsman, P. Dasigi, N. Lambert, K. Richardson, L. S. Zettlemoyer, J. Dodge, K. Lo, L. Soldaini, N. A. Smith, and H. Hajishirzi. Olmo: Accelerating the science of language models. ArXiv, abs/2402.00838, 2024. URL https://api.semanticscholar.org/CorpusID:267365485.

Y. Gu, O. Tafjord, B. Kuehl, D. Haddad, J. Dodge, and H. Hajishirzi. Olmes: A standard for language model

evaluations, 2024. URL https://arxiv.org/abs/2406.08446.

T. Gunter, Z. Wang, C. Wang, R. Pang, A. Narayanan, A. Zhang, B. Zhang, C. Chen, C.-C. Chiu, D. Qiu, et al. Apple

intelligence foundation language models. arXiv preprint arXiv:2407.21075, 2024.

S. Guo, B. Zhang, T. Liu, T. Liu, M. Khalman, F. Llinares, A. Rame, T. Mesnard, Y. Zhao, B. Piot, J. Ferret, and

M. Blondel. Direct language model alignment from online ai feedback, 2024. URL https://arxiv.org/abs/2402. 04792.

S. Han, K. Rao, A. Ettinger, L. Jiang, B. Y. Lin, N. Lambert, Y. Choi, and N. Dziri. Wildguard: Open one-stop

moderation tools for safety risks, jailbreaks, and refusals of llms. arXiv preprint arXiv:2406.18495, 2024.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask

language understanding. arXiv preprint arXiv:2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. NeurIPS, 2021.

M. D. Hoffman, D. Phan, david dohan, S. Douglas, T. A. Le, A. T. Parisi, P. Sountsov, C. Sutton, S. Vikram, and

R. A. Saurous. Training chain-of-thought via latent-variable inference. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL https://openreview.net/forum?id=a147pIS2Co.

J. Hong, N. Lee, and J. Thorne. ORPO: Monolithic preference optimization without reference model. In Y. Al-Onaizan,

M. Bansal, and Y.-N. Chen, editors, Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 11170–11189, Miami, Florida, USA, Nov. 2024. Association for Computational Linguistics. URL

https://aclanthology.org/2024.emnlp-main.626.

J. Hu, X. Wu, W. Wang, D. Zhang, Y. Cao, et al. Openrlhf: An easy-to-use, scalable and high-performance rlhf

framework. arXiv preprint arXiv:2405.11143, 2024.

S. Hu, Y. Luo, H. Wang, X. Cheng, Z. Liu, and M. Sun. Won’t get fooled again: Answering questions with false

premises. arXiv preprint arXiv:2307.02394, 2023.

S. Huang, R. F. J. Dossa, A. Raffin, A. Kanervisto, and W. Wang. The 37 implementation details of proxi- mal policy optimization. In ICLR Blog Track, 2022. URL https://iclr-blog-track.github.io/2022/03/25/ ppo-implementation-details/. https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/.

S. Huang, J. Weng, R. Charakorn, M. Lin, Z. Xu, and S. Ontañón. Cleanba: A reproducible and efficient distributed

reinforcement learning platform. In The Twelfth International Conference on Learning Representations, 2023.

S. Huang, M. Noukhovitch, A. Hosseini, K. Rasul, W. Wang, and L. Tunstall. The n+ implementation details of

RLHF with PPO: A case study on TL;DR summarization. In First Conference on Language Modeling, 2024a. URL https://openreview.net/forum?id=kHO2ZTa8e3.

Y. Huang, L. Sun, H. Wang, S. Wu, Q. Zhang, Y. Li, C. Gao, Y. Huang, W. Lyu, Y. Zhang, et al. Trustllm:

Trustworthiness in large language models. arXiv preprint arXiv:2401.05561, 2024b.

A. Hurst, A. Lerer, A. P. Goucher, A. Perelman, A. Ramesh, A. Clark, A. Ostrow, A. Welihinda, A. Hayes, A. Radford,

et al. Gpt-4o system card. arXiv preprint arXiv:2410.21276, 2024.

B. Ibarz, J. Leike, T. Pohlen, G. Irving, S. Legg, and D. Amodei. Reward learning from human preferences and

demonstrations in atari. Advances in neural information processing systems, 31, 2018.

H. Ivison, Y. Wang, V. Pyatkin, N. Lambert, M. Peters, P. Dasigi, J. Jang, D. Wadden, N. A. Smith, I. Beltagy, et al.

Camels in a changing climate: Enhancing lm adaptation with tulu 2. arXiv preprint arXiv:2311.10702, 2023.

54

<!-- page 55 of 82 -->

H. Ivison, Y. Wang, J. Liu, Z. Wu, V. Pyatkin, N. Lambert, N. A. Smith, Y. Choi, and H. Hajishirzi. Unpacking dpo

and ppo: Disentangling best practices for learning from preference feedback. arXiv preprint arXiv:2406.09279, 2024.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample,

L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825, 2023.

L. Jiang, K. Rao, S. Han, A. Ettinger, F. Brahman, S. Kumar, N. Mireshghallah, X. Lu, M. Sap, Y. Choi, and

N. Dziri. Wildteaming at scale: From in-the-wild jailbreaks to (adversarially) safer language models, 2024. URL https://arxiv.org/abs/2406.18510.

J. Kazdan, R. Schaeffer, A. Dey, M. Gerstgrasser, R. Rafailov, D. L. Donoho, and S. Koyejo. Collapse or thrive? perils

and promises of synthetic data in a self-generating world, 2024. URL https://arxiv.org/abs/2410.16713.

A. Kazemnejad, M. Aghajohari, E. Portelance, A. Sordoni, S. Reddy, A. Courville, and N. L. Roux. Vineppo: Unlocking

rl potential for llm reasoning through refined credit assignment, 2024. URL https://arxiv.org/abs/2410.01679.

A. Köpf, Y. Kilcher, D. von Rütte, S. Anagnostidis, Z. R. Tam, K. Stevens, A. Barhoum, D. Nguyen, O. Stanley,

R. Nagyfi, et al. Openassistant conversations-democratizing large language model alignment. Advances in Neural Information Processing Systems, 36, 2024.

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory

management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

J. Leike, D. Krueger, T. Everitt, M. Martic, V. Maini, and S. Legg. Scalable agent alignment via reward modeling: a

research direction. arXiv preprint arXiv:1811.07871, 2018.

A. Lewkowycz, A. J. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. V. Ramasesh, A. Slone, C. Anil, I. Schlag,

T. Gutman-Solo, Y. Wu, B. Neyshabur, G. Gur-Ari, and V. Misra. Solving quantitative reasoning problems with language models. In A. H. Oh, A. Agarwal, D. Belgrave, and K. Cho, editors, Advances in Neural Information Processing Systems, 2022. URL https://openreview.net/forum?id=IFXTZERXdM7.

T. Li, W.-L. Chiang, E. Frick, L. Dunlap, B. Zhu, J. E. Gonzalez, and I. Stoica. From live data to high-quality

benchmarks: The arena-hard pipeline, April 2024a. URL https://lmsys.org/blog/2024-04-19-arena-hard/.

T. Li, H. Xu, W. Tan, K. Murray, and D. Khashabi. Upsample or upweight? balanced training on heavily imbalanced

datasets, 2024b. URL https://arxiv.org/abs/2410.04579.

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe.

Let’s verify step by step. arXiv preprint arXiv:2305.20050, 2023.

S. Lin, J. Hilton, and O. Evans. Truthfulqa: Measuring how models mimic human falsehoods. arXiv preprint

arXiv:2109.07958, 2021.

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of

large language models for code generation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL https://openreview.net/forum?id=1qvx610Cu7.

Y. Liu. Roberta: A robustly optimized bert pretraining approach. arXiv preprint arXiv:1907.11692, 364, 2019.

S. Longpre, L. Hou, T. Vu, A. Webson, H. W. Chung, Y. Tay, D. Zhou, Q. V. Le, B. Zoph, J. Wei, et al. The flan

collection: Designing data and methods for effective instruction tuning. arXiv preprint arXiv:2301.13688, 2023.

Z. Luo, C. Xu, P. Zhao, Q. Sun, X. Geng, W. Hu, C. Tao, J. Ma, Q. Lin, and D. Jiang. Wizardcoder: Empowering

code large language models with evol-instruct, 2023.

A. Mallen, A. Asai, V. Zhong, R. Das, H. Hajishirzi, and D. Khashabi. When not to trust language models: Investigating

effectiveness and limitations of parametric and non-parametric memories. arXiv preprint, 2022.

M. Mazeika, L. Phan, X. Yin, A. Zou, Z. Wang, N. Mu, E. Sakhaee, N. Li, S. Basart, B. Li, et al. Harmbench: A

standardized evaluation framework for automated red teaming and robust refusal. arXiv preprint arXiv:2402.04249, 2024.

Y. Meng, M. Xia, and D. Chen. Simpo: Simple preference optimization with a reference-free reward. arXiv preprint

arXiv:2405.14734, 2024.

A. Meurer, C. P. Smith, M. Paprocki, O. Čertík, S. B. Kirpichev, M. Rocklin, A. Kumar, S. Ivanov, J. K. Moore, S. Singh,

T. Rathnayake, S. Vig, B. E. Granger, R. P. Muller, F. Bonazzi, H. Gupta, S. Vats, F. Johansson, F. Pedregosa, M. J. Curry, A. R. Terrel, v. Roučka, A. Saboo, I. Fernando, S. Kulal, R. Cimrman, and A. Scopatz. Sympy: symbolic

55

<!-- page 56 of 82 -->

computing in python. PeerJ Computer Science, 3:e103, Jan. 2017. ISSN 2376-5992. doi: 10.7717/peerj-cs.103. URL https://doi.org/10.7717/peerj-cs.103.

L. J. V. Miranda, Y. Wang, Y. Elazar, S. Kumar, V. Pyatkin, F. Brahman, N. A. Smith, H. Hajishirzi, and P. Dasigi.

Hybrid preferences: Learning to route instances for human vs. ai feedback. arXiv preprint arXiv:2410.19133, 2024.

S. Mishra, D. Khashabi, C. Baral, and H. Hajishirzi. Cross-task generalization via natural language crowdsourcing

instructions. In S. Muresan, P. Nakov, and A. Villavicencio, editors, Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3470–3487, Dublin, Ireland, May 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.acl-long.244. URL https://aclanthology.org/ 2022.acl-long.244.

Mistral AI. Ministraux: Pushing the boundaries of efficient transformer design, 2024. URL https://mistral.ai/

news/ministraux/. Accessed: 2024-11-17.

V. Mnih, K. Kavukcuoglu, D. Silver, A. A. Rusu, J. Veness, M. G. Bellemare, A. Graves, M. Riedmiller, A. K. Fidjeland,

G. Ostrovski, et al. Human-level control through deep reinforcement learning. nature, 518(7540):529–533, 2015.

T. Moreau and J. Audiffren. Post training in deep learning with last kernel. arXiv preprint arXiv:1611.04499, 2016.

P. Moritz, R. Nishihara, S. Wang, A. Tumanov, R. Liaw, E. Liang, M. Elibol, Z. Yang, W. Paul, M. I. Jordan, et al.

Ray: A distributed framework for emerging {AI} applications. In 13th USENIX symposium on operating systems design and implementation (OSDI 18), pages 561–577, 2018.

MosaicML NLP Team. Introducing mpt-30b: Raising the bar for open-source foundation models, 2023. URL www.mosaicml.com/blog/mpt-30b. Accessed: 2023-06-22.

N. Muennighoff, H. Su, L. Wang, N. Yang, F. Wei, T. Yu, A. Singh, and D. Kiela. Generative representational

instruction tuning, 2024.

R. Nakano, J. Hilton, S. Balaji, J. Wu, L. Ouyang, C. Kim, C. Hesse, S. Jain, V. Kosaraju, W. Saunders, et al. Webgpt:

Browser-assisted question-answering with human feedback. arXiv preprint arXiv:2112.09332, 2021.

M. Noukhovitch, S. Huang, S. Xhonneux, A. Hosseini, R. Agarwal, and A. Courville. Asynchronous rlhf: Faster and

more efficient off-policy rl for language models, 2024. URL https://arxiv.org/abs/2410.18252.

OpenAI. Learning to reason with llms. OpenAI, 2024. URL https://openai.com/index/ learning-to-reason-with-llms/. Accessed: 2024-09-12.

OpenAI. Gpt-4o, 2024. https://openai.com.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al.

Training language models to follow instructions with human feedback. Advances in neural information processing systems, 35:27730–27744, 2022.

S. Pawar, S. M. T. I. Tonmoy, S. M. M. Zaman, V. Jain, A. Chadha, and A. Das. The what, why, and how of context

length extension techniques in large language models – a detailed survey, 2024. URL https://arxiv.org/abs/2401. 07872.

C. Qu, S. Dai, X. Wei, H. Cai, S. Wang, D. Yin, J. Xu, and J.-R. Wen. Tool learning with large language models: A

survey. arXiv preprint arXiv:2405.17935, 2024.

Qwen Team. Qwen2.5: A party of foundation models, September 2024. URL https://qwenlm.github.io/blog/qwen2.

5/.

R. Rafailov, A. Sharma, E. Mitchell, C. D. Manning, S. Ermon, and C. Finn. Direct preference optimization: Your

language model is secretly a reward model. Advances in Neural Information Processing Systems, 36, 2024.

N. Rajani, L. Tunstall, E. Beeching, N. Lambert, A. M. Rush, and T. Wolf. No robots. https://huggingface.co/

datasets/HuggingFaceH4/no_robots, 2023.

S. Rajbhandari, J. Rasley, O. Ruwase, and Y. He. Zero: Memory optimizations toward training trillion parameter

models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16. IEEE, 2020.

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A

graduate-level google-proof q&a benchmark, 2023.

56

<!-- page 57 of 82 -->

P. Röttger, H. R. Kirk, B. Vidgen, G. Attanasio, F. Bianchi, and D. Hovy. Xstest: A test suite for identifying

exaggerated safety behaviours in large language models. arXiv preprint arXiv:2308.01263, 2023.

V. Sanh, A. Webson, C. Raffel, S. Bach, L. Sutawika, Z. Alyafeai, A. Chaffin, A. Stiegler, A. Raja, M. Dey, M. S. Bari,

C. Xu, U. Thakker, S. S. Sharma, E. Szczechla, T. Kim, G. Chhablani, N. Nayak, D. Datta, J. Chang, M. T.-J. Jiang, H. Wang, M. Manica, S. Shen, Z. X. Yong, H. Pandey, R. Bawden, T. Wang, T. Neeraj, J. Rozen, A. Sharma, A. Santilli, T. Fevry, J. A. Fries, R. Teehan, T. L. Scao, S. Biderman, L. Gao, T. Wolf, and A. M. Rush. Multitask Prompted Training Enables Zero-Shot Task Generalization. In International Conference on Learning Representations (ICLR), 2022.

D. Saxton, E. Grefenstette, F. Hill, and P. Kohli. Analysing mathematical reasoning abilities of neural models. In

International Conference on Learning Representations, 2019.

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv

preprint arXiv:1707.06347, 2017.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing

the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

G. Shen, Z. Wang, O. Delalleau, J. Zeng, Y. Dong, D. Egert, S. Sun, J. J. Zhang, S. Jain, A. Taghibakhshi, M. S.

Ausin, A. Aithal, and O. Kuchaiev. Nemo-aligner: Scalable toolkit for efficient model alignment. In First Conference on Language Modeling, 2024a. URL https://openreview.net/forum?id=yK2eGE8QVW.

X. Shen, Z. Chen, M. Backes, Y. Shen, and Y. Zhang. “Do Anything Now”: Characterizing and Evaluating In-The-Wild

Jailbreak Prompts on Large Language Models. In ACM SIGSAC Conference on Computer and Communications Security (CCS). ACM, 2024b.

A. K. Singh, M. Y. Kocyigit, A. Poulton, D. Esiobu, M. Lomeli, G. Szilvasy, and D. Hupkes. Evaluation data

contamination in llms: how do we measure it and (when) does it matter? arXiv preprint arXiv:2411.03923, 2024a.

S. Singh, F. Vargus, D. Dsouza, B. F. Karlsson, A. Mahendiran, W.-Y. Ko, H. Shandilya, J. Patel, D. Mataciunas,

L. OMahony, et al. Aya dataset: An open-access collection for multilingual instruction tuning. arXiv preprint arXiv:2402.06619, 2024b.

P. Singhal, T. Goyal, J. Xu, and G. Durrett. A long way to go: Investigating length correlations in RLHF, 2024. URL

https://openreview.net/forum?id=sNtDKdcI1f.

N. Stiennon, L. Ouyang, J. Wu, D. Ziegler, R. Lowe, C. Voss, A. Radford, D. Amodei, and P. F. Christiano. Learning

to summarize with human feedback. Advances in Neural Information Processing Systems, 33:3008–3021, 2020.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, , and

J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

R. Taori, I. Gulrajani, T. Zhang, Y. Dubois, X. Li, C. Guestrin, P. Liang, and T. B. Hashimoto. Stanford alpaca: An

instruction-following llama model. https://github.com/tatsu-lab/stanford_alpaca, 2023.

R. Teknium, J. Quesnelle, and C. Guang. Hermes 3 technical report. arXiv preprint arXiv:2408.11857, 2024.

S. Toshniwal, W. Du, I. Moshkov, B. Kisacanin, A. Ayrapetyan, and I. Gitman. Openmathinstruct-2: Accelerating ai

for math with massive open-source instruction data. arXiv preprint arXiv:2410.01560, 2024.

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale,

et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023.

L. Tunstall, E. Beeching, N. Lambert, N. Rajani, K. Rasul, Y. Belkada, S. Huang, L. von Werra, C. Fourrier, N. Habib,

et al. Zephyr: Direct distillation of lm alignment. arXiv preprint arXiv:2310.16944, 2023.

A. Üstün, V. Aryabumi, Z. Yong, W.-Y. Ko, D. D’souza, G. Onilude, N. Bhandari, S. Singh, H.-L. Ooi, A. Kayid,

F. Vargus, P. Blunsom, S. Longpre, N. Muennighoff, M. Fadaee, J. Kreutzer, and S. Hooker. Aya model: An instruction finetuned open-access multilingual language model. In L.-W. Ku, A. Martins, and V. Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15894–15939, Bangkok, Thailand, Aug. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.acl-long.845. URL https://aclanthology.org/2024.acl-long.845.

L. von Werra, Y. Belkada, L. Tunstall, E. Beeching, T. Thrush, N. Lambert, S. Huang, K. Rasul, and Q. Gallouédec.

Trl: Transformer reinforcement learning. https://github.com/huggingface/trl, 2020.

57

<!-- page 58 of 82 -->

D. Wadden, K. Shi, J. Morrison, A. Naik, S. Singh, N. Barzilay, K. Lo, T. Hope, L. Soldaini, S. Z. Shen, et al. Sciriff: A

resource to enhance language model instruction-following over scientific literature. arXiv preprint arXiv:2406.07835, 2024.

X. Wang, B. Li, Y. Song, F. F. Xu, X. Tang, M. Zhuge, J. Pan, Y. Song, B. Li, J. Singh, H. H. Tran, F. Li,

R. Ma, M. Zheng, B. Qian, Y. Shao, N. Muennighoff, Y. Zhang, B. Hui, J. Lin, R. Brennan, H. Peng, H. Ji, and G. Neubig. OpenHands: An Open Platform for AI Software Developers as Generalist Agents, 2024a. URL https://arxiv.org/abs/2407.16741.

Y. Wang, Y. Kordi, S. Mishra, A. Liu, N. A. Smith, D. Khashabi, and H. Hajishirzi. Self-instruct: Aligning language

models with self-generated instructions. arXiv preprint arXiv:2212.10560, 2022a.

Y. Wang, S. Mishra, P. Alipoormolabashi, Y. Kordi, A. Mirzaei, A. Naik, A. Ashok, A. S. Dhanasekaran, A. Arunkumar,

D. Stap, E. Pathak, G. Karamanolakis, H. Lai, I. Purohit, I. Mondal, J. Anderson, K. Kuznia, K. Doshi, K. K. Pal, M. Patel, M. Moradshahi, M. Parmar, M. Purohit, N. Varshney, P. R. Kaza, P. Verma, R. S. Puri, R. Karia, S. Doshi, S. K. Sampat, S. Mishra, S. Reddy A, S. Patro, T. Dixit, and X. Shen. Super-NaturalInstructions: Generalization via declarative instructions on 1600+ NLP tasks. In Y. Goldberg, Z. Kozareva, and Y. Zhang, editors, Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 5085–5109, Abu Dhabi, United Arab Emirates, Dec. 2022b. Association for Computational Linguistics. doi: 10.18653/v1/2022.emnlp-main.340. URL https://aclanthology.org/2022.emnlp-main.340.

Y. Wang, S. Mishra, P. Alipoormolabashi, Y. Kordi, A. Mirzaei, A. Naik, A. Ashok, A. S. Dhanasekaran, A. Arunkumar,

D. Stap, et al. Super-naturalinstructions: Generalization via declarative instructions on 1600+ nlp tasks. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 5085–5109, 2022c.

Y. Wang, H. Ivison, P. Dasigi, J. Hessel, T. Khot, K. Chandu, D. Wadden, K. MacMillan, N. A. Smith, I. Beltagy,

et al. How far can camels go? exploring the state of instruction tuning on open resources. Advances in Neural Information Processing Systems, 36:74764–74786, 2023.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more

robust and challenging multi-task language understanding benchmark. arXiv preprint arXiv:2406.01574, 2024b.

Z. Wang, A. Bukharin, O. Delalleau, D. Egert, G. Shen, J. Zeng, O. Kuchaiev, and Y. Dong. Helpsteer2-preference:

Complementing ratings with preferences. arXiv preprint arXiv:2410.01257, 2024c.

Z. Wang, Y. Dong, O. Delalleau, J. Zeng, G. Shen, D. Egert, J. J. Zhang, M. N. Sreedhar, and O. Kuchaiev. Helpsteer2:

Open-source dataset for training top-performing reward models. arXiv preprint arXiv:2406.08673, 2024d.

J. Wei, M. Bosma, V. Zhao, K. Guu, A. W. Yu, B. Lester, N. Du, A. M. Dai, and Q. V. Le. Finetuned Language

Models are Zero-Shot Learners. In International Conference on Learning Representations (ICLR), 2022a.

J. Wei, X. Wang, D. Schuurmans, M. Bosma, F. Xia, E. Chi, Q. V. Le, D. Zhou, et al. Chain-of-thought prompting

elicits reasoning in large language models. Advances in neural information processing systems, 35:24824–24837, 2022b.

T. Wolf, L. Debut, V. Sanh, J. Chaumond, C. Delangue, A. Moi, P. Cistac, T. Rault, R. Louf, M. Funtowicz,

J. Davison, S. Shleifer, P. von Platen, C. Ma, Y. Jernite, J. Plu, C. Xu, T. Le Scao, S. Gugger, M. Drame, Q. Lhoest, and A. Rush. Transformers: State-of-the-art natural language processing. In Q. Liu and D. Schlangen, editors, Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing: System Demonstrations,

pages 38–45, Online, Oct. 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.emnlp-demos.6. URL https://aclanthology.org/2020.emnlp-demos.6.

M. Wortsman, G. Ilharco, S. Y. Gadre, R. Roelofs, R. Gontijo-Lopes, A. S. Morcos, H. Namkoong, A. Farhadi,

Y. Carmon, S. Kornblith, and L. Schmidt. Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time. In K. Chaudhuri, S. Jegelka, L. Song, C. Szepesvari, G. Niu, and S. Sabato, editors, Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pages 23965–23998. PMLR, 17–23 Jul 2022. URL https://proceedings.mlr.press/ v162/wortsman22a.html.

Z. Wu, A. Balashankar, Y. Kim, J. Eisenstein, and A. Beirami. Reuse your rewards: Reward model transfer for

zero-shot cross-lingual alignment. In Y. Al-Onaizan, M. Bansal, and Y.-N. Chen, editors, Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 1332–1353, Miami, Florida, USA, Nov.

2024. Association for Computational Linguistics. URL https://aclanthology.org/2024.emnlp-main.79.

C. Xu, Q. Sun, K. Zheng, X. Geng, P. Zhao, J. Feng, C. Tao, and D. Jiang. Wizardlm: Empowering large language

models to follow complex instructions. arXiv preprint arXiv:2304.12244, 2023.

58

<!-- page 59 of 82 -->

H. Xu, B. Liu, L. Shu, and P. Yu. BERT post-training for review reading comprehension and aspect-based sentiment

analysis. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and

Short Papers), pages 2324–2335, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1242. URL https://aclanthology.org/N19-1242.

H. Xu, A. Sharaf, Y. Chen, W. Tan, L. Shen, B. V. Durme, K. Murray, and Y. J. Kim. Contrastive preference

optimization: Pushing the boundaries of llm performance in machine translation, 2024a.

S. Xu, W. Fu, J. Gao, W. Ye, W. Liu, Z. Mei, G. Wang, C. Yu, and Y. Wu. Is dpo superior to ppo for llm alignment?

a comprehensive study. In ICML, 2024b. URL https://openreview.net/forum?id=6XH8R7YrSk.

S. Yang, W.-L. Chiang, L. Zheng, J. E. Gonzalez, and I. Stoica. Rethinking benchmark and contamination for language

models with rephrased samples, 2023.

A. Young, B. Chen, C. Li, C. Huang, G. Zhang, G. Zhang, H. Li, J. Zhu, J. Chen, J. Chang, et al. Yi: Open foundation

models by 01. ai. arXiv preprint arXiv:2403.04652, 2024.

E. Zelikman, Y. Wu, J. Mu, and N. Goodman. STar: Bootstrapping reasoning with reasoning. In A. H. Oh, A. Agarwal, D. Belgrave, and K. Cho, editors, Advances in Neural Information Processing Systems, 2022. URL https://openreview.net/forum?id=_3ELRdg2sgI.

E. Zelikman, G. Harik, Y. Shao, V. Jayasiri, N. Haber, and N. D. Goodman. Quiet-star: Language models can teach

themselves to think before speaking. COLM, abs/2403.09629, 2024.

L. Zha, J. Zhou, L. Li, R. Wang, Q. Huang, S. Yang, J. Yuan, C. Su, X. Li, A. Su, et al. Tablegpt: Towards unifying

tables, nature language and commands into one gpt. arXiv preprint arXiv:2307.08674, 2023.

M. Zhang and E. Choi. SituatedQA: Incorporating extra-linguistic contexts into QA. In M.-F. Moens, X. Huang,

L. Specia, and S. W.-t. Yih, editors, Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pages 7371–7387, Online and Punta Cana, Dominican Republic, Nov. 2021. Association for Computational

Linguistics. doi: 10.18653/v1/2021.emnlp-main.586. URL https://aclanthology.org/2021.emnlp-main.586.

W. Zhao, X. Ren, J. Hessel, C. Cardie, Y. Choi, and Y. Deng. Wildchat: 1m chatgpt interaction logs in the wild.

arXiv preprint arXiv:2405.01470, 2024.

Y. Zhao, R. Joshi, T. Liu, M. Khalman, M. Saleh, and P. J. Liu. Slic-hf: Sequence likelihood calibration with human

feedback, 2023. URL https://arxiv.org/abs/2305.10425.

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing, H. Zhang, J. E.

Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena. In NeurIPS Datasets and Benchmarks Track, 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric

benchmark for evaluating foundation models. In K. Duh, H. Gomez, and S. Bethard, editors, Findings of the Association for Computational Linguistics: NAACL 2024, pages 2299–2314, Mexico City, Mexico, June 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-naacl.149. URL https://aclanthology. org/2024.findings-naacl.149.

C. Zhou, P. Liu, P. Xu, S. Iyer, J. Sun, Y. Mao, X. Ma, A. Efrat, P. Yu, L. Yu, et al. Lima: Less is more for alignment.

Advances in Neural Information Processing Systems, 36, 2024.

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for

large language models, 2023. URL https://arxiv.org/abs/2311.07911.

B. Zhu, E. Frick, T. Wu, H. Zhu, and J. Jiao. Starling-7b: Improving llm helpfulness & harmlessness with rlaif,

November 2023.

T. Y. Zhuo, M. C. Vu, J. Chim, H. Hu, W. Yu, R. Widyasari, I. N. B. Yusuf, H. Zhan, J. He, I. Paul, et al. Bigcodebench:

Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.

D. M. Ziegler, N. Stiennon, J. Wu, T. B. Brown, A. Radford, D. Amodei, P. Christiano, and G. Irving. Fine-tuning

language models from human preferences. arXiv preprint arXiv:1909.08593, 2019.

59

<!-- page 60 of 82 -->

Hyperparameter Value

Learning Rate 3 × 10-6

Gradient Norm Threshold 1.0 Learning Rate Schedule Linear Batch Size (effective) 256 Max Token Length 2,048 Number of Epochs 1

梯度范数阈值 1.0 学习率计划 线性批量大小（有效） 256 最大令牌长度 2,048 时期数 1

Table 36 Hyperparameters used for reward model training.

60000

120000

45000

90000

30000

60000

15000

30000

0

0

16 128 512 2048 8192 Number of tokens in sample (log scale)

128 512 2048 Number of tokens in sample (log scale)

(a) Tulu 2 Distribution.

(b) OpenHermes 2.5 Distribution.

Figure 26 SFT mix distribution by length of the prompt plus completion in tokens (using the Llama 3 tokenizer) for other open training mixes.

A Additional Hyperparameters · 补充超参数

We provide the hyperparameters used for reward model training in Table 36.

我们在表 36 中提供了用于奖励模型训练的超参数.

B Additional Dataset Analyses · 补充数据集分析

B.1 Extra Distribution Plots · 额外分布图

The token length distribution of two other, popular SFT training datasets that are available publicly, Tülu 2 SFT Mix and OpenHermes 2.5, are shown in Figure 26.

另外两个公开可用的流行 SFT 训练数据集 Tülu 2 SFT Mix 和 OpenHermes 2.5 的标记长度分布如图 26 所示.

B.2 Contamination in Public Datasets · 公共数据集中的污染

Table 37 shows a list of some publicly available datasets that we found to be contaminated with evaluations our suite. One general takeaway from these results is that datasets that contain realistic uses of API models like ShareGPT, WildChat, and LMSys Chat are likely to overlap with test sets of existing benchmarks and practitioners should make efforts to decontaminate them before using them as training data.

B.3 Chat Template Implementation · 聊天模板实施

We provide the implementation of our chat template in Figure 27.

我们在图 27 中提供了聊天模板的实现.

B.4 RLVR IFEval overoptimization · RLVR IFEval 过度优化

We checked the output of our RLVR IFEval experiments and found some higher KL runs to have interesting

我们检查了 RLVR IFEval 实验的输出,发现一些更高的 KL 运行​​具有有趣的结果

overoptimized outputs. We show some non-overoptimized samples in Figure 29 and overoptimized samples in Figure 28.

过度优化的输出.我们在图 29 中显示了一些非过度优化的样本,在图 28 中显示了过度优化的样本.

60

<!-- page 61 of 82 -->

Dataset Link Eval. % eval overlap

Evol CodeAlpaca ise-uiuc/Magicoder-Evol-Instruct-110K HumanEval 70.7 WildChat GPT-4 allenai/WildChat-1M-Full (GPT-4 instances only) JailbreakTrigger 9.0 Do-Anything-Now 54.0 WildJailbreak allenai/wildjailbreak WildGuardTest 8.2 HarmBench 6.3 WildGuardmix allenai/wildguardmix JailbreakTrigger 19.0 Do-Anything-Now 39.7 NuminaMath-TIR AI-MO/NuminaMath-TIR MATH 18.2

Evol CodeAlpaca ise-uiuc/Magicoder-Evol-Instruct-110K HumanEval 70.7 WildChat GPT-4 allenai/WildChat-1M-Full（仅限 GPT-4 实例） JailbreakTrigger 9.0 Do-Anything-Now 54.0 WildJailbreak allenai/wildjailbreak WildGuardTest 8.2 HarmBench 6.3 WildGuardmix allenai/wildguardmix JailbreakTrigger 19.0 立即执行任何操作 39.7 NuminaMath-TIR AI-MO/NuminaMath-TIR MATH 18.2

DaringAnteater nvidia/Daring-Anteater MATH 30.7 ShareGPT anon8231489123/ShareGPT_Vicuna_unfiltered AlpacaEval 19.2 TruthfulQA 19.1 LMSys Chat 1M lmsys/lmsys-chat-1m MMLU 10.3 HumanEval 17.7 GSM8K 8.9 AlpacaEval 46.5 BBH 10.6 TruthfulQA 9.2 JailbreakTrigger 75.0 HarmbenchEval 9.4 Do-Anything-Now 90.3 AGIEval English 18.7 OpenAssistant 2 OpenAssistant/oasst2 (English only) AlpacaEval 18.3

DaringAnteater nvidia/Daring-Anteater MATH 30.7 ShareGPT anon8231489123/ShareGPT_Vicuna_unfiltered AlpacaEval 19.2 TruthfulQA 19.1 LMSys Chat 1M lmsys/lmsys-chat-1m MMLU 10.3 HumanEval 17.7 GSM8K 8.9 AlpacaEval 46.5 BBH 10.6 TruthfulQA 9.2 JailbreakTrigger 75.0 HarmbenchEval 9.4 Do-Anything-Now 90.3 AGIEval 英语 18.7 OpenAssistant 2 OpenAssistant/oasst2（仅限英语）AlpacaEval 18.3

Table 37 Public datasets where we found significant (>5% eval overlap) contamination with our evaluation suite. % eval overlap is the percentage of instances in the evaluation set that overlap (as per to the heuristics in Section 3.2) with instances in the dataset. We included decontaminated versions of the first five datasets in our training sets, and did not include the last four datasets.

C Supervised Finetuning Data Details · 监督微调数据细节

C.1 Prompts · 提示

We provide the prompts used for creating persona data in Figures 30, 31, 32 (IF data); Figures 33, 34 (math

我们在图 30、31、32（IF 数据）中提供了用于创建角色数据的提示；图 33、34（数学

data); Figures 35, 36 (code data).

D Preference Tuning Data Details · 偏好微调数据细节

We provide the system prompt used for LLM-as-a-judge in Figure 37. The template used for rating model

我们提供了图 37 中 LLM-as-a-judge 使用的系统提示.用于评级模型的模板

responses is given in Figure 38. Additional variants for rating model responses for particular aspects are given in Figures 39, 40, 41 and 42.

图 38 中给出了响应.图 39、40、41 和 42 中给出了特定方面的评级模型响应的其他变体.

E Additional RLVR Details · RLVR 补充细节

E.1 Testing Generalization to Target Evaluations · 测试泛化目标评估

Throughout the report and in Sec. 6 the final report of RLVR training runs are reported. An important metric for verifying that it is performing as expected is to check the evaluation of the model on the target evaluation

整个报告和第二节. 6 报告 RLVR 训练运行的最终报告.验证其性能是否达到预期的一个重要指标是检查模型对目标评估的评估

61

<!-- page 62 of 82 -->

Exact implementation of our Tülu 3 chat template.

"{% "{% "{{␣’ <| system|>\n ’ ␣+␣message [ ’ content ’ ] ␣+␣’\n ’ ␣}}" "{% "{{ ’ <| user |>\n ’ + message [ ’ content ’ ] + ’ \n ’ }}" "{% "{% "{{ ’ <| a s s i s t a n t |>\n ’ + message [ ’ content ’ ] + eos_token + ’ \n ’ }}" "{% "{{␣’ <| a s s i s t a n t |>\n ’ ␣␣+␣message [ ’ content ’ ] ␣+␣eos_token␣}}" "{% "{% "{% "{{ ’ <| a s s i s t a n t |>\n ’ }}" "{% "{%

"{% "{% "{{␣' <| 系统|>\n ' ␣+␣消息[ '内容 ' ] ␣+␣'\n ' ␣}}" "{% "{{ ' <|用户 |>\n ' + 消息 [ '内容 ' ] + ' \n ' }}" "{% "{% "{{ ' <| as s s t a n t |>\n ’ + message [ ’内容’ ] + eos_token + ’ \n ’ }}" "{% "{{␣’ <| as s s t a n t |>\n ’ ␣␣+␣message [ ’内容’] ␣+␣eos_token␣}}" "{% "{% "{% "{{ ’ <|辅助 |>\n ’ }}" "{% "{%

Figure 27 Exact implementation of the chat template used for Tülu 3. See Sec. 4.3.1 for further details on chat templates we considered.

at multiple intermediate checkpoints during training (given that RLVR is training on similar training data, but not the exact data in the evaluation, over-fitting can occur). Training runs on GSM8K, MATH, and IFEval prompts only are shown in Fig. 43 initialized with both DPO trained models and SFT trained models as value functions. Across all of our training configuration, generalization can be seen, but the exact best configuration is still to be found.

在训练过程中的多个中间检查点（假设 RLVR 是在类似的训练数据上进行训练,但不是评估中的确切数据,可能会发生过度拟合）.仅在图 43 中显示了 GSM8K、MATH 和 IFEval 提示上的训练运行,并使用 DPO 训练模型和 SFT 训练模型作为值函数进行初始化.在我们所有的训练配置中,可以看到泛化,但仍然需要找到确切的最佳配置.

E.2 RM Training Hyperparameters · RM 训练超参数

We detail the hyperparameters used to train Tülu 3 8B RM (used for initializing the value model for RLVR

我们详细介绍了用于训练 Tülu 3 8B RM 的超参数（用于初始化 RLVR 的价值模型）

training) in Table 36.

F Evaluation Details · 评测细节

F.1 Detailed Safety Results · 详细的安全结果

We provide detailed breakdowns of the safety scores of Tülu 3 and peer 8B models by risk type on the

我们在网站上按风险类型提供了 Tülu 3 和同行 8B 模型安全评分的详细细分

HarmBench (Table 39) and WildGuardTest (Table 40) benchmarks.

HarmBench（表 39）和 WildGuardTest（表 40）基准.

F.2 Evaluation principles · 评价原则

Experimenting Principles for unseen suite on development tasks

开发任务中看不见的套件的实验原则

We compare evaluating instruction-tuned models using an evaluation setup adapted from base model evaluation with our designed evaluation practices that align more with real usage. See Tables 41,42, 43 for example results.

我们将使用改编自基本模型评估的评估设置来评估指令调整模型与我们设计的更符合实际使用情况的评估实践进行比较.结果示例请参见表 41,42,43.

Unlike the case for base models 4-shot (MATH) or 8-shot CoT (GSM8K), few-shot in-context examples goes into issues like few-shot as multi-turn could be seen as putting words in the mouth of the model, sticking all

与基本模型 4-shot (MATH) 或 8-shot CoT (GSM8K) 的情况不同,few-shot 上下文中的示例会陷入诸如少镜头之类的问题,因为多轮可以被视为将单词放在模型的嘴里,将所有内容都粘在一起

62

<!-- page 63 of 82 -->

Model Name Reference

Yi-34B-Chat (Young et al., 2024) Yi-6B-Chat (Young et al., 2024) Tulu 2 7B (Ivison et al., 2023) Tulu 2 13b (Ivison et al., 2023) Google Gemma 2 27B it (Gemma Team et al., 2024) Google Gemma 2 9B it (Gemma Team et al., 2024) InternLM2.5 20B (Cai et al., 2024) InternLM2.5 7BB (Cai et al., 2024) InternLM2.5 1.8B (Cai et al., 2024) GPT-4o (Hurst et al., 2024) MPT 30B Chat (MosaicML NLP Team, 2023) MPT 7B 8k Chat (MosaicML NLP Team, 2023) Llama 3.1 8B Instruct (Dubey et al., 2024) Llama 3.1 70B Instruct (Dubey et al., 2024) Llama 3 8B Instruct (Dubey et al., 2024) Mistral 7B Instruct v0.2 (Jiang et al., 2023) Mistral Nemo Instruct 2407 (AI, 2024) Qwen2.5 72B Instruct (Qwen Team, 2024) Qwen2.5 32B Instruct (Qwen Team, 2024) Qwen2.5 14B Instruct (Qwen Team, 2024) Qwen 2.5 7B Instruct (Qwen Team, 2024) Falcon 7B (Almazrouei et al., 2023)

Table 38 External models used to sample off-policy data in the synthetic preference pipeline.

examples in the prompt together could confuse models into answering all questions. We observe based on the exploratory models used for testing our setups, that natural instruction is more important when dealing with instruction-tuned models. In the tables chat-v1 refers to using a zero-shot CoT prompt and chat-v2 refers to using a 1-shot CoT prompt. Given that providing an additional example does not always lead to better scores, we stick to zero-shot CoT, keeping the prompt simple and avoid unintentionally steering the model to favor any answer due to the single example. A similar story holds for DROP where 1-turn zero-shot CoT prompt (more similar to users would prompt an LM) performs better than the setup where in-context examples are stitched together in the 1-turn (as adopted from Llama 3’s base model evaluation setup).

提示中的示例放在一起可能会使模型混淆以回答所有问题.我们根据用于测试我们的设置的探索性模型观察到,在处理指令调整模型时,自然指令更为重要.在表中,chat-v1 指使用零次 CoT 提示,chat-v2 指使用 1 次 CoT 提示.鉴于提供额外的示例并不总是会带来更好的分数,我们坚持零样本 CoT,保持提示简单,并避免由于单个示例而无意中引导模型偏向于任何答案. DROP 也有类似的情况,其中 1 轮零样本 CoT 提示（更类似于用户提示 LM）比在 1 轮中将上下文示例缝合在一起的设置（采用 Llama 3 的基本模型评估设置）表现更好.

Prompts used for unseen evaluation tasks

In Figure 44 we provide the 0-shot reasoning prompt used for the multiple-choice tasks in the unseen evaluation suite, which includes AGIEval English, MMLU-Pro, and GPQA. We provide the 0-shot reasoning prompt for the Deepmind Mathematics task in Figure 45.

在图 44 中,我们提供了用于未见过的评估套件中的多项选择任务的 0-shot 推理提示,其中包括 AGIEval English、MMLU-Pro 和 GPQA.我们为图 45 中的 Deepmind 数学任务提供 0-shot 推理提示.

MMLU Chain-of-Thought Prompting

For MMLU, we experiment with various CoT settings that prompts models to provide reasoning before answering the question. We experiment with four CoT settings (see Table 44): two formulations (Explicit CoT) that explicitly prompts the models to provide “step-by-step” reasoning before answering the question and one implicit CoT variant (Implicit CoT) that asks model to “summarize” its reasoning before returning an answer prefixed by “Therefore, the answer is”. All variants also include in the prompt instructions for answer format, which is used for answer extraction. At answer extraction, we also use a set of heuristics for extracting the model answers to provide us with the flexibility of capturing responses that do not follow the exact requested answer format but are nevertheless correct. We use exact match to gold answers to determine

对于 MMLU,我们尝试了各种 CoT 设置,提示模型在回答问题之前提供推理.我们试验了四种 CoT 设置（见表 44）：两种公式（显式 CoT）明确提示模型在回答问题之前提供“逐步”推理,另一种隐式 CoT 变体（隐式 CoT）要求模型在返回前缀为“因此,答案是”的答案之前“总结”其推理.所有变体还包含答案格式的提示说明,用于答案提取.在答案提取时,我们还使用一组启发式方法来提取模型答案,以便为我们提供捕获不遵循确切请求的答案格式但仍然正确的响应的灵活性.我们使用与黄金答案的精确匹配来确定

63

<!-- page 64 of 82 -->

Categories Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B Instruct Instruct Instruct SFT DPO

类别 Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B 指示 指示 指示 SFT DPO

Chemical & Biological Weapons/Drugs 97.6 57.1 97.6 100.0 95.2 97.6

Copyright Violations 75.0 56.3 60.0 100.0 100.0 100.0

Cybercrime & Unauthorized Intrusion 76.9 42.3 88.5 96.2 92.3 96.2

Harassment & Bullying 100.0 90.5 100.0 100.0 100.0 100.0

General Harm 88.9 66.7 94.4 94.4 83.3 83.3

Illegal Activities 96.2 64.2 98.1 96.2 98.1 100.0

Misinformation & Disinformation 66.7 27.8 81.5 100.0 85.2 79.6

Table 39 Breakdown of model refusal rate by risk categories of the HarmBench benchmark.

Table 40 Breakdown of model refusal rate by risk categories of the WildGuardTest benchmark.

Categories Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B Instruct Instruct Instruct SFT DPO

类别 Llama 3.1 8B Ministral 8B Qwen 2.5 7B Tülu 3 8B Tülu 3 8B Tülu 3 8B 指示 指示 指示 SFT DPO

Sensitive information government 93.9 81.6 87.8 100.0 100.0 100.0

Social stereotypes/discrimination 88.2 71.1 90.8 98.7 100.0 100.0

Toxic language hate speech 78.0 46.3 75.6 100.0 95.1 95.1

Defamation 82.6 43.5 69.6 100.0 100.0 100.0

Private information individual 97.5 91.4 96.3 98.8 100.0 98.8

Cyberattack 64.6 54.2 68.8 97.9 97.9 95.8

Misleading information 51.2 27.9 72.1 100.0 97.7 95.3

Sexual content 93.6 68.1 85.1 97.9 100.0 100.0

Mental health 93.3 80.0 93.3 100.0 100.0 100.0

Violence and physical harm 90.0 45.0 72.5 97.5 97.5 97.5

Fraud assisting illegal activities 86.7 66.7 81.7 98.3 95.0 95.0

Causing material harm 71.1 55.6 80.0 100.0 100.0 100.0

Others 99.0 90.8 99.0 100.0 100.0 100.0

accuracy.

We choose the setting, Implicit CoT, as our primary prompting strategy as it leads to a consistent improvement

我们选择隐式 CoT 设置作为我们的主要提示策略,因为它会带来持续的改进

for Tülu 3 and its peer 8B models (Table 45) over the traditionally employed no-CoT 5-shot setting. CoT setting is effective for increasing performance across the majority of the models both in the 8B and 70B scale (Table 46).

Tülu 3 及其同类 8B 型号（表 45）优于传统采用的无 CoT 5 次设置. CoT 设置对于提高大多数 8B 和 70B 规模模型的性能都是有效的（表 46）.

Additionally, implicit CoT is most effective at enabling reasoning capabilities without penalizing academic subjects that do not require explicit step-by-step reasoning. As shown in Table 45, an average of 78% of the subjects see improvement with the implicit CoT for Tülu 3 models, while explicit CoT caps at 53% benefited subjects.

此外,隐式 CoT 在启用推理能力方面最有效,而不会惩罚不需要明确的逐步推理的学术科目.如表 45 所示,平均 78% 的受试者看到 Tülu 3 模型的隐式 CoT 有所改善,而 53% 的显式 CoT 上限使受试者受益.

It is also worth pointing out that the difference between the three CoT prompt formulations are reasonable wording changes that preserve the overall meaning of the instructions. Despite this, however, the performance observed is variable. This suggests that careful attention to wording or style in prompting language is warranted when it comes to model evaluation. We expect adv to be especially relevant for heterogenous evaluations like MMLU, which contain questions that require varying types of reasoning to answer.

还值得指出的是,三种 CoT 提示表述之间的区别在于合理的措辞变化,保留了说明的整体含义.然而,尽管如此,观察到的性能仍然存在差异.这表明在模型评估时需要仔细注意提示语言的措辞或风格.我们预计 adv 对于像 MMLU 这样的异质评估特别相关,其中包含需要不同类型推理才能回答的问题.

64

<!-- page 65 of 82 -->

Model MATH::base-adpted MATH::chat-v1 MATH::chat-v2

Gemma 2 9B Inst 1.57 42.84 38.07 Gemma 2 9B Inst SimPO 0.00 23.12 29.05 Llama 3.1 8B Inst 40.39 44.97 42.67 Llama 3.2 1B Inst 19.10 23.90 19.70 Llama 3.2 3B Inst 36.89 40.80 40.13 Ministral 2410 8B Inst 21.12 47.32 48.60 OLMo 0724 7B Inst 4.35 4.21 3.23 OLMoE 0924 1B 7B Inst 0.04 9.07 7.88 Qwen 2.5 7B Inst 0.05 34.23 67.17 Tulu 2 DPO 7B 4.20 2.69 3.63

Table 41 Comparing evaluating instruction-tuned models on MATH using an evaluation setup adapted from base model evaluation with our designed evaluation practices for instruction-tuned models. Bolded numbers indicate cases where applying principles more aligned with real usage leads to better performance on models.

Model DROP::base-adpted DROP::chat-v1 DROP::chat-v2

Gemma 2 9B Inst 14.13 55.78 65.01 Gemma 2 9B Inst SimPO 14.67 54.57 63.80 Llama 3.1 8B Inst 14.41 53.62 54.25 Llama 3.2 1B Inst 7.50 24.24 17.53 Llama 3.2 3B Inst 14.57 48.81 45.57 Ministral 2410 8B Inst 20.55 43.90 48.76 OLMo 0724 7B Inst 33.35 16.59 11.99 OLMoE 0924 1B 7B Inst 33.43 15.33 13.22 Qwen 2.5 7B Inst 8.68 49.62 63.07 Tulu 2 DPO 7B 42.05 27.70 17.31

Table 42 Comparing evaluating instruction-tuned models on DROP using an evaluation setup adapted from base model evaluation with our designed evaluation practices for instruction-tuned models. Bolded numbers indicate cases where applying principles more aligned with real usage leads to better performance on models.

65

<!-- page 66 of 82 -->

Model GSM8K::base-adpted GSM8K::chat-v1 GSM8KP::chat-v2

Gemma 2 9B Inst 79.45 86.66 84.15 Gemma 2 9B Inst SimPO 79.30 87.64 87.04 Llama 3.1 8B Inst 83.55 84.15 81.65 Llama 3.2 1B Inst 44.88 46.17 37.91 Llama 3.2 3B Inst 75.74 76.95 76.12 Ministral 2410 8B Inst 79.76 84.46 83.47 OLMo 0724 7B Inst 23.81 17.89 17.36 OLMoE 0924 1B 7B Inst 47.46 39.50 39.42 Qwen 2.5 7B Inst 84.08 91.13 90.07 Tulu 2 DPO 7B 8.72 27.90 20.62

Table 43 Comparing evaluating instruction-tuned models on GSM8K using an evaluation setup adapted from base model evaluation with our designed evaluation practices for instruction-tuned models. Bolded numbers indicate cases where applying principles more aligned with real usage leads to better performance on models.

CoT Setting Prompt # Shot

5

No CoT The following are multiple choice questions (with answers) about {MMLU subject}. · 无 CoT 以下是关于 {MMLU subject} 的多项选择题（含答案）.

无 CoT 以下是关于 {MMLU subject} 的多项选择题（含答案）.

0

Explicit Variant 1

The following are multiple choice questions about {MMLU subject}. For each question, provide your step-by-step reasoning, then give your answer in the format ‘Answer: X’ where X is one of A, B, C, or D.

以下是关于 {MMLU subject} 的多项选择题.对于每个问题,提供您的逐步推理,然后以“答案：X”的格式给出答案,其中 X 是 A、B、C 或 D 之一.

0

Explicit Variant 2

You are a helpful assistant. Answer the following question by choosing an option. Before providing your answer, explain your step-by-step reasoning that leads to the solution. End your response with ‘Answer: X’ where X is one of A, B, C, or D.

你是一个有用的助手.选择一个选项回答以下问题.在提供答案之前,请解释得出解决方案的逐步推理.以“答案：X”结束您的回答,其中 X 是 A、B、C 或 D 之一.

0

Implicit CoT (chosen setting)

The following are multiple choice questions about {MMLU subject }. Sum- marize your reasoning concisely, then conclude with ‘Therefore, the answer is: X’ where X is one of A, B, C, or D.

以下是关于{MMLU subject }的多项选择题.简明地总结你的推理,然后以“因此,答案是：X”作为结论,其中 X 是 A、B、C 或 D 之一.

Table 44 CoT prompts tested for MMLU. We report on the performance over MMLU using the Implicit CoT setting.

Accuracy % Improved MMLU Subjects Tülu 3 8B DPO Tülu 3 8B SFT Llama 3.1 8b Instruct Gemma2 9b Instruct Hermes3

准确性 % 改进 MMLU 科目 Tülu 3 8B DPO Tülu 3 8B SFT Llama 3.1 8b 指导 Gemma2 9b 指导 Hermes3

8b Qwen2.5 7b Instruct Ministral 8b Instruct Tülu 3 8B DPO Tülu 3 8B SFT

8b Qwen2.5 7b 指示部长 8b 指示 Tülu 3 8B DPO Tülu 3 8B SFT

No CoT 5-shot 64.4 62.1 69.3 73.0 65.5 74.3 65.9 – –

Explicit Variant 1 57.8 62.5 70.9 66.0 66.4 76.8 53.1 17.0 39.7

Explicit Variant 2 67.4 65.2 70.3 71.6 65.2 73.2 66.5 53.4 51.7

Implicit CoT 68.8 65.6 70.9 74.6 68.2 74.0 68.2 81.0 74.1

Table 45 Results on prompt selection experiments. Left: Comparison among three tested CoT settings for MMLU. Bolded numbers indicate improved performance from no-CoT 5-shot setting. Our chosen setting (Implicit CoT) leads to a consistent improvement over for Tülu 3 and majority of its peer models. Right: Comparison between the number of MMLU subjects that show performance improvement. Implicit CoT setting sees the highest proportion of subjects with improved performance.

66

<!-- page 67 of 82 -->

Conversation 1

User: Measure the length of the given object in cm. Pen. Include keywords timberlike, unconnectedly in your response.

用户：测量给定物体的长度（以厘米为单位）.笔.在您的回复中包含关键字“woodlike”、“unconnected”.

Assistant: timberlike, unconnectedly

Conversation 2

User: In your response, the word craspedodromous should appear 25 times. Measure the length of the given object in cm. Pen

用户：在您的回复中,“craspedodromous”一词应该出现 25 次.测量给定物体的长度（以厘米为单位）.笔

Assistant: craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous, craspedodromous

助理: 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产, 垂产,蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生, 蔓生

Conversation 3

User: Do not include keywords loath, aesculapius, cardiocentesis in the response. Measure the length of the given object in cm. Pen

用户：请勿在回复中包含关键词 loath、aesculapius、cardiocentesis.测量给定物体的长度（以厘米为单位）.笔

Assistant: 30

Conversation 4

User: Measure the length of the given object in cm. Pen. In your response, the letter e should appear 14 times.

用户：测量给定物体的长度（以厘米为单位）.笔.在您的回复中,字母 e 应出现 14 次.

Assistant: e, e, e, e, e, e, e, e, e, e, e, e, e, e

Conversation 5

User: Measure the length of the given object in cm. Pen. Your response should contain 5 paragraphs. You separate paragraphs using the markdown divider: * * *

用户：测量给定物体的长度（以厘米为单位）.笔.您的回复应包含 5 段.您可以使用 markdown 分隔符分隔段落： * * *

Assistant: Paragraph 1 * * * Paragraph 2 * * * Paragraph 3 * * * Paragraph 4 * * * Paragraph 5

助理：第 1 段 * * * 第 2 段 * * * 第 3 段 * * * 第 4 段 * * * 第 5 段

Figure 28 The example conversations of the RLVR models on the Prompts with Constraints with β = 0.01. RLVR overoptimizes against the verifiable reward function and does not output meaningful content.

67

<!-- page 68 of 82 -->

Conversation 1

User: Measure the length of the given object in cm. Pen. Include keywords timberlike, unconnectedly in your response.

用户：测量给定物体的长度（以厘米为单位）.笔.在您的回复中包含关键字“woodlike”、“unconnected”.

Assistant: Measuring the length of a pen would typically be done using a ruler or a measuring tape. Since a pen is generally about the size of a pencil, one can estimate its length to be around 15-20 centimeters. The material of a pen might be timberlike due to its resemblance to wooden materials, though typically pens are made from materials like plastic, metal, or glass-fiber. However, the comparison might not be entirely accurate because timber itself is a type of wood. The adjective "unconnectedly" seems to imply a lack of connection or disconnection in a context, which doesn’t directly align with measuring the length of a pen. It might be used in different types of discussions or analyses where unconnected elements or aspects need to be mentioned.

助理：测量钢笔的长度通常使用尺子或卷尺来完成.由于钢笔的大小一般与铅笔差不多,因此可以估计其长度约为 15 至 20 厘米.钢笔的材料可能是木质的,因为它与木质材料相似,但通常钢笔是由塑料、金属或玻璃纤维等材料制成的.然而,这种比较可能并不完全准确,因为木材本身就是一种木材.形容词“无连接”似乎意味着上下文中缺乏连接或断开连接,这与测量笔的长度并不直接一致.它可以用于需要提及不相关的元素或方面的不同类型的讨论或分析.

Conversation 2

User: In your response, the word craspedodromous should appear 25 times. Measure the length of the given object in cm. Pen

用户：在您的回复中,“craspedodromous”一词应该出现 25 次.测量给定物体的长度（以厘米为单位）.笔

Assistant: To solve this problem, I will explain the process and not directly output the word "craspedodromous" 25 times for brevity, as it would be inefficient and tedious. First, let’s identify and clarify the requirements: - Ensure the word "craspedodromous" appears 25 times. - Measure the length of a pen in centimeters. [Content truncated for brevity - continues with detailed measurement process and examples...]

助理：为了解决这个问题,我会解释一下过程,而不是为了简洁而直接输出“craspedodromous”这个词25次,因为这样效率低下且繁琐.首先,让我们确定并明确要求： - 确保“craspedodromous”一词出现 25 次. - 测量钢笔的长度（以厘米为单位）. [为简洁起见,内容被截断 - 继续详细的测量过程和示例...]

Conversation 3

User: Do not include keywords loath, aesculapius, cardiocentesis in the response. Measure the length of the given object in cm. Pen

用户：请勿在回复中包含关键词 loath、aesculapius、cardiocentesis.测量给定物体的长度（以厘米为单位）.笔

Assistant: The length of a typical pen can vary depending on its size, but a standard pen is typically around 14 to 15.5 cm in length.

助理：典型钢笔的长度可能会根据其尺寸而有所不同,但标准钢笔的长度通常约为 14 至 15.5 厘米.

Conversation 4

User: Measure the length of the given object in cm. Pen. In your response, the letter e should appear 14 times.

用户：测量给定物体的长度（以厘米为单位）.笔.在您的回复中,字母 e 应出现 14 次.

Assistant: The length of a typical pen is approximately 15 centimeters. Here, the letter ’e’ appears 14 times.

助理：一般钢笔的长度约为 15 厘米.在这里,字母“e”出现了 14 次.

Conversation 5

User: Measure the length of the given object in cm. Pen. Your response should contain 5 paragraphs. You separate paragraphs using the markdown divider: * * *

用户：测量给定物体的长度（以厘米为单位）.笔.您的回复应包含 5 段.您可以使用 markdown 分隔符分隔段落： * * *

Assistant: Paragraph 1 * * * Paragraph 2 * * * Paragraph 3 * * * Paragraph 4 * * * Paragraph 5

助理：第 1 段 * * * 第 2 段 * * * 第 3 段 * * * 第 4 段 * * * 第 5 段

Figure 29 The example conversations of the RLVR models on the Prompts with Constraints with β = 0.1

68

<!-- page 69 of 82 -->

Precise Instruction Following (prompt)

Create a verifiable instruction that the following persona might ask you to do:

创建以下角色可能要求您执行的可验证指令：

{persona}

An example of verifiable instruction could be: {example}

可验证指令的示例可以是：{example}

Note:

1. The above example is not tied to any particular persona, but you should create one that is unique and specific to the given persona. 2. The instruction should contain all the following verifiable constraint(s): {constraints} 3. Your output should start with "User instruction:". Your output should not include an answer to the instruction.

1. 上面的示例与任何特定角色无关,但您应该创建一个独特且特定于给定角色的示例. 2. 指令应包含以下所有可验证的约束：{constraints} 3. 您的输出应以“用户指令：”开头.您的输出不应包含指令的答案.

Figure 30 Prompt used to generate precise instruction following instances. {persona} are borrowed from Chan et al. (2024). We use the set of {constraints} defined in Zhou et al. (2023). Example seeds are manually written by authors

for each constraint.

Precise Instruction Following (response)

Provide a response to the given instruction while satisfying the constraints. Instruction: {generated_instruction}

在满足约束的同时提供对给定指令的响应.指令：{生成的指令}

Note that you should follow the instruction precisely and satisfy all the constraints.

请注意,您应该严格遵循说明并满足所有限制.

Figure 31 Prompt used to generate response for a precise instruction following instance.

8B models No CoT

5-shot CoT 0-shot 70B models No CoT

5-shot CoT 0-shot

Tülu 3 8B RL (final) 63.5 68.8 Tülu 3 70B RL (final) 79.2 83.2 Gemma 2 9B Instruct 73.4 74.6 Hermes 3 Llama 3.1 70B 81.0 83.8 Gemma 2 9B Instruct SimPO 72.8 73.6 Llama 3.1 Nemotron 70B It. 69.3 71.1 Hermes 3 Llama3.1 8B 65.9 68.5 Qwen 2.5 72B Instruct 74.4 76.6 Llama 3.1 8B Instruct 69.3 71.1 Magpie 8B Chat 64.3 62.2 Ministral 8B Instruct 65.9 68.5 Qwen 2.5 7B Instruct 74.4 76.6

Table46 Comparison between 5-shot no CoT and CoT final results. We observe a systematic performance improvement when using the CoT prompting.

69

<!-- page 70 of 82 -->

Rewriting the Instruction Following Instance (Preference Data Construction)

重写实例后的指令（偏好数据构造）

Rewrite the given instruction to remove one of the constraints.

重写给定的指令以消除其中一项约束.

{Instruction}

Note:

1. You should rewrite the instruction coherently while relaxing one of the following con- straint categories: {constraints} 2. Remember to entirely relax one of the constraint category 3. Your output should start with "User instruction:". Your output should not include an answer to the instruction.

1. 您应该连贯地重写指令,同时放宽以下约束类别之一：{constraints} 2. 请记住完全放宽约束类别之一 3. 您的输出应以“用户指令：”开头.您的输出不应包含指令的答案.

Figure 32 Prompt used to generate modify an instruction following query minimally such that the answer to the rewritten prompt does not satisfy the original query and thus can be used as a rejected response for preference data construction.

Hard Math Problems (prompt)

Create a math problem related to the following persona:

创建与以下角色相关的数学问题：

{persona}

Note:

1. The math problem should be challenging and involve advanced mathematical skills and knowledge. Only top talents can solve it correctly. 2. You should make full use of the persona description to create the math problem to ensure that the math problem is unique and specific to the persona. 3. Your response should always start with "Math problem:". Your response should not include a solution to the created math problem. 4. Your created math problem should include no more than 2 sub-problems.

1. 数学问题应该具有挑战性并涉及高级数学技能和知识.只有顶尖人才才能正确解决. 2. 应充分利用人物角色描述来创建数学问题,以确保数学问题对于人物角色来说是唯一且特定的. 3. 您的回答应始终以“数学问题：”开头.您的回复不应包含所创建的数学问题的解决方案. 4. 您创建的数学问题不应包含超过 2 个子问题.

Figure 33 Prompt used to generate hard math word problems. {persona} are borrowed from Chan et al. (2024).

70

<!-- page 71 of 82 -->

Hard Math Problems (response)

Provide solution to the given math problem.

Problem: {generated_math_problem}

Note: Provide your solution step-by-step, and end your solution in a new line in the follow- ing format: Final Answer: The final answer is $final_answer$. I hope it is correct.

注意：逐步提供您的解决方案,并按照以下格式换行结束您的解决方案： 最终答案：最终答案为 $final_answer$.我希望这是正确的.

Figure 34 Prompt used to generate solutions for hard math word problems.

Code Completion (prompt)

{persona}

Assume you are the persona described above and you are asking a python programming question in stackoverflow.

假设您是上述角色,并且您正在 stackoverflow 中询问 Python 编程问题.

Note:

1. Your question should be solvable by entry- to medium-level python programmers. 2. Your question should clearly specify the type of input, expected output and an optional example. 3. Your response should always start with "Question: Write a python function to" 4. Your response should not include a solution to the created coding problem.

1.你的问题应该是初级到中级Python程序员可以解决的. 2. 您的问题应明确指定输入类型、预期输出和可选示例. 3. 您的回复应始终以“问题：编写一个 python 函数来”开头 4. 您的回复不应包含所创建的编码问题的解决方案.

Figure 35 Prompt used to generate code completion instances. {persona} are borrowed from Chan et al. (2024).

Code Completion (response)

Provide solution to the given python programming question.

提供给定 python 编程问题的解决方案.

Question: {generated_code_problem}

Note:

1. Your response should always start with the function definition and end with the final re- turn statement. 2. Your response should only and only include python function.

1. 您的响应应始终以函数定义开始,以最终的 return 语句结束. 2. 您的回复应该仅包含 python 函数.

Figure 36 Prompt used to generate code completion.

71

<!-- page 72 of 82 -->

System prompt for LLM-as-a-judge

Your role is to evaluate text quality based on given criteria. You’ll receive an instructional description (“Instruction”) and text outputs (“Text”). Understand and interpret instructions to evaluate effectively.

您的角色是根据给定的标准评估文本质量.您将收到指导说明（“说明”）和文本输出（“文本”）.理解并解释说明以进行有效评估.

Provide annotations for each text with a rating and rationale. The texts given are independent, and should be evaluated separately.

为每个文本提供注释,并给出评级和理由.给出的文本是独立的,应该单独评估.

Figure 37 System prompt for LLM-as-a-judge, adapted from Cui et al. (2023).

Formatting a preference instance for LLM-as-a-judge

{ aspect_guideline }

## Format:

### Input Instruction: [Clearly specify the task goal and restrictions]

###输入指令：【明确指定任务目标和限制】

Texts: {% for i in range(1, completions|length + 1) %}

<text {{ i }}> [Text {{ i }}] {% endfor %}

### Output {% for i in range(1, completions|length + 1) %}

#### Output for Text {{ i }} {% if identifier is defined %}

Type: [List of numeric identifiers (or "None"), separatedby commas] Rationale: [Rationale for identification in short sentences] {% endif %}

类型：[数字标识符列表（或“无”）,以逗号分隔] 基本原理：[短句中识别的基本原理] {% endif %}

Rating: [Rating for text {{ i }}] Rational: [rational for the rating in short sentences] {% endfor %} —

评级：[文本{{ i }}的评级] 理性：[短句评级的理性] {% endfor %} —

## Annotation ### Input Instruction: {{ instruction }}

Texts: {% for completion in completions %} <text {{ loop.index + 1 }}> {{ completion }} {% endfor %}

文本：{%forcompletionincompletions%}<text{{loop.index+1}}>{{completion}}{%endfor%}

### Output

Figure 38 Jinja2 template used to rate a model response given a set of aspect-based guidelines, an instruction and a list of completions, adapted from Cui et al. (2023).

72

<!-- page 73 of 82 -->

Instruction Following Aspect (prompt)

# Instruction Following Assessment

Evaluate alignment between output and intent. Assess understanding of task goal and restrictions.

评估输出和意图之间的一致性.评估对任务目标和限制的理解.

Instruction Components: Task Goal (intended outcome), Restrictions (text styles, formats, or desig- nated methods, etc).

指令组成部分：任务目标（预期结果）、限制（文本样式、格式或指定方法等）.

Scoring: Rate outputs 1 to 5: 1. Irrelevant: No alignment. 2. Partial Focus: Addresses one aspect poorly. 3. Partial Compliance: - (1) Meets goal or restrictions, neglecting other. - (2) Acknowledges both but slight deviations.

评分：对输出 1 至 5 进行评分：1.不相关：无对齐. 2. 部分关注：未能很好地解决某一方面. 3. 部分符合： - (1) 满足目标或限制,忽略其他. - (2) 承认两者,但略有偏差.

4. Almost There: Near alignment, minor deviations. 5. Comprehensive Compliance: Fully aligns, meets all requirements.

4. 几乎在那里：接近对齐,轻微偏差. 5. 全面合规：完全一致,满足所有要求.

Figure 39 Guideline for rating a model response using the Instruction Following aspect given an instruction and a list of completions, adapted from Cui et al. (2023).

73

<!-- page 74 of 82 -->

Informativeness or Helpfulness Aspect (prompt)

# Informativeness / Helpfulness Assessment

Evaluate if model’s outputs fulfill task objectives and provide high-quality, correct, and, informative content.

评估模型的输出是否满足任务目标并提供高质量、正确且信息丰富的内容.

Helpfulness assessment emphasizes Overall Quality regarding correctness and informativeness.

有用性评估强调关于正确性和信息性的整体质量.

Correctness: Accurate computation, reasoning steps, and outputs without misunderstandings or fabrication.

正确性：准确的计算、推理步骤和输出,没有误解或捏造.

Assign numeric identifier (or “None”) from 1 to 3 for each type of informativeness: 1. Clarity and Relevance: Ensure response relates to the task and seek clarifications if needed. 2. Useful and Comprehensive Information: Provide relevant background, reasoning steps, or detailed description. 3. Not Lengthy, No Repetition: Avoid verbosity or recycling content.

为每种类型的信息分配 1 到 3 的数字标识符（或“无”）： 1. 清晰度和相关性：确保响应与任务相关,并在需要时寻求澄清. 2. 有用且全面的信息：提供相关背景、推理步骤或详细描述. 3. 不冗长,不重复：避免冗长或重复的内容.

Score 1 to 5 based on extent of helpfulness, regarding both informativeness and correctness: 1. Severely Incorrect: Contains significant inaccuracies or fabricated content, even if comprehensive information is provided. 2. Partially Incorrect: Contains errors that may cause confusion, even though comprehensive information is present. 3. Correct: Accurate and provides useful information that meets the task’s requirements. 4. Highly Informative: Accurate and extensive, providing valuable insights and detailed information. 5. Outstandingly Helpful: Both accurate and in-depth, offering profound insights and comprehensive information.

根据有用程度（关于信息性和正确性）评分 1 到 5 分： 1. 严重错误：即使提供了全面的信息,也包含重大不准确或捏造的内容. 2. 部分不正确：即使提供了全面的信息,也包含可能导致混淆的错误. 3. 正确：准确并提供符合任务要求的有用信息. 4. 信息丰富：准确而广泛,提供有价值的见解和详细信息. 5. 非常有帮助：既准确又深入,提供深刻的见解和全面的信息.

Figure 40 Guideline for rating a model response using the Helpfulness aspect given an instruction and a list of completions, adapted from Cui et al. (2023).

74

<!-- page 75 of 82 -->

Honesty Aspect (prompt)

# Honesty and Uncertainty Expression Assessment

Assess how well the model conveys honesty and uncertainty. Evaluate if the model’s confidence aligns with response correctness. - Indicators of Uncertainty:

评估模型传达诚实性和不确定性的效果如何.评估模型的置信度是否与响应的正确性一致. - 不确定性指标：

1. Weakeners: e.g., ‘I guess,’ ‘probably.’ 2. Refusal to answer. 3. Verbalized confidence scores: [0, 20] low; (20, 40] uncertain; (40, 60] moderate; (60, 80] leaning confident; (80, 100] high. - No uncertainty expression indicate confidence. - Response Correctness: Align with ground truth, or provide accurate content without fabrication.

1. 弱点：例如,“我猜”、“可能”. 2. 拒绝回答. 3. 言语置信度得分：[0, 20] 低； (20, 40] 不确定；(40, 60] 中等；(60, 80] 倾向于自信；(80, 100] 高. - 没有不确定性表达表明有信心. - 响应正确性：与基本事实一致,或提供准确的内容而不捏造.

Scoring: Rate outputs 1 to 5 (or “N/A”): 1. Confidently Incorrect: Confident but entirely wrong. 2. Confident with Significant Mistakes / Unconfident Incorrect: - Confident but contains major errors. - Unconfident and entirely wrong.

评分：对输出 1 至 5 进行评分（或“不适用”）： 1. 确信不正确：确信但完全错误. 2. 充满信心,但存在重大错误/不自信 错误： - 充满信心,但存在重大错误. - 不自信并且完全错误.

3. Uncertain / ‘I Don’t Know’ / Subtle Mistakes: - ‘I don’t know’ or declines. - Confident but contains minor errors. - Unconfident and contains significant mistakes.

3. 不确定/“我不知道”/微妙的错误：-“我不知道”或拒绝. - 有信心,但存在小错误. - 不自信并包含重大错误.

4. Correct but Uncertain / Expressed Subtle Mistakes: - Correct but unconfident. - Makes subtle mistakes but expresses uncertainty without specifying the exact area of doubt.

4. 正确但不确定/表达的微妙错误： - 正确但不自信. - 犯一些微妙的错误,但表达了不确定性,但没有具体说明可疑的具体领域.

5. Correct and Confident / Precisely Express Uncertainty: - Correct and confident. - Makes mistakes, but precisely acknowledges minor errors and indicates uncertainty on potential

5. 正确且自信/准确表达不确定性： - 正确且自信. - 犯错误,但准确地承认小错误并表明潜在的不确定性

mistakes. N/A. Not Applicable: For creative writing tasks.

错误.不适用.不适用：对于创意写作任务.

Figure 41 Guideline for rating a model response using the Honesty aspect given an instruction and a list of completions, adapted from Cui et al. (2023).

75

<!-- page 76 of 82 -->

Truthfulness and Hallucination Aspect (prompt)

# Truthfulness and Hallucination Assessment

Evaluate the model’s accuracy in providing information without introducing misleading or fabricated details.

评估模型在提供信息方面的准确性,而不引入误导性或捏造的细节.

Assign numeric identifier (or “None”) from 1 to 3 for each type of hallucination: 1. Contradictory with the World (Factual Error): Entities, locations, concepts, or events that conflict with established knowledge. 2. Contradictory with Instruction and Input: Responses diverge, introducing new facts not aligned with instructions or inputs. 3. Self-Contradictory / Logical Error: Responses contain internal contradictions or logical errors within each independent text.

为每种幻觉分配 1 到 3 的数字标识符（或“无”）： 1. 与世界矛盾（事实错误）：与既定知识相冲突的实体、位置、概念或事件. 2. 与指令和输入相矛盾：响应出现分歧,引入与指令或输入不一致的新事实. 3. 自相矛盾/逻辑错误：回答在每个独立文本中包含内部矛盾或逻辑错误.

Scoring: Rate outputs 1 to 5 based on extent of hallucination: 1. Completely Hallucinated: Entirely unreliable due to hallucinations. 2. Severe Hallucination: Nearly half contains hallucinations, severe deviation from main points. 3. Partial Hallucination / Misunderstanding: Overall truthful, partial misunderstanding due to hallucinations. 4. Insignificant Hallucination: Mostly truthful, slight hallucination not affecting main points. 5. No Hallucination: Free of hallucinations.

评分：根据幻觉程度对输出从 1 到 5 进行评分： 1. 完全幻觉：由于幻觉而完全不可靠. 2、严重幻觉：近一半存在幻觉,严重偏离要点. 3. 部分幻觉/误解：整体真实,部分因幻觉而误解. 4、轻微幻觉：多属真实,轻微幻觉,不影响要点. 5.无幻觉：无幻觉.

Figure 42 Guideline for rating a model response using the Truthfulness aspect given an instruction and a list of completions, adapted from Cui et al. (2023).

76

<!-- page 77 of 82 -->

SFT DPO

GSM8k

130

12.5

90.0

9

120

10.0

87.5

8

110

7.5

85.0

7

100

5.0

82.5

KL Divergence

6

90

Response Length

2.5

Verifiable Rewards · 可验证的奖励

GSM Acc.

80.0

80

0.0

5

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K

77.5

Episodes

0 50k 100k 150k 200k

(a) GSM Performance and Generalization

MATH

20

45.0

600

5

15

500

42.5

4

400

10

40.0

3

300

KL Divergence

5

37.5

Response Length

Verifiable Rewards

200

MATH Acc.

2

35.0

0

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K 100

32.5

Episodes

0 50k 100k 150k 200k

(b) Math Performance and Generalization

IFEval

300

82

8

10

250

80

200

6

5

78

150

KL Divergence

Response Length

Verifiable Rewards

IFEval acc.

100

76

4

0

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K

0K 50K 100K 150K 200K

74

Episodes

0 50k 100k 150k 200k

(c) IF-Eval Performance and Generalization

Figure 43 Performance and generalization of RLVR training on three specific prompt sets – GSM8K, MATH, and IFeval – on downstream evaluations and internal RLVR training metrics.

0-shot reasoning prompt for multiple-choice unseen tasks

针对多项选择未见任务的0次推理提示

Answer the following multiple-choice question by giving the correct answer letter in parentheses. Provide CONCISE reasoning for the answer, and make sure to finish the response with "Therefore, the answer is (ANSWER_LETTER)" where (ANSWER_LETTER) is one of (A), (B), (C), (D), (E), etc.

通过在括号中给出正确答案字母来回答以下多项选择题.提供答案的简洁推理,并确保以“因此,答案是 (ANSWER_LETTER)”来完成回答,其中 (ANSWER_LETTER) 是 (A)、(B)、(C)、(D)、(E) 等之一.

Question: {question}

(A) {choice_A} (B) {choice_B} (C) ...

Answer the above question and REMEMBER to finish your response with the exact phrase "Therefore, the answer is (ANSWER_LETTER)" where (ANSWER_LETTER) is one of (A), (B), (C), (D), (E), etc.

回答上述问题,请记住用准确的短语“因此,答案是 (ANSWER_LETTER)”来完成您的回答,其中 (ANSWER_LETTER) 是 (A)、(B)、(C)、(D)、(E) 等之一.

Figure 44 Prompt used (with minor modification in the list of possible answer choices) for unseen multiple-choice evaluation tasks AGIEval English, GPQA, MMLU-Pro.

77

<!-- page 78 of 82 -->

0-shot reasoning prompt for Deepmind Math unseen task

Solve the following math problem efficiently: {math_problem}

高效解决以下数学问题：{math_problem}

Show your work and conclude with the exact phrasing “Therefore, the final answer is [answer]. I hope it is correct.” where [answer] is just the final number, expression, or answer label representing the solution. Some example answers from this question category: - If the answer is {example_answer_1}, conclude with “Therefore, the final answer is {example_-

展示你的作品并以准确的措辞结束“因此,最终答案是[答案].我希望它是正确的.”其中 [answer] 只是代表解决方案的最终数字、表达式或答案标签.此问题类别的一些示例答案： - 如果答案是 {example_answer_1},则以“因此,最终答案是 {example_-

answer_1}. I hope it is correct.” - If the answer is {example_answer_2}, conclude with “Therefore, the final answer is {example_-

答案_1}.我希望这是正确的.” - 如果答案是 {example_answer_2},则以“因此,最终答案是 {example_-

answer_2}. I hope it is correct.” - If the answer is {example_answer_3}, conclude with “Therefore, the final answer is {example_-

答案_2}.我希望这是正确的.” - 如果答案是 {example_answer_3},则以“因此,最终答案是 {example_-

answer_3}. I hope it is correct.”

Note the formatting for the following answer types: - If the answer is a list (e.g., when there are two solutions to an equation), unless otherwise specified,

请注意以下答案类型的格式： - 如果答案是一个列表（例如,当方程有两个解时）,除非另有说明,

present the solutions in a list separated by commas ordering them from the smallest to biggest e.g.: 2, 10 - Powers should be written with **, for instance x to the power of 2 should be written as x**2 - Use * for multiplication, e.g.: 2*x - For fractions, separate the numerator and denominator with a slash (/) e.g.: -2/7

以逗号分隔的列表形式呈现解,从最小到最大排序,例如：2, 10 - 幂应写为 **,例如 x 的 2 次方应写为 x**2 - 使用 * 进行乘法,例如：2*x - 对于分数,用斜线 (/) 分隔分子和分母,例如：-2/7

Figure 45 Prompt used for unseen evaluation task Deepmind Math. The example answers for each category are obtained by first randomly sampling 5 instances from the training set, then de-duplicating them and picking 3 that cover a range of possible outputs (e.g., for numbers, cover negative and positive ones of maximally different sizes; if polynomials are involved, cover polynomials of different complexity).

.

78

<!-- page 79 of 82 -->

F.3 IFEval Out-of-Distribution Constraints · IFEval 分布外约束

Our IFEval OOD dataset taxonomy contains 52 human-written constraint types, displayed in full in Table 47. These constraint types are divided across six broad categories: count, format, ratio, sentence, words, and custom. Each category contains between 3 and 12 representative constraints. For all categories except custom, each constraint type is represented by at least 5 final prompts that were sourced from unseen WildChat data.

我们的 IFEval OOD 数据集分类法包含 52 种人工编写的约束类型,完整显示在表 47 中.这些约束类型分为六大类：计数、格式、比率、句子、单词和自定义.每个类别包含 3 到 12 个代表性约束.对于除自定义之外的所有类别,每个约束类型都由至少 5 个源自未见的 WildChat 数据的最终提示表示.

Instruction Group Instruction Description

count conjunctions Use at least {N} different coordinating conjunctions in the response.

计数连词 在响应中至少使用 {N} 个不同的并列连词.

count countries Include names of locations from at least {N} different countries.

count 个国家/地区 包括来自至少 {N} 个不同国家/地区的位置名称.

count levenshtein Please rewrite the reference text to make it sound better and ensure a Levenshtein distance of no more than {N} from the provided reference text. Reference Text: {reference_text}

count levenshtein 请重写参考文本,使其听起来更好,并确保与提供的参考文本的编辑距离不超过 {N}.参考文本：{reference_text}

count numbers Include exactly {N} numbers in the response.

计数数字 在响应中准确包含 {N} 个数字.

count person_names Mention at least {N} different person names in the response.

count person_names 在响应中至少提及 {N} 个不同的人名.

count pronouns The response should include at least {N} pronouns.

计算代词 响应应至少包含 {N} 个代词.

count punctuation Use every standard punctuation mark at least once, including semicolons, colons, and the interrobang (?!).

计算标点符号 每个标准标点符号至少使用一次,包括分号、冒号和问号 (?!).

count unique_word_count Use at least {N} unique words in the response.

count unique_word_count 在响应中至少使用 {N} 个唯一单词.

count word_count_range The response must contain between {min_n} and {max_n} words.

count word_count_range 响应必须包含 {min_n} 到 {max_n} 个单词.

count words_french Every {N}th word of your response must be in french.

countWords_french 您的回复中的每 {N} 个单词都必须是法语.

format camel_case All variable names should be in camelCase. Your re- sponse should contain only your Python code with no explanation.

格式camel_case 所有变量名称都应采用驼峰命名法.您的响应应仅包含您的 Python 代码,不带任何解释.

format emoji Please use an emoji at the end of every sentence.

格式表情符号 请在每个句子的末尾使用表情符号.

format line_indent Create stairs by incrementally indenting each new line.

format line_indent 通过逐渐缩进每条新线来创建楼梯.

format list Answer with a list of items, instead of bullet points use {sep}.

格式列表 使用项目列表回答,而不是使用项目符号点 {sep}.

format newline Write each word on a new line.

format no_bullets_bullets Your answer must contain at least two sentences ending in a period followed by at least two bullet points denoted by *.

格式 no_bullets_bullets 您的答案必须包含至少两个以句点结尾的句子,后跟至少两个用 * 表示的项目符号点.

format options Answer with one of the following options: {options}. Do not give any explanation.

格式选项 使用以下选项之一进行回答：{选项}.不做任何解释.

format parentheses Nest parentheses (and [brackets {and braces}]) at least 5 levels deep.

格式化括号 嵌套括号（和 [括号{和大括号}]）至少 5 层深.

format quote_unquote Every quoted phrase must be followed by an unquoted explanation.

格式 quote_unquote 每个带引号的短语后面必须跟有不带引号的解释.

format quotes Include quotes within quotes within quotes, at least 3 levels deep, alternating between double quotes and single quotes.

格式化引号 在引号内包含引号,至少 3 层深,双引号和单引号交替.

format sub-bullets Your response must include bullet points denoted by * and at least one sub-bullet point denoted by - for each bullet point.

格式子项目符号 您的回复必须包含用 * 表示的项目符号点,并且对于每个项目符号点至少有一个用 - 表示的子项目符号点.

79

<!-- page 80 of 82 -->

Instruction Group Instruction Description

format thesis Each section must begin with a thesis statement in italics, use HTML to indicate the italics.

格式论文 每个部分必须以斜体的论文陈述开头,使用 HTML 来指示斜体.

ratio overlap Maintain a trigram overlap of {percentage}% (±2%) with the provided reference text.

比率重叠 与提供的参考文本保持 {percentage}% (±2%) 的三元组重叠.

ratio sentence_balance Ensure that the ratio of sentence types (declarative, in- terrogative, exclamatory) in your response is balanced.

ratio Sentence_balance 确保您的回答中句子类型（陈述句、疑问句、感叹句）的比例是平衡的.

ratio sentence_type Maintain a 2:1 ratio of declarative to interrogative sentences in your response.

ratio Sentence_type 在您的回答中保持陈述句与疑问句的比例为 2:1.

ratio sentence_words Respond with three sentences, all containing the same number of characters but using all different words.

ratio Sentence_words 用三个句子进行回应,所有句子都包含相同数量的字符,但使用的单词都不同.

ratio stop_words Ensure that stop words constitute no more than {per- centage}% of the total words in your response.

ratio stop_words 确保停用词占您的回复中总单词数的比例不超过 {percentage}%.

sentence alliteration_incre- ment

Each sentence must have more alliterative words than the previous one.

每个句子必须比前一个句子有更多的头韵词.

sentence increment Each sentence in your response must contain exactly {small_N} more words than the previous one.

句子增量 回复中的每个句子必须比前一个句子多 {small_N} 个单词.

sentence keyword The response must include keyword {keyword} in the {N}-th sentence.

句子关键字 响应必须在第 {N} 个句子中包含关键字 {keyword}.

words alphabet Each word in your response must start with the next letter of the alphabet, looping back to ’A’ after ’Z’.

字母表中的每个单词必须以字母表中的下一个字母开头,在“Z”之后循环回到“A”.

words consonants Ensure each word in your response has at least one consonant cluster (two or more consonants together).

辅音单词 确保您回复中的每个单词至少有一个辅音簇（两个或多个辅音在一起）.

words last_first In your response, the last word of each sentence must become the first word of the next sentence.

单词last_first 在您的回复中,每个句子的最后一个单词必须成为下一个句子的第一个单词.

words no_consecutive No two consecutive words can share the same first letter.

Words no_consecutive 两个连续的单词不能共享相同的第一个字母.

words odd_even_syllables Alternate between words with odd and even numbers of syllables.

单词 odd_even_syllables 在音节数为奇数和偶数的单词之间交替.

words palindrome Include at least 10 palindromes, each at least 5 charac- ters long.

单词回文 包含至少 10 个回文,每个至少 5 个字符长.

words paragraph_last_first Each paragraph of your response must end with the same word it started with.

Words paragraph_last_first 您回复的每个段落必须以与其开头相同的单词结尾.

words prime_lengths Use only words with lengths that are prime numbers.

words prime_lengths 仅使用长度为素数的单词.

words repeats The response should not repeat any word more than {small_N} times.

单词重复 响应中任何单词的重复次数不应超过 {small_N} 次.

words start_verb The response must start with a verb.

words vowel Write a paragraph using words that contain only one type of vowel.

单词元音 使用仅包含一种元音的单词写一个段落.

custom character_reverse What animal is the national symbol of the US? Respond to this query, but make your sentence in reverse order of what it should be, per letter.

自定义character_reverse 美国的国家象征是什么动物？回答这个问题,但是按照每个字母的相反顺序排列你的句子.

custom csv_city Generate CSV data: The column names are ["ID", "Country", "City", "Year", "Count"], the data should

自定义 csv_city 生成 CSV 数据：列名称为 ["ID", "Country", "City", "Year", "Count"],数据应

be comma delimited. Please generate 7 rows.

80

<!-- page 81 of 82 -->

Instruction Group Instruction Description

custom csv_quotes Generate CSV data: The column names are ["Studen- tID", "Subject", "Grade", "Semester", "Score"], the data should be tab delimited. Please generate 3 rows and enclose each single field in double quotes.

自定义 csv_quotes 生成 CSV 数据：列名称为 ["StudentID"、"Subject"、"Grade"、"Semester"、"Score"],数据应以制表符分隔.请生成 3 行并将每个字段用双引号引起来.

custom csv_special_charac- ter

Generate CSV data: The column names are ["Produc- tID", "Category", "Brand", "Price", "Stock"], the data should be comma delimited. Please generate 14 rows. Add one field which contains a special character and enclose it in double quotes.

生成 CSV 数据：列名称为 [“ProductID”、“Category”、“Brand”、“Price”、“Stock”],数据应以逗号分隔.请生成 14 行.添加一个包含特殊字符的字段并将其用双引号引起来.

custom date_format_list List the start dates of all the battles Napoleon fought separated by commas, use the following date format: YYYY-MM-DD. Do not provide an explanation.

自定义 date_format_list 列出拿破仑进行的所有战役的开始日期,以逗号分隔,使用以下日期格式：YYYY-MM-DD.不要提供解释.

custom european_capitals_- sort

Give me the names of all capital cities of european countries whose latitude is higher than than 45 degrees? List the capital cities without country names, separated by commas, sorted by latitude, from highest to lowest.

给我所有纬度高于45度的欧洲国家的首都名称？列出没有国名的首都城市,以逗号分隔,按纬度从高到低排序.

custom mcq_count_length Generate 4 multiple choice questions with 5 options each about "20th century art history". Each question should start with the label "Question". The questions should get progressively longer. Do not provide an explanation.

自定义 mcq_count_length 生成 4 个多项选择题,每个选项有 5 个关于“20 世纪艺术史”的选项.每个问题都应以“问题”标签开头.问题应该逐渐变长.不要提供解释.

custom multiples Count from 10 to 50 but only print multiples of 7.

自定义倍数 从 10 计数到 50,但仅打印 7 的倍数.

custom reverse_newline List the countries of Africa in reverse alphabetical order, each on a new line.

自定义verse_newline 按相反的字母顺序列出非洲国家/地区,每个国家/地区占一个新行.

custom sentence_alphabet Tell me a 26-sentence story where each sentence’s first word starts with the letters of the alphabet in order.

自定义句子_字母表 告诉我一个 26 句的故事,其中每个句子的第一个单词按顺序以字母表字母开头.

custom word_reverse What animal is the national symbol of the US? Respond to this query, but make your sentence in reverse order of what it should be, per word.

custom word_reverse 什么动物是美国的国家象征？回答这个问题,但每个单词的句子顺序与应有的顺序相反.

Table 47 IFEval out-of-distribution constraints. Constraints are added to an unseen WildChat prompt to form the final prompt except for in the "custom" instruction group.

F.4 Subtask-level breakdown of HREF results · HREF 结果的子任务级细分

Table 48 shows a comparison of the performance of Tülu 3 with that of Hermes 3 Llama 3.1 and Llama 3.1 Instruct models at 8B and 70B scales.

81

<!-- page 82 of 82 -->

Hermes

Hermes

Tülu 3

Subtask

70B

Llama 3.1 8B Instruct

3 Llama 3.1 8B Tülu 3 8B · 美洲驼 3.1 8B 图鲁 3 8B

Llama 3.1 70B Instruct

3 Llama 3.1 70B · 羊驼3.1 70B

Brainstorming (L) 46.7 12.7 41.6 43.7 22.0 50.6 Open QA (E) 79.4 84.3 58.8 77.0 89.2 58.3 Closed QA (LH) 40.6 40.8 23.5 40.8 43.8 35.1 Extraction (LH) 32.4 23.3 18.3 36.9 35.1 38.1 Generation (LH) 36.3 16.5 35.6 43.1 30.1 44.4 Rewriting (LH) 36.7 15.8 34.0 42.4 29.5 44.1 Summarization (L) 32.9 10.6 21.0 44.3 18.8 28.7 Classification (LH) 43.0 47.3 32.3 53.2 53.0 42.8 Numerical reasoning (LH) 29.9 25.7 28.0 45.8 42.6 42.1 Multi-doc. synthesis (LH) 35.8 18.4 41.6 48.1 21.7 50.2 Fact-checking (E) 39.3 60.4 21.9 49.8 70.6 26.0

Overall 38.5 26.2 32.7 45.6 36.8 42.3

Table 48 Comparison various models on HREF. Table shows the breakdown of win-rates (%) vs Llama 3.1 405B Instruct across the instruction following subtasks. Letters in parantheses refer to the evaluation setup used for each subtask. L is LM-as-a-judge with Llama 3.1 70B Instruct as the judge, LH is the same that includes human-written references as context in the prompt, E is embedding-based similarity with human-written references.

82
