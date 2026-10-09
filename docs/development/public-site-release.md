# 公开站发布

## 部署边界

`apps/site` 是公开知识库博客；`apps/web` 与 `apps/server` 是本地 Agent 工作台。公开站只部署 `apps/site/out`，不上传 SQLite、环境变量、Cookie、私人批注、工作空间或 Agent 服务。

部署使用 `.github/workflows/deploy-public-site.yml`，在 `master` 更新公开内容或站点代码时构建，也支持手动触发。构建采用 Node.js 24 与 pnpm 11.9.0。Pages 项目路径由平台提供，文章、资源、搜索、Feed 与 sitemap 共用同一个路径前缀。

## 发布验收

推送前检查工作区、内容链接、公开站 lint/test、生产构建及上传产物。上线后检查 HTTPS 首页、知识库、搜索、文章、公式、图片、JSON/Markdown、Feed、sitemap、404 与桌面/手机视口。部署成功和实际访问成功分别记录。

本地 Agent 工作台不在本次公网部署范围。公开站可供访客与外部 Agent 只读访问，这与具有工具权限的本地 Agent 工作台不同。

## 2026-10-09 首次上线

公开地址：https://singularguyleborn.github.io/OasisMind/

首次成功部署对应 `058404b6a`，Actions 运行 `37879457240`。本地正式路径构建生成 3848 个页面；上传包 45321 个文件、504.0 MiB，经过只读白名单与敏感文本审计。线上公开索引包含 21 个知识库与 1612 篇文章。

公网验收由 `node scripts/verify-public-site-live.cjs` 执行：29 个基础页面及知识库入口、56 篇文章的页面与 JSON/Markdown、21 个 SparseAttention 去重资源均正常。文章样本包含 SparseAttention 全部 36 篇公开正文和其他每个知识库的一篇文章。1280px 与 390px 浏览器实际搜索并打开 MInference，公式无解析错误，图片完整加载，无横向溢出或脚本错误。两张截图保存在本机忽略目录 `data/deployment-checks`。

`/chat`、`/editor`、`/api/trpc`、`/data` 与 `/.env` 在公开站返回 404。Feed、sitemap 和 robots 使用正式 HTTPS 地址。公开站没有本地 Agent 的执行能力。

推送前，全仓 lint/test、两个版本的生产构建通过；本地工作台浏览器 E2E 为 50 项通过、7 项依赖环境条件跳过。SQL 修复在内存 SQLite 中验证语法与重复执行。全部 8301 个 LFS 文件从远程核对可读取，缺失为 0。

Git 用一次不改文件树的合并接回原远程祖先，正常快进推送，没有强推。已合入主线的 `feat/rust-sync` 分支名删除，其历史保留在 master 中。本地及远程只保留 master；原公开站工作树为干净的 detached HEAD，未删除其中的文件。推送前 Git 备份位于 `D:/backup/oasismind-before-publish-20261009.bundle`。

Linux CI 发现一条已有链接的目录大小写错误，`99617be88` 仅将相对链接 `../DeepSeek/deepseek-analysis.md` 修为 `../deepseek/deepseek-analysis.md`，未改动技术论述。

该修正的 Pages 运行 `37880046881` 已完成部署，更新后公网验收再次通过。另逐篇用浏览器检查 SparseAttention 的 36 篇公开正文，未出现公式解析错误、脚本错误或页面横向溢出。

完整 Linux CI 随后发现 Agent 主机路径解析误删 `host:/tmp/...` 的前导斜杠，已修复统一解析入口，并补充显示路径回读、相对路径拒绝与授权根外路径拒绝的回归测试；没有扩大主机授权范围。

实际点击正文链接还发现本地 `.md` 引用未转为公开文章路由。生成器现在先确定公开集合，再统一转换首页与正文的跨库、前向、HTML 和引用式链接，保留查询串及锚点。1612 篇文章及首页中转换了 5787 处链接，1036 个不同目标全部属于公开索引。未公开目标保持未发布，阅读页保留标签文字而不提供失效链接。首页实际引用的两份额外资源也进入了白名单验证，总资源数为 6230。

三篇原有文章因 YAML 错误被发布关口安全跳过：DeepSeek 的 aux-loss-free analysis、model-library 的 Claude Mythos 5 bi 与 Gemini 1.5 analysis。它们未进入公开产物，本次没有改动其发布状态或正文。

## 最终公网复查

Pages 运行 `37881464721` 对应站点源代码 `0611d0c70`，部署成功。最新版公网验收通过：29 个基础页面与知识库入口、57 篇文章、129 个站内文章跳转、21 个去重资源和 3 次浏览器实际阅读/点击检查。OLMo 与 OPD 首页新增进入公开投影的两张图片也分别返回有效 WebP。另对全部 1612 个已发布文章地址检查，均返回正常页面。

上线后曾遇到短暂的网络请求失败与单张图片 HTTP 503；同一图片原地址随后恢复 200，完整公网验收重新执行并通过，没有通过忽略失败或跳过资源获得通过结果。

公开站部署与完整 Agent 验收分开记录：完整 CI 尚未全绿。运行 `37880825990` 的 Linux 单元测试通过，网络冒烟因免费搜索源无结果及 HTTP 429/418 失败；运行 `37881464685` 的单元测试出现 `asyncJobManager.test.ts` 取消/恢复任务条件写失败，其余 1764 项通过。该失败涉及 Agent 任务状态转移，不能用放宽断言或增加延时掩盖。本次只读站没有部署 Agent 执行服务，不依赖这些外部搜索服务。
