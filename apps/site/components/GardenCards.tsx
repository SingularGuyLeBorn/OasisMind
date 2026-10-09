import type { PublicGarden } from "@oasismind/shared";
import { ArrowRight } from "lucide-react";
import { SiteLink } from "@/components/SiteLink";
import { GardenArtwork, gardenArtworkPalette } from "@oasismind/brand";

export function GardenCards({ gardens }: { gardens: PublicGarden[] }) {
  return <div className="garden-grid">{gardens.map((garden, index) => <SiteLink className="garden-card om-sculpture-interactive" style={gardenArtworkPalette(garden.id)} href={`/gardens/${encodeURIComponent(garden.id)}`} key={garden.id}>
    <span className="garden-index">{String(index + 1).padStart(2, "0")}</span>
    <GardenArtwork gardenId={garden.id} className="garden-card-sculpture" />
    <h3>{garden.title}</h3><p>{garden.description ?? "进入知识库，沿目录阅读。"}</p>
    <small>{garden.postCount} 篇文章 <ArrowRight size={14} /></small>
  </SiteLink>)}</div>;
}
