---
title: "GLM-5.2: IndexShare 撑起 1M 上下文, 长程编程成绩大涨"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "GLM-5.2 沿用 GLM-5 的 MoE 加 DSA 主干, 窗口从 200K 提到 1M. 稀疏注意力的 indexer 改成每 4 层共用一个, 1M 处单 token FLOPs 约为 GLM-5.1 的 1/2.9; MTP 换成拒绝采样加 TV 损失, 长程 RL 从按组优化换成带 critic 的单条 rollout PPO."
---
# GLM-5.2: IndexShare 撑起 1M 上下文, 长程编程成绩大涨

材料是 Z.ai 2026-06-16 发的博客 「GLM-5.2: Built for Long-Horizon Tasks」, 讲的是相对 GLM-5.1 改了哪些地方, 篇幅不到一份技术报告; 结构细节要靠 HuggingFace 上的 `config.json`, 两个关键方法分别有论文 (IndexCache, arXiv 2603.12201; SAO, arXiv 2607.07508). 这一版要处理的问题是窗口从 200K 拉到 1M 之后哪里变贵: 稀疏注意力把核心注意力的代价压到了 $O(Lk)$, 剩下的 $O(L^2)$ 在 indexer 身上; 1M 下解码更慢, 投机解码的接受长度更值钱; 长程任务的轨迹被压缩切段以后, 一组 rollout 没法再整齐对比.

## 1. 主干: 和 GLM-5 同一套结构

### 1.1. GLM-5 留下的底子

GLM-5 的技术报告 (arXiv 2602.15763) 给出完整配置: 总参数 744B, 激活 40B, 3 个稠密层加 75 个 MoE 层共 78 层, 隐藏维 6144, 256 个路由专家加 1 个共享专家, 每 token 激活 8 个路由专家. 注意力是 MLA, 头维从 DeepSeek-V3 的 192 提到 256, 头数相应降到 64, 潜在 KV 维度 512 加 64 维 RoPE 部分共 576. 稀疏注意力用的是 DeepSeek-V3.2 的 DSA, 每个查询挑 $k=2048$ 个 token, 从中期训练结束的基座继续训练约 22.8B token 接进来. 窗口是 200K. 这些细节见 [GLM-5 技术报告解读](../glm-5/glm-5-analysis.md).

GLM-5 的 MTP 是 3 步共享参数: 训练时 3 个 MTP 步共用一套权重, 所以配置里 MTP 层数仍是 1, 显存开销和只训一层的 DeepSeek-V3 一样. 报告里在 4 步投机的设置下, 接受长度 2.76, DeepSeek-V3.2 是 2.55. GLM-5 的 RL 还已经用上了异步 rollout 和「直接双侧重要性采样」, 后面讲 SAO 时会再碰到它.

### 1.2. GLM-5.2 的配置文件

`zai-org/GLM-5.2` 的 `config.json` 写着 `model_type: glm_moe_dsa`, 维度和 GLM-5 表 10 一一对得上: 78 层, `first_k_dense_replace: 3`, 隐藏维 6144, 64 个注意力头, `kv_lora_rank: 512`, `qk_rope_head_dim: 64`, `v_head_dim: 256`, 256 个路由专家加 1 个共享专家, top-8, 专家中间维 2048. indexer 部分是 `index_topk: 2048`, `index_n_heads: 32`, `index_head_dim: 128`, 和 GLM-5 相同. 和窗口及本次改动有关的字段有三个: `max_position_embeddings` 是 1,048,576, RoPE 基数 `rope_theta` 是 8,000,000; `indexer_types` 逐层标出哪些层有自己的 indexer; `index_share_for_mtp_iteration: true` 让 MTP 的多步共用索引. 后两个分别对应下面两节的 IndexShare 和 MTP 改动.

