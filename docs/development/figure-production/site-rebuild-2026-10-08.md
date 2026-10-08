# 当前修订的公开站构建检查

本轮重新执行 `pnpm.cmd build:site`, 不使用先前生成页面作为最新修订的证明.

首次在公开内容生成结束后的目录替换处失败:Windows EPERM, `v1.tmp-45392` 重命名为 `v1` 失败. 进程明确结束后重试, 第二次完整构建退出码0. 未为此修改构建代码或知识库正文.

第二次结果:21个花园、1611篇文章、6216个本地资源;9461个公开产物文件通过只读白名单验证;3847个静态页面生成完成;12个HTTP契约检查通过. HTTP契约示例使用Agent首页, 不代表每篇文章都经浏览器检查.

单独检查最新SDTT公开Markdown:图片URL转换为公开资源路径后, 正文与当前源文件一致. 几何平均例子0.7101与尾部桶误差0.5300均进入新HTML, 没有KaTeX错误标记. RAG最小基线二级首页与对照实验三级主题的公开Markdown与源正文一致, 两条新HTML路径均存在. 这些检查确认导出内容和路径, 尚未确认新公式在桌面或移动端的视觉排版.

构建仍跳过3篇frontmatter无效的文章:

- DeepSeek/2-架构与算法/2.1-aux-loss-free/02-aux-loss-free-analysis.md:excerpt中反斜杠被YAML视为无效转义.
- model-library/03-模型家族/08-claude/claude-mythos-5/claude-mythos-5-bi.md:title中的冒号未正确引用.
- model-library/03-模型家族/11-gemini/gemini-1-5/gemini-1-5-analysis.md:title中的冒号未正确引用.

上述正文处于用户要求保持不动的范围, 本轮未修改. 因此构建成功不代表全站全部文章已发布或所有frontmatter已通过. 十个重点知识库的逐篇配图审查、剩余目录问题和实际页面验收仍继续.
