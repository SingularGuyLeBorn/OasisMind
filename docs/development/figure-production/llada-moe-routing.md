# LLaDA-MoE 路由图重制

来源: [LLaDA-MoE v1 Figure 2、Table 2、§3.2 式 (3)](https://arxiv.org/html/2509.24389v1#S3.SS2). 已下载 PDF 并实际查看第 3 页原图, 保存为 `llada-moe-source-page3.png`. 原图 Top-2 是示意, 实际规格为 64 选 8.

使用 imagegen 与科学配图技能, 内置接口未返回可核实模型版本, 不标称已确认 Image 2.5. 当前正文采用第七版 `fig-llada-moe-routing-v7.png`, 此前版本保留. 以下失败说明按生成轮次记录, 不代表当前正式图的状态. 第七版为 PNG, 1536×1024, 已通过 Pillow 文件完整性检查.

首版输入 D 误画为 M, 损失连接未按 mask 位置筛选. 第二版修正这些问题, 仍未通过:索引控制线从 softmax 出发而非 Top-8 结果;层输出从 MoE 直接流出, 没有明确经过第二次残差加和. 专家格数量与高亮数还需逐格计数, 不能凭文字标注认定正确. 后续局部修正必须保留已正确的门控手算和残差输入, 将两次加和结果接到后续计算.

## 首轮提示词

绘制中文高信息密度科学教学图,横向1536×1024,白底蓝青色,矩形规整箭头有起终点,非卡通.参考附件论文Figure2的残差Transformer/MoE架构,不要照搬英文,不要把Top2示意当真实规格. 标题「LLaDA-MoE:每个位置如何选择专家」. 左侧整体网络流水:带噪token条带[M,B,M,D]和固定提示,箭头进入「16层Transformer」,内部注明每层双向注意力+稀疏FFN,再箭头最终归一化和词表预测头输出4个位置的概率,仅M位置连接原token标签重构损失,标签有明确单独来源「训练原文」. 中央展开某一层:输入H[位置数,2048]→RMSNorm→双向注意力→残差加和→RMSNorm→MoE→残差加和→下一层. 两条残差旁路各从对应子层输入明确接加号圆点,不接错. MoE内部:每token隐状态h[2048]分叉,一路进入线性路由器→64维softmax→Top8专家索引与权重;一路把同一个h分发至选中的专家FFN→加权求和o[2048];索引箭头连分发控制,权重箭头连加权求和. FFN小展开「2048→SwiGLU中间维1024→2048」. 专家库用8×8共64小格,只高亮8格,标注「单个token选8/64;其他token可选不同集合」. 右侧独立教学示例明确「教学手算:4专家选2」:token甲概率[.4,.3,.2,.1]选E1,E2,输出.4E1(h甲)+.3E2(h甲);token乙概率[.1,.2,.3,.4]选E3,E4,输出.3E3(h乙)+.4E4(h乙).标注「所选softmax权重沿用原值,此式不二次归一」,选中专家分别完整连到加权求和消费者. 底部时间条「本轮各层计算→候选预测→采样器提交位置→下一轮重算状态与路由」,箭头完整,注明「已提交token保留;全双向深层KV可能随上下文变化」. 参数小注「非嵌入参数7B;每token整模型激活约1.4B」,不得把1.4B放单层求和框. 不写无意义英文括号中文翻译,不写依据原文Figure重绘等制作说明,不画实验柱状图,不添加未定义新算法.

## 第二轮提示词

第三版局部编辑误删注意力与 MoE 模块, 不采用. 第四版回到第二版重新绘制中央竖直计算顺序, 两次残差结果进入后续模块, 索引控制线改由 Top-8 输出. 尚需检查小格的实际行列数与高亮数, 第二残差旁路在标签旁的可追踪性;候选仍未进入正文.

## 第三轮提示词

精准局部编辑科学图.只改中央第二栏两处线路,其余所有文字布局数字右侧手算左侧损失保持原样. A:删除双向注意力框直接向下到第二RMSNorm的线;从右侧第一个残差加号圆点引出完整折线,接第二RMSNorm顶部. 删除MoE框直接向下到H'的线;从右侧第二个残差加号引出折线接H'条带,下一层输入必须为加和结果. 残差旁路从第一个加号结果分支到第二个加号保持. B:删除softmax框下方通向专家库的索引线.从Top8框左下边缘明确引出索引控制线,经空白区域进入专家库上边,标签「索引」;Top8下方另一路权重线通向加权求和保留,两条分支不能交叉或端点含糊.专家库8×8,只高亮8格,可以明确高亮对角线8格便于计数.不改变左上[M,B,M,D],不改变手算概率,不添加模块.矩形规整,所有连线完整无断线无悬空.中心顶层H表示包含提示与带噪回答的隐状态,在H标签旁补短注「提示与回答」,H条带用四格作为截取示例不是全序列长度.

## 第四轮提示词

保留参考图左侧整体网络、右侧两token专家手算、底部循环和参数说明. 只重新绘制中央上半栏「单层Transformer」,不得删除注意力或MoE. 将所有主要操作和加号放在同一竖直中心线上,依次完整连接:输入H→RMSNorm→双向注意力→圆形加号1→RMSNorm→稀疏前馈网络MoE→圆形加号2→下一层H'. 两条旁路:输入H从左边绕过第一个RMSNorm和attention接加号1;加号1的输出从右边绕过第二RMSNorm和MoE接加号2. 每个圆形加号必须两条输入一条输出.不要注意力或MoE直接接后续归一化或H',必须经加号.保留中央下半MoE展开,只把索引线起点换到Top8框,线从Top8框左边缘向左下绕到专家库顶部,不可从softmax出发. 权重从Top8到加权求和保持. 保持两种路由概率和输出权重全部不变. 专家格8×8只高亮对角线8格,精确计数. 中央上半可缩小字体适配全流程,矩形和箭头无重叠和断线. 输入标签H[位置数,2048]含提示与回答,四格仅示意.所有科学标签中文不多加概念.

## 第二轮提示词原文

## 第五轮与第六轮

第五版用明确的八个选中专家模块替代难以核对的小矩阵, 第二残差旁路重新连接. 第六版补带噪回答输入, 保留固定提示输入. 实际回读残差两入一出、Top-8 索引与权重消费者、mask 位置损失、不同 token 手算及迭代关系后, 正文采用 `fig-llada-moe-routing-v6.png`, 旧图和各候选保留.

第五轮提示词:

只局部修改参考科学图两个区域,其余科学结构、所有节点、文本数值、右侧手算和左侧原文损失保持不变. 1中央下方专家库小格矩阵删除,改为两行共8个蓝色规整小方块(每行4),分别标「选中专家1..8」可使用短标签1..8,表示任意被选专家的序号不是固定专家id. 下方灰色短条「其余56个:此token不计算」,再注「其他token可选不同集合」.删除8行×8列文字,专家库总数64保留.从h进入选中8专家分发,索引控制来自Top8,权重进入求和,保留原有完整连线. 2中央上方第二残差旁路,从第一个加号的输出到右边绕过RMSNorm和MoE后返回第二加号,清晰箭头端点接第二加号右侧,标签「残差2」移到右侧线条上方,不得遮挡横线或箭头.保持主流输入H→RMSNorm→双向注意力→加号1→RMSNorm→MoE→加号2→H'全部完整,每个加号两入一出.副标题「提示与回答,四格仅示意」保留.严禁删除任何注意力/MoE节点.白底科学技术图非卡通,没有冗余英文中文括号翻译.

第六轮提示词:

只补左栏带噪回答到Transformer的输入连线,其他所有图形标签和机制严格不变. 从最上方[M,B,M,D]四格序列右边缘引出一条完整深蓝折线,沿左栏右侧空白通道向下,箭头进入「16层Transformer」框右侧.固定提示条带向下进入同一Transformer的原箭头保留. 在新折线旁标注短字「回答输入」,不得穿过提示条带或文字. 两者是序列拼接作为条件输入,不是数值相加,不画加号.保持中央MoE专家8个方块,索引Top8线,两个残差完整和右侧概率手算不变.清晰科学技术图无断线无悬空.

局部修正此图,保持所有正确网络结构残差连接及右侧手算不变.左上带噪输入明确只四个token,去掉省略和额外x_M,标签x1 x2 x3 x4,内容M B M D(第四必须D),标题仍[M,B,M,D].左侧固定提示使用p1..p4示意不用L混淆.左下输出只四分布,损失箭头只从位置1和3的预测分布进入重构损失,原文标签只y1和y3向损失有箭头,保留原文条带四格y1..y4,不得从干净位置2或4连损失.中间MoE控制分发索引线必须从Top8框出发到专家库,不是从softmax框;权重线从Top8框进入加权求和,两个箭头分别有索引/权重标签. 64专家库画8行8列,准确只高亮8格,其他白格.所有矩形规整,箭头清晰无悬空,原图剩余内容不变.专家维度2048→1024→2048以及教学Top2权重保留.图为科学技术图,不要装饰.
# 第七版:补齐 SwiGLU 双分支

正式正文改用 `fig-llada-moe-routing-v7.png`, 第六版保留. 实际调用内置生图编辑, 接口未返回可确认的模型版本. 局部编辑只替换专家 FFN 展开:2048 维输入分为门控与内容两个 1024 维投影, 门控分支经过 SiLU, 两支逐元素相乘, 再经输出投影回到 2048 维. 依据 [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202) 与 LLaDA-MoE Table 2 的专家维度.

提示词:Use case: precise-object-edit. Edit the supplied LLaDA-MoE scientific diagram. Preserve ALL existing panels, token rows, labels, residual arrows, top8 expert grid, routing hand calculations, bottom iteration and numerical specifications exactly. Change ONLY the small subpanel titled 单个专家 FFN 结构 at lower right of middle panel. Replace its incorrect sequential 2048→1024 linear→SwiGLU→1024→2048 diagram with true SwiGLU: input h [2048] splits into TWO parallel projections labeled 门控投影 2048→1024 and 内容投影 2048→1024. Gate branch passes through SiLU; content branch bypasses activation. Both meet a circle marked ⊙ (逐元素乘), then 输出投影 1024→2048, then 输出 [2048]. Enlarge that local inset slightly into its own available space if necessary, keep other objects unchanged. Every arrow must have continuous line and clear source/destination. Neat rectangular nodes, no overlaps, legible Chinese, same restrained blue technical style. No production notes or decorative additions. Do not simplify other scientific details.

实际查看输出:两支投影均由同一输入发出, 内容分支绕过 SiLU, 在乘法节点汇合后才进入输出投影. 复查残差、Top-8 八个选中矩形、四专家选二的 0.4/0.3 与 0.3/0.4 权重、掩码损失位置及底部迭代, 未改变这些计算关系.
