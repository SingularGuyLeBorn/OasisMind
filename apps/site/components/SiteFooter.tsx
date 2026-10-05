/** 公开站静态页脚；无数据依赖、无交互权限，构建错误直接由 Next 暴露。 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <p>见微知著。把值得留下的思考，整理成可以再次抵达的知识。</p>
        <p>公开内容可供人和 Agent 只读访问。</p>
      </div>
    </footer>
  );
}
