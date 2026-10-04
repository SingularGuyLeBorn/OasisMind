import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="brand" aria-label="见微首页">
          <span className="brand-mark">见</span>
          <span>
            <strong>见微</strong>
            <small>OasisMind</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          <Link href="/knowledge"><BookOpen size={16} />知识库</Link>
          <Link href="/about">关于</Link>
          <Link href="/search" className="nav-search"><Search size={16} />搜索</Link>
        </nav>
      </div>
    </header>
  );
}
