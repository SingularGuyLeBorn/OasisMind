# gpt-oss 模型卡: 两个开放权重 MoE 推理模型的结构, 训练与风险评估

来源: gpt-oss-120b & gpt-oss-20b Model Card (OpenAI, 2025 年 8 月 5 日, arXiv:2508.10925v1). 同目录源文 `gpt-oss.md`, 35 页, 23 张图 (编号为 Figure 1 到 Figure 16, 其中 22 张是评测柱状图或折线图, 1 张是 SWE-bench 任务流程示意), 13 张表, 附录另有两段 harmony 格式示例 (Figure 17, Figure 18). 逐段对照见 `gpt-oss-bi.md`. 下文数字优先取本文印出的值; 从图上读出的数标「读图」, 自己算出的数标「估算」; 本文没写, 取自官方开源仓库配置和参考实现 (github.com/openai/gpt-oss, Hugging Face 上的 config.json) 的, 标「开源配置」. 涉及生物实验与网络攻击的小节, 这里只谈评级和分数.

| 项目 | 数值 |
| --- | --- |
| 规模 | 120b: 36 层, 总参数 116.83B, 激活 5.13B; 20b: 24 层, 总参数 20.91B, 激活 3.61B (Table 1) |
| 宽度 | 残差维度 2880, Pre-LN + RMSNorm |
| MoE | 120b 每层 128 个专家, 20b 每层 32 个, 都是 top-4, 先选后 softmax; 专家为带截断和 +1 的 SwiGLU |
| 注意力 | 64 个 query 头 × 64 维, GQA 8 个 KV 头; 带状窗口 (128 token) 与稠密层交替; 每头一个可学习的 softmax 分母偏置 (attention sink) |
| 位置与长度 | RoPE + YaRN, 稠密层上下文 131,072 token; 开源配置为从 4096 扩 32 倍, rope_theta 150000 |
| 量化 | MoE 权重以 MXFP4 后训练, 4.25 bit/参数; 检查点 120b 60.8GiB, 20b 12.8GiB |
| 分词器 | o200k_harmony, BPE, 词表 201,088 |
| 预训练 | 纯文本, 数万亿 token, 侧重 STEM, 编程, 通用知识; 复用 GPT-4o 的 CBRN 过滤器; 知识截止 2024 年 6 月; 120b 用 2.1M H100 小时, 20b 少将近 10 倍 |
| 后训练 | 与 o3 相近的 CoT 强化学习; harmony 格式 (角色层级 + analysis / commentary / final 三通道); low / medium / high 三档推理强度; 浏览, Python, 开发者函数三类工具 |
| 代表成绩 (high) | AIME 2025 带工具 120b 97.9, 20b 98.7; GPQA Diamond 不带工具 80.1 / 71.5; SWE-Bench Verified 62.4 / 60.7; Codeforces 带工具 2622 / 2516 (Table 3) |
| 准备度结论 | 默认模型与对抗微调版在生物化学, 网络, AI 自我改进三类上都未达高能力 |

## 1. 一份模型卡能提供多少结构信息

OpenAI 过去几份系统卡 (o1, o3-mini, o3 / o4-mini) 几乎不谈结构, 参数量, 层数, 注意力形式都空着. gpt-oss 是开放权重, 权重一发布结构就藏不住, 所以这份模型卡第 2 节把结构写得相当完整: 层数, 残差维度, 专家数, top-k, 注意力头数, KV 头数, 窗口宽度, 上下文长度, 量化格式, 词表大小, 训练用的 GPU 小时, 知识截止时间. 作者把文档称作 model card 而不是 system card, 理由是模型会被嵌进许多第三方系统, 系统级防护要由部署方自己负责.

没写的部分同样清楚. 预训练 token 数只说「trillions」, 学习率, 批大小, 数据配比, 专家负载均衡的做法都没有; 后训练只说「similar CoT RL techniques as OpenAI o3」, 用什么算法, 奖励从哪来, 训练多少步, 一概不提. 结构上也有几处点到为止: 脚注 1 只说 SwiGLU「unconventional」, 注意力 sink 只有一句话, YaRN 的参数不给. 好在权重和参考实现是公开的, 这些细节可以从开源配置里对上, 下文凡是用到的都单独标注.

篇幅分配也说明了这份文档的重心. 第 2 节 (结构, 训练, 能力评测) 占 8 页, 第 3 到第 5 节 (默认安全, 准备度评估, 对抗微调) 占近 20 页. 这与开放权重的风险形态有关: 一旦发布, 攻击者可以随意微调, OpenAI 无法追加缓解, 也无法收回访问, 所以**安全评估的主体变成了「被恶意微调之后能到什么程度」**.

## 2. 从 Table 1 反推整张结构图

Table 1 只有六行, 但配合第 2.2 节的超参数, 能把每一块参数的来历都算出来. 输入嵌入和输出投影各是 201,088 × 2880 ≈ 0.579B, 合计约 1.158B, 正是表里两个模型相同的 1.16B, 说明两者不共享权重 (开源配置 tie_word_embeddings 为 false). 注意力每层是 Q 投影 2880 × 4096, K, V 各 2880 × 512, 输出投影 4096 × 2880, 共 2880 × 9216 ≈ 26.5M, 乘 36 层得 0.955B, 乘 24 层得 0.637B, 分别对上 0.96B 和 0.64B.

