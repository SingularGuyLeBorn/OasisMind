# 知乎只读 CLI

见微的知乎入口用于检索、阅读和保存公开内容。它不会关注、点赞、评论或发布，也不会把 Access Secret、Cookie 和浏览器状态写进命令输出。

## 1. 两条数据通道

| 通道 | 用途 | 凭据 |
| --- | --- | --- |
| 知乎开放平台 | 站内搜索、热榜、问题回答、关注列表 | `ZHIHU_ACCESS_SECRET` 或 Credential `zhihu_openapi/access_secret` |
| 本地登录态 | 正文、评论、作者/问题状态、保存到 Inbox | `/channels` / `platform_login` 产生的受控 Cookie；也兼容本机 `ZHIHU_COOKIE` |

站内搜索返回摘要，不是全文。读取正文要用 `read`，保存正文和评论要用 `save`。

开放平台的站内搜索单次最多 10 条，当前不提供下一页。CLI 对 `search --page 2`、`--offset` 或 `--cursor` 直接报错，不会伪造翻页。问题回答接口有真实 Offset / NextOffset，因此 `answers` 支持 `--page`、`--offset` 和 `--cursor`。

## 2. 配置与状态

本机 `.env` 可以配置：

```dotenv
ZHIHU_ACCESS_SECRET=
ZHIHU_COOKIE=
```

Access Secret 也可以保存在见微 Credential 中。Cookie 推荐通过本地登录流程落盘，不要复制到命令行参数、聊天或截图。

检查状态：

```bash
pnpm zhihu -- status
pnpm zhihu -- status --json
```

`status` 只显示是否配置、Cookie 数量和浏览器状态文件名，不显示具体值。没有 `DATABASE_URL` 时，只要 Secret 位于 env，搜索和问题回答仍可运行；`status` 也始终可以运行。

## 3. 搜索与高赞内容

普通搜索：

```bash
pnpm zhihu -- search "AI Agent"
pnpm zhihu -- search "AI Agent" --json
```

筛出本页高赞文章：

```bash
pnpm zhihu -- search "AI Agent" --type article --sort votes --min-votes 100
```

排序字段：

| 值 | 含义 |
| --- | --- |
| `relevance` | 保留开放平台排名；有 `RankingScore` 时按该值 |
| `votes` | 赞同数从高到低 |
| `comments` | 评论数从高到低 |
| `time` | 发布时间或编辑时间从新到旧 |

类型可用 `article`、`answer`、`question`、`pin` 或 `all`。多个类型用逗号分隔。

```bash
pnpm zhihu -- search "大模型" --type article,answer --sort comments
```

## 4. 热榜与置顶语义

`hot` 读取知乎开放平台热榜，`top` 是同一个命令的别名：

```bash
pnpm zhihu -- hot --limit 10
pnpm zhihu -- top --limit 10 --json
```

搜索结果偶尔会带 `IsTop` / `IsPinned` 一类字段，这时可以用 `--pinned-only`。如果本次响应没有置顶字段，CLI 会明确报错并提示改用 `hot/top`，不会把排名靠前偷偷解释成“置顶”。

## 5. 话题和标签

`--tag` / `--topic` 把话题词加入官方搜索 Query，适合日常按话题查找：

```bash
pnpm zhihu -- search "推理优化" --tag 大语言模型 --tag AI系统
```

`--require-tag` 对响应里的 `Tags` / `Topics` 元数据做严格过滤：

```bash
pnpm zhihu -- search "智能体" --require-tag AI Agent --tag-mode all
```

开放平台的搜索响应不保证返回标签。如果本次结果没有标签元数据，严格过滤会报错，并提示改用 `--tag`。这比用标题或摘要冒充标签可靠。

## 6. 组合筛选

列表命令支持这些条件：

```text
--author <作者名或 url_token>
--question <问题 id 或 URL>
--query <页内关键词>
--from YYYY-MM-DD
--to YYYY-MM-DD
--min-votes <数量>
--follow any|only|exclude
```

示例：

```bash
pnpm zhihu -- search "Agent" --type answer --question 123456 --author 张三 --from 2025-01-01 --to 2026-12-31 --sort votes
```

`--follow only` 只保留已关注作者，`--follow exclude` 只保留确认未关注的作者。CLI 会分页读取关注列表后再判断。扫描达到 `--max-followees` 仍未结束时，“未命中”保持未知；`exclude` 会中止并要求提高上限，避免把未知误判为未关注。

