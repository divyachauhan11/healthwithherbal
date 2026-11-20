/**
 * Full-width cover image of an article.
 * @param {object} props
 * @param {string} props.src
 * @param {string} props.alt
 */
export function ArticleCoverImage({ src, alt }) {
  return (
    <div className="article-page-image">
      <img src={src} alt={alt} />
    </div>
  );
}
