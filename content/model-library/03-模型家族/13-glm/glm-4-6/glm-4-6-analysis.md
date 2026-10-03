> 源文 `glm-4-6.md` 是 Z.ai 在 2025-09-30 发布 GLM-4.6 的博客, MinerU 抓取, 4 页, 13 张图. 正文是五条改进, 一张八项基准图, 一组 CC-Bench 人工对比和一张 token 用量图, 其余是接入和部署说明. 全篇没有结构, 参数量和训练细节.

# GLM-4.6 博客: 200K 窗口, 八项基准和一组人工对比

来源: 同目录 `glm-4-6.md` (页标记 `page 1 of 4` 到 `page 4 of 4`), 对照同目录 `glm-4-6.pdf`. 逐段英中对照和 19 处疑点见 `glm-4-6-bi.md`. 下文引用的所有分数, 除非注明 「论文」, 都出自博客的正文或图.

## 1. 材料性质: 一篇四页的发布博客

第 1 页是日期 「2025-09-30 · Research」, 标题 「GLM-4.6: Advanced Agentic, Reasoning and Coding Capabilities」, 四个链接 (Z.ai 试用, API 文档, HuggingFace 模型页, Tech Report), 然后是五条改进和一段评测总结. 第 2 页是一整块八项基准的柱状图和一段 CC-Bench 说明. 第 3 页上方是 CC-Bench 胜平负图和 token 用量图, 下方是 「Getting started with GLM-4.6」 的四个小节: API, 编程智能体, 网页对话, 本地部署. 第 4 页只剩一句部署说明和页脚.

这份材料能回答的是: GLM-4.6 相对 GLM-4.5 官方宣称改了哪几处, 八项基准上五个模型各得多少, CC-Bench 人工对比的胜平负和 token 用量, 以及从哪里拿到模型. 它回答不了 GLM-4.6 的参数量, 层数, 注意力结构, 训练数据和训练方法; 页面上的 Tech Report 链接指向的也不是这一代的报告, 第 6 节单独说.

## 2. 五条改进: 只有一条带数字

五条改进依次是: 更长的上下文窗口, 编程更强, 推理更强, 智能体更强, 写作更讲究. 其中只有第一条给了数字: 上下文窗口从 128K token 扩到 200K token, 理由是 「handle more complex agentic tasks」. 128K 是博客自己印的 GLM-4.5 窗口, 200K 是 GLM-4.6 的窗口长度. 怎么扩上去的, 用了什么位置编码或长文本训练, 全篇一句没有.

200K 这个数在后面的评测里没有出现. 第 2 页评测图副标题写 「Evaluation results under 128K context length」, 八项基准都是在 128K 下跑的. 所以这篇博客里, 200K 只是一个窗口长度, 没有任何一项分数能证明 200K 下的表现. 引用时应写 「窗口 200K, 评测在 128K 下完成」, 不能把两件事合成一句 「200K 下多少分」.

另外四条都没有数字. 「Superior coding performance」 列了 Claude Code, Cline, Roo Code, Kilo Code 四个应用, 说真实表现更好, 前端页面更精致, 但没有给对比数据. 「Advanced reasoning」 说支持 「tool use during inference」, 在图上对应的是 GLM-4.6 柱顶那几段 「w/ Tools」. 「More capable agents」 和 「Refined writing」 只有定性描述, 写作和角色扮演这一条在全篇没有对应的评测.

## 3. 八项基准: 图上印的数

第 2 页的评测图列了五个模型, 按图例顺序是 GLM-4.6, GLM-4.5, DeepSeek-V3.2-Exp, Claude Sonnet 4, Claude Sonnet 4.5. 柱子上只有图标, 两根 Claude 柱用的是同一个 Anthropic 字标, 要靠图例顺序和灰度分辨. 按这个顺序读出的数如下 (括号里是 GLM-4.6 带工具的数, 只有前四项有):

| 基准 | GLM-4.6 | GLM-4.5 | DeepSeek-V3.2-Exp | Claude Sonnet 4 | Claude Sonnet 4.5 |
|---|---|---|---|---|---|
| AIME 25 | 93.9 (98.6) | 85.4 | 89.3 | 74.3 | 87.0 |
| GPQA | 81.0 (82.9) | 79.9 | 79.9 | 77.7 | 83.4 |
| LiveCodeBench v6 | 82.8 (84.5) | 63.3 | 70.1 | 48.9 | 57.7 |
| HLE | 17.2 (30.4) | 14.4 | 19.8 | 9.6 | 17.3 |
| BrowseComp | 45.1 | 26.4 | 40.1 | 14.7 | 19.6 |
| SWE-bench Verified | 68.0 | 64.2 | 67.8 | 72.5 | 77.2 |
| Terminal-Bench | 40.5 | 37.5 | 37.7 | 35.5 | 50.0 |
| τ²-Bench (Weighted) | 75.9 | 67.5 | 53.4 | 66.0 | 88.1 |

