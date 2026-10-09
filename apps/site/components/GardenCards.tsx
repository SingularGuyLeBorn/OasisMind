import type { PublicGarden } from "@oasismind/shared";
import { ArrowRight } from "lucide-react";
import { SiteLink } from "@/components/SiteLink";
import { GardenArtwork, gardenArtworkPalette, gardenCardComposition } from "@oasismind/brand";

export function GardenCards({ gardens }: { gardens: PublicGarden[] }) {
  return <div className="garden-grid">{gardens.map((garden, index) => <SiteLink className="garden-card om-library-card om-sculpture-interactive" data-composition={gardenCardComposition(garden.id)} style={gardenArtworkPalette(garden.id)} href={`/gardens/${encodeURIComponent(garden.id)}`} key={garden.id}>
    <div className="om-card-visual"><span className="garden-index">{String(index + 1).padStart(2, "0")}</span>
      <GardenArtwork gardenId={garden.id} />
    </div>
    <div className="om-card-body"><h3>{garden.title}</h3><p>{garden.description ?? "进入知识库，沿目录阅读。"}</p>
      <small>{garden.postCount} 篇文章 <ArrowRight size={14} /></small>
    </div>
  </SiteLink>)}</div>;
}
