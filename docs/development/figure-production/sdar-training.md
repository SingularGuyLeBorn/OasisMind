# SDAR 训练注意力与掩码损失图

## 来源与结构

SDAR v1 §3.1, Figure 1: https://arxiv.org/html/2510.06303v1#S3.F1 . 高清原图 https://arxiv.org/html/2510.06303v1/training_paradigm.png 已下载到 `sdar-source-figure1.png` 并实际查看. 原图给出干净与扰动两条流、块因果注意力和条件 NELBO. 教学图按 C1、C2、N1、N2 重排展示, 不把排列当成原实现存储顺序.

图中 C1=AB、C2=CD、N1=AM、N2=MD, M 表示 MASK. 块级矩阵按行 Query、列 Key 定义:1000、1100、0010、1001. 每个允许格展开为2×2全可见 token 子矩阵. N1 只读取自身,N2 读取干净 C1 与自身. 只对 N1 的 B 和 N2 的 C 计算交叉熵.

## 生成与修正

使用内置生图工具, 原论文 Figure 1 实际传入作为结构参考. 具体模型版本无法确认. 完整提示词为 `sdar-training-prompt.txt`, 输出 v1 保留为 `sdar-training-v1.png`.

实际回看 v1 发现两个问题:图例将有向跨块读取误写为互相读取;N2 顶部箭头悬空. 经内置生图局部编辑, v2 改为行块读取列块全部 token, 并连接干净 ABCD 源条带到 N2. 矩阵16格、两处掩码监督、条件概率和其余连接重新查看. 编辑提示词为 `sdar-training-edit-v2.txt`, v2 为 `sdar-training-v2.png`.

## 数值与可见性复核

`sdar-training-check.mjs` 检查块级矩阵的传递闭包不增加读取边, token 级展开有24个允许位置对. 示例取 t=0.5、p(B|N1)=0.25、p(C|C1,N2)=0.5, 两项加权求和为4.1588830833596715. 该示例未按块或 token 平均, 不把它当成完整训练 batch 的实际数值.

## 显示尺寸

通过独立 HTML `sdar-training-width-preview.html` 在无界面 Chrome 实际打开. 桌面1280×1000 viewport 图片框800×800, 矩阵、标签与损失公式可读. 手机390×1000 viewport 图宽358, 块名与矩阵可辨, 右侧解释与底部公式需放大阅读. 两张截图 `sdar-training-width-800.png` 与 `sdar-training-width-mobile.png` 已实际查看. 本项为图片宽度验证, 不等同站内整篇页面验收.

v2 复制为文章同目录 `images/fig-sdar-training-v2.png`, 放在训练结构解释后作为图1. 原有状态图和 attention 图顺延为图2、图3, 正文交叉引用同步. 增加干净分支梯度解释、可见性跨层闭包和4.158883损失手算. 原图与候选保留.
