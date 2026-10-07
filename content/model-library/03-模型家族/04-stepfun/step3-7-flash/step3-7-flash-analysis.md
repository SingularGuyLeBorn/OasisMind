---
title: "Step 3.7 Flash: 在 3.5 Flash 上加视觉输入, 主打 agent 效率的产品通告"
category: "模型库"
tags: ["StepFun", "技术解析"]
published: true
excerpt: "这篇材料要回答的问题很窄: Step 3.7 Flash 相对 Step 3.5 Flash 在哪些 Agent / Coding / 多模态面上报了涨分;"
---
# Step 3.7 Flash: 在 3.5 Flash 上加视觉输入, 主打 agent 效率的产品通告

> 公开材料是 StepFun 产品页 / 通告抓取 `step3-7-flash.md` (页标记 `page 1 of 16`–`page 16 of 16`, 18 张图), 不是架构论文. 正文是卖点条, harness 分表, Advisor Mode 成本叙事, 企业 / 搜索 / 视觉工具 / GUI 案例, 以及一张截断的 Flash / PRO 对照总表. 没有层宽, 路由, 预训练 token 课表, 后训练算法名或消融. 架构细节通告没有写.

来源: 同目录 `step3-7-flash.md`. 对照译稿见 `step3-7-flash-bi.md`. 配图路径一律 `images/p03-…` 至 `images/p14-…`. 数字与型号名回源 md 与图内标签; PDF 抓取断行 (如 conflict-of-interest) 不臆补.

这篇材料要回答的问题很窄: Step 3.7 Flash 相对 Step 3.5 Flash 在哪些 Agent / Coding / 多模态面上报了涨分; Advisor Mode 怎样把 Flash 执行器与更大 advisor 绑成成本故事; 视觉侧 Visual Search / Python tool / GUI 各自给了哪些表; 部署与生态入口开到哪里. 它撑不起底座技术报告.

通告点名的机制词很少. 工具调用与 Agent 编排的一般背景见 [13.1.3-工具使用与MCP](../../../../LargeLanguageModelGuide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP/13.1.3-工具使用与MCP.md) 与 [13.1.4-工具调用演进](../../../../LargeLanguageModelGuide/13-Agent/13.1-Agent核心组件/13.1.4-工具调用演进/13.1.4-工具调用演进.md). Coding Agent / harness 评测背景见 [13.5.1-IDE与Coding-Agent](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent/13.5.1-IDE与Coding-Agent.md) 与 [13.5.2-Benchmark与Eval](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval/13.5.2-Benchmark与Eval.md). 谱系近邻产品页: [step3-5-flash](../step3-5-flash/step3-5-flash-bi.md), [step3](../step3/step3-bi.md), 平台目录 [stepfun](../stepfun/stepfun-bi.md). 单独成篇公式见上面链接; 通告没有的层表与专家数也不用单独成篇填空.

## 1. 定位与规格

### 1.1. 谱系: 2026-05-29 的 Flash Agent 通告, 不是技术报告

发布日期是 2026-05-29. 首页口号是 **See. Think. Act.** 与最高 400 TPS. 副题把新前沿写成 agent efficiency, 并并列四条能力: 多模态理解与行动, Web 与视觉搜索增强, 可靠工具使用与编排, Agent 生态兼容. 外链给出 GitHub / HuggingFace / ModelScope 权重入口.

**读法应落在 「面向真实世界 Agent 的高效率 Flash 产品通告」.** 同目录 Step 3.5 Flash 是上一代对照主轴; Step 3 与开放平台首页是更早谱系与目录页, 不是本通告的层宽说明书. 材料没有公司年表, 没有预训练消费量, 也没有把 196B + 1.8B (ViT) / 激活 11B 展开成架构图. 选型时合理动作是: 先按总表规格行与三条评测维 (Reasoning / Coding / Agentic) 做产品对照, 再另开权重卡或后续技术报告, 别在本通告上假装已读完全部训练细节.

