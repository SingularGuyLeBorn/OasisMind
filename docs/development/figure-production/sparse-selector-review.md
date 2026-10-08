# 选择器训练页回读与配图检查

已阅读正文的监督、梯度、预算、训练推理对齐及后续推导, 修正学生温度梯度、预算门归一化、普通softmax低温只趋向top-1、因果特征与后见标签的区分. 数值关系由sparse-selector-verify.cjs复算;未运行模型训练实验.

实际查看现有selector-training-flow.png: 图中Loss统一回连Selector, 没有区分教师监督损失与语言模型损失, 易被理解为LM梯度可直接穿过硬top-k. Top-k直接连向三份KV, 也没有显示历史KV来源或gather操作;主attention的query来源缺失. 本图需要重制, 不能按现状认定验收完成. 原图保留.

新图应分别展开教师概率p与学生概率q汇入KL损失, 该损失更新选择器;选择器分数产生硬top-k整数位置, 位置控制从主干历史KV中gather;当前主干query与选中KV进入稀疏attention, 输出进入LM损失. LM反向更新参与计算的主干Q/K/V, 硬整数位置默认不传梯度. 只有另行启用straight-through等代理机制时, 才增加相应代理梯度路径. 教师标签detach与冻结参数分开标记, 不将通用教学图写成某篇论文的完整训练实现.
