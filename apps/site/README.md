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

- `NEXT_PUBLIC_SITE_URL`：最终域名，用于 OpenGraph、sitemap 和 RSS；构建时必须设置。

部署平台需应用 `public/_headers` 中的 CORS、安全头和缓存策略。若平台不识别该文件，应把相同规则写入该平台的静态托管配置。