## 7. 指定问题的回答

问题参数可以是纯数字 id，也可以是问题或回答 URL：

```bash
pnpm zhihu -- answers 123456 --limit 20
pnpm zhihu -- answers "https://www.zhihu.com/question/123456" --page 2 --limit 20
pnpm zhihu -- answers 123456 --cursor 40 --sort comments --json
```

`--page N` 转换为 `(N - 1) × limit` 的 Offset。平台返回的 `Paging.NextOffset` 原样放在 JSON 的 `pagination.nextCursor`，脚本应优先使用它继续翻页。

## 8. 正文、评论与保存

读取正文：

```bash
pnpm zhihu -- read "https://zhuanlan.zhihu.com/p/123"
pnpm zhihu -- read "https://zhuanlan.zhihu.com/p/123" --offset 12000 --max-chars 12000 --json
pnpm zhihu -- read "https://zhuanlan.zhihu.com/p/123" --meta-only
```

读取评论：

```bash
pnpm zhihu -- comments "https://www.zhihu.com/question/1/answer/2" --order score
pnpm zhihu -- comments "https://zhuanlan.zhihu.com/p/123" --order reverse --max-comments 500 --json
```

保存到本地 Inbox：

```bash
pnpm zhihu -- save "https://zhuanlan.zhihu.com/p/123"
pnpm zhihu -- save "https://zhuanlan.zhihu.com/p/123" --no-comments --json
```

`save` 是唯一会写本地状态的命令。它写入 `data/inbox/raw/zhihu/` 和 Inbox 数据库，不修改 `content/`，也不对知乎执行外部写操作。

## 9. 输出结构

默认输出适合终端阅读。列表命令显示表格，并在表格下保留完整 URL。`--json` 返回稳定结构：

```json
{
  "ok": true,
  "schemaVersion": 1,
  "command": "search",
  "pagination": {
    "limit": 10,
    "page": 1,
    "hasMore": false
  },
  "items": [
    {
      "contentType": "article",
      "id": "123",
      "title": "标题",
      "summary": "摘要",
      "author": { "name": "作者", "urlToken": "author-token" },
      "question": { "id": null, "title": null },
      "voteCount": 100,
      "commentCount": 10,
      "publishedAt": "2026-01-01T00:00:00.000Z",
      "followed": null,
      "tags": [],
      "url": "https://zhuanlan.zhihu.com/p/123"
    }
  ]
}
```

`followed: null` 表示没有执行关注扫描，或扫描没有完整结束。它不等于未关注。

## 10. 超时、错误与退出码

所有网络命令支持 `--timeout 1000..120000`，单位为毫秒。该超时会传入开放平台、正文读取、根评论与子评论请求。

| 退出码 | 含义 |
| --- | --- |
| `0` | 成功 |
| `2` | 命令或参数错误、接口不支持该组合 |
| `3` | 缺少 Access Secret、Cookie 或数据库配置 |
| `4` | 网络错误或超时 |
| `5` | 平台鉴权、限流、风控或接口拒绝 |
| `6` | 本地运行或保存失败 |

JSON 模式的错误写入 stderr：

```json
{"ok":false,"schemaVersion":1,"command":"search","error":{"code":"OPENAPI_SECRET_REQUIRED","message":"..."}}
```

错误文本会遮住 Bearer、Cookie、Secret 和 token 形态。CLI 不打印请求头，也不把凭据写入命令历史。

## 11. 回归和只读烟测

离线测试：

```bash
pnpm --filter @oasismind/server exec vitest run src/__tests__/zhihuCli.test.ts src/__tests__/zhihuQuery.test.ts src/__tests__/zhihuOpenApi.test.ts src/__tests__/zhihuWebApi.test.ts src/__tests__/zhihuWebTools.test.ts
```

有真实凭据时，依次执行：

```bash
pnpm zhihu -- search "AI Agent" --type article --sort votes --json
pnpm zhihu -- answers <问题id> --sort comments --json
pnpm zhihu -- search "AI Agent" --follow only --json
pnpm zhihu -- search "AI Agent" --tag 人工智能 --json
```

这些命令都是只读请求。真实烟测不要运行任何关注、点赞、评论或发布工具。

官方文档入口：<https://developer.zhihu.com/docs>。
