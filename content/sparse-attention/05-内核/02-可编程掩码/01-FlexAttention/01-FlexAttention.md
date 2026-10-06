---
title: FlexAttention：从规则到融合内核
description: 推导mask_mod、score_mod、BlockMask和online softmax如何编译为训练与推理内核，并给出分页KV、反向、基准和故障诊断方法。
published: true
---

# FlexAttention：从规则到融合内核

注意力变体有一种很实际的“组合爆炸”。因果mask、滑动窗口、prefix LM、document mask、ALiBi、soft cap、GQA和分页KV分别都不难；任取几项组合后，现成融合kernel常常就用不上了。退回 `scores = QK^T` 再逐项修改最容易验证，却会物化平方级分数矩阵。为每个组合各写一套CUDA或Triton，研究代码很快被数据布局、反向和硬件细节淹没。

FlexAttention提供一个编译驱动的中间层。模型作者提交两个小函数：`mask_mod`定义允许的 $(q,k)$ 集合，`score_mod`定义分数变换。编译器分析这些函数，将它们融合进FlashAttention式tile循环；BlockMask再把逐元素集合提升到块级工作表，让完全无效的KV tile从主循环消失。论文将目标概括为「用普通PyTorch表达注意力变体，同时生成接近手写融合算子的代码」。

这套抽象的关键是三次转换：数学规则怎样变成可编译函数，逐元素mask怎样变成块稀疏元数据，块表怎样进入online softmax、反向和decode。API只是这些转换的入口。任何一次转换丢失语义，结果都会在边界位置出错；任何一次转换只做了逻辑稀疏而没有跳过物理工作，性能也不会兑现。

## 1. 从注意力定义到两个mod函数

### 1.1. mask_mod定义允许集合

设query、key位置分别为 $i,j$，批次和head索引为 $b,h$。mask函数

$$
m(b,h,i,j)\in\{0,1\}
$$

决定连接是否存在。因果注意力为 $m=i\ge j$；左侧窗口 $W$ 加入 $i-j<W$；document mask再要求 $d_b(i)=d_b(j)$。组合后的集合写成

$$
m_{local\_doc}(b,h,i,j)=[j\le i]\land[i-j<W]\land[d_b(i)=d_b(j)].
$$

对应的函数只接收索引和被捕获的document ID张量，不创建 $N\times N$ 布尔矩阵。编译器可以在一个tile内向量化这些比较，也可以在创建BlockMask时用同一规则判断整块是否为空。 集合定义必须和模型真实语义一致。padding token是否允许被看见、prefix区域能否双向连接、生成区域能否访问全部prefix、不同head是否使用不同窗口，都要落到返回值里。逻辑运算的一个括号就可能改变大量连接。最小参考测试应枚举小长度下所有 $(b,h,i,j)$，与人工列出的邻接矩阵逐项比较。

FlexAttention官方API还提供 `and_masks` 与 `or_masks`。它们解决函数组合的样板代码，不能判断组合是否合理。两个允许集合取交集会变得更稀疏，取并集会变得更稠密；把“因果或同文档”写成并集，可能让同一文档内部看到未来。组合前先写集合公式，比在函数里堆布尔表达式更容易审查。

### 1.2. score_mod修改分数

标准缩放点积为

$$
s_{bhij}=\frac{q_{bhi}^{\mathsf T}k_{bhj}}{\sqrt d}.
$$

`score_mod(score,b,h,q_idx,kv_idx)` 接收这个标量并返回修改后的分数。例如ALiBi加入与距离成比例的head特定偏置，soft cap可以写成

$$
\tilde s=C\tanh(s/C),
$$

相对位置表则读取 $r_h(i-j)$ 并相加。修改后的softmax为

$$
p_{bhij}=\frac{m_{bhij}\exp(\tilde s_{bhij})}
{\sum_{t:m_{bhit}=1}\exp(\tilde s_{bhit})}.
$$

mask与score承担不同语义。把无效位置的score设成一个有限负数并不能严格删除连接，长序列下大量微小概率仍可能积累；布尔mask会在softmax前将其排除。反过来，ALiBi只是改变偏好，不应该据此删除远距离token。两类规则分开后，BlockMask只需分析真正的结构稀疏。 score修改的顺序也要明确。设缩放、偏置、soft cap分别为 $a$、$r$、$c$，$c(as+r)$ 与 $ac(s)+r$ 通常不相等。实现若把若干函数合并为一个 `score_mod`，应让公式和代码保持同一顺序，并用高精度reference覆盖极大正负分数，防止低精度下饱和位置不同。

### 1.3. 捕获张量与动态shape

mod函数常要读取外部状态。document mask需要每个token的document ID，滑动窗口可能从每个head的窗口表取值，检索mask可能读取query对应的段边界。被捕获张量需要位于合适设备，dtype与索引范围也要稳定。若闭包依赖普通Python列表、随机数或会变化的对象属性，图捕获可能常量化旧值、触发graph break或反复编译。

动态长度带来两层变化。Q/K/V shape变化会影响kernel specialization，BlockMask的Q_LEN/KV_LEN也必须覆盖本次输入。官方源码会检查mask长度：小于实际输入无法提供完整索引，大于输入则不能盲目裁剪，因为某些规则的左上角裁剪不等价于重新生成。固定最大长度并切片只适用于能够证明前缀闭包的mask。 可执行的缓存键至少包含设备、dtype相关后端、batch/head广播方式、Q/KV长度、block size以及所有会改变mask结构的张量版本。score_mod只改数值而不改集合时可以复用BlockMask；document边界变化则必须重建。把“编译缓存”和“mask缓存”分开记录命中率，才能知道冷启动来自哪一层。

### 1.4. GQA与head广播

GQA中query heads数量大于KV heads，映射关系通常为 $h_{kv}=\lfloor h_q/g\rfloor$。mask按query head定义还是按KV head共享，需要由模型规则决定。若所有heads使用同一因果或窗口结构，BlockMask的H维可以广播；head特定窗口、ALiBi斜率或路由模式则不能错误共享。 score_mod接收的是query head索引。读取KV侧参数时必须先做head映射；读取ALiBi斜率则直接用query head。这个区别在MHA里看不出来，因为两侧head一一对应。用一个小GQA样例让两个query heads共享同一KV head、却具有不同score偏置，可以发现错误广播。 `enable_gqa`一类开关只处理Q与K/V的head形状关系，不会自动修正自定义函数里的head语义。测试矩阵应同时包含MHA、MQA与GQA，比较展开KV后的稠密reference。展开只用于测试，生产路径仍应共享KV，避免复制cache。

## 2. BlockMask怎样把元素规则变成工作表

### 2.1. 块级压缩格式

设query block大小为 $B_q$、KV block大小为 $B_k$，则逻辑矩阵被切成

$$
N_q=\lceil Q/B_q\rceil,\qquad N_k=\lceil K/B_k\rceil
$$

个块。对每个query block，BlockMask保存有效KV block数量与索引。它类似BCSR：`kv_num_blocks`给出每行长度，`kv_indices`给出列号。官方文档把它称作块稀疏mask与非稀疏格式之间的折中，优先考虑实现简单和kernel效率，而非把元数据压到最小。 若每行平均保留 $r$ 个KV blocks，索引规模约为 $O(N_qr)$；逐元素布尔mask为 $O(QK)$。在64K序列、128×128块上，二维矩阵有262144个块，元素矩阵却有约42亿项。即使块表没有进行极致压缩，它仍比逐元素mask小多个数量级。 BlockMask通常还保存反向需要的query侧转置索引。前向从query block查KV blocks，dK/dV路径更适合从KV block查相关query blocks。运行时临时转置会增加排序和workspace，预先生成则增加元数据。只做推理与需要训练反向的mask，在构造选项上可以不同。

### 2.2. full blocks与partial blocks

一个块内所有 $(i,j)$ 都允许时，它是full block；全部禁止时可以删除；其余是partial block。full block进入主循环后无需调用逐元素mask，partial block仍要生成布尔谓词。因果对角线、窗口边缘和文档边界通常形成partial blocks，远离边缘的内部块则全满或全空。 设有效元素数为 $E$，被执行块覆盖的元素数为 $P$，块利用率

$$
u=E/P.
$$

逻辑稀疏率只看 $E/(QK)$，kernel成本更接近 $P$。如果每个有效token都散落在不同块里，$E$很小而$P$接近全矩阵，BlockMask无法带来相同比例的计算节省。选择block size时要同时报告被跳过块比例与partial blocks内部利用率。 官方API的 `separate_full_blocks` 允许构造器区分full与partial列表。关闭分流可能减少元数据准备，却让全满块重复执行mask逻辑。规则简单、partial比例很高时差异有限；长滑窗或大文档块中full区域占多数时，分流价值更大。

为什么不能只用score_mod统一处理，可以用因果mask算一遍。对角线以下的大多数blocks全部有效，只有对角线blocks需要逐元素比较 $i\ge j$。如果每个score都执行 `where(valid,score,-inf)`，全满区域也承担分支与索引计算。PyTorch官方博客在其基准里观察到约15%到20%的性能下降。BlockMask把全满块单独列出后，这些块只保留真正的score修改，因果判断只落在对角边缘。

元数据内存同样能手算。默认128块时，百万长度每轴约7813个块；官方实现的表还会受到batch/head广播、full/partial列表与反向索引影响。官方博客给出的典型额外内存约60MB，而block size提升到1024后可压到1MB以下。数字说明BlockMask不是零成本，但相较百万长度的KV与平方mask仍很小。决定块大小时，要把常驻内存和执行浪费一起放进曲线。

### 2.3. 从mask_mod生成块表

最直接的构造方法是在每个块内评估 `mask_mod`，归约出any/all，再生成压缩索引。若逐元素扫描整个 $QK$ 空间，构造成本仍是平方级，只是运行attention时省下工作。固定mask可以摊销一次构造；每步变化的动态mask则可能被准备阶段卡住。 结构已知时，可以直接从区间或候选块生成BlockMask。例如滑动窗口中query block $r$ 只接触附近若干KV blocks，不必遍历远处空块；检索系统已经输出块ID时，也可规范化、排序后进入表。无论怎样生成，都应保留 `mask_mod` 作为partial block的精确判定，否则块边缘会多算非法连接。 构造器本身也能编译。收益取决于shape与复用次数：长固定序列的初始化成本可以忽略，短请求逐个创建则可能比attention更慢。基准应分别记录BlockMask build、编译、kernel和端到端时间；把预计算排除在外时，应明确部署确实能缓存。

### 2.4. 长度裁剪与mask复用

