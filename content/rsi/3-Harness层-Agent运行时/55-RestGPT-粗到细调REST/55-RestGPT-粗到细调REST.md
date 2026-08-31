---
title: "55 · RestGPT：粗到细规划调 REST"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  RestGPT（arXiv:2306.06624 v2）：北大 / 华为冻 text-davinci-003，粗到细在线规划调真 REST。
  TMDB Success 75.0 / CP 79.0，Spotify 72.7 / 74.5。RestBench 过滤后 54 / 40 只 API，
  不要改 EASYTOOL 子集的 55。提示和 OAS 在墙外，不是 RSI。未找到会议接收。
tags:
  - RSI
  - RestGPT
  - RestBench
  - REST
  - Harness
---

# 55 RestGPT：粗到细规划调 REST

打开 arXiv v2 Table 4：骨干默认 `text-davinci-003`、温度 0，TMDB 上 RestGPT 的 Success **75.0**、CP **79.0**、\(\Delta\) **+0.55**；Spotify 上 **72.7 / 74.5 / +0.25**。作者写成电影库大约七成五、播放器「超过 70%」。禁止把 75.0 听成准确率柱去改 [LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 的 79.7，也不要和 [HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 伪标签单任务 Acc **52.62** 收成一只。CP 是路径子序列，Success 是人评请求办没办完，分母是 RestBench 测试集 TMDB **100** 条、Spotify **57** 条。100 不要改 [ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) I3 的 100 条。ChatGPT 行 TMDB Success **68.0**、CP **65.0**：这边 Success 反而高于 CP，是作者「多数情况下 CP 略高于 Success」的例外，两格不能倒过来填。

本篇落第 3 章。冻的是 `text-davinci-003`（对照还有 `gpt-3.5-turbo-0301`、Llama-2-13b-chat、Vicuna-13B-v1.5）和两份 OAS。改的是四份 in-context 提示 \(H\)：Planner、API Selector、Caller、Parser。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI。**不是** 术语式 (2)。**不是** HuggingGPT：那边冻 ChatGPT 调度 Hub 专家，规划 Acc 钉伪标签；这边调 TMDB / Spotify 的真 REST，主表是人评 Success。**不是** [EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md)：那边改说明书、主表两列均 pass 69.8；这边文档原样塞进分模块提示，RestBench 原文过滤 **54 / 40** 只 API，EASYTOOL 图 5 的 TMDB **55** 是他们自己的子集，两格并存，禁止用那 55 改本篇 Table 2。**不是** ToolLLM：那边 SFT 推 \(\theta\)，RapidAPI 16464，均 pass 66.7。一手：Song, Xiong, Zhu, Wu, Qian, Song, Huang, Li, Wang, Yao, Tian, Sujian Li；北京大学 / 华为；[arXiv:2306.06624](https://arxiv.org/abs/2306.06624) **v2**（2023-08）。**未找到会议接收**，主表钉 v2 的 Table 1–4、§3–§5、附录提示。项目 [restgpt.github.io](https://restgpt.github.io)；代码 [Yifan-Song793/RestGPT](https://github.com/Yifan-Song793/RestGPT)。站点 PDF 标题多了 “Applications via”，数字以 arXiv v2 为准。

## 1. 问题：专用工具接得住，真 REST 接不住

作者把当时工具增强写成两档。一档是搜索、计算器这种人钉死的小工具，[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) / [Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) / ART 都在这档。另一档是 HuggingGPT、ViperGPT、Visual ChatGPT、Chameleon，用 LLM 调度另一批专家模型。他们的判断是：专用 API 覆盖面跟着人列的清单走；离线规划一次把步骤写完，执行时不能拿返回值改计划。真实 Web 服务走 REST：HTTP 方法加 URI，响应是结构化 JSON，说明书是 OAS（Swagger）。窗口装不下整份文档，JSON 又长又嵌套，直接提示抽取会翻。Table 1 把邻居按「工具数 / 可扩展 / schema / 规划」摊开：ReAct 3 只专用、在线自然语言；Toolformer 5 只、无在线规划；Visual ChatGPT 22；ViperGPT 11、离线程序；HuggingGPT **24** 项任务、离线自然语言、可接 HuggingFace；Gorilla **1645** 带检索标记；RestGPT 写成 **100+** REST、粗到细在线、可插拔。100+ 是相关工作那句「over 100」，RestBench 实测是过滤后 TMDB 54、Spotify 40，加起来 94。禁止把 100+ 填进 Table 2，也不要用 24 去改 HuggingGPT 专文里的 24 项任务清单。脚注自己写：HuggingGPT 声称接了 Hub 上数百张卡，覆盖的任务类型仍是 24 项。AutoGPT 被写成精神近邻：也能拿一堆工具办复杂请求，但兼容性要开发者保证；RestGPT 声称只要有 OAS 就能插。声称不是主表。

OAS 被切成三段喂给三个模块。Selector 读全部端点的短描述，决定当前子任务调哪只。Caller 只读当前 API plan 里那些接口的详细文档，填参数和请求体。Parser 读 response schema，生成 Python 抽取代码。三段不进同一份提示，是因为上下文装不下。换切法等于人改 \(I\)。Caller 还会写出 response description 和 output instruction，Parser 按这两句从 JSON 里抠该抠的字段。案例 Figure 8 里一份响应写到 **694** 行；直接把 JSON 喂给 LLM 当 Parser 的消融，就是 Table 4 的 w/o Parser。抽取代码跑出异常，才退回「让 LLM 直接读响应」当备份。HTTP 调用走 Python `Requests`。实现受 LangChain OpenAPI agent 启发，附录 Table 11–14 是 Planner / Selector / Caller / Parser 四份提示。换示范、换「Continue / End」口令，75.0 会漂。

## 2. 机制：自然语言子任务，再落到 API 计划

三个模块 \(P\)、\(S\)、\(E\)，各自一只冻着的 LLM 加一份提示。一次请求是迭代的「计划–执行」环。第 \(t\) 步，Planner 看用户指令 \(q\)、此前自然语言计划 \((p_1,\ldots,p_{t-1})\) 和执行结果 \((r_1,\ldots,r_{t-1})\)，吐当前 NL 子任务 \(p_t\)。Selector 读端点描述，把 \(p_t\) 收成更细的 API 计划 \(a_t\)，可以是一次调用，也可以是几次。Executor 跑 \(a_t\) 得到 \(r_t\)：

\[
p_t \leftarrow P(q; p_1, r_1, \ldots, p_{t-1}, r_{t-1}),\quad
a_t \leftarrow S(p_t; r_1, \ldots, r_{t-1}),\quad
r_t \leftarrow E(a_t; r_1, \ldots, r_{t-1}).
\tag{1}
\]

粗的一层是人话子任务，细的一层才碰路径和参数。作者写成当时的 LLM 没法同时做规划、读文档和选接口，所以要拆开。Planner 另有两个状态。当前 \(r_t\) 还没填完这个 \(p_t\)，就吐 `Continue`，再给 Selector 一份补充计划 \(p_{t+1}\)；Selector 带着原来的 \(p_t\)、新的 \(p_{t+1}\)、旧 \(a_t\) 和 \(r_t\) 重写 API 计划：

\[
a_{t+1} \leftarrow S(p_t, p_{t+1}; r_1, \ldots, r_{t-1}; a_t, r_t),\quad
r_{t+1} \leftarrow E(a_{t+1}; r_1, \ldots, r_{t-1}, r_t).
\tag{2}
\]

请求已经办完，吐 `End` 和最终答。附录 Planner 提示还要求计划里少用代词、把上一轮结果写进去；要遍历列表，列表和元素都得出现在计划里。这些是 \(I\)，主实验没有搜过。Mariah Carey 建歌单那条案例：Offline 一次写出五步，第二步就选错、第四步在拿到 `user_id` 之前就用了这个槽。ReAct 交错想–做，第二步子任务过粗，第三步忽略依赖，一共 **6** 次调用才走完。RestGPT 先搜歌、再 `GET /me` 拿当前用户、`Continue` 后才 `POST` 建列表、最后加 track，**4** 次调用。4 对 6 是 Figure 5 定性，不要口算进 Table 4 的 \(\Delta\)。金标路径本身是四步：`GET /search`、`GET /me`、`POST /users/{user_id}/playlists`、`POST /playlists/{playlist_id}/tracks`。

Caller 的输出不是一句「去调这个 URL」。Figure 2 把一次 `GET /movie/{movie_id}` 写成：方法、URL、参数 `movie_id=843`、给 Parser 的描述「响应是 id 为 843 的电影详情」、输出指令「电影标题是什么」。Executor 先按这份参数打 `Requests`，再把 JSON 和 schema 交给 Parser 写抽取代码。窗口不够时，Caller 只保留当前 API plan 里出现过的文档，其余端点描述丢掉。这和 HuggingGPT 按任务类型过滤再按下载量 top-K 是同一类「提示装不下就切 \(I\)」，切的对象不同：那边是模型卡，这边是 OAS 字段。Selector 读短描述、Caller 读详细文档、Parser 读 schema，三份切片拼不出一份完整说明书，所以后来 EASYTOOL 才去动「把长文档收短」；本篇主表仍然假设 Agent 读得动原文档。

![用户指令进冻着的 Planner，Selector 读 OAS 短描述，Executor 调 REST；虚线下一子任务，权重仍冻](./images/fig-restgpt-loop.png)

> 图 1：实线是一步。虚线是执行结果回到 Planner，决定 Continue、下一子任务或 End。\(\theta\) 这一步不更新。

**图 1 解析**

- **User instruction**：TMDB 或 Spotify。训练没有 SFT 分母；75.0 是人评 Success。
- **Planner**：自然语言子任务，或 Continue / End。提示在附录 Table 11。
- **API selector**：读端点描述。去掉这一层，Table 4 的 w/o Planner 和 ReAct 行数字重合。
- **Executor**：Caller 填参，Parser 按 schema 写 Python。694 行 JSON 不进 Planner 窗口。
- **虚线回流**：本题内下一步。四份提示留下。OAS、温度 0、金标路径不留下可改写的副本。

## 3. RestBench：54 不是 55，答案会随日历变

场景两档。TMDB 接电影 / 剧 / 演员 / 图片；Spotify 接元数据、推荐、歌单、播放控制。作者从官方接口里过滤出常用的 **54** 和 **40** 只，配上对应 OAS。Table 2 测试集：TMDB 路径长 1 / 2 / 3 / 4 的条数是 **5 / 66 / 27 / 2**，均长 **2.3**，共 **100**；Spotify **8 / 18 / 22 / 9**，均长 **2.6**，共 **57**。开发集每场景 **10** 条。出题是自下而上：6 名做 NLP 的专家按 API 组合头脑风暴，并标金标路径；另 2 人核可解性和路径对不对。作者强调和「让 LLM 自己写调用过程」的前人不同，金标是人手。题量不大，他们写成典型用户请求，不是 RapidAPI 上万接口的抽样。TMDB 长度 4 只有 **2** 条，Figure 4「金标长 4 时基线几乎完不成」的分母极窄，只读方向，不要把那两题的成功率当成主表。Spotify 长度 3 和 4 合计 **31 / 57**，比 TMDB 的 **29 / 100** 更挤在长路上，主表 72.7 略低于 75.0，和这条分布同方向，禁止用 72.7÷75.0 去「证明」音乐比电影难多少个百分点。

Table 3 两条例子把「为什么不能钉死最终答案」说清楚。TMDB：「今天最热门电影的导演是谁」，金标两步 `GET /trending/{media_type}/{time_window}` 再 `GET /movie/{movie_id}/credits`。热门榜随日历变，导演名字不能当金标字符串；路径相对稳。Spotify：「做一张含 Mariah Carey 三首歌、名叫 Love Mariah 的播放列表」，金标四步，上面已经写过。附录另有「莱昂纳多最新电影的导演」：先 `GET /search/person` 拿到人物 id **6193**，Planner 吐 Continue，再 `GET /person/6193/movie_credits`。6193 是那次调用的返回值，不是超参，不要写进主表。Witcher 第一季第二集的剧照那条，案例里路径甚至直接打到 `/tv/63926/season/1/episode/2`，再拿剧集 id **1132654** 去取图：有的槽位被规划器提前写进 URL，有的必须等上一跳。花园把它读成「依赖由执行结果填」，不把 63926 听成本体数字。

尺子三把，§4.3。有的请求答案随时间变，Table 3 例子「今天最热门电影的导演是谁」没有固定金答案，所以不钉死最终字符串。路径对大多数题是稳的。生成路径**包含**金标路径作为子序列（元素不必连续），记 Correct Path Rate（CP%）。人评请求有没有被满足，记 Success%。效率用成功题上实际调用数减金标长度的均值：

\[
\Delta\text{Solution Len.}
= \frac{1}{N_s}\sum_{i}(L^{\mathrm{real}}_i - L^{\mathrm{gold}}_i)\cdot\mathbf{1}(i,\text{success}),
\tag{3}
\]

\(N_s\) 是成功条数。正值表示比金标多走了几步。RestGPT 的 +0.55 / +0.25 是表上最小的两格，作者写成粗到细规划更省步。CP 略高于 Success，读成「路径对了也可能执行翻」；ChatGPT 的 TMDB 65.0 对 68.0 是反过来的，花园按列报，不拿「大多数」去改那一行。

对照四条都**接了本篇 Executor**，否则 ReAct / Reflexion / DEPS / HuggingGPT 式离线规划本来不会填 REST 槽。DEPS 最多 **10** 步；Reflexion 最多 **2** 次 trial。温度 0。骨干默认 davinci-003。消融两条：去掉 Planner，让 Selector 按 ReAct 风格直接选 API，作者写成等价于「ReAct + 本篇 Executor」，所以 w/o Planner 行和 ReAct 行数字一模一样（TMDB 44.0 / 57.0 / +0.76，Spotify 54.5 / 49.1 / +0.31）。去掉 schema Parser，改成 LLM 直接读 JSON。

| 方法 | TMDB Succ / CP / \(\Delta\) | Spotify Succ / CP / \(\Delta\) |
|------|----------------------------|--------------------------------|
| Offline | 29.0 / 33.0 / +1.52 | 14.5 / 36.4 / +1.10 |
| DEPS | 38.0 / 43.0 / +1.20 | 19.3 / 43.8 / +1.74 |
| ReAct | 44.0 / 57.0 / +0.76 | 54.5 / 49.1 / +0.31 |
| Reflexion | 52.0 / 59.0 / +1.37 | 59.6 / 61.4 / +1.68 |
| **RestGPT** | **75.0 / 79.0 / +0.55** | **72.7 / 74.5 / +0.25** |
| w/o Planner | 44.0 / 57.0 / +0.76 | 54.5 / 49.1 / +0.31 |
| w/o Parser | 46.0 / 53.0 / +0.60 | 47.3 / 52.7 / +0.24 |
| RestGPT (ChatGPT) | 68.0 / 65.0 / +0.72 | 69.1 / 72.3 / +0.28 |
| Llama2-13B | 0.0 / 0.0 / - | 0.0 / 0.0 / - |
| Vicuna-13B | 9.0 / 15.0 / +1.21 | 12.7 / 20.6 / +1.52 |

Offline 的 TMDB Success **29.0** 不要改 ToolLLM 表上 ToolLLaMA+ReAct 的 **29.0**：一边是 RestBench 人评，一边是 ToolEval pass。Reflexion 行 52.0 不要改 [ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 的 BFCL **52.98**，也不要改 EASYTOOL 均 success **52.8**。ReAct 行 TMDB 44.0、Spotify 54.5，不要改 ReAct 专文 AlfWorld **71%**；那边 PaLM-540B、家务模拟，这边 davinci-003 加本篇 Executor。CP 57.0 不要改 ToolLLM 里 GPT-4-ReAct 的 57.2。Llama2-13B 两列全 0.0：作者写试过该尺寸全部官方 checkpoint，提示都跟不住、计划不合格；Vicuna-13B 从 Llama2 用用户分享对话微调过，能办一部分简单请求。0.0 不要和 ToolLLM 表上 Vicuna 的 0.0 收成一只，分母仍是两套题。ChatGPT 略差于 davinci，作者归因于对话训练让它更啰嗦，请求已经办完还继续规划。Figure 3 按模块拆错：多数错在 Planner（丢目标提前 End）和 Selector（选错或幻觉路径参数），Caller / Parser 相对少。花园不把图上色块百分比口算进 75.0。

Figure 4 两条标度。金标路径变长，所有方法 Success 都掉；长度为 4 时基线几乎走不完，RestGPT 仍「超过 40%」。40% 是正文定性，禁止当成 Table 4 新的一格。扩 API：先手挑 TMDB **10** 只接口、**15** 条都能被这 10 只解的指令，再往池子里加官方噪声接口。基线掉，RestGPT「几乎不受影响」。15 条不是主测试 100 条，不要用「几乎不受影响」去改 75.0。

局限按机制读。规划仍绑在 LLM 能力上，多轮之后会忘目标。Selector 会幻觉参数。ChatGPT 规划完了还说。响应 Parser 案例里会抽出专辑名而不是曲目名。附录失败案例写明这些。作者结论段把「通向 AGI」写进最后一句，花园只取 Table 4，不把那句当验收。

两场景都是作者挑过的常用接口，不是「任意 OAS 插上就能到 75.0」。Table 1 的 plug-and-play 和 100+ 是相关工作定位，实测仍是 54 和 40。换 Twitter / Gmail 那种官方文档更乱、鉴权更绕的服务，本篇没有表。人评 Success 没有公开一致性系数；同一条「办完没有」换一组人会漂。温度钉在 0，是为了可复现，不是把随机性从 \(I\) 里拿掉。基线全部挂上本篇 Executor 之后才进 Table 4：ReAct 专文里的维基三动作、Reflexion 专文里的 AlfWorld 启发式，都不是这张表的动作空间。读 44.0 / 52.0 时先问「Executor 是谁的」，再问骨干是谁。

附录把 OAS 字段收成路径、HTTP 方法、参数、响应 schema、错误码。Selector 几乎只碰路径加一句描述；Caller 才碰参数和鉴权槽；Parser 才碰 schema。同一份 Swagger 被拆三次，不是「把文档整页贴进 ChatGPT」。DEPS 原文是 Minecraft 里的描述–解释–计划–选择，最多 10 步是本篇复现时钉的帽；Chameleon / HuggingGPT 的离线内省被收成 Offline 行。这两条都不是 REST 原生方法，分数只说明「接上本篇 Executor 之后，一次写完计划和交错想–做都不够」。附录 Spotify 案例里还有调音量到 60%、跳到下一首：动作是 `PUT /me/player/volume` 和 `POST /me/player/next`，对播放器有副作用。花园把它读成评测环境会改真实账号状态，和 TMDB 只读查询不是同一类风险；主表没有把「只读 / 会写」拆开报。

## 4. 这不是 RSI，也不是 HuggingGPT 的 REST 版

\(S\) 取当前 \(\theta\)（davinci-003 或对照骨干）。单轮连 \(S'=I(S)\) 都不成立：推理结束权重还是原样。术语式 (2) 要的 \(I'\subseteq S'\) 更谈不上。四份提示、OAS 切片、温度 0、DEPS 的 10、Reflexion 的 2、金标路径、人评手续，下次请求默认还在。模型不能把自己的 Planner 从 davinci 换成 ChatGPT 来报 68.0，不能把 54 只扩成官方全量去追 Figure 4(c)，不能把人评 Success 改成固定字符串匹配来省那 2 名核验专家。混元台阶上这是 **L0**：任务内粗到细，跨请求 \(H\) 冻着。本题轨迹随请求清空，不是 playbook。

和邻居钉死。[HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 被本篇 Table 1 收成 24 项任务、离线规划。花园的 HuggingGPT 专文钉的是伪标签 Acc 52.62、人手顺序 18.18、Success 63.08；本篇 Offline 行 29.0 是「HuggingGPT / Chameleon 那种一次写完计划」接到本篇 Executor 之后的 RestBench 分，不是 52.62，两格不能减。[Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) 专文钉 ScienceQA 86.54、TabMWP 98.78，同样不要改 29.0。[ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md) 专文钉 RefCOCO 72.0、GQA 48.1；本篇 Table 1 的 ViperGPT **11** 是相关工作格子，不要改成他们的模块库存。[EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) 相关工作把本篇写成「文档直接塞进控制器」；后来他们在 RestBench 上改说明书，token 从 3881 收到 103。本篇主表没有文档压缩率。EASYTOOL 的 TMDB **55** 不要改本篇 **54**：一手过滤数以本篇 Table 2 为准，55 留在 EASYTOOL 专文。[Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) Table 1 写成 1645 加检索；那边 SFT 改 LLaMA-7B，榜是 AST，TorchHub 0-shot 59.13 不要改 75.0。[ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 调 RapidAPI 多步 REST，均 pass 66.7；本篇 75.0 是 100 条电影题上的人评，不是 ToolEval。[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 五只小工具加损失差，T-REx 53.5 不要改 Reflexion 行的 52.0。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 是本篇消融的底：去掉 Planner 就回到 ReAct+Executor。AlfWorld 71% 仍是那篇的主格。[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 在本表最多 2 trial，AlfWorld 130/134 不要改 52.0。[LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 造 Python；这边不造端点，只调已有 REST。[ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md) 把库当带状态外存；REST 调用默认无会话状态，Spotify 的 `GET /me` 是读当前用户，不是跨请求留下的账本。

人评 Success 没有公开 \(\kappa\)。金标路径是 6+2 名专家，题随日历变的那一类只能评路径和「办完没有」。可靠性专文要的墙外监督，这里缺一份不随时间漂的执行金标，也缺一份没参与出题的第三组人。davinci-003 和 ChatGPT API 都在墙外。Llama2 跟不住提示，说明这套 \(H\) 对指令跟随的要求本身就是评测的一部分，不是骨干「会不会调 REST」的纯能力。

![左列权重不涨，四份提示冻着；中 WALL；右列 OAS、54/40、davinci、温度 0、金标路径冻着](./images/fig-restgpt-frozen.png)

> 图 2：没有箭头更新 \(\theta\)。墙右边是下次任务默认还在、且不被会话改写的 \(I\)。

**图 2 解析**

- **Grows**：\(\theta\) 不动。本题计划只在本请求。
- **Four prompts \(H\)**：Planner / Selector / Caller / Parser。没有提示搜索。
- **WALL Frozen \(I\)**：改进器身份。
- **OAS / 54 / 40 / davinci-003 / temp 0 / gold paths**：换其中任一项等于人改 \(I\)。w/o Planner 掉回 44.0，是旋钮在墙外的活标本。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，四份提示调度冻着的 REST。75.0 是哪一格？davinci-003、TMDB 100 条、人评 Success。和 HuggingGPT 差在哪？那边 Hub 专家加伪标签规划 Acc；这边真 REST 加人评办完。还缺什么才敢叫 RSI？四份提示或 OAS 切片进入 \(S'\)，并且下一轮规划器就是升级后的那份。为什么 54 不能改成 55？因为 Table 2 过滤数是 54，EASYTOOL 子集是另一份接口表。为什么 ChatGPT 的 68.0 不能拿去改「CP 总是更高」？因为 TMDB 上它的 Success 高于 CP。

**读**：Table 4 的 75.0 / 79.0 / 72.7 / 74.5、ChatGPT 68.0 对 65.0、w/o Planner 等于 ReAct+Executor、w/o Parser 46.0、Llama2 0.0、Vicuna 9.0、Table 2 的 54 / 40 / 100 / 57、路径均长 2.3 / 2.6、\(\Delta\) 式 (3)、金标长 4 时超过 40%、10 只 API 加 15 条噪声题、694 行 JSON、不是 RSI、54≠55。  
**不读**：把 75.0 收进 79.7 / 52.62、把 29.0 收进 ToolLLaMA ReAct、把 52.0 收进 52.98 / 52.8、把 57.0 收进 57.2、把 100+ 填进 Table 2、把 24 改 HuggingGPT 专文、把 55 改本篇 54、把 AlfWorld 71% 改本表 ReAct 行、把 40% 口算进主表、把「通向 AGI」当验收。

同层工具：[54 HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、[56 Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md)、[57 ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md)、[53 EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[11 Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)。Model 侧：[12 ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md)、[11 Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md)、[13 Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Song, Y., Xiong, W., Zhu, D., Wu, W., Qian, H., Song, M., Huang, H., Li, C., Wang, K., Yao, R., Tian, Y., & Li, S. (2023). [RestGPT: Connecting Large Language Models with Real-World RESTful APIs](https://arxiv.org/abs/2306.06624). arXiv:2306.06624v2. Table 1–4、§3–§5 以 v2 为准。**未找到会议接收**。
2. 项目：[restgpt.github.io](https://restgpt.github.io)。代码：[Yifan-Song793/RestGPT](https://github.com/Yifan-Song793/RestGPT)。
