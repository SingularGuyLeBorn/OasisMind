---
title: "02 · Open Instruct 技术解析：从数据契约到 SFT、DPO 与在线 RLVR"
category: "开源仓库"
tags: ["OLMo", "Open Instruct", "SFT", "DPO", "RLVR", "GRPO"]
published: true
excerpt: "基于固定提交 1182625 的代码与配置，解析 Open Instruct 的统一数据转换、监督与偏好训练、异步 rollout、奖励验证、分布式执行和复现边界。"
---

# Open Instruct 技术解析：从数据契约到 SFT、DPO 与在线 RLVR

Open Instruct 提交 `11826255077617a46919ce75cadf1f3d53f30dac` 的训练实现分布在 `open_instruct/dataset_transformation.py`,`data_loader.py`,SFT/DPO/RM 与 `grpo_fast.py`,配方和运行入口位于 `scripts/train/olmo3/`,`configs/`,`docs/olmo3.md` 及污染检查代码.仓库将自身定位为研究代码且不保证向后兼容,文中的接口描述因此对应这一提交.

![Open Instruct 从统一数据契约到 SFT,偏好学习和在线 RLVR 的训练图](images/open-instruct-training-flow.png)
> 图 1:统一数据转换把消息,偏好对和可验证任务送入不同阶段;SFT 产生策略起点,DPO 或奖励模型使用偏好数据,在线 RLVR 则把策略采样,验证奖励与参数更新连成反馈循环.

图 1 中三条训练路线共享稳定的数据语义和模型接口,各自采用不同的损失.SFT 需要明确哪些 assistant token 参与交叉熵;DPO 要保证 chosen 与 rejected 共用同一 prompt,并依赖参考策略定义相对变化;RLVR 每轮都由当前策略生成 rollout,再由验证器给出奖励,因此采样服务,训练集群和版本标识必须同步.箭头没有表示 SFT,DPO,RLVR 必须全部执行,也没有表示后一阶段必然优于前一阶段;具体组合取决于目标行为,数据覆盖和计算预算.

## 1. 数据契约与 SFT

Open Instruct 把后训练拆成可以复用的程序, 但各阶段能否接起来, 取决于数据字段是否始终表达同一件事. Prompt,assistant response,来源,模板和损失 mask 一旦在转换中漂移, SFT,偏好优化和 RL 学到的任务就会发生变化.

SFT 是这条链路的第一个检查点. 监督落在哪些 token,长样本怎样截断,不同来源如何 packing, 都会改变实际梯度与样本权重. 数据条数或 epoch 无法单独描述这些差异, 有效监督 token 才是更接近训练作用的口径.

### 1.1. 多阶段共用的数据语义

Open Instruct 同时覆盖 SFT,奖励模型,DPO 和 RLVR.四类目标都依赖同一层数据语义:消息角色怎样排列,system prompt 是否注入,assistant 哪些 token 参与损失,chosen/rejected 是否共享完全相同的 prompt,RL prompt 如何携带可验证答案与环境信息.`dataset_transformation.py` 集中处理 chat template,特殊 token,截断,缓存版本,标签和数据来源,职责远多于简单的字段映射. 源码注释直接列出三种主要目标:prompt-only,SFT 的 prompt+demonstration,RM/DPO 的 chosen+rejected.统一转换层的价值是让训练器消费明确张量,而不是各自在循环中猜测原始 schema.它也降低阶段间漂移:同一条 conversation 若在 SFT 与 DPO 中用不同模板渲染,偏好优化实际上是在另一个 token 分布上继续训练.

`TokenizerConfig` 和一组默认键定义字段契约.SFT 最终需要 `input_ids`,`attention_mask`,`labels`;assistant 以外的位置通常置为忽略标签.代码为转换缓存维护版本号,注释记录版本变化,例如工具列支持,generation 区间标签等.这个细节非常关键:Hugging Face datasets 的缓存可能让「代码已更新」但训练仍读旧 token 化结果.显式提升缓存版本,是把数据处理逻辑纳入可复现状态. OLMo 3 文档暴露了真实教训:开头 `<think>` 曾因 prefix-based labeling 被误当 prompt 掩蔽.较新的 `{% generation %}` 区间能直接标注 assistant 生成范围,但块的起止,结束 token 和工具调用交接必须精确.只比较 labels 数量不足以证明归属正确;渲染文本相同也不证明 mask 相同.仓库宁可记录并丢弃所有权含糊的行,说明 silent corruption 比少量数据损失更危险.

**数据契约决定各阶段是否在学习同一个任务.** 一条对话在原始 JSON 中只是角色与文本的列表.真正进入模型后,它会被 chat template 渲染成特殊 token,角色 header,换行与结束符.SFT 的 prompt,DPO 的共同前缀和 RL 的 rollout 起点若采用不同渲染,三个阶段表面使用同一数据,条件分布已经不同. 契约至少要固定角色集合,工具调用表示,system 注入规则,assistant generation span,文档结束与轮次结束 token.转换器应拒绝未知角色和不成对的工具返回,避免悄悄转成普通字符串.严格失败比默认猜测安全,因为错误模板会在数十亿 token 中稳定重复.