MLP 这一行最能说明问题. 每个专家是 SwiGLU, 有门控, 上投影, 下投影三块矩阵; 114.71B ÷ 36 ÷ 128 ≈ 24.9M, 除以 3 × 2880 得中间维度约 2880; 20b 用 19.12B ÷ 24 ÷ 32 算出同一个数 (开源配置 intermediate_size 为 2880). 也就是说, **两个模型的专家形状完全一样**, 差别只在层数 (36 对 24) 和每层专家数 (128 对 32). 激活参数随之可以拼出来: 120b 为 0.96 (注意力) + 0.58 (输出投影) + 114.71 × 4/128 ≈ 3.58 (4 个专家), 合计约 5.12B; 20b 为 0.64 + 0.58 + 19.12 × 4/32 ≈ 2.39, 合计约 3.61B, 与表中的 5.13B, 3.61B 相符, 剩下的零头是 router 和偏置.

几个比例值得记下. MLP 占 120b 总参数的 98.2%, 注意力不到 1%, 所以只量化 MoE 权重就能把检查点压到原来的三分之一左右. 输出投影计入激活参数, 在 120b 的 5.13B 里占约 11%, 在 20b 的 3.61B 里占约 16%: 20 万的大词表对小模型的每 token 计算量是一笔不小的固定开销. 另外, 每个 token 走 4 个宽 2880 的专家, 等价于一个中间维度 11,520 (= 4 × 2880) 的稠密 SwiGLU, 这恰好是常见的「FFN 宽度为 4 倍隐藏维」的配置; 换句话说, **gpt-oss 每 token 的 FFN 计算量和一个 2880 宽的常规稠密模型相当, 容量却放大了 32 倍 (120b) 或 8 倍 (20b)**.

## 3. MoE 层: 128 选 4, 选完再归一

第 2.2 节对 router 的描述只有一句: 标准线性投影给每个专家打分, 选 top-4, 再只在这 4 个专家上做 softmax 作为权重. 结合参考实现, 一层 MoE 可以写成

$$
u = \mathrm{RMSNorm}(h),\quad s = W_r u + b_r,\quad \mathcal{T} = \mathrm{TopK}(s, 4),\quad h' = h + \sum_{i\in\mathcal{T}} \frac{e^{s_i}}{\sum_{j\in\mathcal{T}} e^{s_j}}\, E_i(u) \tag{1}
$$

式 (1) 里的归一化只在 $\mathcal{T}$ 内进行, 4 个权重之和恒为 1. 这和「先对全部专家 softmax 再截断」的写法不同: 后者 4 个权重之和小于 1, 并且随 router 对落选专家的打分浮动, 专家输出的整体量级会跟着变. **先选后归一**的代价是落选专家的 logit 在这一步拿不到梯度, 只能靠别的机制 (比如负载均衡损失) 让它们有机会被选中. 模型卡没提负载均衡怎么做, 也没提共享专家; 开源配置里只有 128 个普通专家和 top-4, 没有常驻专家. MoE 的系统侧问题 (专家并行, all-to-all 通信, 负载不均) 可参见 [MoE 系统与并行](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md).

两个模型的稀疏程度差别很大. 120b 每 token 激活 4/128 的专家, 20b 激活 4/32; 20b 的专家总量只有 120b 的 1/6 (32 × 24 对 128 × 36), 这是 Figure 1 里它在知识类任务 (GPQA, HLE, MMLU) 上落后的直接原因. 第 2.6.1 节的原话是「On more knowledge-related tasks such as GPQA, the gpt-oss-20b model lags behind due to its smaller size」, 这里的「size」指总参数; 在 AIME 这类更靠推理长度的任务上, 两者几乎持平 (带工具 AIME 2025 为 97.9 对 98.7).

## 4. SwiGLU 的截断与 +1

脚注 1 只说「Our SwiGLU implementation is unconventional, including clamping and a residual connection」. 参考实现给出了完整写法: 第一块投影输出交错拆成门控分支 $a$ 和线性分支 $b$, 然后

$$
E_i(u) = W_2\big[\,\tilde a\,\sigma(1.702\,\tilde a)\odot(\tilde b + 1)\,\big] + c_2,\quad \tilde a = \min(a, 7),\quad \tilde b = \mathrm{clip}(b, -7, 7),\quad [a;\,b] = W_1 u + c_1 \tag{2}
$$

和标准 SwiGLU $\mathrm{SiLU}(a)\odot b$ 相比有三处改动 (开源配置). 一是门控函数 $x\,\sigma(1.702x)$: 1.702 是用 sigmoid 近似 GELU 时的常数, 所以这个门更接近 GELU 的形状, 而 SiLU 对应系数 1. 二是截断: 门控分支只截上限 7, 线性分支截到 ±7, 限制了 FFN 中间激活的最大值. 三是 $(\tilde b + 1)$: 线性分支加 1 后再相乘, 等价于在门控输出 $\tilde a\,\sigma(1.702\tilde a)$ 上再并联一条**直通路径**, 这就是脚注说的「residual connection」. 各级投影都带偏置 ($c_1$, $c_2$, 注意力的 QKV 也有偏置), 这延续了 GPT-2 的习惯.

截断为什么要做, 模型卡没说. 一个合理的推测是: MoE 权重要以 4 bit 存储, 激活峰值越小, 低比特下的数值误差越可控, 训练也越不容易出现尖峰; +1 则保证门控接近 0 时专家输出不至于完全塌掉. 这两点都属于推测. GLU 家族的一般形式和 SwiGLU 的来历可参见 [GLU 家族: 从 GLU 到 SwiGLU](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md).

## 5. 注意力: 128 token 窗口与稠密层交替

注意力这一段信息密度很高. 带状窗口与全稠密交替, 沿用 GPT-3 的做法 [10][11]; 开源配置的 layer_types 显示第 0 层是窗口层, 之后一层稠密一层窗口, 120b 共 18 层稠密, 18 层窗口 (20b 各 12 层). 每层 64 个 query 头, 每头 64 维, Q 的总宽度 4096 比残差维度 2880 还宽; KV 头只有 8 个, 每 8 个 query 头共用一组 K, V. GQA 在显存与质量之间的取舍可参见 [GQA: 在性能与缓存之间折中](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md).

