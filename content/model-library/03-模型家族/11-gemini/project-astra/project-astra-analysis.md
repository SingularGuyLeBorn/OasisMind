源材料是 deepmind.google 上 Project Astra 的产品介绍页 (17 页 PDF, 11 张图), 讲 Astra 的正文只有前 14 页的十几段短句, 后面是贡献者名单和全站导航. 页面没有模型名, 没有指标, 没有日期, 也没有结构和训练方面的描述.

# Project Astra: 产品页解读

来源: 同目录 `project-astra.md` (MinerU 抽取, 页标记 `page 1 of 17` 到 `page 17 of 17`) 与 `project-astra.pdf`. 逐段双语对照, 被切开的英文补回说明, 以及逐条疑问都在 `project-astra-bi.md`, 疑问紧跟在对应段落后面, 本文不逐条重复. md 和 PDF 对不上的地方以 PDF 文字层为准, 两个源文件都不改.

## 1. 材料性质: 一张产品介绍页

这份材料是 deepmind.google 上 Project Astra 的产品介绍页, 打印成 17 页 PDF. 页面标题是 「Exploring breakthrough capabilities for Google products — on the way to building a universal AI assistant」, 副标题只有项目名 「Project Astra」. 它不是技术报告, 也不是发布博客: 没有作者署名段落, 没有发布日期, 没有模型名, 没有评测表, 也没有任何结构或训练方面的描述. 全文出现的数字只有两个, 一个是第 12 页 Dorsey Parker 的 「8% vision」, 另一个是可以数出来的贡献者人数.

17 页的分工大致是: 第 1 到 2 页是开场, 讲 Astra 和 Gemini Live 的关系; 第 3 到 10 页是能力卡片; 第 10 到 12 页是盲人与低视力专题和 Dorsey 的故事; 第 12 到 13 页是设备与安全; 第 14 页是招募测试者的结尾段和名单开头; 第 15 页是贡献者名单和订阅框; 第 16 到 17 页是 deepmind.google 全站通用的页脚导航. 真正讲 Astra 的内容集中在前 14 页, 字数不多, 很多卡片只有一句话.

## 2. Astra 和 Gemini Live 是两样东西

页面前两页反复把 Astra 和 Gemini Live 放在一起说, 容易让人以为两者是同一个产品换了名字. 逐句看下来, 关系是单向的. 第 1 页: "We’re working to bring Project Astra’s capabilities to Gemini Live, new experiences in Search, as well as new form factors like glasses.「 Astra 是能力的来源, Gemini Live 是去向之一, 和搜索, 眼镜并列. 第 2 页: 」Some of the latest features in Gemini Live were first explored using Project Astra." 同样是 Astra 先探索, Gemini Live 后接收.

第 14 页给 Astra 下了唯一一处定义: 「Project Astra is a research prototype, being used and refined by a limited number of trusted testers.」 所以按页面的说法, Astra 是研究原型, 只有少量测试者在用; Gemini Live 是 Gemini 应用里面向大众的功能, 页面给了 「Try Gemini Live」 按钮直接去用. 页面没有说两者共用同一个模型, 也没有说 Astra 最终会并入或改名为 Gemini Live. 引用时把 Astra 说成 「Gemini Live 的内部代号」 或者把两者等同, 都超出了页面给出的信息.

## 3. 等待名单和已上线能力是两条线

页面上 「Join waitlist」 按钮出现了三次, 分别在第 1, 11, 14 页. 查 PDF 里的链接, 第 1 页和第 14 页指向同一个 Google 表单 (ID 以 `1FAIpQLScCrF` 开头), 第 11 页指向另一个表单 (ID 以 `1FAIpQLSdjJX` 开头). 前一个对应第 14 页的说法, 是给 Astra 研究原型招测试者; 后一个在盲人与低视力专题里, 对应 「Trusted Tester program for early access to the prototype — with live, professional, human oversight」. MinerU 把第 11 页那个按钮抽成了没有链接的纯文字, 只看 md 会以为全页只有一个名单.

已上线的说法全页只有一句, 在第 2 页: "Over the past year, we’ve been integrating capabilities like screen sharing and video understanding into Gemini Live for more people to experience.「 点名的只有屏幕共享和视频理解两项, 去向是 Gemini Live. 第 1 页的 」We’re working to bring ..." 是进行时, 讲的是正在做, 包括搜索里的新体验和眼镜这类新设备, 页面没说其中哪项已经可用. 第 3 到 10 页的能力卡片主语都是 Project Astra, 页面没有说它们已经进了 Gemini Live. 因此这页讲的东西可以分成三类: 已进 Gemini Live 的两项能力, 正在往产品里迁的能力, 只在原型里展示的能力. 等待名单只和后两类有关.

