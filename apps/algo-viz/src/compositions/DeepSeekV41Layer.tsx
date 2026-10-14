import React, { memo, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import katex from "katex";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";

type LayerMode = "swa" | "full" | "reindex" | "reuse";
type NodeKind =
  | "tensor"
  | "norm1"
  | "projection-q"
  | "projection-k"
  | "projection-v"
  | "cache"
  | "heads"
  | "concat"
  | "skip1"
  | "add1"
  | "state1"
  | "norm2"
  | "router"
  | "experts"
  | "aggregate"
  | "skip2"
  | "add2"
  | "output";

type DiagramData = { kind: NodeKind; layer: number; mode: LayerMode };
type DiagramNode = Node<DiagramData>;
type Props = { initialLayer?: number };

const COLORS = {
  paper: "#f7f5f0",
  card: "#fffefa",
  ink: "#2a2924",
  muted: "#716d63",
  faint: "#a39e92",
  line: "#d9d4c8",
  green: "#37685a",
  greenSoft: "#e6efeb",
  amber: "#a87335",
  amberSoft: "#f4ecdf",
  blue: "#667c96",
  blueSoft: "#e9edf2",
  rose: "#9a625d",
};

const panel: CSSProperties = {
  width: "100%",
  height: "100%",
  border: `2px solid ${COLORS.line}`,
  borderRadius: 16,
  background: COLORS.card,
  color: COLORS.ink,
  boxShadow: "0 7px 20px rgba(42,41,36,.07)",
  overflow: "hidden",
};

const handle: CSSProperties = {
  width: 10,
  height: 10,
  border: `2px solid ${COLORS.card}`,
  background: COLORS.green,
};

function MathFormula({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false }),
    [display, tex],
  );
  return <span aria-label={tex} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Box({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) {
  const color = tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : tone === "blue" ? COLORS.blue : COLORS.line;
  const background = tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : tone === "blue" ? COLORS.blueSoft : COLORS.card;
  return <div style={{ minWidth: 0, border: `1.5px solid ${color}`, borderRadius: 8, padding: "7px 8px", background, textAlign: "center", overflow: "hidden" }}>{children}</div>;
}

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return <span aria-hidden style={{ color: COLORS.faint, fontWeight: 900, textAlign: "center" }}>{vertical ? "↓" : "→"}</span>;
}

function modeForLayer(layer: number): LayerMode {
  if (layer <= 2) return "swa";
  if ([3, 9, 15, 21].includes(layer)) return "full";
  if ([25, 29, 33, 37].includes(layer)) return "reindex";
  return "reuse";
}

function modeLabel(mode: LayerMode) {
  if (mode === "swa") return "SWA-only";
  if (mode === "full") return "Full";
  if (mode === "reindex") return "Reindex";
  return "Reuse";
}

function Title({ children }: { children: ReactNode }) {
  return <div style={{ padding: "10px 14px 9px", borderBottom: `1px solid ${COLORS.line}`, fontSize: 15, fontWeight: 800 }}>{children}</div>;
}

