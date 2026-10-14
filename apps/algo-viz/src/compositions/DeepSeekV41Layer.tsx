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
  | "projection-kv"
  | "swa-window"
  | "cache"
  | "heads"
  | "concat"
  | "add1"
  | "state1"
  | "norm2"
  | "moe-input"
  | "router"
  | "scores"
  | "experts"
  | "aggregate"
  | "moe-sum"
  | "moe-output"
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

// [OM-FREEPLAY] 数值仅展示 Router 排序、选择与加权关系，不代表真实 token 的输出。
const ROUTED_EXPERTS = [
  { id: 7, score: ".91" },
  { id: 31, score: ".86" },
  { id: 96, score: ".79" },
  { id: 142, score: ".73" },
  { id: 228, score: ".69" },
  { id: 351, score: ".64" },
] as const;

const ROUTED_HANDLE_LEFT = [21.43, 35.71, 50, 64.29, 78.57, 92.86] as const;
const SCORE_HANDLE_LEFT = [8.33, 25, 41.67, 58.33, 75, 91.67] as const;

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

function Operator({ tex }: { tex: string }) {
  return <span style={{ color: COLORS.green, fontSize: 18, fontWeight: 900, textAlign: "center" }}><MathFormula tex={tex} /></span>;
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
          <Operator tex="\times" />
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

function LocalKvProjection({ layer }: { layer: number }) {
  return (
    <div style={panel}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle type="source" position={Position.Bottom} style={handle} />
      <Title>本层 SWA 的共享 KV 潜向量</Title>
      <div style={{ padding: 10, display: "grid", gap: 7 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}>
          <Box tone="blue"><MathFormula tex={`X_{${layer}}`} /><br /><MathFormula tex="N\times5120" /></Box>
          <Operator tex="\times" />
          <Box tone="green"><MathFormula tex={`W_{${layer}}^{KV,\\mathrm{SWA}}`} /><br /><MathFormula tex="5120\times512" /></Box>
        </div>
        <Arrow vertical />
        <Box tone="green"><MathFormula tex={`U_{${layer}}=\\operatorname{RoPE}(\\operatorname{RMSNorm}(X_{${layer}}W_{${layer}}^{KV,\\mathrm{SWA}}))\\in\\mathbb{R}^{N\\times512}`} /></Box>
        <Arrow vertical />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px 1fr", gap: 5, alignItems: "center" }}>
          <Box><MathFormula tex={`u_{${layer},1:}`} /></Box><Box><MathFormula tex={`u_{${layer},2:}`} /></Box><span style={{ textAlign: "center" }}>⋯</span><Box><MathFormula tex={`u_{${layer},N:}`} /></Box>
        </div>
      </div>
    </div>
  );
}

function Head({ index, layer }: { index: number; layer: number }) {
  const attendedKvSymbol = `\\mathcal C_{${layer},t}`;
  return (
    <div style={{ border: `1.5px solid ${COLORS.green}`, borderRadius: 10, padding: 8, display: "grid", gap: 5, background: COLORS.card }}>
      <strong style={{ color: COLORS.green, textAlign: "center", fontSize: 12 }}>Head {index}</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.55fr", gap: 5 }}><Box><MathFormula tex={`Q_{${index},t}`} /></Box><Box><MathFormula tex={attendedKvSymbol} /></Box></div>
      <Arrow vertical />
      <Box tone="green"><MathFormula tex={`S_t=\\operatorname{softmax}(Q_{${index},t}${attendedKvSymbol}^{\\mathsf T}/\\sqrt{d_h})`} /></Box>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}><Box><MathFormula tex={`S_{${index},t}`} /></Box><Operator tex="\times" /><Box><MathFormula tex={attendedKvSymbol} /></Box></div>
      <Arrow vertical />
      <Box tone="green"><MathFormula tex={`O_{${index}}\\in\\mathbb{R}^{N\\times512}`} /></Box>
    </div>
  );
}

function Expert({ index, score, shared = false }: { index?: number; score?: string; shared?: boolean }) {
  const expertTex = shared ? "E_s" : `E_{${index}}`;
  const weightIndex = shared ? "s" : `${index}`;
  return (
    <div style={{ border: `1.5px solid ${shared ? COLORS.blue : COLORS.amber}`, borderRadius: 9, padding: 7, display: "grid", gap: 5, background: COLORS.card, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: shared ? COLORS.blue : COLORS.amber, fontWeight: 800, fontSize: 11 }}><span>{shared ? "Shared" : `Expert ${index}`}</span><span>{shared ? "权重 1" : <MathFormula tex={`g_{${index}}=${score}`} />}</span></div>
      <Box tone="blue"><MathFormula tex="Y" /></Box>
      <Arrow vertical />
      <Box><MathFormula tex={`a=\\operatorname{SiLU}(YW_{${weightIndex}}^{\\mathrm{gate}})`} /></Box>
      <Box><MathFormula tex={`b=YW_{${weightIndex}}^{\\mathrm{up}}`} /></Box>
      <Box tone="amber"><MathFormula tex="c=a\odot b" /></Box>
      <Box><MathFormula tex={`${expertTex}(Y)=cW_{${weightIndex}}^{\\mathrm{down}}`} /></Box>
      <Arrow vertical />
      <Box tone={shared ? "blue" : "amber"}><MathFormula tex={`${expertTex}(Y)\\in\\mathbb{R}^{N\\times5120}`} /></Box>
    </div>
  );
}

function DiagramNodeView({ data }: NodeProps<DiagramNode>) {
  const { kind, layer, mode } = data;
  const both = <><Handle type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /></>;

  if (kind === "tensor" || kind === "output") {
    const output = kind === "output";
    return <div style={panel}>{output ? both : <><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /></>}<Title><MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}=H_{${layer}}'+O_{${layer}}^{\\mathrm{FFN}}` : `H_{${layer}}^{\\mathrm{in}}`} /></Title><div style={{ padding: 10 }}><Matrix tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape="N\times5120" tone={output ? "green" : "blue"} /></div></div>;
  }

  if (kind === "norm1" || kind === "norm2") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750 }}>{both}<MathFormula tex={kind === "norm1" ? `X=\\operatorname{RMSNorm}(H_{${layer}}^{\\mathrm{in}};\\gamma_{${layer},1})` : `Y=\\operatorname{RMSNorm}(H_{${layer}}';\\gamma_{${layer},2})`} /></div>;
  }

  if (kind === "projection-q") return <Projection symbol="Q" weight="W^{Q\downarrow}W^{Q\uparrow}" shape="5120\times1280\rightarrow64\times512" />;
  if (kind === "projection-kv") return <LocalKvProjection layer={layer} />;

  if (kind === "swa-window") {
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle type="source" position={Position.Bottom} style={handle} />
      <Title>SWA · 对第 <MathFormula tex="t" /> 个 Query，只裁行、不裁列</Title>
      <div style={{ padding: 9, display: "grid", gridTemplateColumns: "1.25fr 24px 1fr 24px 1.35fr", alignItems: "center", gap: 6 }}>
        <Box><strong>完整矩阵</strong><br /><MathFormula tex={`U_{${layer}}\\in\\mathbb{R}^{N\\times512}`} /><br /><MathFormula tex={`U_{${layer}}=[u_{${layer},1:};u_{${layer},2:};\\ldots;u_{${layer},N:}]`} /></Box>
        <Arrow />
        <Box tone="amber"><strong>取行</strong><br /><MathFormula tex="r=\\max(1,t-127),\\ldots,t" /><br /><strong>取列</strong><br /><MathFormula tex="c=1,\\ldots,512" /></Box>
        <Arrow />
        <Box tone="green"><strong>切出的矩阵</strong><br /><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}=[u_{${layer},r:};\\ldots;u_{${layer},t:}]`} /><br /><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}=U_{${layer}}[r:t,\\;1:512]\\in\\mathbb{R}^{\\min(128,t)\\times512}`} /></Box>
      </div>
    </div>;
  }

  if (kind === "cache") {
    const full = mode === "full";
    return <div style={{ ...panel, borderColor: COLORS.amber }}>{full && <Handle type="target" position={Position.Top} style={handle} />}<Handle type="source" position={Position.Left} style={handle} /><Title>全局 KV · {modeLabel(mode)}</Title><div style={{ padding: 9, display: "grid", gap: 7, fontSize: 11 }}>
      {full && <Box tone="amber"><MathFormula tex={`C_{${layer}}=H_{\\mathrm{source}(${layer})}W_{${layer}}^{KV}`} /><br />生成全局 main KV 条目</Box>}
      {mode === "reindex" && <Box tone="amber"><MathFormula tex="XW^{IQ}" /><br />重算 Top-512</Box>}
      {mode === "reuse" && <Box tone="blue">读取最近索引层</Box>}
      <Arrow vertical /><Box tone="green">选中 512 行全局 KV</Box>
    </div></div>;
  }

  if (kind === "heads") {
    return <div style={panel}><Handle id="q" type="target" position={Position.Top} style={{ ...handle, left: "30%" }} /><Handle id="local" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />{mode !== "swa" && <Handle id="global" type="target" position={Position.Right} style={handle} />}<Handle type="source" position={Position.Bottom} style={handle} /><Title>64 个 Query Head 共享 <MathFormula tex={`\\mathcal C_{${layer},t}`} />：{mode === "swa" ? <MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}`} /> : <MathFormula tex={`[U_{${layer},t}^{\\mathrm{SWA}};C_{${layer}}[I_t,:]]`} />}</Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 64px 1fr", gap: 8 }}><Head index={1} layer={layer} /><Head index={2} layer={layer} /><div style={{ display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 26 }}>⋯</div><Head index={64} layer={layer} /></div></div>;
  }

  if (kind === "concat") {
    return <div style={panel}>{both}<Title>Concat：沿特征维拼接，再做输出投影</Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 24px 1.4fr 24px 22px .7fr 24px 1fr", alignItems: "center", gap: 5 }}><Box><MathFormula tex="[O_1\;O_2\;\cdots\;O_{64}]" /></Box><Arrow /><Box tone="green"><MathFormula tex="O_{\mathrm{cat}}\in\mathbb{R}^{N\times(64\cdot512)}" /></Box><Arrow /><Operator tex="\times" /><Box tone="blue"><MathFormula tex="W^O" /></Box><Arrow /><Box tone="green"><MathFormula tex={`O_{${layer}}`} /></Box></div></div>;
  }

  if (kind === "add1" || kind === "add2") {
    return <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${COLORS.amber}`, background: COLORS.amberSoft, display: "grid", placeItems: "center", fontSize: 28, color: COLORS.amber, fontWeight: 900 }}><Handle type="target" position={Position.Top} style={handle} /><Handle id="skip" type="target" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /><Handle type="source" position={Position.Bottom} style={handle} />+</div>;
  }

  if (kind === "state1") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}><Handle type="target" position={Position.Top} style={handle} /><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /><MathFormula tex={`H_{${layer}}'=H_{${layer}}^{\\mathrm{in}}+O_{${layer}}`} /></div>;
  }

  if (kind === "moe-input") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", borderColor: COLORS.blue, background: COLORS.blueSoft, fontSize: 20, fontWeight: 800 }}><Handle type="target" position={Position.Top} style={handle} /><Handle id="router" type="source" position={Position.Bottom} style={handle} /><Handle id="shared" type="source" position={Position.Left} style={{ ...handle, background: COLORS.blue }} /><MathFormula tex="Y" /></div>;
  }

  if (kind === "router") {
    return <div style={panel}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle type="source" position={Position.Bottom} style={{ ...handle, background: COLORS.amber }} />
      <Title>Router · 只选择 routed experts</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1.25fr 28px 1.1fr", alignItems: "center", gap: 5 }}>
        <Box tone="blue"><MathFormula tex="Y" /></Box><Operator tex="\times" /><Box><MathFormula tex="W^R" /></Box><Arrow /><Box tone="green"><MathFormula tex="s=YW^R" /></Box><Arrow /><Box tone="amber"><MathFormula tex="I=\operatorname{TopK}(s,6)" /></Box>
      </div>
    </div>;
  }

  if (kind === "scores") {
    return <div style={{ ...panel, borderColor: COLORS.amber }}>
      <Handle type="target" position={Position.Top} style={{ ...handle, background: COLORS.amber }} />
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`score-${expert.id}`} type="source" position={Position.Bottom} style={{ ...handle, left: `${SCORE_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Title><MathFormula tex="I" /> 对应的六个 Router 权重</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 6 }}>
        {ROUTED_EXPERTS.map((expert) => <Box key={expert.id} tone="amber"><MathFormula tex={`g_{${expert.id}}=s_{${expert.id}}=${expert.score}`} /></Box>)}
      </div>
    </div>;
  }

  if (kind === "experts") {
    return <div style={panel}>
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-${expert.id}`} type="target" position={Position.Top} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Handle id="shared" type="target" position={Position.Left} style={{ ...handle, top: "50%", background: COLORS.blue }} />
      <Handle id="shared-out" type="source" position={Position.Bottom} style={{ ...handle, left: "7.14%", background: COLORS.blue }} />
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`expert-out-${expert.id}`} type="source" position={Position.Bottom} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Title>Shared 接收 <MathFormula tex="Y" /> 旁路；六个 routed experts 接收各自的 <MathFormula tex="g_i" /></Title>
      <div style={{ padding: 9, display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
        <Expert shared />
        {ROUTED_EXPERTS.map((expert) => <Expert key={expert.id} index={expert.id} score={expert.score} />)}
      </div>
    </div>;
  }

  if (kind === "aggregate") {
    return <div style={panel}>
      <Handle id="shared" type="target" position={Position.Top} style={{ ...handle, left: "7.14%", background: COLORS.blue }} />
      {ROUTED_EXPERTS.map((expert, index) => <Handle key={expert.id} id={`weighted-${expert.id}`} type="target" position={Position.Top} style={{ ...handle, left: `${ROUTED_HANDLE_LEFT[index]}%`, background: COLORS.amber }} />)}
      <Handle type="source" position={Position.Bottom} style={handle} />
      <Title>各专家输出向量分别加权</Title><div style={{ padding: 9, display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 5 }}>
        <Box tone="blue"><MathFormula tex="1\cdot E_{\mathrm{shared}}(Y)" /></Box>
        {ROUTED_EXPERTS.map((expert) => <Box key={expert.id} tone="amber"><MathFormula tex={`g_{${expert.id}}\\cdot E_{${expert.id}}(Y)`} /></Box>)}
      </div>
    </div></div>;
  }

  if (kind === "moe-sum") {
    return <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${COLORS.green}`, background: COLORS.greenSoft, display: "grid", placeItems: "center", fontSize: 22, color: COLORS.green, fontWeight: 900 }}><Handle type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /><MathFormula tex="\sum" /></div>;
  }

  if (kind === "moe-output") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", borderColor: COLORS.green, background: COLORS.greenSoft, fontSize: 16, fontWeight: 800 }}><Handle type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /><MathFormula tex={`O_{${layer}}^{\\mathrm{FFN}}\\in\\mathbb{R}^{N\\times5120}`} /></div>;
  }

  return <div style={panel}>{both}<Title><MathFormula tex={`H_{${layer}}^{\\mathrm{out}}`} /></Title></div>;
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
    node("q", "projection-q", layer, mode, 160, 375, 520, 330),
    node("kv", "projection-kv", layer, mode, 920, 375, 520, 330),
    node("swa-window", "swa-window", layer, mode, 280, 735, 1040, 280),
    node("heads", "heads", layer, mode, 240, 1045, 1040, 375),
    node("concat", "concat", layer, mode, 350, 1450, 840, 130),
    node("add1", "add1", layer, mode, 765, 1610, 70, 70),
    node("state1", "state1", layer, mode, 620, 1710, 360, 72),
    node("norm2", "norm2", layer, mode, 620, 1812, 360, 72),
    node("moe-input", "moe-input", layer, mode, 715, 1914, 170, 80),
    node("router", "router", layer, mode, 440, 2024, 720, 130),
    node("scores", "scores", layer, mode, 278, 2184, 1252, 115),
    node("experts", "experts", layer, mode, 70, 2329, 1460, 480),
    node("aggregate", "aggregate", layer, mode, 70, 2839, 1460, 125),
    node("moe-sum", "moe-sum", layer, mode, 765, 2994, 70, 70),
    node("moe-output", "moe-output", layer, mode, 620, 3094, 360, 72),
    node("add2", "add2", layer, mode, 765, 3196, 70, 70),
    node("output", "output", layer, mode, 610, 3296, 380, 180),
  ];
  if (mode !== "swa") nodes.push(node("cache", "cache", layer, mode, 1340, 1070, 240, 230));

  const makeEdge = (id: string, source: string, target: string, label?: ReactNode, extra?: Partial<Edge>): Edge => ({
    id, source, target, type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.green },
    style: { stroke: COLORS.green, strokeWidth: 2.2 },
    label, labelStyle: { fill: COLORS.muted, fontSize: 12, fontWeight: 700 },
    labelBgStyle: { fill: COLORS.paper, fillOpacity: .96 }, labelBgPadding: [6, 3], labelBgBorderRadius: 5,
    ...extra,
  });
  const mathEdge = (id: string, source: string, target: string, tex: string, extra?: Partial<Edge>) => makeEdge(id, source, target, <MathFormula tex={tex} />, extra);
  const skipStyle = { type: "smoothstep", pathOptions: { borderRadius: 8, offset: 560 }, style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.amber } } as Partial<Edge>;

  const edges: Edge[] = [
    makeEdge("input-norm", "input", "norm1", undefined, { sourceHandle: "main" }),
    mathEdge("norm-q", "norm1", "q", "X"),
    mathEdge("norm-kv", "norm1", "kv", `X_{${layer}}`),
    mathEdge("q-heads", "q", "heads", "Q_1,Q_2,\\ldots,Q_{64}", { targetHandle: "q" }),
    mathEdge("kv-swa", "kv", "swa-window", `U_{${layer}}\\in\\mathbb{R}^{N\\times512}`),
    mathEdge("swa-heads", "swa-window", "heads", `U_{${layer},t}^{\\mathrm{SWA}}`, { targetHandle: "local" }),
    makeEdge("heads-concat", "heads", "concat"),
    mathEdge("concat-add1", "concat", "add1", `O_{${layer}}`),
    mathEdge("input-add1", "input", "add1", `H_{${layer}}^{\\mathrm{in}}`, { sourceHandle: "residual", targetHandle: "skip", ...skipStyle }),
    makeEdge("add1-state", "add1", "state1"),
    makeEdge("state-norm2", "state1", "norm2", undefined, { sourceHandle: "main" }),
    makeEdge("norm2-moe-input", "norm2", "moe-input"),
    makeEdge("moe-input-router", "moe-input", "router", undefined, { sourceHandle: "router" }),
    mathEdge("router-scores", "router", "scores", "I"),
    makeEdge("moe-input-shared", "moe-input", "experts", undefined, { sourceHandle: "shared", targetHandle: "shared", style: { stroke: COLORS.blue, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.blue } }),
    makeEdge("aggregate-sum", "aggregate", "moe-sum"),
    makeEdge("sum-moe-output", "moe-sum", "moe-output"),
    mathEdge("moe-output-add2", "moe-output", "add2", `O_{${layer}}^{\\mathrm{FFN}}`),
    mathEdge("state1-add2", "state1", "add2", `H_{${layer}}'`, { sourceHandle: "residual", targetHandle: "skip", ...skipStyle }),
    makeEdge("add2-output", "add2", "output"),
  ];
  for (const expert of ROUTED_EXPERTS) {
    edges.push(makeEdge(`score-expert-${expert.id}`, "scores", "experts", undefined, { sourceHandle: `score-${expert.id}`, targetHandle: `expert-${expert.id}`, type: "straight", style: { stroke: COLORS.amber, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: COLORS.amber } }));
    edges.push(makeEdge(`expert-weight-${expert.id}`, "experts", "aggregate", undefined, { sourceHandle: `expert-out-${expert.id}`, targetHandle: `weighted-${expert.id}`, type: "straight", style: { stroke: COLORS.amber, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: COLORS.amber } }));
  }
  edges.push(makeEdge("shared-weight", "experts", "aggregate", undefined, { sourceHandle: "shared-out", targetHandle: "shared", type: "straight", style: { stroke: COLORS.blue, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: COLORS.blue } }));
  if (mode !== "swa") {
    edges.push(makeEdge("cache-heads", "cache", "heads", undefined, { targetHandle: "global", type: "straight" }));
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
