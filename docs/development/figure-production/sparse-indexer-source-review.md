# Indexer 配图来源与候选复查

## 实际查看的来源

- [LISA 官方 PDF](https://github.com/MuLabPKU/TransArch/blob/main/LISA/lisa.pdf)：PDF 第 3 页 Figure 1。共享 key 使加权 query 可合并；LISA† 阈值筛候选后完整精排，LISA‡ 共享候选位置，各层独立评分和选取最终索引。
- [ResMiSA 官方 PDF](https://github.com/MuLabPKU/TransArch/blob/main/MISA-2/resmisa.pdf)：PDF 第 2 页 Figure 1。所有头参与共享线性项，合法 key 的分块极值用于选择残差头，残差评分使用负点积与原符号权重。最终 token 索引送入独立的 Sparse MLA。

原页已渲染并实际查看，下载与原页保存在忽略的 data/sources 中。教学数值通过 sparse-indexer-verify.cjs 复算：原分数 6，共享线性项 4.5，残差 1.5。图中的跨层候选位置与最终集合是教学示意，不是实验记录。

## 候选结果

- v1：公式、数值和各层独立选择示意正确；query 到历史 key 的箭头错误，合法 key 到上界计算缺少输入；未用于正文。
- v2：手算保留正确，但仍保留 query 到历史 key 的错误箭头；key 箭头错误进入残差头选择而非分块极值计算；另有 key 到分数的绕行箭头跳过点积。仍不合格，未用于正文。不能把此次修改当作已修复。

全部候选均保留。第三版重新排列独立输入，第四版修正残差头集合的消费者，第五版反转主 attention 的 Q、KV 输入箭头，第六版将负点积上界直接写成数学表达式。

v6 实际查看通过：共享 query 与历史 key 分别进入点积；合法 key 的逐坐标极值与当前 query 共同产生每头上界；集合 A 输入残差计算而非评分结果；同一 query 的 A 用于所有合法 key；线性分数与残差分数相加后选 token，主 attention 读取自己的 Q、KV。顶部为全部残差时的精确恒等式，右侧带帽分数为截断近似。手算与 LISA 系列方法对比保持正确，正文采用 v6。手机阅读提供原尺寸链接。网站构建与页面检查另行记录，部署尚未完成。

使用内置生图接口，接口无法指定或确认 Image 2.5 版本。
