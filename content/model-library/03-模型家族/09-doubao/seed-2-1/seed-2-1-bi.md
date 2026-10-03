---
title: "Seed2.1 · 对照译稿"
category: "模型库"
tags: ["Doubao", "对照译稿"]
published: true
excerpt: "Seed2.1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 73 -->

ByteDance | Seed

# Seed2.1 Model Card: Agentic Intelligence for Productivity Seed2.1 模型卡: 面向生产力的 Agent 智能

Bytedance Seed

## 1 Introduction

As ByteDance's flagship model family, Seed has been developed with a long-standing commitment to understanding users' real needs, supporting a wide range of work and life scenarios, and empowering users to think, create, and work with greater confidence.

Seed 是字节跳动的旗舰模型家族, 一直以理解用户真实需求为出发点, 覆盖大量工作和生活场景, 帮用户在思考, 创作和工作时更有把握.

Through the previous cycle of user feedback and model iteration, the Seed team has developed a deeper understanding of what truly matters for LLM-based agents as productivity tools. Their core value does not lie in scaling interactions alone, but in creating genuine productivity value for each individual user. A capable agent should not merely respond to prompts; it should help users navigate complex decisions, complete demanding tasks, and produce reliable outcomes in real workflows.

经过上一轮用户反馈和模型迭代, Seed 团队对 「LLM Agent 作为生产力工具, 什么才真正重要」 有了更深的理解. 它的核心价值不在于把交互量做大, 而在于给每一位用户带来实实在在的生产力. 一个合格的 Agent 不该只是回应提示词, 还要帮用户在复杂决策里理清方向, 完成吃力的任务, 并在真实工作流里交出可靠的结果.

Seed2.1 marks a critical turning point for the Seed model family. For the first time, complex needs from daily life, professional productivity, and frontier exploration have been placed at the center of our model development priorities, ahead of traffic-driven general usage alone. This shift has led to substantial improvements in both intelligence and reliability, enabling Seed2.1 to better serve as a trusted partner across real-world scenarios.

Seed2.1 是 Seed 模型家族的一个关键转折点. 日常生活, 专业生产力和前沿探索中的复杂需求, 第一次被放到模型研发优先级的中心, 排在单纯由流量驱动的通用使用之前. 这个转向让智能水平和可靠性都有了大幅提升, Seed2.1 因此更能在真实场景中充当值得信任的伙伴.

In this release, we introduce two Seed2.1 model variants: Seed2.1 Turbo and Seed2.1 Pro. Seed2.1 Turbo is designed for efficient, high-throughput product scenarios, while Seed2.1 Pro targets stronger reasoning, agentic execution, and complex productivity workflows. Together, they form a practical model family for both everyday user assistance and demanding professional tasks.

本次发布包含两个 Seed2.1 变体: Seed2.1 Turbo 和 Seed2.1 Pro. Seed2.1 Turbo 面向高效, 高吞吐的产品场景; Seed2.1 Pro 面向更强的推理, Agent 执行和复杂生产力工作流. 两者合起来, 构成一个既能做日常用户助手, 也能承接高要求专业任务的实用模型家族.

As model capabilities continue to evolve, we observe two important changes in how they should be evaluated. First, model evaluation is moving beyond static benchmarks and becoming increasingly tied to real user experience. Second, model performance is becoming more deeply integrated with the harness, tools, and product environment in which the model operates. In other words, the value of an agent should be measured not only by isolated capability scores, but also by whether it can perform reliably in the actual product workflows that users depend on.

随着模型能力继续演进, 我们观察到评测方式出现了两个重要变化. 第一, 模型评测正在走出静态基准, 越来越和真实用户体验挂钩. 第二, 模型表现与它所运行的 harness, 工具和产品环境绑得越来越紧. 换句话说, Agent 的价值不只看孤立的能力分, 还要看它能否在用户依赖的真实产品工作流里稳定发挥.

To address these changes, the Seed team adopted a product-driven development and evaluation methodology for Seed2.1:

为应对这些变化, Seed 团队为 Seed2.1 采用了产品驱动的研发与评测方法:

1. The Seed team continuously optimized Seed2.1 Turbo and Seed2.1 Pro through dogfooding with internal users, external invited testers, and crowd-testing developers.

1. Seed 团队通过内部用户, 外部受邀测试者和众测开发者的内部试用 (dogfooding), 持续优化 Seed2.1 Turbo 和 Seed2.1 Pro.

2. The Seed team constructed product-driven evaluation targets around real user experience:

2. Seed 团队围绕真实用户体验构建产品驱动的评测目标:

(a) In coding scenarios, we prioritized direct user experience in products such as Claude Code and Trae, focusing on whether the models can solve realistic engineering tasks rather than only perform well on standalone coding benchmarks.

(a) 编程场景中, 我们优先看 Claude Code, Trae 等产品里的直接用户体验, 关注模型能否解决真实工程任务, 而不只是在独立的编程基准上拿高分.

(b) In general-agent scenarios, we continuously expanded benchmarks from real bad cases returned by users. In parallel, we conducted large-scale interviews with enterprise users and domain experts to identify unmet needs and convert them into evaluation tasks.

(b) 通用 Agent 场景中, 我们持续用用户回传的真实坏例扩充基准. 同时对企业用户和领域专家做大规模访谈, 找出尚未满足的需求, 并把它们转成评测任务.

<!-- page 2 of 73 -->

3. The Seed team deeply used Seed models themselves to participate in model iteration, including evaluation construction, failure analysis, data cleaning, data synthesis, training iteration, and infrastructure optimization. Although this capability is still at an early stage, it reveals the emerging potential of self-evolving model development: stronger models can help build better evaluations, produce higher-quality data, improve training workflows, and accelerate both model and organizational evolution.

3. Seed 团队深度使用 Seed 模型本身参与模型迭代, 包括评测构建, 失败分析, 数据清洗, 数据合成, 训练迭代和基础设施优化. 这种能力虽然还处在早期, 但已经显露出模型自我演进式研发的潜力: 更强的模型可以帮忙搭建更好的评测, 产出更高质量的数据, 改进训练流程, 从而加速模型和组织两方面的演进.

## 2 General Agent 通用 Agent

This section evaluates Seed2.1's broader agentic capability beyond coding, focusing on whether the model can plan, use tools, process files, maintain task state, and produce final deliverables in realistic professional workflows. The evaluation combines public agent benchmarks with Seed-developed evaluations, covering workspace-level file reasoning, slide generation, enterprise document reasoning, economically valuable deliverables, and market-validated startup workflows.

本节评估 Seed2.1 在编程之外更广的 Agent 能力, 重点看模型能否在真实的专业工作流中做规划, 用工具, 处理文件, 维护任务状态, 并交出最终成果. 评测把公开 Agent 基准与 Seed 自研评测结合起来, 覆盖工作区级文件推理, 幻灯片生成, 企业文档推理, 具有经济价值的交付物, 以及经过市场验证的创业公司工作流.

![Chart block](images/p02-figure-1-distribution-of-anonymous-crowd-evaluation.png)

Figure 1 Distribution of Anonymous Crowd Evaluation Tasks.

图 1 匿名众测任务的分布.

### 2.1 Crowdsourced Agent Evaluation 众包 Agent 评测

During the iterative development of the Seed2.1 model series, we conducted multiple rounds of large-scale anonymous crowdsourced evaluations with Agent users. Developer feedback collected from these evaluations was continuously incorporated into subsequent model improvements. As a result, Seed2.1 achieved substantial gains in General Agent capabilities, as shown in Figure 1.

在 Seed2.1 系列的迭代研发中, 我们与 Agent 用户做了多轮大规模匿名众包评测. 这些评测收集到的开发者反馈被持续吸收进后续的模型改进. 结果如图 1 所示, Seed2.1 的通用 Agent 能力有了大幅提升.

Based on anonymous developer feedback, Seed2.1 demonstrated a preference ranking superior to Claude Opus 4.6. In particular, across a wide range of real-world tasks, including software development, code security, and hardware-oriented source retrieval, Seed2.1 consistently showed strong capabilities in understanding complex instructions, accurately incorporating user-provided materials, and delivering end-to-end outputs that are executable, practical, and production-ready, as shown in Figures 2, 3, and 4.

根据匿名开发者反馈, Seed2.1 的偏好排名高于 Claude Opus 4.6. 尤其是在软件开发, 代码安全, 面向硬件的资料检索等大量真实任务上, Seed2.1 一直表现出很强的能力: 理解复杂指令, 准确吸收用户提供的材料, 并交出可执行, 实用, 可直接投产的端到端结果, 见图 2, 图 3 和图 4.

> **回看:** 这里说通用 Agent 众测的偏好排名 「高于 Claude Opus 4.6」, 图 1 能不能撑起这句话?
> 撑不起. 图 1 只画了众测任务在各类别上的分布, 没有胜率, 平局数或排名; 图 2 到图 4 是三个单例. 全卡里带数字的众测偏好只在 §3.1.1 编程部分 (Seed2.1-Pro 对 Opus 4.6 为 136 胜 / 26 平 / 68 负). 另一个口径差异: 众测对手是 Opus 4.6, 而表 1 到表 5 的自动评测对手是 Claude-4.7 Opus.

\- Stock-strategy backtesting web app. Figure 2 presents a software-development case where the model was asked to build a Tonghuashun-style stock-strategy backtesting web app. Seed2.1 planned a full-stack implementation with a FastAPI backend, a Python backtest engine, and an ECharts-based frontend.

\- 股票策略回测 Web 应用. 图 2 是一个软件开发案例: 要求模型搭建一个同花顺风格的股票策略回测 Web 应用. Seed2.1 规划了全栈实现, 包括 FastAPI 后端, Python 回测引擎和基于 ECharts 的前端.

<!-- page 3 of 73 -->

After multiple public market-data sources were unavailable or incomplete, it reconstructed an offline-safe historical dataset, implemented multiple strategies including moving-average, MACD, KDJ, RSI, and BOLL variants, and debugged several non-trivial issues such as uninitialized rolling-window indicators, incorrect snapshot statistics, marker-coordinate errors, and pandas truth-value bugs. The final deliverable was a running backtesting workspace with K-line charts, MA overlays, volume and MACD sub-charts, equity curves, strategy controls, trade logs, and WebSocket-based bar-by-bar replay.

在多个公开行情数据源不可用或数据不全之后, 它重建了一份可离线安全使用的历史数据集, 实现了均线, MACD, KDJ, RSI, BOLL 等多种策略变体, 并调通了几个不简单的问题: 滚动窗口指标未初始化, 快照统计错误, 标记坐标错误, 以及 pandas 真值判断 bug. 最终交付的是一个能跑的回测工作台, 带 K 线图, 均线叠加, 成交量和 MACD 副图, 权益曲线, 策略控制, 交易日志, 以及基于 WebSocket 的逐 K 线回放.

\- Android memory-leak refactoring. Figure 3 shows a code-security and refactoring case where the

\- Android 内存泄漏重构. 图 3 是一个代码安全与重构案例, 在这个案例中

MODEL CARD · CASE STUDY

模型卡 · 案例研究

#### Building a stock-strategy backtesting web app 搭建股票策略回测 Web 应用

Software Development · agent harness: Hermes

软件开发 · Agent harness: Hermes

##### Task Overview 任务概览

User: Build a stock-strategy backtesting web app with a Tonghuashun-style trading UI. It must load a sample stock's full price history since its IPO, run a user-given trading strategy, and play back the entire backtest process — not just print a final verdict. Use one stock as the example.

用户: 做一个同花顺风格交易界面的股票策略回测 Web 应用. 它必须加载一只样例股票自 IPO 以来的完整价格历史, 运行用户给定的交易策略, 并回放整个回测过程, 而不只是打印一个最终结论. 用一只股票作为示例.

##### Assistant · end-to-end agent workflow reconstructed from the execution trace 助手 · 根据执行轨迹重建的端到端 Agent 工作流

[Stage 1] Planning & Environment Probing

[阶段 1] 规划与环境探查

todo(plan = "Full-stack app: FastAPI backend + Python backtest engine + ECharts front-end; real data first")
terminal("python3 --version && pip3 list | grep -E \"fastapi|akshare|pandas|numpy\"")
terminal("pip3 install akshare -q")
» fastapi / numpy / pandas already present; akshare install times out under the restricted-network sandbox.
Reasoning: plans the whole stack up front and decides the deliverable must be a running app, not a stub.

fastapi, numpy, pandas 已经装好; akshare 在受限网络的沙箱里安装超时. 推理: 事先规划好整个技术栈, 并决定交付物必须是能跑的应用, 而不是空壳.

##### [Stage 2] Real-Data Acquisition — try every real source first [阶段 2] 获取真实数据: 先把每个真实数据源都试一遍

terminal("curl push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.600519&klt=101 ...")
terminal("curl web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh600519.day,2001-08-27,...")
terminal("curl quotes.money.163.com/service/chddata.html?code=0600519&start=20010827...")
execute\_code("curl money.finance.sina.com.cn/.../CN\_MarketData.getKLineData?symbol=sh600519&datalen=6000")
» EastMoney / Tencent / 163 return empty or are blocked; Sina works but truncates to \~461 of the \~6000 trading days needed.
Reasoning: "simulated data has no reference value for a backtest" — exhausts 5 public market-data APIs before giving up on a live feed.

东方财富, 腾讯, 网易返回空或被拦截; 新浪能用, 但只返回所需约 6000 个交易日中的约 461 个. 推理: 「模拟数据对回测没有参考价值」, 在放弃实时数据前, 把 5 个公开行情 API 都试遍了.

##### [Stage 3] Honest Data Reconstruction & Backtest Engine [阶段 3] 如实重建数据并搭建回测引擎

write\_file("generate\_data.py") # rebuild 600519 from IPO 2001-08 (\~31 yuan) to 2021 peak (\~2600) by real milestones terminal("python3 generate\_data.py") -> 6,210 trading days generated, price path matches the real history
write\_file("backtest.py") # 8 strategies: dual-MA, MA60-trend, MA-cross, MACD, KDJ, RSI, BOLL, custom terminal("python3 backtest.py")
» Win-rate is only \~22%: buy-and-hold is +3742% yet the strategy shows -98% — the logic must be wrong, not the market.
Reasoning: refuses to fake numbers; reconstructs a realistic, offline-safe dataset, then treats the absurd result as a bug to chase.

按真实里程碑重建 600519 的价格, 从 2001-08 上市 (约 31 元) 到 2021 年高点 (约 2600 元), 生成 6,210 个交易日, 价格路径与真实历史吻合. backtest.py 实现 8 种策略: 双均线, MA60 趋势, 均线交叉, MACD, KDJ, RSI, BOLL, 自定义. 胜率只有约 22%: 买入持有是 +3742%, 策略却显示 -98%, 说明错的是逻辑, 不是行情. 推理: 拒绝伪造数字; 先重建一份贴近现实且可离线使用的数据集, 再把荒唐的结果当作 bug 去追.

##### [Stage 4] Root-cause Debugging, UI & Full Verification [阶段 4] 根因调试, UI 与完整验证

execute\_code("inspect df[[ma5, ma20]].head(25)") -> earliest bars have MA=0 (rolling window not warmed up)
patch("backtest.py") # guard NaN / zero indicators -> kill the false golden-cross signals
patch("generate\_data.py") # lower daily volatility 1.8% -> 0.8% so MAs stop crossing on noise
write\_file("server.py") # FastAPI HTTP + WebSocket bar-by-bar replay
write\_file("templates/index.html") # Tonghuashun dark UI, red-up/green-down, ECharts K-line + equity curve
patch x3 # fix empty engine.snapshots (stats), date-based buy/sell marker coords, RSI pandas Series truth-value bug
terminal("for s in ma\_cross dual\_ma macd kdj rsi boll ...; curl /api/backtest?strategy=\$s")
» All 8 strategies run clean. Trend strategies (dual-MA +25%/yr, Sharpe 2.78) beat the oscillators — the expected pattern on a long-uptrend stock, which confirms the engine is actually correct, not just running.

检查发现最早几根 K 线的均线为 0 (滚动窗口还没预热). 修补 backtest.py, 屏蔽 NaN 或为 0 的指标, 消除虚假金叉信号; 修补 generate_data.py, 把日波动率从 1.8% 降到 0.8%, 让均线不再因噪声交叉. 写出 server.py (FastAPI HTTP 加 WebSocket 逐 K 线回放) 和同花顺深色界面 (红涨绿跌, ECharts K 线与权益曲线). 三次修补分别修复空的 engine.snapshots (统计), 按日期定位的买卖标记坐标, 以及 RSI 的 pandas Series 真值 bug. 最后 8 种策略全部跑通. 趋势策略 (双均线年化 +25%, Sharpe 2.78) 胜过震荡类策略, 这正是长期上涨股票上应有的规律, 说明引擎确实算对了, 而不只是能跑.

<!-- page 4 of 73 -->

![Image block](images/p04-full-tonghuashun-style-backtest-workspace-k-line-ma.png)

Full Tonghuashun-style backtest workspace: K-line + MA overlays, volume / MACD sub-charts, equity curve, strategy panel, live trade log and bar-by-bar replay with buy/sell markers.

完整的同花顺风格回测工作台: K 线加均线叠加, 成交量 / MACD 副图, 权益曲线, 策略面板, 实时交易日志, 以及带买卖标记的逐 K 线回放.

Result A working FastAPI + ECharts app over the stock's full history (6,210 trading days), 8 strategies, and a WebSocket bar-by-bar replay showing buy/sell markers, an equity curve and a trade log. Developer acceptance: rated above expectations for a highly faithful UI and a complete feature set; got there through several rounds of self-driven iteration and refinement.

结果: 一个可运行的 FastAPI + ECharts 应用, 覆盖该股完整历史 (6,210 个交易日), 8 种策略, 以及显示买卖标记, 权益曲线和交易日志的 WebSocket 逐 K 线回放. 开发者验收: 界面还原度高, 功能完整, 评价超出预期; 这是模型经过几轮自主迭代和打磨达到的.

Figure 2 The case of Seed2.1 with Software Development task.

图 2 Seed2.1 完成软件开发任务的案例.

model was asked to audit and harden an Android Activity implementation with severe memory-leak issues. Seed2.1 first grounded its diagnosis in the uploaded OldDownloadActivity.java, identified two strong-reference leak paths from the non-static Handler and anonymous background Runnable, and then delivered a complete refactored SecureDownloadActivity.java. The fix introduced a static Handler with WeakReference, an interrupt-aware static background runnable, liveness checks before UI updates, precise exception logging, and explicit cleanup in onDestroy. This case demonstrates Seed2.1's ability to turn code-audit findings into a complete, lifecycle-aware implementation rather than only providing high-level suggestions.

模型被要求审计并加固一个存在严重内存泄漏的 Android Activity 实现. Seed2.1 先以上传的 OldDownloadActivity.java 为依据做诊断, 找出两条强引用泄漏路径, 分别来自非静态 Handler 和匿名后台 Runnable, 然后交付完整重构后的 SecureDownloadActivity.java. 修复包括: 带 WeakReference 的静态 Handler, 能响应中断的静态后台 runnable, 更新 UI 前的存活检查, 精确的异常日志, 以及 onDestroy 里的显式清理. 这个案例说明 Seed2.1 能把代码审计的发现落实成完整且感知生命周期的实现, 而不只是给出高层建议.

\- Hardware Q&A with official source retrieval. Figure 4 shows a hardware source-retrieval case on the nRF54L15 DK, where the user required exact GPIO pin assignments, solder-bridge operations, and resistor reference-designator changes. When the official online manual was blocked by Cloudflare and secondary sources were inconsistent, Seed2.1 avoided guessing and instead downloaded the official PCA10156 hardware files. It parsed the schematic, BOM, and assembly drawing to identify that P1.00/P1.01 are connected by default to the 32.768 kHz crystal through XL1/XL2, that freeing them requires cutting SB3/SB4 and shorting SB5/SB6, and that using P1.02/P1.03 as GPIO requires moving R21 to R33 and R22 to R34. This case highlights Seed2.1's ability to recover from web-access failures, trace claims to official engineering artifacts, and produce directly actionable hardware instructions.

\- 结合官方资料检索的硬件问答. 图 4 是 nRF54L15 DK 上的硬件资料检索案例, 用户要求给出准确的 GPIO 引脚分配, 焊桥操作和电阻位号改动. 官方在线手册被 Cloudflare 拦住, 二手资料又互相矛盾, Seed2.1 没有去猜, 而是下载了官方 PCA10156 硬件文件. 它解析原理图, BOM 和装配图, 确认 P1.00/P1.01 默认经 XL1/XL2 连到 32.768 kHz 晶振, 要释放它们需要切断 SB3/SB4 并短接 SB5/SB6, 而把 P1.02/P1.03 用作 GPIO 需要把 R21 移到 R33, R22 移到 R34. 这个案例体现了 Seed2.1 从网页访问失败中恢复, 把结论追溯到官方工程文件, 并给出可直接执行的硬件操作说明的能力.

### 2.2 High-Economic-Value Tasks 高经济价值任务

<!-- page 5 of 73 -->

#### 2.2.1 Benchmark Overview 基准概览

The general-agent evaluation suite combines public benchmarks and Seed-developed evaluations to assess complementary aspects of professional productivity. Public benchmarks cover workspace-level file dependency reasoning, slide generation, expert-level professional tasks, enterprise document reasoning, economically valuable deliverables, and long-horizon cross-application workflows. Specifically, Workspace Bench evaluates realistic workspace tasks with large-scale heterogeneous file dependencies [51]; PresentBench evaluates

通用 Agent 评测套件结合公开基准和 Seed 自研评测, 从互补的角度考察专业生产力. 公开基准覆盖工作区级文件依赖推理, 幻灯片生成, 专家级专业任务, 企业文档推理, 具有经济价值的交付物, 以及长程跨应用工作流. 具体来说, Workspace Bench 评估带有大规模异构文件依赖的真实工作区任务 [51]; PresentBench 评估

MODEL CARD · CASE STUDY 模型卡 · 案例研究

##### Auditing & hardening a memory-leaking Android Activity 审计并加固一个内存泄漏的 Android Activity

Code Security / Refactoring · agent harness: Hermes

代码安全 / 重构 · Agent harness: Hermes

###### Task Overview 任务概览

User: Act as a senior Android architect. The uploaded OldDownloadActivity.java crashes when the user quickly closes the page and leaks the Activity (it can't be GC'd). (1) Pinpoint the 2 strong-reference leak paths from the Handler / anonymous inner classes; (2) refactor with a static inner class + WeakReference (or a lifecycle-aware component) so no background thread keeps a strong reference to UI or Context after onDestroy; (3) add main-thread + isFinishing()/isDestroyed() liveness checks before touching UI; (4) never swallow exceptions — catch precisely and Log.e the full stack. Deliver an audit report first, then the complete refactored SecureDownloadActivity.java.

用户: 请以资深 Android 架构师的身份工作. 上传的 OldDownloadActivity.java 在用户快速关闭页面时会崩溃, 并泄漏 Activity (无法被 GC). (1) 找出 Handler / 匿名内部类造成的 2 条强引用泄漏路径; (2) 用静态内部类 + WeakReference (或感知生命周期的组件) 重构, 保证 onDestroy 之后没有后台线程对 UI 或 Context 持有强引用; (3) 操作 UI 前加主线程检查以及 isFinishing()/isDestroyed() 存活检查; (4) 不许吞异常, 要精确捕获并用 Log.e 打出完整堆栈. 先交审计报告, 再交完整重构后的 SecureDownloadActivity.java.

###### Assistant · end-to-end agent workflow reconstructed from the execution trace 助手 · 根据执行轨迹重建的端到端 Agent 工作流

[Stage 1] Locate & Read the Faulty Source

[阶段 1] 定位并阅读出错源码

```txt
search_files(path="/home/claude-user", pattern="OldDownloadActivity.java", target="files")
read_file(path="/home/claude-user/OldDownloadActivity.java") -> 48 lines, com.example.audit
» Reads the real file before judging — no fixing blind. Identifies a non-static Handler, an anonymous Thread/Runnable, a direct UI write with no liveness check, and an empty catch block.
Reasoning: "I must read the uploaded file first to audit it" — grounds the whole review in the actual code, not assumptions.
```

读到 48 行, 包名 com.example.audit. 先读真实文件再下判断, 不盲修. 识别出非静态 Handler, 匿名 Thread/Runnable, 无存活检查的直接 UI 写入, 以及空 catch 块. 推理: 「要审计就必须先读上传的文件」, 整个审查以真实代码为依据, 不靠假设.

###### [Stage 2] Code-Audit Report — leak paths & crash points [阶段 2] 代码审计报告: 泄漏路径与崩溃点

» Leak #1 (Handler): non-static anonymous Handler implicitly holds the Activity. Chain = MessageQueue → Message → Handler → Activity → whole View tree; pending messages block GC.

泄漏 #1 (Handler): 非静态匿名 Handler 隐式持有 Activity. 引用链为 MessageQueue → Message → Handler → Activity → 整棵 View 树; 未处理的消息会阻止 GC.

» Leak #2 (Thread): anonymous Runnable holds the Activity too; the \~50 s download loop keeps it alive even after finish().

泄漏 #2 (Thread): 匿名 Runnable 同样持有 Activity; 约 50 s 的下载循环在 finish() 之后仍让它存活.

\# crash points enumerated in a table:

\# 以表格列出崩溃点:

L18 handleMessage -> setText with no liveness check -> NPE / BadTokenException

L18 handleMessage -> 无存活检查就 setText -> NPE / BadTokenException

L43 empty catch {} swallows InterruptedException -> undebuggable

L43 空 catch {} 吞掉 InterruptedException -> 无法调试

--- onDestroy never removes messages / stops thread -> IllegalStateException

--- onDestroy 从不移除消息, 也不停止线程 -> IllegalStateException

Reasoning: names the exact leak chains and maps each crash to a concrete exception type before writing a single line of the fix.

推理: 在写修复代码之前, 先说出准确的泄漏链, 并把每个崩溃点对应到具体的异常类型.

###### [Stage 3] Refactor — write SecureDownloadActivity.java [阶段 3] 重构: 写出 SecureDownloadActivity.java

write\_file("SecureDownloadActivity.java") # 215 lines, 6 numbered fix points

write_file(「SecureDownloadActivity.java」) # 215 行, 6 个编号修复点

static class DownloadHandler -> WeakReference&lt;Activity&gt;, drops msg if GC'd

static class DownloadHandler -> 持有 WeakReference<Activity>, 若已被 GC 则丢弃消息

static class DownloadRunnable -> holds only a WeakReference&lt;Handler&gt;, no Context

static class DownloadRunnable -> 只持有 WeakReference<Handler>, 不持有 Context

handleMessage(): isFinishing() || isDestroyed() guard before updateProgress()

handleMessage(): 调用 updateProgress() 前先做 isFinishing() || isDestroyed() 守卫

run(): per-loop Thread.isInterrupted() check -> safe early exit (no 50 s spin)

run(): 每轮循环检查 Thread.isInterrupted() -> 安全提前退出 (不再空转 50 s)

catch (InterruptedException e){ Thread.currentThread().interrupt(); Log.e(TAG,...,e);} # never swallow

catch (InterruptedException e) 中恢复中断标志并 Log.e(TAG,...,e); 从不吞异常

onDestroy(): removeCallbacksAndMessages(null) + interrupt() + null-out View refs

onDestroy(): removeCallbacksAndMessages(null) + interrupt() + 把 View 引用置空

Reasoning: converts every audited defect into a labelled fix (「修复点1..6」), preserving the original behaviour while cutting all strong-ref chains.

推理: 把每个审计出的缺陷都转成带标签的修复 (「修复点1..6」), 在切断所有强引用链的同时保留原有行为.

###### [Stage 4] Self-Verification & Hand-off [阶段 4] 自我验证与交付

\# verification summary mapped fix-by-fix against the original defects:

\# 验证摘要, 逐项对照原始缺陷:

Handler leak -> static + WeakReference, get() before every use

Handler 泄漏 -> 静态类 + WeakReference, 每次使用前先 get()

Thread leak -> static Runnable, no outer-class access, interrupt-aware

Thread 泄漏 -> 静态 Runnable, 不访问外部类, 能响应中断

UI safety -> triple guard: isFinishing()/isDestroyed() + null-check + main Looper

UI 安全 -> 三重守卫: isFinishing()/isDestroyed() + 判空 + 主 Looper

exceptions -> InterruptedException restores interrupt flag; all paths Log.e(TAG,msg,e)

异常 -> InterruptedException 恢复中断标志; 所有路径都 Log.e(TAG,msg,e)

» Confirms the result compiles against the Android SDK with no obvious syntax errors and can directly replace the original file —

确认结果可以针对 Android SDK 编译, 没有明显语法错误, 能直接替换原文件,

delivers the audit report and the full 215-line class, not a sketch.

交付审计报告和完整的 215 行类, 而不是草图.

<!-- page 6 of 73 -->

![Image block](images/p06-figure-3-the-case-of-seed2-1-with-code-security-task.png)

Figure 3 The case of Seed2.1 with Code Security task.

图 3 Seed2.1 完成代码安全任务的案例.

automated slide generation using fine-grained, instance-specific rubrics [8]; OneMillion Bench evaluates expert-level agent tasks across professional domains such as law, finance, industry, healthcare, and natural science [74]; OfficeQA-Pro focuses on grounded multi-document enterprise reasoning over a large heterogeneous corpus [41]; GDPval evaluates model performance on economically valuable real-world tasks across occupational domains [43]; Finance Agent v1.1 evaluates LLM agents' end-to-end performance on real-world financial analyst tasks across 9 categories — from basic information retrieval to complex financial modeling [3]; and APEX Agents evaluates long-horizon professional service tasks created by investment banking analysts, management consultants, and corporate lawyers [57]. Agent Startup Bench is a Seed-developed benchmark that focuses on market-validated AI workflows derived from AI-native startup products and real enterprise-user needs. Together, these evaluations test whether an agent can move beyond answering questions and complete realistic work products under practical workflow constraints.

用细粒度, 逐实例的 rubric 评估自动幻灯片生成 [8]; OneMillion Bench 评估法律, 金融, 工业, 医疗, 自然科学等专业领域的专家级 Agent 任务 [74]; OfficeQA-Pro 关注在大规模异构语料上做有依据的多文档企业推理 [41]; GDPval 评估模型在各职业领域具有经济价值的真实任务上的表现 [43]; Finance Agent v1.1 评估 LLM Agent 在 9 类真实金融分析师任务上的端到端表现, 从基础信息检索到复杂财务建模 [3]; APEX Agents 评估由投行分析师, 管理咨询顾问和公司律师编写的长程专业服务任务 [57]. Agent Startup Bench 是 Seed 自研基准, 关注从 AI 原生创业产品和真实企业用户需求中提炼出的, 经过市场验证的 AI 工作流. 这些评测合在一起, 检验 Agent 能否超越回答问题, 在实际工作流约束下完成真实的工作成果.

Workspace Bench Workspace Bench evaluates whether agents can complete realistic workspace tasks involving large-scale heterogeneous file dependencies [51, Table 4]. In our evaluation, we report results under the 100-task OpenClaw setting using the metric order Total / Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100. The paper-reported result for 3.1-Pro is 31.6, with Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100 = 45.0 / 31.0 / 20.0 / 11.0 / 8.0. Unlike benchmarks that provide a small set of pre-selected files, Workspace Bench requires agents to operate within realistic workspaces, identify relevant files, reason over explicit and implicit dependencies, and produce outputs that satisfy task-specific rubrics. This makes it particularly relevant

Workspace Bench 评估 Agent 能否完成涉及大规模异构文件依赖的真实工作区任务 [51, Table 4]. 我们的评测在 100 任务的 OpenClaw 设定下报告结果, 指标顺序为 Total / Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100. 论文中 3.1-Pro 的报告结果是 31.6, Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100 = 45.0 / 31.0 / 20.0 / 11.0 / 8.0. 与只提供一小组预选文件的基准不同, Workspace Bench 要求 Agent 在真实工作区中操作, 找出相关文件, 推理显式和隐式依赖, 并产出满足任务专属 rubric 的结果. 这使它特别适合

> **核对:** 正文引了原论文里 3.1-Pro 的 31.6 和一串 Pass@k, 表 1 里 Gemini-3.1 Pro 却是 32.8, 两组数是同一次跑的吗?
> 不是. 表 1 的 Gemini-3.1 Pro 为 Total 32.8, Pass@30/50 为 49.0 / 29.0, Pass@70/90/100 为 17.0 / 9.0 / 4.0, 与论文值 31.6 和 45.0 / 31.0 / 20.0 / 11.0 / 8.0 逐项都对不上, 所以表 1 是 Seed 自己在 OpenClaw 设定下重跑的结果. 引论文值的作用只是说明量级接近, 同一行里 Seed2.1 与对手的差距应当只在表 1 内部比较.

<!-- page 7 of 73 -->

```txt
» Maps the bridge ops (cut SB3/SB4, short SB5/SB6) and resistor moves (R21->R33, R22->R34) one-to-one onto the three questions.
» Adds firmware notes: with the crystal cut, LFCLK must switch to internal RC/synth; freeing NFC pins needs nfct-pins-as-gpios.
```

把焊桥操作 (切断 SB3/SB4, 短接 SB5/SB6) 和电阻移位 (R21->R33, R22->R34) 一一对应到三个问题上. 补充固件注意事项: 切断晶振后, LFCLK 必须切到内部 RC 或合成时钟; 释放 NFC 引脚需要 nfct-pins-as-gpios.

for professional productivity scenarios where users expect agents to search across messy folders, connect information from multiple documents, update or create files, and maintain consistency between evidence and final deliverables.

专业生产力场景: 用户期望 Agent 在杂乱的文件夹里搜索, 把多个文档的信息连起来, 更新或新建文件, 并让证据与最终交付物保持一致.

Agent Startup Bench Agent Startup Bench is a Seed-developed benchmark for evaluating whether agents can complete real-world workflows derived from AI-native startup products and their users. Its core motivation is demand-driven evaluation: tasks should reflect workflows that users already choose to delegate to AI systems, rather than only researcher-designed capability tests. The benchmark is constructed through a survey- and interview-driven pipeline. We first survey AI-native startups with evidence of market validation,

Agent Startup Bench 是 Seed 自研基准, 用于评估 Agent 能否完成从 AI 原生创业产品及其用户那里提炼出的真实工作流. 它的核心动机是需求驱动的评测: 任务应当反映用户已经愿意交给 AI 系统的工作流, 而不只是研究者设计的能力测试. 基准通过问卷和访谈驱动的流程构建. 我们先调研有市场验证证据的 AI 原生创业公司,

##### MODEL CARD · CASE STUDY 模型卡 · 案例研究

Hardware Q&A / Source Retrieval · agent harness: OpenClaw

硬件问答 / 资料检索 · Agent harness: OpenClaw

###### Task Overview 任务概览

User: I'm building a device on the nRF54L15 DK and need pins P1.00 and P1.01 as GPIO to connect an external module, but they appear to be occupied by default. (1) Per the manual, which on-board component are these two pins assigned to? (2) To fully release P1.00 / P1.01 as plain GPIO, what physical board modifications are required (give the exact Solder-bridge numbers and the action)? (3) I'd also like to use P1.02 / P1.03 as GPIO — which resistors must be moved? Give the precise reference-designator changes.

用户: 我在 nRF54L15 DK 上做一个设备, 需要把 P1.00 和 P1.01 当 GPIO 接外部模块, 但它们默认好像被占用了. (1) 按手册, 这两个引脚分配给了板上哪个元件? (2) 要把 P1.00 / P1.01 完全释放成普通 GPIO, 需要做哪些物理改板 (给出准确的焊桥编号和操作)? (3) 我还想把 P1.02 / P1.03 当 GPIO 用, 必须移动哪些电阻? 给出准确的位号改动.

Assistant · workflow reconstructed from the execution trace (137 tool calls: Bash 75 / Process 29 / WebSearch 19 / WebFetch 7 / Read 7)

助手 · 根据执行轨迹重建的工作流 (137 次工具调用: Bash 75 / Process 29 / WebSearch 19 / WebFetch 7 / Read 7)

[Stage 1] Search the manual online — blocked by Cloudflare

[阶段 1] 在线搜索手册: 被 Cloudflare 拦住

