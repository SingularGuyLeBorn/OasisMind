---
title: "02 · Muon 新解: 重建损失视角下的矩阵优化器"
published: true
tags: ["Muon", "矩阵优化器", "正交化", "重建损失", "对比学习", "ARO", "Frank-Wolfe"]
excerpt: "知乎文章「Muon新解」提出, 以 Muon 为代表的矩阵优化器隐式带着一个重建损失: 正交权重让转置成为逆. 从线性层的重建误差推到 ARO 的交替优化, 再对照 OPQ 量化和 Frank-Wolfe."
---
# 02 · Muon 新解: 重建损失视角下的矩阵优化器

## 1. 已有的五种解释与各自的缺口

### 1.1 谱范数下的最速下降

Muon 对二维参数的更新是动量矩阵的正交化: 记动量矩阵 $M = U\Sigma V^\top$ 为紧凑 SVD, 更新方向取 $\mathrm{msign}(M) = UV^\top$, 实际用 Newton-Schulz 迭代逼近 (推导见 [01 篇](../01-Muon优化器专题/01-Muon优化器专题.md) 第 3 节). 为什么正交化有效, 目前有好几种解释. 知乎作者在 [Muon新解](https://zhuanlan.zhihu.com/p/2021649476964610281) 一文里先把五种已有说法逐一过了一遍, 再提出自己的重建损失解释. 本文按这篇文章的顺序展开, 补上其中省略的推导.

第一种解释最常见: Muon 是谱范数约束下的最速下降 ([科学空间: Muon优化器赏析](https://kexue.fm/archives/10592); [Bernstein: Deriving Muon](https://jeremybernste.in/writing/deriving-muon)). 推导很短. 在梯度 $G$ 处, 一阶近似下损失的变化是 $\langle G, \Delta W\rangle = \mathrm{tr}(G^\top \Delta W)$, 要在 $\|\Delta W\|_2 \le \eta$ 的约束下让它最小. 把 $G$ 写成 $\sum_i \sigma_i u_i v_i^\top$, 有

$$
\langle G, \Delta W\rangle = \sum_i \sigma_i\, u_i^\top \Delta W v_i \ge -\eta \sum_i \sigma_i, \tag{1}
$$

因为谱范数不超过 $\eta$ 的矩阵对任意单位向量满足 $|u_i^\top \Delta W v_i| \le \eta$. 取 $\Delta W = -\eta UV^\top$ 时每一项都等于 $-\eta\sigma_i$, 下界取到. 所以谱范数球上的最速下降方向就是 $-UV^\top$, 和 Muon 一致.

作者对这条解释的评价是接近同义反复: 它只是把「为什么正交化好」换成了「为什么谱范数好」, 后一个问题同样没有答案. 这条路线的价值在于打开了搜索空间, 换一个范数就能推出一个新优化器, 例如 $\ell_\infty$ 范数推出符号下降, Frobenius 范数推出普通梯度下降 ([Bernstein & Newhouse, 2024](https://arxiv.org/abs/2409.20325) 表 1). 至于哪个范数更适合神经网络, 这个框架本身不给判据.

Bernstein 的 Deriving Muon 试图补上这个判据. 他把线性层看成从输入激活到输出激活的映射, 用 RMS 范数 $\|v\|_{\mathrm{RMS}} = \|v\|_2/\sqrt{d}$ 衡量激活大小, 对应的算子范数是 $\|W\|_{\mathrm{RMS}\to\mathrm{RMS}} = \sqrt{d_{\mathrm{in}}/d_{\mathrm{out}}}\,\|W\|_2$. 由 $\|\Delta W x\|_{\mathrm{RMS}} \le \|\Delta W\|_{\mathrm{RMS}\to\mathrm{RMS}}\|x\|_{\mathrm{RMS}}$, 约束这个范数就是约束一步更新让输出激活改变多少. 在它下面求最速下降, 得到 $\Delta W = -\eta\sqrt{d_{\mathrm{out}}/d_{\mathrm{in}}}\,UV^\top$, 比式 (1) 多了一个按形状的缩放. 他报告的收益是学习率能在不同宽度之间迁移. 这给了谱范数一个来自激活尺度的理由, 但作者的问题仍然成立: 控制激活变化为什么会让训练更快, 这一步还是要靠实验.

### 1.2 数据不平衡与有效秩

第二种解释说 Muon 缓解了数据或特征的不平衡: 梯度矩阵里少数大奇异值方向占了主导, 正交化把所有方向拉到同一尺度, 相当于给小方向加权. 作者把类别不平衡问题里的常用技术搬到特征和梯度层面做了尝试, 没有发现显著收益, 所以认为这条解释缺乏实验支持.

第三种解释说 Muon 提高了权重矩阵的有效秩, 降低了条件数. 有效秩有多种定义, 一个简单的量是稳定秩 $\|W\|_F^2 / \|W\|_2^2 = \sum_i \sigma_i^2 / \sigma_1^2$, 奇异值越平, 它越接近真实的秩. 作者确认这个现象存在, 用 Muon 训练出的权重奇异值分布更平, 有效秩提高相当于模型的有效参数变多. 但他在 AdamW 上直接加一个鼓励秩增大的正则项, 效果仍不如矩阵正交化. 作者用古德哈特定律概括这一点: 有效秩是正交化带来的一个可观测结果, 把它直接当优化目标, 指标上去了, 效果却没有跟上. 所以有效秩能描述 Muon, 却不能用来指导改进.

### 1.3 辅助技巧与对称性

第四种解释把功劳归给 Muon 附带的辅助技巧: Nesterov 动量, 动量系数的取值, 以及按矩阵形状缩放的局部学习率. 作者控制了这些变量做对比, 结论是去掉或对齐这些技巧之后, 矩阵正交化依然有优势, 所以主要收益来自正交化本身.

第五种解释来自 ARO ([Gong et al., 2026, arXiv:2602.09006](https://arxiv.org/abs/2602.09006)). 这篇论文把一族矩阵优化器统一写成「旋转的最速下降」

$$
\Delta W_t \propto -\eta\, R_t\, f_t(R_t^\top G_t), \tag{2}
$$

$R_t$ 是一个正交的旋转, $f_t$ 是在旋转后坐标里使用的基础优化器. 取 $R_t$ 为 $G_tG_t^\top$ 的特征向量 (论文称特征旋转), $f_t$ 分别取 Adam, 符号函数和行归一化, 就得到 SOAP, SPlus 和 Muon (论文表 1). ARO 的做法是让 $R_t$ 由 $f_t$ 决定, 用 $R_t = \mathrm{QR}(G_t f_t(R_{t-1}^\top G_t)^\top)$ 更新, 基础优化器默认取 Sinkhorn 式的行列交替归一化. 论文第 6 节把这条更新式解释为对称性传送 (symmetry teleportation) 的一个变体, 利用的是 Transformer 残差流和 $Q$-$K$ 之间的旋转对称性. 论文报告在最大 8B 激活参数和 8 倍过训练的设置下, ARO 相对 AdamW 加速 1.3 到 1.35 倍, 相对 Muon 等正交化方法加速 1.1 到 1.15 倍.

作者在合成数据集上复现出了 ARO 比 Muon 更好的结果, 认为对称性解释有实验支持. 他的保留意见是论证链条复杂, 从参数对称性到具体更新式之间要依赖好几个假设, 而且这条解释没有回答 Muon 自身为什么有效. 下一节的重建损失解释就是想给出一条更短的链条.

## 2. 重建损失: 正交权重让转置成为逆

### 2.1 从对比学习的四种手段出发

作者的出发点是自监督和对比学习里改善表征的常用手段. 他归纳了四类:

1. 拉开正负样本之间的距离.
2. 鼓励同一样本多个视图的表征一致.
3. 要求从表征里能重建出某些信息.
4. 直接约束表征的分布, 防止塌陷.

第 4 类的一个近期例子是 LeJEPA 里的 SIGReg ([Balestriero & LeCun, 2025, arXiv:2511.08544](https://arxiv.org/abs/2511.08544)). 论文证明在一类下游任务上, 各向同性高斯分布是让下游风险最小的嵌入分布, 于是用正则项把表征分布推向它. 具体做法是把嵌入投影到一批随机方向上, 对每个一维投影用基于特征函数的统计检验量衡量它离标准正态有多远, 再对各方向取平均作为损失. 计算量对样本数和维度都是线性的, 核心代码约 50 行. 论文用这一个正则项替代了 JEPA 类方法常用的停止梯度, 教师-学生网络等启发式部件, 用 ViT-H/14 在 ImageNet-1K 上做线性探测达到 79%. 作者评价这个方法简洁且实测有收益.

作者的核心论点是这几类手段彼此相通: 鼓励信息可重建会改善表征分布, 约束表征分布也有利于重建信息, 实验里这些指标经常一起变好. 如果矩阵优化器隐式地带着第 3 类损失, 那么「Muon 为什么好」就可以归约到「重建损失为什么能改善表征」, 后者在表征学习里有大量现成的研究可以借用.

### 2.2 推导: 线性层的转置重建误差

考虑一个线性层 $y = Wx$, $W \in \mathbb{R}^{m \times n}$. 作者提出的重建方式是用转置把输出映回输入, $\hat{x} = W^\top y$. 重建误差为

$$
\|\hat{x} - x\|_2^2 = \|W^\top W x - x\|_2^2 = \|(W^\top W - I)x\|_2^2. \tag{3}
$$

对输入分布取期望, 记 $\mathbb{E}[xx^\top] = \Sigma_x$, 有

$$
\mathbb{E}\,\|(W^\top W - I)x\|_2^2 = \mathrm{tr}\big((W^\top W - I)\,\Sigma_x\,(W^\top W - I)\big). \tag{4}
$$

输入各向同性时 $\Sigma_x = I$, 式 (4) 化为 $\|W^\top W - I\|_F^2$. 把 $W$ 写成 SVD $W = U\Sigma V^\top$, $W^\top W - I = V(\Sigma^\top\Sigma - I)V^\top$, 所以

$$
\|W^\top W - I\|_F^2 = \sum_{i=1}^{n} (\sigma_i^2 - 1)^2, \tag{5}
$$

其中 $m < n$ 时多出来的 $\sigma_i$ 记为 0. 当 $m \ge n$ 时, 式 (5) 等于 0 当且仅当所有奇异值都等于 1, 即 $W^\top W = I$, $W$ 的列正交. 这时转置就是左逆, 对任意 $x$ 都能精确重建. 当 $m < n$ 时 $W^\top W$ 的秩至多为 $m$, 误差至少是 $n - m$, 取到这个下界的是行正交的 $W$ ($WW^\top = I$).

输入不是各向同性时结论不变, 只是各方向的权重不同. 记 $E = W^\top W - I$, 它是对称矩阵, 式 (4) 等于 $\mathrm{tr}(E\Sigma_x E) = \|\Sigma_x^{1/2}E\|_F^2$. 只要 $\Sigma_x$ 满秩, 这个量为 0 当且仅当 $E = 0$. 所以零误差的条件始终是 $W^\top W = I$, 输入分布只影响 $W$ 偏离正交时各个方向被罚多重: 方差大的输入方向上, 奇异值偏离 1 的代价更高.

这就是作者说的「正交矩阵与可逆性」: 正交性等价于转置可以当逆用. ARO 把 Muon 看成坐标系旋转和对称性的问题, 重建视角则把它看成可逆性和信息保留的问题. 式 (5) 还说明了这个损失惩罚的具体是什么: 每个奇异值偏离 1 的程度, 大奇异值 (信号被放大) 和小奇异值 (信号被压掉) 一样受罚. 这和 1.2 节的有效秩观察是同一个现象的两种描述, 区别在于式 (5) 给出了一个可以直接优化的目标.

### 2.3 为什么用转置, 损失算在哪一层

一个自然的疑问是为什么用 $W^\top$ 重建, 而不是另学一个解码矩阵. 作者引用了 Bilinear MLP 的工作 ([Pearce et al., 2024, arXiv:2410.08417](https://arxiv.org/abs/2410.08417)): 该文用权重的转置把输出空间的方向映回输入空间做可视化和解释. 作者就此问过论文作者为什么可以这样做, 得到的回答是伴随算子: 对内积 $\langle Wx, y\rangle = \langle x, W^\top y\rangle$, $W^\top$ 是 $W$ 的伴随, 它是在不额外引入参数的前提下从输出回到输入的标准方式. 只有当 $W$ 正交时, 伴随才同时是逆.

作者强调, 这个重建损失约束的是**权重**, 不是更新量. Muon 每一步的更新 $UV^\top$ 是半正交的, 但权重本身并不正交; 优化器如何把「更新正交」转化为对权重重建误差的隐式约束, 第 3 节的交替优化推导和第 4.3 节的 Frank-Wolfe 视角各给了一部分回答. 另一个问题是粒度. 对一个两层 MLP, 忽略中间的非线性, 输入端的重建误差是

$$
\|(W_1^\top W_2^\top W_2 W_1 - I)x\|_2^2. \tag{6}
$$

$W_1$ 和 $W_2$ 各自列正交时, 乘积 $W_2W_1$ 也列正交, 式 (6) 为 0; 反过来乘积正交并不要求每个因子正交. Muon 逐个矩阵做正交化, 对应的是最细的粒度. 作者在 CIFAR-10 实验里统计的正是 MLP 级别的重建损失 (见 3.3 节).

## 3. ARO 是输出端的重建: 交替优化的推导

### 3.1 多视图一致性损失

式 (3) 是输入端的重建: 先过 $W$, 再用 $W^\top$ 回到输入. 作者认为 ARO 对应的是另一种形式, 输出端的重建, 或者说第 2.1 节里的多视图一致性. 设想同一个输入 $x$ 有两条路径到达输出: 一条是 $Wx$, 另一条先经过一个带结构约束的矩阵 $V$, 再经过一个正交旋转 $R$, 得到 $RVx$. 要求两条路径一致:

$$
\min_{R,\,V}\ \mathbb{E}\,\|RVx - Wx\|_2^2 \quad \text{s.t.}\ R^\top R = I,\ V \in \mathcal{S}. \tag{7}
$$

输入各向同性时目标化为 $\|RV - W\|_F^2$. 这里 $\mathcal{S}$ 是一个约束集合, 在 ARO-Sinkhorn 里对应行列都被归一化的矩阵. 式 (7) 的含义是把 $W$ 分解成「一个旋转」乘「一个结构规整的矩阵」, 分解越精确, 两个视图越一致.

和式 (3) 对照, 两者的区别在于正交性落在哪里. 式 (3) 要求 $W$ 自身正交; 式 (7) 只要求分解里的 $R$ 正交, $W$ 可以不正交, 正交性被转移给了一个辅助变量. 这个区别在 3.3 节会决定 ARO 和 Muon 何时重合.

### 3.2 交替求解与 ARO 更新式

式 (7) 有两组变量, 自然的解法是交替优化. 固定 $R$, 由于 $R$ 正交, $\|RV - W\|_F = \|V - R^\top W\|_F$, 问题变成把 $R^\top W$ 投影到集合 $\mathcal{S}$ 上:

$$
V = \mathrm{Proj}_{\mathcal{S}}(R^\top W) =: f(R^\top W). \tag{8}
$$

固定 $V$, 展开 $\|RV - W\|_F^2 = \|V\|_F^2 + \|W\|_F^2 - 2\,\mathrm{tr}(R^\top W V^\top)$, 问题变成在正交矩阵上最大化 $\mathrm{tr}(R^\top W V^\top)$, 这是正交 Procrustes 问题. 记 $WV^\top = P\Lambda Q^\top$, 最优解是

$$
R = PQ^\top = \mathrm{Polar}(WV^\top). \tag{9}
$$

两步合起来, 用当前权重的分解得到下一步的权重, 作者写出的迭代是

$$
W_{t+1} = R_t\, f(R_t^\top W_t), \qquad R_t = \mathrm{Polar}(W_t V_t^\top). \tag{10}
$$

式 (10) 和 ARO 更新式 (2) 的形状完全一致: 先旋转到 $R^\top$ 坐标, 在里面做投影 $f$, 再旋转回来. 作者最初把式 (9) 写成 $R = \mathrm{QR}(WV^\top)$, 和 ARO 论文的选择相同, 随后改正为 Polar, 因为 Procrustes 问题的精确解是极分解. 但他实测发现 Polar 版反而不如 QR 版. ARO 论文附录 C.2 「Failure of Polar projection scheme」讨论了同一现象: 在 MNIST 实验里, 用极分解求旋转在无噪声时表现良好, 换成小批量训练后效果大幅下降. 论文的解释是极分解版本精确地追随带噪声的梯度, 对齐分数 (更新与真实梯度的内积) 的方差变大, 训练时常在下降和上升之间来回摆动; 特征旋转和 ARO 旋转牺牲一部分对齐幅度, 换来更小的方差.

ARO 论文对自己的旋转更新给了另一种读法. 乘积 $G_t f_t(R_{t-1}^\top G_t)^\top$ 是原始梯度和「基础优化器在上一步旋转坐标里给出的更新」之间的交叉 Gram 矩阵, 对它做 QR, 得到的是与基础优化器变换耦合最强的那组梯度方向. 把 $f_t$ 取成恒等映射, 更新式就退化成求特征向量的经典幂迭代 $R_t = \mathrm{QR}(G_tG_t^\top R_{t-1})$, 这也是特征旋转一族方法 (SOAP 等) 计算旋转的方式. 论文把旋转的选择写成最大化瞬时下降率 $\mathcal{J}(R; G, f) = \langle G, R f(R^\top G)\rangle$, 在 130M nanoGPT 训练中逐步比较, ARO 旋转在大多数参数上的 $\mathcal{J}$ 都高于精确的特征旋转. 这和作者的推导在方向上一致: 两边都是在给定 $f$ 的前提下, 用一个 Procrustes 型的子问题来选旋转.

作者还试了把输入端和输出端两个损失加在一起, $\|RV - W\|_F^2 + \|W^\top W - I\|_F^2$. 对应的迭代变成 $W_{t+1} = \mathrm{Polar}(R_t f(R_t^\top W_t))$, 即在式 (10) 外面再做一次正交化. 这个版本和 QR 版效果持平.

### 3.3 V 也限制为正交时退化成 Muon

如果把约束集合 $\mathcal{S}$ 也取成正交矩阵, 式 (8) 的投影就是 Polar. 对正交方阵 $R$ 和 $W = U\Sigma V_W^\top$, $R^\top W = (R^\top U)\Sigma V_W^\top$ 仍是一个 SVD, 因为 $R^\top U$ 的列仍然正交. 所以 $\mathrm{Polar}(R^\top W) = R^\top U V_W^\top = R^\top \mathrm{Polar}(W)$, 代入式 (10):

$$
R\,\mathrm{Polar}(R^\top W) = RR^\top\, \mathrm{Polar}(W) = \mathrm{Polar}(W). \tag{11}
$$

旋转完全抵消, 剩下的就是对矩阵做正交化, 也就是 Muon 对动量矩阵做的那一步. 在这个框架里, Muon 是 ARO 在 $f = \mathrm{Polar}$ 时的特例, 旋转选什么都无所谓. ARO 论文的表 1 给出的是另一种对应: Muon 等于特征旋转加行归一化. 作者不同意后一种写法, 他的理由是式 (11) 说明 Muon 本身与旋转无关, 把它写成依赖特征旋转的形式掩盖了这一点.

作者在 CIFAR-10 上用一个小型 ViT (基于 vits-for-small-scale-datasets 代码) 做了验证, 统计各优化器训练出的权重在 MLP 级别的重建损失 (式 (6)). 结果是 ARO-Sinkhorn 的 MLP 重建损失最低, 分类效果也最好. 这与重建视角的预测一致: 在这组实验里, 重建损失越低的优化器表现越好.

## 4. 和量化, Frank-Wolfe 的对照

### 4.1 OPQ: 向量量化里的同一套交替

式 (7) 到式 (10) 的交替优化在近邻搜索里早有先例. OPQ ([Ge, He, Ke & Sun, CVPR 2013](https://people.csail.mit.edu/kaiming/publications/cvpr13opq.pdf)) 在乘积量化之前先对数据做一个正交旋转 $R$, 目标是让旋转后的数据量化误差最小:

$$
\min_{R,\,C}\ \sum_x \|Rx - c(Rx)\|_2^2 \quad \text{s.t.}\ R^\top R = I, \tag{12}
$$

$c(\cdot)$ 把向量映到码本里最近的码字. OPQ 的非参数解法同样是交替: 固定 $R$, 在各子空间上做 k-means 更新码本; 固定码字, 求解一个正交 Procrustes 问题更新 $R$, 解由 SVD 给出.

作者把两边列成对照: 量化里的旋转 $R$ 对应矩阵优化器里的 $R$, 码本对应约束集合 $\mathcal{S}$, 把向量映到最近码字对应投影 $f$. 他由此提出几个问题: 量化领域对旋转和码本的大量改进能否搬到优化器上, 以及优化器的 $f$ 是否也可以像码本一样学出来. 他同时承认直觉上量化本身并不会让训练变好, 所以这个对照目前只说明两者共享同一类交替优化结构, 还不能说明量化的经验可以直接迁移.

### 4.2 f 投影到正交矩阵的子集

3.3 节说明 $f = \mathrm{Polar}$ 时退化成 Muon, $f$ 取 Sinkhorn 归一化时得到 ARO-Sinkhorn. ARO 论文里的 Sinkhorn 基础函数来自同组的 SinkGD: 对梯度矩阵做 $L$ 轮行和列的 $\ell_2$ 归一化, 默认 $L = 5$, ARO 把原版的行列交替归一化改成同时进行. SinkGD 不维护任何滑动平均状态, 因此 ARO-Sinkhorn 只需存旋转 $R_t$ 和动量 $M_t$ 两份状态, 显存开销与 AdamW 相同; 论文报告大规模模型上它的吞吐只比 AdamW 慢约 1%. 论文第 5 节还做了一组消融: 用快速的 SCQR 分解时, ARO 旋转相对特征旋转的优势有很大一部分来自改善了 QR 的数值条件; 换成标准 QR 后差距缩小, 但在 Sign 和 Sinkhorn 两族上损失差仍有约 0.02 和 0.008.

在重建视角下, 这些 $f$ 的区别在于约束集合 $\mathcal{S}$ 的形状: 正交矩阵集合要求所有奇异值为 1, Sinkhorn 归一化要求行列范数均衡, 两者并不包含彼此. 作者据此提出, 更好的 $f$ 应当把矩阵投影到正交矩阵的一个子集上, 同时满足正交和别的结构约束. 一个具体的尝试是 $f = \mathrm{Polar} \circ \mathrm{Sink}$, 先做 Sinkhorn 归一化再正交化, 实测效果也不错.

另一个尝试是作者称为 URV 的优化器: 把更新写成 $\tilde{W} = URV^\top$, 其中 $U, V$ 来自 SVD, 中间的 $R$ 要求满足 $R_1^\top \Sigma R_2$ 为对角且各对角元均衡, 意图是在正交化之外再控制奇异值的分配. 作者报告的结果不确定, 没有给出明确优于 Muon 或 ARO 的结论.

### 4.3 Frank-Wolfe: 极点牵引还是球内轨迹

作者的最后一组补充从约束优化的角度看 Muon. Frank-Wolfe 方法在一个凸集 $\mathcal{C}$ 上优化, 每步先解线性最小化子问题 $S_t = \arg\min_{S \in \mathcal{C}} \langle G_t, S\rangle$, 再在当前点和 $S_t$ 之间插值, $W_{t+1} = (1-\gamma)W_t + \gamma S_t$. 取 $\mathcal{C}$ 为半径 $1/\lambda$ 的谱范数球, 由式 (1) 的推导, $S_t = -\frac{1}{\lambda}UV^\top$. 令 $\gamma = \eta\lambda$, 插值式展开为

$$
W_{t+1} = (1 - \eta\lambda) W_t - \eta\, UV^\top, \tag{13}
$$

正好是带解耦权重衰减的 Muon. 谱范数球的极点是所有奇异值都等于半径的矩阵, 也就是缩放后的 (半) 正交矩阵, 所以每一步都在向一个正交极点插值. 同样的推导用在 $\ell_\infty$ 球上, 立方体的极点是符号向量, 得到带权重衰减的 SignSGD. [Lions and Muons (Sfyraki & Wang, 2025, arXiv:2506.04192)](https://arxiv.org/abs/2506.04192) 把带权重衰减的 Lion 和 Muon 都写成随机 Frank-Wolfe 的实例, 并给出了收敛到约束问题 KKT 点的保证. 他们的收敛度量是 Frank-Wolfe 间隙, 即 $\max_{S\in\mathcal{C}}\langle G_t, W_t - S\rangle$, 它是非凸 Frank-Wolfe 方法常用的平稳性指标; 论文还针对梯度噪声的重尾分布给出两个鲁棒变体, 不需要大批量就有理论保证, 由此得到 Lion 和 Muon 的新版本.

从式 (13) 还能读出权重衰减系数的作用. 约束球的半径是 $1/\lambda$, 当 $\eta\lambda \le 1$ 且 $W_t$ 的谱范数不超过 $1/\lambda$ 时, 由 $\|W_{t+1}\|_2 \le (1-\eta\lambda)/\lambda + \eta = 1/\lambda$, 凸组合保证 $W_{t+1}$ 仍在球内, 所以带权重衰减的 Muon 的权重谱范数始终有上界. 这与 [Muon is Scalable](https://arxiv.org/abs/2502.16982) 的观察一致: 不加权重衰减时, 权重和层输出的 RMS 在长训练中持续增大.

这个视角和第 2 节的联系在于极点: 迭代把权重往正交矩阵的凸组合里拉, 而式 (5) 正是按离正交多远来计分. 作者留下的问题是, Muon 的效果到底来自权重轨迹被限制在谱范数球内, 还是来自每一步对正交极点的牵引. 前者是一个约束, 后者更接近第 2 节的重建损失. 两种机制在式 (13) 里同时存在, 要分开它们需要专门设计的对照实验.

### 4.4 这一视角目前站得住的部分

把作者的推导和实验放在一起, 可以确认的有三点. 第一, 式 (3) 到式 (5) 说明权重正交等价于转置重建误差为零, 这是纯代数事实. 第二, 输出端重建的交替优化 (式 (10)) 在形式上给出了 ARO 的更新式, 并在 $\mathcal{S}$ 取正交矩阵时退化成 Muon (式 (11)), 把两个优化器放进了同一个框架. 第三, 在作者的 CIFAR-10 ViT 实验里, MLP 级重建损失的高低和分类效果的排序一致.

尚未解决的有两点. 一是 2.3 节提出的机制问题: 更新量正交如何转化为对权重重建误差的约束, Frank-Wolfe 视角给了一条线索, 但还不是证明. 二是实验规模, 作者的验证集中在 CIFAR-10 和合成数据上, 大语言模型上的对照还没有. 与第 1 节的五种解释相比, 重建视角的长处是把问题归约到了表征学习里研究较多的重建损失上, 并且直接给出了可以尝试的新 $f$ (4.2 节).

## 5. 参考文献

1. 知乎. *Muon新解*. https://zhuanlan.zhihu.com/p/2021649476964610281

2. Gong, W., Zazo, J., Luo, Q., Wang, P., Hensman, J., & Ma, C. (2026). *ARO: A New Lens On Matrix Optimization For Large Models*. arXiv:2602.09006. https://arxiv.org/abs/2602.09006

3. Balestriero, R., & LeCun, Y. (2025). *LeJEPA: Provable and Scalable Self-Supervised Learning Without the Heuristics*. arXiv:2511.08544. https://arxiv.org/abs/2511.08544

4. Pearce, M. T., Dooms, T., Rigg, A., Oramas, J., & Sharkey, L. (2024). *Bilinear MLPs enable weight-based mechanistic interpretability*. arXiv:2410.08417. https://arxiv.org/abs/2410.08417

5. Sfyraki, M.-E., & Wang, J.-K. (2025). *Lions and Muons: Optimization via Stochastic Frank-Wolfe under Heavy-Tailed Noise*. arXiv:2506.04192. https://arxiv.org/abs/2506.04192

6. Ge, T., He, K., Ke, Q., & Sun, J. (2013). *Optimized Product Quantization for Approximate Nearest Neighbor Search*. CVPR 2013. https://people.csail.mit.edu/kaiming/publications/cvpr13opq.pdf

7. 苏剑林 (2024). *Muon优化器赏析: 从向量到矩阵的本质跨越*. https://kexue.fm/archives/10592

8. Bernstein, J. (2025). *Deriving Muon*. https://jeremybernste.in/writing/deriving-muon

9. Bernstein, J., & Newhouse, L. (2024). *Old Optimizer, New Norm: An Anthology*. arXiv:2409.20325. https://arxiv.org/abs/2409.20325

10. Jordan, K., et al. (2024). *Muon: An optimizer for hidden layers in neural networks*. https://kellerjordan.github.io/posts/muon/
