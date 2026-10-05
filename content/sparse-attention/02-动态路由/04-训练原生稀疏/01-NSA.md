---
title: NSA: 压缩、选择与滑窗的训练原生稀疏 attention
description: 解析 Native Sparse Attention 的三分支算法、GQA 共享选择、训练与推理 kernel、成本账本和失败边界.
published: true
---

# NSA: 压缩、选择与滑窗的训练原生稀疏 attention

Native Sparse Attention(NSA)不是给稠密checkpoint追加的推理插件, 而是从预训练开始就存在的attention结构. 它把历史信息分到压缩、选择和滑窗三条并行分支: 压缩分支低成本覆盖全局, 选择分支从重要连续块恢复细节, 滑窗分支稳定处理局部依赖. 三个分支分别softmax, 再由可学习gate合并输出.

论文的目标同时包含算法与硬件. Prefill和训练通常受算力限制, 需要减少实际QK与AV运算并支持反向传播; Decode通常受KV读取带宽限制, 需要让同一GQA组的query heads共享连续KV块. 因此NSA的block设计不是把token级top-k换一个名字, 而是让候选单位、GQA共享和kernel tile从一开始对齐.

## 1. 三分支计算图

### 1.1. 统一输出与独立归一化

对位置 $t$ 的query $q_t$, NSA构造三组KV, 分别记为 compression、selection与window. 输出为

$$
o_t=\sum_{c\in\{cmp,slc,win\}}g_t^c\operatorname{Attn}(q_t,\widetilde K_t^c,\widetilde V_t^c),
$$

其中gate由输入特征经过MLP与sigmoid得到. 每个分支拥有自己的K/V投影并单独计算softmax. 这点决定它不能等价改写为把三组positions拼起来做一次attention: 三个分母、三套表示和gate都会改变输出.

独立分支也是训练约束. 局部模式更容易学习, 若所有候选共用一套表示与softmax, recent tokens可能形成捷径, 压缩和远距选择得不到足够梯度. 专门的window分支吸收局部模式, 让另外两条分支分别学习全局摘要与远距细节. 代价是需要维护三套投影状态, 逻辑KV条目数不能只按最终候选求和.

### 1.2. 压缩分支

压缩分支用长度 $l$、步长 $d$ 的滑动块组织历史. 每一块的keys经过带块内位置编码的可学习MLP $\varphi$ 映射成一个compressed key, values同理:

$$
\widetilde K_t^{cmp}=\{\varphi(k_{id+1:id+l})\mid 0\le i\le\lfloor(t-l)/d\rfloor\}.
$$

论文通常取 $d<l$, 让相邻压缩块重叠, 减少边界处信息被切断. 实验配置为 $l=32,d=16$, 因而长历史大约每16个token产生一个压缩entry. 压缩attention读取全部entries, 保留对全历史的覆盖, 复杂度仍随长度线性增长, 但系数显著低于读取全部原token.

压缩不是平均池化. $\varphi$可学习, 且有块内位置信息, 目标是为后续query保存可检索语义. 一个entry无法无损恢复32个token的所有细节, 所以该分支承担粗粒度全局感知, 而不是替代精细检索.

### 1.3. 选择与滑窗分支

选择分支把原始KV划为长度 $l'$ 的连续块, 保留importance最高的 $n$ 个块. 论文实验取 $l'=64,n=16$, 即最多读取1024个原始token; 其中包含固定激活的首块与两个局部块. 连续block使加载和矩阵乘法能使用规则tile, 代价是关键token会带入同块邻居.

window分支读取最近 $w$ 个token, 实验中 $w=512$. 它不依赖top-k, 为短程语法、邻近复制和最新状态提供确定路径. 由于window输出独立归一化并门控, 即使selection也选中局部块, 两条分支仍有不同语义, 不能为去重而随意删掉其中一份.

## 2. 压缩分数怎样驱动选择

### 2.1. 复用已经计算的注意力分数

NSA没有为selection增加一套独立轻量indexer. 压缩分支本来就计算

$$
p_t^{cmp}=\operatorname{Softmax}(q_t^T\widetilde K_t^{cmp}),
$$

这些分数同时提供粗粒度saliency. 当compression block与selection block使用相同划分时, 可以直接用压缩分数排序. 划分不同时, 论文根据两类块在序列上的空间覆盖关系聚合多个压缩分数, 得到selection block importance. 这样选择开销被并入一条必须存在的全局分支.

