---
title: "09 · CPO: 对比偏好优化"
published: true
tags: ["CPO", "DPO", "ALMA", "机器翻译", "对比偏好", "均匀先验"]
excerpt: "CPO (Contrastive Preference Optimization) 把 DPO 的参考策略换成均匀先验, 再加一项对 preferred 译文的 NLL, 在已经 SFT 饱和的 ALMA 翻译模型上继续提升."
---
# 09 CPO: 对比偏好优化

> 相关阅读: [4.4.4 其他对齐技术](../../4.6.2-在线偏好与自对弈/4.6.2-在线偏好与自对弈.md) · [01 SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) · [02 RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) · [03 IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) · [01 DPO](../01-DPO/01-DPO.md) · [02 ORPO](../04-ORPO/04-ORPO.md) · [04 SimPO](../05-SimPO-无参考长度平均/05-SimPO-无参考长度平均.md)

材料是 Xu, Sharaf, Chen 等 (约翰斯·霍普金斯大学与微软) 的 *Contrastive Preference Optimization: Pushing the Boundaries of LLM Performance in Machine Translation* ([arXiv:2401.08417](https://arxiv.org/abs/2401.08417), ICML 2024). 问题是 7B, 13B 的翻译模型在 SFT 之后已经到顶, 参考译文本身又不完美, 怎样继续提升, 同时不付 DPO 那份参考模型的显存.

论文的做法分两步. 数据上, 让 GPT-4 和 ALMA 各译一遍 FLORES-200, 连同参考译文一起交给两个无参考打分模型, 取最高分和最低分组成偏好对. 损失上, 把 DPO 的参考策略换成均匀先验, 参考项在式子里抵消, 再加一项 preferred 译文上的 NLL 防止策略漂走. 两步合起来, 只用 22K 句对和 12M 个 LoRA 参数, 就把 ALMA-13B-LoRA 推到与 GPT-4 和 WMT 冠军相当的位置. 后半篇用指标替换, BLEURT 和人工评估检查这部分增益是不是只来自迎合打分模型.

## 1. 问题与数据

### 1.1 参考译文的质量问题

机器翻译的训练几乎都用负对数似然. 平行句 $\mathcal{D}=\{x^{(i)},y^{(i)}\}_{i=1}^{N}$, $x$ 是源句, $y$ 是参考译文 (gold reference), $N$ 是句对数:

$$
\mathcal{L}_{\mathrm{NLL}}=-\mathbb{E}_{(x,y)\sim\mathcal{D}}\bigl[\log\pi_\theta(y\mid x)\bigr].
\tag{1}
$$

式 (1) 让模型去拟合 $y$, 模型的翻译能力因此取决于平行句的质量. 常用的 BLEU 和 COMET-22 也是参考型指标, 参考差时, 评估本身也会失准. 引言把 SFT 的问题归成两条. 第一, 最小化预测与参考之间的差异, 等于把模型性能限制在训练数据的质量水平, 而人写的数据也会有质量问题. 第二, SFT 没有机制阻止模型犯错: 强翻译模型偶尔也会漏译一部分, 这种「接近完美但有瑕疵」的译文需要被压下去.

背景是 ALMA (Xu 等 2023). ALMA 先用大量非英语单语数据对 LLaMA-2 做全参数微调, 增强多语言能力, 再用少量高质量平行句做 SFT. 它超过了此前所有中等规模的 LLM 翻译模型, 甚至超过 GPT-3.5, 但仍落后于 GPT-4 和 WMT 比赛冠军. 论文中的 ALMA-13B-LoRA 是 ALMA 系列里最好的 13B 模型: 单语阶段全参数微调, 平行句阶段用 LoRA.

**参考译文有多好.** 论文第 2 节 (标题为「Gold or Gilded?」) 检查了 ALMA 用过的 FLORES-200. 数据取 dev 和 test 两部分, 每个方向共 2009 句, 五个以英语为中心的语言对: 德语 (de), 捷克语 (cs), 冰岛语 (is), 中文 (zh), 俄语 (ru), 双向; 冰岛语算低资源语言. ALMA-13B-LoRA 和 GPT-4 (`gpt-4-1106-preview`) 各译一遍, ALMA 的提示与原 ALMA 相同, GPT-4 按 Hendy 等 (2023) 的建议写提示. 打分用两个约 10B 参数的无参考模型: `Unbabel/wmt23-cometkiwi-da-xxl` (下称 KIWI-XXL) 和 `Unbabel/XCOMET-XXL` (下称 XCOMET), 两者与人工判断的相关性都很高 (Freitag 等 2023). Win Ratio 是系统译文得分高于参考的句子比例. Table 1 (五语平均):

| | KIWI-XXL | Win Ratio (%) | XCOMET | Win Ratio (%) |
|---|---|---|---|---|
| xx$\to$en 参考 | 85.31 | - | 88.82 | - |
| ALMA-13B-LoRA | 88.33 | 73.24 | 92.68 | 60.17 |
| GPT-4 | 89.21 | 79.43 | 94.66 | 54.25 |
| en$\to$xx 参考 | 87.85 | - | 94.42 | - |
| ALMA-13B-LoRA | 85.62 | 42.15 | 93.07 | 35.46 |
| GPT-4 | 87.30 | 49.13 | 94.21 | 38.09 |

读表:

- 译入英语时, 两个系统的平均分比参考高约 3 到 4 个 KIWI-XXL, 4 到 6 个 XCOMET. KIWI-XXL 判 ALMA 赢参考的句子占 73.24%, XCOMET 下也有 60.17%.
- 译出英语时, 参考与两个系统的均值相近, 仍有约 40% 的系统译文被判为优于参考.

论文 Figure 2 给了 FLORES-200 的一个例子: 参考保留了缩写「CEP」却没有给出全称, ALMA 和 GPT-4 的译文补上了参考漏掉的部分.

**动机: 学会拒绝.** 最直接的做法是把更好的系统译文当新参考, 再做式 (1). 这能提升翻译能力, 但不能让模型学会识别并避免次优译文, 例如 Figure 2 里那种「好但不完美」的译文. 论文因此要一个新目标: 让模型优先生成高质量译文, 拒绝较差的, 形式上是带难负例的对比学习 (Oord 等 2018, Chen 等 2020, He 等 2020, Robinson 等 2021, Tan 等 2023), 不再只是对参考最小化交叉熵.

### 1.2 三元组偏好数据

机器翻译里成对偏好数据很少, CPO 自己构造. 源句仍来自 FLORES-200 的 dev 和 test, 语言对与第 1.1 节相同, 每个语言对 2009 句. 对每条源句 $x$ (译入或译出英语), 用 GPT-4 和 ALMA-13B-LoRA 各生成一条译文 $y_{\mathrm{gpt\text{-}4}}$ 和 $y_{\mathrm{alma}}$, 加上原参考 $y_{\mathrm{ref}}$ 组成三元组

$$
\mathbf{y}=(y_{\mathrm{ref}},\,y_{\mathrm{gpt\text{-}4}},\,y_{\mathrm{alma}}).
\tag{2}
$$

KIWI-XXL 和 XCOMET 分别打分后取平均, 记作 $\mathbf{s}=(s_{\mathrm{ref}},s_{\mathrm{gpt\text{-}4}},s_{\mathrm{alma}})$. 最高分的译文作为 preferred 译文 $y_w$, 最低分的作为 dis-preferred 译文 $y_l$:

$$
y_w=\mathbf{y}_{\arg\max_i(\mathbf{s})},\qquad
y_l=\mathbf{y}_{\arg\min_i(\mathbf{s})},
\tag{3}
$$

$i$ 是三元组里的下标, 中间分数的译文不用. 论文强调, $y_l$ 本身也可能是高质量译文, dis-preferred 只表示它还有改进余地, 比如补上一些细节. 用这种高质量但不完美的译文当负例, 是为了让模型学会修补细节.

![三元组打分后只留最高分与最低分](./images/fig-cpo-triplet-prefer.png)

> 图 1: 一条源句生成三条候选, KIWI-XXL 与 XCOMET 平均打分, 最高分作为 $y_w$, 最低分作为 $y_l$, 中间一条丢弃.

**图 1 解析**

- 最左蓝框是源句 source $x$, 分三路连到三条候选: 黄框 $y_{\mathrm{ref}}$ (标注 FLORES), 绿框 $y_{\mathrm{gpt\text{-}4}}$, 紫框 $y_{\mathrm{alma}}$.
- 三条候选都进入中间黄框「KIWI-XXL + XCOMET average $s$」.
- 黄框向右分三路: 上方绿框 $y_w=\arg\max s$; 中间灰框 middle discarded, 用虚线连接; 下方橙框 $y_l=\arg\min s$.
- 底部注明: preferred 取 QE 最高分, dis-preferred 取最低分, 中间一条不用.

**来源分布.** Table 2 是每个语言对 (双向合计) 里 $y_w$ 的来源:

| | ALMA-13B-LoRA | GPT-4 | Reference |
|---|---|---|---|
| en$\leftrightarrow$de | 46% | 37% | 17% |
| en$\leftrightarrow$cs | 32% | 41% | 27% |
| en$\leftrightarrow$is | 36% | 40% | 24% |
| en$\leftrightarrow$zh | 45% | 35% | 20% |
| en$\leftrightarrow$ru | 31% | 44% | 25% |

读表: 参考译文成为 $y_w$ 的比例在 17% 到 27% 之间, 其余由两个系统分占. 在 de 和 zh 上 ALMA 的译文最常胜出, 在 cs, is, ru 上 GPT-4 最常胜出.

**规模.** 十个方向, 每个约 2K 句, 合计 $2\mathrm{K}\times10=20\mathrm{K}$ 对. FLORES-200 的一部分也用于 ALMA 的训练. 除这些由评估模型打分的数据外, 还有一批内部人标偏好, 只覆盖 en$\to$zh 和 en$\to$de 两个方向. §4.1 写的是 1K 条, 附录 D.1 写的是两个方向共 2K 句. 摘要里的「22K parallel sentences」即 20K 三元组数据加上这批人标数据.

**人标数据 (附录 D).** 人标数据是成对格式. 英语源句选自维基百科, 过滤掉时间戳和 URL; 每句由 Google 翻译和 GPT-4 各译一遍, 标注者给出偏好. Table 11 的统计: en$\to$de 上 Google 胜 418, GPT-4 胜 435, 平局 203; en$\to$zh 上 362, 412, 282. 平局没有明确偏好, 不参与训练. 只用三元组数据和加上人标数据的对比 (Table 12, 13): en$\to$xx 平均 KIWI-22 / KIWI-XXL / XCOMET 分别是 83.33 / 85.75 / 93.95 和 83.34 / 85.74 / 94.05, 几乎没有差别; xx$\to$en 是 81.40 / 82.55 / 89.26 和 81.33 / 82.43 / 89.11, 加上人标数据后略降. 分方向看, en$\to$zh 略有提升, en$\to$de 略有下降. 论文推测原因是平局比例高, 以及标注过程中的人为偏差: 有些作者认为 GPT-4 更好的句子, 标注者选了 Google.

## 2. 损失

### 2.1 从 DPO 到均匀先验

成对数据记作 $\mathcal{D}=\{x^{(i)},y_w^{(i)},y_l^{(i)}\}_{i=1}^{N}$. DPO 的损失是参数化策略 $\pi_\theta$ 的最大似然目标:

$$
\mathcal{L}(\pi_\theta;\pi_{\mathrm{ref}})
=-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[\log\sigma\Bigl(
\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-\beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}
\Bigr)\Bigr].
\tag{4}
$$

$\pi_{\mathrm{ref}}$ 是预训练好的语言 (翻译) 模型, $\sigma$ 是 sigmoid, $\beta$ 是超参. DPO 由 PPO 框架下真实奖励与最优策略的重参数化推出, 只依赖标好的偏好数据, 可以按 SFT 的方式训练. 推导见 [01-DPO](../01-DPO/01-DPO.md).

论文指出 DPO 相对普通 SFT 有两个缺点. 一是显存: 要同时存放可训策略和参考策略, 显存翻倍. 二是速度: 两个策略要依次前向, 处理时间翻倍.

把 $\pi_{\mathrm{ref}}$ 设成均匀先验 $U$, 两个缺点都消失. 均匀分布下 $\pi_{\mathrm{ref}}(y_w\mid x)$ 与 $\pi_{\mathrm{ref}}(y_l\mid x)$ 相等, 在式 (4) 里互相抵消, 除策略本身外不需要额外计算和存储:

$$
\mathcal{L}(\pi_\theta;U)
=-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[\log\sigma\bigl(\beta\log\pi_\theta(y_w\mid x)-\beta\log\pi_\theta(y_l\mid x)\bigr)\Bigr].
\tag{5}
$$

抵消成立的条件是参考策略在 $y_w$ 和 $y_l$ 上取同一个值. 均匀先验满足这个条件; 冻结的 SFT 模型一般不满足. $\beta$ 沿用 Rafailov 等建议的默认值 $0.1$. 式 (5) 里的 $\log\pi_\theta(y\mid x)$ 是整条译文各 token 对数概率之和, 不除长度, 也没有间隔项.

### 2.2 定理 1: 均匀先验给出的上界

式 (5) 为什么能近似式 (4)? 附录 C.1 的定理 1 回答这一点: 把 $\pi_{\mathrm{ref}}$ 取成理想策略 $\pi_w$, 它精确拟合 preferred 数据的真实分布, 则 DPO 损失 $\mathcal{L}(\pi_\theta;\pi_w)+C$ 以 $\mathcal{L}(\pi_\theta;U)$ 为上界, $C$ 是常数.

**证明.** $\pi_w$ 精确拟合 preferred 数据, 所以对 $\mathcal{D}$ 中任一样本, $\pi_w(y_w\mid x)=1$, $0\le\pi_w(y_l\mid x)\le1$. preferred 一侧不需要参考模型重新加权, 式 (4) 变成

$$
\mathcal{L}(\pi_\theta;\pi_w)
=-\mathbb{E}\Bigl[\log\sigma\bigl(\beta\log\pi_\theta(y_w\mid x)-\beta\log\pi_\theta(y_l\mid x)+\beta\log\pi_w(y_l\mid x)\bigr)\Bigr].
\tag{6}
$$

展开 sigmoid, 括号内可写成

$$
\log\pi_\theta(y_w\mid x)^{\beta}+\log\pi_w(y_l\mid x)^{\beta}
-\log\Bigl(\pi_\theta(y_w\mid x)^{\beta}\,\pi_w(y_l\mid x)^{\beta}+\pi_\theta(y_l\mid x)^{\beta}\Bigr).
\tag{7}
$$

$\pi_w$ 固定, $\log\pi_w(y_l\mid x)^\beta$ 不参与梯度. 记 $C=\mathbb{E}_{(x,y_l)\sim\mathcal{D}}[\log\pi_w(y_l\mid x)^\beta]$, 定义 $\mathcal{L}'=\mathcal{L}(\pi_\theta;\pi_w)+C$, 它与 $\mathcal{L}(\pi_\theta;\pi_w)$ 的优化等价. 由于 $\pi_w(y_l\mid x)\le1$, 把式 (7) 最后一项里的 $\pi_w(y_l\mid x)^\beta$ 换成 1, 对数里的量变大, 负号后整体变大, 得到

$$
\mathcal{L}(\pi_\theta;\pi_w)+C\le
-\mathbb{E}\Bigl[\log\sigma\bigl(\beta\log\pi_\theta(y_w\mid x)-\beta\log\pi_\theta(y_l\mid x)\bigr)\Bigr]
=\mathcal{L}(\pi_\theta;U).
\tag{8}
$$

**怎么理解.** 最小化式 (5) 是在压低理想参考下 DPO 损失的一个上界. 证明依赖 $\pi_{\mathrm{ref}}=\pi_w$ 这个假设: 通常的做法把 $\pi_{\mathrm{ref}}$ 设为初始 SFT checkpoint, 这里把它看成训练想要到达的理想策略. $\pi_w$ 在训练中未知也拿不到, 但近似之后它不再出现在损失里. 上界关系与 DPO 原本的「冻结 SFT 作参考」是两种设定, 式 (5) 并不等于以 SFT 为参考的式 (4).

**手算.** 取 $\beta=0.1$, 设 $\log\pi_\theta(y_w\mid x)=-12$, $\log\pi_\theta(y_l\mid x)=-10$, 对数概率之差 $d=-2$. 式 (5): $-\log\sigma(-0.2)\approx0.798$. 再设 $\pi_w(y_l\mid x)=0.5$: 式 (6) 括号内是 $-0.2+0.1\ln0.5\approx-0.269$, 损失约 $0.837$; $C=0.1\ln0.5\approx-0.069$; 左边 $0.837-0.069=0.768$, 小于右边 $0.798$, 与式 (8) 一致. 若 $\log\pi_\theta(y_w\mid x)$ 升到 $-9$, $d=+1$, 式 (5) 的损失降到约 $0.644$. 这组数字是式 (5)(6)(8) 的算术, 论文没有给.

### 2.3 行为克隆正则与完整目标

只最小化式 (5), $\pi_\theta$ 可能偏离 preferred 数据的分布. 论文加了一个行为克隆 (BC) 正则, 引自 Hejna 等 (2023) 的 *Contrastive Preference Learning* (CPL):

$$
\min_\theta\mathcal{L}(\pi_\theta,U)
\quad\text{s.t.}\quad
\mathbb{E}_{(x,y_w)\sim\mathcal{D}}\Bigl[\mathrm{KL}\bigl(\pi_w(y_w\mid x)\,\Vert\,\pi_\theta(y_w\mid x)\bigr)\Bigr]<\epsilon,
\tag{9}
$$

$\epsilon$ 是一个小正数. 附录 C.2 用拉格朗日对偶把约束变成惩罚项, 系数 $\lambda$ 设为 1. 展开 KL: $\pi_w(y_w\mid x)\log\pi_w(y_w\mid x)-\pi_w(y_w\mid x)\log\pi_\theta(y_w\mid x)$, 代入 $\pi_w(y_w\mid x)=1$, 第一项是 $1\cdot0=0$, 第二项是 $-\log\pi_\theta(y_w\mid x)$. 约束因此化成 preferred 译文上的 NLL, CPO 的完整目标是

$$
\min_\theta\ \underbrace{\mathcal{L}(\pi_\theta,U)}_{\mathcal{L}_{\mathrm{prefer}}}
\underbrace{-\,\mathbb{E}_{(x,y_w)\sim\mathcal{D}}\bigl[\log\pi_\theta(y_w\mid x)\bigr]}_{\mathcal{L}_{\mathrm{NLL}}}.
\tag{10}
$$

$\mathcal{L}_{\mathrm{prefer}}$ 是式 (5) 的偏好项, $\mathcal{L}_{\mathrm{NLL}}$ 只作用在 $y_w$ 上. 和式 (1) 相比, 监督目标从数据集参考换成三元组里分数最高的译文, 同时 $y_l$ 通过偏好项提供对比信号.

**两项的梯度量级.** 沿用上面的数: $d=-2$ 时, $\mathcal{L}_{\mathrm{prefer}}$ 对 $\log\pi_\theta(y_w\mid x)$ 的偏导是 $-\beta\,\sigma(-\beta d)=-0.1\,\sigma(0.2)\approx-0.055$; $\mathcal{L}_{\mathrm{NLL}}$ 对它的偏导恒为 $-1$. $d=+1$ 时偏好项的偏导约 $-0.048$. 在 $\beta=0.1$ 下, $y_w$ 上的梯度主要来自 NLL 项, 偏好项对 $y_l$ 的推力 (偏导为 $+\beta\sigma(-\beta d)$) 是 $y_l$ 唯一的梯度来源. 这是按式 (10) 的算术, 论文没有报告两项梯度的比例.

**实现.** Hugging Face TRL 把 CPO 放在 `trl.experimental.cpo`. `loss_type` 默认 `"sigmoid"`, 对应式 (5); BC 正则的权重 `cpo_alpha` 默认 1.0, 对应 $\lambda=1$; `beta` 默认 0.1. 日志里的 `rewards/chosen` 是策略对 chosen 回答的对数概率乘 $\beta$, `nll_loss` 是 chosen 上的 NLL. 同一个 Trainer 还实现了 SimPO: 设 `loss_type="simpo"` 并令 `cpo_alpha=0.0` 关掉 BC 正则; `loss_type="simpo"` 配非零 `cpo_alpha` 是 CPO-SimPO 组合. 论文代码和模型在 [fe1ixxu/ALMA](https://github.com/fe1ixxu/ALMA).

![CPO 损失: 均匀先验的偏好项加 chosen 的 NLL](./images/fig-cpo-prefer-nll.png)

> 图 2: 偏好三元组只经过可训的 $\pi_\theta$, 分成偏好项和 NLL 两支, 相加得到 $\mathcal{L}_{\mathrm{CPO}}$.

**图 2 解析**

- 标题写的是 $L_{\mathrm{CPO}}=L_{\mathrm{prefer}}+L_{\mathrm{NLL}}$, 括号注明不使用冻结的 $\pi_{\mathrm{ref}}$.
- 左侧蓝框 $(x,y_w,y_l)$ 进入绿框 trainable $\pi_\theta$, 框内注明 no frozen copy.
- 上支黄框 $L_{\mathrm{prefer}}$, 写的是 $-\log\sigma(\beta\log\pi(y_w)-\beta\log\pi(y_l))$, 即式 (5); 下支绿框 $L_{\mathrm{NLL}}$, 写的是 $-\log\pi_\theta(y_w\mid x)$.
- 两支汇入右侧橙框 $L_{\mathrm{CPO}}=L_{\mathrm{prefer}}+L_{\mathrm{NLL}}$, 即式 (10).
- 底部注明: $\pi_{\mathrm{ref}}:=U$, 参考项抵消; BC 正则化成 $y_w$ 上的 NLL.

## 3. 实验设定与 WMT 结果

### 3.1 训练设定与基线

**训练.** 以 ALMA-13B-LoRA 为起点, 十个方向一起做多对多训练. 只更新加上的 LoRA 参数, rank 16, 在 13B 之外只增加 12M 参数 (约原模型的 0.1%). $\beta=0.1$, batch size 128, warm-up 比例 0.01, 训练 1 个 epoch, 最大序列长度 512 token, 用 DeepSpeed 提升效率. 提示与 ALMA 相同, 提示部分不计损失. GPT-4 和 ALMA 用的两种翻译提示列在附录 B 的 Figure 5. 同样的方法也用于 7B, 得到 ALMA-7B-R, 结果在附录 A.

**测试集.** 主测试集沿用 ALMA: 冰岛语用 WMT'21, 其余语言用 WMT'22. 辅助实验用 WMT'23 的六个方向: de$\leftrightarrow$en, zh$\leftrightarrow$en, ru$\leftrightarrow$en.

**指标.** 主指标是三个无参考模型: KIWI-XXL, XCOMET, 以及更小也更常用的 `Unbabel/wmt22-cometkiwi-da` (下称 KIWI-22). 参考型的 sacreBLEU 和 COMET-22 (`Unbabel/wmt22-comet-da`) 放在附录 A. 论文强调, 这样做是提醒参考质量差可能带来的问题, 并没有否定参考型指标. 表中深蓝色表示相对原 ALMA 的提升达到 Kocmi 等 (2024) 估计的与人工判断 80% 一致的阈值: KIWI-XXL 和 XCOMET 至少 $+1.24$, KIWI-22 至少 $+0.53$; 浅蓝表示较小的提升, 黄色表示下降. 附录 F 的 Table 15 给了完整阈值表, 例如 BLEU 的 80% 阈值是 2.34, COMET-22 是 0.56.

**基线.** 当前最强的公开翻译系统: ALMA-13B-LoRA (在 WMT'21 和 WMT'22 上超过 NLLB-54B 等传统模型); TowerInstruct (同期的 LLM 翻译模型, 训练用过 WMT'22 测试数据, 所以只在 WMT'23 上比较); GPT-4 (`gpt-4-1106-preview`) 零样本; 各方向的 WMT 冠军系统 (每个方向冠军不同, WMT'21 和 WMT'22 的冠军与 Hendy 等 2023 相同). 训练目标对照: 在同一份 preferred 数据上直接 SFT, 以及原版 DPO. 所有训练目标都从 ALMA-13B-LoRA 出发.

### 3.2 en$\to$xx (Table 3)

各方向 KIWI-22 / KIWI-XXL / XCOMET:

| 模型 | de | cs | is |
|---|---|---|---|
| 参考 | 82.67 / 84.01 / 97.85 | 83.19 / 81.83 / 90.27 | 80.51 / 85.20 / 91.52 |
| WMT 冠军 | 83.56 / 83.70 / 96.99 | 85.31 / 87.27 / 94.38 | 81.77 / 84.94 / 91.61 |
| GPT-4 | 83.48 / 84.91 / 97.56 | 84.81 / 85.35 / 93.48 | 81.03 / 81.21 / 90.00 |
| ALMA-13B-LoRA | 82.62 / 81.64 / 96.49 | 84.14 / 84.24 / 92.38 | 81.71 / 83.31 / 91.20 |
| + SFT on preferred | 82.75 / 81.85 / 96.67 | 84.14 / 83.46 / 91.99 | 81.48 / 82.11 / 90.30 |
| + DPO | 82.40 / 81.20 / 96.40 | 83.86 / 83.45 / 91.68 | 81.43 / 82.66 / 90.33 |
| + CPO (ALMA-13B-R) | 83.28 / 84.25 / 97.48 | 84.99 / 87.06 / 93.61 | 82.18 / 85.68 / 91.93 |

| 模型 | zh | ru | 平均 |
|---|---|---|---|
| 参考 | 80.92 / 81.70 / 90.42 | 82.96 / 84.62 / 94.17 | 82.05 / 83.47 / 92.85 |
| WMT 冠军 | 82.04 / 81.13 / 91.14 | 84.35 / 87.01 / 94.79 | 83.41 / 84.81 / 93.78 |
| GPT-4 | 81.73 / 81.53 / 90.79 | 83.64 / 86.15 / 94.3 | 82.94 / 83.83 / 93.23 |
| ALMA-13B-LoRA | 80.82 / 79.96 / 89.92 | 83.10 / 84.17 / 93.79 | 82.48 / 82.66 / 92.76 |
| + SFT on preferred | 81.25 / 80.51 / 90.18 | 83.23 / 84.15 / 93.54 | 82.57 / 82.42 / 92.54 |
| + DPO | 80.74 / 79.64 / 89.58 | 82.94 / 83.40 / 93.25 | 82.27 / 82.07 / 92.25 |
| + CPO (ALMA-13B-R) | 82.25 / 84.32 / 92.03 | 83.98 / 87.37 / 95.22 | 83.34 / 85.74 / 94.05 |

读表:

- ALMA-13B-R 的平均 KIWI-XXL 85.74, XCOMET 94.05, 高于 GPT-4 的 83.83 / 93.23 和 WMT 冠军的 84.81 / 93.78. 平均 KIWI-22 是 83.34, 与冠军的 83.41 接近.
- KIWI-XXL 的提升在五个方向上都超过 1.24 的阈值: de 从 81.64 到 84.25, cs 从 84.24 到 87.06, is 从 83.31 到 85.68, zh 从 79.96 到 84.32, ru 从 84.17 到 87.37.
- 在同一份 preferred 数据上 SFT, 平均 KIWI-XXL 从 82.66 降到 82.42, XCOMET 从 92.76 降到 92.54; DPO 降到 82.07 / 92.25. 论文的描述是 SFT 在 en$\to$xx 上略有退化, DPO 略降性能.

### 3.3 xx$\to$en (Table 4)

平均 KIWI-22 / KIWI-XXL / XCOMET:

| 模型 | 平均 |
|---|---|
| 参考 | 79.91 / 80.10 / 85.77 |
| WMT 冠军 | 80.92 / 81.19 / 87.13 |
| GPT-4 | 81.28 / 82.60 / 89.41 |
| ALMA-13B-LoRA | 80.53 / 81.50 / 86.74 |
| + SFT on preferred | 80.96 / 81.99 / 88.40 |
| + DPO | 80.51 / 81.36 / 86.58 |
| + CPO (ALMA-13B-R) | 81.33 / 82.43 / 89.11 |

读表:

- 译入英语时, SFT 有小幅提升 (XCOMET 86.74 到 88.40), DPO 基本回到起点或略降.
- CPO 的平均 KIWI-22 81.33 略高于 GPT-4 的 81.28; KIWI-XXL 82.43 和 XCOMET 89.11 略低于 GPT-4 的 82.60 / 89.41, 高于 WMT 冠军.
- 分方向看提升较大的格子: is$\to$en 的 XCOMET 从 76.68 到 80.49 (DPO 是 76.09); cs$\to$en 的 XCOMET 从 83.95 到 88.03; zh$\to$en 的 KIWI-XXL 从 74.41 到 77.17, 仍低于 GPT-4 的 77.65.
- 冰岛语是低资源语言, en$\to$is 和 is$\to$en 的提升方向与高资源语言一致.

### 3.4 WMT'23, 参考型指标与 7B (Table 5, Table 16, 附录 A)

WMT'21 和 WMT'22 是 ALMA 一直在用的测试集, 为了排除只在这两套测试集上调好的可能, 论文另在 WMT'23 的六个方向上测了一遍, TowerInstruct 也只在这里参与比较. 六方向平均 KIWI-22 / KIWI-XXL / XCOMET: 参考 78.74 / 75.56 / 86.30, WMT 冠军 80.57 / 77.72 / 88.24, TowerInstruct 80.31 / 77.18 / 88.11, ALMA-13B-LoRA 79.48 / 76.00 / 87.16, ALMA-13B-R 80.55 / 78.97 / 89.74. ALMA-13B-R 的 KIWI-22 与冠军持平, 另外两项高于冠军和 TowerInstruct. 相对 ALMA-13B-LoRA, 三项分别涨 1.07, 2.97, 2.58, 按第 3.1 节的 Kocmi 阈值 (KIWI-22 0.53, 另两项 1.24) 都过了 80% 一致线. 附录 G 分方向: en$\to$zh 的 KIWI-XXL 从 72.95 到 78.17, en$\to$ru 从 76.02 到 81.52, en$\to$de 从 73.40 到 77.05. WMT'23 的冠军系统按人工排名 (DA+SQM) 选取; en$\leftrightarrow$ru 没有人工排名, 改用 COMET-22 最高的系统 (附录 E, Table 14).

附录 A 的标题之一是「Stop Using BLEU」. en$\to$xx 平均 BLEU: ALMA-13B-LoRA 31.87, ALMA-13B-R 27.03, GPT-4 33.23, WMT 冠军 38.98; 神经无参考指标上升, 词面重合指标下降. 一个例子是 cs$\to$en: WMT 冠军 BLEU 64.14, 比其他模型高约 20 个点, 但无参考指标显示它的译文不如 ALMA-R 和 GPT-4 (冠军 KIWI-XXL 82.53, ALMA-13B-R 83.75, GPT-4 83.55). 论文的假设是 WMT 系统在与测试集高度相关的领域数据上训练, 词面重合高, 语义深度不足. BLEU 适合评估较弱模型的基本能力, 对能生成多样译文的强模型意义下降.

COMET-22 这类神经参考型指标与无参考指标更一致: en$\to$xx 上 ALMA-13B-R 87.74, GPT-4 87.68. 但参考本身常常不如系统译文, 两者仍有不一致: xx$\to$en 上 XCOMET 判 ALMA-R 高于冠军 (89.11 对 87.13), COMET-22 判冠军更高 (85.21 对 85.60). 论文按 Freitag 等 (2023) 的建议主张使用无参考模型. 附录 A 还比较了 Google Translate, NLLB-3.3B, MADLAD-10B, GPT-3.5 (`text-davinci-003`) 等, ALMA-13B-R 在多数情况下超过 Google Translate. en$\to$xx 平均 KIWI-XXL / XCOMET: GPT-3.5 是 75.99 / 88.10, MADLAD-10B 是 79.46 / 89.10, 零样本的 LLaMA-2-13B 只有 41.37 / 73.46, ALMA-13B-R 是 85.74 / 94.05. Google Translate 在 en$\to$de 上的 KIWI-XXL 85.33 和 XCOMET 97.60 都高于 ALMA-13B-R 的 84.25 和 97.48, 这是 ALMA-13B-R 没有超过它的方向之一. Google Translate, NLLB-3.3B 和 Bayling-13B 的输出直接取自 Zhang 等 (2023) 报告的译文, 部分冰岛语结果因此缺失.

**ALMA-7B-R.** 用同一份偏好数据对 ALMA-7B-LoRA 做 CPO. en$\to$xx 平均 KIWI-22 / KIWI-XXL / XCOMET 从 81.76 / 80.80 / 91.67 升到 82.62 / 83.34 / 92.47; xx$\to$en 从 80.05 / 80.50 / 84.23 升到 80.87 / 81.39 / 87.92. en$\to$xx 平均 BLEU 从 29.78 降到 25.41, 与 13B 上 31.87 到 27.03 的方向一致. 7B-R 的提升明显, 仍低于 13B-R.

## 4. 增益从哪里来

### 4.1 译文变好还是迎合打分模型

偏好数据由无参考模型挑选, 评估也用同样的模型, 所以要检查是否在「作弊」. 论文分两层回答.

**指标层 (Table 6).** 只用 KIWI-XXL 或只用 XCOMET 重新构造偏好数据, 再训 CPO. xx$\to$en 平均 KIWI-22 / KIWI-XXL / XCOMET: 只用 KIWI-XXL 是 81.33 / 82.59 / 88.82; 只用 XCOMET 是 81.27 / 82.33 / 89.17; 两者平均 (原设定) 是 81.33 / 82.43 / 89.11. en$\to$xx 对应是 83.31 / 85.87 / 93.97, 83.09 / 85.43 / 94.09, 83.34 / 85.74 / 94.05. 用哪个模型挑数据, 并没有让那个模型的分数单独偏高, 三种设定在所有指标上的提升相近. COMET 系列模型训练方式相近, 可能彼此正相关, 附录 H 又用了非 COMET 的参考型神经指标 BLEURT-20: xx$\to$en 平均从 73.96 升到 74.79, en$\to$xx 从 75.02 升到 76.04.

**方法层.** 如果迎合指标很容易, 那么在同一份「指标偏好」数据上用 SFT 或 DPO 也应该把分数刷上去. 实际上 Table 3 里两者在 en$\to$xx 上反而降低了这些指标. 论文的立场是: SFT 和 DPO 都没能靠指标偏差获益, CPO 作为 DPO 的近似, 在同一份数据上的提升也不太可能只来自指标偏差.

**人工评估 (Table 7).** 选 zh$\to$en 方向, 与第 1.1 节的例子一致. 从 1875 句测试句里抽 400 个样本, 每个样本含中文源句和两条英文译文, 分别来自 ALMA-13B-LoRA 和 ALMA-13B-R. 四位中英双语者按 Kocmi 等 (2022) 的方法打 0 到 6 分: 0 表示译文无意义; 2 表示部分保留原意, 但有大量错误或遗漏; 4 表示基本保留原意, 只有轻微语法问题; 6 表示完美. 每人评 100 个样本, 译文顺序随机.

| | 平均分 $\uparrow$ | 平均名次 $\downarrow$ | 平均胜率 (%) | 平局 (%) |
|---|---|---|---|---|
| ALMA-13B-LoRA | 4.86 | 1.60 | 62.50 | 40.30 |
| ALMA-13B-R | 5.16 | 1.40 | 77.80 | 40.30 |

读表: 平局时双方都算赢, 所以两行胜率之和超过 100%. 平局占 40.30%, 两个模型本来都能译出合格的句子; 平均分, 名次和胜率都是 ALMA-13B-R 更好. 论文据此认为用 KIWI-XXL 和 XCOMET 构造偏好数据并做评估是可靠的.

### 4.2 消融

**损失两项 (Figure 4 左).** 只用 $\mathcal{L}_{\mathrm{prefer}}$ 或只用 $\mathcal{L}_{\mathrm{NLL}}$ 重新训练. 只用 $\mathcal{L}_{\mathrm{NLL}}$ 就是在 preferred 数据上 SFT. 两项都有时效果最好, 缺任何一项都下降. 论文正文没有列出这张图的数值.

**在 DPO 上加 BC 正则 (附录 I, Table 18).** 把同一项 NLL 加到原版 DPO 上, 得到 $\mathcal{L}_{\mathrm{DPO}}+\mathcal{L}_{\mathrm{NLL}}$:

| 目标 | xx$\to$en | en$\to$xx | 显存 | FLOPs/token |
|---|---|---|---|---|
| $\mathcal{L}_{\mathrm{DPO}}$ | 80.51 / 81.36 / 86.58 | 82.27 / 82.07 / 92.25 | $2\times$ | $2\times$ |
| $\mathcal{L}_{\mathrm{DPO}}+\mathcal{L}_{\mathrm{NLL}}$ | 81.28 / 82.42 / 89.05 | 83.13 / 84.74 / 93.53 | $2\times$ | $2\times$ |
| $\mathcal{L}_{\mathrm{prefer}}+\mathcal{L}_{\mathrm{NLL}}$ (CPO) | 81.33 / 82.43 / 89.11 | 83.34 / 85.74 / 94.05 | $1\times$ | $1\times$ |

读表:

- 加上 NLL 后 DPO 在两个方向上都明显提升, en$\to$xx 的 KIWI-XXL 从 82.07 到 84.74. 论文据此解释为什么作为近似的 $\mathcal{L}_{\mathrm{prefer}}$ 有效而原版 DPO 无效: 原版 DPO 缺少把模型拉向 preferred 分布的 BC 正则.
- DPO 加 BC 正则后效果接近 CPO, 但前向的显存和每 token FLOPs 都是两倍. CPO 在两个方向上还略高于它, en$\to$xx 的 KIWI-XXL 高 1.0.

**三元组来源 (Figure 4 右).** 从三元组中去掉 ALMA 或 GPT-4 的译文后重训. 去掉 ALMA 数据, en$\to$xx 明显下降; 去掉 GPT-4 数据, xx$\to$en 明显下降. 两个系统生成的数据都有用.

**负例质量 (Table 8).** $y_w$ 仍取三元组里的最高分, $y_l$ 换成对 $y_w$ 人工加噪的版本: 按 Zeng 等 (2023) 的做法, 以 0.15 的概率随机删词, 以 0.3 的概率在窗口 1 内交换相邻词. 平均 KIWI-22 / KIWI-XXL / XCOMET:

| 负例 | xx$\to$en | en$\to$xx |
|---|---|---|
| 人工加噪 | 81.01 / 82.18 / 88.23 | 82.71 / 83.13 / 92.80 |
| 自然低分译文 (原设定) | 81.33 / 82.43 / 89.11 | 83.34 / 85.74 / 94.05 |

读表: 两个方向三项指标都是自然负例更好, en$\to$xx 的 KIWI-XXL 差 2.61. 人工加噪产生的是明显更差, 也更不自然的译文, 偏好项从中学不到如何避免接近正确但有遗漏的译文.

## 5. 相邻方法与边界

### 5.1 与相邻方法对比

| | 数据 | 冻结 $\pi_{\mathrm{ref}}$ | 偏好项 | 额外项 |
|---|---|---|---|---|
| DPO | 成对 | 需要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 之差过 $\log\sigma$ | 无 |
| CPO | 成对 (三元组取两端) | 不需要 (均匀 $U$) | $\beta\log\pi_\theta$ 之差过 $\log\sigma$ | $y_w$ 的 NLL |
| SimPO | 成对 | 不需要 | $(\beta/\lvert y\rvert)\log\pi_\theta$ 之差减间隔 $\gamma$ | 无 |
| ORPO | 成对 | 不需要 | 几率比 | chosen 的 NLL |
| SLiC-HF | 成对 | 不需要 | 带间隔的 rank hinge | 对参考的交叉熵 |
| IPO | 成对 | 需要 | 对数比之差的平方回归 | 无 |

读表:

- CPO 和 [04-SimPO](../05-SimPO-无参考长度平均/05-SimPO-无参考长度平均.md) 都不加载参考模型. SimPO 的分数除以长度并减去间隔 $\gamma$, 没有 BC 正则; CPO 的对数概率不除长度, 有 NLL 项. TRL 用同一个 Trainer 实现两者, 区别就在 `loss_type` 和 `cpo_alpha`.
- [02-ORPO](../04-ORPO/04-ORPO.md) 也是「SFT 项加一个偏好项」, 偏好项用的是几率比. CPO 的起点是已经 SFT 过的 ALMA-13B-LoRA.
- [01-SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) 的校准项是 hinge, 超过间隔后梯度为 0; CPO 的偏好项是 logistic, 梯度随间隔增大而变小. SLiC-HF 的正负对来自 SFT 采样加排序器, CPO 的来自 QE 打分的三元组.
- [02-RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) 的分数做了长度归一, CPO 没有.
- [03-IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) 仍需要 $\pi_{\mathrm{ref}}$, 损失是平方回归.

### 5.2 失效与边界

| 现象 | 原因 | 出处 |
|---|---|---|
| 原版 DPO 在这份数据上降分 | 缺少把模型拉向 preferred 分布的 BC 正则 | Table 3, 4, 18 |
| 只在 preferred 上 SFT, en$\to$xx 略降 | 只模仿, 没有负例 | Table 3 |
| 负例用人工加噪, 效果下降 | 负例太假, 学不到细节上的取舍 | Table 8 |
| BLEU 下降 | 词面重合与神经无参考指标不一致 | 附录 A |
| 人标偏好几乎没带来提升 | 平局多, 标注有偏差 | 附录 D |
| 偏好构造和评估共用 COMET 系模型 | 指标可能相关 | Table 6, 附录 H, Table 7 |

逐行补充:

- 第一行说明 CPO 的增益有很大一部分来自 NLL 项. 附录 I 的结论是 DPO 加上 BC 正则也能接近 CPO, 只是成本翻倍. 只拿掉式 (4) 的参考模型而不加 NLL, 就是 Figure 4 左里「只用 $\mathcal{L}_{\mathrm{prefer}}$」的设定, 效果也会下降.
- 定理 1 给的是上界, 依赖 $\pi_w(y_w\mid x)=1$ 的理想假设. 式 (5) 的对数概率不除长度, 长度不同的 $y_w$ 和 $y_l$ 之间的比较会混入长度因素; 论文没有讨论这一点, 这一条是按式 (5) 的形式推出来的.
- 实验只做了机器翻译的十个方向, 偏好来自 QE 打分的三元组, 起点是经过单语续训和平行句 SFT 两个阶段的 ALMA. 换到对话或其他任务, 要能构造出同样「高质量但不完美」的负例; 论文没有在别的任务上做实验.
- 训练期不从当前策略采样, 偏好数据一次构造完. 需要在线探索的任务不在这篇的范围内.

## 参考文献

1. Xu, H., Sharaf, A., Chen, Y., Tan, W., Shen, L., Van Durme, B., Murray, K., & Kim, Y. J. (2024). [Contrastive Preference Optimization: Pushing the Boundaries of LLM Performance in Machine Translation](https://arxiv.org/abs/2401.08417). *ICML*. [arXiv HTML](https://arxiv.org/html/2401.08417). 代码与模型: [fe1ixxu/ALMA](https://github.com/fe1ixxu/ALMA).
2. Xu, H., Kim, Y. J., Sharaf, A., & Awadalla, H. H. (2023). [A Paradigm Shift in Machine Translation: Boosting Translation Performance of Large Language Models](https://arxiv.org/abs/2309.11674).
3. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
4. Hejna, J., Rafailov, R., Sikchi, H., Finn, C., Niekum, S., Knox, W. B., & Sadigh, D. (2023). [Contrastive Preference Learning: Learning from Human Feedback without RL](https://arxiv.org/abs/2310.13639).
5. Rei, R., et al. (2023). [Scaling up CometKiwi: Unbabel-IST 2023 Submission for the Quality Estimation Shared Task](https://arxiv.org/abs/2309.11925).
6. Guerreiro, N. M., et al. (2023). [xCOMET: Transparent Machine Translation Evaluation through Fine-grained Error Detection](https://arxiv.org/abs/2310.10482).
7. Freitag, M., et al. (2023). [Results of WMT23 Metrics Shared Task: Metrics Might Be Guilty but References Are Not Innocent](https://aclanthology.org/2023.wmt-1.51/). *WMT*.
8. Kocmi, T., Zouhar, V., Federmann, C., & Post, M. (2024). [Navigating the Metrics Maze: Reconciling Score Magnitudes and Accuracies](https://arxiv.org/abs/2401.06760).
9. Hendy, A., et al. (2023). [How Good Are GPT Models at Machine Translation? A Comprehensive Evaluation](https://arxiv.org/abs/2302.09210).
10. NLLB Team. (2022). [No Language Left Behind: Scaling Human-Centered Machine Translation](https://arxiv.org/abs/2207.04672).
11. Zeng, J., Meng, F., Yin, Y., & Zhou, J. (2023). [TIM: Teaching Large Language Models to Translate with Comparison](https://arxiv.org/abs/2307.04408).
12. Sellam, T., Das, D., & Parikh, A. (2020). [BLEURT: Learning Robust Metrics for Text Generation](https://aclanthology.org/2020.acl-main.704/). *ACL*.
13. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734).
14. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
15. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
16. Hugging Face. [TRL CPO Trainer](https://huggingface.co/docs/trl/en/cpo_trainer).