```txt
WebSearch("nRF54L15 DK P1.00 P1.01 default pin assignment solder bridge")
WebFetch("docs.nordicsemi.com/.../hw_cg_pin_conf.html") -> blocked by Cloudflare
» The official online manual is gated by a human check and 2nd-hand blogs disagree — not enough to answer down to a designator.
Reasoning: won't guess from scattered blogs — if the official page won't open, go fetch the official raw hardware files instead.
```

官方在线手册被人机验证挡住, 二手博客说法不一, 不足以精确到位号. 推理: 不根据零散博客去猜; 官方页面打不开, 就去取官方原始硬件文件.

###### [Stage 2] Download & extract the official PCA10156 hardware files [阶段 2] 下载并解压官方 PCA10156 硬件文件

curl / wget / python download the nRF54L15 DK hardware-files .zip from Azure blob (throttled, retried)

用 curl / wget / python 从 Azure blob 下载 nRF54L15 DK 硬件文件 .zip (被限速, 多次重试)

» The download was rate-limited and dropped repeatedly; it kept switching tools and retrying until it pulled the schematic and production files out of a partial archive.

下载被限速并反复中断; 它不断换工具重试, 直到从一个不完整的压缩包里取出原理图和生产文件.

###### [Stage 3] Parse schematic + BOM + render & vision-read the Assembly Drawing [阶段 3] 解析原理图 + BOM, 渲染装配图并用视觉读取

```txt
olefile parses the Altium SchDoc (OLE compound doc) -> nets:
P1.00/XL1, P1.01/XL2 -> 32.768kHz crystal XC1 ; P1.02/NFC1, P1.03/NFC2 -> NFC antenna J7
xlrd reads the BOM -> R21 / R22 = Fitted ; R33 / R34 = Not Fitted
pypdf/fitz render Assembly Drawing PDF -> PNG, Read vision-reads the bottom-silkscreen config table (SB3~SB6)
Reasoning: when binary parsing got slow it pivoted to vision-reading the assembly drawing, cross-checking schematic nets / BOM fit-state / silkscreen table.
```

olefile 解析 Altium SchDoc 得到网络: P1.00/XL1, P1.01/XL2 接 32.768kHz 晶振 XC1; P1.02/NFC1, P1.03/NFC2 接 NFC 天线 J7. xlrd 读 BOM: R21 / R22 = 已焊, R33 / R34 = 未焊. 把装配图 PDF 渲染成 PNG, 用视觉读取底层丝印配置表 (SB3~SB6). 推理: 二进制解析变慢时, 转而用视觉读装配图, 并交叉核对原理图网络, BOM 焊接状态和丝印表.

###### [Stage 4] Synthesize an actionable three-part answer [阶段 4] 综合成可执行的三段式回答

<!-- page 8 of 73 -->

![Image block](images/p08-figure-4-the-case-of-seed2-1-with-hardware-task.png)

Figure 4 The case of Seed2.1 with Hardware task.

图 4 Seed2.1 完成硬件任务的案例.

such as funding, paying users, or large-scale adoption, then interview deep users to understand usage contexts, input materials, expected deliverables, and practical success criteria. Domain experts then convert validated scenarios into benchmark tasks with task descriptions, attachments, output requirements, and rubric-based evaluation criteria, followed by quality control for realism, answerability, evaluability, and discriminative difficulty.

这些证据包括融资, 付费用户或大规模采用; 然后访谈深度用户, 了解使用情境, 输入材料, 期望交付物和实际的成功标准. 再由领域专家把验证过的场景转成基准任务, 包括任务描述, 附件, 输出要求和基于 rubric 的评估标准, 最后针对真实性, 可回答性, 可评估性和区分难度做质量控制.

#### 2.2.2 Results 结果

As shown in Table 1, Seed2.1 demonstrates strong general-agent productivity capability across workspace reasoning, professional deliverable generation, enterprise document understanding, and long-horizon service tasks. On Workspace Bench, Seed2.1-Turbo reaches 54.7 and Seed2.1-Pro reaches 53.0, approaching Claude-4.7-Opus at 55.1 and substantially outperforming Gemini-3.1-Pro at 32.8. On Agent Startup Bench, Seed2.1-Pro achieves the best listed result at 68.8, surpassing GPT-5.5 at 68.1, Claude-4.7-Opus at 62.3, and Gemini-3.1-Pro at 45.7. On Agents' Last Exam, Seed2.1-Pro reaches 19.5 / 41.4, outperforming Claude-4.7-Opus and Gemini-3.1-Pro while approaching GPT-5.5, further indicating strong performance on difficult long-horizon agent tasks.

如表 1 所示, Seed2.1 在工作区推理, 专业交付物生成, 企业文档理解和长程服务任务上都展现出很强的通用 Agent 生产力. 在 Workspace Bench 上, Seed2.1-Turbo 达到 54.7, Seed2.1-Pro 达到 53.0, 接近 Claude-4.7-Opus 的 55.1, 大幅领先 Gemini-3.1-Pro 的 32.8. 在 Agent Startup Bench 上, Seed2.1-Pro 以 68.8 取得表中最好成绩, 高于 GPT-5.5 的 68.1, Claude-4.7-Opus 的 62.3 和 Gemini-3.1-Pro 的 45.7. 在 Agents' Last Exam 上, Seed2.1-Pro 达到 19.5 / 41.4, 超过 Claude-4.7-Opus 和 Gemini-3.1-Pro, 接近 GPT-5.5, 进一步说明它在困难的长程 Agent 任务上表现强劲.

> **看表:** 正文说 Workspace Bench 上 Seed2.1 「接近 Claude-4.7-Opus 的 55.1」, 表 1 这一行谁排第一?
> GPT-5.5, Total 58.7, Pass@30/50 为 81.0 / 67.0, 正文没提. Seed2.1 的两个变体里 Turbo 54.7 反而高于 Pro 53.0, 但 Pro 的 Pass@30 是 78.0, 高于 Turbo 的 74.0, 说明 Pro 在低门槛上完成得更多, 在总分上没赢. 同样的挑选也出现在下一段: OneMillion Bench 上表 1 最高是 Claude-4.7 Opus 的 73.0, 正文只拿 GPT-5.5 的 69.6 作参照.

Seed2.1-Pro is also competitive on professional deliverable and enterprise reasoning tasks. It reaches 68.8 on OneMillion Bench, close to GPT-5.5 at 69.6 and clearly above Gemini-3.1-Pro at 60.2. On OfficeQA-Pro, Seed2.1-Pro reaches 70.9, substantially outperforming GPT-5.5 at 62.9 and approaching Gemini-3.1-Pro

Seed2.1-Pro 在专业交付物和企业推理任务上同样有竞争力. 它在 OneMillion Bench 上达到 68.8, 接近 GPT-5.5 的 69.6, 明显高于 Gemini-3.1-Pro 的 60.2. 在 OfficeQA-Pro 上, Seed2.1-Pro 达到 70.9, 大幅超过 GPT-5.5 的 62.9, 并接近 Gemini-3.1-Pro 的

<!-- page 9 of 73 -->

<table><tr><td>Benchmark</td><td>GPT-5.5</td><td>Claude-4.7 Opus</td><td>Gemini-3.1 Pro</td><td>Seed2.1 Turbo</td><td>Seed2.1 Pro</td></tr><tr><td rowspan="3">Workspace Bench [51]</td><td>58.7</td><td>55.1</td><td>32.8</td><td>54.7</td><td>53.0</td></tr><tr><td>81.0 / 67.0</td><td>76.0 / 56.0</td><td>49.0 / 29.0</td><td>74.0 / 59.0</td><td>78.0 / 60.0</td></tr><tr><td>44.0 / 25.0 / 20.0</td><td>40.0 / 20.0 / 18.0</td><td>17.0 / 9.0 / 4.0</td><td>39.0 / 20.0 / 16.0</td><td>38.0 / 25.0 / 20.0</td></tr><tr><td>PresentBench [8]</td><td>68.9</td><td>61.8</td><td>52.1</td><td>48.3</td><td>54.6</td></tr><tr><td>Agent Startup Bench</td><td>68.1</td><td>62.3</td><td>45.7</td><td>54.0</td><td>68.8</td></tr><tr><td>Agents&#x27; Last Exam [50]</td><td>24.0 / 42.8</td><td>18.4 / 40.5</td><td>15.8 / 32.0</td><td>-</td><td>19.5 / 41.4</td></tr><tr><td>OneMillion Bench [74]</td><td>69.6</td><td>73.0</td><td>60.2</td><td>66.6</td><td>68.8</td></tr><tr><td>OfficeQA-Pro [41]</td><td>62.9</td><td>76.5</td><td>72.5</td><td>62.8</td><td>70.9</td></tr><tr><td>GDPval [43]</td><td>84.9</td><td>82.7</td><td>67.3</td><td>82.7</td><td>87.9</td></tr><tr><td>Finance Agent v1.1 [3]</td><td>65.3</td><td>64.4</td><td>59.7</td><td>56.0</td><td>60.7</td></tr><tr><td>APEX Agents [57]</td><td>35.4</td><td>33.9</td><td>33.5</td><td>29.2</td><td>33.8</td></tr></table>

Table 1 General-agent automatic evaluation. For Workspace Bench, the first number is Total, and the following two lines report Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100 under the 100-task OpenClaw setting. For Agents' Last Exam, results are reported as Pass@1 / Score. OfficeQA-Pro incorporates some internal implementations and adaptations, so its scores may show some fluctuation compared with the official leaderboard.

表 1 通用 Agent 自动评测. Workspace Bench 的第一个数是 Total, 后面两行是 100 任务 OpenClaw 设定下的 Pass@30 / Pass@50 / Pass@70 / Pass@90 / Pass@100. Agents' Last Exam 的结果按 Pass@1 / Score 报告. OfficeQA-Pro 含有一些内部实现和适配, 因此分数与官方排行榜相比可能有一定波动.

at 72.5, while Claude-4.7-Opus remains the strongest listed model. On GDPVal, Seed2.1-Pro achieves the best listed score at 87.9, outperforming GPT-5.5 at 84.9, Claude-4.7-Opus at 82.7, and Gemini-3.1-Pro at 67.3. On APEX Agents, Seed2.1-Pro reaches 33.8, nearly matching Claude-4.7-Opus at 33.9 and exceeding Gemini-3.1-Pro at 33.5. Together with crowdsourced agent-task evaluation, these results show that Seed2.1 has reached a strong production-ready level for general-agent productivity workflows.

72.5, 而 Claude-4.7-Opus 仍是表中最强的模型. 在 GDPVal 上, Seed2.1-Pro 以 87.9 取得表中最好成绩, 高于 GPT-5.5 的 84.9, Claude-4.7-Opus 的 82.7 和 Gemini-3.1-Pro 的 67.3. 在 APEX Agents 上, Seed2.1-Pro 达到 33.8, 几乎追平 Claude-4.7-Opus 的 33.9, 并超过 Gemini-3.1-Pro 的 33.5. 结合众包 Agent 任务评测, 这些结果表明 Seed2.1 在通用 Agent 生产力工作流上已达到可投产的强水平.

### 2.3 Complex Daily Life Consultation 复杂日常生活咨询

Complex daily-life consultation evaluates whether Seed2.1 can serve as a reliable advisor in realistic user scenarios. Unlike simple question-answering tasks, daily-life consultation often requires multi-step reasoning, preference understanding, constraint tracking, practical planning, and the ability to provide actionable recommendations. We combine human evaluation with automatic evaluation to capture both subjective helpfulness and scalable benchmark performance. Related public multi-turn evaluation efforts emphasize the difficulty of maintaining instruction consistency, tracking user intent, and adapting to evolving context across realistic extended conversations  $[14, 72]$ .

复杂日常生活咨询评估 Seed2.1 能否在真实用户场景中充当可靠的顾问. 与简单问答不同, 日常生活咨询往往需要多步推理, 理解偏好, 跟踪约束, 做实际规划, 并给出可执行的建议. 我们把人工评测和自动评测结合起来, 同时捕捉主观上的有用程度和可规模化的基准表现. 相关的公开多轮评测工作强调, 在真实的长对话里保持指令一致, 跟踪用户意图, 适应不断变化的上下文都很难 $[14, 72]$.

#### 2.3.1 Benchmark Overview 基准概览

Evaluation Scope The automatic evaluation suite covers two complementary aspects of complex daily-life assistance. The first is conversation-oriented daily consultation, where the model must understand realistic user needs, maintain multi-turn context, follow user preferences, and provide practical recommendations. This part is evaluated by Seed-developed benchmarks such as xDailyBench and Doubao Multi-Turn Bench. The second is tool-augmented assistance, where the model must go beyond conversation and complete user-facing tasks through tool use, web interaction, long-horizon execution, and reusable skills. This part is evaluated by public agent benchmarks such as MCP-Atlas  $[2]$ , Toolathlon  $[31]$ , and SkillsBench  $[32]$ , together with SeedClawBench, a Seed-developed benchmark for realistic user-facing agent tasks. Together, these benchmarks evaluate whether Seed2.1 can serve not only as a daily-life advisor, but also as a practical assistant capable of completing realistic user tasks.

评测范围: 自动评测套件覆盖复杂日常协助的两个互补方面. 第一是面向对话的日常咨询, 模型必须理解真实用户需求, 维持多轮上下文, 遵循用户偏好, 并给出实用建议. 这部分由 xDailyBench, Doubao Multi-Turn Bench 等 Seed 自研基准评估. 第二是工具增强的协助, 模型必须超越对话, 通过工具使用, 网页交互, 长程执行和可复用技能完成面向用户的任务. 这部分由 MCP-Atlas $[2]$, Toolathlon $[31]$, SkillsBench $[32]$ 等公开 Agent 基准评估, 另加 Seed 自研的 SeedClawBench, 用于真实面向用户的 Agent 任务. 这些基准合起来, 检验 Seed2.1 不仅能做日常生活顾问, 还能做完成真实用户任务的实用助手.

$xDailyBench$ xDailyBench is a Seed-developed benchmark for evaluating LLMs in real C-end daily scenarios. It is designed to address the gap between conventional academic benchmarks and real non-coding user experience, where tasks are often open-ended, ambiguous, personalized, and difficult to evaluate with a single exact-match metric. The benchmark is grounded in real user needs and covers more than 30 vertical scenarios across daily life, study and research, and white-collar work. It adopts rubric-based multi-dimensional

xDailyBench 是 Seed 自研基准, 用来评估 LLM 在真实 C 端日常场景中的表现. 它旨在弥补传统学术基准与真实非编程用户体验之间的差距: 这类任务往往开放, 含糊, 个性化, 很难用单一的精确匹配指标评估. 基准以真实用户需求为依据, 覆盖日常生活, 学习研究和白领工作中的 30 多个垂直场景. 它采用基于 rubric 的多维

<!-- page 10 of 73 -->

| Benchmark | GPT-5.5 | Claude-4.7 Opus | Gemini-3.1-Pro | Seed2.1 Turbo | Seed2.1 Pro |
| --- | --- | --- | --- | --- | --- |
| xDailyBench | 73.0 | 69.0 | 35.2 | 56.4 | 61.0 |
| Doubao Multi-Turn Bench | 62.5 | 49.8 | 52.0 | 49.0 | 52.5 |
| MCP-Atlas [2] | 81.6 | 79.1 | 78.2 | 80.3 | 83.8 |
| Toolathlon [31] | 55.6 | 52.8 | 48.8 | 49.1 | 50.6 |
| SeedClawBench | 66.4 | 64.1 | 57.1 | 63.8 | 66.6 |

Table 2 Automatic evaluation for complex daily-life consultation and tool-augmented assistance in Pass@1.

表 2 复杂日常生活咨询与工具增强协助的自动评测, 指标为 Pass@1.

evaluation to assess task completion, factual correctness, information coverage, practical usefulness, and other quality dimensions, while also supporting fine-grained capability diagnostics for model iteration.

评估, 考察任务完成度, 事实正确性, 信息覆盖, 实际有用程度等质量维度, 同时支持细粒度的能力诊断, 服务模型迭代.

Doubao Multi-Turn Bench Doubao Multi-Turn Bench is a Seed-developed benchmark constructed from large-scale real interactions between online users and Doubao models. Since raw online conversations contain many casual chats, single-turn questions, and simple queries, only a small subset is suitable for evaluating multi-turn dialogue quality and user preference alignment. We therefore design a filtering pipeline to identify conversations where users were dissatisfied with an AI response and where the dialogue itself reflects a realistic user need. The benchmark uses the historical conversation as context, asks the model to answer the turn where the user was dissatisfied, and evaluates the response with rubric-based criteria.

Doubao Multi-Turn Bench 是 Seed 自研基准, 构建自线上用户与豆包模型的大规模真实交互. 原始线上对话里有大量闲聊, 单轮提问和简单查询, 只有一小部分适合评估多轮对话质量和用户偏好对齐. 因此我们设计了一条过滤流程, 找出用户对 AI 回复不满意, 且对话本身反映真实用户需求的会话. 基准以历史对话为上下文, 要求模型回答用户不满意的那一轮, 并用基于 rubric 的标准评估回复.

SeedClawBench SeedClawBench is a Seed-developed internal benchmark for evaluating practical agentic assistance in OpenClaw-style user-facing scenarios. The benchmark contains 100 tasks constructed from Ark online usage logs and crowdsourced OpenClaw tasks, covering realistic workflows where an agent must call tools, use skills, process intermediate artifacts, and deliver a final result. Its task categories include data processing and analysis, finance and accounting, daily office work, daily-life assistance, system and feature development, creative design, and customer-service or sales scenarios, with data processing, daily office work, and daily-life tasks accounting for the majority of the benchmark. The benchmark is built from more than 5,000 online Ark tasks and more than 600 crowdsourced tasks: tasks are first automatically tagged by scenario, then manually rewritten according to task volume and difficulty requirements, and finally reviewed with task-specific rubrics and ground truth.

SeedClawBench 是 Seed 自研的内部基准, 用来评估 OpenClaw 风格面向用户场景下的实用 Agent 协助能力. 基准包含 100 个任务, 构建自 Ark 线上使用日志和众包 OpenClaw 任务, 覆盖 Agent 必须调用工具, 使用技能, 处理中间产物并交付最终结果的真实工作流. 任务类别包括数据处理与分析, 财务与会计, 日常办公, 日常生活协助, 系统与功能开发, 创意设计, 以及客服或销售场景, 其中数据处理, 日常办公和日常生活任务占多数. 基准由 5,000 多个 Ark 线上任务和 600 多个众包任务构建: 任务先按场景自动打标, 再按任务量和难度要求人工改写, 最后配上任务专属 rubric 和标准答案进行审核.

SeedClawBench uses an Agent-as-Judge automatic evaluation protocol. The judge reads the agent transcript, tool trace, final deliverable, and external state snapshots, then calls read-only tools to collect evidence for each rubric item and outputs a binary judgment with an evidence chain. Since OpenClaw tasks may produce heterogeneous artifacts such as PDFs, spreadsheets, images, and videos, the evaluation system provides corresponding evaluation skills so that the judge can inspect task outputs when needed. The evaluation uses separate internal text and multimodal judging pipelines, rather than relying on a single generic judge for all artifact types. In an initial human-machine agreement study over 37 tasks and 262 comparable rubric items, the automatic judge achieved $89.69\%$ agreement with human annotation, measured as the number of matched rubric judgments divided by the total number of rubric items.

SeedClawBench 采用 Agent-as-Judge 自动评估协议. 评判者读取 Agent 的对话记录, 工具轨迹, 最终交付物和外部状态快照, 然后调用只读工具为每个 rubric 条目收集证据, 输出带证据链的二元判断. 由于 OpenClaw 任务可能产出 PDF, 表格, 图像, 视频等异构产物, 评估系统提供相应的评估技能, 让评判者在需要时检查任务输出. 评估使用相互独立的内部文本评判流程和多模态评判流程, 而不是用一个通用评判者处理所有产物类型. 在一项覆盖 37 个任务, 262 个可比 rubric 条目的初步人机一致性研究中, 自动评判者与人工标注的一致率为 $89.69\%$, 计算方式是判断一致的 rubric 条目数除以 rubric 条目总数.

> **拆开:** 表 2 里 SeedClawBench 上 Seed2.1-Pro 66.6 对 GPT-5.5 66.4, 这 0.2 分的领先在这个评判协议下站得住吗?
> 很难说站得住. 基准只有 100 个任务, 0.2 分相当于零点几个任务; 自动评判与人工的一致率是 89.69%, 意味着约每 10 个 rubric 判断里有 1 个与人不同, 而这个一致率只在 37 个任务, 262 个条目上测过. 表 2 注明的是 Pass@1, 没给多次运行的方差. 所以表 2 这一行更像 「Seed2.1-Pro, GPT-5.5, Claude-4.7 Opus (64.1) 同档」, 不宜读成领先.

#### 2.3.2 Results 结果

As shown in Table 2, Seed2.1 demonstrates strong capability in complex daily-life consultation and tool-augmented assistance. On tool-use benchmarks, Seed2.1-Pro is particularly competitive: it achieves the highest listed score on MCP-Atlas, reaching 83.8 and outperforming GPT-5.5, Claude-4.7-Opus, and Gemini-3.1-Pro. It also attains a competitive score on Toolathlon, benefiting from Seed2.1's continual, scalable environment learning [17]. Beyond these, it leads on SeedClawBench with 66.6, slightly above GPT-5.5 at 66.4 and Claude-4.7-Opus at 64.1, showing strong performance on realistic OpenClaw-style user-facing agent tasks. Seed2.1-Turbo is already competitive on MCP-Atlas with 80.3, exceeding Claude-4.7-Opus and Gemini-3.1-Pro, while Seed2.1-Pro further strengthens this advantage.

如表 2 所示, Seed2.1 在复杂日常生活咨询和工具增强协助上能力很强. 在工具使用基准上 Seed2.1-Pro 尤其有竞争力: 它在 MCP-Atlas 上以 83.8 取得表中最高分, 超过 GPT-5.5, Claude-4.7-Opus 和 Gemini-3.1-Pro. 它在 Toolathlon 上也取得有竞争力的分数, 这得益于 Seed2.1 持续, 可扩展的环境学习 [17]. 此外, 它以 66.6 领先 SeedClawBench, 略高于 GPT-5.5 的 66.4 和 Claude-4.7-Opus 的 64.1, 说明它在真实 OpenClaw 风格面向用户的 Agent 任务上表现强劲. Seed2.1-Turbo 在 MCP-Atlas 上已有 80.3, 超过 Claude-4.7-Opus 和 Gemini-3.1-Pro, Seed2.1-Pro 则进一步扩大了这一优势.

<!-- page 11 of 73 -->

| Benchmark | Metric | GPT-5.5 | Claude-4.7 Opus | Gemini-3.1 Pro | Seed2.1 Turbo | Seed2.1 Pro |
| --- | --- | --- | --- | --- | --- | --- |
| Claw-Eval [Multimodal] [76] | Pass^3 | 43.0 | 44.0 | 27.0 | 46.0 | 51.0 |
| Office QA Pro [Multimodal] [41] | Avg Score | 69.5 | 76.5 | 72.5 | 71.1 | 72.2 |
| WildClawBench [16] | Avg Score | 65.6 | 67.0 | 61.1 | 62.8 | 61.7 |
| Image2FloorPlan (Inhouse) | Avg Score | 50.7 | 50.2 | 55.1 | 35.9 | 48.0 |

Table 3 Multimodal-agent evaluation. Claw-Eval reports Pass^3 (all-three-pass); all other benchmarks report average score. Image2Floorplan is a Seed-developed in-house benchmark.

表 3 多模态 Agent 评测. Claw-Eval 报告 Pass^3 (三次全部通过); 其余基准报告平均分. Image2Floorplan 是 Seed 自研的内部基准.

On conversation-oriented daily consultation, Seed2.1-Pro shows clear progress toward frontier-level user assistance. On xDailyBench, it reaches 61.0, substantially outperforming Gemini-3.1-Pro at 35.2 and narrowing the gap to Claude-4.7-Opus. On Doubao Multi-Turn Bench, Seed2.1-Pro reaches 52.5, matching or exceeding the listed Gemini-3.1-Pro and Claude-4.7-Opus results. On SkillsBench, Seed2.1-Pro reaches 60.4, close to Gemini-3.1-Pro and Claude-4.7-Opus, indicating solid skill-use and skill-composition capability in practical workflows. Overall, these results show that Seed2.1 is not only a conversational advisor for daily-life scenarios, but also a capable tool-augmented assistant that can complete realistic user tasks with strong end-to-end performance.

在面向对话的日常咨询上, Seed2.1-Pro 向前沿水平的用户协助迈出了明显一步. 它在 xDailyBench 上达到 61.0, 大幅领先 Gemini-3.1-Pro 的 35.2, 并缩小了与 Claude-4.7-Opus 的差距. 在 Doubao Multi-Turn Bench 上, Seed2.1-Pro 达到 52.5, 持平或超过表中 Gemini-3.1-Pro 和 Claude-4.7-Opus 的结果. 在 SkillsBench 上, Seed2.1-Pro 达到 60.4, 接近 Gemini-3.1-Pro 和 Claude-4.7-Opus, 说明它在实际工作流中具备扎实的技能使用和技能组合能力. 总体来看, 这些结果表明 Seed2.1 不只是日常生活场景的对话顾问, 也是能以强劲端到端表现完成真实用户任务的工具增强助手.

> **对一下:** 这段引用的 SkillsBench 60.4, 以及 「接近 Gemini-3.1-Pro 和 Claude-4.7-Opus」, 在表 2 哪一行?
> 表 2 只有 xDailyBench, Doubao Multi-Turn Bench, MCP-Atlas, Toolathlon, SeedClawBench 五行, 没有 SkillsBench, 对手分数也无从核对. 同一段里 「缩小了与 Claude-4.7-Opus 的差距」 在表 2 上是 61.0 对 69.0, GPT-5.5 更高, 为 73.0; Doubao Multi-Turn Bench 上 GPT-5.5 的 62.5 比 Seed2.1-Pro 的 52.5 高 10 分, 正文也没写.

### 2.4 Multimodal Agents 多模态 Agent

Real-world agent tasks are increasingly rich-media at both the input and output ends: users provide documents, charts, screenshots, photographs, and videos, while the final deliverable may be a rendered document, poster, layout, or generated video that must be created, stored, and verified as media rather than plain text. Existing harnesses, however, are mostly built around text-and-tool loops and adapt poorly to such settings: inputs are often down-sampled or truncated, and rich-media outputs are difficult to generate and inspect. As a result, perception and media handling, rather than reasoning alone, become the bottleneck. We therefore evaluate Seed2.1 as a multimodal agent: a system that can read, reason over, and act on heterogeneous media within a long-horizon tool-using loop, instead of answering isolated visual questions.

真实 Agent 任务的输入端和输出端都越来越富媒体化: 用户提供文档, 图表, 截图, 照片和视频, 最终交付物可能是渲染好的文档, 海报, 版式或生成的视频, 必须作为媒体而非纯文本来创建, 存储和核验. 然而现有 harness 大多围绕 「文本 + 工具」 循环构建, 很难适应这类场景: 输入常被降采样或截断, 富媒体输出难以生成和检查. 结果是感知和媒体处理, 而不只是推理, 成了瓶颈. 因此我们把 Seed2.1 作为多模态 Agent 来评估: 它是一个能在长程工具循环里读取异构媒体, 对其推理并据此行动的系统, 而不是回答孤立视觉问题的模型.

The evaluation is organized around three complementary task types that together cover the multimodal-agent capability surface. Visual document understanding tasks require the agent to read and reason over heterogeneous documents, including PDFs, slides, charts, tables, and screenshots, and to locate, integrate, and act on visual evidence across multiple turns. Open-ended real-world agent work reflects how users delegate tasks in practice, covering productivity, coding, search, social, creative, and safety scenarios. Each task presents an open-ended goal that the agent must decompose and complete end to end, jointly testing multimodal perception, tool use, and long-horizon execution. Spatial-structure generation requires the agent to infer global spatial structure from many local visual views and output it in a precise, machine-checkable form, covering capabilities not captured by document or GUI tasks alone.

评测围绕三类互补任务组织, 合起来覆盖多模态 Agent 的能力面. 视觉文档理解任务要求 Agent 读取并推理 PDF, 幻灯片, 图表, 表格, 截图等异构文档, 在多轮中定位, 整合视觉证据并据此行动. 开放式真实 Agent 工作反映用户在实践中如何委派任务, 覆盖生产力, 编程, 搜索, 社交, 创意和安全场景. 每个任务给出一个开放目标, Agent 必须拆解并端到端完成, 同时考察多模态感知, 工具使用和长程执行. 空间结构生成要求 Agent 从大量局部视图推断全局空间结构, 并以精确, 可机器校验的形式输出, 覆盖文档任务或 GUI 任务单独测不到的能力.

#### 2.4.1 The Multimodal Agent Harness 多模态 Agent harness

All benchmarks are evaluated under a unified inhouse multimodal agent harness, exercising perception, tool use, code execution, and long-horizon control end to end rather than as isolated visual question answering. Two design choices are central to this setup.

所有基准都在一个统一的内部多模态 Agent harness 下评估, 端到端地考察感知, 工具使用, 代码执行和长程控制, 而不是做孤立的视觉问答. 这套设置有两个核心设计.

High-resolution perception tools. Instead of relying on low-resolution thumbnails or sparsely selected frames, the harness provides dedicated media-perception tools that render documents and pages at high resolution and sample videos densely, keeping fine print, small chart labels, and crowded layouts legible. Our analysis shows that perception fidelity is often a key factor in multimodal-agent stability: improving the perception path measurably increases multi-sample consistency (Pass^k), even when single-pass solvability remains unchanged.

高分辨率感知工具. harness 不依赖低分辨率缩略图或稀疏抽帧, 而是提供专门的媒体感知工具, 以高分辨率渲染文档和页面, 对视频做密集采样, 让小字, 图表小标签和拥挤版式保持可读. 我们的分析表明, 感知保真度往往是多模态 Agent 稳定性的关键因素: 改进感知通路能可测地提高多次采样的一致性 (Pass^k), 即使单次可解率不变.

Multimodal context management. Since high-fidelity media is costly in context, the harness loads multimodal content progressively rather than all at once. The agent reads images and document pages on demand and in

多模态上下文管理. 高保真媒体在上下文里代价很高, 所以 harness 渐进地加载多模态内容, 而不是一次性全部载入. Agent 按需读取图像和文档页面, 并且

<!-- page 12 of 73 -->

batches across turns; videos are first covered coarsely, with denser frames loaded only when closer inspection is needed. This keeps each turn within a manageable context budget while preserving access to full visual detail.

跨多轮分批读取; 视频先做粗粒度覆盖, 只在需要细看时才加载更密的帧. 这样每一轮都保持在可控的上下文预算内, 同时保留访问全部视觉细节的能力.

#### 2.4.2 Results 结果

As shown in Table 3, Seed2.1 is a strong multimodal agent across document understanding, open-ended real-world tasks, and spatial generation. It shows particularly strong reliability on Claw-Eval [MM], where Seed2.1-Pro achieves the best Pass^3 result among all listed models. On Office QA Pro [MM], Seed2.1-Pro performs close to the leading model, while Seed2.1-Turbo also surpasses GPT-5.5, though grounded enterprise-document understanding remains an area for further improvement. On WildClawBench, both Seed2.1 variants are competitive with frontier models, reflecting strong end-to-end performance on open-ended real-world agent tasks. On Image2Floorplan, Seed2.1-Pro improves substantially over Seed2.1-Turbo and approaches the strongest frontier models, suggesting clear progress in spatial-structure generation while leaving room for further gains in complex spatial reconstruction.

如表 3 所示, Seed2.1 在文档理解, 开放式真实任务和空间生成上都是很强的多模态 Agent. 它在 Claw-Eval [MM] 上表现出特别强的可靠性, Seed2.1-Pro 在所有列出模型中取得最好的 Pass^3. 在 Office QA Pro [MM] 上, Seed2.1-Pro 接近领先模型, Seed2.1-Turbo 也超过了 GPT-5.5, 不过有依据的企业文档理解仍有提升空间. 在 WildClawBench 上, 两个 Seed2.1 变体都与前沿模型相当, 反映出在开放式真实 Agent 任务上较强的端到端表现. 在 Image2Floorplan 上, Seed2.1-Pro 相比 Seed2.1-Turbo 大幅提升, 接近最强的前沿模型, 说明空间结构生成有明显进步, 复杂空间重建仍有提升余地.

> **再看:** 表 3 的 Office QA Pro [Multimodal] 和表 1 的 OfficeQA-Pro 引的是同一篇 [41], 两张表的分数为什么不一样?
> 对手两列相同, 自家和 GPT 不同: Claude-4.7 Opus 都是 76.5, Gemini-3.1 Pro 都是 72.5; GPT-5.5 从表 1 的 62.9 变成表 3 的 69.5, Seed2.1 Turbo 从 62.8 变成 71.1, Pro 从 70.9 变成 72.2. 表 3 走的是 §2.4.1 那套高分辨率感知工具的内部多模态 harness, 表 1 注明 OfficeQA-Pro 「含内部实现和适配」. 可见 Claude 和 Gemini 两列很可能是沿用的同一组数, 只有 GPT-5.5 和 Seed2.1 在新 harness 下重跑过. 正文 「Turbo 超过 GPT-5.5」 只在表 3 成立 (71.1 对 69.5), 在表 1 不成立 (62.8 对 62.9).

Image2Floorplan. Image2Floorplan evaluates spatial-structure generation. It is a Seed-developed in-house benchmark in which each task provides multiple real interior photographs of an apartment, covering its rooms and their connections, and asks the agent to reconstruct the floor plan. The expected output is a structured room-connectivity graph rather than a free-form image, specifying the rooms and their adjacency, door, and passage relationships. Predictions are compared with human-annotated ground-truth graphs using a weighted graph-similarity metric that accounts for room matching, connectivity, and overall topology, and are normalized against a baseline so that the final score reflects genuine reconstruction quality.

Image2Floorplan. Image2Floorplan 评估空间结构生成. 这是 Seed 自研的内部基准, 每个任务提供一套公寓的多张真实室内照片, 覆盖各个房间及其连接, 要求 Agent 重建户型图. 期望输出是结构化的房间连通图而不是自由绘制的图像, 需写明房间及其相邻, 门和通道关系. 预测结果与人工标注的真值图比较, 使用加权图相似度指标, 兼顾房间匹配, 连通性和整体拓扑, 并相对一个基线做归一化, 使最终分数反映真实的重建质量.

### 2.5 Generalist Computer-Use Agents 通用计算机使用 Agent

In Seed2.1's exploration of professional productivity, we aim to move beyond agents specialized for isolated tasks or fixed environments toward Generalist Computer-Use Agents [50]: systems capable of completing complex workflows across chat, search, browsers, code repositories, files, GUIs, and external tools. Real-world tasks require an agent to understand goals, gather information, perceive screen and interface states, manipulate GUIs, write and execute code, call tools and MCP services, and verify progress over long horizons. From this perspective, the limitations of single-paradigm agents become clear: coding or CLI agents are strong at planning, coding, and tool use but remain brittle on visual interfaces and unexpected screen states, while GUI agents can operate software visually but lack efficient access to code, files, commands, and structured tools. Seed2.1 is therefore designed as a unified digital productivity system that coordinates perception, reasoning, control, action, and execution under a single policy, learning when to see, click, search, code, or call tools, and composing these capabilities into stable, recoverable execution trajectories.

在 Seed2.1 对专业生产力的探索中, 我们希望越过只擅长孤立任务或固定环境的 Agent, 走向通用计算机使用 Agent (Generalist Computer-Use Agents) [50]: 能在聊天, 搜索, 浏览器, 代码仓库, 文件, GUI 和外部工具之间完成复杂工作流的系统. 真实任务要求 Agent 理解目标, 收集信息, 感知屏幕和界面状态, 操作 GUI, 编写并执行代码, 调用工具和 MCP 服务, 并在长程中核验进度. 从这个角度看, 单一范式 Agent 的局限很明显: 编程或 CLI Agent 擅长规划, 写代码和用工具, 但面对视觉界面和意外屏幕状态时很脆弱; GUI Agent 能以视觉方式操作软件, 却缺少对代码, 文件, 命令和结构化工具的高效访问. 因此 Seed2.1 被设计成一个统一的数字生产力系统, 在单一策略下协调感知, 推理, 控制, 动作和执行, 学会何时看, 点, 搜, 写代码或调工具, 并把这些能力组合成稳定, 可恢复的执行轨迹.

