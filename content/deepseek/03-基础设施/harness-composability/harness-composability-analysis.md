---
title: "Harness Composability 技术解析: 用可撤销 effect 与响应式 coeffect 管理动态组件"
category: "DeepSeek"
tags:
  - Agent Harness
  - 编程语言
  - 动态组合
  - Cordis
published: true
excerpt: "论文将 effect 和 coeffect 从静态类型概念提升为运行时机制, 为插件与自演化 agent harness 建立可卸载、可重载且依赖一致的组件模型."
---
# Harness Composability 技术解析: 用可撤销 effect 与响应式 coeffect 管理动态组件

《A Programming Paradigm for Spatiotemporal Composability》由北京大学与 DeepSeek-AI 的 Yifan Shi, Wei Zhang, Tianyi Cui 完成, arXiv 编号 2608.25512. 论文提出 Cordis 元框架, 目标是在同一进程内动态装载, 卸载和重配组件, 同时保证组件造成的状态变化能够撤回, 依赖变化能够触发生命周期调整. 全文 92 页, 前半部分给出 effect/coeffect 的运行时形式化与动态组合演算, 后半部分把演算对应到 Cordis 的 effect tracking, coeffect resolution, component loader 和 HMR 实现.

## 1. 动态组合缺少的两项保证

动态组合至少要保证两件事:**组件能完整退出,依赖变化能正确传播**.

### 1.1. 时间组合性要求完整撤回

插件执行以后会注册事件, 打开连接, 写入共享表, 创建子组件. 传统插件系统通常给一个 `deactivate` 回调, 清理由作者手工维护. 创建行为和清理行为分散在两个位置, 新增一项资源时很容易忘记补清理. VSCode 扩展 host 甚至无法在运行中卸载单个含代码扩展, 禁用或卸载需要重启整个 host. 论文将这类问题称为 temporal composability: 移除组件时, 组件对共享环境造成的修改必须完整且有序地撤回.

Cordis 把每个原子 effect 写成上下文变换和左逆. 正向操作返回修改后的上下文, 同时把 inverse 交给 runtime. 多个 effect 顺序执行时, inverse 按相反顺序组合, 形成 LIFO accumulator. 组件卸载只需执行 accumulator, 无需另写一份覆盖全部资源的集中清理函数. 这项保证仍有边界: runtime 能保证 inverse 被记录并按序调用, 不能验证作者提供的 inverse 在语义上确实撤回了正向操作.

### 1.2. 空间组合性要求依赖响应变化

组件还需要声明自己依赖哪些能力. 静态 module import 在程序启动前解析, 无法表达 provider 在运行中出现, 消失或替换. 容器编排能够处理 service 粒度的依赖, 却不能处理同一地址空间内函数与状态的细粒度关系. 论文将依赖的声明, 解析和生命周期响应称为 spatial composability.

Cordis 让组件以 coeffect specification 声明所需 key. 上下文中的 binding 每次改变, runtime 重新判断依赖是否满足. 未满足变为满足时激活组件, 满足变为未满足时卸载组件, provider 身份改变时先卸载再重载. 依赖者不需要轮询或订阅每个 provider 的自定义事件, 生命周期由统一上下文变化驱动.

### 1.3. 两个维度必须在同一上下文相遇

只做可撤销 effect, 组件仍要自行处理依赖变化; 只做响应式 coeffect, 卸载时仍可能泄漏资源. 论文将 effect context 与 coeffect context 合并成统一 context type, 要求组件的修改和依赖都经过它. 上下文既保存当前状态和 inverse accumulator, 也保存 key 到 realm, realm 到 value 的解析结构.

统一上下文还是组件归属的记录面. 操作在哪个 context 上调用, runtime 就能把其 inverse 归入对应 fiber. 子组件实例化也被视为父组件的一项 effect, 所以卸载父组件会沿 accumulator 移除子组件. 这种递归关系把单个 effect 的撤回扩展为组件树的生命周期撤回.

## 2. 可撤销 effect 的运行时结构

### 2.1. Effect context 保存状态与 accumulator

论文从上下文 $\Gamma$ 出发, 定义 effect context $\partial\Gamma=\Gamma\times(\Gamma\rightarrow\Gamma)$. 第一项是当前上下文状态 $\gamma$, 第二项 $\varphi$ 是至今所有 inverse 的复合. 初始状态为 $(\gamma_0,id_\Gamma)$. 当正向变换 $f$ 与 inverse $g$ 执行时, `track` 将状态改为 $f(\gamma)$, accumulator 改为 $\varphi\circ g$.

逆序是组合正确性的条件. 如果先做 $f_1$ 再做 $f_2$, 恢复必须先执行 $g_2$ 再执行 $g_1$. 论文用 twisted composition monoid 表达正向函数和 inverse 的相反组合顺序. `recover` 应用 accumulator 后将其重置, 从而让恢复操作自身可以继续参与更高一层 effect context.

### 2.2. Effect function 在应用点生成 inverse

同一个操作在不同状态上可能需要不同 inverse. 向 map 写入 key 时, inverse 必须知道此前是没有值还是有旧值, 以及旧值是什么. 因此 Cordis 不要求调用前固定一个全局逆函数, 而让 effect function 在看到当前状态并完成操作时返回此次应用专属的 inverse.

这也解释了为什么 effect 适合写成 iterator. 长时间异步初始化可能分几步获得资源, 每步完成后立即 yield 一个 inverse. 如果依赖在中途失效, runtime 停止 iterator, 只撤回已经完成的步骤. 未执行步骤没有 inverse, 已执行步骤不会因初始化未完成而泄漏.

### 2.3. 实现中的 `ctx.effect`

论文算法 1 的 `execute(callback, guard)` 驱动 effect iterator. 每次 `iter.next()` 得到一个 inverse, 就将它前置进复合恢复函数. 每步之前检查 guard, guard 失效便停止继续执行. `ctx.effect` 维护 `armed` 标志, 返回幂等 `dispose`: 第一次调用关闭 guard, 等待执行任务停在边界, 再执行已经积累的恢复; 后续调用直接返回.

组件 effect 的 inverse 又被加入父 context 的 `ctx.dispose`. 因而“创建子组件”与“写入共享 key”在撤回模型里没有特例, 都是父组件生命周期内的 effect. 这种收拢减少了分散清理入口, 但前提是所有环境修改都必须通过 context. 绕开 context 的全局变量, 原生计时器或第三方单例不受 accumulator 管理.

## 3. 响应式 coeffect 与生命周期状态机

### 3.1. Key, realm 与 value 的两层解析

Cordis 不让 key 直接指向 value. `@@isolate` 保存 key 到 realm symbol 的映射 $\rho$, `@@store` 保存 realm 到 value 的映射 $\sigma$. `ctx.get(key)` 先取 $\rho(k)$, 再取 $\sigma(\rho(k))$. 多一层 realm 允许子 context 把相同 key 重定向到独立 binding, 实现隔离域.

`ctx.intercept` 则不改变 key 解析到哪个值, 只合并访问该 key 时使用的 metadata. isolation 改变“找到谁”, interception 改变“怎样使用”. 两者通过派生 child context 实现, 丢弃 child 即恢复父视图, 不需要对父表执行反向修改.

### 3.2. Provider 身份比 value 相等更重要

Fiber 的 target 保存每个 key 对应的 provider fiber uid 元组, 并不直接保存依赖值. uid 新鲜且不复用. 即使新 provider 给出与旧 provider 深度相等的值, target 仍然变化, dependent 会重载. 相同值可能属于不同生命周期, 连接句柄和服务对象背后的资源也可能已经更换.

相反, 同一 provider 原地覆写 binding 不会触发 provider 身份变化. 需要传播替换语义的组件应撤回旧 binding 再安装新 binding. 该边界避免普通内部状态更新导致整个依赖图重载, 同时把“服务替换”表达成明确生命周期事件.

### 3.3. Inertial 状态机处理连续变化

Fiber 包含 target, committed view, state 与 inertia. `refresh` 重新计算 target. 若没有 transition 在运行, target 可满足便进入 LOADING, 不满足便进入 UNLOADING. 如果 transition 已在运行, 只更新 target, 不并行启动第二个 transition. 当前 reload 或 unload 必须完成, 结束时再根据最新 target 串联下一次转换.

这种 inertial 语义避免两个异步 teardown 或 initialize 同时修改同一 context. Reload 开始时提交依赖视图, effect iterator 每一步检查 target 是否仍等于起始值. 发生变化后停止继续初始化, 将已完成步骤的 inverse 加入 dispose, 随后进入 unload. Unload 完整执行 inverse 后, 若此时 target 又可满足, 再重新 load.

### 3.4. Provider 必须等 dependent 排空

Provider 开始卸载时先标记 UNLOADING, 从依赖解析角度立即停止提供服务, 但 binding 暂不删除. Notification 让 dependents 进入卸载, provider 等待所有受影响 dependent 的 transition 完成, 才执行自己的 dispose. 这样 dependent 的 teardown 仍可读取此前 committed 的 provider.

顺序解决了常见的关闭竞态. 如果先删除 provider, dependent 的清理代码可能无法归还连接或注销回调; 如果 provider 等待期间仍对新 dependent 可见, 又会产生新的使用者. “先离开可提供集合, 后保留资源到消费者排空”把发现状态与物理撤回分成两个时点.

## 4. 从局部机制到系统组合性

### 4.1. 独立性要求 effect 交换且不扰动结果

多个组件的 effect 交错执行时, 仅有各自 inverse 还不够. 组件 A 修改的状态如果改变组件 B 的 inverse 含义, 先撤 A 或先撤 B 可能得到不同结果. 论文定义 effect independence: 两边可达的正向变换和 inverse 需要交换, 且一方的变换不能改变另一方生成的 inverse 与 continuation.

要求按统一 context 的 observational equivalence 解释. 两个底层状态即使字节不同, 只要 context 暴露的所有操作和测试都无法区分, 就被视为相等. 这允许内部实现采用不同对象身份或表布局, 仍在公开操作层获得组合定律.

### 4.2. Coeffect 操作需要交换律

共享 key 上的操作如果顺序敏感, 不同组件交错就会破坏 confluence. 论文通过 isolation 将互不相关组件写入不同 realm, 或要求同一 coeffect 的公开操作满足交换. 典型实现可以让 key 暴露集合式注册, 每个组件增删自己的条目, 而不是让多个组件覆盖一个标量.

运行时不会证明这些交换律. 与 inverse 正确性一样, 它是 provider 作者对 key 表示的义务. 形式化定理说明满足义务后系统具有什么性质, Cordis 实现负责记录和调度, 没有动态验证任意 JavaScript 操作是否真正交换.

