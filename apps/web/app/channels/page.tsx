"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, Trash2 } from "lucide-react";
import { AdminPage, EmptyState } from "@/components/shared";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function ChannelsPage() {
  const statusQ = trpc.channel.status.useQuery(undefined, { refetchInterval: 5_000 });
  const bindingsQ = trpc.channel.listBindings.useQuery(undefined, { refetchInterval: 10_000 });
  const deleteMut = trpc.channel.deleteBinding.useMutation({
    onSuccess: () => {
      bindingsQ.refetch().catch(catchUnlessCancelled("channel.bindings.refetch"));
    },
  });
  const simMut = trpc.channel.simulateInbound.useMutation({
    onSuccess: () => {
      statusQ.refetch().catch(catchUnlessCancelled("channel.status.refetch"));
      bindingsQ.refetch().catch(catchUnlessCancelled("channel.bindings.refetch"));
    },
  });
  const [peerId, setPeerId] = useState("debug-user");
  const [text, setText] = useState("你好，这是一条模拟 QQ 消息");
  const channel = "qq" as const;

  const adapters = statusQ.data?.adapters ?? [];
  const bindings = bindingsQ.data?.items ?? [];
  const defaultQqAgent = statusQ.data?.defaultQqAgent ?? null;

  return (
    <AdminPage>
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--kp-text-1)]">IM 通道</h1>
        <p className="mt-0.5 text-xs text-[var(--kp-text-3)]">
          手机 QQ / 飞书指挥家里 Agent：入站归一化后进 ChatSession / SessionStreamHub。
        </p>
        {defaultQqAgent ? (
          <p className="mt-1 text-xs text-[var(--kp-text-2)]">
            官方 QQ Bot 默认 Agent：{" "}
            <Link className="font-medium text-[var(--kp-brand-deep)] underline" href="/agents">
              {defaultQqAgent.name}
            </Link>
            <span className="text-[var(--kp-text-3)]">
              {" "}
              · {defaultQqAgent.sourceSlug || "—"} · {defaultQqAgent.model || "—"}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-amber-700">
            未找到 sourceSlug=qq-bot 的 Agent：请确认 <code>config/agents/qq-bot.md</code> 已{" "}
            <code>pnpm db:sync</code>。
          </p>
        )}
      </header>
      <div className="mb-4 rounded-xl border border-[var(--kp-border)] bg-[var(--kp-surface)] p-4 text-sm text-[var(--kp-text-2)]">
        <p className="font-medium text-[var(--kp-text-1)]">手机 QQ 指挥家里 Agent（官方 Bot）</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
          <li>
            在{" "}
            <a
              className="underline text-[var(--kp-brand-deep)]"
              href="https://q.qq.com/"
              target="_blank"
              rel="noreferrer"
            >
              q.qq.com
            </a>{" "}
            创建机器人，勾选<strong>单聊</strong>能力，复制 AppID / AppSecret
          </li>
          <li>
            根目录 <code>.env</code> 填写 <code>QQ_BOT_APP_ID</code>、<code>QQ_BOT_SECRET</code>
          </li>
          <li>
            家里推荐：<code>QQ_BOT_WS=true</code>（本机出站连官方网关，无需公网）。有隧道时可用 webhook{" "}
            <code>/api/webhooks/qq</code>（<code>pnpm remote</code>）
          </li>
          <li>
            用户白名单 <code>QQ_BOT_ALLOWED_OPENIDS</code>：空 = 拒所有人；填自己的 openid（被拒看{" "}
            <code>rejectedUser=…</code>）
          </li>
          <li>
            群白名单 <code>QQ_BOT_ALLOWED_GROUPS</code>：空 ={" "}
            <strong>不接群聊</strong>；填群 openid 后 = 仅「白名单用户在该群 @ 机器人」才回复（被拒看{" "}
            <code>rejectedGroup=…</code>）。平台本身只推 @ 事件。
          </li>
          <li>
            重启 server → 下方适配器状态为 connected → 本页「模拟入站」通 → 手机 QQ 私聊该机器人验证
          </li>
          <li>
            账号白名单 = <code>QQ_BOT_ALLOWED_OPENIDS</code>（你的 openid）。本页 Bot
            标注「暂不支持群聊」时群能力不可用，与见微白名单无关。
          </li>
          <li>
            NapCat/OneBot 已退役，不再拉起 QQ、不再发掉线邮件。
          </li>
        </ol>
        <p className="mt-3 text-xs text-[var(--kp-text-3)]">
          同步 Agent：改完 <code>config/agents/qq-bot.md</code> 后执行 <code>pnpm db:sync</code>。
            对话侧栏切到 Workspace「QQ 远程指挥 Workspace」即可看到 Agent「QQ 远程指挥助手」。
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {adapters.map((a) => (
          <div
            key={a.channel}
            className={cn(
              "rounded-xl border p-4",
              a.enabled
                ? "border-[var(--kp-brand)]/40 bg-[var(--kp-brand-soft)]"
                : "border-[var(--kp-border)] bg-[var(--kp-surface)]",
            )}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--kp-text-1)]">
              <Radio className="h-4 w-4" />
              {a.name}
            </div>
            <p className="mt-2 text-xs text-[var(--kp-text-3)]">
              {a.enabled ? "已启用" : "未启用"} · 状态 {a.state}
              {a.detail ? ` · ${a.detail}` : ""}
            </p>
            {a.lastError ? (
              <p className="mt-1 text-xs text-red-600">{a.lastError}</p>
            ) : null}
          </div>
        ))}
        {adapters.length === 0 ? (
          <EmptyState title="通道未启动" description="重启 server 后此处显示 QQ 适配器状态。" />
        ) : null}
      </div>

      <div className="mb-6 rounded-xl border border-[var(--kp-border)] bg-[var(--kp-surface)] p-4">
        <p className="text-sm font-medium text-[var(--kp-text-1)]">模拟入站（调试）</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="rounded-md border border-[var(--kp-border)] px-2 py-1.5 text-sm text-[var(--kp-text-3)]">
            qq
          </span>
          <input
            className="flex-1 rounded-md border border-[var(--kp-border)] bg-transparent px-2 py-1.5 text-sm"
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
            placeholder="peerId"
          />
        </div>
        <textarea
          className="mt-2 w-full rounded-md border border-[var(--kp-border)] bg-transparent px-2 py-1.5 text-sm"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 rounded-md bg-[var(--kp-brand)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
          disabled={simMut.isPending || !text.trim()}
          onClick={() => simMut.mutate({ channel, peerId, text })}
        >
          {simMut.isPending ? "发送中…" : "注入 MessageGateway"}
        </button>
        {simMut.data ? (
          <p className="mt-2 text-xs text-[var(--kp-text-3)]">
            结果：{JSON.stringify(simMut.data)}
            {"sessionId" in simMut.data && simMut.data.sessionId ? (
              <>
                {" "}
                <Link className="text-[var(--kp-brand-deep)] underline" href={`/chat?session=${simMut.data.sessionId}`}>
                  打开会话
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
        {simMut.error ? (
          <p className="mt-2 text-xs text-red-600">{simMut.error.message}</p>
        ) : null}
      </div>

      <h2 className="mb-2 text-sm font-semibold text-[var(--kp-text-1)]">绑定列表</h2>
      {bindings.length === 0 ? (
        <EmptyState title="暂无绑定" description="收到第一条 QQ 消息或模拟入站后会出现。" />
      ) : (
        <ul className="divide-y divide-[var(--kp-border)] rounded-xl border border-[var(--kp-border)] bg-[var(--kp-surface)]">
          {bindings.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--kp-text-1)]">
                  {b.channel} · {b.peerId}
                  {b.chatId ? ` · 群 ${b.chatId}` : ""}
                </p>
                <p className="truncate text-xs text-[var(--kp-text-3)]">
                  Agent：{" "}
                  {b.agentName ? (
                    <Link className="underline" href={`/agents`}>
                      {b.agentName}
                    </Link>
                  ) : (
                    <span className="font-mono">{b.agentId}</span>
                  )}
                  {" · "}
                  {b.title || "—"} ·{" "}
                  <Link className="underline" href={`/chat?session=${b.sessionId}`}>
                    会话
                  </Link>
                </p>
              </div>
              <button
                type="button"
                title="删除绑定"
                className="rounded-md p-1.5 text-[var(--kp-text-3)] hover:bg-[var(--kp-bg-mute)] hover:text-red-600"
                onClick={() => deleteMut.mutate({ id: b.id })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
