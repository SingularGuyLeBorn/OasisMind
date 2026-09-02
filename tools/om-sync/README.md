# om-sync

OasisMind 内容同步扫描器的 Rust 实现。

## 功能

- 递归扫描目录下的 `.md` 文件
- 解析 YAML frontmatter（title / category / tags / published / excerpt）
- 输出 NDJSON 或 JSON 格式的同步记录
- 跳过 `.`/`_` 开头目录、`images/public/assets/.trash`、`_` 开头文件

## 使用

```bash
# 构建
cargo build --release

# 扫描并输出 NDJSON
./target/release/om-sync scan content/posts --ext .md

# 输出格式化 JSON
./target/release/om-sync scan content/posts --ext .md --format json
```

## 集成

TS 侧通过 `apps/server/src/scripts/sync/rustScan.ts` 调用:

```ts
import { scanWithRust } from "../scripts/sync/rustScan.js";
const records = await scanWithRust("content/posts");
```

## 测试

```bash
cargo test
```

TS 集成测试在 `apps/server/src/__tests__/rustScan.test.ts`。
