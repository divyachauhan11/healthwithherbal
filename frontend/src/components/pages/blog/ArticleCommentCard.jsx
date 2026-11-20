import { formatCommentDate } from "./blog-utils";

/**
 * One approved comment: author, date and text.
 * @param {object} props
 * @param {{authorName: string, createdAt: string, content: string}} props.comment
 */
export function ArticleCommentCard({ comment }) {
  return (
    <article className="article-comment-card">
      <strong>{comment.authorName}</strong>
      <time>{formatCommentDate(comment.createdAt)}</time>
      <p>{comment.content}</p>
    </article>
  );
}
