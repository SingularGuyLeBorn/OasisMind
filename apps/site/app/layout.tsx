import type { Metadata } from "next";
import "@oasismind/markdown/styles.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// [OM-FREEPLAY] 用户尚未提供最终域名；环境变量优先，localhost 仅用于本地 metadata 生成。
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "见微 · OasisMind", template: "%s · 见微" },
  description: "见微知著：关于 AI、学习、工程与长期思考的个人知识花园。",
  openGraph: {
    type: "website",
    siteName: "见微 · OasisMind",
    title: "见微 · OasisMind",
    description: "把值得留下的思考，整理成可以再次抵达的知识。",
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
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
