# Kimi K3:2.8T 开源前沿, 把序列, 深度与宽度一起拉长

来源:[Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653)(arXiv:2607.24653v2,2026 年 8 月 7 日). 权重:[Hugging Face moonshotai/Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3). 对照译稿见同目录 `kimi-k3-bi.md`, 页标记从 `page 1 of 47` 到 `page 47 of 47`. 表内数字, 公式编号与基准分数以源文 `kimi-k3.md` 为准.

Kimi K3 把开源侧长期偏「TestingTime 推理」的重心, 重新接到「预训练底座也要上 3T 级」这件事上. 总参 2.8T(表 1 写 2.78T), 每 token 激活 104B(表 1 写 104.2B), 原生多模态, 上下文到 1M. 架构上三条轴一起动: 序列维用 **Hybrid Attention**(每块 3 层 KDA + 1 层 Gated MLA), 深度维用 **Block AttnRes**(约 8 块, 每块 12 层, 连嵌入共 9 块), 宽度维用 **Stable LatentMoE**(896 路由专家里激活 16 个, 稀疏度 56, 共享专家 2 个). 报告写相对 Kimi K2 整体 Scaling 效率约 2.5×(图 7). 后训练走 SFT → 三域 × 三档推理力度的 RL → Multi-Teacher On-Policy Distillation(MOPD)收成一个统一模型. 评测上整体仍落后 Claude Fable 5 与 GPT-5.6 Sol, 但在开源与多数闭源对照里经常领先(表 2, 表 5).

机制细节可对到本库已有笔记: KDA 见 [01-Kimi-Delta-Attention-KDA](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md);AttnRes 见 [08-AttnRes-深度维注意力聚合](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md);MLA 见 [04-MLA-低秩潜变量与矩阵吸收](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md);Stable LatentMoE 与 Quantile Balancing 见 [10-Stable-LatentMoE与Quantile-Balancing](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md);SiTU-GLU 见 [01-SiTU-GLU](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/01-SiTU-GLU/01-SiTU-GLU.md). 下面按报告章节把配置, 消融与榜单读清楚.

## 1. 报告主张

### 1.1. 报告要证明什么: 预训练 Scaling 与 TestingTime, 推到开源前沿

摘要与 §1 的主张很直: 开源生态在 TestingTime 推理上跑得快, 预训练规模却长期停在约 1T 一带; K3 要把预训练推到 3T 级, 同时把 RL, 推理力度与 1M 长程交互一起推. 图 1 是主结果总览. 脚注给出权重入口 `moonshotai/Kimi-K3`. 图注提醒: Fable 5 结果含潜在 fallback, GPT-5.6 Sol 含潜在 cyberguards, 读对照表时要把这两条条件一起带上. 引言还点名 o 系列, extended-thinking, DeepSeek-R1,Kimi K1.5,K2.5 Agent Swarm, 用来说明 TestingTime 轴已经很热闹, 而开源预训练轴仍偏慢. 若强 RL 方法都压在相近规模底座上, **开源进步可能彼此收敛, 与最强闭源的差距反而拉大**, 这是引言里写明的风险判断.

贡献清单四条: 预训练开源前沿(2.8T / 104B / 1M, KDA + AttnRes + Stable LatentMoE, 相对 K2 约 2.5× Scaling 效率); 多力度 TestingTime Scaling 的 RL; 支撑多万亿参与百万 token 的基础设施; 开源完整权重. 读的时候把「架构效率」「后训练统一」「系统共设计」当成三条可分开核对的证据链, 不要混成一句「模型更大所以更强」. 后训练环境名单也很长: 可验证搜索, 专业知识工作, SWE 与内核优化, 视觉闭环工具, 持久助理, Web 开发, 自主执行, 共同点是「推理-行动-观察-验证-适应」的长环, 常跨成百上千次工具调用与累计数百万上下文 token.

## 2. 架构

### 2.1. 表 1: 相对 K2 改了哪些骨架数字

表 1 把 K2 与 K3 并排. 层数 61→93(↑52%), 总参 1.04T→2.78T(↑167%), 激活 32.6B→104.2B(↑220%). 隐藏维仍是 7,168. Latent MoE 维 3584(0.5× 全宽). 每专家 MoE 隐维 2,048→3,072(↑50%). 路由专家 384→896(↑133%), 每 token 激活 8→16(↑100%), 共享专家 1→2. 注意力头 64→96. 训练上下文 128K→1M(8×). 注意力从纯 MLA 换成 Hybrid KDA-MLA:69 层 KDA + 24 层 MLA. 激活从 SwiGLU 换成 SiTU-GLU.ViT 约 401M,27 层, patch 14,12 头. 词汇量仍 160K, MTP 仍 1 层.

这些 Δ 不是装饰. 激活参数涨约 3.2×, 路由专家与 Top-k 一起涨, 稀疏度到 56(896/16), 通信与专家权重流量若仍按全宽走会炸; **LatentMoE 把路由专家压到潜变量宽度 ℓ, 才让「896×16」付得起.** Hybrid 注意力则把长序列代价从「每层都全量 softmax」换成「多数层固定状态的线性递推 + 周期性全局层」. 数字以表 1 为准. 读表时还可顺手记下「密集层仍是 1」「词汇量不动」: 规模主要加在深度, 专家池与激活宽度, 而不是词表膨胀.

用表 1 的数字可以粗算参数落在哪. 假设每个路由专家是门支, 上支, 下投影三块矩阵, 输入输出都是潜宽 3584, 中间维 3072, 那么单个专家约 3×3584×3072 ≈ 33.0M 参数; 每层 896 个专家约 29.6B, 93 层里去掉 1 层稠密层还剩 92 层 MoE, 合计约 2.72T(估算). 这已经占了总参 2.78T 的约 98%, 剩下的注意力, 共享专家, 上下投影和词表加起来只有几百亿. 同样算法下, 每 token 激活 16 个路由专家约 48.6B, 104.2B 激活参数里另外一半多来自共享专家, 注意力和嵌入(估算). 这个比例解释了第 3.2 节为什么只把专家权重压到 MXFP4: 省显存的大头全在专家里.

KV cache 的账也能从表 1 读出来. K2 的 61 层全是 MLA, 每层都要为每个 token 缓存潜向量; K3 的 93 层里只有 24 层 MLA 需要随长度增长的缓存, 约占 26%(24/93, 估算), 其余 69 层 KDA 每个头只保留一个固定大小的 $d_k\times d_v$ 状态, 和上下文长度无关. 层数多了一半, **长上下文下随长度增长的缓存反而只来自四分之一的层**, 这是 1M 窗口在推理侧付得起的前提.

### 2.2. Hybrid Attention: 3:1 的 KDA 与 Gated MLA

先说 KDA 的状态更新在做什么. 单个头的递推是式 (1):

$$\mathbf S_t=\big(\mathbf I-\beta_t\boldsymbol k_t\boldsymbol k_t^\top\big)\mathrm{Diag}(\boldsymbol\alpha_t)\,\mathbf S_{t-1}+\beta_t\boldsymbol k_t\boldsymbol v_t^\top,\qquad \tilde{\boldsymbol o}_t=\mathbf S_t^\top\boldsymbol q_t$$

