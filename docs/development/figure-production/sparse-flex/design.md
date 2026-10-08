# FlexAttention 块分类教学图

机制来源: [PyTorch 官方 FlexAttention 介绍](https://pytorch.org/blog/flexattention/), Mask Mods、Sliding Window + Causal 与 BlockMask 部分. 本图为独立教学算例, 不是论文 Figure 重绘或性能实验. 官方材料本轮已打开阅读;尚未生成或验收图片.

## 已复算的数据

长度 8, 位置从 0 到 7, 因果窗口 W=4, query/KV 块均为 2×2. 元素允许条件为 j≤i 且 i−j<4. verify.cjs 保存逐元素矩阵与块表, 并枚举 21,120 个不同长度、query 块宽和窗口配置核对允许区间的并集与交集.

块表逐行如下, P 表示 partial, F 表示 full, 空表示跳过:

| query 块 | KV 0–1 | KV 2–3 | KV 4–5 | KV 6–7 |
| --- | --- | --- | --- | --- |
| 0–1 | P | 空 | 空 | 空 |
| 2–3 | F | P | 空 | 空 |
| 4–5 | P | F | P | 空 |
| 6–7 | 空 | P | F | P |

总共 26 条合法边;执行 9 个块, 覆盖 36 个元素, 跳过 7 个块. 10 个被执行但非法的元素必须在 partial 块中被过滤. full 块省掉逐元素 mask 判断, 仍要计算注意力分数及归一化. 这些计数描述教学逻辑块, 不代表真实 GPU FLOPs 或速度.

## 图面计划

左侧画带 2×2 边界的 8×8 元素矩阵, 标清 query 行和 key 列的位置. 中间画上述 4×4 三态块表, 让颜色与左侧对应. 右侧放大 query 4–5 / key 0–1 的 partial 块: 四个位置只有 (4,1) 合法, 其余三格过滤. 再展示 query 4–5 / key 2–3 的 full 块, 四格全部合法. 用矩阵和局部放大表达分类, 不添加复杂无用箭头.

图外解析必须说明: 先产生元素规则, 构建工作表, kernel 跳过空块, partial 内精确过滤, 合法 logits 才进入 softmax. 参数与位置标签在图内完整给出. 待实际生图后逐格对照 verify.cjs 的矩阵和块表, 再决定是否进入正文.

本检查只证明区间与教学块表, 未运行 PyTorch GPU 前向、反向或性能测试.

## 候选验收

candidate-v1.png 由内置 ImageGen 实际生成, 接口不能确认模型版本. 已人工逐格核对 8×8 矩阵、4×4 块表、两处放大、轴标、三态图例及计数, 与 verify.cjs 一致. 无箭头, 无悬空连接或相互遮挡. 保留候选与提示词, 正文采用 images/flex-block-classification-v1.png 并附图注、原尺寸入口及算例解析. 实际站点桌面与手机页面尚待验收.
