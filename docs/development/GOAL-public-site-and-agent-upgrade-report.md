# 公开站与 Agent 能力改造验收记录

> 验收日期：2026-10-05
>
> 施工目录：`D:\ALL IN AI\OasisMind-public-site-worktree`
>
> 分支：`codex/public-site-split`

## 当前结论

本次 Goal 的代码、离线测试、本机运行时和页面验收已经完成。唯一尚不能取得的证据，是知乎开放平台的真实关键词搜索、问题回答、关注过滤和标签过滤：本机没有 `ZHIHU_ACCESS_SECRET`，现有 `zhihu_storage_state.json` 也不是有效 JSON。CLI 与离线 fixture 已通过，真实只读文章抓取已通过，但在有效凭据补齐前，Goal 不标记完成。

QQ 和微信同样没有配置真实凭据，因此平台探测命令能正确报告“未配置”，不会伪造连通结果。五类附件的双向适配、幂等、失败重试和回传链路由严格 mock 与本机实物截图验证。

## 最终边界

```text
本地业主工作台
  Markdown / YAML 事实源
  ├─ 文章编辑、AI、Agent、审批和自动化
  ├─ content/.private/annotations（私人批注）
  ├─ QQ / 微信适配器与受控本机访问
  └─ 知乎只读 CLI
            │
            │ public:content 严格白名单生成
            ▼
公开内容产物
  ├─ api/v1/index.json / search.json
  ├─ 单篇 JSON / Markdown
  └─ 按哈希去重的引用资源
            │
            ▼
apps/site 纯静态公开站
  首页 / 知识库 / 花园 / 文章 / 搜索 / About / 404
  只有 GET / HEAD / OPTIONS，不包含本地 tRPC、编辑器或 Agent
```

本地完整项目和公开站不是一套页面靠按钮显隐，而是两个构建、两个运行边界。公开站只消费生成产物，不连接 Express、Prisma、SQLite 或本机文件系统。

## Goal 对照

| 部分 | 落地结果 | 主要证据 |
|---|---|---|
| 发布安全 | 新文章统一默认草稿；YAML 仅接受布尔 `true`；损坏 frontmatter 安全跳过；资源做白名单、路径校验、哈希去重和陈旧产物清理 | `publicContentBuilder` 5 个安全测试；真实知识库生成成功 |
| 私人批注 | 独立 YAML 事实源；高亮、下划线、波浪线和评论；刷新水合；修改样式；失配显式提示；公开产物隔离 | Service 6 个测试、锚点纯函数测试、`post-annotation.spec.ts` 浏览器闭环 |
| 公开个人站 | 新增独立 `apps/site`；保留亮色、留白和品牌视觉；公开 API、RSS、sitemap、robots、OG 与缓存头完整 | 单独 lint/test/build；真实浏览器检查首页和文章页 |
| 旧博客收拢 | 删除重复 `/blog` 页面和匿名留言模型/接口；本地 `/posts` 成为唯一业主文章工作台 | 全仓调用方同步删除；构建和 E2E 通过 |
| QQ / 微信 | 入站和出站统一五类附件；受控存储、MIME/哈希/大小校验；传输台账、幂等和重试；能力矩阵与探测 CLI | 通道单元/集成测试；`pnpm channel:probe --json` |
| 远程本机查看 | 网页可视区、网页全页、桌面和指定窗口四种截图；结果可直接形成通道图片附件 | example.com、Windows 桌面和记事本窗口实机烟测 |
| 知乎 CLI | status/search/hot/answers/read/comments/follow-check/save；人类表格与 JSON；排序、过滤、分页、超时、退出码和脱敏统一 | 40 个相关测试；真实文章只读成功；开放平台真实组合查询待凭据 |
| 代码质量 | 各域收拢到既有入口；新增模块说明事实源、权限和失败语义；清理过期 E2E 与 lint 告警 | `pnpm lint` 零告警；主题化提交 |

## 公开内容真实构建

2026-10-05 对当前 worktree 的知识库执行 `pnpm public:content`：

- 16 个公开花园；
- 1368 篇公开文章；
- 6153 个本地引用资源；
- `apps/site/public/` 共 8908 个文件，329,194,905 字节；
- 静态构建生成 3346 个页面；
- `apps/site/out/` 共 40,179 个文件，451,520,871 字节。

发布关口发现 5 个内容问题并安全跳过，没有修改用户文章：

1. `continual-learning/_garden.md` 的 YAML 映射不完整；
2. `deepseek-vl-analysis.md` 的 frontmatter 含未知转义；
3. `aux-loss-free-analysis.md` 的 frontmatter 含未知转义；
4. `claude-mythos-5-bi.md` 的标题未正确引用；
5. `gemini-1-5-analysis.md` 的标题未正确引用。

这些警告证明损坏内容不会被正则猜测成已发布。根据 Goal 边界，本次不批量修改正在编辑的 `content/`。

## 页面与权限验收

公开站用真实浏览器检查：

