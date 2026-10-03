源文是 OpenAI 的产品发布页「GPT-6 Astra: A new generation of intelligence」, 21 页抓页. 正文在第 3 到第 15 页, 第 16 到第 18 页是评测总表, 第 18 到第 20 页是 17 条脚注, 第 1, 2 页和第 20, 21 页是站点导航与页脚. 全文没有参数量, 层数, 注意力形式, 上下文窗口, 训练数据, 训练方法和训练算力. 唯一的外部对照是同一模型库里 GPT-5.6 发布页的原文.

# GPT-6 Astra: 一张分数表撑起的新一代发布

来源: 同目录 `gpt-6.md` (MinerU 抽取) 与 `gpt-6.pdf`, 21 页, 9 张图. 9 张图里只有 2 张有信息: 第 4 页 Terminal-Bench Science 0.1 的得分-成本曲线 (坐标轴和数值都没进图), 第 10 页 GPT-5.6 Sol 与 Astra 的对话截图对比. 其余 7 张是顶栏按钮残影, 全黑主视觉, 下载图标, 鼠标指针图标, 两张没加载出来的幻灯片查看器, 一个空视频播放器. 逐段对照见 `gpt-6-bi.md`. PDF 文字层和 MinerU 稿基本一致, 差别集中在第 16 页电脑操作表和第 18 页长上下文表的「-」占位被丢, 下文引用这两张表一律按 PDF.

| 条目 | 这页印的内容 |
| --- | --- |
| 发布日期 | 未印; 抓页不早于 Sep 22, 2026 (Sol, Luna 加入的更新横幅) |
| 型号 | GPT-6 Astra; Pro, Business, Enterprise 用户另有 GPT-6 Astra Pro; API 名 `gpt-6-astra` |
| 价格 (每 1M token) | 输入 $10, 输出 $50; 缓存读写另计; Fast 模式速度最高 2 倍, 价格 2 倍 |
| 上线 | 先限量机构, 数日内开放 ChatGPT Plus, Pro, Business, Enterprise, OpenAI API, Azure, AWS Bedrock |
| 评测 | 9 组 40 行, 对照 GPT-5.6 Sol, Claude Fable 5.1, Fable 5, Opus 5, Gemini 3.8 Flash |
| 安全评级 | 网络安全达到 Preparedness Framework 的 Critical 阈值; 生物方向本页没有 |
| 架构与训练 | 本页没有 |

## 1. 这页是什么, 缺什么

这是一张标准的 OpenAI 发布页. 结构是开头一段定调, 然后按「电脑操作, 专业工作, 编程, 科学发现, 网络安全, 对齐与部署, 上线」七块展开, 每块配一个可切换标签的交互图和一两段第三方引语, 最后三页是评测总表, 再跟 17 条脚注. 交互图在 PDF 里只剩标签页名字, 曲线一张也没抓全, 所以这页能核对的数字几乎都在正文和总表里. 第 4 页那张唯一的曲线没有坐标轴, 只能从点的相对位置看出 Astra 那条浅蓝线在左上, 即分数高, 成本低.

发布日期也要先弄清. 页面只写「rolling out today」, 没印日期. 顶上挂着「Update on September 22, 2026」, 说的是后来加入的 GPT-6 Sol 和 Luna, 可见抓页不早于 9 月 22 日, Astra 本身的发布在这之前. 第 15 页还有一句「as we shared last month」, 指 Private Safety Processing 的公告, 只能推出发布月的上一个月有过这次公告. 和 GPT-5.6 那页相比, 这页少了发布日期, 也少了模型尺寸, 缓存规则和成本估算方法的脚注, 能拿来推断模型本身的线索更少.

## 2. 型号, 价格与「一代只发一个」

GPT-5.6 是 Sol, Terra, Luna 三档同时发布; GPT-6 这页只发了 Astra 一个型号, 另给高档订阅用户一个 Astra Pro. 页首横幅说 9 月 22 日才「expanding our GPT-6 family with GPT-6 Sol and GPT-6 Luna」. GPT-5.6 时期的旗舰名 Sol 到了 GPT-6 变成追加的一档, 新旗舰换名叫 Astra. Astra, Sol, Luna 三者怎样排, Astra Pro 和 Astra 差在哪里 (更多推理算力, 还是另一个模型), 页面都没写. 总表每个模型只有一格分数, 也没有 Astra Pro 单列.

