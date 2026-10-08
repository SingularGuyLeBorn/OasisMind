# H2O 正文与驱逐配图审查

## 实际覆盖

全文阅读 `content/SparseAttention/3-KV选择/3.1-KV读取与驱逐/3.1.2-H2O缓存驱逐.md`, 包括前180行与其余正文. 初读时没有图片, 本轮新增展开累计分数、recent边界与victim的状态教学图, 重用正文容量6的手算, 不增加新实验数字. 不能由内容检查通过推断无需新增图片.

## 对照材料与修正

- 实际打开NeurIPS 2023会议PDF, 查看Table 1及Table 2的文本. 来源: https://proceedings.neurips.cc/paper_files/paper/2023/file/6ceefa7b15572587b78ecfcebb2827f8-Paper-Conference.pdf . Table 1的PiQA为Full 80.09、Local 57.94、H2O 79.22, COPA为81.00、56.00、85.00. 正文原来把两列口径合并, 已拆开说明.
- 实际打开官方 `h2o_hf/utils_real_drop/modify_llama.py` 中缓存更新与attention forward代码. 来源: https://github.com/FMInference/H2O/blob/main/h2o_hf/utils_real_drop/modify_llama.py . 当前K/V在QK前拼接, softmax后累计分数并裁剪返回cache, 当步AV使用裁剪前value. 本轮是源码阅读, 没有运行CUDA实现.
- 统一状态: D_t是当前步追加后的临候选, C_t是驱逐后保留集合. 当前输入位置自身可见, 分数包含自身当步权重. 删除质量诊断也改为对当前D_t取补集.
- GQA每个query head的softmax总质量均为1, 删除“平坦head总质量更多”的错误暗示. 聚合方案仍属于适配讨论, 不将它当作官方实现已验证行为.
- 分数乘正缩放只保持当下排序, 未同步缩放后续增量会改变历史与新贡献的比例. 与文章后段数值讨论统一.
- 删除6节段落中遗留的7至12伪编号, 保留机制内容与合法章节层级. Quest比较改为候选内计算、稠密输出近似.

## 待制图对象

容量B=6, heavy=3、recent=3. 第10步结束位置[1,3,5,8,9,10], 分数[2.4,1.7,1.2,0.3,0.2,0]. 追加位置11后当步候选7项;权重[0.20,0.05,0.02,0.08,0.15,0.30,0.20]总和1. 更新分数[2.60,1.75,1.22,0.38,0.35,0.30,0.20]. recent变为[9,10,11];位置8失去保护, 在[1,3,5,8]中最低, 驱逐后返回[1,3,5,9,10,11]. 图要区分当前输出使用7项与下一步cache保留6项. 这些为教学数值, 非论文实验.

## 生成与视觉验收

会议PDF实际下载至忽略目录data/sources/h2o/h2o-neurips2023.pdf, SHA256为FF4BA98E426219871231E0950DD644E6D1887231B4305950AA6A3A863E5213FD. 用PyMuPDF渲染第6页以及Figure 3高清局部, 逐张查看source-page6.png和source-figure3.png. 原图的跨步累积与不可恢复删除作为机制来源;当步计算与返回cache的对象顺序同时由已读官方实现确定.

SciFig用于规划对象与两份状态, 内置ImageGen实际生成候选;接口无法指定或确认Image 2.5版本. prompt-v1.md通过接口实际传入source-figure3.png. candidate-v1.png数字和状态集合正确, 中间位置8的Recent标签仍易误解, 用prompt-v2.md局部替换为移出窗口. candidate-v2.png回读全部分数、权重总和、recent边界、原始位置、K/V配对、当步7项输出和下一步6项状态, 通过后复制到content/SparseAttention/3-KV选择/images/h2o-eviction-state-v2.png. verify.cjs可复算. 不将原图的数字当作本教学示例的实验结果.

Chrome等宽图片预览按800px和390px截图并实际查看. 800px下主要标签与数字可读, 390px下小公式需要放大, 图注提供原尺寸入口. 这两张预览不是实际文章路由截图. 当前只完成H2O状态教学图, 不能代表SparseAttention其他文章完成. 人工回读新增图注与解析;指定shuorenhua目录缺失, 采用现有humanizer-zh轻量回读, 保留术语、数字和公式.

## 实际文章页面

本轮pnpm build:site退出0: 21个花园、1611篇文章、6219个资源, 9464个白名单文件验证通过, 3847个静态页面与12个HTTP导出契约通过. 保留范围外既有的三篇YAML警告: DeepSeek aux-loss-free analysis, model-library Claude Mythos bi与Gemini1.5 analysis;未修改这些正文或frontmatter.

通过本地静态服务器实际打开H2O与Quest文章, 不只查看文件或独立图片. preview-site.cjs按1280和390视口截图, 四张site-h2o/quest-1280/390.png实际逐张查看. 桌面图片显示宽度799.98px, 手机361.98px, 两图自然宽度1536px, 资源均HTTP200且decode完成. 图片由公开投影转换为哈希命名WebP, 以alt定位而不依赖原PNG文件名. 桌面主状态与数字可读, 图片没有裁切或遮挡;手机图面小字需原尺寸查看, 入口同时验证HTTP200. 简单静态服务器的部分Next预取RSC路径返回404, 不将此预览视为完整客户端导航验收, 此次实际文章和图片请求均成功.

另已全文阅读3-KV选择章首页与3.1路线首页. 两页目前没有配图, 且存在重复“精确attention”表述、路线首页正文未编号等问题, 下一切片统一候选内归一化表述与编号, 再判断状态比较图. 本次不将它们标记为无需新增或完成.
