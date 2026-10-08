# 候选筛选与已提交位置撤回

## 来源与实际查看

LLaDA v3 §2.4 提供低置信位置选择定义;此前已查看 PDF 第 24 页 Figure 4. [ReMDM v3](https://arxiv.org/html/2503.00307v3) Figure 1 左图用 She sell 到 She sells 展示已解码位置重新掩码与预测, 本次下载 PDF 并渲染、查看第 2 页, 页面保存在 `remdm-source-page2.png`. 图中没有复绘原 Figure 1 右侧 MAUVE 实验.

PDF: `tmp/remdm-2503.00307v3.pdf`. SHA256: `61a856c7a44f6e8a7035b7aee71697f84f37034078f23e46ece6c09185e96083`. 机制同时核对 §3 与 Algorithm 1:可见位置重新掩码概率和掩码位置的揭示概率共同组成新的反向核.

## 生成与验收

正式图: `content/DiffusionLanguageModels/2-数学与生成机制/2.3-生成因式分解与采样/images/fig-candidate-selection-and-withdrawal.png`.

内置生图调用, 实际传入已查看的 ReMDM 源页面与 NSA 风格参考. 接口无法确认具体模型版本, 不标为已核实 Image 2.5. 输出已查看, 首轮通过:四列候选概率正确, 两组提交位置各两个, 未提交候选保持掩码;主谓不一致示例中仅 sell 经掩码后可能成为 sells, 明确不保证纠正成功. 连线两端明确, 方框规整, 定义位于图内与图前正文. 保留共享旧图 `fig-remask-boundaries.png`, 只替换采样文章的引用, 纠错专题仍待整篇处理.

没有实验曲线或数据图. 0.92、0.55、0.88、0.31 是给定教学候选概率, 排序为位置 1、3、2、4;固定提交两位不使用 0.5 阈值, 避免旧图把 0.55 错误归为不提交.

## 提示词

```text
Use case scientific-educational. Chinese teaching figure white background landscape 1536x1024-style density navy/amber/teal precise rectangular grids. Reference1 ReMDM v3 source page2 Figure1 scientific basis: remask committed wrong word then predict; DO NOT copy experimental MAUVE plot. Reference2 NSA scientific style only token strips and math not structure. Title "候选筛选与已提交 token 撤回". Top half: "A. 候选还未写入状态：本轮提交 2 个位置". One shared four-column table positions1,2,3,4; current state [M] [M] [M] [M]; candidates a b c d; probabilities .92 .55 .88 .31. Candidate row amber, masks gray. Fork two clearly connected arrows from shared candidate table bottom to two four-cell destination strips left "随机选择的一次结果" [M] b [M] d, right "按置信度保留前两名" a [M] c [M]. Selected token navy, masks gray. Below right show "提交 {1,3}；未提交 {2,4}" and "排序：0.92 > 0.88 > 0.55 > 0.31". No threshold line, no bar chart, don't mark .5 threshold. Beside top legend "[M]：掩码；a–d：候选 token；c_i：候选概率" use c_i in candidate confidence row label. Top define committed vs candidate through table.
Lower half "B. token 已写入状态：能否再修改". Start shared sentence strip "She | sell | sea | shells", sell outlined red labelled "主谓不一致". Branch to left "单调吸收态采样" -> same sentence strip "She | sell | sea | shells" with label "已可见位置保持原值". Branch to right "允许重掩的采样器" -> "She | [M] | sea | shells" -> "She | sells | sea | shells". Last sells teal with label "一次可能的纠正轨迹". First arrow into right mask strip label "已提交 token → [M]", second arrow label "重新预测". No sigma formula, training label, benchmarks, GIDD or references in image. Bottom "候选不提交 ≠ 已提交位置撤回；重新预测仍可能出错". Every arrow touches exact source and destination strip/table border, straight intact no dangling/broken; boxes aligned no warping overlap. Actual source Figure and citation omitted from figure surface. Chinese labels only, English sentence retained as object example not translated. No English Chinese parenthetical duplication, no decorative icons. Preserve exact values, no simultaneous candidate-writing stage mistaken for committed state. Dense legible at article width.
```