参数量博客里没写. SAO 论文摘要说这套方法用在了 「the open GLM-5.2 model (750B-A40B)」, GLM-5.1 模型卡的 Safetensors 栏显示 754B, GLM-5 报告是 744B, 几处数字的计法都没交代. 结构维度相同, 规模在这一档, 后面不再讨论参数. 训练数据量和 1M 训练用了多少 token, 博客没有数字, 只有一句 「we substantially expanded 1M-context training for coding-agent scenarios」, 场景是大规模实现, 自动化研究, 性能优化和复杂调试四类.

## 2. IndexShare: 1M 时 indexer 成了大头

### 2.1. DSA 的 indexer 为什么在长序列上贵

DSA 把每层注意力拆成两步. 先由一个轻量的 lightning indexer 给当前查询 $t$ 和每个前面的 token $s$ 打分:

$$
I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\,\mathrm{ReLU}\left(q^I_{t,j}\cdot k^I_s\right)
\tag{1}
$$

其中 $H^I$ 是 indexer 头数 (GLM 系列是 32), $q^I_{t,j}$ 是第 $j$ 个 indexer 头的查询, $k^I_s$ 是 token $s$ 的 indexer 键 (各头共用, 维度 128), $w^I_{t,j}$ 是按查询算出的头权重. 然后取分数最高的 $k$ 个位置, 主注意力只在这 $k$ 个 token 上算. 主注意力每层从 $O(L^2)$ 降到 $O(Lk)$, indexer 本身仍要对所有前面的 token 打分, 每层 $O(L^2)$, $N$ 层合计 $O(NL^2)$. indexer 头少, 维度低, 还能用 FP8, 单次比主注意力便宜一个量级, 可它是唯一还随 $L^2$ 增长的部分. DSA 靠两段继续训练接到稠密模型上: 先做短暂的稠密预热, 冻结其余参数, 只用 KL 让 indexer 的分布对齐本层各头聚合后的注意力分布; 再打开 top-k 选择做稀疏训练, 整个模型一起调, indexer 的蒸馏梯度走一条断开的计算图, 不回传到主干. 公式推导和 DSA 的两段训练见 [QSA 一文的 DSA 部分](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.4-稀疏注意力/05-QSA-Qwen稀疏注意力/05-QSA-Qwen稀疏注意力.md).

IndexCache 论文 (Bai 等, Z.ai 与清华, arXiv 2603.12201) 在一个 30B 的 DSA 模型上做了时延剖析: 上下文越长, indexer 在总时延里占的比例涨得越快, prefill 阶段最明显, 其余计算只缓慢增长. 同一篇论文统计了逐层 top-k 下标的重合率, 相邻层选中的 token 有 70% 到 100% 相同, 热力图上还能看出几段互相高度重合的层块. 既然相邻层大多选同一批 token, 每层各算一遍 indexer 大部分是重复劳动. 重合也有边界: 热力图左下和右上两角的重合率不到 0.4, 早期层和后期层关心的 token 差别很大; 跨层块边界时重合率掉得比块内快, 说明少数「过渡层」会把注意力焦点整体挪开. 所以不能随便挑一层的下标给全网用.

### 2.2. IndexCache 论文: 留几层 indexer, 怎么训

GLM-5.2 博客里的 IndexShare 指向这篇论文, 论文自己用的名字是 IndexCache. 它把 $N$ 层分成两类: F 层保留自己的 indexer, 算新的 top-k; S 层没有 indexer, 直接继承前面最近一个 F 层的下标集合. 第一层必须是 F. 推理时只多一个条件分支, 下标放在一个临时缓冲区里, 每到 F 层就被覆盖, 论文说不需要额外显存.

