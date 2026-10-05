---
title: "DSec 对照译稿"
category: "基础设施"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek 与清华的沙箱平台论文 DSec 的逐段中英对照译稿, 覆盖四类沙箱后端, 分层环境, 3FS 按需加载, 高密度超卖, 与 RL 框架的协同和评测, 并附读稿时的疑问块."
---
<!-- page 1 of 31 -->

arXiv:2609.22978v1 [cs.DC] 19 Sep 2026

Qdeepseek

# DeepSeek Elastic Compute (DSec): A Sandbox Infrastructure for Effective Agentic Training at Scale / DeepSeek 弹性计算 (DSec): 支撑大规模 Agent 训练的沙箱基础设施

Jialiang Huang<sup>†‡</sup>, Hongxuan Tang<sup>†</sup>, Jingchang Chen†, Yuxuan Liu†, Yixiao Chen†, Yuan Cheng<sup>†</sup>, Yi Tao†, Jingli Zhou†, Yupeng Chen†, Haoyu Chen†, Jiarui Wang<sup>†</sup>, Shengkai Lin†, Chuqi Zhang<sup>†</sup>, Bryan Lee Teng<sup>†</sup>, Lian Guo†, Zhe Fu, Wenjun Gao, Yisong Wang, Liang Zhao, Zehao Wang, Ziwei Xie, Yongqiang Guo, Peixin Cong, Ziyi Gao, Shuiping Yu, Hanwei Xu, Zuofan Wu, Zhizhou Ren, Yuyang Zhou, Bowei Zhang, Zhihuan Huang, Qihao Zhu, Lei Wang, Tianle Lin, Han Yu, Jiewen Hu, Dejian Yang, Shuo Yang, Shanghao Lu, Shaoyuan Chen, Junjie Qiu, Zhangli Sha, Yinmin Zhong, Yongtong Wu, Shiyu Wang, Wei Liu, Bingzheng Xu, Longhao Chen, Qiushi Du, Yuzhen Huang, Shirong Ma, Yaohui Wang, Mingshu Chen, Tongrui Xiong, Y.C. Yan, Haowen Luo, Haofen Liang, Xiaokang Zhang, Weihao Zeng, Runxin Xu, Peiyi Wang, Jinhua Zhu, Ruoyu Zhang, Wenkai Yang, Qi Tang, Jiping Yu, Tian Ye, Ruizhe Pan, Honghui Ding, Xiaodong Liu, Lingxiao Luo, Zhihong Shao, Yuhan Wu, Jibai Lu, Wen Liu, Haoling Zhang, Jingcheng Hu, Yaoyang Ye, Chaofan Lin, Zhaochen Zhang, Jianan Tong, Hengxu Wu, Zhihao Li, Yicheng Wang, Luyao Wang, Yuzhuo Bai, Lingyue Fu, Ruifan Xu, Y.Z. Wang, Zonglin Li, Mingqi Wei, Haiyang Shen, Chengyuan Zhang, Chao Jin, Zili Zhang, R.H. Yang, Xinbo Xu, Jian Zhou, Ruidong Zhu, Yuzhe Guo, Zelun Pan, Shaoheng Nie, Erhang Li, Shuhan Lin, Zheng Liu, Anshuo Chen, Zilong Lyu, Sinuo Cao, Rui Yu, Chuhao Wang, Junyi Guo, Junxiao Song, Kaifeng Chen, Menghao Ye, Junxian Li, Di Wu, Haiyang Ma, Yilun Wang, Haoran Yang, Yizai Cai, Shichun Liu, Yiping Wang, Junbo Sun, Shicheng Xu, Xiao Bi, Ying He, Yichao Zhang, Mingxing Zhang<sup>‡</sup>, Liyue Zhang<sup>∗†</sup>, Panpan Huang, Wenfeng Liang

**DeepSeek-AI** ‡**Tsinghua University**

**research@deepseek.com**

## Abstract

Large-scale agentic training and evaluation with large language models (LLMs) rely on isolated, stateful execution environments in which models inspect repositories, invoke tools, execute commands, and interact with task-specific services. These workloads create sandboxes in large bursts, span heterogeneous functionality and isolation requirements, retain state across long interactions, and draw from large image corpora with limited reuse. Supporting them therefore requires an elastic execution platform rather than a single sandbox runtime.

用大语言模型 (LLM) 做大规模 Agent 训练和评测, 离不开隔离且有状态的执行环境: 模型要在里面查看代码仓库, 调用工具, 执行命令, 与任务专属的服务交互. 这类负载成批地突发创建沙箱, 对功能和隔离强度的要求各不相同, 状态要在很长的交互里一直保留, 镜像又取自一个庞大而复用率很低的库. 支撑它们需要的是一个弹性的执行平台, 单一的沙箱运行时撑不起来.

This report presents DeepSeek Elastic Compute (DSec), a production sandbox platform that exposes FnCall, container, microVM, and full-VM sandbox backends through a unified SDK. DSec coordinates placement and lifecycle management across the cluster, composes environments from independently versioned layers, combines memory sharing, reclamation, and CPU scheduling for high-density execution, and loads image data on demand from Fire-Flyer File System (3FS), a cluster-wide distributed filesystem. DSec is co-designed with the reinforcement learning (RL) framework, decouples stateful rollout execution from preemptible GPU training, coordinates sandbox lifecycle with training to preserve rollout state while reclaiming idle resources, and mitigates agent misbehavior such as reward hacking.

本报告介绍 DeepSeek Elastic Compute (DSec), 一个已投入生产的沙箱平台. 它通过一套统一的 SDK 提供 FnCall, 容器, microVM 和完整虚拟机四类沙箱后端. DSec 在集群范围内统筹放置和生命周期管理, 用各自独立版本化的层来拼装环境, 把内存共享, 内存回收和 CPU 调度结合起来支撑高密度执行, 并从集群级分布式文件系统 Fire-Flyer File System (3FS) 按需加载镜像数据. DSec 与强化学习 (RL) 框架协同设计: 有状态的 rollout 执行与可被抢占的 GPU 训练解耦; 沙箱生命周期与训练节奏配合, 既保住 rollout 状态又回收闲置资源; 同时抑制 reward hacking 一类的 Agent 不当行为.

A single production-scale unit of DSec spans around 160 nodes, serving about 3 million sandboxes per day; in production, it supports over 380,000 concurrent sandboxes and sustains over 5,000 sandbox creations per second. Our evaluation and deployment experience show that these mechanisms reduce environment setup and image-distribution overhead, improve memory efficiency, and preserve latency-sensitive performance under high-density overcommit.

DSec 的一个生产规模单元约有 160 个节点, 每天服务约 300 万个沙箱; 生产中它支撑超过 38 万个并发沙箱, 并能持续每秒创建 5,000 个以上的沙箱. 评测和部署经验表明, 这些机制降低了环境准备和镜像分发的开销, 提高了内存效率, 并在高密度超卖下保住了延迟敏感任务的性能.

∗Corresponding author. <sup>†</sup>DSec project developers. <sup>‡</sup>Tsinghua University. Jialiang Huang is a Ph.D. student advised by Mingxing Zhang. He contributed to this work during an internship at DeepSeek-AI under the mentorship of Liyue Zhang.

∗ 通讯作者. † DSec 项目开发者. ‡ 清华大学. Jialiang Huang 是 Mingxing Zhang 指导的博士生, 这项工作是他在 DeepSeek-AI 实习期间, 由 Liyue Zhang 指导完成的.

<!-- page 2 of 31 -->

## 1. Introduction

Recent advances in frontier LLMs have made agentic workflows practical and widely adopted (Guo et al., 2025; Jimenez et al., 2024; OpenAI et al., 2024). Instead of producing a single text answer, an agentic model interacts with an execution environment: it may navigate codebases, call tools, execute commands, inspect failures, and modify files, or operate browsers and desktop applications through graphical interfaces in computer-use tasks (Xie et al., 2024; Zhou et al., 2024). Across these workloads, the model iterates based on feedback until a task is solved. This execution model has led to a growing ecosystem of agent tools and orchestration harnesses, such as DeepSeek Harness (DSH) (Shi et al., 2026), OpenCode (Anomaly, 2025), and multi-agent training harnesses. Training reliable agents requires reinforcement learning (RL) at scale, in which models learn through interaction with real, isolated execution environments rather than solely from static input-output examples.

前沿 LLM 的进展让 Agent 工作流变得可用, 并已广泛落地 (Guo et al., 2025; Jimenez et al., 2024; OpenAI et al., 2024). Agent 模型不只给出一段文本答案, 而是与执行环境交互: 它会浏览代码库, 调用工具, 执行命令, 检查失败原因, 修改文件; 在 computer-use 任务里还会通过图形界面操作浏览器和桌面应用 (Xie et al., 2024; Zhou et al., 2024). 这些负载的共同点是模型根据反馈反复迭代, 直到任务完成. 这种执行方式催生了一批 Agent 工具和编排 harness, 例如 DeepSeek Harness (DSH) (Shi et al., 2026), OpenCode (Anomaly, 2025), 以及多 Agent 训练 harness. 要训出可靠的 Agent, 需要大规模强化学习 (RL), 让模型在真实, 隔离的执行环境里通过交互学习, 而不只靠静态的输入输出样例.

The agentic training pipeline encompasses environment and data construction, RL rollouts, reward computation, policy updates, and periodic evaluation. Among these stages, RL rollout and evaluation impose the highest pressure on the sandbox platform because they are largescale, concurrent, and tightly coupled with the training loop. In RL (Guo et al., 2025; Ouyang et al., 2022), training proceeds as a feedback loop with three stages. First, during rollout, the current model interacts with the sandboxed environment: it reads files, issues tool calls, executes commands, observes outputs, and produces a trajectory for each task. Second, during reward computation, the framework scores the trajectory using native execution signals such as exit codes, stdout, test pass rates, or task-specific verifiers. Third, during policy update, the RL algorithm updates the model parameters from the collected trajectories and rewards. Periodic evaluation follows a similar execution path, except that the resulting trajectories are used to measure model capability rather than to update parameters. Recent systems further pipeline generation and policy optimization through asynchronous rollouts, continuously replenishing completed samples to maintain high concurrency and mitigate long-tail stragglers (DeepSeek-AI, 2026). For agentic workloads, this design keeps many stateful sandbox sessions in flight and may interrupt and resume their associated rollouts across policy updates or scheduler preemptions, further increasing the platform's concurrency, lifecycle-management, and state-consistency requirements.

Agent 训练流水线包括环境与数据构建, RL rollout, 奖励计算, 策略更新和定期评测. 其中 RL rollout 和评测对沙箱平台的压力最大, 因为它们规模大, 并发高, 又与训练循环紧密耦合. RL (Guo et al., 2025; Ouyang et al., 2022) 的训练是一个三阶段的反馈循环. 第一步 rollout: 当前模型与沙箱环境交互, 读文件, 发工具调用, 执行命令, 观察输出, 为每个任务产出一条轨迹. 第二步奖励计算: 框架用执行本身给出的信号给轨迹打分, 例如退出码, stdout, 测试通过率或任务专属的验证器. 第三步策略更新: RL 算法用收集到的轨迹和奖励更新模型参数. 定期评测走的执行路径类似, 只是产出的轨迹用来衡量模型能力, 不用来更新参数. 近来的系统还用异步 rollout 把生成和策略优化流水化, 不断补入已完成的样本, 维持高并发并减轻长尾拖慢 (DeepSeek-AI, 2026). 对 Agent 负载来说, 这种设计让大量有状态的沙箱会话同时在途, 相关 rollout 还可能在策略更新或调度器抢占时被打断再恢复, 进一步抬高了平台在并发, 生命周期管理和状态一致性上的要求.

For each rollout or evaluation task, the platform must materialize an isolated task-specific environment, including its repositories, dependencies, services, evaluation scripts, and coding harnesses. The environment must be close enough to a real machine to run unmodified software stacks, package managers, build tools, browsers, emulators, and task-specific services. A robust, high-throughput sandbox runtime is therefore foundational for obtaining accurate and verifiable RL and evaluation results.

每个 rollout 或评测任务, 平台都要实例化一个隔离的, 任务专属的环境, 包括代码仓库, 依赖, 服务, 评测脚本和编码 harness. 这个环境要足够接近真实机器, 能跑未经修改的软件栈, 包管理器, 构建工具, 浏览器, 模拟器和任务专属服务. 所以, 稳健且高吞吐的沙箱运行时, 是拿到准确, 可验证的 RL 与评测结果的基础.

Agentic sandbox workloads have several properties that shape the platform design:

Agent 沙箱负载有几项性质决定了平台的设计:

(1) **Rollout and evaluation jobs create sandboxes in a bursty manner.** A single job may request up to 32K sandbox instances, so the platform must accept and place many sandboxes concurrently. Such bursts make horizontal scalability a system-wide requirement and require shared services, such as scheduling and image distribution, to avoid centralized bottlenecks.

(1) **Rollout 和评测作业突发式地创建沙箱.** 单个作业最多可能申请 32K 个沙箱实例, 平台必须同时接纳并放置大量沙箱. 这种突发让水平扩展成为全系统的要求, 调度, 镜像分发这类共享服务也必须避开中心化瓶颈.

(2) **Sandboxes must run at high density.** During agent interaction, a sandbox often waits for the LLM to generate the next action, so CPU usage is sparse and naturally suitable for overcommit. For instance, in production, this allows a single node to host up to 800 microVMs or 3,200 containers, but only if the platform can safely overcommit resources and manage lifecycle pressure at node scale.

(2) **沙箱必须高密度运行.** Agent 交互期间, 沙箱经常在等 LLM 生成下一步动作, CPU 使用很稀疏, 天然适合超卖. 例如在生产中, 单个节点最多可承载 800 个 microVM 或 3,200 个容器, 前提是平台能在节点粒度上安全地超卖资源并处理生命周期压力.

<!-- page 3 of 31 -->

(3) **Agent sandboxes are stateful and long-lived.** The model may modify files, install dependencies, and start services, and later tool calls depend on this accumulated state. Since a sandbox can stay alive across many LLM interaction turns, memory footprint, guest page cache, host page cache, and writable state may remain pinned long after the CPU becomes idle. Under high-density overcommit, these resident costs directly limit cluster capacity, so memory sharing and reclamation become important platform requirements.

(3) **Agent 沙箱有状态且寿命长.** 模型会修改文件, 安装依赖, 启动服务, 之后的工具调用依赖这些累积下来的状态. 沙箱要跨越许多轮 LLM 交互一直存活, 所以在 CPU 闲下来之后很久, 内存占用, guest 页缓存, host 页缓存和可写状态仍可能一直驻留. 在高密度超卖下, 这些常驻开销直接限制集群容量, 内存共享与回收因此成为平台的重要需求.

(4) **Agent workloads are highly heterogeneous.** The platform must cover OJ-like script execution, software-engineering tasks over full repositories, security tasks, computer-use workloads, mobile development environments (e.g., Android), and other full-system environments. These workloads differ substantially in CPU and memory demand, dependency footprint, required system functionality, and isolation strength. A single sandbox abstraction cannot cover all of them efficiently. For example, lightweight function calls are preferable for short stateless tasks, whereas virtual machines (VMs) are better suited to workloads that require a complete commercial off-the-shelf operating system.

(4) **Agent 负载高度异构.** 平台要覆盖 OJ 式的脚本执行, 基于完整仓库的软件工程任务, 安全任务, computer-use 负载, 移动开发环境 (如 Android) 以及其他完整系统环境. 这些负载在 CPU 与内存需求, 依赖体量, 所需系统功能和隔离强度上差别很大, 单一的沙箱抽象没法高效地全部覆盖. 例如, 短小无状态的任务更适合轻量的函数调用, 需要完整商用现成操作系统的负载则更适合虚拟机 (VM).

(5) **Environment diversity is high even within the same workload class.** Training and evaluation corpora contain many tasks, and each task may require its own repository, dependency versions, services, toolkits, evaluation scripts, or VM snapshots. As a result, the platform must serve a large number of distinct images and environment artifacts, with limited reuse for many of them. Under bursty startup, fetching these diverse task images from a registry would concentrate load on the distribution path, inflate startup latency, and introduce extra I/O that interferes with already-running sandboxes. In our ablation, eager image pulling stretches completion time by 1.7×, while on-demand loading reduces cumulative disk writes by 57%.

(5) **同一类负载内部的环境多样性也很高.** 训练和评测语料里有大量任务, 每个任务可能需要自己的仓库, 依赖版本, 服务, 工具包, 评测脚本或 VM 快照. 结果是平台要提供数量庞大的不同镜像和环境制品, 其中很多复用很少. 突发启动时, 如果从镜像仓库拉取这些各不相同的任务镜像, 负载会集中到分发路径上, 拉长启动延迟, 并带来额外 I/O, 干扰已经在跑的沙箱. 在我们的消融里, 预先全量拉取镜像让完成时间变长到 1.7 倍, 按需加载则把累计磁盘写入量减少 57%.

(6) **Agent execution is untrustworthy.** Agents may corrupt filesystems, exhaust resources, or interfere with system components, potentially disrupting rollouts or other co-located workloads. The platform therefore requires fine-grained access control and misbehavior analysis to contain and diagnose agent-induced failures.

(6) **Agent 的执行不可信.** Agent 可能损坏文件系统, 耗尽资源或干扰系统组件, 进而打断 rollout 或同机的其他负载. 平台因此需要细粒度访问控制和不当行为分析, 来圈住并诊断 Agent 引发的故障.

(7) **Agent execution is interruptible.** GPU training jobs may be preempted while longrunning rollouts are still in progress. The platform must therefore preserve execution state and support efficient recovery across interruptions.

(7) **Agent 的执行会被打断.** 长时间运行的 rollout 还没结束, GPU 训练作业就可能被抢占. 平台必须保住执行状态, 并支持跨中断的高效恢复.

These properties define the role of an agent sandbox platform. DSec provides elastic service scaling, high-density resource management, memory sharing and reclamation, multiple isolation mechanisms for different workload classes, scalable image distribution, and explicit integration with the training framework for preemption-safe resumption, task-specific network policy, and agent misbehaving mitigation.

这些性质界定了 Agent 沙箱平台要承担的角色. DSec 提供弹性的服务扩展, 高密度资源管理, 内存共享与回收, 面向不同负载类别的多种隔离机制, 可扩展的镜像分发, 并与训练框架显式集成, 实现抢占安全的恢复, 任务专属的网络策略和 Agent 不当行为的缓解.

The rest of this report presents DSec from platform abstraction to implementation and evaluation. §2 introduces DSec from the user perspective, including supported workloads, sandbox backends, and operating scale. §3 describes the end-to-end platform architecture. §4 characterizes the production workload and the platform challenges it creates. §5 presents the core system mechanisms for environment composition, image distribution, and high-density resource management. §6 describes co-design with the RL framework for environment construction, state preservation, resource reclamation across preemption, and the analysis of agent misbehavior with targeted access-control mitigations. §7 summarizes additional implementation details. §8 evaluates the effectiveness of the design, and §9 discusses related works.

报告其余部分从平台抽象讲到实现和评测. §2 从用户视角介绍 DSec, 包括支持的负载, 沙箱后端和运行规模. §3 描述端到端的平台架构. §4 刻画生产负载及其带来的平台挑战. §5 讲环境组装, 镜像分发和高密度资源管理这几项核心系统机制. §6 讲与 RL 框架的协同设计: 环境构建, 状态保存, 跨抢占的资源回收, 以及对 Agent 不当行为的分析和有针对性的访问控制. §7 汇总其他实现细节. §8 评测设计的效果, §9 讨论相关工作.

## 2. Overview of DSec · DSec 概览

This chapter presents the user-facing view of DSec. From the platform's perspective, users are the training frameworks, evaluation frameworks, and data-construction pipelines that call

<!-- page 4 of 31 -->

the software development kit (SDK) on behalf of researchers; we refer to them collectively as users throughout the report. It covers the SDK entry point, the sandbox backends exposed by the platform and the workload classes they serve, the lifecycle of a sandbox session, and the operating scale of the production deployment.

