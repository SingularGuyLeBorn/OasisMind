import type { Metadata } from "next";
import { getReadingDocument, PublicMarkdown } from "@/components/PublicMarkdown";
import { SiteLink } from "@/components/SiteLink";

export const metadata: Metadata = { title: "关于应知序", description: "粗鄙、偏颇，但还有点梦想。" };
export default function AboutPage() {
  const document = getReadingDocument("pages", "about");
  const profile = document.profile;
  if (!profile) throw new Error("缺少公开个人资料");
  return <div className="site-shell narrow-page">
    <p className="section-kicker">ABOUT ME</p><h1>{profile.name}</h1>
    <div className="about-lead"><h2>{profile.title}</h2><p>{profile.tagline}</p><p>{profile.oneLiner}</p>
      <SiteLink href={profile.github}>GitHub</SiteLink>
    </div>
    <div className="about-grid">{profile.focus.map((item) => <article key={item.title}><h2>{item.title}</h2><p>{item.description}</p></article>)}</div>
    <PublicMarkdown html={document.html} />
    <div className="section-heading compact"><h2>正在做的东西</h2></div>
    <div className="about-grid">{profile.projects.map((project) => <article key={project.name}>
      <h2>{project.href ? <SiteLink href={project.href}>{project.name}</SiteLink> : project.name}</h2>
      <p>{project.tagline}</p><p>{project.description}</p>
    </article>)}</div>
  </div>;
}
