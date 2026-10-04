import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="site-shell not-found">
      <span>404</span><h1>这一页还没有长出来。</h1><p>它可能被移动了，或者从未公开发布。</p>
      <Link href="/" className="primary-button"><ArrowLeft size={17} />回到首页</Link>
    </div>
  );
}