本章给出 DSec 面向用户的一面. 从平台的角度看, 用户是代表研究员调用软件开发包 (SDK) 的训练框架, 评测框架和数据构建流水线, 报告里统称为用户. 本章覆盖 SDK 入口, 平台提供的沙箱后端及其服务的负载类别, 沙箱会话的生命周期, 以及生产部署的运行规模.

## 2.1. SDK Entry Point · SDK 入口

Users access DSec through libdsec, a Python client library for the sandbox service. libdsec gives users a unified SDK entry point for creating and operating sandboxes, while still requiring them to choose the sandbox backend appropriate for the task. A typical request specifies the sandbox type, image or environment identifier, CPU and memory limits, lifetime settings, network rules, and initial user context. After creation, the user can execute shell commands or tool calls and collect command outputs and return status. List. 1 shows a minimal container session: the client connects to the service endpoint, requests a sandbox with the desired resource and network policy, runs a command, and releases it.

用户通过 libdsec 访问 DSec, 这是沙箱服务的 Python 客户端库. libdsec 为创建和操作沙箱提供统一的 SDK 入口, 但仍要求用户为任务选择合适的沙箱后端. 一个典型请求会指定沙箱类型, 镜像或环境标识, CPU 与内存上限, 生命周期设置, 网络规则和初始用户上下文. 创建之后, 用户可以执行 shell 命令或工具调用, 收集命令输出和返回状态. Listing 1 是一个最小的容器会话: 客户端连上服务端点, 按所需的资源和网络策略申请沙箱, 运行一条命令, 然后释放.

Listing 1 | A minimal sandbox session through libdsec.

```python
client = DSecClient()
await client.open()
args = DSecContainerRunArgs(
    container_image="registry.../sphinx-9658:official",
    memory_limit_mb=4096, cpu_cores_limit=4,
    ttl_running_stop=300,   # idle timeout
    network_rules={"npm": False, "pypi": True},
    init_user="root",
)
sandbox = await client.run_container(args, timeout=120)
result = await sandbox.run_shell("echo hello world")
await sandbox.stop()
```

In this example, the network rules allow access to PyPI (pypi=True) but deny access to NPM (npm=False). This fine-grained network control is discussed in detail in §6. This interface is intentionally not a full semantic abstraction over all backends. Function calls, containers, microVMs, and full VMs have different startup costs, isolation boundaries, filesystem semantics, and operating-system capabilities. libdsec provides a unified access path and a similar operational model, but the caller remains responsible for selecting a backend that matches the workload.

这个例子里, 网络规则允许访问 PyPI (pypi=True), 禁止访问 NPM (npm=False). 这种细粒度网络控制在 §6 详细讨论. 这个接口有意不做成覆盖所有后端的完整语义抽象. 函数调用, 容器, microVM 和完整虚拟机的启动成本, 隔离边界, 文件系统语义和操作系统能力都不同. libdsec 给出统一的访问路径和相近的操作模型, 但选一个与负载匹配的后端仍是调用方的责任.

## 2.2. Sandbox Backends · 沙箱后端

Sandbox runtimes face a fundamental tension: stronger isolation and more complete system functionality usually come with higher startup latency and resource overhead. Since no single sandbox abstraction fits all agentic tasks, DSec supports multiple backends spanning this tradeoff space. Tab. 1 summarizes their typical fit.

沙箱运行时面对一个根本矛盾: 隔离越强, 系统功能越完整, 启动延迟和资源开销通常就越高. 没有一种沙箱抽象能适配所有 Agent 任务, 所以 DSec 支持覆盖这一取舍区间的多个后端. Tab. 1 汇总了它们各自适合的场景.

**FnCall** targets short, stateless tasks such as OJ workloads, code compilation, serverless programs, GPU kernels, and utility code. FnCall tasks run in reusable precreated CPU or GPU containers, avoiding per-invocation provisioning overhead. For GPU workloads, FnCall supports (i) shared mode, where multiple containers share a GPU instance, maximizing utilization for lightweight workloads, and (ii) exclusive mode, where one container reserves a GPU instance during its lifecycle for performance-sensitive tasks (e.g., operator evaluation). **Containers** are the main backend for software-engineering and general tool-use workloads. They provide fast startup and high packing density, and they run the Linux software stacks used by most repository-level tasks. Their main limitation is that they share the host kernel, which is not

<!-- page 5 of 31 -->

| Characteristic | FnCall | Container | MicroVM | Full VM |
| --- | --- | --- | --- | --- |
| Runtime Performance | ●●● | ●●○ | ●○○ | ●○○ |
| Dependency footprint | ○○○ | ●●● | ●●● | ●●○ |
| Isolation level | ○○○ | ●●○ | ●●● | ●●● |
| Full OS functionality | ○○○ | ●○○ | ●●○ | ●●● |
| Resource overhead | ○○○ | ●○○ | ●●○ | ●●● |
| Scenarios | OJ-like tasksGPU kernel exec | SWETool use | SecurityComputer use | COTS OS Graphics |

always appropriate for security-sensitive tasks. **Firecracker microVMs** (Agache et al., 2020) provide a stronger isolation boundary while retaining Linux compatibility. They are useful for security-sensitive tasks, stronger tenant isolation, and workloads that need a VM boundary with Linux compatibility. This comes at higher memory overhead and slower startup than containers. **Full VM backends** cover workloads that require a complete commercial off-the-shelf operating system environment, such as Android VMs through QEMU (Bellard, 2005), as well as those that require a GUI or graphics rendering. These backends have the highest resource overhead, but they are necessary for tasks that depend on OS-specific APIs, mobile runtime behavior, or full-system execution.

**FnCall** 面向短小无状态的任务, 例如 OJ 负载, 代码编译, serverless 程序, GPU kernel 和工具类代码. FnCall 任务跑在可复用的, 预先创建好的 CPU 或 GPU 容器里, 免去每次调用都准备环境的开销. 对 GPU 负载, FnCall 支持两种模式: (i) 共享模式, 多个容器共用一个 GPU 实例, 让轻量负载把利用率拉满; (ii) 独占模式, 一个容器在生命周期内独占一个 GPU 实例, 用于性能敏感的任务 (例如算子评测). **容器**是软件工程和通用工具调用负载的主力后端. 它启动快, 装箱密度高, 能跑大多数仓库级任务用到的 Linux 软件栈. 主要局限是共享宿主内核, 并不总适合安全敏感的任务. **Firecracker microVM** (Agache et al., 2020) 在保留 Linux 兼容性的同时提供更强的隔离边界, 适合安全敏感任务, 更强的租户隔离, 以及既要 VM 边界又要 Linux 兼容的负载, 代价是比容器内存开销更高, 启动更慢. **完整虚拟机后端**覆盖需要完整商用现成操作系统环境的负载, 例如通过 QEMU (Bellard, 2005) 运行的 Android 虚拟机, 以及需要图形界面或图形渲染的负载. 这类后端资源开销最高, 但依赖特定操作系统 API, 移动端运行时行为或完整系统执行的任务离不开它.

In production, containers and microVMs dominate both instance count and resource consumption. FnCall serves a large number of lightweight invocations with a small set of resident environments, while full VM backends cover specialized but important workload classes.

生产中, 容器和 microVM 在实例数和资源消耗上都占大头. FnCall 用少量常驻环境服务大量轻量调用, 完整虚拟机后端则覆盖小众但重要的负载类别.

> **核对:** §2.2 说容器「share the host kernel」, §3.3 又说 FnCall 和容器跑在 QEMU/libvirt 虚拟机里, 容器共享的到底是哪个内核?
> 答: 按 §3.3, 生产中容器不直接跑在裸机上, 每台物理机上先起 QEMU/libvirt 虚拟机, 容器共享的是这台 worker 虚拟机的内核. §2.2 的「host」应理解为容器所在的宿主 (即 worker 虚拟机), 不是裸金属. 这对故障半径有实际影响: §6.4 里 Agent 读 `/proc/kpagecgroup` 触发内核崩溃, 波及的是同一 worker 虚拟机里的所有容器, 不会波及裸机上的其他虚拟机. §8.1 的容器实验也跑在 QEMU 虚拟机里, 与生产部署一致; microVM 实验则直接跑在裸机上, 避免嵌套虚拟化.

## 2.3. User-Visible Lifecycle · 用户可见的生命周期

Although the supported backends differ internally, users see a unified high-level lifecycle. First, the caller creates a sandbox by selecting a backend and specifying the environment artifact, resource limits, lifetime policy, and network policy. The environment artifact varies by backend and workload. For containers and microVMs, it is a base image together with task-specific workspace and toolkit layers, which the platform composes into the running environment. For full VM workloads, it is a prepared VM image or snapshot. For FnCall, it is a task specification containing the task type, dependency files, and the code or script to run. These artifacts become the basis for the environment composition and image-distribution mechanisms discussed later in the report. Second, the platform prepares the environment and makes it ready for interaction. Third, the user issues commands or tool calls, observes outputs, and runs task-specific checks or tests. A sandbox is stateful throughout its lifetime: file edits, installed dependencies, and started services persist across calls, so later commands observe the effects of earlier ones. Because a sandbox stays alive across many interaction turns while its CPU is often idle between them, its resident state remains pinned long after the last command, one of the high-density challenges characterized in §4. Finally, the sandbox is stopped explicitly or reclaimed once its time-to-live elapses, so that idle or abandoned sessions do not hold resources indefinitely.

各后端内部实现不同, 但用户看到的是统一的高层生命周期. 第一步, 调用方选择后端, 指定环境制品, 资源上限, 生命周期策略和网络策略, 创建沙箱. 环境制品随后端和负载而异: 对容器和 microVM, 它是一个基础镜像加上任务专属的工作区层和工具包层, 由平台拼成运行环境; 对完整虚拟机负载, 它是预先准备好的 VM 镜像或快照; 对 FnCall, 它是一份任务说明, 包含任务类型, 依赖文件和要运行的代码或脚本. 这些制品是后文环境组装和镜像分发机制的基础. 第二步, 平台准备环境, 使其可以交互. 第三步, 用户下发命令或工具调用, 观察输出, 运行任务专属的检查或测试. 沙箱在整个生命周期里都是有状态的: 文件改动, 已装的依赖和已启动的服务在调用之间一直保留, 后面的命令能看到前面命令的效果. 沙箱跨越很多轮交互一直存活, 轮与轮之间 CPU 又常常空闲, 所以最后一条命令之后很久它的常驻状态还占着, 这是 §4 刻画的高密度挑战之一. 最后, 沙箱被显式停止, 或在存活时间 (TTL) 到期后被回收, 避免空闲或被遗弃的会话无限期占用资源.

## 2.4. Deployment Scale · 部署规模

DSec is deployed across multiple scale units that share a 3FS (DeepSeek-AI) distributed file system deployment for base images and workspace storage. Within one scale unit, the platform spans nearly 160 CPU nodes with 30K cores and ∼250 TB of DRAM. It manages petabytes of

<!-- page 6 of 31 -->

layers and images. On a typical day, a single scale unit serves about 3 M sandbox instances, with peak concurrency reaching ∼380K and a creation rate exceeding 5,000 instances per second.

DSec 部署在多个规模单元 (scale unit) 上, 这些单元共用一套 3FS (DeepSeek-AI) 分布式文件系统来存放基础镜像和工作区. 一个规模单元内, 平台跨近 160 个 CPU 节点, 共 30K 核, 约 250 TB DRAM, 管理 PB 级的层和镜像. 典型的一天里, 单个规模单元服务约 300 万个沙箱实例, 峰值并发约 38 万, 创建速率超过每秒 5,000 个.

> **拆开:** 30K 核和 250 TB 内存怎么撑住 38 万并发沙箱, 超卖倍数是多少?
> 答: 按 §2.4 的数平均到每个沙箱, 峰值时每核约 $380\text{K}/30\text{K}\approx 12.7$ 个沙箱, 每个沙箱约 $250\text{ TB}/380\text{K}\approx 0.66$ GB 内存, 每节点约 $380\text{K}/160\approx 2{,}400$ 个沙箱, 落在 §4.3 说的 3,200 容器或 800 microVM 的运行点以内. 超卖倍数文中没有给出, 以下只是从已知数字推出的说法, 没有数据验证: 若都按 Listing 1 的规格 (4 核, 4096 MB) 申请, CPU 申请总量约 152 万核, 是物理核的约 50 倍; 内存申请约 1.52 PB, 是物理内存的约 6 倍. CPU 能超卖 50 倍靠的是 §4.3 的「90% 沙箱平均 CPU 用量不到申请量的 5%」, 内存只能超卖几倍, 所以 §5.2 的内存共享和回收才是密度的主要约束.

These numbers are important for understanding the rest of the report. DSec is not a single sandbox runtime or a thin wrapper around containers. It is a production execution platform that must combine user-facing sandbox abstractions, backend-specific runtimes, scalable image storage, high-density resource management, and training-framework integration.

这些数字说明 DSec 面向的是完整的生产执行平台. 系统同时组合了面向用户的沙箱抽象、多个后端运行时、可扩展镜像存储、高密度资源管理和训练框架集成, 覆盖范围远大于单一沙箱运行时.

## 3. Platform Architecture · 平台架构

§2 presented DSec as users see it: an SDK, a set of sandbox backends, and a session lifecycle. This chapter turns to the platform behind that interface and describes how a request travels from the SDK to a running sandbox and which components it passes through. We describe the architecture in terms of cluster-level services and the sandbox runtime. Cluster-level services provide request ingress, identity and access management, sandbox placement, and a view of cluster health and load. The sandbox runtime handles node-local admission, sandbox creation, execution, and resource reclamation, relying on 3FS for image data.

§2 呈现的是用户眼中的 DSec: 一套 SDK, 一组沙箱后端, 一个会话生命周期. 本章转向接口背后的平台, 描述一个请求如何从 SDK 走到一个运行中的沙箱, 途经哪些组件. 架构分成集群级服务和沙箱运行时两部分来讲. 集群级服务负责请求入口, 身份与访问管理, 沙箱放置, 以及集群健康和负载的视图. 沙箱运行时负责节点本地的准入, 沙箱创建, 执行和资源回收, 镜像数据依赖 3FS.

## 3.1. Overview · 总览

![Image block](images/p06-figure-1-dsec-architecture-each-proxy-mediates-communication-between.jpg)

Figure 1 | DSec architecture. Each proxy mediates communication between a container or VM sandbox and the rest of the platform. FnCall follows a separate execution path and does not use this proxy.

At a high level, a sandbox creation request is first sent to IAM for authentication and authorization. Once authorized, the request proceeds to the placement engine, which selects a target node using health and load information collected by the watcher. After placement, the apiserver forwards the request to the edge on that node. The edge then checks local capacity, creating the sandbox with the requested backend if capacity permits and rejecting the request

<!-- page 7 of 31 -->

otherwise. Image data needed by the sandbox is stored in 3FS and fetched on demand during startup and execution. Container, microVM, and full VM sandboxes run a per-sandbox proxy (aether) and one or more chronus instances for command execution, filesystem access, and other runtime operations. After one of these sandboxes is running, its operations are routed through the apiserver, edge, aether, and chronus. FnCall, by contrast, uses neither aether nor chronus and follows a separate request path: the submitted task is executed directly in a precreated container, followed by best-effort cleanup of task state.

从高层看, 一个沙箱创建请求先发给 IAM 做认证和授权. 授权通过后, 请求进入放置引擎 (placement engine), 由它根据 watcher 收集的健康和负载信息选出目标节点. 放置之后, apiserver 把请求转发给该节点上的 edge. edge 检查本地容量, 容量允许就用请求的后端创建沙箱, 否则拒绝请求. 沙箱需要的镜像数据存放在 3FS 上, 在启动和执行期间按需获取. 容器, microVM 和完整虚拟机沙箱里各运行一个每沙箱独立的代理 (aether), 以及一个或多个 chronus 实例, 负责命令执行, 文件系统访问和其他运行时操作. 这几类沙箱运行起来之后, 对它们的操作经 apiserver, edge, aether, chronus 依次路由. FnCall 则既不用 aether 也不用 chronus, 走另一条请求路径: 提交的任务直接在预先创建的容器里执行, 执行完对任务状态做尽力而为 (best-effort) 的清理.

## 3.2. Cluster-Level Services · 集群级服务

Cluster-level services manage access to the platform and coordinate sandbox requests across compute nodes. They comprise IAM, the apiserver, the placement engine, and the watcher.

集群级服务管理对平台的访问, 并在计算节点之间协调沙箱请求, 包括 IAM, apiserver, 放置引擎和 watcher.

**IAM.** Identity and Access Management (IAM) authenticates callers and authorizes all management requests to DSec. For example, requests to create or delete sandboxes or change a user's resource or concurrency limits must pass IAM checks before execution. A principal is the user or service identity associated with a management request. IAM uses projects to define scopes for resource management and access control. Within a project, access policies specify which principals may perform which management operations on its resources, while resource quotas limit resource consumption.

**IAM.** 身份与访问管理 (IAM) 对调用方做认证, 并对发往 DSec 的所有管理请求做授权. 例如创建或删除沙箱, 修改某个用户的资源或并发上限, 这些请求执行前都要通过 IAM 检查. principal 指与一个管理请求关联的用户或服务身份. IAM 用项目 (project) 划定资源管理和访问控制的范围. 在一个项目内, 访问策略规定哪些 principal 能对其资源执行哪些管理操作, 资源配额则限制资源消耗.

We support multi-level project nesting rather than the flat or two-level hierarchies common in cloud platforms. Authorized principals, including agents and harnesses, can create subprojects, delegate part of the parent quota, and grant management permissions within them. Delegation is bounded by the parent: a principal cannot grant permissions it does not hold, and subproject policies and quotas cannot exceed the parent's access-control or resource limits. Humans and agents use the same management API and authorization model.

我们支持多级项目嵌套, 不用云平台常见的扁平或两级层次. 获得授权的 principal (包括 Agent 和 harness) 可以创建子项目, 把父项目的一部分配额委派下去, 并在子项目内授予管理权限. 委派受父项目约束: principal 不能授出自己没有的权限, 子项目的策略和配额不能超出父项目的访问控制或资源上限. 人和 Agent 使用同一套管理 API 和授权模型.

**API Server.** The apiserver serves as the ingress proxy for the sandbox cluster. Training and evaluation code invokes libdsec from trusted GPU servers, while sandboxes execute untrusted model-generated code and may access external networks. The two sides are therefore networkisolated, with the apiserver as the only permitted communication path. All sandbox requests, including creation, command execution, and streaming I/O, pass through this ingress. The apiserver maintains no per-sandbox state. It periodically refreshes the set of edge nodes from the watcher, while each sandbox ID encodes its owning edge. Any apiserver instance can therefore resolve and forward a request directly to the target edge, enabling the ingress tier to scale horizontally.

**API Server.** apiserver 是沙箱集群的入口代理. 训练和评测代码在可信的 GPU 服务器上调用 libdsec, 沙箱里跑的却是模型生成的不可信代码, 还可能访问外网. 因此两侧在网络上是隔离的, apiserver 是唯一允许的通信路径. 所有沙箱请求, 包括创建, 命令执行和流式 I/O, 都经过这个入口. apiserver 不保存任何每沙箱状态. 它定期从 watcher 刷新 edge 节点集合, 而每个沙箱 ID 里编码了所属的 edge. 所以任何一个 apiserver 实例都能直接解析出目标 edge 并转发请求, 入口层可以水平扩展.

**Placement Engine.** The placement engine selects a host node for each new sandbox. Placement proceeds in two stages: filtering and ranking. The filtering stage retains only healthy nodes that provide the backend and hardware capabilities required by the request. For example, a request for a GPU-enabled sandbox is restricted to nodes equipped with the required GPUs. The ranking stage randomly samples a few eligible nodes and selects the least loaded among them.

**放置引擎.** 放置引擎为每个新沙箱选择宿主节点, 分两个阶段: 过滤和排序. 过滤阶段只保留健康的, 具备请求所需后端和硬件能力的节点. 例如请求带 GPU 的沙箱, 候选就限定在装有所需 GPU 的节点上. 排序阶段从合格节点里随机抽几个, 选其中负载最低的.

**Watcher.** The placement engine's decisions are only as good as its view of the fleet, which the watcher provides. The watcher periodically probes the health of each edge and host and collects scheduling-relevant state, such as the number of running sandboxes across backend types, broken down per edge, per user, and per task. The placement engine periodically pulls this state from the watcher and uses the latest view when evaluating new creation requests.

