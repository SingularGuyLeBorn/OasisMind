import { StaticWidget } from "@/components/StaticWidget";
import { PublicOffice } from "@/components/PublicOffice";
import { getManifest } from "@/lib/publicContent";

export const metadata = { title: "3D 研究工作室", description: "在立体研究工作室里探索知识库、模型原理与学习资源。" };
export default function OfficePage() {
  const gardens = getManifest().gardens.filter(garden => garden.id !== "resources").map(({ id, title }) => ({ id, title }));
  return <StaticWidget kind="office" props={{ gardens }}><PublicOffice gardens={gardens} /></StaticWidget>;
}