分数复用建立了明确耦合: 压缩表示既要贡献全局输出, 又要为原始token块排序. 如果压缩器保留了适合摘要的信息却无法区分细节块, selection recall会下降; 如果只为排序优化, compression输出可能变差. 原生训练让两类目标通过最终语言建模损失和分支梯度共同适配.

### 2.2. 不同block划分的映射

设压缩块长度为 $l$, 步长为 $d$, selection块长度为 $l'$, 且 $d$整除二者. 一个selection块会与多个重叠compression blocks相交. 论文把相应 $p_t^{cmp}$ 项求和得到 $p_t^{slc}[j]$. 这不是重新对原始keys做QK, 而是把已经得到的粗分数按空间关系重新归约.

以 $l=32,d=16,l'=64$ 为例, 一个64-token选择块跨越多个起点间隔16的压缩窗口. 边界附近的压缩窗口还可能同时覆盖相邻选择块, 因而importance不是简单每四项分一组. 实现必须严格复现公式的索引偏移、序列开头处理和因果边界; 用直觉分桶会在块边界产生系统偏差.

top-$n$之后, selected blocks按整数位置gather原始selection K/V. 候选个数大致固定, 但历史较短或固定首块、局部块与动态top块重叠时, 实际unique blocks会减少. kernel需要规定去重与顺序, 训练反向也要把梯度scatter回正确原位置.

### 2.3. GQA组内共享选择

GQA中多个query heads共享一组KV heads. 若每个query head各选不同块, 实际KV读取是所有选择的并集, 算术稀疏却不一定减少带宽. NSA把同一GQA组内各query head的block importance相加, 形成共享排序, 然后所有heads读取同一批KV blocks.

这种聚合牺牲部分head专属性. 某个head独有的重要块可能被其他heads的总分压过, 但共享候选避免重复HBM读取, 还能把整组queries同时放入片上存储. 质量与物理效率的折中发生在选择规则本身, 不能等到kernel阶段再弥补.

验收时应同时测per-head oracle recall与group-union读取量. 独立head top-k的召回可作为质量上界, 共享top-k是实际路径. 若只比较FLOPs, 会遗漏GQA下候选并集导致的读放大; 若只比较字节, 又看不到少数专用head的质量损失.

## 3. 训练、Prefill与Decode一致性

### 3.1. 原生训练意味着什么

NSA论文用27B总参数、3B激活参数的MoE骨干进行实验, 30层, 4个GQA组与64个attention heads. NSA与Full Attention基线都在8k长度数据上预训练约270B tokens, 再用32k数据继续训练与监督微调. 论文报告训练损失稳定, 并在通用、长上下文与推理评测上比较.

这里的证据支持「三分支稀疏结构可端到端训练」, 不支持「任意稠密模型可无损改成NSA」. 三分支拥有独立KV、压缩MLP、gate与共享block选择, 参数和优化路径从训练开始就不同. 对已有checkpoint做迁移需要新增参数初始化、蒸馏和继续训练, 论文结果不能直接作为迁移保证.

原生还指稀疏存在于前向与反向. 若前向只计算selected blocks, 反向也应只对对应QK/AV路径计算梯度, 才能节省训练计算. top-n索引本身是离散的, 未入选blocks不会通过selection分支获得梯度, 但compression分支仍对全局压缩entries传播梯度, window分支则稳定局部学习.

### 3.2. Prefill为何能够稀疏

许多后处理方法需要先用稠密Prefill生成attention map或索引, 只在Decode稀疏. NSA的importance来自压缩分支自身, 而压缩分支本就是稀疏架构的一部分. Prefill可对每个query生成压缩分数、归约block importance并执行selected attention, 不需要先跑一遍完整原token attention.

Prefill中query数多, attention通常compute-bound. 因此重点是减少实际矩阵乘法并保持Tensor Core利用率. 连续selection blocks允许按块加载KV; 压缩和window可沿用规则attention kernel. 但top-n、索引映射和不规则query-to-block关系仍有开销, 理论非零元素比例不会原样变成加速比.