## 4. 能力卡片怎么分组

对照 PDF 版面, 第 3 到 13 页不是一串平铺的功能, 而是几节标题, 每节下面跟一组卡片. 节标题字号大, 带一句总述; 卡片是浅灰圆角框, 中央一个蓝色图标, 下面是小字的标题和一句说明. MinerU 抽取时把节标题, 卡片标题, 图标连字名混在一起, 有的连字名还被当成了二级标题. 按版面还原如下:

| 节标题 (PDF 页) | 卡片标题 | 卡片图标连字名 | images/ 里有没有这张图标 |
|---|---|---|---|
| Natural interaction (3) | Natural interaction | audio\_magic\_eraser | 有, p03 |
| 同上 (4) | Proactive responses | chat\_spark | 没有 |
| 同上 (5) | Context aware dialogue | sensor\_occupied | 有, p05 |
| Action intelligence (5) | Agent highlighting (6) | text\_select\_end | 没有 |
| 同上 | Tool use (7) | search | 有, p07 |
| Intelligent personalization (7) | Personalized reasoning (8) | personal\_recommendations | 没有 |
| 同上 | Content retrieval (9) | auto\_tab\_group | 有, p09 |
| 同上 | Multimodal memory (10) | memory | 没有 |
| Supporting the blind and low-vision community (10) | (无标题) (11) | route | 没有 |
| Assistance across devices (12) | Mobile (13) | pixel\_9 | 有, p13 |

表里有两处要留意. 第一节的节标题和第一张卡片标题都叫 「Natural interaction」, 描述不同, 节标题讲 「Improved audio input and output for smooth communication across languages」, 卡片讲 「Generates content significantly faster than even our fastest model so far」. 第二处是最后两节: 第 11 页和第 13 页的版面右边缘都露出下一张卡片的一条边, 说明网页上这两节是横向轮播, 打印成 PDF 时只留下了第一张. 第 12 页说 Astra 能在 「Android phones and prototype glasses」 上运行, 但 PDF 里只剩 Mobile 一张卡片, 眼镜那一侧有没有单独的卡片, 页面没有留下文字.

## 5. 每张卡片说了什么

第一节 「自然交互」 讲对话体验. 节总述是音频输入输出改进, 跨语言交流不被打断; 三张卡片分别是生成速度快于 「our fastest model so far」, 能主动开启对话并即时回应 (「without interrupting or time lag」), 能忽略背景交谈和无关说话声. 这一节的三个说法都没有数字, 也没有点名比较对象. 「fastest model so far」 没说是哪一个模型, 「time lag」 没说多少毫秒, 能忽略的 「distractions」 也没给测试条件.

第二节 「行动智能」 讲替用户做事. Agent 高亮是结合上下文理解物体, 用屏幕上的高亮标出重要的东西; 工具调用列了 「Search, Gmail, Calendar Maps, and interface control」. 「Calendar Maps」 中间缺逗号, PDF 原文就是这样. 第三节 「智能个性化」 讲记住用户: 学习并保留偏好, 能解释回答背后的思路, 用 「deep reasoning and memory」 做购物推荐, 检索用户分享过的 PDF 手册或菜谱, 整合不同类型的数据并记住以往交互的细节. 这一节把 「reasoning」 和 「memory」 各说了几次, 但都停在能力名称上, 没有解释推理怎么做, 记忆存在哪, 保留多久.

## 6. 页面没有给的信息

把页面当资料用之前, 先列清楚它缺什么. 没有模型: 全文没有一处写 Astra 跑在哪个 Gemini 型号上, 第 16 页导航里有 Gemini, Gemini Omni, Gemini Audio 等栏目, 但那是全站导航, 和 Astra 没有对应关系. 没有指标: 速度, 延迟, 识别准确率都没有数字, 唯一的比较句 「faster than even our fastest model so far」 也没有比较对象的名字. 没有时间: 页面没有发布日期或更新日期, 「Over the past year」 的起点无从确定.

安全部分同样只有原则. 第 13 页的 Safety 一段是 "We recognize the responsibility it entails to develop these new technologies, and aim to prioritize safety and security in all our efforts.「 后面的 」Learn more「 在 PDF 里链到 https://ai.google/principles/, 是 Google 的 AI 原则总页. 第 5 页 」taking actions on their behalf「 和第 7 页 」learns and retains user preferences" 分别涉及代为操作和保存个人偏好, 页面没有说操作前是否需要确认, 偏好能否查看或删除. 这些空白在 bi 文件对应段落下都有疑问, 这里只做汇总, 不补任何推测.

