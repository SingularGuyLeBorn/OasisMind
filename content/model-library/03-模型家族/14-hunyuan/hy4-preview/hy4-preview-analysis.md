---
title: "Hy4 preview: 770B 总参, 49B 激活, 换上稀疏注意力的混元旗舰"
category: "模型库"
tags: ["Hunyuan", "技术解析"]
published: true
excerpt: "腾讯混元把旗舰从 Hy3 的 295B 拉到 770B, 注意力从 GQA 换成 Gated DSA 加跨层索引复用, 上下文到 1M, 46 项评测全部高于上一代."
---
# Hy4 preview: 770B 总参, 49B 激活, 换上稀疏注意力的混元旗舰

材料是腾讯混元团队在 Hugging Face 上发布的 Hy4 preview 模型卡, 没有技术报告, 页面未印发布日. 要回答的问题是: 混元把旗舰从 Hy3 的 295B 拉到 770B, 上下文从 256K 推到 1M, 结构上换了什么, 评测上换来多少.

## 1. 混元的旗舰线

### 1.1. 从 Hunyuan-Large 到 Hy3

混元的开源 MoE 从 2024 年 11 月的 Hunyuan-Large 开始 (arXiv 2411.02265). 它是 389B 总参, 52B 激活, 64 层, 每层 1 个共享专家加 16 个专项专家, 每 token 只选 1 个专项专家, 专家划分很粗, 单个专家约 0.35B (按表 1 估). KV 缓存用 GQA 加 CLA 两路压缩: 80 个 query 头共用 8 组 KV, 每 2 层再共用一份 KV, 合起来省掉约 95% ([Hunyuan-Large 篇](../large/large-analysis.md)).

之后两条线分开走. Hunyuan-TurboS (arXiv 2505.15431, 2025-05) 是 560B / 56B 的 Transformer, Mamba2, FFN 混排模型, 128 个子层里 57 层 Mamba2, 7 层注意力, 预训练 16T token, 报告里没有权重发布信息 ([TurboS 篇](../turbos/turbos-analysis.md)). Hunyuan-A13B (2025-06) 是 80B / 13B, 32 层, 改成 1 个共享专家加 64 个细粒度专家, top-8, GQA, 预训练 20T token ([A13B 篇](../a13b/a13b-analysis.md)). 细粒度专家这一步引的是 DeepSeekMoE.

Hy3 preview 在 4 月下旬发布, 收了 50 多个产品的反馈后加大后训练和 RL, 再发 Hy3. Hy3 是 295B 总参, 21B 激活, MTP 层 3.8B, 80 层, hidden 4096, 64 个 query 头用 GQA 共享 8 个 KV 头, 头维 128, 192 个专家 top-8, 上下文 256K ([Hy3 篇](../hy3/hy3-analysis.md)). Hy3 的服务建议是 8 张 H20-3e 这类大显存卡.

| 模型 | 时间 | 总参 / 激活 | 激活比 | 专家配置 | 注意力 | 上下文 |
|---|---|---|---|---|---|---|
| Hunyuan-Large | 2024-11 | 389B / 52B | 约 13.4% | 1 共享 + 16 选 1 | GQA + CLA | 256K |
| Hunyuan-TurboS | 2025-05 | 560B / 56B | 10% | 1 共享 + 32 选 2 | Mamba2 为主, 7 层注意力 | 256K |
| Hunyuan-A13B | 2025-06 | 80B / 13B | 约 16% | 1 共享 + 64 选 8 | GQA | 256K |
| Hy3 | 2026 | 295B / 21B | 约 7.1% | 192 选 8 | GQA, 8 KV 头 | 256K |
| Hy4 preview | 2026-09 | 770B / 49B | 约 6.4% | 1 共享 + 256 选 8 | Gated DSA + IndexCache | 1M |

### 1.2. Hy4 preview 改了什么

从 Hy3 到 Hy4 preview, 总参涨到约 2.6 倍, 激活涨到约 2.3 倍, 层数反而从 80 减到 78, hidden 从 4096 加到 6144. 「更浅更宽」和 GLM-5 相对 GLM-4.5 的改法相同, GLM-5 论文给的理由是减少专家并行的通信开销 ([GLM-5 篇](../../13-glm/glm-5/glm-5-analysis.md)). 模型卡只说在模型规模, 上下文长度和训练数据三个方向都做了扩展, 预训练更强, 后训练规模大幅增加; 训练数据量和训练步数报告里没写.