因果训练还要求每个query只选可见blocks. selection block若跨过当前位置, 必须掩掉未来token; 压缩窗口若包含未来位置也不能供当前query使用. 短序列单元测试应覆盖块首、块中和块尾, 对比显式朴素实现的输出与梯度.

### 3.3. Decode为何强调共享读取

Decode每步query很少, 主要成本是读取历史KV. NSA只读取全部compressed KV、固定window KV与少量selected original blocks. 当上下文足够长时, 读取量近似 $t/d+w+nl'$, 相比全历史 $t$ 降低; 压缩分支仍线性增长, 因而不是常数内存访问.

同一GQA组的heads共享selected blocks, kernel一次加载连续KV块到片上存储, 再与整组queries计算. 论文kernel把query/output循环放到grid调度, 内层顺序读取选中的连续块. 这种group-centric布局同时提高算术强度并避免每个head重复读取KV.

Decode状态包含三套K/V以及压缩器尾部. 新token到来时, window追加并淘汰最旧项; selection原始KV需保留供未来块选择; compression每隔步长产生或更新entry. 因此NSA减少每步读取, 不必然减少所有KV存储. 计算cache字节时应分别列出三套投影、重叠压缩entry和量化元数据.

## 4. Kernel与成本核算

### 4.1. 为什么按block而不是token

随机token gather会形成大量短事务, 难以填满矩阵乘单元. 64-token选择块把每个index转成一段连续地址, kernel块 $B_k$只需满足 $B_k\mid l'$, 就能分块加载到SRAM. 多算同块低价值token换取更少事务和规则矩阵形状, 是NSA明确的硬件折中.

block size太大时, 候选预算浪费在邻居上; 太小时, index数量、排序与事务数增加. 最佳值依赖head维度、dtype、page布局与设备. 论文在A100与特定配置上的结果不能自动外推到其他加速器, 复现应重新profile而不是只保持相同理论稀疏率.

### 4.2. 三条分支的计算账

设历史长度为 $t$, 压缩步长为 $d$, window为 $w$, 选择 $n$ 个长度 $l'$ 的块. 单query参与attention的逻辑KV数量近似

$$
N_t\approx t/d+w+nl'.
$$

代入论文实验值, 长上下文时为 $t/16+512+1024$. 64k上下文约为5632个逻辑位置, 显著少于65536. 但三条分支分别softmax并有独立投影, 还存在压缩MLP、importance归约、top-n、索引和gate, 所以不能把 $65536/5632$ 直接称为端到端加速倍数.

训练要分别核算forward与backward, Prefill记录QK、AV和选择工作区, Decode记录HBM实际读取字节. selection blocks若分散在许多pages, 物理读取可能大于有效载荷; compression blocks重叠会增加构造计算; window与selected local blocks重复并不会消除双分支计算.

### 4.3. 可复现的性能实验

性能实验应固定模型shape、dtype、batch、GQA组数和序列长度, 比较Full Attention与NSA完整三分支. 只测selection kernel不能代表总结构, 只测端到端模型又会被MoE通信与MLP掩盖. 两类结果都要提供, 并报告warm-up、编译配置和峰值显存.

序列长度从短到长扫描能够找到交叉点. 短序列上top-n与三次launch可能比稠密kernel更贵; 长序列上压缩比例与固定选择预算才占优势. Decode还应扫描batch size, 因为更多并发query会提高算术强度, 改变带宽瓶颈.

训练验证不能省略梯度. 对小shape使用双精度朴素实现, 固定top-n indices后比较Q、K、V、压缩MLP和gate梯度; 再单独测试选择边界的离散变化. 最终用长序列观察反向workspace和是否出现数值溢出.

## 5. 质量边界与相邻路线

### 5.1. 三类失败分别来自哪里

压缩失败发生在重要细节没有进入compressed representation, 会同时削弱全局输出与block排序. 选择失败发生在importance映射或group聚合漏掉关键原始块. window失败发生在局部跨度超过 $w$ 或局部分支形成过强捷径. 三者可能在最终logit上叠加, 需要分支级消融定位.

可以记录gate分布、compressed attention质量、selected blocks相对于稠密oracle的覆盖率以及window距离直方图. gate低不必然代表分支无用, 因为少数关键query可能高度依赖它; 平均recall高也可能漏掉唯一证据. 测试集应包含多证据检索、长代码引用、长推理与局部复制.

