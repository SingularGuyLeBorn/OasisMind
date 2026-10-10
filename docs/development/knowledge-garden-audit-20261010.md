# 七个专题知识库审计报告

审计日期: 2026-10-10

范围: `Agent`, `DeepSeek`, `RetrievalAugmentedGeneration`, `SparseAttention`, `LongHorizonTask`, `RecursiveSelfImprovement`, `ContinualLearning`.

本报告分两阶段记录. 第一阶段修复公式与 LaTeX 渲染错误, 补充并归一化 tags; 第二阶段按后续授权补齐 RSI 图片, 修复目录结构与标点, 删除 RAG 重复内容, 并重新执行完整发布验收. 第 7 节是最终状态, 若与前文的阶段性记录冲突, 以第 7 节为准.

## 1. 检查方法

1. 对七个知识库运行 `content-check` 的 frontmatter 与 markers 检查.
2. 使用站点真实的 `normalizeMathMarkdown`、`protectMathPipesInMarkdown`、remark-math 与 KaTeX 链解析全部 Markdown, KaTeX 使用 `throwOnError: true`.
3. 检查未进入数学节点的 LaTeX 命令, 区分有意展示的源码和意外漏出的公式.
4. 统计 tags 的空缺、大小写别名、语言混用、页面标题充当 tag 和一次性 tag.
5. 重新运行生产站构建与公开导出验收, 确认 frontmatter 能被实际发布链读取.

## 2. 公式审计与修复

### 2.1 修复前

七个知识库共检出 15 个确定的 KaTeX 解析错误, 另有 1 处应明确标记为 LaTeX 源码的模型回答, 以及 1 处 frontmatter 中的公式转义错误.

| 知识库 | 解析错误 | 根因 |
|---|---:|---|
| DeepSeek | 10 | HTML 实体进入数学环境 5 处; 多余显示公式分隔符 1 处; 缺少一个闭合分隔符后连锁吞入 4 段正文 |
| LongHorizonTask | 5 | 集合括号不配对 3 处; `\right` 被写成控制字符 1 处; `\mathrm` 的上标位置错误 1 处 |
| 其余五库 | 0 | 未发现确定的 KaTeX 解析错误 |

### 2.2 已修复项目

#### DeepSeek

- `DeepSeek-Prover-V1.5` 对照稿中, Lean 示例把 `&lt;` 放进 `$...$`, KaTeX 会把 `&` 当成非法对齐符. 已改为 `\lt`, 并把 Lean 注释的 `-/` 移出数学分隔符. 这一次修复消除了 5 个错误.
- `DeepSeek-V2` 对照稿的式 (40) 前多出一个 `$$`. 结果是式 (40)–(47) 被当作普通文本, 后续英文段落反而进入数学模式. 已删除多余分隔符.
- `CodeI/O` 技术解析的经验损失公式缺少闭合 `$$`. 后续三个正常公式因此交替成为开闭分隔符, 表面上形成 4 个错误. 已在原公式末尾补齐分隔符.
- `DeepSeek-VL` 的样例本来要求模型输出 LaTeX 源码. 已把回答放入 `latex` 代码块, 使“展示源码”成为显式语义, 不再像漏掉数学分隔符.
- `Auxiliary-Loss-Free` 技术解析的 excerpt 在 YAML 双引号中包含 `\mathrm`. YAML 将反斜杠当作转义符, 导致文章在公开站生成时被跳过. 已改用单引号包裹 excerpt, 公式内容不变.

#### LongHorizonTask

- 进度公式的指示函数由 `\mathbf 1\{...}}` 改为 `\mathbf 1\{...\}`.
- 恢复风险公式中的 `\right]` 曾被写成不可见回车字符加 `ight]`. 已恢复为正常 LaTeX 命令.
- 事件集合与可见位置集合的开括号由分组符 `{` 改为集合符 `\{`, 与末尾 `\}` 对齐.
- `\mathrm{pass^}k` 改为 `\mathrm{pass}^k`, 让上标作用在完整的 `pass` 名称上.

### 2.3 修复后结果

