/**
 * Review title (when present) above the review text.
 * @param {{review: Object}} props
 */
export function ReviewCommentCell({ review }) {
  return (
    <div>
      {review.title && <strong style={{ display: "block", marginBottom: 2 }}>{review.title}</strong>}
      <span>{review.comment || "—"}</span>
    </div>
  );
}
