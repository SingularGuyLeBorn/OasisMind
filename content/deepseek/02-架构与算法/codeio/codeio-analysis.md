---
title: "CodeI/O: 把代码执行改写成自然语言推理数据"
category: "架构与算法"
tags: ["DeepSeek", "技术解析", "数据合成", "推理", "SFT"]
published: true
excerpt: "CodeI/O 把 45 万个真实 Python 函数改写成输入预测与输出预测两类任务, 由 DeepSeek-V2.5 写自然语言 CoT, 用代码执行验证并修订一轮, 得到 3.5M 条样本; 先训它再做指令微调, Qwen 2.5 Coder 7B 的 14 项平均分从 54.8 升到 57.2 (CodeI/O++ 为 57.7)."
---
# CodeI/O: 把代码执行改写成自然语言推理数据

材料是 [CodeI/O: Condensing Reasoning Patterns via Code Input-Output Prediction](https://arxiv.org/abs/2502.07316) (arXiv 2502.07316, 2025-02 首发, 收录本为 2025-05 的 v4, 19 页, ICML 2025 口头报告). 作者来自 DeepSeek-AI, 上海交通大学和香港科技大学, 第一作者 Junlong Li 的工作在 DeepSeek 实习期间完成, 通讯作者是港科大的 Junxian He. 代码与数据见 [hkust-nlp/CodeIO](https://github.com/hkust-nlp/CodeIO); 因合作方合规要求, 只公开了 PyEdu-R 子集的 CodeI/O(++) 数据和 LeetCode-O 评测集, 内部 CodeMix 部分和评测框架都没有公开.

论文要解决的问题是: 数学和代码生成有大量结构化训练数据, 逻辑演绎, 科学推断, 符号推理这些领域的监督信号却又少又散. CodeI/O 的回答是从真实代码里取材, 但不让模型写代码, 而是让它读懂一个函数后, 用自然语言推出「给定输入时输出是什么」或「要得到这个输出, 输入可以是什么」. 答案可以靠执行代码自动判对错, 数据量可以靠随机生成输入放大. 下面按数据构造, CoT 与验证, 训练与主结果, 消融, 局限的顺序展开, 每个数字都标出来自哪张表.

## 1. 从原始代码到可执行的预测题

### 1.1. 为什么改写成输入输出预测

用代码提升推理并不新鲜. [DeepSeekMath](../../01-模型技术报告/deepseek-math/deepseek-math-analysis.md) 在 1.3B 上做过消融, 先训 400B 代码再训数学, 比先训通用语料再训数学的数学成绩更好, 于是从 DeepSeek-Coder-Base-v1.5 起步. 但把原始代码直接当语料继续预训练, 推理信号是隐式的, 和注释, IO, 绘图这些噪声缠在一起. Table 1 给了直接证据: 在 7.7M 个 Python-Edu 文件上用语言模型损失训第一阶段, Qwen 2.5 Coder 7B 的平均分是 54.8, 与只做第二阶段的基线 54.8 完全相同; LLaMA 3.1 8B 上是 49.0, 比基线 49.3 还低. 另一条路是训练文本到代码的生成, 但输出受代码语法约束. Table 3 最后一行就是这种设置 (prompt 是「please write a piece of python code to solve this problem: {query}」, 响应只有参考代码, 见 GitHub issue #7), 平均 54.9, 同样约等于基线.

CodeI/O 的改写保留了代码里的逻辑, 去掉了「必须写出代码」这一要求. 同一个函数派生两类题. **输出预测**给定输入, 要求模型在脑中跑一遍程序, 对应前向执行, 答案唯一. **输入预测**给定输出, 要求模型找一个能产生该输出的输入, 对应逆向搜索: 答案通常不唯一, 也没有通用的逆函数, 只能靠假设, 试算和回溯. 论文 §2.3 说两类实例各占约 50%. 两类题都要求最终答案写成 JSON (`{"output": ...}` 或 `{"input": {...}}`), 推理过程完全是自然语言. 这样设计的代价是, 推理过程本身无法自动检查, 能检查的只有最后那个 JSON.

### 1.2. 统一格式的五个部件

原始文件先交给 DeepSeek-V2.5 改写. 官方仓库 `codeio_utils.py` 里的 `build_testcases_prompt_advanced` 是这一步的完整提示词, 要求输出四段: 主函数, 输入输出说明, 输入生成器, 问题描述. 论文 §2.2 把它拆成五个部件. 清洗后的参考代码只保留核心逻辑, 删掉 print, 绘图和读写文件. 主入口函数固定命名为 `main_solution`, 必须有非空参数, 输入输出都必须能 JSON 序列化; 原代码里用到 set, tuple, numpy 数组或自定义对象的, 要在函数开头和结尾做转换. 输入输出说明写清类型, 取值范围, 字典的键. 输入生成器 `input_generator` 不带参数, 每次调用返回一组带随机性的合法输入, 用字典表示, 供 `main_solution(**kwargs)` 调用. 问题描述要写成一个非编程的 wh 问句, 提示词明确禁止出现「implement a function」「write a function」这类说法, 但要点出输入变量名.

附录 G 的 Table 10 是一个例子: 原始文件是一段描述「由竖直加速度积分出速度和位移」的伪代码, 改写后的 `main_solution(acceleration, time, initial_speed, initial_displacement)` 用梯形公式逐步累加, 返回 `{"speeds": [...], "displacements": [...]}`; 生成器产生 10 个 $[-10,10]$ 内均匀分布的加速度, 时间步长 0.1, 初速度和初始位移取 $[0,10]$ 内的随机数. 这一步的损耗不小: 810.5K 个原始文件最后只剩 454.9K 个进入数据集, 约 56%. 仓库自带的 1000 个示例文件 (作者在 issue #4 中说明是用 gpt-4o-mini 处理的) 解析成功 464 个, 比例相近.

### 1.3. 采样输入输出对与复杂度约束

`parse_gen_ios.py` 把改写结果拼成一段脚本, 在子进程里最多调用 1000 次 `input_generator`, 收集至多 10 个互不相同, 且输入输出都通过尺寸检查的样例, 整段脚本限时 60 秒; 少于 2 个样例的函数直接丢弃. 尺寸检查 `strict_check_size` 就是附录 A 印出的那段递归函数: 对象总大小小于 1024 字节 (用 `pympler.asizeof` 计), 列表, 元组, 集合和字典的长度小于 20, 字符串短于 100 个字符, 其他类型小于 128 字节, 逐层检查所有子对象. 这些阈值的用意是让答案能被一般 LLM 一次写出, 例如一个 50 项的浮点列表, 模型即使推理正确也很难一字不差地写完.

论文 §2.3 还说, 为了保证输出确定, 含随机性的函数一律跳过. 这里有一处对不上: 附录 G 的 Figure 8 那道两只水壶量水的题, 参考代码第一行就是 `import random`, 只是函数体没有用到它; 验证脚本的前缀 `solution_prefix` 也默认导入了 `random`. 合理的读法是过滤看的是函数体里是否调用随机数, 但论文没有写明判据. 采样之后, 每个函数按来源取不同数量的样例 (附录 C.2):

| 来源 | 原始文件 | 保留函数 | 每函数上限 | 平均输入/输出实例 | 实例总数 |
|---|---|---|---|---|---|
| CodeMix | 427K | 300K | 3 对 | 2.78 / 2.80 | 1,674,345 |
| PyEdu-R | 369K | 141K | 6 对 | 5.77 / 5.79 | 1,630,716 |
| 其他来源 | 14.5K | 13.9K | 10 对 | 7.70 / 7.87 | 216,159 |

每个来源的实例数等于函数数乘以两类实例的平均数之和, 输入预测和输出预测分开计 (作者在 issue #3 中确认):

$$
N=\sum_{s}\underbrace{n_s}_{\text{函数数}}\big(\underbrace{\bar k^{I}_s}_{\text{输入预测}}+\underbrace{\bar k^{O}_s}_{\text{输出预测}}\big),
$$

代入 CodeMix 得 $300\text{K}\times5.58\approx1.674\text{M}$, PyEdu-R 得 $141\text{K}\times11.56\approx1.630\text{M}$, 三项合计 3,521,220, 就是正文的 3.5M (Table 2 写作 3.52M). 表里也能看出取材策略: CodeMix 函数多但每个只取 3 对, PyEdu-R 函数少一半但每个取 6 对, 两者贡献的实例数几乎相等; 来自算法仓库, Project Euler, LeetCode 等平台的「其他来源」只占 6%, 每个函数取得最多. CodeMix 的筛选办法也值得写出来: 用 DeepSeek-Coder-V2-Lite-Inst 对每个文件派生的函数补全任务求成功率, 只留成功率在 10% 到 90% 之间的文件, 太容易和太难的都去掉. PyEdu-R 则是从 7.7M 个 Python-Edu 文件里用 DeepSeek-Coder-V2-Lite-Inst 和 DeepSeek-V2.5 分类, 去掉「算法」和「非推理」两类, 避免和以算法为主的 CodeMix 重复.

## 2. CoT 的生成, 验证与一轮修订

![](images/p02-figure-1-overview-of-our-training-data-construction-raw.jpg)

图注: 左边三个来源图标代表原始代码, 经 DeepSeek 模型改写成参考代码, 输入生成器和查询三路; 输入生成器采样输入, 执行参考代码得到输出, 「$\times N$」表示每个函数重复多次. 中间第二个 DeepSeek 图标是写 CoT 的 DeepSeek-V2.5, 它同时收到三路信息, 回答「输入是什么」或「输出是什么」.
图 1 解析: 左边三个来源图标代表原始代码, 经 DeepSeek 模型改写成参考代码, 输入生成器和查询三路; 输入生成器采样输入, 执行参考代码得到输出, 「$\times N$」表示每个函数重复多次. 中间第二个 DeepSeek 图标是写 CoT 的 DeepSeek-V2.5, 它同时收到三路信息, 回答「输入是什么」或「输出是什么」. 右上的虚线箭头是可选的验证与修订回路, 对应 CodeI/O++. 图里没有画出过滤环节 (不可执行, 超时, 超尺寸), 也没有画第二阶段的指令微调.

### 2.1. prompt 模板与直接提示

训练和数据收集用的是同一个 prompt, 模板在 `codeio_utils.py` 里: 先是「You are given a question that requires some input and output variables as follows:」加查询, 再是输入输出说明, 然后是「Given the following input:」或「Given the following output:」加具体数值, 最后要求「without writing any code」推理并给出 JSON. 参考代码作为提示附在最后, 前面一句是「You can refer to this code to guide your reasoning but not copy spans of code directly」. 所以模型其实看得到完整代码, 要做的是按代码手工执行或手工反推, 但必须用自然语言写出来. 图 2 的硬币找零题是一个输出预测的样例: 给定 `amt=25`, `coins=[1,4,7]`, CoT 依次枚举用 3, 2, 1, 0 枚 7 的组合, 得到最少 4 枚; 同一题的输入预测样例给定输出 4, 模型试了 $[1,2,5]$ 凑 8, $[1,3,4]$ 凑 6 和凑 8 都不满足, 最后给出 `amt=13`, `coins=[1,2,5]`, 即 $5+5+2+1$.

为什么不直接用代码执行轨迹当监督? §2.4 给了两个理由. 第一, 输入预测需要逆函数, 一般程序没有确定的逆; 第二, 按模板自动生成的轨迹表达力有限, 迁移不到自由文本推理. 因此全部 CoT 都由 DeepSeek-V2.5 生成, 论文给出的理由是它性能处于第一梯队, 调用成本远低于同级模型. 这个选择的直接后果是 CoT 质量受教师模型限制: 附录 D 的 Figure 7 显示, 首轮输入预测正确 50.0%, 输出预测正确 51.8%, 一半左右的训练样本答案是错的. CodeI/O 主实验把对错样本全部保留, 第 4.1 节会看到这样做为什么比只留对的好.

### 2.2. 执行器怎么判对错

验证分两种, 实现在 `check_io_pred_acc_mp.py`. 先用 `extract_last_complete_json` 从响应里抽最后一个完整 JSON (优先找 json 代码块, 找不到就用括号栈找最后一个顶层花括号, 还会把 Python 的 True/False/None 换成 JSON 写法, 甚至兜底解析 `\boxed{}`); 抽不到, 或者缺 `output`/`input` 字段, 状态记为 no answer. 输出预测直接把预测值和缓存的真实输出比较, 比较函数 `is_close` 对字典要求键集合相同并逐键比较, 对列表要求长度相同并逐项比较, 对数值的判据是:

$$
\mathrm{close}(p,t)=\Big[\,\underbrace{|p-t|\le 10^{-3}\,|t|}_{\text{相对误差}}\,\Big]\ \wedge\ \Big[\,\underbrace{\mathrm{int}(p)=\mathrm{int}(t)}_{\text{整数部分相同}}\,\Big],
$$

$p$ 是预测值, $t$ 是真实值, $\mathrm{int}$ 是 Python 的向零截断. 只要有一个是浮点数就走这条; NaN 和无穷一律判错; 两个都是整数时要求严格相等. 第二个条件防止 $t$ 很大时相对误差放过整数部分不同的答案. 这条判据也有边界: $t=0$ 时右边的容差为 0, 浮点预测必须精确为 0; 布尔值在 Python 里是整数的子类, `True` 和 `1` 会被判为相等.

输入预测不能和缓存的输入比, 因为可行输入不唯一. 验证脚本把参考代码和预测输入拼成一段程序, 在子进程里执行 `main_solution(**pred_input)`, 把结果先按 JSON 字符串比较, 不相等再用 `is_close` 比较, 都不满足就抛出 `AssertionError`, 消息是「[Mismatch] Your input is not feasible! Given the output ..., your predicted input is ..., which actually gets a wrong output as ...」. 执行限时 5 秒, 超时记为 timeout, 其他运行错误记为 exception 并截取异常类型和消息. 这几类状态正好对应 Figure 7 的 Correct, Wrong, Exception, No Answer, Timeout. 输出预测不用执行代码, 所以只有 Correct, Wrong, No Answer 三类.

### 2.3. 一轮修订与拼接方式

CodeI/O++ 对首轮判错的响应追加一轮对话. `build_codeio_rev_msg.py` 把首轮响应作为 assistant 消息, 再把验证消息作为 user 消息追加, 末尾加一句「Please redo it, and your prediction should no longer be any of the wrong ones you have made before!」. 反馈内容按任务类型不同: 输出预测只告诉模型答案错了 (消息里给出输入和它的错误预测, 不给正确答案); 输入预测额外给出用错误输入实际跑出的输出; 执行失败的给出异常信息. 第二轮生成后再验证一次. 训练样本把四段拼成一条: 第一轮响应, 第一轮反馈, 第二轮响应, 第二轮反馈, 首轮就对的样本反馈只有「Success」, 没有后两段. 作者在 issue #1 中说明, 拼接时插入了过渡用的模板串, 也就是 Table 11 里「Let me check if I did it correctly ..... Oops! Something went wrong」「Well ..... I apologize for the oversight」「Yes, that's correct! I made it!」这些句子; 开源的 `assemble_codeio_demo.py` 只输出四个字段, 不含这些模板串, 复现时需要自己补.

![](images/p16-image.jpg)

![](images/p16-figure-7-in-multi-turn-revision-we-track-the.jpg)

图注: 两张桑基图分别是输入预测 (上) 和输出预测 (下), 从左到右是首轮, 第一轮修订, 第二轮修订, 数字是占全体实例的百分比. 输入预测首轮 Correct 50.0, 进入第一轮修订的 50.0 中改对 8.0, 修正率 16%; 第二轮修订 42.0 中只改对 2.8, 修正率 6.7%.
图 7 解析: 两张桑基图分别是输入预测 (上) 和输出预测 (下), 从左到右是首轮, 第一轮修订, 第二轮修订, 数字是占全体实例的百分比. 输入预测首轮 Correct 50.0, 进入第一轮修订的 50.0 中改对 8.0, 修正率 16%; 第二轮修订 42.0 中只改对 2.8, 修正率 6.7%. 输出预测首轮 Correct 51.8, 第一轮修订 48.2 中改对 5.2, 修正率 10.8%; 第二轮 43.0 中改对 1.7, 修正率 4.0%. 图里看不出修订改对的样本 CoT 质量如何, 也看不出 Exception 和 Timeout 在修订后是否转成了 Wrong.

按图 7 算, 修订一轮之后输入预测累计正确 58.0%, 输出预测 57.0%, CodeI/O++ 里仍有四成多的最终答案是错的. 正文 §2.4 写「错误响应中 10% 能在第二轮修正」, 只对应输出预测一侧. Table 11 的完整样例还暴露出一个问题: 题目是「和至少为 target 的最短连续子数组长度为 4」, 首轮给出 `target=10`, `numbers=[1,2,3,4,5]`, 执行反馈说实际输出是 3 (子数组 $[3,4,5]$ 和为 12); 第二轮 CoT 先试 $[1,2,2,2,2,2]$, 中途说「再加一个 2, $[2,2,2,2]$ 的和仍是 8」, 这段推理并没有朝答案推进, 最后给出 $[1,3,2,2,5,1]$ 才碰对. 验证只看最终 JSON, 这样一段推理过程在训练数据里被标成「Yes, that's correct!」.

## 3. 两阶段训练与主结果

### 3.1. 训练配置与两阶段的理由

四个基座是 Qwen 2.5 Coder 7B, DeepSeek Coder V2 Lite (16B 总参数的 MoE, 见 [DeepSeek-Coder-V2 解析](../../01-模型技术报告/deepseek-coder-v2/deepseek-coder-v2-analysis.md)), LLaMA 3.1 8B 和 Gemma 2 27B, 两个代码模型, 两个通用模型. 第一阶段在 CodeI/O(++) 上训 1 个 epoch, 恒定学习率, 三个小模型 1e-5, Gemma 4e-6; 第二阶段在约 1.18M 条内部指令数据上训 700 步, 学习率 3e-5 (Gemma 1e-5), 余弦衰减到 1e-6 (Gemma 3e-7). 两阶段的 batch size 都是 1024, 都不用 warmup, 最大长度 4096 (附录 E). 训练是普通 SFT, 损失只算在响应上, CodeI/O++ 的多轮内容拼成一条长响应, 所以也是单轮 SFT.

附录 E 说第二阶段 700 步「约相当于指令数据的 3 个 epoch」, 按样本数算对不上: $700\times1024=716{,}800$ 条序列只有 1.18M 的 0.61 个 epoch, 3 个 epoch 需要约 3.54M 条. 文中没有给出 batch 的计量单位, 如果训练时把多条样本拼接 (packing) 进 4096 长度的序列, 平均每条序列装约 4.9 条样本才对得上, 这只是从已知数字推出的说法, 没有数据验证. 为什么要分两阶段, §3.1 的理由是规模悬殊: CodeI/O 有 3.5M 条, 指令数据只有 1.18M 条, 直接混合会让指令数据学不充分. Table 4 用 Qwen 和 LLaMA 检验了这一点.

| 第一阶段 | 第二阶段 | Qwen | LLaMA |
|---|---|---|---|
| 无 | IT | 54.8 | 49.3 |
| 无 | CodeI/O(10%)+IT | 56.6 | 50.5 |
| CodeI/O+IT | 无 | 55.9 | 49.7 |
| CodeI/O | IT | 57.2 | 51.2 |
| CodeI/O+IT | IT | 56.8 | 51.5 |
| CodeI/O | CodeI/O(10%)+IT | 57.0 | 52.7 |

表中 IT 指指令微调数据. 把全部 CodeI/O 与指令数据一次混训 (第三行) 只比基线高 1.1 和 0.4, 是所有用到 CodeI/O 的设置里最差的, 支持「数据量悬殊时混训会稀释指令数据」的说法. 只混 10% 的 CodeI/O 做单阶段 (第二行) 已经能拿到 56.6, 离两阶段的 57.2 只差 0.6. 两阶段内部的混合方式在两个模型上结论相反: Qwen 最好的是完全分开 (57.2), LLaMA 最好的是第二阶段再混入 10% CodeI/O (52.7, 比完全分开高 1.5). 论文最终取完全分开, 理由只是方法简单.

### 3.2. 评测集与基线的口径

评测有 14 列: WinoGrande, DROP, GSM8K, MATH, GPQA, MMLU-STEM, LeetCode-O, CRUXEval-I, CRUXEval-O, BBH-EN, BBH-ZH, ZebraLogic, KorBench, LiveBench. 除 BBH 用 3-shot, 其余都是 zero-shot 贪心解码. 有几个口径需要记住. LiveBench 用 2406-2407 划分, 去掉了代码生成和指令遵循子项. BBH-ZH 是作者把 BBH 的 9 个子任务译成中文. LeetCode-O 是作者自建的输出预测集, 900 题, 简单/中等/困难各 300, 只给题面不给代码, 一道题的所有用例在中英两个版本下都对才得 1 分, 这让 LLaMA 的分数只有 4.1. 测试集规模 (Table 7) 差别很大, GPQA 只有 448 题, LiveBench 672 题, ZebraLogic 1000 题, DROP 有 9536 题; GPQA 上 1 道题就是 0.22 分, 3 分的差距只是 13 道题.

基线分两类. 第一类是只做第二阶段 (2nd Stage Only), 检验多一个阶段有没有用. 第二类是把第一阶段的数据换成别的数据集: WebInstruct (从网页挖掘, LLM 精修, 全量 11.6M), OpenMathInstruct-2 (LLaMA 3.1 405B 在 GSM8K 和 MATH 上扩增, 全量 14M), OpenCoder-SFT-Stage-1 (4.2M 条代码问答), Python-Edu (7.7M 个原始文件, 用语言模型损失训). WebInstruct 和 OpenMathInstruct-2 默认取 3.5M 子集与 CodeI/O 对齐, 只在 Qwen 上报告了全量. 评测里没有 HumanEval, MBPP 这类代码生成基准, 所以 CodeI/O 对代码生成能力的影响, 论文没有给出答案.

### 3.3. Table 1 的提升落在哪里

先看平均分. 下表把 Table 1 每个基座的基线, 最强对照数据集, CodeI/O 和 CodeI/O++ 放在一起, 括号里是相对基线的差.

| 基座 | 只做第二阶段 | 最强对照数据集 | CodeI/O | CodeI/O++ |
|---|---|---|---|---|
| Qwen 2.5 Coder 7B | 54.8 | 55.2 (OMI2) | 57.2 (+2.4) | 57.7 (+2.9) |
| LLaMA 3.1 8B | 49.3 | 50.6 (OMI2) | 51.2 (+1.9) | 52.1 (+2.8) |
| DeepSeek Coder V2 Lite | 51.6 | 52.1 (PyEdu) | 53.6 (+2.0) | 53.5 (+1.9) |
| Gemma 2 27B | 59.5 | 60.4 (WI, OMI2) | 60.9 (+1.4) | 61.5 (+2.0) |

在 Qwen 上, 全量 OpenMathInstruct-2 (14M) 平均 56.0, 全量 WebInstruct (11.6M) 55.6, 都低于 3.5M 的 CodeI/O. 这是「数据量小 3 到 4 倍仍然更高」这一说法的出处, 它只在 Qwen 一个基座上做过. CodeI/O 对最强对照的领先幅度在 0.5 (Gemma) 到 2.0 (Qwen) 之间. 平均分是 14 列的算术平均, 我按表中数字复算, 四组 CodeI/O 都与表中一致 (57.21, 51.21, 53.58, 60.91).

再看单项. 以 Qwen 为例, CodeI/O 相对基线涨得最多的是 DROP (+5.7), KorBench (+5.6), CRUXEval-O (+4.9), LeetCode-O (+3.0), GSM8K (+3.0); MMLU-STEM 只涨 0.1, MATH 0.3, ZebraLogic 反而降 0.2. LLaMA 上涨幅最大的是 CRUXEval-O (+6.4), CRUXEval-I (+5.6), LeetCode-O (+5.2), MATH (+3.9), MMLU-STEM, BBH-ZH, LiveBench 三项下降 (−1.0, −0.3, −1.0). 在 Qwen 上, 涨幅集中在两类基准: 一类和训练任务同构 (CRUXEval 和 LeetCode-O 本身就是输入输出预测), 另一类是 DROP 和 KorBench 这种需要按规则一步步操作的题. 知识型的 MMLU-STEM 和需要长链约束求解的 ZebraLogic 在两个模型上都基本不动; GPQA 涨了 1.8 和 2.9, 折合 8 到 13 道题. 对照数据集的特点也能从表里读出来: OpenMathInstruct-2 全量在 Qwen 的 GSM8K 上拿到 88.5, 是该列最高, CodeI/O 只有 86.4; Gemma 的 LiveBench 上 OpenMathInstruct-2 是 40.7, CodeI/O 只有 31.3. 所以「CodeI/O 更均衡」的准确含义是低于基线的列少 (Qwen, DeepSeek Coder V2 Lite, Gemma 各 1 列, LLaMA 3 列), 并不代表每一列都最好.

§3.2 说 CodeI/O++「系统性地优于 CodeI/O, 没有在个别任务上付出代价」, 与 Table 1 对不上. DeepSeek Coder V2 Lite 上 CodeI/O++ 平均 53.5, 低于 CodeI/O 的 53.6; Qwen 上 GSM8K 从 86.4 降到 85.7, GPQA 从 43.3 降到 40.6; Gemma 上 WinoGrande 从 75.9 降到 73.1. 附录 F 把第二阶段换成公开的 Tulu-3 后, CodeI/O++ (49.7) 也低于 CodeI/O (50.0). 能成立的说法是: 用内部指令数据时, 四个基座里有三个的 CodeI/O++ 平均分更高, 幅度 0.5 到 0.9.

## 4. 消融: 改了哪个量, 平均分变成多少

### 4.1. 两类任务与错误样本的作用

Table 2 的所有消融都在 Qwen 2.5 Coder 7B 上做, 第二阶段不变. 比较时要注意数据量: 只做输入预测 (1.75M) 和只做输出预测 (1.76M) 都约为全量的一半, 应该和约 50% 的随机子集 (1.59M, 56.7) 比, 和全量 (3.52M, 57.2) 比会把数据量的影响混进来. 这样比, 只做输入预测 56.1, 只做输出预测 56.4, 都低于同等规模的混合子集, 说明两类任务混在一起的收益不只是数据翻倍带来的. 两类任务各有偏向: 只做输入预测的设置下 KorBench 44.4 (高于全量的 44.3), GPQA 却掉到 38.8; 只做输出预测的设置下 BBH-EN 70.1, 是这组消融里最高的. ZebraLogic 在所有单向和过滤设置下都是 11.4 到 11.5, 比全量的 10.7 还高, 这一列的数字本身很小, 差异在 1000 题里不到 10 道.

拒绝采样的两组结果更有信息量. 只保留答案正确的样本 (w/o wrong, 1.79M) 平均 56.5, 与同规模的 50% 子集 56.7 相当, 说明在数据量相同时, 把错误答案的样本换成正确答案的样本, 并没有带来提升. 把错误响应删掉, 换成执行得到的真实答案, 但不带 CoT (wrong→gt, 仍为 3.52M) 平均 56.6, 低于全量的 57.2; 它在 LeetCode-O (24.3) 和 CRUXEval-O (67.6) 两列上高于全量, 其他多数列下降. 两组合起来的读法是: 第一阶段的收益主要来自「看过大量推理过程」, 答案是否正确的影响很小, 而只给答案不给过程反而有损. 这也让 CodeI/O++ 的收益来源变得可疑: 如果答案对错不重要, 修订一轮带来的 0.5 分, 可能更多来自响应变长和多出来的「检查, 发现错误, 重做」这种文本结构, 正确答案增多的贡献可能更小. 论文没有做把修订轮内容换成等长无关文本的对照, 这一点无法从现有数据里分开.

### 4.2. 合成模型, 数据格式与数据来源

「CodeI/O 的提升是不是只是蒸馏了 DeepSeek-V2.5」是一个自然的质疑. WebInstruct 原本由 Qwen-72B 和 Mixtral 8x22B 生成, 作者用 DeepSeek-V2.5 重新生成了同样 3.5M 条的响应 (WI-DS25). 从 Figure 3 的柱状图读数, Qwen 上 WI-DS25 约 56.0, 比原版 WebInstruct 的 55.0 高 1 分左右, 但仍低于 CodeI/O 的 57.2; LLaMA 上 WI-DS25 约 50.0, CodeI/O 51.2. 换了同一个教师模型后差距缩小到 1.2 分左右, 所以教师模型确实贡献了一部分, 数据的任务形式贡献了剩下的部分. 这组对照只有两个基座, 也只换了 WebInstruct 一个数据集.

Table 3 改的是训练样本里放哪些信息. 「查询加参考代码作为 prompt, CoT 作为响应」是默认设置, 57.2; 去掉代码只留查询, 56.8; 只给代码不给查询, 57.0; 只给查询, 响应里先写代码再写 CoT, 56.9; 只给查询, 响应只有代码, 54.9. 前四行的差距都在 0.4 以内, 第五行掉了 2.3. 这说明 prompt 里给不给代码影响很小, 关键在响应里有没有自然语言 CoT. Table 8 改的是数据来源: 去掉 CodeMix (剩 1.84M) 平均 56.3, 去掉 PyEdu-R (剩 1.89M) 平均 57.0, 对照 50% 子集 56.7. 去掉 PyEdu-R 只掉 0.2, 去掉 CodeMix 掉 0.9, CodeMix 更重要; 论文的解释是 PyEdu-R 里多是浮点计算题, 推理模式不如以算法为主的 CodeMix 多样. 仓库只开源了较弱的 PyEdu-R 部分, 用开源数据复现时要按 Table 8 的 56.3 一档来预期, 达不到 57.2.

### 4.3. 规模, 修订轮数与样例比例

![](images/p07-a-size-of-randomly-sampled-subset.jpg)

![](images/p07-figure-4-the-scaling-effect-of-codei-o-in.jpg)

图注: 两张雷达图都在 Qwen 2.5 Coder 7B 上画, 每根轴是一个基准, 轴上标的数字是该轴所有曲线中的最高值. 上图是随机子集规模 0.32M, 0.96M, 1.91M, 3.52M, 下图固定函数集合, 改每个函数用到的样例比例 1/6, 2/6, 4/6, 6/6, 黑线是不做第一阶段的基线.
图 4 解析: 两张雷达图都在 Qwen 2.5 Coder 7B 上画, 每根轴是一个基准, 轴上标的数字是该轴所有曲线中的最高值. 上图是随机子集规模 0.32M, 0.96M, 1.91M, 3.52M, 下图固定函数集合, 改每个函数用到的样例比例 1/6, 2/6, 4/6, 6/6, 黑线是不做第一阶段的基线. 3.52M 的曲线整体在外圈, 但 1.91M 在 GSM8K (87), CRUXEval-I (63.8), CRUXEval-O (66.3) 上更高, 0.32M 在 MMLU-STEM (77.7) 上最高; 下图中 4/6 在 DROP (79), GSM8K (87.5), LeetCode-O (24.3) 上高于 6/6, 1/6 在 CRUXEval-O (66.4) 上最高.

Figure 4 只有单次运行, 没有方差, 多数轴上曲线之间的差在 1 分以内. 能读出的结论是: 平均意义上数据越多越好, 但单项上不单调, §4.3 的「清晰的趋势」只在平均分和部分轴上成立. 下图的比例实验同时改变了总样本数, 所以「每个函数多给样例有用」和「总数据多有用」在这里分不开. 分母 6 和 PyEdu-R 每个函数最多取 6 对的上限一致, 但图注没有写明实验用的是哪部分数据.

Figure 5 回答修订轮数要不要多做. Qwen 上不做修订 57.2, 修订一轮 57.7, 修订两轮 57.1, 第二轮反而回落; LLaMA 上依次为 51.2, 52.1, 约 52.4, 第二轮仍有小幅提升. 结合 Figure 7 第二轮修正率只有 4.0% 到 6.7%, 作者最终只做一轮. Qwen 第二轮回落的一个可能原因是多出来的「又一次失败再重做」让响应变长而正确样本增加很少, 论文没有分析. 附录 F 把第二阶段的内部数据换成公开的 Tulu-3 (Qwen), 基线 48.1, CodeI/O 50.0, CodeI/O++ 49.7; 只做第二阶段的 48.1 比内部指令数据的 54.8 低 6.7 分, 说明内部指令数据贡献很大, CodeI/O 的 1.9 分提升在换了指令数据后仍然存在.

## 5. 泄漏, 局限与在 DeepSeek 系列中的位置

### 5.1. 13-gram 泄漏检查

既然数据从开源代码和题库里来, 评测集泄漏是必然要问的问题. §4.7 用 13-gram 重叠检查: 先做大小写和空白归一化, 只要一条测试样本与训练数据有一个 13-gram 相同, 就算泄漏. Table 5 显示多数基准泄漏率为 0, MMLU-STEM, CRUXEval, MATH 是 0.1%, 但 LeetCode-O 有 21.5%, KorBench 有 5.1%. LeetCode-O 的泄漏是可以预期的, 它和「其他来源」里的 LeetCode 题同源, KorBench 的泄漏论文没有解释来自哪里.

Table 6 在去掉泄漏样本后重算 CodeI/O 相对基线的提升: LeetCode-O 上 Qwen 从 3.8 变 3.9, LLaMA 9.4 不变, DeepSeek Coder V2 Lite 5.3 变 5.7, Gemma 3.7 变 3.9; KorBench 上四个基座的变化都在 0.3 以内. 提升没有因为去掉泄漏而缩小, 这支持「提升不是靠记题」. 但 Table 6 的数字和 Table 1 对不上: Table 1 里 Qwen 的 LeetCode-O 提升是 $23.7-20.7=3.0$, LLaMA 是 $9.3-4.1=5.2$, 而 Table 6 的「full」写的是 3.8 和 9.4. §4.7 说 Table 6 用的是逐样本口径, 而 Table 1 的 LeetCode-O 是一道题所有用例中英双语都对才得分, 两者度量不同. 论文没有给出逐样本口径下的绝对分数, 只给了差值. KorBench 不存在双语按题计分的问题, 两张表理应一致, 但 DeepSeek Coder V2 Lite 在 Table 1 中是 .0-44.7=+1.3$, 在 Table 6 中是 $-1.2$, 符号相反, 文中没有解释.

### 5.2. 文中留下的缺口

几处值得追问的地方, 都可以从文中或代码里找到依据.

1. **只监督最终答案.** 验证只比较 JSON, Table 11 那种中间推理混乱但碰对答案的响应会被当作成功样本; 加上主实验保留了约一半错误答案的样本, CoT 本身的质量完全没有过滤. 后续工作 CodeReasoner 和 StepCodeReasoner 都把这一点作为改进出发点, 前者改用执行导向的数据构造, 在 SFT 之后再做 GRPO 强化学习, 后者同样把「只监督最终结果」列为这类方法的共同局限.
2. **只有 Python, 只评推理.** 原始代码全部是 Python, 输入输出被限制在 1024 字节以内, 评测没有代码生成基准. CodeI/O 对 HumanEval 一类任务是帮助还是损害, 文中没有给出.
3. **评测不可复现.** 作者在 issue #11 中说明评测用的是内部框架, 无法公开; 开源数据只有 PyEdu-R 部分 (Table 8 中去掉 CodeMix 后为 56.3). 外部复现只能对齐趋势, 很难对齐 14 列的绝对数字.
4. **几处文字与表格不一致.** §2.3 说跳过含 `import random` 的函数, Figure 8 的参考代码就有这一行; §2.4 说约 10% 错误响应在修订中改对, 附录 D 的输入预测是 16%; §3.2 说 CodeI/O++ 没有在个别任务上付出代价, Table 1 和 Table 9 有反例; 附录 E 说 700 步约 3 个 epoch, 按 batch 1024 只有 0.61 个 epoch.
5. **基线规模只在 Qwen 上对齐过全量.** 其他三个基座上, 对照数据集都截到 3.5M, 「用更少数据赢过全量基线」的结论只在一个模型上验证过.

这些问题不推翻主结论. 在四个基座, 14 项评测上, CodeI/O 平均分都高于所有对照数据集, 方向一致; 只是单项提升主要集中在与输入输出预测同构的基准和 DROP, KorBench 这类规则操作题, 「通用推理增强」的覆盖面要比摘要所写的窄一些.

### 5.3. 与 DeepSeek 其他工作的关系

在 DeepSeek 的工作线里, CodeI/O 处在代码模型和推理模型之间. [DeepSeek-Coder](../../01-模型技术报告/deepseek-coder/deepseek-coder-analysis.md) 和 DeepSeek-Coder-V2 解决的是代码生成与补全, 训练数据是代码本身; DeepSeekMath 证明了代码预训练对数学推理有帮助. CodeI/O 往前走了一步: 不再把代码当作要生成的对象, 而是把代码当作带标准答案的题目来源, 用 LLM 把执行过程翻译成自然语言推理. 这种「用程序当判题器, 让模型用自然语言作答」的做法, 和 [DeepSeek-R1](../../01-模型技术报告/deepseek-r1/deepseek-r1-analysis.md) 的规则奖励共享同一个前提: 答案可以被程序自动判对错. R1 用这个前提做强化学习, CodeI/O 用它做数据过滤和修订, 仍然停留在 SFT. reasoning-gym 社区已经把 CodeI/O 的函数和输入生成器改造成可无限采样的 RL 环境 (见 open-thought/reasoning-gym issue #160), 走的就是把两者接起来的方向.

从数据合成的角度, CodeI/O 属于「改写已有语料」一类, 与本库 [合成与改写数据](../../../llm-guide/3-预训练/3.1-预训练数据/3.1.2-合成与改写数据/3.1.2-合成与改写数据.md) 里讨论的 WRAP, Phi 系列教科书数据同属一个方向, 区别是它有执行器作为外部校验. Table 2 的拒绝采样结果 (只留对的样本没有更好) 也和 [SFT 数据质量筛选与训练技巧](../../../llm-guide/4-后训练/4.2-SFT/4.2.2-SFT数据质量筛选与训练技巧/4.2.2-SFT数据质量筛选与训练技巧.md) 里「质量优先于数量」的常见结论形成对照: 在这个任务上, 「质量」体现在推理过程的多样性, 最终答案的正确率影响很小. 两阶段训练的设计则可以放在 [SFT 原理与实践](../../../llm-guide/4-后训练/4.2-SFT/4.2.1-SFT原理与实践/4.2.1-SFT原理与实践.md) 的框架下理解, 第一阶段相当于一次面向推理的中间训练.

## 参考资料

- 论文: [CodeI/O: Condensing Reasoning Patterns via Code Input-Output Prediction](https://arxiv.org/abs/2502.07316)
- 代码与数据: [hkust-nlp/CodeIO](https://github.com/hkust-nlp/CodeIO), 讨论见 [Issues](https://github.com/hkust-nlp/CodeIO/issues)
- 知乎: [DeepSeek 最新论文: 用代码I/O凝练推理, CODEI/O 方法详解](https://zhuanlan.zhihu.com/p/24257536873)
- 知乎: [Codei/O: 通过代码输入-输出预测压缩推理的模式](https://zhuanlan.zhihu.com/p/24508944653)
- 量子位: [DeepSeek 团队新作报道 (克雷西, 2025-02-17)](https://news.qq.com/rain/a/20250217A06Y5J00)
- reasoning-gym: [CodeI/O 作为 RL 数据源的讨论 (issue #160)](https://github.com/open-thought/reasoning-gym/issues/160)
- 后续工作: [CodeReasoner (arXiv 2507.17548)](https://www.alphaxiv.org/abs/2507.17548)
