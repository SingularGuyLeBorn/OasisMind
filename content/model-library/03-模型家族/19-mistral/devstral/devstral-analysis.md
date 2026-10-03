[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Devstral 发布页, 7 页, 3 张图, 不是论文. 下面只用这页印出来的数, 不补结构, 不从 Devstral 2, Codestral 或同家族其他模型搬参数. 散点图上的点没有印数值, 凡是从图上读的坐标, 以及自己算的比例, 差值, 题数, 都标了估算.

- 发布: **May 21, 2025**, 署名 Mistral AI, 官网 RESEARCH 栏.
- 合作方: All Hands AI (OpenHands 的提供方).
- 定位: 面向软件工程任务的 agentic LLM, 训练目标是解决真实 GitHub issue, 跑在 OpenHands, SWE-Agent 这类脚手架上.
- 核心分数: SWE-Bench Verified 46.8%, 数据集 500 个人工筛过的 GitHub issue.
- 宣称: 超过此前开源 SoTA **6 个百分点以上**; 同脚手架下超过 Deepseek-V3-0324 (671B) 和 Qwen3 A22B; 超过 GPT-4.1-mini **20% 以上**.
- 部署: 单张 **RTX 4090** 或 32GB 内存的 Mac.
- 许可: **Apache 2.0**, 免费.
- API: 模型名 **devstral-small-2505**, 输入 $0.1/M token, 输出 $0.3/M token, 与 Mistral Small 3.1 同价.
- 下载: HuggingFace, Ollama, Kaggle, Unsloth, LM Studio.
- 状态: research preview; 预告几周内推出更大的 agentic coding 模型.
- 没印的: 参数量, 结构, 上下文窗口长度, 训练数据, 训练 token 数, 基座模型, 量化方式, 推理速度, 那张 「table below」.

## 1. 这页的底子

这页能用的材料很少: 正文四个小节, 一张散点图, 两张不含模型信息的图 (题图和页脚截图). 和模型直接有关的数只有 46.8%, 500, 6, 671B, 20%, RTX 4090, 32GB, $0.1, $0.3 这几个. 参数量, 结构, 上下文长度, 训练数据一个都没写. 所以这页能分析的, 主要是 「这个 46.8% 是在什么条件下拿到的, 和谁比, 宣传句能不能被图核实」.

材料本身还有两处损坏. 转出的 Markdown 丢了第 3 页开头那句核心宣称, 只剩 「8% on E-Be」 几个残字, 第 4 页开头一句也碎成了 「Fin」, 「g」, 「t,」. PDF 文本层保住了这两句, 下文以文本层为准. 更麻烦的是第 3 页正文说 「In the table below」, 可抓下来的页面在那段文字下只有一块空白, PDF 这一页没有任何嵌入图片, 表整张没抓到. 和闭源模型的比较因此只剩一句话, 没有一个分数.

## 2. 46.8% 和 SWE-Bench Verified

SWE-Bench Verified 是这页唯一的基准. 页面对它的描述是 500 个真实 GitHub issue, 每个都人工筛过 「correctness」. 46.8% 折成题数约 234 道. 页面没说跑了几次, 没说取平均还是取最好, 没给置信区间, 也没说每道题允许多少步, 多少 token 预算. 对 agent 基准来说, 这些设置会直接影响分数, 页面一个都没交代.

第 2 页还强调了脚手架的作用: 脚手架 「define the interface between the model and the test cases」. 这句话说明分数是 「模型加脚手架」 的组合成绩, 不是模型单独的能力. 页面提了两个脚手架, OpenHands 和 SWE-Agent, 但 46.8% 只和 OpenHands 挂钩, 第 3 页明确写的是 「same test scaffold (OpenHands ...)」. Devstral 在 SWE-Agent 上多少分, 页面没有.

## 3. 散点图逐点读

散点图横轴是参数量 (十亿), 纵轴是分数, 没有轴标题, 各点没印数值. 按像素位置读: Devstral 约 (23, 46.8), Gemma-3 27B 约 (27, 10.1), Qwen3 235B-A22B 约 (236, 34.3), Deepseek-V3-0324 约 (671, 38.8), Deepseek-R1 约 (671, 34.1), Deepseek-V3 约 (671, 32.4) (读图). Devstral 的纵坐标和正文的 46.8% 对得上, 说明纵轴就是 SWE-Bench Verified 分数; Gemma-3 27B 的横坐标落在 27 附近, 说明横轴刻度读法没错.

图的构图有明显的指向. 左上角画了一块粉色楔形, 只把 Devstral 框在里面, 意思是 「小而强」. 图注写 「All models benchmarked officially by AllHands using the OpenHands scaffold with no customisation」, 五个对手都是开放权重模型, 没有闭源模型. 三个 Deepseek 模型挤在右侧同一横坐标上, 分数在约 32.4 到 38.8 之间; 其中 Deepseek-R1 是推理模型, 在这张图上并不比 Deepseek-V3-0324 高, 约 34.1 对 38.8 (读图), 页面没有解释. Gemma-3 27B 和 Devstral 尺寸相近, 分数约 10.1, 差约 36.7 个点, 是图上差距最大的一组.

## 4. 「6 个点」 和 「large margin」

第 1 页说 「outperforms all open-source models on SWE-Bench Verified by a large margin」, 第 3 页把幅度落到 「more than 6% points」, 对象是 「prior open-source SoTA models」. 按散点图, 开源最高的是 Deepseek-V3-0324, 约 38.8, 差约 8.0 个点 (读图), 满足 「超过 6 个点」. 如果 「prior open-source SoTA」 就是这个点, 页面完全可以写 「超过 8 个点」, 却写了 6.

这说明两句话的比较范围很可能不同. 第 3 页第一句没有限定脚手架, 此前的开源 SoTA 可能来自某个定制脚手架, 分数更高. 按 「超过 6 个点」 反推, 那个 SoTA 低于 40.8%; 按散点图, 它不低于 38.8%. 页面没点名这个模型, 没给分数, 也没说它用的什么脚手架. 「all open-source models」 也是一个全称说法, 图上只有五个开源对手, 能直接核实的只有这五个.

## 5. 消失的表格与 GPT-4.1-mini

第 3 页第二段说, 下面的表把 Devstral 和 「any scaffold (including ones custom for the model)」 下评测的开源, 闭源模型放在一起比, 结论是 Devstral 「substantially better」 于 「a number of closed-source alternatives」, 例子是 GPT-4.1-mini, 超过 「over 20%」. 这张表没抓到, 所以 「a number of」 是几家, 各自多少分, 都不知道.

「over 20%」 本身也有歧义. 按百分点读, GPT-4.1-mini 低于 26.8%; 按相对值读, 低于 46.8 / 1.2 约 39.0%. 两种读法差了 12 个点以上. 同一页前一句写的是 「6% points」, 带了 「points」, 这一句没带, 字面上更像相对值, 但页面没讲清. 还有一个口径问题: 表里允许 「custom for the model」 的脚手架, 那么 Devstral 在表里的分数是不是还是 OpenHands 下的 46.8%, 闭源模型用的又是哪家脚手架, 表没抓到, 这些都无从核对.

## 6. 模型大小: 页面没说的参数

全页没有一个字写参数量. 正文只有定性说法: 「light enough」, 「far larger models」. 唯一的量化线索是散点图横轴: Devstral 的点在 Gemma-3 27B 左边一点, 读图约 23 (读图). 读图精度有限, 在这个刻度下一个像素约 0.8, 只能说它在 20 出头到 27 之间, 比 Gemma-3 27B 小.

拿这个读数去对比, 正文 「far larger」 的倍数大致是: Deepseek-V3-0324 约 29 倍 (671 / 23), Qwen3 235B-A22B 约 10 倍 (235 / 23). 图上 Qwen3 的横坐标落在 235 附近, 名字里的 A22B 在图上没有体现, 页面对它也没有任何说明. 结构方面, Devstral 是不是 MoE, 层数, 注意力方式, RoPE 设置, 页面一概没写, 这里也不补.

## 7. 本地部署: RTX 4090 和 32GB Mac

第 3 页说 Devstral 「light enough to run on a single RTX 4090 or a Mac with 32GB RAM」. 这是页面上唯一和硬件有关的数. 它没有写精度, 量化方式, 上下文长度, 批大小, 也没有写生成速度. 同一个模型, 半精度和 4 bit 量化对显存的需求能差好几倍, 所以 「能跑」 这句没法反推参数量, 也没法反过来核对硬件够不够.

页面把本地部署和两个用途绑在一起: 一是 OpenHands 这类平台操作本地代码库, 二是企业里对隐私敏感, 合规要求严的代码库. 第二个用途的逻辑是 「代码不出本地」, 页面没有给任何企业客户, 部署案例或安全评测. 第 4 页再加一类: agentic coding 的 IDE, 插件, 环境, 建议加进模型选择列表. 三类用途都只有推荐, 没有配套分数.

## 8. 脚手架: OpenHands, SWE-Agent 与 All Hands AI

这页的合作结构值得单独看. Devstral 是 Mistral AI 和 All Hands AI 合作做的, OpenHands 由 All Hands AI 提供, 散点图的所有分数由 「AllHands」 官方跑, 用的也是 OpenHands. 也就是说, 合作方同时是脚手架提供方和跑分方. 页面把这当作 「官方, 无定制」 的背书, 图注特意写了 「no customisation」.

「no customisation」 说的是脚手架没有针对各个模型改, 但 Devstral 本身 「trained to solve real GitHub issues」, 训练时用的是什么环境, 页面没写. 如果训练就在 OpenHands 风格的交互上做, 那么在 OpenHands 上评测对 Devstral 更顺手, 对其他模型是 「陌生脚手架」. 这是推测, 页面没有给训练细节, 既不能证实也不能排除. 页面提到的另一个脚手架 SWE-Agent 没有任何分数, 所以跨脚手架的稳健性这页回答不了.

## 9. 价格与名字

API 价格是输入 $0.1/M token, 输出 $0.3/M token, 输出是输入的 3 倍, 页面说和 Mistral Small 3.1 同价. 假设输入输出按 3:1 混合, 约 $0.15/M token; 按 1:1 约 $0.2/M token (混合比例为假设值). agent 任务的特点是上下文反复喂回去, 输入 token 远多于输出, 所以实际混合比例可能比 3:1 更偏输入, 这一点页面没讨论. 页面没有印任何对手的价格, 也没给每道 SWE-Bench 题平均花多少 token.

API 名字 devstral-small-2505 带了两个页面没解释的信息. 「2505」 和发布日期 May 21, 2025 的年月对得上, 按年两位加月两位读是合理的. 「small」 在正文里从没出现过, 正文只叫 「Devstral」; model card 和各下载链接指向 Devstral-Small-2505. 和 Mistral Small 3.1 同价, 名字里又带 small, 两者放在一起, 读者很容易把它理解成 Small 这一档的代码 agent 版本, 但页面没有写它基于哪个基座.

## 10. 谱系: 这页能说什么

这页能确认的家族关系只有两条. 一条是价格锚点: 「at the same price as Mistral Small 3.1」. 这是全页唯一提到的 Mistral 自家模型, 而且只在价格上挂钩, 没说训练上是否继承. 另一条是尺寸档位: API 名字带 「small」, 结尾预告 「a larger agentic coding model」, 说明 Mistral 把 Devstral 当作一条按尺寸展开的产品线的起点, 这一档之后还有更大的一档.

页面没有提 Codestral, 也没有把 Devstral 和任何 Mistral 自家的代码模型比过分数. 散点图和正文比的全是外部模型: Gemma, Qwen, Deepseek, GPT-4.1-mini. 所以这页没法回答 「Devstral 比自家上一代代码模型强多少」, 也没法回答它和 Codestral 是什么关系. 预告里那个 「larger」 模型没有名字, 没有参数, 没有日期, 它后来的规格和分数, 不该倒灌进这篇的解读里. 另外, 页面说可以 「continued pre-training」 或 「distilling Devstral's capabilities into other models」, 这是面向企业的定制服务, 不是谱系信息.

## 11. 本页对不上的数字

正文和图之间: 第 3 页写 「Qwen3 232B-A22B」, 散点图标 「Qwen3 235B-A22B」, 点的横坐标读图约 236, 和 235 对得上, 正文的 232 像是笔误. 「outperforming prior open-source SoTA models by more than 6% points」 和散点图上约 8.0 个点的差距 (读图) 不一致, 可以用 「比较范围不同」 解释, 但页面没说明. 第 1 页 「all open-source models」 是全称, 图上只有五个开源对手.

页面自身: 第 3 页引用的 「table below」 在抓页里是一块空白, 「a number of closed-source alternatives」 和 GPT-4.1-mini 的分数都无法核对; 「over 20%」 没写是百分点还是相对值, 两种读法对应 26.8% 和约 39.0% 两个上限. 页脚 「Mistral AI © 2026」 和正文日期 May 21, 2025 差一年多, 页脚是抓页时的外壳. 转换稿和 PDF 之间: 转出的 Markdown 丢了第 3 页开头的 46.8% 那句和第 4 页开头一句, 以 PDF 文本层为准. 散点图本身的点位和正文 46.8%, 671B 没有冲突.