**Watcher.** 放置引擎的决策好坏取决于它对整个机群的视图, 这个视图由 watcher 提供. watcher 定期探测每个 edge 和宿主机的健康状况, 收集与调度相关的状态, 例如各后端类型下正在运行的沙箱数, 按 edge, 用户和任务分别统计. 放置引擎定期从 watcher 拉取这些状态, 评估新的创建请求时用最新的视图.

Please note that neither the placement engine nor the watcher requires durable state. The placement engine keeps no sandbox execution state, and the watcher can rebuild its fleet view

<!-- page 8 of 31 -->

after a restart by polling the edges again. This makes placement engine and watcher instances easy to add or replace without a costly recovery step.

注意, 放置引擎和 watcher 都不需要持久化状态. 放置引擎不保存沙箱执行状态, watcher 重启后重新轮询各 edge 就能重建机群视图. 所以增加或替换放置引擎和 watcher 实例都很容易, 不需要代价高昂的恢复步骤.

## 3.3. Sandbox Runtime · 沙箱运行时

The sandbox runtime creates and operates individual sandboxes and manages their resources. It includes edge, aether, and chronus, and relies on 3FS for shared image storage.

沙箱运行时负责创建和操作单个沙箱并管理其资源, 由 edge, aether 和 chronus 组成, 共享镜像存储依赖 3FS.

**Edge.** Each node runs an edge, a per-machine component that handles creation requests from the apiserver for container, microVM, QEMU-based full VM, and FnCall backends. Before accepting a creation request, the edge checks the node's current capacity and rejects the request if capacity is insufficient. This node-local admission check complements the placement engine's placement decision, which is based on periodically refreshed cluster state. During creation, the edge provisions storage, applies the eBPF-based network policy, and launches the runtime.

**Edge.** 每个节点运行一个 edge, 这是每台机器一个的组件, 处理 apiserver 发来的容器, microVM, 基于 QEMU 的完整虚拟机和 FnCall 的创建请求. 接受创建请求前, edge 检查节点当前容量, 不够就拒绝. 放置引擎的决策基于定期刷新的集群状态, 节点本地的这道准入检查与之互补. 创建过程中, edge 准备存储, 施加基于 eBPF 的网络策略, 再启动运行时.

FnCall and containers run inside QEMU/libvirt VMs rather than directly on the host. The VM provides an isolated kernel and network stack and serves as an additional security boundary between untrusted containers and the bare metal. To better support graphics-intensive workloads, such as computer-use GUI applications, browsers, video games, and 3D rendering, we leverage para-virtualized GPU interfaces of the host hypervisor (e.g., virtio-gpu). Within the full VM, we support both workloads whose graphics APIs are natively compatible with the host OS, as well as those whose rendering stacks can be translated into host-native APIs through compatibility layers such as DXVK (DXVK, 2018).

FnCall 和容器跑在 QEMU/libvirt 虚拟机里, 不直接跑在宿主机上. 虚拟机提供独立的内核和网络栈, 在不可信的容器和裸金属之间多加了一道安全边界. 为了更好地支持图形密集型负载, 例如 computer-use 的 GUI 应用, 浏览器, 电子游戏和 3D 渲染, 我们利用宿主 hypervisor 的半虚拟化 GPU 接口 (例如 virtio-gpu). 在完整虚拟机里, 既支持图形 API 与宿主操作系统原生兼容的负载, 也支持渲染栈能经 DXVK (DXVK, 2018) 这类兼容层翻译成宿主原生 API 的负载.

Besides tracking the sandbox lifecycle, edge coordinates disk and memory snapshots and releases node-local resources when the sandbox stops or its TTL expires.

除了跟踪沙箱生命周期, edge 还协调磁盘和内存快照, 并在沙箱停止或 TTL 到期时释放节点本地资源.

**Aether.** Container and VM sandboxes run aether, a cross-platform proxy that establishes a communication channel with the edge. This edge-to-aether channel uses a platform-specific transport, such as a Unix domain socket for Linux containers or vsock for VM backends. The edge monitors sandbox health through the channel and marks the sandbox as failed if the channel closes. For each operation, aether uses the operation's terminal-session identifier to create or locate the corresponding chronus instance, then forwards the operation over the local channel. When the session ends, aether terminates the corresponding chronus process tree.

**Aether.** 容器和虚拟机沙箱里运行 aether, 一个跨平台代理, 负责与 edge 建立通信通道. edge 到 aether 的通道用各平台专用的传输方式, 例如 Linux 容器用 Unix domain socket, 虚拟机后端用 vsock. edge 通过这条通道监控沙箱健康, 通道关闭就把沙箱标记为失败. 对每个操作, aether 用该操作的终端会话标识创建或找到对应的 chronus 实例, 再经本地通道转发操作. 会话结束时, aether 终止对应的 chronus 进程树.

**Chronus.** chronus provides a shell-session abstraction inside the sandbox, with each instance representing one independent shell session. It exposes cross-platform interfaces for command execution, filesystem operations, HTTP requests, and streaming I/O. Multiple chronus instances can run concurrently within the same sandbox. Together, aether and chronus allow libdsec to expose a unified interface for container and VM sandbox operations.

**Chronus.** chronus 在沙箱内提供 shell 会话抽象, 每个实例代表一个独立的 shell 会话. 它对外提供跨平台的命令执行, 文件系统操作, HTTP 请求和流式 I/O 接口. 同一沙箱里可以并发运行多个 chronus 实例. aether 和 chronus 合起来, 让 libdsec 能为容器和虚拟机沙箱的操作提供统一接口.

**Base image and workspace storage.** The sandbox runtime uses 3FS as a shared backing store for base images and workspace images. Container images are converted offline from OCI into EROFS, which separates metadata from data so that metadata is kept local while image data remains in 3FS. MicroVM disk images use an OverlayBD (Li et al., 2020) format over the same storage. Together, these image formats support on-demand loading and incremental snapshots over a shared base, allowing an edge to start a sandbox without first pulling a full image. §4 characterizes the workload pressures that make scalable image distribution necessary, while §5.3 describes the corresponding on-demand loading mechanism.

**基础镜像与工作区存储.** 沙箱运行时把 3FS 作为基础镜像和工作区镜像的共享后备存储. 容器镜像离线从 OCI 格式转换成 EROFS, EROFS 把元数据和数据分开, 元数据放在本地, 镜像数据留在 3FS. microVM 的磁盘镜像在同一存储上使用 OverlayBD (Li et al., 2020) 格式. 这两种镜像格式都支持按需加载, 以及在共享基础之上做增量快照, edge 不必先拉取完整镜像就能启动沙箱. §4 刻画让可扩展镜像分发成为必需的负载压力, §5.3 描述相应的按需加载机制.

<!-- page 9 of 31 -->

## 3.4. Cloud Bursting with Selective Offloading · 选择性卸载的云端扩容

DSec uses cloud VMs to absorb transient peaks in sandbox demand while serving the steadystate workload on-premise. When on-premise utilization exceeds 80%, the placement engine offloads a portion of eligible incoming sandbox creation requests to cloud VMs.

DSec 在本地机房承担稳态负载, 用云上虚拟机吸收沙箱需求的瞬时峰值. 本地利用率超过 80% 时, 放置引擎把一部分符合条件的新创建请求卸载到云虚拟机上.

Instead of combining a managed container service with object storage, we reuse the onpremise container runtime and EROFS-based image-loading path on cloud VMs. The EROFS images reside in a cloud-hosted distributed filesystem and are mounted by the cloud VMs.

我们没有采用托管容器服务加对象存储的组合, 而是在云虚拟机上复用本地的容器运行时和基于 EROFS 的镜像加载路径. EROFS 镜像放在云上托管的分布式文件系统里, 由云虚拟机挂载.

Production file-access traces show that a compact, de-duplicated EROFS image set totaling 30 TB covers the image files accessed by 70% of container tasks. We synchronize this shared image set to the cloud filesystem offline. Container tasks whose image dependencies are fully contained in this set are classified as cloud-eligible. Other tasks remain on-premise. In production, 200 cloud VMs in one scale unit absorb ∼30% of peak overflow, increasing capacity without over-provisioning the on-premise cluster.

生产中的文件访问 trace 显示, 一个紧凑, 去重后共 30 TB 的 EROFS 镜像集合, 覆盖了 70% 容器任务访问到的镜像文件. 我们把这个共享镜像集离线同步到云文件系统. 镜像依赖完全落在该集合内的容器任务被判为可上云, 其余任务留在本地. 生产中, 一个规模单元配 200 台云虚拟机, 吸收约 30% 的峰值溢出, 在不过量配置本地集群的前提下增加了容量.

> **问:** 「200 台云虚拟机吸收约 30% 的峰值溢出」里, 另外 70% 的溢出去了哪里?
> 答: 文中没有给出. 能确定的约束有两条: 只有镜像依赖全在 30 TB 同步集合内的容器任务才可上云 (约 70% 的容器任务满足文件覆盖), microVM 和完整虚拟机任务不在可上云之列; 卸载只针对「一部分」合格请求. 所以剩下的溢出只能留在本地, 由 edge 准入拒绝后重新放置或在调用方排队. 以下只是从已知数字推出的说法, 没有数据验证: 30% 这个比例更像是 200 台云虚拟机的容量上限, 而不是可上云任务的比例上限, 因为可上云的容器任务约占七成, 远大于三成.

## 4. Production Sandbox Workloads and Platform Challenges · 生产沙箱负载与平台挑战

This chapter characterizes the production workloads served by DSec and the platform challenges that follow from them. We report measurements only for containers and microVMs, which together account for most sandbox instances and resource consumption in production. The measurements show a combination that is unusual for conventional execution services: requests arrive in large bursts, each sandbox retains state across an extended interaction, CPU demand is sparse even when many sandboxes are live, and the environment working set is too diverse for node-local image caches. We connect each workload property to its system consequence here and defer the corresponding mechanisms to the following chapters.

本章刻画 DSec 服务的生产负载, 以及由此产生的平台挑战. 测量只报告容器和 microVM, 两者合起来占生产中大部分沙箱实例和资源消耗. 测量结果呈现出一种对传统执行服务来说少见的组合: 请求成大批突发到达, 每个沙箱在很长的交互里保留状态, 即使大量沙箱同时存活 CPU 需求也很稀疏, 环境工作集又多样到节点本地镜像缓存兜不住. 本章把每项负载性质与它在系统上的后果对应起来, 相应机制留到后面几章.

## 4.1. Lifecycle and Bursty Demand · 生命周期与突发需求

![Image block](images/p09-figure-2-the-distribution-of-the-number-of-sandboxes.jpg)

Figure 2 | The distribution of the number of sandboxes created per task. Data were sampled over one week in early 2026.

Rollout and evaluation tasks create sandboxes in batches rather than at a steady rate. Fig. 2 shows that a typical container task already creates thousands of sandboxes, and the tail reaches tens of thousands. The largest production jobs can request up to 32K sandboxes. These requests arrive within a short window because the training or evaluation batch cannot use an instance until its environment is ready. Consequently, placement, sandbox creation, and environment setup must absorb sharp bursts, while stragglers in any stage delay useful model interaction.

rollout 和评测任务成批创建沙箱, 不是匀速创建. Fig. 2 显示, 一个典型的容器任务就要创建数千个沙箱, 长尾达到数万. 生产中最大的作业可申请多达 32K 个沙箱. 这些请求在很短的时间窗内到达, 因为环境就绪之前, 训练或评测批次用不上这个实例. 于是放置, 沙箱创建和环境准备都得扛住尖锐的突发, 任何一个阶段的拖尾都会推迟有效的模型交互.

<!-- page 10 of 31 -->

![Image block](images/p10-figure-3-a-representative-sandbox-execution-with-setup-tool.jpg)

Figure 3 | A representative sandbox execution with setup, tool-call, and test phases. CPU demand is intermittent after setup, while the memory footprint and accumulated state persist.

Once created, a sandbox proceeds through three broad phases, as illustrated in Fig. 3. The setup phase prepares task dependencies, tools, and initialization state. During the tool-call phase, the model alternates between output generation and sandbox operations, producing short CPU bursts separated by periods in which the sandbox waits for the next action. The test phase verifies the result and can briefly increase resource demand again. These phases do not have fixed durations, but their different resource profiles are important: setup cost is multiplied by burst size, whereas later phases retain sandbox state despite intermittent CPU activity.

沙箱创建后大致经历三个阶段, 如 Fig. 3 所示. 准备 (setup) 阶段准备任务依赖, 工具和初始化状态. 工具调用阶段, 模型在生成输出和操作沙箱之间交替, 形成一段段短促的 CPU 突发, 中间夹着沙箱等待下一步动作的空档. 测试阶段验证结果, 资源需求可能再短暂升高. 这些阶段没有固定时长, 但它们的资源画像不同, 这一点很重要: 准备阶段的开销要乘以突发的规模, 后面的阶段 CPU 活动断断续续, 沙箱状态却一直保留.

## 4.2. Environment Diversity and Setup Pressure · 环境多样性与准备压力

The first challenge is a costly setup phase driven by composing each sandbox from independently evolving software components. A sandbox's content can be decomposed into three parts: a base image providing OS-level dependencies (e.g., Ubuntu, Python 3.10, or a Java 8 environment), a workspace carrying the task's code repository and its task-specific dependencies, and one or more frequently updated toolkits (e.g., the DeepSeek Harness). During one production week, the container backend served 11,266 base images and 102,171 workspaces, while the microVM backend used two shared base images and 53,590 task-specific workspaces. The platform also served 103 toolkits, and 67.8% of sandboxes required at least one workspace or toolkit in addition to the base image.

第一个挑战是准备阶段开销大, 原因在于每个沙箱都要由各自独立演进的软件组件拼成. 沙箱的内容可以拆成三部分: 提供操作系统级依赖的基础镜像 (例如 Ubuntu, Python 3.10 或 Java 8 环境); 承载任务代码仓库及其任务专属依赖的工作区; 以及一个或多个频繁更新的工具包 (例如 DeepSeek Harness). 某个生产周内, 容器后端服务了 11,266 个基础镜像和 102,171 个工作区, microVM 后端用了 2 个共享基础镜像和 53,590 个任务专属工作区. 平台还提供了 103 个工具包, 67.8% 的沙箱在基础镜像之外至少还需要一个工作区或工具包.

| Backend | Base images | Workspaces | Snapshots | Aggregate size |
| --- | --- | --- | --- | --- |
| Container | 11,266 | 102,171 | - | 82.8 TB |
| MicroVM | 2 | 53,590 | 4,889 | 50.9 TB |

Fusing the three components into a single Open Container Initiative (OCI) (Open Container Initiative, 2026) image creates a combinatorial maintenance burden. If the platform maintains 𝑀 base images, 𝑁 workspaces, and 𝐾 toolkits, upgrading 𝑚 base images can require rebuilding their workspace combinations at 𝑂(𝑚·𝑁) cost, while upgrading 𝑘 toolkits costs 𝑂(𝑘·𝑁) when toolkits are combined with workspaces. Fig. 4a gives a concrete example: upgrading Toolkit T1 forces every monolithic image containing it to be rebuilt even though the base images and workspaces are unchanged. The goal is to reduce the corresponding maintenance costs to 𝑂(𝑚)

<!-- page 11 of 31 -->

![Image block](images/p11-figure-4-impact-of-upgrading-toolkit-t1-under-two.jpg)

(a) Monolithic images.

(b) Composable environment layers.

Figure 4 | Impact of upgrading Toolkit T1 under two environment packaging schemes. (a) With monolithic images, every image embedding T1 must be rebuilt even though its base image and workspace are unchanged. (b) With independently versioned composable layers, only the T1 layer is updated and then recombined with existing base-image and workspace layers.

and 𝑂(𝑘) by versioning and distributing the three components independently.

把三部分熔成一个 Open Container Initiative (OCI) (Open Container Initiative, 2026) 镜像, 会带来组合式的维护负担. 设平台维护 $M$ 个基础镜像, $N$ 个工作区和 $K$ 个工具包, 升级 $m$ 个基础镜像可能要重建它们的工作区组合, 代价是 $O(m\cdot N)$; 工具包与工作区打在一起时, 升级 $k$ 个工具包的代价是 $O(k\cdot N)$. Fig. 4a 给了一个具体例子: 升级工具包 T1, 所有内嵌 T1 的单体镜像都得重建, 即使它们的基础镜像和工作区都没变. 目标是让三部分各自独立版本化和分发, 把相应的维护代价降到 $O(m)$ 和 $O(k)$.

A straightforward alternative is to ship workspaces and toolkits as compressed archives and unpack them inside each sandbox at startup. Concentrated across a burst, however, this repeated work drives substantial CPU and I/O overhead and can cause sandbox startup timeouts. Another approach is to maintain each workspace or toolkit as a read-only directory on the host and bind-mount it into the sandbox. A bind mount replaces the target path entirely, whereas these components require append semantics: their files must be merged into the sandbox's existing directory tree without hiding the contents below. Strict read-only mounts also conflict with tools that write into their own installation tree, such as Python creating \_\_pycache directories.

一种直接的替代办法是把工作区和工具包做成压缩包分发, 在每个沙箱启动时解包. 但这种重复劳动集中在一次突发里, 会带来可观的 CPU 和 I/O 开销, 还可能导致沙箱启动超时. 另一种办法是把每个工作区或工具包维护成宿主机上的只读目录, bind mount 进沙箱. 可 bind mount 会整个替换目标路径, 而这些组件需要的是追加语义: 它们的文件要合并进沙箱已有的目录树, 不能遮住下面的内容. 严格只读的挂载还与往自己安装目录里写东西的工具冲突, 例如 Python 会创建 \_\_pycache 目录.

## 4.3. Sparse Utilization and High-Density Execution · 稀疏利用率与高密度执行

![Image block](images/p11-figure-5-distribution-of-average-and-peak-cpu-and.jpg)

Figure 5 | Distribution of average and peak CPU and memory usage, normalized by the resources requested for each sandbox. Data were sampled over one week in early 2026.

As shown in Fig. 5, approximately 90% of both container and microVM sandboxes use no more than 5% of their requested CPU capacity on average, making overcommit a natural choice. The one-day sample from early 2026 in Fig. 6 shows per-node peaks of 1,048 containers and 524 microVMs. Across production, however, we have observed stable operation with at least 3,200 containers or 800 microVMs per node. These are demonstrated operating points rather than

<!-- page 12 of 31 -->

hard limits. At such densities, memory inefficiency and CPU interference become increasingly important.

如 Fig. 5 所示, 容器和 microVM 沙箱里都有约 90% 平均只用到所申请 CPU 容量的 5% 以内, 超卖是自然的选择. Fig. 6 是 2026 年初某一天的采样, 单节点峰值为 1,048 个容器和 524 个 microVM. 不过在整个生产环境中, 我们观察到每节点至少 3,200 个容器或 800 个 microVM 的稳定运行. 这些是实际跑出来的运行点, 不是硬上限. 在这样的密度下, 内存效率低下和 CPU 干扰越来越要紧.

![Image block](images/p12-figure-6-the-number-of-live-sandboxes-on-one.jpg)

Figure 6 | The number of live sandboxes on one production node over a day. The observed peaks are 1,048 containers and 524 microVMs. Data were sampled over one day in early 2026.

![Image block](images/p12-figure-7-sandbox-lifetime-distributions-sampled-from-30k-containers.jpg)

Figure 7 | Sandbox lifetime distributions sampled from 30K containers and 10K microVMs. Median lifetimes are 17.4 and 15.5 minutes, respectively, and p99 lifetimes exceed three hours for both backends. Data were sampled over one week in early 2026.

For memory, microVMs incur two sources of waste. First, image data read through a virtual block device can be cached once by the host and again by each guest, causing the same data to be cached redundantly across the guest-host boundary. Second, free pages inside a guest are not returned to the host without explicit reporting. Because requested memory capacity often exceeds actual demand, the guest experiences little internal pressure to reclaim inactive pages. Fig. 7 shows that these sandboxes are also long-lived: median lifetimes are 17.4 minutes for containers and 15.5 minutes for microVMs, and p99 lifetimes exceed three hours for both backends. These long lifetimes amplify the cost of retained memory. Together, these effects constrain memory overcommit for microVMs, particularly at high sandbox density.

