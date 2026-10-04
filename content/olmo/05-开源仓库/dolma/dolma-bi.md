---
title: "Dolma Toolkit 官方文档对照译稿"
category: "开源仓库"
tags: ["OLMo", "Dolma", "对照译稿", "数据工程"]
published: true
excerpt: "固定到提交 669f534 的 Dolma README、数据格式、去重与 Mixer 关键公开文档逐段英中对照。"
---

# Dolma Toolkit 官方文档对照译稿

本文只使用本地官方快照 `data/sources/dolma/repo`，提交 `669f534823b08d266a8fff01f8a1c916a5a56576`。对照范围为 `README.md` 全部说明正文、`docs/data-format.md` 全文，以及 `docs/deduplication.md` 与 `docs/mixer.md` 的介绍、配置和参数说明。代码、键名和路径保留原文；参数表按含义逐项译出。

## README.md

> Dolma is two things: Dolma Dataset and Dolma Toolkit.

Dolma 指两样东西：其一是 Dolma Dataset，它由网页、学术出版物、代码、书籍和百科材料混合而成，规模为三万亿 token；其二是 Dolma Toolkit，即用于整理语言模型数据集的高性能工具，本仓库保存其源码。

> Dolma was created as a training corpus for OLMo.

Dolma 数据集作为 Ai2 的 OLMo 语言模型训练语料而创建，可从 Hugging Face 的 `allenai/dolma` 下载。数据集按 ODC-BY 许可；公告与 datasheet 提供更多背景。

> This repository houses the Dolma Toolkit, which enables curation of large datasets for (pre)-training ML models.

本仓库的 Toolkit 用于整理机器学习模型预训练数据。它的关键特性是：内置并行，可并发处理数十亿文档；可在单机、集群或云环境运行；自带 Gopher、C4、OpenWebText 等常用整理规则；以 Rust Bloom filter 快速去重；支持自定义 tagger 和 S3 兼容路径。

```bash
pip install dolma
```

> To learn more, visit the documentation. If you use the dataset or toolkit, cite the Dolma paper.

进一步用法见仓库 `docs/`。使用数据集或工具包时，应引用 2024 年论文《Dolma: An Open Corpus of Three Trillion Tokens for Language Model Pretraining Research》（arXiv:2402.00159）。

## data-format.md：Data Format

> We explain the data format for datasets processed by Dolma toolkit.

本文档说明 Dolma Toolkit 所处理数据集的格式。

### Directory Structure

> All components can read arbitrary local and S3 locations, but we recommend a directory structure.

所有组件都能从任意本地或 S3 位置读取，不过官方建议把原始文档放在 `dataset-name/documents/`，把派生属性放在 `dataset-name/attributes/<attribute-name>/`。`documents` 下的内部目录由用户决定；每个文件是 gzip 压缩 JSONL，每行一个文档。tagger 与 deduper 的输出保持原目录结构，属性文件与对应文档文件含相同文档。

### Dolma Document Format

```yaml
{
  "id": "...",       # 必填：来源内部标识
  "text": "foo",     # 必填：文档文本
  "source": "...",   # 必填：数据来源
  "added": "...",    # 可选：Ai2 获得数据的时间
  "created": "...",  # 可选：原文创建时间或估计
  "metadata": {...}   # 可选：来源特有元数据
}
```

> The id field is very important.

`id` 很重要，因为每个版本中的每篇文档都要能追溯到原始来源，也要能维护用于评测规避、删除请求和人工检查的 blocklist。ID 应跨数据集版本稳定。它只需在同一个 `source` 内唯一；例如 `(c4, 123)` 与 `(github, 123)` 仍能区分，但同一来源不能有两个相同 ID。

> The metadata field is a free-for-all field containing source-specific information.

`metadata` 可保存来源特有信息，例如 The Stack 的代码许可或 Semantic Scholar 的论文 ID。应尽可能保留 DOI、arXiv、ACL、PubMed 等原始标识。

### Dolma Toolkit Attributes Format

> We store documents separately from attributes so that updating a classifier does not duplicate the dataset.

为避免每次更新毒性分类器都复制整份数据，文档与派生属性分开保存。属性行含 `source`、`id` 和 `attributes` 字典，前两者唯一定位文档。Mixer 会把多个属性字典合并。

属性 JSONL 必须与对应文档 JSONL 行数完全相同、顺序完全一致。语言识别等 span 属性使用 `[start, end, score]`，可对每个段落记录分数。设计思想是缓存对问题文本区间的信号，随后只改 Mixer 配置与阈值就能构建不同数据版本，而无需反复运行分类器。

## deduplication.md：Deduplication

> The `dedupe` command deduplicates documents at the attribute or paragraph level using a Bloom filter.

`dolma dedupe` 用 Bloom filter 在文档或段落层去重。它与 tagger 一样生成对应输入文件的属性文件：属性可以表示整篇文档是否重复，也可标出重复段落的文本区间。Bloom filter 位于内存，存在误报可能。删除重复文档或段落要在后续 `dolma mix` 中完成。

参数含义如下：`documents` 是本地或 S3 兼容输入，可含一个通配符；`work_dir.input/output` 是本地临时目录；`dedupe.name` 决定属性输出名；文档级用 JSON path 指定 `dedupe.documents.key` 和属性名；段落级用 `dedupe.paragraphs.attribute_name`，按换行切段。n-gram 模式可设长度、stride 和匹配比例阈值，默认阈值 1.0。还可跳过空值并设置最小长度、最小 Unicode word 数。

Bloom filter 可指定文件；启动时若存在就加载，完成后保存。容量可直接以字节指定，或以预计文档数加目标误报率计算，两种方式互斥。`read_only` 用于只查询预计算 blocklist 或对测试数据做污染检查。`processes` 控制进程数，`dryrun` 只打印配置。高并发时可能需要：

```shell
ulimit -n 65536
```

## mixer.md：Dolma Mixer

> `dolma mix` combines data from multiple sources into a unified output, merges named attributes, applies filters, and substitutes configured spans.

`dolma mix` 把多个 Dolma 格式来源合成统一输出，合并指定属性、应用过滤器，并替换配置的文本 span。

`streams` 列出一个或多个流。每个流必须有输出名前缀 `name`、输入 `documents` 和输出 `output.path`；输入支持本地或 S3 兼容路径及单个通配符。`attributes` 指定要合并的属性名，工具通过把路径中的 `documents` 替换为 `attributes/<attribute_name>` 来寻找对应文件。

`output.max_size_in_bytes` 控制合并后单文件最大大小，`discard_fields` 删除顶层字段。`filter.include` 与 `filter.exclude` 使用 JSONPath：文档须匹配任一 include（或没有 include）且不能匹配任何 exclude 才保留。

`span_replacement` 包含若干替换规则。`span` 是指向 `[start,end,score]` 数组属性的 JSONPath；低于 `min_score` 的区间不替换；`replacement` 定义替换文本，`{}` 表示原文，也支持以 `$` 开头的 jq selector。若字面内容以 `$` 开头而不想启用 selector，需要转义。

Mixer 同样支持本地输入、输出 scratch 目录，未指定时会创建并在完成后删除；`processes` 默认 1；`dryrun` 只展示配置而不执行。

## 译校边界

以上文档描述接口与推荐格式，不代表三万亿 token 数据集本身完整包含在仓库，也不证明任意 S3 实现都有相同一致性。Bloom filter 明确允许误报；属性按行对齐是硬契约，不是通过 `id` 自动 join。具体数据版本、过滤阈值和来源许可必须在实际配置与 datasheet 中另行核验。
