/**
 * 切页性能 baseline（开发态默认开；生产设 localStorage.kp_nav_perf=1）。
 *
 * 指标：
 * - T1：click → beginNavigation（应 <50ms，仅调度）
 * - T2：beginNavigation → pathname 变化 / endNavigation（二次轻页目标 <200ms）
 *
 * 判定：同路径二次 T2 应明显短于首次（命中 staleTimes / RQ 缓存）。
 */

const samples: { href: string; t2Ms: number; at: number }[] = [];
const MAX_SAMPLES = 40;

let navStartedAt = 0;
let pendingHref = "";

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("kp_nav_perf") === "1") return true;
    if (window.localStorage.getItem("kp_nav_perf") === "0") return false;
  } catch {
    /* ignore */
  }
  return process.env.NODE_ENV === "development";
}

export function markNavStart(href?: string): void {
  if (!enabled()) return;
  navStartedAt = performance.now();
  pendingHref = href ?? "";
}

export function markNavEnd(pathname?: string): void {
  if (!enabled() || navStartedAt <= 0) return;
  const t2Ms = Math.round(performance.now() - navStartedAt);
  const href = pathname ?? (pendingHref || "?");
  samples.push({ href, t2Ms, at: Date.now() });
  if (samples.length > MAX_SAMPLES) samples.shift();
  navStartedAt = 0;

  const same = samples.filter((s) => s.href === href);
  const first = same[0]?.t2Ms;
  const last = same[same.length - 1]?.t2Ms;
  const beat =
    same.length >= 2 && first != null && last != null && last < first * 0.7
      ? " ✓打赢首次"
      : same.length >= 2
        ? " ·未明显快于首次"
        : "";

  console.info(
    `[nav-perf] T2=${t2Ms}ms → ${href}${beat} | baseline: 二次轻页<200ms / 首次骨架<150ms`,
  );
}

export function getNavPerfSamples(): readonly { href: string; t2Ms: number; at: number }[] {
  return samples;
}