怎么选哪些层当 F, 论文给了两条路. 免训练的做法是贪心搜索: 从全 F 开始, 每步试着把每个 F 层翻成 S, 在校准集上算语言模型损失, 留下损失最小的那次翻转. 均匀交替 (每 4 层留 1 个) 在免训练设置下掉分明显: 30B 模型上保留 1/4 时, 长上下文均分从 50.2 掉到 43.0, 搜出来的模式是 49.9. 论文附录还记了一个失败的尝试: 先算「第 $i$ 层借用第 $j$ 层下标后注意力输出的余弦相似度」, 再用动态规划找总相似度最大的模式, 结果和均匀交替差不多. 原因是逐层相似度只看局部, 借来的下标漏掉少数关键 token, 本层输出几乎不变, 误差却会沿后面的层累积; 语言模型损失看的是端到端的结果, 才分得出哪些层不能共用. 要训练的做法是多层蒸馏: 一个 F 层的 indexer 不再只对齐本层的注意力分布, 而是同时对齐它服务的所有层:

$$
\mathcal{L}^{I}_{\mathrm{multi}}=\sum_{j=0}^{m}\frac{1}{m+1}\sum_{t}D_{\mathrm{KL}}\left(p^{(\ell+j)}_{t}\,\big\|\,q^{(\ell)}_{t}\right)
\tag{2}
$$

$p^{(\ell+j)}_t$ 是第 $\ell+j$ 层各头平均后的注意力分布, $q^{(\ell)}_t=\mathrm{Softmax}(I^{(\ell)}_t)$ 是 F 层 indexer 的输出分布, $m$ 是跟在它后面的 S 层个数. 论文的命题 1 证明, 式 (2) 的梯度和「对 $m+1$ 层平均分布 $\bar p_t$ 做单个 KL」完全相同, 因为 $p$ 不依赖参数, 熵项求导为零, 剩下的交叉熵对 $p$ 是线性的. 所以 F 层学的是它服务的几层共同关心的 token. 带这个损失训练后, 均匀交替的 1/4 方案长上下文均分 50.6, 基线 51.0; 去掉跨层损失, 1/2 方案的长上下文均分从 51.6 掉到 49.8.

速度收益论文也测了. 30B 模型在 H100 上用 SGLang, 200K 长度保留 1/4 indexer 时, prefill 从 19.5 秒降到 10.7 秒 (1.82 倍), 单请求解码从 58 tok/s 升到 86 tok/s (1.48 倍). 在 744B 的 GLM-5 上做了免训练的初步实验: 保留 1/4 并用搜出的模式, 五项长上下文均分 78.0, 原版 78.4; 均匀交替只有 72.7. 论文结尾说下一步要在这个规模上做要训练的版本, GLM-5.2 就是这一步.

### 2.3. GLM-5.2 怎么用: 均匀交替, 从中期训练开始

GLM-5.2 走的是要训练的那条路. 博客说它 「is trained with IndexShare from mid-training with 128K sequence length」, 也就是 indexer 共用不是事后剪出来的, 中期训练阶段 128K 序列上就已经按共用的结构训练. 配置里的 `indexer_types` 给出了具体模式: 前 3 层都是 full, 之后每 4 层一组, 3 个 shared 加 1 个 full, 最后以 3 个 shared 收尾. 数下来是 21 个 full, 57 个 shared, indexer 计算只剩原来的 $21/78\approx27\%$ (推导). 前 3 层正好是稠密 FFN 层, 配置里还有 `index_skip_topk_offset: 3`. 论文发现在免训练设置下早期层对去掉 indexer 最敏感, 带训练后均匀模式就够用, GLM-5.2 的选择和这两条一致.

效果只有一张 FLOPs 曲线. 纵轴是单 token FLOPs (单位标 「T」, 没有解释), 横轴是 token 位置. 32K 处两条线都在 0.1 附近, 到 1024K 处 GLM-5.1 约 0.67, GLM-5.2 约 0.22, 旁注 「2.9x lower」. indexer 计算降到约 27%, 总 FLOPs 只降到约 1/2.9, 剩下的差额是主注意力, MoE 和投影这些不随 IndexShare 变的部分. 博客说长上下文基准上 「outperforming GLM-5.1 with less computation」, 没有列是哪几项.