### 4.3. 演算证明的范围

第四章把 component 表示为包含 coeffect 需求, effect function, parent, lifecycle state 与 committed view 的 fiber. Orchestration rules 负责插入, retire 和移除, lifecycle rules 负责 begin, iterate, finish, divert, leave 与 unload. Confinement 约束组件只写自己的状态以及声明允许的共享区域.

在假设 inverse 正确, effect 独立, coeffect 交换且 orchestrator 动作有限的条件下, 论文证明 preservation, temporal composability, spatial composability, progress 与 confluence. Progress 不是说组件代码必然终止, 论文显式假设 effect iterator 和 inverse 最终返回. Confluence 也只针对相同 orchestration 动作序列, 并在 fiber 重命名与观察等价意义下成立.

## 5. Cordis 工程实现与实际边界

Cordis 把 **effect 撤销、coeffect 解析和组件生命周期** 收进同一个 runtime.

### 5.1. 三层结构

Cordis core library 直接实现 `ctx.effect`, `ctx.get`, `ctx.set`, `ctx.isolate`, `ctx.intercept` 与 fiber lifecycle. Component loader 在 core 上增加声明式配置协调和 HMR. Koishi 再把消息, 命令, 数据库与插件等领域能力构建在前两层之上. Cordis 因而是 meta-framework, 不规定 Web, ORM 或 agent 业务接口.

配置项是跨重载保持的 entry 身份, fiber 则代表一次 enablement. 禁用 entry 会 retire 当前 fiber; 重启会创建新 fiber, 不把 retired fiber 重新改回可用. 这与形式化假设一致: 已进入 accumulator 的 fiber 保持退休, 防止创建者消失以后旧 fiber 再次激活.

### 5.2. 声明式配置协调

Loader 根据配置增删和修改 entry. 普通修改可以 retire 旧 fiber, 等 dependent 卸载, 再用新 payload 或 realm 建立新 fiber. 论文还给出 realm 就地迁移优化: 当隔离映射改变而 binding 确认属于该 entry 时, 可以把 store 中的 value 从旧 realm symbol 移到新 symbol, 只通知解析视图真正改变的 fiber.

该优化依赖 delta tag 判断 context 是否继承同一隔离分支. 它缩短 reload 路径, 但必须与从头卸载再装载的最终静止状态一致. 论文以形式化 confluence 作为短路径正确性的参照, 工程上仍需测试异常中断和多 key 同时迁移.

### 5.3. HMR 处理模块依赖闭包

HMR 先将改动模块分类为 accepted, declined 与 pending, 再沿 import graph 扩展. 一个 entry 的依赖树若接触 accepted 模块, 该 entry 需要重载; 接触 declined 边界则停止向下接纳. 重载前备份模块 cache, dispose 旧 fiber, 清 cache 并 import 新模块. 失败时恢复 cache 和旧模块, 重新实例化 entry.

这套 HMR 不迁移组件内部内存状态. 旧组件的 tracked effects 被撤回, 新组件从干净状态运行. 需要跨版本保存的数据应放在更长寿命 provider 中. 与 DSU 将旧对象转换成新结构相比, Cordis 少写迁移函数, 代价是组件局部 cache 和进行中计算默认不延续.

### 5.4. Koishi 案例说明成熟度, 不构成性能评测

论文以 Koishi 插件生态作为案例, 展示 effect tracking 和 coeffect resolution 已用于实际框架. 案例能证明 API 可以承载真实插件, 配置与热重载, 也提供了从形式符号到 TypeScript 对象的对应表.

论文没有给出装卸延迟, notification 复杂度, 大规模依赖图吞吐或内存开销的量化基准. `notify` 伪代码遍历 live fibers 与 changed keys, 实际规模扩大后需要索引. 因此论文贡献主要是语义与实现结构, 不能据此判断 Cordis 相对重启进程或其他插件框架的性能优势.

## 6. 对 agent harness 的意义与限制

### 6.1. 自修改需要可恢复控制面

Agent harness 可能动态生成工具, 修改配置, 更换 memory provider 或加载子 agent 协议. 如果每次修改都重启进程, session 内状态与进行中任务会被中断; 如果直接替换代码, dependent 可能继续持有陈旧对象. Cordis 的 fiber 生命周期提供细粒度替换单位, 让 provider 退出可见性以后先排空 dependents, 再撤回资源.

这套机制不会自动判断模型生成的组件是否安全. Access control 与 sandboxing 仍需宿主系统提供. Context 可以成为权限检查的单一入口, 但组件若能绕开 context 访问文件系统, 网络或进程全局, 形式化保证不覆盖这些副作用. 对 agent 场景, capability API 与操作系统隔离仍不可缺少.

### 6.2. 服务复用与分布式边界

一个 provider 可以在新版本启动后接收新请求, 旧版本等待已有请求排空再卸载, 形成 rolling update. 这要求请求本身以 tracked effect 或可等待资源表示. 若调用跨进程, 网络断开需要映射成 coeffect withdrawal, RPC client 也要在 inverse 中关闭.

论文核心演算针对单一 context 管理下的组件. 分布式系统中的消息延迟, 分区与重复通知会破坏“一个 orchestration action 接一个”的简化假设. 将模型扩展到服务编排需要版本化事件, 幂等 transition 和明确的一致性边界, 不能仅把本地 key 换成远程发现结果.

### 6.3. 循环依赖由粒度设计解决

如果 A 依赖 B 才能激活, B 又依赖 A, 两者都会停在 INACTIVE. 论文不通过状态机猜测顺序打破循环, 而建议调整组件粒度, 提取共同 provider 或把某些依赖降为运行后可选能力. 这是空间组合性的建模要求: dependency graph 必须表达实际的启动前置条件.

版本约束同样不在当前 key 模型中自动解决. Key 主要表达能力身份, provider 与 dependent 还需在类型或 metadata 中协商版本. 如果同一 key 的接口发生不兼容修改, 仅凭 provider uid 变化只能触发重载, 不能保证新 dependent 调用正确.

### 6.4. 论文自身问题与开放变量

形式化证明依赖多项由开发者承担而 runtime 不验证的义务: atomic inverse 正确, coeffect 操作交换, effect confinement 成立, iterator 与 inverse 最终返回. 这些条件在 JavaScript/TypeScript 中无法由普通类型系统完整表达. 论文将它们清楚地列为系统边界, 但真实插件违反条件时会得到怎样的诊断与隔离, 缺少实验.

工程评估没有量化结果. VSCode Top 100 扩展统计来自 2026 年 6 月 9 日, 论文给出 87 个含可执行代码, 7 个声明非内建 extensionDependencies, 但未公开抓取脚本和完整扩展列表. Koishi 案例没有报告插件数量, 热重载成功率, 平均恢复时间或资源泄漏对照.

92 页正文的主要篇幅用于演算与证明, 实现部分使用语言无关伪代码. Cordis 实际源码版本, commit, 测试矩阵与异常注入结果未在论文文本中形成可复核基准. HMR 回滚伪代码在恢复 cache 后重新实例化旧 entry, 但外部不可逆 effect, 模块顶层副作用和新模块 import 已触发的宿主副作用是否完全撤回, 仍取决于边界纪律.

尽管存在这些限制, 论文给出了一个清晰的不变量: 组件卸载只撤回通过自身 context 登记的 effect, dependent 使用 committed provider view 完成 teardown, provider 在 dependent 排空后才撤回 binding. 这一不变量比零散的 unload hook 和事件监听更容易测试. 对本地单进程 agent harness, 它提供了把动态工具, memory 和插件生命周期收拢进统一状态机的可执行方向.

这个不变量还明确区分了“目标状态变化”和“正在执行的 transition”. `refresh` 可以随时更新 target, 却不能中断后立刻并行执行相反 transition. 当前 reload 若发现 target 变化, 先停止 iterator, 保存已经产生的 inverse, 再完整 unload; 当前 unload 若结束时发现依赖恢复, 再启动 reload. 状态变化可以高频到达, 资源操作始终串行. 这与在回调中加入延迟或重复检查不同, 顺序由 fiber 状态机直接强制.

失败路径仍需宿主实现给出明确语义. 论文扩展部分允许 FAILED state 携带 error outcome, 但算法主体更关注依赖变化和正常撤回. 如果 effect callback 在 yield inverse 之前已经修改外部状态便抛错, runtime 没有可调用的 inverse; 如果 inverse 自身抛错, 后续 inverse 是否继续执行也会影响泄漏范围. 工程实现应要求 atomic effect 先准备恢复信息再暴露修改, 并采用聚合错误或 `finally` 策略继续尽可能多地清理. 这些规则没有由演算自动推出.

Notification 的实现成本同样值得单独测量. 算法 3 对所有 live fiber 和 changed key 进行检查, 朴素复杂度随 fiber 数量与 key 数量相乘. 实际框架可以维护 `(realm,key)` 到 dependent fiber 的反向索引, 把通知限制在相关集合; 但索引本身也必须作为 tracked state 随 fiber 装卸更新, 否则会留下陈旧 dependent. 论文伪代码选择全表扫描, 优先表达语义而非给出可扩展数据结构.

Committed view 的作用接近一次 lifecycle transaction 的依赖快照. Fiber 在 reload 开始时提交 provider 集合, 整个 active 周期和 teardown 都沿该集合解析. 新 provider 到来只改变 target, 不会让正在运行的清理逻辑半途读到新对象. 等旧 transition 结束以后, 下一次 reload 才提交新 view. 这种粒度比数据库事务长, 也意味着 provider 必须容忍 dependent 在排空期继续持有旧引用.

Context tree 为权限与隔离提供结构, 但 realm 不是安全边界. `ctx.isolate` 能让同一 key 在不同子树解析到不同 binding, 适合测试实例, 租户或插件局部服务; 如果不可信代码能取得父 context 或直接访问 store, 隔离便失效. Agent harness 使用该模型时, context capability 必须按最小权限传递, 内部 symbol slot 不应暴露给普通 component.

论文与自演化 agent 的联系主要是架构推论, 尚无对应实验. 完整的自修改流程还涉及新代码审查, 版本签名, 权限批准, 持久状态迁移和失败回滚. Cordis 解决的是已获准组件进入同一 runtime 后的生命周期组合, 不负责判断模型生成的代码是否应当执行. 将两者分开有助于避免把可卸载误当成安全执行.

