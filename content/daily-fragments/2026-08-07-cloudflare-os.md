---
title: 每日碎片：Cloudflare OS 开源速记
category: 每日碎片
published: true
excerpt: >-
  Cloudflare 8月5日开源 Cloudflare OS（Apache 2.0）：面向组织的 AI 工作平台，agent workspace +
  Gatekeeper 治理 + 可修改 app；不集成但借鉴其零权限/能力绑定/确定性工作流思想。
tags:
  - 每日碎片
  - AI平台
  - Cloudflare
  - Agent
---
# 每日碎片：Cloudflare OS 开源速记

> 时间：2026-08（8月5日开源）；来源：官方博客 blog.cloudflare.com/cloudflare-os、Slashdot、GitHub cloudflare/cloudflare-os（Apache 2.0）

## 一句话
Cloudflare OS 不是传统操作系统，而是面向组织的 AI 工作平台框架：给公司里每个人配一个 agent workspace，用公司策展的上下文与技能干活。

## 三个组成部分
1. Agent workspace：浏览器对话，隔离运行时（agent 可写代码跑代码），加载公司沉淀的 skills/context
2. 安全治理框架（Gatekeepers）：agent 默认零权限，访问内部数据需申请；Gatekeeper 是服务专属 Worker，控制"能看哪个仓库、读 issues 但看不到源码、字段打码、限流"
3. 可修改的 app 平台：对话可变成文档/应用/工作流，持续连接实时数据

## 技术要点
- 跑在 Cloudflare Workers（Dynamic Worker）上，支持 MCP Server
- 代码能力绑定：env.PROJECT 是带策略的类型化权限，凭据与代码完全隔离
- 内部已用：5月起 Cloudflare 全员可用，数千人每天用

## 对我们项目的借鉴（不集成，抄思想）
1. 默认零权限 + 显式授予：agent 默认啥都碰不到，用的时候才授权；run_shell 可参考"能力绑定"而非裸权限
2. 确定性工作流省钱：固定步骤写成代码，只在需要判断处调模型，控制 token 成本
3. Skills/Context 共享方向一致：我们的 skill_manage + memory 体系思路已被验证
4. 未来可关注 MCP 协议，接外部系统

## 链接
- https://blog.cloudflare.com/cloudflare-os
- https://github.com/cloudflare/cloudflare-os
- https://news.slashdot.org/story/26/08/05/164212/