内存方面, microVM 有两处浪费. 其一, 经虚拟块设备读入的镜像数据, 可能在宿主机缓存一份, 又在每个 guest 里各缓存一份, 同一份数据跨 guest 与 host 边界被重复缓存. 其二, guest 内部的空闲页如果不显式上报, 就不会还给宿主机. 申请的内存容量往往超过实际需求, guest 内部几乎没有压力去回收不活跃的页. Fig. 7 显示这些沙箱寿命还长: 容器中位寿命 17.4 分钟, microVM 15.5 分钟, 两类后端的 p99 寿命都超过 3 小时. 寿命长放大了驻留内存的代价. 这几方面合在一起, 限制了 microVM 的内存超卖, 沙箱密度高时尤其明显.

For CPU, some tasks impose strict per-step latency budgets, such as game-playing agents with a fixed time limit per move. Giving best-effort work a lower scheduler priority alone is insufficient when best-effort and latency-sensitive tasks run on sibling simultaneous multi-threading contexts and still share core execution resources. The platform must improve CPU utilization through overcommit without interfering with latency-sensitive tasks.

CPU 方面, 有些任务对每一步有严格的延迟预算, 例如下棋的 Agent 每一步有固定的时限. 当尽力而为 (best-effort) 任务与延迟敏感任务跑在同一物理核的两个同时多线程 (SMT) 上下文里, 仍共用核心的执行资源时, 只给尽力而为任务调低调度优先级是不够的. 平台要靠超卖提高 CPU 利用率, 又不能干扰延迟敏感任务.

> **停一下:** 日均 300 万个沙箱, 中位寿命约 17 分钟, 为什么峰值并发能到 38 万?
> 答: 用 Little 定律 $L=\lambda W$ 核对: $L$ 是平均并发, $\lambda$ 是平均到达率, $W$ 是平均寿命. 日均到达率 $\lambda\approx 3\times10^6/86400\approx 35$ 个/s, 若 $W$ 取中位数 17.4 分钟 (约 1044 s), 平均并发只有约 3.6 万, 比 §2.4 的 38 万峰值小一个数量级. 文中没有给出平均寿命, 以下只是从已知数字推出的说法, 没有数据验证: 差距来自两处, 一是 Fig. 7 的分布右偏, p99 超过 3 小时, 均值明显大于中位数 (若要平均并发达到 38 万, 平均寿命需约 3 小时); 二是 38 万是峰值而不是均值, §4.1 的突发让瞬时并发远高于日均. 两个因素各占多少, 用文中数字分不开.

<!-- page 13 of 31 -->

## 4.4. Large Image Working Sets and Low Fanout · 庞大的镜像工作集与低扇出

The sheer volume of sandbox images presents the third challenge. As shown in Tab. 2, the artifacts active during one production week occupy more than 130 TB in aggregate, far beyond what a single worker node can store. As Fig. 8 shows, container images have a median fanout of three and a p90 fanout of 28, while microVM images have a median fanout of one and a p90 fanout of three. This low fanout leads to poor local image-cache utilization because the working set is too diverse to be effectively absorbed by a single node. Consequently, when a burst of sandbox creation requests arrives, image pulling becomes inevitable and places substantial pressure on the image distribution infrastructure.

沙箱镜像的体量是第三个挑战. 如 Tab. 2 所示, 一个生产周内活跃的制品合计超过 130 TB, 远超单个 worker 节点的存储能力. 如 Fig. 8 所示, 容器镜像的扇出 (fanout, 一个镜像在一个任务内被多少个沙箱使用) 中位数为 3, p90 为 28; microVM 镜像的扇出中位数为 1, p90 为 3. 扇出低意味着本地镜像缓存的利用率差, 工作集多样到单个节点吸收不了. 于是一批沙箱创建请求突发到达时, 拉镜像不可避免, 镜像分发基础设施承受很大压力.

![Image block](images/p13-figure-8-per-task-image-fanout-measured-over-more.jpg)

Figure 8 | Per-task image fanout measured over more than 1.5 million containers and 390K microVMs. Most images are used by only a small number of sandboxes within a task. Data were sampled over one week in early 2026.

| Image type | C++ | Go | Java | JavaScript | Python |
| --- | --- | --- | --- | --- | --- |
| Accessed data | 8.7% | 13.3% | 9.2% | 4.2% | 6.0% |
| Image size | 4.9 GB | 4.1 GB | 12.1 GB | 9.6 GB | 6.0 GB |

Because overcommit keeps the cluster near full utilization, pulling and materializing complete images consumes CPU and I/O resources that would otherwise serve running sandboxes. Pre-warming merely shifts this overhead earlier without eliminating it: the same data must still be transferred and materialized, and the complete images still occupy local storage. Moreover, sandboxes typically access only a small fraction of their image data. Across the sampled container images for different programming languages in Tab. 3, runtime access covers only 4.2% to 13.3% of the image data, making full-image pulls especially wasteful. These observations motivate on-demand image loading.

超卖让集群一直接近满载, 拉取并落地完整镜像要消耗本该服务运行中沙箱的 CPU 和 I/O. 预热只是把这笔开销提前, 并没有消掉: 同样的数据仍要传输和落地, 完整镜像仍占着本地存储. 而且沙箱通常只访问镜像数据的一小部分. Tab. 3 抽样了不同编程语言的容器镜像, 运行时访问只覆盖镜像数据的 4.2% 到 13.3%, 拉全量镜像格外浪费. 这些观察促成了按需加载镜像.

## 5. Core System Mechanisms · 核心系统机制

§4 identifies three coupled infrastructure challenges. First, bursty creation and independently evolving environment components require a setup path whose cost does not scale with repeated per-sandbox extraction. Second, sparse CPU demand makes high-density execution valuable, but long lifetimes, retained memory, and mixed latency requirements make unconstrained overcommit unsafe. Third, a large image corpus with low fanout and low runtime access ratios makes eager full-image distribution both expensive and disruptive.

§4 指出三个相互耦合的基础设施挑战. 第一, 突发创建加上各自独立演进的环境组件, 要求准备路径的开销不随每个沙箱重复解包而增长. 第二, CPU 需求稀疏让高密度执行有价值, 但寿命长, 内存驻留和混合的延迟要求让不加约束的超卖不安全. 第三, 镜像库庞大, 扇出低, 运行时访问比例低, 预先分发全量镜像既昂贵又会干扰运行中的任务.

<!-- page 14 of 31 -->

![Image block](images/p14-figure-9-overview-of-the-core-system-mechanisms-ls.jpg)

Figure 9 | Overview of the core system mechanisms. LS denotes latency-sensitive and BE denotes best-effort.

This chapter presents the corresponding mechanisms for environment composition, highdensity resource management, and scalable image distribution, as shown in Fig. 9.

本章给出相应的机制: 环境组装, 高密度资源管理和可扩展的镜像分发, 如 Fig. 9 所示.

## 5.1. Composable Environment Layers · 可组合的环境层

Our insight is that the base OS environment, each workspace, and each toolkit are logically independent layers with their own lifecycles, rather than components that must be fused into a single monolithic image. As illustrated in Fig. 4b, a toolkit can therefore be updated independently and recombined with existing base-image and workspace layers. Overlayfs natively provides the merge semantics we need: when multiple read-only lower directories are stacked, the kernel presents a unified directory tree where files from all layers coexist, resolving conflicts by priority order. A writable upper directory sits atop the stack, transparently absorbing any runtime writes without modifying the read-only layers underneath.

我们的出发点是: 基础操作系统环境, 每个工作区和每个工具包在逻辑上是各有生命周期的独立层, 而不是必须熔成一个单体镜像的组件. 如 Fig. 4b 所示, 工具包因此可以单独更新, 再与已有的基础镜像层和工作区层重新组合. overlayfs 原生就提供了所需的合并语义: 多个只读的下层目录 (lower directory) 叠在一起时, 内核呈现一棵统一的目录树, 各层文件共存, 冲突按优先级顺序解决. 一层可写的上层目录 (upper directory) 放在栈顶, 透明地接住所有运行时写入, 不改动下面的只读层.

We modify the container runtime (i.e., dockerd) to dynamically compose the overlayfs stack (i.e., lowerdir) at sandbox creation time. The base image sits at the bottom, the requested workspace is inserted as a read-only layer above it, and each requested toolkit is stacked on top. This merges workspace and toolkit files into the base-image tree rather than replacing paths, directs runtime writes to the writable upper layer, and permits arbitrary layer combinations without coupling their lifecycles. Consequently, upgrading 𝑚 base images now requires rebuilding only those 𝑚 base layers, leaving workspaces and toolkits untouched, while upgrading 𝑘 toolkits requires rebuilding only those 𝑘 toolkit layers. This reduces the 𝑂(𝑚·𝑁) and 𝑂(𝑘·𝑁) costs of the monolithic-image scheme to 𝑂(𝑚) and 𝑂(𝑘).

我们修改了容器运行时 (即 dockerd), 在创建沙箱时动态拼装 overlayfs 栈 (即 lowerdir). 基础镜像在最底层, 请求的工作区作为只读层插在它上面, 请求的每个工具包再依次叠在顶上. 这样工作区和工具包的文件是合并进基础镜像的目录树, 而不是替换路径; 运行时写入落到可写上层; 各层可以任意组合, 生命周期互不耦合. 于是升级 $m$ 个基础镜像只需重建这 $m$ 个基础层, 工作区和工具包不动; 升级 $k$ 个工具包只需重建这 $k$ 个工具包层. 单体镜像方案的 $O(m\cdot N)$ 和 $O(k\cdot N)$ 代价降到了 $O(m)$ 和 $O(k)$.

Since published environment layers are immutable, we store them in EROFS (Gao et al., 2019), a filesystem designed specifically for read-only data. Compared with writable filesystems such as ext4 or XFS, EROFS avoids write-related bookkeeping and uses a simpler, more compact on-disk layout. EROFS also supports data compression while preserving random access to file contents. Unlike a tar.gz archive, EROFS can read and decompress only the compressed blocks covering the requested data, so the complete image does not have to be transferred and unpacked before use.

已发布的环境层是不可变的, 所以我们用 EROFS (Gao et al., 2019) 存放它们, 这是专为只读数据设计的文件系统. 与 ext4, XFS 这类可写文件系统相比, EROFS 省掉了与写入相关的簿记, 磁盘布局更简单紧凑. EROFS 还支持数据压缩, 同时保留对文件内容的随机访问. 与 tar.gz 归档不同, EROFS 可以只读取并解压覆盖所需数据的那些压缩块, 用之前不必把整个镜像传过来解开.

<!-- page 15 of 31 -->

For microVMs, base images and toolkits are packaged as independently versioned EROFS images and exposed to the guest as read-only block devices. Inside the guest, the root filesystem uses overlayfs, with the mounted EROFS filesystems as lower layers and a directory on an ext4- formatted writable disk as the upper layer. This gives microVMs the same composable-layer model as containers.

对 microVM, 基础镜像和工具包打包成各自独立版本化的 EROFS 镜像, 以只读块设备的形式暴露给 guest. 在 guest 内部, 根文件系统用 overlayfs, 挂载的 EROFS 文件系统作下层, 一块 ext4 格式可写磁盘上的目录作上层. 这让 microVM 拥有与容器相同的可组合层模型.

## 5.2. High-Density Resource Management · 高密度资源管理

**Memory efficiency.** Virtio-pmem with DAX (QEMU Project, 2026) eliminates page-cache duplication by mapping file accesses directly to host-backed pages without copying them into guest RAM, allowing co-located microVMs to share one host page-cache copy (§8.4). However, virtio-pmem is not suitable for every disk. First, cold accesses through virtio-pmem with DAX can require synchronous fault handling to establish mappings and make backing data available. The buffered virtio-blk path can instead benefit from guest-side readahead and batched block I/O. Second, the guest must allocate struct page metadata for the entire pmem-backed address range. With 4 KiB pages and a 64-byte struct page, this metadata requires guest RAM equal to 1/64 of the pmem device capacity. For example, a 128 GB pmem device requires 2 GB of guest RAM for this metadata.

**内存效率.** 带 DAX 的 virtio-pmem (QEMU Project, 2026) 把文件访问直接映射到宿主机提供的页上, 不拷进 guest 内存, 消除了页缓存的重复, 同机的多个 microVM 可以共用宿主机上的一份页缓存 (§8.4). 不过 virtio-pmem 并不适合所有磁盘. 第一, 经带 DAX 的 virtio-pmem 做冷访问, 可能需要同步的缺页处理来建立映射并让后备数据就位, 而带缓冲的 virtio-blk 路径能受益于 guest 端的预读和批量块 I/O. 第二, guest 必须为整个 pmem 后备的地址范围分配 struct page 元数据. 页大小 4 KiB, struct page 为 64 字节, 这份元数据要占相当于 pmem 设备容量 1/64 的 guest 内存. 例如 128 GB 的 pmem 设备要用 2 GB guest 内存存放这份元数据.

For disks that do not use virtio-pmem, cold file data can accumulate in the guest page cache and must be reclaimed separately. We therefore combine DAMON (Data Access MONitor) (Park et al., 2019) with virtio-balloon free-page reporting. The virtio-balloon driver (Waldspurger, 2002) supports free-page reporting: the guest periodically scans its buddy allocator and proactively reports free pages to the host hypervisor, which releases the corresponding host memory via madvise(MADV\_DONTNEED). By default, free-page reporting operates on order-9 pages, corresponding to 2 MiB regions with 4 KiB base pages, although this order can be adjusted through a kernel parameter. To boost free-page reporting, we employ DAMON, a samplingbased memory-access monitoring framework in Linux. DAMON periodically samples pageaccess bits to identify cold file pages that have remained untouched beyond a configurable age threshold and evicts them through the kernel's reclaim path. This reclamation frees scattered file pages back to the buddy allocator, which coalesces them into higher-order blocks that satisfy the requirement of free-page reporting.

对不用 virtio-pmem 的磁盘, 冷的文件数据会在 guest 页缓存里越积越多, 必须单独回收. 我们因此把 DAMON (Data Access MONitor) (Park et al., 2019) 与 virtio-balloon 的空闲页上报 (free-page reporting) 结合起来. virtio-balloon 驱动 (Waldspurger, 2002) 支持空闲页上报: guest 定期扫描自己的 buddy 分配器, 主动把空闲页报给宿主 hypervisor, 后者用 madvise(MADV\_DONTNEED) 释放对应的宿主内存. 空闲页上报默认以 order-9 的页为单位, 在 4 KiB 基础页下对应 2 MiB 的区域, 这个 order 可以通过内核参数调整. 为了让空闲页上报更有效, 我们使用 DAMON, Linux 里一个基于采样的内存访问监控框架. DAMON 定期采样页访问位, 找出超过可配置年龄阈值一直没被碰过的冷文件页, 通过内核的回收路径把它们逐出. 这一回收把零散的文件页还给 buddy 分配器, 后者把它们合并成更高 order 的块, 满足空闲页上报的要求.

In our evaluation in §8.4, DAMON with balloon free-page reporting reduces memory consumption by 21.2% without significant CPU overhead. In production, we enable virtiopmem with DAX for the read-only EROFS base-image and toolkit layers, while using DAMON with balloon free-page reporting to reclaim memory for larger writable disks.

在 §8.4 的评测中, DAMON 加 balloon 空闲页上报把内存消耗降低了 21.2%, CPU 开销不明显. 生产中, 只读的 EROFS 基础镜像层和工具包层启用带 DAX 的 virtio-pmem, 较大的可写磁盘则用 DAMON 加 balloon 空闲页上报来回收内存.

**QoS-aware CPU scheduling.** To eliminate SMT-level CPU interference, DSec classifies sandboxes into latency-sensitive (LS) and best-effort (BE) classes. BE sandboxes are placed under SCHED\_IDLE so that they yield the CPU whenever an LS task is runnable. Because scheduler priority alone does not prevent interference between sibling hardware threads, we also enable Linux core scheduling (Zijlstra et al., 2021) for LS sandboxes, preventing unrelated BE work from running on the sibling thread of the same physical core. This two-layer policy preserves LS per-step latency budgets while still allowing BE tasks to use idle cycles, reducing SMT-induced latency inflation from 45.2% to 17.3%, as detailed in §8.5.

**感知 QoS 的 CPU 调度.** 为消除 SMT 层面的 CPU 干扰, DSec 把沙箱分为延迟敏感 (LS) 和尽力而为 (BE) 两类. BE 沙箱放在 SCHED\_IDLE 策略下, 只要有 LS 任务可运行就让出 CPU. 调度优先级本身挡不住同一物理核两个硬件线程之间的干扰, 所以我们还为 LS 沙箱启用 Linux core scheduling (Zijlstra et al., 2021), 不让无关的 BE 工作跑在同一物理核的兄弟线程上. 这套两层策略守住了 LS 的单步延迟预算, 又让 BE 任务能用上空闲周期, 把 SMT 引起的延迟膨胀从 45.2% 降到 17.3%, 详见 §8.5.

<!-- page 16 of 31 -->

## 5.3. Scalable Image Distribution and On-Demand Loading · 可扩展的镜像分发与按需加载

The key observation is that sandboxes typically access only a small fraction of their image data, as illustrated by the samples in Tab. 3. On-demand pulling therefore addresses not just the timing problem but the volume problem: total I/O shrinks in proportion to the fraction actually used rather than merely being moved to a different phase.

关键观察是: 沙箱通常只访问镜像数据的一小部分, Tab. 3 的抽样就说明了这一点. 所以按需拉取解决的不只是时机问题, 还有总量问题: 总 I/O 按实际用到的比例缩小, 而不只是挪到另一个阶段.

Existing on-demand image distribution systems often combine a container registry with peer-to-peer delivery to prevent the registry from becoming a bottleneck (Wang et al., 2021). We instead host images on 3FS, which already supports our production training workloads at scale. This choice reuses the existing storage infrastructure and avoids deploying a separate imagedistribution layer. However, 3FS exhibits highly asymmetric I/O characteristics: it sustains high throughput for large sequential reads and writes but performs poorly on small random I/O. This asymmetry dictates our design:

现有的按需镜像分发系统常把镜像仓库与点对点 (P2P) 分发结合起来, 避免仓库成为瓶颈 (Wang et al., 2021). 我们改为把镜像放在 3FS 上, 3FS 已经在大规模支撑我们的生产训练负载. 这一选择复用了现有的存储基础设施, 不必另外部署一层镜像分发. 但 3FS 的 I/O 特性高度不对称: 大块顺序读写吞吐很高, 小的随机 I/O 表现差. 这种不对称决定了我们的设计:

1. **Writes stay local.** Sandbox writes are irregular and uncontrollable, including small and frequent writes such as log files. We place the writable layer on the node's local disk, avoiding the small-write penalty of 3FS entirely.

1. **写留在本地.** 沙箱的写入不规则也不可控, 包括日志文件这类小而频繁的写. 我们把可写层放在节点本地磁盘上, 完全避开 3FS 的小写惩罚.

2. **Reads are on-demand and bulk.** Read-only image data is fetched from 3FS only when accessed, and the I/O is performed in bulk to exploit 3FS's high throughput for large I/O requests.

2. **读按需且成批.** 只读的镜像数据只在被访问时才从 3FS 取, I/O 成批地发, 利用 3FS 对大 I/O 请求的高吞吐.

3. **Metadata is preferably kept local.** Filesystem metadata is often accessed through small reads. When the image format permits, we separate metadata from data and prefetch the metadata to the local node.

3. **元数据尽量放本地.** 文件系统元数据常常通过小读访问. 只要镜像格式允许, 我们就把元数据和数据分开, 并把元数据预取到本地节点.

