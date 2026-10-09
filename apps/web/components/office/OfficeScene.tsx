"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OFFICE_VIEWS, WALK_BOUNDS, type OfficeViewId } from "./officeNav";
import { HOTSPOT_META, type OfficeHotspotId } from "./officeContent";

interface OfficeSceneProps {
  onSelect: (id: OfficeHotspotId) => void;
  activeId: OfficeHotspotId | null;
  viewId: OfficeViewId;
  viewRevision: number;
}

// [OM-FREEPLAY] 重新搭建研究工作室；沿用办公室原有白、雾灰和蓝色，不引入新主题。
const palette = { background: "#F3F6FA", wall: "#FAFBFD", floor: "#E8EEF5", metal: "#A8B4C4", light: "#38BDF8", ink: "#1E3A5F" };
type Controls = ComponentRef<typeof OrbitControls>;

function Block({ position, size, color = palette.wall, metal = false }: { position: [number, number, number]; size: [number, number, number]; color?: string; metal?: boolean }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} metalness={metal ? .65 : .08} roughness={metal ? .28 : .65} /></mesh>;
}

function LightRing({ radius, position, horizontal = true, opacity = .65 }: { radius: number; position: [number, number, number]; horizontal?: boolean; opacity?: number }) {
  return <mesh position={position} rotation={horizontal ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}><torusGeometry args={[radius, .015, 6, 80]} /><meshBasicMaterial color={palette.light} transparent opacity={opacity} /></mesh>;
}

function Architecture() {
  return <group>
    <Block position={[0, -.12, 0]} size={[12, .24, 12]} color={palette.floor} />
    <Block position={[0, 2.1, -4.7]} size={[12, 4.2, .15]} />
    <Block position={[-5.2, 2.1, -.4]} size={[.15, 4.2, 8.6]} />
    <Block position={[5.2, 2.1, -.4]} size={[.15, 4.2, 8.6]} />
    {[-4, -2, 0, 2, 4].map(x => <group key={x}>
      <Block position={[x, 2.1, -4.59]} size={[.06, 3.9, .07]} color={palette.metal} metal />
      <Block position={[x + .1, 2.1, -4.58]} size={[.012, 3.4, .03]} color={palette.light} />
    </group>)}
    {[-3, 3].map(x => <Block key={x} position={[x, 3.95, -.5]} size={[.13, .14, 7.3]} color={palette.metal} metal />)}
    <mesh position={[0, .025, -.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.6, 80]} /><meshStandardMaterial color={palette.wall} metalness={.3} roughness={.45} /></mesh>
    <LightRing radius={3.42} position={[0, .03, -.25]} />
    <LightRing radius={3.57} position={[0, .03, -.25]} opacity={.28} />
    <LightRing radius={2.5} position={[0, 3.65, -.4]} />
    <mesh position={[0, 3.7, -.4]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.56, .065, 8, 80]} /><meshStandardMaterial color={palette.metal} metalness={.8} roughness={.25} /></mesh>
    {Array.from({ length: 32 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 16) * 3.5, .035, -.25 + Math.sin(i * Math.PI / 16) * 3.5]} rotation={[-Math.PI / 2, 0, i * Math.PI / 16]}>
      <planeGeometry args={[.1, .015]} /><meshBasicMaterial color={palette.metal} />
    </mesh>)}
  </group>;
}