还要区分语义版本与实现版本.代码重构若输出 token 完全一致,无需让缓存失效;模板加一个换行,改变 generation span 或截断方向,即使函数名不变也属于语义升级.用少量金样本保存渲染 token 与 label mask,能直接比较版本差异.

数据混合权重应按有效监督 token 理解. 混合配置常写各数据源样本比例,训练梯度却由参与 loss 的 token 构成.长对话含大量用户上下文,若只训练 assistant span,有效监督 token 可能并不多;短问答的回复占比反而高.经过截断,过滤和 packing 后,原始比例还会再次变化. 对来源 $k$,可记录原始样本数,成功转换数,输入 token,label token 与实际采样次数.近似梯度权重更接近 label token 占比,而资源成本接近总输入 token 占比.两者分开,才能解释某来源「很贵但监督少」或「样本少却更新强」. 多 epoch 还会对小数据重复采样.若混合采用按源温度采样,名义数据量不再决定权重.最终 manifest 应给每个 optimizer step 实际消费的来源计数,至少提供全程汇总.

数据质量问题会跨阶段传播. SFT 中错误答案提高错误序列概率;DPO 中错标偏好同时推高 chosen,压低 rejected;RL verifier 错误则可被当前 policy 主动发现并反复利用.三个阶段对同一噪声的放大机制不同,在线 RL 风险最高. 数据清洗不能只在入口做一次.SFT 检查格式,正确性和重复;偏好数据检查共同 prompt,标签置信与长度偏差;RL prompt 检查 verifier 可执行,答案唯一性与难度.每阶段输出的模型又改变下一阶段数据分布,需要重新抽样审计. 仓库统一数据层提供字段与转换一致性,不会自动保证内容正确.内容证据来自数据卡,生成流程,过滤统计和人工复核.把 schema 通过误写成数据高质量,是开放训练中常见的归因错误.

数据来源字段是归因接口. 保留 `dataset_origin` 后,可以按来源计算 loss,截断率,零奖励率和下游贡献.若训练突然异常,先看是否由单一数据源格式升级或缓存错配引起.没有来源字段,只能把所有样本当成均匀总体. 来源标签还支持消融与重加权.发现某源在数学有效,在安全退化,可调整比例或分阶段使用.标签必须追溯到具体 revision;同名数据集更新后,旧统计不能直接复用. 来源并不等于独立.多个数据集可能复制相同网页,题库或教师输出.还需内容哈希与近重复簇,避免把同一信息的多次出现解释成多来源共识.

### 1.2. SFT 的损失掩码,截断与 packing

SFT 的基本目标是对 demonstration 中 assistant token 做交叉熵.用户,system,工具返回与格式 header 通常作为条件但不计损失.若 labels 边界错一位,模型可能被训练去生成用户提示,忽略 `<think>`,或学不到正确结束行为.Open Instruct 因而要求 fast tokenizer,并围绕 chat template 渲染与 assistant span 建立检查. 长样本策略同样改变目标.截断可能切掉回答尾部或结束 token;左截断保留末端,却可能丢失 system prompt 和问题前提.文档区分 `drop` 与 `terminate` 等行为,后者保存完整尾部但不应把已有工具交接 token 粗暴替换成 EOS.对工具使用模型而言,`<|im_end|>` 表示把控制权交还环境,普通 EOS 表示对话结束,二者混淆会直接破坏 agent 行为.

训练脚本仍有两条路径.README 对支持的 OLMo,OLMoE,Qwen3 推荐 GPU 效率更高的 OLMo-core SFT,传统脚本则基于 Hugging Face Trainer 改造.这样做是工程折中,不代表两个后端天然逐位等价.它们可能在数据打包,梯度累积,loss reduction,FSDP state dict 和 scheduler 边界上不同.阶段交接必须用实际 checkpoint 和 tokenizer 验证,不能只凭相同模型名. 配置脚本提供真实配方入口.`scripts/train/olmo3/` 分开 7B/32B,instruct/think,SFT/DPO/RL.脚本不是教程命令的简单展开:它通常还固定数据集 revision,模型与 tokenizer,batch,长度,学习率,分布式启动和输出路径.复现者应保存脚本 commit 与最终命令,因为环境变量和启动包装仍可覆盖脚本默认值.

**SFT 目标的分母会改变梯度尺度.** 交叉熵可以按所有非忽略 token 平均,也可先按样本平均再对 batch 平均.前者让长回复权重大,后者让短回复相对上升.packing 后一个序列含多条样本,若只按序列平均,打包方式也会进入权重. 分布式训练还要确认 reduction.各 GPU 有效 label token 不同时,先在卡内平均再对卡平均,会让短 batch 与长 batch 等权;先求 loss 和 token 数再全局相除,才是全 token 平均.相同 global batch size 不能保证相同目标. 报告应写有效监督 token,loss reduction 和梯度累积,而非只列样本 batch.不同后端比较时,这些细节比命令行名称更关键.

