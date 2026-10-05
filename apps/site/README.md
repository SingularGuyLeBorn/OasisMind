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
