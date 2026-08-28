# PRD:Inbox 页蒸馏 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:Inbox 管理页勾选 → `inbox.distill` → `post_create` 成文。不含 Chat 里 Agent 调 `inbox_distill` 的话术（那条已有 mock 场景）。

## 1. 背景与目标

- 问题:Inbox 是素材队列，用户要把选中条目变成知识库文章，且刷新后状态仍在。
- 目标:勾选蒸馏后得到 Post；来源 URL 保留在正文；状态 `distilled`；开着的 Inbox 页自己更新。
- 已放弃:蒸馏调用 LLM 改写（当前直接 formatInboxItemBody + post_create）；`write_file` 直写 `content/posts`。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 蒸馏 | 将 Inbox 条目写成一篇 Post 并标记 distilled | 发布、同步、导入 |
| 待消化 | status=fetched | 未处理、新条目 |
| 已成文 | status=distilled 且有 distilledPostId | 已发布（Post 默认可为未发布草稿） |

### 2.2 核心实体概念卡

**InboxItem**
- 构成:`id`(cuid)、`status` ∈ {fetched, distilled, ignored}、`distilledPostId`、`title`、`url`、`content`、`source`
- 产生者:capture/同步/截图；消费者:列表页、distill
- 生命周期:fetched → distilled \| ignored；删除只去队列，不动已成文 Post
- 展示规则:中文「待消化 / 已成文 / 已忽略」；已蒸馏可有「已蒸馏」pill

**蒸馏结果**
- 构成:`{ distilled: [{inboxId, postId, title, path?}], errors: string[], garden }`
- 默认 `published=false`（schema）；花园默认 `knowledge`（可覆盖）
- 展示规则:整次 mutation 成功 toast **「蒸馏完成」**（runAction 模板 `${label}完成`）；失败「蒸馏失败: …」

### 2.3 事件/消息协议(全量枚举)

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `inbox.distill` | 批量蒸馏 | ids 1–30、garden、published | 点「蒸馏」 |
| `inbox_updated` | PUSH 列表/统计 | reason=`distilled` | distill 写点后 notifyInboxUpdated |
| `post.create` | 写 Markdown+DB | title/slug/content | 每条 fetched 成功路径 |
| list/stats/facets invalidate | 前端 PULL/订阅 | — | onSuccess + SSE/BroadcastChannel |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| 未勾选 | selectedIds 空 | 按钮 disabled，不发请求 |
| 已忽略 | status=ignored | errors 含「已忽略，跳过」 |
| 幽灵 id | DB 无此行 | 不进 distilled、不进 errors（静默省略） |
| ids 空数组 | schema | tRPC 校验失败，不写库 |
| post.create 失败（含 slug 占用） | 该条失败 | errors 含 inboxId 与原因；该条 status 不变 |
| 整次抛错 | mutation throw | toast「蒸馏失败: …」 |

## 3. 完成判据

- AC-1:未勾选时蒸馏按钮 disabled
- AC-2:fetched 条目蒸馏成功 → status=distilled、distilledPostId 有值、正文含来源 URL（若有 url）
- AC-3:已蒸馏且已有 distilledPostId → 幂等返回该 postId，不新建第二篇
- AC-4:ignored 跳过并记 errors，不改其 status
- AC-5:写点后 PUSH `inbox_updated`；刷新后 list/getById 仍是 distilled

## 4. 可观测状态清单

| 变量 | 权属 | 来源/公式 | 展示规则 | 生命周期 |
|---|---|---|---|---|
| `selectedIds` | 前端 | 勾选 Set | 按钮「蒸馏 (N)」 | 成功后清空 |
| `busy` | 前端 | runAction | 钮上转圈 | 请求期间 |
| `item.status` | 后端 | DB | 待消化/已成文/已忽略 | 条目存活 |
| `distilledPostId` | 后端 | DB | 已蒸馏 pill | 蒸馏成功后 |
| toast | 前端 | runAction | 「蒸馏完成」/失败原因 | 短暂 |
| stats.fetched | 后端 | count | 顶栏待消化 | PUSH/PULL |

## 5. 状态机 + 状态×事件表

