---
title: DeepSeek V4.1 Flash 架构与推理
description: 从矩阵、缓存生命周期和逐层数据流理解 CED、CSA2、SWA 与 MoE。
---
# DeepSeek V4.1 Flash 架构与推理

长上下文模型经常把注意力写成一个紧凑公式, 但部署时真正移动的是一组具有明确形状、生命周期和共享范围的矩阵. Query 在当前层即时产生, 局部 K/V 进入本层的滑动窗口, 全局 main KV 由少数 Full 层写入共享缓存, Top-K 行号又可能由 Reindex 层重新计算. 如果只记方法名, 很容易把「共享缓存」「共享权重」「共享索引」混成一件事; 如果只看公式, 又很难追踪一行数据究竟从哪里来、在哪一层失效.

这座知识库围绕 DeepSeek V4.1-Flash 的语言主干展开, 重点观察 CED、CSA2、SWA 与 MoE 怎样共同改变 Prefill、Decode 和 KV cache. 目录按照张量数据流组织: 先建立模型层、缓存对象和计算阶段的共同坐标, 再进入 CSA2 的 Full / Reindex / Reuse 三种运行模式, 可交互结构图负责逐层检查矩阵投影、注意力 head、残差与专家路由.

## 1. 为什么从矩阵和缓存对象开始

DeepSeek V4.1-Flash 的语言主干有 40 层, hidden dimension 为 5120. 前 20 层属于 causal encoder, 后 20 层属于 decoder. 这里的 encoder / decoder 不是 T5 式的两套网络, 也没有额外的 cross-attention 模块; 它们仍位于同一条自回归残差流上. 分工主要发生在 Prefill: 前半段处理完整 prompt, 后半段需要的全局 KV 可以从 encoder 最终 hidden state 投影得到, 从而减少输入阶段激活的参数量.

CSA2 继续压缩全局 KV 的层维冗余. 每一层仍然计算 main Q 和本层 SWA K/V, 但全局 main KV、indexer K 与 Top-K 行号不再要求每层各自产生一份. Full 层负责完整路径; Reindex 层复用 main KV 与 indexer K, 只用本层 indexer Q 重新选择 Top-K; Reuse 层同时复用全局 KV 与最近一次选择得到的 Top-K. 三种模式改变的是全局分支的生产与选择责任, 并不取消本层的 Query、局部窗口注意力、输出投影或 MoE.

这个区分决定了图应该怎样画. `Wᴷˡᵒᶜ` 和 `Wⱽˡᵒᶜ` 是两个独立权重矩阵, 分别产生局部 Key 与 Value. CSA2 的 global main KV 则是一种供稀疏注意力共享读取的表示, 用 `Wᴷⱽᵍˡᵒᵇᵃˡ` 标记时必须同时写明作用域, 不能把它和局部 `Wᴷ`、`Wⱽ` 并排后假装三者语义相同. 同理, Top-K 是行号集合, 不是 KV 内容; indexer K 用于检索, main KV 用于正式注意力, 两者也不能合成一个模糊的「缓存块」.

## 2. 怎样阅读这座知识库

第一次进入时, 先从 [架构与缓存](1-架构与缓存/1-架构与缓存.md) 建立对象边界. 那一章区分 Prefill 与 Decode, 说明全局缓存和每层局部缓存为什么具有不同的增长方式, 并给出 40 层中各模式的静态分布. 这一层不展开单个 attention head 或专家内部 MLP, 目标是让读者先知道每种状态由谁产生、被谁读取.

接着阅读 [CSA2 与逐层数据流](1-架构与缓存/1.1-CSA2与逐层数据流/1.1-CSA2与逐层数据流.md). 路线首页统一使用行向量约定: 一个 token 的 hidden state 是 $1\times5120$ 行向量, 长度为 $N$ 的序列组成 $N\times5120$ 矩阵. 所有投影都从这个约定出发, 因而图中的大框、向量条带和元素格子能与公式一一对应.

第三步进入 [矩阵视角的一层数据流](1-架构与缓存/1.1-CSA2与逐层数据流/1.1.1-矩阵视角的一层数据流.md). 页面中的 React 组件允许切换第 1–40 层. 切换只改变当前层型和全局缓存路径, 不改变一层共有的两次 RMSNorm、两次残差汇合、64 个 Query head 与 MoE 路径. 读图时沿绿色主路径向下, 接着沿琥珀色残差边检查输入是否正确抵达两个加法节点, 再查看右侧共享缓存是否与当前模式一致.

## 3. 图中的尺寸与省略号

真实矩阵无法把 5120 个元素、64 个 head 或 384 个 routed expert 全部铺在文章宽度内. 图使用确定的抽样规则: 矩阵展示首行、第二行、省略行与末行; 行向量展示前三个元素、省略格与末元素; attention 展示 Head 1、Head 2、省略号与 Head 64; Router 展示六个被选中的示例专家和其余 378 个未执行专家. 省略号只压缩重复结构, 不省略计算阶段.

Router 分数随 token 与层输入动态变化. 图中的数值用于说明排序和加权关系, 不代表技术报告中的固定测量值. 真正稳定的是选择机制: Router 产生 384 维得分向量, Top-6 routed expert 被执行, shared expert 始终执行, 最终按 gate 权重合并 routed 输出. 专家内部继续展开为 `Wᵍᵃᵗᵉ`、`Wᵘᵖ`、SiLU 门控乘法和 `Wᵈᵒʷⁿ`, 因而「MoE」不再只是一个没有内部结构的大方框.

## 4. 资料边界与后续生长

当前主线依据本地保存的 DeepSeek V4.1-Flash 技术报告, 重点覆盖报告第 2.2 节的 CED、第 2.3 节的 CSA2 与第 4.2.1 节的模型配置. 配置包括 40 层、hidden dimension 5120、64 个 Query head、每个 head 512 维、Query compression dimension 1280、32 个 indexer Query head、indexer head dimension 128、attention Top-K 512、SWA window 128, 以及 1 个 shared expert 与 384 个 routed expert.

后续增加内容时仍沿对象关系扩展. 压缩器与 Hierarchical Sparse Indexer 可以进入 CSA2 路线下的新叶子; Bounded Replay 应进入缓存生命周期路线; CED 的 Prefill 计算路径可以成为单独路线. 模型版本、评测表和产品信息不直接混入这个机制目录, 避免用发布日期覆盖数据流主轴.

