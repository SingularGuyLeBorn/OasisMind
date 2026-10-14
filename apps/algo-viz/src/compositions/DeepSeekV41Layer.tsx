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
type DiagramVariant =
  | "tensor"
  | "norm1"
  | "projection"
  | "global-cache"
  | "attention"
  | "residual1"
  | "norm2"
  | "router"
  | "experts"
  | "residual2"
  | "output";

type DiagramData = {
  variant: DiagramVariant;
  layer: number;
  mode: LayerMode;
};

type DiagramNode = Node<DiagramData>;

type Props = {
  initialLayer?: number;
};

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
  roseSoft: "#f2e6e3",
};

const panelStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: `2px solid ${COLORS.line}`,
  borderRadius: 18,
  background: COLORS.card,
  color: COLORS.ink,
  boxShadow: "0 8px 24px rgba(42, 41, 36, 0.08)",
  overflow: "hidden",
};

const titleStyle: CSSProperties = {
  padding: "13px 18px 11px",
  borderBottom: `1px solid ${COLORS.line}`,
  fontSize: 17,
  fontWeight: 760,
  letterSpacing: ".02em",
};

const handleStyle: CSSProperties = {
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

function modeForLayer(layer: number): LayerMode {
  if (layer <= 2) return "swa";
  if (layer === 3 || layer === 9 || layer === 15 || layer === 21) return "full";
  if (layer === 25 || layer === 29 || layer === 33 || layer === 37) return "reindex";
  return "reuse";
}

function modeLabel(mode: LayerMode): string {
  if (mode === "swa") return "SWA-only";
  if (mode === "full") return "Full";
  if (mode === "reindex") return "Reindex";
  return "Reuse";
}

function MatrixGrid({
  name,
  shape,
  rows = ["1", "2", "\\vdots", "N"],
  columns = ["1", "2", "3", "\\cdots", "5120"],
  tone = "green",
}: {
  name: string;
  shape: string;
  rows?: string[];
  columns?: string[];
  tone?: "green" | "amber" | "blue" | "rose";
}) {
  const color = tone === "amber" ? COLORS.amber : tone === "blue" ? COLORS.blue : tone === "rose" ? COLORS.rose : COLORS.green;
  const soft = tone === "amber" ? COLORS.amberSoft : tone === "blue" ? COLORS.blueSoft : tone === "rose" ? COLORS.roseSoft : COLORS.greenSoft;
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 12, overflow: "hidden", background: COLORS.card }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 10px", background: soft, color, fontWeight: 750, fontSize: 13 }}>
        <MathFormula tex={name} />
        <MathFormula tex={shape} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `52px repeat(${columns.length}, minmax(44px, 1fr))`, fontFamily: "Cambria Math, STIX Two Math, serif", fontSize: 12 }}>
        <div style={{ padding: 5, color: COLORS.faint, textAlign: "center", borderTop: `1px solid ${COLORS.line}` }}>row</div>
        {columns.map((column) => (
          <div key={`head-${column}`} style={{ padding: 5, textAlign: "center", color: COLORS.faint, borderLeft: `1px solid ${COLORS.line}`, borderTop: `1px solid ${COLORS.line}` }}>
            <MathFormula tex={column} />
          </div>
        ))}
        {rows.map((row) => (
          <React.Fragment key={row}>
            <div style={{ padding: 6, textAlign: "center", color, fontWeight: 700, borderTop: `1px solid ${COLORS.line}` }}><MathFormula tex={row} /></div>
            {columns.map((column) => (
              <div key={`${row}-${column}`} style={{ padding: 6, textAlign: "center", borderLeft: `1px solid ${COLORS.line}`, borderTop: `1px solid ${COLORS.line}`, background: row === "\\vdots" || column === "\\cdots" ? "#faf8f3" : COLORS.card }}>
                <MathFormula tex={row === "\\vdots" || column === "\\cdots" ? "\\cdots" : `{${name}}_{${row},${column}}`} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function WeightMatrix({ name, shape, caption, tone = "blue" }: { name: string; shape: string; caption: string; tone?: "blue" | "green" | "amber" }) {
  const color = tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : COLORS.blue;
  const soft = tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : COLORS.blueSoft;
  return (
    <div style={{ border: `1.5px solid ${color}`, borderRadius: 10, overflow: "hidden", minWidth: 0 }}>
      <div style={{ padding: "8px 10px", background: soft, color, fontWeight: 800, fontSize: 15 }}><MathFormula tex={name} /></div>
      <div style={{ padding: "7px 10px 4px", fontSize: 11 }}><MathFormula tex={shape} /></div>
      <div style={{ padding: "0 10px 8px", color: COLORS.muted, fontSize: 11, lineHeight: 1.35 }}>{caption}</div>
    </div>
  );
}

function HeadCard({ head }: { head: number }) {
  return (
    <div style={{ border: `1.5px solid ${COLORS.green}`, borderRadius: 11, overflow: "hidden", background: COLORS.card }}>
      <div style={{ padding: "7px 9px", background: COLORS.greenSoft, color: COLORS.green, textAlign: "center", fontWeight: 800, fontSize: 13 }}>Head {head}</div>
      <div style={{ display: "grid", gap: 6, padding: 8, fontSize: 10.5, color: COLORS.muted }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 5, padding: 4, textAlign: "center" }}><MathFormula tex={`Q_{${head}}`} /></span>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 5, padding: 4, textAlign: "center" }}><MathFormula tex={`K_{${head}}`} /></span>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 5, padding: 4, textAlign: "center" }}><MathFormula tex={`V_{${head}}`} /></span>
        </div>
        <div style={{ textAlign: "center", color: COLORS.green }}><MathFormula tex={`Q_{${head}}K_{${head}}^{\\mathsf T}/\\sqrt{d_k}`} /></div>
        <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 5, padding: 4, textAlign: "center" }}><MathFormula tex={`\\operatorname{softmax}(\\cdot)V_{${head}}`} /></div>
        <div style={{ textAlign: "center", fontWeight: 750, color: COLORS.ink }}><MathFormula tex={`O_{${head}}\\in\\mathbb{R}^{N\\times512}`} /></div>
      </div>
    </div>
  );
}