We evaluate this capability on public GUI and computer-use benchmarks together with CreativeWork, a Seed-developed benchmark for hybrid GUI-and-MCP productivity tasks. OSWorld evaluates desktop computer control in real operating-system environments [70], MobileWorld evaluates mobile GUI operation [29] with MCP test split excluded due to deployment issues, and GameWorld evaluates multimodal interaction in browser-game environments [42].

我们在公开的 GUI 和计算机使用基准上评估这一能力, 另加 CreativeWork, 一个 Seed 自研的 GUI 与 MCP 混合生产力任务基准. OSWorld 评估真实操作系统环境中的桌面计算机控制 [70]; MobileWorld 评估移动端 GUI 操作 [29], 其中 MCP 测试划分因部署问题被排除; GameWorld 评估浏览器游戏环境中的多模态交互 [42].

Importantly, we run these benchmarks under the Generalist Computer-Use Agent setting rather than a GUI-only one: beyond mouse-and-keyboard control, the agent is also granted the general, code-agent-style actions natural to each environment—for example, on OSWorld it may issue Bash commands, run scripts, and manipulate the file system alongside GUI operations. CreativeWork complements these public benchmarks by targeting real productivity scenarios that demand coordinated GUI and MCP use. It spans three representative environments—Notion, Canva, and Figma—covering document management, visual design, and interface editing, and rather than testing GUI or tool use in isolation, each task asks the agent to interpret an open-ended goal, decompose it, and decide on its own when to act through a tool call and when to fall back to the interface. By construction, the two modalities are tightly interleaved: MCP handles structured operations such as creating pages, duplicating documents, generating assets, and editing object properties, while the GUI carries what tools cannot—reading layouts, navigating property panels, resolving spatial references, inspecting visual results, and confirming the final state on screen.

重要的是, 我们在通用计算机使用 Agent 设定下而非仅 GUI 设定下运行这些基准: 除鼠标键盘控制外, Agent 还获得各环境里天然存在的通用, 编程 Agent 式动作, 例如在 OSWorld 上, 它可以在 GUI 操作之外发出 Bash 命令, 运行脚本, 操作文件系统. CreativeWork 瞄准需要协调使用 GUI 和 MCP 的真实生产力场景, 补充了这些公开基准. 它覆盖三个代表性环境: Notion, Canva 和 Figma, 涉及文档管理, 视觉设计和界面编辑. 它不孤立地测试 GUI 或工具使用, 每个任务都要求 Agent 理解开放目标, 拆解它, 并自行决定何时通过工具调用行动, 何时退回界面操作. 按设计, 两种模态紧密交织: MCP 处理结构化操作, 如新建页面, 复制文档, 生成素材, 编辑对象属性; GUI 承担工具做不到的部分, 如读取版式, 浏览属性面板, 解析空间指代, 检查视觉结果, 并在屏幕上确认最终状态.

<!-- page 13 of 73 -->

![Chart block](images/p13-figure-5-efficiency-of-the-generalist-computer-use.png)

Figure 5 Efficiency of the Generalist Computer-Use Agent (CUA) setting on OSWorld. For each model, the arrow points from the GUI-only operating point (open marker) to the Generalist CUA setting (filled marker), in which the agent may also issue commands and call tools. Both models move up and to the left: higher success rate with fewer steps per task.

图 5 OSWorld 上通用计算机使用 Agent (CUA) 设定的效率. 对每个模型, 箭头从仅 GUI 的工作点 (空心标记) 指向通用 CUA 设定 (实心标记), 后者允许 Agent 同时发出命令和调用工具. 两个模型都向左上移动: 成功率更高, 每个任务的步数更少.

#### 2.5.1 Results 结果

As shown in Table 4, Seed2.1 demonstrates strong capability as a unified digital agent across desktop, mobile, creative-productivity, and browser-game environments. On OSWorld, Seed2.1-Pro reaches 78.2, outperforming 3.1-Pro and approaching GPT-5.5, showing strong general computer-use capability in realistic operating-system workflows. On MobileWorld GUI-only, both Seed2.1-Turbo and Seed2.1-Pro substantially outperform the listed frontier baselines, with Seed2.1-Pro reaching 73.3 compared with GPT-5.5 at 62.4, Claude-4.7-Opus at 56.4, and 3.1-Pro at 58.1. On CreativeWork, Seed2.1-Pro achieves the highest listed score at 42.5, while Seed2.1-Trubo remains above GPT-5.5, Claude-4.7-Opus, and 3.1-Pro, indicating strong capability in hybrid GUI-and-MCP productivity workflows. On GameWorld, Seed2.1-Pro outperforms Claude-4.7-Opus and 3.1-Pro, showing that Seed2.1 can also handle interactive multimodal game environments. Overall, these results suggest that Seed2.1 is not limited to text, tools, or code alone, but can coordinate GUI control, tool use, multimodal perception, and long-horizon execution in unified digital-agent workflows.

如表 4 所示, Seed2.1 作为统一的数字 Agent, 在桌面, 移动端, 创意生产力和浏览器游戏环境中都表现出很强的能力. 在 OSWorld 上, Seed2.1-Pro 达到 78.2, 超过 3.1-Pro, 接近 GPT-5.5, 显示出在真实操作系统工作流中较强的通用计算机使用能力. 在 MobileWorld 仅 GUI 设定下, Seed2.1-Turbo 和 Seed2.1-Pro 都大幅超过列出的前沿基线, Seed2.1-Pro 达到 73.3, 相比之下 GPT-5.5 为 62.4, Claude-4.7-Opus 为 56.4, 3.1-Pro 为 58.1. 在 CreativeWork 上, Seed2.1-Pro 以 42.5 取得表中最高分, Seed2.1-Trubo 也高于 GPT-5.5, Claude-4.7-Opus 和 3.1-Pro, 说明它在 GUI 与 MCP 混合生产力工作流上能力很强. 在 GameWorld 上, Seed2.1-Pro 超过 Claude-4.7-Opus 和 3.1-Pro, 说明 Seed2.1 也能应对交互式多模态游戏环境. 总体来看, 这些结果表明 Seed2.1 不局限于文本, 工具或代码, 而能在统一的数字 Agent 工作流里协调 GUI 控制, 工具使用, 多模态感知和长程执行.

> **看表:** 正文的 OSWorld 78.2 和 MobileWorld 73.3, 对得上表 4 吗?
> 对不上. 表 4 的 Seed2.1 Pro 是 OSWorld 78.8, MobileWorld 73.1; MobileWorld 三个对手在表 4 是 GPT-5.5 54.7, Claude-4.7 Opus 57.1, Gemini-3.1 Pro 48.4, 正文写的是 62.4, 56.4, 58.1, 三个数全不同. 表 4 的 OSWorld 78.8 与图 5 的通用 CUA 工作点一致, 所以表是这一节的准数. 还有一处被略过: 表 4 OSWorld 最高的是 Claude-4.7 Opus 的 82.8, 正文只说 「接近 GPT-5.5」. 另外正文说 MobileWorld 是 「仅 GUI」, 表 4 的标题却是通用 CUA 评测, 这一行到底在哪个设定下跑的, 卡里没有交代清楚.

| Benchmark | GPT-5.5 | Claude-4.7 Opus | Gemini-3.1 Pro | Seed2.1 Turbo | Seed2.1 Pro |
| --- | --- | --- | --- | --- | --- |
| OSWorld [70] | 78.7 | 82.8 | 76.2 | 76.4 | 78.8 |
| MobileWorld [29] | 54.7 | 57.1 | 48.4 | 70.0 | 73.1 |
| CreativeWork | 30.5 | 28.3 | 27.4 | 34.5 | 42.5 |
| GameWorld [42] | 34.1 | 26.5 | 21.2 | 25.9 | 31.2 |

Table 4 Generalist Computer-Use Agent evaluation. CreativeWork is a Seed-developed benchmark for hybrid GUI-and-MCP productivity tasks.

表 4 通用计算机使用 Agent 评测. CreativeWork 是 Seed 自研的 GUI 与 MCP 混合生产力任务基准.

#### 2.5.2 Why the Generalist setting matters for deployment. 通用设定为什么对部署重要

Figure 5 compares two regimes for the same model on OSWorld: GUI-only, and the Generalist Computer-Use Agent (CUA) setting, where the agent may also issue commands and call tools. For both models, the Generalist setting moves the operating point up and to the left—higher success at lower cost. Success rises from 73.2% to 76.4% (Turbo) and 72.6% to 78.8% (Pro), while average steps drop from 27.5 to 22.3 (-18.7%) and 28.2 to 24.2 (-16%). The agent thus solves more tasks with roughly one-fifth fewer actions. This is decisive for real

图 5 比较同一模型在 OSWorld 上的两种设定: 仅 GUI, 以及允许 Agent 同时发出命令和调用工具的通用计算机使用 Agent (CUA) 设定. 对两个模型, 通用设定都把工作点移向左上: 成本更低, 成功率更高. 成功率从 73.2% 升到 76.4% (Turbo), 从 72.6% 升到 78.8% (Pro); 平均步数从 27.5 降到 22.3 (-18.7%), 从 28.2 降到 24.2 (-16%). 因此 Agent 用少了约五分之一的动作解出了更多任务. 这对真实

<!-- page 14 of 73 -->

deployment, not just leaderboards: every step on a live system adds latency, cost, and another chance for an irreversible error, so shorter trajectories are themselves more reliable. A single command often replaces a long, fragile chain of GUI clicks. That the trend holds across two model scales indicates a structural property of the paradigm: giving the agent non-GUI actions and letting it choose when to use them makes it both more capable and more efficient.

部署有决定性意义, 而不只是排行榜上的事: 在线上系统里每多一步, 就多一分延迟, 成本和一次不可逆错误的机会, 所以更短的轨迹本身就更可靠. 一条命令常常能替代一长串脆弱的 GUI 点击. 这个趋势在两个模型规模上都成立, 说明这是范式本身的结构性质: 给 Agent 非 GUI 动作, 并让它自己选择何时使用, 会让它既更强也更高效.

> **停一下:** 图 5 的步数从 27.5 到 22.3 记为 -18.7%, 从 28.2 到 24.2 记为 -16%, 再概括成 「约五分之一」, 算得过来吗?
> 按图 5 给的两端值自己算: (27.5 - 22.3) / 27.5 约为 18.9%, (28.2 - 24.2) / 28.2 约为 14.2%, 都与正文标的百分比不一致, Pro 的差得更多; 两者平均约 16.5%, 说 「五分之一」 偏高. 图 5 还有一个容易漏看的点: 仅 GUI 时 Pro 的 72.6% 低于 Turbo 的 73.2%, Pro 的优势是在允许命令和工具之后才出现的, 说明表 4 的 OSWorld 差距主要来自 harness 设定, 不全是模型本身.

### 2.6 Case Study 案例研究

The following case studies illustrate Seed2.1's general-agent capability in realistic high-value workflows. To keep the main text focused, we summarize the task requirements and model behavior here, while the corresponding visual showcases are provided in Appendix D.

以下案例研究展示 Seed2.1 在真实高价值工作流中的通用 Agent 能力. 为让正文聚焦, 这里只概述任务要求和模型行为, 对应的可视化展示放在附录 D.

#### 2.6.1 Educational Task 教育任务

As shown in Figure 24, we evaluate whether Seed2.1 can complete a document-centric academic task that requires multi-document reasoning, precise calculation, and layout-preserving PDF editing. Given a GPA policy document, a transcript, and a curriculum, the model must map credits to 66 courses, handle unmatched electives, convert five-level grades into percentage scores, compute total credits and GPA, and fill only the blank fields without modifying the original transcript format.

如图 24 所示, 我们评估 Seed2.1 能否完成一个以文档为中心的学业任务, 它需要多文档推理, 精确计算和保持版式的 PDF 编辑. 给定一份 GPA 政策文档, 一份成绩单和一份培养方案, 模型必须为 66 门课程对应学分, 处理无法匹配的选修课, 把五级制成绩换算成百分制, 计算总学分和 GPA, 并且只填写空白栏, 不改动原成绩单格式.

#### 2.6.2 Financial Task 金融任务

As shown in Figure 25, we evaluate whether Seed2.1 can perform structured financial risk analysis over a constrained equity universe. The task requires selecting non-financial CSI 500 constituents as of April 24, 2026, excluding banking and non-bank financial firms, extracting 2025 annual-report indicators, combining them with latest market capitalization, and computing the Altman Z-score for each stock. This tests whether the model can enforce domain-specific screening rules, derive intermediate accounting variables, and rank companies by financial distress risk.

如图 25 所示, 我们评估 Seed2.1 能否在受约束的股票池上做结构化金融风险分析. 任务要求选出截至 2026 年 4 月 24 日的中证 500 非金融成分股, 排除银行和非银金融企业, 提取 2025 年年报指标, 结合最新市值, 为每只股票计算 Altman Z-score. 这考察模型能否执行领域专属的筛选规则, 推导中间会计变量, 并按财务困境风险给公司排序.

#### 2.6.3 Legal Task 法律任务

As shown in Figure 26, we evaluate whether Seed2.1 can support a professional bankruptcy reorganization workflow by converting fragmented commercial facts into an actionable legal memorandum. The task requires analyzing Ningbo Obsidian's reorganization timeline, claim declaration deadline, creditor meeting schedule, and three transaction contracts involving matured debt, unmatured equipment payment, overdue interest, and a reciprocal rebate obligation. This tests whether the model can map factual events to bankruptcy-law consequences, including claim filing, interest suspension, unmatured-claim acceleration, and statutory set-off.

如图 26 所示, 我们评估 Seed2.1 能否支持专业的破产重整工作流, 把零散的商业事实转成可操作的法律备忘录. 任务要求分析宁波 Obsidian 的重整时间线, 债权申报截止日, 债权人会议安排, 以及三份交易合同, 涉及到期债务, 未到期设备款, 逾期利息和一项互负的返利义务. 这考察模型能否把事实事件对应到破产法后果, 包括债权申报, 停止计息, 未到期债权加速到期和法定抵销.

#### 2.6.4 Medical Task 医疗任务

As shown in Figure 27, we evaluate whether Seed2.1 can support complex clinical decision-making in a neuropathological case requiring integrated diagnosis and treatment planning. The case involves a 38-year-old female with progressive language disturbance and bradyphrenia, MRI evidence of a deep left temporal mass-like lesion near the language functional area, and intraoperative pathology showing thin-walled sinus-like vascular spaces with hemorrhage of different ages, perivascular hemosiderin deposition, and gliosis, without neoplastic glial proliferation. This tests whether the model can synthesize clinical presentation, neuroimaging, lesion location, and microscopic pathology to identify the most precise disease entity rather than relying on broad descriptive labels.

如图 27 所示, 我们评估 Seed2.1 能否在一个需要综合诊断和治疗规划的神经病理病例中支持复杂的临床决策. 病例为 38 岁女性, 进行性语言障碍和思维迟缓, MRI 显示左颞深部靠近语言功能区的占位样病变, 术中病理见薄壁窦样血管腔伴不同时期出血, 血管周围含铁血黄素沉积和胶质增生, 没有肿瘤性胶质增殖. 这考察模型能否综合临床表现, 神经影像, 病变部位和镜下病理, 识别最精确的疾病实体, 而不是停留在宽泛的描述性标签上.

#### 2.6.5 Operations Analytic Task 运营分析任务

As shown in Figure 28, we evaluate whether Seed2.1 can transform fragmented Q1 operational data into a board-ready, formula-driven Excel analysis system. The task requires operating on eight raw worksheets covering nurse profiles, care packages, clients, contracts, costs, inquiries, early terminations, and attendance, while preserving the original data sheets. This tests whether the model can establish a governed analytical

如图 28 所示, 我们评估 Seed2.1 能否把零散的一季度运营数据转成可交董事会, 由公式驱动的 Excel 分析系统. 任务要求在八张原始工作表上操作, 涵盖护士档案, 护理套餐, 客户, 合同, 成本, 咨询, 提前解约和出勤, 同时保留原始数据表. 这考察模型能否建立一个受治理的分析

<!-- page 15 of 73 -->

backend, including standardized nurse IDs, cleaned names, normalized hiring dates, tier coefficients, tenure calculations, and visual quality-control flags.

后台, 包括标准化的护士 ID, 清洗后的姓名, 规范化的入职日期, 等级系数, 工龄计算, 以及可视化的质量控制标记.

#### 2.6.6 Airline Operations Task 航空运营任务

As shown in Figure 34, we evaluate whether Seed2.1 can transform large, multi-source airline operations data into a traceable Q4 executive review workbook. The task requires preserving the original ten data tables while building formula-driven analysis sheets for 300 flight records, including flight-number normalization, date and time standardization, overnight duration calculation, aircraft-code cleaning, route and airport mapping, seat-capacity lookup, and Passenger Load Factor computation. This tests whether the model can convert natural-language operational requirements into maintainable Excel logic rather than producing a static summary.

如图 34 所示, 我们评估 Seed2.1 能否把大规模, 多来源的航空运营数据转成可追溯的第四季度高管复盘工作簿. 任务要求保留原始的十张数据表, 同时为 300 条航班记录构建由公式驱动的分析表, 包括航班号规范化, 日期和时间标准化, 跨夜时长计算, 机型代码清洗, 航线和机场映射, 座位容量查找, 以及客座率计算. 这考察模型能否把自然语言的运营需求转成可维护的 Excel 逻辑, 而不是输出一份静态摘要.

> **回看:** 航空运营任务指向图 34, 附录里的图 34 是这个案例吗?
> 不是. 附录 E 的图 34 标题是 「Seed2.1 leverages the code tool to better interpret images」, 属于视觉工具展示; 航空运营案例在附录 D 的图 29, 标题为 Agent Startup Bench airline-operations task. §2.6 其余几个案例依次指向图 24 到图 28 和图 30, 只有这一处跳号, 应读作图 29.

#### 2.6.7 Personal Government-Service Scheduling Task 个人政务办理排程任务

As shown in Figure 30, we evaluate whether Seed2.1 can convert a complex personal administrative scenario into an executable government-service handling plan. The case involves residence permit application, social insurance certificate printing, second-hand housing title transfer, utility handover, household registration relocation across provinces, Shanghai-to-Hefei housing provident fund transfer, and ID-card renewal, all under a hard constraint of only three available half-day offline appointments before June 30, 2026. This tests whether the model can reason over official policy channels, jurisdictional differences, eligibility conditions, processing timelines, and dependency ordering across multiple public-service procedures.

如图 30 所示, 我们评估 Seed2.1 能否把一个复杂的个人行政事务场景转成可执行的政务办理方案. 案例涉及居住证申请, 社保证明打印, 二手房过户, 水电燃气过户, 跨省户口迁移, 上海到合肥的住房公积金转移和身份证换领, 硬约束是 2026 年 6 月 30 日前只有三个线下半天预约时段可用. 这考察模型能否围绕官方政策渠道, 辖区差异, 办理条件, 办理时限, 以及多项公共服务流程之间的依赖顺序进行推理.

## 3 Production Coding 生产级编程

During the iterative development of Seed 2.1, large-scale dogfooding was conducted among both internal and external developers. The model was continuously improved based on developer feedback, ultimately achieving significant gains in coding capabilities. In large-scale anonymous developer feedback, Seed 2.1 achieved a preference ranking superior to Claude Opus 4.6, reaching a level suitable for enterprise production use.

在 Seed 2.1 的迭代研发中, 我们在内部和外部开发者中开展了大规模内部试用. 模型根据开发者反馈持续改进, 最终在编程能力上取得显著提升. 在大规模匿名开发者反馈中, Seed 2.1 的偏好排名高于 Claude Opus 4.6, 达到适合企业生产使用的水平.

### 3.1 Crowdsourced Developer Evaluation 众包开发者评测

#### 3.1.1 Claude Code

During Seed 2.1 development, we invited Coding Plan developers to participate in crowdsourced evaluation on real development tasks. Developers uploaded code repositories, submitted realistic engineering requests, and compared outputs from anonymized models under the same repository, task requirement, and execution environment. In completion-quality preference, Seed2.1-Turbo achieved 100 wins / 19 ties / 59 losses against GLM 5.1 over 178 comparisons, corresponding to a $56.2\%$ win rate and a $+23.0$ percentage-point net win rate. Seed2.1-Pro achieved 136 wins / 26 ties / 68 losses against Opus 4.6 over 230 comparisons, corresponding to a $59.1\%$ win rate and a $+29.6$ percentage-point net win rate. These results suggest that Seed 2.1 models are more often preferred by developers for final completion quality in realistic coding workflows.

在 Seed 2.1 研发期间, 我们邀请 Coding Plan 开发者在真实开发任务上参与众包评测. 开发者上传代码仓库, 提交真实的工程需求, 并在相同仓库, 相同任务要求和相同执行环境下比较匿名模型的输出. 在完成质量偏好上, Seed2.1-Turbo 对 GLM 5.1 进行了 178 次比较, 结果为 100 胜 / 19 平 / 59 负, 对应 $56.2\%$ 的胜率和 $+23.0$ 个百分点的净胜率. Seed2.1-Pro 对 Opus 4.6 进行了 230 次比较, 结果为 136 胜 / 26 平 / 68 负, 对应 $59.1\%$ 的胜率和 $+29.6$ 个百分点的净胜率. 这些结果表明, 在真实编程工作流中, 开发者更常因最终完成质量而偏好 Seed 2.1 模型.

> **确认:** 胜率和净胜率是怎么算的, Turbo 和 Pro 两组能直接放在一起比吗?
> 用正文数字复算: 100 / 178 约为 56.2%, (100 - 59) / 178 约为 23.0%; 136 / 230 约为 59.1%, (136 - 68) / 230 约为 29.6%, 胜率的分母含平局. 但两组对手不同, Turbo 对的是 GLM 5.1, Pro 对的是 Opus 4.6, 不能据此说 Pro 比 Turbo 强. 这一节没有表或图, 数字只在正文里; 表 5 自动评测用的对手是 Claude-4.7 Opus, 与这里的 Opus 4.6 也不是同一个版本.

#### 3.1.2 Trae

Crowdsourced developer testing offers direct evidence of Seed2.1-Pro's usefulness in real engineering workflows, as shown in Figure 6. Conducted inside Trae, the evaluation drew on authentic tasks contributed by professional developers from their own repositories, closely mirroring day-to-day production work. Each task was executed with the same repository, prompt, and runtime setup, with model identities hidden from reviewers. Seed2.1-Pro was compared head-to-head against a strong frontier reference, Claude Opus 4.7, under a controlled preference protocol with multi-dimensional human ratings, ensuring that the results reflect genuine completion quality rather than surface-level impressions.

众包开发者测试为 Seed2.1-Pro 在真实工程工作流中的实用性提供了直接证据, 见图 6. 评测在 Trae 内进行, 使用专业开发者从自己仓库中贡献的真实任务, 贴近日常生产工作. 每个任务都在相同仓库, 相同提示词和相同运行设置下执行, 评审者看不到模型身份. Seed2.1-Pro 与一个强前沿参照 Claude Opus 4.7 一对一比较, 采用带多维人工评分的受控偏好协议, 保证结果反映的是真实完成质量, 而不是表面印象.

Across 167 valid head-to-head tasks, developer preference was nearly evenly split, with Seed2.1-Pro preferred in 81 cases and Claude Opus 4.7 in 86 cases. This corresponds to a $48.5\%$ win rate, placing Seed2.1-Pro at practical parity with Claude Opus 4.7 on production-grade tasks; the two models also achieved the same

在 167 个有效的一对一任务中, 开发者偏好几乎各半, Seed2.1-Pro 被偏好 81 次, Claude Opus 4.7 被偏好 86 次. 这对应 $48.5\%$ 的胜率, 表明在生产级任务上 Seed2.1-Pro 与 Claude Opus 4.7 实际上旗鼓相当; 两个模型在

<!-- page 16 of 73 -->

mean score across the six rating dimensions (3.967 each). On artifact quality, Seed2.1-Pro produced fully correct, ready-to-use solutions on 29.3% of tasks, compared with 20.4% for the reference model (Pass@1). It also maintained a comparable acceptable-delivery rate (94.0% vs. 92.2%) and produced no severely broken deliverables (0.0% vs. 2.4%), resulting in a higher delivery-completeness score (3.97 vs. 3.83). These results suggest that Seed2.1-Pro is particularly strong in the quality of shipped artifacts, combining a higher rate of first-pass-correct outputs with a clean failure floor.

六个评分维度上的平均分也相同 (都是 3.967). 在产物质量上, Seed2.1-Pro 在 29.3% 的任务上交出完全正确, 可直接使用的方案, 参照模型为 20.4% (Pass@1). 它的可接受交付率也相当 (94.0% 对 92.2%), 并且没有严重损坏的交付物 (0.0% 对 2.4%), 因此交付完整度得分更高 (3.97 对 3.83). 这些结果表明 Seed2.1-Pro 在交付产物的质量上尤其强, 一次做对的比例更高, 失败的下限也更干净.

A separate composite usability rating, which incorporates both the process experience and the delivered output, reveals a more nuanced picture. Seed2.1-Pro reaches the top “fully usable” tier more often than Claude Opus 4.7 (58.7% vs. 54.5%), but it also falls into the “unusable” tier more frequently (11.4% vs. 7.8%), indicating a higher-variance profile. These unusable cases are primarily associated with looser instruction following and boundary adherence (3.96 vs. 4.11 and 4.16 vs. 4.38), rather than with severely broken code, which is consistent with the strong artifact-quality floor described above. By task type, Seed2.1-Pro’s advantage is concentrated in maintenance-style work, including code comprehension, refactoring, and bug fixing, where it is preferred on roughly 60–70% of tasks. This aligns with its strengths in task planning and reliable delivery, while also pointing to greenfield zero-to-one generation and tighter in-scope discipline as important directions for the next iteration.

另一项综合可用性评分同时考虑过程体验和交付结果, 呈现出更细的图景. Seed2.1-Pro 进入最高的 「完全可用」 档的次数多于 Claude Opus 4.7 (58.7% 对 54.5%), 但落入 「不可用」 档的次数也更多 (11.4% 对 7.8%), 说明它的表现方差更大. 这些不可用案例主要与较松的指令遵循和边界遵守有关 (3.96 对 4.11, 4.16 对 4.38), 而不是严重损坏的代码, 这与前面所说的产物质量下限较高是一致的. 按任务类型看, Seed2.1-Pro 的优势集中在维护型工作上, 包括代码理解, 重构和 bug 修复, 在这些任务上它约有 60–70% 被偏好. 这与它在任务规划和可靠交付上的长处相符, 同时也指出从零到一的新项目生成和更严格的范围纪律是下一轮迭代的重要方向.

> **拆开:** Pass@1 的 29.3% 对 20.4% 看着领先 9 个点, 胜率却只有 48.5%, 这两件事怎么同时成立?
> 两者测的东西不同. 29.3% 只数 「完全正确可直接用」 的那一档; 胜率看的是整体偏好, 而 Pro 同时有 11.4% 落在 「不可用」 档, 高于 Opus 4.7 的 7.8%, 扣分主要在指令遵循 (3.96 对 4.11) 和边界遵守 (4.16 对 4.38). 所以它是高方差: 上限更高, 下限的 「不听话」 更多. 这些都只在 §3.1.2 正文里, 没有进表, 图 6 只是其中一个 PySINDy 单例.

These aggregate results are further illustrated by representative case studies from the crowdsourced evaluation and frontend showcases, as shown in Figure 6, Figure 9, and Appendix Figures 10, 11, and 12. Spanning scientific-ML library feature development and multimodal frontend artifact generation, these examples show how Seed2.1-Pro reasons over existing codebases, follows visual and product constraints, plans targeted changes, and delivers complete, runnable results.

这些汇总结果还有众包评测和前端展示中的代表性案例作印证, 见图 6, 图 9 以及附录图 10, 图 11, 图 12. 这些例子从科学计算机器学习库的功能开发一直到多模态前端产物生成, 展示了 Seed2.1-Pro 如何理解已有代码库, 遵循视觉和产品约束, 规划有针对性的改动, 并交付完整可运行的结果.

### 3.2 Automatic Evaluation 自动评测

The coding-agent evaluation suite combines public benchmarks and Trae-oriented internal benchmarks. The public benchmarks cover complementary coding-agent abilities, including command-line task execution, repository-level software engineering, cyber-security task solving, program synthesis, and natural-language-to-repository code modification. The Trae benchmarks are designed to reflect realistic product usage in an AI coding environment, covering web development, repository environment setup, artifact generation, bug fixing across multiple programming languages, and code generation. Together, these evaluations test whether the model can move beyond isolated code completion and operate as an end-to-end engineering assistant.

编程 Agent 评测套件结合公开基准和面向 Trae 的内部基准. 公开基准覆盖互补的编程 Agent 能力, 包括命令行任务执行, 仓库级软件工程, 网络安全任务求解, 程序合成, 以及从自然语言到仓库的代码修改. Trae 基准旨在反映 AI 编程环境中的真实产品使用, 覆盖 Web 开发, 仓库环境搭建, 产物生成, 多种编程语言的 bug 修复和代码生成. 这些评测合起来, 检验模型能否超越孤立的代码补全, 作为端到端的工程助手工作.

NL2Repo-Bench NL2Repo-Bench evaluates a model's ability to convert natural language requirements into repository-level code changes [15]. Unlike single-function coding benchmarks, it requires repository understanding, file selection, dependency reasoning, and multi-file modification. This makes it closer to real software engineering workflows, where an agent must understand the existing codebase before producing coherent and maintainable changes.

NL2Repo-Bench 评估模型把自然语言需求转成仓库级代码改动的能力 [15]. 与单函数编程基准不同, 它需要理解仓库, 选择文件, 推理依赖, 并做多文件修改. 这让它更接近真实软件工程工作流: Agent 必须先理解已有代码库, 才能产出连贯, 可维护的改动.

SeedKernelBench SeedKernelBench is a Seed-developed benchmark for evaluating GPU kernel coding and performance optimization capability. It collects operator-level tasks mined from mainstream high-performance kernel libraries, including FlashInfer, SGLang, FlashAttention, DeepGEMM, CUTLASS, and cuDNN. Unlike conventional coding benchmarks that mainly evaluate functional correctness, SeedKernelBench focuses on whether a model can generate or optimize CUDA-style kernels that are both correct and performant. We report the average speedup ratio over reference implementations, where higher values indicate stronger kernel-level optimization capability.

SeedKernelBench 是 Seed 自研基准, 用于评估 GPU kernel 编程和性能优化能力. 它收集从主流高性能 kernel 库中挖掘的算子级任务, 包括 FlashInfer, SGLang, FlashAttention, DeepGEMM, CUTLASS 和 cuDNN. 传统编程基准主要评估功能正确性, SeedKernelBench 则关注模型能否生成或优化既正确又高效的 CUDA 风格 kernel. 我们报告相对参考实现的平均加速比, 数值越高表示 kernel 级优化能力越强.

Trae Agent Bench Trae Agent Bench is a Seed-developed benchmark designed to reflect real coding-agent usage in Trae. Instead of treating coding ability as isolated code completion, the benchmark focuses on end-to-end engineering workflows that users actually ask an agent to complete, including web development, bug fixing, feature implementation, repository understanding, artifact generation, and runtime environment setup. Its construction is guided primarily by product-side user intent, with programming-language coverage adjusted according to observed Trae usage.

Trae Agent Bench 是 Seed 自研基准, 用来反映 Trae 中真实的编程 Agent 使用. 它不把编程能力当作孤立的代码补全, 而是聚焦用户真正交给 Agent 完成的端到端工程工作流, 包括 Web 开发, bug 修复, 功能实现, 仓库理解, 产物生成和运行环境搭建. 构建过程主要由产品侧的用户意图指导, 编程语言覆盖则根据观察到的 Trae 使用情况调整.

<!-- page 17 of 73 -->

Unlike open-source coding benchmarks that often evaluate isolated programming skills in fixed task settings, Trae Agent Bench is built around the actual user experience of an AI coding product. The benchmark emphasizes whether an agent can complete the kinds of tasks users submit in Trae, including fixing repository bugs, implementing product features, generating frontend artifacts, understanding existing codebases, and recovering runnable environments. It therefore includes repository-environment tasks, where the agent must

开源编程基准常在固定任务设定下评估孤立的编程技能, Trae Agent Bench 则围绕 AI 编程产品的实际用户体验构建. 它强调 Agent 能否完成用户在 Trae 中提交的那类任务, 包括修复仓库 bug, 实现产品功能, 生成前端产物, 理解已有代码库, 以及恢复可运行的环境. 因此它包含仓库环境任务, 其中 Agent 必须

#### MODEL CARD · CASE STUDY Adding a verified discrete-time controlled-system identifier to PySINDy Scientific-ML library feature dev · agent harness: Trae SOLO Agent 模型卡 · 案例研究: 给 PySINDy 增加一个经过验证的离散时间受控系统辨识器 · 科学计算机器学习库功能开发 · Agent harness: Trae SOLO Agent

##### Task Overview 任务概览

User: PySINDy currently targets continuous-time ODE sparse identification. Add a capability for discrete-time controlled systems, $x[k+1] = f(x[k], u[k])$: a new DiscreteSINDyControl estimator that fits a sparse discrete map from (X, U) sequences, does multi-step rolling prediction, and scores $R^2$ on a test sequence. Constraints: (1) strictly reuse the existing BaseEstimator / Optimizer / FeatureLibrary three-layer pattern and the sklearn fit/predict/score API — don't bypass the pipeline; (2) numpy + scipy + scikit-learn only (no jax / pytorch / tensorflow); (3) follow the repo's black + isort + flake8 style with numpydoc docstrings; (4) support arbitrary-order polynomial + trigonometric libraries, expand multi-column U correctly (not as one concatenated column), and support differentiation\_method=None to skip differentiation; (5) add a minimal example (controlled logistic map or similar) recovering the true equation from noisy data. Finish with a short design-trade-off note.

用户: PySINDy 目前面向连续时间 ODE 的稀疏辨识. 请增加对离散时间受控系统 $x[k+1] = f(x[k], u[k])$ 的支持: 新增一个 DiscreteSINDyControl 估计器, 从 (X, U) 序列拟合稀疏离散映射, 做多步滚动预测, 并在测试序列上计算 $R^2$. 约束: (1) 严格复用现有的 BaseEstimator / Optimizer / FeatureLibrary 三层模式和 sklearn 的 fit/predict/score API, 不要绕过流水线; (2) 只用 numpy + scipy + scikit-learn (不用 jax / pytorch / tensorflow); (3) 遵循仓库的 black + isort + flake8 风格和 numpydoc 文档字符串; (4) 支持任意阶多项式库 + 三角函数库, 正确展开多列 U (而不是拼成一列), 并支持 differentiation_method=None 以跳过求导; (5) 增加一个最小示例 (受控 logistic 映射或类似系统), 从带噪数据中恢复真实方程. 最后附一段简短的设计取舍说明.

Assistant · workflow reconstructed from the execution trace (60 tool calls: RunCommand 17 / Read 12 / Edit 12 / TodoWrite 10 / Write 4 / LS 2 / DeleteFile 2)

助手 · 根据执行轨迹重建的工作流 (60 次工具调用: RunCommand 17 / Read 12 / Edit 12 / TodoWrite 10 / Write 4 / LS 2 / DeleteFile 2)

[Stage 1] Read the repo, then probe what already exists

[阶段 1] 先读仓库, 再探查已有功能

LS + Read pysindy/\_core.py, feature\_library/\*, utils/\* -> map the BaseEstimator / Optimizer / FeatureLibrary layers python3 -c "ps.DiscreteSINDy(...).fit(x, u=u); model.print()" -> recovers 0.8 x0 + 0.1 x1 + 0.5 u0 / 0.2 x0 + 0.7 x1 + 0.3 u1 » The repo already ships a DiscreteSINDy that expands multi-column U correctly — so the real gap is a dedicated, spec-compliant estimator, not a brand-new pipeline.
Reasoning: probe the existing class empirically before writing anything, so the new code reuses a path that already works rather than duplicating it.

浏览 pysindy/_core.py, feature_library 和 utils, 理清 BaseEstimator / Optimizer / FeatureLibrary 三层. 用 python 实跑 ps.DiscreteSINDy(...).fit(x, u=u), 恢复出 0.8 x0 + 0.1 x1 + 0.5 u0 / 0.2 x0 + 0.7 x1 + 0.3 u1. 仓库已经自带一个能正确展开多列 U 的 DiscreteSINDy, 所以真正的缺口是一个专门的, 符合规格的估计器, 而不是一条全新的流水线.