这两个设计叠加起来, **KV cache 被压得很小**. 按 BF16 存储, 序列长度为 $L$ 时

$$
\mathrm{KV}(L) = \big[\,n_{\text{dense}}\cdot L + n_{\text{win}}\cdot\min(L, 128)\,\big]\times 2 \times n_{kv} \times d_h \times 2\ \text{byte} \tag{3}
$$

代入 $n_{kv}=8$, $d_h=64$, 每层每 token 是 2048 byte. 120b 稠密层 18 层, 每 token 约 36KiB; 窗口层 18 层最多各存 128 个 token, 总共固定约 4.5MiB. 于是 8,192 token 约 288MiB, 32,768 token 约 1.1GiB, 131,072 token 约 4.5GiB; 20b 稠密层 12 层, 每 token 24KiB, 131,072 token 约 3.0GiB. 作为对照, 如果 36 层全是稠密层且 64 个头各有自己的 K, V, 每 token 要 576KiB, 131,072 token 就是 72GiB, 比 120b 的全部权重还大. GQA 贡献 8 倍, 交替窗口再贡献约 2 倍, 合计约 16 倍.

窗口层的代价在于看得近. 每个窗口层的 token 只能看前 128 个 token, 长程信息全靠稠密层传递. 本文没给窗口层与稠密层比例的消融, 也没给长上下文检索类评测 (比如大海捞针), 131,072 这个长度下模型实际能用上多少, 从模型卡里看不出来. KV cache 的一般压缩手段可参见 [KV 缓存与内存优化](../../../../llm-guide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md).

## 6. attention sink: 给 softmax 留一个「什么都不看」的出口

第 2.2 节最后一句说, 每个注意力头在 softmax 分母里有一个可学习的偏置, 类似 off-by-one attention [16] 和 attention sink [17], 「which enables the attention mechanism to pay no attention to any tokens」. 设头 $h$ 的偏置为 $z_h$, 查询位置 $i$ 可见的键集合为 $\mathcal{W}(i)$ (窗口层是前 128 个, 稠密层是全部前缀), 权重为

$$
\alpha_{ij} = \frac{\exp(q_i^\top k_j/\sqrt{d_h})}{\exp(z_h) + \sum_{j'\in\mathcal{W}(i)}\exp(q_i^\top k_{j'}/\sqrt{d_h})} \tag{4}
$$

当所有打分都远小于 $z_h$ 时, 分母几乎全是 $\exp(z_h)$, 各 $\alpha_{ij}$ 都趋近 0, 这个头的输出接近零向量. Miller 的 off-by-one 相当于 $z_h$ 固定为 0 (分母加 1), gpt-oss 让每个头自己学. 参考实现的写法是把 $z_h$ 当成额外一列 logit 拼到打分矩阵上, softmax 之后再丢掉这一列, 与式 (4) 等价.

这一设计和窗口注意力关系很紧. StreamingLLM [17] 发现, 普通 softmax 的权重和必须为 1, 头在「没什么可看」的时候会把注意力堆到序列开头的几个 token 上, 开头 token 一旦被挤出 KV cache, 质量就崩. gpt-oss 的窗口层只看最近 128 个 token, 序列开头很快就不在窗口里了, 普通注意力找不到固定的「垃圾桶」; **分母里的可学习偏置正好补上这个位置** (这是推测, 模型卡没把两者联系起来). 详细机制可参见 [StreamingLLM 与 Attention Sink](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md); 另一条让头输出接近零的路线是在注意力输出上加门控, 见 [Gated Attention](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention/06-Gated-Attention.md).

## 7. RoPE 与 YaRN: 从 4096 拉到 131,072

模型卡只说「extend the context length of dense layers to 131,072 tokens using YaRN」. 开源配置补齐了参数: rope_theta 150000, 原始长度 4096, 扩展倍数 $s = 32$ (4096 × 32 = 131,072), beta_fast 32, beta_slow 1. RoPE 的 64 维头分成 32 个频率对, 第 $d$ 对的角频率 $\theta_d = 150000^{-2d/64}$. YaRN 的 **NTK-by-parts** 做法是按波长分段处理:

$$
\theta_d' = (1-\gamma_d)\,\frac{\theta_d}{s} + \gamma_d\,\theta_d,\qquad \gamma_d = 1 - \mathrm{clip}\Big(\frac{d - d_{\text{low}}}{d_{\text{high}} - d_{\text{low}}},\, 0,\, 1\Big) \tag{5}
$$

其中 $d_{\text{low}} = 32\ln\big(4096/(32\cdot 2\pi)\big)/\ln 150000 \approx 8.09$, $d_{\text{high}} = 32\ln\big(4096/(2\pi)\big)/\ln 150000 \approx 17.40$. 所以前 9 对 ($d = 0$ 到 8) 保持原频率, 后 14 对 ($d = 18$ 到 31) 全部除以 32, 中间 9 对线性过渡. 另外 cos, sin 乘以温度系数 $0.1\ln s + 1 \approx 1.347$, 由于 q, k 都乘, 注意力 logit 实际放大约 1.81 倍, 用来抵消插值后注意力分布变平.

