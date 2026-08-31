# OpenAI 一手材料保全区

本目录保存旧第 14 章中经文件头和正文核对、可识别为 OpenAI 官方论文、系统卡或官方网页快照的原字节材料。它们是证据快照，不是第二套公开知识正文。

## 读取规则

- 文件名后缀不一定可信：少数 `.pdf` 实际是完整 HTML 网页快照；保留原名是为了维持逐字节哈希。
- `old14/08-GPT-4-Turbo/pdfs/GPT-4-Turbo.pdf` 的内容是 GPT-4 技术报告，不是 GPT-4 Turbo 架构论文。
- o1 系统卡在多个旧版本目录中重复保存；每份原字节都保留并在迁移账本中独立登记。
- HTML 快照只能证明保存时页面内容；当前 API 规格以 `developers.openai.com` 的实时模型页为准。
- 本区不接收旧作者解读、第三方图片、Cloudflare/404 页面或占位文件；这些进入 `_archive/model-knowledge/openai/`。

## 可识别材料

| 主题 | 材料类型 |
|---|---|
| GPT-1、GPT-2、GPT-3、InstructGPT | 原论文 PDF；GPT-1/2 另有官方网页快照 |
| ChatGPT / GPT-3.5 | 官方产品/API 网页快照 |
| GPT-4 / Vision / Turbo | GPT-4 技术报告与官方网页快照；Turbo 目录中的 PDF 按实际内容标注 |
| GPT-4o / GPT-4o mini | 系统卡 PDF与官方网页快照 |
| o1 / o3 / o4-mini | 系统卡 PDF与官方网页快照；保留旧目录的重复字节记录 |
| Operator / GPT-4.5 | 官方网页快照 |

逐文件旧路径、新路径、动作、字节数和 SHA-256 见 `_archive/model-knowledge/openai/MIGRATION-LEDGER.md`。
