import { Loader2 } from "lucide-react";

/**
 * Full-width submit button of an auth step; shows a spinner while loading.
 * @param {object} props
 * @param {boolean} props.loading Request in flight (also disables the button).
 * @param {string} props.label Idle label.
 * @param {string} props.loadingLabel Label shown next to the spinner.
 */
export function AuthSubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      className="auth-submit-btn"
      disabled={loading}
    >
      {loading ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Loader2 size={16} className="spin-animate" />{" "}
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