截断是内容选择策略. 超过最大长度时,从右侧截断可能删除最终答案和结束符,从左侧截断可能删除问题与 system 约束.直接 drop 保持语义完整,却改变长度分布;terminate 在边界补结束行为,也可能把工具交接误写成会话终止. 可按数据类型制定策略.单轮问答优先保留问题与完整回复;多轮对话可按轮次切块并重复必要 system;工具轨迹必须保持 call-response 成对.所有策略都应统计丢弃 token 与样本比例. 长样本质量也需单独验证.提高上下文上限让更多文本进入 loss,不保证其中远距离依赖正确.对长对话测约束保持和跨轮引用,比只看训练 token 数更能说明收益.

packing 不能跨越语义边界泄漏. 将多个短样本拼入固定长度序列能提高利用率.attention 若未按边界隔离,后一个样本可能看到前一个回答,形成训练时存在,推理时不存在的上下文.即使有 EOS,模型仍能注意前文,只是学习到软分隔. 某些实现接受这种文档拼接,另一些使用 block-diagonal attention.两者目标不同.复现要写清 position id 是否重置,loss mask 是否正确,跨样本 attention 是否允许.OLMo-core 与 Trainer 后端可能采用不同 packing,需要实测对齐. 金样本测试可把两条内容明显不同的对话打包,检查 attention mask,position id 和 labels.只比较最终 loss 很难发现泄漏,因为模型仍会正常收敛.

SFT checkpoint 是后续阶段的参考坐标. DPO 的 reference 通常来自 SFT,RL 的初始 policy 也来自它.SFT 配方改变,后续的概率比,探索分布和可验证成功率都会变化.同一 DPO 或 RL 配置不能脱离起点比较. 保存 SFT 最终权重之外,还应保留中间 checkpoint 和验证轨迹.后续阶段若退化,可以判断问题从 SFT 已存在,还是偏好/RL 引入.不同 SFT checkpoint 作为参考的交叉实验能测阶段依赖. 强 SFT 起点可能让 RL 成功率高却组内零方差多;弱起点提供探索差异,却大量全错.起点选择本身是在线算法超参.

## 2. 偏好优化与在线 RLVR

DPO,奖励模型和 RLVR 都使用「更好回答」这一信号, 计算接口却不同. DPO 比较 policy 相对 reference 的对数概率变化, 奖励模型拟合一个评分函数, RLVR 则让当前策略生成样本并由 verifier 返回奖励.

接口差异会改变数据分布和故障模式. 离线偏好数据由旧策略产生, 在线 rollout 会随模型更新而变化; verifier 的解析错误,奖励聚合和零方差组过滤, 都会直接改变训练目标. 只有把生成,验证与更新放在同一条链路上观察, loss 曲线才有明确含义.

### 2.1. DPO,reference 与奖励接口

DPO 数据含 chosen 和 rejected.转换层必须从二者提取共同 prompt,再分别渲染回答;如果 prompt 不同,chosen/rejected 的 log-prob 差就混入上下文差异,目标不再是同一条件下的偏好.长度处理也必须对称:只截断一边可能凭长度制造偏好信号.源码将 RM/DPO 转换放在统一模块中,正是为了集中约束这些不变量. DPO 的核心是比较策略相对参考模型对两种回答的偏好差异.beta 控制偏离参考策略的强度.工程上需要同时获得 policy 与 reference 的 log-prob,显存压力显著高于普通 SFT;可以冻结参考模型,预计算参考 log-prob 或通过分片降低驻留成本,但不同实现的数值与吞吐不可直接类比.训练脚本中的 batch,梯度累积与序列长度决定实际 token 预算.

奖励模型把 chosen/rejected 映射为标量并优化排序.README 的模型表显示 Tulu 系列发布 RM,同时 RLVR 又可使用可验证奖励.二者不应混为一谈:RM 是学习到的偏好近似,可能继承标注偏差;verifier 对数学答案,代码测试或格式规则给出程序化信号,范围更窄但可审计.混合奖励时必须记录每项权重和聚合方式,否则同名「reward」无法复现.

**DPO 的相对目标依赖 reference 一致性.** DPO 比较 policy 与 reference 对 chosen/rejected 的 log-ratio.reference checkpoint,tokenizer,模板和截断必须一致.若 reference 用旧模板,序列概率对应不同 token,概率比失去清晰含义. 预计算 reference log-prob 可节省显存,但缓存键必须包含模型 revision,模板和最大长度.数据重新截断后继续使用旧 log-prob,会形成静默错误.在线计算更稳妥,成本更高. reference 也定义约束中心.换成更强或更弱 SFT,即使偏好对相同,DPO 更新含义不同.模型卡应绑定 reference 哈希,而非只写 beta.