推理: 写任何代码之前先实测已有类, 让新代码复用一条已经能跑通的路径, 而不是重复造一遍.

##### [Stage 2] Pin down the discrete-control contract [阶段 2] 确定离散控制的接口约定

» Inherit \_BaseSINDy; reject differentiation\_method (a discrete map regresses directly onto x[k+1], no derivative needed).
» Concatenate U onto X along the feature axis so PolynomialLibrary naturally produces x\_i·u\_j cross terms; score defaults to open-loop multi-step R².
Reasoning: binding the target to x[k+1] and feeding [x, u] through the shared library is exactly what keeps the new estimator inside the existing three layers.

继承 _BaseSINDy; 拒绝 differentiation_method (离散映射直接回归到 x[k+1], 不需要求导). 沿特征轴把 U 拼到 X 上, 让 PolynomialLibrary 自然产生 x_i·u_j 交叉项; score 默认用开环多步 R². 推理: 把目标绑定到 x[k+1], 并让 [x, u] 经过共享的特征库, 正是新估计器能留在现有三层之内的原因.

##### [Stage 3] Implement inside the existing pipeline [阶段 3] 在现有流水线内实现

Edit pysindy/\_core.py -> add class DiscreteSINDyControl(\_BaseSINDy) (fit / predict / score / simulate / equations / print)
Edit pysindy/\_\_init\_\_.py -> export DiscreteSINDyControl
Write examples/16\_discrete\_control/example.py -> controlled logistic map + multi-column U + noise
» Multi-column control is handled by a single feature-axis concat reusing fit\_transform + optimizer.fit — no bespoke U-expansion logic.

在 pysindy/_core.py 中新增 class DiscreteSINDyControl(_BaseSINDy) (fit / predict / score / simulate / equations / print); 在 pysindy/__init__.py 中导出; 编写 examples/16_discrete_control/example.py, 含受控 logistic 映射, 多列 U 和噪声. 多列控制只靠一次特征轴拼接来处理, 复用 fit_transform + optimizer.fit, 没有自定义的 U 展开逻辑.

##### [Stage 4] Verify by execution, lint, then hand off a clean diff [阶段 4] 以实际运行, lint 检查来验证, 然后交付干净的 diff

python3 test\_discrete\_control.py (1D logistic · 2D 2-control · poly+Fourier · rollout · multi-trajectory)
» The first run flushed out real bugs — a diverging logistic trajectory (ValueError: infinity) and an over-strict R²>0.999 gate — which it diagnosed and fixed until all five scenarios went green, rather than declaring success on a happy path.
✓ 5/5 functional scenarios pass — 1D logistic R²: 0.999 one-step / 0.998 rollout · 2D 2-control exact (R²=1.000)
✓ Exact symbolic recovery — coefficients match the ground-truth equations to 3 decimals on every system · poly+Fourier recovers the sin term
✓ sklearn estimator-compat checks pass · simulate rollout MSE ≈ 0 · the repository's full test suite re-run with zero regressions
flake8 --max-line-length=88 pysindy/\_core.py -> E501 @ L1479 -> fix -> 0 errors
DeleteFile test\_discrete\_control.py, test\_example.py, \_verify.py (remove scaffolding)
Reasoning: every requirement — recovery, R², the sklearn surface, style — is backed by a real run, and it debugged its own failures to get there, then deleted the scratch files to leave only the intended diff.

测试覆盖 1D logistic, 2D 双控制, 多项式 + Fourier, 滚动预测, 多轨迹. 第一次运行暴露出真实 bug: 一条发散的 logistic 轨迹 (ValueError: infinity) 和一个过严的 R²>0.999 门槛, 它诊断并修复, 直到五个场景全部通过, 而不是只在顺利路径上宣布成功. 5/5 功能场景通过: 1D logistic 单步 R² 0.999, 滚动 0.998; 2D 双控制精确 (R²=1.000). 符号精确恢复: 每个系统的系数与真值方程在 3 位小数上一致, 多项式 + Fourier 恢复出 sin 项. sklearn 估计器兼容检查通过, simulate 滚动 MSE ≈ 0, 仓库全量测试重跑零回归. flake8 在 L1479 报 E501, 修复后 0 错误. 删除 test_discrete_control.py, test_example.py, _verify.py 等脚手架文件. 推理: 每条要求 (恢复, R², sklearn 接口, 风格) 都有真实运行作支撑, 它调试了自己的失败, 最后删掉临时文件, 只留下预期的 diff.

<!-- page 18 of 73 -->

![Image block](images/p18-figure-6-the-case-of-seed2-1-with-scientific-ml-library.png)

Figure 6 The case of Seed2.1 with Scientific-ML library feature dev task.

图 6 Seed2.1 完成科学计算机器学习库功能开发任务的案例.

reproduce dependencies, run tests, and resolve runtime issues, as well as repository question-answering tasks, where the agent must understand architecture, module behavior, repository inputs and outputs, implementation details, and potential bug locations. Task prompts are written with sufficient context to reduce ambiguity, so evaluation failures are more likely to reflect agent capability rather than unclear instructions.

复现依赖, 运行测试, 解决运行时问题; 也包含仓库问答任务, 其中 Agent 必须理解架构, 模块行为, 仓库输入输出, 实现细节和潜在 bug 位置. 任务提示词写得有足够上下文以减少歧义, 这样评测失败更可能反映 Agent 能力, 而不是指令不清.

The execution and scoring pipeline is containerized. Each task is solved and scored in a clean task-specific runtime, so changes made by the agent, including dependency installation, configuration updates, and environment modifications, are reflected in the final evaluation result. This makes the benchmark closer to real Trae usage, where successful completion depends not only on producing code, but also on making the repository run correctly.

执行和打分流水线是容器化的. 每个任务都在干净的专属运行环境中求解和打分, 因此 Agent 做出的改动, 包括安装依赖, 更新配置和修改环境, 都会反映在最终评测结果里. 这让基准更接近真实的 Trae 使用: 成功不只取决于写出代码, 还取决于让仓库真正跑起来.

<!-- page 19 of 73 -->

<table><tr><td>Category</td><td>Benchmark</td><td>GPT-5.5</td><td>Claude-4.7 Opus</td><td>Gemini-3.1-Pro</td><td>Seed2.1-Turbo</td><td>Seed2.1-Pro</td></tr><tr><td rowspan="7">Open Benchmarks</td><td>Terminal-Bench 2.1 [38, 54]</td><td>73.8</td><td>71.7</td><td>70.7</td><td>67.6</td><td>71.0</td></tr><tr><td>SWE-Pro Bench [13]</td><td>58.6</td><td>64.3</td><td>54.2</td><td>57.0</td><td>57.5</td></tr><tr><td>CyberGym [65]</td><td>81.8</td><td>73.1</td><td>-</td><td>67.0</td><td>70.2</td></tr><tr><td>ProgramBench [73]</td><td>0.5/5.5/65.9</td><td>0/2.5/52.1</td><td>0/1/40.7</td><td>0/0/49.4</td><td>0/1/50.3</td></tr><tr><td>NL2Repo-Bench [15]</td><td>45.1</td><td>58.2</td><td>33.4</td><td>43.7</td><td>47.0</td></tr><tr><td>SWE-Atlas [46]</td><td>44.7</td><td>38.7</td><td>23.6</td><td>30.6</td><td>35.2</td></tr><tr><td>DeepSWE [52]</td><td>70.0</td><td>54.0</td><td>10.0</td><td>23.0</td><td>32.7</td></tr><tr><td rowspan="10">Trae</td><td>Web Bench</td><td>81.3</td><td>75.0</td><td>71.9</td><td>73.6</td><td>78.4</td></tr><tr><td>SeedKernelBench</td><td>9.14x</td><td>10.70x</td><td>-</td><td>8.60x</td><td>9.21x</td></tr><tr><td>Repo Env</td><td>90.0</td><td>63.3</td><td>57.1</td><td>46.7</td><td>55.0</td></tr><tr><td>Artifacts</td><td>56.0</td><td>53.0</td><td>48.0</td><td>47.0</td><td>51.0</td></tr><tr><td>Error Fix Python</td><td>76.0</td><td>76.0</td><td>75.5</td><td>74.0</td><td>70.7</td></tr><tr><td>Error Fix JS</td><td>79.4</td><td>78.2</td><td>77.1</td><td>69.4</td><td>74.6</td></tr><tr><td>Error Fix Java</td><td>65.0</td><td>73.3</td><td>62.5</td><td>66.7</td><td>66.7</td></tr><tr><td>Error Fix Go</td><td>70.0</td><td>66.7</td><td>60.0</td><td>56.7</td><td>63.3</td></tr><tr><td>Code Gen Python</td><td>73.3</td><td>83.3</td><td>71.7</td><td>73.3</td><td>75.6</td></tr><tr><td>Code Gen JS</td><td>76.0</td><td>66.4</td><td>65.3</td><td>59.7</td><td>62.4</td></tr></table>

Table 5 Coding-agent evaluation across public and Trae-oriented benchmarks. For ProgramBench, results are reported as resolved / almost resolved / average pass rate, where “almost resolved” denotes tasks with at least 95% pass rate. For SeedKernelBench, results are reported as average speedup ratios, where higher is better.

表 5 公开基准与面向 Trae 基准上的编程 Agent 评测. ProgramBench 的结果按 resolved / almost resolved / average pass rate 报告, 其中 「almost resolved」 指通过率至少 95% 的任务. SeedKernelBench 的结果是平均加速比, 越高越好.

> **对一下:** 拿表 5 和 Seed2.0 卡的编程 Agent 表并排, 哪些行是同一把尺子, 哪些行换了尺子?
> 同一把尺子的: NL2Repo-Bench, Seed2.0 Pro 为 27.9, Seed2.1-Pro 为 47.0, 这是全卡变化最大的编程行之一; SWE-Bench Pro 从 46.9 到表 5 的 SWE-Pro Bench 57.5 (名称写法不同, 指的是同一个 SWE-bench Pro 基准). 换了尺子的: Seed2.0 报的是 Terminal Bench 2.0 (55.8), 表 5 是 Terminal-Bench 2.1 (71.0), 版本不同不能直接相减; 对手也整体换代, Seed2.0 比的是 GPT-5.2 High 和 Claude-Opus-4.5, 这里是 GPT-5.5 和 Claude-4.7 Opus. CyberGym 只记分数: GPT-5.5 81.8, Claude-4.7 Opus 73.1, Seed2.1 Turbo 67.0, Pro 70.2, 卡里没有给任何阈值.

Overall, Trae Agent Bench emphasizes two high-frequency capability families: fixing existing code and implementing new functionality. It also includes repository understanding and environment management as important supporting capabilities. The language and task distributions are summarized in Figures 7 and 8. Representative task examples and the overall showcase link are provided in Appendix A.

总体来看, Trae Agent Bench 强调两类高频能力: 修复已有代码和实现新功能. 它也把仓库理解和环境管理作为重要的辅助能力纳入. 语言分布和任务分布见图 7 和图 8. 代表性任务示例和整体展示链接见附录 A.

Programming-Language Distribution in Trae Agent Bench

Trae Agent Bench 中的编程语言分布

![Chart block](images/p19-figure-7-programming-language-distribution-in-trae.png)

Figure 7 Programming-language distribution in Trae Agent Bench.

图 7 Trae Agent Bench 中的编程语言分布.

Task-Intent Distribution in Trae Agent Bench

Trae Agent Bench 中的任务意图分布

![Chart block](images/p19-figure-8-task-intent-distribution-in-trae-agent-bench.png)

Figure 8 Task-intent distribution in Trae Agent Bench.

图 8 Trae Agent Bench 中的任务意图分布.

#### 3.2.1 Results 结果

As shown in Table 5, Seed2.1-Pro demonstrates competitive coding-agent capability against frontier models across both public benchmarks and Trae-oriented product evaluations. On public coding-agent benchmarks, Seed2.1-Pro is close to the frontier on Terminal Bench 2.1, achieving 71.0 compared with GPT-5.5 at 73.8 and Claude-4.7-Opus at 71.7. It also performs strongly on NL2Repo-Bench, reaching 47.0 and outperforming

如表 5 所示, 在公开基准和面向 Trae 的产品评测上, Seed2.1-Pro 都展现出可与前沿模型竞争的编程 Agent 能力. 在公开编程 Agent 基准上, Seed2.1-Pro 在 Terminal Bench 2.1 上接近前沿, 取得 71.0, 相比之下 GPT-5.5 为 73.8, Claude-4.7-Opus 为 71.7. 它在 NL2Repo-Bench 上也表现强劲, 达到 47.0, 超过

<!-- page 20 of 73 -->

Code Arena: Frontend
Seed-2.1-Pro: Ranked #8

Code Arena: 前端. Seed-2.1-Pro: 排名第 8

GPT-5.5 at 45.1 and Gemini-3.1-Pro at 33.4, while remaining behind Claude-4.7-Opus. On SWE-Pro and SWE-Atlas, Seed2.1-Pro outperforms Gemini-3.1-Pro and approaches the stronger frontier systems, indicating solid repository-level understanding and multi-file code-editing capability. On ProgramBench, Seed2.1-Pro reaches 0/1/50.3, exceeding Gemini-3.1-Pro in average pass rate and approaching Claude-4.7-Opus, although GPT-5.5 remains clearly ahead on the most difficult program-repair tasks.

GPT-5.5 的 45.1 和 Gemini-3.1-Pro 的 33.4, 但仍落后于 Claude-4.7-Opus. 在 SWE-Pro 和 SWE-Atlas 上, Seed2.1-Pro 超过 Gemini-3.1-Pro, 接近更强的前沿系统, 说明它具备扎实的仓库级理解和多文件代码编辑能力. 在 ProgramBench 上, Seed2.1-Pro 达到 0/1/50.3, 平均通过率超过 Gemini-3.1-Pro, 接近 Claude-4.7-Opus, 不过在最难的程序修复任务上 GPT-5.5 仍明显领先.

> **问:** 表 5 里 DeepSWE 和 Repo Env 两行差距最大, 正文为什么一句没提?
> 正文确实没提. 表 5 的 DeepSWE 上 GPT-5.5 为 70.0, Claude-4.7 Opus 为 54.0, Seed2.1-Pro 只有 32.7, Turbo 23.0; Trae 的 Repo Env 上 GPT-5.5 为 90.0, Seed2.1-Pro 55.0, Turbo 46.7. 另外 Error Fix Python 上 Pro 的 70.7 低于 Turbo 的 74.0, 是表 5 里 Pro 不如 Turbo 的一行. 这几行和 §3.1.2 所说 「从零到一生成仍需改进」 是同一个方向的证据.

Seed2.1-Pro also shows competitive capability in performance-oriented kernel coding. On SeedKernelBench, which evaluates GPU kernel implementation and optimization tasks mined from high-performance libraries such as FlashInfer, SGLang, FlashAttention, DeepGEMM, CUTLASS, and cuDNN, Seed2.1-Pro reaches 9.21x average speedup. This slightly exceeds GPT-5.5 at 9.14x, while Claude-4.7-Opus remains the strongest listed model at 10.70x. This result suggests that Seed2.1-Pro's coding capability extends beyond standard repository editing to low-level, performance-sensitive kernel optimization.

Seed2.1-Pro 在面向性能的 kernel 编程上也有竞争力. SeedKernelBench 评估从 FlashInfer, SGLang, FlashAttention, DeepGEMM, CUTLASS, cuDNN 等高性能库中挖掘的 GPU kernel 实现与优化任务, Seed2.1-Pro 在其上取得 9.21x 的平均加速比. 这略高于 GPT-5.5 的 9.14x, 而 Claude-4.7-Opus 以 10.70x 仍是表中最强. 这个结果说明 Seed2.1-Pro 的编程能力不止于常规的仓库编辑, 还延伸到底层, 对性能敏感的 kernel 优化.

On Trae-oriented internal benchmarks, Seed2.1-Pro shows strong product-level engineering capability under realistic development workflows. It outperforms Claude-4.7-Opus and Gemini-3.1-Pro on Web Bench, and exceeds GPT-5.5 and Gemini-3.1-Pro on Error Fix Java. It also achieves strong results on Code Gen Python, outperforming GPT-5.5 and Gemini-3.1-Pro, while remaining behind Claude-4.7-Opus. Across Artifacts, Error Fix Go, and several frontend and debugging tasks, Seed2.1-Pro remains competitive with frontier models, showing that it can support practical Trae-style workflows involving repository setup, debugging, frontend implementation, code generation, and artifact delivery.

在面向 Trae 的内部基准上, Seed2.1-Pro 在真实开发工作流下展现出很强的产品级工程能力. 它在 Web Bench 上超过 Claude-4.7-Opus 和 Gemini-3.1-Pro, 在 Error Fix Java 上超过 GPT-5.5 和 Gemini-3.1-Pro. 它在 Code Gen Python 上也取得不错的结果, 超过 GPT-5.5 和 Gemini-3.1-Pro, 但仍落后于 Claude-4.7-Opus. 在 Artifacts, Error Fix Go 以及若干前端和调试任务上, Seed2.1-Pro 与前沿模型保持相当, 说明它能支持涉及仓库搭建, 调试, 前端实现, 代码生成和产物交付的实际 Trae 风格工作流.

Beyond benchmark scores, Seed2.1-Pro also performs strongly in frontend-oriented human preference evaluation. As shown in Figure 9, it ranks #8 in Code Arena: Frontend with a score of 1539, roughly on par with Claude Opus 4.6, and reaches top-10 performance in five of seven frontend subcategories. Together with crowdsourced developer preferences, these results suggest that Seed 2.1 has reached a strong production-coding level for Trae-style development workflows, while further improvements are still needed on the most challenging open public coding-agent benchmarks.

除基准分数外, Seed2.1-Pro 在面向前端的人类偏好评测中也表现强劲. 如图 9 所示, 它在 Code Arena: Frontend 中以 1539 分排名第 8, 与 Claude Opus 4.6 大致相当, 并在七个前端子类中的五个进入前 10. 结合众包开发者偏好, 这些结果表明 Seed 2.1 在 Trae 风格开发工作流上已达到较强的生产级编程水平, 不过在最具挑战性的开放公开编程 Agent 基准上仍需进一步提升.

![Chart block](images/p20-figure-9-code-arena-frontend-ranking-snapshot-for-seed2.png)

Figure 9 Code Arena frontend ranking snapshot for Seed2.1-Pro . The model ranks #8 overall with a score of 1539 and shows strong performance in React and production-facing frontend subcategories.

图 9 Seed2.1-Pro 的 Code Arena 前端排名快照. 模型以 1539 分总排名第 8, 在 React 和面向生产的前端子类中表现强劲.

<!-- page 21 of 73 -->

Case 1: Multimodal Frontend Artifact Generation

案例 1: 多模态前端产物生成

##### Case 1 User Input 案例 1 用户输入

Input images. The user provides a layout sketch, a pixel-style reference, and a dashboard reference, as shown in Figures 10 and 11.

输入图像. 用户提供一张版式草图, 一张像素风参考图和一张仪表盘参考图, 见图 10 和图 11.

##### User instruction. 用户指令.

Replicate this social video-dashboard sketch's layout faithfully; apply the pixel look to the chrome only, not the fluid.

忠实复刻这张社交视频仪表盘草图的版式; 像素风只用在界面外框上, 不用在流体上.

Fluid module, centerpiece, must match exactly: in the left video-player block, embed the WebGL fluid identical to the arena reference — vibrant multicolor dye on black, drag the mouse to paint flowing trails, click = splash, with the dat.GUI control panel. The fluid is NOT restyled; the style never touches it.

流体模块是核心, 必须完全一致: 在左侧视频播放器区块里嵌入与 arena 参考完全相同的 WebGL 流体, 黑底上的鲜艳多色染料, 拖动鼠标绘出流动的轨迹, 点击即溅射, 并带 dat.GUI 控制面板. 流体不做风格化改动, 风格不能碰它.

Interactions the sketch can't convey — implement these: Top tabs, Bio / Videos / Likes / Contacts / Albums / Channels, switch content. Player controls: play / pause, scrubber, volume, quality. Subscribe / Follow + Like / Comment counters that update. Search / filter. Activity feed + favourite-videos / channels grids.

草图表达不了的交互, 请实现: 顶部标签页 Bio / Videos / Likes / Contacts / Albums / Channels, 可切换内容. 播放器控件: 播放 / 暂停, 进度条, 音量, 画质. 会更新计数的订阅 / 关注 + 点赞 / 评论. 搜索 / 筛选. 动态流 + 收藏视频 / 频道网格.

![Image block](images/p21-layout-sketch.png)

Layout sketch

版式草图

![Image block](images/p21-pixel-art-style-reference.png)

Pixel-art style reference

像素风参考图

Figure 10 Primary visual inputs for the multimodal frontend artifact-generation case.

图 10 多模态前端产物生成案例的主要视觉输入.

Given the user input above, the agent generates a social video-dashboard interface that follows the provided layout sketch, applies the pixel-art style to the surrounding application chrome, and keeps the central WebGL fluid module visually smooth and separate from the pixel-styled UI. The generated artifact also implements the requested interactive components, including tab switching, player controls, search and filtering, follow/subscribe actions, updating counters, activity feed, and favorite-video/channel grids.

根据上述用户输入, Agent 生成了一个社交视频仪表盘界面: 遵循给定的版式草图, 把像素风用在周围的应用外框上, 中央的 WebGL 流体模块保持视觉上的流畅, 并与像素风界面分开. 生成的产物还实现了所要求的交互组件, 包括标签切换, 播放器控件, 搜索和筛选, 关注 / 订阅操作, 会更新的计数器, 动态流, 以及收藏视频 / 频道网格.

This case is representative of production coding because the agent must follow multimodal inputs and explicit user constraints, preserve a strict style boundary between the UI chrome and the WebGL fluid module, and implement a stateful frontend artifact rather than producing isolated code snippets.

这个案例能代表生产级编程, 因为 Agent 必须遵循多模态输入和明确的用户约束, 在界面外框与 WebGL 流体模块之间守住严格的风格边界, 并实现一个有状态的前端产物, 而不是产出零散的代码片段.

Case 2: Interactive Intro-to-AI Tutorial Website

案例 2: 交互式 AI 入门教程网站

<!-- page 22 of 73 -->

![Image block](images/p22-figure-11-dashboard-reference-for-the-multimodal.png)

Figure 11 Dashboard reference for the multimodal frontend artifact-generation case.

图 11 多模态前端产物生成案例的仪表盘参考图.

Create a complete interactive introductory tutorial on artificial intelligence, with animation effects. The website should include a full zero-background course, covering concept explanations, in-class quizzes, and hands-on examples. The overall style should be minimal.

做一个完整的, 带动画效果的交互式人工智能入门教程. 网站要包含一套零基础的完整课程, 涵盖概念讲解, 随堂测验和动手示例. 整体风格要简约.

![Image block](images/p22-figure-12-generated-homepage-for-the-interactive-intro.png)

Figure 12 Generated homepage for the interactive intro-to-AI tutorial website. The artifact presents a complete beginner-oriented AI course with chapter navigation, course progress, learning statistics, and a minimal visual design.

图 12 交互式 AI 入门教程网站的生成首页. 产物呈现了一套完整的面向初学者的 AI 课程, 带章节导航, 课程进度, 学习统计和简约的视觉设计.

This case evaluates whether the agent can transform a broad educational product request into a structured interactive learning website. The generated artifact organizes the course into beginner-friendly chapters, presents a clear learning path, and supports interactive learning scenarios such as concept explanation, quizzes, and hands-on examples. It is representative of production coding because the agent must jointly handle curriculum decomposition, information architecture, frontend layout, interaction design, and polished product

这个案例评估 Agent 能否把一个宽泛的教育产品需求转成结构化的交互式学习网站. 生成的产物把课程组织成对初学者友好的章节, 给出清晰的学习路径, 并支持概念讲解, 测验和动手示例等交互式学习场景. 它能代表生产级编程, 因为 Agent 必须同时处理课程拆解, 信息架构, 前端布局, 交互设计和精致的产品

<!-- page 23 of 73 -->

delivery.

交付.

Case 3: International City Homepage for Shanghai

案例 3: 面向国际受众的上海城市主页

Case 3 User Input

案例 3 用户输入

User instruction.

用户指令.

Collect image materials and generate a city homepage introducing Shanghai for an international audience. The page should be concise, modern, and visually premium.

收集图片素材, 生成一个面向国际受众介绍上海的城市主页. 页面要简洁, 现代, 视觉上有高级感.

![Image block](images/p23-figure-13-generated-homepage-for-introducing-shanghai.png)

Figure 13 Generated homepage for introducing Shanghai to an international audience. The artifact uses a premium skyline-centered hero section, modern navigation, bilingual city branding, and concise city highlights.

图 13 面向国际受众介绍上海的生成主页. 产物使用以天际线为中心的高级感首屏, 现代导航, 双语城市品牌和简洁的城市亮点.

This case evaluates whether the agent can convert a concise creative brief into a polished city-promotion homepage. The generated artifact presents Shanghai with a modern international visual identity, balancing landmark imagery, city branding, navigation, and key city statistics. It is representative of production coding because success requires visual-material selection, audience-aware content abstraction, page composition, frontend implementation, and high-quality visual presentation rather than isolated code generation.

这个案例评估 Agent 能否把一份简短的创意需求转成精致的城市推广主页. 生成的产物以现代的国际化视觉形象呈现上海, 在地标图像, 城市品牌, 导航和关键城市数据之间取得平衡. 它能代表生产级编程, 因为成功需要选择视觉素材, 按受众提炼内容, 组织页面, 实现前端并做出高质量的视觉呈现, 而不是孤立地生成代码.

## 4 Frontier Research 前沿研究

Frontier research scenarios represent some of the most demanding use cases for LLM-based agents. They require deep reasoning, specialized knowledge, long-horizon problem solving, and reliable intermediate and final outputs. This section evaluates whether Seed2.1 can act as an intelligent collaborator for scientific research, computer science, advanced mathematics, and model-development workflows.

前沿研究场景是 LLM Agent 要求最高的一类用例. 它们需要深度推理, 专业知识, 长程问题求解, 以及可靠的中间结果和最终结果. 本节评估 Seed2.1 能否在科学研究, 计算机科学, 高等数学和模型研发工作流中充当智能协作者.

### 4.1 Benchmark Results 基准结果

The frontier research evaluation suite focuses on tasks that go beyond routine productivity and require research-level problem solving. We evaluate on four benchmarks, each targeting a distinct capability axis: PostTrainBench [47] tests whether LLM agents can automate LLM post-training pipelines under bounded compute; FrontierScience-Research [62] requires multi-step scientific reasoning grounded in domain literature; FrontierCS [36] poses open-ended computer-science problems whose solution quality can be objectively

前沿研究评测套件关注超出常规生产力, 需要研究级问题求解的任务. 我们在四个基准上评估, 各自针对一条独立的能力轴: PostTrainBench [47] 检验 LLM Agent 能否在有限算力下自动化 LLM 后训练流程; FrontierScience-Research [62] 需要以领域文献为依据的多步科学推理; FrontierCS [36] 给出开放式计算机科学问题, 其解的质量可以客观地

<!-- page 24 of 73 -->

measured; and HorizonMath [59] targets research-level mathematical discovery on predominantly unsolved problems with automatic verification.

度量; HorizonMath [59] 面向研究级数学发现, 题目大多尚未解决, 并带自动验证.

<table><tr><td>Benchmark</td><td>GPT-5.5</td><td>Claude-4.7 Opus</td><td>Gemini-3.1 Pro</td><td>Seed2.1 Turbo</td><td>Seed2.1 Pro</td></tr><tr><td>PostTrainBench [47]</td><td>25.0</td><td>27.4</td><td>-</td><td>18.3</td><td>16.5</td></tr><tr><td>FrontierScience-Research [62]</td><td>33.9</td><td>20.0</td><td>16.7</td><td>33.3</td><td>28.3</td></tr><tr><td rowspan="2">FrontierCS [36]</td><td>41.0 / 40.0</td><td rowspan="2">-</td><td>43.8 / 44.1</td><td>33.5 / 33.4</td><td>29.1 / 28.2</td></tr><tr><td>58.6</td><td>64.4</td><td>50.8</td><td>46.3</td></tr><tr><td>HorizonMath [59]</td><td>7.1</td><td>4.0</td><td>4.0</td><td>2.0</td><td>2.0</td></tr></table>

Table 6 Frontier research evaluation. FrontierCS evaluates open-ended computer-science problem solving and reports three official sub-scores for each available model.

表 6 前沿研究评测. FrontierCS 评估开放式计算机科学问题求解, 对每个可用模型报告三个官方子分数.

> **看表:** 表 6 里 Pro 是否处处强于 Turbo, 各行的领先者又是谁?
> 不是. PostTrainBench 上 Turbo 18.3 高于 Pro 16.5, FrontierScience-Research 上 Turbo 33.3 高于 Pro 28.3, FrontierCS 两行 Turbo 也都高于 Pro (33.5 / 33.4 与 50.8 对 29.1 / 28.2 与 46.3), HorizonMath 两者都是 2.0, 而 GPT-5.5 是 7.1. 标题说 FrontierCS 报 「三个官方子分数」, 表里实际只见一行两个数加一行一个数, Claude-4.7 Opus 两行都是 「-」; FrontierCS 上 Gemini-3.1 Pro (43.8 / 44.1, 64.4) 最高. 这一节里 Pro 不占优, 和第 2, 3 节的格局相反.

As shown in Table 6, Seed2.1 delivers competitive performance across frontier research scenarios that demand advanced reasoning, verification, and long-horizon planning. On FrontierScience-Research, Seed2.1 Turbo scores 33.3, within 0.6 points of GPT-5.5 (33.9) and nearly double the scores of Claude-4.7 Opus (20.0) and Gemini-3.1 Pro (16.7). On FrontierCS, Seed2.1 reports results across all three official sub-scores, confirming its ability to sustain open-ended computer-science problem solving over extended reasoning horizons.

如表 6 所示, 在需要高级推理, 核验和长程规划的前沿研究场景中, Seed2.1 表现出有竞争力的水平. 在 FrontierScience-Research 上, Seed2.1 Turbo 得 33.3, 与 GPT-5.5 (33.9) 只差 0.6 分, 几乎是 Claude-4.7 Opus (20.0) 和 Gemini-3.1 Pro (16.7) 的两倍. 在 FrontierCS 上, Seed2.1 报告了全部三个官方子分数的结果, 证明它能在较长的推理跨度上持续进行开放式计算机科学问题求解.

> **核对:** FrontierScience-Research 在全卡出现了几次, Seed2.1 的分数一致吗?
> 出现三次, 不一致. 表 6: Turbo 33.3, Pro 28.3. 表 7: 「Seed2.1 Pro」 33.3, 等于表 6 里 Turbo 的数. 表 11 的 「FS - Research」: Turbo 23.3, Pro 28.3, 且引用的是 [83] FS-Researcher, 不是 [62] FrontierScience. 三张表的对手列倒是一致 (GPT-5.5 33.9, Claude-4.7 Opus 20.0, Gemini-3.1 Pro 16.7). 与 Seed2.0 对比时也要注意, Seed2.0 卡自己就有 25.0 和 23.3 两个 Seed2.0 Pro 值. 能确定的只有 Pro 在表 6 和表 11 都是 28.3.

### 4.2 Deep Think Deep Think

Seed2.1 Deep Think is an inference-time reasoning configuration designed for complex reasoning tasks in frontier research and advanced engineering. Unlike standard inference modes that directly produce a final response, Deep Think executes an automated loop of  $reason \rightarrow verify \rightarrow revise \rightarrow select$ . Within this loop the model can invoke web search to retrieve domain literature and use sandbox-based code execution to test intermediate hypotheses, check implementation details, and refine candidate solutions before committing to a final answer. The pipeline is modular: individual components—search, code execution, verifiers, external harnesses, task-specific toolchains—can be swapped or extended. This architecture makes Deep Think especially suitable for problems where correctness depends on multi-step reasoning, executable validation, and iterative refinement.

Seed2.1 Deep Think 是一种 TestingTime 推理配置, 面向前沿研究和高级工程中的复杂推理任务. 标准推理模式直接产出最终回答, Deep Think 则执行一个自动循环: $reason \rightarrow verify \rightarrow revise \rightarrow select$ (推理, 核验, 修改, 选择). 在这个循环里, 模型可以调用网页搜索获取领域文献, 并用基于沙箱的代码执行来检验中间假设, 检查实现细节, 打磨候选解, 然后再给出最终答案. 这条流水线是模块化的: 搜索, 代码执行, 验证器, 外部 harness, 任务专属工具链等组件都可以替换或扩展. 这种架构让 Deep Think 特别适合正确性依赖多步推理, 可执行验证和迭代打磨的问题.

| Benchmark | Seed2.1 Pro | Seed2.1 Deep Think | Gemini-3.1 Pro | Gemini-3.1 Deep Think |
| --- | --- | --- | --- | --- |
| IMO 2025 | 65.2 | 81.0 | - | 81.5 |
| IMOProof-Adv [35] | 54.3 | 83.8 | 49.0 | 76.7 |
| IPho 2025 | 79.3 | 89.0 | 76.3 | 87.7 |
| FrontierScience-Research [62] | 33.3 | 40.7 | 16.7 | 23.3 |

Table 7 Frontier research evaluation results of Seed2.1 Deep Think.

表 7 Seed2.1 Deep Think 的前沿研究评测结果.

As shown in Table 7, Seed2.1 Deep Think substantially outperforms Seed2.1 Pro and reaches a level competitive with—or exceeding—Gemini-3.1 Deep Think: it scores 81.0 vs. 81.5 on IMO 2025, 83.8 vs. 76.7 on IMOProofAdv, and 40.7 vs. 23.3 on FrontierScience-Research. These gains suggest that iterative reasoning with tool-assisted verification is an effective path for improving scientific-research assistance. More broadly, the results indicate that Seed2.1 is moving beyond standard coding and question-answering toward research-oriented agentic workflows, where models decompose problems, reason through domain constraints, verify intermediate results, and accelerate scientific exploration.

如表 7 所示, Seed2.1 Deep Think 大幅超过 Seed2.1 Pro, 达到可与 Gemini-3.1 Deep Think 竞争甚至超过它的水平: IMO 2025 上 81.0 对 81.5, IMOProofAdv 上 83.8 对 76.7, FrontierScience-Research 上 40.7 对 23.3. 这些提升说明, 带工具辅助核验的迭代推理是改进科研协助的有效路径. 更广地看, 这些结果表明 Seed2.1 正在越过常规的编程和问答, 走向面向研究的 Agent 工作流: 模型拆解问题, 在领域约束下推理, 核验中间结果, 加速科学探索.

> **想:** 表 7 里 Deep Think 比 Pro 多出的分数, 花了多少 TestingTime 预算?
> 卡里没说. §4.2 只描述了推理, 核验, 修改, 选择的循环以及可调用搜索和沙箱, 没有给候选数, 轮数, 每题 token 上限, 墙钟时间或工具调用次数, Gemini-3.1 Deep Think 一列的预算同样未知. 所以 IMO 2025 从 Pro 的 65.2 到 Deep Think 的 81.0, IMOProof-Adv 从 54.3 到 83.8, 都是 「未知算力换来的分数」, 不能当同等预算下的比较. 与 Seed2.0 对照时口径也不同: Seed2.0 卡用逐题得分报 IMO 2025 为 35/42 金牌, 这里是不带单位的 65.2 和 81.0.

<!-- page 25 of 73 -->

### 4.3 Scientific and Mathematical Research Assistance 科学与数学研究协助

Beyond benchmark-style evaluation, we further examine whether Seed2.1 can assist frontier research workflows where success requires domain understanding, long-horizon reasoning, tool use, and iterative verification. We focus on two representative settings: physics-oriented scientific computing and exploratory mathematical construction.

在基准式评测之外, 我们还考察 Seed2.1 能否协助前沿研究工作流, 这类工作的成功需要领域理解, 长程推理, 工具使用和迭代核验. 我们聚焦两个代表性场景: 面向物理的科学计算, 以及探索性的数学构造.

