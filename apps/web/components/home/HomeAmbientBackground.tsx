"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Particles = dynamic(
  () => import("@/components/magicui/particles").then((m) => m.Particles),
  { ssr: false },
);

type AmbientDensity = "home" | "lite";

// [OM-FREEPLAY] 星尘只在桌面首页启用；手机、知识库阅读与减少动效时保留静态底色。
const ambientQuery = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
function subscribeAmbient(onChange: () => void) {
  const query = window.matchMedia(ambientQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const ambientEnabled = () => window.matchMedia(ambientQuery).matches;
const ambientServerSnapshot = () => false;

const DENSITY: Record<
  AmbientDensity,
  { quantity: number; connectDistance: number; glow: number; size: number }
> = {
  /** 首页：保留星图连线，粒子量已相对旧版下调 */
  home: { quantity: 56, connectDistance: 72, glow: 3, size: 1.05 },
  /** 知识库/管理：无连线、更少粒子，长跑不吃主线程 */
  lite: { quantity: 28, connectDistance: 0, glow: 0, size: 0.9 },
};

/** 全页动态星尘底（透出 body 光晕之上），不抢内容层 */
export function HomeAmbientBackground({ density = "home" }: { density?: AmbientDensity }) {
  const cfg = DENSITY[density];
  const enabled = useSyncExternalStore(subscribeAmbient, ambientEnabled, ambientServerSnapshot);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 80% 0%, color-mix(in srgb, var(--om-glow-peach) 55%, transparent), transparent 58%)," +
            "radial-gradient(ellipse 65% 45% at 10% 90%, color-mix(in srgb, var(--om-glow-blue) 65%, transparent), transparent 55%)",
        }}
      />
      {enabled && density === "home" && <Particles
        className="h-full min-h-[100%] w-full"
        quantity={cfg.quantity}
        size={cfg.size}
        staticity={40}
        ease={48}
        color="#0087eb"
        accentColor="#e8a84a"
        connectDistance={cfg.connectDistance}
        glow={cfg.glow}
        vx={0.08}
        vy={0.05}
        refresh={false}
      />}
    </div>
  );
}