偏好对的共同 prompt 需要结构比较. 简单取 chosen/rejected 字符串最长公共前缀不可靠.模板空格,system 差异或多轮分支可能让公共部分截错.应在 message 结构层确认直到末尾 assistant 前的角色与内容完全相同,再分别附加回复. 如果两边历史不同,标签同时评价上下文和回答,DPO 无法归因.长度截断也要以共同 prompt 为单位:先保留相同上下文预算,再对两条回复采用一致规则.只截长的一边会产生长度捷径. 工具调用偏好更复杂.chosen 与 rejected 可能调用不同工具,随后环境返回也不同.比较对象是单步调用还是完整轨迹必须明示;把不同环境结果塞进回复会混入不可控因素.

DPO 训练曲线至少要拆成四条. 总 loss 下降只说明偏好分类变好.还应记录 chosen reward,rejected reward,margin 与隐含 KL.chosen 概率可能下降,只要 rejected 降得更多,margin 仍上升;这种模型未必更会生成 chosen 风格. 长度分桶和来源分桶能发现捷径.若长 chosen 的 margin 快速扩大,等长样本不变,模型可能学长度.若单一数据源主导,混合权重需要调整.验证集必须按 prompt 去重,防止同题改写泄漏. beta 与学习率共同决定偏移.只比较 beta 而不报告实际 KL,序列长度和训练步,无法跨配方解释.

奖励模型和 DPO 服务于不同接口. RM 学 $r(x,y)$,可给任意候选打分,支持 BoN 或 PPO;DPO 直接更新策略,不产生独立可复用 judge.两者都消费偏好对,却输出不同资产.把 DPO 称为「不需要奖励」的简化,会忽略其偏好数据仍定义隐含奖励. RM 的绝对尺度未固定,进入 PPO 前要校准分布与异常值.DPO 通过 reference 概率比内置锚点,仍可能因标签偏差改变风格.选择取决于是否需要在线采样,独立评分器和动态优化. Open Instruct 同时保留两条路径,使同一数据能比较算法.但严格对照要统一基座,模板,token 预算与评测,不能只比发布模型名字.

### 2.2. 生成,验证与训练反馈

该提交的 RL 主入口是 `open_instruct/grpo_fast.py`.`data_loader.py` 不只是离线 batch loader,它包含 vLLM 配置,流式数据准备,rollout 结果组合,奖励统计和优势计算.每个 prompt 生成多条 response,配置项 `num_samples_per_prompt_rollout` 控制组大小;若设为 1,代码警告 GRPO 退化为 REINFORCE.因为组内只有一个样本时标准差恒为零,源码禁止同时开启零方差样本过滤. 组相对优势在代码中按 prompt reshape reward,计算组均值和标准差,再选择标准化 `(r-mean)/(std+1e-8)` 或只中心化.这样无需单独价值网络,但高度依赖组内多样性.采样温度过低或 verifier 过粗会让整组奖励相同;过滤零方差组可避免无信息梯度,却会改变有效 prompt 分布.训练日志因此既要看平均 reward,也要看被过滤组比例与实际 response 数.

rollout 通常由 vLLM 侧生成,训练侧更新 PyTorch policy.异步可重叠生成和训练,提高设备利用率,却产生 off-policy 陈旧性.代码记录生成所用 model step 的最小,最大,均值和 `num_steps_off_policy`,并能丢弃落后训练太多的结果.这不是纯性能细节:允许多陈旧决定优化目标相对当前 policy 的偏移,必须作为算法超参数记录. 数据类型为每个样本保留 `rollout_states`,其中含 reward,step_count,done 和 info;多轮或工具环境可把每轮状态带回.`reward_aggregator` 支持 `last` 或 `sum`,即取末尾一轮或累加全部轮次奖励.两者代表不同任务定义:last 更强调最终结果,sum 会鼓励中间进展,也可能奖励拖长轨迹.多轮训练报告若不说明聚合器,数字不可比较.

**奖励系统:可验证不等于不会出错.** `StreamingDataLoaderConfig` 明确包含 verifiable reward,R1 风格 format reward,可加格式奖励,代码 pass-rate 阈值和 evolving rubric reward.初始化校验要求至少启用一种奖励,并据启用项计算最大可能分数.把奖励拆成指标而非只返回总分,使日志可以发现模型是在提高正确率,还是只学会格式. verifier 仍可能被利用.字符串答案需要归一化;数学等价性需要符号判断;代码测试的覆盖率决定「通过」是否真实;格式奖励可能诱导模型输出模板而非推理.`verification_reward` 默认量级若远大于格式奖励,会让最终正确性主导;若加法权重不当,模型可能用格式分补偿错误答案.任何奖励更新都会改变训练任务,应和数据,模型一样版本化.

代码环境还带来安全与隔离问题.仓库包含 environment 与 sandbox 测试,说明执行生成代码不是普通纯函数.生产复现必须记录镜像,超时,资源限制,网络策略和测试集 revision.相同答案在不同编译器或依赖版本中可能得到不同结果.所谓「可验证」只表示存在程序规则,不表示跨环境自动一致. rollout trace 可写盘,配置要求开启保存时必须给 `rollouts_save_path`,并保存元数据.trace 是审计奖励黑客,终止原因和模板错误的最好材料,但也可能含原始 prompt,模型输出和敏感数据.路径,保留期与访问控制属于复现基础设施的一部分,不能因其是研究日志而忽略.