式 (5) 的分界点正好解释了模型卡为什么说「dense layers」. $d = 8$ 这一对的波长约 $2\pi\times 150000^{0.25}\approx 124$ token, 也就是说, 波长短于约 128 token 的维度完全不动, 长于约 4096 token 的维度才被压缩. 窗口层只看 128 以内的相对位置, 起作用的主要是高频维度, 这些维度 YaRN 根本没改; 被压缩的低频维度在 128 token 内几乎不转, 对窗口层影响很小. 参考实现里窗口层和稠密层用的是同一套 RoPE, 但**实际受 YaRN 影响的只有稠密层**. RoPE 本身见 [RoPE 详解](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md), 从 PI 到 YaRN 的演变见 [长度外推: 从 PI 到 YaRN 的频率扩展](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/RoPE/03-长度外推：从PI到YaRN的频率扩展.md).

## 8. MXFP4: 4.25 bit 与单卡 80GB

MXFP4 出自 OCP 的 Microscaling 规范 [5]. 每 32 个元素组成一块, 每个元素是 4 bit 的 E2M1 浮点数 (可表示 0, 0.5, 1, 1.5, 2, 3, 4, 6 及其负数), 整块共享一个 8 bit 的 E8M0 指数, 即一个 2 的整数次幂. 平均每元素 4 + 8/32 = 4.25 bit, 这就是第 2.1 节的数. 块内共享指数意味着同一块里最大值决定了精度, 离群值会拖累同块其他元素, 这也是第 4 节那种激活截断可能有用的地方 (推测). 格式细节和 NVFP4 的对比见 [MXFP4 与 NVFP4](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/03-MXFP4与NVFP4.md).

第 2.1 节的措辞是「We post-trained the models with quantization of the MoE weights to MXFP4 format」, 意思是后训练阶段 MoE 权重就已经是 MXFP4, 不是训完再做一次训练后量化. 训练时梯度怎么穿过量化 (比如直通估计), 模型卡没写. **只量化 MoE 权重是有依据的**: 它们占总参数 98.2%, 其余部分 (注意力, router, 嵌入, 输出投影) 在开源配置里列为不转换的模块. 按这个口径估算, 120b 的 MoE 部分 114.71B × 4.25/8 ≈ 56.8GiB, 其余约 2.12B 参数按 BF16 约 3.9GiB, 合计约 60.7GiB; 20b 约 9.5 + 3.4 ≈ 12.8GiB, 与 Table 1 的 60.8GiB, 12.8GiB 基本对上. 一般的权重量化方法见 [权重量化](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.1-权重量化.md).

「单张 80GB GPU」和「16GB 内存」这两个说法可以用式 (3) 再核一遍. 80GB 约 74.5GiB, 扣掉 60.8GiB 权重剩约 13.7GiB, 够放三条 131,072 token 的 KV cache (每条约 4.5GiB), 激活和框架开销还没算. 16GB 约 14.9GiB, 扣掉 12.8GiB 剩约 2GiB, 按 20b 每 token 24KiB 算只够几万 token, 所以 **16GB 设备上跑满 131,072 的上下文并不现实**, 模型卡的说法对应的是短上下文场景. 显存构成的一般分析见 [显存占用分析](../../../../llm-guide/6-训练与推理优化/6.2-显存与计算分析/6.2.1-显存占用分析/6.2.1-显存占用分析.md).

## 9. 分词器: o200k_harmony

分词器是 o200k 的扩展版, 用于 GPT-4o 和 o4-mini 的同一套 BPE, 额外加入 harmony 格式的专用 token, 词表共 201,088. 附录的 Figure 17 和 Figure 18 能看到其中一部分: `<|start|>`, `<|message|>`, `<|end|>`, `<|channel|>`, `<|constrain|>`, `<|call|>`. 这些 token 负责切分消息边界, 标记通道和工具调用的结束, 解析器靠它们判断哪段是 CoT, 哪段是给用户的答案, 哪段要交给工具执行. 分词器的一般设计见 [分词器与 Tokenizer](../../../../llm-guide/3-预训练/3.3-分词器与Tokenizer/3.3-分词器与Tokenizer.md).

**大词表的代价**在第 2 节已经算过: 输出投影 0.579B 全部计入激活参数, 对 20b 来说占每 token 计算量的六分之一左右. 好处是多语言和代码的压缩率更高, 同样的文本切出的 token 更少, 对第 12 节讲的长 CoT 来说, token 越省, 推理成本越低. 模型卡没给压缩率数据, 这一点只能定性地说.

## 10. 预训练: 数据, 过滤与 2.1M H100 小时

数据部分只有三句: 纯文本, 数万亿 token, 侧重 STEM, 编程和通用知识; 复用 GPT-4o 的 CBRN 预训练过滤器, 尤其过滤危险的生物安全知识; 知识截止 2024 年 6 月 (附录 Figure 17 的系统消息里也写着「Knowledge cutoff: 2024-06」). 过滤比例, 过滤前后数据量, 过滤对能力的影响都没有. 第 5 节的生物评测说明, **预训练过滤并没有把相关知识清干净**, 真正把分数压下去的是后训练阶段的拒答. 一般的数据清洗流程见 [数据处理](../../../../llm-guide/3-预训练/3.1-预训练数据/3.1.3-数据处理/3.1.3-数据处理.md).

训练算力给得比较具体: H100, PyTorch, 针对专家计算优化的 Triton 算子, FlashAttention [21], 120b 共 2.1M H100 小时, 20b「almost 10x fewer」. 用 $C \approx 6 N_{\text{act}} D$ 粗估: 2.1M 小时 × 3600 秒 × H100 BF16 稠密峰值约 989 TFLOPS ≈ 7.5 × 10^24 FLOPs 的峰值算力; 硬件利用率取 10% 到 40%, 对应 $D \approx$ 24T 到 97T token. 这个区间很宽, 而且 2.1M 小时是否包含后训练, MoE 在 H100 上的实际利用率, 本文都没说, 只能说明量级在几十 T. 作为对照, 按稠密模型每参数约 20 token 的经验比例, 5.13B 激活参数只需约 100B token, gpt-oss 的训练量远超这个点, 这是为推理成本而**过量训练**小激活模型的常见做法. MoE 的 Scaling 关系与稠密模型不同, 这个对照只作参考, 相关讨论见 [Scaling Law](../../../../llm-guide/3-预训练/3.2-预训练全流程/3.2.6-Scaling-Law/3.2.6-Scaling-Law.md).