结构上的变化集中在注意力和残差. Hy3 是标准 GQA, 每层每 token 存 8 个 KV 头; Hy4 preview 的规格表出现了 Query 压缩维 2048 和 Key-Value 压缩维 512 两行, 这是 MLA 的写法, vLLM 部署命令里的注意力后端 `FLASHMLA_SPARSE` 也是 MLA 加稀疏选择的内核. 残差流从 1 条变成 4 条. 上下文到 1M 是这两项改动的直接受益者, 第 3 节会算.

## 2. 规格: 770B 怎么拼出来

### 2.1. 参数核算

规格表没给单个专家的大小, 但给了 hidden 6144 和 MoE 中间维 2048. 按 SwiGLU 专家三块矩阵算, 一个专家是 $3\times6144\times2048\approx37.7$M. 每层 257 个专家约 9.70B, 77 个 MoE 层合计

$$N_{\text{expert}} = 77\times257\times3\times6144\times2048 \approx 747.0\text{B} \tag{1}$$

770B 减去它, 剩约 23.0B 给注意力, indexer, 第 1 层稠密 FFN, 词嵌入与输出层, 归一化和残差混合参数. 这部分每个 token 都要经过. 每 token 激活的专家是 77 层 × 9 个, 约 26.2B, 再加上这 23.0B:

$$N_{\text{act}} \approx 77\times9\times37.7\text{M} + 23.0\text{B} \approx 49.2\text{B} \tag{2}$$

与规格表的 49B 吻合. 这也解释了为什么激活比 49/770 约 6.4%, 比专家激活比 9/257 约 3.5% 高: 将近一半的激活参数不在专家里. MTP 层同理, 一层 MoE 的专家约 9.70B, 加上注意力等约 0.3B, 正好约 10B; 激活 9 个专家约 0.34B, 加非专家部分约 0.7B. 式 (1)(2) 假设专家是三块矩阵且没有别的大块参数, 模型卡没有给逐项口径.

扣掉词嵌入和输出层 (各 $120832\times6144\approx0.74$B) 和稠密 FFN ($3\times6144\times18432\approx0.34$B), 每层剩约 270M 给注意力, indexer 和残差混合. 头维没有公开, 这 270M 无法再拆.

专家粒度也可以和前代比. Hunyuan-Large 每层 17 个专家, 单个约 0.35B; A13B 的专家是 $3\times4096\times3072\approx37.7$M; Hy4 preview 的专家是 $3\times6144\times2048\approx37.7$M, 和 A13B 大小几乎相同, 只是 hidden 更宽, 中间维更窄. 从 Large 到 A13B, 混元把粗专家换成了细粒度专家; 到 Hy4, 单个专家的大小没再变, 规模主要靠每层专家数 (65 到 257) 和层数 (32 到 77) 往上加. 每 token 激活 9 个专家这一点, 从 A13B 到 Hy4 一直没变.

### 2.2. 和 GLM-5 对一下

「受 DeepSeek 和 GLM 启发」这句话在规格上有很具体的对应. GLM-5 论文的表 10 和 GLM-5.3 的公开配置给出的数, 和 Hy4 preview 规格表逐行对照如下.

| 项 | GLM-5 | Hy4 preview |
|---|---|---|
| 层数 | 78 (3 稠密 + 75 MoE) | 78 (1 稠密 + 77 MoE) |
| hidden | 6144 | 6144 |
| 注意力头 | 64 | 64 |
| KV 压缩维 | 512 (576 = 512 + 64) | 512 |
| 路由专家 / 共享 / top-k | 256 / 1 / 8 | 256 / 1 / 8 |
| MoE 中间维 | 2048 | 2048 |
| indexer 头 × 维 | 32 × 128 (GLM-5.3 配置) | 32 × 128 |
| indexer top-k | 2048 | 2048 |
| 总参 / 激活 | 744B / 40B (含 MTP) | 770B / 49B (不含 MTP) |

