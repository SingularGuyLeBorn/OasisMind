# Quest 变量生命周期配图

## 来源与设计

论文: Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference, arXiv:2406.10774v2, 2024-08-26. 实际下载并查看 PDF 第4页 Figure 5, 结合第5页 Algorithm 1 的摘要增量更新机制. 来源: https://arxiv.org/pdf/2406.10774v2 . PDF SHA256: 93cda144859b4e38d595c42dbc578e4e0c8d436fa0891e3dfeb74716bacc4ce8.

图限定单请求、固定层与head. 常驻对象是完整KV和每页min/max;新key追加时更新尾页摘要. 当前query与摘要产生页上界, Top-K产生候选页索引, 页表映射到物理KV读取. 当前query和候选K产生logits, 候选内softmax产生权重, 权重与候选V产生输出. 下一步复用已封口KV与摘要, 重算页分数和候选. 不将GQA组内共享或跨层复用归入原方法.

教学数字: keys为(1,4)、(3,-2)、(-1,1);m=(-1,-2),M=(3,4),q=(2,-1). 上界分量6和2, 总和8;真实点积-2、8、-3. 数字沿用正文手算, 非论文实验.

实际参考输入: source-v2-page4.png为科学结构来源, 既有quest-page-selection.png为保留总览含义的参考. 新图采用纵向缓存/计算/时间结构, 不机械复制三栏. 使用内置ImageGen;接口无法指定或确认Image 2.5版本. SciFig用于对象、运算和连接规划. AstraDraw安装缺少其要求的参考文件, 本轮不声称执行了参考注册或PPT重建.

## 生成与验收

原总览保留. candidate-v1.png存在候选K未明确进入QK、KV读取与输出混连以及QK缩放缺失, 不进入正文. candidate-v2.png修正K/V消费者和缩放, 但摘要读取箭头起点与输出连接仍不完整. candidate-v3.png误将读取摘要标签贴到KV追加路径, 未达到局部保护要求, 不进入正文. 三版提示词分别保存在prompt-v1.md至prompt-v3.md.

第四版改为各分区自带完整输入节点, 减少跨区连接, 由已查看的原论文页重新生成;提示词为prompt-v4.md. 数字以确定性点积复算得到[-2,8,-3], 上界8. 生成后再记录是否达到正式引用条件.

第四版实际回读未通过: n=候选页数乘页大小没有覆盖未满尾页;摘要读取节点的连线进入QK输入, 候选V缺少来自读取节点的连接. 第五版修正n为各候选页有效长度之和, 但把读取V的箭头接到输出o_t, 当前query连接出现反向端点. candidate-v4.png和candidate-v5.png仅为失败候选, 都不在正文引用. 提示词保存于prompt-v4.md、prompt-v5.md. 尚未进行正文显示宽度验收, 不宣称生命周期配图完成. 下一版拆成缓存维护与当步计算两张图, 各自保留明确输入和消费者.

知乎开放平台搜索命令本轮报CREDENTIAL_REQUIRED, 当前数据库缺少Credential表. 没有抓得正文, 不把摘要或未抓取材料当作已读正文. 本轮继续以官方论文和仓库为依据, 未创建数据库表或修改凭据.

全文回读修正: 式号13重复改为14/15并同步引用;Z_C是指数和而非log-sum-exp, 后续概率质量界统一缩放logit单位;误写epsilon修正. 官方仓库2024年10月已有Llama-3.1与Mistral-v0.3模型适配声明, 删除“尚未实现GQA”的整体断言, 保留组内候选设计与访存边界. 原论文4K页/4K token单位冲突记入paper-issues.md.