20b 的数字更耐琢磨. 它的激活参数是 120b 的 0.70 倍, GPU 小时却只有约 1/10; 同样利用率下, 训练 token 量约为 120b 的 (1/10) ÷ 0.70 ≈ 1/7. 要么 20b 训练 token 明显更少, 要么两者利用率差得多 (小模型通常更难把 GPU 喂饱, 这会让差距更大而不是更小). 模型卡两样都没交代. FlashAttention 如何减少显存读写见 [FlashAttention](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md).

## 11. 后训练: CoT 强化学习与 harmony 格式

后训练的描述是「similar CoT RL techniques as OpenAI o3」: 用强化学习教模型借助 CoT 推理解题, 同时教它用工具; 数据覆盖编程, 数学, 科学等. 因为方法相近, 模型的「性格」与 ChatGPT 里的模型相似. 算法是 PPO 一类还是 GRPO 一类, 奖励是可验证奖励还是奖励模型, 模型卡都没写, 所以没法把 gpt-oss 归到某个具体的算法谱系下. 推理模型的一般训练路线见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md), 组相对优势类算法见 [GRPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md).

harmony 格式是后训练里信息最多的部分. 它有两层结构. 第一层是角色, 按优先级排成 System > Developer > User > Assistant > Tool, 发生指令冲突时高优先级胜出; Tool 排最后, 意味着工具返回的内容 (比如网页正文) 在设计上不应覆盖任何人的指令. 第二层是通道: analysis 放 CoT, commentary 放函数调用 (也放给用户看的「前言」, 概述接下来的行动计划), final 放最终答案. **通道把「模型在想什么」和「模型对用户说什么」在 token 层面分开**, 部署方可以只展示 final, 对 analysis 另做过滤, 这与第 16 节「不对 CoT 施压」的决定配套.

附录两段示例把格式展开了. Figure 17 的 system 消息里依次是身份, 知识截止, 当前日期, `reasoning: low`, 合法通道列表, 以及「对 functions 的调用必须走 commentary 通道」; developer 消息里是指令 (「Use a friendly tone.」) 和一个 TypeScript 风格的函数命名空间; 最后以 `<|start|>assistant` 结尾, 等模型续写. Figure 18 的输出先在 analysis 通道写一句 CoT, 再在 commentary 通道发起调用, 用 `to=functions.get_weather` 指定接收方, `<|constrain|>json` 约束参数格式, `<|call|>` 结束. 这里有个小错: Figure 17 定义的函数叫 get_current_weather, Figure 18 调用的是 get_weather. 模型卡还特别提醒, 多轮对话里要删掉之前各轮的推理内容; 格式如果用错, 模型就处在训练时没见过的分布上, 能力会打折扣. 工具调用的一般协议见 [工具使用与 MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md).

## 12. 三档推理强度与推理时多花算力

三档推理强度的实现方式很简单: 系统提示词里写 `Reasoning: low` 之类的关键字, 模型经过训练会据此调整 CoT 长度. 这是把推理预算交给用户的一个开关, 同一个模型可以在延迟敏感的场景用 low, 在难题上用 high. Figure 3 扫了三档, 横轴是平均 CoT + 答案长度 (对数刻度), 纵轴是准确率. 对照 Table 3 可以确认, Figure 3 画的是「with tools」两行: 120b 的 AIME 2025 三个点对 72.9 / 91.6 / 97.9, 20b 对 57.5 / 90.4 / 98.7; GPQA 对 68.1 / 73.5 / 80.9 与 58.0 / 67.1 / 74.2.

读图能得到长度. 120b 的 AIME high 点约 13k token, 20b 约 20k 出头, 对上第 2.6.1 节「gpt-oss-20b use over 20k CoT tokens per problem on average for AIME」; GPQA 上 120b 从 low 的约 1.1k 到 high 的约 18k, 20b 从约 1k 到约 30k (读图). GPQA 上长度每翻一倍, 120b 涨约 3.2 分, 20b 涨约 3.3 分 (读图 + 估算), 这就是第 2.6.1 节说的「log-linear returns」. AIME 的曲线在 medium 之后明显变平, 因为 high 档已经接近满分. 一个容易忽略的推论: AIME high 档上, 20b 每 token 的激活参数是 120b 的 0.70 倍, 长度却约是 1.6 倍, 每题的总计算量反而比 120b 高约 10% 到 20% (读图 + 估算, 未计注意力). **小模型在难题上并不一定更省, 省的是显存**.

Table 3 的 low 到 high 增幅按任务类型分得很开. AIME 2025 不带工具, 120b 涨 42.1 分, 20b 涨 54.6 分; SWE-Bench Verified 涨 14.5 和 23.3; GPQA 涨 13.0 和 14.7; MMLU 只涨 4.1 和 4.9. **越靠多步推导的任务, 多想的回报越大; 越靠记忆的任务, 回报越小**. 同时 Table 3 里有几处不单调: 20b 的 Tau-Bench Airline 从 medium 42.6 掉到 high 38.0, HealthBench Hard 从 12.9 掉到 10.8, 120b 的 HealthBench Consensus 从 90.8 掉到 89.9. 本文没给样本量和方差, 分不清是噪声还是长 CoT 在对话类任务上的真实副作用.

