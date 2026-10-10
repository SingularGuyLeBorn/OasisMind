"use client";

import { memo } from "react";
import Link from "next/link";
import { Activity, Bot, Brain, Layers, MessageSquare, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const moduleGroups = [
  {
    label: "对话与执行",
    links: [
      { href: "/chat", title: "会话", Icon: MessageSquare },
      { href: "/runs", title: "运行记录", Icon: Activity },
      { href: "/approvals", title: "审批", Icon: ShieldCheck },
    ],
  },
  {
    label: "Agent 的能力",
    links: [
      { href: "/skills", title: "技能", Icon: Layers },
      { href: "/memories", title: "记忆", Icon: Brain },
      { href: "/tools", title: "工具", Icon: Wrench },
    ],
  },
] as const;

/** [OM-FREEPLAY] 空会话保留原有六个真实入口，收掉无任务用途的视角切换与旋转控件，让输入框成为主操作。 */
export const AgentWorkspaceScene = memo(function AgentWorkspaceScene({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={cn("om-agent-station", compact && "om-agent-station--compact")}
      aria-label="Agent 工作台入口"
    >
      <div className="om-agent-station-lens" aria-hidden="true">
        <span className="om-agent-station-lens-core"><Bot size={27} strokeWidth={1.5} /></span>
      </div>
      <div className="om-agent-station-main">
        <p className="om-agent-station-eyebrow">见微 · Agent 工作台</p>
        <nav className="om-agent-station-nav" aria-label="Agent 工作台入口">
          {moduleGroups.map((group) => (
            <div className="om-agent-station-group" key={group.label}>
              <p className="om-agent-station-group-label">{group.label}</p>
              <div className="om-agent-station-group-links">
                {group.links.map(({ href, title, Icon }) => (
                  <Link
                    href={href}
                    prefetch={false}
                    key={href}
                    className="om-agent-station-link"
                    aria-current={compact && href === "/chat" ? "page" : undefined}
                  >
                    <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                    <span>{title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
});
