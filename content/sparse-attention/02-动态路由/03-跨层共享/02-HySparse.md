---
title: HySparse 与 HySparse2: Oracle 索引、KV Reuse 和两级共享
description: 解析小米 HySparse 的 full+sparse 层组及 HySparse2 的 KV Bridging, 对比 block/token选择、Prefill早退和Decode缓存.
published: true
---

# HySparse 与 HySparse2: Oracle 索引、KV Reuse 和两级共享

[HySparse](https://arxiv.org/abs/2602.03560)从一个直接观察出发: full attention已经计算出真实attention分布, 它可以为后续稀疏层提供重要位置, 无需另训代理indexer. 一个hybrid block由一层full attention和随后 $N$ 层sparse attention组成. full层输出block-level importance与top-k blocks; 后续sparse层复用这些indices和full层KV, 同时保留一条独立SWA分支处理局部信息.

[HySparse2](https://arxiv.org/abs/2609.26368)在内层KV Reuse外增加外层KV Bridging. 模型采用YOCO式self-decoder与cross-decoder: self-decoder使用hybrid SWA, cross-decoder使用hybrid sparse attention, cross-decoder的full层KV由self-decoder full层hidden states构造. Prefill因此可在self-decoder后结束, 跳过全部cross-decoder layers. 内层又将HySparse的block选择改成token选择, 去掉独立SWA分支, 改为把recent sliding window强制并入sparse候选.

两代方法的「共享」有明确层次. HySparse在同一个hybrid block内共享indices与global KV; HySparse2还跨decoder桥接full-layer hidden states和KV构造. 前者主要减少每层cache副本, 后者同时减少Prefill执行深度. 如果不区分内外两级, 很容易把cache容量下降误写成所有attention计算都同比下降.

## 1. HySparse 的 oracle 从哪里来

### 1.1. full layer 输出block importance

设full layer对query $t$ 的softmax权重为 $a_{t,s}$. 将key轴按大小 $B$ 分块, 第 $i$ 块位置集合为 $\mathcal B_i$. HySparse定义block score:

$$
S_t^i=\max_{s\in\mathcal B_i}a_{t,s}. \tag{1}
$$

再选top-$k/B$ blocks, 默认 $k=1024,B=64$, 即每个query选16个blocks. 对GQA, 同一query group内用group-wise maximum聚合scores, 让共享KV的heads使用相同indices. 这减少索引元数据并适配block sparse kernel.

式 (1)不是代理模型预测. score来自full attention已经计算的QK和softmax, 所以论文称full layer为oracle. 「oracle」只相对额外selector而言: 它准确反映该full layer自己的attention, 不保证后续sparse layers偏好完全相同. 方法依赖相邻层salient tokens稳定.

### 1.2. FlashAttention 怎样暴露score

标准FlashAttention不物化 $n\times n$ 权重. 它按tile计算logits, 维护行最大值 $m_t$ 和指数和 $\ell_t$. HySparse修改kernel, 保存每个key tile的row maximum, 再用全行统计缩放为block score. 输出 $S\in\mathbb{R}^{n\times\lceil n/B\rceil}$, 远小于token级矩阵.

这仍有工作区. 1M token且 $B=64$ 时, 每个query有15625个block scores; 对整段Prefill直接物化依旧很大. 论文算法说明block scores随full attention产生, 实际超长实现需要分块top-k、精度控制或工作区管理. 报告没有给出所有生产kernel细节时, 不能把「negligible overhead」外推到任意长度和硬件.

block maximum偏爱块内一次强响应. 它适合召回唯一峰值, 对许多中等权重累积不敏感. 若用sum会偏向包含大量普通token的块. HySparse选择max并通过训练让后续层适应, 不是一个对所有任务都最优的无参数定理.

### 1.3. indices 如何跨层复用

full layer为每个query产生block indices $\mathcal I_t$. 随后 $N$ 个sparse layers都使用同一 $\mathcal I_t$, 不再各自运行selector. 对第 $l$ 个sparse layer:

$$
(\tilde K,\tilde V)=\operatorname{Gather}(K^{full},V^{full},\mathcal I_t), \tag{2}
$$

$$
o_t^{sp,l}=\operatorname{Attn}(q_t^l,\tilde K,\tilde V). \tag{3}
$$

$q_t^l$ 来自当前层, 被读KV来自前面的full layer. 共享的不是query, 也不是attention output. 当前层query对同一候选重新算精确权重, 允许层间改变候选内排序, 无法访问候选外位置.

## 2. 内层 KV Reuse 与局部分支

### 2.1. global KV 为什么能共享

普通Transformer每层为全部历史保存独立KV, cache约随层数 $L$ 增长. HySparse只为hybrid block的full layer保存全长global KV; 后续sparse layers读取它, 不保存自己的全长KV. 若一组为1 full+N sparse, global KV副本数约降为原来的 $1/(N+1)$.

80B MoE实验有49层, full:sparse为1:11且第49层为full, 共5层full attention, 因而全长KV层数从49降到5, 接近10倍. 这是结构容量比, 还要加sparse layers的local SWA cache、indices与元数据. 论文表述为近10倍, 不应写成精确9.8倍端到端显存.

共享KV要求sparse layer学习使用上游表示. $q_t^l$ 与 $K^{full}$ 来自不同层, 参数需在预训练中共同适配. 这不是把已有模型某些layer cache指针改成同一地址就能保持行为的推理插件.

### 2.2. 为什么保留独立 SWA cache

每个HySparse sparse layer还有window $w=128$ 的SWA branch, 使用自己的 $K'^l,V'^l$. global sparse分支访问oracle blocks, local分支访问最近128个token. 两个输出经独立sigmoid gates相加:

$$
o_t^l=\tilde g_t^l\odot o_t^{sp,l}+g_t'^l\odot o_t^{swa,l}. \tag{4}
$$

论文消融发现独立SWA cache对表达力重要. full layer共享KV为global retrieval优化, 未必保存当前sparse layer需要的局部特征. 若local也复用同一KV, 容量更小, 质量下降. 因而HySparse的KV Reuse只覆盖global sparse branch.

local cache容量约为每个sparse layer $w$ entries, 不随总上下文增长. 长度很大时相对开销小, 层数多时仍要核算. 两分支候选可能重叠, 但它们各自softmax再门控, 并非合成一个候选集合做统一softmax.

### 2.3. Prefill 与 Decode

Prefill中full layer执行稠密FlashAttention并同时产生block scores, 付出平方计算. 后续N层只计算1024个global tokens对应的blocks加128 local window. full层比例越低,总体attention成本越接近稀疏层; full层仍是周期性平方锚点.

Decode中full layer每步扫描全部历史KV并更新oracle indices; 后续sparse layers读取选中global blocks和各自local window. indices可立即供同一层组后续层使用. 随生成推进,每个新query重新产生indices, 不把早期query的选择永久固定.

KV Reuse显著降低cache容量, 不消除full layer的全历史带宽. 1:11布局中每12层有一次full scan. Sparse layers的global gather为block连续地址, 比token随机gather更友好, 仍需按indices加载多个分散blocks.

## 3. HySparse2 的外层 KV Bridging

### 3.1. self-decoder 与 cross-decoder

HySparse2采用YOCO式两段decoder. self-decoder先处理输入并建立可共享状态, 使用hybrid SWA结构; cross-decoder随后读取由self-decoder提供的历史memory, 使用hybrid sparse attention. 外层桥接只围绕full-attention layers建立对应关系.

设self-decoder某个full layer hidden states为 $H_f^S$. cross-decoder对应full layer的KV可由投影构造:

$$
K_f^C=H_f^SW_{K,f}^C,\qquad V_f^C=H_f^SW_{V,f}^C. \tag{5}
$$

式 (5)表达公开摘要所述「cross-decoder full KV由self-decoder full hidden states生成」, 具体投影共享和归一化以论文实现为准. cross-decoder不必在Prefill逐层运行后才能得到历史KV.

### 3.2. Prefill 为什么可以早退

传统decoder Prefill必须依次执行全部层, 因为每层KV来自该层hidden states. KV Bridging打破这一依赖: self-decoder完成后, cross-decoder需要的历史full KV可批量从桥接hidden states构造. 因而prompt Prefill主干可在self-decoder结束, 不执行cross-decoder layers的token-by-token变换.

「跳过cross-decoder Prefill」不等于不生成它的KV. bridge投影和cache写入仍有成本, 只是省掉cross-decoder的attention、MLP与层间残差计算. 对长prompt, 这能同时降低TTFT计算; 对短prompt, 投影与系统开销占比更高.

Decode仍要运行cross-decoder生成输出token. self-decoder处理新token并更新桥接状态, cross-decoderquery读取共享cache. 非对称负载契合agent场景: 长observation Prefill频繁, 每次action较短.

### 3.3. 外层和内层怎样叠加

外层KV Bridging决定cross-decoder full KV从哪里来; 内层KV Reuse决定一个full layer的KV供多少sparse layers共享. 两级结合后, 全部cross-decoder KV cache都可追溯到self-decoder full hidden states, sparse layers无需独立全长cache.

cache容量不能只数cross-decoder. self-decoder hybrid SWA保留自己的状态, bridge full caches、cross-decoder indices、recent window与量化scale都占空间. HySparse2论文在80B-A3B模型上报告相对HySparse和Hybrid SWA降低Prefill计算与KV存储, 具体数字应按论文表格的序列长度、dtype和层数引用.

两级共享增加生命周期依赖. prefix cache命中时要同时恢复self-decoder状态与桥接KV; speculative分支发生分叉时, bridge状态也要按分支隔离. 论文未公开的服务策略不应自行补写.

## 4. 从 block 选择到 token 选择

### 4.1. HySparse2 为什么细化粒度

HySparse默认选16个64-token blocks, 总计1024 tokens. 一个关键token会带入63个邻居, 对连续访存有利, 也浪费预算. HySparse2改为token-level sparsity, 能把1024个槽位分配给分散的重要位置, 提升长文检索精度.

token选择产生更不规则的gather. index存储从block IDs变成token positions, 主kernel需要按随机地址读KV. 如果cache分页, 物理事务数可能接近候选token数. 因此token级算法收益是否兑现取决于排序、page聚合和专用kernel.

### 4.2. recent window 如何并入候选

HySparse每个sparse layer有独立SWA branch和独立local KV. HySparse2删除这条分支, 改为强制recent window token进入sparse selection. 候选可写成:

$$
\mathcal S_t=\operatorname{TopK}(R_{t,:},k_g)\cup\{t-w+1,\ldots,t\}. \tag{6}
$$

随后在并集上做一次sparse attention. 若global top-k包含recent token, 应去重. 总候选上限为 $k_g+w$, 实际数量取决于重叠. local与global共享同一次softmax, 与HySparse式 (4)的双分支门控不同.

删除独立SWA cache进一步节省每个sparse layer的local KV, 也失去专门局部表示. HySparse2通过强制recent tokens和训练适配补偿. 两代消融不能直接互换: HySparse发现独立SWA重要, HySparse2改变了主结构和训练, 并非仅删除一条已训练分支.

### 4.3. 选择来源与刷新

HySparse的indices来自前一full layer真实attention block scores, 在layer组内复用. HySparse2公开摘要强调保留KV Reuse核心并细化token选择, 具体token score如何从full layer产生、是否有额外精排和刷新频率应以论文正文与官方实现为准. 若公开实现未提供, 只能陈述token级结果和共享关系.

评测应测full oracle对后续层独立attention的token recall, 并与block扩张后的物理字节对照. token recall更高不自动意味更快; block版本可能凭连续加载取得更高吞吐.

## 5. 训练、性能与失败边界

### 5.1. 原生预训练的重要性

HySparse在7B dense模型使用1:3 full:sparse, 训练1T token、长度8192, 随后用200B token扩到32768; 80B-A3B MoE使用1:11, 训练500B token、长度32768. 两条分支、共享KV和oracle indices都在训练中存在.

因此结果说明这种结构可以原生训练, 不说明能无损改造任意checkpoint. KV来源跨层改变后, query投影和residual必须适应. HySparse2又加入decoder分段与bridge, 迁移难度更高.

### 5.2. 缓存字节怎样核算

普通GQA cache每token每层字节约为 $2H_{kv}d_hb_e$, $b_e$为每元素字节. HySparse全长global cache只在full层保存, sparse层另有 $w$ 长local cache. 总量近似:

$$
M\approx2B_{seq}H_{kv}d_hb_e\left(L_f n+L_sw w\right)+M_{idx}. \tag{7}
$$

$L_f$是full层数, $L_{sw}$是带独立SWA cache的sparse层数. HySparse2删除第二项对应的独立分支, 外层bridge又减少cross-decoder独立来源. 实际还要加page padding、scale与状态.

### 5.3. 失效边界

跨层saliency稳定是HySparse的核心假设. 后续层若需要oracle未选块, 只能通过local branch或下一full layer恢复. Full间隔越长, 错误持续层数越多. HySparse2 token选择更细, 仍受oracle来源和跨层稳定性限制.

KV sharing的另一边界是表示错配. 上游full KV为自身query训练, 下游sparse query来自不同层. 共享组太长时, 表示空间可能偏离. gate可以降低不合适分支贡献, 无法生成候选外信息.

Prefill早退依赖bridge能从self-decoder状态构造足够的cross-decoder memory. 对需要深层逐token加工的prompt信息, bridge压缩可能成为瓶颈. 长observation短action的agent负载最契合; 长输出时cross-decoder Decode计算仍逐token支付.

### 5.4. 工程验收

先固定hybrid block, 检查full score输出、top-k blocks、共享KV指针、SWA独立cache和gate. 再固定HySparse2两段decoder, 验证bridge生成cache与完整Prefill参考的差异. token候选去重、recent window和causal边界分别测试.

性能拆成full attention+score、top-k、sparse gather、SWA/union attention、bridge投影和cross-decoder跳过量. Decode记录每层组cache读字节和page数. 质量按layer测oracle recall、组尾误差、多证据与多轮agent任务.

**HySparse用full层的真实attention换掉代理indexer, HySparse2再用两级KV共享换掉重复Prefill和cache.** 节省来自更少的状态副本与更少的执行层, 代价是层间表示和saliency必须稳定. 这条边界比单个top-k数字更重要.

### 5.5. 用一个 block oracle 例子核对语义

设历史只有8个token, block size为2, 某个query在full layer得到的注意力权重依次为

$$
(0.04,0.06,0.30,0.05,0.08,0.12,0.20,0.15).
$$

若block score取块内最大值, 四个块的分数是 $(0.06,0.30,0.12,0.20)$. top-2选择第二和第四块, 最终实际计算token 3、4、7、8, 覆盖的原始注意力质量为0.70. 这个例子说明oracle并不直接选择四个最大权重token: token 3会把同块的token 4一起带入, token 7也会带入token 8. 连续读取因此更规则, 预算却会消耗在同块邻居上.

如果把聚合规则换成块内求和, 四个分数变成 $(0.10,0.35,0.20,0.35)$, top-2在第二与第四块上仍不变. 但当一个块包含多个中等权重位置时, max与sum可能产生不同排序. HySparse公开设计使用从full attention中得到的block importance, 工程复现必须固定归约规则、GQA组间归约规则和并列分数的稳定排序, 不能只写「按块top-k」.

再把recent window设为最近两个token. 在HySparse中, global分支仍计算选中的第二、第四块, SWA分支独立计算token 7、8, 两个分支各自归一化后由门控融合. 第四块虽然重复出现, 也不能简单从一个分支删掉, 因为两条分支的softmax分母和输出投影语义不同. 在HySparse2中, recent token与global token先做集合并与去重, 再进行一次统一attention. 两代模型即使候选位置相同, 数学结果也不相同.

### 5.6. 跨层误差应按组尾测量

共享组第一层产生的indices通常对紧邻层最准确. 随着hidden states经过attention、MLP和残差更新, 下游query的偏好可能逐层漂移. 因此只报告整网平均recall会掩盖组尾退化. 更有效的测量是对组内相对位置 $r=1,2,\ldots,N$ 分桶, 计算复用候选相对于各层独立稠密attention top-k的召回率, 再同时记录候选外注意力质量:

$$
\epsilon_{l,t}=1-\sum_{j\in\mathcal S_{g,t}}A^{(l)}_{t,j}.
$$

$\epsilon_{l,t}$比单纯位置recall更接近输出误差: 漏掉一个低权重位置影响很小, 漏掉一个高权重位置影响很大. 测试集还应分别包含needle retrieval、长代码依赖、多轮对话和agent observation, 因为这些任务的注意力分布并不相同. 若组尾误差快速上升, 可缩短full间隔、扩大候选预算或对特定层单独刷新, 但每一种修复都会归还一部分计算或cache成本.

门控值也能作为诊断信号. 当global分支在组尾持续被压低而local分支权重上升, 可能说明复用indices或共享KV与当前层不匹配. 这不是充分证据: 模型也可能因任务本身偏局部而降低global gate. 应把gate、候选外质量和任务正确率联合观察, 而不是用单一阈值自动判断失效.

### 5.7. Prefill早退的依赖图与限制

普通decoder的依赖链是「第 $l$ 层hidden states -> 第 $l$ 层KV -> 第 $l+1$ 层hidden states」, 所以prompt必须穿过全部层. HySparse2把依赖改成「self-decoder full hidden states -> bridge projection -> cross-decoder共享KV」. 当请求仍处于Prefill阶段时, cross-decoder无需为每个prompt token形成最终输出hidden states; 它以后在Decode阶段只需要访问已经桥接好的历史memory.

这项节省不能写成「后半网络永远不运行」. 每个新生成token仍要经过self-decoder与cross-decoder, cross-decoder的稀疏attention和MLP仍然存在. 因而收益随输入输出比变化: 长输入、短输出时, 被跳过的大量prompt层计算占主导; 短输入、长输出时, 逐token Decode重新成为总成本中心. 评测至少要报告 prompt length、output length、TTFT和每输出token时延, 单一端到端吞吐无法说明早退来自哪里.

服务系统还要把桥接状态纳入prefix cache键、请求分叉和回收协议. 共享前缀命中时, 仅恢复普通token ID不足以继续生成; 对应self-decoder状态、bridge生成的KV、位置编码状态和量化scale必须一致. speculative decoding回滚多个草稿token时也必须同步截断这些状态. 论文结构并不自动给出这些运行时策略, 实现者需要用逐token参考执行验证状态机.

### 5.8. token级稀疏的物理成本

从block变成token后, 算术预算可以保持1024个候选, 但内存事务通常不会保持不变. 64-token block选择最多访问16段连续KV; 1024个离散token最坏可触及1024个page或cache line. 实际成本取决于候选是否排序、KV page大小、head布局、量化分组以及多个query能否复用同一批位置. 因此token-level sparsity的正确比较单位不只是selected tokens, 还包括unique pages、有效载荷字节与实际读取字节之比.

一种实现路径是先对token indices排序, 按page聚合后加载, attention输出再按逻辑位置应用因果掩码. 排序与重排本身有成本, Decode每步只有少量query时尤其敏感. 另一种路径是在候选生成阶段鼓励局部聚集, 以少量召回损失换更低事务数. 这已超出公开摘要明确说明的范围, 只能作为实现选项测量, 不能归因于HySparse2官方系统.

量化还会改变成本核算. 若KV按固定通道组共享scale, 读取一个token可能必须一并加载相邻scale元数据; 若按page量化, 随机token会反复访问page header. 报告「KV元素字节」时应同时列出scale、zero point、索引和padding. 否则算法层的cache缩减比例无法对应设备侧显存占用.

### 5.9. 训练规模能证明什么

HySparse的7B实验经历8192长度的大规模预训练与32768长度继续训练, 80B-A3B实验则直接覆盖长上下文训练. 这些结果支持的结论是: oracle选择、KV Reuse与独立SWA分支可以共同进入原生训练并维持规模化优化. 它们不证明任意现有稠密checkpoint都能通过替换attention层获得同等质量, 也不证明更长上下文无需额外位置与数据适配.

迁移实验应把初始化策略拆开. query与输出投影可以从原模型复制, 上游full KV投影能否直接服务多个下游层则要通过蒸馏或继续训练适配; gate可从偏向局部分支或均衡值起步, 两者具有不同稳定性. HySparse2的self/cross分段更改了残差计算图, 仅复制同序号参数并不能保证函数接近. 如果没有官方转换脚本和对照结果, 应把它视为新架构训练问题.

最终验收要同时保留稠密teacher. 在固定prompt上比较logits、注意力质量与长任务正确率, 再逐步开启KV共享、indices复用、SWA合并、token选择和Prefill早退. 一次性打开所有开关即使出现退化, 也无法定位是表示共享、候选错误还是运行时状态问题.

### 5.10. 与CSA2的结构差异

HySparse2与CSA2都使用跨层共享, 但共享边界不同. CSA2在同一decoder的层组内共享主KV、索引器K和top-k结果, Full/Reindex/Reuse三种模式控制何时刷新索引与何时沿用候选. HySparse先以full attention本身充当oracle, 后续稀疏层复用该full层KV与indices; HySparse2再用self/cross decoder桥接减少Prefill执行和KV来源.

两者的候选粒度也不同. HySparse以64-token block换连续访存, HySparse2公开强调token级选择并把recent window并入统一集合. CSA2的层次化索引器先缩小候选池再做精排, 目标是避免对全历史执行昂贵选择. 因此不能把它们统一简化为「每若干层算一次top-k」: oracle来源、共享状态、刷新模式、局部分支和Prefill计算图均不同.

选型时可以问三个问题. 第一, 是否愿意让full attention层周期性承担平方扫描并提供真实saliency; 第二, 是否需要长prompt在decoder中途早退; 第三, 硬件更适合连续block还是离散token gather. 答案分别决定HySparse的full间隔、HySparse2的桥接价值以及候选粒度的物理收益. 若缺少目标硬件profile与原生训练资源, 只比较论文中的理论稀疏率不足以作出工程判断.

### 5.11. 在线调度与回退

HySparse的full层会周期性产生比sparse层更高的计算与带宽峰值. 若多个请求在相同decode step同时进入full层, 设备负载可能出现规则尖峰. continuous batching可以按当前层模式重排microbatch, 但不能改变单个请求的网络顺序. 调度器需要在吞吐、等待时间和cache驻留之间权衡, 并单独记录full与sparse层的队列时间.

block indices跨层复用时应携带来源full层、query position、有效历史长度和GQA组标识. prefix cache命中后, 新请求只能复用前缀范围内已验证的indices; 新增长度仍需由当前full query刷新. speculative decoding发生回滚时, oracle结果、SWA尾部与共享KV有效长度必须一起截断. 只回滚token计数会让后续sparse层读到未来位置.

HySparse2多出self/cross边界. 请求迁移到另一设备时, 不能仅传传统逐层KV, 还要传self-decoder状态、bridge产生的共享memory、token候选和recent window. 这些状态应拥有统一版本号. 若任何组件缺失, 安全回退是从可验证前缀重新Prefill, 而不是拼接不同版本的cache.

质量回退可以缩短full间隔、扩大global预算或临时执行更密集attention. 三者分别增加全域扫描、gather和主attention成本. 系统应在上线前测出每种回退的显存峰值, 否则大量异常请求同时进入dense路径会造成容量雪崩. 公开论文没有规定生产回退协议, 这些属于部署时必须自行验证的边界.

监控还应把算法与物理指标配对: oracle覆盖质量对应选中blocks或tokens, 跨层漂移对应组内位置, 稀疏预算对应unique pages与实际读取字节, Prefill早退对应跳过的cross层数和TTFT. 只有这种配对才能区分模型退化、索引错误和kernel效率不足.

回归集合还要覆盖block边界与recent window边界. 序列长度取63、64、65等邻近值, 能暴露末块padding和因果掩码错误; window刚好与global block相交时, 可验证HySparse双分支是否保持独立语义, HySparse2并集是否正确去重. 多个GQA query heads共享一组KV heads时, 还需确认block importance的组间归约与候选广播一致. 这些边界错误往往只影响少数位置, 但会在长生成中逐步放大.

长序列压力测试应逐级提高并发, 观察共享cache是否真正降低每请求驻留量, 同时核对候选页数量没有随碎片化异常增长. 质量、显存和时延三者必须来自同一个checkpoint与同一组请求, 避免把不同配置的最佳数字拼接成不可复现的结论.

## 参考资料

- [HySparse: A Hybrid Sparse Attention Architecture with Oracle Token Selection and KV Cache Sharing](https://arxiv.org/abs/2602.03560)
- [HySparse2: Hybrid Sparse Attention with Two-Level KV Sharing](https://arxiv.org/abs/2609.26368)
- [YOCO: You Only Cache Once](https://arxiv.org/abs/2405.05254)