**状态维度**:条目 status × 是否在 selectedIds × 是否存在 distilledPostId

| # | 状态 | 事件 | 状态迁移 + 可见值变化 + 副作用 |
|---|---|---|---|
| R1 | 未勾选 | 点蒸馏 | 无请求（disabled） |
| R2 | fetched 已勾选 | distill 成功 | post_create；status=distilled；PUSH inbox_updated；toast 蒸馏完成；清空勾选 |
| R3 | ignored | distill 含该 id | 跳过；errors 记一条；不建 Post |
| R4 | distilled 且有 distilledPostId | 再 distill | 幂等：distilled[] 带回原 postId；post 总数不 +1 |
| R5 | 幽灵 cuid（库中无行） | distill | 省略；errors 不含该 id |
| R6 | ids=[] | schema.parse | 拒绝；不写库 |
| R7 | 混合批次（fetched+ignored+幽灵） | distill | 成功条 distilled；ignored 进 errors；幽灵省略 |
| R8 | fetched 但 post.create 抛错 | 该条失败 | errors 有因；该条仍 fetched |
| R9 | 已蒸馏 | 刷新 / getById | 仍 distilled + 同一 distilledPostId |
| R10 | 蒸馏 mutation 抛错 | runAction catch | toast 失败；busy 清除；已成功的其它条以 DB 为准 |
| R11 | 开着 Inbox 页 | 其它标签蒸馏成功 | inbox_updated → invalidate 列表/统计（PUSH） |
| R12 | 默认 published | 页上不传 published | Zod 默认 false：未发布草稿，本地仍可打开编辑 |

必须覆盖的通用行:
- [x] 请求失败:R8/R10
- [x] 乱序:后到的 inbox_updated 只 invalidate，以 list 为准
- [x] 幽灵:R5
- [x] 取消:busy 期间钮 disabled；本期无「取消蒸馏」中途 API
- [x] 断连:失败 toast；不假装成功
- [x] 刷新:R9

## 6. 不变量

- INV-D1:ignored 永不因 distill 变成 distilled。机制:R3 continue
- INV-D2:同一 inboxId 在已有 distilledPostId 时蒸馏幂等。机制:R4 短路，不调 post_create
- INV-D3:幽灵 id 不创造条目、不记假错误。机制:findMany 缺行即省略
- INV-D4:写库后必 notifyInboxUpdated。机制:distill 末尾；推送失败不回滚写库
- INV-D5:文章走 post_create，禁止 write_file 直写知识库

## 7. 非功能规则

- 单次最多 30 条（schema）
- toast 随 AnimatePresence；成功文案锁定「蒸馏完成」
- 列表对进行中同步另有短 refetch；蒸馏本身靠 PUSH + mutation onSuccess invalidate

## 8. 黄金轨迹(≤5 条)

- **GT-1 页上勾选蒸馏**:搜到条目 → 点选 → 蒸馏 → 「蒸馏完成」→ 打开文章含来源 URL（E2E `scenario-product-gaps-mock`）
- **GT-2 未勾选**:蒸馏钮 disabled
- **GT-3 再蒸馏幂等**:第二次 distilled 长度 1 且 postId 相同
- **GT-4 忽略跳过**:ignored 不进 distilled

## 9. 边界

- 不做:蒸馏时 LLM 改写；真知乎/B 站登录；取消进行中的 distill HTTP
- 不许碰:post_create 同步管道；三桶写入纪律
- 隐含假设:单用户；花园 knowledge 已存在

## 10. 冲突取舍

不丢已成文 > 再点一次再造一篇；PUSH 失败不回滚已写库（以 DB/Markdown 为准，刷新可拉）。

## 11. 验收方式

| 章节 | 测试手段 |
|---|---|
| 第 5 节 | `inboxDistill.test.ts`（mock 不需要事件乱序注入：本 API 无逐条 SSE） |
| 第 6 节 | 同文件幂等/忽略断言 |
| GT-1 | Playwright mock Inbox 页 |
| 性能 AC | 本期不做 |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 从 InboxService.distill + 页编译；R4 收成幂等（原 slug 冲突失败） |