Physics-oriented scientific computing. In a representative physics case, Seed2.1 is asked to implement form-factor quadrature and assemble z\_core for frozen-core quasiparticle band narrowing. Unlike ordinary programming tasks, this task requires the model to connect domain theory, numerical formulas, element-specific data files, executable code, and verifier feedback. The model must read task requirements and theoretical formulas, inspect sodium and aluminum core data, implement the required numerical pipeline, and iteratively repair the solution according to verifier feedback.

面向物理的科学计算. 在一个代表性的物理案例中, Seed2.1 被要求实现形状因子求积, 并为冻结核准粒子能带收窄组装 z_core. 与普通编程任务不同, 这个任务要求模型把领域理论, 数值公式, 元素专属数据文件, 可执行代码和验证器反馈串起来. 模型必须阅读任务要求和理论公式, 检查钠和铝的核数据, 实现所需的数值流程, 并根据验证器反馈迭代修复方案.

This case is representative of frontier scientific computing because success depends on far more than code generation: the model must understand the scientific objective, translate formulas into numerically stable procedures, respect environment constraints (e.g., no external dependencies beyond NumPy/SciPy), repair edge cases exposed by the verifier, and produce reproducible artifacts. As shown in Figure 14, Seed2.1 can operate within domain-specific research-engineering workflows where theory, computation, and verification are tightly coupled.

这个案例能代表前沿科学计算, 因为成功远不止于生成代码: 模型必须理解科学目标, 把公式转成数值稳定的过程, 遵守环境约束 (例如除 NumPy/SciPy 外不引入外部依赖), 修复验证器暴露的边界情况, 并产出可复现的产物. 如图 14 所示, Seed2.1 能在理论, 计算和核验紧密耦合的领域研究工程工作流中运作.

Mathematical research assistance. We also evaluate Seed2.1's ability to assist exploratory mathematical research. Beyond solving benchmark-style math problems, research assistance requires the model to help mathematicians search for constructions, test proof ideas, and reduce the trial-and-error cost of constructive arguments. Related public evaluations include HorizonMath and other recent mathematical reasoning benchmarks [1, 4, 35, 59].

数学研究协助. 我们还评估 Seed2.1 协助探索性数学研究的能力. 研究协助不止于解基准式数学题, 还需要帮数学家寻找构造, 检验证明思路, 降低构造性论证中的试错成本. 相关的公开评测包括 HorizonMath 和其他近期的数学推理基准 [1, 4, 35, 59].

A representative case comes from research on the local geometry of oscillatory integrals on three-dimensional Riemannian manifolds [12]. In this interaction, mathematicians used Seed2.1 to search for an explicit construction related to the second item of Theorem 2.7. Seed2.1 produced a correct construction example that helped guide the complete metric construction and proof. The final theorem argument and construction example were independently verified by the researchers.

一个代表性案例来自三维黎曼流形上振荡积分局部几何的研究 [12]. 在这次交互中, 数学家用 Seed2.1 寻找与定理 2.7 第二项相关的一个显式构造. Seed2.1 给出了一个正确的构造示例, 帮助引导了完整的度量构造和证明. 最终的定理论证和构造示例都由研究者独立核验.

As shown in Figure 15, this case suggests that Seed2.1 can support frontier mathematical exploration by generating candidate constructions and compressing the trial-and-error cost in constructive proof development.

如图 15 所示, 这个案例说明 Seed2.1 能通过生成候选构造, 压缩构造性证明中的试错成本, 来支持前沿数学探索.

Together, these cases illustrate a capability profile that goes beyond single-turn question answering. In both scientific computing and mathematical exploration, Seed2.1 acts as a research-engineering partner: it ingests domain context, proposes concrete implementations or constructions, iterates under external feedback, and helps convert abstract research goals into independently verifiable artifacts.

这些案例合起来, 展示了一种超出单轮问答的能力形态. 无论在科学计算还是数学探索中, Seed2.1 都在充当研究工程伙伴: 吸收领域上下文, 提出具体的实现或构造, 在外部反馈下迭代, 并帮助把抽象的研究目标转成可独立核验的产物.

### 4.4 Seed for Seed Seed for Seed

Seed for Seed explores how Seed2.1 can support the model-development lifecycle itself, rather than only serving as a downstream user assistant. As illustrated in Figure 16, Seed for Seed organizes model self-improvement around connected loops such as the Eval Loop, Data Loop, Training Loop, Infra Loop. As the model's coding and agentic capabilities improve, it becomes increasingly capable of participating in long-running R&D workflows such as evaluation construction, failure analysis, data cleaning, data synthesis, training iteration, and infrastructure optimization.

Seed for Seed 探索 Seed2.1 如何支持模型研发生命周期本身, 而不只是做下游的用户助手. 如图 16 所示, Seed for Seed 围绕相互连接的循环组织模型自我改进, 包括 Eval Loop (评测循环), Data Loop (数据循环), Training Loop (训练循环), Infra Loop (基础设施循环). 随着模型编程和 Agent 能力的提升, 它越来越能参与长时间运行的研发工作流, 例如评测构建, 失败分析, 数据清洗, 数据合成, 训练迭代和基础设施优化.

#### 4.4.1 Overview 概览

To make this capability concrete, we present representative cases spanning these loops. Across these cases a common pattern emerges: humans define goals and quality gates, while agents execute long-horizon iterative workflows—inspecting intermediate results, repairing failures, and consolidating reusable artifacts. (summarized in Table 8). Across these cases a common pattern emerges: humans define goals and quality

为让这种能力更具体, 我们给出覆盖这些循环的代表性案例. 这些案例呈现出一个共同模式: 人定义目标和质量门槛, Agent 执行长程迭代工作流, 检查中间结果, 修复失败, 沉淀可复用的产物 (汇总见表 8). 这些案例呈现出一个共同模式: 人定义目标和质量

<!-- page 26 of 73 -->

```txt
[Observation from Verifier 2: The logic is fully sound. Minor soft spots found:
kpoints variable is still undefined at line 116/118 in Julia script (should be kpoints_frac ),
Unnecessary conjugate operation on real f_K .]
str_replace_editor(command="view", path="/workspace/downloads/run_qp.py")
str_replace_editor(command="str_replace", path="/workspace/downloads/run_qp.py", old_str="length(kpoints)", new_str="length(kpoints_frac)") (Fixed the remaining variable scope bug)
execute_bash(command="grep -n \"kpoints\" /workspace/downloads/run_qp.py")
[Observation: grep confirmed that the undefined 'kpoints' is completely eliminated from the codebase]
str_replace_editor(command="view", path="/workspace/downloads/method.md")
str_replace_editor(command="view", path="/workspace/downloads/run_qp.py")
execute_bash(command="ls -lh /workspace/downloads")
[Observation: Final artifacts run_qp.py and method.md are correctly generated and polished.]
```

验证器 2 的观察: 逻辑完全成立, 只发现几处小瑕疵: Julia 脚本第 116/118 行的 kpoints 变量仍未定义 (应为 kpoints_frac), 对实数 f_K 做共轭是多余的. 模型把 length(kpoints) 替换为 length(kpoints_frac), 修复了剩下的变量作用域 bug; grep 确认代码库中未定义的 'kpoints' 已完全消除; 最终产物 run_qp.py 和 method.md 已正确生成并打磨完成.

##### Task Overview 任务概览

The current directory contains the following files and folders:

当前目录包含以下文件和文件夹:

\- \`instruction.md\`: Task requirements and environment description.

\- `instruction.md`: 任务要求与环境说明.

\- \`THEORY.md\`: Theoretical background and formulas.

\- `THEORY.md`: 理论背景与公式.

\- \`Na/: Development set data for Sodium.

\- `Na/`: 钠的开发集数据.

\- \`Al/\`: Development set data for Aluminum.

\- `Al/`: 铝的开发集数据.

You need to implement the form-factor quadrature and assemble \`z\_core\`. Please carefully read the task requirements in \`instruction.md\` and \`THEORY.md\`, and write a script named \`run\_qp.py\` for frozen-core quasiparticle band-narrowing.

你需要实现形状因子求积并组装 `z_core`. 请仔细阅读 `instruction.md` 和 `THEORY.md` 中的任务要求, 编写一个名为 `run_qp.py` 的脚本, 用于冻结核准粒子能带收窄.

##### Assistant: 助手:

[Stage 1: Initial Exploration & Data Inseption]

[阶段 1: 初步探索与数据检查]

```julia
execute_bash(command="ls -la /workspace/")
str_replace_editor(command="view", path="/workspace/instruction.md")
str_replace_editor(command="view", path="/workspace/THEORY.md")
[Observation: Task requires calculating frozen-core quasiparticle narrowing using core data]

execute_bash(command="ls -la /workspace/Na")
str_replace_editor(command="view", path="/workspace/Na/element_config.json")
str_replace_editor(command="view", path="/workspace/Na/core_model.json")
str_replace_editor(command="view", path="/workspace/Na/grid.csv")
execute_bash(command="head -20 /workspace/Na/atomic_core_1s.csv")
execute_bash(command="tail -10 /workspace/Na/atomic_core_1s.csv")
[Observation: Verified the CSV structure of the radial core data and the integration grid settings]
```

依次查看 instruction.md, THEORY.md 和 Na 目录下的元素配置, 核模型, 网格和 1s 核数据. 观察: 任务要求用核数据计算冻结核准粒子收窄; 确认了径向核数据的 CSV 结构和积分网格设置.

##### [Stage 2: Environment Probing & Base Setup] [阶段 2: 环境探查与基础搭建]

execute\_bash(command="julia -e 'using DFTK; println(DFTK.version())") execute\_bash(command="echo \$JULIA\_PROJECT")
execute\_bash(command="ls -la /nix/store/ | grep julia")
execute\_bash(command="which python3 && python3 --version")
execute\_bash(command="python3 -c:\import numpy; import scipy..\\"")
[Observation: Verified Python3 with numpy/scipy exists, but Pandas might be risky. Julia executable needs to be located.]

检查 DFTK 版本, JULIA_PROJECT 和 Python 环境. 观察: 确认 Python3 带 numpy/scipy, 但依赖 Pandas 可能有风险; 需要找到 Julia 可执行文件.

execute\_bash(command="find / -name julia -type f -executable 2>/dev/null")
execute\_bash(command="apt-get update && apt-get install -y julia")
execute\_bash(command="mkdir -p /workspace/downloads")
str\_replace\_editor(command="create", path="/workspace/downloads/run\_qp.py")
[OVER 6 EDITING OPERATIONS]
str\_replace\_editor(command="create", path="/workspace/downloads/method.md")

查找并安装 julia, 建立 /workspace/downloads, 创建 run_qp.py, 经过 6 次以上编辑操作后再创建 method.md.

##### [Stage 3: First Verifier Feedback & Deep Code Refinement] [阶段 3: 第一次验证器反馈与深度代码打磨]

```ini
[Observation from Verifier 1: The core logic is correct, but there are 4 flaws:
1. Julia Syntax Error ( scfres.p )
2. Unnecessary Pandas Dependency,
3. Numerical Fragility in K=0 Check,
4. Manual KPoint Construction.]

