/**
 * 公开站 About 静态页；内容写在组件内，不读取本地工作台数据。
 * 页面没有鉴权或写入口，渲染失败由 Next 静态构建直接报错。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "关于", description: "关于见微与这座个人知识花园。" };

export default function AboutPage() {
  return (
    <div className="site-shell narrow-page">
      <p className="section-kicker">ABOUT OASISMIND</p>
      <h1>见微，是一座写给未来自己的知识花园。</h1>
      <div className="about-lead">
        <p>我用它保存理解世界的过程：读过的东西、做过的实验、踩过的坑，以及那些还没有答案的问题。</p>
        <p>“见微知著”不是追求宏大结论，而是相信真正有用的理解，往往从一个具体问题、一段代码或一句被画下来的话开始。</p>
      </div>
      <div className="about-grid">
        <article><span>01</span><h2>公开，但不喧闹</h2><p>这里只发布我明确选择公开的文章。草稿、私人批注和本地 Agent 永远留在工作台。</p></article>
        <article><span>02</span><h2>持续，而非完成</h2><p>文章会随着理解更新。知识库不是作品陈列柜，而是一块可以继续耕作的土地。</p></article>
        <article><span>03</span><h2>人和 Agent 都能读</h2><p>除了网页，这里也提供稳定的只读 JSON 与 Markdown，让其他工具能准确引用公开内容。</p></article>
      </div>
      <Link href="/knowledge" className="primary-button">开始浏览 <ArrowRight size={17} /></Link>
    </div>
  );
}
