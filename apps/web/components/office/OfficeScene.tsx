"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  RoundedBox,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import {
  ARCHITECTURE_BOARD,
  BOOKSHELF_TITLES,
  DESK_STICKY_NOTES,
  KNOWLEDGE_BOARD,
  MONITOR_FORMULA_CARDS,
  type DeskStickyNote,
  type OfficeFormulaCard,
  type OfficeHotspotId,
} from "./officeContent";
import { OfficeFormulaScreen } from "./OfficeFormulaScreen";
import { OfficeRichMd } from "./OfficeRichMd";
import { OFFICE_VIEWS, WALK_BOUNDS, type OfficeViewId } from "./officeNav";

type OrbitLike = {
  target: THREE.Vector3;
  update: () => void;
};

/** 浅色高端工位：白橡 / 雾灰 / 品牌蓝点缀——告别监狱黑 */
const BG = "#F3F6FA";
const WALL = "#FAFBFD";
const WALL_SOFT = "#EEF3F9";
const FLOOR = "#E8EEF5";
const FLOOR_GRID = "#D5DEE9";
const DESK_TOP = "#F7F1E8";
const LEG = "#D1D9E4";
const METAL = "#A8B4C4";
const CHAIR = "#E8EEF5";
const CHAIR_ACCENT = "#7DD3FC";
const CHAIR_FRAME = "#CBD5E1";
const ACCENT = "#38BDF8";
const NVIDIA = "#76B900";
const PAPER = "#FFFEF9";
const INK = "#1E3A5F";

interface OfficeSceneProps {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
  viewId: OfficeViewId;
}

function useHoverCursor() {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };
}

function HotspotGlow({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = active ? 0.2 + Math.sin(clock.elapsedTime * 3) * 0.05 : 0;
  });
  return (
    <mesh ref={ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 28]} />
      <meshBasicMaterial color="#0087EB" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** WASD 平移 + 预设机位插值；鼠标拖拽仍由 OrbitControls 环顾 */
function CameraNavigator({
  viewId,
  controlsRef,
}: {
  viewId: OfficeViewId;
  controlsRef: MutableRefObject<OrbitLike | null>;
}) {
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const targetView = useRef(viewId);
  const lerpT = useRef(1);

  useEffect(() => {
    targetView.current = viewId;
    if (viewId !== "walk") lerpT.current = 0;
  }, [viewId]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = true;
      if (k === "s" || k === "arrowdown") keys.current.s = true;
      if (k === "a" || k === "arrowleft") keys.current.a = true;
      if (k === "d" || k === "arrowright") keys.current.d = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = false;
      if (k === "s" || k === "arrowdown") keys.current.s = false;
      if (k === "a" || k === "arrowleft") keys.current.a = false;
      if (k === "d" || k === "arrowright") keys.current.d = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const speed = 2.4 * Math.min(dt, 0.05);

    if (lerpT.current < 1 && targetView.current !== "walk") {
      const preset = OFFICE_VIEWS[targetView.current];
      lerpT.current = Math.min(1, lerpT.current + dt * 1.6);
      const t = 1 - Math.pow(1 - lerpT.current, 3);
      camera.position.lerp(new THREE.Vector3(...preset.position), t);
      controls.target.lerp(new THREE.Vector3(...preset.target), t);
      controls.update();
      return;
    }

    const { w, a, s, d } = keys.current;
    if (!(w || a || s || d)) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    else forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (w) move.add(forward);
    if (s) move.sub(forward);
    if (d) move.add(right);
    if (a) move.sub(right);
    if (move.lengthSq() < 1e-6) return;
    move.normalize().multiplyScalar(speed);

    const next = camera.position.clone().add(move);
    next.x = THREE.MathUtils.clamp(next.x, WALK_BOUNDS.minX, WALK_BOUNDS.maxX);
    next.z = THREE.MathUtils.clamp(next.z, WALK_BOUNDS.minZ, WALK_BOUNDS.maxZ);
    next.y = WALK_BOUNDS.y;
    const delta = next.clone().sub(camera.position);
    camera.position.copy(next);
    controls.target.add(delta);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.6, 2.8);
    controls.update();
  });

  return null;
}

