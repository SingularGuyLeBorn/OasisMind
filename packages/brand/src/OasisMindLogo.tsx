import type { SVGProps } from "react";

/**
 * “微窗”Logo 的固定色值。
 *
 * 这里故意不跟随深浅主题：用户选择的是亮色品牌，Logo 也需要在网页、PWA 与
 * favicon 中保持同一张面孔。各站点可以改变外层阴影和尺寸，但不能改写标志本身。
 */
export const OASISMIND_LOGO_COLORS = {
  surface: "#eef7fe",
  border: "#b9def7",
  frame: "#005a9e",
  echo: "#0087eb",
  focus: "#e8a84a",
} as const;

export type OasisMindLogoProps = Omit<
  SVGProps<SVGSVGElement>,
  "height" | "width"
> & {
  /** CSS 像素尺寸；SVG 的 32×32 坐标保持不变，因此任意尺寸都不会失真。 */
  size?: number | string;
  /** 仅在标志独立传达含义时提供；旁边已有“见微”文字时留空即可。 */
  label?: string;
};

/**
 * 见微 · OasisMind 正式品牌标“微窗”。
 *
 * - 圆角窗框与下方双脚共同借用“见”的骨架，但不是直接套用某个字体字形；
 * - 金色焦点代表“微”，蓝色回响表示由一个观察向外长成知识；
 * - 图形只有三条主线和一个点，缩到 16px 仍能辨认，不依赖渐变或滤镜。
 */
export function OasisMindLogo({
  size = 32,
  label,
  ...props
}: OasisMindLogoProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}

      {/* 淡色底板让标志在白色网页和浏览器标签页里都有稳定边界。 */}
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="9.5"
        fill={OASISMIND_LOGO_COLORS.surface}
        stroke={OASISMIND_LOGO_COLORS.border}
      />

      {/* 观察窗：这是“见”的上半部，也是容纳那一点微光的知识页面。 */}
      <rect
        x="7.25"
        y="7"
        width="17.5"
        height="13.25"
        rx="2.25"
        stroke={OASISMIND_LOGO_COLORS.frame}
        strokeWidth="2.15"
      />

      {/* 由窗框长出的两笔收成“见”的下半部；圆端在小尺寸下不会产生尖刺。 */}
      <path
        d="M14.25 20.15C14.05 22.75 12.45 24.45 9.45 25.35"
        stroke={OASISMIND_LOGO_COLORS.frame}
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        d="M17.75 20.15C17.95 22.85 19.7 24.55 22.75 25.35"
        stroke={OASISMIND_LOGO_COLORS.frame}
        strokeWidth="2.15"
        strokeLinecap="round"
      />

      {/* 一点微光落在一圈回响之上：既是“见微”，也像绿洲水面的一次扩散。 */}
      <circle cx="16" cy="12.7" r="1.7" fill={OASISMIND_LOGO_COLORS.focus} />
      <path
        d="M11.9 16.1C14.15 18.15 17.85 18.15 20.1 16.1"
        stroke={OASISMIND_LOGO_COLORS.echo}
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}