str_replace_editor(command="view", path="/workspace/downloads/run_qp.py")
str_replace_editor(command="str_replace", path="/workspace/downloads/run_qp.py", old_str="import pandas as pd...", new_str="import csv...")
str_replace_editor(command="str_replace", path="/workspace/downloads/run_qp.py", old_str="grid_df = pd.read_csv..., new_str="grid_data = np.genfromtxt...")
str_replace_editor(command="str_replace", path="/workspace/downloads/run_qp.py", old_str="if K == 0.0:", new_str="if K < 1e-12."]
str_replace_editor(command="str_replace", path="/workspace/downloads/run_qp.py", old_str="scfres.p", new_str="p=scfres.p")
[OVER 12 VIEW AND EDITING OPERATIONS FIXING KPOINTS_FRAC SCOPE & TYPOS]
str_replace_editor(command="view", path="/workspace/downloads/method.md")
str_replace_editor(command="str_replace", path="/workspace/downloads/method.md", old_str="pandas", new_str="...")
execute_bash(command="ls -la /workspace/downloads/")
```

验证器 1 的观察: 核心逻辑正确, 但有 4 处缺陷: 1. Julia 语法错误 (scfres.p); 2. 不必要的 Pandas 依赖; 3. K=0 判断的数值脆弱性; 4. 手工构造 KPoint. 模型把 pandas 换成 csv 和 np.genfromtxt, 把 `if K == 0.0:` 改成 `if K < 1e-12`, 修正 scfres.p 的写法, 又经过 12 次以上查看和编辑修复 kpoints_frac 作用域和拼写错误, 并同步更新 method.md.

##### (Stage 4: Second Verifier Feedback & Final Polishing) (阶段 4: 第二次验证器反馈与最终打磨)

##### [Generated Content] [生成内容]

\# Method for Frozen-Core Quasiparticle Band Narrowing

\# 冻结核准粒子能带收窄方法

###### ## Overview 概览

This implementation computes the frozen-core quasiparticle (QP) correction to Kohn-Sham (KS) band energies using the formula: ...

本实现用如下公式计算 Kohn-Sham (KS) 能带能量的冻结核准粒子 (QP) 修正: ...

$E_{\mathrm{~i~}}$ ,  $QP(n,k) - E_{\mathrm{~F}} = z_{\mathrm{~core}(n,k)} * (E_{\mathrm{~KS}}(n,k) - E_{\mathrm{~F}})$

where \`z\_core\` is the core renormalization factor.

其中 `z_core` 是核重整化因子.

--- run\_qp.py ---
import XXX

def main():
    # Load element config
    # Load core model
    # Precompute form factors for each core channel
        # Compute J\_c = integral u\_c^2 V\_H\_c dr
        # Define f\_c(K) function
    # Load grid
    # Write Julia script to run DFTK calculation

main() 各步的注释: 加载元素配置; 加载核模型; 为每个核通道预计算形状因子 (计算 J_c = integral u_c^2 V_H_c dr, 定义 f_c(K) 函数); 加载网格; 写出运行 DFTK 计算的 Julia 脚本.

<!-- page 27 of 73 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Task Overview
Find tensors $A, B, C$ on $\mathbb{R}^3$ with $A(X, Y)$ symmetric and $B(Z, X, Y), C(W, Z, X, Y)$ symmetric in their last two variables, so that for every orthogonal basis $X, Y, Z, A(X, Y), B(Z, X, Y), C(Z, Z, X, Y)$ are not all zero.

Assistant Response (Summarized)
[Stage 1: Fix coordinates and give an explicit triple]
Fix the standard orthonormal basis $e_1, e_2, e_3$ of $\mathbb{R}^3$, and write $U_i = \langle U, e_i \rangle$. Define
    $A(X, Y) = X_1Y_2 + X_2Y_1,$
    $B(Z, X, Y) = Z_1(X_3Y_2 + X_2Y_3) - Z_2(X_3Y_1 + X_1Y_3),$
    $C(W, Z, X, Y) = \langle W, Z \rangle (X_1Y_1 - X_2Y_2).$
The symmetries are immediate: $A$ is symmetric in $X, Y$; every bracket in $B$ is symmetric in $X, Y$; and the final factor in $C$ is symmetric in $X, Y$.
[Stage 2: Normalize the orthogonal basis]
If $X, Y, Z$ are an arbitrary orthogonal basis, set $X' = X / \|X\|, Y' = Y / \|Y\|, Z' = Z / \|Z\|$. By multilinearity,
    $A(X, Y) = \|X\| \|Y \|A(X', Y'),$
    $B(Z, X, Y) = \|Z\| \|X\| \|Y \|B(Z', X', Y'),$
    $C(Z, Z, X, Y) = \|Z\|^2 \|X\| \|Y \|C(Z', Z', X', Y').$
Thus simultaneous vanishing is unchanged by normalizing. It suffices to consider orthonormal triples.
[Stage 3: Handle the axis case using $B$]
Suppose $(X_1^2 + X_2^2)(Y_1^2 + Y_2^2) = 0$. Then either $X = \pm e_3$ or $Y = \pm e_3$. If $X = \pm e_3$, then $Y = (Y_1, Y_2, 0)$ and $(Z_1, Z_2) = \pm (-Y_2, Y_1)$, so
    $B(Z, X, Y) = \pm (Z_1Y_2 - Z_2Y_1) = \pm (\mp (Y_1^2 + Y_2^2)) \neq 0$.
The case $Y = \pm e_3$ is identical, so simultaneous vanishing is impossible.
[Stage 4: Handle the generic case using a two-square identity]
Now suppose $(X_1^2 + X_2^2)(Y_1^2 + Y_2^2) \neq 0$. Let $D(X, Y) = X_1Y_1 - X_2Y_2$. Then
    $A(X, Y)^2 + D(X, Y)^2 = (X_1^2 + X_2^2)(Y_1^2 + Y_2^2) \neq 0$.
Thus $A$ and $D$ are not both zero. Since $C(Z, Z, X, Y) = D(X, Y)$ for $\|Z\| = 1$, either $A \neq 0$ or $C \neq 0$.
[Stage 5: Conclusion for the first construction]
For every orthogonal basis $X, Y, Z$, at least one of
    $A(X, Y), B(Z, X, Y), C(Z, Z, X, Y)$
is nonzero. Hence the displayed tensors solve the problem.
</div>

任务概览: 在 $\mathbb{R}^3$ 上找张量 $A, B, C$, 其中 $A(X, Y)$ 对称, $B(Z, X, Y)$ 和 $C(W, Z, X, Y)$ 在最后两个变量上对称, 使得对每组正交基 $X, Y, Z$, $A(X, Y), B(Z, X, Y), C(Z, Z, X, Y)$ 不全为零.

助手回答 (摘要): [阶段 1] 固定 $\mathbb{R}^3$ 的标准正交基 $e_1, e_2, e_3$, 记 $U_i = \langle U, e_i \rangle$, 给出上面显式的 $A, B, C$; 对称性可以直接看出. [阶段 2] 对任意正交基做归一化, 由多线性性, 同时为零的条件在归一化下不变, 所以只需考虑标准正交三元组. [阶段 3] 轴向情形 $(X_1^2 + X_2^2)(Y_1^2 + Y_2^2) = 0$ 时, $X$ 或 $Y$ 为 $\pm e_3$, 此时 $B(Z, X, Y) \neq 0$, 不可能同时为零. [阶段 4] 一般情形下记 $D(X, Y) = X_1Y_1 - X_2Y_2$, 由两平方和恒等式 $A^2 + D^2 = (X_1^2 + X_2^2)(Y_1^2 + Y_2^2) \neq 0$, $A$ 与 $D$ 不全为零; 又 $\|Z\| = 1$ 时 $C(Z, Z, X, Y) = D(X, Y)$, 所以 $A \neq 0$ 或 $C \neq 0$. [阶段 5] 结论: 对每组正交基, 三个量中至少一个非零, 所给张量解决了问题.

Figure 15 Math research-assistance showcase. Seed2.1 proposes an explicit tensor construction and verifies the required non-vanishing condition through a staged proof. The construction provided useful guidance for the second item of Theorem 2.7 in the oscillatory-integral geometry work [12].

图 15 数学研究协助展示. Seed2.1 提出一个显式的张量构造, 并通过分阶段证明核验所需的非零条件. 这个构造为振荡积分几何工作 [12] 中定理 2.7 的第二项提供了有用的指引.

<!-- page 28 of 73 -->

Seed Enters the Model Development Loop Guided by human goals and quality gates, Seed agents plan, act, evaluate, diagnose, and iterate across AI R&D

Seed 进入模型研发循环: 在人设定的目标和质量门槛指导下, Seed Agent 在 AI 研发中规划, 行动, 评估, 诊断和迭代.

![Image block](images/p28-figure-16-seed-for-seed-development-loop-seed2-1.png)

Figure 16 Seed-for-Seed development loop. Seed2.1 participates in evaluation, data, training, and infrastructure loops through long-horizon execution and continuous target-driven iteration.

图 16 Seed-for-Seed 研发循环. Seed2.1 通过长程执行和持续的目标驱动迭代, 参与评测, 数据, 训练和基础设施循环.

<!-- page 29 of 73 -->

gates, while agents execute long-horizon iterative workflows—inspecting intermediate results, repairing failures, and consolidating reusable artifacts.

门槛, Agent 执行长程迭代工作流, 检查中间结果, 修复失败, 沉淀可复用的产物.

\- Automated Benchmark Integration (Eval Loop): agents read external benchmark papers or repositories, adapt them to internal evaluation harnesses, configure judges or verifiers, run smoke tests, repair failures, and align scoring protocols—turning what was manual engineering work into an agent-executed workflow.

\- 自动化基准接入 (Eval Loop): Agent 阅读外部基准的论文或仓库, 把它们适配到内部评测 harness, 配置评判者或验证器, 跑冒烟测试, 修复失败, 对齐打分协议, 把原本的人工工程活变成由 Agent 执行的工作流.

\- Automated Model Diagnosis (Eval Loop): Auto-Eval agents select or generate targeted tests, while Post-Eval agents analyze traces, tool calls, artifacts, and metric changes to identify capability gaps and root causes. This moves evaluation beyond static score reporting toward active capability analysis.

\- 自动化模型诊断 (Eval Loop): Auto-Eval Agent 选择或生成针对性测试, Post-Eval Agent 分析轨迹, 工具调用, 产物和指标变化, 找出能力缺口和根因. 这让评测从静态报分走向主动的能力分析.

\- Iterative Rule Cleaning (Data Loop): Optimizer and Evaluator agents iterate over regex/rule filters for noisy pretraining data, checking precision, recall, false positives, and false negatives under explicit quality constraints—converting repetitive manual filtering into a long-horizon optimization loop.

\- 迭代式规则清洗 (Data Loop): Optimizer Agent 和 Evaluator Agent 针对含噪的预训练数据迭代正则 / 规则过滤器, 在明确的质量约束下检查精确率, 召回率, 假阳性和假阴性, 把重复性的人工过滤变成长程优化循环.

\- SFT Data Synthesis (Training Loop): agents propose data-synthesis plans, generate training data, launch SFT jobs, trigger companion evaluations, and summarize experiment results, closing the loop from data hypothesis to measured outcome.

\- SFT 数据合成 (Training Loop): Agent 提出数据合成方案, 生成训练数据, 启动 SFT 任务, 触发配套评测, 并总结实验结果, 形成从数据假设到实测结果的闭环.

\- GUI Agent Co-Evolution (Training Loop): agents compare successful and failed GUI trajectories, locate the earliest divergence step, and generate leak-safe corrective skills or training examples—allowing model failures to become direct inputs for the next training round.

\- GUI Agent 协同演进 (Training Loop): Agent 比较成功和失败的 GUI 轨迹, 定位最早的分歧步, 生成防泄漏的纠正技能或训练样例, 让模型的失败直接成为下一轮训练的输入.

\- RL Framework Optimization (Infra Loop): agents build a dedicated multi-agent harness in which actor agents implement framework changes and critic agents evaluate code quality, experiment results, and quality-gate satisfaction, enabling engineering experience to accumulate across iterations.

\- RL 框架优化 (Infra Loop): Agent 搭建专门的多 Agent harness, 其中 actor Agent 实现框架改动, critic Agent 评估代码质量, 实验结果和质量门槛是否满足, 使工程经验能在多轮迭代中积累.

#### 4.4.2 Showcase Evidence 展示证据

We highlight seven of the above cases with quantitative or qualitative evidence, spanning the Eval, Data, Training, Infra, and Kernel loops.

我们挑出上述案例中的七个, 给出定量或定性证据, 覆盖 Eval, Data, Training, Infra 和 Kernel 循环.

Eval Loop: Automated External Benchmark Integration. Automated benchmark integration pipeline (Figure 17). Given only a repository URL, the agent autonomously executes an 11-step pipeline—from cloning and analyzing the external benchmark, through code generation and infrastructure deployment, to iterative score alignment—producing a production-ready evaluation that faithfully reproduces published baselines. The baselines table shows correctness, latency, tool usage, and cost for the internally aligned configuration (Claude Code CLI + Opus 4.6) across four corpus × format settings (N = 133 questions; exact-match tolerance = 0%), reproduced from the OfficeQA Pro paper §3.2. The entire integration, which previously required approximately three engineer-days per benchmark, completes in roughly six hours with zero human intervention after the initial URL input.

Eval Loop: 自动化外部基准接入. 自动化基准接入流水线 (图 17). 只给一个仓库 URL, Agent 就自主执行一条 11 步流水线, 从克隆和分析外部基准, 经过代码生成和基础设施部署, 到迭代对齐分数, 产出一个能忠实复现已发表基线的可投产评测. 基线表列出内部对齐配置 (Claude Code CLI + Opus 4.6) 在四种语料 × 格式设定下的正确率, 延迟, 工具使用和成本 (N = 133 道题; 精确匹配容差 = 0%), 复现自 OfficeQA Pro 论文 §3.2. 整个接入过程以前每个基准约需三个工程师日, 现在在给出初始 URL 后约六小时完成, 零人工干预.

Eval Loop: From Scores to Root Causes. ProEval capability audit of Seed 2.0 Pro on puzzle\_zero\_shot (250 questions, 25 types; Figure 18). Through 5 iterative rounds with 241 targeted probe questions (95+55+30+31+30), the dual-agent system (Post-Eval + Auto-Eval) discovered that 18 percentage points of failures (across 8 representative puzzle types) were false negatives caused by evaluator design flaws (format matching, single-answer acceptance). After correction, true capability is substantially higher than surface scores suggest. The audit precisely identified three hard capacity limits — search depth (Sudoku cliff at 27 givens), global constraint integration (Skyscrapers cliff at n=6), and generative vocabulary — and demonstrated that expert-level prompt engineering has zero effect on capacity-bounded tasks. The complete audit, which would require weeks of manual expert analysis, was completed autonomously by the agent system.

Eval Loop: 从分数到根因. 对 Seed 2.0 Pro 在 puzzle_zero_shot (250 道题, 25 种类型; 图 18) 上做 ProEval 能力审计. 经过 5 轮迭代, 共 241 道针对性探测题 (95+55+30+31+30), 双 Agent 系统 (Post-Eval + Auto-Eval) 发现 18 个百分点的失败 (分布在 8 种代表性谜题类型上) 是评判器设计缺陷造成的假阴性 (格式匹配, 只接受单一答案). 纠正之后, 真实能力明显高于表面分数. 审计准确识别出三条硬性能力上限: 搜索深度 (数独在 27 个已知数处断崖), 全局约束整合 (摩天楼在 n=6 处断崖), 以及生成词汇, 并证明专家级提示工程对受能力上限约束的任务完全无效. 完整审计原本需要数周人工专家分析, 由 Agent 系统自主完成.

> **回看:** 这段审计的对象是 Seed 2.0 Pro, 不是 Seed2.1, 它对读 Seed2.0 卡的分数有什么影响?
> 影响在口径上. 按图 18 的结论, puzzle_zero_shot 上 18 个百分点的失败是评判器的假阴性, 也就是说旧评判器低估了 Seed 2.0 Pro. 如果别的基准也有类似的格式匹配问题, Seed2.0 与 Seed2.1 之间的差值里就混有评判器修正的成分. 卡里没有说修正后的评判器是否用于表 9 到表 11 的重跑, 所以两代模型之间的差值不能全部算成模型本身的进步.

Data Loop: Autonomous Rule Iteration for Pre-training Data Cleaning. As shown in Figure 19, Evaluator and Optimizer agents alternate per round under a precision  $\geq 0.95$  gate; iteration runs until the 300M token budget is exhausted. The recall progression curve (top-right) shows Seed 2.1 Pro tracking GPT-5.5 throughout the 300M-token budget, reaching 43.3% vs. 44.5% validation recall. Claude Opus 4.8 leads at 51.6%. All runs fully autonomous, no human intervention.

Data Loop: 预训练数据清洗的自主规则迭代. 如图 19 所示, Evaluator Agent 和 Optimizer Agent 在精确率 $\geq 0.95$ 的门槛下每轮交替工作, 迭代一直进行到 300M token 预算耗尽. 召回率进展曲线 (右上) 显示, 在整个 300M token 预算中 Seed 2.1 Pro 一路紧跟 GPT-5.5, 最终验证召回率为 43.3% 对 44.5%. Claude Opus 4.8 以 51.6% 领先. 所有运行完全自主, 无人工干预.

> **问:** 图 19 的领先者写的是 Claude Opus 4.8, 和表 1 到表 5 的 Claude-4.7 Opus 是同一个模型吗?
> 不是同一个名字, 全卡只有这里出现 Opus 4.8. 同一节的 Eval Loop 用 Opus 4.6 做对齐配置, 众测用 Opus 4.6, Trae 众测用 Opus 4.7, 自动评测表用 Claude-4.7 Opus, 四处 Claude 版本各不相同. 所以图 19 里 Seed 2.1 Pro 43.3% 对 51.6% 的差距, 不能和其他表里对 Claude-4.7 Opus 的差距放在一起读. 这里的 300M token 是清洗任务的数据预算, 不是推理算力.

<!-- page 30 of 73 -->

![Image block](images/p30-figure-17-eval-loop-automated-external-benchmark.png)

Figure 17 Eval Loop: automated external benchmark integration.

图 17 Eval Loop: 自动化外部基准接入.

<!-- page 31 of 73 -->

![Image block](images/p31-figure-18-eval-loop-from-scores-to-root-causes.png)

Figure 18 Eval Loop: from scores to root causes.

图 18 Eval Loop: 从分数到根因.

<!-- page 32 of 73 -->

![Image block](images/p32-figure-19-data-loop-autonomous-rule-iteration-for-pre.png)

Figure 19 Data Loop: autonomous rule iteration for pre-training data cleaning.

图 19 Data Loop: 预训练数据清洗的自主规则迭代.

Training Loop: Data-Synthesis-Driven SFT Improvement. A Master Agent orchestrator dispatches an Actor Agent (data synthesis, fork, train, deploy) and a Critic Agent (independent evaluation) in a closed loop (Figure 20). Each iter round launches up to 5 parallel SFT variants spanning a learning-rate $\times$ data-mixture sweep, runs the full 5-stage pipeline (data $\rightarrow$ train $\rightarrow$ deploy $\rightarrow$ eval $\rightarrow$ stop), and ends with the Master Agent selecting a champion and deriving the next-iter strategy. Across 3 iter rounds and 13 experiments over 4.9 days, the champion's score rose from 0.40 (baseline) to $0.70(+75$

Training Loop: 数据合成驱动的 SFT 改进. 一个 Master Agent 编排器调度 Actor Agent (数据合成, fork, 训练, 部署) 和 Critic Agent (独立评测), 形成闭环 (图 20). 每一轮最多启动 5 个并行的 SFT 变体, 覆盖学习率 $\times$ 数据配比的扫描, 跑完整的 5 阶段流水线 (数据 $\rightarrow$ 训练 $\rightarrow$ 部署 $\rightarrow$ 评测 $\rightarrow$ 停止), 最后由 Master Agent 选出冠军并推导下一轮策略. 在 3 轮, 13 个实验, 4.9 天中, 冠军分数从 0.40 (基线) 升到 $0.70(+75$

> **再看:** 图 20 的 0.40 到 0.70 后面 「+75」 截断了, 这个增幅和实验数怎么对?
> 0.70 / 0.40 = 1.75, 所以截断处应是 +75%, 是相对增幅而非百分点. 实验数: 每轮最多 5 个变体, 3 轮最多 15 个, 实际 13 个, 说明有的轮没跑满. 卡里没说这个分数是哪个 SFT 指标, 也没说 Critic 的评测集与训练数据是否隔离, 所以这是循环能跑通的证据, 不是某项能力的量化提升.

Training Loop: GUI Trajectory Diagnosis and Auto-Correction. As illustrated in Figure 21, from a single Rollout batch, the system captures a failed trajectory and a success trajectory for a real-world GUI task: purchasing the cheapest high-speed train ticket on Ctrip from Beijing to Shanghai on June 22, 2026. Action-level diff localizes the first divergence to step 8: the failed agent skipped the price-sort tab and selected the cheapest train visible under the default order, G531 at ¥576, while the success trajectory first sorted by price and selected the true lowest-fare option, D11 at ¥296. The failed agent's own reasoning at the divergence step, "picked the visibly-cheapest train," quoted verbatim from assistant\_message, reveals a partial-observability bias caused by relying on the default list order. The system then distills a compact inline correction skill, about 40 tokens, using only locally visible UI state. After injecting the skill, a re-trial succeeds and reduces the fare by 48.6%. The failed/success trajectory pair is then banked as training data, closing both the model-improvement loop, where the skill and trajectory pair become next-round training signal, and the environment-improvement loop, where the same pair informs future question-bank curation. The full diagnosis-and-correction cycle, which would otherwise require hours of manual root-cause analysis, completes in under 30 seconds without human intervention.

Training Loop: GUI 轨迹诊断与自动纠正. 如图 21 所示, 系统从单个 Rollout 批次中抓取一个真实 GUI 任务的失败轨迹和成功轨迹: 在携程上购买 2026 年 6 月 22 日北京到上海最便宜的高铁票. 动作级 diff 把第一个分歧点定位到第 8 步: 失败的 Agent 跳过了按价格排序的标签, 在默认排序下选了看得见的最便宜车次 G531, ¥576; 成功轨迹先按价格排序, 选中真正的最低票价 D11, ¥296. 失败 Agent 在分歧步自己的推理 「picked the visibly-cheapest train」 (逐字引自 assistant_message) 暴露了依赖默认列表顺序造成的部分可观测偏差. 系统随后只用本地可见的 UI 状态蒸馏出一个约 40 token 的紧凑内联纠正技能. 注入技能后重试成功, 票价降低 48.6%. 这对失败 / 成功轨迹随后作为训练数据入库, 同时闭合两个循环: 模型改进循环 (技能和轨迹对成为下一轮训练信号) 和环境改进循环 (同一对轨迹指导未来的题库整理). 完整的诊断与纠正周期原本需要数小时人工根因分析, 现在不到 30 秒完成, 无人工干预.

> **确认:** 48.6% 的降幅按图 21 的两张票价算得出来吗?
> 算得出. (576 - 296) / 576 = 280 / 576 约为 48.6%. 需要分开看的是: 这是单条任务上一次重试的结果, 不是成功率统计; 纠正技能约 40 token, 只用本地可见 UI 状态, 这正是 「防泄漏」 的含义, 即技能里不含答案 D11 本身. 图 21 没有给这个技能在其他任务上的迁移效果.

Infra Loop: Multi-Agent Harness for RL Framework Co-Evolution. Given a long-horizon framework re-implementation task, the agent does not begin by editing the target (Figure 22). It first constructs a task-specific multi-agent harness with three specialized roles. The Actor decomposes the task goal, designs an implementation plan, and drives development and testing. It autonomously launches RL experiments to validate its work, and iterates between implementation and verification under a per-round work plan,

Infra Loop: 用于 RL 框架协同演进的多 Agent harness. 面对一个长程的框架重实现任务, Agent 并不先去改目标代码 (图 22). 它先搭建一个任务专属的多 Agent harness, 含三个专门角色. Actor 拆解任务目标, 设计实现方案, 推动开发和测试. 它自主启动 RL 实验验证自己的工作, 并按每轮工作计划在实现与验证之间迭代,

<!-- page 33 of 73 -->

![Image block](images/p33-figure-20-training-loop-data-synthesis-driving-sft.png)

Figure 20 Training Loop: data synthesis driving SFT improvement.

图 20 Training Loop: 数据合成驱动 SFT 改进.

<!-- page 34 of 73 -->

![Image block](images/p34-figure-21-training-loop-gui-trajectory-diagnosis-and.png)

Figure 21 Training Loop: GUI trajectory diagnosis and auto-correction.

图 21 Training Loop: GUI 轨迹诊断与自动纠正.

<!-- page 35 of 73 -->

dispatching round-scoped sub-agents — branch, fix, and investigation workers — as needed. The Critic holds a production-readiness bar strictly stronger than spec compliance. Each round, it dispatches Analyst sub-agents along four axes — code audit, experimental-result interpretation, spec compliance, and production-readiness — against a single source-of-truth requirements file it maintains. Every verdict is anchored in concrete evidence; unverifiable is a first-class outcome. Its deliverable to the Actor is not a score but a remediation packet: what blocks the round, what is rework versus refinement, the minimum next step, and the open questions to resolve before completion. The Monitor sits above the inner Actor–Critic loop. It spawns evidence and review sub-agents to ground-truth claims, distills generalized rules (sediment) into NOTES.md so lessons from round N reduce mistakes in round N+1, and — over longer horizons — evolves the Actor–Critic harness itself toward iteratively better performance. At this snapshot the loop has spanned over one month and 600+ rounds of continuous operation. We deliberately do not report a terminal benchmark: by design, the loop has not terminated.

按需调度本轮范围内的子 Agent, 包括分支, 修复和调查 worker. Critic 持有一条严格高于 「符合规格」 的可投产标准. 每一轮, 它沿四条轴调度 Analyst 子 Agent: 代码审计, 实验结果解读, 规格符合性和可投产性, 对照它维护的唯一事实源需求文件. 每个结论都以具体证据为锚; 「无法核验」 是一等结果. 它交给 Actor 的不是分数, 而是一份整改包: 什么阻塞了本轮, 哪些是返工哪些是打磨, 最小的下一步, 以及完成前要解决的开放问题. Monitor 位于内层 Actor–Critic 循环之上. 它派生证据和评审子 Agent 核实各项声明, 把归纳出的通用规则 (沉淀) 写进 NOTES.md, 让第 N 轮的教训减少第 N+1 轮的错误, 并在更长的时间尺度上让 Actor–Critic harness 本身朝更好的表现演进. 截至本快照, 该循环已持续运行一个多月, 600+ 轮. 我们有意不报告最终基准: 按设计, 这个循环还没有终止.

![Image block](images/p35-figure-22-infra-loop-multi-agent-harness-for-rl.png)

Figure 22 Infra Loop: multi-agent harness for RL framework co-evolution.

图 22 Infra Loop: 用于 RL 框架协同演进的多 Agent harness.

Kernel Loop: Agent-Driven GPU Kernel Optimization. Our model excels at agentic GPU kernel generation (Figure 23). Given a PyTorch reference and a target device, it autonomously inspects the hardware, fuses multi-stage operations into a single kernel, and iteratively benchmarks, profiles, and autotunes memory loads, compute precision, warps, and pipeline stages—keeping only what genuinely helps. We find it writes clean, correct Triton from the first attempt and reasons soundly about the memory hierarchy: it recognizes that attention decode is memory-bound, knows when fusion eliminates intermediate HBM traffic, and, just as importantly, it recognizes when fashionable tricks like split-KV or persistent grid-stride kernels actually hurt and confidently reverts them. On a representative paged-attention decode workload for the NVIDIA H800, its first fused Triton kernel—collapsing paged K/V gather, attention, and online softmax into one—already beats the PyTorch baseline by  $4.54\times$ , and after autotuning (Hopper TMA loads, BF16 compute, and

Kernel Loop: Agent 驱动的 GPU kernel 优化. 我们的模型擅长 Agent 式 GPU kernel 生成 (图 23). 给定一个 PyTorch 参考实现和目标设备, 它自主检查硬件, 把多阶段操作融合成单个 kernel, 并迭代地做基准测试, 性能剖析, 对内存加载, 计算精度, warp 和流水级进行自动调优, 只保留真正有用的改动. 我们发现它第一次就能写出干净, 正确的 Triton, 并对内存层次有可靠的推理: 它认识到 attention decode 受内存带宽限制, 知道何时融合能消除中间的 HBM 流量, 同样重要的是, 它能认出 split-KV 或持久化 grid-stride kernel 这类流行技巧何时反而有害, 并果断撤回. 在 NVIDIA H800 上一个代表性的分页 attention decode 负载中, 它的第一个融合 Triton kernel (把分页 K/V 收集, attention 和在线 softmax 合为一体) 就已比 PyTorch 基线快 $4.54\times$, 自动调优之后 (Hopper TMA 加载, BF16 计算, 以及

<!-- page 36 of 73 -->

warp/pipeline-stage sweeps) it reaches 1.36 ms at 94% MBU—5.90× faster than eager PyTorch and matching the FlashAttention-3 reference. We believe this disciplined, measurement-driven loop is what makes the model a genuinely useful kernel engineer rather than just a code generator.

warp / 流水级扫描) 达到 1.36 ms, MBU 为 94%, 比 eager PyTorch 快 5.90×, 与 FlashAttention-3 参考实现持平. 我们认为, 正是这种讲纪律, 以测量为驱动的循环, 让模型成为真正有用的 kernel 工程师, 而不只是代码生成器.

> **对一下:** 图 23 的 5.90× 和表 5 SeedKernelBench 的 9.21x 是同一种加速比吗?
> 不是. 图 23 是单个负载 (H800 上的分页 attention decode) 相对 eager PyTorch 的倍数, 第一版融合 kernel 为 4.54×, 调优后 5.90×, 带宽利用率 MBU 94%; 表 5 的 9.21x 是 SeedKernelBench 全部算子任务相对各自参考实现的平均加速比, 参考实现来自 FlashInfer, CUTLASS 等库. 两个数的基线和任务集都不同. 图 23 能说明的是 「追平 FlashAttention-3」, 表 5 则显示 Claude-4.7 Opus 的 10.70x 仍高于 Seed2.1-Pro.

![Image block](images/p36-figure-23-kernel-loop-agent-driven-gpu-kernel.png)

Figure 23 Kernel Loop: agent-driven GPU kernel optimization.

图 23 Kernel Loop: Agent 驱动的 GPU kernel 优化.

#### 4.4.3 Summary 小结

Overall, Seed for Seed points toward a self-reinforcing development pattern: better models help build better evaluations, cleaner data, stronger training pipelines, and more reliable infrastructure—which in turn produce more capable future models. The showcases above demonstrate that this loop is already operational: Seed2.1 can autonomously execute multi-hour optimization runs, coordinate multi-agent actor-critic workflows, and convert model failures into actionable training signals, all with minimal human intervention beyond goal specification and quality-gate design.

总体来看, Seed for Seed 指向一种自我强化的研发模式: 更好的模型帮助构建更好的评测, 更干净的数据, 更强的训练流水线和更可靠的基础设施, 而这些又会产出能力更强的下一代模型. 上面的展示说明这个循环已经在运转: 除了设定目标和设计质量门槛, Seed2.1 基本无需人工干预, 就能自主执行数小时的优化运行, 协调多 Agent 的 actor-critic 工作流, 并把模型失败转成可用的训练信号.

## References

[1] Mislav Balunović, Jasper Dekoninck, Ivo Petrov, Nikola Jovanović, and Martin Vechev. Matharena: Evaluating llms on uncontaminated math competitions. arXiv preprint arXiv:2505.23281, 2025.

[2] Chaithanya Bandi, Ben Hertzberg, Geobio Boo, Tejas Polakam, Jeff Da, Sami Hassaan, Manasi Sharma, Andrew Park, Ernesto Hernandez, Dan Rambado, Ivan Salazar, Rafael Cruz, Chetan Rane, Ben Levin, Brad Kenstler, and Bing Liu. MCP-Atlas: A large-scale benchmark for tool-use competency with real mcp servers, 2026. URL https://arxiv.org/abs/2602.00933.

[3] Antoine Bigeard, Langston Nashold, Rayan Krishnan, and Shirley Wu. Finance agent benchmark: Benchmarking llms on real-world financial research tasks. arXiv preprint arXiv:2508.00828, 2025.

[4] ByteDance-Seed. Beyondaime: Advancing math reasoning evaluation beyond high school olympiads. https://huggingface.co/datasets/ByteDance-Seed/BeyondAIME, 2025.

<!-- page 37 of 73 -->

[5] Meng Cao, Pengfei Hu, Yingyao Wang, Jihao Gu, Haoran Tang, Haoze Zhao, Jiahua Dong, Wangbo Yu, Ge Zhang, Ian Reid, and Xiaodan Liang. Video simpleqa: Towards factuality evaluation in large video language models. CoRR, abs/2503.18923, 2025.

[6] Joya Chen, Ziyun Zeng, Yiqi Lin, Wei Li, Zejun Ma, and Mike Zheng Shou. Livecc: Learning video LLM with streaming speech transcription at scale. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 29083–29095, 2025.

[7] Liang Chen, Weichu Xie, Yiyan Liang, Hongfeng He, Hans Zhao, Zhibo Yang, Zhiqi Huang, Haoning Wu, Haoyu Lu, Yiping Bao, et al. Babyvision: Visual reasoning beyond language. arXiv preprint arXiv:2601.06521, 2026.

[8] Xin-Sheng Chen, Jiayu Zhu, Pei-lin Li, Hanzheng Wang, Shuojin Yang, and Meng-Hao Guo. PresentBench: A fine-grained rubric-based benchmark for slide generation, 2026. URL https://arxiv.org/abs/2603.07244.

[9] Junhao Cheng, Yuying Ge, Teng Wang, Yixiao Ge, Jing Liao, and Ying Shan. Video-holmes: Can MLLM think like holmes for complex video reasoning? CoRR, abs/2505.21374, 2025.

[10] Xianfu Cheng, Wei Zhang, Shiwei Zhang, Jian Yang, Xiangyuan Guan, Xianjie Wu, Xiang Li, Ge Zhang, Jiaheng Liu, Yuying Mai, et al. Simplevqa: Multimodal factuality evaluation for multimodal large language models. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4637–4646, 2025.

[11] Daniel Cores, Michael Dorkenwald, Manuel Mucientes, Cees G. M. Snoek, and Yuki M. Asano. Tvbench: Redesigning video-language evaluation. CoRR, abs/2410.07752, 2024.

[12] Song Dai, Liuwei Gong, and Shaoming Guo. The local geometry of oscillatory integrals on manifolds: Dimension three, 2026. URL https://arxiv.org/abs/2606.12927.

[13] Xiang Deng, Jeff Da, Edwin Pan, Yannis Yiming He, Charles Ide, Kanak Garg, Niklas Lauffer, Andrew Park, Nitin Pasari, Chetan Rane, et al. Swe-bench pro: Can ai agents solve long-horizon software engineering tasks? arXiv preprint arXiv:2509.16941, 2025.

[14] Kaustubh Deshpande, Ved Sirdeshmukh, Johannes Baptist Mols, Lifeng Jin, Ed-Yeremai Hernandez-Cardona, Dean Lee, Jeremy Kritz, Willow E Primack, Summer Yue, and Chen Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms. In Findings of the Association for Computational Linguistics: ACL 2025, pages 18632–18702, 2025.

[15] Jingzhe Ding, Shengda Long, Changxin Pu, Huan Zhou, Hongwan Gao, Xiang Gao, Chao He, Yue Hou, Fei Hu, Zhaojian Li, et al. Nl2repo-bench: Towards long-horizon repository generation evaluation of coding agents. arXiv preprint arXiv:2512.12730, 2025.

[16] Shuangrui Ding, Xuanlang Dai, Long Xing, Shengyuan Ding, Ziyu Liu, Yang JingYi, Penghui Yang, Zhixiong Zhang, Xilin Wei, Xinyu Fang, et al. Wildclawbench: A benchmark for real-world, long-horizon agent evaluation. arXiv preprint arXiv:2605.10912, 2026.

[17] Guanting Dong, Junting Lu, Junjie Huang, Wanjun Zhong, Longxiang Liu, Shijue Huang, Zhenyu Li, Yang Zhao, Xiaoshuai Song, Xiaoxi Li, Jiajie Jin, Yutao Zhu, Hanbin Wang, Fangyu Lei, Qinyu Luo, Mingyang Chen, Zehui Chen, Jiazhan Feng, Ji-Rong Wen, and Zhicheng Dou. Agent-world: Scaling real-world environment synthesis for evolving general agent intelligence, 2026. URL https://arxiv.org/abs/2604.18292.

[18] Mengfei Du, Binhao Wu, Zejun Li, Xuan-Jing Huang, and Zhongyu Wei. Embspatial-bench: Benchmarking spatial understanding for embodied tasks with large vision-language models. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers), pages 346–355, 2024.

[19] Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. arXiv preprint arXiv:2502.14739, 2025.

[20] Chaoyou Fu, Yuhan Dai, Yongdong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, Peixian Chen, Yanwei Li, Shaohui Lin, Sirui Zhao, Ke Li, Tong Xu, Xiawu Zheng, Enhong Chen, Caifeng Shan, Ran He, and Xing Sun. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 24108–24118, 2025.

[21] Ling Fu, Zhebin Kuang, Jiajun Song, Mingxin Huang, Biao Yang, Yuzhe Li, Linghao Zhu, Qidi Luo, Xinyu Wang, Hao Lu, et al. Ocrbench v2: An improved benchmark for evaluating large multimodal models on visual text localization and reasoning. arXiv preprint arXiv:2501.00321, 2024.

<!-- page 38 of 73 -->

[22] Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pages 148–166. Springer, 2024.

[23] Yunzhuo Hao, Jiawei Gu, Huichen Will Wang, Linjie Li, Zhengyuan Yang, Lijuan Wang, and Yu Cheng. Can mllms reason in multimodality? emma: An enhanced multimodal reasoning benchmark. arXiv preprint arXiv:2501.05444, 2025.

[24] Linyang He, Qiyao Yu, Hanze Dong, Baohao Liao, Xinxing Xu, Micah Goldblum, Jiang Bian, and Nima Mesgarani. LiveMathematicianBench: A Live Benchmark for Mathematician-Level Reasoning with Proof Sketches. arXiv e-prints, art. arXiv:2604.01754, April 2026. doi: 10.48550/arXiv.2604.01754.

[25] Wenyi Hong, Yean Cheng, Zhuoyi Yang, Weihan Wang, Lefan Wang, Xiaotao Gu, Shiyu Huang, Yuxiao Dong, and Jie Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 8450–8460, 2025.

[26] Jen-Tse Huang, Dasen Dai, Jen-Yuan Huang, Youliang Yuan, Xiaoyuan Liu, Wenxuan Wang, Wenxiang Jiao, Pinjia He, and Zhaopeng Tu. Visfactor: Benchmarking fundamental visual cognition in multimodal large language models. arXiv preprint arXiv:2502.16435, 2025.

[27] Zhenpeng Huang, Xinhao Li, Jiaqi Li, Jing Wang, Xiangyu Zeng, Cheng Liang, Tao Wu, Xi Chen, Liang Li, and Limin Wang. Online video understanding: Ovbench and videochat-online. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 3328–3338, 2025.

[28] Sheng Jin, Minghao Liu, Yunze Xiao, Zeqi Zhou, Heli Qi, Yifan Yao, Meishu Song, Kaijing Ma, Xuan Zhang, Sicong Jiang, et al. Knowledge index of noah's ark, 2026. URL https://arxiv.org/abs/2606.05104.

[29] Quyu Kong, Xu Zhang, Zhenyu Yang, Nolan Gao, Chen Liu, Panrong Tong, Chenglin Cai, Hanzhang Zhou, Jianan Zhang, Liangyu Chen, Zhidan Liu, Steven Hoi, and Yue Wang. MobileWorld: Benchmarking autonomous mobile agents in agent-user interactive, and mcp-augmented environments, 2025. URL https://arxiv.org/abs/2512.19432.

[30] Jingyao Li, Jingyun Wang, Molin Tan, Haochen Wang, Cilin Yan, Likun Shi, Jiayin Cai, Xiaolong Jiang, and Yao Hu. Crossvid: A comprehensive benchmark for evaluating cross-video reasoning in multimodal large language models. CoRR, abs/2511.12263, 2025.

[31] Junlong Li, Wenshuo Zhao, Jian Zhao, Weihao Zeng, Haoze Wu, Xiaochen Wang, Rui Ge, Yuxuan Cao, Yuzhen Huang, Wei Liu, Junteng Liu, Zhaochen Su, Yiyang Guo, Fan Zhou, Lueyang Zhang, Juan Michelini, Xingyao Wang, Xiang Yue, Shuyan Zhou, Graham Neubig, and Junxian He. The tool decathlon: Benchmarking language agents for diverse, realistic, and long-horizon task execution, 2025. URL https://arxiv.org/abs/2510.25726.

[32] Xiangyi Li, Yimin Liu, Wenbo Chen, Bingran You, Zonglin Di, Yifeng He, Shenghan Zheng, Kyoung Whan Choe, Jiankai Sun, Shuyi Wang, Chujun Tao, Binxu Li, Xuandong Zhao, Hejia Geng, Xiaojun Wu, Junwei Zhou, Xiaokun Chen, Hanwen Xing, Yubo Li, Qunhong Zeng, Di Wang, Yuanli Wang, Roey Ben Chaim, et al. SkillsBench: Benchmarking how well agent skills work across diverse tasks, 2026. URL https://arxiv.org/abs/2602.12670.

[33] Fenfen Lin, Yesheng Liu, Haiyu Xu, Yue Chen, Zheqi He, Mingxuan Zhao, Miguel Hu Chen, Jin-Ge Yao, and Xi Yang. Do vision-language models measure up? benchmarking visual measurement reading with measurebench. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 38544–38553, 2026.

[34] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[35] Minh-Thang Luong, Dawsen Hwang, Hoang H Nguyen, Golnaz Ghiasi, Yuri Chervonyi, Insuk Seo, Junsu Kim, Garrett Bingham, Jonathan Lee, Swaroop Mishra, et al. Towards robust mathematical reasoning. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 35406–35430, 2025.

[36] Qiuyang Mang, Wenhao Chai, Zhifei Li, Huanzhi Mao, Shang Zhou, Alexander Du, Hanchen Li, Shu Liu, Edwin Chen, Yichuan Wang, Xieting Chu, Zerui Cheng, Yuan Xu, Tian Xia, Zirui Wang, Tianneng Shi, Jianzhu Yao, Yilong Zhao, Qizheng Zhang, Charlie Ruan, Zeyu Shen, Kaiyuan Liu, Runyuan He, Dong Xing, Zerui Li, Zirong Zeng, Yige Jiang, Lufeng Cheng, Ziyi Zhao, Youran Sun, Wesley Zheng, Meiyuwang Zhang, Ruyi Ji, Xuechang

<!-- page 39 of 73 -->

Tu, Zihan Zheng, Zexing Chen, Kangyang Zhou, Zhaozi Wang, Jingbang Chen, Aleksandra Korolova, Peter Henderson, Pramod Viswanath, Vijay Ganesh, Saining Xie, Zhuang Liu, Dawn Song, Sewon Min, Ion Stoica, Joseph E. Gonzalez, Jingbo Shang, and Alvin Cheung. FrontierCS: Evolving challenges for evolving intelligence, 2025. URL https://arxiv.org/abs/2512.15699.

[37] Ahmed Masry, Mohammed Saidul Islam, Mahir Ahmed, Aayush Bajaj, Firoz Kabir, Aaryaman Kartha, Md Tahmid Rahman Laskar, Mizanur Rahman, Shadikur Rahman, Mehrad Shahmohammadi, et al. Chartqapro: A more diverse and challenging benchmark for chart question answering. arXiv preprint arXiv:2504.05506, 2025.

[38] Mike A. Merrill, Alexander G. Shaw, Nicholas Carlini, Boxuan Li, Harsh Raj, Ivan Bercovich, Lin Shi, Jeong Yeon Shin, Thomas Walshe, E. Kelly Buchanan, Junhong Shen, Guanghao Ye, Haowei Lin, Jason Poulos, Maoyu Wang, Marianna Nezhurina, Jenia Jitsev, Di Lu, Orfeas Menis Mastromichalakis, Zhiwei Xu, Zizhao Chen, Yue Liu, Robert Zhang, Leon Liangyu Chen, Anurag Kashyap, Jan-Lucas Uslu, Jeffrey Li, Jianbo Wu, Minghao Yan, Song Bian, Vedang Sharma, Ke Sun, Steven Dillmann, Akshay Anand, Andrew Lanpouthakoun, Bardia Koopah, Changran Hu, Etash Guha, Gabriel H. S. Dreiman, Jiacheng Zhu, Karl Krauth, Li Zhong, Niklas Muennighoff, Robert Amanfu, Shangyin Tan, Shreyas Pimpalgaonkar, Tushar Aggarwal, Xiangning Lin, Xin Lan, Xuandong Zhao, Yiqing Liang, Yuanli Wang, Zilong Wang, Changzhi Zhou, David Heineman, Hange Liu, Harsh Trivedi, John Yang, Junhong Lin, Manish Shetty, Michael Yang, Nabil Omi, Negin Raoof, Shanda Li, Terry Yue Zhuo, Wuwei Lin, Yiwei Dai, Yuxin Wang, Wenhao Chai, Shang Zhou, Dariush Wahdany, Ziyu She, Jiaming Hu, Zhikang Dong, Yuxuan Zhu, Sasha Cui, Ahson Saiyed, Arinbjörn Kolbeinsson, Jesse Hu, Christopher Michael Rytting, Ryan Marten, Yixin Wang, Alex Dimakis, Andy Konwinski, and Ludwig Schmidt. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces, 2026. URL https://arxiv.org/abs/2601.11868.

[39] Arsha Nagrani, Sachit Menon, Ahmet Iscen, Shyamal Buch, Ramin Mehran, Nilpa Jha, Anja Hauth, Yukun Zhu, Carl Vondrick, Mikhail Sirotenko, Cordelia Schmid, and Tobias Weyand. MINERVA: evaluating complex video reasoning. CoRR, abs/2505.00681, 2025.

[40] Junbo Niu, Yifei Li, Ziyang Miao, Chunjiang Ge, Yuanhang Zhou, Qihao He, Xiaoyi Dong, Haodong Duan, Shuangrui Ding, Rui Qian, Pan Zhang, Yuhang Zang, Yuhang Cao, Conghui He, and Jiaqi Wang. Ovo-bench: How far is your video-llms from real-world online video understanding? In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 18902–18913, 2025.

[41] Krista Opsahl-Ong, Arnav Singhvi, Jasmine Collins, Ivan Zhou, Cindy Wang, Ashutosh Baheti, Owen Oertell, Jacob Portes, Sam Havens, Erich Elsen, Michael Bendersky, Matei Zaharia, and Xing Chen. OfficeQA Pro: An enterprise benchmark for end-to-end grounded reasoning, 2026. URL https://arxiv.org/abs/2603.08655.

[42] Mingyu Ouyang, Siyuan Hu, Kevin Qinghong Lin, Hwee Tou Ng, and Mike Zheng Shou. GameWorld: Towards standardized and verifiable evaluation of multimodal game agents, 2026. URL https://arxiv.org/abs/2604.07429.

[43] Tejal Patwardhan, Rachel Dias, Elizabeth Proehl, Grace Kim, Michele Wang, Olivia Watkins, Simón Posada Fishman, Marwan Aljubeh, Phoebe Thacker, Laurance Fauconnet, Natalie S. Kim, Patrick Chao, Samuel Miserendino, Gildas Chabot, David Li, Michael Sharman, Alexandra Barr, Amelia Glaese, and Jerry Tworek. GDPval: Evaluating ai model performance on real-world economically valuable tasks, 2025. URL https://arxiv.org/abs/2510.04374.

[44] Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity's last exam. arXiv preprint arXiv:2501.14249, 2025.

[45] ARC Prize. Arc agi: The \$1 million artificial general intelligence prize. https://arcprize.org/arc-agi/1/, 2024.

[46] Mohit Raghavendra, Soham Dan, Miguel Romero Calvo, Yannis Yiming He, Johannes Baptist Mols, Gautam Anand, Cole McCollum, Edgar Arakelyan, Vijay Bharadwaj, Andrew Park, Jeff Da, MohammadHossein Rezaei, Bing Liu, Brad Kenstler, and Yunzhong He. SWE Atlas: Benchmarking Coding Agents Beyond Issue Resolution. arXiv e-prints, art. arXiv:2605.08366, May 2026. doi: 10.48550/arXiv.2605.08366.

[47] Ben Rank, Hardik Bhatnagar, Ameya Prabhu, Shira Eisenberg, Karina Nguyen, Matthias Bethge, and Maksym Andriushchenko. PostTrainBench: Can llm agents automate llm post-training?, 2026. URL https://arxiv.org/abs/2603.08640.

[48] Jonathan Roberts, Mohammad Reza Taesiri, Ansh Sharma, Akash Gupta, Samuel Roberts, Ioana Croitoru, Simion-Vlad Bogolin, Jialu Tang, Florian Langer, Vyas Raina, et al. Zerobench: An impossible visual benchmark for contemporary large multimodal models. arXiv preprint arXiv:2502.09696, 2025.

<!-- page 40 of 73 -->

[49] Ziyao Shangguan, Chuhan Li, Yuxuan Ding, Yanan Zheng, Yilun Zhao, Tesca Fitzgerald, and Arman Cohan. TOMATO: assessing visual temporal reasoning capabilities in multimodal foundation models. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025, 2025.

[50] Yiyou Sun, Xinyang Han, Weichen Zhang, Yuanbo Pang, Tianyu Wang, Yuhan Cao, Yixiao Huang, Chris Duroiu, Haoyun Zhang, Jeffrey Lin, et al. Agents' last exam, 2026. URL https://arxiv.org/abs/2606.05405.

[51] Zirui Tang, Xuanhe Zhou, Yumou Liu, Linchun Li, Weizheng Wang, Hongzhang Huang, Jun Zhou, Jiachen Song, Shaoli Yu, Jinqi Wang, Zihang Zhou, Hongyi Zhou, Yuting Lv, Jinyang Li, Jiashuo Liu, Ruoyu Chen, Chunwei Liu, GuoLiang Li, Jihua Kang, and Fan Wu. Workspace-Bench 1.0: Benchmarking ai agents on workspace tasks with large-scale file dependencies, 2026. URL https://arxiv.org/abs/2605.03596.

[52] DeepSWE Team. DeepSWE: Measuring frontier coding agents on original, long-horizon engineering tasks. https://github.com/datacurve-ai/deep-swe, 2026. GitHub repository.

[53] Gemini Robotics Team, Saminda Abeyruwan, Joshua Ainslie, Jean-Baptiste Alayrac, Montserrat Gonzalez Arenas, Travis Armstrong, Ashwin Balakrishna, Robert Baruch, Maria Bauza, Michiel Blokzijl, et al. Gemini robotics: Bringing ai into the physical world. arXiv preprint arXiv:2503.20020, 2025.

[54] Terminal-Bench Team. Introducing terminal-bench 2.0 and harbor. https://www.tbench.ai/news/announcement-2-0, nov 2025. Accessed: 2025-12-10.

[55] Minyang Tian, Luyu Gao, Shizhuo Dylan Zhang, Xinan Chen, Cunwei Fan, Xuefei Guo, Roland Haas, Pan Ji, Kittithat Krongchon, Yao Li, Shengyan Liu, Di Luo, Yutao Ma, Hao Tong, Kha Trinh, Chenyu Tian, Zihan Wang, Bohao Wu, Yanyu Xiong, Shengzhu Yin, Minhui Zhu, Kilian Lieret, Yanxin Lu, Genglin Liu, Yufeng Du, Tianhua Tao, Ofir Press, Jamie Callan, Eliu Huerta, and Hao Peng. SciCode: A Research Coding Benchmark Curated by Scientists. arXiv e-prints, art. arXiv:2407.13168, July 2024. doi: 10.48550/arXiv.2407.13168.

[56] Jordy Van Landeghem, Rubèn Tito, Łukasz Borchmann, Michał Pietruszka, Pawel Joziak, Rafal Powalski, Dawid Jurkiewicz, Mickaël Coustaty, Bertrand Anckaert, Ernest Valveny, et al. Document understanding dataset and evaluation (dude). In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 19528–19540, 2023.

[57] Bertie Vidgen, Austin Mann, Abby Fennelly, John Wright Stanly, Lucas Rothman, Marco Burstein, Julien Benchek, David Ostrofsky, Anirudh Ravichandran, Debnil Sur, Neel Venugopal, Alannah Hsia, Isaac Robinson, Calix Huang, Olivia Varones, Daniyal Khan, Michael Haines, Zach Richards, Chirag Mahapatra, Brendan Foody, and Osvald Nitski. APEX-Agents, 2026. URL https://arxiv.org/abs/2601.14242.

[58] An Vo, Khai-Nguyen Nguyen, Mohammad Reza Taesiri, Vy Tuong Dang, Anh Totti Nguyen, and Daeyoung Kim. Vision language models are biased. arXiv preprint arXiv:2505.23941, 2025.

[59] Erik Y. Wang, Sumeet Motwani, James V. Roggeveen, Eliot Hodges, Dulhan Jayalath, Charles London, Kalyan Ramakrishnan, Flaviu Cipcigan, Philip Torr, and Alessandro Abate. HorizonMath: Measuring ai progress toward mathematical discovery with automatic verification, 2026. URL https://arxiv.org/abs/2603.15617.

[60] Haochen Wang, Xiangtai Li, Zilong Huang, Anran Wang, Jiacong Wang, Tao Zhang, Jiani Zheng, Sule Bai, Zijian Kang, Jiashi Feng, et al. Traceable evidence enhanced visual grounded reasoning: Evaluation and methodology. arXiv preprint arXiv:2507.07999, 2025.

[61] Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Houxing Ren, Aojun Zhou, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. Advances in Neural Information Processing Systems, 37:95095–95169, 2024.

[62] Miles Wang, Robi Lin, Kat Hu, Joy Jiao, Neil Chowdhury, Ethan Chang, and Tejal Patwardhan. Frontierscience: Evaluating ai's ability to perform expert-level scientific tasks, 2026. URL https://arxiv.org/abs/2601.21165.

[63] Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Shiyu Huang, Bin Xu, Yuxiao Dong, Ming Ding, and Jie Tang. Lvbench: An extreme long video understanding benchmark. CoRR, abs/2406.08035, 2024.

[64] Zhaowei Wang, Wenhao Yu, Xiyu Ren, Jipeng Zhang, Yu Zhao, Rohit Saxena, Liang Cheng, Ginny Wong, Simon See, Pasquale Minervini, et al. Mmlongbench: Benchmarking long-context vision-language models effectively and thoroughly. arXiv preprint arXiv:2505.10610, 2025.

<!-- page 41 of 73 -->

[65] Zhun Wang, Tianneng Shi, Jingxuan He, Matthew Cai, Jialin Zhang, and Dawn Song. CyberGym: Evaluating ai agents' cybersecurity capabilities with real-world vulnerabilities at scale, 2025. URL https://arxiv.org/abs/2506.02548.

[66] Zirui Wang, Mengzhou Xia, Luxi He, Howard Chen, Yitao Liu, Richard Zhu, Kaiqu Liang, Xindi Wu, Haotian Liu, Sadhika Malladi, et al. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. Advances in Neural Information Processing Systems, 37:113569–113697, 2024.

[67] Jason Wei, Zhiqing Sun, Spencer Papay, Scott McKinney, Jeffrey Han, Isa Fulford, Hyung Won Chung, Alex Tachard Passos, William Fedus, and Amelia Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

[68] Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for long-context interleaved video-language understanding. In Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[69] XAI. Realworldqa. URL https://huggingface.co/datasets/xai-org/RealworldQA.

[70] Tianbao Xie, Danyang Zhang, Jixuan Chen, Xiaochuan Li, Siheng Zhao, Ruisheng Cao, Toh Jing Hua, Zhoujun Cheng, Dongchan Shin, Fangyu Lei, Yitao Liu, Yiheng Xu, Shuyan Zhou, Silvio Savarese, Caiming Xiong, Victor Zhong, and Tao Yu. OSWorld: Benchmarking multimodal agents for open-ended tasks in real computer environments, 2024. URL https://arxiv.org/abs/2404.07972.

[71] Weiye Xu, Jiahao Wang, Weiyun Wang, Zhe Chen, Wengang Zhou, Aijun Yang, Lewei Lu, Houqiang Li, Xiaohua Wang, Xizhou Zhu, et al. Visulogic: A benchmark for evaluating visual reasoning in multi-modal large language models. arXiv preprint arXiv:2504.15279, 2025.

[72] Chenghao Yang, Yinbo Luo, Zhoufutu Wen, Qi Chu, Tao Gong, Longxiang Liu, Kaiyuan Zhang, Jianpeng Jiao, Ge Zhang, Wenhao Huang, et al. Mars-bench: A multi-turn athletic real-world scenario benchmark for dialogue evaluation. arXiv preprint arXiv:2505.23810, 2025.

[73] John Yang, Kilian Lieret, Jeffrey Ma, Parth Thakkar, Dmitrii Pedchenko, Sten Sootla, Emily McMilin, Pengcheng Yin, Rui Hou, Gabriel Synnaeve, Diyi Yang, and Ofir Press. ProgramBench: Can language models rebuild programs from scratch?, 2026. URL https://arxiv.org/abs/2605.03546.

[74] Qianyu Yang, Yang Liu, Jiaqi Li, Jun Bai, Hao Chen, Kaiyuan Chen, Tiliang Duan, Jiayun Dong, Xiaobo Hu, Zixia Jia, Yang Liu, Tao Peng, Yixin Ren, Ran Tian, Zaiyuan Wang, Yanglihong Xiao, Gang Yao, Lingyue Yin, Ge Zhang, Chun Zhang, Jianpeng Jiao, Zilong Zheng, and Yuan Gong. OneMillion-Bench: How far are language agents from human experts?, 2026. URL https://arxiv.org/abs/2603.07980.

[75] Sihan Yang, Runsen Xu, Yiman Xie, Sizhe Yang, Mo Li, Jingli Lin, Chenming Zhu, Xiaochen Chen, Haodong Duan, Xiangyu Yue, et al. Mmsi-bench: A benchmark for multi-image spatial intelligence. arXiv preprint arXiv:2505.23764, 2025.

[76] Bowen Ye, Rang Li, Qibin Yang, Yuanxin Liu, Linli Yao, Hanglong Lv, Zhihui Xie, Chenxin An, Lei Li, Lingpeng Kong, Qi Liu, Zhifang Sui, and Tong Yang. Claw-Eval: Towards trustworthy evaluation of autonomous agents, 2026. URL https://arxiv.org/abs/2604.06132.

[77] Yida Yin, Harish Krishnakumar, Chung Peng Lee, Boya Zeng, Wenhao Chai, Shengbang Tong, Wenhu Chen, Hu Xu, Xingyu Fu, Gabriel Sarch, et al. Worldbench: A challenging and visually diverse multimodal reasoning benchmark. arXiv preprint arXiv:2606.06538, 2026.

[78] Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15134–15186, 2025.

[79] Renrui Zhang, Dongzhi Jiang, Yichi Zhang, Haokun Lin, Ziyu Guo, Pengshuo Qiu, Aojun Zhou, Pan Lu, Kai-Wei Chang, Yu Qiao, et al. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems? In European Conference on Computer Vision, pages 169–186. Springer, 2024.

[80] Zehua Zhao, Zhixian Huang, Junren Li, Siyu Lin, Junting Zhou, Fengqi Cao, Kun Zhou, Rui Ge, Tingting Long, Yuexiang Zhu, Yan Liu, Jie Zheng, Junnian Wei, Rong Zhu, Peng Zou, Wenyu Li, Zekai Cheng, Tian Ding, Yaxuan Wang, Yizhao Yan, Tingru Wei, Haowei Ming, Weijie Mao, Chen Sun, Yiming Liu, Zichen Wang, Zuo

<!-- page 42 of 73 -->

Zhang, Tong Yang, Hao Ma, Zhen Gao, and Jian Pei. SUPERChem: A Multimodal Reasoning Benchmark in Chemistry. arXiv e-prints, art. arXiv:2512.01274, December 2025. doi: 10.48550/arXiv.2512.01274.

[81] Zhicheng Zheng, Xin Yan, Zhenfang Chen, Jingzhou Wang, Qin Zhi Eddie Lim, Joshua B. Tenenbaum, and Chuang Gan. Contphy: Continuum physical concept learning and reasoning from videos. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024, volume 235 of Proceedings of Machine Learning Research, pages 61526–61558, 2024.

[82] Runjie Zhou, Youbo Shao, Haoyu Lu, Bowei Xing, Tongtong Bai, Yujie Chen, Jie Zhao, Lin Sui, Haotian Yao, Zijia Zhao, et al. Worldvqa: Measuring atomic world knowledge in multimodal large language models. arXiv preprint arXiv:2602.02537, 2026.

[83] Chiwei Zhu, Benfeng Xu, Mingxuan Du, Shaohan Wang, Xiaorui Wang, Zhendong Mao, and Yongdong Zhang. FS-Researcher: Test-Time Scaling for Long-Horizon Research Tasks with File-System-Based Agents. arXiv e-prints, art. arXiv:2602.01566, February 2026. doi: 10.48550/arXiv.2602.01566.

[84] Chengke Zou, Xingang Guo, Rui Yang, Junyu Zhang, Bin Hu, and Huan Zhang. Dynamath: A dynamic visual benchmark for evaluating mathematical reasoning robustness of vision language models. arXiv preprint arXiv:2411.00836, 2024.

<!-- page 43 of 73 -->

## A Representative Trae Agent Bench Examples 有代表性的 Trae Agent Bench 样例

This appendix presents representative examples from Trae Agent Bench. Long prompts, code snippets, and stack traces are shortened with ellipses for readability, while preserving the original task structure, comments, and implementation hints.

本附录给出 Trae Agent Bench 的代表性样例. 为便于阅读, 较长的提示词, 代码片段和堆栈跟踪用省略号缩短, 但保留原始的任务结构, 注释和实现提示.

### Example 1: JavaScript Error Fixing 样例 1: JavaScript 错误修复

Subset: error\_fix\_js\_v1\_3. Total cases: 170.

子集: error_fix_js_v1_3. 用例总数: 170.

Prompt. Please fix the bug in the project according to the information below.

提示词. 请根据以下信息修复项目中的 bug.

Issue description. The custom time input requires two clicks before it receives focus.

问题描述. 自定义时间输入框要点两次才能获得焦点.

Bug description. When the user clicks the time input for the first time, it does not receive focus. The input only receives focus after a second click.

Bug 描述. 用户第一次点击时间输入框时, 它没有获得焦点, 要点第二次才获得焦点.

#### Reproduction steps. 复现步骤.

\- Go to the custom time-input example in the date picker demo.

\- 打开日期选择器演示中的自定义时间输入示例.

\- Click the date-picker input to open the picker.

\- 点击日期选择器输入框, 打开选择器.

\- Click the time input.

\- 点击时间输入框.

\- The time input does not receive focus.

\- 时间输入框没有获得焦点.

\- Click the time input again.

\- 再次点击时间输入框.

\- The time input receives focus.

\- 时间输入框获得焦点.

Expected behavior. The time input should receive focus on the first click.

期望行为. 时间输入框应在第一次点击时获得焦点.

Environment. Windows 11; Firefox Developer Edition 128.0b7 and Chrome 126.0.6478.127.

环境. Windows 11; Firefox Developer Edition 128.0b7 和 Chrome 126.0.6478.127.

Additional context. The issue appeared after upgrading from react-datepicker 4.17.0 to 7.2.0. The previous version worked correctly.

补充信息. 问题出现在把 react-datepicker 从 4.17.0 升级到 7.2.0 之后, 之前的版本工作正常.

#### Comments. 评论.

\- A contributor volunteered to take the issue.

\- 一位贡献者自愿认领这个问题.

\- A follow-up comment indicates that a pull request had been opened.

\- 后续评论表明已经提交了一个 pull request.

\- The proposed fix makes the custom time input focus correctly on the first click.

\- 提议的修复让自定义时间输入框在第一次点击时就能正确获得焦点.

### Example 2: Python Error Fixing 样例 2: Python 错误修复

Subset: error\_fix\_python\_v1\_3. Total cases: 100.

子集: error_fix_python_v1_3. 用例总数: 100.

Prompt. Please fix the bug in the project according to the information below.

提示词. 请根据以下信息修复项目中的 bug.

Issue description. pt.max is not differentiable inside a PyMC model.

问题描述. 在 PyMC 模型内部 pt.max 不可微.

Description. The following call to model.dlogp() raises a NotImplemented error:

描述. 下面对 model.dlogp() 的调用会抛出 NotImplemented 错误:

```python
with pm.Model() as model:
    x = pm.Normal("x", shape=(2,))
    mu = x.max()
    pm.Normal("obs", mu, observed=np.random.uniform())

model.dlogp()
```

This should be differentiable, because pt.max already implements gradients. The issue may be related to graph rewrites, log-probability rewrites, or MaxAndArgmax.

这应当是可微的, 因为 pt.max 已经实现了梯度. 问题可能与图重写, 对数概率重写或 MaxAndArgmax 有关.

#### Comments. 评论.

\- min triggers the same NotImplementedError.

\- min 会触发同样的 NotImplementedError.

\- This is expected because min can be implemented as the negative of a maximum over negated val-

\- 这在意料之中, 因为 min 可以实现为对取负后的值求最大再取负.

<!-- page 44 of 73 -->

\- A commenter identifies the issue as related to gradient handling during graph rewrites.

\- 一位评论者指出问题与图重写过程中的梯度处理有关.

\- The maintainers note that this issue is probably not suitable for a first-time contributor because it requires deeper understanding of rewrite and gradient logic.

\- 维护者指出这个问题可能不适合首次贡献者, 因为它需要更深入地理解重写和梯度逻辑.

### Example 3: Java Error Fixing 样例 3: Java 错误修复

```txt
Subset: error_fix_java_v1_2.    Total cases: 60.
Prompt. Please fix the bug in the project according to the information below.
Issue description. When parsing a generic method with an array type parameter, such as List<T[]>, the parser raises java.lang.UnsupportedOperationException: T].
Versions. javaparser-core: 3.25.0.    javaparser-symbol-solver-core: 3.25.0.
Test case.

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
...