For containers, EROFS helps realize these design principles. First, since EROFS is strictly read-only, all runtime writes land in the overlayfs upper directory on local storage. Second, EROFS serves file content through buffered I/O on demand, while kernel readahead coalesces adjacent blocks into larger requests. Third, EROFS provides a multi-device mode that separates filesystem metadata from file data. Nydus (Dragonfly Community, 2020) adopts a related design: its EROFS-compatible format separates filesystem metadata from data blobs and supports lazy loading, with file data fetched on demand from a registry or object store through a userspace backend (e.g., fscache/FUSE). We instead download the EROFS metadata to the worker's local disk while leaving file data on 3FS, so metadata traversal and pathname lookup do not incur remote I/O. This separates the write path (local and small-I/O friendly) from the read path (remote, on-demand, and bulk), matching the asymmetric performance profile of 3FS.

对容器, EROFS 帮助落实这几条原则. 第一, EROFS 严格只读, 所有运行时写入都落到本地存储上的 overlayfs 上层目录. 第二, EROFS 通过带缓冲的 I/O 按需提供文件内容, 内核预读会把相邻块合并成更大的请求. 第三, EROFS 有一种多设备模式, 把文件系统元数据与文件数据分开. Nydus (Dragonfly Community, 2020) 采用了相关的设计: 它的 EROFS 兼容格式把文件系统元数据与数据 blob 分开, 支持懒加载, 文件数据经用户态后端 (如 fscache/FUSE) 从镜像仓库或对象存储按需获取. 我们则把 EROFS 元数据下载到 worker 的本地磁盘, 文件数据留在 3FS, 元数据遍历和路径名查找不产生远程 I/O. 这样写路径 (本地, 对小 I/O 友好) 与读路径 (远程, 按需, 成批) 分开, 正好匹配 3FS 不对称的性能特性.

Although this design avoids full-image pulling, mounting a large number of EROFS layers can still add overhead to container creation. We therefore collapse consecutive layers within a size threshold (e.g., 3 GB) offline into a single pair of EROFS images for metadata and data, while preserving overlayfs whiteout semantics to represent file deletions correctly. This reduces the final mount count, avoids excessive file duplication, and preserves page-cache reuse across images that share common layers. We also use EROFS file-backed mount mode to eliminate the loop-device block-mapping layer and its overhead.

这个设计避免了全量拉镜像, 但挂载大量 EROFS 层仍会增加容器创建的开销. 所以我们离线把一个大小阈值 (例如 3 GB) 以内的连续若干层合并成一对 EROFS 镜像, 一个存元数据一个存数据, 同时保留 overlayfs 的 whiteout 语义, 正确表示文件删除. 这样减少了最终的挂载数, 避免过多的文件重复, 并保留共享公共层的镜像之间的页缓存复用. 我们还使用 EROFS 的 file-backed 挂载模式, 去掉 loop 设备那一层块映射及其开销.

> **回看:** §5.1 说各层独立版本化, §5.3 又把 3 GB 以内的连续层离线合并成一对镜像, 合并会不会把 §4.2 的组合维护代价带回来?
> 答: 取决于合并的范围, 文中没有说明. 若合并只发生在一个 OCI 镜像内部的连续层 (例如基础镜像自身的十几层 Docker 层), 合并结果仍是一个独立的「基础层」, 工作区和工具包照旧在创建时由 dockerd 动态插入, $O(m)$ 和 $O(k)$ 不受影响. 若合并跨越基础镜像, 工作区和工具包, 那么任何一部分升级都要重新合并, 又回到按组合计费. 从「preserves page-cache reuse across images that share common layers」看, 合并后的单元仍要在多个镜像之间共享, 更符合前一种读法. 以上只是从措辞推出的说法, 没有数据验证.

The container-style EROFS/overlayfs stack does not meet all microVM filesystem compatibility requirements. For example, Docker's overlay2 driver cannot use an overlayfs-backed data directory. An alternative would be to export the host-mounted filesystem to the guest via virtio-fs, but our Firecracker backend does not support this interface (Agache et al., 2020). The microVM storage design is therefore not identical to the container design. Read-only base-image and toolkit layers still use EROFS, while OverlayBD serves writable ext4 disks, including a separate disk mounted directly at Docker's data root for Docker-in-microVM workloads.

容器那套 EROFS/overlayfs 栈不能满足 microVM 全部的文件系统兼容性要求. 例如 Docker 的 overlay2 驱动不能使用以 overlayfs 为后备的数据目录. 另一种做法是通过 virtio-fs 把宿主机挂载的文件系统导出给 guest, 但我们的 Firecracker 后端不支持这个接口 (Agache et al., 2020). 所以 microVM 的存储设计与容器不完全相同. 只读的基础镜像层和工具包层仍用 EROFS, OverlayBD 则提供可写的 ext4 磁盘, 其中包括为 microVM 内跑 Docker 的负载单独准备的一块磁盘, 直接挂在 Docker 的数据根目录上.

<!-- page 17 of 31 -->

We expose the OverlayBD-backed disks through ublk, a userspace block-device framework. This block-level path provides on-demand reads and local writes, and supports incremental disk snapshots without repacking modified files into EROFS. Unlike the multi-device EROFS path, ext4 metadata remains embedded in the block image, so metadata reads can trigger remote I/O. Our ublk implementation mitigates these small reads by fetching OverlayBD data in 256 KiB chunks and storing it in a second-level local filesystem cache. Even after a chunk is evicted from the page cache, it remains available in the local cache and does not need to be fetched from 3FS again. Both paths keep writes local and minimize small I/O requests to 3FS.

我们通过用户态块设备框架 ublk 暴露以 OverlayBD 为后备的磁盘. 这条块级路径提供按需读和本地写, 支持增量磁盘快照, 不用把改过的文件重新打包进 EROFS. 与多设备的 EROFS 路径不同, ext4 的元数据仍嵌在块镜像里, 读元数据可能触发远程 I/O. 我们的 ublk 实现以 256 KiB 为块从 OverlayBD 取数据, 并存进本地文件系统上的二级缓存, 以此缓解这些小读. 一个块即使被逐出页缓存, 也还在本地缓存里, 不必再从 3FS 取一次. 两条路径都让写留在本地, 并尽量减少发往 3FS 的小 I/O 请求.

## 6. Co-design with the RL framework · 与 RL 框架的协同设计

DSec serves all sandbox workloads used in the RL training and evaluation from DeepSeek V3.2 (DeepSeek-AI, 2025) to V4.1 (DeepSeek-AI, 2026). Beyond efficient sandbox execution, supporting these workloads requires coordination with the RL framework on execution lifecycle and security policy. This section first describes scalable construction of agent environments (§6.1). It then explains how agent loop containers decouple rollout execution from GPU training jobs (§6.2) and how pause/resume coordinates resource reclamation with training preemption (§6.3). Finally, it examines agent behaviors that compromise task integrity or disrupt execution environments (§6.4), followed by the access controls used to mitigate these risks (§6.5).

从 DeepSeek V3.2 (DeepSeek-AI, 2025) 到 V4.1 (DeepSeek-AI, 2026), RL 训练和评测用到的所有沙箱负载都由 DSec 承担. 支撑这些负载, 除了高效执行沙箱, 还要在执行生命周期和安全策略上与 RL 框架协同. 本节先讲 Agent 环境的可扩展构建 (§6.1), 再讲 agent loop 容器如何把 rollout 执行与 GPU 训练作业解耦 (§6.2), 以及暂停/恢复如何让资源回收配合训练抢占 (§6.3). 最后考察破坏任务完整性或扰乱执行环境的 Agent 行为 (§6.4), 以及用来缓解这些风险的访问控制 (§6.5).

## 6.1. Build environments of Agents, by Agents, for Agents · 由 Agent 构建, 供 Agent 使用的 Agent 环境

Manually constructing the large number of environments required by agentic RL is impractical. Instead, we let agents build environments interactively on the same infrastructure used for training and evaluation. DSec supports this workflow by pack\_diff: at any point, an agent can checkpoint a sandbox by taking an incremental disk snapshot, which can later be restored as a new sandbox. This checkpoint-and-restore interface turns an interactive session directly into a reusable environment, allowing environments to be built, validated, and consumed on the same infrastructure without a separate image-building pipeline.

Agent RL 需要的环境数量庞大, 手工构建不现实. 我们改为让 Agent 在训练和评测所用的同一套基础设施上交互式地构建环境. DSec 用 pack\_diff 支持这一流程: 任何时刻, Agent 都可以给沙箱打一个增量磁盘快照作为检查点, 之后可以把它恢复成一个新沙箱. 这个检查点加恢复的接口把一次交互会话直接变成可复用的环境, 环境的构建, 验证和使用都在同一套基础设施上完成, 不需要单独的镜像构建流水线.

We maintain an internal set of rules that packed environments must adhere to in order to limit their runtime performance impact on the shared infrastructure. These constraints are provided as instructions to the agents that build environments. To track all environments and keep pace with the evolving infrastructure, our researchers also built an internal platform that quality-checks agent-built environments and exports them in standardized formats for consumption by RL and evaluation tasks.

我们维护一套内部规则, 打包出来的环境必须遵守, 以限制它们运行时对共享基础设施的性能影响. 这些约束作为指令交给构建环境的 Agent. 为了跟踪所有环境并跟上不断演进的基础设施, 研究员还搭了一个内部平台, 对 Agent 构建的环境做质量检查, 并以标准格式导出, 供 RL 和评测任务使用.

Because environments are built and consumed on the same sandbox infrastructure, pre-venting information leakage between the two stages is important. Builders and runtime agents use separate accounts, and build-time residual data is removed from the writable layer before packing so that reference answers are not carried into the resulting image.

环境的构建和使用在同一套沙箱基础设施上进行, 防止两个阶段之间泄露信息就很重要. 构建者与运行时 Agent 使用不同的账号, 打包前会从可写层中清除构建时的残留数据, 避免参考答案被带进生成的镜像.

## 6.2. Separate agent loop from the RL framework · 把 agent loop 从 RL 框架里分离出来

Training jobs in our GPU cluster are routinely preempted to improve utilization. For longrunning agentic rollouts, coupling rollout execution to the training job makes preemption particularly costly: the agent loop may be terminated after substantial progress, even though the corresponding sandbox state remains intact. To resume such rollouts, the system must preserve both the agent's execution state and the sandbox state.

我们 GPU 集群里的训练作业为了提高利用率会被例行抢占. 对长时间运行的 Agent rollout, 把 rollout 执行绑在训练作业上会让抢占格外昂贵: agent loop 可能在取得大量进展之后被终止, 而对应的沙箱状态还完好无损. 要恢复这样的 rollout, 系统必须同时保住 Agent 的执行状态和沙箱状态.

In earlier versions of the training pipeline, the agent loop ran inside the preemptible GPU

<!-- page 18 of 31 -->

training pod together with the model-serving and RL framework. When the GPU job was preempted, the agent loop was lost while the sandbox persisted. Recovery therefore relied on a command log to reconcile the rollout state restored by the training framework with the sandbox's execution state. During replay, completed operations reused recorded results rather than being re-executed, avoiding duplicate side effects from non-idempotent commands.

在较早版本的训练流水线里, agent loop 与模型服务和 RL 框架一起跑在可抢占的 GPU 训练 pod 里. GPU 作业被抢占时, agent loop 丢失, 沙箱却还在. 恢复因此依赖一份命令日志, 把训练框架恢复出的 rollout 状态与沙箱的执行状态对上. 回放时, 已完成的操作复用记录下来的结果而不重新执行, 避免非幂等命令产生重复的副作用.

Starting with DeepSeek-V4.1 (DeepSeek-AI, 2026), we instead move rollout execution onto DSec and separate it into two components: an agent sandbox, which hosts the scaffold (e.g., DeepSeek Harness) and its tools, and a worker container, which manages the sandbox and provides a scaffold-agnostic control layer for the rollout. Both components run outside the preemptible GPU pool. This design decouples rollout lifetime from trainer lifetime. The worker container and agent sandbox jointly retain the complete rollout state and act as its single source of truth, allowing a preempted GPU job to reconnect and continue without reconstructing execution through command-log replay. This removes rollout-state recovery logic from the RL framework, reduces cross-component coordination, and simplifies failure handling.

从 DeepSeek-V4.1 (DeepSeek-AI, 2026) 开始, 我们改为把 rollout 执行搬到 DSec 上, 并拆成两个组件: agent 沙箱, 承载 scaffold (例如 DeepSeek Harness) 及其工具; worker 容器, 管理沙箱, 并为 rollout 提供与 scaffold 无关的控制层. 两个组件都跑在可抢占的 GPU 池之外. 这一设计把 rollout 的寿命与 trainer 的寿命解耦. worker 容器和 agent 沙箱共同保存完整的 rollout 状态, 作为它唯一的事实源; 被抢占的 GPU 作业重新连上就能继续, 不必通过回放命令日志来重建执行过程. 这样 RL 框架里不再需要 rollout 状态的恢复逻辑, 跨组件协调减少, 故障处理也更简单.

> **对一下:** V4 技术报告 §5.2.5 写的是「全局有序的 trajectory log + 回放缓存结果」做抢占恢复, 这里说 V4.1 起不再靠命令日志回放, 两种方案的差别落在哪?
> 答: 差别在 agent loop 跑在哪里. V4 时 agent loop 在 GPU pod 里, 抢占后它的内存状态 (对话历史, 下一步要发的命令) 随 pod 消失, 只能由训练框架从自己的检查点恢复, 再用命令日志把「框架以为执行到哪」和「沙箱实际执行到哪」对齐, 已执行的非幂等命令必须返回缓存结果. V4.1 把 agent loop 放进 GPU 池外的 worker 容器, 它本身不随抢占消失, 抢占只是让模型推理暂时不可用, 状态从未丢失, 也就无需对齐. 代价是 worker 容器和 agent 沙箱在训练暂停期间一直占着 CPU 侧的内存, 这正是 §6.3 要用暂停/回收解决的问题. 文中没有给出两种方案恢复耗时或失败率的对比.

## 6.3. Suspending Sandboxes for Preemptive RL Training · 为可抢占 RL 训练挂起沙箱

Because GPU-job preemption is inevitable (§6.2), sandbox state must remain on DSec until the rollout completes. However, this can leave many idle sandboxes consuming memory while training is suspended. The RL framework therefore proactively sends pause requests to all sandboxes associated with a preempted job, allowing DSec to reclaim memory while preserving their execution state. For both containers and microVMs, any subsequent request to a paused sandbox transparently resumes it before executing the requested operation.

GPU 作业抢占不可避免 (§6.2), 沙箱状态必须留在 DSec 上直到 rollout 完成. 但这可能让大量闲置沙箱在训练暂停期间一直占着内存. 所以 RL 框架会主动向与被抢占作业关联的所有沙箱发暂停请求, 让 DSec 在保住执行状态的同时回收内存. 对容器和 microVM, 之后发往已暂停沙箱的任何请求都会先透明地把它恢复, 再执行所请求的操作.

**Containers.** The edge first issues docker pause to freeze the container's process tree. It then enables swapping through the container's memory.swap.max setting and triggers proactive memory reclamation through memory.reclaim. This reclaims memory from both anonymous and file-backed pages while preserving the container's execution state. To resume a container, the edge applies MADV\_WILLNEED to its processes' memory mappings to initiate asynchronous prefetching, then issues docker unpause to resume execution.

**容器.** edge 先执行 docker pause 冻结容器的进程树, 再通过容器的 memory.swap.max 设置打开换出, 并通过 memory.reclaim 触发主动内存回收. 这样匿名页和文件页的内存都能回收, 容器的执行状态仍然保留. 恢复容器时, edge 对其进程的内存映射施加 MADV\_WILLNEED 发起异步预取, 然后执行 docker unpause 恢复执行.

**MicroVMs.** To pause a microVM, DSec saves its memory and execution state in a snapshot, then terminates the running Firecracker process to release the microVM's runtime memory. On resume, DSec starts a new process and restores the snapshot to continue guest execution.

**MicroVM.** 暂停 microVM 时, DSec 把它的内存和执行状态存成快照, 然后终止正在运行的 Firecracker 进程, 释放 microVM 的运行时内存. 恢复时, DSec 启动一个新进程并载入快照, 继续 guest 的执行.

## 6.4. Agent Misbehavior and System Failures · Agent 不当行为与系统故障

Our production experience reveals two broad risks in agent execution. A task may appear to pass even though the agent obtained answers through unintended channels, undermining the validity of training and evaluation results. Agent actions can also damage the execution environment, compromising the task or other tasks sharing the infrastructure.

生产经验揭示了 Agent 执行中的两大类风险. 一是任务看起来通过了, 其实 Agent 是从非预期渠道拿到的答案, 这会破坏训练和评测结果的有效性. 二是 Agent 的操作可能损坏执行环境, 危及当前任务或共享基础设施的其他任务.

**Obtaining answers through unintended channels.** Within sandboxes, agents searched platform managed files and communication channels for residual answers. For example, they attempted to forge user requests by sending crafted RPC messages directly to chronus sockets (§3.3) and inspected chronus logs for leaked answers. Because chronus invokes bash for some operations, agents also tried overwriting /bin/bash to bypass checks or inject commands into subsequent shell sessions. After we introduced file read/write and socket access controls (§6.5), an agent attempted to bypass them using XFS\_IOC\_SWAPEXT, an ioctl that exchanges the data-extent mappings of two files. The goal was to make protected file contents accessible

<!-- page 19 of 31 -->

through another file descriptor. The attempt corrupted XFS metadata and forced a filesystem shutdown, illustrating how answer-seeking behavior can even disrupt infrastructure.

**从非预期渠道获取答案.** 在沙箱内部, Agent 会在平台管理的文件和通信通道里搜寻残留的答案. 例如, 它们试图直接向 chronus 的 socket (§3.3) 发送精心构造的 RPC 消息来伪造用户请求, 也会翻 chronus 的日志找泄露的答案. chronus 执行某些操作时会调用 bash, Agent 还试过覆盖 /bin/bash, 绕过检查或向后续 shell 会话注入命令. 我们加上文件读写和 socket 访问控制 (§6.5) 之后, 有个 Agent 试图用 XFS\_IOC\_SWAPEXT 绕过它们, 这是一个交换两个文件数据区段 (extent) 映射的 ioctl, 目的是让受保护文件的内容可以经另一个文件描述符访问. 这次尝试损坏了 XFS 元数据, 迫使文件系统关闭, 说明找答案的行为甚至会扰乱基础设施.

Outside the sandbox, agents searched for reference implementations beyond the task's intended information sources. For example, they scanned ports and services to discover reachable mirrors. They also used Go module proxies to retrieve GitHub-hosted code and installed newer package releases, looking for existing implementations of the required functionality. Final-output checks alone cannot reliably establish whether the agent solved the task as intended.

在沙箱外部, Agent 会到任务预定信息来源之外去找参考实现. 例如扫描端口和服务, 寻找能连上的镜像站. 它们还用 Go module 代理去拉 GitHub 上托管的代码, 安装更新版本的软件包, 寻找所需功能的现成实现. 光检查最终输出, 无法可靠地判断 Agent 是否按预期方式解决了任务.

**Tampering with execution environments.** Infrastructure failures also arose from ordinary commands and execution mistakes, without deliberate attempts to damage the system. In one case, an agent recursively ran grep from the root directory, traversed /proc, and read /proc/kpagecgroup, triggering a kernel bug that crashed the kernel. A similar failure occurred in a vulnerability-exploitation task: attack commands meant to be forwarded to a separate target VM were instead executed inside the agent container itself, crashing its own kernel. Beyond kernel crashes, unbounded command output could consume substantial storage. For example, an agent invoked yes, whose continuous output was recorded by chronus so that users could retrieve command output asynchronously. The captured stdout accumulated tens of gigabytes of data on storage.

**破坏执行环境.** 基础设施故障也会来自普通命令和执行失误, 并没有蓄意破坏系统. 有一次, Agent 从根目录递归执行 grep, 遍历到 /proc, 读了 /proc/kpagecgroup, 触发一个内核 bug, 内核崩溃. 一个漏洞利用任务里也出过类似故障: 本应转发给另一台目标虚拟机的攻击命令, 却在 agent 容器自己里面执行了, 把自己的内核搞崩. 除了内核崩溃, 没有上限的命令输出还会吃掉大量存储. 例如有个 Agent 调用了 yes, 它源源不断的输出被 chronus 记录下来 (以便用户异步取回命令输出), 捕获的 stdout 在存储上累积了几十 GB.

