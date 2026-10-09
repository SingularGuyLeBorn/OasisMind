/**
 * 独立公开站的根布局与元数据边界。它只组合公开导航和样式，不初始化本地 Agent、鉴权或 tRPC。
 * 最终域名由环境变量提供；缺失时仅使用带标记的本地构建默认值。
 */
import type { Metadata } from "next";
import "@oasismind/markdown/styles.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteUrl, withSiteBasePath } from "@/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "见微 · OasisMind", template: "%s · 见微" },
  description: "见微知著：关于 AI、学习、工程与长期思考的个人知识花园。",
  openGraph: {
    type: "website",
    siteName: "见微 · OasisMind",
    title: "见微 · OasisMind",
    description: "把值得留下的思考，整理成可以再次抵达的知识。",
  },
  alternates: { types: { "application/rss+xml": `${getSiteUrl()}/feed.xml` } },
  icons: {
    icon: [{ url: withSiteBasePath("/icons/oasismind.svg"), type: "image/svg+xml" }],
    apple: [{ url: withSiteBasePath("/icons/oasismind.svg"), type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