## 13. 工具与智能体任务

后训练教了三类工具: 浏览 (search 和 open 两个函数), 有状态的 Jupyter 里运行 Python, 以及 developer 消息里定义的任意函数. 模型可以把 CoT, 函数调用, 函数返回, 中间消息和最终答案交错排列, 也就是在推理过程中调用工具. 这种「推理里嵌工具」的训练方式见 [Tool-integrated Reasoning RL](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.2-Tool-integrated-Reasoning-RL.md).

Table 3 带工具和不带工具的对比说明, 工具在低推理档最有用. AIME 2024 上, 120b low 档带工具比不带高 19.1 分 (75.4 对 56.3), high 档只高 0.8 分 (96.6 对 95.8); AIME 2025 low 档高 22.5 分, high 档高 5.4 分. 多半是 Python 替模型做了计算, 在 CoT 短的时候替代了一部分「想」, CoT 足够长时模型自己也能算对. 结论是**工具和推理长度可以互相替代**, 低档加工具是一条便宜的路. 反例也有: 20b 的 Codeforces low 档带工具只有 1251, 比不带工具的 1366 还低, 小模型在短预算下用终端工具可能反而分散了精力 (推测).

智能体类任务上两个模型的差距比数学题大. high 档 Tau-Bench Retail 120b 为 67.8, 20b 为 54.8, 差 13.0 分; Tau-Bench Airline 差 11.2 分, Aider Polyglot 差 10.2 分; 而 AIME 2025 不带工具只差 0.8 分, SWE-Bench Verified 差 1.7 分. 函数调用类任务要记住业务规则, 读懂长对话, 更吃知识与总参数. 与闭源模型比, Figure 2 里 120b 的 Codeforces 带工具 2622, 低于 o4-mini 的 2719 和 o3 的 2706; SWE-Bench Verified 62.4, 低于 o4-mini 的 68.1; Tau-Bench Retail 67.8, 高于 o4-mini 的 65.6. 「approaches o4-mini」这个说法大体成立, 只有函数调用一项反超.

## 14. 健康与多语言

HealthBench 是这份模型卡里 120b 相对闭源模型最亮眼的一项. Figure 4 上 120b 的 HealthBench 为 57.6, o3 为 59.8; HealthBench Hard 为 30.0, o3 为 31.6; 两项都明显高于 o4-mini (50.1, 17.5), o1 (41.8, 7.9) 和 GPT-4o (32.0, 0.0). 20b 的 HealthBench 42.5, 比 o1 的 41.8 略高, 对上图注「slightly better than OpenAI o1」. 模型卡由此说这是健康领域「性能对成本」帕累托前沿的一次大幅改进, 并强调开放模型在隐私与成本受限的全球健康场景可能更有用.

但 **Consensus 面板的结论相反**. 120b 在 HealthBench Consensus 上是 90.0, 低于 o1 (91.5), o3 (92.8), o3-mini (91.1), o4-mini (91.8), 只比 GPT-4o 的 88.7 高; 20b 的 82.6 全场最低. Consensus 子集是多位医生达成共识的题, 考的是「不犯明显错误」, gpt-oss 在这里吃亏, 在开放式的难题上反而占优. 另外 Table 3 的 Consensus 随推理档位几乎不变甚至下降 (120b 90.6, 90.8, 89.9), HealthBench Hard 却从 22.8 涨到 30.0, 这与第 12 节的规律一致: 长 CoT 帮的是难题, 帮不了底线正确率.

多语言用 MMMLU, 即 MMLU 的 14 种人工译本. Table 2 逐列平均能完全复现 Average 行 (如 120b high 为 81.33), 与 Table 3 一致. 120b high 平均 81.3, 比 o4-mini 的 85.2 低 3.9 分, 比 o3 的 88.8 低 7.5 分, 「comes close to o4-mini-high」只能算大体接近. **低资源语言是明显短板**: Yoruba 在 120b high 档为 62.4, 比平均低约 19 分, 20b 只有 50.1; Swahili 为 72.3 和 60.7. 两个模型的差距也集中在这里: Spanish 上 120b 比 20b 高 4.7 分, Swahili 高 11.6 分, Yoruba 高 12.3 分. 低资源语言的知识更依赖总参数, 与第 3 节的判断相符.

## 15. 默认安全: 违禁内容, 越狱与指令层级

安全训练的主要手段是**审慎对齐** (deliberative alignment) [29]: 让模型在 CoT 里对照成文的安全规范推理, 再决定拒答还是作答; 配合**指令层级** [30], 教模型在冲突时服从更高优先级的角色. 思路与 [Constitutional AI](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/01-Constitutional-AI-宪法对齐/01-Constitutional-AI-宪法对齐.md) 一类「按成文规范自我约束」的做法相近. 违禁内容评测分两套: 标准集 (Table 4) 已经饱和, 四个模型大多在 0.95 以上; Production Benchmarks (Table 5) 更接近生产数据, 多轮, 更难. 标准集上 20b 的 personal-data/semi-restrictive 为 0.947, 比 o4-mini 的 0.975 低 2.8 分, 超出正文「1-2 points」的说法; Production Benchmarks 上 120b 对 o4-mini 是 9 胜 1 平 1 负, 输的那一项是 illicit/violent (0.817 对 0.845), 正文只点名了 20b 在这一项上落后.