从维护角度看, context paradigm 还提供了统一审计面. 每项 provider 安装, dependent 激活与 inverse 执行都能关联到 fiber uid 和 entry identity. 如果实现保留 transition 事件, 管理界面可以显示组件为何 inactive, 当前等待哪个 dependent, 哪个 inverse 失败. 论文没有规定 observability protocol, 但其状态机已经给出了稳定事件来源. 对长时间运行的 harness, 这种可解释性与自动恢复同样重要, 因为操作者需要区分依赖缺失, 初始化失败和正常排空.

后续验证可以构造三类压力测试. 第一类随机改变依赖拓扑并注入初始化延迟, 检查最终 quiescent state 是否与从头加载一致. 第二类在每个 yield 和 inverse 边界注入失败, 检查资源计数是否回到基线. 第三类反复 HMR 含共享 provider 的组件树, 记录 dependent 是否读到跨版本混合视图. 这些测试分别对应 confluence, temporal composability 与 spatial composability, 能把形式定理映射成工程可观测量.

还应增加长时间稳定性测试, 反复装卸同一组件并观察 registry, listener, timer, socket 与 heap 是否持续增长. 形式上的 accumulator 只能覆盖已经登记的 effect, 泄漏曲线能发现绕开 context 的资源. 将 fiber transition log 与资源快照关联后, 可以定位哪一次 effect 没有产生 inverse, 或哪一个 inverse 执行后状态没有回到基线. 这类证据会补足论文目前缺少的量化工程评估.

验证报告还应同时记录每次生命周期转换的目标视图与已提交视图，避免只看最终资源计数而遗漏过渡期读取了错误提供者的时序问题。

### 6.5. 可撤销 effect 需要满足哪些代数条件

普通副作用可抽象成上下文变换 $f:\Gamma\to\Gamma$. 可撤销 effect 还返回逆操作:

$$
e:\Gamma\to\Gamma\times(\Gamma\to\Gamma).
$$

在状态 $\gamma$ 上应用 $e$ 得到新状态 $\gamma'$ 与恢复函数 $u$. 最基本要求是 $u(\gamma')$ 与原状态 $\gamma$ 在可观察行为上等价. 这里用等价而非逐字节相同很重要:定时器 ID、对象地址和内部版本号可能改变,只要组件之外无法观察差异,恢复仍可成立.

逆操作与 effect 的具体应用实例绑定. `on(event, handler)` 的 inverse 必须移除同一个 handler;`provide(key, value)` 的 inverse 必须撤回这一次 provider,不能删除后来覆盖同 key 的其他 provider. 因此只保存一个通用 `remove(key)` 不够,运行时要保留身份或版本.

若 effect $e_1,e_2$ 依次应用,撤销顺序必须反向:

$$
(e_2\circ e_1)^{-1}=e_1^{-1}\circ e_2^{-1}.
$$

这就是 accumulator 使用栈式回收的原因. 插件先创建服务,再注册依赖该服务的监听器;卸载时先移除监听器,再销毁服务. 正向顺序撤销会让监听器短暂指向已销毁对象.

逆元条件也揭示无法安全包装的操作. 给外部用户发送邮件、提交转账、删除远程记录,通常没有真正逆操作. 可以登记补偿动作,例如再发撤回通知,但补偿后的世界不等价于从未发生. Cordis 的保证只覆盖能够由 context 中介并提供 inverse 的 effect,不能把不可逆业务动作变成数学可逆.

### 6.6. 异常发生在 effect 中间时怎样恢复

一个插件加载往往包含多项 effect. 如果前三项成功、第四项抛错,运行时需要撤销前三项,不能等插件完整激活后才登记 disposer. 安全模式是每项 effect 成功后立即把 inverse 压入 accumulator;后续失败时对当前栈执行 unwind.

设已提交 effect 序列为 $e_1,\ldots,e_k$,第 $k+1$ 项失败,恢复状态为

$$
\gamma_{restore}=u_1(u_2(\cdots u_k(\gamma_k)\cdots)).
$$

执行顺序从 $u_k$ 到 $u_1$. 如果某个 inverse 自身抛错,简单停止会留下后续资源. 更稳健的 runtime 应继续尝试其余 disposer,聚合错误,最终报告哪些资源未恢复. 论文的形式模型通常把操作视作按规则完成,真实 JavaScript 异常需要实现层策略.

异步 effect 还会出现取消竞态. 插件启动网络请求后立刻卸载,请求 promise 可能稍后完成并注册新资源. inverse 必须取消请求,或在 continuation 中检查 fiber 是否仍属当前 activation epoch. 只在卸载时清理已有句柄,无法阻止迟到回调重新污染 context.

测试可故意在每个注册点之后注入异常,比较 context 快照与资源计数. 再随机延迟异步完成顺序,检查卸载后的 callback 是否还能产生 effect. 这种 fault injection 比只测正常 load/unload 更接近可撤销性主张.

### 6.7. Effect 所有权比 disposer 形式更关键

很多框架也返回 cleanup function,区别在于 cleanup 常由插件作者手动保存和调用. 一旦某条分支忘记登记,卸载就泄漏. context paradigm 把“谁创建 effect”和“谁负责撤销”绑定到当前 component/fiber,运行时统一收集 inverse.

所有权必须沿异步调用传播. 插件 A 调用服务 B,B 内部注册定时器,这个定时器应归谁? 若它是 B 的长期内部状态,应随 B provider 生命周期;若是 A 请求触发的订阅,应随 A 的 scope. 单靠调用栈无法长期表达所有权,需要显式 context 或绑定过的 service method.

错误归属会造成两类问题. 资源归给 provider,B 卸载时会终止所有消费者任务;资源归给根 context,A 卸载后又无法清理. Cordis 的 caller binding、派生 context 与 effect scope 正是在解决这类边界. 论文的抽象 context 把操作中介化,实现需保证 API 不轻易逃逸到裸全局对象.

反例是插件直接调用 `setInterval`、`process.on` 或裸 socket,绕开 `ctx.effect`. 框架无法看见它,任何定理也无法自动撤销. 因而“插件可卸载”是一条编程纪律与运行时机制共同保证的性质,不是安装 Cordis 后任意代码都天然安全.

### 6.8. 幂等 inverse 让重复清理更稳健

理想生命周期只调用一次 disposer,现实中错误恢复、父 scope 销毁和显式卸载可能同时触发. inverse 若不幂等,第二次调用可能删除别人的资源或抛出误导错误. 常见做法是在 disposer 内保存 `disposed` 状态,重复调用直接返回.

幂等可写为

$$
u\circ u\simeq u.
$$

它不属于“先 effect 后 inverse 恢复”的同一条件,却提高组合安全. 父组件递归清理子组件时,子组件可能已经因依赖消失进入停用;两条路径最终汇合,幂等 disposer 可以吸收重复请求.

幂等也不能掩盖所有权错误. 如果 inverse 以 key 删除当前 provider,重复执行第二次可能删掉新 provider;即便函数不抛错,语义已经破坏. 正确实现要持有 registration token,只撤回自身实例,再让 token 的 dispose 幂等.

### 6.9. 可交换 effect 的条件比“互不报错”严格

两个组件的 effect 若要空间交错而互不扰动,需要在观测等价下满足

$$
e_A\circ e_B\simeq e_B\circ e_A.
$$

若 A 注册事件监听器,B 注册另一个监听器,注册表结果可能与顺序无关;但事件触发顺序若可观察,两个 effect 仍未必交换. 如果 A、B 都覆盖同一 service key,最终 provider 显然取决于顺序.

context 可以通过命名空间、优先级或多值集合把冲突操作改写成更可组合形式. 事件监听器存为集合,服务提供者用 realm 隔离,interceptor 明确排序规则. 顺序依然存在,只是从偶然的加载时机上移到了可以检查的接口语义中.

论文以 context 中介和观测等价建立独立组件的交错性质. “独立”包含前提:组件不争夺同一不可交换位置,也不通过框架外共享状态通信. 两个插件同时写同一文件或修改同一全局变量,不会因放进 component calculus 就自动交换.

### 6.10. Coeffect 描述组件需要什么环境

effect 记录组件改变环境的部分,coeffect 则描述执行所需上下文. 设组件需求为谓词 $R(\gamma)$,当当前 context 满足需求时组件可激活. 一个简单需求可能是 `database` 与 `logger` 同时存在:

$$
R(\gamma)=\operatorname{has}(\gamma,db)\land\operatorname{has}(\gamma,logger).
$$

provider 增删会改变 $R$ 的真值,运行时据此启动或停用 dependent. 这比启动时做一次 DI 多了时间维度:依赖不是构造完成后永远存在,它可以被替换、热更新或暂时消失.

需求也可包含 optional 和 conditional dependency. 组件有 cache 时使用 cache,没有时仍能直连数据库;这种关系不应让整个组件随 cache 消失而停用. 若把所有访问过的 service 都声明为强 coeffect,生命周期会过度耦合;若漏掉强依赖,组件会在 provider 消失后持有悬空引用.

合理粒度取决于不变量:在一次 activation episode 内必须持续存在的能力应进入强 coeffect,仅在某个请求瞬间查询的能力可以通过动态 lookup 处理. 论文给出形式条件,具体系统仍要由组件作者定义正确需求.

### 6.11. Key、realm 与 provider identity 解决三种歧义

key 回答“需要哪类能力”,realm 回答“在哪个作用域查找”,identity 回答“当前具体由谁提供”. 只比较 value 是否相等会漏掉 provider 替换:两个数据库 wrapper 可能深度相等,生命周期和连接池却不同. dependent 需要先对旧 provider 停用,再绑定新 provider.

realm 类似词法作用域. 子 context 可以覆盖父 context 的同名 service,兄弟组件各自看到局部 provider. 查找规则若沿祖先链进行,最近 provider 获胜. 当局部 provider 卸载,dependent 是否自动回退到父 provider,取决于 coeffect 解析与状态机.

这会产生一次身份转换 $p_{local}\to p_{parent}$. 即便 service API 相同,旧 activation 中保存的资源可能依赖 local provider,不能仅替换字段继续运行. 安全路径是撤销 dependent 的旧 effects,再用 parent provider 新激活. 这正是 provider identity 比 value equality 更重要的原因.

### 6.12. Reactive coeffect 的状态机为何需要惯性

依赖变化可能连续到达. provider A 正在卸载,替代 provider B 已注册;dependent 的 deactivate 尚未完成,新的 activate 请求又出现. 如果每次事件立即并发执行,同一组件会同时处于两个 activation,旧 disposer 可能清掉新资源.

状态机至少要区分 inactive、activating、active、deactivating,并保存目标状态. “惯性”意味着当前转换完成后再向最新目标推进,中间重复变化可以合并. 例如 active 状态收到缺依赖,进入 deactivating;此时依赖恢复,目标改回 active,但仍先完成旧 episode 清理,随后重新激活.

