---
title: "The Unreasonable Effectiveness of Recurrent Neural Networks"
category: RNN与序列
published: true
excerpt: >-
  Ilya 清单第 11 篇不是论文, 是 Karpathy 2015 年 5 月的一篇博客, 深度学习史上传播最广的博客之一. 当时领域的共识是 RNN
  很难训练, Karpathy 用五个 demo 证明恰恰相反: 一个 350 万参数的 LSTM, 喂莎士比亚就写剧本, 喂 Wikipedia 就写
  markdown, 喂 474MB Linux 源码就写带缩进带注释的 C 代码. 更狠的是激活可视化: 没人硬编码,
  网络自己长出了「引号检测细胞」「URL 检测细胞」. 本帖从五种序列映射模式讲起, 走完训练机制, 五个 demo, 训练演化和可解释
tags:
  - Ilya
  - RNN
  - LSTM
  - char-RNN
  - Karpathy
  - 语言模型
  - 序列建模
  - Ilya推荐30篇
  - 经典论文
---
# The Unreasonable Effectiveness of Recurrent Neural Networks: 一篇博客, 半部语言模型史前史

> 原始文本: Andrej Karpathy, "The Unreasonable Effectiveness of Recurrent Neural Networks", 2015-05-21.
> https://karpathy.github.io/2015/05/21/rnn-effectiveness/
> 这是深度学习史上传播最广的博客之一. 随文发布的 char-rnn 代码库 (Lua/Torch, MIT 协议) 让无数人第一次亲手训练出一个会「写作」的模型. Ilya Sutskever 把它放进给 John Carmack 的 30 篇清单, 排在第 11 位, 刚好是清单从 CNN 视觉群转向序列建模群的入口.

**全文符号表**

本文是博客导读, 公式只有两条 (RNN 更新方程和温度 softmax), 但这两条是 char-RNN 的全部数学. 先一次性登记.

| 符号 | 含义 |
|------|------|
| $t$ | 时间步, 序列里的第几个位置. 字符级模型里一个时间步就是一个字符 |
| $x_t$ | 第 $t$ 步的输入向量, 字符模型里是 1-of-k 编码: 词表 $k$ 个字符, 当前字符对应的位置为 1, 其余为 0 |
| $h_t$ | 第 $t$ 步的隐状态 (hidden state), 模型对「前 $t$ 步历史」的全部记忆压缩在这个向量里, $h_0$ 初始化为零向量 |
| $y_t$ | 第 $t$ 步的输出向量, 每个维度是模型对下一个字符的原始打分 (logit), 可正可负, 未归一化 |
| $W_{hh}$ | 隐状态到隐状态的权重矩阵, 负责把上一步的记忆重组进这一步, 即「记忆」 |
| $W_{xh}$ | 输入到隐状态的权重矩阵, 负责把当前输入写进记忆, 即「输入」 |
| $W_{hy}$ | 隐状态到输出的权重矩阵, 负责把记忆翻译成打分, 即「输出」 |
| $\tanh$ | 双曲正切, 把任意实数压到 $(-1, 1)$, 输入绝对值越大越贴近两端, 接近 0 时近似线性 |
| $z_i$ | 词表里第 $i$ 个字符的 logit (原始打分) |
| $p_i$ | 第 $i$ 个字符被采样的概率 |
| $k$ | 词表大小, 即所有可能字符的个数 (hello 例子里 $k=4$) |
| $T$ | 采样温度 (temperature), 正数, 出现在 softmax 里控制分布的尖锐程度. 本文 $T$ 只有温度一个含义 |
| $\exp$ | 自然指数函数, $\exp(x) = e^x$ |

**读公式的方法**: §3 的更新方程读「记忆怎么流动」: 第一项 $W_{hh} h_{t-1}$ 是旧记忆的线性重组, 第二项 $W_{xh} x_t$ 是新输入的写入, 相加后过 $\tanh$ 就是新记忆; 输出方程单独一行, 记忆乘以 $W_{hy}$ 直接变打分. §5 的温度公式读「$T$ 出现在哪」: 它只出现在 logit 的分母上, $T$ 越小, logit 之间的相对差距被放大得越狠, 分布越尖锐.

