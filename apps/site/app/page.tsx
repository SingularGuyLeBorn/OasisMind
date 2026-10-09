/**
 * 首页的知识库入口与统计只取公开清单，首屏直接提供阅读路径。
 * 清单缺失或不合法时静态构建失败，禁止回退连接本地工作台或展示草稿。
 */
import { SiteLink as Link } from "@/components/SiteLink";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { GardenCards } from "@/components/GardenCards";
import { getManifest } from "@/lib/publicContent";

export default function HomePage() {
  const manifest = getManifest();
  const featured = manifest.posts.slice(0, 6);
  const gardens = manifest.gardens.filter(garden => garden.id !== "resources");
  // [OM-FREEPLAY] 三条入门入口从现有知识库选取，不伪造阅读量或更新时间。
  const paths = [
    { id: "LargeLanguageModelGuide", label: "建立全局认识", name: "大语言模型指南", text: "从架构与训练开始，把分散的概念连起来。" },
    { id: "SparseAttention", label: "沿着一个问题深入", name: "稀疏注意力", text: "长上下文为什么贵，选择性计算怎样改变它。" },
    { id: "Agent", label: "把知识放回应用", name: "Agent", text: "工具、记忆与反馈怎样组成可验证的行动循环。" },
  ].filter(route => gardens.some(garden => garden.id === route.id));

  return (
    <>
      <section className="hero">
        <div className="site-shell hero-inner">
          <div className="hero-editorial">
            <p className="eyebrow">见微 · 大模型学习笔记</p>
            <h1>把大模型，<br /><span>读明白。</span></h1>
            <p className="hero-copy">读论文，推公式，理解方法为什么出现、又在哪里失效。从基础概念走进研究细节。</p>
            <div className="hero-actions">
              <Link href="/knowledge" className="primary-button"><BookOpen size={18} />浏览知识库</Link>
              <Link href="/about" className="text-link">关于我 <ArrowRight size={16} /></Link>
            </div>
            <Link href="/search" className="home-search"><Search size={20} /><span>搜索论文、算法与模型</span><ArrowRight size={18} /></Link>
            <div className="hero-stats">
              <div><strong>{gardens.length}</strong><span>个知识库</span></div>
              <div><strong>{manifest.posts.length}</strong><span>篇公开文章</span></div>
              <Link href="/resources">学习资源 <ArrowRight size={15} /></Link>
            </div>
          </div>
          <aside className="home-paths" aria-label="阅读入口">
            <p>从哪里开始？</p>
            {paths.map((route, index) => <Link href={`/gardens/${route.id}`} className="home-path" key={route.id}>
              <span className="path-number">0{index + 1}</span><div><small>{route.label}</small><h2>{route.name}</h2><p>{route.text}</p></div><ArrowRight size={20} />
            </Link>)}
          </aside>
        </div>
      </section>

      <section className="garden-band">
        <div className="site-shell section-block">
          <div className="section-heading"><div><p className="section-kicker">按主题阅读</p><h2>知识库</h2></div><Link href="/knowledge">全部知识库 <ArrowRight size={16} /></Link></div>
          <GardenCards gardens={gardens} />
        </div>
      </section>
      <section className="site-shell section-block">
        <div className="section-heading">
          <div><p className="section-kicker">继续阅读</p><h2>公开笔记</h2></div>
          <Link href="/search">搜索文章 <ArrowRight size={16} /></Link>
        </div>
        <div className="post-grid">{featured.map((post) => <PostCard key={post.id} post={post} />)}</div>
      </section>
    </>
  );
}
