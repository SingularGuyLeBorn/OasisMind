---
title: "Llama 历史模型知识归档说明"
category: "内部归档"
tags: ["llama", "归档", "历史材料"]
published: false
as_of: "2026-09-01"
excerpt: "Llama 旧二次解读、重复索引、未经充分支持的工程推断及误置 Muse Spark 的归档边界。"
---

# Llama 历史模型知识归档说明

本目录保存退出公共技术树的二次架构解读、重复导航、部署估算、历史讨论稿，以及旧 Llama 目录误收的 Muse Spark 材料。可核验的公开正本见：`05-模型家族与选型/5.3-模型家族/llama/`。

## 保全与处置边界

- 旧第 14 章的 20 篇 Markdown 与 3 张 Muse Spark 专属图片完整迁入 `legacy-ch14/`；没有删除旧知识正文或附件。
- 旧第 5 章两棵平行树合计 14 篇 Markdown、125 张图片：`04-LLaMA-3.1/` 的 1 篇重复稿进入 `legacy-ch5/04-LLaMA-3.1/`；`5.3-国外大模型/Meta-Llama/` 中 1 篇官方报告选择性翻译与 21 张报告图进入来源区，其余 12 篇二次稿与 104 张专属图片进入 `legacy-ch5/Meta-Llama/`。迁移前散列、LFS OID/size 与逐篇处置理由见独立账本。
- Llama 1/2/3 的精译、MinerU/OCR、论文 PDF 与论文附图另入 `_sources/model-reports/llama/`；二次剖析中未由论文逐项支持的训练、集群、性能或竞品推断不回填公开页。
- 旧“Llama 3 技术报告”实际指 arXiv:2407.21783，与 Llama 3.1/405B 同期；公开页已把 2024 年 4 月 Llama 3 和 7 月 Llama 3.1 分开。
- 旧 `01-Llama-4技术报告精译.md` 不是正式技术报告译文。Meta 只发布公告、模型卡、参考实现和许可，因此该文与架构二次稿一并归档。
- Muse Spark 是 Meta 的独立产品线，不是 Llama 版本；材料保留但不出现在 Llama 谱系。

## 使用纪律

归档默认未校勘，不参与公共课程导航。任何参数、模态、上下文、许可、发布状态和评测结论都应先回公开身份页，再核对所列一手来源。

## 迁移账本

- [旧第 14 章迁移账本](./MIGRATION-LEDGER.md)
- [旧第 5 章 LLaMA 3.1 平行树迁移账本](./MIGRATION-LEDGER-LEGACY-CH5.md)
