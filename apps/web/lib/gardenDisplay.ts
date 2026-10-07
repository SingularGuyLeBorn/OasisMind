/** 花园目录采用 PascalCase 正式英文名；这里负责拆词和专有名称的标准大小写。 */
const GARDEN_ID_LABEL: Record<string, string> = {
  StanfordCS336: "Stanford CS336",
  DeepSeek: "DeepSeek",
  OLMo: "OLMo",
  LLMInfrastructure: "LLM Infrastructure",
  "daily-fragments": "Daily Fragments",
  posts: "Posts",
  knowledge: "Knowledge",
  resources: "Resources",
  essays: "Essays",
};

const ACRONYMS = new Set(["AI", "API", "DB", "LLM", "MCP", "RAG", "RSI", "UI"]);

export function formatGardenId(id: string): string {
  if (GARDEN_ID_LABEL[id]) return GARDEN_ID_LABEL[id];
  return id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((segment) => {
      const upper = segment.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      if (/^[A-Za-z]+\d+[A-Za-z0-9]*$/.test(segment)) return upper;
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}

export function displayGardenTitle(title: string): string {
  return title.trim();
}
