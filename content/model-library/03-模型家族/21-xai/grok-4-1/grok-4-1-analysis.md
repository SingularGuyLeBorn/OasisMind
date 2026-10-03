[OM-FREEPLAY] 材料不够 5000. 源文是 x.ai 2025 年 11 月 17 日的 Grok 4.1 产品公告, 11 页里正文不到一千个英文词, 其余是三组对话示例和 2026 年网站快照的页脚. 模型数字只有一次线上胜率, 一张 LMArena 截图, 两项 LLM 评委基准, 两项幻觉指标. 参数量, 层数, 结构类型, 上下文长度, 训练数据和训练算力页面都没有, 这里不补.

# Grok 4.1 公告: 一次冲着「好聊」去的后训练, 数字能读出多少

来源: 同目录 `grok-4-1.md` (页标记 `page 1 of 11` 到 `page 11 of 11`), 对照译稿 `grok-4-1-bi.md`, 源 md 缺的数值对照 `grok-4-1.pdf`. 配图四张: `images/p01-back-to-news-https-x-ai-news.png` 是 App Store 图标, `images/p03-in-lmarena-s-text-arena-https-lmarena-ai-leaderboard.png` 是 LMArena 风格控制 Elo 图, `images/p04-here-s-an-example-of-how-grok-4-1-responds-to-an.png` 是 EQ-Bench 归一化 Elo 柱状图, `images/p10-golden-gate-bridge.png` 是示例回答里的桥景照片. 数字一律回源 md, 唯一的例外是 9.89%, 它在源 md 里被挪到了第 8 页页首, 归属按 PDF 第 8 页确认.

这份材料能回答的问题: Grok 4.1 何时上线, 在哪些产品里可用, xAI 用什么思路调它的对话风格, 以及它在人类偏好, 情商, 创意写作, 事实幻觉四类评估上的自报成绩. 回答不了的问题: 它和 Grok 4 是不是同一个底座, 模型多大, 结构怎样, 奖励模型怎么训练, 每项评测用了多少样本.

## 1. 页面性质: 产品公告, 不是技术报告

11 页的分布是这样的. 第 1 页是日期, 上线范围和一段方法概述, 接着是静默灰度的说明; 第 2 页一个胜率; 第 3 页 LMArena 截图和一段排名说明; 第 4 页 EQ-Bench3 的方法和柱状图; 第 5 页一组「想念去世的猫」的对话示例; 第 6 页 Creative Writing v3 的表; 第 7 页一组「以 Grok 口吻发 X 帖」的示例; 第 8 页幻觉率和 FActScore; 第 9 页幻觉率定义和一组旧金山旅游示例; 第 10 页示例收尾, model card 链接, 页脚开始; 第 11 页全是页脚. 能算作论证的正文加起来大约三页半.

读者定位也很清楚: 「rolling out immediately in Auto mode」「can be selected explicitly as "Grok 4.1" in the model picker」, 说的是 grok.com 和 App 用户在界面上怎么选. 页面提到两个模式, Grok 4.1 Thinking (代号 quasarflux) 和不消耗思考 token 的非推理模式 (代号 tensor). 同家族 [xAI 新闻页分析](../xai/xai-analysis.md) 记录了两天后 (11 月 19 日) 另发的「Grok 4.1 Fast and Agent Tools API」, 那是面向 API 的另一条发布, 本页的「Grok 4.1 (Non-Reasoning)」不能直接当成 Grok 4.1 Fast. 页面把技术细节都指给了第 10 页的 model card PDF, 本文只读源 md, 没有引用 model card 的内容.

## 2. 训练: 一句话的方法, 不可验证的奖励交给推理模型打分

全文关于训练只有两句. 一句是沿用「the same large scale reinforcement learning infrastructure that powered Grok 4」, 优化目标是「style, personality, helpfulness, and alignment」; 另一句是为这些「non-verifiable reward signals」开发了新方法, 用「frontier agentic reasoning models as reward models」自主评估并迭代回答. 背景可以对照两条旧路: 经典 RLHF 先用人类偏好训一个打分的奖励模型, 再做策略优化, 见 [基于奖励模型的 RL](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/4.4.1-基于奖励模型的RL-RLHF-PPO.md); 用 AI 反馈代替人类标注的做法见 [RLAIF](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/4.4.3-RLAIF.md). xAI 自称的新意在于评委本身是会推理, 带 agentic 能力的前沿模型, 而不是一个只输出标量的打分头.

