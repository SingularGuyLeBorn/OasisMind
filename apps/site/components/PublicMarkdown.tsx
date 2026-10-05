"use client";

/**
 * 公开 Markdown 展示层。正文来自已验证的发布投影，安全规则由共享渲染核心负责；
 * 手写标记只产生视觉效果，不绑定评论或写接口，非法标记会被 sanitize/解析逻辑忽略。
 */
import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { MarkdownRendererCore } from "@oasismind/markdown";
import { annotate } from "rough-notation";

type PublicRoughAnnotationType =
  | "underline"
  | "circle"
  | "highlight"
  | "box"
  | "bracket"
  | "crossed-off"
  | "strike-through";

const ROUGH_TYPES = new Set<PublicRoughAnnotationType>([
  "underline", "circle", "highlight", "box", "bracket", "crossed-off", "strike-through",
]);

function readData(props: Record<string, unknown>, kebab: string, camel: string): string | undefined {
  const value = props[kebab] ?? props[camel];
  return typeof value === "string" ? value : undefined;
}

function RoughMark({ children, ...props }: ComponentPropsWithoutRef<"mark"> & { node?: unknown }) {
  const ref = useRef<HTMLSpanElement>(null);
  const data = props as Record<string, unknown>;
  const rawType = readData(data, "data-annotation", "dataAnnotation") ?? "highlight";
  const type = ROUGH_TYPES.has(rawType as PublicRoughAnnotationType)
    ? rawType as PublicRoughAnnotationType
    : "underline";
  const color = readData(data, "data-color", "dataColor") ?? (type === "highlight" ? "#fde68a" : "#f97316");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const drawing = annotate(element, { type, color, multiline: true, padding: 2, iterations: 2 });
    drawing.show();
    const observer = new ResizeObserver(() => {
      drawing.hide();
      drawing.show();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      drawing.remove();
    };
  }, [color, type]);

  return <span ref={ref} className="rough-mark">{children as ReactNode}</span>;
}

export function PublicMarkdown({ content }: { content: string }) {
  return (
    <MarkdownRendererCore
      content={content}
      className="article-prose"
      components={{
        mark: RoughMark,
        a: ({ href, children, ...props }) => (
          <a
            {...props}
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        img: ({ alt, ...props }) => (
          // 公开资源已经过生成器白名单与压缩；保留原宽高比，不由 Next 再次处理。
          // eslint-disable-next-line @next/next/no-img-element
          <img {...props} alt={alt ?? "文章配图"} loading="lazy" />
        ),
      }}
    />
  );
}