## 3. 分布式训练与复现边界

在线 RL 同时占用生成集群和训练集群, 二者通过 rollout,权重版本和 tokenizer 连接. 生成侧吞吐,训练侧 batch 与权重同步频率共同决定样本有多陈旧, 因而系统配置也属于算法条件.

复现一条配方不能只保存训练 YAML. 数据 revision,模型与 tokenizer revision,仓库提交,失败恢复位置和阶段间 checkpoint 都要绑定到同一次运行. 随机种子可以固定局部采样, 却无法消除异步顺序和外部环境变化.

### 3.1. 训练集群与推理集群的共同约束

README 的小例子用 8 GPU,RLVR 启动器则通过当前 commit 构建 Beaker 镜像并运行脚本.仓库 `configs/` 同时有 Beaker,DeepSpeed 与训练配置,实际运行会跨越 shell,容器,调度器和 Python.`build_image_and_launch.sh` 试图把源码 commit 固化进镜像,这是好做法,但若依赖下载未锁,基础镜像 tag 可变,commit 仍不足以完全定义环境. RL 的资源核算不同于 SFT.训练 GPU 存 policy,优化器和梯度;rollout GPU 运行 vLLM;奖励可能还需要 judge 模型或 sandbox CPU.只报告训练卡数会掩盖真实算力.异步并发还要求稳定地把新权重同步到推理引擎,日志中的 model step 指标正是验证同步是否跟上的证据. 分布式 batch 有三层:每个 prompt 的采样数,每轮唯一 prompt 数,训练全局 batch.代码检查期望 response 数等于采样数乘全局 prompt 数,但过滤未完成,零方差或陈旧结果后实际数会下降.梯度归一化若仍按名义 batch,和按实际 token 归一化含义不同.复现报告应给出过滤前后计数,有效 token 和 optimizer step,而不是只给 epochs.

SFT/DPO 可用 DeepSpeed 等分片,OLMo-core SFT 又有另一套并行实现.checkpoint 是否可跨后端加载取决于权重命名和保存格式;优化器状态通常更难迁移.阶段链中 SFT 到 DPO 再到 RL 经常只需要模型权重,但 tokenizer,chat template 和特殊 token 表必须一起传递.只上传 `safetensors` 而漏掉 tokenizer 配置,会复现出形式正确,语义错误的输入.

### 3.2. 污染,版本与阶段交接

仓库提供 `decontamination/` 来测训练数据和评测集重叠,这是开放后训练不可缺的步骤.指令数据常从网页,竞赛解答和模型生成混合而来,精确重复只是污染下界;改写,翻译和答案泄漏也可能让评测失真.索引与搜索参数,规范化,n-gram 阈值及评测集版本都应随报告公开. README 明确说内置评测已不维护,建议改用 OLMES.这是一条重要边界:不能看到仓库还有 eval 脚本,就假定它代表当前官方口径.复现 Tulu 3 应固定 OLMES commit,任务配置,prompt,归一化,采样参数和模型 tokenizer.训练仓库与评测仓库分离有利于职责清晰,也增加了跨仓库版本配对要求.

**可复现性:固定提交只是起点.** 该提交提供 `uv.lock`,大体积 requirements,Dockerfile,脚本和测试,优于只发若干命令.但 README 主动声明不保证向后兼容,说明配置名和执行路径会变化.复现应至少保存:源码 commit 与补丁;uv lock 和容器 digest;基础模型与 tokenizer revision;数据集 revision 与转换缓存版本;完整启动脚本和展开参数;分布式拓扑;reward/verifier 版本;每阶段输入输出 checkpoint 校验和. OLMo 3 tokenizer 文档更证明「模型 ID」不是充分条件.7B Think 在阶段交接中出现模板微差,32B 又采用不同身份策略;3.2+ 才形成 dev/eval/release 的清晰分工.`chat_template.jinja` 与 `tokenizer_config.json` 同时存在时,Transformers 优先前者,两份不同步会让人工检查错对象.仓库提供 diff 工具,但执行结果仍应归档.

随机性也跨多个系统:prompt shuffle,vLLM sampling,分布式训练 dropout,环境执行与异步完成顺序.固定一个 seed 不能让异步 RL 逐位复现.更合理的目标是固定数据与版本,记录 rollout 分布和过滤统计,并用多个种子报告统计稳定性.若只能跑单次大实验,则至少保留足够 trace 解释异常跳变. 许可是另一条边界.代码是 Apache 2.0,不代表基础模型,训练数据和输出模型都继承同一许可.README 区分 V1 模型许可,基础模型许可和 V2 的 AI2 ImpACT.将训练脚本用于其他模型时,需要重新核对各资产条款,而不能只引用仓库 LICENSE.

