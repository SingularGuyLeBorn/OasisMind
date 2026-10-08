# dParallel 平均置信度原图

- 正式图: `content/DiffusionLanguageModels/5-训练-后训练与迁移/5.2-少步与轨迹蒸馏/images/fig-dparallel-confidence-original-v1.png`.
- 来源: [arXiv 2509.26488v1](https://arxiv.org/pdf/2509.26488v1), PDF 第 9 页 Figure 5. 实际查看同页图注、正文及第 16 页 Figure 6 后选择双面板 Figure 5, 避免十六面板缩至正文宽度后标签过小.
- 原 PDF SHA256: `a47ce4d964ef15de9229abf1a8f5a7234e4553797a2213ab09a6021010d1d5b1`.
- 提取方式: PyMuPDF 从零基页索引 `8` 渲染, 页面坐标裁切范围 `Rect(106,78,495,172)`, 缩放 `Matrix(3,3)`, 输出 `1167×282` PNG. 未改曲线、颜色、坐标轴或标签, 未估读或重建实验数据.
- 图片类型: 论文原始实验结果, 不经过生图, 无生图提示词. 机制教学图另见 `dparallel-training-gate.md`.
- 查看结果: 修正首次裁切导致的左侧纵轴截断后, 重新查看输出, 两侧轴标签、图例、刻度及面板说明完整. 本轮尚未在站内正文显示尺寸验收, 因而只完成源图内容与完整性检查.
- 正文解释: 第 8、16 步的逐位置平均置信度, 三条曲线代表基座、置信度阈值与 dParallel. 平均曲线不等于逐样本提交边界或联合正确率. 正文中将 Figure 5、6 误称热图的描述同步修正.

## 实际文章显示检查

静态服务端口3003当前监听进程为34904. 实际访问导出的 dParallel 文章返回HTTP 200, 两图均在页面中完成解码. 训练门控图源尺寸1536×1024, 曲线图1167×282;1280px视口中实际显示800×533和800×193, 390px视口中显示362×241和362×87.

四张截图已逐张实际查看, 保存为 `dparallel-site-gate-desktop.png`、`dparallel-site-confidence-desktop.png`、`dparallel-site-gate-mobile.png`、`dparallel-site-confidence-mobile.png`. 桌面曲线图轴标签、刻度和两个面板完整, 训练图的活动位置与双损失分支可辨. 手机缩略图可以辨认整体流向, 细公式、曲线刻度及图例需放大, 不按手机免缩放阅读验收通过. 训练图门控分支的长标签较拥挤, 后续版面修订应缩短标签或拆分细节, 不以图像成功加载替代最终可读性审查.
