# 见微公开站

`apps/site` 是与本地业主工作台隔离的纯静态站。它只读取 `public/api/v1/` 中由公开内容生成器产出的白名单数据，不连接 Express、Prisma、tRPC、Agent 或本机文件系统接口。

## 本地运行

在仓库根目录执行：

```bash
pnpm public:content
pnpm --filter @oasismind/site dev
```

生产构建：

```bash
pnpm build:site
```

静态结果位于 `apps/site/out/`。`public/api/v1/` 和 `out/` 都是生成物，不提交 Git。

正文在构建时由共享 Markdown 管线排版为 HTML，缓存于忽略目录 `.reading/`。公开版与本地工作台共用目录树、锚点及公式竖线处理；公开版不挂载编辑器和 Agent。发布阶段移除 Next 客户端路由及 RSC 副本，只给搜索、分页、目录高亮挂载轻量 React 控件。普通文章链接使用原生页面导航。

知识库页显示主题卡片；库首页和文章显示双侧目录，手机目录可以收起。搜索按需读取完整索引，支持多关键词、标题、标签、分类与知识库筛选，每页 24 篇。资源和个人资料分别复用本地的已发布资源与 `content/about/profile.md`。

本机构建后用 `node scripts/verify-public-site-reading.cjs` 验证桌面、手机、无脚本阅读与搜索失败重试。设置 `PUBLIC_SITE_CHECK_URL` 后可验证部署站点。私人划线和评论依赖服务端，不属于静态站写入能力。

## 只读 API

- `/api/v1/index.json`：花园与文章摘要索引。
- `/api/v1/search.json`：客户端/Agent 搜索索引。
- `/api/v1/gardens/{garden}.json`：单个花园及其文章列表。
- `/api/v1/posts/{garden}/{slug}.json`：单篇结构化文章。
- `/api/v1/posts/{garden}/{slug}.md`：单篇 Markdown 正文。
- `/api/v1/assets/{prefix}/{sha256}.{ext}`：内容哈希资源。

静态部署只接受 GET、HEAD 与 OPTIONS。公开站没有文章、评论、批注或 Agent 写接口。

## 部署变量

- `NEXT_PUBLIC_SITE_URL`：含部署路径的完整公开地址，用于 OpenGraph、sitemap 和 RSS。
- `NEXT_PUBLIC_SITE_BASE_PATH`：可选挂载路径。GitHub Pages 项目站为 `/OasisMind`，自定义域名通常为空。

仓库的 `deploy-public-site.yml` 会从 GitHub Pages 自动取得这两个值，生成严格公开投影，
审计最终 `out/`，并且只上传 `apps/site/out`。推送到 `master` 的公开站相关改动会触发部署，
也可以在 Actions 页面手动运行。首次使用前，仓库所有者需要在 Settings → Pages 中把发布源设为
GitHub Actions；工作流不会替用户开启仓库设置或修改 DNS。

在本机模拟默认项目站地址：

```bash
NEXT_PUBLIC_SITE_URL=https://singularguyleborn.github.io/OasisMind \
NEXT_PUBLIC_SITE_BASE_PATH=/OasisMind \
pnpm build:site
pnpm --filter @oasismind/site verify:pages
```

`public/_headers` 供支持该格式的静态托管平台使用。GitHub Pages 不读取该文件；它自己的响应头、
HTTPS 和缓存行为必须在首次公网部署后实测，不能用本机构建结果代替。