## 7. 盲人与低视力专题

第 10 到 12 页是页面里篇幅最完整的一段. 它先说 「We’re developing a version of Project Astra in collaboration with the blind and low-vision community」, 再说 「Project Astra’s Visual Interpreter research prototype is able to understand objects and unfamiliar spaces」, 接着一张卡片说它能在镜头移动时描述看到的东西. 两句挨着放, 读起来像是在给这个版本起名 Visual Interpreter, 但原文没有 「this version is called」 之类的句子, 能确定的只是: 有一个和该群体合作的版本, 也有一个叫 Visual Interpreter 的研究原型.

合作方是视觉口述服务 Aira, 「Aira users and interpreters helped us tailor the prototype for their community」. 随后是 Trusted Tester 计划, 强调 「live, professional, human oversight」. 监督者是谁页面没有点名, 读者容易接到上一句的 Aira 口述员身上, 但这只是推测. 第 12 页的 Dorsey Parker 是具体用例: 音乐人, 剩 8% 视力且在继续下降, 用手机上的 Project Astra 描述周围环境, 调用 Lens 和 Maps 去新地方. 这里的 Lens 不在第 7 页的工具清单里, 第 7 页用的是 「like」, 本来就不是完整清单.

## 8. 设备形态

第 1 页把 「new form factors like glasses」 放在 「We’re working to」 之后, 是正在做的事; 第 12 页说 「Project Astra works on Android phones and prototype glasses」, 眼镜前面加了 「prototype」. 两处合起来看, 眼镜在页面上的状态是原型, 手机是 Android. 第 12 页还提到 「Cross-device memory means you can switch devices and carry on the same conversation」, 这是全页唯一一处讲跨设备的句子, 没有说同步靠账号还是别的机制.

第 13 页的 Mobile 卡片给了两种用法: 用手机摄像头对准感兴趣的东西开始对话, 或者共享屏幕获得交互式协助. 这两种用法和第 2 页点名已进 Gemini Live 的 「screen sharing and video understanding」 正好对得上, 摄像头对话对应视频理解, 共享屏幕对应屏幕共享. 页面没有把这两处明确连起来, 这是按字面对照得出的观察, 不能说成 Mobile 卡片就是 Gemini Live 的功能说明.

## 9. 图片与文件名对照

images/ 里有 11 张图, 和 md 里的引用一一对应. 按内容分三类: 两张视频封面帧 (第 2, 12 页), 五张卡片图标 (第 3, 5, 7, 9, 13 页), 四张页脚社交图标 (第 15 页). 另有五张卡片图标 (第 4, 6, 8, 10, 11 页) 在 PDF 里存在, MinerU 没有存图. 文件名是 MinerU 从图片附近的文字取的, 取到页眉 「Google DeepMind」 或下一页的文字时就和画面对不上. 下面逐张列出.

![Image block](images/p02-natu-ral-interacti-https-deepmind-google-on-impr-oved.png)

第 2 页视频封面: 木质工作台上放着一台手机, 周围是扳手, 螺母和垫圈, 屏幕上写着 「Hi there! What can I help you with?」. 文件名取自第 3 页开头被切坏的节标题 「Natu[ral interacti]on Impr[oved audio]」, 连链接网址都拼了进去, 和画面对不上.

![Image block](images/p03-natural-interaction-generates-content-significantly.png)

第 3 页卡片图标: 声波加四角星, 连字名 audio\_magic\_eraser. 文件名取自卡片说明 「Natural interaction Generates content significantly...」, 对得上.

![Image block](images/p05-google-deepmind.png)

第 5 页卡片图标: 人形头像加四段圆弧, 连字名 sensor\_occupied, 属于 「Context aware dialogue」 卡片. 文件名是页眉文字 「Google DeepMind」, 对不上.

![Image block](images/p07-tool-use.png)

第 7 页卡片图标: 放大镜, 连字名 search. 文件名取自卡片标题 「Tool use」, 对得上.

![Image block](images/p09-content-retrieval.png)

第 9 页卡片图标: 两个错开叠放的圆角方框加四角星, 连字名 auto\_tab\_group. 文件名取自卡片标题 「Content retrieval」, 对得上.

![Image block](images/p12-dorsey-s-using-project-astra-to-adapt-to-this-change-in.png)

