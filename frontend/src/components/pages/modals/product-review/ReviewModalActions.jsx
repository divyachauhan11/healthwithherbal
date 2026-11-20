/**
 * Cancel / submit buttons of the review form.
 * @param {object} props
 * @param {boolean} props.busy Submission in progress (disables both buttons).
 * @param {() => void} props.onCancel Closes the dialog.
 */
export function ReviewModalActions({ busy, onCancel }) {
  return (
    <div className="review-modal-actions">
      <button
        type="button"
        className="review-cancel-btn"
        onClick={onCancel}
        disabled={busy}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="review-submit-btn"
        disabled={busy}
      >
        {busy ? "Submitting..." : "Submit Review for Approval"}
      </button>
    </div>
  );
}
