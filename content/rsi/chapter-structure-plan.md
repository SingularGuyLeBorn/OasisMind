---
title: RSI 花园章节结构规划
date: 2026-08-30
tags: [ops, structure, rsi]
published: false
excerpt: notes/ 扁平行已迁到 1–6 章。禁止再往 notes/ 堆新文。禁止删文件。
category: RSI
---

# RSI 花园结构规划

读者不满意的根因：所有条目堆在 `notes/`，每篇 20–40 行摘要，没有坐标系。

## 死命令

- **禁止 Delete** 既有文件（含 `.trash/`）。整理用 `git mv`。
- **禁止**再往 `notes/` 写新专文。`notes/` 只保留迁出说明。
- 新文 **一夹一文同名**，同级 `{NN}` 不重复，无空格/冒号。
- 章首页是 **地图**，不是第二份专文。
- 数字、公式以原论文 / 官方 blog / system card 为准。知乎只学讲法。
- 禁止把专栏、CS329A 讲义、周星星长文搬进花园。
- OPD 算法本体在兄弟花园 `content/llm-guide/4.6-OPD/`，本库只写它和 RSI 的边界。
- Agent harness 产品细节在 `content/llm-guide/13/`，本库写 **Harness 作为自进化一层**。

## 读者怎么走

```
_garden.md / 0-导读
  → 1 坐标系（术语 + Model/Harness/Artifact）
    → 2 Model 层专文（SPIN / Self-Rewarding / …）
    → 3 Harness 层专文（Argus / Auto-Research / …）
    → 4 Artifact 层专文（Polaris / AlphaEvolve 线索）
    → 5 实验室与公司（田渊栋 / Anthropic / OpenAI）
    → 6 评测与安全（RSIBench / 可靠性阶梯 / SEAGym / system card RSI）
```

## 落点

| 要写的东西 | 落点 | 不要落 |
|------------|------|--------|
| self-improving vs RSI vs CL vs TTT | 第 1 章 | 不要在第 5 章再写一套术语 |
| Model / Harness / Artifact | 第 1 章 `02` | 不要开平行分类法 |
| SPIN / Self-Rewarding / STaR / Self-Instruct / SEAL / LADDER / Absolute Zero / R-Zero | 第 2 章 | 不要把 OPD 公式抄进本库 |
| OPD / MOPD | 链 llm-guide 4.6 | 本库最多一节「不是 RSI」 |
| verification-gated runtime、STOP、Gödel Agent、DGM、技能包自改、ACE playbook、Voyager、Reflexion | 第 3 章（Voyager / Reflexion 已落） | 不要写成 Cursor 产品手册 |
| AlphaEvolve、FunSearch、科研 agent、论文工厂 | 第 4 章 | |
| 融资、访谈、实验室动态 | 第 5 章 | 不要当机制专文 |
| RSIBench、可靠性阶梯、SEAGym、system card RSI | 第 6 章（04 已落） | |

## 质检

一篇算完成，当且仅当能回答：改的是 Model / Harness / Artifact 哪一层、算法步骤或公式、和邻居差在哪、何时失效、至少一条一手来源。文件存在 ≠ 写完。标题下只有一句话 = 不合格。