## 1. 背景: 2015 年, RNN 还被认为「很难训练」

2015 年 5 月, Andrej Karpathy 写下这篇博客时, 身份是 Stanford 博士生, Fei-Fei Li 实验室成员, 同时是 CS231n 的主讲人. CS231n 就是本清单第 10 篇, 那门课把 CNN 讲成了人人都能听懂的工程课. 同一个人, 同一支笔, 这次的对象换成了 RNN.

博客开头是一段回忆. Karpathy 第一次训练 RNN 是做 Image Captioning, 超参数随便选的, 几十分钟后, 模型就开始生成「勉强说得通」的图像描述. 他当时的震惊不在于结果多好, 而在于结果和模型简陋程度之间的比例失控了. 当时领域的共识是 RNN 很难训练, 梯度消失, 梯度爆炸, 调参玄学. Karpathy 说自己后来的经验恰恰相反: RNN 又稳又皮实, 喂什么学什么.

这种「常识与经验的错位」是整篇博客的暗线. 十年后回看, 这篇博客真正做的事情是把一个被理论吓退多数人的模型, 用五个人人都能看懂的 demo 拉回到桌面上. 标题借用了 Wigner 1960 年那篇著名物理学散文的句式, The Unreasonable Effectiveness of Mathematics in the Natural Sciences. Karpathy 借这个句式表达的是同一种困惑: 这东西凭什么这么好用, 没人真正知道.

## 2. 问题定义: 从固定向量到序列, 五种映射模式

Karpathy 先指出了普通神经网络的 API 缺陷. 一个 vanilla 网络吃固定长度的向量, 吐固定长度的向量, 中间的计算步数也是固定的, 就是层数. 图像分类就是典型: 224x224 的图进去, 1000 类概率出来. 这个 API 处理不了变长输入, 变长输出, 更处理不了「读到哪想到哪」的过程.

RNN 把 API 放宽成序列. 博客用一张五个方块的图概括了全部可能性, 这张图后来出现在无数教材和 slide 里. 从左到右: one-to-one, 固定输入到固定输出, 等价于没有 RNN, 例子是图像分类. one-to-many, 一个输入生成一个序列, 例子是图像描述, 一张图进, 一句话出. many-to-one, 序列输入压成一个输出, 例子是情感分析. many-to-many 异步, 先读完整个输入序列再生成输出序列, 例子是机器翻译, 读完英语再写法语. many-to-many 同步, 输入输出逐帧对齐, 例子是视频逐帧分类.

关键观察是, 这五种模式共享同一个循环变换. 绿色的 state 方块是固定的, 想展开多少步就展开多少步, 序列长度没有任何预设约束. 普通网络在出生那天就被固定步数判了死刑, RNN 没有.

Karpathy 还顺手埋了一个段子: 已知 RNN 在合适权重下是图灵完备的, 可以模拟任意程序. 他紧接着说, 和万能逼近定理一样, 这种话听听就好, 别当真, 「就当我没说」. 但有一句话他是认真的: 如果训练普通网络是在函数空间里做优化, 训练 RNN 就是在程序空间里做优化. 这句话是整篇博客的题眼.

## 3. 模型: 一个 step 函数, 三个矩阵

RNN 的核心 API 简单到有点欺骗性. 写成代码就是一个类, 一个 step 方法:

```python
class RNN:
    def step(self, x):
        self.h = np.tanh(np.dot(self.W_hh, self.h) + np.dot(self.W_xh, x))
        y = np.dot(self.W_hy, self.h)
        return y
```

每次调用 step, 输入向量 x 进来, 内部状态 h 更新一次, 输出 y 出去. 数学形式是:

$$h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t), \quad y_t = W_{hy} h_t$$

逐块拆开. 第一式是记忆更新, 括号里两项相加: $W_{hh} h_{t-1}$ 是矩阵乘向量, 把上一步的隐状态 $h_{t-1}$ 线性重组, 回答「旧记忆里哪些该留, 怎么重新组合」; $W_{xh} x_t$ 把当前输入 $x_t$ 映射到隐状态空间, 回答「新进来这个字符该往记忆里写什么」. 两项相加后过 $\tanh$, 把每个分量压到 $(-1, 1)$, 防止数值无限增长, 这就是新的隐状态 $h_t$. 第二式是输出: $h_t$ 乘 $W_{hy}$ 直接得到打分向量 $y_t$, 没有非线性, 打分交给后面的 softmax 处理.