$\mathbf S_t\in\mathbb R^{d_k\times d_v}$ 是一张从 key 到 value 的联想表. 记按通道衰减后的旧表为 $\mathbf S'=\mathrm{Diag}(\boldsymbol\alpha_t)\mathbf S_{t-1}$, 式 (1) 可以整理成 $\mathbf S_t=\mathbf S'+\beta_t\boldsymbol k_t\big(\boldsymbol v_t-\mathbf S'^\top\boldsymbol k_t\big)^\top$. $\mathbf S'^\top\boldsymbol k_t$ 是用当前 key 从旧表读出的值, 真正写进去的只是新值与读出值的差额, 写入强度 $\beta_t\in(0,1)$ 由 $\mathrm{Sigmoid}(\mathbf W_\beta\boldsymbol x_t)$ 给出. 这就是 **delta rule**, 同一个 key 反复出现时不会无限叠加. 式 (2) 对 $\boldsymbol q_t,\boldsymbol k_t$ 做了 L2Norm, $\|\boldsymbol k_t\|=1$, 所以 $\mathbf I-\beta_t\boldsymbol k_t\boldsymbol k_t^\top$ 只把 $\boldsymbol k_t$ 方向上的旧内容缩到 $1-\beta_t$ 倍, 与 $\boldsymbol k_t$ 正交的方向原样保留. 和 GDN, Mamba-2 用一个标量门控制整张表的衰减不同, KDA 的 $\boldsymbol{\alpha}_t$ 是 $d_k$ 维向量, **不同通道可以有不同的记忆长度**, 有的通道记很久, 有的通道几步就忘.

§2.1 每个 block 先 3 层 KDA, 再 1 层 Gated MLA, 骨干末尾再加一层 Gated MLA, 保证最后一层永远是全局注意力. 训练时 KDA chunk 内并行, chunk 间递推. 记 $\boldsymbol\Gamma^{1\to C}_{[t]}$ 为第 $t$ 个 chunk 内各位置的累积保留系数(第 $r$ 行是 $\prod_{i\le r}\boldsymbol\alpha^i_{[t]}$), 式 (4) 是

$$\mathbf A_{[t]}=\mathrm{Tril}\Big[\big(\mathbf Q_{[t]}\odot\boldsymbol\Gamma^{1\to C}_{[t]}\big)\big(\mathbf K_{[t]}/\boldsymbol\Gamma^{1\to C}_{[t]}\big)^\top\Big],\qquad \mathbf O_{[t]}=\big(\boldsymbol\Gamma^{1\to C}_{[t]}\odot\mathbf Q_{[t]}\big)\mathbf S_{[t]}+\mathbf A_{[t]}\widetilde{\mathbf V}_{[t]}$$

第一项读前面各 chunk 传进来的状态, 第二项是 chunk 内交互, $\mathrm{Tril}$ 保留对角, 因为每个输出读的是写入当前 token 之后的状态. 问题出在 $\mathbf K/\boldsymbol\Gamma$: 保留系数都在 $(0,1)$, 连乘越来越小, 倒数可以无界增长, 有限精度下会溢出. Kimi Linear 的办法是在 log 空间算相对衰减, 再把 chunk 切成 16-token 的小 tile, 非对角 tile 走稠密 Tensor Core, 对角 tile 仍要逐个位置对显式计算, 这是 chunk 内的主要瓶颈. K3 改的是式 (5), 即从衰减 logit $\boldsymbol z_t^h$ 到 log-decay 的映射:

$$\boldsymbol g_t^h=g_{\min}\,\mathrm{Sigmoid}\big(e^{A_h}\boldsymbol z_t^h\big)\in(g_{\min},0)^{d_k},\qquad \boldsymbol\alpha_t^h=\exp(\boldsymbol g_t^h)\in(e^{g_{\min}},1)^{d_k}$$

Kimi Linear 沿用 GDN, Mamba-2 的 $\boldsymbol g_t^h=-e^{A_h}\mathrm{Softplus}(\boldsymbol z_t^h)\in(-\infty,0)^{d_k}$. $A_h$ 是每个头可学习的 log 尺度, 初始化为 0; $g_{\min}=-5$ 固定. 于是每个保留系数都大于 $e^{-5}\approx 6.7\times 10^{-3}$, 16-token tile 内累积 log-decay 落在 $(-80,0)$, 倒数小于 $e^{80}\approx 5.5\times10^{34}$, 在 BF16 的最大值约 $3.4\times10^{38}$ 以内(按 BF16 格式推算). 对角 tile 因此也能直接做稠密矩阵乘, 位置对那条路径整个删掉. 两种参数化的差别就落在同一个 $\mathbf K/\boldsymbol\Gamma$ 上: 一个倒数无界, 一个有界, 图 3 把两条曲线和对角 tile 的算法并排画了. 输出门从低秩改成输入相关的满秩投影, 式 (6) 是 $\boldsymbol y_t=\mathbf W_o\big[\mathrm{Sigmoid}(\mathbf W_g\boldsymbol x_t)\odot\mathrm{RMSNorm}(\tilde{\boldsymbol o}_t)\big]$, 先做头内 RMSNorm 再按通道门控.

**Gated MLA** 仍缓存低维潜变量再上投影, 但全部 MLA 层用 **NoPE**: 位置感交给中间的 KDA, 全局内容交互交给 MLA, 扩窗时不必重调 RoPE base 或 YaRN. 输出侧同样加满秩通道门, 式 (7) 是 $\boldsymbol y_t=\mathbf W_o\big[\mathrm{Sigmoid}(\mathbf W_g\boldsymbol x_t)\odot\tilde{\boldsymbol o}_t\big]$, 比 KDA 的式 (6) 少一层 RMSNorm, 作用是让每个 token 按通道调节从全局注意力读回的内容. 训练时注意力输出保 FP32, 以修 flash attention 的偏置舍入; 内核把输出 tile 与 KV staging 重叠, 而不是与 query tile 抢共享内存. KDA 机制细节见上文 KDA 单独成篇; MLA 压缩 KV 的一般形式见 MLA 单独成篇. Hybrid 的 3:1 比例本身没有消融表, 但「末层强制全局」写得很清楚: 别让最后一层只剩线性递推.

下界 $g_{\min}=-5$ 也限制了遗忘的速度. 每步保留系数最小约 0.0067, 也就是说单个通道一步最多丢掉 99.3% 的旧内容, 不能一步清零. 报告把它和 Kimi Linear 的无界 Softplus 对比, 理由是数值范围和算子形态, 没有给这个下界对模型质量的消融. 位置信息完全交给 KDA 的衰减来编码, 这一点和第 3.1 节的 NoPE 扩窗直接相连: MLA 层不带 RoPE, 扩窗时没有位置参数需要改.

### 2.3. AttnRes: 深度维也做注意力, 而不是一条残差累加

§2.2 把「序列位置互相选」的想法搬到深度. 标准残差把此前所有信息压进一个 $\boldsymbol h_l$ 逐层累加, AttnRes 让第 $l$ 层用一个可学习**伪查询** $\boldsymbol q_l=\boldsymbol w_l\in\mathbb R^d$ 去选此前各层的输出. 式 (8)(9):

$$\boldsymbol k_i=\boldsymbol v_i=\begin{cases}\boldsymbol h_1 & i=0\\ f_i(\boldsymbol h_i) & 1\le i\le l-1\end{cases},\qquad \alpha_{i\to l}=\frac{\phi(\boldsymbol q_l,\boldsymbol k_i)}{\sum_{j=0}^{l-1}\phi(\boldsymbol q_l,\boldsymbol k_j)},\qquad \boldsymbol h_l=\sum_{i=0}^{l-1}\alpha_{i\to l}\,\boldsymbol v_i$$

$\boldsymbol h_1$ 是 token 嵌入, $f_i(\boldsymbol h_i)$ 是第 $i$ 层的输出, 核函数 $\phi(\boldsymbol q,\boldsymbol k)=\exp\big(\boldsymbol q^\top\mathrm{RMSNorm}(\boldsymbol k)\big)$. 标准残差相当于所有 $\alpha_{i\to l}$ 都取 1 的等权求和, AttnRes 把这组权重换成按 token 变化的 softmax. 全形式的算术是 $O(L^2d)$, $L<100$ 时付得起, 麻烦在要让全部层输出一直存活, 内存 $O(Ld)$. **Block AttnRes** 把 $L$ 层分成 $N$ 块, 块内输出直接求和成 $\boldsymbol b_n=\sum_{j\in\mathcal B_n}f_j(\boldsymbol h_j)$, $\boldsymbol b_n^i$ 表示块内前 $i$ 层的部分和, 并令 $\boldsymbol b_0=\boldsymbol h_1$. 第 $n$ 块第 $i$ 层能选的 value 是式 (10):

$$\mathbf V=\begin{cases}[\boldsymbol b_0,\boldsymbol b_1,\dots,\boldsymbol b_{n-1}]^\top & i=1\\ [\boldsymbol b_0,\boldsymbol b_1,\dots,\boldsymbol b_{n-1},\boldsymbol b_n^{i-1}]^\top & i\ge 2\end{cases}$$

块间是注意力, 块内退回求和, 内存从 $O(Ld)$ 降到 $O(Nd)$. K3 按 12 层一块切, 末块不完整, 连嵌入共 9 块. 推理时块间结果可用 online softmax 与块内部分和合并. AttnRes 的一般讲法见上文单独成篇; 这里记住报告给出的块划分与「伪查询 + RMSNorm(key)」即可.

Block 化之后, EAGLE-3 草稿微调还从第 1, 第 4, 最终 AttnRes block 取低/中/高层特征做融合(§4.1.4).**AttnRes 不只是训练时的深度通路, 也进了推测解码的特征接口.** 经验上 $N\approx 8$ 跨规模收回大部分收益, 这个数字直接来自 AttnRes 原报告 [58], K3 只是在 93 层骨干上落地成「8 块 × 12 层 + 嵌入」.

块数可以对一下: 93 = 7×12 + 9, 即 7 个满块加 1 个只有 9 层的末块, 再算上嵌入 $\boldsymbol{b}_0$ 一共 9 个来源(估算, 与报告「末块不完整, 共 9 块」一致). 这样每层做深度注意力时, 最多看 8 个已完成块的表示加当前块的部分和, 而不是 93 个层输出. 伪查询 $\boldsymbol{w}_l$ 与输入无关, 是每层一个可学习向量, 不需要额外的 query 投影; 权重仍然随 token 变化, 因为 key 是这个 token 在各层或各块的输出. RMSNorm 放在 key 上, 防止输出幅度大的层靠范数赢下 softmax; value 不做归一化, 所以被选中的层仍按原幅度进入 $\boldsymbol h_l$.

报告没有给 AttnRes 在 K3 上的单独消融, 它的收益和 Hybrid Attention, Stable LatentMoE 一起被归进图 7 的约 2.5× 效率. 能单独核对的是系统面的代价: 训练时整个 AttnRes 计算包在 checkpoint 里, 每层为反向保存的激活和标准残差相同; 流水线并行时只增量传新生成的块(§5.2.2).

### 2.4. Stable LatentMoE: 归一化, SiTU-GLU, Quantile Balancing

§2.3 在 LatentMoE 上叠三件稳定化. 一层的计算是式 (11):

$$\boldsymbol u=\sum_{i\in\mathcal T_k(\boldsymbol x)}p_i\,E_i^{\text{routed}}\big(\mathbf W^{\downarrow}\boldsymbol x\big),\qquad \boldsymbol y=\sum_{j=1}^{N_s}E_j^{\text{shared}}(\boldsymbol x)+\mathbf W^{\uparrow}\,\mathrm{RMSNorm}(\boldsymbol u)$$

共享专家 $E^{\text{shared}}:\mathbb R^d\to\mathbb R^d$ 直接吃全宽输入, 每层 $N_s=2$; 路由路径先用 $\mathbf W^{\downarrow}$ 把 $\boldsymbol x$ 压到潜宽 $\ell$, 选中的 $k$ 个专家 $E^{\text{routed}}:\mathbb R^\ell\to\mathbb R^\ell$ 在潜空间里算完, 按 $p_i$ 加权得到 $\boldsymbol u\in\mathbb R^\ell$, 再 RMSNorm 后由 $\mathbf W^{\uparrow}$ 投回全宽. 分派出去的是 $\ell$ 维而不是 $d$ 维向量, K3 里 $\ell=3584=d/2$, 专家并行的 all-to-all 流量随之减半. 极端稀疏会放大两件事: 路由支路近四段矩阵连乘导致激活爆炸; 近 $10^3$ 专家的负载均衡超出旧辅助损失无关法的舒适区. **Normalized LatentMoE** 对应式 (11) 里 $\mathbf W^{\uparrow}$ 前那一个 RMSNorm. 原版 LatentMoE 直接把 $\boldsymbol u$ 投回全宽, 而 $\boldsymbol u$ 的幅度随选中的专家和路由权重变化; 加了归一化, 路由支路进入全宽之前幅度先被固定, 再和共享支路相加. 报告说这一处不仅稳住训练, 还稳定改善验证损失与下游基准, 但没给对照数字.

**SiTU-GLU** 是式 (12):

$$\text{SiTU-GLU}(\boldsymbol x)=\Big[\beta_1\tanh\Big(\frac{\mathbf W_g\boldsymbol x}{\beta_1}\Big)\odot\mathrm{Sigmoid}(\mathbf W_g\boldsymbol x)\Big]\odot\Big[\beta_2\tanh\Big(\frac{\mathbf W_u\boldsymbol x}{\beta_2}\Big)\Big]$$

SwiGLU 的门支是 $z\cdot\mathrm{Sigmoid}(z)$, 上支是 $z$, 两个因子都无界. SiTU-GLU 把门支里的线性因子和整条上支各自换成 $\beta\tanh(z/\beta)$, sigmoid 因子保留, 负半轴仍被它压向 0. 附录 B 给了两条性质: 近原点 $\beta\tanh(z/\beta)=z+O(z^3/\beta^2)$, 一阶上与 SwiGLU 相同, $\beta_1,\beta_2\to\infty$ 时逐点退回 SwiGLU; 因为 $|\tanh|<1$, $0<\mathrm{Sigmoid}<1$, 每个输出坐标满足 $\|\text{SiTU-GLU}(\boldsymbol x)\|_\infty\le\beta_1\beta_2$, K3 取 $\beta_1=4$, $\beta_2=25$, 上界 100.

**Quantile Balancing** 沿用无辅助损失路由, 负载均衡只靠一个专家偏置 $\boldsymbol b$. 路由是式 (13):

$$\mathcal T_i=\mathrm{argtop}_k(\boldsymbol s_i+\boldsymbol b),\qquad p_{i,j}=\frac{s_{i,j}}{\sum_{r\in\mathcal T_i}s_{i,r}},\quad j\in\mathcal T_i$$

$\boldsymbol s_i=\mathrm{Sigmoid}(\mathbf W_r\boldsymbol x_i)$ 是 router 分数. $\boldsymbol b$ 只参与选谁, 不进混合权重 $p_{i,j}$, 所以不改 router 的梯度. 路由时顺手取 Top-$(k+1)$, 第 $k+1$ 名的有偏分数记作门槛 $\alpha_i^{(t)}$, 下一步的偏置由式 (14) 给出:

$$\widehat b_j^{(t+1)}\leftarrow-\mathrm{quantile}_{1-k/n}\big(\boldsymbol s_{:,j}-\boldsymbol\alpha^{(t)}\big),\qquad \boldsymbol b^{(t+1)}\leftarrow\widehat{\boldsymbol b}^{(t+1)}-\mathrm{mean}\big(\widehat{\boldsymbol b}^{(t+1)}\big)\boldsymbol 1$$

第一行对专家 $j$ 取所有 token margin $s_{i,j}-\alpha_i$ 的 $1-k/n$ 分位数, 也就是第 $q+1$ 大的 margin, 目标负载 $q=mk/n$; 旧偏置只通过门槛 $\alpha_i$ 进入. 第二行减去公共均值, 所有专家同加一个常数不改变任何 token 的 Top-k, 这一步只防偏置整体漂移. 附录 C 把它放回平衡指派的对偶问题: 对偶目标 $\mathcal L(\boldsymbol\alpha,\boldsymbol\beta)=\sum_{i,j}\max(0,s_{i,j}-\alpha_i-\beta_j)+k\sum_i\alpha_i+\frac{mk}{n}\sum_j\beta_j$, 偏置 $\boldsymbol b=-\boldsymbol\beta$. 对 $\beta_j$ 求次梯度得式 (27):

$$\frac{\partial\mathcal L}{\partial\beta_j}=\frac{mk}{n}-\sum_{i=1}^m\chi\big(s_{i,j}-\alpha_i-\beta_j>0\big)$$

即目标负载减实际负载. 旧的无辅助损失规则 $b_j\leftarrow b_j+\gamma\,\mathrm{sign}(\bar\ell-\ell_j)$ 是对这个量做 SignSGD, 只取负载误差的方向, 每步走固定的 $\gamma$; QB 直接把它解到零, 一步跳到同一对偶目标在 $\beta_j$ 方向上的精确最小点. 两种方法用的是同一个梯度, 差别只在走一步还是一次解完. 附录 C 也和 BIP 做了比较: BIP 用不等式约束, 对偶变量多出非负截断, 只能压过热专家, 不能拉冷门专家, 报告实验里均衡明显更慢. 大规模时分位数用直方图估计(附录 D), 各 rank 的 bin 计数可加, 一次 all-reduce 就得到全局 batch 的分位数, 通信只是每专家几百个 bin, $B=1000$ 时误差约 $10^{-3}$ 量级. 本库 Stable LatentMoE / SiTU-GLU 单独成篇可对照机制, 数字以本报告为准.

SiTU-GLU 的两个上限可以代入数字感受一下. 门支的线性因子换成 $4\tanh(x/4)$: 输入 1 时约 0.98, 几乎等于 SwiGLU; 输入 10 时约 3.95, 而 SwiGLU 是 10(估算). 上支换成 $25\tanh(x/25)$: 输入 100 时约 24.98. 两支相乘最多约 100, 这就是 $\|f\|_\infty\le 100$ 的来源. 近原点行为不变, 大值被压住, 所以低精度训练和第 3.2 节的 MXFP8 激活不容易溢出; 附录 B 另外和硬截断做了比较: 硬截断在阈值外梯度直接为零, tanh 软上限的梯度是逐渐变小.

Quantile Balancing 的图 5 例子很小, 适合手算: 8 个 token, 4 个专家, 每 token 选 1 个, 目标负载 $q=8\times1/4=2$. 原始 Top-1 路由给出负载 (4, 3, 1, 0), 第一个专家过热, 第四个专家没人用. QB 对每个专家看所有 token 的 margin(分数减去该 token 的第 $k+1$ 名门槛), 把偏置设在第 $q+1$ 大的 margin 上, 这样恰好 2 个 token 越过门槛, 结果变成 (2, 2, 2, 2). 同一个例子换成旧规则, 四个专家的偏置各挪 $\gamma$, 步长小了几步都追不上 (4, 3, 1, 0) 的差距, 大了又会来回震荡; **QB 一步直接算出能达到目标负载的偏置, 没有学习率要调.** 当前 batch 算出的偏置只在下一步生效, 避免用自己的统计量路由自己, 训练结束后偏置冻结, 推理时只是固定偏置下的 Top-k.

### 2.5. 原生视觉: MoonViT-V2 从零训, 不用 SigLIP 热启

§2.4 相对 K2.5 的关键转向: **MoonViT-V2 完全从零, 用 next-token prediction 训**, 不再用 SigLIP 对比预训练初始化. 图 6 分全轨迹与 14k–16k 放大两窗: SigLIP 初始化的 MoonViT-3D 梯度范数更高, 尖峰更多; 从零的 V2 更稳, 且视觉评测与基线持平, 报告据此说大规模多模态 LM 不必靠对比初始化. 动机也写在表示目标上: 对比损失更偏全局语义, next-token 目标更能塑细粒度文本与结构线索. 架构仍是 27 层, 约 0.4B, RMSNorm, 线性与注意力投影去偏置; 图视参数全共享, 注意力分解为帧内空间与帧间时间两趟, 再加时间池化; 投影前 2×2 pixel-shuffle, 视觉 token 再压 4×, 最高约 3584×3584 仍能进 1M 上下文.

这条叙事和 K2.5「早期低比例视觉融合」并不矛盾: K3 强调的是编码器初始化与联合优化稳定性, 不是否定全程混 token. 像素 shuffle 与 1M 上下文的关系写得很实用, 视觉分辨率预算被压进同一百万 token 窗口, 而不是另开一套多模态上下文. 原生多模态还支撑「写代码 → 看截图/视频帧 → 再改」的同流闭环, 渲染产物与生成它的代码不必跨模型交接; 这和 §4.2.3 的视觉-in-the-loop RL, §7 的运动图形案例是同一条产品线.

3584×3584 这个上限可以换算成 token. 按 patch 14 切, 每边 256 个 patch, 共 65,536 个; 2×2 pixel-shuffle 之后是 16,384 个视觉 token(估算, 未计视频的时间池化和特殊 token). 一张最大分辨率图约占 1M 窗口的 1.6%, 几十张截图加上代码和工具输出仍放得下, 这是「边写边看」的 agent 循环在上下文预算上可行的原因. K2.5 的 MoonViT-3D 从 SigLIP-SO-400M 初始化, K3 把初始化换掉, 但保留了 NaViT 式变分辨率打包和时空分解注意力这套结构, 两代编码器参数量都在 0.4B 上下.

## 3. 训练与系统

### 3.1. 预训练: 余弦优于 WSD, NoPE + 四级扩窗到 1M

§3 数据仍是 Web/Code/Math/Knowledge 四个文本域, 加一个视觉语料(字幕图文, 交错图文, OCR, 感知, 视频, 视觉编码六类); 各域用规则, 分类器打分和去重过滤, 采样比例由小模型消融确定; 知识与数学沿 K2 做多样式改写(多样提示, 按 chunk 自回归, 对源文档保真校验). 视觉侧额外强调程序化多模态: SVG,3D, 网页, 游戏, CAD 与代码-渲染对, 坐标监督同时给绝对与归一化格式, 方便分辨率稳健的定位. Scaling Laws (图 7)给出约 2.5× 效率增益, 并据此重调 batch size, 学习率, TPP 与模型形状. 学习率日程**选余弦而不是 WSD**. 权重衰减全程 0.1, 余弦日程带 1% 线性 warmup. 优化器用 **Per-Head Muon**: 对 Q/K/V 投影, 把动量矩阵沿头维切成 $\mathbf M=[\mathbf M^1;\dots;\mathbf M^H]$, 每块单独做 $\mathrm{NS}(\mathbf M^h)$ 再拼回, 其他矩阵参数仍按整矩阵做 Muon. 整矩阵正交化时所有头是一个耦合块, 梯度或动量尺度大的头主导共同的奇异方向, 尺度小的头归一化不足; 按头切开后, 每个头的更新各自被推到奇异值为 1 附近, 尺度拉平. 报告说这让各头学习更均衡, 大规模下训练更稳, 但没给对照数字; 高瘦的每头块上做 Newton-Schulz 也比整矩阵便宜. §3.3 另写了一句容易漏掉的话: 仍沿用 K2 引入的权重裁剪机制, 也就是 MuonClip 里的 QK-Clip. K2 用它压住 Muon 下注意力 logit 的爆炸, 机制和 K2 的 $\tau=100$ 设定见 [K2 的解析](../kimi-k2/kimi-k2-analysis.md); K3 的阈值和生效步数本页没给.

几项关键数字本页没有公开: 预训练总 token 数, 各域的采样比例, 峰值学习率, batch size, 重调后的 TPP 取值. K2 报告写过 15.5T token 和 67M token 的 batch, K3 只说这些超参都按新的 Scaling Laws 重新搜过, 没有给结果. 所以「约 2.5× 效率」只能读成: 在同样的 OOD 验证损失上, K3 这一族需要的训练算力约为 K2 一族的 1/2.5(按图 7 的定义理解, 属于读图). 余弦对 WSD 的结论也要带条件读. 这组对比固定的是最低学习率, 模型大小和训练 token 预算; 报告发现两种日程的最优峰值学习率和 batch size 差得很远, 共用一套超参会偏袒和这套超参更合拍的一方, 所以对两种日程各做一遍 Scaling Laws 搜索, 在各自最优超参下比较, 余弦的最终损失始终更低; K2 用的是 WSD, K3 换回余弦, 是这次日程上的实际改动.

预训练从 8k 起, 再延到 64k; 冷却阶段 256K→1M. 位置信息靠 KDA 递推门控隐式编码(NoPE), 扩到 1M 不必改 RoPE base 或套 YaRN. 长文长视频先经精确/模糊去重, 视频帧感知哈希, 启发式与分类器过滤, 结构校验, 再上采样, 以免冷却阶段被短序列淹没; 并合成「必须跨全上下文才能解」的置换拼接任务, 防止注意力塌成局部模式. **四阶段课表把昂贵长序列集中在总预算一小部分**, 这是「能训到 1M」和「训得起 1M」之间的预算答案. 序列维划分细节指向 §5.1.2 的 KCP. 读这一节时, 把「数据清洗 + 合成长程任务」和「NoPE 外推」当成两条并行条件: 只加长窗口不够, 还要逼注意力在百万尺度上真的用得上远端信息.

四个阶段是 8K, 64K, 256K, 1M, 前两段在主预训练里, 后两段在冷却期. 每一段用了多少 token, 占总预算多少, 报告只说「很小一部分」, 没有数字. 和 K2 对比, K2 主体在 4k 上下文上训, 再用 YaRN 扩到 128K; K3 的起点就是 8K, 终点 1M, 而且不用 YaRN. 1M 的实际可用性在评测里有一个旁证: BrowseComp 用满 1M 窗口, 不做上下文管理时仍有 90.4%, 只比 300K 触发压缩的 91.2% 低 0.8 个点.

### 3.2. 后训练: 九专家再蒸馏成一个, 量化从 SFT 就跟

§4.1 三阶段: SFT 冷启动(XTML chat template, 见附录 F)→ 三域(general / general agents / coding agents)× {low, high, max} 共九个专家 RL → **MOPD**(式 (15))收成统一学生. 图 8 显示 RL FLOPs 加大时分数与助手步数一起涨. 三域覆盖面写得很宽: general 含通用体验, 视觉, 推理, 忠实性, 搜索与知识工作; general agents 含长程助理, 深度研究, 段落级写作; coding agents 含 SWE, 编码体验, 内核与 Web 开发. 算法侧扩展 partial rollout:$\lambda$ 比例轨迹完成后即可更新, 长轨迹跨迭代靠沙箱恢复; 用 per-token 正则扛极端 off-policy. 推理力度用每题 token 预算 $\tau\cdot b_0(x)$, 超预算奖励改 −1; 通用任务计 thinking token, 智能体任务计含工具参数的累计输出. 不可验证任务用 **Agentic GRM**, 强制走「读产物 → 写量规 → 打分 → scorepad」协议, 并加冗长度预算防「越写越长」.

力度控制写成奖励覆盖:

$$\tilde r(x,y)=\begin{cases}-1, & T(y)>\tau\cdot b_0(x)\\ r(x,y), & \text{否则}\end{cases}$$

$b_0(x)$ 是冷启动模型在这道题上估出的初始预算, $\tau$ 是预算倍数; $T(y)$ 在通用任务里只数 thinking token, 在智能体任务里数累计输出, 推理和工具调用参数都算. 三档力度是按日程训出来的. 先用较大的 $\tau$ 训 max 档, 同时仍设一个最大预算防止无止境地想; 再把 $\tau$ 往小退火, 得到 high 和 low 两档专家, 每个域的 $\tau$ 由人工看着调. $b_0(x)$ 按题估计, 所以难题预算天然更大, 简单题不会分到同样多的 token. 奖励规则很硬: **超预算的轨迹不管答得对不对都记 −1**, 比答错的奖励还低(答错一般是 0, 这是推断, 报告没写任务奖励的取值范围), 模型没有「多想一点换对答案」的余地. 和 K2.5 的 Toggle 放在同一步计算上比较: Toggle 在 Phase0 把超预算的正确回答乘 0, 而且只在该题正确率超过阈值时才生效; K3 是无条件覆盖成 −1, 也没有放开预算的 Phase1, 不同力度改由不同 $\tau$ 的专家分别承担. GRM 的冗长度控制是同一个思路, 冷启动模型估出初始长度 $\ell_0$, 候选输出长度超过 $\sigma\cdot\ell_0$ 就直接输掉两两比较. 这套做法接的是 K2.5 的预算控制奖励, RL 的策略优化算法也沿用 K2.5, 包括 token 级的 log-ratio 约束, 机制见 [K2.5 的解析](../kimi-k2-5/kimi-k2-5-analysis.md).

**partial rollout** 的比例 $\lambda$ 解决的是长尾. 每轮对 N 个 prompt 各采 K 条, 只要 $\lambda NK$ 条跑完就暂停生成, 进入更新; 没跑完的轨迹入队, 下一轮优先恢复, 所以一条上千步的轨迹会跨好几轮参数版本, 前半段和后半段来自不同的策略. 这是严重的 off-policy, 报告靠 per-token 正则把更新限制在局部邻域里扛住. $\lambda$ 取多少, 本页没给. 这一设计在 k1.5 时就有, 当时是把长回答切段跨迭代续写, K3 把续写的对象从文本扩到了带沙箱状态的 agent 轨迹, 恢复靠第 3.4 节的 AgentENV.

MOPD 的式 (15) 值得拆开看:

$$r^d_{\mathrm{opd}}(y_t\mid e,x,y_{<t})=\mathrm{clip}\Big(\mathrm{sg}\Big(\log\frac{\pi^{(d,e)}_{\text{teacher}}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid e,x,y_{<t})}\Big),-R_{\max},R_{\max}\Big)$$