固定激活首块和局部块为极端模式提供保底, 但也占用 $n$ 的预算. 当上下文包含大量分散证据时, 16个blocks可能不足; 增大 $n$ 提升召回, 同时线性增加selected attention与读取. 这是真实质量—成本旋钮, 不是仅调kernel就能消除的限制.

### 5.2. 与DSA、CSA/HCA的区别

DSA使用独立轻量indexer对历史token打分, 再从主MLA KV中读取token级top-k. 它的代理目标、索引K和主attention可分别训练与量化. NSA不另建selector, 而是复用compression attention分数, 候选单位是连续原始token blocks, 并保留独立window分支.

CSA同样先压缩token轴再稀疏选择, 但本文对CSA的说明只依据V4公开报告: 它在压缩entries上执行主attention, 与NSA选择分支回读原始连续blocks不同. HCA对更强压缩后的全部entries做attention, 没有动态top-k漏选, 误差主要来自压缩. NSA则让compression全覆盖与selected原始细节并行存在.

不要因为NSA作者与后续模型团队存在关联, 就把论文结构直接等同某个未完整披露模型的内部实现. 可验证结论只来自NSA论文的算法、实验配置与kernel说明. 模型版本若没有官方技术材料明确引用, 应保留未知.

### 5.3. 与HySparse及跨层共享的区别

HySparse的oracle来自周期性full attention layer产生的真实block scores, 后续多个sparse layers跨层复用indices与该full层KV. NSA在每个层内由compression分支产生importance, 没有依赖上一full层的跨层oracle. 前者用full刷新换真实saliency, 后者用原生压缩分支保持所有层可训练稀疏.

HySparse保留独立SWA分支, 与NSA专门的window分支有表面相似性; 但其global sparse分支共享上游full KV, NSA三分支拥有独立K/V并在本层训练. HySparse2进一步加入self/cross decoder的KV Bridging与Prefill早退, NSA论文没有这一跨decoder机制.

选型应先问是否拥有原生预训练机会. 若有, NSA可以让训练、Prefill和Decode使用同一稀疏结构; 若只有既有checkpoint, 后处理或继续训练路线更现实. 再问硬件是否能从连续block与GQA共享中获益, 以及业务是否接受固定block预算的召回边界.

### 5.4. 工程验收清单

首先验证compression窗口数量、重叠关系、块内位置编码和因果边界. 然后验证importance从compression到selection的索引映射, 特别是序列开头、未满末块与固定激活块. 接着验证GQA组内聚合、top-n稳定排序、去重与连续KV地址.

分支输出测试要确认三次softmax、三套K/V和gate顺序. 将某一gate置零应只移除对应分支; 将selected budget覆盖全部历史时, selection分支应退化为相应投影上的dense attention; window扩展到全历史时也应与该分支的dense参考对齐.

最后把质量、训练吞吐、Prefill TTFT、Decode时延、逻辑FLOPs、实际读字节和峰值显存放在同一配置表. **NSA的核心不是单一稀疏模式, 而是让粗粒度全局覆盖、细粒度连续块和局部窗口共同进入原生训练与硬件对齐执行.** 缺少任一分支或只在Decode启用选择, 都不能直接沿用论文结论.

### 5.5. 一个短序列的完整手算

设历史长度为128, compression block长度32、stride 16, 则完整窗口起点为1、17、33、49、65、81、97, 共7个compressed entries. selection block长度64时只有前后两个原始块. 对位于序列末尾的query, compression分支对7个entries做attention; selection分支根据7个压缩权重向两个64-token块归约; window若为32则读取最后32个token.

假设归约后前块分数0.35、后块0.65, 动态预算只允许一个block, selection选择后64个token. 这个结果与直接对128个原始token取top-64不同: 后块内即使只有一个关键位置, 其余63个邻居仍会参与selection softmax. 同时window的最后32个token也位于后块, 但它们通过独立window K/V和独立softmax再次贡献. gate决定两种表示的组合, 不能对positions去重后只算一次.

再考虑因果位置70. 起点49的32-token compression窗口跨到token 80, 其中未来部分对该query不可见; 起点65窗口也未完整可见. 实现可只使用已经完整的窗口, 或对尾部做带mask的部分压缩, 但必须与训练定义一致. selection的第二个64-token块也只能访问65到70. 这说明「按块读取」仍需token级因果mask, 不能因block被选中就暴露完整物理块.

