import React, { memo, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import katex from "katex";
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  NodeResizer,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
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
  | "compressor"
  | "indexer"
  | "global-select"
  | "kv-merge"
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

type DiagramData = { kind: NodeKind; layer: number; mode: LayerMode; editing?: boolean };
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

const FIT_VIEW_OPTIONS = { padding: .025, minZoom: .18, maxZoom: 1 } as const;
const EDIT_DELETE_KEYS = ["Backspace", "Delete"];
const EDIT_PAN_BUTTONS = [1, 2];

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

function globalKvSourceLayer(layer: number) {
  if (layer < 3) return null;
  if (layer < 9) return 3;
  if (layer < 15) return 9;
  if (layer < 21) return 15;
  return 21;
}

function globalIndexSourceLayer(layer: number) {
  if (layer < 3) return null;
  if (layer < 9) return 3;
  if (layer < 15) return 9;
  if (layer < 21) return 15;
  if (layer < 25) return 21;
  if (layer < 29) return 25;
  if (layer < 33) return 29;
  if (layer < 37) return 33;
  return 37;
}

function compressionRatioForLayer(layer: number) {
  return layer <= 20 ? 2 : 1;
}

function Title({ children }: { children: ReactNode }) {
  return <div style={{ padding: "10px 14px 9px", borderBottom: `1px solid ${COLORS.line}`, fontSize: 15, fontWeight: 800 }}>{children}</div>;
}

function Matrix({ tex, shape, rowTex, tone = "blue" }: { tex: string; shape: string; rowTex: (row: string) => string; tone?: "blue" | "green" | "amber" }) {
  const rows = ["1", "2", "\\vdots", "N"];
  return (
    <div style={{ border: `1.5px solid ${tone === "green" ? COLORS.green : tone === "amber" ? COLORS.amber : COLORS.blue}`, borderRadius: 9, overflow: "hidden" }}>
      <div style={{ padding: "6px 9px", background: tone === "green" ? COLORS.greenSoft : tone === "amber" ? COLORS.amberSoft : COLORS.blueSoft, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <MathFormula tex={tex} /><MathFormula tex={shape} />
      </div>
      <div style={{ padding: 6, display: "grid", gap: 3, borderTop: `1px solid ${COLORS.line}`, fontSize: 9.5 }}>
        {rows.map((row, index) => <div key={`${row}-${index}`} style={{ minHeight: 21, display: "grid", placeItems: "center", border: row === "\\vdots" ? "none" : `1px solid ${COLORS.line}`, borderRadius: 5, background: row === "\\vdots" ? "transparent" : COLORS.card }}><MathFormula tex={row === "\\vdots" ? row : `${rowTex(row)}\\in\\mathbb{R}^{5120}`} /></div>)}
      </div>
    </div>
  );
}

function QueryProjection({ layer }: { layer: number }) {
  return (
    <div style={panel}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle id="output" type="source" position={Position.Left} style={handle} />
      <Title>Query 两级投影 · Layer {layer}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}>
          <Box tone="blue"><MathFormula tex={`X_{${layer}}`} /><br /><MathFormula tex="N\times5120" /></Box>
          <Operator tex="\times" />
          <Box tone="blue"><MathFormula tex={`W_{${layer}}^{Q\\downarrow}`} /><br /><MathFormula tex="5120\times1280" /></Box>
        </div>
        <Arrow vertical />
        <Box tone="blue"><MathFormula tex={`Q_{${layer}}^r=X_{${layer}}W_{${layer}}^{Q\\downarrow}\\in\\mathbb{R}^{N\\times1280}`} /></Box>
        <Arrow vertical />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr", gap: 5, alignItems: "center" }}>
          <Box><MathFormula tex={`Q_{${layer}}^r`} /></Box><Operator tex="\times" /><Box><MathFormula tex={`W_{${layer}}^{Q\\uparrow}\\in\\mathbb{R}^{1280\\times(64\\cdot512)}`} /></Box>
        </div>
        <Box tone="blue"><MathFormula tex={`Q_{${layer}}=[Q_1;Q_2;\\ldots;Q_{64}]\\in\\mathbb{R}^{N\\times64\\times512}`} /></Box>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px 1fr", gap: 5, alignItems: "center" }}><Box><MathFormula tex="Q_1" /></Box><Box><MathFormula tex="Q_2" /></Box><span style={{ textAlign: "center" }}>⋯</span><Box><MathFormula tex="Q_{64}" /></Box></div>
      </div>
    </div>
  );
}

function LocalKvProjection({ layer }: { layer: number }) {
  return (
    <div style={panel}>
      <Handle type="target" position={Position.Top} style={handle} />
      <Handle id="swa" type="source" position={Position.Right} style={handle} />
      <Title>本层独立 KV · <MathFormula tex={`W_{${layer}}^{KV,\\mathrm{SWA}}\\in\\mathbb{R}^{5120\\times512}`} /></Title>
      <div style={{ padding: 10, display: "grid", gap: 7 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}>
          <Box tone="blue"><MathFormula tex={`X_{${layer}}`} /><br /><MathFormula tex="N\times5120" /></Box>
          <Operator tex="\times" />
          <Box tone="green"><MathFormula tex={`W_{${layer}}^{KV,\\mathrm{SWA}}`} /><br />把每个 5120 维 token 行投影成 512 维窗口 KV 行</Box>
        </div>
        <Arrow vertical />
        <Box tone="green"><MathFormula tex={`U_{${layer}}=\\operatorname{RoPE}(\\operatorname{RMSNorm}(X_{${layer}}W_{${layer}}^{KV,\\mathrm{SWA}}))\\in\\mathbb{R}^{N\\times512}`} /></Box>
        <Box tone="green"><MathFormula tex={`U_{${layer}}=[\\mathbf u_{${layer},1};\\mathbf u_{${layer},2};\\ldots;\\mathbf u_{${layer},N}]`} /></Box>
        <Arrow vertical />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px 1fr", gap: 5, alignItems: "center" }}>
          <Box><MathFormula tex={`\\mathbf u_{${layer},1}`} /></Box><Box><MathFormula tex={`\\mathbf u_{${layer},2}`} /></Box><span style={{ textAlign: "center" }}>⋯</span><Box><MathFormula tex={`\\mathbf u_{${layer},N}`} /></Box>
        </div>
      </div>
    </div>
  );
}

type MatrixRowSpec = { row: string; selected?: boolean; ellipsis?: boolean };

function MatrixBracket({ layer, rows, compact = false }: { layer: number; rows: MatrixRowSpec[]; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "8px minmax(0,1fr) 8px", gap: 4, alignItems: "stretch", minWidth: 0 }}>
      <span aria-hidden style={{ borderLeft: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
        {rows.map((item, index) => (
          <div
            key={`${item.row}-${index}`}
            style={{
              minWidth: 0,
              minHeight: compact ? 20 : 22,
              display: "grid",
              gridTemplateColumns: "1fr",
              alignItems: "center",
              gap: 3,
              padding: item.ellipsis ? "1px 4px" : "2px 4px",
              borderRadius: 5,
              border: item.selected ? `1px solid ${COLORS.green}` : "1px solid transparent",
              background: item.selected ? COLORS.greenSoft : "transparent",
              color: item.selected ? COLORS.green : COLORS.ink,
              fontSize: compact ? 9 : 9.5,
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <MathFormula tex={item.ellipsis ? "\\vdots" : `\\mathbf u_{${layer},${item.row}}\\in\\mathbb{R}^{512}`} />
          </div>
        ))}
      </div>
      <span aria-hidden style={{ borderRight: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
    </div>
  );
}

function Head({ index, layer }: { index: number; layer: number }) {
  const attendedKv = `\\mathrm{KV}_{${layer},t}`;
  return (
    <div style={{ border: `1.5px solid ${COLORS.green}`, borderRadius: 10, padding: 8, display: "grid", gap: 5, background: COLORS.card }}>
      <strong style={{ color: COLORS.green, textAlign: "center", fontSize: 12 }}>Head {index}</strong>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.55fr", gap: 5 }}><Box><MathFormula tex={`Q_{${index},t}`} /></Box><Box><MathFormula tex={attendedKv} /></Box></div>
      <Arrow vertical />
      <Box tone="green"><MathFormula tex={`A_{${index},t}=\\operatorname{softmax}(Z_{${index},t})`} /><br /><MathFormula tex={`Z_{${index},t}=Q_{${index},t}\\left(${attendedKv}\\right)^{\\mathsf T}/\\sqrt{d_h}`} /></Box>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 26px 1fr", alignItems: "center", gap: 5 }}><Box><MathFormula tex={`A_{${index},t}`} /></Box><Operator tex="\times" /><Box><MathFormula tex={attendedKv} /></Box></div>
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

function SelectedGlobalRows({ kvSource, indexSource }: { kvSource: number; indexSource: number }) {
  const rows = [
    { label: "1", selected: false },
    { label: `i_{${indexSource},t,1}`, selected: true },
    { label: `i_{${indexSource},t,2}`, selected: true },
    { label: "\\vdots", selected: true, ellipsis: true },
    { label: `i_{${indexSource},t,K_t}`, selected: true },
    { label: "M", selected: false },
  ];
  return <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "44px 8px minmax(0,1fr) 8px", gap: 4, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateRows: `repeat(${rows.length},1fr)`, gap: 3, color: COLORS.muted, fontSize: 10, textAlign: "right", alignItems: "center" }}>{rows.map((row, index) => <span key={`${row.label}-${index}`} style={{ color: row.selected ? COLORS.amber : COLORS.muted, fontWeight: row.selected ? 800 : 500 }}><MathFormula tex={row.label} /></span>)}</div>
      <span aria-hidden style={{ borderLeft: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>{rows.map((row, rowIndex) => <div key={`${row.label}-values-${rowIndex}`} style={{ minHeight: 28, display: "grid", placeItems: "center", padding: "2px 4px", border: row.selected ? `1.5px solid ${COLORS.green}` : "1px solid transparent", borderRadius: 5, background: row.selected ? COLORS.greenSoft : "transparent", textAlign: "center", fontSize: 9.5 }}>{row.ellipsis ? <MathFormula tex="\\vdots" /> : <MathFormula tex={`\\mathbf g_{${kvSource},${row.label}}\\in\\mathbb{R}^{512}`} />}</div>)}</div>
      <span aria-hidden style={{ borderRight: `2px solid ${COLORS.ink}`, borderTop: `2px solid ${COLORS.ink}`, borderBottom: `2px solid ${COLORS.ink}` }} />
    </div>
    <div style={{ paddingLeft: 52, color: COLORS.green, fontSize: 10.5, fontWeight: 800, textAlign: "center" }}>绿色高亮框 = 被行号选中的整条 512 维行向量</div>
  </div>;
}

function DiagramNodeContent({ data }: { data: DiagramData }) {
  const { kind, layer, mode } = data;
  const both = <><Handle type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /></>;

  if (kind === "tensor" || kind === "output") {
    const output = kind === "output";
    return <div style={panel}>{output ? both : <><Handle id="main" type="source" position={Position.Bottom} style={handle} /><Handle id="residual" type="source" position={Position.Left} style={{ ...handle, background: COLORS.amber }} /></>}<Title><MathFormula tex={output ? `H_{${layer}}^{\\mathrm{out}}=H_{${layer}}'+O_{${layer}}^{\\mathrm{FFN}}` : `H_{${layer}}^{\\mathrm{in}}`} /></Title><div style={{ padding: 10 }}><Matrix tex={output ? `H_{${layer}}^{\\mathrm{out}}` : `H_{${layer}}^{\\mathrm{in}}`} shape="N\times5120" rowTex={(row) => output ? `\\mathbf h_{${layer},${row}}^{\\mathrm{out}}` : `\\mathbf h_{${layer},${row}}^{\\mathrm{in}}`} tone={output ? "green" : "blue"} /></div></div>;
  }

  if (kind === "norm1" || kind === "norm2") {
    return <div style={{ ...panel, display: "grid", placeItems: "center", fontSize: 17, fontWeight: 750 }}>{both}<MathFormula tex={kind === "norm1" ? `X_{${layer}}=\\operatorname{RMSNorm}(H_{${layer}}^{\\mathrm{in}};\\gamma_{${layer},1})` : `Y=\\operatorname{RMSNorm}(H_{${layer}}';\\gamma_{${layer},2})`} /></div>;
  }

  if (kind === "projection-q") return <QueryProjection layer={layer} />;
  if (kind === "projection-kv") return <LocalKvProjection layer={layer} />;

  if (kind === "swa-window") {
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="projected-kv" type="target" position={Position.Top} style={{ ...handle, left: mode === "swa" ? "50%" : "90%" }} />
      <Handle id="local-window" type="source" position={Position.Bottom} style={handle} />
      <Title>Layer {layer} 本地 SWA cache · 本层独立拥有，<MathFormula tex="t" /> 是当前 token 行号</Title>
      <div style={{ padding: 10, display: "grid", gap: 8, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 20px 1.1fr 20px 1.15fr", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0, display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}><strong>完整 KV 潜向量矩阵</strong><MathFormula tex={`U_{${layer}}\\in\\mathbb{R}^{N\\times512}`} /></div>
          <MatrixBracket layer={layer} rows={[
            { row: "1" },
            { row: "", ellipsis: true },
            { row: "r-1" },
            { row: "r", selected: true },
            { row: "r+1", selected: true },
            { row: "", selected: true, ellipsis: true },
            { row: "t", selected: true },
            { row: "t+1" },
            { row: "N" },
          ]} compact />
          <span style={{ color: COLORS.green, fontSize: 10.5, fontWeight: 800, textAlign: "center" }}>绿色连续行是当前窗口</span>
        </div>
        <Arrow />
        <Box tone="amber"><strong>窗口起点</strong><br /><MathFormula tex="r=\max(1,t-127)" /><br /><br /><strong>选中连续行</strong><br /><MathFormula tex="r,r+1,\ldots,t" /><br /><br /><strong>保留全部列</strong><br /><MathFormula tex="1,2,\ldots,512" /></Box>
        <Arrow />
        <div style={{ minWidth: 0, display: "grid", gap: 6, padding: 8, border: `1.5px solid ${COLORS.green}`, borderRadius: 9, background: COLORS.greenSoft }}>
          <strong style={{ textAlign: "center" }}>选中的子矩阵</strong>
          <MatrixBracket layer={layer} rows={[
            { row: "r", selected: true },
            { row: "r+1", selected: true },
            { row: "", selected: true, ellipsis: true },
            { row: "t", selected: true },
          ]} />
          <div style={{ textAlign: "center", fontSize: 11 }}><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}\\in\\mathbb{R}^{\\min(128,t)\\times512}`} /></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", border: `1.5px solid ${COLORS.green}`, borderRadius: 8, padding: "6px 8px", background: COLORS.greenSoft, minWidth: 0 }}>
        <strong style={{ fontSize: 11 }}>Decode 环形 cache · 128 槽</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 34px 1fr", gap: 4, minWidth: 0 }}><Box><MathFormula tex={`\\mathbf u_{${layer},t-127}`} /></Box><Box><MathFormula tex={`\\mathbf u_{${layer},t-126}`} /></Box><span style={{ display: "grid", placeItems: "center" }}>⋯</span><Box><MathFormula tex={`\\mathbf u_{${layer},t}`} /></Box></div>
        <span style={{ color: COLORS.muted, fontSize: 10.5 }}>下一个 token 写入，覆盖最旧槽</span>
      </div>
      </div>
    </div>;
  }

  if (kind === "compressor") {
    const kvSource = globalKvSourceLayer(layer)!;
    const ratio = compressionRatioForLayer(kvSource);
    const writesKv = mode === "full";
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="input" type="target" position={Position.Top} style={handle} />
      <Handle id="to-indexer" type="source" position={Position.Bottom} style={handle} />
      <Title>{writesKv ? <>全局 KV 生成 · Layer {layer} Compressor</> : <>读取 Layer {kvSource} 已生成的全局 KV</>}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7, fontSize: 11, minWidth: 0 }}>
        {writesKv ? <>
          <div style={{ display: "grid", gridTemplateColumns: ratio === 2 ? "1fr 1fr" : "1fr", gap: 7 }}>
            <div style={{ display: "grid", gap: 5 }}><Box tone="blue"><MathFormula tex={`X_{${layer}}\\in\\mathbb{R}^{N\\times5120}`} /></Box><Operator tex="\times" /><Box><MathFormula tex={`W_{${layer}}^{KV,c}\\in\\mathbb{R}^{5120\\times512}`} /><br />生成待压缩 KV 行</Box><Arrow vertical /><Box tone="green"><MathFormula tex={`V=X_{${layer}}W_{${layer}}^{KV,c}\\in\\mathbb{R}^{N\\times512}`} /></Box></div>
            {ratio === 2 && <div style={{ display: "grid", gap: 5 }}><Box tone="blue"><MathFormula tex={`X_{${layer}}\\in\\mathbb{R}^{N\\times5120}`} /></Box><Operator tex="\times" /><Box tone="amber"><MathFormula tex={`W_{${layer}}^{gate}\\in\\mathbb{R}^{5120\\times512}`} /><br />生成两行之间的逐元素池化分数</Box><Arrow vertical /><Box tone="amber"><MathFormula tex={`A=X_{${layer}}W_{${layer}}^{gate}\\in\\mathbb{R}^{N\\times512}`} /></Box></div>}
          </div>
          <Arrow vertical />
          {ratio === 2 ? <div style={{ display: "grid", gap: 7 }}>
            <Box tone="amber"><strong>每连续 2 行生成两组逐元素权重</strong><br /><MathFormula tex={`[\\boldsymbol\\alpha_{i,1};\\boldsymbol\\alpha_{i,2}]=\\operatorname{softmax}_{\\mathrm{row}}([\\mathbf a_{2i-1};\\mathbf a_{2i}])`} /></Box>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr 42px 1fr", alignItems: "center", gap: 5 }}>
              <Box><MathFormula tex={`\\mathbf v_{2i-1}\\in\\mathbb{R}^{512}`} /></Box><Operator tex="\odot" /><Box tone="amber"><MathFormula tex={`\\boldsymbol\\alpha_{i,1}\\in\\mathbb{R}^{512}`} /></Box><Operator tex="+" /><Box><MathFormula tex={`\\boldsymbol\\alpha_{i,2}\\odot\\mathbf v_{2i}`} /></Box>
            </div>
            <Arrow vertical />
            <Box tone="green"><MathFormula tex={`\\mathbf g_i=\\operatorname{RMSNorm}(\\boldsymbol\\alpha_{i,1}\\odot\\mathbf v_{2i-1}+\\boldsymbol\\alpha_{i,2}\\odot\\mathbf v_{2i})\\in\\mathbb{R}^{512}`} /></Box>
          </div> : <Box tone="amber"><strong>压缩比为 1，不做行池化</strong><br /><MathFormula tex={`\\mathbf g_i=\\operatorname{RMSNorm}(\\mathbf v_i)`} /></Box>}
        </> : <Box tone="blue"><strong>本层不重新计算</strong><br />直接读取源层输出矩阵</Box>}
        <Box tone="green"><strong>共享全局 KV 矩阵</strong><br /><MathFormula tex={`G_{${kvSource}}=[\\mathbf g_{${kvSource},1};\\mathbf g_{${kvSource},2};\\ldots;\\mathbf g_{${kvSource},M}]\\in\\mathbb{R}^{M\\times512}`} /><br /><MathFormula tex={`M=\\lfloor N/${ratio}\\rfloor`} /></Box>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 5 }}><Box><MathFormula tex={`\\mathbf g_{${kvSource},1}`} /></Box><Box><MathFormula tex={`\\mathbf g_{${kvSource},2}`} /></Box><span style={{ display: "grid", placeItems: "center" }}>⋯</span><Box><MathFormula tex={`\\mathbf g_{${kvSource},M}`} /></Box></div>
      </div>
    </div>;
  }

  if (kind === "indexer") {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    const writesIndex = mode === "full" || mode === "reindex";
    return <div style={{ ...panel, borderColor: COLORS.amber }}>
      <Handle id="global-matrix" type="target" position={Position.Top} style={handle} />
      <Handle id="matrix" type="source" position={Position.Bottom} style={{ ...handle, left: "30%" }} />
      <Handle id="indices" type="source" position={Position.Bottom} style={{ ...handle, left: "70%", background: COLORS.amber }} />
      <Title>{writesIndex ? <>Top-512 行选择 · Layer {layer} Indexer</> : <>复用 Layer {indexSource} 已算出的 Top-512 行号</>}</Title>
      <div style={{ padding: 10, display: "grid", gap: 7, fontSize: 11, minWidth: 0 }}>
        {writesIndex ? <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box tone="blue"><MathFormula tex={`Q_{${layer}}^r\\in\\mathbb{R}^{N\\times1280}`} /></Box><Box tone="blue"><MathFormula tex={`X_{${layer}}\\in\\mathbb{R}^{N\\times5120}`} /></Box><Box tone="green"><MathFormula tex={`G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`} /></Box></div>
          <Arrow vertical />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Box><MathFormula tex={`Q_{${layer}}^I=Q_{${layer}}^rW_{${layer}}^{IQ}`} /><br /><MathFormula tex="N\times32\times128" /></Box><Box><MathFormula tex={`\\omega_{${layer}}=X_{${layer}}W_{${layer}}^{IW}`} /><br /><MathFormula tex="N\times32" /></Box><Box><MathFormula tex={`K_{${kvSource}}^I=G_{${kvSource}}W_{${kvSource}}^{IK}`} /><br /><MathFormula tex="M\times128" /></Box></div>
          <Arrow vertical />
          <Box tone="amber"><MathFormula tex={`S_{${layer}}=\\sum_{h=1}^{32}\\omega_h\\operatorname{ReLU}(Q_{${layer},h}^I(K_{${kvSource}}^I)^{\\mathsf T}/\\sqrt{128})\\in\\mathbb{R}^{N\\times M}`} /></Box>
        </> : <Box tone="blue"><strong>本层不重复打分</strong><br /><MathFormula tex={`S_{${indexSource}}\\in\\mathbb{R}^{N\\times M}`} /> 已由 Layer {indexSource} 算好</Box>}
        <Arrow vertical />
        <Box tone="amber"><MathFormula tex={`K_t=\\min(512,\\lfloor t/${compressionRatioForLayer(kvSource)}\\rfloor)`} /><br /><MathFormula tex={`I_{${indexSource},t}=\\operatorname{TopK}(S_{${indexSource}}[t,:],K_t)\\in\\mathbb{N}^{K_t}`} /><br />输出是最多 512 个行号，不是 KV 向量</Box>
      </div>
    </div>;
  }

  if (kind === "global-select") {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="matrix" type="target" position={Position.Top} style={{ ...handle, left: "30%" }} />
      <Handle id="indices" type="target" position={Position.Top} style={{ ...handle, left: "70%", background: COLORS.amber }} />
      <Handle id="selected" type="source" position={Position.Bottom} style={handle} />
      <Title>把 <MathFormula tex={`I_{${indexSource},t}`} /> 中的 <MathFormula tex="K_t\le512" /> 个行号，在 <MathFormula tex={`G_{${kvSource}}\in\mathbb{R}^{M\times512}`} /> 中逐行高亮</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1.55fr 34px .8fr", alignItems: "center", gap: 10, minWidth: 0 }}>
        <SelectedGlobalRows kvSource={kvSource} indexSource={indexSource} />
        <Arrow />
        <Box tone="green"><strong>取出高亮的整行</strong><br /><MathFormula tex={`G_{${kvSource},t}^{\\mathrm{selected}}\\in\\mathbb{R}^{K_t\\times512}`} /><br /><br />行数最多 512<br />每行仍是 512 维 KV 向量</Box>
      </div>
    </div>;
  }

  if (kind === "kv-merge") {
    const kvSource = globalKvSourceLayer(layer);
    const indexSource = globalIndexSourceLayer(layer);
    const hasGlobal = kvSource !== null && indexSource !== null;
    return <div style={{ ...panel, borderColor: COLORS.green }}>
      <Handle id="local" type="target" position={Position.Top} style={{ ...handle, left: hasGlobal ? "30%" : "50%" }} />
      {hasGlobal && <Handle id="global" type="target" position={Position.Top} style={{ ...handle, left: "70%" }} />}
      <Handle id="kv" type="source" position={Position.Bottom} style={handle} />
      <Title>{hasGlobal ? "沿 KV 行维拼接：本地窗口 + 选中的全局行" : "SWA-only：Head 只读取本地窗口"}</Title>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: hasGlobal ? "1fr 30px 1fr 30px 1.3fr" : "1fr 30px 1.3fr", alignItems: "center", gap: 6, minWidth: 0 }}>
        <Box tone="green"><MathFormula tex={`U_{${layer},t}^{\\mathrm{SWA}}`} /><br /><MathFormula tex="\min(128,t)\times512" /></Box><Arrow />
        {hasGlobal && <><Box tone="green"><MathFormula tex={`G_{${kvSource},t}^{\\mathrm{selected}}`} /><br /><MathFormula tex="K_t\times512" /></Box><Arrow /></>}
        <Box tone="green"><MathFormula tex={hasGlobal ? `\\mathrm{KV}_{${layer},t}=[U_{${layer},t}^{\\mathrm{SWA}};G_{${kvSource},t}^{\\mathrm{selected}}]` : `\\mathrm{KV}_{${layer},t}=U_{${layer},t}^{\\mathrm{SWA}}`} /><br />{hasGlobal && <MathFormula tex="(\min(128,t)+K_t)\times512" />}</Box>
      </div>
    </div>;
  }

  if (kind === "heads") {
    return <div style={panel}><Handle id="q" type="target" position={Position.Left} style={handle} /><Handle id="kv" type="target" position={Position.Top} style={handle} /><Handle type="source" position={Position.Bottom} style={handle} /><Title>64 个 Head 读取同一个 <MathFormula tex={`\\mathrm{KV}_{${layer},t}`} />，每个 Head 使用自己的 <MathFormula tex={`Q_{h,t}`} /></Title><div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 64px 1fr", gap: 8 }}><Head index={1} layer={layer} /><Head index={2} layer={layer} /><div style={{ display: "grid", placeItems: "center", color: COLORS.faint, fontSize: 26 }}>⋯</div><Head index={64} layer={layer} /></div></div>;
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

function DiagramNodeView({ data, selected }: NodeProps<DiagramNode>) {
  const compact = data.kind === "add1" || data.kind === "add2" || data.kind === "moe-sum";
  return <div style={{ width: "100%", height: "100%", position: "relative" }}>
    {data.editing && <NodeResizer isVisible={selected} minWidth={compact ? 60 : 160} minHeight={compact ? 60 : 64} color={COLORS.green} handleStyle={{ width: 10, height: 10, borderRadius: 3 }} lineStyle={{ borderWidth: 1.5 }} />}
    <DiagramNodeContent data={data} />
  </div>;
}

const NodeView = memo(DiagramNodeView);
const nodeTypes = { diagram: NodeView };

function node(id: string, kind: NodeKind, layer: number, mode: LayerMode, x: number, y: number, width: number, height: number): DiagramNode {
  return { id, type: "diagram", position: { x, y }, data: { kind, layer, mode }, style: { width, height }, deletable: false };
}

function buildGraph(layer: number): { nodes: DiagramNode[]; edges: Edge[] } {
  const mode = modeForLayer(layer);
  const hasGlobal = mode !== "swa";
  const mainGap = 70;
  const inputY = 0;
  const tensorHeight = 230;
  const norm1Y = inputY + tensorHeight + 55;
  const projectionY = norm1Y + 72 + mainGap;
  const projectionHeight = 430;
  const swaHeight = 480;
  const compressorHeight = mode === "full" && compressionRatioForLayer(layer) === 2 ? 720 : 450;
  const indexerHeight = 450;
  const globalSelectHeight = 430;
  const sourceRowHeight = hasGlobal ? Math.max(projectionHeight, compressorHeight) : projectionHeight;
  const swaY = projectionY + sourceRowHeight + mainGap;
  const globalSelectY = swaY + indexerHeight + mainGap;
  const mergeY = hasGlobal ? Math.max(swaY + swaHeight, globalSelectY + globalSelectHeight) + mainGap : swaY + swaHeight + mainGap;
  const mergeHeight = 200;
  const headsY = mergeY + mergeHeight + mainGap;
  const headsHeight = 420;
  const concatY = headsY + headsHeight + mainGap;
  const concatHeight = 130;
  const add1Y = concatY + concatHeight + mainGap;
  const state1Y = add1Y + 70 + mainGap;
  const norm2Y = state1Y + 72 + mainGap;
  const moeInputY = norm2Y + 72 + mainGap;
  const routerY = moeInputY + 80 + mainGap;
  const scoresY = routerY + 130 + mainGap;
  const expertsY = scoresY + 115 + mainGap;
  const aggregateY = expertsY + 480 + mainGap;
  const moeSumY = aggregateY + 125 + mainGap;
  const moeOutputY = moeSumY + 70 + mainGap;
  const add2Y = moeOutputY + 72 + mainGap;
  const outputY = add2Y + 70 + mainGap;
  const nodes: DiagramNode[] = [
    node("input", "tensor", layer, mode, 610, inputY, 380, tensorHeight),
    node("norm1", "norm1", layer, mode, 620, norm1Y, 360, 72),
    node("q", "projection-q", layer, mode, hasGlobal ? 40 : 160, projectionY, hasGlobal ? 440 : 520, projectionHeight),
    node("kv", "projection-kv", layer, mode, hasGlobal ? 540 : 920, projectionY, hasGlobal ? 480 : 520, projectionHeight),
    node("swa-window", "swa-window", layer, mode, hasGlobal ? 40 : 280, swaY, hasGlobal ? 780 : 1040, swaHeight),
    node("kv-merge", "kv-merge", layer, mode, hasGlobal ? 300 : 400, mergeY, hasGlobal ? 1000 : 800, mergeHeight),
    node("heads", "heads", layer, mode, 240, headsY, 1040, headsHeight),
    node("concat", "concat", layer, mode, 350, concatY, 840, concatHeight),
    node("add1", "add1", layer, mode, 765, add1Y, 70, 70),
    node("state1", "state1", layer, mode, 620, state1Y, 360, 72),
    node("norm2", "norm2", layer, mode, 620, norm2Y, 360, 72),
    node("moe-input", "moe-input", layer, mode, 715, moeInputY, 170, 80),
    node("router", "router", layer, mode, 440, routerY, 720, 130),
    node("scores", "scores", layer, mode, 278, scoresY, 1252, 115),
    node("experts", "experts", layer, mode, 70, expertsY, 1460, 480),
    node("aggregate", "aggregate", layer, mode, 70, aggregateY, 1460, 125),
    node("moe-sum", "moe-sum", layer, mode, 765, moeSumY, 70, 70),
    node("moe-output", "moe-output", layer, mode, 620, moeOutputY, 360, 72),
    node("add2", "add2", layer, mode, 765, add2Y, 70, 70),
    node("output", "output", layer, mode, 610, outputY, 380, tensorHeight),
  ];
  if (hasGlobal) {
    nodes.push(node("compressor", "compressor", layer, mode, 1080, projectionY, 480, compressorHeight));
    nodes.push(node("indexer", "indexer", layer, mode, 860, swaY, 700, indexerHeight));
    nodes.push(node("global-select", "global-select", layer, mode, 860, globalSelectY, 700, globalSelectHeight));
  }

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
    mathEdge("norm-q", "norm1", "q", `X_{${layer}}`),
    mathEdge("norm-kv", "norm1", "kv", `X_{${layer}}`),
    mathEdge("q-heads", "q", "heads", "Q_1,Q_2,\\ldots,Q_{64}", { sourceHandle: "output", targetHandle: "q" }),
    mathEdge("kv-swa", "kv", "swa-window", `U_{${layer}}\\in\\mathbb{R}^{N\\times512}`, { sourceHandle: "swa", targetHandle: "projected-kv" }),
    mathEdge("swa-merge", "swa-window", "kv-merge", `U_{${layer},t}^{\\mathrm{SWA}}`, { sourceHandle: "local-window", targetHandle: "local" }),
    mathEdge("merge-heads", "kv-merge", "heads", `\\mathrm{KV}_{${layer},t}`, { sourceHandle: "kv", targetHandle: "kv" }),
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
  if (hasGlobal) {
    const kvSource = globalKvSourceLayer(layer)!;
    const indexSource = globalIndexSourceLayer(layer)!;
    if (mode === "full") edges.push(mathEdge("norm-compressor", "norm1", "compressor", `X_{${layer}}`, { targetHandle: "input" }));
    edges.push(mathEdge("compressor-indexer", "compressor", "indexer", `G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`, { sourceHandle: "to-indexer", targetHandle: "global-matrix" }));
    edges.push(mathEdge("indexer-matrix", "indexer", "global-select", `G_{${kvSource}}\\in\\mathbb{R}^{M\\times512}`, { sourceHandle: "matrix", targetHandle: "matrix" }));
    edges.push(mathEdge("indexer-select", "indexer", "global-select", `I_{${indexSource},t}\\in\\mathbb{N}^{K_t}`, { sourceHandle: "indices", targetHandle: "indices", style: { stroke: COLORS.amber, strokeWidth: 2.2 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.amber } }));
    edges.push(mathEdge("select-merge", "global-select", "kv-merge", `G_{${kvSource},t}^{\\mathrm{selected}}`, { sourceHandle: "selected", targetHandle: "global" }));
  }
  return { nodes, edges };
}

type SavedDiagramLayout = {
  nodes: Array<{ id: string; x: number; y: number; width?: number; height?: number }>;
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null; type?: string }>;
};

const editorButton: CSSProperties = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: 7,
  background: COLORS.card,
  color: COLORS.ink,
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 750,
  cursor: "pointer",
};

function storedDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function applySavedLayout(graph: { nodes: DiagramNode[]; edges: Edge[] }, saved: SavedDiagramLayout) {
  const nodeLayouts = new Map(saved.nodes.map((item) => [item.id, item]));
  const nodes = graph.nodes.map((item) => {
    const layout = nodeLayouts.get(item.id);
    if (!layout) return item;
    return {
      ...item,
      position: { x: layout.x, y: layout.y },
      style: { ...item.style, ...(layout.width ? { width: layout.width } : {}), ...(layout.height ? { height: layout.height } : {}) },
    };
  });
  const baselineEdges = new Map(graph.edges.map((item) => [item.id, item]));
  const nodeIds = new Set(nodes.map((item) => item.id));
  const edges = saved.edges
    .filter((item) => nodeIds.has(item.source) && nodeIds.has(item.target))
    .map((item) => baselineEdges.get(item.id) ?? ({
      ...item,
      type: item.type ?? "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.green },
      style: { stroke: COLORS.green, strokeWidth: 2.2 },
    } satisfies Edge));
  return { nodes, edges };
}

function DiagramCanvas({ layer }: { layer: number }) {
  const initialGraph = useMemo(() => buildGraph(layer), [layer]);
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [editing, setEditing] = useState(false);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const storageKey = `oasismind:deepseek-v41-layer-layout:v1:${layer}`;

  useEffect(() => {
    let graph = initialGraph;
    // [OM-FREEPLAY] 用户要求能自行微调；显式保存到浏览器本机，避免刷新后丢失，同时不改文章事实源。
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) graph = applySavedLayout(initialGraph, JSON.parse(raw) as SavedDiagramLayout);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setSelectedEdgeIds([]);
    setSaveState("idle");
  }, [initialGraph, storageKey]);

  useEffect(() => {
    setNodes((current) => current.map((item) => ({ ...item, data: { ...item.data, editing }, selected: editing ? item.selected : false })));
    if (!editing) setSelectedEdgeIds([]);
  }, [editing]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((current) => addEdge({
      ...connection,
      id: `manual-${Date.now()}`,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: COLORS.green },
      style: { stroke: COLORS.green, strokeWidth: 2.2 },
    }, current));
    setSaveState("idle");
  }, [setEdges]);

  const saveLayout = useCallback(() => {
    const payload: SavedDiagramLayout = {
      nodes: nodes.map((item) => ({
        id: item.id,
        x: item.position.x,
        y: item.position.y,
        width: storedDimension(item.style?.width) ?? storedDimension(item.measured?.width),
        height: storedDimension(item.style?.height) ?? storedDimension(item.measured?.height),
      })),
      edges: edges.map((item) => ({ id: item.id, source: item.source, target: item.target, sourceHandle: item.sourceHandle, targetHandle: item.targetHandle, type: item.type })),
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [edges, nodes, storageKey]);

  const resetLayout = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setNodes(initialGraph.nodes.map((item) => ({ ...item, data: { ...item.data, editing } })));
    setEdges(initialGraph.edges);
    setSelectedEdgeIds([]);
    setSaveState("idle");
  }, [editing, initialGraph, setEdges, setNodes, storageKey]);

  const deleteSelectedEdges = useCallback(() => {
    const selected = new Set(selectedEdgeIds);
    setEdges((current) => current.filter((item) => !selected.has(item.id)));
    setSelectedEdgeIds([]);
    setSaveState("idle");
  }, [selectedEdgeIds, setEdges]);

  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    onNodesChange(changes);
    if (editing) setSaveState("idle");
  }, [editing, onNodesChange]);

  const handleEdgesChange = useCallback((changes: Parameters<typeof onEdgesChange>[0]) => {
    onEdgesChange(changes);
    if (editing) setSaveState("idle");
  }, [editing, onEdgesChange]);

  const handleSelectionChange = useCallback(({ edges: selectedEdges }: { edges: Edge[] }) => {
    setSelectedEdgeIds(selectedEdges.map((item) => item.id));
  }, []);

  return <>
    <div style={{ position: "absolute", top: 12, right: 16, zIndex: 8, display: "flex", alignItems: "center", gap: 6, padding: 7, border: `1px solid ${COLORS.line}`, borderRadius: 9, background: "rgba(255,254,250,.96)", boxShadow: "0 4px 14px rgba(42,41,36,.08)" }}>
      <button type="button" onClick={() => setEditing((value) => !value)} style={{ ...editorButton, borderColor: editing ? COLORS.green : COLORS.line, background: editing ? COLORS.greenSoft : COLORS.card, color: editing ? COLORS.green : COLORS.ink }}>{editing ? "结束编辑" : "编辑布局"}</button>
      {editing && <>
        <button type="button" onClick={saveLayout} style={{ ...editorButton, color: saveState === "error" ? COLORS.rose : COLORS.ink }}>{saveState === "saved" ? "已保存到本机" : saveState === "error" ? "保存失败，请重试" : "保存到本机"}</button>
        <button type="button" onClick={deleteSelectedEdges} disabled={selectedEdgeIds.length === 0} style={{ ...editorButton, opacity: selectedEdgeIds.length ? 1 : .45, cursor: selectedEdgeIds.length ? "pointer" : "default" }}>删除选中连线</button>
        <button type="button" onClick={resetLayout} style={editorButton}>恢复自动布局</button>
        <span style={{ color: COLORS.muted, fontSize: 10.5 }}>拖框 · 选框后拉角点 · 从端口拖出连线 · 右键拖动画布</span>
      </>}
    </div>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onSelectionChange={handleSelectionChange}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      minZoom={.18}
      maxZoom={1.5}
      nodesDraggable={editing}
      nodesConnectable={editing}
      nodesFocusable={editing}
      edgesFocusable={editing}
      edgesReconnectable={editing}
      elementsSelectable={editing}
      deleteKeyCode={editing ? EDIT_DELETE_KEYS : null}
      panOnDrag={editing ? EDIT_PAN_BUTTONS : true}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#d7d2c7" gap={28} size={1} />
      <Controls showInteractive={false} position="top-left" />
    </ReactFlow>
  </>;
}

export const DeepSeekV41Layer: React.FC<Props> = ({ initialLayer = 1 }) => {
  const [layer, setLayer] = useState(() => Math.min(40, Math.max(1, Math.round(initialLayer))));
  const mode = modeForLayer(layer);
  return <div style={{ width: "100%", height: "100%", background: COLORS.paper, fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif", position: "relative" }}>
    <div style={{ position: "absolute", inset: "0 0 auto 0", zIndex: 10, minHeight: 122, padding: "18px 22px 14px", background: "rgba(247,245,240,.97)", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 12 }}><div><strong style={{ fontSize: 21 }}>DeepSeek V4.1-Flash · Layer {layer}</strong><span style={{ marginLeft: 12, color: mode === "full" ? COLORS.green : mode === "reindex" ? COLORS.amber : mode === "reuse" ? COLORS.blue : COLORS.rose, fontWeight: 800 }}>{modeLabel(mode)}</span></div><span style={{ color: COLORS.muted, fontSize: 12 }}>阅读模式可平移缩放 · 编辑模式可拖框、改尺寸、增删连线</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(20,1fr)", gap: 4 }}>{Array.from({ length: 40 }, (_, i) => i + 1).map((value) => { const valueMode = modeForLayer(value); const active = value === layer; const color = valueMode === "full" ? COLORS.green : valueMode === "reindex" ? COLORS.amber : valueMode === "reuse" ? COLORS.blue : COLORS.rose; return <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={active} style={{ border: `1px solid ${active ? color : COLORS.line}`, background: active ? color : COLORS.card, color: active ? "white" : color, borderRadius: 5, padding: "4px 0", fontWeight: 750, fontSize: 10.5, cursor: "pointer" }}>{value}</button>; })}</div>
    </div>
    <div style={{ position: "absolute", inset: "122px 0 0" }}><DiagramCanvas key={layer} layer={layer} /></div>
  </div>;
};
