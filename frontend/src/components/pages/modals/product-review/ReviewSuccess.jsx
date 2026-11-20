import { CheckCircle2 } from "lucide-react";

/**
 * Thank-you view shown after a review was submitted.
 * @param {object} props
 * @param {string} props.productTitle Reviewed product's name.
 * @param {() => void} props.onDone Closes the dialog.
 */
export function ReviewSuccess({ productTitle, onDone }) {
  return (
    <div className="review-modal-success">
      <div className="success-icon-wrap">
        <CheckCircle2 size={54} color="#059669" />
      </div>
      <h3>Thank You for Your Feedback!</h3>
      <p className="success-copy">
        Your verified review for <strong>{productTitle}</strong> has been received! Our moderation team will verify it and publish it to the storefront shortly.
      </p>
      <button
        type="button"
        className="review-modal-done-btn"
        onClick={onDone}
      >
        Done
      </button>
    </div>
  );
}
