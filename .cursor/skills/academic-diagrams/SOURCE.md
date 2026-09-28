# 来源

- PaperBanana 风格指南副本：`paperbanana-neurips-style.md`
  - 上游：https://github.com/llmsresearch/paperbanana/blob/main/data/guidelines/methodology_style_guide.md
  - 论文：https://arxiv.org/abs/2601.23265 （现官方仓库名 PaperVizAgent：https://github.com/google-research/papervizagent ）
  - 社区 CLI/MCP：https://github.com/llmsresearch/paperbanana （MIT，包免费；图模型 API 另计）
- 融合（2026-08-30）：五角色流程留在本 Skill；Visualizer 换成 Cursor `GenerateImage`。不把 GenerateImage 注册进 Python CLI（它不是 HTTP 图 API）。
- 接线死命令是 OasisMind 叠加，针对 GenerateImage 的连通性失败，不是上游原文。
- 本地 git clone 缓存（不入库）：`.cursor/vendor/paperbanana/`