如何审计一条实际配方. 复现最好从某个 `scripts/train/olmo3/*.sh` 开始,README 示例不足以确定完整配置.配方检查需要覆盖基础模型,tokenizer,数据,最大长度,batch 和输出,并追到 Python 入口的参数类与 `dataset_transformation.py` 的渲染,标注和截断逻辑.DPO 还要确认共同 prompt 与 reference,RL 则要确认采样数,奖励组成,优势归一化,陈旧阈值和过滤;启动器构建的镜像与资源拓扑同样属于运行条件. 运行前做三类小测试最划算.抽取真实样本可视化 token 与 labels,确认 system/user 被 mask,assistant 和结束 token 被学习;对同一 prompt 手算 verifier 与聚合 reward,检查总分和指标;再以极小模型跑 checkpoint 恢复和权重同步,观察 model step 陈旧性.它们无法替代大规模训练,却能提前发现最昂贵的语义错误.

Open Instruct 公开了各阶段的连接方式:统一数据转换把消息变成可训练张量,SFT/DPO/RM 提供离线学习,vLLM rollout 与 verifier 构成在线 RL 反馈循环,脚本和容器把它们映射到集群.仓库仍保留了一些研究系统常见的粗糙边界,因此复现实验需要同时固定 tokenizer,数据,奖励,异步策略和环境,单独保存启动命令无法覆盖这些状态.

数据转换中的缓存,来源与可观测性. 数据转换的另一个工程重点是避免在大规模作业启动后才发现坏样本.405B 级别 SFT 若让数十节点等待单进程临时分词,成本极高,因此转换结果通常需要预计算或缓存.缓存键必须包含 tokenizer revision,chat template,最大长度,截断策略和转换代码版本;只按数据集名称缓存会在模板更新后静默复用旧结果.仓库用转换版本号主动失效旧缓存,是务实做法,但实验记录还应保存最终缓存指纹和每个源的行数. `dataset_origin` 等来源字段让混合数据在训练后仍可分解统计.它既可检查某个源是否因超长或模板错误被大量丢弃,也可定位 loss 峰值来自哪个数据源.混合权重描述的是抽样前意图,实际经过过滤,截断和 packing 后的 token 占比才是模型看到的分布.完整报告应同时列出原始样本数,成功转换数,丢弃原因,训练 token 数和有效来源占比.

工具调用数据尤其需要结构验证.messages 中的 tool schema,assistant tool call 与 tool response 必须能配对,序列化格式要与发布 tokenizer 一致.如果转换只把对象转成字符串而不验证调用 ID 和轮次关系,模型会学到无法执行的形式.generation span 需要包含 assistant 生成的序列化调用,却不能把下一轮工具返回纳入损失;这正是区间标注优于「从某个固定前缀以后都算 assistant」的地方.

DPO,GRPO 超参数不能脱离采样分布解释. DPO 的 beta,GRPO 的组大小和采样温度共同决定优化信号尺度.较高温度扩大组内差异,可能提供更多可比较样本,也会增加无效答案;较大组提高相对排序分辨率,却使 rollout 成本线性增长.若 verifier 奖励近似二值,低成功率阶段往往整组全错,高成功率阶段又容易整组全对,两端都会产生零方差.课程式选择题目难度,动态采样或更细奖励可以缓解,但它们会改变目标数据分布,必须明示. 优势标准化还会让同一绝对奖励在不同组中产生不同梯度.某回答在弱组里略好就可能获正优势,在强组里相同得分却为负.这是组相对方法的设计而非 bug,也意味着不能仅用全局平均 reward 推断每步梯度.审计时应抽查每组原始分数,均值,标准差,优势和最终 mask,并确认 padding 与未完成 response 不参与归一化.

KL 控制是在线 RL 的另一安全栏.即使算法不显式训练价值网络,也需要防止 policy 快速偏离初始或参考模型.实际实现可能通过损失中的 reference log-prob,采样约束或其他正则实现;判断必须回到 `grpo_fast.py` 对应配置,不能从「GRPO」名称推断固定公式.报告应写清参考模型是否常驻,多久同步,KL 系数和 token 级 mask,否则不同实现挂着同名算法仍不可比较.

故障恢复与阶段交接. 在线 RL 的 checkpoint 比 SFT 更复杂.仅保存训练权重和优化器,恢复后可以继续更新,却未必能复现中断前的 rollout 队列;旧 worker 可能还在返回由过时 policy 生成的结果.可靠恢复要么丢弃所有飞行中的请求并从明确 step 重建队列,要么把请求 ID,生成 policy step 和消费状态持久化.源码提供陈旧结果判断,能够限制偏差,但运维层仍需保证重启后不会重复消费同一批结果. 阶段交接也需要显式验收.SFT 输出进入 DPO 前,应比较 tokenizer vocab 大小,special token ID,chat template 文件和一次固定对话的渲染结果;DPO 进入 RL 前,还应验证 vLLM 与训练端对同一 token 序列计算一致,确认权重同步没有遗漏新增 embedding.若模型做了 merge,格式转换或参数重命名,应保存转换脚本和转换前后抽样张量校验,而不是只记录最终目录.