tanh 把激活压到 [-1, 1]. 整个网络只有三个矩阵要学: $W_{hh}$ 负责记忆, $W_{xh}$ 负责输入, $W_{hy}$ 负责输出. 注意 y 不只取决于当前的 x, 还取决于历史上所有输入, 因为它们都压缩在 h 里. h 初始化为零向量, 训练的全部工作就是在损失函数的指引下, 找到让行为符合期望的三个矩阵.

加深的方式和堆煎饼一样直白: 第一个 RNN 的输出当第二个 RNN 的输入, `y1 = rnn1.step(x); y = rnn2.step(y1)`. 两个 RNN 互不知情, 向量进向量出, 梯度在反向传播时自动流过每个模块.

实际使用中没人用 vanilla RNN, 用的是 LSTM. LSTM 的更新方程更复杂, 反向传播动力学更好, 但 Karpathy 强调, 上面说的一切都原样成立, 只是把 `self.h = ...` 那一行换成更复杂的形式. 博客此后 RNN 和 LSTM 两个词混用, 但所有实验跑的都是 LSTM. LSTM 的门控机制本身不在本文射程内, 那是清单第 12 篇 Olah 图解的内容.

## 4. 训练机制: 逐字符预测, 和 hello 的四个样本

博客的核心应用是 char-level language model: 给 RNN 一大坨文本, 让它建模「给定前面所有字符, 下一个字符是什么」的概率分布. 训练好之后, 从分布里采样一个字符, 喂回去, 再采下一个, 循环往复, 就是在生成新文本.

Karpathy 用一个极简例子讲透了机制. 假设词表只有四个字母 h, e, l, o, 训练序列是 hello. 这一个序列其实是四个训练样本: 给定 h, 下一个应该是 e; 给定 he, 下一个应该是 l; 给定 hel, 下一个还是 l; 给定 hell, 下一个应该是 o.

每个字符用 1-of-k 编码成四维向量, 逐个喂进 step 函数. 每个时间步 RNN 吐出一个四维输出向量, 每个维度代表模型对下一个字符的置信度. 比如看到 h 之后, 模型给 h 打 1.0, 给 e 打 2.2, 给 l 打 -3.0, 给 o 打 4.1. 正确答案是 e, 所以训练目标是把 2.2 推高, 把其他三个压低. 损失函数是每个输出向量上的标准 softmax 分类器, 也就是 cross-entropy loss. 反向传播算梯度, RMSProp 或 Adam 更新参数, 重复到收敛.

这个例子里藏着一个关键细节. 第一个 l 输入时, 目标是 l; 第二个 l 输入时, 目标是 o. 同样的输入, 不同的正确答案. 模型光靠当前输入无法区分这两种情况, 必须靠循环连接记住「这是第几个 l」. 上下文不是装饰品, 是完成任务的必需品. 这就是为什么固定向量 API 做不了语言.

## 5. 工程设置: 1MB 文本, 0.46 秒一个 batch

理论讲完, Karpathy 给出了可复现的全部数字. 热身数据集是 Paul Graham 过去约五年的散文合集, 拼成一个约 1MB 的文本文件, 一百万字符. 按今天的标准, 这是个玩具数据集, 2015 年也是.

模型配置: 2 层 LSTM, 每层 512 个隐藏节点, 约 350 万参数. 每层之后接 dropout 0.5. batch 大小 100, 用截断 BPTT (truncated backpropagation through time), 截断长度 100 个字符. 意思是梯度只在 100 步的时间窗口内回传, 更长的依赖靠隐状态本身携带, 不靠梯度直接优化.

硬件是 TITAN Z GPU, 一个 batch 约 0.46 秒. Karpathy 补了一句, 把 BPTT 砍到 50 字符, 速度翻倍, 性能损失可以忽略. 这种「砍一刀窗口换一倍速度」的取舍, 在后来的长文本训练里反复出现.

还有一个重要旋钮: 采样温度. softmax 分布