## 6.5. Access-Control Mitigations · 访问控制层面的缓解

No single mechanism can prevent all agent misbehavior and system failures. We therefore strengthen observability to identify emerging problems and continuously harden DSec as models evolve. Here we describe access controls that limit agents' ability to obtain answers through unintended channels and thereby mitigate reward hacking (Amodei et al., 2016; Skalse et al., 2022). These controls address only part of the problem and do not provide a general defense against destructive behavior such as triggering kernel bugs.

没有哪一种机制能杜绝所有的 Agent 不当行为和系统故障. 所以我们加强可观测性来发现新出现的问题, 并随着模型演进持续加固 DSec. 这里描述的访问控制用来限制 Agent 从非预期渠道获取答案的能力, 从而缓解 reward hacking (Amodei et al., 2016; Skalse et al., 2022). 这些控制只解决了一部分问题, 对触发内核 bug 这类破坏性行为没有通用的防御.

**File and socket access control (AppArmor).** We use AppArmor profiles to control file read/write permissions and socket access, including access to chronus's logs and Unix-domain sockets. These policies apply to agent-controlled processes even when they run as root inside the sandbox. They limit attempts to extract residual answers from logs or forge user requests through internal communication channels.

**文件与 socket 访问控制 (AppArmor).** 我们用 AppArmor 配置文件控制文件读写权限和 socket 访问, 包括对 chronus 日志和 Unix domain socket 的访问. 即使 Agent 控制的进程在沙箱里以 root 运行, 这些策略也照样生效. 它们限制了从日志里提取残留答案, 或经内部通信通道伪造用户请求的企图.

**Fine-grained network control (eBPF).** The training framework specifies task-specific network permissions organized by domain or mirror service. For example, List. 1 permits access to PyPI while denying access to NPM. DSec enforces the corresponding allowlists through per-sandbox eBPF programs that filter traffic by IP address, port, and protocol, rejecting traffic outside the allowlist. The policies can be updated dynamically as tasks move between stages with different connectivity requirements.

**细粒度网络控制 (eBPF).** 训练框架按域名或镜像服务组织, 指定任务专属的网络权限. 例如 Listing 1 允许访问 PyPI, 禁止访问 NPM. DSec 用每个沙箱一份的 eBPF 程序执行相应的白名单, 按 IP 地址, 端口和协议过滤流量, 拒绝白名单之外的流量. 任务在连通性要求不同的阶段之间切换时, 策略可以动态更新.

## 7. Implementation · 实现

We highlight a few additional implementation details that proved important in practice.

下面挑出几项在实践中证明很重要的实现细节.

**Placement engine strategy** Extreme spikes of thousands of sandboxes in sub-seconds and heavy oversubscription require spreading incremental load evenly with elastic rather than pinned resource reservations. We tackle the problem with the following aspects. 1) We adopt a power-of-𝑘-choices algorithm (Mitzenmacher, 2001): the scheduler samples 𝑘 nodes at random and selects the least loaded, avoiding herding and reducing interference among bursty RL environments during setup and tool calls. 2) Each placement engine instance maintains a local view by

<!-- page 20 of 31 -->

overlaying its recent placements not yet reflected in periodic watcher snapshots, accounting for in-flight load without cross-instance coordination. 3) Each edge retains final admission authority: critical resource pressure triggers rejection and selection of an alternative node, keeping the fast path lightweight while preventing stale estimates from overriding local resource limits. User isolation further bounds the blast radius of resource spikes or kernel-level faults at the cost of node-level density.

**放置引擎策略** 亚秒内涌来数千个沙箱的极端尖峰, 加上重度超订, 要求用弹性的而非固定的资源预留, 把新增负载均匀摊开. 我们从以下几方面应对. 1) 采用 power-of-$k$-choices 算法 (Mitzenmacher, 2001): 调度器随机抽 $k$ 个节点, 选负载最低的, 避免一窝蜂扎堆, 减少突发的 RL 环境在准备和工具调用阶段的相互干扰. 2) 每个放置引擎实例维护一份本地视图, 把自己最近做出, 还没反映到 watcher 周期快照里的放置叠加上去, 不需要跨实例协调就能把在途负载算进去. 3) 每个 edge 保留最终的准入权: 资源压力到临界就拒绝, 改选别的节点, 既让快路径保持轻量, 又不让过时的估计越过本地资源上限. 用户隔离进一步限制了资源尖峰或内核级故障的波及范围, 代价是节点级的密度.

**Reliable services.** Both auxiliary and cluster-level services must remain reliable, as outages can cause agents to fail tasks, corrupting reward signals or evaluation results. For auxiliary services, such as API gateways and package mirrors, and control-plane ingress, we apply BGP-based load balancing: instances of each service announce a shared virtual IP, and upstream switches perform ECMP routing across them. When an instance's BGP session drops, switches withdraw its route and redirect traffic to remaining instances within seconds. Cluster-level services, including the placement engine, watcher, and IAM, run multiple independent instances for availability, with regular cluster resets verifying that our Infrastructure-as-Code configuration can reconstruct all cluster-level services from scratch and recover from failures without relying on accumulated manual state.

**可靠的服务.** 辅助服务和集群级服务都必须可靠, 因为一旦宕机, Agent 就会任务失败, 污染奖励信号或评测结果. 对 API 网关, 软件包镜像站这类辅助服务以及控制面入口, 我们采用基于 BGP 的负载均衡: 每个服务的各实例宣告同一个虚拟 IP, 上游交换机在它们之间做 ECMP 路由. 某个实例的 BGP 会话断开时, 交换机撤回它的路由, 几秒内把流量导到其余实例. 放置引擎, watcher 和 IAM 这些集群级服务运行多个独立实例保证可用性, 并定期重置集群, 验证我们的基础设施即代码 (Infrastructure-as-Code) 配置能从零重建所有集群级服务, 从故障中恢复时不依赖手工累积下来的状态.

**Dynamic lower-layer insertion in dockerd.** We modify the open-source Docker daemon (based on the Moby project (Moby Project, 2026)) to dynamically insert EROFS-backed lower layers at container creation time. Specifically, we pass the path of a pre-mounted EROFS layer and insert it into the overlayfs stack before mounting, placing it as the topmost lower layer so it can override files in layers below. This change is minimal, requiring only 30 lines of Go code.

**在 dockerd 中动态插入下层.** 我们修改了开源的 Docker daemon (基于 Moby 项目 (Moby Project, 2026)), 在容器创建时动态插入以 EROFS 为后备的下层. 具体做法是传入一个预先挂载好的 EROFS 层的路径, 在挂载前把它插进 overlayfs 栈, 放在最上面一个下层的位置, 让它能覆盖下面各层的文件. 这个改动很小, 只有 30 行 Go 代码.

