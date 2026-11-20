import { AlertCircle } from "lucide-react";

/**
 * Error message above the review form fields.
 * @param {object} props
 * @param {string} props.message Error to show.
 */
export function ReviewErrorAlert({ message }) {
  return (
    <div className="review-modal-alert">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}
