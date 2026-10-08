# 重点知识库目录重新验收

当前范围以 knowledge-base-figure-goal.md 为准. 此记录只验收目录, 不证明正文、配图或站内导出全部完成.

## 当前结果

执行 `node scripts/content-check.mjs tree --garden=<目录名>`:

| 目录 | 目录树结果 |
| --- | --- |
| DiffusionLanguageModels | 通过 |
| SparseAttention | 通过 |
| OnPolicyDistillation | 通过 |
| LongHorizonTask | 通过 |
| RecursiveSelfImprovement | 通过 |
| ReinforcementLearning | 通过 |
| ContinualLearning | 通过 |
| LLMInfrastructure | 通过 |
| RetrievalAugmentedGeneration | 15处问题 |
| Agent | 24处问题 |

十个顶级目录均实际存在, 大小写与目标名称一致. 对 apps/site、config、scripts 中非JSON、非map、非lock文件搜索 sparse-attention、longhorizon、diffusion-llm、content/opd、content/rsi 没有匹配;此搜索不覆盖全部旧名、JSON配置或历史文档, 不能证明所有站内路径已统一.

## 尚需修复的组织结构

第二个切片完整读取最小基线正文, 将原1–4节保留为1.2同名目录首页, 因子实验、反事实重放与误差预算移入1.2.1-对照实验与误差预算, 并更新章首页链接. 详细内容保留, 首章已不再出现目录树错误;全库仍有15处目录问题, 集中在第2–6章. 本次只验收目录拆分、链接与公式渲染, 正文科学审查和配图验收仍待继续.

首个修复切片完整读取任务契约正文, 将原1–4节保留为1.1同名目录首页, 原第5节及其后的支持、决策、快照内容移入1.1.1-证据支持与任务决策, 原文保留且不复制. 更新一级首页入口. 内容检查全部通过, 当前RAG目录问题由18减少为16;其余路线和Agent仍待分库处理. 原两篇联合读取输出发生截断, 重新单独完整读取任务契约后才处理该篇, 最小基线未在此切片修改. 该目录迁移不代表两页科学内容或配图最终验收完成.

RetrievalAugmentedGeneration的六个一级章节各有两个二级直接叶子, 共12个 TREE_L2_FILE;六个一级目录同时报 TREE_NO_ROUTE. Agent的八个一级章节也各有两个二级直接叶子, 共16个 TREE_L2_FILE与八个 TREE_NO_ROUTE.

修复需保留现有正文, 按主题建立同名二级目录与首页, 将详细正文组织为三级主题, 同步全仓引用及资源相对路径. 检查器同时要求二级目录至少有一个三级主题, 因而只把旧文件移动为二级首页不足以满足组织要求. 分库处理并检查实际正文分工, 不生成空首页或复制正文充当两个层级. 这两个库的目录完成状态仍为未完成, 配图审查继续保持完整范围.