第 12 页视频封面: 演出场所 「GREY EAGLE」 门口, 两个人站在一辆浅蓝色面包车旁. 文件名取自图下方的说明 「Dorsey’s using Project Astra to adapt to this change in his life」, 图注对得上; 画面交代的是人物背景, 看不到手机, 也看不到 Astra 在做什么.

![Image block](images/p13-google-deepmind.png)

第 13 页卡片图标: 竖长圆角矩形, 顶部一条带胶囊和圆点的横带, 连字名 pixel\_9, 属于 「Mobile」 卡片. 文件名又是页眉文字, 对不上.

![Image block](images/p15-image.png)

![Image block](images/p15-image-2.png)

![Image block](images/p15-image-3.png)

![Image block](images/p15-sign-up-for-updates-on-our-latest-innovations-i-accept.png)

第 15 页页脚四个社交图标, 依次是 X, Instagram, YouTube, GitHub. 前三张文件名不带信息; 第四张的文件名取自下方订阅框的文字, 画面是 GitHub 标志, 对不上. PDF 版面上 「Follow us」 后面其实有五个图标, 链接依次是 X, Instagram, YouTube, LinkedIn, GitHub, MinerU 漏掉了 LinkedIn. 统计下来, 11 个文件名里对得上的 4 个 (p03, p07, p09, p12), 对不上的 4 个 (p02, p05, p13, 第四张社交图标), 不带信息的 3 个.

## 10. MinerU 抽取问题与处理

这份 md 的切词问题有统一的来源. PDF 每一页左上角都有 「Google DeepMind」 页眉标志, 链接区域在每页都是同一个矩形, 大约 x 91 到 199, y 34 到 70, 指向 https://deepmind.google/. 页面滚动打印时, 正文第一行常常正好落在这个矩形下面, MinerU 把矩形里的字母包成链接, 于是出现 「So[me of the la]test」, 「Natu[ral interacti]on」, 「Mee[t Dorsey]」 这样的写法, 有时还把标志上的 「Google DeepMind」 插进句子. 第 16 页的 「Model[s]」 和 「[Ge]mini」 情况类似, 只是后者的链接网址是 Gemini 栏目本身, 位置偏了两个字母. bi 文件里按 PDF 文字层把这些词补回, 并在每处写明原抽取结果.

最严重的一处在第 15 页. 页眉矩形压住了贡献者名单的第二行, MinerU 把其中 「Aveek Purohit, B」 整段丢掉, 名单少了 Aveek Purohit, 下一个人名也只剩 「akary Diarrassouba」. 用 PDF 全文逐名比对后, 补回这一处和另外两处切词, bi 里的名单和 PDF 一致, 共 359 个名字. PDF 原文自带的问题照录不改: 「Clement Farabet Dana Kurniawan」 中间缺逗号, 「Haoting Wang」 连出现两次, 第 7 页 「Calendar Maps」 缺逗号.

其余几类问题: 图标的字体连字名被当成文字或标题, 如 「## chat\_spark」, 「## route」, 「memory」, 还有按钮旁的 「keyboard\_arrow\_right」; 第 16 页 「spar」 是 「spark」 被截断; 第 10 页 「lowvision」 是行尾 「low-」 断行时丢了连字符; 第 11 页 「Join waitlist」 和第 13 页 「Learn more」 在 PDF 里有链接, md 里没有; 第 2 页导航标签 「Try Pr」 在 PDF 里也被截断, 无法补全. bi 文件对前几类都按 PDF 处理了, 「Try Pr」 保持原样.

## 11. 引用这页时的边界

这页能支撑的说法很有限, 而且都是产品宣传口径. 可以直接引用的有: Astra 是研究原型, 由少量受信任的测试者使用; Gemini Live 最新的一些功能最早在 Astra 上探索; 屏幕共享和视频理解已整合进 Gemini Live; Astra 能在 Android 手机和原型眼镜上运行, 有跨设备记忆; 盲人与低视力版本和 Aira 合作, 有独立的 Trusted Tester 名单. 这些都有页面原句对应, bi 文件里能找到出处.

不能从这页得出的有: Astra 用的是哪个模型, 它的延迟和速度具体是多少, 卡片里的能力哪些已经对大众开放, 眼镜何时推出, 安全上有哪些具体措施. 页面没有这些信息, 需要去找 Google 的发布博客, 技术报告或产品文档. 页面也没有日期, 引用时最好注明是按这份抓取件的内容, 而不是某个确定时间点的官方状态.