能对上的行很多, 差别在稠密层数 (3 对 1), 残差流 (GLM-5 是单流, Hy4 是 4 流), 以及参数计数口径. GLM-5 的 744B / 40B 计入 MTP 层, 不计词嵌入和输出层; Hy4 的 770B / 49B 不含 MTP. 即便把口径差 (约 1.5B 的词嵌入与输出层, 约 0.7B 的 MTP 激活) 算进去, Hy4 的激活仍多出约 7B, 这部分来自哪里 (例如注意力头维更大), 页面没有给出能核对的数. DeepSeek 的部分对应 DSA 本身, DeepSeek-V3.2 的 top-k 也是 2048, 但它的 indexer 用 64 个头 (开源推理代码的配置), Hy4 的 32 头跟的是 GLM.

### 2.3. MTP 和部署量级

MTP 只有 1 层, vLLM 命令里却设了 3 个投机 token, 推理时应是把这一层重复调用来出多步草稿; SGLang 那边写的是 NEXTN, 3 步, 草稿 token 4 个. Hy3 的 MTP 层是 3.8B, 草稿长度 vLLM 2, SGLang 3. 两代 MTP 占主干的比例都约 1.3% (3.8/295 和 10/770), 和 2.1 估出的「Hy4 的 MTP 是一层与主干同构的 MoE 层」相符; Hy3 的 MTP 结构卡上没写, 比例相同只能说明它也随主干一起放大. GLM-5 走的是另一条路, 训练时 3 个 MTP 层共享参数, 缓解只训一层 MTP 时第二个草稿 token 接受率偏低的问题. Hy4 preview 是否做了类似处理, 模型卡没写. 机制见 [多 Token 预测 MTP](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP/2.4.6-多Token预测MTP.md) 与 [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md).

两段部署命令都加载 FP8 版, 8 路张量并行. 780B 的 FP8 权重约 780GB, 分到 8 张卡每张约 97.5GB, 80GB 的 H100 放不下, 至少要 H200 或 H20-3e 这一档 141GB 的卡, 剩下的约 40GB 每卡给 KV 缓存和激活. 页面没写 GPU 型号和显存要求, 这是按字节算的下限. vLLM 命令 `--speculative-config` 那一行末尾漏了续行反斜杠, 照抄会断成两条命令. 两个框架都有官方预构建镜像, `vllm/vllm-openai:hy4-preview` 和 `lmsysorg/sglang:hy4-preview`, 后者同时提供 x86 和 Arm 两种架构. 仓库还附了一套微调流程 (`finetune/README.md`); 量化一节只介绍腾讯的 AngelSlim 压缩工具包, 没说 FP8 版是不是用它量化的.

## 3. 注意力与残差: Gated DSA, IndexCache 与 iHC

### 3.1. MLA 压缩和 1M 的 KV 缓存

Hy3 的 GQA 每层每 token 存 8 个 K 头和 8 个 V 头, 头维 128. Hy4 preview 的 KV 压缩维 512 意味着每层每 token 只存一个 512 维的潜向量, 推理时把上投影矩阵吸收进 query 和输出投影, 所有头共用这份潜向量, 机制见 [MLA: 低秩潜变量与解耦 RoPE](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md) 与 [MLA 矩阵吸收与工程实现](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-矩阵吸收与工程实现/04-MLA-矩阵吸收与工程实现.md). 按 BF16 算每 token 的 KV 字节:

$$B_{\text{Hy3}} = 2\times80\times8\times128\times2 = 327{,}680,\qquad B_{\text{Hy4}} = 78\times(512+d_R)\times2 \tag{3}$$

$d_R$ 是解耦 RoPE 分量的维数, 模型卡没给; 取 DeepSeek 和 GLM-5 的 64, $B_{\text{Hy4}}=89{,}856$ 字节. Hy3 每 token 约 320KiB, 256K 上下文一条序列约 80GiB, 拉到 1M 就是约 320GiB. Hy4 每 token 约 88KiB, 1M 一条序列约 88GiB, 是 Hy3 同长度的约 27%. 再加 indexer 的键缓存, 每层每 token 128 维, 78 层合计约 10K 个数, DeepSeek-V3.2 用 FP8 存这部分. 没有这一步压缩, 1M 上下文在 8 卡上连一条序列都放不下.

