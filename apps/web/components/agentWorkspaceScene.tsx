"use client";

import { memo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Bot, MessageSquare, Activity, ShieldCheck, Layers, Brain, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  { href: '/chat', title: '会话', Icon: MessageSquare, group: 'dialogue' },
  { href: '/skills', title: '技能', Icon: Layers, group: 'capability' },
  { href: '/memories', title: '记忆', Icon: Brain, group: 'capability' },
  { href: '/runs', title: '运行记录', Icon: Activity, group: 'execution' },
  { href: '/approvals', title: '审批', Icon: ShieldCheck, group: 'execution' },
  { href: '/tools', title: '工具', Icon: Wrench, group: 'capability' },
];
const perspectives = [
  { id: 'dialogue', title: '对话', text: '提出问题、补充资料，在会话中推进任务。' },
  { id: 'execution', title: '执行', text: '查看运行记录，处理需要你确认的审批。' },
  { id: 'capability', title: '能力', text: '配置技能、工具和记忆，让 Agent 更了解你的工作。' },
];

/** [OM-FREEPLAY] 本地 Agent 的空间入口只改变视觉焦点，不代表运行状态或触发任务。 */
export const AgentWorkspaceScene = memo(function AgentWorkspaceScene({ compact = false }: { compact?: boolean }) {
  const [perspective, setPerspective] = useState('dialogue');
  const [rotation, setRotation] = useState(0);
  const view = perspectives.find(item => item.id === perspective)!;
  return <section className={cn('om-agent-station', compact && 'om-agent-station--compact')} aria-label="Agent 立体工作台" data-view={perspective}
    style={{ '--station-turn': `${rotation}deg` } as CSSProperties}>
    <div className="om-agent-station-copy"><p>见微 · Agent 工作空间</p><h2>把想法交给行动。</h2><p className="om-agent-station-description">{view.text}</p>
      <div className="om-agent-station-perspectives" role="group" aria-label="工作台视角">{perspectives.map(item => <button type="button" key={item.id} aria-pressed={perspective === item.id} onClick={() => setPerspective(item.id)}>{item.title}</button>)}</div>
      <label className="om-agent-station-rotation">旋转核心<input type="range" min={-30} max={30} value={rotation} aria-label="工作台核心角度" aria-valuetext={`${rotation} 度`} onChange={event => setRotation(Number(event.currentTarget.value))} /></label>
    </div>
    <div className="om-agent-station-stage">
      <div className="om-agent-station-core" aria-hidden="true"><div className="om-agent-station-ring" /><div className="om-agent-station-ring" /><div className="om-agent-station-ring" />
        <div className="om-agent-station-globe"><div className="om-agent-station-visor"><Bot size={45} strokeWidth={1.2} /></div><i /><i /></div><div className="om-agent-station-base" /></div>
      {/* [OM-FREEPLAY] 不预加载六个管理路由，避免聊天首开连带编译重页面。 */}
      <nav aria-label="Agent 工作台入口">{modules.map(({ href, title, Icon, group }, index) => <Link href={href} prefetch={false} key={href} className={cn('om-agent-station-module', group === perspective && 'is-highlighted')} style={{ '--module-row': index % 3, '--module-side': Math.floor(index / 3) } as CSSProperties}><Icon size={17} strokeWidth={1.5} /><span>{title}</span></Link>)}</nav>
    </div>
  </section>;
});