价格是这页少数能算的东西. Astra 输入 $10, 输出 $50, 输出是输入的 5 倍. 对照 GPT-5.6 页上 Sol 的发布价 $5 和 $30, Astra 输入贵 2 倍, 输出贵 1.67 倍. Fast 模式是「up to 2x the speed... at 2x the Standard price」, 速度写的是上限, 价格是确定的 2 倍, 按单位时间的产出算不会更划算. 缓存读写只说「Separate rates apply」, 没给数. 架构方面, 价格和上线渠道推不出任何东西: 是不是 MoE, 多少参数, 上下文窗口多长, 本页都没有. 唯一沾边的是开头那句「big bets across pre-training, reinforcement learning, and alignment」, 说明三条线都下了重注, 没说下在哪里.

## 3. 成本口径: 单价更贵, 每题更便宜

几乎每个评测结论都带一句成本比较. Terminal-Bench Science 0.1 上比 Fable 5.1 低约 31%, 低成本档比 Sol 低约 27%; BenchCAD 上比 Sol 低约 43%, 比 Fable 5.1 低约 86%; Terminal-Bench 4.0 上每题比 Sol 低约 9%, 比 Fable 5.1 低约 63%; GPQA Diamond 的低成本档比 Sol 低约 37%. 此外 Agents' Last Exam 上输出 token 比 Opus 5 少约 65%, ExploitGym 上「substantially fewer output tokens」, Higgsfield 的引语说最多少 20% token. 这些全是「estimated API cost」, 而这页没有任何一条脚注交代怎么估: 按哪天的价格, 算不算缓存, 输入 token 占多少. GPT-5.6 页至少有一条脚注说明是离线模拟, 这一页连这条都没有.

单价更贵却每题更便宜, 只能靠 token 用得少. 拿 Terminal-Bench 4.0 粗算: Astra 每题比 Sol 便宜 9%, 按 GPT-5.6 的发布价, 如果成本主要来自输出, Astra 的输出 token 约为 Sol 的 0.91/1.67, 约 0.55 倍; 如果主要来自输入, 约为 0.91/2, 约 0.46 倍. 可 GPT-5.6 页的更新横幅说 8 月 21 日起 Sol 降价 20% 以上, 为期 3 个月, 若 Astra 这页按降价后的 Sol 算, 这个比例还要再压到 0.36 到 0.44 倍. 页面没说用的哪个价, 所以只能说 Astra 在这项上的 token 用量大约是 Sol 的一半或更少. 这也解释了为什么页面反复强调输出 token: **token 效率是这一代的主要卖点**, 单价上涨要靠它抵消.

## 4. 推理强度: 分数取最高档, 成本取另一档

总表底下有一句关键说明:「Evaluation scores are the maximum at any effort」. 每格分数都是各推理强度里的最高值, 而正文的成本比较常常换到「lower-cost setting」. Terminal-Bench Science 0.1 就是例子: 总表写 64.6%, 正文的低成本档是 61.1%, 两个数对应两个档位. GPQA Diamond 同理, 总表 96.0%, 低成本档 94.9%. 读正文时要分清哪句在说最高分, 哪句在说省成本的那一档. 两套数不能写成同一个成绩.

Terminal-Bench Science 0.1 总表 64.6% 对正文低成本档 61.1%, GPQA Diamond 总表 96.0% 对低成本档 94.9%, 都是这个错位. 页面没有给出各档的完整表, 所以正文里的「更便宜」不能和总表的最高分放在同一句话里比.

## 5. 安全只保留评级和分数

网络安全达到 Preparedness Framework 的 Critical. ExploitBench 上 Astra 100%, GPT-5.6 Sol 78.5%; ExploitGym 上 42.4% 对 30.3%. 生物方向本页没有评级. 利用步骤不写.

架构仍然是空白. 价格, 上线渠道和这些分数都推不出参数量, 注意力形式或训练配方.