放回混元自己的历史看, KV 缓存一直是每代都要处理的问题. Hunyuan-Large 用 GQA 加 CLA, 按头维 80 估每 token 约 80KB; A13B 是 32 层 GQA-8, 头维 128, 约 128KB; Hy3 是 80 层 GQA-8, 约 320KB, 层数加深后 KV 涨得最多; Hy4 preview 约 88KB. Hy3 到 Hy4 这一步, 上下文翻了 4 倍, 每 token 的 KV 却降到约 27%. Large 的 CLA 让每 2 层共用一份 KV, 是在层的方向上压缓存; Hy4 的 IndexCache 让多层共用一套 top-$k$ 下标, 是在层的方向上压 indexer 计算. 两者都用了「相邻层的注意力相似」这个前提.

### 3.2. DSA: 先挑 2048 个位置再算注意力

DSA 来自 DeepSeek-V3.2 (arXiv 2512.02556). 每层多一个 lightning indexer, 给每个查询 $t$ 和它之前的每个位置 $s$ 打一个分:

$$I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\,\mathrm{ReLU}\big(\mathbf q^I_{t,j}\cdot\mathbf k^I_s\big) \tag{4}$$

查询侧 $H^I$ 个头, 键侧只有一个共享的 $\mathbf k^I_s$, 不做 softmax, 只输出标量. 取分数最高的 top-$k$ 个位置, 主注意力只在这些位置的潜向量上照常算 softmax ([DeepSeek-V3.2 篇](../../01-deepseek/deepseek-v3-2/deepseek-v3-2-analysis.md)). 主注意力从每层 $O(L^2)$ 降到 $O(Lk)$, indexer 本身仍是 $O(L^2)$, 只是单位代价小得多.

到 1M 上下文, indexer 反而成了大头. 按 Hy4 的配置, indexer 每对 $(t,s)$ 是 $32\times128=4096$ 次乘加, 一个查询扫 1M 个位置约 43 亿次. 主注意力只看 2048 个位置; 若 QK 维取 576, V 维取 512 (DeepSeek MLA 吸收后的形状), 64 个头约 $2048\times64\times1088\approx1.43$ 亿次. indexer 约为主注意力的 30 倍, 用 FP8 算也还有约 15 倍. 每个查询只看 $2048/2^{20}\approx0.2\%$ 的位置, 省下来的主注意力很可观, 代价都转到了 indexer 上.

DSA 怎么训出来, DeepSeek-V3.2 给了一套两阶段做法. 第一阶段保持稠密注意力, 冻结除 indexer 外的全部参数, 把所有头的注意力分数相加归一化当目标分布, 用 KL 散度让 indexer 去模仿, 1000 步, 合计 2.1B token. 第二阶段打开 top-k 选择, 解冻全部参数, KL 只在选中的 2048 个位置上算, indexer 的输入从计算图上 detach, 主模型只吃语言建模 loss, 15000 步, 943.7B token. V3.2 是从已训好的 V3.1-Terminus 接着改, Hy4 preview 是从头就用 DSA, 还是在稠密模型上转过来, 模型卡没写.

GLM-5 在这套结构上做 RL 时踩过一个坑, 对后训练规模大幅增加的 Hy4 也适用. MoE 可以用 routing replay 记下训练和推理选中的专家, indexer 每个位置选 2048 个, 存下标代价太高. GLM-5 的结论是换成确定性的 torch.topk, 稍慢, 但训练和推理选出的位置一致; 用非确定性实现时, RL 跑几步性能就急剧下降, 熵骤降. RL 期间 indexer 参数默认冻结 ([GLM-5 篇](../../13-glm/glm-5/glm-5-analysis.md)).

### 3.3. IndexCache: 多层共用一套索引

IndexCache (arXiv 2603.12201) 的作者是 Z.ai 和清华的 GLM 团队, 这是「受 GLM 启发」最直接的对应. 论文的观察是相邻层 indexer 选出的 top-$k$ 有 70% 到 100% 重合. 做法是把层分成 F 层和 S 层: F 层保留自己的 indexer, S 层直接继承最近一个 F 层的索引, 推理时只多一个条件分支, 不增加显存.

