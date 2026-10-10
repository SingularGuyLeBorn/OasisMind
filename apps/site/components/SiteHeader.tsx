/**
 * 公开站主导航，只链接公开首页、知识库、搜索和 About。
 * 不读取登录态，也不展示本地编辑/Agent 入口；路由错误交给对应静态 404 处理。
 */
import { SiteLink as Link } from "@/components/SiteLink";
import { BookOpen, Search } from "lucide-react";
import { OasisMindLogo } from "@oasismind/brand";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="brand" aria-label="见微首页">
          <OasisMindLogo size={38} className="brand-mark" />
          <span>
            <strong>见微</strong>
            <small>OasisMind</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          <Link href="/">首页</Link>
          <Link href="/knowledge"><BookOpen size={16} />知识库</Link>
          <Link href="/resources">资源</Link>
          <Link href="/office">工作室</Link>
          <Link href="/about">关于我</Link>
          <Link href="/search" className="nav-search"><Search size={16} />搜索</Link>
        </nav>
      </div>
    </header>
  );
}