$$p_i = \frac{\exp(z_i / T)}{\sum_{j=1}^{k} \exp(z_j / T)}$$

里的 T 就是温度. 逐块拆开: $z_i$ 是模型给词表第 $i$ 个字符的原始打分 (logit), 分子把打分除以 $T$ 再取 exp, 分母对词表全部 $k$ 个字符做同样的运算再求和, 一比就是概率. $T$ 唯一的作用是整体缩放学分: $T < 1$ 时所有 logit 被放大, 高分项和低分项的 exp 比值指数级拉大, 概率质量向最高分集中; $T > 1$ 时 logit 被压缩, 分布变平, 低分字符也有机会被采到.

拿 §4 那组 hello 打分给一组数. 看到 h 之后, 四个字符的 logit 是 h=1.0, e=2.2, l=-3.0, o=4.1. $T=1$ 时, 采样概率依次约 3.8%, 12.5%, 0.07%, 83.7%, o 已经占优但 e 还有一成多的机会. $T=0.5$ 时, logit 全部翻倍, 概率变成 0.2%, 2.2%, 约 0, 97.6%, o 几乎锁定. 温度只是减半, 头部概率就从 84% 拉到 98%, 这就是「更自信, 更保守」的数学含义. T 从 1 降到 0.5, 模型更自信, 更保守, 错误更少; T 调高, 多样性上升, 拼写错误也上升. 把 T 压到接近零, 模型会一直输出最大概率的那句话, Paul Graham 模型给出的结果是「is that they were all the same thing that was a startup」无限循环. Karpathy 的评语: 看起来我们掉进了一个关于 startup 的无限循环. 温度旋钮十年后仍是所有 LLM 产品的标配参数, 只是换了个名字, 叫 temperature.

## 6. 五个 demo: 从莎士比亚到 Linux 内核

Paul Graham 模型只是个 sanity check. 它学会了拼写, 学会了逗号, 撇号, 空格放哪, 甚至学会了用 [2] 这样的引用标记支撑自己的「论点」, 偶尔蹦出一句像 insight 的话, 比如 「a company is a meeting to think to investors」. 但它替代不了 Paul Graham, 句子层面的连贯性是天花板.

**Shakespeare.** 数据集换成莎士比亚全集, 4.4MB. 模型加大到 3 层 RNN, 每层 512 节点, 训练几个小时. 样本直接是剧本格式: 角色名大写加冒号, 然后对白. PANDARUS, DUKE VINCENTIO, VIOLA, KING LEAR 轮番上场, 有时还有大段独白. Karpathy 说这些样本和真莎士比亚放一起, 他自己都几乎认不出来. 别忘了模型只知道字符, 角色名和对白内容都是它一个字符一个字符采出来的, 剧本的格式结构是它从数据里挖出来的, 没人告诉它剧本长什么样.

**Wikipedia.** 难度再升一级, 用 Hutter Prize 的 100MB 原始 Wikipedia 数据, 前 96MB 训练, 后 4MB 验证, 仿照 Graves 等人的做法, 几个模型跑过夜. 这次模型学会的是 markdown 结构. 它生成 [[词条链接]], 生成 {{cite journal}} 引用模板, 生成 == See also == 标题和星号列表, 括号成对开关, 链接格式基本合法. 它会幻觉出不存在的 URL, 比如一个 yahoo 链接, 拼得煞有介事. 最惊人的是 XML: 模型有时会突然「切换模式」, 生成一段完全合法的 Wikipedia 页面 XML dump, `<page>`, `<title>Antichrist</title>`, `<timestamp>2002-08-03T18:14:12Z</timestamp>`, 标签按正确的嵌套顺序逐一闭合, 时间戳和 id 全是编的. 记住, 这是逐字符采样的结果. 闭合标签意味着模型在几十甚至上百个字符之前就要记住自己开过什么标签.

