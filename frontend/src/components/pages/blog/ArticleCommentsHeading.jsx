/**
 * Heading of the article comments section with the approved comment count.
 * @param {object} props
 * @param {number} props.count Approved comments.
 */
export function ArticleCommentsHeading({ count }) {
  return (
    <div className="article-comments-heading">
      <div>
        <span>Community</span>
        <h2 id="article-comments-title">Comments ({count})</h2>
      </div>
      <p>Comments appear here after they are approved.</p>
    </div>
  );
}