### 1.2. 规格: 总参, 激活参, 多模态勾选

Benchmarks 表的规格行写的是: Step 3.7 Flash 总参 196B + 1.8B (ViT), 激活 11B, Multi-modal ✓. 同档 Flash 对照里, Step 3.5 Flash 总参 196B / 激活 11B 但 Multi-modal ×; DeepSeek V4 Flash 284B / 13B, 多模态 ×. PRO 侧点名 DeepSeek V4 Pro 1.6T / 49B, Kimi K2.6 1T / 32B 等, 闭源多处为 —.

**能确定的只有表上的两行参数与多模态勾选.** 通告没有写稀疏路由名, 专家数, top-k, 共享专家, 也没有解释 1.8B (ViT) 如何接入主干. 平台页只有一句「在 step-3.5-flash 的基础上加入原生多模态输入」. 引用时分开记: 196B 管语言骨干量级, 1.8B 管 ViT 附加, 11B 管激活; 禁止把三者加总成 「服务逐步计费激活」, 也禁止从激活 / 总参比值反推未写出的 MoE 拓扑.

## 2. 能力面与评测

### 2.1. Coding 面: SWE / Terminal 涨分, harness 栈, Advisor Mode

相对 Step 3.5 Flash, 正文写 SWE-Bench Pro +5%, Terminal-Bench 2.1 6.1%. 总表对应格是 SWE-Bench Pro 56.3% vs 51.3%, Terminal-Bench 2.1 59.6% vs 53.4%. page 3 柱图与文件名存在错位风险 (SWE 图挂 terminal 文件名), 以图内标题与总表为准.

Step-SWE-Bench 给出六 harness 分表与雷达图, 并报 Step 3.5 Flash 均分 56.50%. Step 3.7 Flash 在 Hermes Agent 67.50%, OpenClaw 67.00%, KiloCode 67.50%, OpenCode 64.50%, RooCode 64.50% 上高于上一代; Claude Code 一行是 71.50% vs 73.00%, 是表内唯一回落. 正文 「更均衡 / 分差收窄」 是叙述判断, **必须连 Claude Code 回落一起读.**

**Advisor Mode** 是本通告最接近 「机制」 的产品句: Step 3.7 Flash 端到端当 executor, 只在规划或反复失败等拐点请教更大 advisor; 并声明这是 Anthropic advisor strategy 的阶跃实现. 开启后声称达到 Claude Opus 4.6 coding 表现的 97%, 单任务成本约九分之一 (\$0.19 vs \$1.76). page 7 散点图标题含 Opus 4.6 internal reproduce, 读出 +Advisor 约 76.3% / \$0.19, Opus 约 78.7% / \$1.76. 总表大量对照 Claude Opus 4.7, 与此处 4.6 必须分列. Anthropic 公开的 advisor 策略是这样分工的: 便宜的执行模型从头到尾负责调用工具、推进任务, 只在关键决策点把当前情况交给更强的 advisor 模型; advisor 只给简短的指导, 自己不调工具, 也不产出最终结果. 这样大模型只在少数节点上消耗 token, 成本主要由执行模型决定. 通告里 \$0.19 对 \$1.76 的成本比, 就来自这种分工. 工具与 Coding Agent 的一般背景见文首 llm-guide 链接; 通告没有给出 advisor 调用次数分布或具体协议.

### 2.2. 企业与搜索: Toolathlon, ClawEval, GDPval, HLE / BrowseComp

企业段把两根支柱写成自主执行与垂直知识, 并报 Toolathlon 49.5%, ClawEval-1.1 67.1%, GDPval 45.8% (44 职业), Tau2-bench Telecom 多难度档通过率超过 98%. 制造排产 / 热处理分析是 UI 案例标签; page 9 表格是冻干产线工作表示意, 不是架构图.