public class TypeParamIsArray {
    public static void main(String[] args) {
        CombinedTypeSolver combinedTypeSolver = new CombinedTypeSolver();
        combineTypeSolver.add(new ReflectionTypeSolver());

        JavaSymbolSolver symbolSolver =
            new JavaSymbolSolver(combinedTypeSolver);
        StaticJavaParser.getConfiguration()
            .setSymbolResolver(symbolSolver);

        CompilationUnit cu = StaticJavaParser.parse(
            "import java.util.List;\n" +
            "import java.util.ArrayList;\n" +
            "class D {\n" +
            " void main() {\n" +
            " Integer[] a = new Integer[]{1, 2};\n" +
            " List<Integer[]> l = new ArrayList<>();
            " l.add(a);\n" +
            " m(l);\n" +
            " }\n" +
            " <T extends Number> void m(List<T[]> a) {}\n" +
            " }\n");

        MethodCallExpr method = cu.findFirst(
            MethodCallExpr.class,
            c -> c.getNameAsString().equals("m")
        ).get();

        System.out.println(method.calculateResolvedType());
    }
}

Stack trace excerpt.

Exception in thread "main" java.lang.UnsupportedOperationException: T[]
    at MethodResolutionLogic
        .isAssignableMatchTypeParametersMatchingQName(...)
    at MethodResolutionLogic
        .isifiableMatchTypeParameters(...)
    at MethodResolutionLogic.isApplicable(...)
    ...
    at Expression.calculateResolvedType(Expression.java:552)
    at TypeParamIsArray.main(TypeParamIsArray.java:29)

Comments.
• The reporter confirms Java 11.0.18.
```

子集: error_fix_java_v1_2, 用例总数: 60. 提示词: 请根据以下信息修复项目中的 bug. 问题描述: 解析带数组类型参数的泛型方法 (如 List<T[]>) 时, 解析器抛出 java.lang.UnsupportedOperationException: T]. 版本: javaparser-core 3.25.0, javaparser-symbol-solver-core 3.25.0. 之后给出测试用例和堆栈跟踪节选. 评论: 报告者确认使用 Java 11.0.18.

<!-- page 45 of 73 -->

\- The reproduction is later updated because the original parsed compilation unit did not compile.

\- 复现代码后来更新过, 因为最初解析的编译单元无法编译.

\- The suspected cause is incorrect type inference for Arrays.asList(int[]).

\- 疑似原因是对 Arrays.asList(int[]) 的类型推断不正确.

\- The relevant method may be MethodCallExprContext.resolveMethodTypeParameters(..).

\- 相关方法可能是 MethodCallExprContext.resolveMethodTypeParameters(..).

\- The key distinction is that Arrays.asList(new Integer[] {1, 2}) should return List&lt;Integer&gt;, while Arrays.asList(new int[] {1, 2}) should return List&lt;int[]&gt;.

\- 关键区别在于: Arrays.asList(new Integer[] {1, 2}) 应返回 List<Integer>, 而 Arrays.asList(new int[] {1, 2}) 应返回 List<int[]>.

Additional code from discussion.

讨论中补充的代码.

```java
public static<T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}
```

### Example 4: Go Error Fixing 样例 4: Go 错误修复

Subset: error\_fix\_go\_v1\_3. Total cases: 30.

子集: error_fix_go_v1_3. 用例总数: 30.

Prompt. Please fix the bug in the project according to the information below.

提示词. 请根据以下信息修复项目中的 bug.

Issue description. The CORS middleware sends empty and/or unnecessary headers.

问题描述. CORS 中间件会发送空的和 / 或不必要的响应头.

#### Problem description. 问题说明.

\- It sends an empty Access-Control-Allow-Origin header when the request has no Origin header or when the origin is not allowed.

\- 当请求没有 Origin 头或 origin 不被允许时, 它会发送空的 Access-Control-Allow-Origin 头.

\- It sends CORS headers even when the request has no Origin header or when the provided origin is not allowed.

\- 即使请求没有 Origin 头或给出的 origin 不被允许, 它仍发送 CORS 头.

Expected behavior. The CORS middleware should not send an empty Access-Control-Allow-Origin: header. It should only send Access-Control-\* headers when a valid Origin header is provided.

期望行为. CORS 中间件不应发送空的 Access-Control-Allow-Origin: 头, 只应在提供了有效 Origin 头时发送 Access-Control-* 头.

Reproduction commands.

复现命令.

```txt
# Origin is not allowed
curl -X OPTIONS -H "Origin: http://bar.com" -I http://localhost:1323/

HTTP/1.1 204 No Content
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Origin:
Vary: Origin
...

# Origin is missing
curl -X OPTIONS -I http://localhost:1323/

HTTP/1.1 204 No Content
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Origin:
Vary: Origin
...
```

#### Debugging code. 调试代码.

```go
package main

import (
    "net/http"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{"http://example.com"},
    }))
```

<!-- page 46 of 73 -->

```txt
e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })

    e.Logger.Fatal(e.Start(":1323"))
}
```

```txt
Version. v4.1.17
```

### Example 5: JavaScript Code Generation 样例 5: JavaScript 代码生成

```txt
Subset: code_gen_js_v1_3. Total cases: 150.
```

子集: code_gen_js_v1_3. 用例总数: 150.

Prompt. Please implement the following feature based on the provided information.

提示词. 请根据以下信息实现功能.

Feature description. Expose a resetScale method from the ImagePreview component.

功能描述. 从 ImagePreview 组件暴露一个 resetScale 方法.

Motivation. The user needs a button-controlled way to reset image zoom.

动机. 用户需要一种用按钮控制的方式来把放大后的图片恢复原始比例.

Proposed API. Expose resetScale as part of the component API.

建议的 API. 把 resetScale 作为组件 API 的一部分暴露出来.

#### Comments. 评论.

\- The maintainers agree with the requested API change.

\- 维护者同意这项 API 改动.

\- They invite a pull request against the main branch.

\- 他们欢迎向 main 分支提交 pull request.

\- They ask for changelog entries, TypeScript definitions, documentation, and tests if needed.

\- 他们要求在需要时补充变更日志, TypeScript 类型定义, 文档和测试.

\- They also ask the contributor to make sure CI passes before review.

\- 他们还要求贡献者在评审前确保 CI 通过.

#### Tips. 提示.

```txt
ImagePreview component:
  expose resetScale through useExpose
  resetScale signature: () => void

ImagePreviewItem component:
  expose resetScale
  export ImagePreviewItemProps

types.ts:
  add ImagePreviewItemExpose
  add ImagePreviewItemInstance
  add resetScale to ImagePreviewExpose
```

ImagePreview 组件通过 useExpose 暴露 resetScale, 签名为 () => void; ImagePreviewItem 组件暴露 resetScale 并导出 ImagePreviewItemProps; types.ts 中新增 ImagePreviewItemExpose, ImagePreviewItemInstance, 并在 ImagePreviewExpose 中加入 resetScale.

### Example 6: Python Code Generation 样例 6: Python 代码生成

Subset: code\_gen\_python\_v1\_3. Total cases: 90.

子集: code_gen_python_v1_3. 用例总数: 90.

Prompt. Please implement the following feature based on the provided information.

提示词. 请根据以下信息实现功能.

Feature description. Implement a Syntetos-Boylan ADI/CV feature extractor for classifying different types of demand.

功能描述. 实现一个 Syntetos-Boylan ADI/CV 特征提取器, 用于对不同类型的需求做分类.

Task. The implementation should follow the Syntetos-Boylan expert classification of time series from The accuracy of intermittent demand estimates.

任务. 实现应遵循 The accuracy of intermittent demand estimates 一文中 Syntetos-Boylan 对时间序列的专家分类.

#### Parameters. 参数.

```txt
adi_threshold: default 1.32
cv_threshold:  default 0.49
features: optional list of {"adi", "cv2", "class"}
```

#### Behavior. 行为.

```yaml
adi:
  average demand interval.
  last index minus first index,
```

<!-- page 47 of 73 -->

```yaml
divided by number of non-zero values minus one.

cv2:
    variance / mean squared,
    computed on the sample of non-zero values.
    The reference uses the biased variance estimator.

class:
    adi <= threshold and cv <= threshold: "smooth"
    adi <= threshold and cv > threshold: "erratic"
    adi > threshold and cv <= threshold: "intermittent"
    adi > threshold and cv > threshold: "lumpy"
```

adi 为平均需求间隔, 即最后一个非零索引减第一个非零索引, 再除以非零值个数减一. cv2 为方差除以均值的平方, 在非零值样本上计算, 参考实现使用有偏方差估计. class 按两个阈值划分为 「smooth」, 「erratic」, 「intermittent」, 「lumpy」 四类.

#### Comments. 评论.

\- A contributor expresses interest in implementing the feature to better understand time-series analysis.

\- 一位贡献者表示有兴趣实现该功能, 以便更好地理解时间序列分析.

\- The maintainer confirms that the task is suitable as a good first issue.

\- 维护者确认这个任务适合作为 good first issue.

\- The maintainer offers help with the new-estimator guide or partial pull requests.

\- 维护者表示可以在新估计器指南或部分 pull request 上提供帮助.

\- The contributor later explains a delay due to midterms, and the maintainer confirms that there is no rush.

\- 贡献者后来解释因期中考试而延迟, 维护者确认不着急.

#### Tips. 提示.

```python
Create class ADICVTransformer in:
  sktime/transformations/series/adi_cv.py

Class:
  ADICVTransformer(BaseTransformer)

Constructor:
  __init__(self, features=None,
           adi_threshold=1.32,
           cv_threshold=0.49)

_transform:
  return pd.DataFrame with columns:
    "adi", "cv2", "class"

Class labels:
  "smooth", "erratic", "intermittent", "lumpy"
```

在 sktime/transformations/series/adi_cv.py 中创建继承 BaseTransformer 的 ADICVTransformer 类, 构造函数参数为 features=None, adi_threshold=1.32, cv_threshold=0.49; _transform 返回含 「adi」, 「cv2」, 「class」 三列的 pd.DataFrame, 类别标签为 「smooth」, 「erratic」, 「intermittent」, 「lumpy」.

### Example 7: Frontend Artifact Generation 样例 7: 前端产物生成

Subset: artifacts\_v3\_1. Total cases: 100.

子集: artifacts_v3_1. 用例总数: 100.

Prompt excerpt A. Implement the following React requirement in pages/index.tsx. Prefer Tailwind for styling. All required IDs, classes, function names, and implementation constraints must be followed exactly.

提示词节选 A. 在 pages/index.tsx 中实现以下 React 需求, 样式优先用 Tailwind. 所有要求的 ID, class, 函数名和实现约束都必须严格遵守.

Example task: Restaurant inventory statistics page.

示例任务: 餐厅库存统计页面.

```python
Page title:
    <title>Restaurant Inventory Statistics</title>
    <h1>Restaurant Inventory Statistics</h1>

Sales form:
    #sales-form
    #gongbao Kung Pao Chicken sold today
    #yuxiang Yu-Shiang Shredded Pork sold today
    #qingzhu Steamed Sea Bass sold today
    #edit Update inventory

Error area:
    #error-messages
    show "Please enter a numeric value" if input is invalid
    show "Insufficient inventory" if stock is insufficient
    hide after 2 seconds
```

页面标题为 Restaurant Inventory Statistics; 销售表单 #sales-form 含宫保鸡丁, 鱼香肉丝, 清蒸鲈鱼三项当日销量输入和 #edit 更新库存按钮; 错误区 #error-messages 在输入无效时显示 「Please enter a numeric value」, 库存不足时显示 「Insufficient inventory」, 2 秒后隐藏.

<!-- page 48 of 73 -->

```yaml
Stock table:
  #stock-table
  columns: Dish Name / Current Stock / Sold Today
```

库存表 #stock-table, 列为菜名 / 当前库存 / 今日销量.

#### Initialization. 初始化.

```javascript
let dishes = [
    { id: "gongbao", name: "Kung Pao Chicken", stock: 100, threshold: 0 },
    { id: "yuxiang", name: "Yu-Shiang Shredded Pork", stock: 80, threshold: 0 },
    { id: "qingzhu", name: "Steamed Sea Bass", stock: 60, threshold: 0 }
];
```

Prompt excerpt B. Implement a product-review management system with two modules: product management and review management.

提示词节选 B. 实现一个商品评价管理系统, 含商品管理和评价管理两个模块.

```txt
Required elements:
  #container, #title, #nav
  #nav-product, #nav-review
```

必需元素: #container, #title, #nav, 以及导航项 #nav-product, #nav-review.

```yaml
Product module:
  #product-module, #add-commodity
  #add-product-form
  #product-name, #product-price
  #product-description, #product-stock
  #product-status, #product-category
  #add-product-btn, #cancel
  #product-list
 .edit-commodity, .delete-commodity
```

商品模块: 包括新增商品表单 (名称, 价格, 描述, 库存, 状态, 分类), 商品列表, 以及编辑和删除操作.

```txt
Review module:
  #review-module, #add-comment
  #review-form, #review-user
  #rating-stars, .star
  #review-content, #add-review-btn
  #review-list
  .edit-comment, .delete-comment
```

评价模块: 包括评价表单 (用户, 星级, 内容), 评价列表, 以及编辑和删除操作.

```txt
Modal:
    #modal, #modal-content
    #modal-message, #modal-textarea
    #modal-yes, #modal-no
```

弹窗: #modal, #modal-content, #modal-message, #modal-textarea, 以及确认 / 取消按钮 #modal-yes, #modal-no.

#### Original code file. 原始代码文件.

```javascript
import React from 'react';

const Demo = () => {
    return (
        <main>
            <h1>Rsbuild with React</h1>
        </main>
    );
};

export default Demo;
```

### Example 8: Web-Bench Code Task 样例 8: Web-Bench 代码任务

```txt
Subset: web_bench_code_v2_2. Total cases: 80.
```

子集: web_bench_code_v2_2. 用例总数: 80.

Prompt. Add a square-root button with the text “√” to the right of the clear button. Clicking it should calculate the square root using the current display content directly.

提示词. 在清除按钮右侧添加一个文字为 「√」 的平方根按钮, 点击后直接用当前显示内容计算平方根.

Original code.

原始代码.

```html
<!doctype html>
<html lang="en">
  <head>
    ...
    <title>Simple Calculator</title>
    <style>
      .calculator { width: 300px; margin: 50px auto; ... }
```

<!-- page 49 of 73 -->

```html
.display { width: 100%; height: 40px; ... }
 Buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
}
button { padding: 10px; font-size: 18px; ... }
</style>
</head>
<body>
<div class="calculator">
<input type="text" class="display" id="display" readonly />
<div class="buttons">
    <button onclick="calculate('7')">7</button>
    ...
    <button onclick="calculate('=')"></button>
    <button onclick="calculate('+')>+</button>
    <button onclick="calculate('C')" style="grid-column: span 4">
        Clear
    </button>
</div>
</div>

<script>
let displayValue = '';

