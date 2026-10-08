# 明确反向逐算子路径

以candidate-v2为目标, 保留蓝色前向线、全部数值与KL(p∥q). 移除两栏全部橙色反向连线及箭头头部, 在栏底改为完整文本链:

- 选择器反向:KL→q→r→θ_I, 梯度(q−p)/τ.
- 主干反向:LM损失→o→attention→Q.
- KV反向:LM损失→o→attention→选中KV→gather→历史KV.

保持硬整数索引默认不传梯度的说明, 不增加LM到S、top-k或r的线. 矩形完整规整, 不遮挡, 其余数值与教学集合不变. 内置ImageGen实际编辑.
