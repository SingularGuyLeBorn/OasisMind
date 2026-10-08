# 静态拓扑图核查

正文完整分段回读，修正投影成本量纲、窗口排列对中间表示的影响与因果 sink 的作用。旧图仅画无向连接，未展开掩码、层更新与 causal 约束，保留旧资产但替换正文引用。

机制来源为 Longformer v2 §3.1：https://arxiv.org/html/2004.05150v2 。本图为八位置教学构造，不声称是论文 Figure 2 的逐项重绘。矩阵行表示 query 读取 key；下方箭头则表示信息从 key 表示进入下一层 query 表示。

v1 总数虽然显示正确，右侧矩阵四个单元格的具体位置错误。保留候选，使用内置生图局部修改为 v2；接口不能指定或确认 Image 2.5 版本。v2 逐格采样核对 192 个单元格，并复算窗口边数、32 层感受野与正文配对数。完整提示词见 sparse-static-prompt.md，计算见 sparse-static-verify.py。

已查看原图，连线端点、下标、两层顺序与因果禁边可读。

首次构建完成页面生成后因 Windows EBUSY 导出失败；重试构建成功、12 项 HTTP 导出契约通过，但实际文章返回 404。查明此篇 frontmatter 缺少 published，公开投影按未发布跳过。仅为这篇已完成的技术文章补 published: true 后重新完整构建，退出码 0：21 个花园、1612 篇文章、6226 个资源、9473 个白名单文件与 3848 个静态页面；12 项 HTTP 契约通过。其他草稿未公开。

实际 Chrome 1280px 与 390px 检查均通过：文章、图片、原尺寸链接 HTTP 200，图片成功解码；自然宽度 1536px，正文显示宽度分别约 800px 和 362px。两张实际页面截图已查看，无页面横向溢出，KaTeX 错误节点 0，正文包含修正后的 131041。手机缩略图小字仍需打开原尺寸查看，不称全部标签在手机缩略状态可读。检查脚本 sparse-static-site.cjs，截图 sparse-static-site-1280.png、sparse-static-site-390.png。

保留范围外的三个构建警告：DeepSeek aux-loss-free analysis、model-library Claude Mythos bi 与 Gemini 1.5 analysis 的 YAML 无效，未修改这些文件。上述本地页面验收不代表云端已部署或全库配图审查结束。
