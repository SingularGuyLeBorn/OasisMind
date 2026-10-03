> 本目录的源材料是 Google for Developers 博客 2025 年 7 月 22 日的文章 「Gemini 2.5 Flash-Lite is now stable and generally available」 的抓取 `gemini-2-5-flash-lite.md` (4 页, 5 图), 是一篇正式开放公告, 不是技术报告. 全文没有模型结构, 参数量, 训练数据, 训练方法, 也没有任何基准分数; 能核对的只有第 2 页一张三列对比表, 正文里的几个价格, 比例和日期.

# Gemini 2.5 Flash-Lite 稳定版: 公告解读

来源: 同目录 `gemini-2-5-flash-lite.md` (页标记 `page 1 of 4` 到 `page 4 of 4`) 与 `gemini-2-5-flash-lite.pdf`. 逐段双语对照和逐条疑问在 `gemini-2-5-flash-lite-bi.md`, 疑问紧跟在对应段落之后, 本文不重复原句. md 与 PDF 对不上的地方以 PDF 为准, 源文件本身不改.

## 1. 材料性质: 一篇正式开放公告

文章发在 Google 的开发者博客 (developers.googleblog.com) 上, 分类是 Gemini, 标签包括 AI, Announcements, Explore 和 Gemini 2.5 Flash-Lite. 署名两人: Logan Kilpatrick, 职务 Group Product Manager; Zach Gleicher, 职务 Product, 单位 Google DeepMind. 两位都是产品岗, 文章的写法也是产品公告: 一段总述, 一张对比表, 四条卖点, 四个客户案例, 最后告诉开发者怎么切换模型名.

正文很短, 真正的内容集中在第 1 页末尾到第 3 页中部. 第 3 页后半是分类标签, 翻页按钮和相关文章, 第 4 页整页是站点页脚. 读这篇材料时, 能用的信息大约只有七八百个英文词, 其中一半是客户案例. 所以本文的重点放在价格, 对比表和版本关系上, 这三处是页面给出硬数字的地方.

## 2. 页面给出的发布事实

先把散在正文里的事实收拢. 模型名是 Gemini 2.5 Flash-Lite, 这次发布的是稳定版, 状态是 generally available. 定位写了两遍: 第 1 页说它是 2.5 家族里 「fastest and lowest cost」 的模型, 第 2 页小标题又说它是 「most cost-efficient and fastest 2.5 model yet」. 它和 2.5 Pro, 2.5 Flash 一起, 构成 「ready for scaled production use」 的 2.5 系列. 公告的意思很直接: 2.5 家族三个档位此时都已正式开放, Flash-Lite 是最后补上的那一档.

功能清单在第 2 页 「Fully featured」 一条: 100 万 token 的上下文窗口, 可控的思考预算, 以及三种原生工具, 分别是 Grounding with Google Search, Code Execution 和 URL Context. 开放渠道有两处说法. 正文最后一句只点了 Google AI Studio 和 Vertex AI; 对比表的 Availability 一行写得更全, 是 Google AI Studio, Vertex AI, Gemini API 三处. 调用方式是在代码里写 「gemini-2.5-flash-lite」, 预览版别名计划在 8 月 25 日移除, 距发布日约一个月.

## 3. 稳定版和预览版: 同一个模型, 价格说了多少

版本关系只有一句话: 预览版用户可以切到 「gemini-2.5-flash-lite」, 因为它是 「the same underlying model」. 这句话把两个名字指向了同一个模型, 也说明这次 「stable」 的含义主要在服务状态上: 名字固定下来, 预览别名定期下线, 模型本身不变. 页面没有说预览版是哪天发布的, 也没有说预览期内模型有没有更新过快照.

价格和预览版的关系, 页面只给了一条: 「We have also reduced audio input pricing by 40% from the preview launch.」 这句话只点了音频输入. 对比表里 Flash-Lite 的音频输入价是 \$0.30, 若这是降后的价, 按 40% 倒推预览发布时是 \$0.50; 这个数是算出来的, 页面没印. 文本 (含图像, 视频) 输入价 \$0.10 和输出价 \$0.40 跟预览版比变没变, 全文没有一句话表态, 既没说 「保持不变」, 也没给预览期的数字.

所以 「稳定版和预览版是不是同一个价」 这个问题, 就这篇材料而言只能拆成两半回答. 音频输入不同价, 稳定版比预览发布时低 40%. 文本输入和输出, 页面没说. 还有一个时间窗口也没交代: 8 月 25 日之前, 预览别名和稳定版名字同时可用, 两个名字指向同一个模型, 此时调用预览别名按哪个音频价收费, 公告没写.