可把实际状态记为 $s$,目标可用性为 $d\in\{0,1\}$. 实际转移还要经过中间状态与失败分支:

$$
(s,d)\xrightarrow{complete}(s',d),
$$

每次完成后重新读取最新 $d$. 这避免取消一半的 cleanup,也避免多个 start 交错. 代价是快速抖动时组件可能经历额外一次重启.

防抖不能替代状态机. 延迟几十毫秒可以合并常见配置抖动,但无法保证异步 transition 原子性. 正确性来自 episode 隔离与串行提交,防抖只优化频率.

### 6.13. Provider 卸载必须等待 dependent 排空

若 provider 先销毁连接池,dependent 的 cleanup 还需要用连接提交或取消事务,清理会失败. 正确次序是沿依赖图反向停用消费者,确认它们 effects 全部撤销,再撤销 provider.

依赖边 $A\to B$ 表示 A 需要 B. 激活按拓扑序从 B 到 A,停用按反拓扑序从 A 到 B. 对链 $A\to B\to C$,启动为 $C,B,A$,卸载为 $A,B,C$. 这与单组件 effect 的 LIFO 原则在系统层同构.

若 dependent cleanup 卡住,provider 卸载就会阻塞. runtime 需要超时和强制策略,可组合性保证与可用性在此冲突. 强制销毁 provider 能恢复系统推进,却可能让 dependent 残留;无限等待保持语义,又可能让热更新永久挂起. 论文形式语义不包含真实外部系统的任意延迟,实现需要明确失败政策.

### 6.14. 循环依赖为何无法由拓扑排序解决

若 A 强依赖 B,B 又强依赖 A,两者在 inactive 状态都等不到需求满足. 组件边界没有提供启动基点,调度器因而无从选出合法的第一步. 把两者同时强制激活会让任何一个先执行时看到缺失服务.

常见拆法是提取接口或基础 provider C,让 A、B 都依赖 C;或把一侧改成惰性 lookup/事件订阅,不作为 activation 前提. 也可以先提供 capability shell,激活后再填实现,但消费者必须容忍未就绪状态,语义更复杂.

循环检测应给出完整路径,而非只报某个 key 缺失. 动态 provider 覆盖还可能使循环只在特定配置出现. 配置切换前先计算目标依赖图,能在破坏当前运行实例之前拒绝非法状态.

形式系统通常通过良构条件排除或约束循环. 工程上所谓“解决循环”实际是重新定义依赖粒度,不能用重试等待让逻辑矛盾消失.

### 6.15. 配置 reconciliation 是状态差分问题

声明式配置描述目标组件树,运行时持有当前树. 更新时需要计算保留、添加、删除与替换集合. 如果每次配置变化都全量重启,语义简单但中断大;增量 reconciliation 可以只触碰变化子树,要求 identity 稳定.

设当前节点集合为 $C$,目标为 $T$,按稳定 key 匹配. $C\setminus T$ 需卸载,$T\setminus C$ 需加载,交集节点若配置相等可复用,否则根据插件是否支持热配置决定 update 或 replace. 子节点顺序变化若不影响语义,不应误判为全部替换.

配置值相等也未必能复用. 插件模块代码已经 HMR 更新,identity/version 改变,需重建;反过来,对象引用变化但规范化配置相同,不应重启. 因此 diff 要基于语义 key、规范化配置和实现版本三项.

reconciliation 失败时还要回滚目标. 新组件加载一半抛错,当前稳定树是否保留? 可先在隔离 scope 中构建目标子树,满足 coeffect 并完成 activation 后再切换;资源冲突使并行构建不可行时,只能停旧启新并准备恢复旧配置.

### 6.16. HMR 不只是重新执行模块

模块更新可能改变导出代码、依赖声明和子组件. 只清 require cache 再运行新函数,旧监听器和 service 仍在,会产生重复注册. Cordis 把旧 module 对应 component 卸载,依靠 inverse 清理,再加载新版本.

依赖闭包决定更新范围. B 导入 A 的普通函数,A 更新后,B 的闭包可能仍持有旧函数;只重载 A 不够. 另一方面,如果 B 仅通过稳定 service key 动态访问 A,provider 替换可触发 B 生命周期,无需按静态 import 全部重载. HMR 系统需要同时理解模块依赖和运行时 coeffect.

状态迁移是另一边界. 插件内存中维护会话,卸载会清空;希望热更保留状态时,要把状态放入稳定外部 service,或显式导出迁移函数. 自动保留所有对象会把旧代码闭包一并留下,破坏真正更新. 可撤销 effect 保证旧副作用退出,不保证业务状态自动跨版本转换.

### 6.17. Context 隔离与拦截如何影响观测等价

子 context 可以限制 service 可见性或添加 interceptor. 两个组件在不同 realm 注册同名 key,彼此不观察,它们的 effect 更容易交换. 隔离因此不仅是组织结构,也是证明独立性的手段.

interceptor 会改变操作语义. 日志 interceptor 添加前缀通常保持核心结果,权限 interceptor 可能拒绝 effect,缓存 interceptor 可能跳过 provider 调用. 组合多个 interceptor 时顺序可观察,需要显式规定嵌套规则:

$$
I_1(I_2(op))\ne I_2(I_1(op)).
$$

论文的 context paradigm 要求 effect 与 coeffect 都经 context 中介,这样拦截和隔离发生在统一边界. 如果组件拿到裸 service 后长期保存,后续 interceptor 更新可能无法作用于已有引用. caller-bound proxy 或每次 lookup 能保持中介,代价是额外间接层.

### 6.18. 事件系统也必须纳入生命周期

插件注册事件 listener 是典型 effect,对应 inverse 为移除 listener. 事件触发时 listener 可能返回 disposer、启动异步任务或注册更多 effect,这些派生动作仍应归属原 component episode. 否则插件卸载只移除入口 listener,已启动任务继续运行.

事件的并发语义也会影响卸载. 正在执行的 handler 遇到 dispose,可以等待完成、发送取消信号或允许其结束但禁止提交新 effect. 三种策略对应不同一致性和延迟. 对修改共享状态的 handler,简单放任执行可能在卸载后写回旧值.

优先级和 veto 让 listener 顺序变成可观察接口. 两个独立日志 listener 可交换,两个都能阻止操作的策略 listener 则需要确定顺序. “事件注册可撤销”与“事件处理可交换”是两项不同性质,不能混在一个 composability 标签下.

### 6.19. 组件树不是依赖图

组件树表达所有权:父组件卸载时递归卸载子组件. 依赖图表达能力需求:一个组件可依赖树外 provider. 两种关系可能方向不同,若混为一棵树,很难表达共享 service 和局部 scope.

父子关系的清理遵循后序,依赖关系的清理遵循反拓扑. 当两者叠加,运行时需要满足所有约束. 例如父 P 拥有子 A,A 依赖外部 B;卸载 P 先清 A即可,卸载 B 则先触发 A 停用但不一定删除 A 的配置节点,A 可留在 pending 等待新 provider.

这一区分解释了 provider 消失后 dependent 为什么可能仍“存在”. 它的声明与身份保留,activation episode 被撤销;provider 回来后重新激活. 若把停用等同删除,配置 reconciliation 会丢失待恢复组件.

### 6.20. Pending 是合法状态,不等于错误

声明式系统启动时依赖可能尚未装载,组件进入 pending. 后续 provider 出现便自动激活. 这消除人为规定全局加载顺序的需求,允许插件包独立声明能力.

但永久 pending 也可能代表拼写错误或缺失配置. runtime 应提供可观测诊断:缺哪些 key、在哪个 realm 查找、有哪些近似 provider、从何时开始等待. 只保持沉默会让“响应式依赖”变成难排查黑箱.

可设置健康策略,例如启动宽限期内 pending 为正常,超过阈值降级健康状态;optional 组件可保持不告警,关键组件则阻止服务 ready. 这些属于产品层政策,不改变 calculus 中 pending 的合法性.

### 6.21. 组件替换要避免双写与空窗

服务 provider 从 A 更新到 B,有两种基本顺序. 先停 A 再启 B 会出现无 provider 空窗,dependent 全部停用;先启 B 再停 A 会短暂双 provider,若 key 唯一可能冲突. 选择取决于服务是否允许并存与状态迁移.

可使用 shadow activation:B 在隔离 context 中初始化,完成后以原子方式切换 binding identity,dependent 再按新 provider 重启,最后销毁 A. 外部端口、文件锁等资源无法同时占用时,shadow 失败,只能接受短暂停机.

数据库连接 provider 替换还涉及在途请求. 等待旧请求 drain 后切换能减少失败,却延长更新;立即取消可快速收敛,调用方需重试. 形式上的 provider identity change 给出生命周期顺序,具体一致性协议由 service 定义.

### 6.22. Agent harness 为什么特别需要时间组合性

Agent 运行时会动态注册工具、模型 adapter、approval policy、session hook 与 UI. 开发过程中这些组件频繁热更,长任务中也可能按 workspace 或用户切换. 若一次卸载留下旧工具,模型会看到重复 schema;留下旧 hook,一条消息被处理两次;留下旧 policy,权限判断可能走过期规则.

可撤销 effect 把每个注册动作与 episode 绑定,组件退出时一并撤回. 这比要求每个插件作者记住所有全局 registry 更可靠. 尤其 Agent 插件常在异步初始化后才决定注册哪些工具,手写 cleanup 很容易漏掉条件分支.

不过 tool 执行本身可能不可逆. context 能撤销“工具已注册”,不能撤销工具已经删除文件或调用外部 API. Agent 的动作安全仍需 sandbox、审批与幂等业务接口. 框架生命周期和任务世界状态是两层可逆性.

### 6.23. Agent harness 为什么特别需要空间组合性

一个工具可能需要 workspace、shell、权限策略和日志服务. 静态 import 会让工具绑定具体实现,手动维护启动顺序又会快速增加组合数量. coeffect 让工具声明能力集合,只有当前 realm 全部满足才激活;换本地 shell 为远程 sandbox 时,dependent 随 provider identity 更新.

这种机制适合 profile. 同一 agent loop 可在 CLI context 获得终端 UI,在 server context 获得 Web transport;核心组件只依赖抽象 key. 测试中注入 fake model 和 scripted tool,无需修改生产插件.

依赖声明若过粗,整个 agent 因非关键 telemetry 缺失而停用;过细则组件内部到处动态判空. 设计 key 时应围绕稳定能力边界,而不是为每个函数建 service. 论文提供组合纪律,优秀 API 粒度仍来自领域设计.

### 6.24. 自修改系统的安全边界

论文把 self-evolving agent harness 作为动机之一. Agent 生成或修改插件后,运行时若能隔离加载、检查 coeffect、记录 effects 并在失败时撤销,比直接修改单体进程安全. 新组件出错可退回旧配置,无需重启整个 harness.

可撤销性不等于代码可信. 恶意插件可绕过 context 读文件、联网或修改进程全局;类型声明也不能阻止运行时攻击. 要让自修改安全,仍需进程/容器隔离、权限能力、签名来源和资源限额. Cordis 的 context 是组合控制面,不是系统调用沙箱.

更现实的流程是生成候选插件,在隔离 realm 与测试依赖中激活,运行契约测试,再提升到生产 scope. promotion 本身作为配置 effect,失败时回滚. 论文的机制支持这条路径,没有给出完整的 autonomous self-evolution 安全证明.

### 6.25. 单进程语义不能直接外推到分布式事务

Cordis 的 inverse 在同一 runtime/context 内管理资源. 如果 provider 是远程微服务,撤销本地 binding 不会撤销已经提交的远程写入. 网络分区还会让“provider 不可用”与“消息延迟”难以区分.

分布式补偿常用 saga:每个步骤提供补偿动作,失败时逆序执行. 它与 revertible effect 形式相似,但只能达到业务补偿,未必恢复原世界. 两个服务间还需要持久日志、幂等 key 与重试,内存 accumulator 在进程崩溃后会丢失.

因此论文结论应限制在其 context calculus 与实现假设. 把 Cordis 用作分布式 harness 的本地组件内核可行,跨进程一致性要另加协议. “每个 effect 有 inverse”不能替代两阶段提交、saga 或事件溯源.

### 6.26. 崩溃恢复与正常卸载是两类问题

正常卸载时进程活着,accumulator 可以逐项执行 inverse. 进程崩溃时内存状态消失,disposer 无法运行. 临时文件、子进程、租约和远程注册可能残留. 若系统要求崩溃后恢复,必须把关键 effect 日志持久化,或依赖带 TTL 的外部资源.

重启时可读取 write-ahead log,找出已应用但未撤销的 effect,执行恢复. 可 effect function 与 inverse 若包含不可序列化闭包,无法直接持久化,需为关键资源定义稳定 ID 和恢复协议. 这超出一般 TypeScript disposer 的表达范围.

Agent harness 的 session log 可以持久化对话与工具结果,不等于持久化所有框架 effects. 子进程、端口和文件锁需要操作系统层清理. 论文重点是动态组合的正常运行语义,没有证明 crash consistency.

### 6.27. 形式证明中的观测集合决定结论强弱

两个状态是否等价取决于 observer 能看什么. 若 observer 只能通过 context API 读取 service,内部 registration 顺序可能不可见;若能读取全局对象、时间或日志顺序,更多差异会暴露. 缩小观测集合更容易证明等价,也更依赖组件遵守中介纪律.

例如两个 effect 都写日志,最终 service map 相同,但日志顺序不同. 如果日志属于可观察结果,它们不交换;若日志被视为调试痕迹,可忽略顺序. 论文的定理必须连同定义的 observational equivalence 阅读,不能简化成任意现实副作用都可自由重排.

在 Agent 中,工具列表顺序可能影响 prompt token 与模型选择,即便它在传统 registry 中被当作集合. 因而把工具注册定义为交换操作前,要规范序列化顺序,例如按稳定 key 排序. 否则组件加载顺序会通过 prompt 泄漏给模型.

### 6.28. 五类反例可以检验系统是否真可组合

第一类是重复装卸一千次,观察 listener、timer、heap 与 tool registry 是否回到基线. 第二类是依赖抖动,在 activate/deactivate 中随机延迟,检查是否出现双 activation. 第三类是 provider 替换,让新旧 value 相等但 identity 不同,确认 dependent 仍正确重绑.

第四类是交错加载:枚举独立插件的加载顺序,比较最终可观察状态和卸载后的基线. 第五类是异常注入:每个 effect 后抛错、每个 inverse 中抛错、异步完成后抛错,检查错误聚合与剩余资源.

这些测试比“插件能热更新一次”严格. 时空可组合性是对任意允许交错和生命周期变化的闭包性质,单条 happy path 只能证明样例运行. 属性测试与模型检查可以自动生成操作序列,对照一个简化语义模型.

### 6.29. Koishi 案例能证明成熟使用,不能证明性能更优

论文以 Koishi 大规模插件生态说明该范式经历真实应用. 这能支持 API 可用性、机制能承载复杂生态以及多年演化的经验价值. 它没有对照组,无法回答换成另一套 DI/插件框架会快多少、少多少 bug.

采用量也受社区、文档和历史兼容影响,不能纯归因于 effect/coeffect 理论. Cordis v4 的形式化与 Koishi 实际使用版本之间还存在版本边界,论文自身对此有限制说明. 因而案例属于外部有效性证据,不是受控性能实验.

更强评估可选一组真实插件变更,分别用 Cordis 与传统手动 cleanup 实现,统计代码量、泄漏率、更新中断和故障恢复;也可在同一实现上关闭响应式 coeffect,比较配置重排复杂度. 论文没有给这类数据,这是明确开放项.

### 6.30. 理论模型省略了哪些工程变量

形式 calculus 通常抽象掉墙钟时间、内存、线程、网络与随机失败. effect 在规则中一步完成,实现中可能跨多个 await;coeffect change 是离散事件,现实 provider 可能处于半健康状态;context value 被视为受控位置,JavaScript 对象却可从引用逃逸.

类型系统也有边界. TypeScript 类型编译后消失,第三方插件可用 `any` 绕过 key 契约. 运行时 schema、版本协商和 capability negotiation 仍需额外机制. 形式良构不等于 ABI 兼容.

性能方面,每次 context change 触发多少 dependent 重评估、深依赖图如何增量更新、HMR 大闭包的停机时间,都需要复杂度和基准. 论文主要证明语义性质,工程章节展示实现与案例,没有系统吞吐/尾延迟曲线.

### 6.31. 一个可操作的验证矩阵

时间维度记录资源基线、重复卸载、异常恢复、异步迟到与崩溃残留. 空间维度记录缺依赖 pending、provider 新增激活、identity 替换、依赖消失停用和循环诊断. 交错维度随机排列独立 component 操作,比较观测等价.

配置维度覆盖节点新增、删除、重排、配置等价、实现版本更新与失败回滚. HMR 维度覆盖静态 import 闭包、运行时 service 依赖和状态迁移. Agent 维度再加 tool schema 稳定、approval policy 替换、在途工具调用与 session 连续性.

每次 transition 记录 component ID、epoch、目标状态、依赖 identity、提交 effects 和 inverse 结果. 只记录“loaded/unloaded”不足以定位竞态. 日志本身应有界,避免观测机制成为新的泄漏源.

性能测试要把正确性与代价同时报告:每秒 context mutation、依赖传播延迟、组件树规模、内存开销和更新期间服务空窗. 这样才能判断语义保证在目标 harness 规模下是否实用.

### 6.32. 论文自身问题与研究边界

论文最扎实的贡献是把 effect/coeffect 从编译期概念提升为运行时组件机制,给出统一 context、component calculus 和相应 metatheory,并以 Cordis 落地. 形式部分回答“在假设满足时为什么能组合”,实现部分回答“TypeScript 框架怎样承载这些抽象”.

不足首先在经验评估. Koishi 案例展示规模与采用,缺少受控对照、故障注入、长时泄漏和性能曲线. 其次是版本映射:成熟生态与论文形式化实现并非完全同一版本,哪些 theorem 前提由生产代码逐项满足仍需更细对应.

第三是外部 effect. 文件系统、网络服务、子进程和不可逆业务动作只能部分纳入 disposer;进程崩溃、分布式失败与恶意插件不在核心保证内. 第四是观测等价依赖 context 中介,直接全局访问会逃逸. 第五是动态依赖图的复杂度、抖动策略和超时政策主要留给实现.

这些边界不会削弱论文的核心逻辑,却决定它能解决哪类问题. 对单进程、长期运行、频繁装卸插件的 harness,可撤销注册与响应式依赖非常贴合;对跨服务事务和不可信代码执行,它只能作为局部组合内核,还需要持久化协议与安全隔离.

### 6.33. 从论文到 DeepSeek Harness 的准确关系

DeepSeek Harness 采用 Cordis 组织模型、工具、会话、策略和接口等插件,论文则给 Cordis 范式的形式基础. 因此论文能解释 harness 为什么强调“一切皆插件”、为何卸载要撤销 effects、为何服务依赖驱动生命周期. 它不描述模型训练算法,也不证明某个 Agent benchmark 分数.

Harness 的任务状态与 Cordis context 也应分开. session log 记录对话和工具事件,component runtime 记录当前插件及资源. 重新加载 UI 插件不应改写 session,卸载 workspace provider 可能让相关工具 pending,却不自动撤销工具已对仓库做出的修改.

最有价值的联系是控制面可替换. 一个长任务进行中,模型 adapter、tool bundle 或展示层可以按明确 lifecycle 更新,而不是重启单体进程并丢失全部会话. 能否在具体实现中无缝完成,仍取决于在途调用、状态迁移和版本契约.

### 6.34. 最终可保留的核心判断

时间组合性要求组件退出后撤回由它拥有且经 context 登记的 effect. 空间组合性要求组件声明 coeffect,并在 provider 身份变化时按生命周期重新求值. 统一 context 让“提供服务”既是一项可撤销 effect,又会改变其他组件的 coeffect 满足情况,两条轴因此闭合.

这个闭环的力量来自严格边界:effect 有真实 inverse,所有权不逃逸;dependency 声明覆盖 activation episode 的必要条件;独立组件操作在规定观测下可交换;provider 卸载等待 dependent 排空. 少任何一项,框架仍可工作,形式保证却不再完整.

对 Agent harness 而言,它解决的是运行时结构怎样安全变化,不负责决定模型下一步推理,也不让外部工具动作自动可逆. 把控制面组合性、任务世界状态和代码安全分层,才能准确使用这套范式. 论文提供了一套很强的局部语义,后续工作需要用故障注入、性能测量和跨进程协议扩展它的经验与系统边界.

### 6.35. Twisted composition 为什么按相反方向组合 inverse

一个 revertible transformation 可写成 $(f,u)$,正向部分 $f$ 改变 context,逆向部分 $u$ 恢复. 两个变换组合时,正向按 $f_2\circ f_1$,逆向按 $u_1\circ u_2$,方向相反. 论文将这种结构形式化为 twisted composition,它把常见 cleanup stack 提升成代数对象.

结合律很关键. 三个 effect 无论先把前两个组合还是后两个组合,最终正向变换和逆向顺序都一致:

$$
((f_3,u_3)\star(f_2,u_2))\star(f_1,u_1))
\simeq(f_3,u_3)\star((f_2,u_2)\star(f_1,u_1)).
$$

