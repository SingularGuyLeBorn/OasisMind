身不能稳定 GLM-130B。幸运的是,用新提出的 DeepNorm (Wang et al., 2022b) 初始化的一次 Post-LN 尝试产生了有前景的训练稳定性。具体而言,给定 GLM-130B 的层数 $N$,我们采用 $\text{DeepNorm}(x) = \text{LayerNorm}(\alpha \cdot x + \text{Network}(x))$,其中 $\alpha = (2N)^{\frac{1}{2}}$,并对 ffn、v_proj 和 out_proj 应用缩放因子为 $(2N)^{-\frac{1}{2}}$ 的 Xavier 正态初始化。此外,所有偏置项初始化为零。

> 译者注(工程细节): DeepNorm 是本文的一个关键技术点。1) 在 100B+ 模型训练中,Pre-LN 因其训练稳定性而被广泛采用(如 GPT-3、OPT),但 Post-LN 通常有更好的下游性能;2) DeepNorm 是一种" Post-LN 变体",通过特殊的初始化缩放($\alpha = \sqrt{2N}$)和 Xavier 缩放因子($1/\sqrt{2N}$)来抑制梯度爆炸,从而使 Post-LN 也能稳定训练;3) 对于 GLM-130B (N=70 层),$\alpha = \sqrt{140} \approx 11.8$,这意味着残差连接的权重被显著放大,有助于梯度流动;4) 这一选择后来被多个后续模型验证: 尽管 Pre-LN 在训练稳定性上更可靠,但 Post-LN/DeepNorm 在最终性能上的优势使其成为大模型的主流选择(如 LLaMA-2/3 也采用了类似的策略)。

**Positional Encoding and FFNs.** We empirically test different options for positional encoding (PE) and FFN improvements in terms of both training stability and downstream performance. For PEs in GLM-130B, we adopt Rotary Positional Encoding (RoPE, Su et al. (2021)) rather than ALiBi (Press et al., 2021). To improve FFNs in Transformer, we pick GLU with the GeLU (Hendrycks & Gimpel, 2016) activation as the replacement.

**位置编码和 FFN。** 我们在训练稳定性和下游性能方面经验性地测试了位置编码(PE)和 FFN 改进的不同选项。对于 GLM-130B 中的 PE,我们采用旋转位置编码(RoPE, Su et al. (2021)) 而非 ALiBi (Press et al., 2021)。为改进 Transformer 中的 FFN,我们选择使用 GeLU (Hendrycks & Gimpel, 2016) 激活的 GLU 作为替代。

> 译者注(技术谱系): RoPE + GLU-GeLU 的组合在 2022 年是一个前沿选择。1) RoPE 通过旋转矩阵编码位置信息,相比绝对位置编码具有更好的外推性(extrapolation),这对于长文本任务至关重要;2) GLU (Gated Linear Unit) 变体在后续成为大模型的标配: PaLM 使用 SwiGLU,LLaMA 使用 SwiGLU,而 GLM-130B 使用的是早期的 GLU-GeLU;3) 论文附录中对 PE 和 FFN 选择做了详细的消融实验,这是当时少有的对 100B+ 模型架构组件进行系统比较的公开工作。


### 2.2 GLM-130B'S PRE-TRAINING SETUP
#### GLM-130B 的预训练设置

Inspired by recent works (Aribandi et al., 2022; Wei et al., 2022a; Sanh et al., 2022), the GLM-130B pre-training objective includes not only the self-supervised GLM autoregressive blank infilling but also multi-task learning for a small portion of tokens. This is expected to help boost its downstream zero-shot performance.

受近期工作启发(Aribandi et al., 2022; Wei et al., 2022a; Sanh et al., 2022),GLM-130B 的预训练目标不仅包括自监督 GLM 自回归空白填充,还包括对一小部分 token 的多任务学习。这有望帮助提升其下游零样本性能。

**Self-Supervised Blank Infilling (95% tokens).** Recall that GLM-130B uses both [MASK] and [gMASK] for this task. Each training sequence is applied with one of them independently at a time. Specifically, [MASK] is used to mask consecutive spans in 30% of training sequences for blank infilling. The lengths of spans follow a Poisson distribution ($\lambda = 3$) and add up to 15% of the input. For the other 70% sequences, the prefix of each sequence is kept as context and [gMASK] is used to mask the rest of it. The masked length is sampled from the Uniform distribution.

**自监督空白填充(95% token)。**  recall GLM-130B 使用 [MASK] 和 [gMASK] 执行此任务。每个训练序列一次独立应用其中之一。具体而言,[MASK] 用于在 30% 的训练序列中掩码连续片段以进行空白填充。片段长度服从泊松分布($\lambda = 3$),加起来占输入的 15%。对于其余 70% 的序列,每个序列的前缀保留为上下文,[gMASK] 用于掩码其余部分。掩码长度从均匀分布中采样。

The pre-training data includes 1.2T Pile (train split) (Gao et al., 2020) English, 1.0T Chinese Wudao-Corpora (Yuan et al., 2021), and 250G Chinese corpora (including online forums, encyclopedia, and QA) we crawl from the web, which form a balanced composition of English and Chinese contents.

预训练数据包括 1.2T Pile (训练集)(Gao et al., 2020) 英语、1.0T 中文悟道语料库(Yuan et al., 2021)和我们从网络爬取的 250G 中文语料(包括在线论坛、百科和问答),形成了中英文内容的均衡组合。

**Multi-Task Instruction Pre-Training (MIP, 5% tokens).** T5 (Raffel et al., 2020) and ExT5 (Aribandi et al., 2022) suggest that multi-task learning in pre-training can be more helpful than fine-tuning, we thus propose to include a variety of instruction prompted datasets including language understanding, generation, and information extraction in GLM-130B's pre-training. Compared to recent works (Wei et al., 2022a; Sanh et al., 2022) that leverage multi-task prompted fine-tuning to improve zero-shot task transfer, MIP only accounts for 5% tokens and is set in the pre-training stage to prevent spoiling LLMs' other general ability, e.g., unconditional free generation.

**多任务指令预训练(MIP, 5% token)。** T5 (Raffel et al., 2020) 和 ExT5 (Aribandi et al., 2022) 表明,预训练中的多任务学习可能比微调更有帮助,因此我们提出在 GLM-130B 的预训练