| 知识库 | KaTeX 解析错误 | 非预期裸 LaTeX |
|---|---:|---:|
| Agent | 0 | 0 |
| DeepSeek | 0 | 0 |
| RetrievalAugmentedGeneration | 0 | 0 |
| SparseAttention | 0 | 0 |
| LongHorizonTask | 0 | 0 |
| RecursiveSelfImprovement | 0 | 0 |
| ContinualLearning | 0 | 0 |

这里的 0 表示“当前渲染链能够完整解析”, 不代表报告逐项重新证明了每一个数学结论. 数学含义仍以原论文、符号定义和上下文为准.

## 3. Tags 审计与调整

### 3.1 调整原则

- 每个专题库保留一个稳定的库级 tag, 例如 `Agent`, `RAG`, `Sparse Attention`, `Long-Horizon Agent`, `RSI`, `Continual Learning`.
- 方法名、模型名和 benchmark 名保留, 不因只出现一次就删除.
- 合并纯大小写、连字符和中英文造成的重复 tag.
- 删除没有检索意义的 `learning-path`, 以及直接照抄整页标题的 tag.
- 不把 category 改写成 tags, 也不为了凑数量给每页制造新词.

### 3.2 调整结果

| 知识库 | 修改页数 | 调整前唯一 tags | 调整后唯一 tags | 结果 |
|---|---:|---:|---:|---|
| Agent | 22 | 55 | 55 | 为缺少库级标识的页面补 `Agent`; 原有方法标签保留 |
| DeepSeek | 4 | 72 | 74 | 首页补模型、架构、基础设施入口标签; `双语对照` 统一为 `对照译稿` |
| RetrievalAugmentedGeneration | 8 | 49 | 45 | 所有文章统一含 `RAG`; Grounding、Citation、Abstention 等与现有中文标签合并 |
| SparseAttention | 33 | 5 | 40 | 32 个空标签页降为 0; 按章节补“动态稀疏、KV Cache、稀疏训练、稀疏内核、评测”等稳定标签, 同时保留 NSA、DSA、Quest 等方法名 |
| LongHorizonTask | 32 | 43 | 35 | 合并 `long-horizon`/`agent` 等写法, 删除整页标题式标签, 改用任务结构、上下文压缩、状态机、验证、轨迹等路线标签 |
| RecursiveSelfImprovement | 2 | 123 | 124 | 首页补库级标签, `评估器` 统一为 `评判标准`; 一篇已有未提交编辑的多行 frontmatter 保持不动 |
| ContinualLearning | 30 | 132 | 114 | 合并 EWC/ewc、CoTTA/cotta、fast-weights/fast weights、TTT layers/ttt-layers 等别名; 所有页面统一含 `Continual Learning` |

唯一 tag 数量不是越少越好. SparseAttention 从 5 增到 40 是补齐原先缺失的主题索引; ContinualLearning 从 132 降到 114 是合并同一概念的多种拼法. RSI 中论文、系统和 benchmark 专名较多, 因此本轮没有按频次粗暴删减.

## 4. 更新后的评分

评分仍沿用首次审计的 100 分权重. 本轮只重新计算直接受到公式和 tags 修复影响的项目, 没有因为未改内容而额外提分.

| 知识库 | 修复前 | 当前 | 变化原因 |
|---|---:|---:|---|
| SparseAttention | 84 | **88** | tags 从大面积空缺变为可检索的两级主题体系 |
| RecursiveSelfImprovement | 84 | **84** | 只做最小标签补充, 图像与标签规模问题仍在 |
| ContinualLearning | 80 | **82** | 标签别名明显收敛, 公式保持全绿 |
| DeepSeek | 72 | **77** | 公式全部可渲染, 被跳过的文章恢复可发布, 标签略有改善 |
| LongHorizonTask | 71 | **77** | 5 个公式错误清零, 路线标签替代页面标题式标签 |
| RetrievalAugmentedGeneration | 70 | **71** | RAG 基础标签与中英文别名统一 |
| Agent | 65 | **66** | 页面统一获得 `Agent` 库级标签 |

## 5. 第一阶段保留的问题