带工具的四个数只属于 GLM-4.6, 其他模型没有同口径的数, 表里拿不带工具的数横向比才公平. 按不带工具的数: GLM-4.6 对 Claude Sonnet 4 八项赢七项, 只输 SWE-bench Verified (68.0 对 72.5); 对 DeepSeek-V3.2-Exp 八项赢七项, 只输 HLE (17.2 对 19.8); 对 Claude Sonnet 4.5 只赢 AIME 25, LiveCodeBench v6, BrowseComp 三项, 其余五项落后.

正文的总结是 "competitive advantages over DeepSeek-V3.2-Exp and Claude Sonnet 4, but still lags behind Claude Sonnet 4.5 in coding ability". 前半句和表一致. 后半句只说了编程, 实际上 GPQA, HLE, τ²-Bench 三项也落后于 Claude Sonnet 4.5, 其中 τ²-Bench 差 12.2 分; 而名字上最像编程题的 LiveCodeBench v6, GLM-4.6 反而以 82.8 对 57.7 领先. 博客没有说明八项里哪几项算 「coding」, 上面按名字的归类只是读法, 不是博客给的.

## 4. 和 GLM-4.5 比: 哪些是博客印的

博客正文里和 GLM-4.5 比较的地方有三处: 「Compared with GLM-4.5, this generation brings several key improvements」, 「Results show clear gains over GLM-4.5」, 「GLM-4.6 improves over GLM-4.5」. 三处都是定性的. 正文里唯一写成数字的对比是 token 用量 「about 15% fewer tokens than GLM-4.5」. 其余对比全部印在图上: 八张柱状图的绿柱, CC-Bench 图里 「GLM-4.6 vs GLM-4.5」 那一行, token 图里 GLM-4.5 那根柱.

八项基准上 GLM-4.6 全部高于 GLM-4.5. 差值依次是 AIME 25 8.5, GPQA 1.1, LiveCodeBench v6 19.5, HLE 2.8, BrowseComp 18.7, SWE-bench Verified 3.8, Terminal-Bench 3.0, τ²-Bench 8.4. 提升最大的是 LiveCodeBench v6 和 BrowseComp, 都接近 20 分; 最小的是 GPQA, 只有 1.1 分. CC-Bench 里 GLM-4.6 对 GLM-4.5 是 50.0% 胜, 13.5% 平, 36.5% 负; token 用量是 651,525 对 762,817.

GLM-4.5 那一行不能拿论文去补. 同家族目录的 GLM-4.5 论文 (arXiv:2508.06471) 里, HLE 14.4, BrowseComp 26.4, SWE-bench Verified 64.2, Terminal-Bench 37.5 四个数和博客绿柱相同; 但论文 GPQA 是 79.1, 博客绿柱是 79.9, 而论文用的是 AIME 24, LiveCodeBench (2407-2501) 和 TAU-Bench, 博客用的是 AIME 25, LiveCodeBench v6 和 τ²-Bench (Weighted), 基准版本都不同. 所以引用 GLM-4.5 分数时, 讲 GLM-4.6 的博客就用博客绿柱, 不和论文数混用.

## 5. CC-Bench 与 token 用量

CC-Bench 是 GLM-4.5 时就有的人工评估, 这次加了更难的任务. 做法是人类评估员在隔离的 Docker 容器里和模型协作, 完成前端开发, 工具构建, 数据分析, 测试和算法等多轮真实任务. 第 3 页图的标题写 「CC-Bench-V1.1」, 这个版本号正文没提. 四行结果是: 对 Claude Sonnet 4 48.6% 胜, 9.5% 平, 41.9% 负; 对 GLM-4.5 50.0%, 13.5%, 36.5%; 对 Kimi-K2-0905 56.8%, 28.3%, 14.9%; 对 DeepSeek-V3.1-Terminus 64.9%, 8.1%, 27.0%. 每行加起来都是 100.0%.

正文把第一行说成 「near parity with Claude Sonnet 4 (48.6% win rate)」. 按图上三个数, 胜比负多 6.7 个百分点, GLM-4.6 略占上风, 「near parity」 是博客自己选的保守措辞. 对两个开源对手, 胜减负是 41.9 和 37.9 个百分点, 对应正文的 「clearly outperforming other open-source baselines」. 需要注意对手换了: 第 2 页基准图比的是 DeepSeek-V3.2-Exp, 这里比的是 DeepSeek-V3.1-Terminus, Kimi-K2-0905 也只在这里出现, Claude Sonnet 4.5 不在 CC-Bench 里. 两组对比不能拼成一张表.