function Screen({ id, title, rows, position, rotation = 0, onSelect, active }: { id: OfficeHotspotId; title: string; rows: string[]; position: [number, number, number]; rotation?: number; onSelect: OfficeSceneProps["onSelect"]; active: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Block position={[0, 0, 0]} size={[1.6, 1.05, .05]} color={palette.metal} metal />
    <Block position={[0, 0, .031]} size={[1.54, .99, .012]} />
    <Html transform position={[0, 0, .055]} distanceFactor={1.4} zIndexRange={[10, 0]}>
      <button type="button" className="om-workshop-screen" onClick={() => onSelect(id)} aria-label={HOTSPOT_META[id].label} aria-pressed={active}>
        <span className="om-workshop-screen-label">{title}</span>
        <span className="om-workshop-screen-rule" />
        {rows.map((row, index) => <span className="om-workshop-screen-row" key={row}><i>{String(index + 1).padStart(2, "0")}</i>{row}</span>)}
        <span className="om-workshop-screen-open">打开工作面板 →</span>
      </button>
    </Html>
  </group>;
}

function Workbench({ onSelect, activeId }: Pick<OfficeSceneProps, "onSelect" | "activeId">) {
  const surface = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 2.15, -.2, Math.PI + .2, false);
    shape.lineTo(Math.cos(Math.PI + .2) * 1.05, Math.sin(Math.PI + .2) * 1.05);
    shape.absarc(0, 0, 1.05, Math.PI + .2, -.2, true);
    shape.closePath();
    return shape;
  }, []);
  return <group>
    {/* 环抱式台面，中部留给线框研究对象；这是一件静态装置，不假装实时计算。 */}
    <mesh position={[0, .83, -.3]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow><extrudeGeometry args={[surface, { depth: .12, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2, curveSegments: 32 }]} /><meshStandardMaterial color={palette.wall} metalness={.35} roughness={.3} /></mesh>
    <Block position={[0, .81, -1.6]} size={[3.4, .12, .6]} />
    {[-1.65, 1.65].map(x => <Block key={x} position={[x, .42, -.65]} size={[.17, .82, 1.25]} color={palette.metal} metal />)}
    <mesh position={[0, .23, -.3]} castShadow><cylinderGeometry args={[.65, .85, .45, 40]} /><meshStandardMaterial color={palette.metal} metalness={.7} roughness={.25} /></mesh>
    <mesh position={[0, .65, -.3]}><cylinderGeometry args={[.48, .5, .4, 40]} /><meshStandardMaterial color={palette.wall} metalness={.4} roughness={.35} /></mesh>
    <LightRing radius={.52} position={[0, .86, -.3]} />
    <group position={[0, 1.5, -.3]}>
      <mesh><icosahedronGeometry args={[.52, 1]} /><meshBasicMaterial color={palette.light} wireframe transparent opacity={.7} /></mesh>
      <LightRing radius={.74} position={[0, 0, 0]} horizontal={false} opacity={.45} />
      <group rotation={[0, .7, .5]}><LightRing radius={.85} position={[0, 0, 0]} horizontal={false} opacity={.28} /></group>
    </group>
    <Screen id="monitor" title="研究工作台" rows={["知识与笔记", "工具与协作", "项目与应用"]} position={[0, 1.74, -1.65]} onSelect={onSelect} active={activeId === "monitor"} />
    <Screen id="chalkboard" title="模型架构" rows={["注意力与表征", "残差与前馈", "输出与训练目标"]} position={[-1.86, 1.65, -.87]} rotation={.46} onSelect={onSelect} active={activeId === "chalkboard"} />
    <Screen id="board" title="知识花园" rows={["沿问题组织", "从原理深入", "回到论文验证"]} position={[1.86, 1.65, -.87]} rotation={-.46} onSelect={onSelect} active={activeId === "board"} />
    {/* 台面控制条与双支撑，物件不贴在悬空的平面上。 */}
    <Block position={[0, .91, -1.3]} size={[1.05, .06, .18]} color={palette.metal} metal />
    <Block position={[0, .947, -1.3]} size={[.92, .009, .035]} color={palette.light} />
  </group>;
}

