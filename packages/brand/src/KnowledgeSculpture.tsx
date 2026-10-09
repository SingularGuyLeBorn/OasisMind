/** 两个站点共用的立体书页装饰：纯 HTML/CSS，不加载 WebGL、图片或客户端运行时。 */
export function KnowledgeSculpture({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  // [OM-FREEPLAY] 书页作为知识库的视觉隐喻，不代表论文架构或实际知识关系。
  return (
    <div
      aria-hidden="true"
      className={`om-knowledge-sculpture${compact ? " om-knowledge-sculpture--compact" : ""}${className ? ` ${className}` : ""}`}
    >
      <div className="om-sculpture-shadow" />
      <div className="om-sculpture-book">
        <div className="om-sculpture-sheet om-sculpture-sheet--back" />
        <div className="om-sculpture-sheet om-sculpture-sheet--notes">
          <div className="om-sculpture-lines"><i /><i /><i /><i /></div>
          <div className="om-sculpture-diagram"><i /><i /><i /></div>
        </div>
        <div className="om-sculpture-sheet om-sculpture-sheet--cover">
          <span className="om-sculpture-edition">OASISMIND</span>
          <span className="om-sculpture-title">见微</span>
          <span className="om-sculpture-rule" />
          <span className="om-sculpture-caption">问题 · 机制 · 证据</span>
          <span className="om-sculpture-bookmark" />
        </div>
      </div>
    </div>
  );
}