token 用量图的标题是 「Average Token Usage per Interaction」, 图内小字说明是多次工具调用的输入加输出 token, 不计缓存. 四根柱是 GLM-4.6 651,525, GLM-4.5 762,817, Kimi-K2-0905 821,759, DeepSeek-V3.1-Terminus 947,454. 651,525 除以 762,817 约为 0.854, 少约 14.6%, 正文取整成 「about 15%」; 同样算法下比 Kimi-K2-0905 少约 20.7%, 比 DeepSeek-V3.1-Terminus 少约 31.2%, 后两个数博客没写.

这张图本身有两处印刷问题. 纵轴顶端印的是 「1,00,000」, 按 250,000 的刻度间隔应是 1,000,000, 少了一个 0. 纵轴标题写 「Tokens per Round」, 图标题写 「per Interaction」, 两个口径是不是同一件事, 图里没说明. 这两点不影响四根柱上印的数, 但引用时应照抄柱顶数字, 不要按刻度估读. 轨迹数据公开在 HuggingFace 的 `zai-org/CC-Bench-trajectories`.

## 6. Tech Report 链接指向的是上一代

第 1 页的 「Tech Report」 按钮链到 `arxiv.org/abs/2508.06471`. 同家族目录里这篇论文的开头印着 「arXiv:2508.06471v1 [cs.CL] 8 Aug 2025」, 标题是 「GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models」, 比本篇博客早 53 天. 博客没有说明它是上一代的报告, 按钮上只写 「Tech Report」, 读者很容易以为这是 GLM-4.6 的技术报告.

这件事的后果是, 论文里的内容都不能算在 GLM-4.6 头上. 论文摘要给的 355B 总参数和 32B 激活参数是 GLM-4.5 的; 博客对 GLM-4.6 一个参数数字都没给, 也没说沿用 GLM-4.5 的结构. 第 3 页还说 Z.ai API 平台提供 「both GLM-4.6 models」, 可全篇只出现 GLM-4.6 一个名字, 第二个是什么没有交代, 这里也不猜. 本目录里关于 GLM-4.6 的技术事实, 只有窗口长度, 八项基准分数, CC-Bench 结果和 token 用量这几样.

## 7. 13 张图和它们的文件名

13 张图按页分布是: 第 1 页 2 张, 第 2 页 8 张, 第 3 页 2 张, 第 4 页 1 张. 文件名和画面相符的是 `p02-chart.png` 到 `p02-chart-7.png` 七张, 依次是 AIME 25, GPQA, LiveCodeBench v6, HLE, BrowseComp, SWE-bench Verified, Terminal-Bench. `p01-image.png` 是一个 Z 字标, `p03-chart.png` 是 CC-Bench 胜平负图, 名字泛但不算错. 其余四张是拿相邻文字命名的: `p01-z-try-it-...` 画的是 Tech Report 前的文档图标, `p02-real-world-...` 画的是 τ²-Bench 柱状图, `p03-getting-started-...` 画的是 token 用量图, `p04-legal.png` 画的是页脚的大号 Z 字标.

对照 PDF 还能看出 md 里几处非正文的字. 第 2 页的评测图在 PDF 里是一张 3390x2654 的位图, 第 3 页两张图合在一张 8870x2898 的位图里, 所以 md 里的 「LLM Performance Evaluation」 标题, 粘成一串的图例, 「CC-Bench-V1.1」 标题和孤立的 「Z」, 都是从图里识别出来的. 第 1 页链接行里的两个 「Z」 和一个 「S」 是图标, 末尾的 「中」 是右下角的浮动按钮, 第 4 页的 「x0」 是页脚 X 和 GitHub 两个图标. token 图标题下那行 「(input + output tokens for multiple tool calls, without cache)」 则被 md 漏掉了.

## 8. 这篇能回答什么, 不能回答什么

能稳定回答的: GLM-4.6 在 2025-09-30 发布, 窗口从 128K 扩到 200K; 八项基准上五个模型各自的分数, 以及这些分数都在 128K 下得出; GLM-4.6 相对 GLM-4.5 八项全升, 差值从 1.1 到 19.5; CC-Bench 四组胜平负和每次交互的平均 token 用量; 权重在 HuggingFace 和 ModelScope, 支持 vLLM 和 SGLang. 这些都能在博客正文或图上找到原数, 引用时照抄即可.

不能回答的: GLM-4.6 的参数量和结构, 200K 是怎么扩出来的, 200K 下的长文本表现, 「both GLM-4.6 models」 的第二个是谁, Coding Plan 的 1/7 价格和 3 倍额度是和哪一档套餐比, 部署说明所在的 GitHub 仓库是哪个 (页脚图标只链到 `github.com/THUDM` 组织页). Tech Report 链接给的是 GLM-4.5 论文, 不能拿来填这些空. `glm-4-6-bi.md` 里记了 19 处疑点, 集中在 Tech Report 链接, 128K 和 200K 的关系, GLM-4.5 那一行的来源, 两组对比的对手差异和图的文件名上.
