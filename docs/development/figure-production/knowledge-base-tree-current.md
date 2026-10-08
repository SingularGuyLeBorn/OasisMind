# 重点库当前目录树复核

按当前工作树运行 `node scripts/content-check.mjs tree --garden=<正式目录名> --list`, 不采用历史完成记录.

| 知识库 | 当前结果 |
|---|---|
| DiffusionLanguageModels | 通过 |
| SparseAttention | 通过 |
| OnPolicyDistillation | 通过 |
| LongHorizonTask | 通过 |
| RecursiveSelfImprovement | 通过 |
| ReinforcementLearning | 通过 |
| ContinualLearning | 通过 |
| LLMInfrastructure | 通过 |
| RetrievalAugmentedGeneration | 18处:12个二级裸页面, 6个一级目录缺二级路线 |
| Agent | 24处:16个二级裸页面, 8个一级目录缺二级路线 |

RAG涉及第1至6章的每章两个二级页面;Agent涉及第1至8章的每章两个二级页面. 后续必须迁入同名二级目录、建立真实三级主题并同步所有相对链接、资源路径与导航, 不能仅移动首页后创建空叶子来通过检查. 本轮保持一次一库的正文配图顺序, 尚未改动这两个库. 全部目录统一仍未完成;本表只覆盖目录树检查, 不代表展示配置、全站链接、正文与配图验收.
