# KV 首页图文审查

全文阅读 3-KV选择章首页与3.1-KV读取与驱逐路线首页. 本切片区分原始KV的存储状态与辅助索引: Quest的min/max摘要与完整KV并存, summary状态仅表示原始KV被聚合表示替代. 不把未被当前query读取的页面等同于压缩或驱逐.

路线首页复用已验收的quest-cache-state-v2.png与h2o-eviction-state-v2.png, 本轮重新实际查看两张正式PNG, 没有新增生图或更改图面. 原始来源、实际生图能力、候选提示词、失败版本及数值复算分别保留于sparse-quest/design.md和sparse-h2o-review.md以及对应制作目录. Quest来源为v2 Figure 5与Algorithm 1;H2O来源为会议版Figure 3并结合官方real_drop实现. 教学数值不标成实验结果.

新增图注和解析逐项核对: Quest页分数[8,0]变为[1,5], 未追加时新query下B仍为4;H2O权重之和1, 更新后位置8分数0.38, 当前输出用7项, 下一步保留6项. 两图注明原尺寸入口, 复用已有正文宽度和手机预览结果;本切片没有重新运行实际首页路由截图, 不声称首页渲染验收完成.

章首页仍需进一步判断四种状态及恢复路径是否需要独立总览图. 本记录只覆盖这两页, 不代表SparseAttention全库已完成. shuorenhua指定目录缺失, 使用现有humanizer-zh做技术文轻量回读, 保留公式、术语和数值.