**LaTeX 代数几何.** Karpathy 和实验室同学 Justin Johnson 找来一本 algebraic stacks 的书, 拿到 16MB 的原始 LaTeX 源码, 训练多层 LSTM. 生成的 LaTeX 几乎能编译, 人工修几处就能通过, 产出看起来很像样的公式, 引理, 甚至 tikz 风格的交换图. 模型还学会了一个让数学系学生会心一笑的招数: 不想写证明的时候, 直接来一句 「Proof omitted.」 典型错误同样具有信息量: `\begin{proof}` 开了头, 结尾却是 `\end{lemma}`; `\begin{enumerate}` 忘了闭合. Karpathy 的诊断很准确: 这些依赖太长程了, 模型写完证明正文, 已经忘了自己是在 proof 还是 lemma 里. 模型越大, 这类错误越少, 但不消失. 长程依赖, 这个 RNN 的阿喀琉斯之踵, 在这一节第一次露出真面目.

**Linux 内核源码.** 这是博客的高潮. Karpathy 把 GitHub 上 Linux 仓库的所有源码和头文件拼成一个 474MB 的 C 代码文件 (单内核只有约 16MB, 不够喂), 训练了好几个「GPU 显存能塞下多大就多大」的 3 层 LSTM, 约 1000 万参数, 跑了几天. 生成的 C 代码有缩进, 有注释, 有星号对齐的块注释, 指针用法像模像样, 字符串字面量合法, 花括号成对. 滚动浏览时, 感觉就是一个真实的巨型 C 代码库. 它还会模仿内核函数的典型结构: static int 开头, 错误处理用 goto bail, 到处调用 printk.

错误同样典型. 它跟踪不了变量名: 用了没声明的 rw, 声明了没用的 int error, 返回不存在的变量. 一个函数里出现 `if (tty == tty)` 这种恒真比较, 但至少这次 tty 在作用域里, 算进步. 最后一个 do_command 函数声明为 void 并且真的不返回值, 这次是对的; 但前两个 void 函数却 return 了值. 又是长程依赖. 最好玩的段落: 模型有时决定「该写个新文件了」, 于是先把 GNU 协议逐字符背一遍, 然后采几个 include, 编几个宏, 再一头扎进代码. GPL 协议文本在 474MB 数据里出现了成千上万次, 模型把它背下来了, 这是纯粹的 memorization, 和「理解」无关, 但恰好展示了逐字符预测的下限有多低, 上限又有多远.

**婴儿名字.** 最后一个 demo 是甜点. 8000 个婴儿名字, 一行一个, 训练后生成新名字, 只展示不在训练集里的, 占 90%. Rudi, Levette, Berice, Chrestina, Hammine, Jacacrie... 大部分听起来像真的名字. 也有 R, Hi, Mars, Baby 这种产物. Karpathy 说写小说或者给 startup 起名时可以拿来找灵感. 这个 demo 的价值在于它足够小, 小到你一眼能看穿模型在做什么: 它学的是「什么字符序列像一个英文名字」, 这是一个纯粹的统计形状问题.

## 7. 训练的演化: 乱码, 单词, 然后长程结构

结果好看, 过程更有意思. Karpathy 在托尔斯泰的 War and Peace 上训练 LSTM, 每 100 次迭代采样一次, 观察文本质量如何演化.

第 100 次迭代, 输出是乱码: 「tyntd-iafhatawiaoihrdemot lytdws e ,tfti, astai f ogoh eoase rrranbyne...」. 但仔细看, 它已经隐约知道单词之间有空格了, 只是有时插两个空格, 也不知道逗号后面几乎总要跟空格. 第 300 次, 引号和句号的概念出现了, 单词被空格正确分隔, 句末有句号, 只是单词本身还是瞎拼的. 第 500 次, 最短最常见的词拼对了: we, He, His, Which, and. 第 700 次, 英语的味道越来越浓. 第 1200 次, 引号, 问号, 感叹号都用上了, 长单词也开始拼对. 第 2000 次, 输出已经像样: 拼写正确的词, 引语, 人名 Natasha 和 Pierre, 公主 Princess Mary.

演化顺序非常清晰: 模型先发现「词-空格」这个最粗粒度的结构, 然后迅速攻克词汇, 先短词后长词, 跨越多词的主题和长程依赖最后才出现, 而且晚得多. 这个顺序不是巧合, 它反映的是损失函数的梯度结构: 高频局部模式贡献的梯度最大最密, 低频长程模式的信号稀疏, 学得慢. 十年后, 研究 LLM 训练动态的人在大得多的模型上观察到了同类的相变式学习曲线, 只是「学会引号」换成了「学会多步推理」.

