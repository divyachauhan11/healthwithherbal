import { ArticleCommentCard } from "./ArticleCommentCard";

/**
 * Approved comments of an article, or an invitation to comment when there are none.
 * @param {object} props
 * @param {Array<{_id: string}>} props.comments
 */
export function ArticleCommentList({ comments }) {
  return (
    <div className="article-comment-list">
      {comments.map((comment) => (
        <ArticleCommentCard key={comment._id} comment={comment} />
      ))}
      {!comments.length && <p className="article-no-comments">No approved comments yet. Start the conversation.</p>}
    </div>
  );
}
