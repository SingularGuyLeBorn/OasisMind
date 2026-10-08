# d3LLM 多块状态与 KV 生命周期候选 v1

来源: https://arxiv.org/html/2601.07568v1 , Figure 3 与 §3.2. 原图已实际查看, 使用本地 d3llm-source-figure3.png 作为机制参考.

使用内置生图工具, 无法指定或确认 Image 2.5. 输出 d3llm-multiblock-kv-v1.png, 当前仅保存候选, 尚未引用到正文.

已回读:五状态顺序、前一块10%与95%条件、本块全部揭开后稳定1–2轮、token保留与KV表示重算分离. 四格为示意, 不能从四格直接复算实际激活阈值. K1,V1表示块1缓存, K2,V2表示块2稳定后缓存.

待修:下半图上方是同轮快照, 下方却包含后续轮读取, 需加强时间边界. 本块未来缓存使用虚线框和虚线写入, 但到后续读取的连接仍为实线, 应明确这是写入后的读取. 完整前向框仅画块1、2输入, 尚未展示完整模型画布或说明这是历史KV重算的局部依赖示意. 未进行正文宽度和移动端预览, 不据此认定正式验收.

## 完整生成提示词

```text
Use case scientific-educational. Chinese technical article teaching figure, landscape white background, crisp navy labels, teal visible token cells, amber MASK cells, thin straight rectangular outlines. NO cartoon, icons, English/Chinese translations, gradients, shadows, excessive text. Input reference is d3LLM original Figure3 scientific relationships, not a style target. Title 'd3LLM: 多块推进与 KV 生命周期'. Two panels. Top panel '一块的五种状态': left-to-right five compact columns joined by complete state-transition arrows, labels: '未激活', '激活', '全激活', '完成但稳定中', '完成'. Under each show one four-cell strip: M M M M; A M M M; A B M M; A B C D; A B C D. Arrows labels respectively '前一块完成10%', '前一块完成95%', '本块全部揭开', '稳定1–2轮'. Under Activated text '仅揭开低熵位置'; under FullyActivated '每轮至少揭开1格'; under Stabilizing '不读 KV, 重算并刷新'; under Completed '写入本块 KV'. Note exactly '四格仅示意状态, 10%与95%用于实际块长'. Bottom panel '同一轮中的四块与缓存数据流': four side by side aligned strips B1: A B C D completed, B2:E F G H stabilizing, B3:I M J M fullyactivated, B4:M K M M activated. Label cells distinct from block IDs: block headers '块1 已完成', '块2 稳定中', '块3 全激活', '块4 激活'. Below block1 a memory rectangle '历史缓存 K1,V1'. Below block2 a compute rectangle '完整前向重算' fed by block1 AND block2 token strips; compute emits two separate arrows: '覆盖历史 KV' back into historical cache K1,V1, and '稳定后写入' into a different memory rectangle '本块缓存 K2,V2'. Both memories feed a shared bar '后续轮读取历史 KV'; that bar feeds a node '块3、块4 的注意力计算'. The corresponding block3/4 token strips also feed this attention node directly as '当前状态'. Distinguish ordering: '稳定后写入' is future action not same-round existingK2; show it dashed and define '虚线:稳定后动作;实线:数据读写'. A small caption within panel '周期刷新:重新前向并覆盖历史 KV' no extra circular arrows necessary. Explain 'K、V:注意力中的键与值;M:MASK'. Explicit footer 'token 已揭开后保留; KV 刷新只更新表示'. All edges have source/target, orthogonal routing without crossings or dangling arrows. Never show blocks1/2 resampling tokens. Never imply KV memorystate contains tokencontent. No speed results or experimental numbers. Scientific, legible at article width, concise text, all module shapes regular nonoverlapping.
```
