import { describe, expect, it } from 'vitest';
import { assertValidReadingSource } from '../readingSource';
describe('阅读源稿校验', () => {
  it('拒绝被空格拆开的图片标记，包括空说明和引用块', () => {
    for (const source of ['! [图](./image.png)', '! [](./image.jpg)', '> ! [图](./image.webp)']) {
      expect(() => assertValidReadingSource(source, '文章')).toThrow('图片标记');
    }
  });
  it('允许正常配图与普通感叹号加链接', () => {
    expect(() => assertValidReadingSource('![图](./image.png)\n! [说明](./article.md)', '文章')).not.toThrow();
  });
  it('拒绝被空格拆开的相对链接', () => {
    expect(() => assertValidReadingSource('![图](. /images/image.png)', '文章')).toThrow('相对链接');
    expect(() => assertValidReadingSource('[说明](.. /article.md)', '文章')).toThrow('相对链接');
  });
  it('拒绝拆开的网页地址，保留行内代码示例', () => {
    expect(() => assertValidReadingSource('来源 https: //arxiv.org/abs/2401.02954', '文章')).toThrow('网页地址');
    expect(() => assertValidReadingSource('错误示例 `https: //example.com`', '文章')).not.toThrow();
  });
  it('不修改或拦截展示错误语法的代码示例', () => {
    expect(() => assertValidReadingSource('```md\n! [图](./image.png)\n```\n\n    ! [](./image.png)', '文章')).not.toThrow();
    expect(() => assertValidReadingSource('错误示例 `![图](. /image.png)`', '文章')).not.toThrow();
  });
  it('拒绝 NUL 与工具截断片段', () => {
    for (const source of ['正文\0', '…123 tokens truncated…']) {
      expect(() => assertValidReadingSource(source, '首页')).toThrow('首页');
    }
  });
});
