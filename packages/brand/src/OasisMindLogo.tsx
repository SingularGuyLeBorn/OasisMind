import type { SVGProps } from "react";

/** 两个站点与静态图标共用的品牌色，不依赖站点主题或滤镜。 */
export const OASISMIND_LOGO_COLORS = {
  surface: "#183c40",
  page: "#fcfcf3",
  focus: "#dfb47e",
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

/** [OM-FREEPLAY] 重设计为几何书页与微小观察点；沿用品牌包唯一入口，不增加图片依赖。 */
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

      <rect width="32" height="32" rx="9" fill={OASISMIND_LOGO_COLORS.surface} />
      <path d="M7 10L14 13V25L7 21V10ZM25 10L18 13V25L25 21V10Z"
        stroke={OASISMIND_LOGO_COLORS.page} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="7" r="1.8" fill={OASISMIND_LOGO_COLORS.focus} />
    </svg>
  );
}
