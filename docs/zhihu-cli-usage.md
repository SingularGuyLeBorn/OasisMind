# 知乎 CLI 操作手册

在仓库根目录执行，所有命令形如：

```bash
pnpm --filter @oasismind/server zhihu <命令> [参数...]
```

## 两条通道，别搞混

| 通道 | 负责什么 | 能拿到正文吗 |
|---|---|---|
| **开放平台 API**（你的 Access Secret） | 搜索、热榜、收藏夹清单、回答列表、关注关系 | ❌ 只有 ~1000 字摘要（服务端截断） |
| **网页抓取**（`read_article`，匿名访问知乎网页，不用 key） | `read` / `save` 的完整原文 | ✅ 全文 |

一句话：**开放平台负责"找"，网页抓取负责"读"**。开放平台没有任何"取正文"端点。

## 前提

- 开放平台 key：`.env` 里配置 `ZHIHU_ACCESS_SECRET`（在 https://developer.zhihu.com/ 申请），
  或已加密存入 Credential 保险库（`scope=zhihu_openapi`）。
- 搜索 / 热榜 / 收藏夹 / 回答 / follow-check 只需要开放平台 key。
- `read` / `save` 对**公开可匿名访问**的文章/回答直接可用，无需登录。
- `comments`、查看"登录后可见"的内容需要登录态（Chat 里调 `platform_login(platform=zhihu)`）。

## 命令一览

| 命令 | 作用 | 依赖 |
|---|---|---|
| `status` | 检查 key / Cookie / 登录态是否就绪（不打印密钥） | 无 |
| `search <关键词>` | 开放平台搜索，只返回摘要 | key |
| `read <url>` | 读文章/回答**全文**（网页抓取，分页） | 无（公开内容） |
| `answers <问题url>` | 列出问题的回答摘要 | key |
| `comments <url>` | 列出评论 | 登录态 |
| `follow-check <作者名或url_token ...>` | 检查关注关系 | key |
| `save <url>` | 抓取全文落盘到 Inbox（`data/inbox/raw/zhihu/`） | 无（公开内容） |

## 常用示例

```bash
# 0. 先自检
pnpm --filter @oasismind/server zhihu status

# 1. 搜索
pnpm --filter @oasismind/server zhihu search "DeepSeek" --count 5

# 2. 读全文（长文用 --offset 翻页）
pnpm --filter @oasismind/server zhihu read https://zhuanlan.zhihu.com/p/xxxx [--offset 0] [--maxChars 12000]

# 3. 看问题下的回答
pnpm --filter @oasismind/server zhihu answers https://www.zhihu.com/question/xxxx [--limit 20]

# 4. 看评论
pnpm --filter @oasismind/server zhihu comments https://zhuanlan.zhihu.com/p/xxxx [--order score] [--max 200]

# 5. 收藏到 Inbox
pnpm --filter @oasismind/server zhihu save https://zhuanlan.zhihu.com/p/xxxx [--no-comments] [--maxChars 80000]
```

## 注意事项

- 开放平台搜索**只给摘要**（`ContentText`，服务端截断在 ~1000 字），全文必须 `read`（网页抓取）。
- `read` 成功的标志：返回 JSON 里 `contentTruncated: false` 且无 `nextOffset`；`method` 字段是 `html-to-markdown` 说明走的是网页抓取而非开放平台 API。
- 抓到的正文不要写入 git 仓库。
- 首次运行可能比较慢（tsx 冷启动 + 网络），属正常。
- 如果 `read` 报 `zhihu_storage_state.json` 解析失败：该登录态文件损坏会导致整个知乎抓取器抛异常。
  把 `data/cookies/zhihu_storage_state.json` 改名备份后重试即可（公开内容匿名抓取不需要它）。
