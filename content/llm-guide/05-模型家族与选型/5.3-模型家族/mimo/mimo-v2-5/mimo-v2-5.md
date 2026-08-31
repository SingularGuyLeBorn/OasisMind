---
title: "MiMo-V2.5"
category: "模型家族与选型"
tags: ["mimo", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "MiMo-V2.5 全模态输入、长上下文和部署边界。"
---

# MiMo-V2.5

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | MiMo-V2.5 Base / Instruct |
| 证据状态 | 截至 2026-09-01 官方模型卡 |
| 参数 | 310B 总参数、15B 激活 |
| 模态 | 文本、图像、视频、音频输入；文本输出 |
| 许可 | 官方模型卡 MIT |

## 定位与相对变化

V2.5 继承 V2-Flash 的稀疏 MoE/混合注意力语言骨干，加入独立视觉与音频编码器，并把指令版本上下文扩展到 1M。

## 已披露事实

- Base 模型卡为 256K，Instruct 为最长 1M，不能混写。
- 官方卡披露 729M ViT、261M Audio Transformer 和三层 MTP。

## 未披露与证据边界

- “全模态”描述输入理解范围，官方卡的主要生成输出仍是文本。
- 1M 支持不代表所有任务在窗口末端等质；视频/音频预处理和显存需实测。

## 部署与选型

需要多模态理解或超长上下文时选 V2.5；部署固定 model revision，审阅 `trust_remote_code`，并以真实媒体长度测内存与延迟。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/mimo/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/mimo/。

## 一手来源

- [MiMo-V2.5 官方模型卡](https://huggingface.co/XiaomiMiMo/MiMo-V2.5)
- [XiaomiMiMo 官方模型集合](https://huggingface.co/XiaomiMiMo/models)

[← 返回 MiMo 家族](../mimo.md)
