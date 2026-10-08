# 索引器配图页面验收

公开站重新构建成功，12 个 HTTP 导出契约通过。首次生成目录替换遇到 EPERM，确认该构建已终止后重新执行，第二次完整构建通过；未删除正文、原图或其他工作树。

实际 Chrome 无界面检查 1280 与 390 像素视口。文章、配图资源及原尺寸链接均返回 200；页面宽度分别为 1280、390，无横向溢出；图片自然宽度 1536，显示宽度约 800、362。两张截图已经实际查看：桌面主要路径可辨，手机需要打开原尺寸阅读细小公式和表格，原尺寸链接可访问。

检查时图片与正文关系正确，导出图注为「图：」；随后源稿改为「图注：」以满足仓库图注检查。这一标点前缀变化尚未重新导出，下一次全站构建同步；不影响已核验的图像与链接。

搜索按 docs/zhihu-cli-usage.md 使用配置的开放平台。ResMiSA 与 MISA 查询没有找到准确匹配；LISA indexer 查询找到 HISA 长文，实际读取正文并继续读取 offset 16000，后者为空。二手材料包含把 DSA 归于 DeepSeek-V2、不同速度长度混用等问题，未照搬；可用线索是池化 key 只用于筛块、最终仍按原 token 分数精排，并回到 arXiv:2603.28458v1 §4 核对。原抓取正文未入 Git。相关机制已有正文覆盖，本次不为融合来源重复添加段落。

构建报告范围外三篇 YAML 无效并按未发布跳过：DeepSeek/2-架构与算法/2.1-aux-loss-free/02-aux-loss-free-analysis.md，model-library/03-模型家族/08-claude/claude-mythos-5/claude-mythos-5-bi.md，model-library/03-模型家族/11-gemini/gemini-1-5/gemini-1-5-analysis.md。遵守跳过 DeepSeek 正文与不改 model-library 的边界，未修改；最终部署清单须保留此项。

当前 SparseAttention 位图 24 份，zero / bad_magic / partial_zero_head / wrong_ext 均为 0。全库内容五项检查、SparseAttention 图注检查、改动文本 NUL 与 diff 检查通过。此项是索引器文章切片验收，不代表 SparseAttention 全库或远程部署完成。