搜索叙事明确说: 目标不是把世界知识全塞进权重, 而是搜索规划, 证据过滤与综合. 分数句包括 HLE with Tools 47.20% (相对 Step 3.5 Flash text-only 35.68%), BrowseComp 75.82%, DeepSearchQA F1 92.82%, ResearchRubrics 71.68%. 总表同列 HLE w. tool 47.2% 旁注 text-only 49.7%; 本模型 tool 行低于本模型 text-only 行, 通告未解释. Ontario 律师利益冲突案例与轨迹图只作搜索广度 / 深度示意.

Note 与脚注把非多模态对照拆成 Flash 开源左栏与闭源右栏, 并声明 Terminal-Bench 2.1 vs 2.0, GDPval 内部 pairwise vs Artificial Analysis, Toolathlon 内部固定版本 vs 他模最佳分. **这些脚注是评测可读性的硬边界, 不是可忽略的小字.**

### 2.3. 视觉与 GUI: Visual Search, Python tool, 组合涌现, Android Daily

「Agents That Can SEE」 把感知从参数容量挪到带视觉工具的 TestingTime (推理时多花算力), 并先加强 **Visual Search**, 声称弥补有限模型规模造成的参数知识不足, 达到与 「五倍规模」 模型相当. 表给 SimpleVQA 79.16%, WorldVQA 58.10%, BC-VL 58.96%; 多数对照带 \* 自测标记. 「五倍」 与 TestingTime 预算表 (调用上限 / token) 均未给出.

更难的细粒度视觉任务走 **Python tool** (裁剪, 放大, 画像素 / 框的统一代码接口): V\* 95.29%, HR-Bench 4K 89.13%, 8K 86.34%, VisualProbe 65.05%. 作者另称测试中出现跨视觉与非视觉工具的组合泛化, 且训练中 「从未显式引导」; GUI 段同样声称写前端后自主开 GUI 自测. 这些是观察句, 没有排除清单或消融. page 12–14 多张视频占位图在抓取里是黑屏控件, 不能当架构证据.

Android Daily 上 Step 3.7 Flash 图内 61.87%, 对照 Gemini 3 Flash 63.21%\*, Kimi K2.6 53.36%\*, GLM 5V Turbo 51.68%\*. 正文写相对去年 Step-GUI 大幅提升, 但未给 Step-GUI 同分数字. 基准链接 arXiv 2605.27761.

## 3. 总表读法, 部署入口, 材料边界

总表自评聚焦 Reasoning, Coding, Agentic Capability 三维, 实际行列覆盖 GENERAL AGENT, CODING, LONG CONTEXT (AA-LCR 63.9%). 末列 「G」 被截断, 不能补全. 读表三条: 规格行与多模态勾选分开抄; Flash / PRO 分栏不要混成同一量级; \* 与 — 以及 Terminal-Bench 2.0/2.1 脚注必须连着分数走.

Availability 列 StepFun Open Platform (全球 / 中国), OpenRouter, NVIDIA NIM, 以及 DeepInfra / Fireworks AI / Modal 即将扩展. Deployment 写云 / 数据中心 / 本地, 并点名 DGX Station, Ryzen AI Max+ 395, 至少 128GB unified memory 的 Mac Studio / Macbook Pro. Ecosystem 列 vLLM, SGLang, Transformers, llama.cpp, 以及 NVIDIA Nemo (AutoModel, Megatron Core, Megatron Bridge) 与 NIM 微服务.

它能稳定回答的很少: 发布日与 400 TPS 口号; 196B+1.8B ViT / 11B 激活 / 多模态 ✓; 相对 3.5 Flash 的若干涨分与六 harness 分表; Advisor Mode 的 97% / \$0.19 vs \$1.76 (对应 Opus 4.6 那张图); 企业 / 搜索 / 视觉 / GUI 上的公开分与脚注口径; 部署与生态入口. 它不能回答的同样清楚: 层宽与路由, 预训练与后训练课表, TestingTime 预算协议, 「五倍规模」 的精确定义, 组合工具涌现的训练对照, 以及总表截断列.