function ExpertCard({ name, score, shared = false }: { name: string; score?: string; shared?: boolean }) {
  return (
    <div style={{ border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 10, overflow: "hidden", background: COLORS.card }}>
      <div style={{ padding: "7px 8px", background: shared ? COLORS.blueSoft : COLORS.amberSoft, color: shared ? COLORS.blue : COLORS.amber, fontWeight: 800, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
        <span>{name}</span><span>{score ?? "always"}</span>
      </div>
      <div style={{ padding: 8, display: "grid", gridTemplateColumns: "1fr 24px 1fr", alignItems: "center", gap: 4, fontSize: 9.5, color: COLORS.muted }}>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 3, textAlign: "center" }}><MathFormula tex="W^{\mathrm{gate}}" /></span>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 3, textAlign: "center" }}><MathFormula tex="W^{\mathrm{up}}" /></span>
        </div>
        <span style={{ textAlign: "center", fontWeight: 800 }}><MathFormula tex="\odot" /></span>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 3, textAlign: "center" }}><MathFormula tex="\operatorname{SiLU}" /></span>
          <span style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 3, textAlign: "center" }}><MathFormula tex="W^{\mathrm{down}}" /></span>
        </div>
      </div>
    </div>
  );
}

function DiagramNodeView({ data }: NodeProps<DiagramNode>) {
  const { variant, layer, mode } = data;
  const commonHandles = (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </>
  );

  if (variant === "tensor" || variant === "output") {
    const output = variant === "output";
    return (
      <div style={panelStyle}>
        {commonHandles}
        <div style={titleStyle}>
          <MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}\\longrightarrow\\text{Layer }${layer + 1}` : `H_{${layer}}^{\\mathrm{in}}`} />
          {!output && <span> · Layer {layer} 输入</span>}
        </div>
        <div style={{ padding: 12 }}>
          <MatrixGrid name={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape="N\times5120" tone={output ? "green" : "blue"} />
        </div>
      </div>
    );
  }

  if (variant === "norm1" || variant === "norm2") {
    const second = variant === "norm2";
    return (
      <div style={{ ...panelStyle, display: "grid", placeItems: "center", padding: 12, fontSize: 18, fontWeight: 750 }}>
        {commonHandles}
        <MathFormula tex={second ? `Y=\\operatorname{RMSNorm}(H_{${layer}}';\\gamma_{${layer},2})` : `X=\\operatorname{RMSNorm}(H_{${layer}}^{\\mathrm{in}};\\gamma_{${layer},1})`} />
      </div>
    );
  }

  if (variant === "projection") {
    const hasGlobalProjection = mode === "full";
    const hasIndexerQ = mode === "full" || mode === "reindex";
    return (
      <div style={panelStyle}>
        {commonHandles}
        <div style={titleStyle}>独立投影矩阵</div>
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 9 }}>
          <WeightMatrix name="W^{Q\downarrow}\;W^{Q\uparrow}" shape="5120\times1280\longrightarrow64\times512" caption="Q 先压缩，再展开为 64 个 head" />
          <WeightMatrix name="W^{K,\mathrm{loc}}" shape="5120\times d_{kv}" caption="仅生成最近 128 行局部 K" tone="green" />
          <WeightMatrix name="W^{V,\mathrm{loc}}" shape="5120\times d_{kv}" caption="与局部 K 的权重分离" tone="green" />
          <WeightMatrix
            name={hasGlobalProjection ? "W^{KV,\\mathrm{global}}" : hasIndexerQ ? "W^{IQ}" : "\\text{全局投影跳过}"}
            shape={hasGlobalProjection ? "5120\\times d_{\\mathrm{main}}" : hasIndexerQ ? "5120\\times(32\\times128)" : "\\text{读取共享结果}"}
            caption={hasGlobalProjection ? "Full 才生产 main KV；这是共享表示，不是把局部 K、V 写成一个权重" : hasIndexerQ ? "本层 indexer Q 对共享 indexer K 重新打分" : "Reuse 不计算全局 KV 与 indexer"}
            tone="amber"
          />
        </div>
        <div style={{ padding: "0 12px 12px", color: COLORS.muted, fontSize: 11.5 }}>
          局部分支始终使用两块独立权重 <MathFormula tex="W^{K,\mathrm{loc}}" />、<MathFormula tex="W^{V,\mathrm{loc}}" />；CSA2 的 global main KV 是另一种共享缓存表示。
        </div>
      </div>
    );
  }

  if (variant === "global-cache") {
    const full = mode === "full";
    const reindex = mode === "reindex";
    return (
      <div style={{ ...panelStyle, borderColor: full ? COLORS.green : reindex ? COLORS.amber : COLORS.blue }}>
        <Handle type="target" position={Position.Left} style={handleStyle} />
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
        <div style={{ ...titleStyle, background: full ? COLORS.greenSoft : reindex ? COLORS.amberSoft : COLORS.blueSoft }}>
          全局共享缓存 · {modeLabel(mode)}
        </div>
        <div style={{ padding: 12, display: "grid", gap: 8, fontSize: 11.5 }}>
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: 8 }}><b>main KV</b><br />{full ? "本层产生并写入" : "读取最近 Full 层"}</div>
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: 8 }}><b>indexer K</b><br />由 main KV 投影</div>
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: 8 }}><b>Top-512 行号</b><br />{reindex ? "本层重新选择" : full ? "本层首次选择" : "读取最近索引层"}</div>
        </div>
      </div>
    );
  }

  if (variant === "attention") {
    return (
      <div style={panelStyle}>
        {commonHandles}
        <Handle id="global" type="target" position={Position.Right} style={{ ...handleStyle, top: "42%" }} />
        <div style={titleStyle}>64 个注意力头并行计算</div>
        <div style={{ padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 1fr", gap: 9, alignItems: "stretch" }}>
            <HeadCard head={1} />
            <HeadCard head={2} />
            <div style={{ display: "grid", placeItems: "center", fontSize: 28, color: COLORS.faint }}>⋯</div>
            <HeadCard head={64} />
          </div>
          <div style={{ marginTop: 10, border: `1.5px solid ${COLORS.green}`, borderRadius: 9, padding: 9, textAlign: "center", background: COLORS.greenSoft, color: COLORS.green, fontWeight: 800 }}>
            <MathFormula tex={`\\operatorname{Concat}(O_1,O_2,\\ldots,O_{64})W^O=O_{${layer}}`} />
          </div>
          <div style={{ marginTop: 7, color: COLORS.muted, fontSize: 11.5, textAlign: "center" }}>
            每个 head 都读取局部 128 行；非 SWA-only 层再读取选中的 512 行全局 main KV。
          </div>
        </div>
      </div>
    );
  }

  if (variant === "residual1" || variant === "residual2") {
    const second = variant === "residual2";
    return (
      <div style={{ ...panelStyle, display: "grid", placeItems: "center", padding: 12, fontSize: 18, fontWeight: 800 }}>
        <Handle type="target" position={Position.Top} style={handleStyle} />
        <Handle id="skip" type="target" position={Position.Left} style={{ ...handleStyle, background: COLORS.amber }} />
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
        <MathFormula tex={second ? `H_{${layer}}^{\\mathrm{out}}=H_{${layer}}'+O_{${layer}}^{\\mathrm{FFN}}` : `H_{${layer}}'=H_{${layer}}^{\\mathrm{in}}+O_{${layer}}`} />
      </div>
    );
  }

  if (variant === "router") {
    // [OM-FREEPLAY] 分数只用于展示 Top-6 的排序形态，不代表模型在任何真实 token 上的输出。
    const scores = [
      ["7", "0.91"], ["31", "0.86"], ["96", "0.79"], ["142", "0.73"], ["228", "0.69"], ["351", "0.64"],
    ];
    return (
      <div style={panelStyle}>
        {commonHandles}
        <div style={titleStyle}>Router · <MathFormula tex="g=YW^R\in\mathbb{R}^{N\times384}" /></div>
        <div style={{ padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6, fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: 10.5 }}>
            {scores.slice(0, 3).map(([name, score]) => <div key={name} style={{ padding: 7, borderRadius: 6, background: COLORS.amberSoft, border: `1px solid ${COLORS.amber}`, color: COLORS.amber, fontWeight: 800, textAlign: "center" }}><MathFormula tex={`g_{${name}}=${score}`} /></div>)}
            <div style={{ padding: 7, textAlign: "center", color: COLORS.faint }}>…</div>
            {scores.slice(3).map(([name, score]) => <div key={name} style={{ padding: 7, borderRadius: 6, background: COLORS.amberSoft, border: `1px solid ${COLORS.amber}`, color: COLORS.amber, fontWeight: 800, textAlign: "center" }}><MathFormula tex={`g_{${name}}=${score}`} /></div>)}
            <div style={{ padding: 7, textAlign: "center", color: COLORS.faint }}>其余 378</div>
          </div>
          <div style={{ marginTop: 9, textAlign: "center", color: COLORS.muted, fontSize: 11.5 }}>示意分数随 token 改变；Top-6 选中黄色格，另有 1 个共享专家始终执行。</div>
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      {commonHandles}
      <div style={titleStyle}>1 个共享专家 + Top-6 routed experts</div>
      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        <ExpertCard name="Shared" shared />
        <ExpertCard name="Expert 7" score="0.91" />
        <ExpertCard name="Expert 31" score="0.86" />
        <ExpertCard name="Expert 96" score="0.79" />
        <ExpertCard name="Expert 142" score="0.73" />
        <ExpertCard name="Expert 228" score="0.69" />
        <ExpertCard name="Expert 351" score="0.64" />
        <div style={{ border: `1px dashed ${COLORS.line}`, borderRadius: 10, display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 11 }}>其余专家<br />不执行</div>
      </div>
      <div style={{ margin: "0 12px 12px", border: `1.5px solid ${COLORS.amber}`, borderRadius: 9, padding: 9, textAlign: "center", background: COLORS.amberSoft, color: COLORS.amber, fontWeight: 800 }}>
        <MathFormula tex={`\\operatorname{Shared}(Y)+\\sum_{i\\in\\operatorname{Top-6}}g_i\\operatorname{Expert}_i(Y)=O_{${layer}}^{\\mathrm{FFN}}`} />
      </div>
    </div>
  );
}

const NodeView = memo(DiagramNodeView);
const nodeTypes = { diagram: NodeView };

function makeNode(id: string, variant: DiagramVariant, layer: number, mode: LayerMode, x: number, y: number, width: number, height: number): DiagramNode {
  return { id, type: "diagram", position: { x, y }, data: { variant, layer, mode }, style: { width, height }, draggable: false, selectable: false };
}

function buildGraph(layer: number): { nodes: DiagramNode[]; edges: Edge[] } {
  const mode = modeForLayer(layer);
  const nodes: DiagramNode[] = [
    makeNode("input", "tensor", layer, mode, 430, 20, 620, 250),
    makeNode("norm1", "norm1", layer, mode, 570, 330, 340, 80),
    makeNode("projection", "projection", layer, mode, 180, 480, 1120, 245),
    makeNode("attention", "attention", layer, mode, 240, 805, 1000, 295),
    makeNode("residual1", "residual1", layer, mode, 500, 1180, 480, 82),
    makeNode("norm2", "norm2", layer, mode, 570, 1340, 340, 80),
    makeNode("router", "router", layer, mode, 230, 1500, 1020, 185),
    makeNode("experts", "experts", layer, mode, 210, 1765, 1060, 330),
    makeNode("residual2", "residual2", layer, mode, 500, 2175, 480, 82),
    makeNode("output", "output", layer, mode, 430, 2340, 620, 250),
  ];
  if (mode !== "swa") nodes.push(makeNode("global", "global-cache", layer, mode, 1280, 780, 280, 290));

  const edge = (id: string, source: string, target: string, label?: ReactNode, extra?: Partial<Edge>): Edge => ({
    id,
    source,
    target,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.green },
    style: { stroke: COLORS.green, strokeWidth: 2.2 },
    label,
    labelStyle: { fill: COLORS.muted, fontSize: 13, fontWeight: 700 },
    labelBgStyle: { fill: COLORS.paper, fillOpacity: 0.94 },
    labelBgPadding: [7, 4],
    labelBgBorderRadius: 6,
    ...extra,
  });
  const mathEdge = (id: string, source: string, target: string, tex: string, extra?: Partial<Edge>): Edge =>
    edge(id, source, target, <MathFormula tex={tex} />, extra);

  const edges: Edge[] = [
    edge("input-norm1", "input", "norm1"),
    mathEdge("norm1-projection", "norm1", "projection", "X"),
    mathEdge("projection-attention", "projection", "attention", "Q+K^{\\mathrm{loc}}+V^{\\mathrm{loc}}"),
    mathEdge("attention-residual1", "attention", "residual1", `O_{${layer}}`),
    mathEdge("input-residual1", "input", "residual1", `H_{${layer}}^{\\mathrm{in}}`, { targetHandle: "skip", type: "smoothstep", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.amber } }),
    mathEdge("residual1-norm2", "residual1", "norm2", `H_{${layer}}'`),
    mathEdge("norm2-router", "norm2", "router", "Y"),
    edge("router-experts", "router", "experts", "Top-6 + shared"),
    mathEdge("experts-residual2", "experts", "residual2", `O_{${layer}}^{\\mathrm{FFN}}`),
    mathEdge("residual1-residual2", "residual1", "residual2", `H_{${layer}}'`, { targetHandle: "skip", type: "smoothstep", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.amber } }),
    edge("residual2-output", "residual2", "output"),
  ];
  if (mode !== "swa") {
    edges.push(edge("projection-global", "projection", "global", mode === "full" ? "写 main KV / indexer K" : "请求共享状态", { targetHandle: undefined }));
    edges.push(edge("global-attention", "global", "attention", mode === "reuse" ? "共享 KV + Top-512" : "共享 KV + 新 Top-512", { targetHandle: "global" }));
  }
  return { nodes, edges };
}