怎么决定哪些层保留, 论文给了两种. 不改权重的做法用贪心搜索, 在校准集上每次把一个 F 层翻成 S 层, 挑语言模型 loss 涨得最少的那个; 论文指出均匀间隔 (每 4 层留 1 层) 会掉点, 因为前部和过渡区的层对去掉 indexer 更敏感. 改权重的做法加一个多层蒸馏 loss, 让每个保留的 indexer 去拟合它服务的所有层的平均注意力分布, 这样均匀间隔也能追平原始 DSA. 实验模型是从 GLM-4.7-Flash (30B-A3B, 47 层 MLA) 改出来的 DSA 版, 在 200K 长度的 SFT 数据上先稠密预热 1000 步, 再稀疏训练 4000 步. 在这个模型上只留 1/4 的 indexer, 200K 上下文下 prefill 最多快 1.82 倍, decode 快 1.48 倍. 在 744B 的 GLM-5 上做的初步实验, 图 1 写去掉一半 indexer 端到端约 1.2 倍, 正文写至少 1.3 倍. GLM-5.2 的 IndexShare 在 78 层里只给 21 层留 indexer ([GLM-5.3-Flash 篇](../../13-glm/glm-5-3-flash/glm-5-3-flash-analysis.md)). Hy4 preview 留了几层, 用哪种方式定, 模型卡没写.

同一问题还有别的解法. Qwen 的 QSA 不减 indexer 层数, 改成在层内把 indexer 要扫的序列变短, 理由是混合架构里全局层之间隔着几层线性注意力, 跨层共享的前提变弱 ([QSA](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md)). Hy4 preview 是 78 层全注意力的纯 Transformer, 相邻层相似的前提更容易成立, 选跨层复用是顺理成章的.

### 3.4. 长上下文的两条路与名字里的「Gated」

拉长上下文, 混元两条路都走过. TurboS 走的是线性递推: 128 个子层里 57 层 Mamba2, 只有 7 层注意力, 状态大小固定, 不随序列变长, 上下文做到 256K. Hy4 preview 回到全注意力的纯 Transformer, 每层仍是 softmax 注意力, 靠潜向量压缩和 top-$k$ 稀疏选择控制代价, 上下文做到 1M. 同期的开源旗舰也分成这两派: Kimi K3 每 4 层用 3 层 KDA 线性注意力加 1 层 Gated MLA ([Kimi K3 篇](../../02-kimi/kimi-k3/kimi-k3-analysis.md)), Qwen 用 GDN 混合架构加 QSA; DeepSeek-V3.2 和 GLM-5 则是全层 DSA. Hy4 preview 站在后一派, 和它自述的「受 DeepSeek 和 GLM 启发」一致. 全注意力的好处是每层都能精确取回任意位置, 代价是 indexer 的 $O(L^2)$, 这也是它必须配 IndexCache 的原因.

两条路之外, 注意力名字里的 Gated 也要交代一下. 它只出现在名字里, 模型卡没写门控加在哪里. 近一年开源模型里常见的注意力门控是在注意力输出后接一个按头的 sigmoid 门 (Gated Attention, arXiv 2505.06708), Qwen 的混合架构和 Step 3.5 Flash 都用了按头门控. Hy4 preview 是不是这一种, 页面没有给出可以判断的信息, 这里只记名字.

### 3.5. 残差: 4 条流的 iHC

规格表的「Residual Streams 4」对应正文的 iHC (identity Hyper-Connections), 链接是一篇知乎专栏, 不是论文, 模型卡也没有复述做法. 能借来理解的是 Hyper-Connections 这一族. HC (arXiv 2409.19606) 把残差从一条 $C$ 维向量扩成 $n$ 条, 每层用三个小矩阵做读, 写和流间混合, 子层本身只算一次. DeepSeek 的 mHC (arXiv 2512.24880) 发现 HC 在 27B MoE 上不稳: 混合矩阵沿深度连乘, 复合增益峰值约 3000, 出现 loss 突刺. mHC 用 Sinkhorn-Knopp 把混合矩阵投到双随机矩阵上, $n=4$ 时复合增益降到约 1.6, 额外训练时间 6.7% ([Hyper-Connections 与 mHC](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)).

这组讨论的核心是「恒等通路」能不能保住: 浅层信号不经可学矩阵直达深层, 反向梯度里始终有一项单位阵. iHC 的名字强调 identity, 方向与此一致; 具体是把混合矩阵固定为单位阵, 还是另加约束, 页面没说. 4 条流的代价是残差读写量按流数放大, mHC 在 $n=4$ 时每层读约 $21C$, 写约 $13C$, 标准残差是 $2C$ 和 $C$. Hy4 preview 选 4 和 mHC 的设置相同.

