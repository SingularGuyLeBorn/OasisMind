import { notFound } from "next/navigation";
import { getGarden } from "@/lib/publicContent";
import { GardenReader } from "@/components/GardenReader";

export const metadata = { title: "资源", description: "创意作品、Skill 与实用小工具。" };
export default function ResourcesPage() {
  const result = getGarden("resources");
  if (!result) notFound();
  return <GardenReader {...result} />;
}