- 首页保持白底、蓝色品牌强调、大留白和现有字体层级；
- 首页没有按钮式编辑能力，DOM 中没有 `contenteditable`、文章输入框或本地写接口引用；
- 文章页没有编辑、发布、删除、评论、私人批注或 AI 解释入口；
- 文章页没有 `3010`、`api/trpc` 或本机文章接口引用；
- 单篇 JSON 与 Markdown 只读入口可见；
- 静态文章成品可正确渲染标题、目录、标签和正文。

本地业主工作台用隔离数据库和隔离内容目录检查：

- 选中正文后出现高亮、下划线、波浪线和 AI 解释工具条；
- 批注弹窗明确显示“永久保存”；
- 保存后正文立即出现划线，侧栏立即出现笔记；
- 刷新后批注数量和评论仍在；
- 批注 YAML 位于 `.test-content-e2e/.private/annotations/`；
- 同一评论在 `apps/site/out/` 中搜索不到；
- 正文删除引文后，侧栏显示“正文已变化，暂未定位”；
- 样式和评论可修改，批注可删除。

## 通道和截图验收

统一附件覆盖 `text`、`image`、`video`、`audio`、`file`。QQ 与微信都经过同一附件事实模型，再由平台适配器处理平台差异。发送台账以通道、目标、消息和附件哈希形成幂等键，失败状态可查询并安全重试。

本机实测结果：

| 模式 | 实测对象 | 结果 |
|---|---|---|
| `web_viewport` | `example.com`，900×600 | 40,488 字节 PNG，ready |
| `desktop` | Windows 桌面，2560×1440 | 658,063 字节 PNG，ready |
| `window` | 记事本窗口，883×715 | 635,577 字节 PNG，ready，并做视觉检查 |

当前通道探测如实返回：QQ 缺 `QQ_BOT_APP_ID` / `QQ_BOT_SECRET` 且白名单为空；微信尚未扫码绑定。探测退出码为非零，防止自动化把“未配置”当成功。

## 知乎 CLI 验收

CLI 的结构化结果统一包含：类型、id、标题/摘要、作者、问题、赞同、评论、时间、关注状态、标签、URL、排序分数、权威度和置顶状态。关注过滤只在状态确知时生效，`unknown` 不会被错误当作“未关注”。

已完成：

- 40 个查询模型、参数、排序、过滤、错误和脱敏测试；
- `read https://zhuanlan.zhihu.com/p/348594600` 真实只读烟测成功；
- 抓取正文 482 字，方法为 `readability-js`，未命中登录墙；
- 非法组合、缺凭据、超时和登录状态损坏均返回稳定非零退出码；
- Cookie、Secret 和 Authorization 不写日志。

待外部条件：

- 配置有效 `ZHIHU_ACCESS_SECRET`；
- 重新生成有效的 `zhihu_storage_state.json`。

补齐后应依次执行真实只读 smoke：关键词搜索、指定问题回答、赞同/评论/时间排序、only/exclude 关注过滤、标签搜索与严格标签过滤。不得执行关注、点赞、评论或发布。

## 验证记录

最终在 2026-10-05 从 worktree 根目录执行 `pnpm validate`，命令以退出码 0 完成。该命令连续完成内容检查、全仓 lint、全仓测试、工作台与公开站生产构建，以及浏览器端到端测试；不是把不同时间的分项结果拼成“通过”。

验收结果：

- `pnpm content:check`：通过；
- `pnpm lint`：通过，零告警；
- `pnpm test`：所有 workspace 通过；服务端 256 个测试文件、1745 个测试在首次全量运行中通过；
- `pnpm build`：工作台 41 个页面、公开站 3346 个页面构建成功；
- `pnpm test:e2e`：50 通过、7 个按环境条件跳过；
- `post-annotation.spec.ts`：1 通过；
- 知乎相关测试：40 通过。

真实 LLM、OCR、真实平台和知乎开放平台用例在缺少对应本机凭据时跳过或返回“未配置”，不会用宽松 mock 冒充真实联调。

## 提交切片

- `c4b7d82f5`：文章发布默认草稿；
- `6f6b05533`：严格公开内容生成关口；
- `1075ec589`、`19e00121b`：永久私人批注和完整浏览器闭环；
- `baaa0bf57`：独立只读个人站；
- `bb38b7bc4`：移除重复博客与匿名留言；
- `92a82f385`、`06704e192`、`1414dd42a`：统一多模态通道、幂等传输和体检入口；
- `5d5b6c3e2`：网页、桌面和窗口截图回传；
- `ba9aa3644`、`e6d783a36`：知乎统一查询模型与完整 CLI；
- `a67f6a94a`：修复 E2E 空库初始化和过期契约；
- `a21171e50`：清理 Web 验收代码静态告警。

## 未触碰范围

- 原工作区 `D:\ALL IN AI\OasisMind-full-clone` 没有被修改；
- 没有合并或格式化用户正在编辑的内容；
- 没有提交生成目录、SQLite、Cookie、密钥、截图或 E2E 临时文件；
- 没有推送远程分支，也没有改 Git 配置。