越狱评测 (Table 6) 用 StrongReject 的四个类别, gpt-oss 与 o4-mini 都在 0.96 到 0.99 之间, 差距在 2 分以内. 拉开差距的是指令层级. Table 7 的系统提示词提取, 120b 为 0.832, 20b 为 0.881, o4-mini 为 0.993; 提示注入劫持为 0.780, 0.639, 0.917. Table 8 的四项里, 20b 在 developer 消息下的短语保护只有 0.661; 唯一反超 o4-mini 的是 120b 在 developer 消息下的密码保护 (1.000 对 0.947). 模型卡自己的结论是 gpt-oss「generally underperform OpenAI o4-mini」, 并指出这意味着**部署方靠 system 消息防越狱, 效果不如 OpenAI 在自家模型上用同一手段**; 补救办法是开发者针对自己遇到的越狱再做微调.

指令层级是用 SFT 式的监督数据训的: 收集三种角色消息相互冲突的样例, 「supervised gpt-oss」去服从高优先级. 一般做法见 [SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md). 值得补一句的是覆盖面: 评测只测了 system 对 user, developer 对 user 两类冲突, Tool 消息里的注入没有单独的表, 而浏览工具恰恰会把外部网页内容带进上下文. 对要接入浏览或第三方工具的部署方来说, 这一档的鲁棒性需要自己测. 安全评测的一般设计见 [安全与对抗评测](../../../../llm-guide/10-评测、安全与治理/10.2-安全与对抗评测.md), 智能体场景下的注入问题见 [Agent 安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md).

## 16. 不给 CoT 施压, 以及幻觉

第 4.4 节交代了一个产品决定: **两个模型的 CoT 都没有施加任何直接的优化压力**. 理由来自 OpenAI 此前的研究: 监控推理模型的 CoT 有助于发现不当行为, 但如果训练时直接惩罚 CoT 里的「坏念头」, 模型会学会把念头藏起来, 行为照样不端. 不施压, CoT 就保留可监控性, 开发者和研究者可以在上面搭监控系统. 代价是 CoT 里可能出现幻觉, 也可能出现不符合安全政策的措辞, 所以模型卡要求开发者不要未经过滤, 审核或摘要就把 CoT 直接展示给用户. harmony 的 analysis 通道把这部分内容单独隔开, 正是为这一要求准备的.

幻觉评测 (Table 9) 不给联网. MinerU 把每格两个数挤在一起, 按「前为 accuracy, 后为 hallucination rate」读: SimpleQA 上 120b 为 0.168 / 0.782, 20b 为 0.067 / 0.914, o4-mini 为 0.234 / 0.750; PersonQA 上 120b 为 0.298 / 0.491, 20b 为 0.155 / 0.532, o4-mini 为 0.356 / 0.361. 两项之和小于 1 的部分可理解为没作答, SimpleQA 上 120b 约 5%, PersonQA 上约 21%. 模型卡的解释很直接: 小模型世界知识少, 更容易幻觉, 联网查资料能缓解. 与第 14 节合起来看, **gpt-oss 的长处在推理, 短处在事实记忆**, 部署时最好配浏览工具.

公平性用 BBQ (Table 10). 歧义题准确率 120b 为 0.87, 高于 o4-mini 的 0.82, 20b 为 0.79; 非歧义题 120b 0.90, 20b 0.89, 都低于 o4-mini 的 0.95. 正文的「about parity」是两个方向互相抵消后的说法.

## 17. 模拟攻击者: 对抗微调怎么做

开放权重的风险评估有两个问题. 第一个是绝对的: 恶意方把 gpt-oss-120b 微调之后, 能否在生物化学或网络领域达到准备度框架的高能力? 第二个是相对的: 即便没达到, 发布它会不会明显推高开放模型在危险生物能力上的前沿? 第一个问题靠对抗微调回答, 第二个问题靠拿 DeepSeek R1-0528, Qwen 3 Thinking, Kimi K2 做对照回答. 两个问题的答案都是否定的, 第一个由 SAG 审阅确认, 第二个的依据是「大多数评测上已经有别的开放模型持平或接近」.

模拟的对手有技术能力, 有强大的后训练基础设施和 ML 知识, 能收集领域数据, 算力充足. 方法是 **增量强化学习**, 用 OpenAI 内部的 o 系列训练栈, 在保留推理行为的前提下加能力, 训练和评测都用最高推理档. 具体分两部分: 一是 **helpful-only 训练**, 额外一段强化学习专门奖励顺从不安全提示的回答, 把拒答训掉; 二是 **领域能力最大化**, 生物模型端到端增量训练浏览并加领域专家数据, 网络模型用 CTF 挑战环境训练. 这些对抗版本不发布. 外部评审 (METR, SecureBio, Daniel Kang) 提了 22 条建议, OpenAI 落实 11 条, 其中高紧急 12 条落实 9 条; 附录列出的已采纳建议数下来却是 10 条, 与正文不符.

这套方法的前提值得点明: 它衡量的是「一个资源充足的对手, 用 OpenAI 自己的训练栈」能把模型推到哪里, 这比真实的低资源攻击者更强, 所以结论偏保守. 反过来, 第 5.2.2.1 节也承认「additional scaffolding or improved capability elicitation could substantially increase observed performance」, 评测分数只是下限. 两个方向的误差, 模型卡都交给了 SAG 的判断.

## 18. 生物与化学: 只看评级和分数

五项生物评测的结论可以用一张表概括 (读图, 发布版指 gpt-oss-120b 浏览版发布候选, bio max 指对抗微调的生物模型):