function RobotArm() {
  return <group position={[-3.25, 0, .6]} rotation={[0, -.25, 0]}>
    <Block position={[0, .3, 0]} size={[1.2, .6, 1.05]} color={palette.floor} metal />
    <mesh position={[0, .65, 0]}><cylinderGeometry args={[.26, .3, .12, 24]} /><meshStandardMaterial color={palette.metal} metalness={.7} roughness={.3} /></mesh>
    <group position={[0, .72, 0]} rotation={[0, 0, -.32]}>
      <Block position={[0, .4, 0]} size={[.16, .8, .22]} color={palette.metal} metal />
      <mesh position={[0, .8, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.17, .17, .28, 20]} /><meshStandardMaterial color={palette.wall} metalness={.5} roughness={.3} /></mesh>
      <group position={[0, .8, 0]} rotation={[0, 0, -1.1]}>
        <Block position={[0, .3, 0]} size={[.12, .6, .14]} color={palette.metal} metal />
        <mesh position={[0, .6, 0]}><sphereGeometry args={[.105, 12, 12]} /><meshStandardMaterial color={palette.light} metalness={.3} roughness={.3} /></mesh>
        {[-.08, .08].map(z => <Block key={z} position={[0, .71, z]} size={[.055, .2, .035]} color={palette.metal} metal />)}
      </group>
    </group>
    <LightRing radius={.4} position={[0, .607, 0]} />
  </group>;
}

function Equipment({ onSelect }: Pick<OfficeSceneProps, "onSelect">) {
  const select = (id: OfficeHotspotId) => (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(id); };
  return <group>
    <group position={[3.8, 0, -1.7]} onClick={select("server")}>
      <Block position={[0, 1.3, 0]} size={[1.1, 2.6, .8]} color={palette.metal} metal />
      {Array.from({ length: 8 }, (_, i) => <group key={i} position={[0, .35 + i * .27, .42]}>
        <Block position={[0, 0, 0]} size={[.9, .2, .035]} color={palette.floor} />
        <Block position={[-.36, 0, .025]} size={[.07, .025, .02]} color={palette.light} />
        <Block position={[.18, 0, .025]} size={[.3, .018, .02]} color={palette.metal} />
      </group>)}
    </group>
    <group position={[-3.6, 0, -2.65]} onClick={select("bookshelf")}>
      <Block position={[0, 1.3, 0]} size={[1.4, 2.6, .5]} color={palette.floor} />
      {[.45, 1.2, 1.95].map(y => <group key={y}>
        <Block position={[0, y, .15]} size={[1.3, .05, .55]} color={palette.metal} metal />
        {Array.from({ length: 7 }, (_, i) => <Block key={i} position={[-.5 + i * .16, y + .26, .16]} size={[.11, .45 + (i % 3) * .03, .32]} color={i % 3 === 0 ? palette.light : palette.wall} />)}
      </group>)}
    </group>
    <Screen id="server" title="算力工作区" rows={["本地推理", "训练与并行", "资源与系统"]} position={[3.75, 2.05, -.95]} rotation={-.5} onSelect={onSelect} active={false} />
    <Screen id="bookshelf" title="研究档案" rows={["基础论文", "学习笔记", "模型与算法"]} position={[-3.4, 2.7, -2.26]} rotation={.3} onSelect={onSelect} active={false} />
  </group>;
}