decode常在最大长度上预建方形BlockMask，然后取当前query对应的行。因果与固定滑窗具有稳定前缀结构，可以这样复用。依赖总长度的规则未必成立：若某个token只连接序列末端块，最大长度mask裁到短序列后，末端位置已经改变；环形或对称中心规则同样不能简单裁剪。 复用验证可以对多个目标长度分别重新构建mask，与缓存裁剪结果比较块索引和逐元素邻接。只有全部相等，才把规则加入可裁剪白名单。官方源码对过大BlockMask给出显式警告与调整入口，正是因为左上角裁剪没有普遍正确性。

batch内变长序列还要处理每个样本的有效长度。把B维设为 `None` 表示结构广播，只适合同一规则；每个样本document边界不同，就需要B维索引或在partial规则中读取长度。为了省元数据而广播错误mask，会造成跨样本padding访问或信息泄漏。

## 3. 融合kernel里的softmax语义

### 3.1. tile循环与online softmax

对一个query行，softmax可以分块归并。处理第 $t$ 个KV tile时，局部最大值为 $m_t$，局部指数和为 $l_t$。累计状态 $(m,l,o)$ 更新为

$$
m'=\max(m,m_t),
$$

$$
l'=e^{m-m'}l+e^{m_t-m'}l_t,
$$

$$
o'=e^{m-m'}o+e^{m_t-m'}o_t.
$$

遍历完允许的tiles后输出 $o/l$。这就是FlashAttention不物化完整概率矩阵的关键。FlexAttention把score_mod与partial mask放进每个tile的分数阶段，随后仍用相同归并式维护数值稳定性。 跳过全空块不会改变分母，因为这些位置本就应被mask排除。full块直接计算QK、score修改和softmax；partial块在指数前把无效项置为负无穷。若mask在局部归并之后才应用，非法位置已经污染局部最大值与指数和，之后再清零无法恢复正确分母。 一行没有任何有效key时，softmax没有普通定义。模型规则通常应保证至少自连接、prefix连接或一个sink token。确实允许空行时，需要约定输出为零还是抛错，并让reference与kernel一致。随机稀疏测试必须覆盖空行，否则NaN可能只在极端路由结果出现。

### 3.2. score_mod的融合成本

简单比较、加法和乘法通常能以少量逐元素指令融合。复杂的查表、分支、指数或大量捕获张量读取会增加寄存器和内存压力。一个函数能被编译不代表代价可以忽略；相同BlockMask下，分别测no-op、实际score_mod与手写等价kernel，才能量出规则本身的成本。 分支发散取决于同一warp内索引是否走不同路径。按head选择不同偏置通常较规则，按每个token类别执行多路Python式条件可能生成大量predication。可以把静态分支提前特化为不同编译图，也可以把小表加载到合适缓存层。选择要看编译数量与运行效率的交换。

soft cap等非线性还会改变数值误差。在线softmax一般以fp32维护最大值与归一化统计，即使Q/K/V为bf16；score_mod若在低精度提前饱和，reference要使用相同cast位置。只比较最终生成文本很难发现小偏差，单层测试应对输出与log-sum-exp同时设容差。 编译模板的优势在这里很清楚：它没有要求通用编译器识别“两次矩阵乘之间夹着安全softmax”的代数结构，而是把QK、online softmax、PV和反向重算固定为手写骨架，只为score_mod生成一小段代码块。论文指出，传统算子级编译器即使能生成attention前向，也容易漏掉安全softmax、反向或块稀疏。模板化lowering缩小了搜索空间，代价是可表达变化必须落在接口允许的位置。

这也给出功能边界。若变体需要在softmax之后跨行归一化、让一个query的规则依赖另一query的动态输出，或改变V聚合为完全不同的算子，单个score_mod不一定能表达。强行把额外大张量访问塞进逐元素函数，虽然可能编译，数据流却已偏离模板最擅长的区域。此时先画清算子图，再决定扩展模板还是写专用kernel。

### 3.3. split-KV严格归并

decode中Q_LEN很小，单个query block不足以占满GPU。可把KV blocks分给多个program，分别产生局部 $(m_s,l_s,o_s)$，再按online softmax公式归并。不能先对每片做完整softmax再平均输出，因为各片分母不同。 设分片结果为 $m_s,l_s,o_s$，全局最大值 $m=\max_s m_s$，则

$$
l=\sum_s e^{m_s-m}l_s,\qquad
o=\sum_s e^{m_s-m}o_s,\qquad y=o/l.
$$

BlockMask让各分片拥有的有效块数不均衡。按连续KV范围平分可能让一个program拿到多数命中，其他program几乎空闲。更好的调度依据是有效块计数，同时保留稳定顺序与可合并的地址访问。 split数量过大会增加中间buffer与第二阶段归并，过小又没有足够并行度。FlexDecoding路径会根据shape选择策略，手动kernel选项只适合经过基准确认的稳定服务shape。训练prefill的最优参数不能直接复制到decode。

### 3.4. 块大小与roofline

块变大能提高矩阵乘tile效率、减少索引条目，却扩大partial block浪费；块变小提高稀疏精度，却增加调度、地址计算和kernel启动开销。对平均每行保留 $r$ 个块的情形，逻辑QK FLOPs近似

$$
F_{logic}\approx2BH N_q r B_qB_kd,
$$

实际FLOPs还要加上partial块内被mask掉的位置。元数据读取约与 $BH N_qr$ 成正比。随着 $B_q,B_k$ 变小，计算下降可能没有索引与launch增长快。 算术强度还受V维度、GQA共享和cache命中影响。prefill的大tile容易进入Tensor Core友好区域；decode读取长KV通常更偏带宽受限。roofline估算至少列出Q/K/V字节、索引字节、实际tile FLOPs和输出写回，不能只用逻辑有效边计算强度。 自动调优会尝试BLOCK_M、BLOCK_N、warps和stages等组合。候选集合受寄存器与共享内存上限约束。一个规则在A100上的最佳tile未必适合Hopper或其他后端。保留硬件、驱动、PyTorch/Triton版本与编译选项，性能数字才可复现。

## 4. 编译、自动调优与反向

### 4.1. 图捕获与specialization

FlexAttention通过高阶算子把mod函数带入编译图。编译器需要看到函数代码、捕获张量和shape关系，才能生成融合实现。Graph break会退回慢路径或直接报错；数据依赖的Python控制流、运行时修改全局变量、在函数中分配不受支持对象都应避免。 specialization能把常量窗口、block size和head规则折叠进代码，提高内核质量，却会产生多个编译版本。在线服务若长度和规则组合很多，编译缓存会膨胀并引入尾延迟。把连续变化值留作张量输入、把少量稳定类别作为specialization，是更可控的划分。 冷启动基准应单独测第一次编译、首次自动调优、缓存命中执行。只报告热态kernel时间适合比较稳态吞吐，不能代表短任务或弹性实例的用户体验。部署可在已知shape集合上预热，但预热清单必须与路由到该实例的请求约束一致。

论文的实现链条可以分成四步：TorchDynamo捕获包含高阶FlexAttention算子的图；score_mod与mask_mod各自形成可分析子图；TorchInductor把子图lower到attention模板中的插槽；Triton生成目标GPU代码。自动微分为mod函数建立反向图，模板负责Q/K/V主循环和保存必要中间量。理解这条链后，故障位置更容易划分：graph break属于前端捕获，错误融合属于lowering，寄存器或tile问题属于后端代码生成。

闭包中的张量不一定要显式作为Python参数传给mod函数，Dynamo可以把它提升为图输入。官方示例用可变化的二维bias表说明这一点。便利之外还要管理生命周期：bias内容改变可以复用已编译代码，shape或stride变化可能需要新specialization；设备迁移后继续引用旧闭包张量则会报错或触发复制。

### 4.2. kernel选项怎样理解

官方API暴露诸如 `BLOCK_M`、`BLOCK_N`、`num_warps`、`num_stages`、是否预缩放QK以及前后向独立选项。这些属于性能控制面，并非稳定模型语义。版本升级后默认启发式和可用后端会变化，生产配置要通过回归基准，而不是长期依赖内部标志名字。 更多warps可能增加并行与隐藏延迟，也会提高寄存器压力；更多pipeline stages可重叠加载与计算，也占用共享内存。BLOCK_N增大有利于矩阵乘，却可能放大稀疏边缘浪费。调优记录应同时保存占用率、寄存器、共享内存、spill和有效带宽，避免只盯最短一次测量。 当前源码还允许选择不同backend或decode路径。强制某一后端适合做差异诊断，默认AUTO更能随版本利用新实现。正确性测试要跨后端运行同一reference；性能回归则允许默认选择改变，但必须标注实际落到哪条kernel。

论文给出的整体性能范围比单点峰值更有参考价值：在七类attention变体中，相对FA2约为0.68×到1.43×；decode相对FAKV约为0.93×到1.45×。同一个系统既可能慢于专用基线，也可能因更好的块跳过而更快。端到端案例还报告16K上下文gpt-fast推理约2.04×、torchtune训练约2.4×的提升，这些收益包含具体模型、mask与系统集成，不能外推成固定倍数。 官方早期博客的A100因果案例更接近通用性开销：前向约为FA2性能的90%，反向约85%。当目标模式本来就有成熟专用kernel时，这部分差距可能值得保留专用路径；当模式是多种规则组合、dense fallback会物化分数矩阵时，FlexAttention即使没有追平最快专用实现，也可能远胜组合算子。

### 4.3. backward的两种聚合方向

前向按query block遍历KV blocks，dQ沿相同方向自然累积。dK与dV会接收多个query blocks的贡献。如果每个query program直接原子写入dK/dV，竞争可能严重；转置BlockMask后按KV block收集query blocks，可让一个program拥有更连续的写入区域。 score_mod对score的导数也进入反向。加性偏置导数简单，soft cap需要乘上 $1-\tanh^2(s/C)$，捕获的可训练张量还可能需要梯度。mask是离散集合，通常不对布尔决策求导；若路由器需要学习选择，应在FlexAttention外定义代理梯度或连续权重，不能假设BlockMask索引自动可导。 反向正确性可用double或fp32小shape做gradcheck，再和显式dense实现比较dQ/dK/dV以及可训练score参数。覆盖full blocks、partial blocks、重复结构、空候选防护和GQA。只比前向会漏掉转置索引、写回排序与原子累积问题。

### 4.4. activation checkpointing与确定性

checkpointing在backward重新执行前向片段。mod函数若读取会变化的全局step、随机采样或原地更新的张量，重算图可能与原前向不同。BlockMask应作为确定输入保存或通过相同状态重建，随机路由则要保存种子与采样结果。 浮点归并顺序变化会产生非bitwise差异。确定性验收需要区分“数学索引一致”与“位级输出一致”：前者必须满足，后者可能因split-KV、原子写入和调度顺序而变化。质量回归使用数值容差，调试索引时则比较离散块表和逐元素mask的精确相等。 官方论文和博客强调生成kernel的数值准确性可与FlashAttention比较，但这不是所有自定义score函数都天然安全。极端偏置、全空行、低精度饱和与超长归并仍需要自己的测试范围。

## 5. 推理、分页KV与动态稀疏

### 5.1. Prefill与decode分开看

prefill中Q与KV都较长，二维query tiles提供足够并行度，BlockMask能跳过大量二维区域。decode通常 $Q=1$ 或很小，只有KV轴可切。相同逻辑mask在两阶段形成不同shape：滑窗prefill是一条对角带，decode则是一行尾部区间。 基准矩阵要把TTFT与TPOT分开。prefill优化主要影响首token延迟和长prompt吞吐，decode优化影响逐token时延。把两者平均成tokens/s会掩盖某一阶段退化。长上下文服务还应按prompt长度与并发分桶。 训练时的BlockMask往往按固定batch/长度生成，decode要随当前位置移动query offset。官方推理博客特别提醒：切出BlockMask行后，mask_mod也要带上全局offset。若仍把局部query索引当0，因果或窗口判断会访问错误位置。

### 5.2. 预建最大mask与切片

固定最大上下文 $L_{max}$ 时，可以初始化一张 $L_{max}\times L_{max}$ BlockMask。第 $i$ 个decode位置取对应query block，并让mod函数看到全局 $i$。块内还包含多个query行，因此切片粒度和实际Q长度必须匹配，partial块继续执行精确mask。 预建的优点是避免每token重建与重新编译，代价是元数据按最大长度分配。结构随请求内容变化的document mask或检索候选无法完全共享，可以把稳定因果/窗口部分预建，再与请求特定候选求交；组合成本仍要测量。 当当前位置超过预建长度，静默裁剪会丢连接。服务层应在接收请求时校验最大上下文，并为扩容创建新缓存版本。多个长度档位比为每个长度单独建表更易控制内存，同时减少过大表的浪费。

### 5.3. 逻辑BlockMask转成物理页

Paged KV把逻辑block $j$ 通过页表 $P_b(j)$ 映射到物理cache block。注意力规则在逻辑空间成立：因果、窗口和位置偏置都使用原token位置。执行层把BlockMask中的KV索引gather为物理页号，Q加载和score_mod仍保留逻辑索引。 若多个请求共享prefix，逻辑块可能指向相同物理页。转换不能原地破坏可复用的逻辑mask，也要正确处理每个batch的页表。物理页未按逻辑顺序排列时，cache读取会更离散；BlockMask索引可按物理地址重排以改善局部性，但online softmax和位置参数必须随条目保留。 直接先gather整段逻辑KV会产生额外复制，抵消分页收益。官方FlexAttention推理方案把间接地址访问融合进内核，并提供逻辑到物理BlockMask的转换。验证时用随机页表和碎片化分配，与先物化逻辑KV的慢reference比较输出。

### 5.4. 动态selector何时接入

DSA、NSA或其他selector可能为每个query输出top-k token/block。若输出粒度与kernel block一致，排序、去重后可直接形成每行KV block列表；若输出token很零散，向上取整到block会增加假阳性计算。此时要在selector粒度、BlockMask块大小和kernel tile间联合设计。 动态候选每步变化，BlockMask build进入关键路径。设selector时间为 $T_s$，规范化与建表为 $T_b$，attention为 $T_a$，总时延是三者之和，还可能包含同步：

$$
T_{total}=T_s+T_b+T_a+T_{sync}.
$$

只比较 $T_a$ 与full attention会高估收益。可以让selector提前一层产生下一层候选、批量构表或缓存重复模式，但这些改动会影响模型语义与流水依赖，需要单独验证。 FlexAttention适合快速验证新的结构规则，也可承担规则较稳定的生产路径。候选高度不规则、极稀疏且服务shape固定时，专用kernel可能进一步压缩索引和调度。迁移前用FlexAttention结果作为reference，能减少手写kernel正确性风险。

selector输出还要区分“排序用于语义”与“排序只为访存”。标准softmax对key遍历顺序数学上不敏感，有限精度归并会有细小差异，因此可以按block ID排序改善coalescing；若模型在候选上额外施加rank偏置，重排必须携带原rank。去重也一样：重复key若原定义会在softmax中出现两次，直接去重会改变概率；大多数top-k路由期望集合语义，应在进入BlockMask前明确规范。

每个query的候选数变化会造成负载不均。BlockMask行长已经提供了可观测信号，可以按有效blocks对query tiles分桶或使用持久化调度。调度重排不能改变输出落点，反向还要使用同一映射。基准除平均稀疏率外，至少报告行长均值、P95与最大值；同样平均值下，长尾集中的工作表更容易让少数program拖慢整个wave。

## 6. 复现、基准与故障诊断

### 6.1. 正确性测试矩阵

第一层测试直接枚举mask。长度取1、3、block size前后各一、非整除尾部和最大测试长度；模式包含因果、窗口、prefix、document以及两两组合；head形态包含MHA、GQA、MQA。逐项比较 `mask_mod`、BlockMask展开结果和dense reference。 第二层比较数值。用fp32运行显式attention与FlexAttention，检查输出、log-sum-exp、dQ/dK/dV和score参数梯度。输入覆盖大正负分数、空行防护、全满行、只有一个key、partial block边缘与padding。bf16/fp16另设符合累计精度的容差。 第三层检查模型回归。固定checkpoint、tokenizer与输入，比较短文本、长检索、多文档、长生成的logits或任务指标。kernel级误差可能很小，却在自回归多步生成中累积；任务回归能发现单层测试未覆盖的cache offset和页表状态。

### 6.2. 性能测量

每个case记录编译时间、BlockMask创建时间、热态前向、热态反向、峰值显存、workspace、有效blocks、partial比例与tile利用率。训练再记录samples/s、有效tokens/s和端到端step time；推理记录TTFT、TPOT与不同batch并发。 基线至少包含PyTorch SDPA/FlashAttention的等价稠密实现、显式dense mask，以及可用时的专用kernel。所有实现保持相同dtype、causal语义、GQA方式和位置偏置。稀疏实现跳过padding时，吞吐分母用有效token，同时另报物理处理token。 预热必须覆盖编译和自动调优；正式计时同步设备并取足够重复，报告中位数与尾部而非最佳一次。动态shape场景还要计数重新编译。一个热shape快两倍但每隔几十个请求重编译，并不适合延迟敏感服务。

BlockMask构造是否计入，按实际复用方式决定。固定因果窗口可在模型加载时建立，稳态服务表里可以分列而非摊到每token；document mask每batch变化，构造一次后跨所有layers复用，成本应除以层数但仍进入step；数据依赖mask每层变化，则每层都要计入。官方博客把构造描述为数百微秒量级、编译为秒级量级，这两个数量级会随硬件与shape变化，但足以说明它们必须分开观测。 显存也拆成Q/K/V与输出、编译kernel workspace、BlockMask元数据、反向保存量和分页KV。只看框架的峰值差可能混入allocator缓存。用相同进程顺序交换case，并记录分配量与保留量；必要时各case独立进程复测。性能提升若来自更少OOM重试或更大batch，也应在端到端结果中明确展示。

### 6.3. 四类常见故障

输出只在block边缘错误，优先检查partial block、全局query offset、尾部padding与full-block误判。所有位置都有小偏差，检查score_mod顺序、缩放位置、累计精度与soft cap。前向正确而梯度错误，查看反向转置索引、可训练闭包张量和dK/dV写回。单请求正确、batch或分页错误，检查B维广播与逻辑/物理索引映射。 性能没有随稀疏率提升时，先区分逻辑有效边与实际执行blocks。执行blocks确实减少而时间不降，再看BlockMask build、索引读取、partial分支、寄存器spill和小shape启动开销。prefill快而decode慢并不矛盾，后者需要split-KV或专门decode backend。 偶发长尾通常来自新shape编译、自动调优、mask缓存miss或workspace扩容。为每项打点比反复调整BLOCK_SIZE更有效。服务中还应记录实际backend；AUTO启发式随版本改变时，延迟分布变化才有可追踪依据。

### 6.4. 一次端到端验收

以32K、窗口4K、因果、document隔离的训练为例，先在小长度展开邻接矩阵，确认跨document连接为零。然后生成128×128 BlockMask，报告每个query block的KV block数、full/partial比例和末尾padding。对相同batch运行dense reference与FlexAttention，比较输出、LSE与梯度。 性能阶段固定有效token数，分别测mask预建复用与每步重建。再改变document边界但保持长度，确认缓存键会失效；改变score偏置但不改变结构，确认BlockMask能够复用。加入GQA后检查head广播，开启checkpointing后核对重算输出。 推理阶段把同一规则放进prefill和逐token decode，query offset随cache长度推进；随后随机打乱物理页表，比较分页融合路径与物化KV reference。实验记录TTFT、TPOT、峰值cache、build时间和重编译次数。语义、物理跳过和端到端收益同时成立，新的可编程mask才真正进入系统。

验收记录还要锁定软件栈。PyTorch中的FlexAttention仍在持续演进，源码所支持的backend、动态shape、GQA、辅助输出和kernel选项会随版本变化。至少保存PyTorch与Triton版本、GPU型号、驱动、编译缓存状态、实际backend和完整kernel options。旧博客中的限制只能解释对应版本，不能直接当作当前API边界；复现实验以安装版本的官方文档与源码为准。 语义降级测试依次关闭BlockMask、仅保留相同mask_mod运行，再改用显式dense实现。三条路径在容差内一致。第一条与第二条差异定位块表或full/partial分类，第二条与dense差异定位mod融合或softmax；性能变化而数值一致才属于调优问题。这组三角对照比单独拿输出追kernel bug更快。

若准备从FlexAttention迁移到专用kernel，把小shape邻接、输出/LSE、梯度、分页页表和性能case全部保留为契约测试。专用实现可以改变布局、调度与量化方式，不能改变允许集合、score顺序和online softmax归并。FlexAttention由此不仅是原型工具，也是一份可执行的语义参考。 发布前再用真实长度分布做一次加权汇总。实验室常选32K或64K整齐shape，线上请求却可能集中在短prompt并带长尾；大shape上的块跳过收益无法抵消短shape的编译与索引固定成本。按请求占比计算TTFT、TPOT和GPU时间，才能决定AUTO后端、dense fallback与FlexAttention各自覆盖哪段区间。这个分界应来自测量，并随模型head维度、batch策略和硬件更新而重新校准。

验收结果最好保留原始profile与BlockMask统计，而不只留下汇总表。后续版本若出现回归，可以判断变化来自编译选择、块表密度、kernel本身还是请求分布。相同平均时延背后可能是冷启动下降、热态变慢，也可能恰好相反；原始分项让升级决策有可复查的依据。

### 7. 可编程注意力的语义边界

**7.1. 两个mod函数为何足以覆盖大量变体.** 标准attention可以拆成四步: 计算点积, 修改分数, 删除非法连接, 对剩余分数做行softmax并聚合value. FlexAttention把可变部分限制在第二、三步, 其余部分交给固定模板. 对任意逐元素分数变换 $f$ 和允许集合 $M$, 输出为

$$
y_i=\sum_{j\in M_i}
\frac{\exp f(s_{ij},b,h,i,j)}
{\sum_{t\in M_i}\exp f(s_{it},b,h,i,t)}v_j.
$$

ALiBi、相对位置偏置、soft cap、因果、窗口、prefix LM和文档隔离都能写进这个形式. 它们改变某一对query-key的分数或存在性, 不要求跨行归约. 固定模板因此仍能掌握矩阵乘、online softmax、反向重算与tile调度. 表达力边界也由公式直接给出. 若一个变体需要根据整行top-k结果决定集合, `mask_mod`只拿到单个索引时无法独立完成排序; 若分数修正依赖同一行的均值或方差, `score_mod`也缺少跨key归约. 可以在FlexAttention外先算selector或统计量, 再作为捕获张量传入, 但这会增加一个算子阶段与中间状态. 若修改发生在softmax之后, 例如对attention概率再做跨query归一化, 固定模板的数学结构已经改变.

这套限制让编译器无需理解任意Python程序. mod子图描述局部标量运算, attention模板知道数据流和稳定归约, BlockMask提供块级工作表. 通用性来自局部规则组合, 不是把任意算子塞进一个接口. 判断新变体能否使用FlexAttention时, 先问它是否保持“逐分数修改、逐连接判定、行softmax、value加权”这条骨架. **7.2. mask与有限负偏置有不同的数学含义.** 若无效位置通过布尔mask删除, 它完全不进入softmax分母. 若改成有限常数 $-C$, 每个无效位置仍贡献 $e^{-C}$. 假设有 $m$ 个无效位置, 有效分母为 $Z$, 则无效总质量为

$$
P_{invalid}=\frac{me^{-C}}{Z+me^{-C}}.
$$

固定 $C$ 时, $m$ 随上下文增长会放大泄漏. fp16或bf16中的下溢可能让某些配置看似严格为零, 换精度、缩放或score偏置后又重新出现. 因果、padding和文档边界因此应放进 `mask_mod`, 不能依赖一个经验负数. 反过来, 距离惩罚和soft cap属于偏好, 保留远端位置的非零概率正是语义的一部分. 把ALiBi小于阈值的连接预先删掉会改变模型, 即使数值上多数权重很小. 只有在给出误差界或重新训练后, 才能把数值偏置近似为结构稀疏. BlockMask负责跳过确实无效的块, score_mod负责仍参与竞争的分数. 极端负无穷也要考虑算子顺序. 若先执行soft cap再加 $-\infty$, 连接严格删除; 若先把score设成 $-\infty$ 再送入某些非线性, 未定义运算可能产生NaN. FlexAttention把mask与score通道分开, 可以在模板中确保partial块的非法项在softmax统计前排除. 自定义reference也应遵循同一顺序.

**7.3. 组合规则可以先做集合代数.** 把每个mask看作集合 $M_a,M_b$, `and_masks`对应交集, `or_masks`对应并集. 交集满足交换、结合与幂等, 可以先合并重复约束; 并集同样如此. 但mask与score不能随意交换: 删除连接后再谈其偏置没有意义, 两个非线性score函数的复合通常也不交换. 例如prefix LM可写成

$$
M(i,j)=[j<P]\ \lor\ [j\le i],
$$

其中 $P$ 是prefix长度. 再加入文档隔离 $D(i,j)=[d_i=d_j]$ 后, 正确集合通常为 $M\cap D$. 写成 $[j<P]\lor([j\le i]\cap D)$ 会让所有query读取其他文档的prefix. 两个括号只差一个位置, 语义却完全不同. 集合公式还能指导BlockMask构造. 若两个规则都具有区间结构, 交集仍可直接求区间端点; 若把规则写成不透明逐元素函数, 通用构造器只能扫描候选块. 在保持API语义的同时提供结构化生成器, 可以把平方级准备成本降到与有效块数同阶. 生成器输出仍应由原始mask函数抽样核验, 防止优化实现和语义实现分叉. **7.4. 纯函数约束决定可缓存性.**

给定同样的索引与捕获张量, mod函数应返回同样结果. 读取当前时间、全局step、可变Python容器或内部随机采样会破坏这项约束. 编译器可能把某个值常量化, checkpoint重算也可能得到另一张图, 于是前向、反向和下一次调用互不一致. 动态规则可以通过显式张量表达. 例如每个batch的有效长度、每个head的窗口、每个query的路由块ID都作为输入张量, 缓存键记录其shape、stride与会改变结构的版本. 数值内容变化是否需要重编译取决于子图能否把它保留为运行时加载; BlockMask内容变化则一定需要重建或更新工作表.

纯函数还让reference可复用. 小shape下逐元素枚举同一个 `mask_mod`, 直接得到邻接矩阵; 稠密实现逐元素运行同一个 `score_mod`, 得到数值基线. 如果生产代码另写一套规则, 两者同时犯错时测试无法发现. “一份语义, 多种lowering”是可编程内核可靠性的基础.

### 8. BlockMask的正确性可以怎样证明

**8.1. 三态分类必须覆盖每个块.** 对query块 $Q_r$ 与KV块 $K_c$, 定义其中的允许边集合

$$
E_{rc}=\{(i,j):i\in Q_r,j\in K_c,m(i,j)=1\}.
$$

若 $E_{rc}=\varnothing$, 该块可跳过; 若 $E_{rc}=Q_r\times K_c$, 它是full block; 其余为partial block. 正确BlockMask需要满足完备性: 每个含有效边的块都在full或partial列表中; 互斥性: 同一块不能同时属于两类; 精确性: partial块内部仍由原mask逐元素过滤. 漏掉有效块会永久删除概率质量, 多列一个空块通常不改变语义却浪费计算. 把partial误判成full最危险, 因为非法边直接进入softmax. 因此分类器的优化宁可保守: 无法证明全满时归入partial, 无法证明全空时保留候选. 性能会稍差, 语义仍正确. 验证时可以把BlockMask展开成布尔矩阵 $\hat M$, 检查 $\hat M=M$. 若full/partial列表单独可见, 再验证full块中的原始mask全真、被删除块全假. 随机测试要偏向块边界、非整除尾部和文档切换, 均匀随机位置很难命中这些少数错误. **8.2. 区间规则可以避免平方构造.** 因果滑窗的允许区间为

$$
\max(0,i-W+1)\le j\le i.
$$

对query块 $Q_r=[rB_q,(r+1)B_q)$, 候选KV块只需覆盖从最小左端点到最大右端点的范围. 内部块可直接判full, 两端至多若干块判partial. 每行块数约为 $W/B_k$, 构造复杂度从 $O(QK)$ 降到 $O(N_qW/B_k)$. Prefix和document mask也能利用边界. Prefix区域形成一个固定矩形, causal区域形成下三角; document边界把矩形切成若干段. 若数据预先提供每个文档的起止位置, 可以按段生成候选, 无需逐元素比较document ID. 对规则做这种代数lowering相当于为BlockMask写专用前端, attention主kernel仍保持通用. 动态selector输出天然就是候选列表, 但需要规范化. 候选块应检查范围、排序与重复; 每个query block的候选若来自其中多个query token的并集, token级选择还必须在partial mask中保留. 直接把并集块当full会让一个token读到另一个token的候选, 扩大允许集合. **8.3. 元数据复杂度受行长分布支配.**

令第 $r$ 个query块有 $k_r$ 个有效KV块. 索引数量为 $K=\sum_r k_r$, 平均行长 $\bar k=K/N_q$. 前向主循环工作量近似与 $K B_qB_kd$ 成正比, 但执行时间还受最大行长和分布影响. GPU以wave并行执行多个query块, 极长行会成为尾部拖延. 只报告整体密度 $K/(N_qN_k)$ 会掩盖长尾. 两个mask都保留10%的块, 一个每行均匀, 另一个少数行接近full, 后者负载更难均衡. 应报告行长均值、P50、P95、最大值以及full/partial分解. decode中只有很少query行, 单行候选分布尤其关键. 元数据字节也能直接估算. 若索引用32位整数, 主列表约 $4K$ 字节, 每行计数约 $4N_q$ 字节; full/partial和反向转置会乘上若干份. 当block很小、每行块数很多时, 索引读取可能接近甚至超过某些低维attention的数据量. 这解释了稀疏率继续增加却不再加速的区域. **8.4. Block size同时决定近似粒度和硬件形状.**

对严格partial过滤的FlexAttention, 增大block并不会改变允许集合, 但会让更多无效元素随partial tile进入QK计算. 定义执行放大率

$$
\gamma=\frac{\sum_{(r,c)\in\mathcal B}B_qB_k}
{|\{(i,j):m(i,j)=1\}|},
$$

其中 $\mathcal B$ 是被执行块集合. $\gamma=1$表示每个计算元素都有效; 边界破碎时会远大于1. 逻辑稀疏率相同的两个规则, $\gamma$可能完全不同. 小块降低 $\gamma$, 却让矩阵乘维度、索引数量和调度开销变差. 大块提高Tensor Core利用率与连续读取, 但浪费partial计算. 最优点由head维度、规则几何、硬件和prefill/decode阶段共同决定, 不能只按mask密度选择. 还要区分构造block size与kernel tile. BlockMask描述逻辑工作表, 后端可能进一步组合或切分块以适配寄存器和共享内存. 若两者不一致, 性能模型要以实际执行tile为准. profile中的QK FLOPs、有效块与kernel配置应一起记录, 否则无法知道浪费发生在逻辑表还是后端lowering.

### 9. 从高阶算子到GPU程序

**9.1. 高阶算子保留了attention结构.** 若把自定义规则提前展开成普通PyTorch算子, 编译器看到的是matmul、索引、where、softmax和另一个matmul. 要把它重新识别为安全且可融合的attention, 必须证明中间算子没有改变语义, 还要生成对应反向. 任意一个额外view、cast或分支都可能破坏模式匹配. FlexAttention以高阶算子保留“这是attention”的信息, 同时把score_mod和mask_mod作为子图携带. Lowering阶段选择已知正确的attention模板, 再把子图代码插到分数与mask位置. 主循环、online softmax和反向骨架无需每次重新发现. 这是一种受限程序生成, 不是普通算子融合的偶然结果.

高阶表示也允许多个后端共享前端语义. GPU训练可以lower到Triton模板, 短query切到FlexDecoding, 其他设备可提供自己的实现. 后端性能可能不同, mod函数的数学契约保持一致. 跨设备回归首先比较邻接与输出, 随后才比较各自最优性能. **9.2. Guard决定何时复用已编译kernel.** 编译器对影响代码生成的属性建立guard, 例如dtype、设备、head维度、某些stride、静态block size与函数子图. 新调用满足guard时复用kernel, 违反时重新编译. 动态shape能减少长度变化造成的版本数, 但更宽的动态范围可能阻止某些常量折叠或使用保守调度.

服务中的缓存问题可以写成工作集. 若请求落在 $S$ 种shape/规则组合, 编译缓存只能容纳 $C<S$, 热度分布决定命中率. 把每个精确长度specialize会放大 $S$; 对长度分桶、固定head维度和少数block size可以缩小工作集. 规则中的普通数值参数尽量保留为张量, 避免每个窗口值都生成新Python函数身份. 重新编译并不总由shape引起. 闭包换成新函数对象、捕获张量stride变化、训练与推理grad mode变化、辅助输出开关变化都可能选择另一图. 监控需要记录编译键或至少统计每条模型路径的compile次数, 仅看总体缓存目录大小无法定位尾延迟. **9.3. 自动调优搜索的是受资源约束的离散空间.**

候选配置包含query/KV tile、warps、pipeline stages、是否使用某些预缩放和后端策略. 更大tile提高矩阵乘复用, 同时增加寄存器与共享内存; warps过多会降低每个SM可驻留program数; stages过多可能发生spill. 编译器必须在硬件上限内筛选可行组合. 调优目标也应对应实际阶段. 前向最快的配置未必让训练step最快, 因为反向有不同写回与转置访问; 单一shape最快的配置未必适合长度分布; 冷启动场景还要计入候选编译和测量成本. 生产可用代表shape离线调优, 再用启发式覆盖长尾. 基准噪声会误导调优. GPU频率、其他stream、allocator与首次cache加载都会改变短kernel时间. 每个候选需要预热、同步、多次重复并用稳健统计量. 若两个配置差异小于噪声, 选择资源更保守或适用范围更宽的配置, 比锁定偶然最短值更稳定.

**9.4. 自动微分只覆盖连续子图.** score_mod由可微PyTorch运算组成时, 编译器可生成它对score和捕获参数的导数. 例如可训练相对偏置表 $R$ 的梯度来自所有引用同一表项的位置之和. 这要求索引与写回正确聚合, 尤其在batch/head广播时不能误把独立参数共享. mask_mod返回布尔值, 连接的出现与消失没有普通导数. 若mask来自学习selector的top-k, FlexAttention只执行已经离散化的结果; selector训练要在外部使用直通估计、连续松弛、监督召回或策略梯度. 把BlockMask接入前向不会自动让选择过程可学习. 捕获参数是否收到梯度还取决于图接口和版本支持. 测试应检查 `.grad` 的存在、shape和数值, 不能只观察loss下降. 广播bias的梯度应等于各使用位置贡献之和; 用小shape显式循环计算reference, 能发现漏累积或重复累积.

### 10. Online softmax的数值与反向

**10.1. 分块归并为何与整行softmax等价.** 将一行scores分成若干集合 $S_t$. 每块最大值 $m_t=\max_{j\in S_t}s_j$, 局部和 $l_t=\sum_{j\in S_t}e^{s_j-m_t}$, 局部加权值 $o_t=\sum_{j\in S_t}e^{s_j-m_t}v_j$. 令全局最大值 $m=\max_t m_t$, 则

$$
\sum_j e^{s_j-m}=\sum_t e^{m_t-m}l_t,
$$

$$
\sum_j e^{s_j-m}v_j=\sum_t e^{m_t-m}o_t.
$$

两式相除正好得到整行softmax输出. 因而块处理顺序在实数算术下不改变结果, 稀疏工作表只要遍历全部有效块即可. split-KV第二阶段使用同一归并律. 这个结构也说明为何BlockMask不能漏块. 漏掉一块同时改变分子与分母, 无法靠后续缩放修正. 多执行一个全空块若严格mask为 $-\infty$, 理论上不影响状态; 若使用有限负数, 它会污染 $l_t$. 正确性依赖结构mask与数值mask的区分. **10.2. 有限精度误差来自归并顺序与局部计算.** 实际实现常用bf16/fp16输入和fp32统计. QK点积先有输入量化误差, score_mod可能加入大偏置或非线性, 指数与累计再产生舍入. 不同tile和split数量改变加法顺序, 因而结果通常只在容差内一致, 不保证bitwise相同.

误差测试应覆盖三类尺度. 第一类是普通随机分数, 检查平均误差; 第二类让一个logit远大于其余项, 检查最大值缩放与饱和; 第三类让许多logits非常接近, 检查长归并累计. soft cap、ALiBi与自定义缩放都应在极值处单测导数. 比较输出之外, log-sum-exp

$$
L_i=m_i+\log l_i
$$

更容易暴露分母偏差. 两个实现输出可能因value抵消而接近, LSE却已经不同. 训练反向通常也会依赖保存或重算的LSE, 所以它是重要契约量. **10.3. 全空行需要显式语义.** 若 $M_i=\varnothing$, softmax分母为零. 某些实现返回全零输出, 某些路径可能产生NaN. 对自回归self-attention, 通常通过允许自连接保证非空; 对cross-attention、路由或padding query, 空行可能真实出现. 最稳妥的方法是在模型规则层定义处理方式. 可以加入固定sink key, 可以让空query输出零并阻断梯度, 也可以在构建BlockMask时拒绝. 选择取决于模型语义. Kernel不应悄悄把空行连到第一个key, 因为这会制造不可见的信息通道.

空行测试要同时覆盖forward、dQ/dK/dV与score参数. 零输出约定下, 该行对V和相关score参数不应产生梯度; 若后续残差保留query状态, 模型仍能继续计算. NaN只在长尾路由出现时很难定位, 因此构表阶段统计空行数量很有价值. **10.4. 反向重算必须重现相同规则.** FlashAttention式反向通常不保存完整概率矩阵, 而是用Q/K和前向LSE重算局部分数. FlexAttention还要重新执行score_mod和partial mask. 若捕获张量已被原地修改, 或随机规则没有保存状态, 重算概率与前向不同, 梯度失去意义. 设前向概率为 $p_j$, 上游对输出的梯度为 $g$, 则对score的梯度为

$$
\frac{\partial\mathcal L}{\partial s_j}
=p_j\left(g^\top v_j-\sum_t p_tg^\top v_t\right).
$$

漏掉一个key会改变全部 $p_j$ 和中心化项, 错误不限于漏块本身. 这也是反向BlockMask与前向集合必须严格一致的原因. 转置索引只改变聚合顺序, 不能改变连接集合. 对可训练score参数还要乘链式导数. soft cap在大 $|s|$ 处导数趋近零, 可能让底层Q/K梯度明显变小; 可训练bias则直接累积score梯度. 这些是模型函数的一部分, 不能把梯度差异都归成kernel误差.

### 11. Decode与分页KV的索引代数

**11.1. query位置必须使用全局offset.** Decode时张量中的query索引常从0开始, 但它在完整序列中的位置是 $i=t+r$, 其中 $t$ 是cache已有长度, $r$ 是本次query内偏移. 因果条件应比较全局位置

$$
j\le t+r,
$$

窗口条件为 $t+r-W<j\le t+r$. 若mask_mod直接使用局部 `q_idx=r`, 生成第一个token时只能看到key 0附近, 或因符号错误看到未来cache. Prefill中q_idx恰好等于全局位置, 该bug不会出现. Chunked decode一次处理多个新token时, 新token之间也要保持因果. KV可能已经包含本chunk的所有位置, query $r$只能读到 $t+r$. 单token测试无法覆盖这条边界, 需要用2到数十token的query长度与dense reference比较. Prefix cache复用还会改变逻辑起点. 某些服务把公共prefix单独存储, 请求私有位置从0计数; 位置编码和mask却应使用拼接后的逻辑位置. 页表地址、张量局部索引和模型position ID是三套量, 应显式命名, 避免用一个offset承担多个含义. **11.2. 页表把逻辑块映射到物理块.** 设逻辑KV块号为 $c$, batch $b$ 的页表为 $P_b(c)$, 块内偏移为 $u$, 物理地址为

$$
\operatorname{addr}(b,c,u)=P_b(c)B_k+u.
$$

BlockMask表达的是逻辑连接 $(r,c)$; kernel读取K/V前再查页表得到物理位置. 逻辑块可以在显存中乱序, 只要页表一致, attention语义不变. 将BlockMask索引提前改成物理块也能运行, 但partial mask和position bias仍需要逻辑位置, 两类索引容易混淆. 页大小与BlockMask块大小未必相同. 若一页包含多个attention块, 地址转换简单; 若一个attention块跨多页, kernel需要额外分段. 为性能选择相同或整倍数关系较方便, 但模型语义不要求相等. 基准应记录页表读取和不连续访存成本. 页复用与写时复制还要求版本一致. 一个逻辑prefix被多个请求共享时, mask可以广播, 页表batch行却不同; 请求追加token后, 新页只属于该请求. 错误广播页表会造成跨请求数据泄漏, 属于必须用随机页置换和多batch测试覆盖的高风险问题. **11.3. Split-KV是在并行度与归并成本之间取平衡.**

单query只有一个或少数query tiles, 普通prefill调度无法占满GPU. 把 $K$ 个有效KV块分成 $S$ 份后, 第一阶段可启动 $S$ 倍program. 每份输出局部 $(m_s,l_s,o_s)$, 第二阶段归并. 计算本身没有减少, 目标是增加并行并隐藏KV读取延迟. 当 $S$ 太小时, 并行不足; 太大时, 每份工作量小、局部状态buffer和归并成本上升. 稀疏mask让每行有效块数 $K_i$ 变化, 合理split应根据 $K_i$ 而非完整cache长度. 一个只保留窗口的query无需按128K物理cache切很多份. 负载划分还影响访存. 按连续逻辑块切分可保持顺序, 但页表后物理地址未必连续; 按物理页聚类可改善读取, 却需要保持正确逻辑position用于score_mod. 若ALiBi等偏置依赖距离, 调度重排只改变处理顺序, 不能改变传入的逻辑索引. **11.4. GQA让KV共享与query规则交织.**

在GQA中, 多个query heads共享同一K/V head. KV读取可以在共享query heads之间复用, 但score_mod和mask可能仍按query head不同. 若不同query heads拥有不同窗口, BlockMask的H维不能只按KV head压缩; 若结构相同而bias不同, 块表可共享, 分数计算仍区分head. 设query heads数为 $H_q$, KV heads数为 $H_{kv}$, 组大小 $g=H_q/H_{kv}$. 对query head $h$, KV head为 $\lfloor h/g\rfloor$. 任何读取KV侧量的自定义函数都要先做该映射, query侧ALiBi斜率则保持 $h$. 把二者混用会在MHA测试中隐藏, 只在 $g>1$ 时出现. Decode的带宽常由KV读取主导. GQA减少物理KV, FlexDecoding增加KV轴并行, BlockMask减少需要读取的块, 三者作用可以叠加. 但加速不能简单相乘: 共享KV可能提高cache复用, 稀疏后读取量太小又使调度开销占比上升. 要用相同batch、cache长度和head配置测端到端TPOT.

### 12. 性能模型应从实际执行工作出发

**12.1. 逻辑稀疏率无法直接预测时间.** 设逻辑有效元素比例为 $\rho_e$, 执行块覆盖比例为 $\rho_b$, 则通常 $\rho_e\le\rho_b\le1$. QK/PV计算更接近 $\rho_b$ 倍dense主项, partial mask与score_mod增加逐元素成本, 索引和调度增加固定成本. 可写成粗略模型

$$
T_{flex}\approx
\rho_b T_{gemm}+T_{mod}+T_{index}+T_{launch}+T_{tail}.
$$

当mask结构整齐且长度大, $T_{gemm}$主导, 时间随 $\rho_b$下降. 当序列短、块碎或head维小, 后四项占比上升, FlexAttention可能慢于dense专用kernel. 稀疏率是必要输入, 不足以单独预测加速. 还要看full blocks比例. full块跳过逐元素mask, partial块需要谓词和可能的分支. 两个工作表的 $ho_b$相同, partial比例高的一方通常更慢. score_mod复杂度、捕获张量访问模式和GQA也改变每块成本. **12.2. Roofline要计入索引与非连续KV读取.** Dense FlashAttention以规则tile流式读取Q/K/V, 容易复用Q并形成连续K/V访问. BlockMask通过索引选择KV块, 若块ID排序, 同一行仍可顺序读取; 动态路由的随机块会降低合并访问与cache命中. 理论FLOPs减少后, kernel可能更快进入带宽受限区. 算术强度近似为执行FLOPs除以Q/K/V、索引和输出字节. 对decode, 每个KV元素通常只与很少query复用, 强度尤其低; 对prefill, 一个K/V tile可服务多个query行, 复用更好. 因此同一mask在两阶段的瓶颈不同.

Profile应查看实际内存吞吐、Tensor Core利用率、occupancy和stall原因. 若Tensor Core低而带宽接近上限, 减少FLOPs未必继续加速; 若带宽低且大量dependency stall, split或调度可能不足; 若寄存器spill, 复杂score_mod或过大tile需要收缩. **12.3. BlockMask构造的摊销由复用层级决定.** 固定因果或固定窗口可跨batch、layer和step复用, 构造成本几乎完全摊销. Document mask通常每batch变化, 却可跨模型所有layers复用. 动态selector若每层输出不同候选, 构表频率最高. 设构造时间为 $T_b$, 复用次数为 $R$, 单次摊销为 $T_b/R$. 构造与attention还可能流水重叠. 上一层或CPU准备下一批BlockMask时, GPU执行当前层; 但依赖本层hidden state的selector无法提前太多. 把构建移出计时只有在真实系统确实完成重叠时才合理. 同步点会让表面异步的准备重新进入关键路径.

缓存大量动态mask也有内存与失效成本. 缓存键若包含完整document布局或候选内容, 命中率可能很低. 应统计命中率、条目大小与驱逐, 再决定缓存BlockMask、缓存结构化边界还是只缓存编译kernel. **12.4. 端到端收益由最慢剩余项限制.** 假设原step中attention占比例 $p$, FlexAttention让该部分加速 $a$, 其余不变, Amdahl定律给出总加速

$$
S=\frac1{(1-p)+p/a}.
$$

若attention只占一半, 即使该部分无限快, 总加速也不超过2倍. 稀疏后MLP、通信、optimizer或数据加载可能成为新瓶颈. 论文和博客的端到端数字依赖具体模型与规则, 无法由kernel倍数直接外推. 训练应报告step分解, 推理应分TTFT与TPOT. Prefill稀疏主要影响TTFT, decode稀疏主要影响每token延迟; batching和调度还会改变两者. 一个方案让长prompt TTFT显著下降, 却因动态mask构建增加TPOT, 需要按真实请求权衡. 最终比较使用有效工作量. Padding被跳过时, raw tokens/s会把无意义token计入分母; 动态路由每个query候选数不同, 只用序列长度也不公平. 同时报有效tokens/s、实际执行blocks/s和端到端请求指标, 才能连接kernel与系统收益.

### 13. 方法选择与失效边界

**13.1. 已有专用kernel时先比较语义与维护成本.** 标准因果MHA已有高度优化的SDPA/FlashAttention路径, FlexAttention的可编程层可能带来少量额外开销. 如果规则长期固定、专用kernel覆盖全部硬件和反向, 直接使用专用路径通常更简单. FlexAttention的优势在规则组合、新模式迭代以及避免物化dense mask. 比较不能只看最快内核. 专用kernel可能缺少GQA、可训练bias、分页KV或某个后端; 手写扩展还要承担版本适配和正确性测试. FlexAttention把这些工作交给框架模板, 用一定通用性开销换开发与维护成本. 对研究原型和规则频繁变化的系统, 这项交换经常值得.

可以保留双路径: 常见因果或固定窗口走专用kernel, 长尾组合规则走FlexAttention. 两条路径必须共享语义测试, 并在路由边界比较输出. AUTO后端本质上也在做类似选择, 但应用仍要确认安装版本覆盖自己的shape与功能. **13.2. 极碎稀疏可能需要另一种表示.** BlockMask擅长块结构. 若每个query只选择少量散落token, 每个token落在不同大块, 执行放大率很高. 缩小block会增加元数据和调度, 最终可能不如token级稀疏或先聚合候选. 规则稀疏的几何形状比元素密度更决定适配度. 列区间表示、CSR式token索引或专用gather-GEMM可以更精确地处理碎稀疏, 但矩阵乘效率与访存合并更难. FlashMask等工作选择不同mask表示以减少某些结构的浪费; 它们与FlexAttention的比较应固定相同允许集合、dtype、正反向和硬件, 不能只比较各自最有利模式.

一个实用判据是测量 $\gamma$、平均每块有效元素与索引字节占比. 若多数partial块只有极少有效项, 且调小block仍不能进入高效矩阵乘区域, BlockMask已偏离优势区. 此时FlexAttention仍可作为正确性reference, 生产实现可以转向更专门的数据结构. **13.3. 数据依赖路由的成本常在attention之外.** 动态稀疏要先计算候选. Selector可能读取所有K摘要、建立索引或执行top-k, 其成本为 $T_s$; 候选转BlockMask为 $T_b$; attention为 $T_a$. 若 $T_s+T_b$ 接近省下的QK/PV时间, 内核加速不会转成端到端收益. Selector质量也决定模型上限. 漏掉关键块后, FlexAttention会严格执行错误集合, kernel无法恢复. 应单独测候选召回、oracle候选attention和实际候选attention. Oracle好而实际差, 瓶颈在selector; 两者都差, attention后的组合或训练目标更可疑.

训练selector时还要处理离散选择梯度与负载约束. 单纯最大化相关性可能让所有query选择同一热门块, 造成GPU热点和信息坍缩. 块数预算、负载均衡和语义召回需要一起进入目标或调度. FlexAttention解决候选执行, 不替代路由学习. **13.4. 安全边界首先是隔离规则.** Document mask、batch隔离和分页页表一旦出错, 后果不只是质量下降, 还可能让一个样本或请求读取另一个请求的内容. 这类规则应有比普通性能mask更严格的测试: 随机填充每个样本的唯一秘密token, 验证其他样本输出对其干预不敏感; 随机打乱页表, 验证逻辑输出保持一致.

只比较正常输出可能漏掉微小泄漏. 可以对被禁止位置的K/V求梯度, 理论上应严格为零; 或逐元素展开mask检查跨域边为假. 在有限负偏置实现中梯度可能极小但非零, 进一步说明隔离必须使用结构mask. 编译缓存也不能跨不兼容规则误复用. 若document布局作为运行时张量加载, kernel可复用而BlockMask要更新; 若布局被常量化, guard必须阻止旧图用于新请求. 日志应把编译kernel ID与BlockMask版本分开, 便于追踪错误缓存.

### 14. 复杂mask怎样从需求推到块表

**14.1. Prefix LM包含两个区域和三类连接.** 设prefix长度为 $P$, 序列总长为 $N$. Prefix内部允许双向连接, 生成区域可以读取全部prefix和自身过去, 禁止读取自身未来. 集合为

$$
M(i,j)=[i<P\land j<P]\lor[i\ge P\land(j<P\lor j\le i)].
$$

第二项中的 $j<P$ 实际被 $j\le i$包含, 因为 $i\ge P$, 因而公式可化简为

$$
M(i,j)=[i<P\land j<P]\lor[i\ge P\land j\le i].
$$

这个化简揭示块几何: 左上角是 $P\times P$ full矩形, 左下区域也全满, 右下是causal三角, 右上为空. 若 $P$ 不与block对齐, 穿过 $P$ 的query和KV块必须归partial. 把所有prefix相交块都标full会让prefix query读取生成区, 形成未来泄漏. 构造时先求边界块 $p=\lfloor P/B\rfloor$. 完全位于prefix的块可直接加入full列表; 生成区每个query块加入左侧prefix块与causal块; 涉及 $P$ 或对角线的块保留partial判定. 这样候选生成复杂度与有效块数同阶, 精确语义仍由原mask_mod守住. 测试应选择 $P=B-1,B,B+1$ 三种情况. 对每个query位置打印最大允许key, prefix query应止于 $P-1$, 生成query应止于自身. 再对prefix区域交换token, 验证其内部确实双向; 对生成未来token求梯度, 应严格为零. **14.2. Document causal mask需要同时管理段起点与段终点.** 设token $i$ 所属文档为 $d(i)$, 文档内因果mask为

$$
M(i,j)=[d(i)=d(j)]\land[j\le i].
$$

若文档连续存放, 每个query的允许区间是本段起点 $a_{d(i)}$ 到当前位置 $i$. 块表可从文档边界直接生成. 完全落在同一文档且位于对角下方的块为full, 跨文档块为空, 同时穿过文档边界或对角线的块为partial. 多个短文档挤在同一KV块时, 该块可能对许多query blocks都是partial. 元素稀疏率很高, 执行放大率却不低. 按文档长度对样本packing, 或让常见文档边界更接近block对齐, 可以改善块利用率. 这种重排会改变训练batch与位置分布, 需要保持样本权重和position ID语义. 文档ID广播是常见错误. 每个batch拥有不同packing布局时, $d_b(i)$必须保留batch维; 把第一条样本的BlockMask广播到全batch会产生跨文档读取. 随机生成不同边界、给每篇文档填唯一值, 能用输出与梯度同时检测泄漏. **14.3. Dilated窗口会形成规则但非连续的块集合.**

膨胀窗口允许最近 $W$ 范围内每隔 $r$ 个位置连接

$$
M(i,j)=[0\le i-j<W]\land[(i-j)\bmod r=0].
$$

它的包围区间仍是一条带, 元素却呈离散格点. 当 $r$ 小于block size, 几乎每个带内块都是partial, BlockMask只能跳过带外区域; 当 $r$ 大于block size, 有效点可能散落到许多块, 执行放大率进一步上升. 逻辑稀疏度约为 $1/r$, 物理块稀疏度不会按同样比例下降. 这类规则说明BlockMask的层级: 它先利用粗粒度区间删掉远处块, partial mask再处理模运算. 若追求更高性能, 可以重排token或使用专用稀疏布局让同余类连续, 但重排会改变位置偏置与cache布局. FlexAttention保留原序列顺序, 以通用性换取partial计算. 正确性样例要覆盖负差值. 在某些语言中负数取模规则不同, 若先算 $(i-j)\bmod r$ 而没有 $i\ge j$ 防护, 未来位置可能误命中. 布尔短路在编译子图中也未必按Python执行顺序消除运算, 因此公式中的每个条件都应独立正确. **14.4. Head特定模式决定BlockMask能否广播.**

假设局部heads使用窗口 $W_h$, 全局heads允许完整因果, 路由heads读取候选集合 $C_{bhi}$. 总mask为

$$
M(b,h,i,j)=
\begin{cases}
[0\le i-j<W_h],&h\in\mathcal H_{local},\\
[j\le i],&h\in\mathcal H_{global},\\
[j\in C_{bhi}]\land[j\le i],&h\in\mathcal H_{route}.
\end{cases}
$$

只有拥有相同结构的heads可以共享块表. 即使两个heads平均密度相同, 候选块位置不同也不能广播. GQA只共享K/V内容, 没有强制query heads共享mask. 错误广播常表现为整体loss可训练, 特定heads或任务却退化. 元数据可以按模式类而非逐head复制. 先把heads分成若干等价类, 每类保存一份BlockMask和head到类映射. 当前API或后端是否直接支持这种压缩取决于版本; 不支持时可在batch/head维展开. 无论布局如何, 语义测试应逐head展开邻接比较. 全局heads数量少时, 它们的full工作量可能主导长尾. 平均稀疏率把局部与全局混在一起会误导性能预测. 应分别报告每个head类的块数和时间, 再检查调度是否让全局heads拖慢同一wave中的局部heads.

### 15. 可训练score规则的梯度结构

**15.1. 加性bias的梯度是概率残差的聚合.** 设修改分数为 $\tilde s_{ij}=s_{ij}+r_{ij}(\phi)$, 输出 $y_i=\sum_jp_{ij}v_j$. 对上游梯度 $g_i$, 有

$$
\frac{\partial\mathcal L}{\partial \tilde s_{ij}}
=p_{ij}g_i^\top(v_j-y_i).
$$

因此参数梯度为

$$
\frac{\partial\mathcal L}{\partial\phi}
=\sum_{i,j}
p_{ij}g_i^\top(v_j-y_i)
\frac{\partial r_{ij}}{\partial\phi}.
$$

若相对位置表按距离桶共享参数, 所有命中同一桶的边都要累积到同一元素. 若ALiBi斜率按head共享, batch与位置维贡献要归约到对应head. 错误的广播或写回会使梯度少算、重复或落到错误参数. 用极小张量逐边计算上式, 可以对捕获bias的 `.grad` 做精确reference. 测试应让多个位置命中同一参数, 才能覆盖聚合; 每个位置都用独立参数只验证局部导数, 检查不到原子或归约错误. **15.2. Soft cap改变分数范围也改变学习速度.** 令

$$
f(s)=C\tanh(s/C),
\qquad f'(s)=1-\tanh^2(s/C).
$$

当 $|s|\ll C$, 函数近似恒等; 当 $|s|\gg C$, 输出饱和在 $\pm C$, 导数趋近零. Soft cap限制极端logit, 改善某些数值与校准行为, 同时让已经饱和的Q/K方向得到更小梯度. 如果 $C$ 可训练, 还要考虑

$$
\frac{\partial f}{\partial C}
=\tanh(s/C)-\frac{s}{C}\left[1-\tanh^2(s/C)\right].
$$

小 $s/C$ 区域两项接近抵消, 极端区域梯度行为又不同. 低精度直接计算可能产生消减误差. 可训练 $C$ 的reference应使用高精度并覆盖小值与大值. 操作顺序影响函数. 先缩放点积再soft cap与先cap原始点积再缩放不等价; 加位置bias前后也不等价. 代码中的score输入是否已经包含默认缩放应以当前官方API为准, 并用手算样例锁定, 不能凭变量名猜测. **15.3. 相对位置表的索引必须处理截断与方向.** 相对距离 $\delta=i-j$ 可以映射到精确表项, 也可在远距离使用对数桶. 因果attention只见 $\delta\ge0$, 双向attention需要正负方向. 若索引先取绝对值, 左右方向信息丢失; 若数组偏移不足, 负距离会越界或落到Python负索引语义.

表项读取是score_mod中的额外内存访问. 小表可能缓存良好, 按batch/head/position的大表会显著增加带宽. 若bias只依赖距离桶和head, 可以预计算桶映射或利用规则算术; 若依赖样本内容, 捕获张量必须按实际stride读取. 梯度统计也能暴露数据覆盖. 远距离桶几乎没有梯度, 可能是训练数据缺少远依赖, 也可能是BlockMask提前删除了这些边. 将每桶命中次数、attention质量和梯度范数一起报告, 才能区分数据稀少与模型忽略. **15.4. Score参数共享应与模型假设一致.** Bias可以按所有heads共享、按query head独立、按KV head共享或按layer独立. 每种共享对应不同归纳偏置和参数量. GQA模型中按KV head共享距离bias会让同组query heads拥有相同偏好; 按query head独立则保留差异. `enable_gqa`不会替模型选择这一点.

广播张量的shape应直接表达共享关系. 例如 `[1,H_q,1,K]` 表示batch和query广播, `[B,1,Q,K]`表示head广播. 在score_mod中手动取模或整除也能实现共享, 却更容易在head数变化时出错. 参考测试要给共享组内heads设置不同Q, 确认只有bias共享, attention结果仍可不同. 参数共享还影响反向通信. FSDP或tensor parallel下, bias表属于哪个rank、梯度在哪里归约, 要与Q/K/V分片一致. 表很小不代表可以忽略同步; 不同rank各自更新后会让同一逻辑规则逐步分叉. 分布式测试应在一步优化后比较各rank参数.

### 16. 动态shape与缓存需要哪些不变量

**16.1. Kernel缓存与BlockMask缓存是两张表.** 已编译kernel由函数子图、dtype、设备、head维、stride和若干shape guard决定. BlockMask由具体允许集合、Q/KV长度、batch/head结构和block size决定. 两者可以独立命中: 同一kernel处理新文档布局时, kernel缓存命中而BlockMask重建; 同一固定mask换dtype时, BlockMask可复用而kernel需重新编译或选择另一版本. 把两者塞进一个缓存键会造成两种浪费. 键过细时, 每个文档布局都复制相同kernel; 键过粗时, 新布局误用旧BlockMask. 日志至少分别记录compile cache hit与mask cache hit, 并把BlockMask绑定到生成它的语义版本. 语义版本应包含所有改变连接集合的输入. Document ID、有效长度、候选块、窗口和prefix边界都属于这一类. 只改变score bias内容通常不改变BlockMask, 但若bias阈值被用来删除连接, 它已经成为mask输入, 必须进入版本. **16.2. 最大mask裁剪要求前缀一致性.**

设长度 $L_2>L_1$, 在 $L_2$ 上构建的mask左上角裁到 $L_1$ 若等于直接构建 $M_{L_1}$, 则规则具有前缀一致性

$$
M_{L_2}[0:L_1,0:L_1]=M_{L_1}.
$$

因果和固定绝对窗口满足; 依赖序列末端、总长度比例或中心位置的规则通常不满足. 例如“连接最后128个token”在不同总长度下选中的逻辑位置不同, 最大mask裁剪会指向旧末端. 证明前缀一致性后, 还要处理block尾部. 最大BlockMask中的某个full块裁到短长度可能仍full, 跨越短长度边界的索引必须忽略; query offset不是0的decode切片则取中间行, 不能当左上角前缀. 官方调整接口的具体行为随版本变化, reference应直接比较目标邻接. 自动测试可以随机取多组 $L_1,L_2$, 展开两种mask比较. 任何一次不等都禁止走裁剪缓存. 规则代码更新后重新执行, 不能把“曾经验证过”当永久属性. **16.3. 动态值与动态shape会触发不同变化.**

同shape张量内容变化通常可作为运行时输入, 不必重编译; shape变化可能违反guard. 但如果内容在Python控制流中被 `.item()` 取出, 编译器可能常量化并按值specialize. mod函数应保留张量运算, 让动态窗口或边界在kernel内加载. 完全动态也有代价. 静态head维和block size帮助选择Tensor Core tile与展开循环; 把它们都变成运行时值会降低优化或根本不受支持. 实用划分是让请求长度、有效长度与少量bias值动态, 模型结构和block布局类别静态. Shape分桶可以平衡版本数和padding. 将长度向上取到若干桶减少编译组合, 但padding增加Q/K/V与MLP工作; BlockMask能跳过attention中的padding块, 其他层仍处理padding token. 选择桶边界时要看完整模型成本, 不能只看attention. **16.4. 缓存失效要满足原子切换.**

服务并发下, 一个请求可能在旧BlockMask仍被GPU使用时更新缓存条目. 原地修改元数据会让同一次kernel看到混合版本. 更安全的方式是生成不可变新对象, 在请求边界原子替换引用, 旧对象等关联stream完成后释放. 页表与BlockMask也要同步更新. Decode追加新页时, 逻辑候选可能扩展, 页表先更新而mask未更新会漏读, mask先更新而页尚未就绪会访问无效地址. 两者应在同一版本对象中发布, 或由事件建立清晰的happens-before关系. 缓存错误的测试需要并发压力, 单线程reference不足. 可以让多请求使用不同document布局与随机页表, 反复命中和驱逐缓存, 每次与物化KV dense结果比较. 一旦出现偶发差异, 日志中的kernel ID、mask版本、页表版本和stream事件能帮助定位.

### 17. 一份可以逐项验证的等价性契约

**17.1. 从邻接集合到模型输出的六层条件.** FlexAttention与一个给定dense reference等价, 需要连续满足六层条件. 第一层是索引等价: batch、head、query和key索引指向同一逻辑token, decode offset与分页映射不能改变position ID. 第二层是集合等价: BlockMask展开后的允许集合与mask_mod逐元素结果一致. 第三层是分数等价: 缩放、score_mod顺序、dtype cast和捕获参数读取一致. 第四层是归一化等价: 只在允许集合内进行数值稳定的行softmax. 第五层是聚合等价: 每个概率乘到对应逻辑value, GQA与页表没有换错head或物理页. 第六层是微分等价: backward重算相同集合与分数, 并把共享参数梯度归约到相同位置.

这六层构成从离散结构到连续数值的依赖链. 上层测试通过不能证明下层正确. 最终输出接近可能由value相似掩盖漏边, 前向接近也可能隐藏梯度写回错误. 反过来, 邻接完全一致后出现数值差异, 排查范围便能缩到score顺序、softmax与聚合. 契约测试应保存每层的直接观测量, 不把所有问题压成一次最终输出比较. 设reference允许集合为 $M_i$, FlexAttention实际集合为 $\hat M_i$. 若两者不同, 差异可分为漏边 $M_i\setminus\hat M_i$ 与多边 $\hat M_i\setminus M_i$. 漏边删除原有概率质量, 多边加入额外分母和value. 对单行输出, 在value范数不超过 $V_{max}$ 时, 两个概率分布 $p,\hat p$ 导致的输出误差满足

$$
\|y_i-\hat y_i\|_2
\le V_{max}\|p_i-\hat p_i\|_1.
$$

这个界说明结构差异最终通过概率质量起作用. 一个错误边若logit极低, 当前样本输出可能几乎不变; 换一组Q/K后它可能获得高分. 因此邻接测试必须独立于随机数值测试, 不能用一次小输出误差宣布mask正确. 集合一致后, 假设修改分数误差满足 $|s_{ij}-\hat s_{ij}|\le\epsilon$. Softmax对整体平移不敏感, 真正相关的是相对logit误差. 极端尖锐分布和大量近似并列候选对误差的响应不同, 很难用单个绝对容差覆盖全部case. 测试应分别构造均匀、单峰、双峰和长尾分数, 同时比较输出、LSE与梯度. fp32 reference用于定位语义, bf16/fp16容差用于验证目标部署精度. 分页路径的契约可以再写成交换图. 令 $G$ 根据逻辑索引从物化KV计算输出, $P$ 把逻辑KV放入物理页, $F$ 是带页表的FlexAttention. 正确性要求

$$
F(Q,P(K),P(V),\text{page table},M)
=G(Q,K,V,M)
$$

在数值容差内成立. 随机置换物理页而保持逻辑页表更新后, 右侧不变, 左侧也应不变. 这是一种变形测试: 无需知道具体输出, 只利用“物理布局不应改变模型语义”的不变量. 对batch隔离, 可以独立置换每个请求页表, 更容易暴露错误广播. 反向的交换图还要求参数共享一致. 若bias表在多个位置共享, dense reference和Flex路径对表梯度应相等; 若GQA共享KV, 展开KV的reference要把重复head梯度求和后与共享表示比较. 直接比较展开前的单个副本会误判. 同理, dK/dV的浮点累加顺序可造成小差异, 集合与归约目标必须精确一致, 数值只要求在预先设定的相对和绝对容差内.

性能验收建立在等价性之后. 首先锁定同一语义配置, 然后记录BlockMask构造、编译、热kernel与端到端时间; 再改变block size或backend. 若调优同时改变允许集合、score近似或精度, 得到的是另一模型函数, 不能与原路径直接比较速度. 对近似mask可以研究质量—速度曲线, 但需要明确标成算法近似, 不能混入kernel等价优化.

版本升级时, 六层契约比固定性能数字更耐用. API签名、默认backend和调优策略会变化, 逻辑索引、允许集合、分数顺序、softmax语义、value映射与梯度目标仍应保持. 每次升级先运行小shape离散与数值测试, 再跑代表shape性能回归; 语义失败时停止比较速度, 性能回退时保留正确版本并检查lowering与调优选择.

这份契约也划清了FlexAttention与模型研究的职责. Kernel保证忠实执行给定规则, 无法证明规则本身合理; selector召回、窗口长度和bias形式仍由模型实验决定. 模型研究确定允许集合与分数函数, 内核验收证明执行等价, 系统基准确认节省兑现. 三层各自留下可复核证据, 新注意力变体才能从几行原型走到可信训练与部署.

论文中的性能区间也应沿这三层阅读. FlexAttention覆盖七类attention变体, 每类规则的full/partial块比例、score_mod复杂度和shape不同, 因而相对FA2既有低于1的点, 也有超过1的点. 区间证明编程模型能在多种规则上接近专用融合实现, 没有承诺每个case都更快. 复现时先匹配论文的允许集合和输入shape, 再核对后端与硬件; 只取最高加速点无法代表通用开销. 专用FA2基线本身也包含语义选择. 因果、非因果、GQA、dropout、dtype和head维必须一致. 若FlexAttention通过BlockMask跳过窗口外计算, 而FA2基线仍执行full attention, 差值同时包含稀疏算法收益与框架开销; 若比较等价的专用滑窗kernel, 才更接近可编程层相对手写实现的代价. 两种对照都有价值, 需要分别命名.

论文报告的编译生成路线重点在“无需为每种组合手写前向与反向”. 开发效率不能简单换算为毫秒, 却会影响研究能否系统覆盖消融. 同一mask_mod可以在dense reference、BlockMask构造和融合kernel之间共享, 让组合规则更容易验证. 若为了追求一个峰值数字复制三套规则代码, 后续语义漂移的维护成本可能超过当下kernel差距. 官方推理工作进一步加入短query后端、GQA和PagedAttention, 说明统一前端可以随shape选择不同模板. 这项演进也提醒读者: “FlexAttention性能”不是单一kernel的固定属性. Prefill、decode、设备后端和PyTorch版本会落到不同实现. 结果表应记录实际backend, 否则版本升级后的变化无法解释.

论文正确性验证以参考实现和数值误差为基础, 应用仍要扩展自己的语义范围. 官方测试无法知道某个产品如何定义document边界、prefix共享或selector候选. 框架保证函数按契约执行, 调用方负责给出正确函数与缓存版本. 安全隔离规则尤其需要应用级干预测试, 不能只依赖通用单元测试. 最终验收可以留下三份产物. 第一份是小shape语义样例, 包含展开邻接、score顺序和dense输出; 第二份是代表shape性能表, 分开冷启动、构表、前向、反向与decode; 第三份是版本清单, 锁定PyTorch、Triton、设备、驱动、backend和kernel options. 这三份材料足以在规则变化、硬件迁移或框架升级时重新建立可信基线.

性能回归的阈值还要区分确定退化与测量噪声. 对固定频率、隔离设备上的热kernel, 可以使用较窄阈值; 对共享集群端到端请求, 应保留置信区间和尾延迟分位数. 一次慢5%可能来自频率波动, 连续多个代表shape同时退化则更像后端选择或代码生成变化. 原始profile能避免团队因为偶然数字长期固定内部选项.

Mask统计应与性能样本绑定. 只保存平均稀疏率, 后续无法判断回归来自数据分布还是kernel. 每个基准case至少记录Q/KV长度、有效块数、full/partial数量、行长分位数和执行放大率. 动态selector还要记录候选召回与构表时间. 当模型更新改变路由分布时, 即使kernel完全相同, 延迟也可能变化.

模型质量回归同样需要分层. 邻接与数值测试守住算子语义, 固定checkpoint logits守住模型函数, 真实任务指标守住应用结果. Logits通过而任务下降时, 更可能是评测数据或生成配置变化; 邻接先失败时, 无须继续争论高层指标. 这种顺序让内核问题和模型问题各自回到可处理的范围.

当规则确实超出两个mod函数的表达边界, 停止把复杂逻辑硬塞进逐元素子图. 先明确新增的跨行归约、状态更新或概率后处理, 再决定扩展编译模板、拆成前后算子或写专用kernel. 接口简短带来的性能来自受控数据流, 破坏这项前提后, 表面上仍是几行Python, 生成程序却可能失去可预测性.

### 18. 参考资料

- [Flex Attention: A Programming Model for Generating Optimized Attention Kernels](https://arxiv.org/abs/2412.05496)
- [ICLR OpenReview论文页](https://openreview.net/forum?id=2QMYV4bA0R)
- [PyTorch FlexAttention官方文档](https://docs.pytorch.org/docs/stable/nn.attention.flex_attention.html)
- [FlexAttention官方介绍](https://pytorch.org/blog/flexattention/)
- [FlexAttention for Inference](https://pytorch.org/blog/flexattention-for-inference/)
- [PyTorch官方实现](https://github.com/pytorch/pytorch/blob/main/torch/nn/attention/flex_attention.py)
- [返回可编程掩码主题](../02-可编程掩码.md)
