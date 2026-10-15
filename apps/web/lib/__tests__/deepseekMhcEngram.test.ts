import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { applySavedLayout, buildGraph, EngramInject, EngramLookup, hasEngram, MhcMix, MhcPost, MhcPre, RmsNormProcess } from "../../../algo-viz/src/compositions/DeepSeekV41Layer";

function render(element: ReactElement) {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(element);
  expect(root.querySelector(".katex-error")).toBeNull();
  const formulas = [...root.querySelectorAll("[aria-label]")].map(el => el.getAttribute("aria-label") ?? "");
  expect(formulas.some(tex => /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(tex))).toBe(false);
  return { root, formulas };
}

describe("mHC 与 Engram 的真实主路径", () => {
  it("40 层均包含两次 mHC 汇合/回写，Engram 只位于 2、15 层且在 Attention 前", () => {
    for (let layer = 1; layer <= 40; layer++) {
      const graph = buildGraph(layer);
      const has = (source: string, target: string) => graph.edges.some(edge => edge.source === source && edge.target === target);
      expect(hasEngram(layer)).toBe(layer === 2 || layer === 15);
      expect(graph.nodes.some(node => node.id === "engram-inject")).toBe(hasEngram(layer));
      expect(has("hc-pre-a", "norm1")).toBe(true);
      expect(has("hc-pre-f", "norm2")).toBe(true);
      expect(has("hc-mix-a", "hc-pre-f")).toBe(true);
      expect(has("hc-mix-a", "add1")).toBe(true);
      expect(has("hc-mix-f", "add2")).toBe(true);
      expect(has("hc-mix-f", "output")).toBe(true);
      expect(has("input", "norm1")).toBe(false);
      expect(has("state1", "norm2")).toBe(false);
      if (hasEngram(layer)) {
        expect(has("tokenizer", "engram-lookup")).toBe(true);
        expect(has("engram-lookup", "engram-inject")).toBe(true);
        expect(has("input", "engram-inject")).toBe(true);
        expect(has("engram-inject", "hc-pre-a")).toBe(true);
        expect(has("engram-inject", "add1")).toBe(true);
      }
    }
  });

  it("四路混合完整展示 4×4 矩阵、20 轮归一化，以及向下一子层传递的 p", () => {
    const { root, formulas } = render(createElement(MhcMix, {layer: 15, sublayer: "A"}));
    expect(formulas.filter(tex => /^c_\{[1-4][1-4]\}$/.test(tex))).toHaveLength(16);
    expect(root.textContent).toContain("共 20 轮");
    expect(root.textContent).toContain("供本层 FFN 汇合使用");
    expect(formulas).toContain("20480\\times24");
    expect(root.querySelector('[data-rmsnorm-dimension="20480"]')).not.toBeNull();
  });

  it("mHC 的联合均方根没有虚构 gamma；Engram 的两侧则分别有 gamma", () => {
    const { root } = render(createElement(RmsNormProcess, {input:"\\mathbf f_t", output:"\\bar{\\mathbf f}_t", dimension:20480, rowCount:"1", label:"mHC"}));
    expect(root.querySelectorAll("[data-rmsnorm-product-arrows]")).toHaveLength(0);
    const injected = render(createElement(EngramInject,{layer:15,phase:"decode"}));
    expect(injected.root.querySelectorAll('[data-rmsnorm-dimension="5120"]')).toHaveLength(2);
    expect(injected.root.querySelectorAll("[data-engram-copy]")).toHaveLength(4);
    expect(injected.root.querySelectorAll('[data-engram-copy] [data-merge-arrows="2"]')).toHaveLength(4);
    expect(injected.formulas).toContain("s_c=\\operatorname{copysign}(\\sqrt{a_c},d_c)");
    expect(injected.formulas).toContain("a_c=\\max(|d_c|,10^{-6})");
  });

  it.each([2,15])("Layer %s 的 2/3/4-gram 与 24 次查表具有正确的维度", layer => {
    const {root,formulas}=render(createElement(EngramLookup,{layer,phase:"decode"}));
    expect(root.querySelectorAll("[data-ngram]")).toHaveLength(3);
    expect(formulas).toContain("6144\\times25600");
    expect(formulas).toContain(`${layer===2?384006168:384016682}\\times256`);
    expect(formulas).toContain(String((layer === 2 ? 384006168 : 384016682) - 1));
    expect(root.textContent).toContain("已缓存的至多 3 个历史 ID");
  });

  it("首层 one-hot 汇合和四路独立回写都有结构", () => {
    const pre=render(createElement(MhcPre,{layer:1,sublayer:"A",count:"N"}));
    expect(pre.formulas).toContain("\\mathbf p=(1,0,0,0)");
    expect(pre.root.querySelector('[data-merge-arrows="4"]')).not.toBeNull();
    const post=render(createElement(MhcPost,{layer:15,sublayer:"F"}));
    expect(post.root.querySelectorAll("[data-mhc-output-copy]")).toHaveLength(4);
    expect(post.root.querySelectorAll('[data-mhc-output-copy] [data-merge-arrows="2"]')).toHaveLength(4);
  });

  it("系数长边使用主流程以外的列，避免穿过宽 Attention 与专家节点", () => {
    const graph = buildGraph(15);
    const nodes = new Map(graph.nodes.map(node => [node.id, node]));
    const right = (id: string) => nodes.get(id)!.position.x + Number(nodes.get(id)!.style!.width);
    for (const id of ["hc-mix-a", "hc-mix-f"]) {
      expect(nodes.get(id)!.position.x).toBeGreaterThan(Math.max(right("heads"), right("experts")));
    }
  });

  it("展开高度由测量推动后续主路径；旧普通残差边不再从保存布局回来", () => {
    const graph=buildGraph(15);
    const expanded=buildGraph(15,new Map([["engram-inject",2300],["hc-mix-a",1200]]));
    expect(expanded.nodes.find(n=>n.id==="norm1")!.position.y-graph.nodes.find(n=>n.id==="norm1")!.position.y).toBe(600);
    const saved={version:8,nodes:graph.nodes.map(n=>({id:n.id,x:n.position.x,y:n.position.y})),edges:[...graph.edges,{id:"input-norm",source:"input",target:"norm1"},{id:"manual-test",source:"input",target:"norm1"}]};
    const restored=applySavedLayout(graph,saved);
    expect(restored.edges.some(e=>e.id==="input-norm")).toBe(false);
    expect(restored.edges.some(e=>e.id==="manual-test")).toBe(true);
    const previous = { ...saved, nodes: saved.nodes.filter(n => !n.id.startsWith("hc-") && !n.id.startsWith("engram-")), edges: saved.edges.map(e => e.id === "state1-add2" ? { ...e, data: { tex: "H'", waypoints: [{ x: 12, y: 12 }] } } : e) };
    const reflowed = applySavedLayout(graph, previous);
    expect(reflowed.edges.find(e => e.id === "state1-add2")).toEqual(graph.edges.find(e => e.id === "state1-add2"));
  });
});
