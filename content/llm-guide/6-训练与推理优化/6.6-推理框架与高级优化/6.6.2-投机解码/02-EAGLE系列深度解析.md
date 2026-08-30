# EAGLE系列深度解析：从特征级自回归到动态草稿树

> 来源: 知乎专栏 (https://zhuanlan.zhihu.com/p/1955546570167661109)
> 标签: #EAGLE #投机解码 #SpeculativeDecoding #特征级自回归 #草稿树

## 1. EAGLE-1：特征级自回归的奠基

### 1.1 核心洞察

传统投机采样(Medusa、Lookahead)在Token层面进行草稿预测. EAGLE-1的核心创新是将预测目标从"下一个Token"转向"下一个特征"——具体而言, 是目标模型倒数第二层(second-to-top-layer)的隐藏状态. 

**为什么特征比Token更易预测？**

Token分布具有高度离散性和随机性(尤其是温度T>0时), 而特征(隐藏状态)位于高维连续空间, 其时间演化具有更强的确定性和平滑性. EAGLE-1的实验证明, 在Vicuna 33B和LLaMA2-Chat 70B上, 特征级预测的加速比达到2.7x-3.5x, 显著优于Medusa的1.64x和Lookahead的1.94x. 

### 1.2 特征不确定性问题

特征级预测面临一个根本挑战：目标模型的采样随机性导致特征序列分叉. 

假设当前特征为f_i, 目标模型采样得到$token_t$_{i+1}后, 下一个特征f_{i+1}依赖于t_{i+1}. 如果草稿模型仅基于f_i预测f_{i+1}, 它无法预知会采样到哪个t_{i+1}, 从而引入不确定性. 

**解决方案：Feature & Shifted-Token机制**

草稿模型的输入为前一时刻特征f_i和当前时刻已采样的$token_t$_{i+1}：

$$
f_{i+1} = \text{Draft\_Model}(f_i, t_{i+1})
$$

这消除了不确定性——草稿模型明确知道哪个Token被采样, 从而精确预测对应的后续特征. 

### 1.3 训练目标

EAGLE-1采用双损失联合优化：

$$
\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{reg}} + \mathcal{L}_{\text{cls}}
$$

- **回归损失**：Smooth L1损失约束特征预测精度
  $$
\mathcal{L}_{\text{reg}} = \text{SmoothL1}(f_{i+1}, \hat{f}_{i+1})
$$
- **分类损失**：交叉熵损失约束最终Token分布
  $$
\mathcal{L}_{\text{cls}} = \text{CrossEntropy}(P_{i+2}, \hat{P}_{i+2})
$$

消融实验验证：Feature&Shifted-token机制(2.8x)> 纯Feature(1.9x)> 纯Token(1.5x). 

## 2. EAGLE-2：动态草稿树与上下文感知

### 2.1 静态草稿树的局限

EAGLE-1采用固定树形结构的草稿树进行批量验证. 但EAGLE-2的关键观察是：**Token接受率是上下文相关的, 而非仅位置相关**. 

实验数据显示, 同一位置P1-P6的Token接受率在不同查询间波动很大. 静态树结构会造成资源浪费——为低接受率位置分配的计算预算被无效消耗. 

### 2.2 置信度分数与接受率的关联

EAGLE-2发现草稿模型的置信度分数与实际接受率高度正相关. 这意味着可以用低成本的置信度分数近似接受率, 从而动态调整草稿树结构. 

### 2.3 动态草稿树机制

**扩展阶段(Expansion Phase)**：
选择当前层中全局接受率最高(通过置信度分数近似)的Top-k节点进行扩展, 而非固定扩展所有节点. 

**重排序阶段(Reranking Phase)**：
从所有候选节点选择全局最优的Token序列, 而非仅局部最优. 

### 2.4 性能提升

| 模型 | 方法 | Speedup (T=0) | 平均接受长度τ (T=0) | Speedup (T=1) | τ (T=1) |
|------|------|--------------|-------------------|--------------|---------|
| Vicuna 13B | EAGLE | 3.07x | 3.98 | 2.32x | 3.20 |
| Vicuna 13B | EAGLE-2 | 4.26x | 4.83 | 3.80x | 4.40 |
| LLaMA2-Chat 70B | EAGLE | 3.01x | 3.81 | 2.68x | 3.45 |
| LLaMA2-Chat 70B | EAGLE-2 | 3.51x | 4.48 | 3.92x | 4.51 |

EAGLE-2在T=1(高随机性)时提升尤为显著：LLaMA2-Chat 70B从2.68x提升至3.92x, 证明动态树结构对温度敏感场景的关键价值. 

## 3. EAGLE-3：训练时测试与数据扩展瓶颈突破

### 3.1 数据扩展瓶颈

EAGLE-1/2的草稿模型训练存在"数据扩展瓶颈"：随着训练数据增加, 草稿模型的接受率提升趋缓. 根本原因在于草稿模型始终作为"静态预测器"训练, 未充分利用验证阶段的反馈信号. 

### 3.2 训练时测试(Test-Time Training)

EAGLE-3引入训练时测试机制：在草稿模型训练过程中, 模拟目标模型的验证行为, 将验证反馈(哪些Token被接受/拒绝)纳入训练目标. 

具体实现：
1. 草稿模型生成候选Token序列
2. 模拟目标模型的验证过程(使用教师模型的分布)
3. 计算接受率损失, 反向传播优化草稿模型