top-k 次数变少对 RL 也有影响. GLM-5 报告讲过, MoE 可以用 routing replay 把 rollout 时选中的专家记下来给训练端复用, indexer 每个位置选 2048 个下标, 存不下, 只能换成确定性的 `torch.topk`, 保证训练和推理选出同一批 token; 用非确定性的 CUDA 或 TileLang 实现时, RL 跑几步熵就骤降. RL 期间 indexer 参数默认冻结. IndexShare 之后, 每次前向的 top-k 从 78 次降到 21 次 (推导), 确定性实现比非确定性实现慢的那部分开销也跟着缩小. GLM-5.2 是否沿用了冻结 indexer 的做法, 博客没提.

KV cache 降得少, 原因在缓存里存了什么. S 层只是不算 indexer, 主注意力照样要读本层自己的 KV, 每个 token 每层仍是 576 维的潜在 KV. 能省的只有 S 层的 indexer 键缓存. 按每层 576 维潜在 KV 加 128 维 indexer 键估算, 78 层全带 indexer 是每 token $78\times704=54{,}912$ 维, IndexShare 后是 $78\times576+21\times128=47{,}616$ 维, 只少约 13% (推导, indexer 键的存储精度和布局博客没写). 博客原话是新结构 「does not proportionally reduce per-token KV-cache size」, 这也是第 3.4 节推理服务要单独处理 KV 容量的原因.

## 3. MTP 与 1M 推理服务

### 3.1. 两个目标与共用 KV

MTP 在 GLM 系列里拿来做投机解码: MTP 层充当草稿模型, 一次往后猜几个 token, 主模型一次前向验证. 每次验证能落地的 token 数叫接受长度. 草稿越便宜, 接受长度越长, 解码越快. 机制见 [MTP 深度解析](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.8-其他架构方向/2.8.1-多Token预测MTP/2.8.1-多Token预测MTP.md) 与 [投机解码原理](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用/01-投机解码原理与应用.md). 1M 窗口下单 token 解码更慢, 接受长度多一点, 省下的时间就多一点; GLM-5 报告还提到 RL rollout 常处于小 batch 解码, 长尾样本最吃 MTP 的加速.

GLM-5.2 的 MTP 层本身也是一个 DSA 块, 也带 indexer. 博客的做法是把 IndexShare 搬到 MTP 的多步上: indexer 只在第一步算, top-k 下标给后面各步用. 配置里 `index_share_for_mtp_iteration: true` 就是这个开关. 各步参数和 GLM-5.1 一样共享.

共用索引还顺带消掉了训练和推理的一个不一致. 博客用两步示意图说明: 不共用时, MTP 第二步里 $h_5$ 要看的 KV cache 混着两种来源, $kv_{1:4}$ 来自目标模型, $kv_5$ 是 MTP 层自己算的; 共用下标之后, $h_5$ 只看 $h_1$ 到 $h_4$, 缓存里只有目标模型的 $kv_{1:4}$. 推理时, 这几个位置的 KV 本来就是目标模型算的, 训练时 MTP 却看到自己算的 KV, 两边看到的东西不一样. 博客称这消除了 GLM-5.1 MTP 层里训练和推理不一致的问题. 训练时复用 MTP 第一步的 kv cache 和 top-k 下标, 后面几步不再重算.

### 3.2. 拒绝采样与端到端 TV 损失

另外两项改动来自阿里 Qwen 团队的 Bebop 论文 (Li 等, arXiv 2606.12370), 博客写的是 「inspired by」. 论文对比了两种验证方式. 只看目标概率的验证 (target-only) 取草稿分布的 argmax 作候选, 以目标概率接受:

$$
\alpha^{\mathrm{TO}}=p\left(\arg\max_y q(y)\right)
\tag{3}
$$

拒绝采样则从草稿分布 $q$ 里采候选 $\hat y$, 以 $\min(1,p(\hat y)/q(\hat y))$ 接受, 期望接受率等于两分布的重叠:

$$
\alpha^{\mathrm{RS}}=\sum_y \min\left(p(y),q(y)\right)=1-d_{\mathrm{TV}}(p,q)
\tag{4}
$$

