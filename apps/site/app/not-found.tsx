/**
 * 公开站统一 404。它不尝试查询本地完整知识库，以免用错误恢复路径泄露草稿是否存在。
 * 访客只能返回公开首页，没有编辑、登录或写入入口。
 */
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