学生模型自己采样一条回答(on-policy), 在每个 token 位置上, 用对应域 $d$ 和力度 $e$ 的老师与学生的 log 概率比作为这个 token 的奖励. $\mathrm{sg}$ 是停梯度, 让这个量只当奖励用, 梯度仍走 RL 的策略梯度那条路; $R_{\max}$ 截掉极端值, 防止个别 token 上老师学生分歧过大时优势信号失控, 取值报告没给. 注意老师那一侧不带 $e$ 作条件, 力度已经由选哪位老师决定; 学生那一侧带 $e$, 因为同一个学生要学三种力度. 老师认为这个 token 比学生更该出现, 奖励为正, 反之为负; 不计截断时, 对整条轨迹求和再取期望, 正好是学生相对老师的反向 KL 取负, 所以**它是一个逐 token 的稠密奖励**, 可以直接塞进现有 RL 框架, 连 partial rollout 都能复用. 报告也试过更细的 top-k 分布蒸馏, 即在每个位置对齐老师前 k 个 token 的分布, 而不只看学生实际采出的那一个; 收敛速度和最终效果都没有明显优势, 最后用的是只看采样 token 的形式. 这组比较换掉的只是每个位置用多少老师信息, 采样仍是学生 on-policy, 所以结论只说明在这个设定下多给的分布信息没换来收益, 报告没有给曲线. 力度 $e$ 作为输入条件传给学生, 对应附录 F 里用自然语言选项消息指定 thinking-effort, 同一个学生由此学会三种预算下的行为.

