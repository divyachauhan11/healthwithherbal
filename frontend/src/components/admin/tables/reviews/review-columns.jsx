import { RecordStatusBadge } from "../shared";
import { ReviewCommentCell } from "./ReviewCommentCell";
import { ReviewCustomerCell } from "./ReviewCustomerCell";
import { ReviewRating } from "./ReviewRating";
import { ReviewRowActions } from "./ReviewRowActions";
import { getReviewStatusLabel } from "./review-utils";

/**
 * DataTable column definitions for the reviews table.
 * @param {Object} handlers
 * @param {(review: Object, isApproved: boolean, status: string) => void} handlers.onModerate Approve or reject a review.
 * @param {(review: Object) => void} handlers.onDelete Delete (or confirm deleting) a review.
 * @returns {Array<Object>}
 */
export function getReviewColumns({ onModerate, onDelete }) {
  return [
    {
      key: "userId.name",
      label: "Customer",
      sortable: true,
      render: (review) => <ReviewCustomerCell review={review} />,
    },
    {
      key: "productId.title",
      label: "Product",
      sortable: true,
      render: (review) => review.productId?.title || "Product",
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (review) => <ReviewRating rating={review.rating} />,
    },
    {
      key: "comment",
      label: "Review",
      cellClassName: "review-copy",
      render: (review) => <ReviewCommentCell review={review} />,
    },
    {
      key: "isApproved",
      label: "Status",
      sortable: true,
      render: (review) => <RecordStatusBadge status={getReviewStatusLabel(review)} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (review) => (
        <ReviewRowActions review={review} onModerate={onModerate} onDelete={onDelete} />
      ),
    },
  ];
}
