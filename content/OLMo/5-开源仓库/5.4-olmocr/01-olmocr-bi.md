---
title: "01 · olmOCR 官方文档对照译稿"
category: "开源仓库"
tags: ["OLMo", "olmOCR", "对照译稿", "PDF OCR"]
published: true
excerpt: "固定到提交 f7cfe4c 的 olmOCR README 项目说明、安装、使用、远程推理与 benchmark 文档对照。"
---

# olmOCR 官方文档对照译稿

对照原文来自本地官方快照 `data/sources/olmocr/repo`，固定提交为 `f7cfe4c22098b154c76b6ec950d1c0a464eecf8d`。内容覆盖 README 从项目介绍至远程 inference server 使用章节，以及安装与 overview 文档的对应正文；benchmark 表保留类别、版本与总体结论。

## 项目介绍

> A toolkit for converting PDFs and other image-based document formats into clean, readable, plain text format.

olmOCR 是把 PDF 和其他图像型文档格式转换为干净、可读纯文本的工具。官方提供在线 demo。

> Features

功能包括：把 PDF、PNG 和 JPEG 文档转为干净 Markdown；支持公式、表格、手写与复杂排版；自动移除页眉页脚；即使存在图片、多栏和嵌套区域也按自然阅读顺序输出；官方估算每百万页成本低于 200 美元。它基于 7B 视觉语言模型，因此需要 GPU。

## News

2025-10-21 的 v0.4.0 发布 olmOCR-2 FP8 模型，官方称以合成数据和 RL 让 bench 提高约 4 分。2025-08-13 的 v0.3.0 修复自动旋转检测与空白文档幻觉。v0.2.1 使用 FP8 提速并减少重试；v0.2.0 整理训练代码；v0.1.75 从 sglang 切换到 vLLM 并更新 CUDA 12.8 镜像；更早版本加入 Docker、benchmark、prompt bug 修复和温度选择改进。

## Benchmark

> We ship a comprehensive benchmark suite covering over 7,000 test cases across 1,400 documents.

olmOCR-Bench 包含 1,400 份文档、7,000 多个测试用例，覆盖 arXiv、旧扫描数学、表格、旧扫描、页眉页脚、多栏、长小字与基础类别。README 中 v0.4.0 总体分数为 `82.4±1.1`；第三方系统数字绑定表中版本与运行说明，不能脱离该提交视为实时排名。

## Installation

> You will need to install poppler-utils and additional fonts for rendering PDF images.

PDF 渲染需要 poppler-utils 和附加字体。Ubuntu/Debian 示例安装 `ttf-mscorefonts-installer`、Crosextra、Ghostscript 字体与 lcdf-typetools。Python 依赖较难与已有环境共存，官方建议新建 Python 3.11 conda 环境。

远程 vLLM server 使用基础包 `pip install olmocr`，可避免安装 PyTorch 等大型 GPU 依赖。本地 GPU 推理要求近期 NVIDIA GPU，官方测试 RTX 4090、L40S、A100、H100，至少 12GB 显存和 30GB 磁盘；安装 `olmocr[gpu]` 与 CUDA 12.8 PyTorch index，并建议安装指定 FlashInfer wheel。

Beaker 集群安装 `olmocr[beaker]`，benchmark 安装 `olmocr[bench]`；extra 可组合。遇到 `too many open files` 可提高 `ulimit -n 65536`。

## Usage Examples

```bash
curl -o olmocr-sample.pdf https://olmocr.allenai.org/papers/olmocr_3pg_sample.pdf
olmocr ./localworkspace --markdown --pdfs olmocr-sample.pdf
olmocr ./localworkspace --markdown --pdfs random_page.png
olmocr ./localworkspace --markdown --pdfs tests/gnarly_pdfs/*.pdf
```

第一条下载样例；随后分别转换单 PDF、单图片和多个 PDF。远程 server 示例：

```bash
olmocr ./localworkspace \
  --server http://remote-server:8000/v1 \
  --model allenai/olmOCR-2-7B-1025-FP8 \
  --markdown --pdfs '*.pdf'
```

`--markdown` 把结果写到 workspace 的 `markdown/`。也可用 `python -m olmocr.pipeline`。workspace 同时保存 Dolma 格式和 Markdown；前者保留结构化文档记录，后者便于直接查看。

## External Server

> If you have a vLLM server or any inference platform implementing the OpenAI API, point olmOCR to it instead of spawning a local instance.

已有 vLLM 或兼容 OpenAI API 的推理平台时，可用 `--server` 指向远程服务。轻量安装不含 GPU 依赖。远程模式仍必须明确 `--model`，服务端模型、tokenizer 和采样参数需与客户端预期一致；“兼容 API”只说明协议形状，不保证输出数值一致。

## 输出和使用边界

输出 Markdown 旨在保持阅读顺序、公式和表格，但并非 PDF 的无损结构表示。扫描质量、字体、旋转、空白页和复杂嵌套会影响结果。费用描述取决于硬件、吞吐、重试率和云价格。README 的版本新闻是发布时陈述，不替代固定模型卡与 benchmark 配置。