部署侧: 专家权重 MXFP4, 激活 MXFP8, **从 SFT 起做 QAT**, rollout 与训练同量化方案以消训推缝; 非专家组件(注意力投影, latent MoE 投影, 共享专家, 路由器)保持更高精度. MTP 层微调成 EAGLE-3 风格 draft, 草稿展开七步, 融合第 1 / 第 4 / 最终 AttnRes block 特征,$W_{\mathrm{E3}}$ 初始化为 $[\mathbf{0}\,\mathbf{0}\,I]$; 直接优化接受率的 LK loss(式 (16)), temperature 1, 无辅助真值交叉熵. 九专家 × MOPD 的产品含义是: 用户侧看到一个模型, 训练侧却按域与力度分了九条策略再收拢.

量化和草稿模型的两处设计都有明确的理由. MXFP4 按 OCP MX 规范是每 32 个 FP4 数共享一个 8 位指数作比例因子, 摊下来每个权重约 4.25 bit(按规范推算, 本页没写). 按第 2.1 节的估算, 专家权重约占 2.7T, BF16 存要 5.4TB 上下, MXFP4 约 1.4TB(估算). 从 SFT 起就带着量化训练, RL 时 rollout 和训练用同一套量化, 采样出来的轨迹和被更新的模型数值上一致, 不会出现「推理用 FP4, 训练用 BF16」带来的分布偏差. 草稿模型直接优化接受率的负 log, 即式 (16):