## 8. 激活可视化: 引号检测细胞是真的存在的

博客最有说服力的一节不是生成样本, 是神经元可视化. Karpathy 把验证集字符喂进 Wikipedia 模型, 每个字符下方用红色标出模型对下一个字符的 top-5 猜测, 颜色深浅代表概率. 同时, 输入字符本身用蓝绿色着色, 颜色来自隐状态向量里某个随机选中的神经元的激活值, 绿色是兴奋, 蓝色是抑制, 数值在 [-1, 1] 之间, 就是 LSTM 细胞状态经过门控和 tanh 之后的值.

大部分神经元的激活模式看不出名堂, 但大约 5% 的神经元学会了干净可解释的东西. 第一个, URL 检测细胞: 进入 URL 就兴奋, 离开 URL 就关闭, 模型用它记住「我现在在不在一个网址里」. 第二个, markdown 链接检测细胞: 进入 [[ ]] 环境就兴奋. 细节很讲究: 它看到第一个 [ 不会立刻激活, 必须等到第二个 [ 才激活, 说明「数到了一个还是两个 [」这个子任务由另一个神经元负责, 两个神经元分工完成了一个小的状态机. 第三个, 位置细胞: 在 [[ ]] 环境里激活值近似线性变化, 给 RNN 提供了一个与作用域对齐的坐标系, 模型可以据此判断自己在作用域的前半段还是后半段. 第四个, www 计数细胞: 平时沉默, 在 www 序列的第一个 w 之后骤然关闭, 模型可能用它来数自己在 www 里走了几步, 决定下一个该输出 w 还是开始域名主体.

类似的还有引号检测细胞和代码缩进细胞. 重点是 Karpathy 反复强调的那句话: 没有任何人在任何环节硬编码过「跟踪引号开合是有用的」. 只是在原始文本上做端到端训练, 最终任务的压力通过梯度一路传导, 某个细胞在训练过程中逐渐把自己调谐成了一个引号检测器, 因为这有助于降低损失. 他把这称为深度学习力量来源中「最干净, 最有说服力的例子之一」. 这句话可以直接读成端到端学习的宣言: 特征不是设计出来的, 是任务逼出来的.

Karpathy 也保持了诚实: 这些解读有点 hand-wavy, 隐状态是高维分布式表示, 单个神经元的可解释性不能过度解读. 这个克制在 2015 年很稀有, 后来机制可解释性成为一个独立领域, 起点之一就是这类可视化.

## 9. 局限, 后续方向, 和一句关于 attention 的预言

博客的 Further Reading 一节给出了 Karpathy 对 2015 年 RNN 研究版图的判断, 其中几处今天读来像预言.

关于局限, 他点了两条. 第一, RNN 不擅长归纳: 它记序列记得极好, 但不一定以正确的方式泛化. Linux 代码里的变量名混乱就是例证, 局部统计学到家了, 全局一致性崩了. 第二, 表示大小和每步计算量被不必要地绑死: 隐状态向量翻倍, 每步 FLOPs 变四倍, 因为矩阵乘是平方的. 理想情况是维持一个巨大的记忆, 比如装下整个 Wikipedia, 同时每步计算量保持固定. 这个诉求直接通向外部记忆和注意力机制.

关于方向, 他提到 DeepMind 的 Neural Turing Machines, 用可微的软注意力在大记忆阵列和少量寄存器之间做读写, NTM 也是清单第 22 篇. 然后是那句被引用最多的话: 「The concept of attention is the most interesting recent architectural innovation in neural networks.」2015 年 5 月, 距离 Attention Is All You Need 发表还有整整两年. Karpathy 也分析了软注意力的代价: 什么都看, 只是看得有轻有重, 相当于 C 语言里声明一个不指向具体地址, 而是对全部内存地址定义一个分布的指针, 解引用返回加权和, 贵得离谱. 硬注意力更省, 但不可微, 需要 REINFORCE 这类强化学习技术. 软与硬, 可微与效率, 这组张力后来贯穿了整个 attention 工程史.

还有两个小注脚. 一是词级模型当时比字符级效果好, Karpathy 断言 「this is surely a temporary thing」, 历史证明他押对了方向, 只是兑现方式不是纯字符级, 而是 BPE 子词. 二是框架吐槽: 他刚转向 Torch 7, 夸它抽象层次和哲学比 Caffe, Theano 都正确, 还列了四条理想框架标准, 其中「NO compilation step」和「CPU/GPU 透明的张量库」两条, 后来被 PyTorch 原样继承. 这不奇怪, PyTorch 的祖先就是 Torch.

## 10. 在本系列清单中的位置: RNN 三部曲的第一乐章

清单前 10 篇是视觉群, 从 AlexNet 到 CS231n, 主线是 CNN 如何征服图像. 第 11 篇是一个干脆的转向: 序列建模群开幕. Karpathy 这篇在群里的角色是「现象篇」: 它不谈 LSTM 的门控公式, 不谈梯度消失的数学, 只展示一个简单模型在五类文本上学到了什么, 把「序列建模能做到这个程度」这个信念直接拍在读者脸上.

紧随其后的是机制篇和工程篇. 第 12 篇是 Chris Olah 的 Understanding LSTM Networks, 把 LSTM 的细胞状态, 遗忘门, 输入门, 输出门画成逐步图解, 回答「为什么 LSTM 能记住长程依赖而 vanilla RNN 不能」. 第 13 篇是 Zaremba, Sutskever, Vinyals 的 Recurrent Neural Network Regularization, 回答「怎么把 dropout 正确用在 RNN 上, 让大模型不过拟合」. 三篇连读, 现象, 机制, 工程, 是 2015 年前后 RNN 知识结构的完整切片. 注意第 13 篇的第二作者就是 Ilya 本人, 这份清单有相当强的「我自己的研究脉络」色彩.

最后是十年后的回响. char-RNN 做的事, 逐字符预测下一个符号, 从分布里采样再喂回去, 和今天 GPT 类模型的 next-token prediction 在形式上完全一致. 差别在规模: 2015 年是 350 万到 1000 万参数, 几 MB 到几百 MB 文本, 一张 TITAN Z; 2025 年是千亿参数, 万亿 token, 上万张 GPU. Karpathy 在结尾说, 他相信 RNN 会成为智能系统中无处不在的关键组件. 这句话说对了一半: RNN 本身被 Transformer 取代了, 但「预测下一个 token 就能长出结构」这个信念, 从这篇博客一路活到了今天, 成了整个 LLM 时代的地基. 博客最后那个 meta 实验像个玩笑: Karpathy 拿博客自己的源码训练 RNN, 46K 字符太少, 模型只能结结巴巴地复读 「the RNN with and the computed of the RNN with with」. 数据不够, 模型就露怯. 这条规律, 十年后改名叫 scaling law, 那是清单第 26 篇的故事.

## 参考与扩展阅读

- Andrej Karpathy, "The Unreasonable Effectiveness of Recurrent Neural Networks", 2015. https://karpathy.github.io/2015/05/21/rnn-effectiveness/
- char-rnn 代码库 (Torch/Lua, MIT): https://github.com/karpathy/char-rnn
- Karpathy 的 100 行 numpy 教学版: 博客内 gist 链接, min-char-rnn
- Hochreiter & Schmidhuber, "Long Short-Term Memory", 1997. LSTM 原始论文
- Chris Olah, "Understanding LSTM Networks", 2015. 清单第 12 篇
- Zaremba, Sutskever, Vinyals, "Recurrent Neural Network Regularization", 2014. 清单第 13 篇
- Sutskever, Vinyals, Le, "Sequence to Sequence Learning with Neural Networks", 2014. many-to-many 异步模式的奠基作
- Bahdanau et al., "Neural Machine Translation by Jointly Learning to Align and Translate", 2014. 清单第 14 篇, 软注意力的出处
- Graves et al., "Neural Turing Machines", 2014. 清单第 22 篇
- Wigner, "The Unreasonable Effectiveness of Mathematics in the Natural Sciences", 1960. 标题句式的出处
- Karpathy 伦敦 Deep Learning meetup 演讲视频: 博客 EDIT 区链接