这使得草稿模型直接优化"被目标模型接受的概率", 而非间接优化特征/Token预测精度. 

> 2026-08：上一小节把名字写反了，也把损失写偏了。论文术语是 **training-time test**（训练时做测试步），不是 Test-Time Training。正文并不把「接受/拒绝」当主损失；主损失是去掉 $l_{\mathrm{fea}}$ 之后的 **token 预测**，再在训练图里把草稿输出 $a$ 喂回下一步。直接优化 $\sum_x\min(p,q)$ 的是 Kimi K3 微调 MTP 时的 $\mathcal{L}_{\mathrm{LK}}$，不要倒灌进 2503.01840。展开见文末修订与 [6.6.2](./6.6.2-投机解码.md)。 

### 3.3 性能突破

SGLang官方基准(1x H100)：

| 方法 | 吞吐量 (tokens/s) |
|------|-----------------|
| SGLang (无投机解码) | 158.34 |
| SGLang + EAGLE-2 | 244.10 |
| SGLang + EAGLE-3 | 373.25 |

EAGLE-3相比基线提升2.36x, 相比EAGLE-2提升53%. 

## 4. 三种投机解码范式对比

| 维度 | Medusa | Lookahead | EAGLE系列 |
|------|--------|-----------|----------|
| 预测层级 | Token | Token | 特征+Token |
| 草稿结构 | 静态树 | 窗口 | 动态树(EAGLE-2+) |
| 训练目标 | 分类 | 分类 | 回归+分类+接受率(EAGLE-3) |
| 温度敏感性 | 高(T>1时退化) | 中 | 低(EAGLE-2/3显著改善) |
| 与模型耦合 | 需修改目标模型 | 无需修改 | 无需修改目标模型 |
| 典型加速比 | 1.5-2.0x | 1.5-2.5x | 2.5-4.0x(EAGLE-3) |

## 5. 部署要点与失效模式

### 5.1 部署配置建议

| 场景 | 推荐配置 | 预期加速 |
|------|---------|---------|
| 高并发API (T=0) | EAGLE-2, 树宽4-8 | 3.0-3.5x |
| 创意生成 (T=0.7-1.0) | EAGLE-3, 树宽8-16 | 2.5-3.5x |
| 长文档摘要 | EAGLE-2/3, 配合StreamingLLM | 3.0-4.0x |
| 边缘设备 (显存<16GB) | EAGLE-1, 小型草稿模型 | 1.5-2.0x |

### 5.2 失效模式

| 场景 | 症状 | 根因 | 缓解 |
|------|------|------|------|
| 极短序列 (<50 tokens) | 加速比<1.2x | 草稿生成开销占比过高 | 框架自动回退无投机解码 |
| 高多样性生成 (T>1.2) | EAGLE-1加速比<1.5x | Token随机性导致特征分叉严重 | 升级至EAGLE-3 |
| 代码生成 (确定性输出) | 接受率波动大 | 草稿模型对代码模式学习不足 | 代码专用微调草稿模型 |
| 多轮对话上下文切换 | 首token延迟增加 | 草稿树需重新构建 | 缓存历史草稿树结构 |

## 6. 参考文献

1. Li, X., et al. (2024). EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty. arXiv:2401.15077.
2. Li, X., et al. (2024). EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees. arXiv:2406.16858.
3. Li, X., et al. (2025). EAGLE-3: Scaling up Inference of Language Models via Training-Time Test. arXiv:2503.01840.
4. SGLang Documentation. EAGLE Decoding. https://docs.sglang.ai/advanced_features/speculative_decoding.html

---

## 7. 2026-08 修订（不删上文知乎转写）

上文是 2025 知乎专栏转写。EAGLE-1/2 的「特征+shifted token、动态树、置信度近似接受率」方向与 [2401.15077](https://arxiv.org/abs/2401.15077) / [2406.16858](https://arxiv.org/abs/2406.16858) 一致，Vicuna 13B / LLaMA2-Chat 70B 那张 speedup 表未在本会话逐格对原文，**不当成本库已核数字**。EAGLE-3 按 [2503.01840](https://ar5iv.labs.arxiv.org/html/2503.01840) 改三处：

1. **不是 Test-Time Training，也不是把验证 accept/reject 写进主损失。** Training-time test = 训练时把草稿自己的 $a$ 当作下一步输入，适应推理时「目标还没算出 $g$」。特征预测约束拿掉之后，才把低/中/高三层拼成 $g$。草稿是一层 decoder。动态树仍是 EAGLE-2 的，树深 6→8。
2. **§3.3 的 SGLang tok/s 表（158.34 / 244.10 / 373.25）未在论文正文找到对应表**，不升格。论文只写：相对 EAGLE-2 约 1.4× 延迟（bs=1）；SGLang **batch 64 吞吐约 1.38×**；加速比最高约 6.5×。§4 表把 EAGLE 系列训练目标写成「回归+分类+接受率」也不对：EAGLE-3 丢掉回归项。
3. **K3 / V4。** K3：预训练 MTP 微调成 EAGLE-3 风格 draft，融合 AttnRes 块 1/4/末，损失 $\mathcal{L}_{\mathrm{LK}}$，见 [2.4.6](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md)。V4 MTP 与 V3 相同，不是这条微调。自绘图在 [6.6.2](./6.6.2-投机解码.md)。