## 4. 评测

### 4.1. 对 Hy3: 46 行全部上升

评测表分五类: 智能体编程 16 行, 智能体搜索 5 行, 办公智能体 15 行, 理工科智能体 2 行, 推理 8 行, 共 46 行, 其中 9 行是腾讯内部评测集. 第 6 页的柱状图是全文唯一的数据图, 挑了其中 12 项, 数字与大表一致. Hy4 preview 每一行都高于 Hy3, 有判断价值的几行:

| 评测 | Hy3 | Hy4 preview | 开放权重对手最高 | 全表最高 |
|---|---|---|---|---|
| DeepSWE | 28.0 | 64.3 | 74.0 (Kimi K3 自测) | 74.7 (Opus 5) |
| SWE Atlas 代码库问答 | 30.8 | 64.0 | 55.8 (GLM 5.3) | 64.0 (Hy4) |
| Terminal-Bench 2.1 | 70.8 | 85.4 | 88.3 (GLM 5.3 / K3) | 88.8 (GPT 5.6 Sol) |
| SWE-Marathon | 5.0 | 31.9 | 44.4 (K3 自测) | 50.0 (Opus 5) |
| ProgramBench | 3.0 | 17.5 | 24.5 (K3) | 39.5 (Opus 5) |
| GDPval-AA V2 (Elo) | 1213 | 1678 | 1763 (GLM 5.3) | 1831 (Opus 5) |
| MathArena Apex 2025 | 38.7 | 74.2 | 72.8 (Qwen 3.8 Max) | 91.4 (Opus 5) |
| HLE 无工具 | 34.4 | 43.4 | 46.9 (K3) | 54.9 (Opus 5) |

涨得最多的是 DeepSWE (+36.3), MathArena Apex (+35.5) 和代码库问答 (+33.2), 最少的是 Hy-BrowseComp-Pro2 (+1.1) 和 GPQA Diamond (+1.4). 长程编程上涨幅大但起点低: SWE-Marathon 从 5.0 到 31.9, ProgramBench 从 3.0 到 17.5, 两项仍明显落后开放权重对手. 模型卡称这是「测过的最大一次代际提升」, 能找到的依据就是这两列, 和哪几代比没说.

把 Hy3 preview 也算进来, 能看出后训练放大在哪类任务上最见效. Hy3 preview 到 Hy3 之间只加大了后训练和 RL, DeepSWE 从 0.9 到 28.0, SkillsBench 从 29.1 到 55.3, MathArena Apex 从 12.6 到 38.7 (Hy3 模型卡); Hy4 preview 再把这三项推到 64.3, 62.9 和 74.2. 涨幅最大的始终是长程智能体编程和竞赛数学, 而 GPQA Diamond 这类知识问答三代都在 87 到 92 之间, 早已接近饱和.

### 4.2. 对开放权重对手

逐行比四个开放权重对手 (一格两个数时取较高的那个), Hy4 preview 在 14 行上高于它们全部, 其中 2 行是内部评测集 (E-Bench 和 E-Bench-Code); 只按带星号的自测值比是 17 行. 单独比, 在 GLM 5.3 有分数的 42 行里 Hy4 高 20 行, 在 Kimi K3 有分数的 45 行里高 23 行, 都是一半上下. 领先的行集中在 SWE Atlas 三项, 搜索 (WideSearch, OneMillionBench), 办公 (JobBench, BankerToolBench) 和数学 (MathArena Apex, HorizonMath); 落后的集中在长程编程和 Elo 制的知识工作.

拿规模换算一下: Hy4 激活 49B, K3 激活 104B, 两者在开放权重对手里互有胜负, 每 token 计算差约 2.1 倍. 算上 GPT 5.6 Sol 和 Claude Opus 5, Hy4 严格第一的只有 SWE Atlas 代码库问答 (64.0 对 58.1). 最接近的两行是 PostTrainBench (35.6 对 GPT 5.6 Sol 的 36.2) 和 WideSearch (83.9 对 GPT 5.6 Sol 的 86.3).

### 4.3. 表格注释与 Hy3 列的出入