评测 checkpoint 的选择不能只看训练 reward.verifier reward 可能过拟合,DPO loss 下降也不保证开放式质量提升.合理流程是在固定,无污染的验证集上同步观察任务成功率,格式,长度,KL 与通用能力;选择规则应在看最终测试集前确定.Open Instruct 把训练产物交给 OLMES 等外部评测,这种分离只有在版本和选择规则都记录时才真正降低自我评估偏差.

从开放代码到开放实验. 开放代码回答「系统可以怎样运行」,开放实验还要回答「这次究竟怎样运行」.后者需要不可变的数据清单,资源账单,失败与重启记录,被过滤样本统计,以及最终模型之外的中间 checkpoint.尤其 RLVR 会持续生成新数据,rollout 本身就是训练集;如果完全不保存或只保存成功样本,外部研究者无法判断能力提升来自策略学习,题目采样还是奖励漏洞. 隐私与安全又限制 trace 的公开程度.可行折中是公开聚合指标,哈希,脱敏样本和可重放的 verifier 测试,同时保留受控访问的完整日志.对代码执行任务,应公开 sandbox 镜像 digest 和测试依赖,不公开危险网络权限或密钥.开放并不要求泄露敏感信息,而要求明确哪些证据可得,哪些经过脱敏,哪些因政策不可发布.

Open Instruct 展示了一条完整的后训练工程因果链:模板决定模型看到的 token,数据筛选决定监督分布,采样策略决定探索范围,verifier 决定可优化目标,异步系统决定策略陈旧度,分布式归一化决定梯度尺度.任何一环变化都可能改变结果.固定提交便于审查实现;模型发布若要支持复现,还需保存整条链的配置和运行记录.

训练阶段关系是一张依赖图. SFT checkpoint 同时是 DPO reference,奖励模型基座候选和 RL 初始 policy.偏好数据可能由某个 SFT 或 DPO policy 生成;RL verifier 又可能使用独立 judge.只画 SFT→DPO→RL 的直线,会隐藏数据生成和参考模型回边. 实验 manifest 应把每个资产写成有向图节点:权重,tokenizer,数据,reference,生成 policy,verifier 与评测配置.边标明「初始化」「生成」「打分」「转换」.这样能定位版本升级影响哪些结果,也能避免把不同谱系混为同一配方. 阶段并非全部必选.可从 SFT 直接 RLVR,也可 SFT 后 DPO 停止,RM 则可独立服务 BoN.比较路线时要对齐最终 token 预算与数据接触,不能把多一个阶段的算力隐去.

### 3.3. Rollout,GRPO 与非平稳目标

离线 SFT 数据在训练前固定,RL 每一步由当前 policy 生成新 response.policy 更新后,答案正确率,长度,错误类型与奖励方差都变化.因此「训练集」必须由 prompt 集,采样配置,policy step 和随机种子共同定义. 保存全部 rollout 成本高,可以保存分层样本,哈希和聚合统计.至少记录每步成功率,长度分位数,终止原因,reward 组成,零方差组和过滤比例.异常出现时才能回到具体输出. 只保存高奖励样本会产生幸存者偏差.失败,超时,sandbox 错误和被丢弃陈旧样本同样决定有效分布.计数漏掉它们,复现者会高估 verifier 覆盖和吞吐.

**GRPO 的组相对优势怎样形成.** 对同一 prompt 的 $G$ 个回答,奖励为 $r_i$,常用优势

$$
A_i=\frac{r_i-\bar r}{s_r+\epsilon}.
$$

同组优势和接近零,因此算法强化相对更好回答,压低相对更差回答.它不要求跨 prompt 奖励尺度完全一致,适合不同难度题目.代价是组内方差决定梯度,全部同分时没有信号. 只中心化而不除标准差,会保留绝对差值;标准化则让低方差组的小差异与高方差组的大差异拥有相近尺度.二者对 verifier 噪声敏感性不同.配置必须与实验结论一起报告. 组大小增加提供更多排序信息,也线性增加生成成本.固定总 rollout 数时,大组意味着更少独立 prompt.应比较 prompt 覆盖与组内探索的权衡,而非只看每组样本越多越好.

零方差过滤会重塑题目难度. 全错组和全对组在二值奖励下都零方差.过滤它们后,训练集中只剩当前 policy 偶尔成功的中等难度题.课程自然形成,却会永久忽略太难与太易 prompt. 随着模型变强,原中等题变成全对并退出,训练自动向困难题移动.若 prompt 池没有足够难题,有效 batch 会缩小;若全错题过多,模型缺少进入成功区域的信号.更细过程奖励或难度采样可缓解. 日志必须把全错和全对分开,而非只报零方差总数.两者对应相反状态.过滤后的领域比例也要看,避免某类题因 verifier 粗糙而消失.