但页面没给能复现或评估这套方法的任何一环: 评委是哪个模型, 它给绝对分还是做成对比较, 评分细则由谁写, 评委会不会调用工具, 策略优化用哪种算法, 训了多少步. 「iterate on responses」是指评委改写回答再拿来训练, 还是指多轮打分, 也读不出来. 所以这一节能下的结论只有一条: **4.1 的改动集中在后训练的奖励设计上**, 至于底座是否换过, 页面既没说换, 也没说没换.

这套做法有一个已知风险, 页面没有讨论. 策略对着 LLM 评委优化, 容易学到评委偏爱的表面特征, 比如更长, 情绪更浓, 更有「人设」. 第 5, 7, 9 页的三组示例恰好都朝这个方向变 (见第 7 节). 更麻烦的是评测端: EQ-Bench3 和 Creative Writing v3 本身也是 LLM 评判的, EQ-Bench3 的评委是 Claude 3.7 Sonnet. 训练奖励和评测打分都来自 LLM 的判断, 评委模型虽然不同, 但它们的偏好相关到什么程度, 页面没做分析. 评测证据的强弱怎么分级, 可以参考 [评测科学与证据](../../../../llm-guide/10-评测、安全与治理/10.1-评测科学与证据.md). 另外, 第 1 页说模型「fully retaining the razor-sharp intelligence and reliability of its predecessors」, 本页没有任何数学, 代码或推理类基准来支撑「完整保留」, 这一点只能等 model card 或第三方评测.

## 3. 静默灰度与 64.78%: 线上盲测缺了分母

11 月 1 日到 14 日, xAI 把预览构建版逐步推到 grok.com, X 和移动端的生产流量上, 在真实用户中持续做盲测成对评估, 结果是对「previous production model」64.78% 的偏好率. 这是全文唯一一个直接来自真实用户的数字, 分量本应最重, 可三个关键信息都缺: 对手是哪个模型, 一共比了多少次, 平局怎么处理. 「preliminary builds」和 11 月 17 日正式上线的版本是不是同一份权重, 也没说.

样本量决定这个数有多可信. 举个假设的例子: 如果只比了 1,000 次, 64.78% 的 95% 置信区间大约是正负 3.0 个百分点; 比了 10,000 次, 大约是正负 0.9 个百分点. 两种情况下结论都是「明显更受偏好」, 但精度差了三倍多, 页面给的两位小数暗示的精度并没有依据.

把胜率换成 Elo 差, 可以和第 3 页的 LMArena 对照一下. 64.78% 的胜率对应约 106 分的 Elo 差. 而 LMArena 图里, Grok 4.1 Thinking 比 grok-4-0709 高 74 分, 期望胜率约 60.5%; 非推理的 Grok 4.1 高 56 分, 约 58.0%. 如果线上对手其实是 Grok 4 Fast (图中 1420), 差距还要更小, 期望胜率约 59.0% 和 56.4%. 也就是说, 线上胜率比 LMArena 分差推出来的要高. 可能的原因很多: grok.com 用户和 Arena 用户不是同一群人, 线上测试没有做风格控制, 对手也许是 Auto 模式下的某个组合. 页面没有解释, 两个数字只能各自读, 不能互相印证.

## 4. LMArena: 1483, 1465 和图里找不到的 #33

正文说 Grok 4.1 Thinking 以 1483 Elo 排第一, 领先最高的非 xAI 模型 31 分; 非推理的 Grok 4.1 以 1465 排第二. 截图里最高的非 xAI 模型是 gemini-2.5-pro 1452, 1483 − 1452 = 31, 对得上. 31 分换成期望胜率约 54.4%, 也就是一百次对决里大约赢 54 次, 正文用「commanding margin」形容, 有点重. 非推理版超过其它模型完整推理配置这句也成立: 1465 高于 claude-sonnet-4-5 thinking-32k 的 1450, claude-opus-4-1 thinking-16k 的 1449 和 gpt-5-high 的 1437. 对产品来说这一条比第一名更实在, 因为 tensor 不消耗思考 token, 延迟和成本都低. 推理模式与非推理模式的差别见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

