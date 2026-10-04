---
name: paper-pipeline
description: 把一篇论文或技术报告做成见微的对照译稿 (bi) 与技术解析 (analysis) 的端到端流程: 下载 PDF, MinerU 转换, 分段并行翻译, 社区资料调研 (知乎, 博客, 代码) 存档, 写解析, 检查, 清理, 提交. 用于模型库, 源神启动! DeepSeek 库或任何「论文 → bi + analysis」任务, 用户提到 下载论文, mineru, 翻译论文, 写解析, bi, analysis, 技术报告时使用.
---

# 论文流水线 (PDF → bi + analysis)

写作规范以 `docs/writing-spec.md` 为准 (§1-§4 术语, 标点, 禁用词; §6 bi; §7 analysis), 模型库细则见 `docs/development/model-library-writing-plan.md`. 本 skill 只规定流程和每一步的交付物.

## 0. 落点

一篇论文一个目录 `<garden>/<章>/<slug>/`, 最终只留:

```
<slug>/
├── <slug>-bi.md          逐段对照译稿
├── <slug>-analysis.md    技术解析
└── images/               MinerU 抽出的图
```

PDF 和英文 MinerU 稿 `<slug>.md` 在提交前删掉. 社区资料与代码放 `data/sources/<slug>/` (gitignore, 本地留存, 不入库).

slug 用小写英文与连字符, 目录名不含全角字符与空格.

## 1. 下载与转换

先用 `export.arxiv.org/api/query?id_list=<id>` 核对标题与作者单位, 再一条命令完成下载, 转换, 重建:

```powershell
python scripts/paper-ingest.py <arxiv-id | pdf 路径 | URL> <garden>/<章>/<slug>
```

- 脚本从 MinerU 的 `structured_content.json` 重建正文 (`markdown.md` 在 Windows 上丢符号), 每页前插 `<!-- page k of N -->`, 图片按图号改名放进 `images/`. PDF 留在 `D:/tmp/papers/<slug>/`, 不进 content.
- 转换后核对: 页数等于 PDF 页数, 公式是 `$...$`, 表格没丢. 脚本输出 `BAD IMAGE` 的图要重新抽.
- 有官方代码仓库的, 下载到 `data/sources/<slug>/<repo>/`, 解析里引用写 GitHub 链接, 不写本地路径.

## 2. 社区调研 (写 analysis 之前必做)

解析不能只靠预训练知识. 至少找 5 份独立来源, 存进 `data/sources/<slug>/community/`:

| 来源 | 找什么 |
|---|---|
| 知乎 (搜论文名, 方法名, 「解读」) | 推导细节, 复现踩坑, 质疑 |
| 英文博客 / Hugging Face blog / X 长帖 | 机制图解, 与同类方法的对比 |
| GitHub issue / PR / 复现仓库 | 论文没写的实现细节, 实测数字 |
| 作者演讲, 官方博客, 后续论文 | 作者自己的补充与更正 |

- 每份存成 `<序号>-<来源>-<短题>.md`, 文件头写 URL, 作者, 日期, 再写 3-5 条要点 (用自己的话). 原文全文可另存 `.html`, 只作留档.
- **不引用, 不抄**: 解析里不出现社区文章的句子, 段落结构和图. 社区资料只用来发现问题 (哪里难懂, 哪里有争议, 哪个数字对不上), 结论必须回到论文的式, 表, 图或代码去验证后再写.
- 社区说法与论文冲突, 以论文和代码为准; 论文自己前后矛盾的, 在解析里写明是哪两处.
- 参考文献节可以列对写作有实质帮助的社区文章链接 (标题 + URL), 不列转述性文章.

## 3. 分段并行翻译 bi

源文超过约 30 页就按页切成若干段 `src-<n>.md` (按 `## ` 节边界切, 不切断表格和公式), 每段交给一个子代理, 写 `bi-<n>.md`, 最后按序合并成 `<slug>-bi.md`.

