import { KnowledgeSculpture } from "./KnowledgeSculpture";

/** 两个首页共用的阅读展台：原生单选切换，无脚本时也完整可用。 */
export function ReadingShowcase({ id }: { id: string }) {
  // [OM-FREEPLAY] 用同一个问题展示三种阅读视角；这不是文章截图或产品能力承诺。
  const views = [
    { key: "question", label: "从问题出发", heading: "上下文变长，计算花在哪里？", text: "每个位置都与历史位置交互。序列越长，需要计算的注意力分数越多。", detail: "先看计算量，再看哪些交互值得保留。", stamp: "问题与动机" },
    { key: "mechanism", label: "拆开机制", heading: "先选位置，再算注意力。", text: "稀疏注意力用选择规则缩小参与计算的位置集合，随后在选中的位置上计算注意力。", detail: "选择成本、覆盖范围与信息损失，要一起考虑。", stamp: "原理与推导" },
    { key: "evidence", label: "回到证据", heading: "少算了，还能读得准吗？", text: "对比长文问答、检索与真实任务表现，也要观察不同序列长度下的延迟与显存。", detail: "任务质量与系统成本，是两条都要看的轴。", stamp: "实验与比较" },
  ];
  return <div className="om-reading-showcase om-sculpture-interactive">
    <div className="om-showcase-top"><span>一页笔记，三个视角</span><span aria-hidden="true">阅读展台</span></div>
    <fieldset className="om-showcase-views">
      <legend className="om-visually-hidden">切换阅读视角</legend>
      {views.map((view, index) => <input key={view.key} className="om-view-input" type="radio" name={`${id}-view`} id={`${id}-${view.key}`} defaultChecked={index === 0} />)}
      <div className="om-showcase-tabs">{views.map(view => <label key={view.key} htmlFor={`${id}-${view.key}`}>{view.label}</label>)}</div>
      <div className="om-showcase-stage" aria-hidden="true"><div className="om-showcase-orbit" /><KnowledgeSculpture /><span className="om-showcase-note">读论文<br />推公式<br />看实验</span></div>
      {views.map((view, index) => <div key={view.key} className={`om-showcase-page om-showcase-page--${index + 1}`}>
        <small>{view.stamp}</small><h2>{view.heading}</h2><p>{view.text}</p><footer>{view.detail}</footer>
      </div>)}
    </fieldset>
    <div className="om-showcase-bottom"><span>沿着问题，把方法读透。</span><span aria-hidden="true">见微 · 知著</span></div>
  </div>;
}
