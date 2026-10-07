---
title: "05 · Self-Rewarding: 自奖励"
published: true
tags: ["Self-Rewarding", "Iterative DPO", "LLM-as-a-Judge", "Llama 2", "AlpacaEval"]
excerpt: "Self-Rewarding 让同一个 LLM 既写回答, 又用 LLM-as-a-Judge 提示给自己的回答打 0 到 5 分, 用最高分对最低分构造偏好对, 迭代做 DPO. 三轮后写回答和打分两种能力都在上升."
---
# Self-Rewarding: 自奖励

Yuan, Pang, Cho 等的 *Self-Rewarding Language Models* ([arXiv:2401.10020](https://arxiv.org/abs/2401.10020), ICML 2024) 处理的问题是: 奖励模型训好后就冻结, 策略变强时打分器不会跟着变, 能否让同一个模型既写回答又给自己打分, 两种能力一起提高. 公式和表以 [arXiv HTML](https://arxiv.org/html/2401.10020) 为准, DPO 的推导见 [01-DPO](../../4.6.1-离线偏好优化/01-DPO/01-DPO.md).

## 冻结的打分器

### 难点

标准 RLHF 先在人工偏好上拟合奖励模型 $r_\phi$, 冻结后交给 PPO. RM 的质量受限于人工数据的规模和质量, 训练中策略不断变化, 打分器始终不变. DPO 去掉了独立 RM, 直接在人工偏好对上训练, 人工偏好仍是上限. 论文开篇把两件事并在一起: 要训练超过人类水平的 agent, 训练信号本身也需要能超过人, 冻结的 RM 做不到这一点.

论文的相关工作一节还指出, RLHF 的奖励信号在某种意义上本来就来自一个模型, 只是这个模型从人工数据蒸馏而来; 训练 LLM 当裁判的工作也已有 (如 Kim 等 2023), 但把打分训练和通用指令跟随放在同一个模型里一起做的还不常见. Self-Rewarding 要验证的正是后一种组合.

**思路**

论文的判断是把「写回答」和「打分」放进同一个模型. 预训练和多任务指令微调本来就让一套权重同时处理多种任务, 不同任务之间有迁移. 如果把打分也写成一条指令跟随任务, 两种能力就可能在迭代中互相促进.

Xu 等的 Iterative DPO 已经用过「每轮采新偏好对, 再做 DPO」的流程, 但打分器是外部冻结的 RM. Self-Rewarding 把 RM 换成模型自己的 LLM-as-a-Judge 能力.

种子数据只需要少量人写的指令数据和打分示范. 之后的偏好对都由模型自己构造, 新 prompt 不需要人写的参考回答. SPIN 的每条 prompt 都需要一条人写回答作为胜者, 这一点正好相反.

**算法**

**两份种子: IFT 和 EFT**

IFT (Instruction Fine-Tuning) 是人写的 (prompt, response) 对. 实验从 Open Assistant 中取英文对话的第一轮, 只保留人工排名最高 (rank 0) 的回答, 共 3,200 条. 只在 IFT 上做 SFT 得到的模型称为 SFT baseline.

EFT (Evaluation Fine-Tuning) 把打分写成指令跟随任务. 输入是论文 Figure 2 的 additive 五分提示, 分数逐项累加:

1. 回答相关, 提供了一些信息, 得 1 分.
2. 覆盖了问题的大部分, 但没有完整回答, 再加 1 分.
3. 以有用的方式回答了基本要素, 再加 1 分.
4. 以 AI 助手的视角直接, 全面, 有条理地回答, 再加 1 分.
5. 针对性强, 没有多余信息, 体现专家知识, 质量高, 再加 1 分.

模型先写不超过 100 词的理由, 再以 `Score: ` 格式给出分数 $r\in[0,5]$.

Open Assistant 中同一个 prompt 有多条带人工排名的回答, 但没有现成的评语和分数. 构造方法是: 用 SFT baseline 给每条回答生成评语和分数, 只有分数排序与人工排序一致时才收入训练集. 观察到大量样本得 4 分, 于是丢掉一部分最常见分数的样本以减轻偏斜. 最终得到 1,630 条训练样本和 541 条评估样本, 与 IFT 不重叠.

### 打分提示的影响

附录 A.2 在只用 IFT 训练的模型上比较了两种打分提示. Li 等 Instruction Backtranslation 用的是「从几个质量档位里选一个」的多选式提示; Self-Rewarding 的提示是逐项累加.

| 指标 | 多选式 | 累加式 |
|------|------:|------:|
| 成对准确率 | 26.6% | 65.1% |
| 5-best | 23.5% | 39.6% |
| Exact match | 1.1% | 10.1% |
| Spearman | -0.18 | 0.25 |
| Kendall $\tau$ | -0.16 | 0.23 |

多选式提示下, 两个相关系数都是负数, 打分和人工排序方向相反. 多选要求模型一次判断档位; 累加式把相关性, 覆盖度, 有用性拆开逐项判断. 主实验固定使用 Figure 2 的累加式提示.

**构造偏好对**

有了 $M_t$, 下一轮的训练数据分三步构造.

1. **生成新 prompt.** 主实验中这一步由固定的 Llama 2-Chat 70B 完成, 按 Self-Instruct 的方法用 8-shot 提示: 6 个示例取自 IFT, 2 个取自模型之前生成的指令; 解码 $T=0.6$, $p=0.9$; 再用 ROUGE-L 相似度, 关键词和长度过滤. 附录 A.5 检查了让 $M_1,M_2,M_3$ 自己生成指令的效果: 人工检查的 30 个例子中, 三个模型都能写出新指令; $M_2$ 和 $M_3$ 有时会先写几条指令, 然后输出分隔符并开始回答, 需要后处理.
2. **采样候选.** 对每条 $x_i$ 从 $M_t$ 采 $N=4$ 条回答 $\{y_i^1,\dots,y_i^4\}$, $T=0.7$, $p=0.9$.
3. **自我打分.** 同一个 $M_t$ 用 Figure 2 的提示给每条候选打分 $r_i^n\in[0,5]$. 分数有随机性, 用相同解码参数打 3 次取平均.

偏好对 $(x_i,y_i^w,y_i^l)$ 中, $y^w$ 是平均分最高的候选, $y^l$ 是最低的; 最高分和最低分相同时丢弃这条 prompt. 这是 Iterative DPO 的选对规则, 只是打分器换成了模型自己. 得到的数据称为 AIFT (AI Feedback Training). AIFT$(M_1)$ 共 3,964 对, 用于训练 $M_2$; AIFT$(M_2)$ 共 6,942 对, 用于训练 $M_3$.

手算一次. 四条候选三次打分的平均分分别是 4.3, 2.1, 4.3, 1.0. 最高 4.3, 最低 1.0, 取其中一条 4.3 作 $y^w$, 1.0 作 $y^l$. 若四条平均分都是 4.0, 这条 prompt 不产生偏好对. 打 3 次取平均让分数有了小数, 减少了并列的情况: 单次打分只有 0 到 5 共 6 个整数值, 四条候选全部相同的概率不低.

**为什么取两端**

四条候选能组成 6 个偏好对, 论文只取最高对最低这一对. 从打分噪声的角度可以理解这个选择. 设单次打分的标准差为 $s$, 三次平均后降到 $s/\sqrt3\approx0.58s$. 两条候选的平均分之差, 标准差约为 $\sqrt2\times0.58s\approx0.82s$. 若 $s=1$, 两条真实质量差 0.5 分的候选, 平均分之差的均值是 0.5, 标准差约 0.82, 排反的概率约为 $\Phi(-0.5/0.82)\approx27\%$; 真实差 2 分时, 排反概率降到约 $\Phi(-2.44)\approx0.7\%$. 最高和最低两条之间的分差通常最大, 方向出错的概率也最小. 这里的 $s=1$ 是演示用的假设值.

代价是每条 prompt 只用了 6 个可能偏好对中的 1 个, 中间两条候选的采样和打分没有直接进入训练.

**DPO 损失**

种子阶段在 IFT+EFT 上做 SFT, 之后每一轮在 AIFT 上做 DPO, $\beta=0.1$:

$$
\ell
=
-\log\sigma\Biggl(\beta\log\frac{\pi_\theta(y^w\mid x)\,\pi_{\mathrm{ref}}(y^l\mid x)}{\pi_{\mathrm{ref}}(y^w\mid x)\,\pi_\theta(y^l\mid x)}\Biggr).
\tag{1}
$$

每一轮从 $M_t$ 初始化, 参考模型也是 $M_t$, 在 AIFT$(M_t)$ 上训练. 损失没有改动, 这是 Iterative DPO 的框架.

设 $\beta=0.1$, $y^w$ 上 $\log\pi_\theta=-8$, $\log\pi_{\mathrm{ref}}=-10$; $y^l$ 上 $\log\pi_\theta=-11$, $\log\pi_{\mathrm{ref}}=-9$. 括号内是 $0.1\bigl((-8+10)-(-11+9)\bigr)=0.40$, 损失 $-\log\sigma(0.40)\approx0.51$. 若最高最低拿反, 括号内为 $-0.40$, 损失约 0.91, 梯度更大.

超参: SFT 学习率 $5.5\times10^{-6}$, 余弦衰减到 $1.1\times10^{-6}$; DPO 学习率 $1\times10^{-6}$ 衰减到 $1\times10^{-7}$; batch 16, dropout 0.1; 只在目标 token 上计算损失. 每 200 步存一次 checkpoint, 用 Claude 2 在 253 条验证 prompt 上做成对评估来早停.

模型序列:

- $M_0$: 预训练 Llama 2 70B, 未微调.
- $M_1$: 从 $M_0$ 起, 在 IFT+EFT 上 SFT.
- $M_2$: 从 $M_1$ 起, 在 AIFT$(M_1)$ 上 DPO.
- $M_3$: 从 $M_2$ 起, 在 AIFT$(M_2)$ 上 DPO.

整个流程没有 PPO, 没有独立 RM, 也没有价值函数.

![同一份模型先采样再当裁判, 再进 DPO 得到下一轮](./images/fig-srlm-iterative-loop.png)

> 图 1: 新 prompt $x_i$ 进入当前 $M_t$, 采 $N=4$ 条候选, 同一组权重按 LLM-as-a-Judge 打 0 到 5 分, 最高对最低组成 $(y^w,y^l)$, DPO ($\beta=0.1$) 更新得到 $M_{t+1}$.

**图 1 解析**

- 从左到右七个框, 一条单向实线. 奶油色框是新 prompt, 箭头标 $x$, 指向薄荷绿的 $M_t$ 生成框, 框内标 trainable.
- 冰蓝色框是四条候选, 连线标 sample.
- 淡紫框仍是 $M_t$, 标 same weights, 连线标 evaluate, 之后是分数 $r\in[0,5]$.
- 下一个冰蓝框是 max vs min 偏好对, 橙色框是 DPO, 最终的奶油色框是 $M_{t+1}$.
- 页脚写 same LLM generates and judges, Not a separate RM. 图中没有回环箭头, 下一轮把 $M_{t+1}$ 当作新的 $M_t$, 发生在两轮之间.

### 一轮迭代的实现

```python
def self_rewarding_iteration(M_t, prompts, judge_prompt, n=4, k=3):
    pairs = []
    for x in prompts:
        ys = [M_t.generate(x, temperature=0.7, top_p=0.9) for _ in range(n)]
        # 同一个 M_t 当裁判, 每条打 k 次取平均, 解析 "Score: " 后的数字
        scores = [mean(parse_score(M_t.generate(judge_prompt(x, y),
                                                temperature=0.7, top_p=0.9))
                       for _ in range(k)) for y in ys]
        if max(scores) == min(scores):
            continue
        pairs.append((x, ys[argmax(scores)], ys[argmin(scores)]))
    # 参考模型与初始化都是 M_t
    return dpo_train(init=M_t, ref=M_t, data=pairs, beta=0.1)
```

`parse_score` 解析失败的样本需要单独处理, 否则会被当成 0 分, 混进 $y^l$. 去掉 EFT 时有效偏好对大幅减少 (第 5.1 节), 打分质量直接决定每轮能用多少数据.

## 实验设置

### 模型与指令跟随评测

底座 Llama 2 70B. 新 prompt 由固定的 Llama 2-Chat 70B 生成; 写回答和打分都用正在训练的模型.

指令跟随用三类评测:

- 256 条 IFT 测试 prompt 上的头对头比较, 用 GPT-4 按 AlpacaEval 的提示判定, 两种顺序各判一次, 结论不一致记为平局. 作者还做了人评.
- AlpacaEval 2.0 榜单格式: 805 条 prompt, 计算对 GPT-4 Turbo 的胜率, 裁判是 GPT-4.
- MT-Bench: 多轮问题, GPT-4 打 0 到 10 分.

### NLP 基准与打分评测

指令跟随之外, 另外测了九个 NLP 基准: ARC-Easy, ARC-Challenge, HellaSwag, SIQA, PIQA, GSM8K, MMLU, OBQA, NQ.

打分能力在 EFT 评估集上与人工排序比较, 平均每条指令有 2.85 条带排名的回答. 五个指标: 成对准确率; 5-best (模型打 5 分的回答是否也是人工排名第一); exact match (完整排序是否一致); Spearman 和 Kendall $\tau$ 相关系数.

## 结果

### 头对头

先看种子: IFT+EFT 训练的 $M_1$ 对只用 IFT 的 SFT baseline, 胜率 30.5% 对 30.9%, 基本持平. 加入打分任务没有损害写回答的能力, 因此 $M_1$ 可以同时当生成器和裁判.

$M_2$ 对 $M_1$: 55.5% 胜, 11.7% 负; 对 SFT baseline: 49.2% 对 14.5%. $M_3$ 对 $M_2$: 47.7% 对 12.5%; 对 SFT baseline: 62.5% 对 9.8%. 两轮 AIFT 各带来一次明显提升.

人评: 从 IFT 测试集随机抽 50 条指令, 每条三组对比 (SFT baseline 分别对 $M_1,M_2,M_3$), 每组由三位作者盲评, 取多数票. Figure 5 显示迭代越往后, 对 SFT baseline 的优势越大, 方向与 GPT-4 判定一致.

**AlpacaEval 2.0 与生成长度 (Table 1)**

| 模型 | 对 GPT-4 Turbo 胜率 | 蒸馏 | 专有数据 |
|------|------:|:---:|:---:|
| Self-Rewarding $M_1$ | 9.94% | | |
| Self-Rewarding $M_2$ | 15.38% | | |
| Self-Rewarding $M_3$ | 20.44% | | |
| GPT-4 0314 | 22.07% | | ✓ |
| Mistral Medium | 21.86% | | ✓ |
| Claude 2 | 17.19% | | ✓ |
| Gemini Pro | 16.85% | | ✓ |
| GPT-4 0613 | 15.76% | | ✓ |
| GPT 3.5 Turbo 0613 | 14.13% | | ✓ |
| LLaMA2 Chat 70B | 13.87% | | ✓ |
| Vicuna 33B v1.3 | 12.71% | ✓ | |
| Humpback LLaMa2 70B | 10.12% | | |
| Guanaco 65B | 6.86% | | |
| Davinci001 | 2.76% | | ✓ |
| Alpaca 7B | 2.59% | ✓ | |

$M_3$ 的 20.44% 高于 Claude 2, Gemini Pro 和 GPT-4 0613, 低于 GPT-4 0314 (22.07%) 和 Mistral Medium (21.86%). 论文指出, 对照模型多数使用了专有对齐数据 (如 Llama 2 报告中超过 1M 条标注), 或者从更强的模型蒸馏; Self-Rewarding 只从 Open Assistant 的小份种子出发. 两轮增量分别是 5.44 和 5.06 个百分点, 第二轮没有明显减小.

同底座的对照更直接. LLaMA2 Chat 70B 与 Self-Rewarding 用的是同一个 Llama 2 70B 底座, 对齐时用了 Meta 的专有数据, 胜率 13.87%. $M_1$ 的 9.94% 低于它, $M_2$ 的 15.38% 已经超过, $M_3$ 再高出 6.57 个百分点. 两者的种子人工数据规模相差很大, 前者只有 3,200 条 IFT 和 1,630 条 EFT.

Figure 4 按类别拆分 AlpacaEval. 正文结论有三条: 多数类别胜率明显上升, 但数学和逻辑推理等任务没有提升, 作者据此认为当前方法主要帮助模型更好地使用已有知识; 几乎所有复杂度上都有提升, 复杂度 5, 6, 7 (满分 10) 的任务提升更明显; 不同期望回答长度的任务上胜率都在上升. 分组本身也是 GPT-4 做的 (附录 A.6): 先用 gpt-4-1106-preview 从测试集指令里归纳出 20 个类别, 再逐条判断每个样本的类别, 复杂度 (1 到 10) 和期望回答长度. 所以这组细分结果除了胜率由 GPT-4 判定, 分到哪一类也取决于 GPT-4 的判断, 单个类别的样本又少, 小类上的升降只能作为参考. 测试集构成见附录 Table 6 到 8: 科学/技术/工程 134 条 (16.65%), 数学/逻辑推理 52 条 (6.46%), 编程 44 条 (5.47%); 复杂度 3 占 29.57%, 复杂度 2 占 25.59%; 期望长度 1 到 3 句占 44.84%, 1 段占 33.42%. 数学类只占约 6%, 这一类不涨对总胜率的影响有限.

附录 A.1 用 t-SNE 可视化 IFT, EFT 和 AIFT$(M_1)$. IFT 与 AIFT 有很好的重叠, EFT 落在嵌入空间的另一区域. 这可以解释加入 EFT 为什么基本不影响 IFT 上的表现.

胜率上升的同时, 回答也在变长. AlpacaEval 上的平均生成长度: $M_1$ 为 1,092, $M_2$ 为 1,552, $M_3$ 为 2,552. $M_3$ 的长度约为 $M_1$ 的 2.3 倍. Limitations 一节承认, 长度与估计质量之间存在已知相关, 需要更深入地分析它对这组结果的影响.

**MT-Bench (Table 2, Table 10)**

| | 总分 | 数学, 代码, 推理 | 人文, 抽取, STEM, 角色扮演, 写作 |
|--|----:|----:|----:|
| SFT baseline | 6.85 | 3.93 | 8.60 |
| $M_1$ | 6.78 | 3.83 | 8.55 |
| $M_2$ | 7.01 | 4.05 | 8.79 |
| $M_3$ | 7.25 | 4.17 | 9.10 |

附录 Table 10 的分项:

| | Writing | Roleplay | Reasoning | Math | Coding | Extraction | STEM | Humanities | Overall |
|--|--------:|---------:|----------:|-----:|-------:|-----------:|-----:|-----------:|--------:|
| SFT | 8.83 | 8.15 | 5.30 | 3.00 | 3.50 | 6.90 | 9.18 | 9.95 | 6.85 |
| $M_1$ | 9.10 | 7.65 | 4.35 | 3.05 | 4.10 | 7.20 | 8.93 | 9.85 | 6.78 |
| $M_2$ | 9.10 | 8.00 | 4.60 | 3.30 | 4.25 | 7.65 | 9.40 | 9.80 | 7.01 |
| $M_3$ | 9.58 | 8.73 | 4.80 | 3.50 | 4.20 | 7.80 | 9.45 | 9.95 | 7.25 |

数学, 代码, 推理三类合计从 3.93 到 4.17, 涨幅小于另一组的 8.60 到 9.10. 作者把原因归于 Open Assistant 种子数据的构成. Reasoning 一项 $M_3$ 的 4.80 仍低于 SFT 的 5.30; Coding 从 $M_2$ 的 4.25 降到 $M_3$ 的 4.20.

**NLP 基准 (Table 9)**

| | ARC-Easy | ARC-Ch | HellaSwag | SIQA | PIQA | GSM8K | MMLU | OBQA | NQ |
|--|--------:|-------:|----------:|-----:|-----:|------:|-----:|-----:|---:|
| Llama 2 | 80.20 | 57.40 | 85.30 | 50.70 | 82.80 | 56.80 | 68.90 | 60.20 | 25.30 |
| SFT | 76.49 | 55.97 | 85.17 | 51.48 | 82.59 | 50.72 | 69.76 | 57.80 | 34.35 |
| $M_1$ | 78.14 | 57.51 | 84.99 | 53.02 | 82.92 | 60.27 | 69.34 | 57.60 | 35.48 |
| $M_2$ | 74.84 | 54.51 | 84.27 | 51.23 | 81.94 | 59.29 | 69.31 | 57.60 | 33.07 |
| $M_3$ | 72.35 | 53.13 | 83.29 | 49.28 | 80.79 | 57.70 | 69.37 | 58.40 | 31.86 |

从 $M_1$ 到 $M_3$, ARC-Easy 降 5.79, ARC-Challenge 降 4.38, NQ 降 3.62, MMLU 基本不变. 作者引用 InstructGPT 中 RLHF 后部分公开 NLP 数据集回退的观察 (alignment tax), 并提出可以用更多样的种子 prompt 把自奖励扩展到这类任务.

### 打分能力 (Table 4)

| | SFT baseline | $M_1$ | $M_2$ | $M_3$ |
|--|------:|------:|------:|------:|
| 训练数据 | IFT | IFT+EFT | +AIFT$(M_1)$ | +AIFT$(M_2)$ |
| 成对准确率 | 65.1% | 78.7% | 80.4% | 81.7% |
| 5-best | 39.6% | 41.5% | 44.3% | 43.2% |
| Exact match | 10.1% | 13.1% | 14.3% | 14.3% |
| Spearman | 0.253 | 0.279 | 0.331 | 0.349 |
| Kendall $\tau$ | 0.233 | 0.253 | 0.315 | 0.324 |

SFT baseline 已经能打分, 成对准确率 65.1%, 因为 IFT 本身包含类似的指令. 加入 EFT 后五项全部上升, 成对准确率到 78.7%. $M_2$ 和 $M_3$ 的训练中没有新增 EFT, AIFT 数据也不像打分示范, 打分能力却继续上升. 作者的假设是: 指令跟随能力整体提高后, LLM-as-a-Judge 这项任务也随之变好. 并非每项都单调: 5-best 在 $M_3$ 从 44.3% 回落到 43.2%, exact match 在 $M_2$ 和 $M_3$ 持平.

这张表的意义在于它和第 4.1 节的结果互为因果. $M_2$ 的训练数据由 $M_1$ 打分构造, $M_3$ 的训练数据由 $M_2$ 打分构造. 如果打分能力停在 $M_1$ 的水平, 第二轮的偏好对质量不会提高. 成对准确率 81.7% 也意味着, 在 EFT 评估集的回答对上, 仍有约 18% 的方向与人工排序相反. 实际构造 AIFT 时取的是四条中分差最大的两端, 出错率应低于这个数字, 但论文没有直接测量 AIFT 偏好对与人工判断的一致率.

Spearman 从 0.253 升到 0.349, 绝对值仍不高. 模型在区分明显好坏时比较可靠, 对质量接近的回答, 排序与人工的一致性有限. 这与取两端的选对规则相互配合: 规则本身绕开了模型最不擅长的那部分判断.

**消融**

**去掉 EFT, 只加满分正例**

附录 A.3 从只用 IFT 训练的 $M_1'$ 出发, 再迭代两轮 DPO. 用同样数量的新 prompt, 只收集到很少的有效偏好对: AIFT$(M_1')$ 541 对, AIFT$(M_2')$ 429 对, 约为主实验 3,964 对和 6,942 对的 1/7 和 1/16. Figure 8 显示 EFT 让同样迭代次数下的表现更好, 而且两者的差距在后面的迭代中扩大. 打分示范决定了后续每一轮能构造出多少偏好对.

反过来, 保留打分但不构造偏好对, 也不行. 附录 A.4 试了另一种自训练: 只把模型打满分 5 的 (prompt, response) 加回 SFT 数据, 不构造偏好对. 加入 11,254 条, 并调了混合权重, 对 SFT baseline 的头对头仍是 29% 胜对 30% 胜, 没有提升. 作者没有找到让这种方法有效的设置. 偏好对里的低分回答提供了「什么样的回答不好」的信息, 只克隆满分回答得不到这部分信号.

两种做法用的是同一个打分器, 同一批候选. 差别只在于怎样使用分数: 满分筛选只看分数是否到顶, 丢掉了分数之间的相对信息; 偏好对只看相对高低, 对分数的绝对标定不敏感. 构造 EFT 时已经观察到大量样本得 4 分, 说明这类打分器的绝对分值集中在少数几个值上, 区分度有限; 在这种情况下, 相对排序比绝对分值更可靠, 这也是成对方法占优的一个原因.

### 两轮增量为何没有缩小

AlpacaEval 上两轮增量分别是 5.44 和 5.06 个百分点, 头对头中 $M_3$ 对 $M_2$ 的胜负比 (47.7 对 12.5) 与 $M_2$ 对 $M_1$ (55.5 对 11.7) 处在同一量级. 和 SPIN 每轮增量快速递减相比, 这里没有出现明显的饱和.

可以对照的两个因素: 一是 AIFT 的规模从 3,964 对增加到 6,942 对, 第二轮的训练数据更多; 二是打分能力在第二轮也提高了 (成对准确率 78.7% 到 80.4%), 造出的偏好对更可靠. SPIN 的目标分布固定为 SFT 数据, Self-Rewarding 的偏好来自不断变化的裁判, 没有一个固定的收敛点. 三轮的数据不足以判断这种增长能持续多久.

## 相邻方法, 成本与失效

### 与相邻方法的分工

**OAIF.** 同样由当前策略采样, LLM 当场标注, 再套 DAP 损失. 区别在标注器: OAIF 默认策略是 PaLM 2-XS, 标注器是 PaLM 2-L, 可以比策略更强. OAIF 论文的 Discussion 也讨论过自我标注, 认为缺点是标注器与策略的架构和尺寸必须相同. OAIF 每步采两条, Self-Rewarding 采四条取两端. 见 [01-OAIF](../01-OAIF-在线AI反馈/01-OAIF-在线AI反馈.md).

**SPIN.** 胜者永远是 SFT 数据中的人写回答, 输者是上一轮生成, 不需要打分. Self-Rewarding 的相关工作一节指出 SPIN 的局限: 一旦模型生成追上人写回答就无法继续, 而且每条 prompt 都需要人写回答. 见 [04-SPIN](../04-SPIN-自对弈微调/04-SPIN-自对弈微调.md).

**RLAIF (Lee 等).** 用现成 LLM 当裁判构造偏好数据, 训练一个固定的 RM, 再做强化学习. 论文提到 Lee 等也试过直接用 LLM-as-a-Judge 模型参与 PPO, 但报告计算成本很高; Self-Rewarding 的打分发生在离线构造 AIFT 的阶段, 成本相对低. Constitutional AI 更早用 LLM 给反馈, 同样训练一个固定的偏好模型再做 RL. 见 [4.7.1-RLAIF](../../../4.7-AI反馈与奖励过优化/4.7.1-RLAIF/4.7.1-RLAIF.md) 和 [01-Constitutional-AI](../../../4.7-AI反馈与奖励过优化/4.7.1-RLAIF/01-Constitutional-AI-宪法对齐/01-Constitutional-AI-宪法对齐.md).

**冻结 RM 的 RLHF.** 人工偏好训练 $r_\phi$, 冻结, 再做 PPO. 打分器在策略迭代中不变. Self-Rewarding 让打分能力随写回答能力一起变化, 第 4 节的 Table 4 给出了这一点的数据.

| | 采样 | 标注 | 独立 RM | 优化 |
|--|------|------|---------|------|
| 冻结 RM 的 RLHF | 当前 $\pi$ | 人工, 训成固定 $r_\phi$ | 要 | PPO |
| RLAIF | 当前 $\pi$ | LLM 标注后训 RM | 要 | 强化学习 |
| SPIN | 上一轮生成 $y'$ | 无, 胜者是人写回答 | 不要 | logistic 成对差 |
| OAIF | 当前 $\pi$ 两条 | 另一个 LLM 当场标 | 不要 | 任意 DAP |
| Self-Rewarding | 当前 $M_t$ 四条 | 同一个 $M_t$ 打 0 到 5 分 | 不要 | Iterative DPO |

![三列对照: 冻结 RM, OAIF 的外部标注器, Self-Rewarding 自己标自己](./images/fig-srlm-not-oaif-spin.png)

> 图 2: 左列人工偏好训出冻结的 $r_\phi$, 再做 PPO; 中列当前策略采两条, 另一个 LLM 当场标注, 套 DAP 损失; 右列同一个 $M_t$ 采 4 条并当裁判, 再做 Iterative DPO.

**图 2 解析**

- 三列从上往下读, 竖线分开. 左列顶部黄框是人工偏好 $\mathcal{D}$, 灰框是冻结 RM, 粉框是 PPO, 底部薄荷绿是策略. 页脚 RM frozen, not self-score.
- 中列薄荷绿框是当前 $\pi$ 采 $y_1,y_2$, 淡紫框写 other LLM annotator (can be stronger), 再进入偏好对和 DAP. 页脚 annotator may exceed policy size.
- 右列的生成框和裁判框都写 same $M_t$, 偏好对是 max vs min, 底部橙色框是 Iterative DPO. 页脚 generate and judge share weights.
- 列与列之间没有箭头.

### 成本与适用条件

每一轮的额外开销来自三部分: 生成新 prompt; 每条 prompt 采 4 条回答; 每条回答打 3 次分. 一条 prompt 需要 4 次生成和 12 次打分生成, 打分输出包含最多 100 词的理由. 打分调用次数是生成次数的 3 倍. 对 70B 模型来说, 构造 AIFT 的推理量不小, 但这些都发生在训练之前, 训练本身只是普通的 DPO.

和 RLHF 比, 省掉了 RM 训练和价值网络, 也不需要训练中持续调用 RM. 和 OAIF 比, 不需要另一个更大的标注 LLM, 但标注质量受限于策略自己的判断能力.

适用条件: 有一份质量足够的打分示范 (EFT), 并且底座模型够大, 能学会打分. 论文只在 70B 上做了实验, 小模型能否学到足够可靠的打分能力, 还需要另做实验. 打分不可靠时, 偏好对的方向会出错, 第 2.2 节多选式提示的负相关就是这种情况.

### 失效模式

**长度增长.** $M_3$ 的平均长度约为 $M_1$ 的 2.3 倍. 打分器和评测裁判都可能偏爱长回答, 胜率提升里有多少来自长度, 论文没有拆分.

**推理不涨.** 数学和逻辑推理类别没有提升, MT-Bench 的 Reasoning 低于 SFT. 自我打分难以判断推理是否正确, 这类任务更适合用可验证的答案做奖励.

**NLP 基准回退.** ARC, NQ 等随迭代下降.

**打分器与评测相关.** 训练奖励来自 LLM, 部分评测也由 LLM (GPT-4) 判定. 即使两者不是同一个模型, 论文也承认需要更深入的分析. 是否会出现 reward hacking, 以及在什么情况下出现, 尚待研究.

**迭代次数.** 只跑了三轮, 一种设定. 论文结论承认这种「良性循环」在现实中很可能饱和, 它提供的是超过原始人工偏好的可能性.

**安全.** 没有做安全评估, 也没有做安全训练. 论文设想把 LLM-as-a-Judge 改成专门评估安全, 但没有实验.

**自我偏好.** 裁判和被评者是同一个模型. 模型偏爱的写法 (结构, 措辞, 篇幅) 在打分时也可能得到高分, 下一轮再被强化. 论文 Limitations 提出要研究框架内是否会出现 reward hacking, 自我偏好是其中最直接的一种可能.

**分数偏斜.** EFT 构造中大量样本得 4 分, 需要重采样平衡. 打分集中时, 四条候选的分数容易接近, 偏好对的质量下降.

有更大, 更可靠的外部标注器时, [01-OAIF](../01-OAIF-在线AI反馈/01-OAIF-在线AI反馈.md) 不必让策略自己打分. 只有 SFT 数据, 想从中再提取信号, 可用 [04-SPIN](../04-SPIN-自对弈微调/04-SPIN-自对弈微调.md). 已有离线人工偏好, [01-DPO](../../4.6.1-离线偏好优化/01-DPO/01-DPO.md) 最简单.

**参考文献**

1. Yuan, W., Pang, R. Y., Cho, K., Li, X., Sukhbaatar, S., Xu, J., & Weston, J. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020). *ICML 2024*.
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
3. Xu, J., Lee, A., Sukhbaatar, S., & Weston, J. (2023). [Some Things Are More Cringe Than Others: Preference Optimization with the Pairwise Cringe Loss](https://arxiv.org/abs/2312.16682).
4. Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
5. Wang, Y., Kordi, Y., Mishra, S., et al. (2023). [Self-Instruct: Aligning Language Models with Self-Generated Instructions](https://aclanthology.org/2023.acl-long.754/). *ACL 2023*.
6. Li, X., Yu, P., Zhou, C., et al. (2024). [Self-Alignment with Instruction Backtranslation](https://arxiv.org/abs/2308.06259). *ICLR 2024*.
7. Touvron, H., Martin, L., Stone, K., et al. (2023). [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288).
8. Köpf, A., Kilcher, Y., von Rütte, D., et al. (2023). [OpenAssistant Conversations: Democratizing Large Language Model Alignment](https://arxiv.org/abs/2304.07327).
9. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML 2024*.
10. Guo, S., Zhang, B., Liu, T., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).
11. Lee, H., Phatale, S., Mansoor, H., et al. (2023). [RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback](https://arxiv.org/abs/2309.00267).
12. Bai, Y., Kadavath, S., Kundu, S., et al. (2022). [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073).
13. Ouyang, L., Wu, J., Jiang, X., et al. (2022). [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155). *NeurIPS 2022*.
14. Gulcehre, C., et al. (2023). [Reinforced Self-Training (ReST) for Language Modeling](https://arxiv.org/abs/2308.08998).
