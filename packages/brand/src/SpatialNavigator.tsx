"use client";

import type { CSSProperties } from "react";
import { setSpatialRotation } from "./spatialInteractions";

export type SpatialEntry = { title: string; href: string; caption?: string };
const views = [{ key: "shelf", label: "书架" }, { key: "orbit", label: "星环" }, { key: "folio", label: "展页" }];

/** [OM-FREEPLAY] 三种摆放方式是视觉设计，不表示知识之间存在先修或推导关系。 */
export function SpatialNavigator({ id, title, entries, compact = false }: {
  id: string; title: string; entries: SpatialEntry[]; compact?: boolean;
}) {
  // [OM-FREEPLAY] 每个展台最多六个入口，保证手机上标题仍有足够空间。
  const visible = entries.slice(0, 6);
  if (!visible.length) return null;
  const panel = <section className="om-spatial" data-spatial-navigator="true" aria-label={title}>
    <div className="om-spatial-heading"><div><span>见微 · 阅读空间</span><h2>{title}</h2></div><p>换个视角，点标题进入。</p></div>
    <fieldset className="om-spatial-views"><legend>摆放方式</legend>{views.map((view, index) =>
      <label key={view.key}><input type="radio" name={`${id}-spatial-view`} value={view.key} defaultChecked={index === 0} /><span>{view.label}</span></label>)}</fieldset>
    <div className="om-spatial-stage">
      <div className="om-spatial-world">
        <div className="om-spatial-orb" aria-hidden="true"><i /><i /><i /><b /><em /></div>
        <div className="om-spatial-plinth" aria-hidden="true" />
        <nav aria-label={`${title}入口`}>{visible.map((entry, index) =>
          <a className="om-spatial-volume" key={entry.href} href={entry.href} title={entry.title}
            style={{ '--volume': index, '--volume-column': index % 3, '--volume-row': Math.floor(index / 3), '--volume-count': visible.length } as CSSProperties}>
            <span className="om-spatial-spine" aria-hidden="true" /><span className="om-spatial-page-edge" aria-hidden="true" />
            <span className="om-spatial-cover"><small>{String(index + 1).padStart(2, '0')}</small><strong>{entry.title}</strong>{entry.caption && <em>{entry.caption}</em>}</span>
          </a>)}</nav>
      </div>
    </div>
    <label className="om-spatial-turn">旋转视角<input data-spatial-rotation="true" type="range" min={-25} max={25} defaultValue={0} aria-label={`${title}旋转视角`} aria-valuetext="0 度" onInput={event => setSpatialRotation(event.currentTarget)} /><span aria-hidden="true">−25° / +25°</span></label>
  </section>;
  return compact ? <details className="om-spatial-disclosure"><summary>立体阅读导航<span aria-hidden="true">展开</span></summary>{panel}</details> : panel;
}