## 4. 对比表: 被裁掉的表头

第 2 页的对比表是全文唯一成体系的证据. md 里那张图是页面截图, 顶端被网站的导航栏盖住, 看不到表头, 只能从价格反推三列分别是谁. PDF 里内嵌的是一张 1080x1080 的完整原图, 表头清楚: 第一列 「2.5 Flash-Lite」, 下面小字 「THINKING OFF」; 第二列 「2.5 Flash」, 小字 「THINKING」; 第三列 「2.5 Pro」, 小字 「THINKING」. 这行小字决定了表里好几行该怎么读, md 版恰好把它丢了.

表一共六行. Best for 是文字定位: Flash-Lite 对应 「High volume cost-efficient tasks」, Flash 对应 「Fast performance on everyday tasks」, Pro 对应 「Coding and highly complex tasks」. Thinking controls 三列都打勾. Speed 用火箭图标, 三列依次亮 3, 2, 1 个; Performance 用星形图标, 依次亮 1, 2, 3 颗. Cost 分输入和输出两行, 单位都是每 100 万 token 的美元价, 输入价下注 「no caching」. Availability 三列都是 Generally available, Flash 和 Pro 比 Flash-Lite 多一个 Gemini app 渠道.

Speed 和 Performance 两行是图标, 没有数字, 也没有说明火箭和星是按什么测出来的. 这两行把三款模型排成一条直线: 速度越快, 性能越低, 三个档位正好错开. 这是一张定位示意图, 读的时候只能读出顺序, 读不出差距大小; 而且因为表头的小字, Flash-Lite 一列的顺序是在关思考的前提下排出来的.

## 5. 与 2.5 Flash 能对齐的行

拿 Flash-Lite 和 2.5 Flash 比, 表里六行的可比程度并不一样. 价格一行最干净: 输入 \$0.10 对 \$0.30, 3 倍; 音频输入 \$0.30 对 \$1.00, 约 3.3 倍; 输出 \$0.40 对 \$2.50, 6.25 倍. 两列都没有按提示长度分档, 只有 2.5 Pro 列有 「> 200k tokens」 的第二档 (输入 \$2.50, 输出 \$15.00). 所以 Flash-Lite 对 Flash 的三组倍数在任何提示长度下都成立, 前提是无缓存, 因为输入价那一行注着 「no caching」, 缓存价三列都没印.

Thinking controls 和 Availability 也能直接对齐: 两者都支持思考控制, 都已正式开放, 都在 AI Studio, Vertex AI, Gemini API 上, 差别只在 Flash 多了 Gemini app. Best for 一行是文字定位, 能看出分工 (高并发, 讲成本 对 日常任务要快), 但谈不上比较. 真正不能直接对齐的是 Speed 和 Performance: Flash-Lite 那一列是 THINKING OFF, Flash 那一列是 THINKING, 两边开关状态不同. 表里没有 「Flash-Lite 开思考」 或 「Flash 关思考」 的格子, 所以 「3 个火箭对 2 个, 1 颗星对 2 颗」 比的是两种不同配置.

正文的比较对象又是另一组. 「Best in-class speed」 一条比的是 2.0 Flash-Lite 和 2.0 Flash, 说在 「a broad sample of prompts」 上延迟更低; 「Smart and small」 一条比的是 2.0 Flash-Lite, 说在编程, 数学, 科学, 推理, 多模态几类基准上质量全面更高. 两条都没提 2.5 Flash, 都没给数字, 没给基准名. 也就是说, 正文拿上一代做比较, 表格拿同代做比较, 两边的比较对象没有重合.

## 6. 思考开关与计价

「思考」 在文中出现了三种说法. 第 1 页说原生推理能力 「can be optionally toggled on for more demanding use cases」, 读法是默认关, 需要时打开; 第 2 页功能清单说 「controllable thinking budgets」, 意思是不止开关, 还能控制预算; 表里是 Thinking controls 一格打勾, 表头又写着 THINKING OFF. 三处放在一起能读出一致的图景: Flash-Lite 以关思考为默认形态出场, 开发者可以打开并设定预算, 用更多 TestingTime 算力换更好的结果. 页面没有说预算的单位, 上限, 也没说默认值是不是零.

