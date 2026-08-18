import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeFeedUrl, parseOpmlFeeds } from "../infra/opmlImport.js";
import { importOpmlFeedsToInfoSources } from "../infra/tidingsRssImport.js";
import { prisma } from "../db.js";
import { getServiceContainer, resetServiceContainerForTests } from "../infra/serviceContainer.js";
import { getEventBus } from "../infra/eventBus.js";
import { createTestConfig, createTempProjectDir } from "./helpers/toolTestFixtures.js";

const STAMP = `opml-${Date.now().toString(36)}`;
const SAMPLE_OPML = `<?xml version="1.0"?>
<opml version="2.0">
  <body>
    <outline text="AI" title="AI">
      <outline type="rss" text="OpenAI Blog ${STAMP}" title="OpenAI Blog ${STAMP}"
        xmlUrl="https://example.test/${STAMP}/openai.xml" htmlUrl="https://example.test/${STAMP}"/>
      <outline type="rss" text="Dup" title="Dup"
        xmlUrl="https://example.test/${STAMP}/openai.xml"/>
      <outline text="folder only"/>
    </outline>
    <outline type="rss" text="Karpathy ${STAMP}" xmlUrl="https://example.test/${STAMP}/karpathy.xml"/>
  </body>
</opml>`;

describe("opmlImport / tidings 导入", () => {
  it("解析 outline xmlUrl，按 URL 去重", () => {
    const feeds = parseOpmlFeeds(SAMPLE_OPML);
    expect(feeds.map((f) => f.xmlUrl)).toEqual([
      `https://example.test/${STAMP}/openai.xml`,
      `https://example.test/${STAMP}/karpathy.xml`,
    ]);
    expect(feeds[0]?.htmlUrl).toBe(`https://example.test/${STAMP}`);
    expect(normalizeFeedUrl("https://X.com/a/")).toBe("https://x.com/a");
  });

  it("导入为关闭的 rss 信息源，二次导入跳过同 URL", async () => {
    const root = createTempProjectDir();
    const config = createTestConfig(root);
    fs.mkdirSync(config.configPaths.sources, { recursive: true });
    resetServiceContainerForTests();
    const services = getServiceContainer(prisma, getEventBus(), config);
    const feeds = parseOpmlFeeds(SAMPLE_OPML);
    const first = await importOpmlFeedsToInfoSources({
      services,
      feeds,
      tags: ["tidings", "ai"],
      enabled: false,
      descriptionPrefix: "Tidings · AI",
    });
    expect(first.created).toBe(2);
    expect(first.skipped).toBe(0);
    const second = await importOpmlFeedsToInfoSources({
      services,
      feeds,
      tags: ["tidings", "ai"],
      enabled: false,
    });
    expect(second.created).toBe(0);
    expect(second.skipped).toBe(2);
    const rows = await prisma.infoSource.findMany({
      where: { url: { in: feeds.map((f) => f.xmlUrl) } },
    });
    expect(rows.every((r) => r.enabled === false)).toBe(true);
    expect(rows.every((r) => r.type === "rss")).toBe(true);
    expect(rows.every((r) => r.fetchInterval == null)).toBe(true);
    await prisma.infoSource.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
    resetServiceContainerForTests();
  });
});