表下注释说明了几条口径. 每个模型都在最高可用推理档位上评, 带星号的是腾讯自测; 标 official 的 GDPval-AA V2 和 CritPt 两行取官方分. 一格两个数时, 斜杠后带星号的是自测, 斜杠前应是外部公布值, 这是按注释推出来的读法. 推理类 8 项里有 5 项 Claude Opus 5 用 high 档, 其他模型用 max, 和「最高可用档位」的口径不同, 这 5 项里 Opus 5 的分数偏保守.

评测框架也逐项写了. Terminal-Bench 2.1 用 Claude Code 框架, 最多 500 轮, 每次 12 小时上限, 16 核 32GB; SWE-Marathon 把智能体超时设成官方值的两倍. ProgramBench 的注释写「DeepSeek-V4-Pro-0803」, 表头和图例都是 0813, 页面没解释. 自测值和公布值差得最大的一格是 Terminal-Bench 2.1 上的 DeepSeek V4 Pro 0813, 87.9 对 80.3, 柱状图取的是 80.3.

同一格框架影响有多大, Kimi K3 可以作参照. K3 技术报告取多个框架里的最高分, 是 88.3; 腾讯用 Claude Code 框架自测是 85.7; 阶跃的 Step 5 Preview 发布页里 K3 这一格是 85.0. 同一个模型在三份材料里差了 3.3 分, 比 Hy4 preview 和 K3 自测值之间的 0.3 分大得多. 所以 Hy4 的 85.4 应和各家的自测值比, 不宜和 K3 自报的 88.3 比.

Hy3 这一列也要单独核对. 注释里有一句「部分 Hy3 分数可能和之前公布的不同」. 对照 Hy3 自己的模型卡: SWE-bench Pro 57.9, DeepSWE 28.0, MathArena Apex 38.7, SWE-bench Multilingual 75.8, NL2Repo 45.6 两边一致; Terminal-Bench 2.1 从 71.7 变成 70.8, GPQA Diamond 从 90.4 变成 90.9, HLE 无工具从 37.0 变成 34.4, 带工具从 53.2 变成 51.9, WideSearch 从 76.4 变成 81.9, MCP-Atlas 从 79.1 变成 75.0. 有升有降, 应是重测或换了评测版本. 读涨幅时用 Hy4 卡里这一列, 不要拿 Hy3 卡的数去减.

### 4.4. 内部专家数据与盲评

训练数据的一部分是和腾讯内部专家一起做的: 软件工程师, 游戏开发者, 金融分析师和安全专家, 围绕他们实际交付的工作构建数据; 数据量多大, 用在预训练还是后训练, 模型卡没写. 列出的场景有四类. 软件工程是长周期开发任务的理解, 规划, 调试和验证, 外加前端的视觉和交互质量; 办公与分析是把散在多个文件里的上下文整理成文档, 表格和演示文稿, 处理公式和财务模型; 游戏开发是一条提示做出可玩原型, 再配合游戏引擎多轮修改; 科学研究点了 AI 研究, 分子动力学, 凝聚态物理和纯数学. 安全专家在合作名单里, 场景里却没有安全一类. 大表里和安全最接近的是 CyberGym, Hy4 preview 78.4, 比 Hy3 的 51.8 高, 但低于另外五个有分数的对手; 游戏开发在大表里没有对应的行.

模型卡说 Hy4 preview 和 CodeBuddy, WorkBuddy 等腾讯产品一起设计, 并做了一次盲评: 163 位内部专家, 203 个工程任务. 对 GLM 5.3 平均分 2.99 比 2.92, 胜 46.8%, 平 12.8%, 负 40.4%; 对 Kimi K3 2.99 比 2.94, 胜 51.2%, 平 7.9%, 负 40.9%. 页面没写满分; Hy3 模型卡的同类盲评写的是满分 4 (Hy3 2.67, GLM-5.1 2.51), 若沿用 4 分制, 0.07 分的差距约为量程的 1.75%. 模型卡自己的措辞是「略占上风」, 两场的负率都在 40% 以上.

胜负差能否站住, 可以粗算. 设胜率 $w$, 负率 $l$, 每个任务算一次对比, 胜负差的标准误是

$$\mathrm{SE}(w-l)=\sqrt{\frac{(w+l)-(w-l)^2}{n}} \tag{5}$$

