# d3LLM 伪轨迹训练候选图

来源: https://arxiv.org/html/2601.07568v1 , Figure 2 与 §3.1. 原图已实际查看, 保存为 `d3llm-source-figure2.png`.

候选存档: `d3llm-pseudo-training-v1.png`. 使用内置生图接口, 无法指定或确认 Image 2.5 版本. 已复制到文章 images/fig-d3llm-pseudo-training-v1.png 并作为训练图1引用. 当前图2为原论文 Figure 3, 图3为多块 KV 生命周期 v4;原英文总览资产保留, 不再由本篇引用.

已回读六位置示例:教师揭开位置2、4, 内容为b、d;输入从标准答案取B、D, 其余位置MASK. 损失标签为位置1、3、5、6的A、C、E、F. 学生参数更新箭头与标签输入分开. 所有条形仅示意预测分布, 不表示实验数据. 此图只解释伪轨迹交叉熵, 不覆盖certainty-forcing、互补掩码、多块推理及KV刷新.

预览:实际浏览器800像素固定正文宽度, 主要标签、编号及箭头可读. 此检查不是完整站点文章或移动端验收. 顶部位置顺序到中间可见集合靠一致的位置2、4和标题对应;中间与下方重复同一训练输入, 正文解析已明确两者对应. 未用无端点箭头跨越分面.

## 完整生成提示词

当前重新打开正文实际引用的PNG核对:教师b、d止于上排状态, 标准答案和可见性在中排汇合为M,B,M,D,M,M, 下排只将位置1、3、5、6的预测与标签送入交叉熵. 四个概率条形无实验数值, 图下注释定义M、θ与p_i. 损失的虚线更新箭头回到学生, 不连接教师. 当前正文说明LoRA配置只更新适配器, 基座冻结, 并说明图未展开熵项和互补掩码;图作为单项交叉熵讲解保留. 未发现悬空箭头、冗余双语标签或遮挡. 本轮是原尺寸实际查看, 不是新的站点或移动端截图验收.

```text
Use case: scientific-educational. Generate a detailed Chinese technical teaching diagram, landscape white background, crisp navy text teal visible tokens amber MASK, scientific not cartoon, no icons, no English translations in parentheses. Reference image is d3LLM paper Figure 2 for scientific structure only; create a new more explicit example. Title exactly 'd3LLM: 顺序来自教师, 内容来自标准答案'. Three horizontal zones with complete connected arrows and aligned six-cell token strips indexed 1 2 3 4 5 6. Zone top '教师逐格揭开, 只记录位置顺序': teacher strip start M M M M M M; then state M b M M M M labelled '第1步:位置2'; then M b M d M M labelled '第2步:位置4'. One compact order strip '2 → 4 → 1 → 6 → 3 → 5'. Teacher-generated lowercase b,d are illustrative and DIFFERENT from standard answer uppercase B,D; note '教师生成内容不作为标签'. Define M as 'M: 尚未揭开的 MASK'. Zone middle '按同一可见集合回放标准答案': standard-answer row A B C D E F; a visibility row '隐藏 可见 隐藏 可见 隐藏 隐藏'; combine standard-answer row and teacher order via two separately labelled arrows '答案内容' and '可见位置' into training-input strip M B M D M M. Clearly labelled '示例:保留前两次揭开位置'. The teacher b,d never flow to student input. Zone bottom '学生预测剩余 MASK': training strip M B M D M M arrow to student rectangle '学生 θ' arrow to four small categorical-distribution bars labeled p1 p3 p5 p6, bars schematic no fabricated numeric values; standard-answer targets A C E F in four corresponding cells arrow to one loss rectangle '交叉熵:位置1、3、5、6'; probability bars feed same loss. Draw a distinct dashed return arrow from loss to student θ labelled '更新 θ' with clear full endpoints and no crossings. Footer 'B、D 提供上下文, 不计入本次掩码损失'. Define all symbols within figure. Make all rectangles straight nonoverlapping and all arrows unbroken with definite endpoints. No AUP or inference cache or claims about results in this training diagram. No source or Figure number inside picture. Spacious readable large Chinese fonts, clear alignments.
```
