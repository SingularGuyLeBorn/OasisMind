# coupled-GRPO提示连接修图记录

实际生图工具:内置imagegen, 接口不提供模型版本选择或确认, 不能确认Image 2.5. 使用imagegen与scifig-scientific-figure工作流. 编辑目标v3与论文原始Figure 2均先实际打开查看, 并作为本次生成输入. 原图路径 `diffucoder-source-figure2.png`, 来源 [DiffuCoder v1 Figure 2](https://arxiv.org/html/2506.20639v1#S3.F2).

v4候选保存在同目录 `diffucoder-coupled-v4.png`, 不进入正文. 检查发现原回答到三份掩码输入的连接丢失, 提示带的箭头仍指向分支标题而非具体输入. token、位置目标、时间权重和汇合公式保留正确, 但连接验收失败. 当前正文继续引用v3, 已知提示连接缺口仍待修复.

实际调用的完整英文提示保存在 `diffucoder-coupled-v4-prompt.txt`. 主要编辑约束为三个评分输入各自明确读取提示, 保持原有回答、掩码、目标位置和评分计算.

检查:内容与图注检查通过, 生产资料250张图片的四类坏图计数为0, 新增文本NUL为0. 构建进程39688正常退出, 3847个静态页面与12个HTTP契约检查通过;不将其视为之后代码评测正文改动的显示验收.