论文实际配置还固定首块与两个局部块. 当历史短到这些固定块覆盖全部序列时, 动态top-n会出现大量重叠, unique blocks少于16. 性能测试若始终按16乘64估算读取会高估短序列成本; kernel若不去重则会重复计算并改变独立selection分支内部的softmax质量. 两种行为都应由参考实现明确规定.

### 5.6. 梯度与选择稳定性

在固定indices条件下, selection attention对选中K/V与query完全可微, compression和window分支也有普通attention梯度. 不连续点发生在两个block importance交换排序的位置. 常规自动微分把top-n结果视为当前前向的离散路由, 未选block不会通过selection路径获得梯度; 它仍可能通过compression路径影响损失和未来importance.

因此训练诊断不只看总loss. 应记录候选集合在相邻checkpoint之间的Jaccard相似度、top-n边界分差、各分支gate和压缩分数熵. 如果边界分差长期接近零, 很小数值扰动就会频繁换块, 造成梯度噪声与不可复现排序. 稳定排序规则可确保相同输入得到相同indices, 却不能替代模型学习更清晰的importance.

混合精度会放大边界问题. compression score在低精度下归约到selection blocks, 多个GQA heads再求和, 累积顺序会影响接近的分数. 验收应以高精度归约作为参考, 分别比较importance误差、indices一致率与最终输出误差. 若只比较logits, 不容易判断是候选变化还是attention数值变化.

反向kernel还要处理同一原始block被batch内多个queries选中. gradient scatter可能产生原子写冲突或额外归约workspace. 训练速度报告应包含这一真实反向路径, 不能用固定随机indices且无梯度的前向microbenchmark代替.

### 5.7. Cache布局与生命周期

三分支独立K/V意味着每个新token通常产生selection K/V与window K/V, compression K/V则按stride生成. window只需保留最近 $w$ 项; selection历史要保留, 因为未来任一query都可能选中远距block; compressed历史也要保留用于全局attention与importance. 忽略量化时, 长序列主要状态近似为

$$
M\approx 2b_eH_{kv}\left(nd_{slc}+wd_{win}+\frac{n}{d}d_{cmp}\right),
$$

其中三个分支的head维度可能不同, 不能直接合并成一个统一系数. 公式还未包含压缩尾部原始状态、索引、位置编码与scale.

prefix cache复用需要三条分支来自同一checkpoint和同一blocking配置. 改变 $l,d,l',w$ 后, 旧compressed entries与selection block编号都不再兼容. cache key应编码这些结构参数以及K/V投影版本. 请求从共享前缀继续时, 未满compression窗口的原始尾部也必须恢复, 否则下一个entry会遗漏前缀token.

continuous batching中不同请求的top-n blocks不同. selection kernel可把每个请求与GQA组作为调度单元, 但过多短任务会增加grid开销; 将它们合并又可能引入padding. 工程上应记录每次launch的有效queries、selected block数和加载字节, 用真实分布选择batch策略.

speculative decoding回滚时, window尾部、selection原始KV和compression部分窗口要同步截断. 已完成且完全位于确认前缀内的compressed entries可保留; 包含草稿token的entry必须重建. 这种生命周期规则是实现推论, 论文没有给出生产状态机, 因而需要逐token参考测试确认.

分布式部署还要保持GQA组与KV分片对齐. 如果同组query heads分散到多个tensor parallel rank, 先聚合importance再做全局top-n会引入通信; 若每个rank局部选择, 最终KV读取并集又可能扩大. 更合适的切分通常让共享一个KV head的queries共置, 但还需兼顾投影与输出通信. pipeline parallel不会改变层内三分支语义, 却要求每个stage保存本层完整的压缩尾部和原始selection cache. 这些布局成本应计入端到端结果, 不能只引用单卡kernel速度.

上线前可用故障注入验证状态管理: 改错一个selection block编号、丢弃一个未满compression尾部、交换两个GQA组的indices, 确认校验与canary输出能发现. 静默读错KV往往仍产生有限数值, 比显式崩溃更难定位. 元数据中保留请求、层、分支、位置范围与结构版本, 能把错误缩小到具体数据路径.

## 参考资料

- [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089)
