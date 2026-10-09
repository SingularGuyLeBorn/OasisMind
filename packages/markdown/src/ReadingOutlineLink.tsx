import type { MouseEventHandler, ReactNode } from "react";

/** 两版共用的目录链接：无 JavaScript 也能跳转，活动项及滚动容器由阅读器控制。 */
export function ReadingOutlineLink({ id, active, className, onClick, children }: {
  id: string;
  active?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return <a href={`#${encodeURIComponent(id)}`} aria-current={active ? "location" : undefined} className={className} onClick={onClick}>{children}</a>;
}