function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={FLOOR} roughness={0.85} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`gx-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-4.2 + i * 1.2, 0.002, 0]}>
          <planeGeometry args={[0.012, 12]} />
          <meshStandardMaterial color={FLOOR_GRID} roughness={1} />
        </mesh>
      ))}

      <mesh position={[0, 2.2, -4.8]} receiveShadow>
        <boxGeometry args={[12, 4.4, 0.12]} />
        <meshStandardMaterial color={WALL} roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.15, -4.72]}>
        <planeGeometry args={[10.5, 3.6]} />
        <meshStandardMaterial color={WALL_SOFT} roughness={0.8} />
      </mesh>
      <mesh position={[-5.4, 2.2, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.4, 12]} />
        <meshStandardMaterial color={WALL} roughness={0.92} />
      </mesh>
      <mesh position={[5.4, 2.2, 0]} receiveShadow>
        <boxGeometry args={[0.12, 4.4, 12]} />
        <meshStandardMaterial color="#F5F8FC" roughness={0.92} />
      </mesh>

      <RoundedBox args={[7.2, 0.08, 0.32]} radius={0.04} position={[0, 4.2, -0.8]}>
        <meshStandardMaterial color="#FFFFFF" emissive="#E0F2FE" emissiveIntensity={0.55} />
      </RoundedBox>
      <pointLight position={[0, 4.0, -0.8]} intensity={1.0} distance={14} color="#F8FAFC" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.004, 0.15]} receiveShadow>
        <circleGeometry args={[2.9, 64]} />
        <meshStandardMaterial color="#E4EDF7" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * drei Html(transform) 的 CSS 像素→世界单位换算不是 1:1。
 * 固定设计分辨率 + 按世界宽标定 scale，使屏内容铺满机壳可视区。
 */
const FORMULA_SCREEN_CSS_W = 420;

/** 显示器：浅色框 + Html/Markdown 内容屏 */
function FormulaMonitor({
  w,
  h,
  card,
  cssW = FORMULA_SCREEN_CSS_W,
}: {
  w: number;
  h: number;
  card: OfficeFormulaCard;
  cssW?: number;
}) {
  const cssH = Math.max(220, Math.round(cssW * (h / w)));
  const htmlScale = w / 12;
  return (
    <group>
      <RoundedBox args={[w, h, 0.05]} radius={0.025} castShadow>
        <meshStandardMaterial color="#F1F5F9" roughness={0.4} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[w * 0.94, h * 0.9]} />
        <meshStandardMaterial color="#F8FAFC" emissive="#E0F2FE" emissiveIntensity={0.22} roughness={0.35} />
      </mesh>
      <Html
        transform
        position={[0, 0, 0.036]}
        scale={htmlScale}
        style={{ pointerEvents: "none" }}
        zIndexRange={[40, 0]}
      >
        <div style={{ width: cssW, height: cssH, transform: "scale(1)", transformOrigin: "center center" }}>
          <OfficeFormulaScreen card={card} widthPx={cssW} heightPx={cssH} compact />
        </div>
      </Html>
    </group>
  );
}

/** 带鱼屏：深色超宽机壳 + 单层内容（不嵌套第二道边框） */
function UltrawideMonitor({ w, h, card }: { w: number; h: number; card: OfficeFormulaCard }) {
  const cssW = Math.min(720, Math.round(520 * (w / 1.55)));
  const cssH = Math.max(200, Math.round(cssW * (h / w)));
  const htmlScale = (w * 0.94) / 12;
  return (
    <group>
      <RoundedBox args={[w, h, 0.055]} radius={0.03} castShadow>
        <meshStandardMaterial color="#0F172A" roughness={0.35} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w * 0.94, h * 0.88]} />
        <meshStandardMaterial color="#F8FAFC" emissive="#E0F2FE" emissiveIntensity={0.2} roughness={0.35} />
      </mesh>
      <Html
        transform
        position={[0, 0, 0.038]}
        scale={htmlScale}
        style={{ pointerEvents: "none" }}
        zIndexRange={[40, 0]}
      >
        <div style={{ width: cssW, height: cssH }}>
          <OfficeFormulaScreen card={card} widthPx={cssW} heightPx={cssH} compact />
        </div>
      </Html>
      <RoundedBox args={[w * 0.2, 0.035, 0.11]} radius={0.012} position={[0, -h / 2 - 0.055, 0.02]} castShadow>
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, -h / 2 - 0.02, 0.02]}>
        <cylinderGeometry args={[0.022, 0.03, 0.07, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.35} />
      </mesh>
    </group>
  );
}

function StickyNoteMesh({ note }: { note: DeskStickyNote }) {
  const w = 0.28;
  const h = 0.28;
  return (
    <group rotation={[-Math.PI / 2 + 0.02, 0, note.rotate]}>
      <RoundedBox args={[w, h, 0.008]} radius={0.01} castShadow>
        <meshStandardMaterial color={note.color} roughness={0.9} />
      </RoundedBox>
      <Html
        transform
        position={[0, 0, 0.008]}
        scale={w / 10}
        style={{ pointerEvents: "none" }}
        zIndexRange={[28, 0]}
      >
        <div
          style={{
            width: 160,
            height: 160,
            padding: "10px 12px",
            boxSizing: "border-box",
            fontFamily: "ui-rounded, \"Segoe UI\", system-ui, sans-serif",
            color: note.ink,
            background: "transparent",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{note.title}</div>
          <div style={{ fontSize: 11, lineHeight: 1.45, whiteSpace: "pre-line", fontWeight: 600 }}>
            {note.body}
          </div>
        </div>
      </Html>
    </group>
  );
}

function GamingDeskSet({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  const deskY = 0.74;

  return (
    <group position={[0.1, 0, 0.1]}>
      <RoundedBox args={[3.6, 0.08, 1.35]} radius={0.06} position={[0, deskY, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DESK_TOP} roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.15, 0.08, 2.1]} radius={0.06} position={[1.85, deskY, -0.55]} castShadow receiveShadow>
        <meshStandardMaterial color={DESK_TOP} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, deskY - 0.045, 0.66]}>
        <boxGeometry args={[3.4, 0.015, 0.025]} />
        <meshStandardMaterial color="#BAE6FD" emissive="#7DD3FC" emissiveIntensity={0.45} />
      </mesh>

      {[
        [-1.5, 0.37, -0.48],
        [1.35, 0.37, -0.48],
        [-1.5, 0.37, 0.48],
        [1.35, 0.37, 0.48],
        [2.2, 0.37, -1.35],
        [2.2, 0.37, 0.3],
      ].map((p, i) => (
        <RoundedBox key={i} args={[0.08, 0.72, 0.08]} radius={0.02} position={p as [number, number, number]} castShadow>
          <meshStandardMaterial color={LEG} roughness={0.45} metalness={0.15} />
        </RoundedBox>
      ))}

      {/* 带鱼屏墙：三块超宽屏 + 一块竖屏副屏，内容各不同 */}
      <group
        position={[-0.05, deskY + 0.02, -0.42]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("monitor");
        }}
        {...hover}
      >
        <HotspotGlow active={activeId === "monitor"} />
        {/* 中央主带鱼屏 ~32:9 */}
        <group position={[0, 0.58, -0.04]}>
          <UltrawideMonitor w={2.65} h={0.78} card={MONITOR_FORMULA_CARDS[0]} />
        </group>
        {/* 左带鱼屏 */}
        <group position={[-1.55, 0.5, 0.06]} rotation={[0, 0.28, 0]}>
          <UltrawideMonitor w={1.55} h={0.58} card={MONITOR_FORMULA_CARDS[1]} />
        </group>
        {/* 右带鱼屏 */}
        <group position={[1.55, 0.5, 0.06]} rotation={[0, -0.28, 0]}>
          <UltrawideMonitor w={1.55} h={0.58} card={MONITOR_FORMULA_CARDS[2]} />
        </group>
        {/* 右侧竖副屏：Swarm */}
        <group position={[2.35, 0.62, -0.95]} rotation={[0, -0.95, 0]}>
          <FormulaMonitor w={0.62} h={0.95} card={MONITOR_FORMULA_CARDS[3]} />
        </group>
        {/* 左上小副屏：HITL */}
        <group position={[-1.85, 1.05, -0.15]} rotation={[0.05, 0.35, 0]}>
          <FormulaMonitor w={0.72} h={0.42} card={MONITOR_FORMULA_CARDS[4]} />
        </group>
        <RoundedBox args={[3.4, 0.05, 0.1]} radius={0.02} position={[0, 0.08, -0.02]} castShadow>
          <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.25} />
        </RoundedBox>
      </group>

      {/* 浅色主机双塔 */}
      <RoundedBox args={[0.3, 0.52, 0.4]} radius={0.04} position={[-1.45, 0.34, 0.35]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <mesh position={[-1.3, 0.4, 0.35]}>
        <planeGeometry args={[0.02, 0.28]} />
        <meshStandardMaterial color={NVIDIA} emissive={NVIDIA} emissiveIntensity={0.55} />
      </mesh>
      <RoundedBox args={[0.3, 0.52, 0.4]} radius={0.04} position={[2.35, 0.34, 0.15]} castShadow>
        <meshStandardMaterial color="#F1F5F9" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <mesh position={[2.2, 0.4, 0.15]}>
        <planeGeometry args={[0.02, 0.28]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.45, 0.1, 0.52]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.01, 0.01, 3.5, 8]} />
        <meshStandardMaterial color="#86EFAC" />
      </mesh>

      {/* 浅色键鼠 */}
      <RoundedBox args={[0.7, 0.035, 0.26]} radius={0.02} position={[-0.15, deskY + 0.035, 0.35]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </RoundedBox>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 11 }).map((_, c) => (
          <RoundedBox
            key={`${r}-${c}`}
            args={[0.038, 0.012, 0.032]}
            radius={0.004}
            position={[-0.4 + c * 0.05, deskY + 0.055, 0.27 + r * 0.045]}
          >
            <meshStandardMaterial color={r === 1 && c === 5 ? "#BAE6FD" : "#F1F5F9"} />
          </RoundedBox>
        )),
      )}
      <mesh position={[0.42, deskY + 0.04, 0.38]} castShadow>
        <capsuleGeometry args={[0.032, 0.045, 4, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>

      {/* 笔记本笔 */}
      <group position={[0.95, deskY + 0.02, 0.28]} rotation={[0, -0.2, 0]}>
        <RoundedBox args={[0.3, 0.015, 0.4]} radius={0.01} castShadow>
          <meshStandardMaterial color={PAPER} roughness={0.75} />
        </RoundedBox>
        {[-0.08, 0, 0.08, 0.16].map((z, i) => (
          <mesh key={i} position={[0, 0.01, z]}>
            <planeGeometry args={[0.22, 0.01]} />
            <meshBasicMaterial color="#CBD5E1" />
          </mesh>
        ))}
        <mesh position={[0.18, 0.02, 0.05]} rotation={[0, 0, 0.35]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.26, 8]} />
          <meshStandardMaterial color="#7DD3FC" />
        </mesh>
      </group>

      {/* 手办 */}
      <group position={[-1.3, deskY + 0.02, -0.12]}>
        <RoundedBox args={[0.5, 0.035, 0.16]} radius={0.015} castShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </RoundedBox>
        {[
          [-0.15, "#FCA5A5"],
          [0, "#7DD3FC"],
          [0.15, "#86EFAC"],
        ].map(([x, c], i) => (
          <group key={i} position={[x as number, 0.07, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.03, 0.05, 4, 8]} />
              <meshStandardMaterial color={c as string} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={c as string} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 桌面便签：彩色手写备忘，与屏幕内容不同源 */}
      <group
        position={[0.35, deskY + 0.03, 0.08]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("papers");
        }}
        {...hover}
      >
        {DESK_STICKY_NOTES.map((note, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <group
              key={note.id}
              position={[col * 0.32 - 0.15, 0.006 * i, row * 0.32 - 0.05]}
            >
              <StickyNoteMesh note={note} />
            </group>
          );
        })}
        {activeId === "papers" && <HotspotGlow active />}
      </group>

      {/* 咖啡杯 */}
      <group position={[-0.95, deskY + 0.02, 0.48]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.055, 0.048, 0.11, 20]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.105, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} />
        </mesh>
        <mesh position={[0.07, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.035, 0.008, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#F1F5F9" />
        </mesh>
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.012, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
        </mesh>
      </group>

      {/* 耳机架 */}
      <group position={[1.05, deskY + 0.02, 0.42]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.03, 16]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.09, 0.018, 10, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.45} />
        </mesh>
        <mesh position={[-0.09, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.04, 6, 10]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
        <mesh position={[0.09, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.04, 6, 10]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
      </group>

      {/* 桌面小多肉 */}
      <group position={[-1.45, deskY + 0.02, 0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.07, 12]} />
          <meshStandardMaterial color="#F97316" roughness={0.65} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[Math.cos(i) * 0.025, 0.08 + (i % 2) * 0.02, Math.sin(i) * 0.025]}
            castShadow
          >
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#4ADE80" roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* 橡皮鸭 */}
      <group position={[0.72, deskY + 0.02, 0.48]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#FACC15" roughness={0.4} />
        </mesh>
        <mesh position={[0.03, 0.07, 0.02]} castShadow>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#FACC15" />
        </mesh>
        <mesh position={[0.055, 0.07, 0.03]}>
          <coneGeometry args={[0.012, 0.025, 8]} />
          <meshStandardMaterial color="#FB923C" />
        </mesh>
      </group>

      {/* 笔筒 + 笔 */}
      <group position={[1.35, deskY + 0.02, 0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.12, 14]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {[
          [0.015, "#7DD3FC"],
          [-0.01, "#F472B6"],
          [0.0, "#A78BFA"],
        ].map(([x, c], i) => (
          <mesh key={i} position={[x as number, 0.14, (i - 1) * 0.012]} rotation={[0.15, 0, 0.08 * i]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.18, 6]} />
            <meshStandardMaterial color={c as string} />
          </mesh>
        ))}
      </group>

      {/* 相机 / 镜头小物 */}
      <group position={[-0.55, deskY + 0.02, 0.42]} rotation={[0, 0.5, 0]}>
        <RoundedBox args={[0.14, 0.09, 0.1]} radius={0.015} castShadow>
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.2} />
        </RoundedBox>
        <mesh position={[0.02, 0.01, 0.06]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.05, 16]} />
          <meshStandardMaterial color="#0F172A" metalness={0.4} />
        </mesh>
        <mesh position={[0.02, 0.01, 0.085]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.35} />
        </mesh>
      </group>

      <group
        position={[1.7, deskY + 0.02, 0.32]}
        rotation={[0, -0.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("binder");
        }}
        {...hover}
      >
        <HotspotGlow active={activeId === "binder"} />
        <RoundedBox args={[0.24, 0.32, 0.05]} radius={0.02} castShadow>
          <meshStandardMaterial color="#BAE6FD" roughness={0.5} />
        </RoundedBox>
        <Text position={[0, 0.04, 0.03]} fontSize={0.03} color={INK} anchorX="center">
          Facts
        </Text>
      </group>

      <group
        position={[1.55, deskY + 0.02, 0.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("phone");
        }}
        {...hover}
      >
        <RoundedBox args={[0.14, 0.04, 0.14]} radius={0.02} position={[0, 0.02, 0]} castShadow>
          <meshStandardMaterial color="#E2E8F0" />
        </RoundedBox>
        <RoundedBox args={[0.11, 0.22, 0.014]} radius={0.015} position={[0, 0.14, 0]} rotation={[-0.2, 0, 0]} castShadow>
          <meshStandardMaterial color="#FFFFFF" emissive="#E0F2FE" emissiveIntensity={0.35} />
        </RoundedBox>
      </group>

      <group
        position={[1.75, deskY + 0.02, 0.05]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("calendar");
        }}
        {...hover}
      >
        <RoundedBox args={[0.24, 0.18, 0.04]} radius={0.015} castShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.06, 0.022]}>
          <planeGeometry args={[0.2, 0.05]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <Text position={[0, -0.01, 0.025]} fontSize={0.04} color={INK} anchorX="center">
          8
        </Text>
      </group>

      {/* 腕托 */}
      <RoundedBox args={[0.85, 0.03, 0.1]} radius={0.02} position={[-0.1, deskY + 0.02, 0.52]} castShadow>
        <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
      </RoundedBox>
    </group>
  );
}

/** 浅色人体工学椅：头枕 / 腰托 / 4D 扶手 / 网背感 */
function ErgonomicChair() {
  const arms = [0, 0.4 * Math.PI * 2, 0.8 * Math.PI * 2, 1.2 * Math.PI * 2, 1.6 * Math.PI * 2];
  return (
    <group position={[0.05, 0, 1.48]} rotation={[0, 0.1, 0]}>
      <RoundedBox args={[0.56, 0.09, 0.5]} radius={0.05} position={[0, 0.5, 0.02]} castShadow>
        <meshStandardMaterial color={CHAIR} roughness={0.55} />
      </RoundedBox>
      {/* 网状靠背：多层圆角片 */}
      <RoundedBox args={[0.5, 0.72, 0.05]} radius={0.04} position={[0, 0.98, -0.2]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
      </RoundedBox>
      {[-0.12, 0, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.98, -0.17]}>
          <planeGeometry args={[0.08, 0.55]} />
          <meshBasicMaterial color="#E0F2FE" transparent opacity={0.65} />
        </mesh>
      ))}
      <RoundedBox args={[0.3, 0.12, 0.08]} radius={0.035} position={[0, 1.45, -0.16]} castShadow>
        <meshStandardMaterial color={CHAIR_ACCENT} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.1, 0.05]} radius={0.025} position={[0, 0.82, -0.14]} castShadow>
        <meshStandardMaterial color="#BAE6FD" roughness={0.5} />
      </RoundedBox>
      {[-0.3, 0.3].map((x) => (
        <group key={x}>
          <RoundedBox args={[0.05, 0.26, 0.05]} radius={0.015} position={[x, 0.64, 0]} castShadow>
            <meshStandardMaterial color={CHAIR_FRAME} metalness={0.2} roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.08, 0.04, 0.26]} radius={0.02} position={[x, 0.8, 0.02]} castShadow>
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.038, 0.34, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.05, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.55} />
      </mesh>
      {arms.map((a) => {
        const len = 0.26;
        return (
          <group key={a}>
            <RoundedBox
              args={[0.04, 0.03, len]}
              radius={0.01}
              position={[Math.sin(a) * len * 0.5, 0.08, Math.cos(a) * len * 0.5]}
              rotation={[0, a, 0]}
              castShadow
            >
              <meshStandardMaterial color={CHAIR_FRAME} roughness={0.5} />
            </RoundedBox>
            <mesh position={[Math.sin(a) * len, 0.04, Math.cos(a) * len]} castShadow>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function KnowledgeBoard({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  return (
    <group
      position={[-5.25, 2.35, -0.4]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("board");
      }}
      {...hover}
    >
      <RoundedBox args={[2.4, 1.7, 0.08]} radius={0.04} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[2.5, 1.8, 0.04]} radius={0.03} position={[0, 0, -0.03]}>
        <meshStandardMaterial color="#E2E8F0" />
      </RoundedBox>
      <Text position={[0, 0.68, 0.05]} fontSize={0.075} color={INK} anchorX="center">
        Knowledge Gardens
      </Text>
      <Text position={[0, 0.52, 0.05]} fontSize={0.035} color="#0284C7" anchorX="center">
        content/ · Markdown Source of Truth
      </Text>
      {KNOWLEDGE_BOARD.map((g, i) => {
        const y = 0.26 - i * 0.18;
        return (
          <group key={g.id} position={[0, y, 0.05]}>
            <RoundedBox args={[2.05, 0.15, 0.01]} radius={0.02}>
              <meshStandardMaterial color="#EEF6FF" />
            </RoundedBox>
            <mesh position={[-0.92, 0, 0.01]}>
              <planeGeometry args={[0.05, 0.1]} />
              <meshBasicMaterial color="#38BDF8" />
            </mesh>
            <Text position={[-0.78, 0.02, 0.012]} fontSize={0.04} color={INK} anchorX="left" maxWidth={1.5}>
              {g.title}
            </Text>
            <Text position={[-0.78, -0.035, 0.012]} fontSize={0.025} color="#64748B" anchorX="left">
              {g.meta}
            </Text>
          </group>
        );
      })}
      {activeId === "board" && (
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.3, 1.6]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.06} />
        </mesh>
      )}
    </group>
  );
}

/** 完整 Transformer 推导黑板：Markdown + KaTeX + 架构图 */
function ArchitectureChalkboard({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  /** 与机壳可视区同宽高比，scale 与 FormulaMonitor 同一标定（世界宽 / 12） */
  const boardW = 2.9;
  const boardH = 1.52;
  const cssW = 720;
  const cssH = Math.round(cssW * (boardH / boardW));
  return (
    <group
      position={[0.2, 2.55, -4.65]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("chalkboard");
      }}
      {...hover}
    >
      <RoundedBox args={[3.1, 1.7, 0.08]} radius={0.04} castShadow>
        <meshStandardMaterial color="#ECFDF5" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[3.25, 1.85, 0.05]} radius={0.03} position={[0, 0, -0.03]}>
        <meshStandardMaterial color="#D6D3D1" roughness={0.65} />
      </RoundedBox>
      <Html
        transform
        position={[0, 0, 0.048]}
        scale={boardW / 12}
        style={{ pointerEvents: "none" }}
        zIndexRange={[35, 0]}
      >
        <div
          className="box-border overflow-hidden rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] px-3 py-2.5 text-left shadow-sm"
          style={{ width: cssW, height: cssH }}
        >
          <p className="text-base font-bold text-[#14532D]">{ARCHITECTURE_BOARD.title}</p>
          <p className="mb-1.5 text-xs font-medium text-[#059669]">{ARCHITECTURE_BOARD.subtitle}</p>
          <div className="grid h-[calc(100%-2.25rem)] grid-cols-[1.05fr_1fr] gap-2.5">
            <div className="overflow-hidden rounded-lg border border-[#BBF7D0] bg-white/80 p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ARCHITECTURE_BOARD.image}
                alt={ARCHITECTURE_BOARD.imageAlt}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="kp-scroll-hidden min-h-0 overflow-y-auto">
              <OfficeRichMd content={ARCHITECTURE_BOARD.markdown} compact />
            </div>
          </div>
        </div>
      </Html>
      {activeId === "chalkboard" && (
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.0, 1.6]} />
          <meshBasicMaterial color="#22C55E" transparent opacity={0.06} />
        </mesh>
      )}
    </group>
  );
}

function AiBookshelf({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  const colors = ["#BAE6FD", "#A7F3D0", "#FDE68A", "#FBCFE8", "#DDD6FE", "#FED7AA", "#E0E7FF", "#CCFBF1"];
  return (
    <group
      position={[4.7, 0, -2.8]}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("bookshelf");
      }}
      {...hover}
    >
      <RoundedBox args={[1.4, 2.4, 0.35]} radius={0.04} position={[0, 1.2, 0]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.55} />
      </RoundedBox>
      {[0.45, 1.0, 1.55, 2.1].map((y) => (
        <RoundedBox key={y} args={[1.28, 0.04, 0.28]} radius={0.01} position={[0, y, 0.02]}>
          <meshStandardMaterial color="#E2E8F0" />
        </RoundedBox>
      ))}
      {BOOKSHELF_TITLES.map((title, i) => {
        const shelf = Math.floor(i / 3);
        const slot = i % 3;
        const y = 0.62 + shelf * 0.55;
        const x = -0.4 + slot * 0.4;
        const h = 0.3 + (i % 3) * 0.035;
        return (
          <group key={title} position={[x, y, 0.08]}>
            <RoundedBox args={[0.11, h, 0.2]} radius={0.015} castShadow>
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.55} />
            </RoundedBox>
          </group>
        );
      })}
      <Text position={[0, 2.35, 0.2]} fontSize={0.048} color={INK} anchorX="center">
        AI Library
      </Text>
      {activeId === "bookshelf" && <HotspotGlow active />}
    </group>
  );
}

function NvidiaServerRack({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  const ledRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const mat = ledRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.45 + Math.sin(clock.elapsedTime * 3.5) * 0.25;
  });
  return (
    <group
      position={[4.2, 0, 1.8]}
      rotation={[0, -0.4, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("server");
      }}
      {...hover}
    >
      <RoundedBox args={[0.85, 1.85, 0.7]} radius={0.05} position={[0, 0.95, 0]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.18} />
      </RoundedBox>
      {Array.from({ length: 7 }).map((_, i) => (
        <RoundedBox key={i} args={[0.68, 0.06, 0.02]} radius={0.01} position={[0, 0.4 + i * 0.18, 0.36]}>
          <meshStandardMaterial color="#E2E8F0" metalness={0.2} roughness={0.45} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.68, 0.1, 0.02]} radius={0.015} position={[0, 1.68, 0.36]}>
        <meshStandardMaterial color={NVIDIA} emissive={NVIDIA} emissiveIntensity={0.55} />
      </RoundedBox>
      <Text position={[0, 1.68, 0.38]} fontSize={0.04} color="#14532D" anchorX="center">
        NVIDIA DGX
      </Text>
      <Text position={[0, 1.5, 0.38]} fontSize={0.03} color="#4D7C0F" anchorX="center">
        H100 · NVLink
      </Text>
      <mesh ref={ledRef} position={[0.3, 0.28, 0.36]}>
        <circleGeometry args={[0.022, 12]} />
        <meshStandardMaterial color={NVIDIA} emissive={NVIDIA} emissiveIntensity={0.6} />
      </mesh>
      {activeId === "server" && <HotspotGlow active />}
    </group>
  );
}

function AirConditioner() {
  return (
    <group position={[3.2, 3.55, -4.55]}>
      <RoundedBox args={[1.35, 0.36, 0.26]} radius={0.06} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, -0.04, 0.14]}>
        <planeGeometry args={[1.1, 0.1]} />
        <meshStandardMaterial color="#F1F5F9" />
      </mesh>
      <Text position={[-0.3, 0.08, 0.14]} fontSize={0.035} color="#64748B" anchorX="left">
        24°C · Quiet
      </Text>
    </group>
  );
}

function TrashBin() {
  return (
    <group position={[-1.8, 0, 1.9]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.2, 0.52, 20]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <torusGeometry args={[0.175, 0.018, 8, 20]} />
        <meshStandardMaterial color="#CBD5E1" />
      </mesh>
    </group>
  );
}

function JourneyMap({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  return (
    <group
      position={[-5.25, 2.2, 2.4]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("map");
      }}
      {...hover}
    >
      <RoundedBox args={[1.8, 1.2, 0.06]} radius={0.04} castShadow>
        <meshStandardMaterial color="#F0F9FF" roughness={0.6} />
      </RoundedBox>
      <Text position={[0, 0.42, 0.04]} fontSize={0.065} color={INK} anchorX="center">
        Oasis Journey
      </Text>
      {["L1", "L2", "L3", "L4", "L5", "Now"].map((y, i) => (
        <group key={y} position={[-0.55 + (i % 3) * 0.55, 0.08 - Math.floor(i / 3) * 0.32, 0.04]}>
          <mesh>
            <circleGeometry args={[0.05, 12]} />
            <meshBasicMaterial color="#7DD3FC" />
          </mesh>
          <Text position={[0.12, 0, 0]} fontSize={0.038} color={INK} anchorX="left">
            {y}
          </Text>
        </group>
      ))}
      {activeId === "map" && (
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.7, 1.1]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.08} />
        </mesh>
      )}
    </group>
  );
}

function Plant({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  return (
    <group
      position={[3.8, 0, -3.6]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("plant");
      }}
      {...hover}
    >
      <RoundedBox args={[0.45, 0.45, 0.45]} radius={0.08} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial color="#E2E8F0" />
      </RoundedBox>
      {[
        [0, 0.8, 0],
        [0.2, 0.9, 0.08],
        [-0.18, 0.95, -0.05],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color={i % 2 ? "#6EE7B7" : "#34D399"} roughness={0.85} />
        </mesh>
      ))}
      {activeId === "plant" && <HotspotGlow active />}
    </group>
  );
}

function FloorLamp({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  return (
    <group
      position={[-3.6, 0, -3.5]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("lamp");
      }}
      {...hover}
    >
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.8, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FEF3C7" emissiveIntensity={0.45} roughness={0.7} />
      </mesh>
      <pointLight position={[0, 1.9, 0]} intensity={0.7} distance={5} color="#FFF7ED" />
      {activeId === "lamp" && <HotspotGlow active />}
    </group>
  );
}

function DogBuddy({
  onSelect,
  activeId,
}: {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
}) {
  const hover = useHoverCursor();
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (body.current) body.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.012;
  });
  return (
    <group
      position={[3.0, 0, 2.8]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("dog");
      }}
      {...hover}
    >
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.14, 24]} />
        <meshStandardMaterial color="#F1F5F9" roughness={1} />
      </mesh>
      <group ref={body} position={[0, 0.22, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#E8C9A0" roughness={0.85} />
        </mesh>
        <mesh position={[0.16, 0.1, 0.08]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#F0D5B0" roughness={0.85} />
        </mesh>
      </group>
      {activeId === "dog" && <HotspotGlow active />}
    </group>
  );
}

function SceneContent({ onSelect, activeId, viewId }: OfficeSceneProps) {
  const initial = OFFICE_VIEWS.overview;
  const controlsRef = useRef<OrbitLike | null>(null);
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 32]} />
      <ambientLight intensity={0.72} color="#FFFFFF" />
      <directionalLight
        position={[5, 10, 4]}
        intensity={0.95}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        color="#FFFBF5"
      />
      <hemisphereLight args={["#F8FAFC", "#E2E8F0", 0.5]} />
      <pointLight position={[-2, 3.2, 2]} intensity={0.25} distance={10} color={ACCENT} />

      <RoomShell />
      <GamingDeskSet onSelect={onSelect} activeId={activeId} />
      <ErgonomicChair />
      <KnowledgeBoard onSelect={onSelect} activeId={activeId} />
      <ArchitectureChalkboard onSelect={onSelect} activeId={activeId} />
      <AiBookshelf onSelect={onSelect} activeId={activeId} />
      <NvidiaServerRack onSelect={onSelect} activeId={activeId} />
      <AirConditioner />
      <TrashBin />
      <JourneyMap onSelect={onSelect} activeId={activeId} />
      <Plant onSelect={onSelect} activeId={activeId} />
      <FloorLamp onSelect={onSelect} activeId={activeId} />
      <DogBuddy onSelect={onSelect} activeId={activeId} />

      <ContactShadows position={[0, 0.001, 0]} opacity={0.14} scale={14} blur={2.8} far={5} frames={1} />

      <OrbitControls
        makeDefault
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={(c: any) => {
          controlsRef.current = c;
        }}
        enablePan={false}
        minDistance={1.2}
        maxDistance={10}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        target={initial.target}
        rotateSpeed={0.55}
      />
      <CameraNavigator viewId={viewId} controlsRef={controlsRef} />
    </>
  );
}

export function OfficeScene({ onSelect, activeId, viewId }: OfficeSceneProps) {
  const initial = useMemo(() => OFFICE_VIEWS.overview, []);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      className="h-full w-full touch-none"
      shadows
      dpr={[1, 1.5]}
      frameloop={pageVisible ? "always" : "never"}
      camera={{ position: initial.position, fov: 42, near: 0.1, far: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <SceneContent onSelect={onSelect} activeId={activeId} viewId={viewId} />
    </Canvas>
  );
}