function calculate(value) {
    if (value === 'C') {
        displayValue = '';
    } else if (value === '=') {
        try {
            displayValue = eval(displayValue).toString();
        } catch (error) {
            displayValue = 'Error';
        }
    } else {
        displayValue += value;
    }
    document.getElementById('display').value = displayValue;
}
</script>
</body>
</html>
```

### Example 9: Repository Question Answering 样例 9: 仓库问答

Subset: repo\_qa\_agent\_v1\_2. Total cases: 100.

子集: repo_qa_agent_v1_2. 用例总数: 100.

Prompt format. Repo QA tasks evaluate whether the agent understands the whole repository, including architecture, repository inputs and outputs, module behavior, implementation details, and bug-location reasoning.

提示词格式. Repo QA 任务评估 Agent 是否理解整个仓库, 包括架构, 仓库输入输出, 模块行为, 实现细节和 bug 定位推理.

#### Task categories. 任务类别.

```csv
Architecture summarization
Repository input/output understanding
Module understanding
Implementation Q&A
Bug localization
```

架构总结; 仓库输入 / 输出理解; 模块理解; 实现问答; bug 定位.

### Example 10: Repository Environment Management 样例 10: 仓库环境管理

Subset: repo\_env\_v1\_1. Total cases: 60.

子集: repo_env_v1_1. 用例总数: 60.

Prompt format. Repo Env tasks evaluate whether the agent can reconstruct and debug a runnable repository environment.

提示词格式. Repo Env 任务评估 Agent 能否重建并调试一个可运行的仓库环境.

Typical requirements.

典型要求.

```txt
1. Inspect the repository structure.
```

<!-- page 50 of 73 -->

```txt
2. Install or repair dependencies.
3. Configure the runtime environment.
4. Run tests or project commands.
5. Diagnose build, dependency, or configuration failures.
6. Verify the repository in a clean execution environment.
```

1. 检查仓库结构. 2. 安装或修复依赖. 3. 配置运行环境. 4. 运行测试或项目命令. 5. 诊断构建, 依赖或配置故障. 6. 在干净的执行环境中验证仓库.

## B Seed-for-Seed Showcase Seed-for-Seed 展示

This appendix presents representative Seed-for-Seed showcase cases. Instead of treating these cases as isolated demos, we organize them as a model-development loop in which Seed2.1 participates in evaluation, data, training, and infrastructure workflows. The cases illustrate four recurring capabilities: long-horizon execution, target-driven iteration, multi-agent collaboration, and reusable workflow consolidation.

本附录给出有代表性的 Seed-for-Seed 展示案例. 我们不把它们当作孤立的演示, 而是组织成一个模型研发循环, Seed2.1 在其中参与评测, 数据, 训练和基础设施工作流. 这些案例体现了四种反复出现的能力: 长程执行, 目标驱动的迭代, 多 Agent 协作, 以及可复用工作流的沉淀.

Overall Showcase A complete internal showcase, including demo videos, execution traces, intermediate artifacts, and final reports, is available at: Seed-for-Seed Overall Showcase.

整体展示: 完整的内部展示, 包括演示视频, 执行轨迹, 中间产物和最终报告, 见 Seed-for-Seed Overall Showcase.

| Eval Loop | Eval Loop | Data Loop |
| --- | --- | --- |
| Case 1: Automated Benchmark IntegrationProblem: external benchmarks require manual adaptation before internal evaluation.Agent workflow: read paper/repo → adapt harness → configure verifier → run smoke tests → align scores.Output: runnable internal benchmark and evaluation report. | Case 2: Automated Model DiagnosisProblem: score tables do not explain capability gaps or next-step improvements.Agent workflow: Auto-Eval selects or generates tests → Post-Eval analyzes traces → hypotheses are verified through new tests.Output: model-diagnosis report and reusable hard-case set. | Case 3: Iterative Rule CleaningProblem: noisy pretraining data requires repeated regex/rule cleaning.Agent workflow: Optimizer proposes rules → Evaluator checks precision/recall → rules are revised.Output: cleaned data, rule history, and failure cases. |
| Training Loop | Training Loop | Infra Loop |
| Case 4: SFT Data SynthesisProblem: improving an SFT metric requires a long algorithm-engineering loop.Agent workflow: propose data plan → synthesize data → launch SFT → run companion evaluation.Output: synthetic data, training job, evaluation results, and experiment report. | Case 5: GUI Agent Co-EvolutionProblem: failed GUI rollouts are hard to convert into precise corrective training data.Agent workflow: compare success/-failure trajectories → locate earliest divergence → generate leak-safe corrective skills.Output: updated task set, corrective skills, and training data. | Case 6: RL Framework OptimizationProblem: RL infrastructure changes often require heavy engineering effort.Agent workflow: build multi-agent harness → actor implements changes → critic evaluates experiments → iterate to quality gate.Output: reusable multi-agent harness and optimized RL training framework. |

Table 8 Seed-for-Seed showcase matrix. The six cases cover evaluation, data, training, and infrastructure loops in the model-development lifecycle.

表 8 Seed-for-Seed 展示矩阵. 六个案例覆盖模型研发生命周期中的评测, 数据, 训练和基础设施循环. 表中各案例依次为: 自动化基准接入 (产出可运行的内部基准和评测报告), 自动化模型诊断 (产出模型诊断报告和可复用的难例集), 迭代式规则清洗 (产出清洗后的数据, 规则历史和失败案例), SFT 数据合成 (产出合成数据, 训练任务, 评测结果和实验报告), GUI Agent 协同演进 (产出更新的任务集, 纠正技能和训练数据), RL 框架优化 (产出可复用的多 Agent harness 和优化后的 RL 训练框架).

## C Fundamental Capability 基础能力

Seed 2.1 maintains frontier-level capability in world knowledge, reasoning, and visual understanding. In addition, Seed 2.1 further strengthens multilingual capability, reflecting the Seed model family's commitment to broader international deployment.

Seed 2.1 在世界知识, 推理和视觉理解上保持前沿水平. 此外, Seed 2.1 进一步加强了多语言能力, 体现了 Seed 模型家族面向更广泛国际部署的投入.

<!-- page 51 of 73 -->

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5.5</td><td>Gemini-3.1 Pro</td><td>Claude-4.7 Opus</td><td>Seed2.1 Turbo</td><td>Seed2.1 Pro</td></tr><tr><td rowspan="4">Infographics</td><td>ChartQAPro [37]</td><td>69.4</td><td>70.2</td><td>65.5</td><td>70.9</td><td>70.9</td></tr><tr><td>OCRBenchv2 [21]</td><td>61.1</td><td>62.8</td><td>56.9</td><td>62.8</td><td>63.2</td></tr><tr><td>CharXiv-DQ [66]</td><td>95.0</td><td>94.9</td><td>93.1</td><td>94.6</td><td>95.5</td></tr><tr><td>CharXiv-RQ [66]</td><td>83.2</td><td>83.5</td><td>82.1</td><td>82.5 / 83.6*</td><td>85.4 / 86.4*</td></tr><tr><td rowspan="4">Math</td><td>MathVista [34]</td><td>84.2</td><td>90.2</td><td>84.4</td><td>90.5</td><td>90.7</td></tr><tr><td>MathVision [61]</td><td>92.2</td><td>89.2</td><td>83.1</td><td>90.1 / 92.7*</td><td>92.6 / 94.5*</td></tr><tr><td>DynaMath [84]</td><td>75.9</td><td>72.1</td><td>63.1</td><td>68.1</td><td>73.1</td></tr><tr><td>MathVerse (Vision-Only) [79]</td><td>84.6</td><td>87.7</td><td>77.4</td><td>89.2</td><td>89.7</td></tr><tr><td rowspan="2">STEM</td><td>MMMU-Pro [78]</td><td>81.2</td><td>80.5</td><td>74.0</td><td>80.1 / 82.2*</td><td>81.6 / 82.7*</td></tr><tr><td>EMMA [23]</td><td>79.0</td><td>72.1</td><td>68.7</td><td>78.4</td><td>79.3</td></tr><tr><td rowspan="3">Visual Puzzles</td><td>ZeroBench [48] (main)</td><td>13.0</td><td>12.0</td><td>8.0</td><td>11.0 / 20.0*</td><td>18.0 / 22.0*</td></tr><tr><td>ZeroBench (sub)</td><td>41.0</td><td>41.9</td><td>37.1</td><td>49.1 / 57.2*</td><td>49.4 / 56.3*</td></tr><tr><td>VisuLogic [71]</td><td>43.5</td><td>44.8</td><td>32.6</td><td>52.9</td><td>54.3</td></tr><tr><td rowspan="5">Perception &amp; Recognition</td><td>VLMsAreBiased [58]</td><td>49.8</td><td>73.5</td><td>30.2</td><td>68.3</td><td>83.6</td></tr><tr><td>VisFactor [26]</td><td>56.2</td><td>54.0</td><td>30.5</td><td>43.9</td><td>51.4</td></tr><tr><td>RealWorldQA [69]</td><td>82.2</td><td>85.4</td><td>75.6</td><td>86.3</td><td>86.7</td></tr><tr><td>BabyVision [7]</td><td>55.9</td><td>54.4</td><td>22.2</td><td>62.9</td><td>73.7</td></tr><tr><td>MeasureBench [33]</td><td>49.9</td><td>44.4</td><td>29.7</td><td>58.9</td><td>62.9</td></tr><tr><td rowspan="3">Knowledge</td><td>SimpleVQA [10]</td><td>58.6</td><td>69.9</td><td>56.5</td><td>71.1</td><td>74.5</td></tr><tr><td>WorldVQA [82]</td><td>34.6</td><td>44.3</td><td>35.9</td><td>48.6</td><td>53.0</td></tr><tr><td>WorldBench [77]</td><td>58.4</td><td>62.9</td><td>52.9</td><td>63.7</td><td>67.6</td></tr><tr><td rowspan="5">Spatial Reasoning</td><td>BLINK [22]</td><td>78.3</td><td>79.1</td><td>70.4</td><td>79.4</td><td>81.4</td></tr><tr><td>MMSIBench (circular) [75]</td><td>36.0</td><td>27.4</td><td>17.4</td><td>31.4</td><td>35.9</td></tr><tr><td>TreeBench [60]</td><td>61.5</td><td>60.5</td><td>36.8</td><td>71.1</td><td>71.1</td></tr><tr><td>ERQA [53]</td><td>64.5</td><td>70.8</td><td>52.5</td><td>71.3</td><td>72.0</td></tr><tr><td>EmbSpatialBench [18]</td><td>81.9</td><td>84.2</td><td>77.2</td><td>82.5</td><td>83.4</td></tr><tr><td rowspan="2">LongContext Understanding</td><td>DUDE [56]</td><td>81.7</td><td>82.1</td><td>84.5</td><td>83.1</td><td>82.8</td></tr><tr><td>MMLongBench-128K [64]</td><td>-</td><td>70.7</td><td>-</td><td>76.9</td><td>78.3</td></tr></table>

Table 9 Fundamental vision capability evaluation. We report Pass@1 in these benchmarks. The best score (no-tool result) for each benchmark is marked in bold, and the second best is underlined. Seed2.1 results marked with an \* are obtained with tools.

表 9 基础视觉能力评测. 这些基准报告 Pass@1. 每个基准的最佳分数 (不用工具的结果) 以粗体标出, 次佳加下划线. Seed2.1 结果中带 \* 的是使用工具得到的.

> **停一下:** 表 9 能不能和 Seed2.0 卡的视觉表逐行相减?
> 多数行可以, 结果有涨有跌. Seed2.0 Pro 到 Seed2.1 Pro (不用工具): MathVision 88.8 到 92.6, EMMA 72.0 到 79.3, VisuLogic 47.4 到 54.3, VisFactor 36.8 到 51.4, TreeBench 64.7 到 71.1, CharXiv-RQ 80.5 到 85.4; 而 ChartQAPro 从 71.2 降到 70.9. 口径可疑的一行是 DUDE: Seed2.0 Pro 72.4 到 82.8, 同时 Gemini 从 Seed2.0 表里 Gemini-3-Pro 的 70.1 变成这里 Gemini-3.1 Pro 的 82.1, 对手和自家同时跳 10 分左右, 更像评测设置变了. MMLongBench 在 Seed2.0 里不带长度后缀 (74.8), 这里是 MMLongBench-128K (78.3), 也不能直接相减. 另外 MinerU 转换丢了粗体和下划线, 表 9 的 「最佳」 只能按数字自己判断.

### C.1 Vision Capabilities 视觉能力

We evaluate Seed2.1 Pro on a broad suite of public vision-language benchmarks, covering infographics, mathematical and STEM reasoning, visual puzzles, perception and recognition, knowledge-intensive VQA, spatial reasoning, and long-context understanding. As shown in Table 9, Seed2.1 Pro delivers consistently strong results against leading frontier models, achieving the best performance on a wide range of benchmarks. In particular, it obtains top scores on CharXiv-RQ (85.4, or 86.4 with tools), MathVision (92.6, or 94.5 with tools), MMMU-Pro (81.6, or 82.7 with tools), ZeroBench, and several perception-oriented benchmarks, demonstrating a substantial improvement in fundamental visual understanding.

我们在一大批公开视觉语言基准上评估 Seed2.1 Pro, 覆盖信息图, 数学与 STEM 推理, 视觉谜题, 感知与识别, 知识密集型 VQA, 空间推理和长上下文理解. 如表 9 所示, Seed2.1 Pro 相对领先的前沿模型一直保持很强的结果, 在大量基准上取得最佳表现. 特别是它在 CharXiv-RQ (85.4, 用工具为 86.4), MathVision (92.6, 用工具为 94.5), MMMU-Pro (81.6, 用工具为 82.7), ZeroBench 以及若干以感知为主的基准上取得最高分, 说明基础视觉理解有了大幅提升.

Math, STEM, and Knowledge. Seed2.1 Pro demonstrates comprehensive strength in mathematical reasoning, achieving the best no-tool performance on MathVista (90.7), MathVision (92.6), and MathVerse (89.7), while remaining highly competitive on DynaMath. With tool use, its advantage becomes more pronounced, reaching 94.5 on MathVision and further widening the gap over other frontier models. In STEM reasoning, Seed2.1 Pro also shows strong progress, achieving the best result on MMMU-Pro (81.6, or 82.7 with tools) and EMMA (79.3). For knowledge-intensive VQA, a traditionally strong area for the Seed series, Seed2.1 Pro further consolidates its advantage, setting new best results on SimpleVQA (74.5), WorldVQA (53.0), and WorldBench (67.6), indicating more reliable visual knowledge grounding and real-world recognition.

数学, STEM 与知识. Seed2.1 Pro 在数学推理上全面强劲, 在 MathVista (90.7), MathVision (92.6) 和 MathVerse (89.7) 上取得不用工具的最佳表现, 在 DynaMath 上也保持很强的竞争力. 使用工具后优势更明显, MathVision 达到 94.5, 进一步拉开与其他前沿模型的差距. 在 STEM 推理上, Seed2.1 Pro 同样进步明显, 在 MMMU-Pro (81.6, 用工具为 82.7) 和 EMMA (79.3) 上取得最佳结果. 知识密集型 VQA 一向是 Seed 系列的强项, Seed2.1 Pro 在这方面进一步巩固优势, 在 SimpleVQA (74.5), WorldVQA (53.0) 和 WorldBench (67.6) 上刷新最佳结果, 说明视觉知识落地和真实世界识别更可靠.

Perception-Centric Visual Understanding. Beyond reasoning-heavy tasks, Seed2.1 Pro makes broad improvements in perception-centered capabilities, including infographic understanding, visual puzzles, perception and

以感知为中心的视觉理解. 在重推理的任务之外, Seed2.1 Pro 在以感知为中心的能力上也全面提升, 包括信息图理解, 视觉谜题, 感知与

<!-- page 52 of 73 -->

<table><tr><td>Capability</td><td>Benchmark</td><td>Human</td><td>Gemini-3.1-Pro</td><td>Gemini-3.5-Flash</td><td>Seed2.1 Turbo</td><td>Seed2.1 Pro</td></tr><tr><td rowspan="3">Knowledge &amp; Reasoning</td><td>VideoSimpleQA [5]</td><td>-</td><td>70.0</td><td>76.0</td><td>71.4</td><td>76.4</td></tr><tr><td>VideoHolmes‡[9]</td><td>-</td><td>65.9</td><td>67.1</td><td>67.6</td><td>68.2</td></tr><tr><td>Minerva‡[39]</td><td>-</td><td>63.5</td><td>68.6</td><td>65.9</td><td>70.7</td></tr><tr><td rowspan="4">Motion &amp; Perception</td><td>TVBench [11]</td><td>94.8</td><td>71.0</td><td>76.4</td><td>77.2</td><td>80.5</td></tr><tr><td>TOMATO [49]</td><td>95.2</td><td>60.4</td><td>71.9</td><td>56.8</td><td>79.5</td></tr><tr><td>MotionBench [25]</td><td>-</td><td>69.9</td><td>70.6</td><td>74.8</td><td>74.9</td></tr><tr><td>ContPhy [81]</td><td>-</td><td>64.5</td><td>63.8</td><td>61.1</td><td>63.6</td></tr><tr><td rowspan="3">Long Video</td><td>VideoMME‡[20]</td><td>-</td><td>86.7</td><td>87.2</td><td>89.0</td><td>89.2</td></tr><tr><td>LVBench [63]</td><td>-</td><td>66.2</td><td>76.3</td><td>76.8</td><td>78.0</td></tr><tr><td>LongVideoBench [68]</td><td>-</td><td>76.5</td><td>77.6</td><td>80.6</td><td>80.6</td></tr><tr><td>Multi Video</td><td>CrossVid [30]</td><td>89.2</td><td>48.8</td><td>58.6</td><td>63.2</td><td>65.0</td></tr><tr><td rowspan="3">Streaming</td><td>LiveSports-3K [6]</td><td>-</td><td>89.0</td><td>86.5</td><td>77.1</td><td>76.8</td></tr><tr><td>OVOBench [40]</td><td>92.8</td><td>64.1</td><td>64.5</td><td>79.2</td><td>80.7</td></tr><tr><td>OVBench [27]</td><td>-</td><td>58.8</td><td>56.5</td><td>69.7</td><td>70.0</td></tr></table>

Table 10 Fundamental video understanding capability evaluation.

表 10 基础视频理解能力评测.

recognition, and spatial reasoning. It achieves leading results on OCRBenchv2 (63.2), CharXiv-DQ (95.5), and CharXiv-RQ (85.4, or 86.4 with tools), reflecting stronger document understanding, chart reading, and fine-grained visual detail extraction. On visual puzzle benchmarks, Seed2.1 Pro reaches the best performance on ZeroBench main (18.0, or 22.0 with tools) and VisuLogic (54.3), showing that improved perception also benefits visually grounded logic solving. The model further achieves top results on VLMsAreBiased (83.6), RealWorldQA (86.7), BabyVision (73.7), and MeasureBench (62.9), and leads or matches the best performance on spatial benchmarks such as BLINK (81.4), TreeBench (71.1), and ERQA (72.0), suggesting stronger robustness in fine-grained recognition and real-world spatial understanding.

识别, 以及空间推理. 它在 OCRBenchv2 (63.2), CharXiv-DQ (95.5) 和 CharXiv-RQ (85.4, 用工具为 86.4) 上取得领先结果, 反映出更强的文档理解, 图表阅读和细粒度视觉细节提取能力. 在视觉谜题基准上, Seed2.1 Pro 在 ZeroBench main (18.0, 用工具为 22.0) 和 VisuLogic (54.3) 上取得最佳表现, 说明感知的提升也有利于基于视觉的逻辑求解. 模型还在 VLMsAreBiased (83.6), RealWorldQA (86.7), BabyVision (73.7) 和 MeasureBench (62.9) 上取得最高分, 并在 BLINK (81.4), TreeBench (71.1), ERQA (72.0) 等空间基准上领先或并列最佳, 说明在细粒度识别和真实世界空间理解上更稳健.

Long-Context Understanding. Seed2.1 Pro also performs strongly on long-context multimodal understanding, achieving 78.3 on MMLongBench-128K. This indicates its ability to process long documents, multi-page materials, and extended task contexts, supporting more stable performance in complex agentic workflows.

长上下文理解. Seed2.1 Pro 在长上下文多模态理解上也表现强劲, 在 MMLongBench-128K 上达到 78.3. 这说明它能处理长文档, 多页材料和较长的任务上下文, 在复杂 Agent 工作流中表现更稳定.

Qualitative Results. Beyond the quantitative evaluation results reported above, we also include qualitative examples that demonstrate Seed2.1's capabilities in tool-augmented vision and visual coding. Further details can be found in Section E and Section F, respectively.

定性结果. 除上面报告的定量评测结果外, 我们还给出一些定性示例, 展示 Seed2.1 在工具增强视觉和视觉编程方面的能力. 详见附录 E 和附录 F.

### C.2 Video Understanding Capabilities 视频理解能力

We conduct a comprehensive evaluation of the Seed2.1 family, including Seed2.1-Turbo and Seed2.1-Pro, across a broad spectrum of video understanding capabilities, spanning knowledge and reasoning, motion perception, long-video comprehension, multi-video understanding, and streaming video analysis. As shown in Table 10, Seed2.1 consistently advances the performance frontier across these dimensions, with Seed2.1-Pro serving as the strongest model in the family and achieving leading results on most reported benchmarks. These results demonstrate the effectiveness of Seed2.1 in strengthening core video intelligence, particularly in video reasoning, fine-grained motion understanding, long video understanding, and real-time streaming scenarios.

我们对 Seed2.1 家族 (包括 Seed2.1-Turbo 和 Seed2.1-Pro) 在广泛的视频理解能力上做了全面评估, 涵盖知识与推理, 运动感知, 长视频理解, 多视频理解和流式视频分析. 如表 10 所示, Seed2.1 在这些维度上持续推进性能前沿, Seed2.1-Pro 是家族中最强的模型, 在大多数报告的基准上取得领先结果. 这些结果说明 Seed2.1 有效加强了核心视频智能, 尤其是在视频推理, 细粒度运动理解, 长视频理解和实时流式场景中.

Specifically, Seed2.1-Pro achieves strong performance on knowledge and reasoning benchmarks, reaching 75.5 on VideoSimpleQA, 68.2 on VideoHolmes, and 70.7 on Minerva. Its gains are especially pronounced in motion perception, where it obtains 80.5 on TVBench, 79.5 on TOMATO, and 74.9 on MotionBench, substantially outperforming Gemini-3.1-Pro and Gemini-3.5-Flash on these benchmarks and narrowing the gap to human-level motion understanding. For long-video understanding, Seed2.1-Pro further reaches 89.2 on VideoMME, 78.0 on LVBench, and 80.6 on LongVideoBench, showing robust capability in long-range temporal

具体来说, Seed2.1-Pro 在知识与推理基准上表现强劲, VideoSimpleQA 达到 75.5, VideoHolmes 达到 68.2, Minerva 达到 70.7. 它在运动感知上的提升尤其明显, TVBench 得 80.5, TOMATO 得 79.5, MotionBench 得 74.9, 在这些基准上大幅超过 Gemini-3.1-Pro 和 Gemini-3.5-Flash, 缩小了与人类水平运动理解的差距. 在长视频理解上, Seed2.1-Pro 进一步在 VideoMME 上达到 89.2, LVBench 78.0, LongVideoBench 80.6, 显示出在长程时序

> **看表:** 正文的 VideoSimpleQA 75.5 与表 10 一致吗, 视频各行相对 Seed2.0 是否都在涨?
> 不一致, 表 10 里 Seed2.1 Pro 的 VideoSimpleQA 是 76.4. 与 Seed2.0 卡的视频表对照 (Seed2.0 Pro 到 Seed2.1 Pro): TOMATO 从 59.9 到 79.5, 涨幅最大; TVBench 75.0 到 80.5, OVOBench 77.0 到 80.7, CrossVid 60.3 到 65.0. 但有四行下降: ContPhy 67.4 到 63.6, MotionBench 75.2 到 74.9, VideoMME 89.5 到 89.2, LiveSports-3K 78.0 到 76.8. TOMATO 的大跳要结合口径看: Seed2.0 卡写明 TOMATO 用过 「Thinking with Tracking」 提示策略, 这张卡没说是否沿用. 表 10 的对手也只有两个 Gemini, 没有 GPT 和 Claude, LiveSports-3K 上 Gemini-3.1-Pro 的 89.0 比 Seed2.1 Pro 高 12.2 分.

<!-- page 53 of 73 -->

modeling and evidence aggregation. In streaming video understanding, Seed2.1-Pro also achieves 80.7 on OVOBench, highlighting its improved ability to process evolving visual inputs and support interactive video reasoning. Despite these advances, gaps remain on several challenging settings such as human-level motion perception and certain streaming scenarios, indicating that fine-grained temporal state tracking, physical dynamics modeling, and real-time cross-context reasoning remain important directions for future work.

建模和证据聚合上的稳健能力. 在流式视频理解上, Seed2.1-Pro 在 OVOBench 上达到 80.7, 突显它处理不断变化的视觉输入, 支持交互式视频推理的能力提升. 尽管有这些进展, 在人类水平的运动感知和某些流式场景等困难设定上仍有差距, 说明细粒度时序状态跟踪, 物理动态建模和实时跨上下文推理仍是未来工作的重要方向.

### C.3 Language Capabilities 语言能力

This section evaluates the model's fundamental language capability, including knowledge, reasoning, and multilingual performance. The knowledge evaluation covers both broad graduate-level knowledge and culturally grounded factual knowledge, using benchmarks such as SuperGPQA [19], KINA [28], and HLE-Verified [44]. The reasoning evaluation further includes scientific and research-code reasoning through SciCode [55], as well as olympiad-style frontier science reasoning through FrontierScience-Olympiad [62]. In addition, we include MSQA to evaluate multilingual and multicultural knowledge coverage, and use HLE-textonly and BrowseComp with search tools to assess search capabilities.

本节评估模型的基础语言能力, 包括知识, 推理和多语言表现. 知识评测既覆盖宽泛的研究生级知识, 也覆盖有文化根基的事实知识, 使用 SuperGPQA [19], KINA [28] 和 HLE-Verified [44] 等基准. 推理评测还包括用 SciCode [55] 考察科学与科研代码推理, 用 FrontierScience-Olympiad [62] 考察奥赛风格的前沿科学推理. 此外, 我们用 MSQA 评估多语言和多文化知识覆盖, 用带搜索工具的 HLE-textonly 和 BrowseComp 评估搜索能力.

<table><tr><td>Category</td><td>Benchmark</td><td>GPT-5.5</td><td>Claude-4.7 Opus</td><td>Gemini-3.1 Pro</td><td>Seed2.1 Turbo</td><td>Seed2.1 Pro</td></tr><tr><td rowspan="5">Knowledge</td><td>SuperGPQA [19]</td><td>72.7</td><td>68.5</td><td>76.6</td><td>67.4</td><td>70.8</td></tr><tr><td>KINA [28]</td><td>52.6</td><td>46.7</td><td>53.2</td><td>46.6</td><td>48.3</td></tr><tr><td>HLE-Verified (no tool) [44]</td><td>50.4</td><td>46.9</td><td>48.2</td><td>42.4</td><td>42.9</td></tr><tr><td>SuperChem [80]</td><td>61.1</td><td>55.0</td><td>71.4</td><td>56.6</td><td>59.8</td></tr><tr><td>ArcAGI2 [45]</td><td>85.0</td><td>75.8</td><td>77.1</td><td>61.3</td><td>62.5</td></tr><tr><td rowspan="7">Reasoning</td><td>SciCode [55]</td><td>58.4</td><td>56.4</td><td>62.3</td><td>57.8</td><td>59.8</td></tr><tr><td>FrontierScience-Olympiad [62]</td><td>69.0</td><td>69.0</td><td>79.0</td><td>76.0</td><td>75.0</td></tr><tr><td>FS - Research [83]</td><td>33.9</td><td>20.0</td><td>16.7</td><td>23.3</td><td>28.3</td></tr><tr><td>LiveMathematicianBench [24]</td><td>50.8</td><td>36.7</td><td>43.5</td><td>27.7</td><td>20.9</td></tr><tr><td>MathArena Apex</td><td>69.8</td><td>-</td><td>58.9</td><td>35.4</td><td>31.3</td></tr><tr><td>AetherCode</td><td>81.6</td><td>52.0</td><td>74.7</td><td>67.9</td><td>65.8</td></tr><tr><td>BeyondAIME [4]</td><td>91.0</td><td>79.0</td><td>90.0</td><td>88.0</td><td>87.0</td></tr><tr><td>Multilingual</td><td>MSQA</td><td>57.4</td><td>42.8</td><td>69.7</td><td>42.0</td><td>50.2</td></tr><tr><td rowspan="2">Search</td><td>HLE-textonly(with Search) [44]</td><td>52.2</td><td>54.7</td><td>51.4</td><td>54.6</td><td>55.7</td></tr><tr><td>BrowseComp(with Search) [67]</td><td>84.4</td><td>79.3</td><td>85.9</td><td>84.9</td><td>86.2</td></tr></table>

Table 11 Fundamental language capability evaluation.

表 11 基础语言能力评测.

MSQA MSQA, short for Multicultural SimpleQA, is an internal multilingual benchmark designed to evaluate culturally specific factual knowledge across 11 major languages. It contains 1,086 human-annotated and reviewed questions covering history and collective memory, beliefs and value systems, social norms and customs, linguistic expression, and cultural products. Each question is designed to have a single objective answer, remain stable over time, and focus on knowledge that is culturally grounded rather than globally generic.

MSQA 是 Multicultural SimpleQA 的缩写, 是一个内部多语言基准, 用来评估 11 种主要语言中与特定文化相关的事实知识. 它包含 1,086 道经人工标注和审核的题目, 覆盖历史与集体记忆, 信仰与价值体系, 社会规范与习俗, 语言表达和文化产品. 每道题都设计成只有一个客观答案, 答案随时间保持稳定, 且聚焦有文化根基的知识, 而不是全球通用的常识.

Results As shown in Table 11, Seed 2.1 shows balanced capability in knowledge, reasoning, and multilingual understanding. Seed2.1-Pro consistently improves over Seed2.1-Turbo on knowledge benchmarks such as SuperGPQA and KINA, as well as on MSQA, indicating stronger factual coverage and better multilingual cultural knowledge with scale. On reasoning-heavy benchmarks, Seed 2.1 performs strongly on SciCode and FrontierScience-Olympiad, with both Seed2.1-Turbo and Seed2.1-Pro remaining competitive against frontier baselines. These results suggest that Seed 2.1 maintains strong core language capability while expanding toward more multilingual and internationally relevant use cases.

结果. 如表 11 所示, Seed 2.1 在知识, 推理和多语言理解上能力均衡. 在 SuperGPQA, KINA 等知识基准以及 MSQA 上, Seed2.1-Pro 都稳定高于 Seed2.1-Turbo, 说明随规模增大, 事实覆盖更强, 多语言文化知识更好. 在重推理的基准上, Seed 2.1 在 SciCode 和 FrontierScience-Olympiad 上表现强劲, Seed2.1-Turbo 和 Seed2.1-Pro 都与前沿基线保持竞争. 这些结果说明 Seed 2.1 在向更多语言, 更国际化的用例扩展的同时, 保持了强劲的核心语言能力.

> **核对:** 表 11 与 Seed2.0 卡同名的行, 哪些是同口径的涨幅, 哪些根本不是同一个设定?
> 同口径可比的 (Seed2.0 Pro 到 Seed2.1 Pro): SuperGPQA 68.7 到 70.8, BeyondAIME 86.5 到 87.0, AetherCode 60.6 到 65.8, FrontierScience-Olympiad 74.0 到 75.0, ARC-AGI-2 37.5 到表 11 的 ArcAGI2 62.5, MathArena Apex 20.3 到 31.3, BrowseComp (带搜索) 77.3 到 86.2. 不同口径的: Seed2.0 的 HLE-Verified 73.6 在搜索 Agent 表里, 表 11 的 HLE-Verified 明确是 「no tool」, 只有 42.9, 两数不能相减; 表 11 的 HLE-textonly (带搜索) 55.7 才对应 Seed2.0 的 HLE-text 54.2. 还有正文没说的一点: 推理行里 Turbo 多处高于 Pro, 如 LiveMathematicianBench 27.7 对 20.9, MathArena Apex 35.4 对 31.3, FrontierScience-Olympiad 76.0 对 75.0, AetherCode 67.9 对 65.8, BeyondAIME 88.0 对 87.0.

<!-- page 54 of 73 -->

## D General Agent Showcase Figures 通用 Agent 展示图

This appendix collects detailed visual showcases for the General Agent section. The main text summarizes the task requirements and model behavior, while the figures here provide supporting visual evidence for crowdsourced evaluation examples, Agent Startup Bench cases, and daily-life task cases.

本附录汇集通用 Agent 一节的详细可视化展示. 正文概述任务要求和模型行为, 这里的图为众包评测示例, Agent Startup Bench 案例和日常生活任务案例提供可视化佐证.

<!-- page 55 of 73 -->

### D.1 Agent Startup Bench and Daily-Life Showcase Figures Agent Startup Bench 与日常生活展示图

#### Task 任务

Given three documents - Method for Calculating Grade Point Average (DOCX, Xiaoming's Transcript (PDF), and 2019 Edition of the Mechanical Design, Manufacturing and Automation (Sino-German) Curriculum (PDF)- the requirements are as follows:

给定三份文档: 平均学分绩点计算方法 (DOCX), 小明的成绩单 (PDF), 以及 2019 版机械设计制造及其自动化 (中德) 培养方案 (PDF). 要求如下:

1. Use the credits listed in the curriculum to fill in the credits for all 66 courses on the transcript. For the two elective courses not listed in the curriculum, assign 2 credits each.

1. 用培养方案中列出的学分, 为成绩单上全部 66 门课程填写学分. 培养方案中没有的两门选修课各记 2 学分.

2. Understand the grade point average calculation method, including the conversion from the five-evel grading system to the percentage system, and calculate the "Total Credits Earned" and "Grade Point Average" values, rounded to two decimal places

2. 理解平均学分绩点的计算方法, 包括五级制到百分制的换算, 计算 「已获总学分」 和 「平均学分绩点」, 保留两位小数.

3. Do not change the original transcript format or text; only fill in the blank fields.

3. 不改动原成绩单的格式和文字, 只填写空白栏.

4. Output a PDF titled Xiaoming's Credits and Grade Points with a layout identical to the original transcript. Characters must not overlap table lines or be misaligned.

4. 输出一份标题为 「小明的学分与绩点」 的 PDF, 版式与原成绩单完全相同. 字符不得压到表格线上或错位.

PDF backfilling issues involving coordinate systems and table alignment

涉及坐标系和表格对齐的 PDF 回填问题

Challenges include heterogeneous document structures (DOCX + 2 PDFs), scanned transcripts and missing fonts that may lead to OCR errors, semantic traps related to the five-level grading system, and

难点包括异构文档结构 (DOCX + 2 份 PDF), 扫描版成绩单和缺失字体可能导致 OCR 错误, 与五级制相关的语义陷阱, 以及

Input Attachments

输入附件

![Image block](images/p55-multi-document-collaborative-analysis-the-model-must.png)

Multi-Document Collaborative Analysis: The model must simultaneously process and correlate information across three documents, performing cross-referencing and logical reasoning.

多文档协同分析: 模型必须同时处理并关联三份文档中的信息, 进行交叉引用和逻辑推理.

Precise Execution of Predefined Rules: The model must accurately understand and apply the calculation methods, ensuring zero errors in the conversion and calculation process.

精确执行预定义规则: 模型必须准确理解并应用计算方法, 保证换算和计算过程零错误.

Strict Adherence to Format and Instructions: The output must remain fully consistent with the original table format, strictly following the instruction to "fill in blanks without modifying the original content", and generating a PDF file as required.

严格遵守格式和指令: 输出必须与原表格格式完全一致, 严格遵循 「只填空白, 不改原内容」 的指令, 并按要求生成 PDF 文件.

![Image block](images/p55-55.png)

<!-- page 56 of 73 -->

The input file contained garbled characters, and the OCRrecognition also resulted in garbled characters. The task was then completed using visual processing

输入文件含有乱码, OCR 识别结果也是乱码, 于是改用视觉处理完成任务

#### Reasoning 推理

The input file contained garbled characters, and the OCR recognition also resulted in garbled characters. The task was then completed using visual processing.

输入文件含有乱码, OCR 识别结果也是乱码, 于是改用视觉处理完成任务.

#### Reasoning 推理

The extracted content is highly disorganized, with many duplicated columns. Since the markdown table is corrupted, I will rely on the PDF images to extract the actual course data.

提取出的内容非常混乱, 有很多重复列. 既然 markdown 表格已经损坏, 我将依靠 PDF 图像提取真实的课程数据.

#### Reasoning 推理

The China-S font uses full-width CJK digits, causing excessive spacing in values such as “2.5”. I will switch back to Helvetica, which uses half-width proportional digits and renders numbers more accurately.

China-S 字体使用全角 CJK 数字, 导致 「2.5」 这类数值间距过大. 我将换回 Helvetica, 它使用半角比例数字, 数字渲染更准确.

#### Result 结果

![Image block](images/p56-their-performance-is-particularly-remarkable-in.png)

Their performance is particularly remarkable in quantitative and foundational engineering courses.

他们在定量类和工程基础类课程上的表现尤其突出.

Figure 24 Agent Startup Bench educational task. Seed 2.1 performs multi-document reasoning, GPA calculation, and layout-preserving PDF backfilling.

图 24 Agent Startup Bench 教育任务. Seed 2.1 完成多文档推理, GPA 计算和保持版式的 PDF 回填.

<!-- page 57 of 73 -->

![Image block](images/p57-figure-25-agent-startup-bench-financial-task-seed-2-1.png)

Figure 25 Agent Startup Bench financial task. Seed 2.1 computes Altman Z-scores over a constrained equity universe and produces an audit-friendly risk table.

图 25 Agent Startup Bench 金融任务. Seed 2.1 在受约束的股票池上计算 Altman Z-score, 并产出便于审计的风险表.

<!-- page 58 of 73 -->

![Image block](images/p58-figure-26-agent-startup-bench-legal-task-seed-2-1.png)

Figure 26 Agent Startup Bench legal task. Seed 2.1 converts bankruptcy-reorganization facts into a structured legal memorandum and recovery strategy.

图 26 Agent Startup Bench 法律任务. Seed 2.1 把破产重整事实转成结构化的法律备忘录和清偿策略.

<!-- page 59 of 73 -->

![Image block](images/p59-figure-27-agent-startup-bench-medical-task-seed-2-1.png)

Figure 27 Agent Startup Bench medical task. Seed 2.1 integrates clinical presentation, imaging context, pathology, and treatment constraints into a diagnosis-centered decision-support workflow.

图 27 Agent Startup Bench 医疗任务. Seed 2.1 把临床表现, 影像背景, 病理和治疗约束整合进以诊断为中心的决策支持工作流.

<!-- page 60 of 73 -->

![Image block](images/p60-figure-28-agent-startup-bench-operations-analytics-task.png)

Figure 28 Agent Startup Bench operations-analytics task. Seed 2.1 converts fragmented operational worksheets into a board-ready, formula-driven Excel analysis system.

图 28 Agent Startup Bench 运营分析任务. Seed 2.1 把零散的运营工作表转成可交董事会, 由公式驱动的 Excel 分析系统.

<!-- page 61 of 73 -->

![Image block](images/p61-figure-29-agent-startup-bench-airline-operations-task.png)

Figure 29 Agent Startup Bench airline-operations task. Seed 2.1 builds a traceable Q4 executive review workbook from large, multi-source airline operations data.

图 29 Agent Startup Bench 航空运营任务. Seed 2.1 从大规模, 多来源的航空运营数据构建可追溯的第四季度高管复盘工作簿.

<!-- page 62 of 73 -->

![Image block](images/p62-figure-30-xdailybench-personal-government-service.png)

Figure 30 xDailyBench personal government-service scheduling task. Seed 2.1 converts a complex administrative scenario into an executable appointment and document-handling plan.

图 30 xDailyBench 个人政务办理排程任务. Seed 2.1 把复杂的行政事务场景转成可执行的预约和材料办理方案.

<!-- page 63 of 73 -->

## E Visual Tool Showcase Figures 视觉工具展示图

This appendix collects detailed visual showcases for the Visual Tool section.

本附录汇集视觉工具一节的详细可视化展示.

<!-- page 64 of 73 -->

![Image block](images/p64-figure-31-seed2-1-leverages-the-code-tool-to-better.png)

Figure 31 Seed2.1 leverages the code tool to better interpret images and tackle the problems.

图 31 Seed2.1 借助代码工具更好地解读图像并解决问题.

<!-- page 65 of 73 -->

![Image block](images/p65-figure-32-seed2-1-leverages-the-code-tool-to-better.png)

Figure 32 Seed2.1 leverages the code tool to better interpret images and tackle the problems.

图 32 Seed2.1 借助代码工具更好地解读图像并解决问题.

<!-- page 66 of 73 -->

![Image block](images/p66-figure-33-seed2-1-leverages-the-code-tool-to-better.png)

Figure 33 Seed2.1 leverages the code tool to better interpret images and tackle the problems.

图 33 Seed2.1 借助代码工具更好地解读图像并解决问题.

<!-- page 67 of 73 -->

![Image block](images/p67-figure-34-seed2-1-leverages-the-code-tool-to-better.png)

Figure 34 Seed2.1 leverages the code tool to better interpret images and tackle the problems.

图 34 Seed2.1 借助代码工具更好地解读图像并解决问题.

<!-- page 68 of 73 -->

## F Visual Coding Showcases 视觉编程展示

The visual coding showcases illustrate Seed 2.1's ability to transform multimodal visual inputs, such as real webpage screenshots, design drafts, sketches, and flowcharts, into directly runnable single-file webpages or frontend applications. These cases highlight the model's integrated frontend production skills: reconstructing page layout, visual style, content hierarchy, and responsive behavior; implementing interactive components, dynamic effects, and complete user flows; and preserving visual fidelity while producing executable artifacts.

视觉编程展示说明 Seed 2.1 能把真实网页截图, 设计稿, 草图和流程图等多模态视觉输入, 转成可直接运行的单文件网页或前端应用. 这些案例突出了模型综合的前端生产能力: 重建页面布局, 视觉风格, 内容层级和响应式行为; 实现交互组件, 动态效果和完整的用户流程; 在产出可执行产物的同时保持视觉还原度.

Case 1: Webpage Recreation

案例 1: 网页复刻

User Input

用户输入

Input image. The user provides a reference webpage screenshot, as shown in Figure 35.
User instruction. Please precisely recreate this website based on the reference image.

输入图像. 用户提供一张参考网页截图, 见图 35. 用户指令. 请根据参考图精确复刻这个网站.

Case 2: Sketch-to-Webpage Generation 1

案例 2: 草图生成网页 1

User Input 用户输入

Input image. The user provides a sketch of the landing page, as shown in Figure 36.
User instruction.
Create an official landing page for the NOVA Esports club based on this draft sketch. Use an 8-bit pixel arcade retro style with the specified high-contrast retro color palette. Add a CRT scan-line effect across the full page. All elements should use square, non-rounded pixel design, with pixel borders and offset shadows. Implement interactions including a boot-up startup animation, player-selection switching, animated match-record bars, a live countdown, and fan barrage message sending. Alternate the corresponding dark backgrounds across different sections as required. For copy details that are not explicit in the sketch, you may supplement or adjust them appropriately.
Unless I explicitly ask to change the layout in the instructions above, or to add content that would change the overall layout, strictly follow the sketch's layout, module order, element count, spatial relationships, and information hierarchy when generating the webpage. You may add necessary visual details and UI polish only if they do not change the layout, do not break the information hierarchy, and do not conflict with the previous instructions.
Unless I explicitly ask to preserve the draft, hand-drawn, or wireframe style, do not directly copy the sketch's rough lines, red annotations, arrow explanations, or temporary marks. Treat them as design intent and translate them into a formal webpage UI.
The final page should look like a normal, complete, usable, and visually polished website, not a traced copy of the sketch.

输入图像. 用户提供一张落地页草图, 见图 36. 用户指令. 根据这张草图为 NOVA 电竞俱乐部做一个官方落地页. 使用 8-bit 像素街机复古风格和指定的高对比复古配色. 全页加 CRT 扫描线效果. 所有元素都用方形, 无圆角的像素设计, 带像素边框和偏移阴影. 实现以下交互: 开机启动动画, 选手切换, 带动画的战绩条, 实时倒计时, 以及粉丝弹幕发送. 按要求在不同区块交替使用对应的深色背景. 草图里没写明的文案细节可以适当补充或调整. 除非上面的指令明确要求改变版式, 或要求加入会改变整体版式的内容, 否则生成网页时严格遵循草图的版式, 模块顺序, 元素数量, 空间关系和信息层级. 只有在不改变版式, 不破坏信息层级, 不与前面指令冲突的前提下, 才可以添加必要的视觉细节和界面打磨. 除非我明确要求保留草稿, 手绘或线框风格, 否则不要直接照搬草图里的粗糙线条, 红色批注, 箭头说明或临时标记, 要把它们当作设计意图, 转成正式的网页界面. 最终页面应当看起来是一个正常, 完整, 可用, 视觉上精致的网站, 而不是草图的描摹.

Case 3: Sketch-to-Webpage Generation 2

案例 3: 草图生成网页 2

User Input 用户输入

Input image. The user provides a sketch of the homepage, as shown in Figure 37. User instruction.

输入图像. 用户提供一张首页草图, 见图 37. 用户指令.

Create a homepage for the Morandi Atelier home-furnishing brand based on this draft sketch. The overall page should feel premium, quiet, and natural, using a Morandi-inspired low-saturation palette with off-white, gray-brown, and wood-texture tones. Use generous whitespace, soft shadows, rounded cards, and subtle frosted-glass or translucent overlay effects. Headings should have an artistic feel, while body copy should remain concise and restrained. Use high-quality furniture and interior-scene imagery where possible, emphasizing materials, craftsmanship, and lifestyle expression. The hero image should feel immersive, with an elegant gradient overlay. Buttons should

根据这张草图为 Morandi Atelier 家居品牌做一个首页. 整体页面要有高级, 安静, 自然的感觉, 采用莫兰迪式低饱和配色, 以米白, 灰棕和木质纹理色调为主. 使用充足的留白, 柔和阴影, 圆角卡片, 以及轻微的毛玻璃或半透明叠层效果. 标题要有艺术感, 正文保持简洁克制. 尽量使用高质量的家具和室内场景图片, 强调材质, 工艺和生活方式表达. 首屏大图要有沉浸感, 带优雅的渐变叠层. 按钮应当

<!-- page 69 of 73 -->

have clear primary and secondary hierarchy. Navigation should be clean on desktop and expandable on mobile. Series cards, space-inspiration filter tabs, service entries, and store information should all include refined hover feedback and transition animations. When switching inspiration categories, the content should update naturally. The newsletter email form should provide clear input states and submission feedback. The brand-story and store-service sections should strengthen messages around craftsmanship, heritage, environmental commitment, appointment experience, and free consultation, making the page feel more like a boutique home-furnishing showroom than an e-commerce promotion page. Keep the copy restrained and elegant, avoiding an overly promotional tone. For copy details that are not fully written in the sketch, you may supplement or adjust them according to the page semantics.

有清晰的主次层级. 导航在桌面端要简洁, 在移动端可展开. 系列卡片, 空间灵感筛选标签, 服务入口和门店信息都要有精致的悬停反馈和过渡动画. 切换灵感类别时, 内容应当自然更新. 订阅邮件表单要有清晰的输入状态和提交反馈. 品牌故事和门店服务区块要强化工艺, 传承, 环保承诺, 预约体验和免费咨询等信息, 让页面更像一间精品家居展厅, 而不是电商促销页. 文案保持克制优雅, 避免过度推销的语气. 草图里没写全的文案细节, 可以按页面语义补充或调整.

Unless I explicitly ask to change the layout in the instructions above, or to add content that would change the overall layout, strictly follow the sketch's layout, module order, element count, spatial relationships, and information hierarchy when generating the webpage. You may add necessary visual details and UI polish only if they do not change the layout, do not break the information hierarchy, and do not conflict with the previous instructions.

除非上面的指令明确要求改变版式, 或要求加入会改变整体版式的内容, 否则生成网页时严格遵循草图的版式, 模块顺序, 元素数量, 空间关系和信息层级. 只有在不改变版式, 不破坏信息层级, 不与前面指令冲突的前提下, 才可以添加必要的视觉细节和界面打磨.

Unless I explicitly ask to preserve the draft, hand-drawn, or wireframe style, do not directly copy the sketch's rough lines, red annotations, arrow explanations, or temporary marks. Treat them as design intent and translate them into a formal webpage UI.

除非我明确要求保留草稿, 手绘或线框风格, 否则不要直接照搬草图里的粗糙线条, 红色批注, 箭头说明或临时标记, 要把它们当作设计意图, 转成正式的网页界面.

The final page should look like a normal, complete, usable, and visually polished website, not a traced copy of the sketch.

最终页面应当看起来是一个正常, 完整, 可用, 视觉上精致的网站, 而不是草图的描摹.

Case 4: Flowchart-to-Webpage Generation 案例 4: 流程图生成网页

User Input 用户输入

Input image. The user provides a flowchart-style process sketch, as shown in Figure 38.
User instruction.

输入图像. 用户提供一张流程图式的过程草图, 见图 38. 用户指令.

Based on this flowchart/process-sketch image, understand the business flow and page logic it expresses, and generate a directly runnable single-file webpage application. Do not redraw the flowchart itself as nodes, arrows, swimlanes, or diagrams; the goal is not to build a flowchart viewer. Instead, implement the real user-facing product experience behind the flow: pages, forms, dashboards, wizards, tools, or applications.

根据这张流程图 / 过程草图, 理解它表达的业务流程和页面逻辑, 生成一个可直接运行的单文件网页应用. 不要把流程图本身重画成节点, 箭头, 泳道或图示, 目标不是做一个流程图查看器. 而是实现流程背后真实的面向用户的产品体验: 页面, 表单, 仪表盘, 向导, 工具或应用.

The complete interaction chain in the flowchart must be implemented in the page, including user actions, page states, step transitions, validation, loading states, success paths, failure paths, and conditional branches. If the flow involves backend APIs, data persistence, login authentication, payment, notifications, or third-party services, simulate them with mock functions in frontend JavaScript; the page behavior must still call these mocks and display reasonable request, response, loading, success, and error states.

流程图中的完整交互链必须在页面中实现, 包括用户操作, 页面状态, 步骤跳转, 校验, 加载状态, 成功路径, 失败路径和条件分支. 如果流程涉及后端 API, 数据持久化, 登录认证, 支付, 通知或第三方服务, 就在前端 JavaScript 里用 mock 函数模拟; 页面行为仍必须调用这些 mock, 并展示合理的请求, 响应, 加载, 成功和错误状态.

If the flowchart contains multiple steps or roles, implement the corresponding multi-step UI and state transitions so that the user can complete the process end to end. Use the main language shown in the image for page copy; if it is unclear, use Chinese. Finally, output only one complete index.html single-file source code containing HTML, CSS, and JavaScript.

如果流程图包含多个步骤或角色, 就实现相应的多步界面和状态流转, 让用户能端到端完成整个流程. 页面文案使用图中显示的主要语言; 不清楚时用中文. 最后只输出一份完整的 index.html 单文件源码, 包含 HTML, CSS 和 JavaScript.

<!-- page 70 of 73 -->

![Image block](images/p70-image.png)

![Image block](images/p70-figure-35-reference-input-and-generated-result-for-the.png)

Figure 35 Reference input and generated result for the webpage recreation showcase (case 1).

图 35 网页复刻展示 (案例 1) 的参考输入与生成结果.

<!-- page 71 of 73 -->

![Image block](images/p71-image.png)

![Image block](images/p71-figure-36-reference-input-and-generated-result-for-the.png)

Figure 36 Reference input and generated result for the first sketch-to-webpage generation showcase (case 2).

图 36 第一个草图生成网页展示 (案例 2) 的参考输入与生成结果.

<!-- page 72 of 73 -->

![Image block](images/p72-image.png)

![Image block](images/p72-reference-sketch.png)

Reference sketch

参考草图

Figure 37 Reference input and generated result for the second sketch-to-webpage generation showcase (case 3).

图 37 第二个草图生成网页展示 (案例 3) 的参考输入与生成结果.

<!-- page 73 of 73 -->

![Image block](images/p73-reference-flowchart.png)

Reference flowchart

参考流程图

![Image block](images/p73-image.png)

![Image block](images/p73-reservation-success-state-in-the-generated-webpage.png)

Reservation success state in the generated webpage

生成网页中的预约成功状态

Generated webpage

生成的网页

Figure 38 Reference input and generated result for the flowchart-to-webpage generation showcase (case 4).

图 38 流程图生成网页展示 (案例 4) 的参考输入与生成结果.

73