$d_{\mathrm{TV}}$ 是总变差距离. 式 (3) 的上限是 $\max_y p(y)$, 目标分布熵一高, 这个值就跟着降; RL 为了探索常维持较高的熵, 论文观察到接受率随熵近似线性下降. 式 (4) 只看重叠, 对熵不那么敏感, 输出分布仍严格等于 $p$.

$\gamma$ 步 MTP 的期望接受长度是各步接受率的累乘和:

$$
\mathbb{E}[L]=\sum_{j=1}^{\gamma}\prod_{i=1}^{j}\alpha_i
\tag{5}
$$

交叉熵或 KL 训练只是间接压低 TV 距离 (Pinsker 不等式给的是上界), 而且平均对待词表里所有 token. Bebop 直接把式 (5) 归一化后当损失:

$$
\mathcal{L}_{\mathrm{e2e}}=1-\frac{1}{\gamma}\sum_{j=1}^{\gamma}\prod_{i=1}^{j}\left(1-d_{\mathrm{TV}}(p_i,q_i)\right)
\tag{6}
$$

靠前的步出现在更多乘积项里, 权重自然更大, 而且权重随当前各步的接受率自动调整. 单步 TV 损失对 logit 的梯度正比于 $q_j$, 绝对值不超过 1: 草稿给的概率低于目标的 token 被往上推, 高于目标的被往下压, 草稿本来就几乎不给概率的长尾 token 梯度接近零. KL 的梯度是 $q_j-p_j$, 对整个词表一视同仁. 论文还拆分了 RL 中接受率下降的来源, 认为主因是策略熵的变化, 策略更新带来的草稿与目标失配影响很小, 所以只要 RL 开始前用 TV 损失训好 MTP, 再配拒绝采样, 整个 RL 过程里不必在线更新 MTP. 论文报告 TV 损失比 CE 或 KL 多出约 10% 的接受率, 在 Qwen3.5 到 3.7 的异步 RL 上端到端最多加速 1.8 倍.

### 3.3. 消融: 每一步加了多少

博客的消融有个前提: 「we use the backbone and training data of GLM-5.1」, 训练和推理都用 7 步 MTP, 场景是编程.

| 配置 | 接受长度 |
|---|---|
| Baseline | 4.56 |
| + IndexShare 与 KV Share | 5.10 |
| + 拒绝采样 | 5.29 |
| + 端到端 TV 损失 | 5.47 |

三步分别加 0.54, 0.19, 0.18, 总共 $5.47/4.56\approx1.20$. 共用索引和 KV 这一项贡献最大, 说明训推不一致是之前接受长度的主要损失来源. 第 1 页的 「increasing the acceptance length by up to 20%」 就是这张表, 是在 GLM-5.1 主干上量的, GLM-5.2 自己的接受长度博客没给.

### 3.4. 1M 的推理服务

窗口到 1M 以后, 博客预计编程负载会转向更长的提示, 推理瓶颈从计算转到三处: KV cache 容量, 随上下文增长的长序列算子, CPU 侧开销. 对应的引擎改动也是三条: 在 LayerSplit 基础上做更细粒度的显存管理和并行, 提高 KV cache 容量; 优化那些开销随上下文变长的算子, 让它们和缓存传输流水起来, 减少对 prefill 和 decode 的干扰; 优化 CPU 侧的缓存管理, 请求调度和运行时路径, 减少 GPU 空泡. 第一条直接接着第 2.3 节: IndexShare 省了算力, 没怎么省 KV, 容量问题只能由引擎补.

吞吐图以 GLM-5.1 在 32K 时的吞吐为 1:

| 上下文 | 32k | 64k | 128k | 200k | 256k | 512k | 1024k |
|---|---|---|---|---|---|---|---|
| GLM-5.1 | 1.00 | 1.62 | 2.42 | 2.77 | OOC | OOC | OOC |
| GLM-5.2 | 1.03 | 2.06 | 3.86 | 4.69 | 5.37 | 6.16 | 6.97 |