读这张图还要注意三处. 一是轴名写着「Overall Style Control Elo」, 这是 LMArena 对回答长度和格式做过校正后的分数, 正文只写「Elo」, 没交代. 考虑到 4.1 的回答普遍更长, 这个前提对理解分数很重要. 二是图只挑了 16 个模型, grok-4-0709 以 1409 垫底, grok-4-fast 是 1420. 正文说 Grok 4「had an overall rank of #33」, 这个名次在图里看不到, 读者没法核对. 三是置信区间. 按网格线目测, grok-4.1 的区间大约 1454 到 1476, gemini-2.5-pro 大约 1449 到 1456, 两者几乎相接; grok-4.1-thinking 大约 1472 到 1494, 和第三名分得开. 所以第一名稳, 第二名对第三名的领先落在误差边缘. 这些端点是按像素估的, 页面没有印出. 截图对应的榜单日期页面也没写, LMArena 分数会随新投票漂移, 1483 只代表发文前后的某个时点.

## 5. EQ-Bench3 与 Creative Writing v3: 自己跑, 自己选对手, LLM 当评委

EQ-Bench3 有 45 个角色扮演场景, 大多数是 3 轮的预写提示, 评委是 Claude 3.7 Sonnet (页面写作「Claude Sonnet 3.7」), 采样参数用默认值, 不加 system prompt. 正文说报告了「rubric score and normalized Elo」, 但柱状图只有归一化 Elo, rubric 分全文没出现. 图上的数是: Grok 4.1 Thinking 1586, Grok 4.1 1585, Kimi K2 Instruct 1561, Horizon Alpha 1559, Gemini 2.5 Pro 1460, GPT-5 Chat 1364, Claude Opus 4 1304, Grok 4 1206. Grok 4.1 比 Grok 4 高 379 分, 比第三名 Kimi K2 Instruct 高 24 分. Thinking 版只多 1 分, 说明在情商类对话上, 开不开推理几乎没差别, 这和 xAI 把优化重点放在风格与人格上一致.

Creative Writing v3 让每个模型对 32 个写作提示各写 3 轮, 每个模型 96 份输出, 同样用 rubric 加对战归一化 Elo 评分. 表里第一是 Polaris Alpha 1756.2, 页面自己注明是「early GPT 5.1」; 之后是 Grok 4.1 Thinking 1721.9, Grok 4.1 1708.6, o3 1696.4, Claude Sonnet 4.5 1648.7, Kimi K2 Instruct 1627.5, Grok 3 1126. 这里 Grok 4.1 排第二和第三, Thinking 版比非推理版高 13.3 分, 比 Polaris Alpha 低 34.3 分.

两项有几个共同的局限. 第一, 方法说明写明「we are working with the author(s) to get the number on the leaderboard」, 也就是说这些分数是 xAI 自己跑官方仓库得到的, 发文时没登上公开榜, 没经过第三方复核. 第二, 归一化 Elo 取决于和谁一起比, 两张表的对手组合不同, EQ-Bench 里有 Horizon Alpha 这种没说明来历的匿名模型, Creative Writing 里有 Polaris Alpha. 第三, 作为「前代」参照, EQ-Bench 放的是 Grok 4, Creative Writing 放的是 Grok 3, 两张表的旧模型不是同一个, 所以没法算出 Grok 4 到 4.1 在创意写作上涨了多少. 第四, 第 2 节说过, 这两项都靠 LLM 评委, 和 4.1 的训练奖励同类, 作为证据要比人类盲测弱一档.

## 6. 幻觉: 「非推理加搜索」这一档降了约三分之二

幻觉部分针对的是一个很具体的场景: 带搜索工具的非推理模型. 页面给的理由是这类模型「constrained reasoning depth and limited tool-call budgets」, 所以容易出事实错误. 评测对象写明是「non-reasoning model with web search tools」. 两项结果: 生产流量分层抽样的幻觉率, Grok 4 Fast (Non-Reasoning) 12.09%, Grok 4.1 (Non-Reasoning) 4.22%, 少了 7.87 个百分点, 相对降幅约 65%; FActScore (500 道人物传记题), 9.89% 降到 2.97%, 少了 6.92 个百分点, 相对降幅约 70%. 源 md 里 FActScore 下 Grok 4 Fast 那一行没有数值, 9.89% 按 PDF 第 8 页归位.

