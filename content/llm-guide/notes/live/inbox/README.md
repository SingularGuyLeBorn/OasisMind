---
title: 子代理 inbox（路径租约附属）
date: 2026-08-30
published: false
---

# inbox

每个并行切片最多占用本目录下一个文件：`<切片ID>.md`。

子代理只写**自己的**那一份（来源 URL + 改了哪些路径）。监工回收后把内容合并进 `PROCESS.md`，然后删掉或清空该 inbox 文件。

禁止在此目录抢写别人的 `<切片ID>.md`。禁止直接改 `GOAL.md` / `PLAN.md` / `PROCESS.md`。
