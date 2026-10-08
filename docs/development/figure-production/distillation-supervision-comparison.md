# 少步蒸馏路线首页监督对比图

本轮实际查看SDTT v2 Figure 3(a)、dParallel v1 Figure 3及其训练公式、d3LLM v1 Figure 2. 本地原图分别为sdtt-source-figure3-page.png、dparallel-source-page5.png、d3llm-source-figure2.png, 三者实际传入内置imagegen作为科学参考. 接口不能指定或确认Image 2.5版本. 当前输出为候选, 逐项检查后才进入正文.

来源: https://arxiv.org/html/2410.21035v2 ; https://arxiv.org/html/2509.26488v1 ; https://arxiv.org/html/2601.07568v1 .

图的三行分别展开跨步软目标、正确性门控熵和按教师顺序回放标准答案. d3LLM这一行只说明伪轨迹内容交叉熵, 不覆盖其互补掩码或附加熵项. 数字和字母仅为教学例子. 数据线与参数更新线分开, 教师目标不接收梯度.

## 独立分图落地

重新实际查看三张既有生图fig-sdtt-target-collector-v6.png、fig-dparallel-training-gate-v6.png、fig-d3llm-pseudo-training-v1.png. 它们分别展开软目标、正确性门控及顺序回放, 已有来源与提示词保存在各自制作记录. 路线首页按解释位置复用三图, 没有另造图片或覆盖资产. 图前补全符号定义, 特别区分SDTT状态z_t与dParallel logits z_i. 图注和两条解析逐图跟随, d3LLM明确仅展开内容交叉熵. 三种监督仍完整对比, 不用错误合成图替代.

本机Chrome以800px显示三图, 各图加载成功, 实际截图distillation-independent-desktop.png已查看. 主要标签、位置与箭头可读, 细节字体较小;此为固定正文宽度预览, 尚非最新全站导出的首页或手机页面验收. 三个失败合成候选继续保留, 不进入正文.

当前首页正文随后放入已构建阅读器的浏览器响应预览, 图片使用既有公开资源哈希URL;未修改公开API文件. 手机390px原先由CFD目标和端到端时延两条公式撑宽至539px, 将两式aligned分行后, 桌面1280px与手机390px页面宽度均等于视口, display公式溢出0、KaTeX错误0. 初次未滚动时后两图为懒加载, 随后逐图滚动并等待decode, 三图均加载成功且宽362px. 保存distillation-home-mobile.png和distillation-home-mobile-1/2/3.png, 已实际查看第一张及后两图截图. 图面完整无裁切, 手机细公式需放大, 不能宣称无需缩放可读全部细节. 此为当前正文阅读器预览, 全站重新导出仍待进行.

## v1候选复核

保存distillation-supervision-candidate-v1.png,1536×1024,实际查看完整图面. 未通过科学验收, 不嵌入正文. SDTT第二项KL误用q̃2而非q̃4, 保存概率线还需直接来自预测而非token状态. dParallel将交叉熵与熵绘成串行, 目标到两分支的依赖缺失, 更新线在损失端出现反向箭头. d3LLM的标准答案标签被画成学生输出, 标准答案与可见性到训练输入的连接不全. 部分符号定义缺失. 下一版拆开损失并行分支, 明确标签和预测分别进入损失, 梯度从损失回学生. 当前只有生成候选的进展, 不代表路线首页配图完成.

## v1生成提示词

```text
Use case scientific-educational. Create Chinese dense but readable technical comparison illustration landscape, three HORIZONTAL rows, white background navy/teal/amber scientific precise rectangles no cartoon. Title 三种蒸馏, 三种监督. Reference images 1 SDTT Figure3, 2 dParallel Figure3, 3 d3LLM Figure2 scientific context only. Build new teaching examples not experimental curves. Large Chinese text readable at800px. Each row must have actual token strips, selected positions and loss dependencies, not generic method-name cards. All arrows complete definite endpoints no overlap. No source captions, redundant bilingual text, unintroduced acronyms. Define M=MASK, θ=学生参数, all example numbers pedagogical. Row1 SDTT title 跨步收集软目标. Initial indexed positions1..4 strip A M C M splits to frozen教师 and 学生θ. Teacher two steps: A M C M -> A B C M -> A B C D. Teacher first step distribution q2保存, second step q4保存. Collected target box q̃2=q2第一步,q̃4=q4第二步. Student on original A M C M gives s2,s4. Both targets and student predictions feed loss KL(s2||q̃2)+KL(s4||q̃4). Dashed gradient only to student, teacher frozen. Do not imply sampled B,D hard supervision. Row2 dParallel title 正确位置再压熵. Define target ABCDEFGHIJKL, threeblocks4. Show noisyinput ABCD | M F M H | M M M M labelled 前块/活动块/未来块. Input -> 学生θ -> outputs position5预测E and7预测J. Target labels 5:E,7:G explicitly feed CE at5,7 and correctness comparison. Correct set={5}, only5 contributes entropy H(p5), position7 excluded entropy but included CE. Two losses merge CE+βH then dashed to student. Clearly future no loss, allinputparticipatesforward. Row3 d3LLM title 顺序构造输入, 答案监督内容. Teacher order2→4→1→6→3→5 feeds visibilitymask 隐藏 可见 隐藏 可见 隐藏 隐藏; standardanswer A B C D E F feeds values; both converge traininginput M B M D M M -> 学生θ -> p1,p3,p5,p6 -> CE with labels A C E F supplied directly from standardanswer. Dashed gradient only student. Teacherorder is not predicted permutation label. Footer 教学示例 · 实线:数据与目标 · 虚线:参数更新. Avoid unnecessary probabilisticbars if no dimensions defined. Spacious rows logically connected within row not cross-row. Preserve exact token values and index correctness.
```