$n=203$ 时, 对 GLM 5.3 的胜负差 6.4 个百分点, 标准误约 6.5 个百分点, 差距约一个标准误; 对 Kimi K3 的 10.3 个百分点, 标准误约 6.7, 约 1.5 个标准误. 两场都不足以说明稳定领先. 这里把 203 个任务当独立样本; 若 163 位专家对同一任务各评一次, 有效样本更大, 但页面没说评分怎么分配.

GDPval-AA V2 是 Elo 分, 也可以换成胜率. 按 Elo 的定义, 分差 $\Delta$ 对应的期望胜率是 $1/(1+10^{-\Delta/400})$. Hy4 preview 比 Hy3 高 465 分, 对 Hy3 的期望胜率约 94%; 比 GLM 5.3 低 85 分, 期望胜率约 38%; 比 Claude Opus 5 低 153 分, 约 29%.

## 5. 接入与结论

### 5.1. 推理档位, 已知局限与接入

推荐 temperature 0.9, `top_p=1.0`; 推理档位默认 high, 想直接回答就在 `extra_body` 里传 `reasoning_effort` 为 `no_think`. Hy3 的默认档是 `no_think`, 到 Hy4 preview 改成默认开推理, 默认就多花 TestingTime 算力. 混元在推理档位上一直在改: A13B 把 fast-thinking 和 slow-thinking 做进同一个模型, 分两张表评测; TurboS 在后训练里做自适应长短 CoT 融合, 让模型按题目难度决定想多久; Hy3 用 `reasoning_effort` 分档, 默认直接回答; Hy4 preview 默认 high. 已知问题第一条正好是复杂任务上推理时间比必要的长, 第二条是爱反复验证自己的工作, 都没给数字. 两条和默认 high 放在一起看, 部署时对延迟敏感的场景值得先试低档位.

模型卡把这次定位成早期版本, 预训练和后训练都还有空间, 并拿 Hy3 当先例: 先发 preview, 收集反馈, 再出明显更好的正式版. 开源的是 instruct 和 FP8 instruct 两版, Apache 2.0 许可, 在 Hugging Face, ModelScope, GitCode, CNB 四个平台, 没有基座模型. 以上数字只属于 Hy4 preview, 正式版什么时候发, 分数会不会变, 页面没说.

### 5.2. 结论

Hy4 preview 把混元旗舰拉到 770B / 49B, 结构上从 Hy3 的 GQA 单流残差换成 MLA 式压缩加 DSA 稀疏选择, IndexCache 跨层复用索引, 4 条流的 iHC 残差, 主要维度与 GLM-5 几乎一致. 按式 (3), 这套注意力让 1M 上下文的 KV 缓存降到 Hy3 同长度的约四分之一; 按 3.2 的估算, 1M 下 indexer 成为注意力里的大头, IndexCache 正是冲着这一项去的.

评测上, 它对 Hy3 每行都涨, 对四个开放权重对手约一半的行领先, 长程编程和 Elo 制知识工作仍落后. 门控形式, iHC 做法, 保留 indexer 的层数和训练数据都没有公开, 要等技术报告.

## 参考文献

- Tencent Hy Team. Hy4 preview. https://huggingface.co/tencent/Hy4-preview (2026).
- Tencent Hy Team. Hy3. https://huggingface.co/tencent/Hy3 (2026).
- Tencent Hunyuan Team. Hunyuan-Large: An Open-Source MoE Model with 52 Billion Activated Parameters by Tencent. arXiv:2411.02265 (2024).
- Tencent Hunyuan Team. Hunyuan-TurboS: Advancing Large Language Models through Mamba-Transformer Synergy and Adaptive Chain-of-Thought. arXiv:2505.15431 (2025).
- Tencent Hunyuan Team. Hunyuan-A13B Technical Report (2025).
- DeepSeek-AI. DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models. arXiv:2512.02556 (2025).
- Bai, Y. et al. IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse. arXiv:2603.12201 (2026).
- Zhu, D. et al. Hyper-Connections. arXiv:2409.19606 (2024).
- Xie, Z. et al. mHC: Manifold-Constrained Hyper-Connections. arXiv:2512.24880 (2025).
- Qiu, Z. et al. Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free. arXiv:2505.06708 (2025).
- GLM-5 Team. GLM-5: from Vibe Coding to Agentic Engineering (2026).
