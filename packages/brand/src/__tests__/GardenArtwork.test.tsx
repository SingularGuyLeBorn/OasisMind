import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { GardenArtwork, gardenCardComposition } from "../GardenArtwork";

describe("GardenArtwork", () => {
  it("构图跟随主题而非卡片排序，至少覆盖九种文字和视觉区排布", () => {
    const ids = ["SparseAttention", "DiffusionLanguageModels", "Agent", "ClassicPapers", "OnPolicyDistillation", "ContinualLearning", "LLMInfrastructure", "DeepSeek", "posts"];
    expect(new Set(ids.map(gardenCardComposition)).size).toBe(9);
    expect(gardenCardComposition("UnknownGarden")).toBe("ledger");
    expect(gardenCardComposition("OLMo")).toBe("folio");
  });
  it("21 座现有知识库使用不同图形，未知库仍有静态装饰", () => {
    const ids = ["SparseAttention", "DiffusionLanguageModels", "ReinforcementLearning", "RetrievalAugmentedGeneration", "Agent", "MultiAgentSystems", "OnPolicyDistillation", "ContinualLearning", "RecursiveSelfImprovement", "LongHorizonTask", "LLMInfrastructure", "model-library", "DeepSeek", "OLMo", "ClassicPapers", "StanfordCS336", "LargeLanguageModelGuide", "LargeLanguageModelInterview", "essays", "daily-fragments", "posts"];
    const patterns = ids.map(gardenId => {
      const art = GardenArtwork({ gardenId }) as ReactElement<Record<string, unknown>>;
      expect(art.props["aria-hidden"]).toBe("true");
      return art.props["data-motif"];
    });
    expect(new Set(patterns).size).toBe(ids.length);
    expect((GardenArtwork({ gardenId: "NewGarden" }) as ReactElement<Record<string, unknown>>).props["data-motif"]).toBe("columns");
  });
});
