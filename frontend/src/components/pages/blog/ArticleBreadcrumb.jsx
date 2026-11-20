/**
 * "Blog / <title>" breadcrumb of the article view.
 * @param {object} props
 * @param {string} props.title Article title.
 * @param {() => void} props.onBack Returns to the blog list.
 */
export function ArticleBreadcrumb({ title, onBack }) {
  return (
    <nav className="article-breadcrumb" aria-label="Breadcrumb">
      <button type="button" onClick={onBack}>
        Blog
      </button>
      <span>/</span>
      <span>{title}</span>
    </nav>
  );
}
