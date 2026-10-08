# MoBA 正文与机制图审查

## 实际阅读与来源

全文阅读content/SparseAttention/2-动态路由/2.1-粗粒度选择/2.1.3-MoBA.md. 原文无配图, 主要缺口是历史路由与强制当前块的因果边界, 以及局部分母怎样合并成候选并集softmax.

实际打开arXiv v1 HTML方法、Algorithm 1和官方moba_efficient.py的路由、mask、合并与backward. PDF来源https://arxiv.org/pdf/2502.13189v1 , 15页, SHA256为9EA3247701683EFF6D901052367A6D6EBCFFCB5A78BED239923D9E696BC9D121. 初次PowerShell下载发生EOF, 随后curl成功;PyMuPDF渲染第3页source-page3.png并实际查看Figure 1. 官方代码来源https://github.com/MoonshotAI/MoBA/blob/master/moba/moba_efficient.py , 本轮没有运行CUDA实现.

通过仓库知乎CLI搜索MoBA块注意力, 再read Kimi官方介绍https://zhuanlan.zhihu.com/p/24827449495 , 返回正文已阅读. 搜索与读取现在成功, 不沿用此前其他切片CREDENTIAL_REQUIRED作为当前阻塞. 该介绍的块选择、因果约束、细粒度划分与两类混合已经融入正文主线;公式和实现细节由论文及代码确定, 不把抓取中缺失的公式当作源公式. 抓取正文没有写入Git.

## 正文修正

- query统一为行向量, 块均值内积改为q乘key转置, 分数s与二值gate g分开.
- 修正复杂度公式遗留的裸approx字符.
- 区分hard top-k索引不传回排序梯度与共享Q/K/V参数更新后路由分数间接变化. 某块不获得某query的跨块边梯度, 不代表该块在全模型中没有梯度.
- 新增一维手算, 共同候选[3,4,5], logits[4,2,1], values[10,20,30], 输出11.9821533;verify.cjs复算直接softmax与online合并一致. 教学值不作为论文实验.
- v1 scaling总结句81.25%与75%冲突记录于paper-issues.md.

## 生图与版本

采用SciFig规划对象与运算, 内置ImageGen实际传入已查看的source-page3.png. 接口无法指定或确认Image 2.5. AstraDraw已读取主技能, 但安装缺少art-direction.md和design-and-priors.md, 没有执行其完整设计/参考注册流程或声称交付可编辑PPT.

prompt-v1.md生成candidate-v1.png: 数值、块预算与因果边界正确, 原始K/V到消费者的连线缺失. prompt-v2.md局部增加连接, candidate-v2.png却把K连线终点接到Softmax边界, 不验收. prompt-v3.md仅修正K到logits节点及V到加权求和的端点. 失败版本保留, 不引用于正文.

candidate-v3.png的K终点已修正, 但漏掉logits到softmax的连接, 仍不验收. prompt-v4.md只补这一根连接. 正式图是否入文取决于输出后的实际回读, 不因生成成功而默认通过.

candidate-v4.png实际回读: 历史均值[1,3]、Top-1、当前位置5与未来6、候选[3,4,5]均正确. 原始K进入logits, logits进入softmax, 权重与原始V分别进入加权求和;两路online统计与e^-3重缩放正确. 输出11.9822注明近似, 没有把四位小数权重的计算写成精确相等. 通过后复制到正文images/moba-causal-routing-v4.png, 原候选保留.

运行preview.cjs用Chrome实际按800px与390px显示, 两张截图已查看. 正文宽度下主要数字、候选与计算关系可读, 手机宽度小公式需放大, 图注提供原尺寸入口. 这是独立图片显示验收, 尚未重新运行本篇实际站点路由, 不将其当作页面运行时验收.

本记录仅覆盖MoBA, 不代表SparseAttention全库完成.
