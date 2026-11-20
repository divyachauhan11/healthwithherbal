"use client";

import { X } from "lucide-react";
import {
  ReviewCommentField,
  ReviewErrorAlert,
  ReviewHeadlineField,
  ReviewModalActions,
  ReviewModerationNote,
  ReviewProductPreview,
  ReviewRatingField,
  ReviewSuccess,
  ReviewerDetailsFields,
  useProductReviewForm,
} from "./product-review";
import {
  reviewBrandName,
  reviewOrderNumber,
  reviewProductTitle,
} from "./product-review/product-review-utils";

/**
 * Dialog for reviewing a delivered product: star rating, title, review text
 * and reviewer details, then a thank-you view. Renders nothing while closed.
 * @param {object} props
 * @param {boolean} props.isOpen Dialog is open.
 * @param {() => void} props.onClose Closes the dialog.
 * @param {object|null} props.product Reviewed product / order line.
 * @param {object} [props.order] Order the product was delivered in.
 * @param {object|null} [props.currentUser] Signed-in customer.
 * @param {() => void} [props.onSubmitted] Called after a successful submission.
 */
export function ProductReviewModal({
  isOpen,
  onClose,
  product,
  order,
  currentUser,
  onSubmitted,
}) {
  const review = useProductReviewForm({ product, order, currentUser, onClose, onSubmitted });

  if (!isOpen || !product) return null;

  const productTitle = reviewProductTitle(product);

  return (
    <div className="product-review-modal-backdrop" onClick={review.handleClose}>
      <div
        className="product-review-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <button
          type="button"
          className="review-modal-close"
          onClick={review.handleClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {review.success ? (
          <ReviewSuccess productTitle={productTitle} onDone={review.handleClose} />
        ) : (
          <form onSubmit={review.handleSubmit} className="review-modal-form">
            <ReviewProductPreview
              brandName={reviewBrandName(product)}
              productTitle={productTitle}
              orderNumber={reviewOrderNumber(order)}
            />

            {review.error && <ReviewErrorAlert message={review.error} />}

            <ReviewRatingField
              rating={review.rating}
              hoverRating={review.hoverRating}
              onRate={review.setRating}
              onHover={review.setHoverRating}
            />
            <ReviewHeadlineField value={review.title} onChange={review.setTitle} />
            <ReviewCommentField value={review.comment} onChange={review.setComment} />
            <ReviewerDetailsFields
              name={review.userName}
              email={review.userEmail}
              onNameChange={review.setUserName}
              onEmailChange={review.setUserEmail}
            />

            <ReviewModerationNote />

            <ReviewModalActions busy={review.busy} onCancel={review.handleClose} />
          </form>
        )}
      </div>
    </div>
  );
}