有了结合律,组件可以把子组件的一组 effects 当成一个 effect 再组合,无需展开内部清理细节. 单位元是“不改变 context,dispose 也不做事”的空 effect. 这使 effect accumulator 具备模块化结构.

逆操作通常只要求对实际到达的后状态恢复,未必是全状态空间上的双射. 注册 listener 的 inverse 只需在含该 registration token 的状态上定义. 因而它更接近部分逆或基于 provenance 的撤销,并非任意函数都存在数学逆函数.

### 6.36. Provenance 防止撤销覆盖别人的更新

考虑 A 提供 service `x=1`,B 随后替换为 `x=2`,此时卸载 A. 如果 A 的 inverse 简单执行 `delete x`,B 的 provider 也被删除. 若 inverse 恢复 A 加载前的值,同样会覆盖 B. 正确撤销必须知道当前 binding 是否仍由 A 的 registration 拥有.

可以为每次 effect 生成唯一 token $r$,context 中保存 $(key,r,value)$. inverse 只删除 token $r$ 对应项,解析层再根据剩余 provider 决定可见值. 多 provider 结构把“撤销我的贡献”与“恢复整个位置”区分开.

这种 provenance 也适用于 event listener、middleware 和配置片段. 仅按函数或值相等删除会误伤两个内容相同但所有者不同的注册. identity token 是实现可撤销组合的基础数据,不是附加调试信息.