## v2局部修订提示词

v2已保存并实际查看. KL下标与并行分支改善, 但标签来源仍错误:目标位置E,G来自学生, d3LLM标准答案连接顺序且标签未送入损失. 三条更新线在损失端仍有反向箭头. 当前不进入正文.

```text
Edit the supplied scientific figure, retaining title, white/navy/teal/amber style and three-row composition, but repair scientific dependencies. It is acceptable to increase vertical space for complete connectors. Row1: fix loss EXACT KL(s₂||q̃₂)+KL(s₄||q̃₄). Put initial A M C M BEFORE teacher and student, neither network outputs its input. Teacher two forward nodes first predicts distributions q₂^(1),q₄^(1) then samples B and state A B C M, second predicts q₄^(2) then samples D -> A B C D. q₂^(1) and q₄^(2) feed savedtargetbox explicitly; tokens states are not probabilities. Student directly emits s₂,s₄ from originalinput, no originalinput after student. Row2: replace serial CE→entropy chain with PARALLEL branches from student probability predictions p₅,p₇. Targets E,G taken by explicit solid line from CLEANtargetstrip: targetE,G feeds CE on5,7 and correctnesscomparison. Predictions argmaxE,J plus targets give correctset{5}; gate selects p₅ for entropy H(softmax(logits₅/T)), T defined 熵项温度, no invented numeric value. CE and entropy each feed total L=CE+βH, β defined 熵项权重. Neither CE outputs entropy. Row3: cleananswer ABCDEF has TWO explicit branches: values into noisyinputconstruction, selected A,C,E,F into loss. Teacherorder feeds visiblemask, mask plus answervalues feed input M B M D M M. Student outputs ONLY p₁,p₃,p₅,p₆ into CE; remove arrow student→answerlabels. For ALL rows loss dashed update arrow starts at loss border and arrowhead ONLY at student border, not at loss. Data solid navy; gradients orange dashed. No disconnected endpoints. All symbols in footer define M掩码,θ学生参数,p或s学生类别分布,q教师类别分布,KL散度,CE交叉熵,H熵. Can remove redundant row subtitles to free space. No experimentalclaims. No sourceproductiontext. No loss symbolindextypos. Arrowlines touch actual objects and never overlap words. This is three-method pedagogical comparison; d3 row only CE component, no full d3 objective claim.
```

## v3局部修订提示词

v3保存为distillation-supervision-candidate-v3.png并实际查看. 更新线已只有学生端箭头, 目标E,G已来自标准答案. 仍未通过:SDTT概率框到目标的上方连线没有正确接源, dParallel缺少学生logits到熵的独立输入, d3LLM答案仍接教师顺序且标签接学生而非损失. 不嵌入正文. 多机制同图的局部编辑持续破坏其他端点, 后续改用独立分图降低连接密度, 保留三种监督对比职责及全部候选, 不删现有有用图.

```text
Edit target image preserving three-row scientific comparison, white navy teal orange. Correct labels and input connections only; preserve valid causal matrix and prediction-before-processing order. Row1 change strip heading 输入序列 to 输出状态示意. Gray slots display a dash — instead of M, both upper strip and duplicate labels; note 未生成槽位不作为网络输入. Actual cached decoding network receives only C, with separate historical A/B KV input, not repeated ABC input tokens. Keep next-token distribution from B output, sample C, forward C, compute C KV, append cache. Row2 M is actual mask token input; replace erroneous output placeholder sentence with M为实际输入的掩码token. Simplify to ONE ABMM strip feeding forward①, forward①→提交C→ONE ABCM strip feeding forward②; each strip directly connected to matching forward box, eliminate duplicate unconnected strips. Row3 replace 完整块重新前向（更新历史表示） with 当前完整块前向（历史KV不变）; show ONLY C D tokens inside this operation, never A B C D inputs. Historical KV(A,B) box has TWO genuine arrows: one to 当前块去噪 and one routed along bottom to 当前完整块前向. CURRENT MM strip separately has an arrow into 当前块去噪; remove plus sign. 去噪→提交CD→当前完整块前向→追加CD的KV→下一块去噪. Final cache box should explicitly show K_A K_B K_C K_D and V_A V_B V_C V_D; next block reads full resulting history. Rectangles regular, complete endpoint arrows no overlap, no dangling lines. Make current/historical paths distinguishable with labels 读取历史缓存 and 计算当前块. Keep Chinese labels, M定义掩码 only for diffusion rows, no redundant bilingual. Final teaching figure with clear variable lifecycle.
```