$$\mathcal L_{\mathrm{LK}}=-\log\sum_{x\in\mathcal V}\min\big(p(x),q(x)\big)$$

$p$, $q$ 分别是目标模型和草稿模型的下一 token 分布, 都在 temperature 1 下算. 无损投机采样下每个 token 的接受概率正是 $\sum_x\min(p,q)$, 它等于 $1$ 减两分布的总变差距离. 草稿容量有限时, 最小化 KL 不等于最大化这个量, 所以直接把它当损失, 也不加真值交叉熵. 那七步展开里, 第一步之后目标侧最新位置的特征拿不到, 草稿吃自己前几步的输出, 和推理时的递归起草一致. $W_{\mathrm{E3}}$ 初始化成只取高层特征, 是让草稿一开始就等于它预训练时见过的 MTP 输入, 再慢慢学会用低层和中层特征.

### 3.3. RL 环境: 奖励怎么定, hacking 怎么防

任务合成(§4.2)值得单独记. **统一白盒 harness** 把工具接口, 系统提示, 上下文管理, skills, 记忆, 子智能体都做成可配置模块, 可拼出 Kimi Code / Claude Code / Codex / OpenClaw / Hermes 等配置, 也能拼出全新的组合; RL 时不同任务组用不同配置, 避免模型过拟合某一套工具 schema 或上下文管理方式. 这和评测协议直接相关: 表 2, 表 3 里 K3 在 Kimi Code, Claude Code, OpenClaw 等不同 harness 下都有分数, 训练时见过多种外壳, 是跨 harness 评测能成立的前提. **知识图谱引导出题**(图 9)是一张有向无环图, 由 agent 从粗粒度种子节点出发反复搜索扩展, 加节点前先查重复用已有概念, 边总是从粗概念指向细概念, 概念足够原子时停止扩展; 出题时按粒度采样节点, 结合祖先节点的上下文生成检索词, 再用检索到的真实材料合成不同类型的任务.