function CameraRig({ viewId, viewRevision, activeId, controlsRef }: { viewId: OfficeViewId; viewRevision: number; activeId: OfficeHotspotId | null; controlsRef: React.RefObject<Controls | null> }) {
  const { camera, invalidate } = useThree();
  const reduceMotion = useReducedMotion();
  const keys = useRef(new Set<string>());
  const moving = useRef(false);
  useEffect(() => { moving.current = viewId !== "walk"; invalidate(); }, [viewId, viewRevision, invalidate]);
  // [OM-FREEPLAY] 手动拖动明确取消预设镜头过渡，不让自动镜头与用户争夺控制。
  useEffect(() => {
    const controls = controlsRef.current;
    const cancel = () => { moving.current = false; };
    controls?.addEventListener("start", cancel);
    return () => controls?.removeEventListener("start", cancel);
  }, [controlsRef]);
  useEffect(() => {
    keys.current.clear();
    if (activeId) return;
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,[contenteditable=true],dialog,[role=dialog]")) return;
      keys.current.add(e.key.toLowerCase());
      invalidate();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const reset = () => keys.current.clear();
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", reset);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", reset); };
  }, [invalidate, activeId]);
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || activeId) return;
    if (document.querySelector("dialog[open]")) { keys.current.clear(); return; }
    if (moving.current && viewId !== "walk") {
      const preset = OFFICE_VIEWS[viewId];
      const position = new THREE.Vector3(...preset.position), target = new THREE.Vector3(...preset.target);
      const blend = reduceMotion ? 1 : 1 - Math.exp(-Math.min(delta, .05) * 5);
      camera.position.lerp(position, blend); controls.target.lerp(target, blend);
      moving.current = camera.position.distanceTo(position) > .01 || controls.target.distanceTo(target) > .01;
      controls.update(); if (moving.current) invalidate(); return;
    }
    if (viewId !== "walk") return;
    const pressed = keys.current;
    const z = Number(pressed.has("w") || pressed.has("arrowup")) - Number(pressed.has("s") || pressed.has("arrowdown"));
    const x = Number(pressed.has("d") || pressed.has("arrowright")) - Number(pressed.has("a") || pressed.has("arrowleft"));
    if (!x && !z) return;
    const forward = camera.getWorldDirection(new THREE.Vector3()); forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
    const move = forward.multiplyScalar(z).add(right.multiplyScalar(x)).normalize().multiplyScalar(Math.min(delta, .05) * 2.4);
    const next = camera.position.clone().add(move);
    next.x = THREE.MathUtils.clamp(next.x, WALK_BOUNDS.minX, WALK_BOUNDS.maxX); next.z = THREE.MathUtils.clamp(next.z, WALK_BOUNDS.minZ, WALK_BOUNDS.maxZ); next.y = WALK_BOUNDS.y;
    controls.target.add(next.clone().sub(camera.position)); camera.position.copy(next); controls.update(); invalidate();
  });
  return null;
}

function Scene(props: OfficeSceneProps) {
  const controlsRef = useRef<Controls | null>(null);
  const reduceMotion = useReducedMotion();
  return <>
    <color attach="background" args={[palette.background]} />
    <ambientLight intensity={.85} />
    <hemisphereLight args={[palette.wall, palette.floor, .65]} />
    <directionalLight position={[4, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-normalBias={.04} />
    <Architecture /><Workbench {...props} /><RobotArm /><Equipment onSelect={props.onSelect} />
    <ContactShadows position={[0, .015, 0]} scale={12} opacity={.2} blur={2} far={4} frames={1} />
    <OrbitControls ref={controlsRef} makeDefault enabled={!props.activeId} enableDamping={!reduceMotion} enablePan={false} minDistance={1.5} maxDistance={12} minPolarAngle={.3} maxPolarAngle={1.45} target={OFFICE_VIEWS.overview.target} />
    <CameraRig viewId={props.viewId} viewRevision={props.viewRevision} activeId={props.activeId} controlsRef={controlsRef} />
  </>;
}

function subscribeVisibility(notify: () => void) { document.addEventListener("visibilitychange", notify); return () => document.removeEventListener("visibilitychange", notify); }
function subscribeViewport(notify: () => void) { const media = matchMedia("(max-width: 639px)"); media.addEventListener("change", notify); return () => media.removeEventListener("change", notify); }

export function OfficeScene(props: OfficeSceneProps) {
  const visible = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);
  // [OM-FREEPLAY] 手机扩大视角；先检查 WebGL2 能力，避免渲染器初始化失败留下空白页。
  const compact = useSyncExternalStore(subscribeViewport, () => matchMedia("(max-width: 639px)").matches, () => false);
  const [supported] = useState(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return !!context;
    } catch { return false; }
  });
  if (!supported) return <div className="om-workshop-loading" role="status">当前设备无法打开 3D 场景，请通过下方物件菜单访问工作室功能。</div>;
  // [OM-FREEPLAY] 新场景没有常驻漂浮或闪烁；后台停止绘制，像素比例沿用原来的上限。
  return <Canvas className="h-full w-full touch-none" shadows="percentage" dpr={[1, 1.5]} frameloop={visible ? "demand" : "never"} camera={{ position: OFFICE_VIEWS.overview.position, fov: compact ? 68 : 44, near: .1, far: 40 }} gl={{ antialias: true, alpha: false }}><Scene {...props} /></Canvas>;
}