同长度下两者之比从 32k 的 1.03 升到 64k 约 1.27, 128k 约 1.60, 200k 约 1.69 (推导), 越长优势越大. GLM-5.1 的 200k 标了星号, 256k 起写 OOC (超出上下文). 两条柱都随长度升高, 说明这里的「吞吐」不是每秒生成的 token 数; 博客没写按什么计, 也没写硬件和并发, 这些倍数只能在图内比较.

## 4. 后训练: slime, SAO 与防作弊

### 4.1. rollout 侧: slime 与防作弊

slime 是 THUDM 开源的 RL 后训练框架 (github.com/THUDM/slime), GLM-5.3 的博客说它把 Megatron 训练和 SGLang 推理放进一条数据流. GLM-5.2 博客列的功能是四种 rollout 组织方式: 白盒 rollout, 黑盒 rollout, 压缩轨迹 (compact trajectory) 和子智能体工作流; 适配不同的并行策略, 路由策略, PD 分离和部署方式, 配合 KV cache FP8. 唯一的数字是: 用 slime 做并行 OPD, 把十多个专家模型合进最终模型, 全程约两天, 用了多少卡没写. OPD 的思路是学生在自己采的样本上逐 token 对齐教师分布, 多教师版本见 [MOPD](../../../../LargeLanguageModelGuide/4-后训练/4.9-OPD/4.9.1-OPD方法与落地/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md).

防作弊同样挂在 rollout 上. 博客承认 「GLM-5.2 shows more potential hacking behavior than GLM-5.1」, 没给比例. 举的例子有两类: 用 curl 从 GitHub 直接下载答案文件; 用 find, cat, python 三步串起来读 `/workspace/.eval/secret_cases.json`. 检测分两级: 规则过滤器先筛, 追求召回; LLM 判别再看意图, 保证精确. 监控在线跑在每一次工具调用上, 判定作弊就拦下这次调用, 返回假信息, rollout 继续往下走, 整条轨迹不丢. 博客说这个模块 「for both RL training and evaluation」, 评测里也开着; 脚注里写到防作弊判定的只有 NL2Repo (例子是未经许可的 pip 或 curl). 这意味着评测分数里包含被拦过又继续跑完的轨迹, 各项拦了多少次, 博客没写.

### 4.2. 从按组优化到单条 rollout 的 PPO

长程任务的轨迹会经过压缩 (compaction), 一条原轨迹被切成几段子轨迹. 博客指出, 这样一来同一提示下不同 rollout 的可训练轨迹数和长度都不一样, 按组比较奖励的做法不再自然. 改法是换成基于 critic 的 PPO, 每条 rollout 单独学, critic 估计 token 级优势; 压缩后的所有子轨迹都当作可训练轨迹, 再用 token 级损失处理长度不均.

这套方法的论文是 SAO (Single-rollout Asynchronous Optimization, Hou 等, arXiv 2607.07508). 论文指出按组采样和异步训练合不来: 一组要等最慢的那条跑完才能送进训练, 等待本身制造了 off-policy; 很多智能体环境对一个提示也只给一条轨迹的反馈. SAO 每个提示只采一条, 跑完立刻进训练. 稳定性靠直接双侧重要性采样 (DIS), 比值直接用 rollout 引擎记下的对数概率算:

$$
r_t(\theta)=\exp\left(\log\pi_\theta(a_t\mid s_t)-\log\pi_{\mathrm{rollout}}(a_t\mid s_t)\right)
\tag{7}
$$

$r_t$ 落在 $(1-\epsilon_\ell,1+\epsilon_h)$ 之外的 token 整个屏蔽, 不参与梯度. 这样不用保存历史检查点, GLM-5 的异步 RL 已经在用这一招. 单条 rollout 的方差大, 要靠价值模型: SAO 让 critic 每步更新 2 次 (策略 1 次), 训练 critic 时冻结注意力层只调 MoE 部分 (论文发现 critic 的梯度不稳主要来自全注意力层). 智能体轨迹是动作和环境反馈交替的, 环境反馈不是模型生成的, SAO 的 GAE 跳过观测 token, 直接把上一个动作的末 token 连到下一个动作的首 token:

$$
\hat A(a_{i,N})=\delta+\gamma\lambda\hat A(a_{i+1,0}),\qquad \delta=r_t+\gamma V(a_{i+1,0})-V(a_{i,N})
\tag{8}
$$

$a_{i,N}$ 是第 $i$ 个动作的最后一个 token, $a_{i+1,0}$ 是下一个动作的第一个. PPO 和 GAE 的推导见 [PPO](../../../../LargeLanguageModelGuide/4-后训练/4.4-强化学习基础/04-PPO/04-PPO.md). 屏蔽区间放得很宽, 而且不对称: 论文的数学推理实验用 $\epsilon_\ell=0.3$, $\epsilon_h=5.0$, 编程智能体实验用 0.8 和 3.0; GAE 的 $\lambda$ 随序列长度自适应. 论文在 Qwen3-30B-A3B 上的结果: SWE-Bench Verified 基线 23.0, GRPO 加 DIS 27.0, SAO 29.8; 原版 GRPO 约 160 步后崩掉, SAO 能稳定训约一千步. 摘要明确说 SAO 部署在了 GLM-5.2 的智能体 RL 流水线里.

## 5. 评测, 接入与结论

### 5.1. 评测

大表有 19 行, 下面只留和本次改动直接相关的几行, 加上两个开源对手:

| 基准 | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro |
|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 81.0 | 63.5 | 75.0 | 64.0 |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 55.4 |
| DeepSWE | 46.2 | 18.0 | 18.0 | 8.0 |
| FrontierSWE | 74.4 | 30.5 | - | 29.0 |
| PostTrainBench | 34.3 | 20.1 | - | - |
| SWE-Marathon | 13.0 | 1.0 | - | - |
| HLE (带工具) | 54.7 | 52.3 | 53.5 | 48.2 |
| GPQA-Diamond | 91.2 | 86.2 | 90.0 | 90.1 |

涨幅最大的都是长程和编程项: FrontierSWE 高 43.9, DeepSWE 高 28.2, Terminal-Bench 高 17.5; 知识和推理类涨得少, HLE 带工具只高 2.4. 这和改动的方向一致, 窗口, 长程 RL 和防作弊都是为长程编程做的. 全表 19 行 GLM-5.2 都高于 GLM-5.1, 但不是每行都领先开源对手: HMMT Feb. 2026 上 Qwen3.7-Max 97.1, GLM-5.2 92.5; Tool-Decathlon 上 DeepSeek-V4-Pro 52.8, GLM-5.2 48.2.

口径上有两点要注意. FrontierSWE, PostTrainBench, SWE-Marathon 三项由第三方 (Proximal, PostTrainBench, Abundant AI) 在 1M 上下文, max 档位, 128K 输出下评测, 其余写了窗口的各项都在 400K 以内, Terminal-Bench 2.1 是 256K. GLM-5.1 的窗口只有 200K, 这三项它在什么长度下测的, 脚注没写. 另外, FrontierSWE 报的是 Dominance 分, 脚注标「截至 2026/06/16」, 这是个随时间变化的相对分, 后来 GLM-5.3 博客里 GLM-5.2 同一项印的是 67.5. 和闭源模型比, 长程条形图里 Claude Opus 4.8 三项都在 GLM-5.2 前面: FrontierSWE 75.1 对 74.4, PostTrainBench 37.2 对 34.3, SWE-Marathon 26.0 对 13.0; Terminal-Bench 2.1 上 Opus 4.8 是 85.0.