**Rust-based OverlayBD and ublk library.** We use the Rust port of OverlayBD, to which we contributed, together with our Rust userspace library for ublk to form the on-demand blockstorage path for Firecracker microVMs described in §5.3. The storage layer supports 3FS, object storage services such as OSS, and container registries as remote backends. It can also use the local filesystem as a second-level cache, allowing data evicted from the page cache to be served locally without another remote fetch. These storage components have been open sourced at [https://github.com/kvcache-ai/AgentENV/tree/main/storage/overlaybd](https://github.com/kvcache-ai/AgentENV/tree/main/storage/overlaybd).

**基于 Rust 的 OverlayBD 与 ublk 库.** 我们使用 OverlayBD 的 Rust 移植版 (我们为它贡献过代码), 配合我们自己的 Rust 版 ublk 用户态库, 组成 §5.3 描述的 Firecracker microVM 按需块存储路径. 存储层支持 3FS, OSS 这类对象存储服务, 以及容器镜像仓库作为远程后端, 也可以把本地文件系统用作二级缓存, 被逐出页缓存的数据可以从本地提供, 不必再远程取一次. 这些存储组件已开源在 [https://github.com/kvcache-ai/AgentENV/tree/main/storage/overlaybd](https://github.com/kvcache-ai/AgentENV/tree/main/storage/overlaybd).

**Memory and CPU QoS configuration.** All mechanisms leverage existing Linux kernel features. Virtio-pmem with DAX is enabled via Firecracker device configuration and guest kernel mount options. DAMON-based reclamation is activated through guest kernel parameters and sysfs tuning. For CPU QoS, we set best-effort tasks to SCHED\_IDLE and enable core scheduling via prctl(PR\_SCHED\_CORE) to group tasks by QoS class. No kernel modifications are required; the implementation consists entirely of configuration and integration with our sandbox orchestrator.

**内存与 CPU QoS 的配置.** 所有机制都利用现有的 Linux 内核特性. 带 DAX 的 virtio-pmem 通过 Firecracker 的设备配置和 guest 内核的挂载选项启用. 基于 DAMON 的回收通过 guest 内核参数和 sysfs 调优开启. CPU QoS 方面, 我们把尽力而为任务设为 SCHED\_IDLE, 并通过 prctl(PR\_SCHED\_CORE) 启用 core scheduling, 按 QoS 类别给任务分组. 不需要改内核, 实现完全由配置以及与沙箱编排器的集成构成.

**GPU FnCall for operator benchmarking.** We equip FnCall with GPUs for stateless operator benchmarking. Because GPU capacity is limited, GPU FnCall uses three mechanisms to improve concurrency while preserving performance isolation. First, NVIDIA Multi-Instance GPU (MIG) partitions each GPU into isolated instances, allowing benchmarks to run concurrently with exclusive access to assigned instances. Second, CPU FnCall handles compilation and passes the resulting artifacts to GPU FnCall, avoiding unnecessary GPU occupation. Finally, a warm pool of Python processes initializes the runtime and imports libraries in advance, allowing requests to begin operator execution directly. Together, these mechanisms reduce non-GPU overhead on the execution path, thereby improving both GPU utilization and benchmarking throughput. For non-performance-sensitive tasks, we also provide a shared GPU mode that increases concurrency by allowing multiple workloads to share a GPU instance.

**用于算子基准测试的 GPU FnCall.** 我们给 FnCall 配上 GPU, 用于无状态的算子基准测试. GPU 容量有限, GPU FnCall 用三项机制在保持性能隔离的同时提高并发. 第一, NVIDIA Multi-Instance GPU (MIG) 把每张 GPU 切成相互隔离的实例, 基准测试可以并发运行, 各自独占分到的实例. 第二, 编译交给 CPU FnCall, 产物再传给 GPU FnCall, 避免不必要地占用 GPU. 第三, 一个预热的 Python 进程池事先初始化运行时并导入库, 请求到来可以直接开始执行算子. 这几项合起来减少了执行路径上的非 GPU 开销, 同时提高了 GPU 利用率和基准测试吞吐. 对性能不敏感的任务, 我们还提供共享 GPU 模式, 允许多个负载共用一个 GPU 实例以提高并发.

**3FS deployment.** Each 3FS (An et al., 2024) storage server is equipped with 20 × 15 TB SSDs

<!-- page 21 of 31 -->

and 2 × 400Gbps RDMA NICs. CPU nodes access 3FS through its FUSE-based client, with EROFS metadata stored locally and file data served on demand from 3FS. Tens of storage servers support on-demand image loading for a cluster with hundreds of thousands of CPU cores.

**3FS 部署.** 每台 3FS (An et al., 2024) 存储服务器配 20 块 15 TB SSD 和 2 块 400Gbps RDMA 网卡. CPU 节点通过 3FS 基于 FUSE 的客户端访问它, EROFS 元数据存在本地, 文件数据由 3FS 按需提供. 几十台存储服务器就支撑了一个数十万 CPU 核集群的按需镜像加载.

## 8. Evaluation · 评测

Our evaluation measures the effectiveness and overhead of four core mechanisms in $\S 5 :$ ondemand image loading, composable environment layers, memory optimization, and QoS-aware CPU scheduling. The experiments focus on these infrastructure performance mechanisms; the framework integration in §6 is outside the evaluation scope.

评测衡量 §5 中四项核心机制的效果和开销: 按需加载镜像, 可组合环境层, 内存优化, 感知 QoS 的 CPU 调度. 实验聚焦在这些基础设施性能机制上, §6 的框架集成不在评测范围内.

## 8.1. Experimental Setup · 实验设置

We conduct the experiments in this chapter on a dedicated 10-node CPU test cluster, separate from our production deployment.

本章实验在一个专用的 10 节点 CPU 测试集群上进行, 与生产部署分开.

**Hardware.** To preclude nested virtualization, our microVMs execute directly on bare-metal hardware. Each microVM node is provisioned with AMD EPYC 9655 processors across 2 sockets × 96 cores × 2 SMT threads, 1.5 TB of DRAM, and 3.4 TB of local storage. In contrast, the container-based experiments operate within a QEMU virtual machine whose configuration consists of an AMD EPYC 9655 processor, 1 socket × 96 cores × 2 SMT threads, for 192 hardware threads, 512 GB of memory, and 5.8 TB of local storage.

**硬件.** 为排除嵌套虚拟化, microVM 直接跑在裸机上. 每个 microVM 节点配 AMD EPYC 9655 处理器, 2 路 × 96 核 × 2 个 SMT 线程, 1.5 TB DRAM, 3.4 TB 本地存储. 容器实验则跑在一台 QEMU 虚拟机里, 配置为 1 颗 AMD EPYC 9655, 1 路 × 96 核 × 2 个 SMT 线程, 共 192 个硬件线程, 512 GB 内存, 5.8 TB 本地存储.

**Kernel versions.** All hosts run Linux 7.0, and all microVM guests run Linux 6.1.

**内核版本.** 所有宿主机运行 Linux 7.0, 所有 microVM guest 运行 Linux 6.1.

**Workloads.** Our workloads are drawn from real RL training and evaluation scenarios. The task suites include internal software-engineering benchmarks, SWE-bench (Jimenez et al., 2024), Terminal-Bench (Merrill et al., 2026), security exploit tasks, and similar domains.

**负载.** 负载取自真实的 RL 训练和评测场景, 任务集包括内部软件工程基准, SWE-bench (Jimenez et al., 2024), Terminal-Bench (Merrill et al., 2026), 安全漏洞利用任务及类似领域.

## 8.2. On-Demand Image Loading · 按需加载镜像

We evaluate on-demand EROFS image pulling against eager full-image pulling from a remote registry (Docker Pull (cold)) and a fully-local baseline where all image layers are pre-cached on the node (Docker Pull (cached)). The experiment issues a burst of 8,192 containers distributed across the 10-node cluster under a real RL evaluation workload that requires diverse, multi-gigabyte images at startup. We measure the number of concurrently running containers over time, instantaneous disk-write IOPS, and cumulative disk-write volume. CPU and memory utilization show negligible differences across configurations and are omitted.

我们把按需拉取 EROFS 镜像, 与两种基线对比: 从远程镜像仓库预先拉全量镜像 (Docker Pull (cold)), 以及所有镜像层都已预先缓存在节点上的全本地基线 (Docker Pull (cached)). 实验在一个真实 RL 评测负载下, 向 10 节点集群突发投放 8,192 个容器, 这个负载启动时需要各不相同的, 几个 GB 大小的镜像. 测量指标是并发运行容器数随时间的变化, 瞬时磁盘写 IOPS 和累计磁盘写入量. 各配置的 CPU 和内存利用率差别可以忽略, 不再列出.

As shown in Fig. 10, on-demand EROFS pulling reaches peak concurrency nearly as quickly as the fully-local baseline because image layers are mounted directly and data is fetched from 3FS as sandboxes access their working sets. Eager Docker pulling must download and extract every layer before a container can start, delaying container creation during the first 20 minutes. On-demand pulling finishes all tasks in ∼35 minutes, matching the fully-local baseline, while eager pulling requires over 60 minutes, a 1.71× slowdown.

如 Fig. 10 所示, 按需拉取 EROFS 达到峰值并发的速度几乎和全本地基线一样快, 因为镜像层直接挂载, 数据在沙箱访问其工作集时才从 3FS 取. 预先拉取 Docker 镜像必须先下载并解开每一层, 容器才能启动, 头 20 分钟的容器创建因此被推迟. 按需拉取约 35 分钟完成全部任务, 与全本地基线持平; 预先拉取则要 60 多分钟, 慢了 1.71 倍.

Eager pulling also reaches nearly twice the peak disk-write IOPS of the on-demand path and accumulates over 1,600 GB of disk writes per node. On-demand pulling produces only a brief initial burst and plateaus at ∼700 GB, approximately 57% less than eager pulling and close to the ∼600 GB fully-local baseline. These results validate the design of §5.3: fetching image data on demand for each sandbox's working set avoids full-image download and extraction while approaching fully-local performance.

预先拉取的峰值磁盘写 IOPS 也接近按需路径的两倍, 每节点累计写盘超过 1,600 GB. 按需拉取只在开头有一小段突发, 之后稳定在约 700 GB, 比预先拉取少约 57%, 接近全本地基线的约 600 GB. 这些结果验证了 §5.3 的设计: 针对每个沙箱的工作集按需获取镜像数据, 避免了全量下载和解包, 性能接近全本地.

> **看表:** Fig. 10 的累计写盘量里, 全本地基线也写了约 600 GB, 这 600 GB 是什么, 57% 该怎么读?
> 答: 全本地基线不拉镜像, 它的约 600 GB 写入只能来自容器运行本身 (可写层里的依赖安装, 构建产物, 日志等), 是三种配置共有的底数. 按需路径约 700 GB, 比底数多约 100 GB, 这部分可算作按需加载带来的额外写入 (例如本地落盘的 EROFS 元数据和缓存); 预先拉取超过 1,600 GB, 比底数多约 1,000 GB, 是全量镜像落地的代价. 57% 是相对预先拉取的总量算的, $1-700/1600\approx 56\%$, 文中写「over 1,600」所以取 57% 合理. 若只比镜像分发引起的增量, 按需路径约 100 GB 对预先拉取约 1,000 GB, 约少九成. 底数归因是从三条曲线的差推出来的, 文中没有拆分写入来源.

<!-- page 22 of 31 -->

![Image block](images/p22-a-running-containers.jpg)

(a) Running containers

![Image block](images/p22-figure-10-on-demand-erofs-pulling-vs-eager-docker.jpg)

(b) Disk writes

Figure 10 | On-demand EROFS pulling vs. eager Docker pulling (cold) and fully-local Docker (cached) under an 8,192-container burst across the 10-node evaluation cluster. Left: runningcontainer count per node over time. Right: instantaneous disk-write IOPS (solid, left axis) and cumulative disk writes (dashed, right axis).

## 8.3. Composable Image Layers: EROFS vs. Tar · 可组合镜像层: EROFS 对比 Tar

For code repositories and development environments, we compare two approaches for provisioning the same evaluation workspace and toolkits, including task repositories, scaffold binaries, and command-line tools. The conventional approach packages these files as a compressed tar.gz archive, which is distributed and extracted into each sandbox, whereas the EROFS approach packages the same files as a compressed, read-only filesystem image that can be mounted directly as a composable layer. We replace LLM generation with a prerecorded, deterministic sequence of tool calls so that runs differ only in how their workspaces and toolkits are provisioned.

针对代码仓库和开发环境, 我们比较两种提供同一套评测工作区和工具包 (包括任务仓库, scaffold 二进制和命令行工具) 的方法. 传统方法把这些文件打成 tar.gz 压缩包, 分发后解到每个沙箱里; EROFS 方法把同样的文件打成一个压缩的只读文件系统镜像, 可以直接作为可组合层挂载. 我们用一段预先录制的, 确定性的工具调用序列替代 LLM 生成, 让各次运行只在工作区和工具包的提供方式上有差别.

![Image block](images/p22-figure-11-setup-phase-cpu-utilization-and-disk-write.jpg)

Figure 11 | Setup-phase CPU utilization and disk-write throughput when provisioning the evaluation workspace with per-sandbox tar extraction versus EROFS layer mounting.

Because tar.gz is a sequential stream format, every sandbox must decompress the archive and write all workspace and toolkit files into its local writable layer before tool calls can begin. This extends end-to-end task completion time to 79 minutes. EROFS mounts the shared layers directly without extraction, allowing sandboxes to enter the tool-call phase earlier and reducing completion time to 45 minutes, a 1.76× speedup. As shown in Fig. 11, tar-based provisioning generates roughly 5.5× the total disk-write traffic and 3.4× the peak disk-write throughput of the EROFS path. Peak CPU utilization is higher with EROFS because more sandboxes enter the

<!-- page 23 of 31 -->

tool-call phase earlier and execute operations concurrently. This does not indicate higher setup overhead, since EROFS avoids the CPU work of repeatedly decompressing and unpacking the archives. These results validate the effectiveness of the composable-layer design in §5.1.

tar.gz 是顺序流格式, 每个沙箱都得先解压归档, 把全部工作区和工具包文件写进自己本地的可写层, 才能开始工具调用. 这把端到端的任务完成时间拉长到 79 分钟. EROFS 直接挂载共享层, 不用解包, 沙箱更早进入工具调用阶段, 完成时间降到 45 分钟, 加速 1.76 倍. 如 Fig. 11 所示, 基于 tar 的方式产生的磁盘写入总流量约为 EROFS 路径的 5.5 倍, 峰值磁盘写吞吐约为 3.4 倍. EROFS 的峰值 CPU 利用率更高, 因为更多沙箱更早进入工具调用阶段, 并发执行操作. 这并不代表准备开销更高, 因为 EROFS 省掉了反复解压和解包归档的 CPU 工作. 这些结果验证了 §5.1 可组合层设计的效果.

## 8.4. Memory under Overcommit · 超卖下的内存

![Image block](images/p23-a-memory.jpg)

(a) Memory

![Image block](images/p23-figure-12-host-memory-usage-left-and-cpu-utilization.jpg)

(b) CPU

Figure 12 | Host memory usage (left) and CPU utilization (right) across the four Firecracker configurations under a real agentic RL workload. The CPU panel uses an expanded time scale for the first 10 minutes and a compressed scale for the 10–50 minute interval.

We run a real agentic-RL workload on our test cluster and compare four Firecracker configurations: the unoptimized baseline, virtio-pmem with DAX alone, DAMON-based free-page reporting (FPR) via the virtio-balloon device alone, and both mechanisms combined. Virtiopmem with DAX collapses the redundant per-guest page caches into a single shared host mapping, reducing peak host memory usage by 40.2% compared with baseline. DAMON + balloon FPR alone leaves peak usage largely unchanged but reduces time-integrated host memory consumption by 21.2%. Combining both mechanisms produces the lowest overall memory consumption. As Fig. 12 shows, virtio-pmem raises transient peak CPU utilization from 26.5% to 41.4%. This increase may partly reflect differences in the cold-access paths. Virtio-pmem with DAX can require synchronous fault handling to establish mappings and make backing data available, while buffered virtio-blk can benefit from guest-side readahead and batched block I/O. In CPU-constrained deployments, operators may prefer to enable FPR alone and retain virtio-blk. Together, these results validate the complementary memory optimizations in §5.2: virtio-pmem reduces page-cache duplication, while DAMON with balloon FPR reclaims idle guest memory.

我们在测试集群上跑一个真实的 Agent RL 负载, 比较四种 Firecracker 配置: 未优化的基线, 只开带 DAX 的 virtio-pmem, 只开经 virtio-balloon 设备做的基于 DAMON 的空闲页上报 (FPR), 两者都开. 带 DAX 的 virtio-pmem 把各 guest 冗余的页缓存收拢成宿主机上一份共享映射, 峰值宿主内存比基线降低 40.2%. 只开 DAMON 加 balloon FPR, 峰值基本不变, 但按时间积分的宿主内存消耗降低 21.2%. 两种机制一起开, 总体内存消耗最低. 如 Fig. 12 所示, virtio-pmem 把瞬时峰值 CPU 利用率从 26.5% 抬到 41.4%. 这一增长可能部分反映了冷访问路径的差别: 带 DAX 的 virtio-pmem 可能需要同步缺页处理来建立映射, 让后备数据就位, 而带缓冲的 virtio-blk 能受益于 guest 端预读和批量块 I/O. 在 CPU 受限的部署里, 运维可能更愿意只开 FPR, 保留 virtio-blk. 这些结果合起来验证了 §5.2 中互补的内存优化: virtio-pmem 减少页缓存重复, DAMON 加 balloon FPR 回收 guest 的闲置内存.

## 8.5. CPU QoS under Overcommit · 超卖下的 CPU QoS

We run latency-sensitive (LS) tasks from a real evaluation workload alongside co-located besteffort (BE) load ranging from 10% to 50% of node capacity, measuring how well our mechanism preserves per-sandbox performance under high-density deployment. We compare an unprotected baseline, SCHED\_IDLE alone, and SCHED\_IDLE combined with core scheduling.

我们让来自真实评测负载的延迟敏感 (LS) 任务, 与占节点容量 10% 到 50% 的同机尽力而为 (BE) 负载一起运行, 衡量这套机制在高密度部署下对单个沙箱性能的保护程度. 比较三种配置: 不加保护的基线, 只用 SCHED\_IDLE, SCHED\_IDLE 加 core scheduling.

As shown in Fig. 13, we use a latency-sensitive chess application as the test workload. At 50% BE load, its per-step latency increases by 45.2% over the no-co-location baseline without QoS controls. SCHED\_IDLE alone improves latency by at most 3.4% because an LS thread can still contend with BE work running on its SMT sibling. Adding core scheduling keeps latency close to the no-co-location baseline at low load and limits inflation to 17.3% at 50% load. The improvement grows as BE contention increases. These results validate the two-level CPU QoS

<!-- page 24 of 31 -->

![Image block](images/p24-figure-13-latency-sensitive-agent-time-under-increasing-co.jpg)

Figure 13 | Latency-sensitive agent time under increasing co-located best-effort CPU load, comparing an unprotected baseline, SCHED\_IDLE alone, and SCHED\_IDLE combined with core scheduling.

design in §5.2: SCHED\_IDLE prioritizes LS tasks, while core scheduling isolates them from BE work on sibling SMT threads. The residual degradation mainly results from reduced CPU turbo frequency under high multicore load, memory bandwidth and shared last-level cache (LLC) contention that core scheduling does not address. Since this remaining interference is already tolerable, we do not apply memory bandwidth isolation.

如 Fig. 13 所示, 测试负载是一个延迟敏感的国际象棋应用. 在 50% 的 BE 负载下, 不加 QoS 控制时它的单步延迟比无同机负载的基线高 45.2%. 只用 SCHED\_IDLE 最多只能把延迟改善 3.4%, 因为 LS 线程仍会与跑在其 SMT 兄弟线程上的 BE 工作争抢. 加上 core scheduling 后, 低负载时延迟接近无同机负载的基线, 50% 负载时膨胀限制在 17.3%. BE 争抢越激烈, 改善越明显. 这些结果验证了 §5.2 的两级 CPU QoS 设计: SCHED\_IDLE 让 LS 任务优先, core scheduling 把它们与兄弟 SMT 线程上的 BE 工作隔开. 剩余的退化主要来自多核高负载下 CPU 睿频下降, 以及 core scheduling 管不到的内存带宽和共享末级缓存 (LLC) 争用. 这部分剩余干扰已经可以接受, 所以我们没有做内存带宽隔离.

> **再看:** §5.2 把结果写成「SMT 引起的延迟膨胀从 45.2% 降到 17.3%」, §8.5 又说剩下的 17.3% 主要来自睿频, 内存带宽和 LLC, 两处说法对得上吗?
> 答: 对不上. 45.2% 是不加保护时相对无同机负载的总膨胀, 里面既有 SMT 兄弟线程争用, 也有睿频和共享缓存/带宽的争用; 17.3% 是加 core scheduling 后的剩余, 按 §8.5 的归因已经基本不含 SMT 争用. 所以「SMT-induced latency inflation from 45.2% to 17.3%」把总膨胀说成了 SMT 膨胀. 按 §8.5 的口径, 能归给 SMT 隔离的改善约是 $45.2\%-17.3\%\approx 28$ 个百分点, 再减去 SCHED\_IDLE 单独贡献的不超过 3.4%. 另外 3.4% 是相对改善还是百分点, 文中没有说明.

## 9. Related Work · 相关工作

**Serverless computing.** Serverless platforms such as SAND (Akkus et al., 2018), REAP (Ustiugov et al., 2021), TrEnv (Huang et al., 2024), and RunD (Li et al., 2022) optimize cold-start latency and resource sharing for short-lived, stateless functions. These workloads typically reuse a limited set of images at high fanout, and many systems assume that the required images are already available locally. Agentic training instead uses long-lived, stateful sandboxes drawn from an image corpus that exceeds single-node storage and has low per-image fanout.

**Serverless 计算.** SAND (Akkus et al., 2018), REAP (Ustiugov et al., 2021), TrEnv (Huang et al., 2024), RunD (Li et al., 2022) 等 serverless 平台针对短命, 无状态的函数优化冷启动延迟和资源共享. 这类负载通常以高扇出复用有限的一组镜像, 很多系统假设所需镜像已经在本地. Agent 训练用的则是长寿, 有状态的沙箱, 镜像库超过单节点存储, 每个镜像的扇出又低.

**LLM code execution platforms.** Recent systems provide sandboxed code execution for LLM workflows in both training and inference. Inference-facing systems include OpenAI Code Interpreter (OpenAI, 2025), E2B (E2B, 2024), and Kimi-K2.5's Agent Swarm (Kimi Team, 2026). Training systems such as MiMo-V2-Flash (Xiaomi LLM-Core Team, 2026) and ComputerRL (Lai et al., 2025) mention their execution environments but focus primarily on model and training design. DSec focuses on the underlying sandbox infrastructure, integrating environment composition, resource overcommit, image serving, and preemption-safe resumption within one platform.

**LLM 代码执行平台.** 近来的系统为训练和推理中的 LLM 工作流提供沙箱化的代码执行. 面向推理的有 OpenAI Code Interpreter (OpenAI, 2025), E2B (E2B, 2024) 和 Kimi-K2.5 的 Agent Swarm (Kimi Team, 2026). MiMo-V2-Flash (Xiaomi LLM-Core Team, 2026), ComputerRL (Lai et al., 2025) 这类训练系统提到了各自的执行环境, 但重点放在模型和训练设计上. DSec 关注的是底层沙箱基础设施, 把环境组装, 资源超卖, 镜像服务和抢占安全的恢复集成在一个平台里.

**Container image and filesystem formats.** DADI (Li et al., 2020) and CoFS (Wang et al., 2026) support on-demand container-image loading, while FaaSNet (Wang et al., 2021) uses peer-to-peer delivery to accelerate image distribution. EROFS (Gao et al., 2019) provides a compressed read-only filesystem with random access. DSec builds on these techniques for RL training and evaluation, serving container and microVM images from 3FS rather than introducing a separate registry and peer-to-peer distribution tier.

**容器镜像与文件系统格式.** DADI (Li et al., 2020) 和 CoFS (Wang et al., 2026) 支持按需加载容器镜像, FaaSNet (Wang et al., 2021) 用点对点分发加速镜像分发. EROFS (Gao et al., 2019) 提供可随机访问的压缩只读文件系统. DSec 在这些技术之上服务 RL 训练和评测, 从 3FS 提供容器和 microVM 镜像, 不另外引入镜像仓库和点对点分发层.

**Lightweight isolation.** To run diverse workloads, several isolation paradigms have been proposed, including microVMs (Agache et al., 2020) or VM-backed kata-containers (Kata Containers, 2017), library OSes (che Tsai et al., 2017; LiteBox, 2025), WebAssembly runtimes (Gadepalli et al., 2020; Shillaker and Pietzuch, 2020), unikernels (Cadden et al., 2020), nested kernels (Dautenhahn

<!-- page 25 of 31 -->

et al., 2015; Zhang et al., 2025), and nested virtualization (Huang et al., 2023). They offer different trade-offs among isolation, compatibility, and performance. Rather than proposing another isolation mechanism, DSec integrates multiple sandbox backends behind a unified platform, allowing callers to choose the appropriate backend for each task.

**轻量隔离.** 为了运行多样的负载, 已有多种隔离范式被提出: microVM (Agache et al., 2020) 或以 VM 为后备的 kata-containers (Kata Containers, 2017), library OS (che Tsai et al., 2017; LiteBox, 2025), WebAssembly 运行时 (Gadepalli et al., 2020; Shillaker and Pietzuch, 2020), unikernel (Cadden et al., 2020), 嵌套内核 (Dautenhahn et al., 2015; Zhang et al., 2025) 以及嵌套虚拟化 (Huang et al., 2023). 它们在隔离性, 兼容性和性能之间做出不同的取舍. DSec 没有再提出一种隔离机制, 而是在一个统一平台背后集成多种沙箱后端, 让调用方为每个任务选择合适的后端.

**RL training infrastructure.** Systems such as Slime (Zhu et al., 2025), veRL (Sheng et al., 2025), OpenRLHF (Hu, 2026; Hu et al., 2025), and Seer (Qin et al., 2026) focus on scaling RL training through efficient GPU scheduling, communication, and sample throughput. They treat the execution environment as a black box, assuming that sandboxes are available and correctly configured. DSec operates at the complementary infrastructure layer, managing sandbox provisioning and lifecycle while coordinating execution state and security policy with the training framework.

**RL 训练基础设施.** Slime (Zhu et al., 2025), veRL (Sheng et al., 2025), OpenRLHF (Hu, 2026; Hu et al., 2025), Seer (Qin et al., 2026) 等系统通过高效的 GPU 调度, 通信和样本吞吐来扩展 RL 训练. 它们把执行环境当黑盒, 假定沙箱已经可用且配置正确. DSec 工作在与之互补的基础设施层, 管理沙箱的供给和生命周期, 并与训练框架协调执行状态和安全策略.

## 10. Conclusion

We presented DSec, a production sandbox platform for large-scale LLM agentic training, evaluation and environment construction. DSec exposes multiple sandbox backends through a unified interface, allowing users to select an appropriate execution environment for different functionality, compatibility, and isolation requirements. Composable EROFS-backed layers avoid repeated environment rebuilding and extraction, complementary memory sharing and reclamation mechanisms support high-density deployment, QoS-aware CPU scheduling protects latency-sensitive tasks under oversubscription, and 3FS-backed on-demand image loading reduces image distribution overhead. DSec also integrates with the RL framework for preemption-safe resumption and task-specific network policy, providing a scalable execution foundation for agentic workloads.

我们介绍了 DSec, 一个面向大规模 LLM Agent 训练, 评测和环境构建的生产沙箱平台. DSec 通过统一接口提供多种沙箱后端, 用户可以按不同的功能, 兼容性和隔离要求选择合适的执行环境. 以 EROFS 为后备的可组合层免去了反复重建和解包环境; 互补的内存共享与回收机制支撑高密度部署; 感知 QoS 的 CPU 调度在超订下保护延迟敏感任务; 以 3FS 为后备的按需镜像加载降低了镜像分发开销. DSec 还与 RL 框架集成, 实现抢占安全的恢复和任务专属的网络策略, 为 Agent 负载提供可扩展的执行底座.

## References

A. Agache, M. Brooker, A. Iordache, A. Liguori, R. Neugebauer, P. Piwonka, and D.-M. Popa. Firecracker: Lightweight virtualization for serverless applications. In 17th USENIX Symposium on Networked Systems Design and Implementation (NSDI 20), pages 419–434, Santa Clara, CA, Feb. 2020. USENIX Association. ISBN 978-1-939133-13-7. URL [https://www.usenix.org/conference/nsdi20/presentation/agache](https://www.usenix.org/conference/nsdi20/presentation/agache).

I. E. Akkus, R. Chen, I. Rimac, M. Stein, K. Satzke, A. Beck, P. Aditya, and V. Hilt. SAND: Towards High-Performance serverless computing. In 2018 USENIX Annual Technical Conference (USENIX ATC 18), pages 923–935, Boston, MA, July 2018. USENIX Association. ISBN 978-1-939133-01-4. URL [https://www.usenix.org/conference/atc18/presentation/akkus](https://www.usenix.org/conference/atc18/presentation/akkus).

D. Amodei, C. Olah, J. Steinhardt, P. Christiano, J. Schulman, and D. Mané. Concrete problems in ai safety, 2016. URL [https://arxiv.org/abs/1606.06565](https://arxiv.org/abs/1606.06565).

W. An, X. Bi, G. Chen, S. Chen, C. Deng, H. Ding, K. Dong, Q. Du, W. Gao, K. Guan, J. Guo, Y. Guo, Z. Fu, Y. He, P. Huang, J. Li, W. Liang, X. Liu, X. Liu, Y. Liu, Y. Liu, S. Lu, X. Lu, X. Nie, T. Pei, J. Qiu, H. Qu, Z. Ren, Z. Sha, X. Su, X. Sun, Y. Tan, M. Tang, S. Wang, Y. Wang, Y. Wang, Z. Xie, Y. Xiong, Y. Xu, S. Ye, S. Yu, Y. Zha, L. Zhang, H. Zhang, M. Zhang, W. Zhang, Y. Zhang, C. Zhao, Y. Zhao, S. Zhou, S. Zhou, and Y. Zou. Fire-flyer ai-hpc: A cost-effective softwarehardware co-design for deep learning. In Proceedings of the International Conference for High Performance Computing, Networking, Storage, and Analysis, SC ’24. IEEE Press, 2024. ISBN 9798350352917. doi: 10.1109/SC41406.2024.00089. URL [https://doi.org/10.1109/SC41406.2024.00089](https://doi.org/10.1109/SC41406.2024.00089).

<!-- page 26 of 31 -->

Anomaly. OpenCode, 2025. URL [https://opencode.ai/](https://opencode.ai/).

F. Bellard. QEMU, a fast and portable dynamic translator. In 2005 USENIX Annual Technical Conference (USENIX ATC 05), Anaheim, CA, Apr. 2005. USENIX Association. URL [https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator](https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator).

J. Cadden, T. Unger, Y. Awad, H. Dong, O. Krieger, and J. Appavoo. Seuss: skip redundant paths to make serverless fast. In Proceedings of the Fifteenth European Conference on Computer Systems, EuroSys ’20, New York, NY, USA, 2020. Association for Computing Machinery. ISBN 9781450368827. doi: 10.1145/3342195.3392698. URL [https://doi.org/10.1145/3342195.3392698](https://doi.org/10.1145/3342195.3392698).

C. che Tsai, D. E. Porter, and M. Vij. Graphene-SGX: A practical library OS for unmodified applications on SGX. In 2017 USENIX Annual Technical Conference (USENIX ATC 17), pages 645–658, Santa Clara, CA, July 2017. USENIX Association. ISBN 978-1-931971-38-6. URL [https://www.usenix.org/conference/atc17/technical-sessions/presentation/tsai](https://www.usenix.org/conference/atc17/technical-sessions/presentation/tsai).

N. Dautenhahn, T. Kasampalis, W. Dietz, J. Criswell, and V. Adve. Nested kernel: An operating system architecture for intra-kernel privilege separation. In Proceedings of the Twentieth International Conference on Architectural Support for Programming Languages and Operating Systems, ASPLOS ’15, New York, NY, USA, 2015. Association for Computing Machinery. ISBN 9781450328357. doi: 10.1145/2694344.2694386. URL [https://doi.org/10.1145/2694344.2694386](https://doi.org/10.1145/2694344.2694386).

DeepSeek-AI. Fire-flyer file sytem. URL [https://github.com/deepseek-ai/3fs](https://github.com/deepseek-ai/3fs).

DeepSeek-AI. Deepseek-v3.2: Pushing the frontier of open large language models, 2025. URL [https://arxiv.org/abs/2512.02556](https://arxiv.org/abs/2512.02556).

DeepSeek-AI. Deepseek-v4.1-flash: Pushing the limits of kv cache compression, 2026. URL [https://arxiv.org/abs/2609.19969](https://arxiv.org/abs/2609.19969).

Dragonfly Community. Nydus: Dragonfly container image service, 2020. URL [https://github.com/dragonflyoss/nydus](https://github.com/dragonflyoss/nydus).

DXVK. DXVK: A vulkan-based implementation of direct3d 8/9/10/11. [https://github.com/doitsujin/dxvk](https://github.com/doitsujin/dxvk), 2018.

E2B. E2B: Open-source secure sandboxes for AI code execution, 2024. URL [https://github.com/e2b-dev/E2B](https://github.com/e2b-dev/E2B).

P. K. Gadepalli, S. McBride, G. Peach, L. Cherkasova, and G. Parmer. Sledge: a serverlessfirst, light-weight wasm runtime for the edge. In Proceedings of the 21st International Middleware Conference, Middleware ’20, page 265–279, New York, NY, USA, 2020. Association for Computing Machinery. ISBN 9781450381536. doi: 10.1145/3423211.3425680. URL [https://doi.org/10.1145/3423211.3425680](https://doi.org/10.1145/3423211.3425680).

X. Gao, M. Dong, X. Miao, W. Du, C. Yu, and H. Chen. EROFS: A compression-friendly readonly file system for resource-scarce devices. In 2019 USENIX Annual Technical Conference (USENIX ATC 19), pages 149–162, Renton, WA, July 2019. USENIX Association. ISBN 978-1-939133-03-8. URL [http://www.usenix.org/conference/atc19/presentation/gao](http://www.usenix.org/conference/atc19/presentation/gao).

<!-- page 27 of 31 -->

D. Guo, D. Yang, H. Zhang, J. Song, P. Wang, Q. Zhu, R. Xu, R. Zhang, S. Ma, X. Bi, X. Zhang, X. Yu, Y. Wu, Z. F. Wu, Z. Gou, Z. Shao, Z. Li, Z. Gao, A. Liu, B. Xue, B. Wang, B. Wu, B. Feng, C. Lu, C. Zhao, C. Deng, C. Ruan, D. Dai, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Xu, H. Ding, H. Gao, H. Qu, H. Li, J. Guo, J. Li, J. Chen, J. Yuan, J. Tu, J. Qiu, J. Li, J. L. Cai, J. Ni, J. Liang, J. Chen, K. Dong, K. Hu, K. You, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Zhao, L. Wang, L. Zhang, L. Xu, L. Xia, M. Zhang, M. Zhang, M. Tang, M. Zhou, M. Li, M. Wang, M. Li, N. Tian, P. Huang, P. Zhang, Q. Wang, Q. Chen, Q. Du, R. Ge, R. Zhang, R. Pan, R. Wang, R. J. Chen, R. L. Jin, R. Chen, S. Lu, S. Zhou, S. Chen, S. Ye, S. Wang, S. Yu, S. Zhou, S. Pan, S. S. Li, S. Zhou, S. Wu, T. Yun, T. Pei, T. Sun, T. Wang, W. Zeng, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, W. L. Xiao, W. An, X. Liu, X. Wang, X. Chen, X. Nie, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yang, X. Li, X. Su, X. Lin, X. Q. Li, X. Jin, X. Shen, X. Chen, X. Sun, X. Wang, X. Song, X. Zhou, X. Wang, X. Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. Zhang, Y. Xu, Y. Li, Y. Zhao, Y. Sun, Y. Wang, Y. Yu, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Ou, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Xiong, Y. Luo, Y. You, Y. Liu, Y. Zhou, Y. X. Zhu, Y. Huang, Y. Li, Y. Zheng, Y. Zhu, Y. Ma, Y. Tang, Y. Zha, Y. Yan, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Xie, Z. Zhang, Z. Hao, Z. Ma, Z. Yan, Z. Wu, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Pan, Z. Huang, Z. Xu, Z. Zhang, and Z. Zhang. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. <u>Nature</u>, 645(8081):633–638, Sep 2025. ISSN 1476-4687. doi: 10.1038/s41586-025-09422-z. URL [https://doi.org/10.1038/s41586-025-09422-z](https://doi.org/10.1038/s41586-025-09422-z).

J. Hu. Reinforce++: A simple and efficient approach for aligning large language models. arXiv preprint arXiv:2501.03262, 2026.

J. Hu, X. Wu, W. Shen, J. K. Liu, Z. Zhu, W. Wang, S. Jiang, H. Wang, H. Chen, B. Chen, W. Fang, Xianyu, Y. Cao, H. Xu, and Y. Liu. Openrlhf: An easy-to-use, scalable and high-performance rlhf framework, 2025. URL [https://arxiv.org/abs/2405.11143](https://arxiv.org/abs/2405.11143).

H. Huang, J. Lai, J. Rao, H. Lu, W. Hou, H. Su, Q. Xu, J. Zhong, J. Zeng, X. Wang, Z. He, W. Han, J. Liu, T. Ma, and S. Wu. Pvm: Efficient shadow paging for deploying secure containers in cloud-native environment. In Proceedings of the 29th Symposium on Operating Systems Principles, SOSP ’23, page 515–530, New York, NY, USA, 2023. Association for Computing Machinery. ISBN 9798400702297. doi: 10.1145/3600006.3613158. URL [https://doi.org/10.1145/3600006.3613158](https://doi.org/10.1145/3600006.3613158).

J. Huang, M. Zhang, T. Ma, Z. Liu, S. Lin, K. Chen, J. Jiang, X. Liao, Y. Shan, N. Zhang, M. Lu, T. Ma, H. Gong, and Y. Wu. Trenv: Transparently share serverless execution environments across different functions and nodes. In Proceedings of the ACM SIGOPS 30th Symposium on Operating Systems Principles, SOSP ’24, page 421–437, New York, NY, USA, 2024. Association for Computing Machinery. ISBN 9798400712517. doi: 10.1145/3694715.3695967. URL [https://doi.org/10.1145/3694715.3695967](https://doi.org/10.1145/3694715.3695967).

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan. Swe-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Kata Containers. Kata Containers: Secure Containers with Lightweight Virtual Machines. [https://katacontainers.io/](https://katacontainers.io/), 2017.

Kimi Team. Kimi K2.5: Visual agentic intelligence, 2026.

<!-- page 28 of 31 -->

H. Lai, X. Liu, Y. Zhao, H. Xu, H. Zhang, B. Jing, Y. Ren, S. Yao, Y. Dong, and J. Tang. ComputerRL: Scaling end-to-end online reinforcement learning for computer use agents, 2025.

H. Li, Y. Yuan, R. Du, K. Ma, L. Liu, and W. Hsu. DADI: Block-Level image service for agile and elastic application deployment. In 2020 USENIX Annual Technical Conference (USENIX ATC 20), pages 727–740. USENIX Association, July 2020. ISBN 978-1-939133-14-4. URL [https://www.usenix.org/conference/atc20/presentation/li-huiba](https://www.usenix.org/conference/atc20/presentation/li-huiba).

Z. Li, J. Cheng, Q. Chen, E. Guan, Z. Bian, Y. Tao, B. Zha, Q. Wang, W. Han, and M. Guo. RunD: A lightweight secure container runtime for high-density deployment and high-concurrency startup in serverless computing. In 2022 USENIX Annual Technical Conference (USENIX ATC 22), pages 53–68, Carlsbad, CA, July 2022. USENIX Association. ISBN 978-1-939133-29-27. URL [https://www.usenix.org/conference/atc22/presentation/li-zijun-rund](https://www.usenix.org/conference/atc22/presentation/li-zijun-rund).

LiteBox. Litebox: A security-focused library os supporting kernel- and user-mode execution. [https://github.com/microsoft/litebox](https://github.com/microsoft/litebox), 2025.

M. A. Merrill, A. G. Shaw, N. Carlini, B. Li, H. Raj, I. Bercovich, L. Shi, J. Y. Shin, T. Walshe, E. K. Buchanan, J. Shen, G. Ye, H. Lin, J. Poulos, M. Wang, M. Nezhurina, J. Jitsev, D. Lu, O. M. Mastromichalakis, Z. Xu, Z. Chen, Y. Liu, R. Zhang, L. L. Chen, A. Kashyap, J.-L. Uslu, J. Li, J. Wu, M. Yan, S. Bian, V. Sharma, K. Sun, S. Dillmann, A. Anand, A. Lanpouthakoun, B. Koopah, C. Hu, E. Guha, G. H. S. Dreiman, J. Zhu, K. Krauth, L. Zhong, N. Muennighoff, R. Amanfu, S. Tan, S. Pimpalgaonkar, T. Aggarwal, X. Lin, X. Lan, X. Zhao, Y. Liang, Y. Wang, Z. Wang, C. Zhou, D. Heineman, H. Liu, H. Trivedi, J. Yang, J. Lin, M. Shetty, M. Yang, N. Omi, N. Raoof, S. Li, T. Y. Zhuo, W. Lin, Y. Dai, Y. Wang, W. Chai, S. Zhou, D. Wahdany, Z. She, J. Hu, Z. Dong, Y. Zhu, S. Cui, A. Saiyed, A. Kolbeinsson, J. Hu, C. M. Rytting, R. Marten, Y. Wang, A. Dimakis, A. Konwinski, and L. Schmidt. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces, 2026. URL [https://arxiv.org/abs/2601.11868](https://arxiv.org/abs/2601.11868).

M. Mitzenmacher. The power of two choices in randomized load balancing. IEEE Transactions on Parallel and Distributed Systems, 12(10):1094–1104, 2001. doi: 10.1109/71.963420.

Moby Project. The Moby Project, 2026. URL [https://github.com/moby/moby](https://github.com/moby/moby).

Open Container Initiative. Open Container Initiative Image Format Specification, 2026. URL [https://github.com/opencontainers/image-spec](https://github.com/opencontainers/image-spec).

OpenAI. Code interpreter: Agent harness and sandbox for code execution, 2025. URL [https://platform.openai.com/docs/guides/code-interpreter](https://platform.openai.com/docs/guides/code-interpreter).

OpenAI, J. Achiam, S. Adler, S. Agarwal, L. Ahmad, I. Akkaya, F. L. Aleman, D. Almeida, J. Altenschmidt, S. Altman, S. Anadkat, R. Avila, I. Babuschkin, S. Balaji, V. Balcom, P. Baltescu, H. Bao, M. Bavarian, J. Belgum, I. Bello, J. Berdine, G. Bernadett-Shapiro, C. Berner, L. Bogdonoff, O. Boiko, M. Boyd, A.-L. Brakman, G. Brockman, T. Brooks, M. Brundage, K. Button, T. Cai, R. Campbell, A. Cann, B. Carey, C. Carlson, R. Carmichael, B. Chan, C. Chang, F. Chantzis, D. Chen, S. Chen, R. Chen, J. Chen, M. Chen, B. Chess, C. Cho, C. Chu, H. W. Chung, D. Cummings, J. Currier, Y. Dai, C. Decareaux, T. Degry, N. Deutsch, D. Deville, A. Dhar, D. Dohan, S. Dowling, S. Dunning, A. Ecoffet, A. Eleti, T. Eloundou, D. Farhi, L. Fedus, N. Felix, S. P. Fishman, J. Forte, I. Fulford, L. Gao, E. Georges, C. Gibson, V. Goel, T. Gogineni, G. Goh, R. Gontijo-Lopes, J. Gordon, M. Grafstein, S. Gray, R. Greene, J. Gross, S. S. Gu, Y. Guo, C. Hallacy, J. Han, J. Harris, Y. He, M. Heaton, J. Heidecke, C. Hesse, A. Hickey,

<!-- page 29 of 31 -->

W. Hickey, P. Hoeschele, B. Houghton, K. Hsu, S. Hu, X. Hu, J. Huizinga, S. Jain, S. Jain, J. Jang, A. Jiang, R. Jiang, H. Jin, D. Jin, S. Jomoto, B. Jonn, H. Jun, T. Kaftan, Ł. Kaiser, A. Kamali, I. Kanitscheider, N. S. Keskar, T. Khan, L. Kilpatrick, J. W. Kim, C. Kim, Y. Kim, J. H. Kirchner, J. Kiros, M. Knight, D. Kokotajlo, Ł. Kondraciuk, A. Kondrich, A. Konstantinidis, K. Kosic, G. Krueger, V. Kuo, M. Lampe, I. Lan, T. Lee, J. Leike, J. Leung, D. Levy, C. M. Li, R. Lim, M. Lin, S. Lin, M. Litwin, T. Lopez, R. Lowe, P. Lue, A. Makanju, K. Malfacini, S. Manning, T. Markov, Y. Markovski, B. Martin, K. Mayer, A. Mayne, B. McGrew, S. M. McKinney, C. McLeavey, P. McMillan, J. McNeil, D. Medina, A. Mehta, J. Menick, L. Metz, A. Mishchenko, P. Mishkin, V. Monaco, E. Morikawa, D. Mossing, T. Mu, M. Murati, O. Murk, D. Mély, A. Nair, R. Nakano, R. Nayak, A. Neelakantan, R. Ngo, H. Noh, L. Ouyang, C. O’Keefe, J. Pachocki, A. Paino, J. Palermo, A. Pantuliano, G. Parascandolo, J. Parish, E. Parparita, A. Passos, M. Pavlov, A. Peng, A. Perelman, F. de Avila Belbute Peres, M. Petrov, H. P. de Oliveira Pinto, Michael, Pokorny, M. Pokrass, V. H. Pong, T. Powell, A. Power, B. Power, E. Proehl, R. Puri, A. Radford, J. Rae, A. Ramesh, C. Raymond, F. Real, K. Rimbach, C. Ross, B. Rotsted, H. Roussez, N. Ryder, M. Saltarelli, T. Sanders, S. Santurkar, G. Sastry, H. Schmidt, D. Schnurr, J. Schulman, D. Selsam, K. Sheppard, T. Sherbakov, J. Shieh, S. Shoker, P. Shyam, S. Sidor, E. Sigler, M. Simens, J. Sitkin, K. Slama, I. Sohl, B. Sokolowsky, Y. Song, N. Staudacher, F. P. Such, N. Summers, I. Sutskever, J. Tang, N. Tezak, M. B. Thompson, P. Tillet, A. Tootoonchian, E. Tseng, P. Tuggle, N. Turley, J. Tworek, J. F. C. Uribe, A. Vallone, A. Vijayvergiya, C. Voss, C. Wainwright, J. J. Wang, A. Wang, B. Wang, J. Ward, J. Wei, C. Weinmann, A. Welihinda, P. Welinder, J. Weng, L. Weng, M. Wiethoff, D. Willner, C. Winter, S. Wolrich, H. Wong, L. Workman, S. Wu, J. Wu, M. Wu, K. Xiao, T. Xu, S. Yoo, K. Yu, Q. Yuan, W. Zaremba, R. Zellers, C. Zhang, M. Zhang, S. Zhao, T. Zheng, J. Zhuang, W. Zhuk, and B. Zoph. Gpt-4 technical report, 2024. URL [https://arxiv.org/abs/2303.08774](https://arxiv.org/abs/2303.08774).

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. L. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, J. Schulman, J. Hilton, F. Kelton, L. Miller, M. Simens, A. Askell, P. Welinder, P. Christiano, J. Leike, and R. Lowe. Training language models to follow instructions with human feedback. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

S. Park, J. Ahn, H. Y. Kim, and Y. Lee. Profiling dynamic data access patterns with controlled overhead and quality. In Proceedings of the 20th International Middleware Conference Industrial Track (Middleware ’19), pages 29–30, 2019. doi: 10.1145/3366626.3368125.

QEMU Project. VirtIO Persistent Memory, 2026. URL [https://www.qemu.org/docs/master/system/devices/virtio/virtio-pmem.html](https://www.qemu.org/docs/master/system/devices/virtio/virtio-pmem.html).

R. Qin, W. He, W. Huang, Y. Zhang, Y. Zhao, B. Pang, X. Xu, Y. Shan, Y. Wu, and M. Zhang. Seer: Online context learning for fast synchronous llm reinforcement learning, 2026. URL [https://arxiv.org/abs/2511.14617](https://arxiv.org/abs/2511.14617).

G. Sheng, C. Zhang, Z. Ye, X. Wu, W. Zhang, R. Zhang, Y. Peng, H. Lin, and C. Wu. Hybridflow: A flexible and efficient rlhf framework. In Proceedings of the Twentieth European Conference on Computer Systems, EuroSys ’25, page 1279–1297, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400711961. doi: 10.1145/3689031.3696075. URL [https://doi.org/10.1145/3689031.3696075](https://doi.org/10.1145/3689031.3696075).

Y. Shi, W. Zhang, and T. Cui. A programming paradigm for spatiotemporal composability, 2026. URL [https://arxiv.org/abs/2608.25512](https://arxiv.org/abs/2608.25512).

<!-- page 30 of 31 -->

S. Shillaker and P. Pietzuch. Faasm: Lightweight isolation for efficient stateful serverless computing. In 2020 USENIX Annual Technical Conference (USENIX ATC 20), pages 419–433. USENIX Association, July 2020. ISBN 978-1-939133-14-4. URL [https://www.usenix.org/conference/atc20/presentation/shillaker](https://www.usenix.org/conference/atc20/presentation/shillaker).

J. Skalse, N. H. R. Howe, D. Krasheninnikov, and D. Krueger. Defining and characterizing reward hacking. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

D. Ustiugov, P. Petrov, M. Kogias, E. Bugnion, and B. Grot. Benchmarking, analysis, and optimization of serverless function snapshots. In Proceedings of the 26th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, ASPLOS ’21, page 559–572, New York, NY, USA, 2021. Association for Computing Machinery. ISBN 9781450383172. doi: 10.1145/3445814.3446714. URL [https://doi.org/10.1145/3445814.3446714](https://doi.org/10.1145/3445814.3446714).

C. A. Waldspurger. Memory resource management in VMware ESX server. In 5th Symposium on Operating Systems Design and Implementation (OSDI 02), Boston, MA, Dec. 2002. USENIX Association. URL [https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server](https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server).

A. Wang, S. Chang, H. Tian, H. Wang, H. Yang, H. Li, R. Du, and Y. Cheng. FaaSNet: Scalable and fast provisioning of custom serverless container runtimes at alibaba cloud function compute. In 2021 USENIX Annual Technical Conference (USENIX ATC 21), pages 443–457. USENIX Association, July 2021. ISBN 978-1-939133-23-6. URL [https://www.usenix.org/conference/atc21/presentation/wang-ao](https://www.usenix.org/conference/atc21/presentation/wang-ao).

L. Wang, J. Du, Y. Yang, Q. Wu, T. Liu, and H. Wu. CoFS: A filesystem for fast container startup. In 24th USENIX Conference on File and Storage Technologies (FAST 26), pages 415–423, Santa Clara, CA, Feb. 2026. USENIX Association. ISBN 978-1-939133-53-3. URL [https://www.usenix.org/conference/fast26/presentation/wang-li](https://www.usenix.org/conference/fast26/presentation/wang-li).

Xiaomi LLM-Core Team. MiMo-V2-Flash technical report, 2026.

T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, T. J. Hua, Z. Cheng, D. Shin, F. Lei, Y. Liu, Y. Xu, S. Zhou, S. Savarese, C. Xiong, V. Zhong, and T. Yu. Osworld: Benchmarking multi-modal agents for open-ended tasks in real computer environments. In Advances in Neural Information Processing Systems, 2024. doi: 10.52202/079017-1650.

C. Zhang, R. Priolkar, Y. Jiang, Y. Xiao, M. Vij, Z. Liang, and A. Ahmad. Erebor: A drop-in sandbox solution for private data processing in untrusted confidential virtual machines. In Proceedings of the Twentieth European Conference on Computer Systems, EuroSys ’25, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400711961. doi: 10.1145/3689031.3717464. URL [https://doi.org/10.1145/3689031.3717464](https://doi.org/10.1145/3689031.3717464).

S. Zhou, F. F. Xu, H. Zhu, X. Zhou, R. Lo, A. Sridhar, X. Cheng, T. Ou, Y. Bisk, D. Fried, U. Alon, and G. Neubig. Webarena: A realistic web environment for building autonomous agents. In International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=oKn9c6ytLx](https://openreview.net/forum?id=oKn9c6ytLx).

Z. Zhu, C. Xie, X. Lv, and slime Contributors. slime: An llm post-training framework for rl scaling. [https://github.com/THUDM/slime](https://github.com/THUDM/slime), 2025.

<!-- page 31 of 31 -->

P. Zijlstra, J. Fernandes, and V. Pillai. Core scheduling, 2021. URL [https://docs.kernel.org/admin-guide/hw-vuln/core-scheduling.html](https://docs.kernel.org/admin-guide/hw-vuln/core-scheduling.html).
