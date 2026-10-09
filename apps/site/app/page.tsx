/**
 * 公开首页服务端组件；精选文章与统计只取公开清单，保持现有亮色品牌视觉。
 * 清单缺失或不合法时静态构建失败，禁止回退连接本地工作台或展示草稿。
 */
import { SiteLink as Link } from "@/components/SiteLink";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { GardenCards } from "@/components/GardenCards";
import { getManifest } from "@/lib/publicContent";

export default function HomePage() {
  const manifest = getManifest();
  const featured = manifest.posts.slice(0, 6);
  const gardens = manifest.gardens.filter(garden => garden.id !== "resources");

  return (
    <>
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="site-shell hero-inner">
          <p className="eyebrow"><Sparkles size={15} /> PERSONAL KNOWLEDGE GARDEN</p>
          <h1>从细微处，<br /><span>看见思想生长。</span></h1>
          <p className="hero-copy">
            这里收纳我在 AI、工程、学习与生活中的公开思考。不是信息流，
            而是一座持续修剪、可以反复漫游的知识花园。
          </p>
          <div className="hero-actions">
            <Link href="/knowledge" className="primary-button"><BookOpen size={18} />进入知识库</Link>
            <Link href="/about" className="text-link">关于见微 <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-stats">
            <div><strong>{manifest.posts.length}</strong><span>篇公开文章</span></div>
            <div><strong>{gardens.length}</strong><span>座知识花园</span></div>
            <div><strong>∞</strong><span>持续生长</span></div>
          </div>
        </div>
      </section>

      <section className="site-shell section-block">
        <div className="section-heading">
          <div><p className="section-kicker">RECENT NOTES</p><h2>最近公开的思考</h2></div>
          <Link href="/knowledge">查看全部 <ArrowRight size={16} /></Link>
        </div>
        <div className="post-grid">{featured.map((post) => <PostCard key={post.id} post={post} />)}</div>
      </section>

      <section className="garden-band">
        <div className="site-shell section-block">
          <div className="section-heading"><div><p className="section-kicker">GARDENS</p><h2>沿着主题漫游</h2></div></div>
          <GardenCards gardens={gardens} />
        </div>
      </section>
    </>
  );
}