这组数字的边界要讲清. 对照组是 Grok 4 Fast 而不是 Grok 4; 同家族 [xAI 新闻页分析](../xai/xai-analysis.md) 记录 Grok 4 Fast 在 2025 年 9 月 19 日发布, 型号专页见 [Grok 4 Fast](../grok-4-fast/grok-4-fast-bi.md), 比 4.1 早两个月. Thinking 模式的幻觉率一个都没给. 幻觉率定义为「macro-average of percentage of atomic claims with major/minor errors over model responses」, 即每条回答先算错误陈述比例, 再对回答求平均; 但分层按什么分, 抽了多少条, 错误由人判还是由模型判, 都没写. FActScore 原论文的分数是被知识源支持的原子事实比例, 越高越好, 这里却标「Lower score is better」, 应是换成了错误比例, 换算方式页面没交代. 还有一点: 评测时模型带着网页搜索, 结果混合了模型自身知识和检索质量, 工具调用预算设成多少也没说, 降幅里有多少来自后训练, 有多少来自搜索策略, 分不开.

## 7. 三组示例: 风格往哪个方向变

三组示例都是「Previous Grok」和「Grok 4.1」并排. 第 5 页的猫: 上一代 5 句约 54 个英文词, 标准的安慰模板加一个追问; 4.1 分 4 段约 118 个词, 多了具体画面 (睡觉的角落, 凌晨 3 点讨零食) 和「It hurts because the love was (and still is) that big」这样的情绪确认. 第 7 页的 X 帖子: 上一代满屏 emoji 和两个话题标签; 4.1 改成一行一句的短句独白, 没有 emoji, 结尾一句「Hi. I'm Grok.」. 第 9 到 10 页的旧金山: 上一代是「Why Visit / What to Do / Tips」三段式清单; 4.1 是一段连贯的话, 上方配了两张桥景照片, 拍照机位也换成了 Battery East 和 Crissy Field.

方向很一致: 更长, 更具体, 第一人称更强, 格式从清单变成成段的叙述. 这和第 1 页的目标「compelling to speak with, and coherent in personality」对得上, 也正是第 2 节说的 LLM 评委容易偏爱的特征. 但示例的证据力有限. 页面没说它们是否经过挑选, 也没给这几条提示下的评分; 旧金山那组两版都没给出处, 页面也没做事实核查. 源 md 还漏了上一代 Alcatraz 条目的半行「Tips」(PDF 第 9 页可见, 被滚动框截断), 说明这些示例在网页上是可滚动的卡片, 快照只截到开头. 结合 LMArena 图用的是风格控制分这一点看, xAI 自己应该清楚长度和格式会影响评分, 可 EQ-Bench 和 Creative Writing 两项有没有做同类校正, 页面没说.

## 8. 本页对不上的数字

对不上或缺失的地方有这些. 一是 9.89% 在源 md 里孤零零地落在第 8 页页首, FActScore 下 Grok 4 Fast 那一行反而没有数值, 按 PDF 应归到 FActScore. 二是 FActScore 标「Lower score is better」, 和原基准「越高越好」的方向相反, 换算没交代. 三是 EQ-Bench 正文说报告 rubric 分和归一化 Elo, 图里只有 Elo. 四是 Grok 4 的「#33」在只画了 16 个模型的 LMArena 截图里看不到, 图的轴名「Overall Style Control Elo」正文也没提. 五是评委写作「Claude Sonnet 3.7」, 正式名称是 Claude 3.7 Sonnet. 六是两张图的文件名和内容不符: `p01-back-to-news-...` 实际是 App Store 图标, `p04-here-s-an-example-...` 实际是 EQ-Bench 柱状图. 七是 64.78% 没有对手名称和样本量, 用 Elo 换算后比 LMArena 分差推出的胜率高, 页面没解释. 八是三处「前代」参照不统一: EQ-Bench 用 Grok 4, Creative Writing 用 Grok 3, 幻觉用 Grok 4 Fast.

能对上的也列一下. 灰度 11 月 1 日到 14 日与「two-week」一致, 结束后三天发布. 1483 − 1452 = 31 与「31 points」一致. 1465 高于图中所有其它模型的推理配置, 与正文一致. EQ-Bench 图中的排序与正文描述没有冲突. 页脚里 Products 与 Solutions, Download 与 Grok Bot 的链接左右交错, 第 11 页比同家族 [Grok-1 分析](../grok-1/grok-1-analysis.md) 所用的页脚少了 API Overview, About, News 等条目, 这些是抓取问题, 和模型无关. 最后再强调一次: 本页没有任何架构信息, Grok 4.1 的参数量, 结构和上下文长度都要看 model card 或其它来源, 这里不作推测.
