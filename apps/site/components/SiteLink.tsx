import type { ComponentPropsWithoutRef } from "react";
import { withSiteBasePath } from "../siteConfig";

/** 静态阅读采用原生页面导航，不预取数千个路由，也不等待额外 RSC 请求才能换文章。 */
export function SiteLink({ href, ...props }: ComponentPropsWithoutRef<"a">) {
  return <a {...props} href={href ? withSiteBasePath(href) : href} />;
}
