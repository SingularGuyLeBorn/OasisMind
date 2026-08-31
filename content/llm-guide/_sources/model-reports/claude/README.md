# Claude 隐藏来源说明

> 核验日期：2026-09-01。本目录不是公共阅读入口；它保存旧树中能够作为一手材料快照使用的资产，以及逐文件迁移账本。

## 资产准入规则

只有满足以下条件的旧资产进入本目录：

1. 文件可被正常识别为 PDF 或 HTML；
2. 内容对应 Anthropic 官方论文、模型卡或新闻页面；
3. 文件不是 404 页面、占位页、生成示意图或损坏的重复 PDF；
4. 原文件字节和 SHA-256 已写入 `migration-ledger.tsv`，副本逐项反验一致。

本次保存 10 个可靠来源资产：8 个官方 HTML 快照、2 个官方 PDF，共 31,434,045 字节。网页快照中的 canonical 地址可能因网站改版而不准确，引用时应优先使用公共页所列的当前官方 URL。

## 迁移账本

[`migration-ledger.tsv`](./migration-ledger.tsv) 共 71 行数据，每个旧文件恰好一行，字段为：

| 字段 | 含义 |
|---|---|
| `old_path` | 删除前的仓库相对路径 |
| `new_path` | 隐藏来源或隐藏归档中的唯一副本路径 |
| `classification` | 迁移分类 |
| `bytes` | 原文件字节数 |
| `sha256` | 原文件与副本共同的 SHA-256 |

账本总计 71 个唯一旧路径、71 个唯一新路径、63,368,911 字节。删除旧树前已同时验证旧文件、账本值与新副本三方一致。

## 分类汇总

| 分类 | 文件数 | 字节 |
|---|---:|---:|
| `official-html-snapshot` | 8 | 1,104,367 |
| `official-pdf` | 2 | 30,329,678 |
| `legacy-markdown` | 47 | 354,828 |
| `invalid-or-stale-html` | 4 | 238,026 |
| `placeholder-html` | 7 | 7,043 |
| `damaged-duplicate-pdf` | 2 | 30,068,160 |
| `legacy-generated-image` | 1 | 1,266,809 |

后五类保存在 `_archive/model-knowledge/claude/`，不能作为事实证据直接引用。
