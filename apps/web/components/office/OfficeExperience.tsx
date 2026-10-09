"use client";

import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, BookOpen, Cpu, Layers, Monitor, Grid2X2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfficeOverlays, cycleDialogFocus } from "./OfficeOverlays";
import { HOTSPOT_META, type OfficeHotspotId } from "./officeContent";
import { OFFICE_VIEWS, type OfficeViewId } from "./officeNav";

const OfficeScene = dynamic(() => import("./OfficeScene").then(m => m.OfficeScene), {
  ssr: false,
  loading: () => <div className="om-workshop-loading" role="status">正在打开 3D 工作室…</div>,
});
const ENTERED_KEY = "oasismind-office-entered";
const VIEWS = ["overview", "desk", "board", "server", "shelf"] as const;
const OBJECTS = [{ id: "monitor", icon: Monitor, label: "工作墙" }, { id: "chalkboard", icon: Layers, label: "架构板" }, { id: "server", icon: Cpu, label: "算力" }, { id: "bookshelf", icon: BookOpen, label: "藏书" }] as const;
function subscribeEntry() { return () => {}; }
function readEntry() { try { return sessionStorage.getItem(ENTERED_KEY) === "1"; } catch { return false; } }

// [OM-FREEPLAY] WebGL 不可用时保留功能入口，不让整页因图形驱动错误变成空白。
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="om-workshop-loading" role="status">当前设备无法打开 3D 场景，请通过下方物件菜单访问工作室功能。</div> : this.props.children; }
}

/** [OM-FREEPLAY] 重写办公室入口与控制台；保留已有内容面板，不显示虚构运行数据。 */
export function OfficeExperience() {
  const storedEntry = useSyncExternalStore(subscribeEntry, readEntry, () => false);
  const [enteredNow, setEnteredNow] = useState(false);
  const [hotspot, setHotspot] = useState<OfficeHotspotId | null>(null);
  // [OM-FREEPLAY] 机位选择是显式镜头指令；重复选择当前机位也能复位，长按漫游键不重复发指令。
  const [view, setView] = useState<{ id: OfficeViewId; revision: number }>({ id: "overview", revision: 0 });
  const viewId = view.id;
  const setViewId = useCallback((id: OfficeViewId) => setView(previous => id === "walk" && previous.id === "walk" ? previous : { id, revision: previous.revision + 1 }), []);
  const objectsRef = useRef<HTMLDialogElement>(null);
  const entered = enteredNow || storedEntry;
  useEffect(() => {
    if (!entered || hotspot) return;
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,[contenteditable=true],dialog,[role=dialog]")) return;
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) { e.preventDefault(); setViewId("walk"); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [entered, hotspot, setViewId]);
  const enter = () => { try { sessionStorage.setItem(ENTERED_KEY, "1"); } catch { /* 当前页仍可进入。 */ } setEnteredNow(true); };

  return <div className="om-office-workshop relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden bg-[#F3F6FA]">
    {!entered ? <div className="om-workshop-entry">
      <div aria-hidden="true" className="om-workshop-emblem"><i /><i /><i /></div>
      <p>见微 · OasisMind</p><h1>研究工作室</h1>
      <p className="om-workshop-entry-copy">在工作台上探索知识、模型与工具。</p>
      <button type="button" onClick={enter}>进入研究工作室 <span aria-hidden="true">→</span></button>
      <Link href="/">返回首页</Link>
    </div> : <>
      <SceneBoundary><OfficeScene onSelect={setHotspot} activeId={hotspot} viewId={viewId} viewRevision={view.revision} /></SceneBoundary>
      <div aria-hidden="true" className="om-office-frame"><i /><i /><i /><i /></div>
      <header className="om-workshop-toolbar">
        <Link href="/" className="om-workshop-home"><ArrowLeft size={15} />首页</Link>
        <nav aria-label="工作室机位" className="om-workshop-views">
          {VIEWS.map(id => <button key={id} type="button" aria-pressed={viewId === id} onClick={() => setViewId(id)}>{OFFICE_VIEWS[id].label}</button>)}
          <button type="button" aria-pressed={viewId === "walk"} onClick={() => setViewId("walk")}>漫游</button>
        </nav>
        <span className="om-workshop-title">见微 / 研究工作室</span>
      </header>
      <nav aria-label="工作室物件" className="om-office-instruments">
        <div className="om-office-station"><span>研究工作室</span><strong>{viewId === "walk" ? "自由漫游" : OFFICE_VIEWS[viewId].label}</strong></div>
        {OBJECTS.map(({ id, icon: Icon, label }) => <button key={id} type="button" aria-label={HOTSPOT_META[id].label} onClick={() => setHotspot(id)} className={cn("om-office-instrument", hotspot === id && "is-selected")}><Icon size={18} /><span>{label}</span></button>)}
        <button type="button" className="om-office-instrument" onClick={() => objectsRef.current?.showModal()}><Grid2X2 size={18} /><span>全部物件</span></button>
      </nav>
      <dialog ref={objectsRef} aria-label="全部工作室物件" className="om-workshop-object-menu" onKeyDown={cycleDialogFocus} onClick={e => { if (e.target === e.currentTarget) objectsRef.current?.close(); }}>
        <header><h2>工作室物件</h2><button type="button" aria-label="关闭物件菜单" onClick={() => objectsRef.current?.close()}><X size={18} /></button></header>
        <div>{(Object.keys(HOTSPOT_META) as OfficeHotspotId[]).map(id => <button key={id} type="button" onClick={() => { objectsRef.current?.close(); setHotspot(id); }}><strong>{HOTSPOT_META[id].label}</strong><span>{HOTSPOT_META[id].hint}</span></button>)}</div>
      </dialog>
      <div className="om-workshop-walkpad" aria-label="漫游方向控制"><span /><WalkKey label="W" /><span /><WalkKey label="A" /><WalkKey label="S" /><WalkKey label="D" /></div>
      <p className="om-workshop-hint">拖拽环顾 · 选择机位 · WASD 漫游</p>
      <OfficeOverlays hotspot={hotspot} onClose={() => setHotspot(null)} />
    </>}
  </div>;
}

function WalkKey({ label }: { label: string }) {
  const fire = (type: "keydown" | "keyup") => window.dispatchEvent(new KeyboardEvent(type, { key: label.toLowerCase(), code: `Key${label}`, bubbles: true }));
  return <button type="button" aria-label={`漫游 ${label}`} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); fire("keydown"); }} onPointerUp={() => fire("keyup")} onPointerCancel={() => fire("keyup")} onLostPointerCapture={() => fire("keyup")}>{label}</button>;
}