可验证奖励的环境有几类, 奖励设计各不相同. 内核优化: 每题带 PyTorch 参考实现, 数值误差超阈值直接 0 分; 性能以专家实现为基准, 追平得 0.5, 越接近硬件 roofline 越接近 1; 覆盖 CUDA, Triton, CuTe DSL, Gluon, ThunderKittens, TileLang 和 BF16, FP8, FP4 等格式, 并有 hacking 检测, 惩罚 CUDA graph 重放, 缓存输入, 偷偷降精度这类刷分手段, 开发中发现新手法就补新规则. 视觉推理: 沙箱里给 Python 解释器, 模型写代码裁剪, 放大, 变换图片或验算, 生成的图片作为新观测返回, 报告说模型学会的图像操作越多, 复杂视觉推理越好. 这与表 2 里 Math-Vision 带 Python 从 94.3 升到 97.8, ZeroBench-main 从 23.0 升到 41.0 是同一件事的两面.

长程环境更看重状态. 个人助理任务 mock 了 Gmail, Notion, Slack, Canvas, 保留真实应用的核心语义, 但不依赖外部 API 和限流; 一个任务跨多个模拟日, 分布着几十个相互依赖的事件, 每个事件有自己的评判标准(规则或 LLM 评估), 单次 rollout 可达数千次工具调用和数百万上下文 token. **AET** 给定初始状态, 目标约束, 工具动作空间, 执行预算和独立 verifier, 不给参考轨迹, 奖励只看 verifier 对最终环境状态的判断, 不看 agent 自称完成; 防 hacking 的做法是 agent 与 verifier 隔离, 公开 verifier 给诊断反馈, 隐藏 verifier 评留出场景, 提交次数有限并按次数扣分. 图 10 的黑盒系统复刻任务要求 agent 通过查询 oracle 重建一个隐藏的相机维修系统, 这和 ProgramBench 只给二进制和文档, 要求重写程序是同类能力, K3 在 ProgramBench 上 77.8 排第一. WebDev 任务在容器沙箱里跑, 同样换用多种 scaffold, 奖励由确定性检查(功能测试, 结构和像素相似度)加内部奖励模型评判组成, 构建失败, 运行报错或用假实现糊弄都得零分.

这些环境和评测之间的对应是读图, 报告没有做「去掉某类环境」的消融. 但对应关系很整齐: 内核 RL 对应 SWE-Marathon(GPU 内核向, K3 42.0 领先 Fable 5 的 35.0)和第 4.4 节的内核案例; 知识图谱出题和可验证搜索对应 BrowseComp, DeepSearchQA; mock 应用对应内部的 24/7 ClawBench; WebDev 对应 WebDev Arena 登顶. 反过来, 企业多系统协作和 GDPval 类知识工作 Elo 仍落后 Fable 5, 说明**专业工作流环境的覆盖还不够**.

### 3.4. 基础设施: KCP, MoonEP, AgentENV, 细粒度前缀缓存