若 effect 修改不可分割的普通对象字段,没有独立 contribution 可删,组件间就会冲突. 可以改为 immutable layer、patch stack 或由 context 提供受控 update. 框架 API 越鼓励带 provenance 的增量注册,越容易满足论文假设.

### 6.37. 读写集合可以近似判断组件独立性

对 component A,定义 effect 写集合 $W_A$ 与 coeffect 读集合 $R_A$. 两组件若满足

$$
W_A\cap(R_B\cup W_B)=\varnothing,
\qquad
W_B\cap R_A=\varnothing,
$$

它们在简单状态模型下互不干扰. 现实 context 操作更丰富,这个条件仍可作为静态或运行时冲突检测的近似.

service key 提供天然读写标签:provide 写 key,inject 读 key. event 名称、配置路径和 interceptor channel 也可加入集合. 文件、端口与外部资源若绕过 context,集合分析看不见,再次说明中介边界的重要性.

过度保守的冲突检测会阻止合法并发. 两个 listener 都写同一事件集合,实际注册操作可交换;两个计数器都做可交换加法,写同一 key 也未必冲突. 更精确模型要为操作标注代数性质,例如 set union 是交换幺半群,覆盖赋值则不是.

### 6.38. Snapshot rollback 为什么不足以替代 inverse

一种直觉方案是在加载组件前复制整个 context,卸载时恢复 snapshot. 这会抹掉组件加载后其他独立组件的合法更新. 若 snapshot 时 `x=0`,A 改 `a`,随后 B 改 `b`,恢复整份 snapshot 会连 B 一起回滚.

增量 inverse 只撤销 A 的 contribution,能与 B 的变化交错. 它的代价是每种 effect API 都要定义撤销语义,不能任意修改共享对象. snapshot 对小型隔离事务仍有用,全局动态系统则需要 provenance 或持久数据结构做精细 rollback.

数据库 MVCC 用版本隔离并发事务,与 context contribution 有相似直觉,但 Cordis component 生命周期可能持续很久,不能一直持有全局快照. 长生命周期更适合登记具体资源句柄并逐项清理.

### 6.39. Effect cleanup 的顺序需要跨子组件传播

父插件加载子插件后又注册依赖子服务的 hook,卸载父插件时应先清 hook,再卸载子插件;若父先注册资源、子再依赖父资源,顺序又由实际 effect 栈决定. 单纯“所有子组件先卸载”未必覆盖任意交错.

统一 accumulator 可记录真实提交顺序. 每个嵌套 scope 的 effects 组合成一个 disposer,父栈把它视为原子项. 只要子 disposer 内部也逆序,层级组合保持正确. 这正是结合律给工程实现的好处.

异步并行加载打破单一提交顺序. 两个 effect 同时开始,完成时间决定 registration 顺序;如果它们不交换,结果具有调度依赖. runtime 可禁止同 scope 的非交换并发,或为提交设置确定序列. 论文的交错定理依赖独立性,不能用来合理化任意竞态.

### 6.40. Reactive dependency 与观察者模式的区别

观察者模式让 listener 收到“service changed”事件,如何停旧、启新、处理并发由每个 listener 自己写. reactive coeffect 把需求声明、满足判断和生命周期 transition 放进 runtime,dependent 的业务函数只在满足条件的 episode 内运行.

这减少重复状态机,也收紧执行模型. 某些组件希望在依赖缺失时降级服务,某些希望继续处理已有请求,统一 deactivate 语义未必合适. Cordis 需要 optional injection、局部 scope 或更细 component 拆分表达差异.

事件通知通常是瞬时信号,coeffect 表示持续环境条件. 丢失一条事件可能让 listener 不同步;coeffect resolver 可从当前 context 重算,天然具有 level-triggered 特征. 组件恢复后无需重放所有 provider 事件,只需读取当前 identity 集合.

### 6.41. Provider 健康状态是否属于 coeffect

service 注册存在不等于可用. 数据库对象还在 context,连接可能已经断开;模型 adapter 已提供,远程 API 正在限流. 若 coeffect 只检查 key presence,dependent 保持 active,请求时才失败.

可以让 provider 在不健康时撤回 binding,触发 dependent 停用;也可把 health 作为响应式 value,让 dependent 自行降级. 前者生命周期清晰,短暂抖动会造成大规模重启;后者更灵活,把状态机分散给消费者.

一种分层设计是 capability identity 稳定,内部有 health stream;只有确定不可恢复或版本替换才撤回 provider. dependent activation 依赖 capability presence,单次请求通过 health/错误处理选择重试. 论文 coeffect 机制能表达两种方案,不会替领域自动选择粒度.

### 6.42. 可撤销配置与业务迁移不同

修改插件配置可以通过卸载旧实例、加载新实例撤销. 若新实例运行期间写入数据库 schema 或转换用户数据,回滚代码不等于回滚数据. 业务迁移需要版本化、备份和向后兼容.

配置 reconciliation 可保证控制面回到旧组件树,却无法保证外部数据仍适合旧版本. 蓝绿切换前应检查 schema compatibility,把不可逆 migration 与普通 hot reload 分离. Agent 自动更新插件时尤其不能把代码 disposer 当成数据事务.

同理,工具调用产生的 session 事件通常是 append-only 事实. 卸载工具插件只撤销注册,不应删除历史事件. 若重放 session,旧工具结果需按当时 schema 解析或保留原始 payload. 生命周期可逆与历史可追溯是互补设计.

### 6.43. 版本化 service contract 避免隐式不兼容

provider identity 替换会让 dependent 重启,但新 provider 若 API 语义不兼容,重启仍会失败. key 只表达名字,还需要 contract version 或 capability negotiation. `storage@2` 与 `storage@1` 可以使用不同 key,或 provider 声明支持范围.

结构类型检查只能发现方法签名差异,无法发现“timeout 单位从秒变毫秒”这类语义变化. 契约测试应由 provider 和 consumer 共享,在目标配置提交前运行. 动态组合越自由,接口治理越重要.

同时支持多版本时,realm 可局部绑定不同 provider,让旧插件逐步迁移. 若全局 key 原地升级,所有 dependent 同时重启,爆炸半径更大. Cordis 的作用域机制提供技术基础,版本策略仍需生态约定.

### 6.44. Deadlock 可能出现在异步停用链

A 的 cleanup 等待 B 提供的 flush,B 的 cleanup 又等待 A 的任务结束. 依赖图虽然启动时无环,清理阶段通过运行时调用形成等待环,导致 provider 永远无法排空. 静态 coeffect 图看不见这种动态 wait-for edge.

避免方法包括规定 dependent cleanup 不发起新的 provider 长任务,提供独立 shutdown channel,或在停用前分“拒绝新请求”和“排空旧请求”两阶段. provider 先进入 draining,dependent 停止产生工作,完成后再销毁资源.

超时能打破 deadlock,无法保证状态完整. 日志应区分正常 drain、超时强制和 inverse 失败,让系统健康状态反映语义降级. 论文生命周期规则给理想顺序,生产实现还要处理等待图.

### 6.45. Reentrancy 会破坏朴素状态机

组件 activate 中提供一个 service,该 service 立刻满足另一个 dependent;dependent activate 又回调原组件或修改其依赖. 如果 resolver 同步递归执行,状态可能在一次调用栈中多次变化,甚至栈溢出.

一种策略把 context mutation 写入队列,当前 transition 提交后统一传播. 这样每个 fiber 看到稳定快照,新变化在下一轮处理. 另一种允许同步传播,但必须有 reentrancy guard 和事务边界. 两者在事件时序上不同.

批量提交还能合并配置更新中的中间无效状态. 同时删除旧 provider、添加新 provider,若逐操作传播,dependent 会停一次再启;若事务提交目标 view,可以直接识别 identity 替换并安排一次重启. 论文抽象变换可视作原子,实现的队列/事务正是在逼近这一假设.

### 6.46. 确定性有助于复现 Agent 故障

若独立组件 effect 可交换,不同调度顺序在观测下等价;非独立操作则应规定稳定顺序. 确定的 provider resolution、listener ordering 和配置 traversal 让同一 session 更容易复现. Agent 模型本身已有采样随机性,控制面不应再引入无谓非确定性.

工具 schema 顺序尤其敏感. 即便模型看到相同工具集合,序列顺序变化会改变 prompt token,可能改变选择. 可按稳定 ID 排序,让插件装载时机不泄漏进模型输入. 事件 handler 若按优先级再按 registration ID 排序,更新后也更可预测.

确定性不代表所有异步任务串行. 可以并发执行可交换、无共享依赖的任务,在提交共享 context 时按确定规则归并. 读写集合与 operation algebra 可为安全并发提供依据.

### 6.47. 性能复杂度取决于依赖索引

每次 provider 变化若扫描全部 $N$ 个 components 并重新检查需求,代价为 $O(N)$. 建立 key 到 dependents 的反向索引,只访问声明该 key 的节点,代价接近 $O(\deg(k))$,再沿受影响依赖传播.

