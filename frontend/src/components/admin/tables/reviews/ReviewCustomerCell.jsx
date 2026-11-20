/**
 * Reviewer name with their email and order number when known.
 * @param {{review: Object}} props
 */
export function ReviewCustomerCell({ review }) {
  return (
    <div>
      <b>{review.userId?.name || review.userName || "Customer"}</b>
      {(review.userEmail || review.orderNumber) && (
        <small className="cell-subtitle" style={{ display: "block" }}>
          {review.userEmail} {review.orderNumber ? `(#${review.orderNumber})` : ""}
        </small>
      )}
    </div>
  );
}
