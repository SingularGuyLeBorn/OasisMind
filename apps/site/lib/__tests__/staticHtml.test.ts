import { describe, expect, it } from "vitest";
import { finalizeReadingHtml } from "../../scripts/static-html.mjs";

describe("静态阅读页面", () => {
  it("知识库空间单独启动轻量交互，不必为切视角加载 React 控件", () => {
    const html = '<html><body><section data-spatial-navigator="true">书架</section></body></html>';
    const output = finalizeReadingHtml(finalizeReadingHtml(html, '/widgets.js', '/navigation.js'), '/widgets.js', '/navigation.js');
    expect(output.match(/src="\/navigation.js"/g)).toHaveLength(1);
    expect(output).not.toContain('/widgets.js');
    expect(output).toContain('>书架</section>');
  });
  it("保留正文、公式、参数与样式，只移除框架脚本和预载副本", () => {
    const html = '<html><head><link rel="stylesheet" href="/style.css"><link rel="preload" as="script" href="/_next/a.js"><script type="application/ld+json">{"name":"见微"}</script></head><body><article><h2 id="intro">正文</h2><span class="katex">公式</span></article><div data-public-widget="posts"><script type="application/json" data-widget-props>{"posts":[]}</script></div><script src="/_next/a.js"></script><script>self.__next_f.push([1,"正文副本"])</script></body></html>';
    const output = finalizeReadingHtml(html, "/OasisMind/_reading/widgets.js", "/OasisMind/_reading/navigation.js");
    expect(output).toContain('<h2 id="intro">正文</h2>');
    expect(output).toContain('class="katex"');
    expect(output).toContain('rel="stylesheet"');
    expect(output).toContain('type="application/ld+json"');
    expect(output).toContain('data-widget-props>{"posts":[]}');
    expect(output).not.toContain('_next/a.js');
    expect(output).not.toContain('self.__next_f');
    expect(output.match(/type="module"/g)).toHaveLength(1);
  });
  it("无交互控件的页面不加载脚本，多次整理不重复添加脚本", () => {
    expect(finalizeReadingHtml('<html><body>文字</body></html>', '/widgets.js', '/navigation.js')).not.toContain('<script');
    const html = '<html><body><div data-public-widget="reader"></div></body></html>';
    const output = finalizeReadingHtml(finalizeReadingHtml(html, '/widgets.js', '/navigation.js'), '/widgets.js', '/navigation.js');
    expect(output.match(/src="\/widgets.js"/g)).toHaveLength(1);
  });
  it("手机侧栏以独立小脚本先启动，不等 React 控件，也不重复注入", () => {
    const html = '<html><body><article data-reading-content="true">正文</article><div data-public-widget="reader"></div></body></html>';
    const once = finalizeReadingHtml(html, '/widgets.js', '/navigation.js');
    const output = finalizeReadingHtml(once, '/widgets.js', '/navigation.js');
    expect(output.match(/src="\/navigation.js"/g)).toHaveLength(1);
    expect(output.match(/src="\/widgets.js"/g)).toHaveLength(1);
    expect(output.indexOf('src="/navigation.js"')).toBeLessThan(output.indexOf('src="/widgets.js"'));
    expect(output).toContain('data-reading-content="true">正文');
  });
});