### 5.1 目录结构

- Agent: 24 处 tree 问题, 主要是二级文章裸放在一级目录.
- DeepSeek: 84 处 tree 问题, 主要是二级目录缺少同名首页与三级叶子.
- RetrievalAugmentedGeneration: 15 处 tree 问题, 第 2–6 章仍使用旧式二级裸文件.
- SparseAttention、LongHorizonTask、RecursiveSelfImprovement、ContinualLearning: tree 检查通过.

### 5.2 内容与表达

- Agent 的来源密度低、无正式图片、全角标点和弯引号较多.
- DeepSeek 的对照译稿存在编辑式元评论; 与 `model-library` 有平行维护面.
- RetrievalAugmentedGeneration 检出较多跨页完全重复段落.
- SparseAttention 的个别口语表达与技术语域差异较大.
- LongHorizonTask 缺少机制图, 部分中间首页偏薄.
- RecursiveSelfImprovement 与 ContinualLearning 的图片偏少, tags 仍包含大量合理但低频的论文和方法专名.

### 5.3 已知内容损坏

`DeepSeek-V2` 对照稿第 223 行曾含字面量 `…23654 tokens truncated…9}`. 第一阶段只删除了它造成公式错位的多余 `$$`; 第二阶段已根据原始论文恢复缺失正文, 因此该项不再是遗留问题.

## 6. 验收结果

- 七个知识库 `frontmatter`: 全部通过.
- 七个知识库 `markers`: 全部通过.
- 实际 Markdown→KaTeX 链: 15 个错误降为 0, 非预期裸 LaTeX 降为 0.
- tags 归一化脚本二次运行为 0 变更, 说明处理结果幂等.
- Markdown 包测试通过: 3 个测试文件、11 个测试全部通过.
- 生产站构建通过: 22 个知识库、1618 篇文章、3832 个静态页面完成生成.
- 公开导出验收通过: 13 个 HTTP 契约全部通过; 此前因 YAML 转义而漏出的 `Auxiliary-Loss-Free` 技术解析已进入公开索引.

本报告记录的是 2026-10-10 工作区内容状态. 工作区中原有的图片删除、Office 页面改动及其他未提交文件不属于本轮施工范围, 没有纳入提交.

## 7. 第二阶段修复与最终状态

### 7.1 施工边界

第二阶段只处理用户明确授权的内容:

- 为 `RecursiveSelfImprovement` 补充解释性图片.
- 按审计建议修复 `SparseAttention` 的技术语气与标点.
- 将 DeepSeek 库名统一为 `DeepSeek 全栈技术图谱`, 并修复目录层级.
- 修复 Agent 与 RAG 的目录结构; 其余四库原本已通过结构检查, 不做无意义改造.
- 删除 RAG 跨页完全重复段落, 不借去重之名改写不同观点.
- 修复七库已发现的公式、数学分隔符、公式表格渲染与中文技术正文标点.

没有把“软性 AI 味”告警机械清零, 也没有为了提分重写正文. 论文原文、代码、命令、链接、数学环境和 OCR 示例中的必要符号保持原样.

### 7.2 RSI 图片

新增三张机制图, 分别承担不同解释任务:

| 图片 | 放置位置 | 解释重点 |
|---|---|---|
| RSI 状态更新循环 | 知识库首页 | 候选改进、评测、接受门控与状态更新的全局闭环 |
| 证据边界与接受门控 | `1.1.3-证据接受与控制` | 哪些证据能进入状态, 哪些只能作为待验证候选 |
| 评测与安全治理循环 | `5.2-评测与安全治理` | 能力评测、安全阈值、回滚与持续监测之间的关系 |

三张图都补有中文图注和紧邻正文的解读, 不是装饰图. 图片文件分别位于库首页、`1.1` 与 `5.2` 对应目录的 `images/` 中.

### 7.3 目录结构