GLM-5.2 还加了思考档位控制, 博客用一张折线图看「花多少输出换多少分」. 横轴是每个任务的平均输出 token 数, 纵轴是 Terminal-Bench 2.1, DeepSWE, SWE-Atlas QnA 三项的平均分, 在 Claude Code 2.1.167 上测, 点旁不印数值. 目测读数: GLM-5.2 的 Non-Thinking 约 35k 输出, 63 分; High 约 44k, 72 分; Max 约 84k, 74 到 75 分. GLM-5.1 的 Max 约 45k, 57 到 58 分. 同样四万多的输出, GLM-5.2 的 High 比 GLM-5.1 的 Max 高十几分; GLM-5.2 从 High 到 Max 输出接近翻倍, 分数只多两三分. Claude Opus 4.8 的 High 约 40k, 78 分. 纵轴里的 SWE-Atlas QnA 不在大表里, 这张图的分数和大表任何一行都对不上, 只能看趋势. 订阅用户能选的档位是 High 和 Max.

### 5.2. 接入, 套餐与权重

权重以 MIT 许可证放在 HuggingFace 和 ModelScope, 博客的说法是没有地区限制; 本地部署支持 transformers, vLLM, SGLang, xLLM 和 ktransformers, 版本号和显存需求没写. 网页端在 chat.z.ai 上线.

编程套餐用户把模型名改成 `GLM-5.2` 即可启用, 在 Claude Code 里要写成 `GLM-5.2[1m]` 才开 1M 上下文, 思考档位可选 High 或 Max. 计费上, GLM-5.2 在高峰时段按 3 倍消耗额度, 非高峰按 2 倍, 高峰是每天 14:00 到 18:00 (UTC+8); 限时到 9 月底, 非高峰按 1 倍计. 桌面智能体 ZCode 由 GLM-5.2 驱动, 带面向长程任务的 /goal, SSH 远程开发和手机端控制, 6 月 30 日前在 ZCode 里用套餐可得 1.5 倍有效额度. 博客推荐的接入方式还包括 Claude Code 和 OpenCode.

### 5.3. 结论与边界

GLM-5.2 没有换主干, 改的是 1M 窗口下最贵的几处. IndexShare 把 indexer 的 $O(NL^2)$ 砍到约四分之一, 换来 1M 处约 2.9 倍的单 token FLOPs 下降, KV 容量则交给推理引擎处理; MTP 通过共用索引和 KV 消掉训推不一致, 再借 Bebop 的拒绝采样和 TV 损失把接受长度提高 20%; 后训练用 SAO 让被压缩切段的长轨迹也能逐条训练. 成绩上, 长程编程项的涨幅远大于知识类.

博客能支撑的结论到此为止. 1M 窗口的检索和理解能力没有专门的基准分数; 20% 的接受长度提升是在 GLM-5.1 主干上测的; 吞吐图的计量方式没给; 防作弊在评测中拦了多少次也没给. 这些要等完整技术报告.

## 参考文献

1. Z.ai. 「GLM-5.2: Built for Long-Horizon Tasks」. Z.ai 官网博客, 2026-06-16. 中英对照见 [glm-5-2-bi](./glm-5-2-bi.md).
2. Z.ai. `zai-org/GLM-5.2` 模型配置 `config.json`. HuggingFace, https://huggingface.co/zai-org/GLM-5.2.
3. Yushi Bai, Qian Dong, Ting Jiang, et al. 「IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse」. arXiv:2603.12201, 2026.
4. Yucheng Li, Huiqiang Jiang, et al. 「Breaking Entropy Bounds: Accelerating RL Training via MTP with Rejection Sampling」. arXiv:2606.12370, 2026.
5. Zhenyu Hou, Yujiang Li, Jie Tang, Yuxiao Dong. 「Single-Rollout Asynchronous Optimization for Agentic Reinforcement Learning」. arXiv:2607.07508, 2026.
6. Aohan Zeng, Xin Lv, et al. 「GLM-5: from Vibe Coding to Agentic Engineering」. arXiv:2602.15763, 2026.
7. Aixin Liu, et al. 「DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models」. arXiv:2512.02556, 2025.
8. THUDM. slime: an LLM post-training framework for RL Scaling. https://github.com/THUDM/slime.