| 评测 | o3 | o4-mini | 20b 发布版 | 120b 发布版 | 120b bio max | 竞品最高 | 人类基线 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 多模态病毒学排错 (Figure 6) | 63% | 60% | 50% | 55% | 55% | 54% (Qwen 3) | 平均 40% |
| ProtocolQA 开放题 (Figure 7) | 39% | 27% | 16% | 27% | 28% | 24% (R1) | 共识 54%, 中位 42% |
| 隐性知识与排错 (Figure 8) | 77% | 68% | 73% | 74% | 76% | 75% (Kimi K2) | 共识 80%, 第 80 百分位 63% |
| TroubleshootingBench (Figure 9) | 32% | 22% | 19% | 25% | 26% | 18% | 第 80 百分位 36.4% |

表里最直接的读法是: **对抗微调几乎没有带来提升**, bio max 比发布版最多高 2 分; 所有模型都低于 ProtocolQA 的专家基线和 TroubleshootingBench 的 36.4% 阈值; o3 在四项上都是最高. 发布版在这几类题上本来就几乎不拒答, helpful-only 训练无分可加. 拒答的差别体现在 Figure 5 的长篇问题上: 发布版在五个阶段大多是 0%, helpful-only 变体与用越狱提示绕过拒答的竞品在多个阶段有明显得分 (读图). 这说明**默认模型的安全主要来自拒答, 而拒答正是开放权重最容易被训掉的部分**, 这也是 OpenAI 把重点放在对抗微调版上的原因.

第二个问题的答案来自竞品列. 120b bio max 在 TroubleshootingBench 上领先竞品 8 分左右, 在其余三项上与最好的竞品相差 1 到 4 分, 模型卡的说法是「no single open model consistently outperforms the others in this domain」. SecureBio 的外部评估结论相近: 对抗微调版总体高于未微调的 R1-0528, 低于 o3; 之后发布的 Qwen 3 Thinking 和 Kimi K2 已能与之相抗衡. 病毒学一项的样本量有一处出入: 正文写 350 道留出题, 附录写「final 322-question dataset」.

## 19. 网络安全: 只看评级和分数

CTF 用 100 多道公开题, 按高中, 大学, 职业三级划分, 高中级已不再报告; 每题跑 16 次, 报 pass@12. 大学级 (Figure 10): o3 39%, o4-mini 27%, 20b 发布版 17%, 120b 发布版 33%, 120b helpful-only 32%; cybermax 因训练数据包含大学级题而不画. 职业级 (Figure 11): o3 28%, o4-mini 16%, 20b 2%, 120b 发布版 14%, helpful-only 21%, cybermax 25%. **职业级是唯一能看出对抗训练效果的地方**, cybermax 比发布版高 11 分, 离 o3 还差 3 分, 这对应第 5.2.2 节「comparable performance to OpenAI o3」的说法.

网络靶场有 5 个场景, 1 个中度, 4 个轻度, 每项跑 30 次, 主指标为不带提示的 pass@12. Figure 12 上所有模型在主指标上都是 0%; 只有「轻度 + 带提示」的 pass@1 出现两个非零值, o3 为 1%, 120b helpful-only 为 2% (读图). 图注「No model is able to solve any scenario unaided or with hints」按字面与这两根柱子冲突, 正文说的「all score 0%」则指主指标, 没有矛盾. 结论是**端到端网络行动仍是所有模型的空白**, 包括专门训练过的 cybermax.

## 20. AI 自我改进

这一类用三项评测. SWE-bench Verified 用 n=477 的内部验证子集, 报 pass@1; Figure 14 上 o3 68%, o4-mini 69%, 20b 60%, 120b 62%. OpenAI PRs 让智能体在合并前的分支上复现内部 pull request, 以隐藏单元测试判定; Figure 15 上 o3 44%, o4-mini 39%, 两个 gpt-oss 都是 37%, 对上正文「two percentage points lower than OpenAI o4-mini」. PaperBench 取 10 篇论文子集 (完整版 20 篇, 共 8,316 个可评分子任务), high 推理不联网; Figure 16 上 o3 21%, o4-mini 25%, 20b 7%, 120b 11%.

三项的规律一致: **越接近真实研究工作, gpt-oss 与闭源模型的差距越大**. SWE-bench 差 6 到 7 分, OpenAI PRs 差 2 到 7 分, PaperBench 差 10 到 18 分. 模型卡据此判断 gpt-oss 没有在自我改进相关任务上表现出提升, 所有基准最高的仍是 o3 和 o4-mini. 这一类没有做对抗微调, 结论只针对默认模型.

## 21. 文中对不上的数字

几处前后不一致, 放在一起便于核对. 第一, Figure 2 的 SWE-Bench Verified 面板是 o3 69.1, o4-mini 68.1, Figure 14 却是 o3 68%, o4-mini 69%, 正文还说「o4-mini just one percentage point higher than OpenAI o3」; 两处先后相反, 模型卡没说明用的是不是同一次运行或同一套脚手架. 第二, Figure 4 的 HealthBench Consensus 120b 为 90.0, Table 3 high 档为 89.9. 第三, 第 5.1.1 节说落实了 11 条外部建议, Appendix 2 列出的已采纳建议只有 10 条. 第四, 病毒学排错集正文 350 题, 附录 322 题.

另有几处编号和命名的小错. 第 2.3 节和第 2.5.1 节把附录示例称作 Table 17, Table 18, 实际编号是 Figure 17, Figure 18, 全文的表只到 Table 13. Figure 17 定义的函数是 get_current_weather, Figure 18 调用的是 get_weather, 参数也从「San Francisco, CA」的格式变成了「San_Francisco」. Figure 1 图注说 20b「6 times smaller」, 按总参数是 5.6 倍, 按激活参数只有 1.4 倍. Figure 3 的点对应的是 Table 3 的 with tools 两行, 图注没有注明. 这些都不影响主要结论, 但引用具体数字时要先确认出处.