- 逐段对照: 英文原段保留, 中文意译紧跟其后. 段落不合并不删, 不是摘要.
- 必须翻: 正文, 附录正文, 脚注. 不翻: References, 作者单位, 图表题注, 目录, 代码, 表格, 公式.
- 页标记原样保留, 一个不少, 顺序不变; 跨页断句的译文放在最后一个断片之后.
- 标题保留英文, 中文写同一行: `## 3.2 Load Balancing · 负载均衡`.
- 疑惑块: 难懂, 有歧义, 看不懂的机制处插入, 每 30 页约 4 个, 只写技术题. 标签轮换: 想, 看表, 拆开, 问, 核对, 确认, 再看, 对一下, 回看, 停一下.

```
> **核对:** 问题 (一句, 指向具体式号/表号/节号).
> 答: 推断与验证路径, 落回本文的式, 表, 图或代码. 文中和代码都没有的, 写「文中没有给出, 以下只是从已知数字推出的说法, 没有数据验证」.
```

禁止在疑惑块里拿图片内容, OCR 残字, 文件名, 排版充数.

合并后检查: `python scripts/scan-untranslated.py <家族目录>` 无缺口; 页标记数等于 PDF 页数.

## 4. 写 analysis

- frontmatter: `title` (中文为主的描述性标题), `category`, `tags`, `published: true`, `excerpt` (一两句完整句, 符号带 `$`).
- 结构: 篇名 `#` 不编号; `## 1.` 大段 3-5 个 (最多 6, 参考文献不计), `### 1.1.` 每个 `##` 至少两个, 每个 `###` 至少两段; 列表最多 5 项. 开头一段写来源 (论文, 日期, 机构, 代码链接).
- 内容: 每个机制讲到能复述: 解决哪项成本, 怎么做, 代价, 实测数字及口径 (哪张表, 什么设置). 公式按项写开; 消融写清改了哪个量. 能链接 llm-guide 已有推导的就链接, 不重推 (先确认文件存在).
- 篇幅: 5000-15000 汉字, 讲完为止, 不灌水. 超过 10000 字可在开头写 3-5 句的「太长不看版」.
- 图: `![](images/<文件名>)` 后紧跟「图 N 解析」, 只引真实存在的图.
- 禁止: 比喻, 元评论 (「本篇」「先看」「源文 §x 说」), 面试腔, 「纯猜」「(推断)」「(估算)」「TODO」「待补」这类标记 (content-check 会拦). 拿不准的数写「文中没有给出」并说明推算路径.

## 5. 检查 (全过才进下一步)

`<store>` 是 agent store 里的检查脚本目录 (structure_check.py, scan.py, check_math.py).

```powershell
python <store>/structure_check.py <slug>-analysis.md   # 结构全 0
python <store>/scan.py <slug>-bi.md <slug>-analysis.md # 禁用词 0, 全角标点 0
python <store>/check_math.py <slug>-analysis.md        # 汉字数, 未包 $ 的符号
node scripts/content-check.mjs                          # 文件, 链接, frontmatter, 标记
```

## 6. 清理与提交

1. 删英文源文 `<slug>.md` 与 `src-*.md` / `bi-*.md` 中间件; 目录里不能有 PDF.
2. 按路径 `git add <目录>`, 提交 `content(<scope>): <中文摘要>`, 正文写 why. 一篇一提交, 不堆.
3. 提交后校验图片: `git lfs ls-files -n -- <目录>` 每个都在, 抽查工作区图片文件头是 JPEG/PNG 魔数, 不是指针文本也不是全零.

## 并行编排

多篇论文时, 主代理只做下载, 转换, 切段, 合并, 检查, 提交; 翻译段与 analysis 交给后台子代理 (每个子代理一份 brief: 源文路径, 输出路径, 本 skill §3 或 §4, 样板文件). analysis 子代理同时负责 §2 调研. 子代理只写自己的输出文件, 不跑 git.