§5 把三类问题绑在同一生命周期: KDA 系统共设计, 3T 级 MoE 预训练, 1M 智能体 RL. FlashKDA 做 chunkwise 训练/prefill, 把 chunk 内计算与跨 chunk 状态传播重叠; 单卡内还可把序列切到各 SM 做段转移再合并, 无跨设备通信. **KDA Context Parallelism**(式 (17))因 delta 乘法不能像普通线性注意力那样直接加局部状态, 要交换累积转移 $\mathbf{M}$ 与从零局部状态再 prefix scan, 通信是定长 all-gather(实现见 FLA PR #691).**MoonEP**(开源仓库 MoonshotAI/MoonEP)用动态冗余专家做到每 rank 恰好 $S\times K$ token, 证明冗余专家上界 $E/R$(附录 E 定理 1, 紧性约 $\lceil E(R-1)/R^2\rceil$); 零拷贝 permute, 静态 shape, 免每层 host sync; 共享专家 GEMM 另开一流重叠. 内存侧统一 activation manager(重计算 / FP8 / 卸载都是策略),Block AttnRes checkpoint, 跨 PP rank 用 Mooncake 远端卸激活, Pipeline ZeRO-2,P2P Muon 正交化. 多模态编码器把大图按 patch 做 CP, 并把 ViT 前向/反向塞进交错 1F1B 的 PP bubble.

1M RL: 共置训练把单次实验收在数百 GPU 内; 外置 KV 池写回 CPU DRAM, KDA 状态与 MLA 块生命周期对齐; 训练态卸到 NVMe;auto-throttling 按活跃/排队请求与 KV 利用率调并发; 非策略模型前向复用 FP32 梯度缓冲, ZeRO-2 下每 GPU 只留两块 VPP chunk 槽做双缓冲预取. **AgentENV**(Firecracker microVM, 开源 kvcache-ai/AgentENV)支持 pause/resume/fork/snapshot, checkpoint/resume 低至 133 ms / 49 ms, 暂停可占沙箱生命周期高达 98%;OverlayBD + 定制 ublk 实现亚秒启动, 真实负载内存超卖可达 6.5×; 训练与评测共创建 51,219,741 个沙箱, 跨 1,505,678 个镜像. 推理侧把 KDA 状态打进与 MLA 同池的分页布局; 哈希粒度(如 512)与物理块(1024–6144)解耦, 图 12 展示物理块内细粒度命中; 命中块跨组 pin, 同调度步新块延迟匹配, checkpoint 跨 KDA 组原子一致. Decode 用投影输入重放做推测解码回滚(与 ReplaySSM 同向);Block AttnRes prefill 用 SP 避免每 TP rank 物化块表示, 解码侧块间内核放侧流; LatentMoE 融下投影与路由器, multimem store 融 all-gather, 小 batch 走 WarpDecode 式 token-centric 内核. 舰队层: 会话按一致性哈希固定到主副两个集群, 既保缓存亲和, 又能在故障时分摊重新 prefill; 按请求类预算准入, 防止 1M 突发饿死短请求的 TTFT. 这些段落说明: 没有系统共设计, 2.8T 与 1M 同时可训可服写不成技术报告.

KCP 为什么不能照搬普通线性注意力的做法, 可以用式 (17) 讲清楚. 普通线性注意力的状态是逐 token 累加的, 每个 rank 从零算出本段的局部状态, 前面各 rank 的局部状态直接相加就是本段的入口状态. KDA 每一步先用 $\mathbf{M}_t=(\mathbf{I}-\beta_t\boldsymbol{k}_t\boldsymbol{k}_t^\top)\mathrm{Diag}(\boldsymbol{\alpha}_t)$ 乘旧状态再写入, 一段 token 对状态的影响取决于进入这段时的状态是什么, 光有「从零开始的局部状态」不够. KCP 把一段的作用拆成两块都能本地算的量. 记第 $i+1$ 个 rank 上前 $t$ 个本地 token 的累积转移 $\mathbf M^{t\leftarrow1}_{[i+1]}=\prod_{r\leftarrow1}^{t}\mathbf M_r\in\mathbb R^{d_k\times d_k}$, 从零状态出发算出的局部状态为 $\widetilde{\mathbf S}^t_{[i+1]}$, 式 (17) 的第一行是

$$\mathbf S^t_{[i+1]}=\widetilde{\mathbf S}^t_{[i+1]}+\mathbf M^{t\leftarrow1}_{[i+1]}\,\mathbf S^{T_i}_{[i]}$$

第一项是本段 token 自己写进去的内容, 第二项把前一个 rank 的出口状态 $\mathbf S^{T_i}_{[i]}$ 经本段的全部 KDA 更新传下来. 取 $t=T_{i+1}$ 时, $\mathbf M^{T_{i+1}\leftarrow1}_{[i+1]}$ 和 $\widetilde{\mathbf S}^{T_{i+1}}_{[i+1]}$ 都只依赖本地 token, 不必等前一个 rank 算完. 每个 rank 先本地算出这两块定长张量, 一次 all-gather 交换, 然后从 $\mathbf S=\mathbf 0$ 起对同一文档前面的各段依次执行 $\mathbf S\leftarrow\mathbf M^{T_j\leftarrow1}_{[j]}\mathbf S+\widetilde{\mathbf S}^{T_j}_{[j]}$, 就得到自己的入口状态. 这种段级更新满足结合律, 也可以写成前缀扫描. **通信量和序列长度无关**, 这是 1M 训练在 KDA 层上可行的原因; 24 层 MLA 仍走 softmax 注意力那一套 CP.

MoonEP 的上界可以代入一个假设的配置感受大小. 每层 $E=896$ 个专家, 如果 EP 规模 $R=64$(假设值, 报告没给实际 EP 规模), 那么每个 rank 最多预留 896/64 = 14 个冗余专家槽就一定能排出完全均衡的方案(估算). 均衡带来的好处是连锁的: 每个 rank 恰好收到 $S\times K$ 个 token, 所有层的计算 shape 都是静态的, 不用每层等 host 同步拿实际 token 数; 通信缓冲区只要固定的 $S\times K$, 而 DeepEP 要在最坏不均衡下做到零拷贝需要 $S\times K\times R$. 报告对比了 ECHO 和 UltraEP: 它们预设冗余数或设 token 上限, 找不到可行方案时训练会被迫停下.

## 4. 评测, 案例与边界

### 4.1. 表 2 与表 5: 怎么读公开分与第三方指数

评测默认 reasoning effort max, temperature 1.0; 单步 top-p 0.95, 智能体 top-p 1.0(§6.1.3). 编码侧协议还要记: DeepSWE 报 v1.1, 官方榜上 mini-SWE-agent harness 另有 67.3;Terminal-Bench 2.1 取跨 harness 最佳; SWE-Marathon 用 2026-07-09 前的 H20 标定分支, Fable 5 在 35% 任务 fallback;PostTrainBench 在 H20 上三次平均(官方用 H100);FrontierSWE dominance 用 2026-07-16 官方脚本重算. 智能体侧: OfficeQA Pro 整份 PDF 渲成图, 无机器可读文本; MCP-Atlas 500 题公开子集,100 轮上限, Gemini 3.1 Pro 裁判; AutomationBench 600 题公开子集; BrowseComp 默认 300K 触发压缩. 视觉侧多数三次平均, ZeroBench-main 五次; MMMU-Pro 保原输入序且图像前置; WorldVQA 经提示工程强制作答. 第三方分数的来源日期也要记下: Artificial Analysis 一批截至 2026-07-23, Toolathlon / JobBench 截至 2026-07-24.

对照模型的条件同样要带上. 所有对照模型都用最高推理档, 只有 GPT-5.5 用 xhigh; Fable 5 的结果含 fallback 行为, Sol 的结果可能受 cyberguards 影响; Agents' Last Exam 官方榜上 Fable 5 跑的是 xhigh, 40% 任务被标注为降级. 报告还给了一条采样建议: 推理和知识类任务用 top-p 0.95, 编码和 agent 场景用 top-p 1.0, 和评测设定一致. K2.6 博客统一用 top-p 1.0, K2.7 Code 统一用 0.95, K3 第一次按任务类型区分.

表 2 很长, 建议按轴取数. 推理与知识: GPQA Diamond 93.5;HLE-Full 无工具/有工具 43.5 / 56.0;CritPt 23.4(研究级仍是短板);AA-LCR 74.7. 编码: ProgramBench 77.8(最佳),SWE-Marathon 42.0(超 Fable 5 的 35.0),Terminal-Bench 2.1 88.3,DeepSWE 67.5,FrontierSWE 81.2,PostTrainBench 36.6,MLS-Bench-Lite 48.3,SciCode 58.7. 智能体: BrowseComp 91.2(全 1M 无上下文管理时另报 90.4),DeepSearchQA 95.0 F1,MCPMark-Verified 94.5,Harvey Lab-AA 94.6,ResearchRubrics 76.2,AutomationBench 30.8,SpreadsheetBench 2 34.8,τ³-Banking 33.4,Agents' Last Exam 28.3,APEX-Agents 41.0,OfficeQA Pro 63.3,OSWorld-Verified 84.8,OSWorld 2.0 58.3,SaaS-Bench 60.1,CorpFin v2 71.6,Finance Agent v2 54.4,Legal Research Bench 44.2;GDPval-AA v2 Elo 1686,AA-Briefcase 1548 仍落后 Fable 5; 另有 MCP-Atlas 84.2, Toolathlon-Verified 76.5, JobBench 54.3, 均略低于 Fable 5. 视觉: OmniDocBench 91.1;Math-Vision 94.3 / 97.8(无/有 Python);ZeroBench-main pass@5 23.0 / 41.0;WorldVQA ForceAnswer 51.0;Video-MME (w/ sub) 90.0;MMVU 82.1;BabyVision w/ Python 85.7;MMMU-Pro 81.6 / 83.4;CharXiv (RQ) 84.8 / 91.3;PerceptionBench 58.5.

差距集中在哪里, 按表 2 算一下更清楚. HLE-Full 上 K3 比 Fable 5 低 9.8(无工具 43.5 对 53.3)和 7.0(有工具 56.0 对 63.0)个点, CritPt 比 Sol 低 8.9 个点, 这两项是研究级推理, 差距最大. 编码侧 FrontierSWE 落后 Fable 5 5.4 个点, DeepSWE 落后 Sol 5.5 个点; 但 ProgramBench, SWE-Marathon 两项领先. agent 侧差距最大的是 OSWorld 2.0, 比 Fable 5 低 7.8 个点, OfficeQA Pro 低 6.6 个点; GDPval-AA v2 低 61 Elo. 相对开源对照 GLM-5.2, K3 几乎全面领先, DeepSWE 高 21.3 个点, SWE-Marathon 高 29.0 个点, AutomationBench 高 17.9 个点. 这些差值都是从表 2 直接相减得到的.

把差距和前面的训练面对上: **领先项集中在有明确 verifier 的长程编码和搜索**, 这正是第 3.3 节环境覆盖最密的地方; 落后项是研究级推理和计算机使用, 报告自己在 §6.1.4 也把研究级推理列为主要改进方向. HLE 带工具比无工具高 12.5 个点, 和 K2 Thinking, K2.5 一样, K3 的优势仍然更多体现在会用工具这一面.

表 5(截至 2026-07-23):Artificial Analysis Intelligence Index v4.1 为 57.1(#4/580);Vals Index 74.7%(#2/39);WebDev Arena Elo 1,678(#1/99, 报告称首个登顶的开源模型);Text Arena 1,486(#8/200);Agent Arena 9.1(#4/37). 图 13 把分数对每任务成本摊开: BrowseComp 上 K3 91.2% 约 \$2.03/任务; Code Bench 2.0 比 Fable 5 低 4.0 分但成本约 38%;GDPval-AA v2 相对 Sol 成本低 13%, 相对 Fable 5 便宜 2.6×. 读表 5 时记住 Elo 会随对局累积漂移, 括号里的名次是截稿日快照, 不是永久排名.

### 4.2. 内部榜与协议: 公开表 2 读不到的那一层

表 3 把内部能力拆成编码体验, 通用智能体体验, 会话体验三块. Kimi Code Bench 2.0 在 Claude Code harness 上 K3 为 73.7,Fable 5 为 76.9(脚注写 13 次 fallback 与 1 次拒答, 共 80 题);Coding Experience 同 harness 上 K3 59.9 略高于 Fable 5 的 59.8. 通用智能体侧:24/7 ClawBench 2.0 用 OpenClaw, K3 48.3,Sol 52.0 领先; MIRA Bench 上 Fable 5 72.9 明显高于 K3 的 64.1;KAET 83.5 接近 Sol 的 85.4;CLIF 52.4 与 GPT-5.5 的 52.3 几乎持平; Agentic Vision 78.3 落后 Sol 82.9 与 Opus 4.8 的 82.8;Swarm Bench 76.3,Deep Research Bench 90.0 是内部叙事里最亮的两格. 会话侧 Faithfulness 85.5(指标为 1−幻觉率),Chat All-in-One 85.2 落后 Fable 5 的 88.0.

协议细节决定这些分能不能横比. 除非基准按 harness 分行, 表 3 的 Harness 列是 K3 所用; Claude 系与 GLM-5.2 默认 Claude Code, GPT 系默认 Codex. 例外是全员同一 harness:OpenClaw, MIRA, Kimi Work, 以及 CLIF / Agentic Vision 的 Kimi Code. 表 4 的 Webdev 盲测只比 K3 与 Opus 4.8,dims 是代码质量, 功能完整, 视觉保真, 交互体验; Overall Win 58.6%,Tie 13.8%,Lose 27.6%,Win−Lose = +31.0%. **读内部榜时把「编排与研究型智能」和「企业多系统协作 / 常开助理」分开**: 前者是 K3 相对清晰的强项, 后者仍是追赶面.

### 4.3. 成本, 安全与第三方: 分数旁边还要看什么

§6.4 与图 13 把「近顶尖分」和「每任务成本」画在同一平面. KCB 2.0 上落后 Fable 5 4.0 分, 成本约 38%; 高力度已对齐 Opus 4.8 最大力度分, 成本约三分之一. BrowseComp 91.2% 约 \$2.03/任务, 约为 Sol 的一半, 比最大力度 Claude 便宜一个数量级. GDPval-AA v2 与 Sol 相差约 50 Elo, 成本低 13%, 相对 Fable 5 便宜 2.6×;AA-Briefcase 第二, 成本约 Fable 5 一半. 成本测法也不一样: KCB 内部测(K3 走 Kimi Code, 其余走 Claude Code);BrowseComp 的 Claude/GPT 成本引自公开图表; GDP / Briefcase 用 Artificial Analysis 按 token API 价(截至 2026-07-23).

§6.2.2 网络安全两档要连「排除 Anthropic/OpenAI」一起读: 它们拒做相关任务, 套件只和 GLM-5.2 等比. Tier 1 偏防御发现; Tier 2 的 36 题(用户态 16 + 内核 20)估计约 540 专家小时. K3 解 14/36(38.9%)对 GLM-5.2 的 8/36(22.2%), 成功里 10 题来自用户态; 内核轨上四分之三仍未解. 轨迹失效四条, 链尾完不成, 缓解下策略选错, 调试环空转, 提交前验证不足, 比「不会找洞」更接近真实瓶颈. UK AISI / NIST CAISI 联合评估: ExploitBench 32% vs 24%,32 步企业网模拟 17 vs 11 步,41 题任意代码执行 0. 报告自称下界, 随大版本重访.

### 4.4. 案例, 模板与边界: 数字能对上什么

§7 案例把「能干活」写具体: AttnRes 延迟 283.6 ms→114.4 ms, DSA / KDA 运行时间砍 55.1% / 73.6%;MiniTriton 编译器(图 15)几何均值超 torch eager / torch.compile, tensor-core matmul 约达实测屋顶 90%;48 小时内用开源 EDA 做出 nano 推理芯片原型(4 mm²,100 MHz, RTL 模拟 >8,700 tok/s,1.46M 标准单元,0.277 MiB SRAM). 研究编码案例约两小时复现 I–Love–Q; 知识工作案例覆盖 42 年 AI ASIC,120 余轮迭代,2,800 余次搜索与 1,100 余次终端查询; 引力波案例用 20 余并发子智能体分析 GWTC-5 里 391 个事件; 视频案例从 56 段素材剪预告片. 这些是能力演示, 不能替代表 2 的对照数字, 但和内核 RL, 原生多模态, Swarm 叙事同向.

附录 F 的 **XTML** 用 `[open]`/`[sep]`/`[close]` 特殊 token, assistant 分 think / response / tools 通道; 全局选项在历史前, 一次性选项在历史后, 动态工具用中途 tool-declare, 以保住前缀 KV. thinking-effort 用自然语言选项消息而不是改生成前缀, 直接对齐 §4.1 的力度条件化训练; schema 预留 low / medium / high / max, K3 支持其中子集. 图 16 把布局, 通道与工具索引画清楚. 工具参数类型化让代码等自由文本成为一等公民, 纯 JSON 回退块只出现在输入侧且训练损失被掩码.

能指回源文核对的主配置包括: 表 1 骨架; 式 (1)–(16) 与附录 (18)–(28); 图 1–16; 表 2–5. 边界同样清楚: 整体仍落后 Fable 5 / GPT-5.6 Sol;CritPt, 部分知识工作 Elo, 硬化内核利用仍是短板; Fable 5 fallback 与 Sol cyberguards 改变对照含义; SWE-Marathon 用 H20 标定分支, Fable 5 在 35% 任务 fallback;BrowseComp 默认 300K 触发压缩, 全 1M 无管理另报 90.4%; 开源的是完整权重, 不等于复现全部数据与集群配方. 顺着报告自己的因果链, 下面三条线要对着图和节号看: Hybrid KDA-MLA + AttnRes + Stable LatentMoE 如何交出约 2.5× Scaling 效率(图 7, 表 1); 九专家 × MOPD 如何把多力度能力收进一个部署模型(§4.1, 图 8);MoonEP / KCP / AgentENV / 细粒度前缀缓存如何让 2.8T 与 1M 同时可训可服(§5). 把这三条拆开读, 比把「更大, 更强, 更长」揉成一句口号清楚得多: 效率增益要回到图 7 的 Scaling Laws 曲线, 统一部署要回到图 8 的 RL FLOPs 与 MOPD, 系统可行性要回到 §5 的通信与缓存设计. 读公开榜时再加一条习惯: 同一套数字旁边是否写了 fallback, cyberguards, 成本测法与上下文压缩策略; 缺这些条件, 跨模型名次很容易被误读. 附录与正文对照时, 公式编号以源文页内编号为准, 不要只靠记忆复述. 细节数字以 `kimi-k3.md` 表图为准; 英文原句与中文意译对照见 `kimi-k3-bi.md`.
