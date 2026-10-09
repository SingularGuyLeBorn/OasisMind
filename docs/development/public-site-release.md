# 公开站发布

## 部署边界

`apps/site` 是公开知识库博客；`apps/web` 与 `apps/server` 是本地 Agent 工作台。公开站只部署 `apps/site/out`，不上传 SQLite、环境变量、Cookie、私人批注、工作空间或 Agent 服务。

部署使用 `.github/workflows/deploy-public-site.yml`，在 `master` 更新公开内容或站点代码时构建，也支持手动触发。构建采用 Node.js 24 与 pnpm 11.9.0。Pages 项目路径由平台提供，文章、资源、搜索、Feed 与 sitemap 共用同一个路径前缀。

## 发布验收

推送前检查工作区、内容链接、公开站 lint/test、生产构建及上传产物。上线后检查 HTTPS 首页、知识库、搜索、文章、公式、图片、JSON/Markdown、Feed、sitemap、404 与桌面/手机视口。部署成功和实际访问成功分别记录。

本地 Agent 工作台不在本次公网部署范围。公开站可供访客与外部 Agent 只读访问，这与具有工具权限的本地 Agent 工作台不同。
