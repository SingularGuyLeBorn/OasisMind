import type { CSSProperties } from "react";

type GardenScene = { motif: string; pieces: number; ink: string; paper: string };

// [OM-FREEPLAY] 按各库主题设计不同视觉母题；这些是装饰，不作为算法示意图使用。
const scenes: Record<string, GardenScene> = {
  SparseAttention: { motif: "sparse", pieces: 36, ink: "#176665", paper: "#e2eee7" },
  DiffusionLanguageModels: { motif: "diffusion", pieces: 20, ink: "#6579a6", paper: "#e9edf5" },
  ReinforcementLearning: { motif: "steps", pieces: 5, ink: "#a87e45", paper: "#f2ebde" },
  RetrievalAugmentedGeneration: { motif: "retrieval", pieces: 5, ink: "#4e8176", paper: "#e5efe8" },
  Agent: { motif: "hub", pieces: 5, ink: "#557b8f", paper: "#e7eff2" },
  MultiAgentSystems: { motif: "constellation", pieces: 7, ink: "#6b7c9b", paper: "#eaeef5" },
  OnPolicyDistillation: { motif: "paired", pieces: 6, ink: "#9a7154", paper: "#f3e9df" },
  ContinualLearning: { motif: "timeline", pieces: 5, ink: "#6d8361", paper: "#edf1e6" },
  RecursiveSelfImprovement: { motif: "recursive", pieces: 3, ink: "#79799a", paper: "#ecebf3" },
  LongHorizonTask: { motif: "path", pieces: 8, ink: "#b18a54", paper: "#f3eddf" },
  LLMInfrastructure: { motif: "rack", pieces: 3, ink: "#597a79", paper: "#e6efeb" },
  "model-library": { motif: "shelf", pieces: 6, ink: "#887058", paper: "#eee9e1" },
  DeepSeek: { motif: "compressed", pieces: 5, ink: "#526e9b", paper: "#e7ecf4" },
  OLMo: { motif: "openbook", pieces: 4, ink: "#59856c", paper: "#e5eee6" },
  ClassicPapers: { motif: "papers", pieces: 3, ink: "#a48b66", paper: "#f1ece2" },
  StanfordCS336: { motif: "matrix", pieces: 9, ink: "#95685c", paper: "#f0e7e2" },
  LargeLanguageModelGuide: { motif: "chapters", pieces: 5, ink: "#5c827b", paper: "#e5eeea" },
  LargeLanguageModelInterview: { motif: "dialogue", pieces: 2, ink: "#937867", paper: "#efe8e3" },
  essays: { motif: "pen", pieces: 3, ink: "#84836c", paper: "#eeeee5" },
  "daily-fragments": { motif: "calendar", pieces: 12, ink: "#769084", paper: "#e8f0eb" },
  posts: { motif: "columns", pieces: 4, ink: "#6c8190", paper: "#e9eef2" },
};

/** [OM-FREEPLAY] 卡片边线与底色跟随各库的图形配色，不按列表序号随机换色。 */
export function gardenArtworkPalette(gardenId: string): CSSProperties {
  const scene = scenes[gardenId] ?? scenes.posts;
  return { "--art-ink": scene.ink, "--art-paper": scene.paper } as CSSProperties;
}

export function GardenArtwork({ gardenId, className }: { gardenId: string; className?: string }) {
  const scene = scenes[gardenId] ?? scenes.posts;
  return <div aria-hidden="true" data-garden-art={gardenId} data-motif={scene.motif}
    className={`om-garden-art${className ? ` ${className}` : ""}`}
    style={gardenArtworkPalette(gardenId)}>
    <div className="om-garden-art-stage">{Array.from({ length: scene.pieces }, (_, index) =>
      <i key={index} style={{
        "--piece": index, "--mod2": index % 2, "--mod3": index % 3, "--mod4": index % 4,
        "--row2": Math.floor(index / 2), "--row3": Math.floor(index / 3),
        "--scatter-x": (index * 23) % 100, "--scatter-y": (index * 17) % 64,
      } as CSSProperties} />)}</div>
  </div>;
}