function Matrix({ tex, shape, tone = "blue" }: { tex: string; shape: string; tone?: "blue" | "green" | "amber" }) {
  return (
    <div style={{ border: `1.5px solid ${tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : COLORS.blue}`, borderRadius: 9, overflow: "hidden" }}>
      <div style={{ padding: "6px 9px", background: tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : COLORS.blueSoft, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <MathFormula tex={tex} /><MathFormula tex={shape} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", fontSize: 9.5 }}>
        {["1,1", "1,2", "\\cdots", "1,d", "\\vdots", "2,1", "2,2", "\\cdots", "2,d", "N,d"].map((index, i) => (
          <span key={`${index}-${i}`} style={{ padding: 4, borderTop: `1px solid ${COLORS.line}`, borderLeft: i % 5 ? `1px solid ${COLORS.line}` : undefined, textAlign: "center", color: index.includes("\\") ? COLORS.faint : COLORS.ink }}>
            <MathFormula tex={index.includes("\\") ? index : `{${tex}}_{${index}}`} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Projection({ symbol, weight, shape, local }: { symbol: "Q" | "K" | "V"; weight: string; shape: string; local?: boolean }) {
  return (
    <div style={panel}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle type="source" position={Position.Bottom} style={handle} />
      <Title><MathFormula tex={`${symbol}=X${weight}`} /></Title>
      <div style={{ padding: 10, display: "grid", gap: 7 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}>
          <Box tone="blue"><MathFormula tex="X" /><br /><MathFormula tex="N\times5120" /></Box>
          <Box tone="green"><MathFormula tex="\times" /></Box>
          <Box tone={local ? "green" : "blue"}><MathFormula tex={weight} /><br /><MathFormula tex={shape} /></Box>
        </div>
        <Arrow vertical />
        <Box tone="green"><MathFormula tex={`${symbol}\\in\\mathbb{R}^{N\\times64\\times512}`} /></Box>
        <Arrow vertical />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px 1fr", gap: 5, alignItems: "center" }}>
          <Box><MathFormula tex={`${symbol}_1`} /></Box><Box><MathFormula tex={`${symbol}_2`} /></Box><span style={{ textAlign: "center" }}>⋯</span><Box><MathFormula tex={`${symbol}_{64}`} /></Box>
        </div>
      </div>
    </div>
  );
}

function Head({ index }: { index: number }) {
  return (
    <div style={{ border: `1.5px solid ${COLORS.green}`, borderRadius: 10, padding: 8, display: "grid", gap: 5, background: COLORS.card }}>
      <strong style={{ color: COLORS.green, textAlign: "center", fontSize: 12 }}>Head {index}</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}><Box><MathFormula tex={`Q_${index}`} /></Box><Box><MathFormula tex={`K_${index}`} /></Box></div>
      <Arrow vertical />
      <Box tone="green"><MathFormula tex={`S_${index}=\\operatorname{softmax}(Q_${index}K_${index}^{\\mathsf T}/\\sqrt{d_k})`} /></Box>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}><Box><MathFormula tex={`S_${index}`} /></Box><Box tone="green"><MathFormula tex="\times" /></Box><Box><MathFormula tex={`V_${index}`} /></Box></div>
      <Arrow vertical />
      <Box tone="green"><MathFormula tex={`O_${index}\\in\\mathbb{R}^{N\\times512}`} /></Box>
    </div>
  );
}

function Expert({ index, score, shared = false }: { index?: number; score?: string; shared?: boolean }) {
  return (
    <div style={{ border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 9, padding: 7, display: "grid", gap: 5, background: COLORS.card, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: shared ? COLORS.blue : COLORS.amber, fontWeight: 800, fontSize: 11 }}><span>{shared ? "Shared" : `Expert ${index}`}</span><span>{shared ? "always" : score}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 20px 1fr", gap: 3, alignItems: "center", fontSize: 9.5 }}>
        <div style={{ display: "grid", gap: 3 }}><Box><MathFormula tex="YW^{\mathrm{gate}}" /></Box><Box><MathFormula tex="YW^{\mathrm{up}}" /></Box></div>
        <Box tone="amber"><MathFormula tex="\odot" /></Box>
        <div style={{ display: "grid", gap: 3 }}><Box><MathFormula tex="\operatorname{SiLU}" /></Box><Box><MathFormula tex="\times W^{\mathrm{down}}" /></Box></div>
      </div>
    </div>
  );
}

function DiagramNodeView({ data }: NodeProps<DiagramNode>) {
  const { kind, layer, mode } = data;
  const both = <><Handle type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /></>;

  if (kind === "tensor" || kind === "output") {
    const output = kind === "output";
    return <div style={panel}>{output ? both : <Handle id="main" type="source" position={Position.Bottom} style={handle} />}<Title><MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} /></Title><div style={{ padding: 10 }}><Matrix tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape="N\times5120" tone={output ? "green" : "blue"} /></div></div>;
  }

  if (kind === "norm1" || kind === "norm2") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750 }}>{both}<MathFormula tex={kind === "norm1" ? `X=\\operatorname{RMSNorm}(H_{${layer}}^{\\mathrm{in}};\\gamma_{${layer},1})` : `Y=\\operatorname{RMSNorm}(H_{${layer}}';\\gamma_{${layer},2})`} /></div>;
  }

  if (kind === "projection-q") return <Projection symbol="Q" weight="W^{Q\downarrow}W^{Q\uparrow}" shape="5120\times1280\rightarrow64\times512" />;
  if (kind === "projection-k") return <Projection symbol="K" weight="W^{K,\mathrm{loc}}" shape="5120\times d_{kv}" local />;
  if (kind === "projection-v") return <Projection symbol="V" weight="W^{V,\mathrm{loc}}" shape="5120\times d_{kv}" local />;

  if (kind === "cache") {
    const full = mode === "full";
    return <div style={{ ...panel, borderColor: COLORS.amber }}>{full && <Handle type="target" position={Position.Top} style={handle} />}<Handle type="source" position={Position.Left} style={handle} /><Title>全局 KV · {modeLabel(mode)}</Title><div style={{ padding: 9, display: "grid", gap: 7, fontSize: 11 }}>
      {full && <Box tone="amber"><MathFormula tex="XW^{KV,\mathrm{global}}" /><br />写入 main KV</Box>}
      {mode === "reindex" && <Box tone="amber"><MathFormula tex="XW^{IQ}" /><br />重算 Top-512</Box>}
      {mode === "reuse" && <Box tone="blue">读取最近索引层</Box>}
      <Arrow vertical /><Box tone="green">选中 512 行全局 KV</Box>
    </div></div>;
  }

  if (kind === "heads") {
    return <div style={panel}><Handle id="q" type="target" position={Position.Top} style={{ ...handle, left: "18%" }} /><Handle id="k" type="target" position={Position.Top} style={{ ...handle, left: "50%" }} /><Handle id="v" type="target" position={Position.Top} style={{ ...handle, left: "82%" }} />{mode !== "swa" && <Handle id="global" type="target" position={Position.Right} style={handle} />}<Handle type="source" position={Position.Bottom} style={handle} /><Title>64 个 Head：同号的 <MathFormula tex="Q_h,K_h,V_h" /> 进入同一个头</Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 64px 1fr", gap: 8 }}><Head index={1} /><Head index={2} /><div style={{ display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 26 }}>⋯</div><Head index={64} /></div></div>;
  }

  if (kind === "concat") {
    return <div style={panel}>{both}<Title>Concat：沿特征维拼接，再做输出投影</Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 24px 1.4fr 24px 1fr 24px 1fr", alignItems: "center", gap: 5 }}><Box><MathFormula tex="[O_1\;O_2\;\cdots\;O_{64}]" /></Box><Arrow /><Box tone="green"><MathFormula tex="O_{\mathrm{cat}}\in\mathbb{R}^{N\times(64\cdot512)}" /></Box><Arrow /><Box tone="blue"><MathFormula tex="\times W^O" /></Box><Arrow /><Box tone="green"><MathFormula tex={`O_${layer}`} /></Box></div></div>;
  }

  if (kind === "skip1" || kind === "skip2") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", borderColor: COLORS.amber, background: COLORS.amberSoft, fontSize: 16, fontWeight: 800 }}><Handle type="source" position={Position.Right} style={{ ...handle, background: COLORS.amber }} /><MathFormula tex={kind === "skip1" ? `H_${layer}^{\\mathrm{in}}` : `H_${layer}'`} /></div>;
  }

  if (kind === "add1" || kind === "add2") {
    return <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${COLORS.amber}`, background: COLORS.amberSoft, display: "grid", placeItems: "center", fontSize: 28, color: COLORS.amber, fontWeight: 900 }}><Handle type="target" position={Position.Top} style={handle} /><Handle id="skip" type="target" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /><Handle type="source" position={Position.Bottom} style={handle} />+</div>;
  }

  if (kind === "state1") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}><Handle type="target" position={Position.Top} style={handle} /><Handle id="main" type="source" position={Position.Bottom} style={handle} /><MathFormula tex={`H_${layer}'`} /></div>;
  }

  if (kind === "router") {
    // [OM-FREEPLAY] 分数只展示 Top-6 的排序形态，不代表真实 token 的路由输出。
    const scores = [["7", ".91"], ["31", ".86"], ["96", ".79"], ["142", ".73"], ["228", ".69"], ["351", ".64"]];
    return <div style={panel}>{both}<Title>Router：384 个分数中选择 Top-6</Title><div style={{ padding: 10, display: "grid", gap: 8 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 34px 1fr 34px 1fr", alignItems: "center", gap: 5 }}><Box tone="blue"><MathFormula tex="Y" /></Box><Box tone="green"><MathFormula tex="\times" /></Box><Box><MathFormula tex="W^R" /></Box><Arrow /><Box tone="green"><MathFormula tex="g\in\mathbb{R}^{N\times384}" /></Box></div><div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 5 }}>{scores.slice(0, 3).map(([i, s]) => <Box key={i} tone="amber"><MathFormula tex={`g_{${i}}=${s}`} /></Box>)}<Box>⋯</Box>{scores.slice(3).map(([i, s]) => <Box key={i} tone="amber"><MathFormula tex={`g_{${i}}=${s}`} /></Box>)}<Box>其余 378</Box></div></div></div>;
  }

  if (kind === "experts") {
    return <div style={panel}>{both}<Title><MathFormula tex="Y" /> 分别进入 Shared 与 Top-6 专家</Title><div style={{ padding: 9, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}><Expert shared /><Expert index={7} score=".91" /><Expert index={31} score=".86" /><Expert index={96} score=".79" /><Expert index={142} score=".73" /><Expert index={228} score=".69" /><Expert index={351} score=".64" /><Box>其余专家<br />不执行</Box></div></div>;
  }

  if (kind === "aggregate") {
    return <div style={panel}>{both}<Title>专家输出加权汇合</Title><div style={{ padding: 9, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 42px 1fr", alignItems: "center", gap: 6 }}><Box tone="blue"><MathFormula tex="E_{\mathrm{shared}}(Y)" /></Box><Box tone="amber"><MathFormula tex="g_7E_7(Y)" /></Box><Box tone="amber"><MathFormula tex="\cdots+g_{351}E_{351}(Y)" /></Box><Box tone="green"><MathFormula tex="\sum" /></Box><Box tone="green"><MathFormula tex={`O_${layer}^{\\mathrm{FFN}}`} /></Box></div></div>;
  }

  return <div style={panel}>{both}<Title><MathFormula tex={`H_${layer}^{\\mathrm{out}}`} /></Title></div>;
}

const NodeView = memo(DiagramNodeView);
const nodeTypes = { diagram: NodeView };

function node(id: string, kind: NodeKind, layer: number, mode: LayerMode, x: number, y: number, width: number, height: number): DiagramNode {
  return { id, type: "diagram", position: { x, y }, data: { kind, layer, mode }, style: { width, height }, draggable: false, selectable: false };
}

function buildGraph(layer: number): { nodes: DiagramNode[]; edges: Edge[] } {
  const mode = modeForLayer(layer);
  const nodes: DiagramNode[] = [
    node("input", "tensor", layer, mode, 610, 0, 380, 180),
    node("norm1", "norm1", layer, mode, 620, 235, 360, 72),
    node("q", "projection-q", layer, mode, 80, 385, 400, 310),
    node("k", "projection-k", layer, mode, 600, 385, 400, 310),
    node("v", "projection-v", layer, mode, 1120, 385, 400, 310),
    node("heads", "heads", layer, mode, 240, 805, 1040, 380),
    node("concat", "concat", layer, mode, 350, 1235, 840, 130),
    node("skip1", "skip1", layer, mode, 555, 1445, 145, 70),
    node("add1", "add1", layer, mode, 765, 1445, 70, 70),
    node("state1", "state1", layer, mode, 620, 1580, 360, 72),
    node("norm2", "norm2", layer, mode, 620, 1710, 360, 72),
    node("router", "router", layer, mode, 350, 1845, 900, 190),
    node("experts", "experts", layer, mode, 230, 2110, 1140, 300),
    node("aggregate", "aggregate", layer, mode, 350, 2485, 900, 135),
    node("skip2", "skip2", layer, mode, 555, 2690, 145, 70),
    node("add2", "add2", layer, mode, 765, 2690, 70, 70),
    node("output", "output", layer, mode, 610, 2810, 380, 180),
  ];
  if (mode !== "swa") nodes.push(node("cache", "cache", layer, mode, 1340, 835, 240, 230));

  const makeEdge = (id: string, source: string, target: string, label?: ReactNode, extra?: Partial<Edge>): Edge => ({
    id, source, target, type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.green },
    style: { stroke: COLORS.green, strokeWidth: 2.2 },
    label, labelStyle: { fill: COLORS.muted, fontSize: 12, fontWeight: 700 },
    labelBgStyle: { fill: COLORS.paper, fillOpacity: .96 }, labelBgPadding: [6, 3], labelBgBorderRadius: 5,
    ...extra,
  });
  const mathEdge = (id: string, source: string, target: string, tex: string, extra?: Partial<Edge>) => makeEdge(id, source, target, <MathFormula tex={tex} />, extra);
  const skipStyle: Partial<Edge> = { type: "smoothstep", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.amber } };

  const edges: Edge[] = [
    makeEdge("input-norm", "input", "norm1", undefined, { sourceHandle: "main" }),
    mathEdge("norm-q", "norm1", "q", "X"),
    mathEdge("norm-k", "norm1", "k", "X"),
    mathEdge("norm-v", "norm1", "v", "X"),
    mathEdge("q-heads", "q", "heads", "Q_1,Q_2,\\ldots,Q_{64}", { targetHandle: "q" }),
    mathEdge("k-heads", "k", "heads", "K_1,K_2,\\ldots,K_{64}", { targetHandle: "k" }),
    mathEdge("v-heads", "v", "heads", "V_1,V_2,\\ldots,V_{64}", { targetHandle: "v" }),
    makeEdge("heads-concat", "heads", "concat"),
    mathEdge("concat-add1", "concat", "add1", `O_${layer}`),
    mathEdge("skip1-add1", "skip1", "add1", `H_${layer}^{\\mathrm{in}}`, { targetHandle: "skip", ...skipStyle }),
    makeEdge("add1-state", "add1", "state1"),
    makeEdge("state-norm2", "state1", "norm2", undefined, { sourceHandle: "main" }),
    mathEdge("norm2-router", "norm2", "router", "Y"),
    makeEdge("router-experts", "router", "experts", "Top-6 + Shared"),
    makeEdge("experts-aggregate", "experts", "aggregate"),
    mathEdge("aggregate-add2", "aggregate", "add2", `O_${layer}^{\\mathrm{FFN}}`),
    mathEdge("skip2-add2", "skip2", "add2", `H_${layer}'`, { targetHandle: "skip", ...skipStyle }),
    makeEdge("add2-output", "add2", "output"),
  ];
  if (mode !== "swa") {
    makeEdge("cache-heads", "cache", "heads", undefined, { targetHandle: "global", type: "straight" });
  }
  return { nodes, edges };
}

export const DeepSeekV41Layer: React.FC<Props> = ({ initialLayer = 1 }) => {
  const [layer, setLayer] = useState(() => Math.min(40, Math.max(1, Math.round(initialLayer))));
  const mode = modeForLayer(layer);
  const graph = useMemo(() => buildGraph(layer), [layer]);
  return <div style={{ width: "100%", height: "100%", background: COLORS.paper, fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", inset: "0 0 auto 0", zIndex: 10, minHeight: 122, padding: "18px 22px 14px", background: "rgba(247,245,240,.97)", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 12 }}><div><strong style={{ fontSize: 21 }}>DeepSeek V4.1-Flash · Layer {layer}</strong><span style={{ marginLeft: 12, color: mode === "full" ? COLORS.green : mode === "reindex" ? COLORS.amber : mode === "reuse" ? COLORS.blue : COLORS.rose, fontWeight: 800 }}>{modeLabel(mode)}</span></div><span style={{ color: COLORS.muted, fontSize: 12 }}>拖动画布 · 控件缩放</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(20,1fr)", gap: 4 }}>{Array.from({ length: 40 }, (_, i) => i + 1).map((value) => { const valueMode = modeForLayer(value); const active = value === layer; const color = valueMode === "full" ? COLORS.green : valueMode === "reindex" ? COLORS.amber : valueMode === "reuse" ? COLORS.blue : COLORS.rose; return <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={active} style={{ border: `1px solid ${active ? color : COLORS.line}`, background: active ? color : COLORS.card, color: active ? "white" : color, borderRadius: 5, padding: "4px 0", fontWeight: 750, fontSize: 10.5, cursor: "pointer" }}>{value}</button>; })}</div>
    </div>
    <div style={{ position: "absolute", inset: "122px 0 0" }}><ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: .025, minZoom: .18, maxZoom: 1 }} minZoom={.18} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag zoomOnScroll={false} zoomOnPinch zoomOnDoubleClick preventScrolling={false} proOptions={{ hideAttribution: true }}><Background color="#d7d2c7" gap={28} size={1} /><Controls showInteractive={false} position="top-left" /></ReactFlow></div>
  </div>;
};