| 知识库 | 修复前 | 修复后 | 处理方式 |
|---|---:|---:|---|
| Agent | 24 处 tree 问题 | 0 | 8 章统一为“一级首页 → 二级路线首页 → 三级叶子” |
| DeepSeek | 84 处 tree 问题 | 0 | 42 个二级主题补同名首页, 原技术解析与对照稿下沉为三级叶子 |
| RetrievalAugmentedGeneration | 15 处 tree 问题 | 0 | 第 2–6 章统一为二级路线首页与三级主题页 |
| SparseAttention | 0 | 0 | 原结构保留 |
| LongHorizonTask | 0 | 0 | 原结构保留 |
| RecursiveSelfImprovement | 0 | 0 | 原结构保留 |
| ContinualLearning | 0 | 0 | 原结构保留 |

DeepSeek 的展示名由口号式命名改为 `DeepSeek 全栈技术图谱`. 路径标识 `DeepSeek` 保持不变, 避免制造无意义的外链迁移.

### 7.4 RAG 去重

去重前检测到 71 组跨文件完全重复段落, 共删除 72 个冗余出现位置. 归属规则如下:

- 语料切分、索引与版本生命周期留在语料章节.
- BM25、ANN、RRF、重排与证据选择留在检索章节.
- Self-RAG 的控制逻辑留在自适应检索章节.
- RAFT 与联合训练留在训练章节.
- 发布、安全与可观测性留在生产治理章节.

去重后二次扫描结果为 0 组完全重复段落. 同一概念在导读与专题页承担不同叙事功能时予以保留, 没有把必要的章节导语误删.

### 7.5 公式、标点与发布链

除第一阶段已修复的 15 个 KaTeX 解析错误外, 第二阶段继续修复了表格单元格中的公式管道符、摘要裸公式、数学分隔符与损坏稿发布拦截. 标点统一覆盖 Agent、DeepSeek、RAG、LongHorizonTask、RSI 与 ContinualLearning; SparseAttention 已在独立修复中完成.

最终验收采用真实公开站链路, 而非只做正则扫描:

| 验收项 | 最终结果 |
|---|---|
| 七库 `tree files links frontmatter markers structure` | 全部通过 |
| Markdown 包测试 | 3 个测试文件、11 个用例通过 |
| 公开站测试 | 9 个测试文件、32 个用例通过 |
| 阅读正文编译 | 1631 篇文章、22 个知识库首页 |
| 公式发布审计 | 1654 个编译文件, KaTeX 错误 0, 裸公式源码 0 |
| Next.js 生产构建 | 3879 个静态页面生成成功 |
| 静态阅读发布 | 3845 页完成整理 |
| 公开导出验收 | 12 个 HTTP 契约通过 |

构建过程中出现的 `⑥⑦⑧` 字体度量警告来自本次七库以外的内容; 七库全文检索没有这些字符, 因而没有越界修改别的知识库.

### 7.6 保留项与判断

- DeepSeek 仍有 3 处缺少图注的既有图片. 用户本轮要求修结构、目录、公式与标点, 因此没有借机补写不在范围内的图片说明.
- “说人话”硬性告警在七库均为 0. 少量软性提示来自技术概念或自然承接句, 机械改写反而会损害准确性, 因此保留.
- 公式验收能证明当前渲染链完整解析且没有源码泄漏; 它不能替代对每篇论文全部数学结论的重新证明. 本轮对确定错误已修复, 对未发现证据的问题不作虚假改动.
- 工作树中原有的图片删除、Office 页面与辅助脚本改动没有纳入上述专题提交.

### 7.7 分主题提交

| 提交 | 内容 |
|---|---|
| `86baf7af9` | RSI 三张机制图 |
| `330bfb2c3` | SparseAttention 技术语气与标点 |
| `25d7590a3` | DeepSeek 名称与目录结构 |
| `69da6f846` | Agent、RAG 目录与 RAG 去重 |
| `93e46c630` | 表格公式渲染与损坏稿发布拦截 |
| `d87276241` | 截断正文恢复、论文公式与失效链接修复 |
| `f20a4d484` | 摘要裸公式修复与发布拦截 |
| `b74c21fe4` | DeepSeek 专库摘要数学分隔符 |
| `059dd1182` | 六库标点与直角引号统一 |
