import type { Metadata } from "next";
import { GardenClient } from "@/components/GardenClient";
import { getGarden, getManifest } from "@/lib/publicContent";

export function generateStaticParams() {
  return getManifest().gardens.map((garden) => ({ garden: garden.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ garden: string }> }): Promise<Metadata> {
  const { garden: gardenId } = await params;
  const result = getGarden(decodeURIComponent(gardenId));
  return result ? { title: result.garden.title, description: result.garden.description } : {};
}

export default async function GardenPage({ params }: { params: Promise<{ garden: string }> }) {
  const { garden: gardenId } = await params;
  return <GardenClient gardenId={decodeURIComponent(gardenId)} />;
}
