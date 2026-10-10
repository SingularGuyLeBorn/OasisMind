"use client";

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { OFFICE_OBJECT_LABELS, OFFICE_VIEWS, type OfficeHotspotId, type OfficeViewId } from "@oasismind/brand/office-navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { SiteLink } from "./SiteLink";

// 3D 引擎仅在访客明确进入后加载，普通文章的入口包不会下载这一模块。
const OfficeScene = lazy(() => import("@oasismind/brand/office").then(module => ({ default: module.OfficeScene })));
type Garden = { id: string; title: string };
const destinations: Record<string, string[]> = {
  monitor: ["LargeLanguageModelGuide", "Agent", "RetrievalAugmentedGeneration"],
  chalkboard: ["SparseAttention", "DiffusionLanguageModels", "model-library"],
  board: [], server: ["LLMInfrastructure", "LongHorizonTask"], bookshelf: ["ClassicPapers", "StanfordCS336"],
};

// [OM-FREEPLAY] 图形初始化失败时，保留公开知识入口，访客不必依赖 WebGL 阅读。
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="public-office-status" role="status">当前设备无法显示 3D 场景，仍可使用下方知识入口。</p> : this.props.children; }
}

/** 公开办公室仅接收发布清单，不引用本地面板、会话或服务接口。 */
export function PublicOffice({ gardens }: { gardens: Garden[] }) {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<{ id: OfficeViewId; revision: number }>({ id: "overview", revision: 0 });
  const [selected, setSelected] = useState<OfficeHotspotId | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal(); }, [selected]);
  const chooseView = (id: OfficeViewId) => setView(previous => ({ id, revision: previous.revision + 1 }));
  const relevant = selected && destinations[selected]?.length ? gardens.filter(garden => destinations[selected].includes(garden.id)) : gardens;

  return <section className="public-office" aria-label="3D 研究工作室">
    {!entered ? <div className="public-office-entry">
      <p className="section-kicker">见微 · 研究工作室</p><h1>换个视角，<br />走进知识花园。</h1>
      <p>环抱式工作台、架构屏、算力机架与研究档案。拖动视角，点击物件，进入对应的知识库。</p>
      <button type="button" className="primary-button" onClick={() => setEntered(true)}>进入 3D 工作室 <ArrowRight size={18} /></button>
      <SiteLink href="/knowledge" className="text-link">直接浏览知识库 <ArrowRight size={16} /></SiteLink>
      <noscript><p>3D 场景需要启用 JavaScript，知识库阅读不受影响。</p></noscript>
    </div> : <>
      <SceneBoundary><Suspense fallback={<p className="public-office-status" role="status">正在打开 3D 研究工作室…</p>}><OfficeScene onSelect={setSelected} activeId={selected} viewId={view.id} viewRevision={view.revision} /></Suspense></SceneBoundary>
      <header className="public-office-toolbar"><SiteLink href="/" className="public-office-home"><ArrowLeft size={16} />首页</SiteLink><nav aria-label="工作室机位">{Object.entries(OFFICE_VIEWS).map(([id, preset]) => <button type="button" key={id} onClick={() => chooseView(id as OfficeViewId)} aria-pressed={view.id === id}>{preset.label}</button>)}<button type="button" onClick={() => chooseView("walk")} aria-pressed={view.id === "walk"}>漫游</button></nav></header>
      <nav className="public-office-objects" aria-label="工作室物件">{Object.entries(OFFICE_OBJECT_LABELS).map(([id, label]) => <button type="button" key={id} onClick={() => setSelected(id as OfficeHotspotId)}>{label}</button>)}</nav>
      <p className="public-office-hint">{view.id === "walk" ? "WASD 移动 · 拖动改变方向 · 选择机位可复位" : "单指拖动环顾 · 双指缩放 · 点选屏幕进入知识库"}</p>
      <dialog ref={dialog} className="public-office-dialog" aria-label="工作室知识入口" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <header><h2>{selected && selected in OFFICE_OBJECT_LABELS ? OFFICE_OBJECT_LABELS[selected as keyof typeof OFFICE_OBJECT_LABELS] : "知识花园"}</h2><button type="button" aria-label="关闭知识入口" onClick={() => dialog.current?.close()}><X size={20} /></button></header>
        <div>{relevant.map(garden => <SiteLink key={garden.id} href={`/gardens/${encodeURIComponent(garden.id)}`}>{garden.title}<ArrowRight size={16} /></SiteLink>)}</div>
      </dialog>
    </>}
  </section>;
}
