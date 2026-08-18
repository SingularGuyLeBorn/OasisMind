"use client";

import {
  isValidElement,
  memo,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { isMathClassName } from "@/components/post/KatexFormula";
import { KatexHtml } from "@/components/post/KatexHtml";
import { cn } from "@/lib/utils";
import { protectMathPipesInMarkdown } from "@/lib/protectMathPipes";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement(node)) {
    return getText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

/**
 * 办公室专用轻量 Markdown：GFM + KaTeX + 图片。
 * 不拉 PostContent 全套（TOC / viz / 代码块工具栏）。
 */
export const OfficeRichMd = memo(function OfficeRichMd({
  content,
  className,
  compact = false,
}: {
  content: string;
  className?: string;
  /** 3D 屏 / 小卡：更紧凑的字号与间距 */
  compact?: boolean;
}) {
  const remarkPlugins = useMemo(() => [remarkMath, remarkGfm], []);
  const processed = useMemo(() => protectMathPipesInMarkdown(content), [content]);

  const components = useMemo<Components>(
    () => ({
      a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[var(--om-brand)] underline-offset-2 hover:underline"
          {...props}
        >
          {children}
        </a>
      ),
      img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => {
        if (typeof src !== "string" || !src) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || ""}
            loading="lazy"
            className={cn(
              "mx-auto w-full rounded-lg border border-[#E2E8F0] bg-white object-contain",
              compact ? "my-1 max-h-[72px]" : "my-3 max-h-[220px]",
            )}
          />
        );
      },
      code: ({ className: cls, children, ...props }: ComponentPropsWithoutRef<"code">) => {
        const className = typeof cls === "string" ? cls : "";
        if (className.includes("math-inline") || isMathClassName(className)) {
          return <KatexHtml tex={getText(children)} display={false} />;
        }
        const isBlock =
          className.includes("language-") || className.includes("hljs") || className.includes("math-display");
        if (isBlock) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
        return (
          <code
            className="rounded bg-[#E2E8F0]/70 px-1 py-0.5 font-mono text-[0.85em] text-[#0F172A]"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
        let childClass = "";
        if (isValidElement(children)) {
          childClass = ((children as ReactElement<{ className?: string }>).props.className) || "";
        }
        const language = /language-([\w-]+)/.exec(childClass)?.[1] ?? "";
        const isMath = isMathClassName(childClass) || language === "math" || childClass.includes("math-display");
        if (isMath) {
          return (
            <div className={cn("overflow-x-auto", compact ? "my-0.5" : "my-2")}>
              <KatexHtml tex={getText(children)} display />
            </div>
          );
        }
        return (
          <pre
            className={cn(
              "overflow-x-auto rounded-lg bg-[#0F172A] text-[#E2E8F0]",
              compact ? "my-1 p-1.5 text-[9px]" : "my-2 p-3 text-xs",
            )}
          >
            {children}
          </pre>
        );
      },
      p: ({ children, className: pClass }: ComponentPropsWithoutRef<"div">) => (
        <div className={cn(compact ? "my-0.5 leading-snug" : "my-1.5 leading-relaxed", pClass)}>
          {children}
        </div>
      ),
      ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
        <ul className={cn("list-disc pl-4", compact ? "my-0.5 space-y-0.5" : "my-2 space-y-1")}>
          {children}
        </ul>
      ),
      ol: ({ children }: ComponentPropsWithoutRef<"ol">) => (
        <ol className={cn("list-decimal pl-4", compact ? "my-0.5 space-y-0.5" : "my-2 space-y-1")}>
          {children}
        </ol>
      ),
      li: ({ children }: ComponentPropsWithoutRef<"li">) => (
        <li className={compact ? "text-[10px] leading-snug" : "text-sm leading-relaxed"}>{children}</li>
      ),
      h3: ({ children }: ComponentPropsWithoutRef<"h3">) => (
        <h3 className={cn("font-semibold text-[#0F172A]", compact ? "mb-0.5 text-[11px]" : "mb-2 text-base")}>
          {children}
        </h3>
      ),
      h4: ({ children }: ComponentPropsWithoutRef<"h4">) => (
        <h4 className={cn("font-semibold text-[#0F172A]", compact ? "text-[10px]" : "text-sm")}>{children}</h4>
      ),
      strong: ({ children }: ComponentPropsWithoutRef<"strong">) => (
        <strong className="font-semibold text-[#0F172A]">{children}</strong>
      ),
    }),
    [compact],
  );

  return (
    <div
      className={cn(
        "office-rich-md text-[#334155]",
        compact ? "text-[10px] [&_.katex]:text-[0.95em]" : "text-sm [&_.katex]:text-[1.05em]",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {processed}
      </ReactMarkdown>
    </div>
  );
});