一个组件依赖多个 key,任一变化都要重新计算完整满足状态. 缓存每个 requirement 的 provider identity 可以增量更新. realm 继承与覆盖让索引更复杂:父 key 变化只影响没有局部覆盖的后代. 朴素遍历在小系统足够,数千插件与频繁 HMR 时需要测量.

effect accumulator 的 dispose 为 $O(E)$,$E$ 是该 episode 登记 effect 数. 这是必须执行的实际清理量,但错误聚合、异步串行会增加尾延迟. 可并行撤销明确独立的 effects,前提是逆操作交换;默认逆序串行更安全.

### 6.48. 内存泄漏可能来自 inverse 自身的闭包

每个 effect 保存 disposer,disposer 闭包可能捕获大型对象、请求上下文或模型输出. 组件长期 active 时,accumulator 因此保留本可释放的内存. 可撤销机制减少卸载后泄漏,却可能增加运行期间 retention.

设计 disposer 时只捕获 registration token 和必要句柄,不要闭包整个 plugin context. 对大量相似 listener,使用紧凑记录而非每项大闭包. heap profile 应区分“合法地等待卸载”与意外引用链.

卸载后 accumulator 自身必须清空. inverse 抛错时若为了诊断保留全部闭包,错误记录也会造成泄漏;可以保存结构化摘要,释放大对象. 论文抽象不计算内存,这是实现可扩展性的实际条件.

### 6.49. 测试替身依靠 realm 而非全局 monkey patch

组件依赖抽象 service key,测试可在子 realm 提供 fake implementation,只影响该测试 scope. 结束时 provider effect 自动撤销,避免 monkey patch 忘记恢复全局对象. 多个测试并行时,realm 隔离还减少互相污染.

fake provider 的 identity change 可主动测试 dependent 重绑. 先提供成功模型,运行一次;替换为抛错模型,确认组件停旧启新并处理失败;撤回 fake 后检查是否回退父 provider. 这直接覆盖 reactive coeffect 的关键路径.

测试替身若与真实 contract 不一致,隔离再好也会产生虚假信心. 共享契约套件应同时运行在 fake 与真实 adapter 上. context 让替换容易,不会自动保证替身忠实.

### 6.50. 安全权限可以建模为 coeffect,但仍需强制执行

工具插件可声明需要 `filesystem.write` capability,没有 provider 时保持 pending. 不同 realm 提供只读或读写实现,让权限成为显式依赖. 撤销权限 provider 会触发相关工具停用,比在每个工具中散落全局开关更一致.

若插件仍能直接调用 Node 文件 API,coeffect 只是一项声明,并非安全边界. 真正强制需要进程沙箱、受限模块加载或系统 capability. context capability 适合管理合作代码的权限与可见性,对恶意代码不能代替隔离.

权限缩减时在途动作怎样处理也要定义. 立即取消可能留下半写文件,允许完成又延迟权限生效. 两阶段 revoke 可先禁止新动作,排空或回滚旧动作,再撤回 provider. 这与普通 service draining 同构,风险级别更高.

### 6.51. 与静态依赖注入的关系

静态 DI 容器在启动时解析构造依赖,适合组件集合固定的服务. 它可检查循环、管理 singleton 和 scope,并不天然跟踪运行中注册的 listener、timer 和工具. Cordis 的新增量是 provider 可随时间变化,dependent 生命周期随之响应,effect 同时被所有权化.

如果应用启动后不换插件,没有 HMR,依赖缺失直接视为配置错误,静态 DI 更简单. 引入 reactive coeffect 会增加状态机和诊断成本. 选择框架应看动态变化是否核心需求,不能因形式更强就默认适合所有程序.

两者也可结合:静态 DI 构造 Cordis runtime 的底层固定服务,Cordis 管理上层动态插件. 边界放在生命周期频率差异处,而非互相排斥.

### 6.52. 与函数式资源管理的关系

RAII、bracket、`using` 和 effect scope 都强调 acquire/release 成对. 它们通常围绕词法或动态作用域:离开代码块便释放. Cordis component episode 可能由远处 provider 变化结束,生命周期不是局部调用栈决定.

可以把 component activation 看成一个长期 bracket:

$$
\operatorname{bracket}(acquire,use,release),
$$

其中 `use` 持续到 coeffect 不满足或配置删除. accumulator 收集 activation 内的多个 release. reactive dependency 决定 bracket 何时重新开始.

借用成熟资源管理原则很有帮助:释放应幂等,异常不能跳过 release,组合按逆序,取消要传播. Cordis 的贡献在于把这些原则与运行时依赖解析、组件树和 HMR 统一.

### 6.53. 与 FRP 的关系

Reactive coeffect 把 context availability 看成随时间变化的信号,component active 状态是需求谓词的派生值. 这与 Functional Reactive Programming 的行为/事件有相似性. 差别在于这里派生值驱动有资源生命周期的 effect,不能只做纯函数重算.

如果 $a(t)$ 表示 provider identity,$R(a(t))$ 表示需求满足,边沿变化触发 activate/deactivate. 相同 identity 的 value 内部变化是否触发重启,取决于 key 语义. 把所有细小值变化都当 provider change,会导致重启风暴;只关心 identity,组件又需另订阅业务 value.

因此 coeffect 更适合表示能力存在和实现身份,高频业务数据仍用 stream/event. 把两者混用是常见粒度错误. 论文将 coeffect 提升为 runtime requirement,没有把 context 变成通用响应式数据库.

### 6.54. 论文定理如何转成代码审计问题

检查 temporal composability 时,列出所有可达 effect API,确认它们返回并登记 inverse;搜索裸全局注册,确认没有逃逸. 检查 spatial composability 时,列出 service reads 与 inject 声明,确认 activation 内使用的强依赖均被覆盖.

检查 interleaving 时,找同 key 写入、事件顺序和共享对象 mutation,判断操作是否真正交换. 检查 provider withdrawal 时,沿反向依赖图确认 dependent disposer await 完成后才删除 provider. 检查状态机时,用 epoch 防止旧异步 continuation 提交.

这些审计项比“代码用了 `ctx.effect`”更接近 theorem 前提. 形式证明证明实现了抽象规则的系统具备性质,具体代码仍需证明自己忠实实现规则. 论文与仓库之间应建立这种 refinement 对应.

### 6.55. 可证伪的总体结论

如果反复装卸后资源不回基线,时间组合性在实现中失败;如果 provider identity 替换后 dependent 仍持有旧实例,空间组合性失败;如果独立插件换加载顺序会改变工具集合或行为,交错等价失败;如果新配置加载失败后旧树也不可用,reconciliation 的恢复性失败.

这些条件让“时空可组合”成为可测试主张,而非架构口号. 形式定理给出理想模型中的推导,属性测试、故障注入和资源观测负责检验实现. Koishi 与 DeepSeek Harness 提供真实使用背景,仍需上述证据衡量特定版本.

最终应把保证表述为条件句:对于经统一 context 中介、具有正确 inverse、coeffect 声明完整且满足独立性前提的 components,运行时可以在动态装卸和依赖变化中维持观测等价与生命周期秩序. 这句话比“插件随便热更都安全”窄得多,也正因为边界清楚而更有技术价值.

### 6.56. 生命周期事件需要线性化点

并发系统里“组件已经激活”必须对应一个明确时刻. activate 开始时依赖齐全,初始化尚未完成,其他组件不能立刻把它当可用 provider;完成后提交 effects 和 service binding 的时刻才是线性化点. deactivate 也应先阻止新消费者,排空旧工作,再在某一时刻撤回可见 binding.

若 provider 在初始化中途就可见,dependent 可能调用半成品对象. 若直到所有副作用完成才登记 inverse,中途异常又无法恢复. 一种事务式结构是在私有 accumulator 中逐项登记,外部 binding 暂不发布;初始化成功后原子提交 scope,失败则私下 unwind.

组件自身可在 committed 前使用局部资源,其他 realm 只能看到已提交 view. 这把目标视图、构建视图和公开视图区分开. 论文 context transformation 常以原子步骤呈现,实现中的 commit point 是对应抽象的关键.

日志应记录 requested、started、committed、draining、disposed,避免把异步函数返回前的中间状态都叫 active. 故障发生在哪个阶段,决定是撤销未提交资源、恢复旧 binding,还是标记系统降级.

### 6.57. 一致性快照避免 dependent 读到混合版本

组件需要 `model` 和 `tools` 两个 service. 配置更新同时替换二者,若逐 key 发布,dependent 可能短暂看到新 model 配旧 tools,这组组合从未出现在目标配置. coeffect 逐项满足仍为真,语义却不一致.

可为配置 transaction 分配 revision,所有 provider contribution 在同一 revision 提交. dependent 解析需求时读取一致快照,只有整组新 binding 就绪才重启. 这类似数据库原子提交,范围局限于 context metadata,不包括外部不可逆 effect.

若新 model 初始化成功、tools 初始化失败,旧 revision 应继续可见,新私有 scope 全部 dispose. 若资源不允许新旧并存,只能接受维护窗口,但仍可在失败后按 inverse 尝试恢复旧版. 两种路径应由组件声明,不能由通用 loader 猜测.

### 6.58. 生命周期传播需要处理菱形依赖

A 依赖 B 与 C,B、C 又共同依赖 D. D 替换时,B、C 都停用,A 可能收到两次“不满足”通知. 若状态机为每条边独立启动 cleanup,A 会重复 deactivate. resolver 应按 component 聚合需求真值,从 satisfied 到 unsatisfied 只产生一次边沿.

恢复时 D 先 active,B、C 可并行激活;A 必须等待二者都 committed. 这是一道 barrier. 任一分支失败,A 保持 pending,已成功分支可以继续 active,不应因 A 无法启动便回滚无关 provider.

拓扑层级提供并行机会. 同一层彼此独立的 components 可以同时 transition,下一层等待前驱. 如果实际 effects 不交换,静态依赖图漏边,并行会暴露竞态. 运行时冲突日志可以反向帮助补依赖声明.

### 6.59. Optional dependency 的变化是否触发重启

组件没有 cache 也能工作,cache 出现后希望利用. 一种语义是在当前 episode 中动态 lookup,无需重启;另一种语义将 optional identity 纳入配置,出现后重启以构建不同实现. 前者中断少,组件代码要处理每次缺失;后者不变量简单,provider 抖动代价高.

可以把 requirement 分成 required、optional-static、optional-dynamic. required 决定是否 active;optional-static 在 activation 时注入,identity 变化触发新 episode;optional-dynamic 通过查询或 proxy 实时解析. 三类语义若不明确,作者会对“optional”产生不同预期.