异步陈旧性改变优化目标. rollout 由 step $t-k$ 的 policy 生成,训练时 policy 已到 $t$.当 $k$ 增大,response 在当前策略下概率可能很低,组相对优势不再代表当前采样分布.重要性比可校正一部分,方差又会增加. Open Instruct 记录生成 step 与 off-policy 步数,使陈旧性可观测.最大允许步差是算法参数:阈值严,丢弃多,吞吐下降;阈值宽,数据利用高,偏差增大.只报告异步加速比会遗漏统计代价. 可按陈旧度分桶计算 reward,KL 和梯度贡献.若旧样本质量系统性不同,应调整并发或权重同步频率.恢复训练后飞行队列尤其危险,因为 checkpoint step 与 worker 权重可能不再匹配.

verifier 的确定性需要单独测试. 字符串与数学 verifier 可能依赖规范化,浮点容差,符号化简和超时.相同输出重复运行应给相同奖励;若环境或随机测试使结果波动,组内优势混入测量噪声. 为每类 verifier 建立金样本:等价表达,边界单位,额外文本,错误答案,空输出和恶意输入.代码 verifier 还要测试超时,内存,文件系统和网络隔离.升级依赖后重跑回归集. 确定不等于正确.测试用例覆盖不足会让错误程序通过,字符串规则可能拒绝语义等价答案.人工抽查高奖励新模式,特别是 reward 突然跃升后的输出,是发现漏洞的关键.

多奖励聚合定义真实目标. 验证正确性,格式,长度,工具使用和 rubric 可以加权求和.总奖励

$$
R=\sum_j w_j r_j
$$

看似简单,量纲和范围却不同.二值正确性与连续格式分数直接相加时,权重决定模型是否能用漂亮格式补偿错误答案. 先分别标准化也有风险:稀有但关键的正确奖励可能被压小.更安全的设计可采用门控,答案正确后才计风格奖励;或把关键约束作为硬条件.聚合规则应根据任务损失设计. 训练日志必须保存每项 reward 与相关性.总分上升而 verification 不升,说明模型优化了辅助项.只公开总曲线无法审计 reward hacking.

多轮环境的 credit assignment. 工具任务的最终成功由多步动作共同产生.只给末轮奖励,早期正确调用通过回报传播间接学习,方差大;逐步累加奖励信号密集,也可能鼓励冗长轨迹或重复调用. `last` 与 `sum` 聚合对应两种价值定义.还可对步骤折扣,对成本惩罚,只奖励首次达成.选择必须反映真实任务:搜索次数是否昂贵,部分进展是否有用,失败后继续尝试是否允许. 轨迹截断与环境异常要区分.超出最大步不是普通错误答案;工具不可用也不应归责 policy.rollout state 中的 done,step_count 与 info 为这种分解提供基础.

在线 RL 的 KL 要按 token 与分布解释. KL 惩罚限制当前 policy 相对 reference 的变化.平均 KL 小,少数领域或罕见 token 仍可能剧烈漂移.应按任务,长度和位置分桶,观察 reasoning token,最终答案与工具调用的变化. reference 是固定 SFT 还是周期同步 policy,会改变含义.固定 reference 保持初始行为,移动 reference 只限制单步变化,长期仍可远离起点.配置名称不足以说明,必须追代码和 checkpoint. KL 系数与 reward 尺度耦合.奖励翻倍而 beta 不变,相对约束减半.更换 verifier 或聚合权重后,应重新看实际 KL 与外部能力,不能机械沿用超参.

训练与 rollout tokenizer 必须逐 token 对齐. vLLM 与训练端若加载不同 tokenizer revision,同一字符串可能得到不同 ID.policy log-prob,截断长度和停止条件随后全部错位.新增 special token 而未同步 embedding 更会产生难以发现的异常. 阶段验收可用固定 prompt,分别导出两端 input IDs,decoded text,stop token 与首步 logits.逐项一致后再启动大规模 rollout.只比较最终文本会掩盖特殊 token 差异. chat template 也要在服务端固定.推理引擎自行应用默认模板,而训练端已预渲染,会导致重复 header.接口应明确传 messages 还是 token IDs,避免双重模板化.

分布式 batch 的统计单位. RL 配置里「batch」可能指 prompt,response,序列或 token.每 prompt 多样本后,response 数是 prompt 数乘组大小;过滤与未完成使实际数下降.梯度累积又把多个 microbatch 合成 optimizer step. 比较实验应统一有效 response token 或 optimizer step,而非只看名义 batch.长推理答案使 token 数波动,按序列归一与按 token 归一产生不同权重.各 rank 有效 token 不均时,全局 reduction 更关键. 吞吐报告同时给 prompt/s,response/s,token/s 与有效训练 token/s.只给生成 token/s 不能反映过滤浪费,只给训练 token/s 又隐藏 rollout 瓶颈.

## 4. 训练资产与评测归因

后训练实验由多种资产共同决定: 原始数据,阶段视图,模型权重,verifier,judge,配置和运行环境. 这些对象若只有可变名称而没有不可变版本, 后续结果即使数值接近, 也难以判断是否复现了同一条配方.

归因则要求一次只改变明确变量. 数据消融需要匹配 token 预算, 评测要冻结生成参数与失败处理, 基础设施异常也不能直接记为负奖励. 安全,隐私和许可证贯穿数据与日志, 不能等权重发布时再补检查.
