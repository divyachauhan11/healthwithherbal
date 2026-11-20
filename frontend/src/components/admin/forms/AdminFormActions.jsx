/**
 * Cancel and submit buttons of an inline admin form.
 * @param {object} props
 * @param {boolean} props.busy Shows "Saving…" and disables submit.
 * @param {import("react").ReactNode} props.submitLabel
 * @param {() => void} props.onClose
 */
export function AdminFormActions({ busy, submitLabel, onClose }) {
  return (
    <div className="form-actions">
      <button type="button" className="outline" onClick={onClose}>
        Cancel
      </button>
      <button className="primary" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
