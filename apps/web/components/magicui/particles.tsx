"use client";

import React, {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/utils";

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  /** 主色（hex） */
  color?: string;
  /** 点缀色（hex）：约 1/4 粒子随机取用，形成双色星尘 */
  accentColor?: string;
  /** 星图连线距离（px）：>0 时粒子靠近自动连线，0 关闭 */
  connectDistance?: number;
  /** 粒子光晕（shadowBlur px），0 关闭 */
  glow?: number;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const hexInt = parseInt(h, 16);
  return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
  rgb: number[];
};

/**
 * 星尘粒子：mousemove 只写 ref（禁止 setState）；离屏 / 后台标签停 RAF，
 * 避免首页/知识库/管理页长跑把主线程吃满。
 */
export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  accentColor,
  connectDistance = 0,
  glow = 0,
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseClient = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
  const rafID = useRef<number | null>(null);
  const running = useRef(false);
  const visible = useRef(true);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optsRef = useRef({
    quantity,
    staticity,
    ease,
    size,
    color,
    accentColor,
    connectDistance,
    glow,
    vx,
    vy,
  });

  useEffect(() => {
    optsRef.current = {
      quantity,
      staticity,
      ease,
      size,
      color,
      accentColor,
      connectDistance,
      glow,
      vx,
      vy,
    };
  });

  useEffect(() => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    context.current = canvas.getContext("2d");

    const primaryRgb = () => hexToRgb(optsRef.current.color);
    const accentRgb = () =>
      optsRef.current.accentColor ? hexToRgb(optsRef.current.accentColor) : null;

    const circleParams = (): Circle => {
      const useAccent = accentRgb() !== null && Math.random() < 0.25;
      return {
        x: Math.floor(Math.random() * canvasSize.current.w),
        y: Math.floor(Math.random() * canvasSize.current.h),
        translateX: 0,
        translateY: 0,
        size: Math.random() * 2.2 + optsRef.current.size,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.45 + 0.3).toFixed(2)),
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
        magnetism: 0.1 + Math.random() * 4,
        rgb: useAccent && accentRgb() ? accentRgb()! : primaryRgb(),
      };
    };

    const clearContext = () => {
      context.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    };

    const drawCircle = (circle: Circle, update = false) => {
      const ctx = context.current;
      if (!ctx) return;
      const { x, y, translateX, translateY, size: s, alpha, rgb } = circle;
      ctx.translate(translateX, translateY);
      ctx.beginPath();
      if (optsRef.current.glow > 0) {
        ctx.shadowColor = `rgba(${rgb.join(", ")}, 0.55)`;
        ctx.shadowBlur = optsRef.current.glow;
      }
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.current.push(circle);
    };

    const resizeCanvas = () => {
      if (!context.current) return;
      canvasSize.current.w = container.offsetWidth;
      canvasSize.current.h = container.offsetHeight;
      canvas.width = canvasSize.current.w * dpr;
      canvas.height = canvasSize.current.h * dpr;
      canvas.style.width = `${canvasSize.current.w}px`;
      canvas.style.height = `${canvasSize.current.h}px`;
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      circles.current = [];
      for (let i = 0; i < optsRef.current.quantity; i++) {
        drawCircle(circleParams());
      }
    };

    const syncMouseFromClient = () => {
      const rect = canvas.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mouseClient.current.x - rect.left - w / 2;
      const y = mouseClient.current.y - rect.top - h / 2;
      if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    };

    const drawConnections = () => {
      const distMax = optsRef.current.connectDistance;
      const ctx = context.current;
      if (!ctx || distMax <= 0) return;
      const list = circles.current;
      const rgb = primaryRgb();
      // 上限：避免 quantity 误调大时 O(n²) 打爆主线程
      const n = Math.min(list.length, 80);
      for (let i = 0; i < n; i++) {
        const a = list[i];
        const ax = a.x + a.translateX;
        const ay = a.y + a.translateY;
        for (let j = i + 1; j < n; j++) {
          const b = list[j];
          const bx = b.x + b.translateX;
          const by = b.y + b.translateY;
          const distX = ax - bx;
          const distY = ay - by;
          if (Math.abs(distX) > distMax || Math.abs(distY) > distMax) continue;
          const dist = Math.sqrt(distX * distX + distY * distY);
          if (dist >= distMax) continue;
          const lineAlpha = (1 - dist / distMax) * 0.16;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(${rgb.join(", ")}, ${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    };

    const remapValue = (
      value: number,
      start1: number,
      end1: number,
      start2: number,
      end2: number,
    ): number => {
      const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
      return remapped > 0 ? remapped : 0;
    };

    const animate = () => {
      if (!running.current) return;
      syncMouseFromClient();
      clearContext();
      const { staticity: st, ease: es, vx: ovx, vy: ovy } = optsRef.current;
      for (let i = circles.current.length - 1; i >= 0; i--) {
        const circle = circles.current[i];
        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ];
        const closestEdge = Math.min(...edge);
        const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
        if (remapClosestEdge > 1) {
          circle.alpha += 0.02;
          if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
        } else {
          circle.alpha = circle.targetAlpha * remapClosestEdge;
        }
        circle.x += circle.dx + ovx;
        circle.y += circle.dy + ovy;
        circle.translateX +=
          (mouse.current.x / (st / circle.magnetism) - circle.translateX) / es;
        circle.translateY +=
          (mouse.current.y / (st / circle.magnetism) - circle.translateY) / es;
        drawCircle(circle, true);

        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(i, 1);
          drawCircle(circleParams());
        }
      }
      drawConnections();
      rafID.current = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (running.current) return;
      if (!visible.current || document.hidden) return;
      running.current = true;
      rafID.current = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      running.current = false;
      if (rafID.current != null) {
        window.cancelAnimationFrame(rafID.current);
        rafID.current = null;
      }
    };

    const syncRunState = () => {
      if (visible.current && !document.hidden) start();
      else stop();
    };

    resizeCanvas();
    syncRunState();

    const onMouseMove = (event: MouseEvent) => {
      mouseClient.current.x = event.clientX;
      mouseClient.current.y = event.clientY;
    };
    const onResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        resizeCanvas();
      }, 200);
    };
    const onVisibility = () => syncRunState();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible.current = entry.isIntersecting;
          syncRunState();
        },
        { threshold: 0.02 },
      );
      io.observe(container);
    }

    return () => {
      stop();
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [dpr, refresh, color, accentColor, quantity, connectDistance]);

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};