export const DeepSeekV41Layer: React.FC<Props> = ({ initialLayer = 1 }) => {
  const [layer, setLayer] = useState(() => Math.min(40, Math.max(1, Math.round(initialLayer))));
  const mode = modeForLayer(layer);
  const graph = useMemo(() => buildGraph(layer), [layer]);

  return (
    <div style={{ width: "100%", height: "100%", background: COLORS.paper, fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", inset: "0 0 auto 0", zIndex: 10, minHeight: 122, padding: "18px 22px 14px", background: "rgba(247,245,240,.97)", borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
          <div><strong style={{ fontSize: 22, color: COLORS.ink }}>DeepSeek V4.1-Flash · 第 {layer} 层</strong><span style={{ marginLeft: 12, color: mode === "full" ? COLORS.green : mode === "reindex" ? COLORS.amber : mode === "reuse" ? COLORS.blue : COLORS.rose, fontWeight: 800 }}>{modeLabel(mode)}</span></div>
          <div style={{ color: COLORS.muted, fontSize: 12 }}>大框=矩阵 · 条带=向量 · 小格=元素</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 4 }}>
          {Array.from({ length: 40 }, (_, index) => index + 1).map((value) => {
            const valueMode = modeForLayer(value);
            const active = value === layer;
            const color = valueMode === "full" ? COLORS.green : valueMode === "reindex" ? COLORS.amber : valueMode === "reuse" ? COLORS.blue : COLORS.rose;
            return <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={active} style={{ border: `1px solid ${active ? color : COLORS.line}`, background: active ? color : COLORS.card, color: active ? "white" : color, borderRadius: 5, padding: "4px 0", fontWeight: 750, fontSize: 10.5, cursor: "pointer" }}>{value}</button>;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", inset: "122px 0 0" }}>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.035, minZoom: 0.2, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll={false}
          zoomOnPinch
          zoomOnDoubleClick
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#d7d2c7" gap={28} size={1} />
          <Controls showInteractive={false} position="top-left" />
        </ReactFlow>
      </div>
    </div>
  );
};