对于 Agent tool,telemetry 通常适合 dynamic optional,没有监控不应重启工具;cache 可能适合 static optional,实现路径在一次请求中保持稳定;workspace 则是 required. 粒度直接决定系统抖动和代码复杂度.

### 6.60. 资源配额也是 context 的一部分

插件都可撤销,仍可能在 active 期间耗尽内存、文件描述符或并发槽. context 可以提供 scoped quota service,每个 component 获取资源前登记 token,dispose 时归还. 配额 effect 同样需要 inverse,还能按 owner 统计泄漏.

若 acquire 后插件在登记资源前异常,quota token 必须由 acquire API 原子纳入 accumulator. 先返回裸资源再让调用方手动登记会留下窗口. 对子进程和 socket,创建、所有权登记与失败清理应封装为单个 effect function.

配额不足可让 component pending、启动失败或降级,三种语义不同. pending 适合资源稍后释放,失败适合配置不可能满足,降级需要备用实现. coeffect 可把“至少两个 GPU slot”表示为需求,但数值资源竞争会使满足关系随分配决策变化,比普通 key presence 更复杂.

### 6.61. 优先级会破坏朴素交换律

多个 provider 服务同一 key 时,框架可能按优先级选最高者. 注册集合本身可交换,可见 provider 的选择由确定的 priority 与 tie-break 决定. 如果 tie-break 使用注册时间,加载顺序仍可观察;使用稳定 component ID 可恢复确定性.

priority 更新相当于 provider identity change. dependent 应重绑,即便 provider 对象未变. inverse 要恢复该 contribution 的旧 priority 或撤销本次更新,不能覆盖其他并发调整. 最简单做法把更新实现成旧 registration dispose 加新 registration create,provenance 清楚但会触发生命周期.

interceptor 链、middleware 和工具展示顺序也有同样问题. 声称操作可交换前,需确认最终排序只依赖稳定元数据,不依赖偶然提交时刻.

### 6.62. Context proxy 的陈旧引用问题

dependent 若在 activate 时读取 `ctx.database` 并保存对象,provider 替换后必须重启才能更新引用. 若保存的是动态 proxy,每次方法调用都解析当前 provider,可减少重启,但一次多步事务中 provider 可能中途切换.

静态绑定提供 episode 内一致性,动态 proxy 提供即时更新. 数据库事务、模型流式生成等有状态操作需要静态绑定;无状态日志函数可动态代理. 通用框架无法只用一种策略覆盖全部 service.

proxy 还改变错误位置. provider 缺失时,静态 coeffect 让组件 pending;动态 proxy 可能直到方法调用才抛错. 可诊断性与可用性之间需要契约选择. 论文的 reactive coeffect 更接近静态 episode 绑定,实现扩展不能悄悄改变保证.

### 6.63. 流式调用使 provider drain 更复杂

模型 adapter 返回长时间 token stream. provider 卸载时,已开始 stream 应完成、取消还是迁移? 迁移到新 provider 通常无法保持采样状态. 等待完成可能阻塞 HMR 数分钟,立即取消会破坏用户请求.

可以为调用创建 child scope,provider 进入 draining 后拒绝新 child,等待现有 scopes 归零或达到 deadline. deadline 后发送 abort signal,session 记录取消原因. dependent component 可先切到新 provider处理新请求,旧 provider只为在途调用保留,形成短暂多版本并存.

这种 draining reference count 是 provider 生命周期的扩展,并非简单逆序 disposer. Agent harness 大量使用流式模型和长工具,若不定义这层,热更新的理论顺序难以落地.

### 6.64. 观测日志也应遵守可撤销与不可撤销边界

订阅日志 sink 是可撤销 effect,已经写出的审计记录通常不可撤销,也不应撤销. 卸载 logger 插件应停止新写入、flush buffer,保留历史. 把两者混为一谈会让“完全恢复上下文”被误解为删除外部痕迹.

形式观测等价可以忽略审计历史,安全系统却需要它. 因而 context state 恢复与 append-only evidence 并存:前者保证运行行为回基线,后者记录发生过哪些生命周期变化. 审计日志本身要避免保存密钥和模型隐藏内容.

对每次 inverse 记录成功/失败有助于定位泄漏. 但日志调用若依赖正被卸载的 provider,清理阶段可能失去记录通道. 可使用更底层稳定 sink,或先缓存 cleanup report 后由父 context 写出.

### 6.65. 属性测试怎样生成生命周期序列

定义操作集 `provide(k,id)`、`withdraw(id)`、`mount(c)`、`unmount(c)`、`failNextEffect` 与 `tickAsync`. 生成随机序列,每步与一个简化参考模型比较 visible providers、active components 和 owner resource counts. 序列失败后做 shrinking,得到最短反例.

关键不变量包括:inactive component 没有 owned effects;active component 的 required keys 均满足;withdraw provider 前相关 dependent 已离开 active;同一 component 同时至多一个 committed epoch;全部 mount token dispose 后 context 回到初始观测状态.

再对声明独立的 component 对交换相邻操作,验证最终观测等价. 对不独立操作则验证确定 priority 规则. 这套测试把论文 theorem 变成持续集成中的可执行契约.

### 6.66. 模型检查适合寻找短竞态

状态机只有少量抽象状态时,可枚举 provider 出现/消失、activate 完成/失败、deactivate 完成/失败的所有短交错. 检查是否存在双 active、provider 先销毁或永久卡在过渡状态. 真实代码空间巨大,抽象模型仍能发现设计级缺陷.

例如在 deactivating 期间依赖恢复,模型检查可比较“取消停用”与“完成后重启”两种规则. 前者若 cleanup 已执行一半会进入无法定义状态,后者状态数更多但转移清楚. 论文的 inertial 设计正适合用这种方法验证.

模型与实现需要 trace 对齐. runtime 输出 transition event,随机测试产生的 trace 投影到抽象状态,检查每步符合规则. 这比单独证明模型、再假设代码正确更完整.

### 6.67. 性能评估应避免只测空插件

空插件的 mount/unmount 主要测框架固定开销,真实组件的 disposer 数、依赖扇出和异步 drain 才决定尾延迟. 基准应按 effect 数、依赖图深度、fan-out、provider 抖动频率和配置树大小分层.

一次 key 变化触发一千 dependents,总传播时间、最大并行度和事件循环阻塞都要记录. HMR 更新叶子与根节点影响范围不同. 内存测试要保持组件 active 数小时,观察 accumulator 与反向索引是否线性稳定.

与其他框架比较时需实现相同语义. 手动 cleanup 版本若不支持 provider 动态替换,速度更快并不构成同功能对照. 可以分别报告语义子集和完整功能,避免用功能差异冒充框架开销.

### 6.68. 论文的一手证据链

本章的形式定义、状态机、定理范围和 Cordis 架构来自《A Programming Paradigm for Spatiotemporal Composability》论文及其 LaTeX 源文. DeepSeek Harness 官方仓库展示 Cordis 在 Agent 控制面中的具体使用,官方 Cordis 实现提供 effect、fiber、service、loader 与 HMR 行为的代码依据.

论文给出的 Koishi 案例支持长期生态使用这一事实,没有提供受控性能优势. 关于崩溃恢复、分布式事务、不可信插件、动态 proxy 和属性测试的段落是由公开语义推导出的工程边界与验证方法,没有冒充论文已经实现的功能.

论文自身最需要补充的是实现—定理逐项 refinement、受控基准、异常与竞态测试、长时资源曲线,以及 v4 形式模型与生产生态版本的对应. 这些缺口应作为后续验证清单保留.

### 6.69. 用一句状态不变量收束整套范式

对任意 component $c$,在 committed active episode 中,它的 required coeffects 由确定 provider identities 满足,所有对外 effects 都带 owner 与 inverse;episode 结束后,这些 effects 按依赖安全的逆序撤销,其他独立 components 的观测结果保持不变.

这条不变量同时包含空间条件、时间条件和交错条件. 只做到自动 cleanup,没有响应式依赖,属于时间维度;只做到 DI 重绑定,没有 inverse,属于空间维度;两者统一并保持独立组件不互扰,才达到论文所说的 spatiotemporal composability.

它也清楚排除了夸大解释:外部不可逆动作、绕开 context 的全局修改、进程崩溃、恶意代码和跨服务事务不在自动保证内. 对这些部分增加补偿、持久日志和隔离后,系统才能从局部可组合内核走向完整可靠运行时.

### 6.70. 何时不该引入这套机制

一个命令行程序启动后读取配置、执行一次任务便退出,所有资源随进程结束,动态 provider 替换没有实际需求. 为它加入 fiber、reactive dependency 与 HMR 会增加理解和调试成本. 生命周期短、组件固定的系统使用普通函数组合和结构化资源管理已经足够.

另一类情况是组件之间高度共享可变内存,无法把读写收敛到 context API. 强行包装少数 registration 只能制造表面上的 disposer,核心状态仍然逃逸. 此时应先重新划分所有权与接口,否则形式术语不会带来真实组合性.

对严格实时系统,响应式传播与异步 drain 的尾延迟可能不可接受;对不可信插件市场,同进程 context 又缺少安全隔离. 前者需要更静态的资源规划,后者需要进程或虚拟机边界. Cordis 可位于这些系统的某一层,不必成为唯一运行时.

判断标准可以很具体:组件是否频繁在进程存活期间增删,依赖是否会替换,卸载残留是否已经成为真实故障,局部更新是否比全进程重启更有价值. 四项大多为否时,简单架构通常更合适;多项为真时,时空组合性的额外状态机才有回报.

### 6.71. 从局部证明到系统信任需要三道桥

第一道桥是 API 完备性:所有共享 effect 都必须经 context,所有持续强依赖都进入 coeffect 声明. 第二道桥是实现忠实性:effect 栈、identity、状态机与依赖传播符合 calculus. 第三道桥是环境假设:外部资源支持清理,插件合作且进程没有在关键区间崩溃.

任一道桥缺失,定理仍然成立于抽象系统,具体应用却不能继承全部结论. 代码审计回答第一道,属性测试和模型检查回答第二道,故障注入、沙箱与持久化协议回答第三道. 三类证据互相补充,没有单一测试可以覆盖全部.

这也说明论文最有价值的用途:它提供了可审计的不变量和失败分类. 工程团队可以据此问清资源属于谁、依赖何时成立、替换怎样线性化、撤销是否只影响自身. 答案具体到 token、identity 和 transition 时,架构判断才从口号变成可验证约束.