计价这一侧, 页面没有和思考开关挂钩的任何说明. Output price 一行每列只有一个数, Flash-Lite 的 \$0.40 印在 THINKING OFF 这一列下; 打开思考后, 模型多写出来的思考内容是否计入输出, 按不按 \$0.40 计, 公告没说. Flash 和 Pro 两列标 THINKING, 也只印了一个输出价. 所以 「开思考之后 Flash-Lite 和 Flash 的价差还是 6.25 倍吗」 这个问题, 单看这篇材料答不了; 能确定的只是在关思考的 Flash-Lite 和开思考的 Flash 之间, 每百万输出 token 的标价差 6.25 倍. 实际账单还取决于开思考后多出来的输出量, 这个量页面也没给.

## 7. 客户案例: 数字的主语

第 3 页列了四家客户, 只有第一家给了量化结果. Satlyt 做去中心化的太空计算平台, 场景是在轨遥测的实时摘要, 自主任务管理和卫星间通信解析; 公告说 2.5 Flash-Lite 的速度让关键星上诊断的延迟降低 45%, 功耗降低 30%, 对比对象是 「their baseline models」. 基线模型是谁, 是 Google 自家的旧型号还是别家的模型, 在什么硬件上测, 页面都没写. 45% 和 30% 的主语是 Satlyt 的系统, 不是一个可复现的基准.

另外三家只有定性描述. HeyGen 用它做视频策划, 内容分析优化, 以及把视频翻译成 180 多种语言; 「180」 是语言数, 说的是 HeyGen 产品的覆盖面, 页面没有说这些语言全部由 Flash-Lite 处理. DocsHound 用它以低延迟处理长视频, 提取数千张截图, 把产品演示转成文档和 AI agent 的训练数据. Evertune 用它扫描和综合大量模型输出, 给品牌做 AI 模型中的形象分析. 四个案例都落在 「量大, 要快, 单次任务不算难」 这一类, 和对比表 Best for 一行的 「High volume cost-efficient tasks」 对得上, 也和第 2 页 「translation and classification」 的举例一致.

## 8. 图片与抓取痕迹

md 里落了 5 张图. 属于正文的只有两张: 第 1 页的作者署名加题图截图, 第 2 页的三列对比表. 其余 3 张是页面元素: 一张是页尾 「PREVIOUS」 旁的圆形 「<」 按钮, 两张是相关文章卡片的配图, 内容是 OLMo 3 7B 在 TPU v7x 上用 MaxText 预训练, 以及一篇被截断的 「Turn your REST APIs into M...」 文章, 都和 Flash-Lite 无关. 相关文章的日期是 2026 年 9 月 24 日, 属于抓取时的站点状态.

抓取有两处明显缺损, 都是网站的浮动导航栏造成的. 第一处是第 2 页对比表的表头, 前文已经讲过, md 版因此看不到 THINKING OFF 这行字. 第二处在第 3 页开头: md 从半句 「satellite communication parsing」 开始, 前面的引导句 「Since the launch of 2.5 Flash-Lite, we have already seen some incredibly successful deployments」 和 Satlyt 的名字都被盖住了, PDF 的文字层里还在. 那张 「<」 按钮图的文件名 「our-favorites-https-developers-google-com」 就来自被盖住的引导句末尾, 转换工具按附近文字给图命名, 名字和画面对不上. bi 文件已按 PDF 补回这两处, 并把按钮图放回翻页按钮的位置.

## 9. 材料边界

这篇公告能稳定回答的有: 2.5 Flash-Lite 稳定版在 2025 年 7 月 22 日正式开放; 价格是输入每百万 token \$0.10, 音频输入 \$0.30, 输出 \$0.40, 均为无缓存价; 音频输入比预览发布时降 40%; 稳定版与预览版是同一个底层模型, 预览别名 8 月 25 日下线; 100 万 token 上下文, 可控思考预算, 三种原生工具; 对比表里 Flash-Lite 标 THINKING OFF, 与 2.5 Flash, 2.5 Pro 的价格倍数和图标排序; 四个客户案例及 Satlyt 的 45% 和 30%. 这些都能指回正文原句或表格.

回答不了的同样明确: 文本输入价和输出价与预览版是否相同; 开思考后的计价方式和思考预算的单位; Speed 和 Performance 两行图标的测法, 以及 Flash-Lite 开思考后在这两行的位置; 正文 「lower latency」 与 「higher quality」 两条的数字和基准名; Satlyt 的基线模型; 模型的结构, 参数量和训练方法. 页面都没有写, 本文也不补. 逐条疑问写在 `gemini-2-5-flash-lite-bi.md` 对应段落之后, 共 10 处, 全部围绕两件事: 稳定版和预览版是不是同一个价, 以及和 2.5 Flash 能拿哪一行比. 材料只撑得起这么多, 就停在这里.
