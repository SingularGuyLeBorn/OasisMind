# React Flow 与自适应布局

## 三层结构

组件分三层，禁止把语义、坐标和 JSX 混在同一个巨大 `buildGraph` 中：

1. **语义图**：节点 id、角色、公式、维度、父子关系和边端口。
2. **测量与布局**：根据 DOM 实际尺寸和层级关系计算坐标、通道和整体边界。
3. **渲染**：数据框、运算节点、分组容器和边只消费布局结果。

内容变化后必须重新测量和布局，不能靠增大一个固定高度数字“顶开”。

## 内部小框端口

可连接的小框拥有稳定端口 id，例如：

```tsx
<TensorSlice
  id="q-1"
  tex="Q_1"
  sourcePort="q-1-out"
/>
```

端口可以位于自定义 React Flow 节点的后代元素。边通过 `sourceHandle`、`targetHandle` 指向具体小框；外层分组容器不提供替代性总端口。

内部布局变化后调用 React Flow 的节点内部更新能力，让 handle 坐标与 DOM 保持一致。

## 自适应尺寸

- 节点宽高以内容实测值为准；可以设置设计上的最小值，不能设置为了容纳当前文本而猜出的固定高度。
- 使用 CSS Grid/Flex 的 `minmax(0,1fr)`、`min-width:0` 和合理换行，但不能用 `overflow:hidden` 掩盖裁切。
- 布局完成后从全部节点实际边界计算 graph bounds，再加统一画布 padding。
- 宿主高度由 graph bounds 推导。若 Markdown/iframe 仍要求固定 `aspect`，应从 registry 尺寸自动读取或增加尺寸上报；禁止在文章、registry、组件三个位置手工同步高度。
- `fitView` 只负责缩放，不能用来掩盖错误节点尺寸。

推荐流程：初始渲染 → 测量节点 → 分层布局 → 更新节点和 graph bounds → 宿主同步高度。测量完成前使用稳定占位，避免画布跳动。

## 边路由

- 默认使用分层正交路由，同层对应端口尽量垂直对齐。
- 一条边只由一个边组件绘制，不用多个短 `div` 拼折线。
- 箭头属于终点，线段连续到箭头基部；不能出现孤立小线头。
- 给主路、残差、路由和共享旁路预留不同通道。跨多个分组的线沿容器外侧走，不穿过公式和节点。
- 边标签贴近对应线段，但不覆盖节点，也不能看起来像新节点。
- 线密度太高时，优先使用合法输入代理或分层总线；不能把不同语义的多条边合成一条无法追踪的线。

## 运算节点

至少区分：

- `BinaryOperator`：多个输入、一个输出，用于 `+`、`\times`、`\odot`。
- `NamedOperator`：Softmax、Top-K、RMSNorm、Concat 等命名操作。
- `TensorBox`、`VectorBox`、`ScalarCell`：只表示数据，不承担运算语义。
- `GroupFrame`：只分组，不代替内部节点接线。

乘号可以位于两条输入线的交点，或使用小型无底色运算节点；不能使用与张量框同尺寸、同视觉权重的矩形。

## 自动验收

在最复杂模式和至少一个窄屏宽度运行浏览器检查：

1. 比较每个节点的 `scrollWidth/clientWidth`、`scrollHeight/clientHeight`；任何正溢出都失败。
2. 检查所有边都有存在的 source、target、sourceHandle、targetHandle；控制台出现 handle error 即失败。
3. `.katex-error` 数量必须为 0。
4. 截取最复杂区域，人工确认内部最后一个小框没有被父容器裁切；只检查外层 scroll 尺寸不够。
5. 核对边数量与语义图。例如展示 3 个 head，就应有 9 条 `Q/K/V` 输入边，不能只有 3 条外层总线。
6. 改变一个标签长度、专家数或 head 展示数，画布高度应自动变化，不需要修改 registry 或 Markdown 常量。

