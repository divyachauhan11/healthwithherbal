/**
 * Cancel / "Email care team" buttons of the return/exchange form.
 * @param {object} props
 * @param {boolean} props.sending The request is being sent (disables both buttons).
 * @param {() => void} props.onCancel Closes the dialog.
 */
export function ReturnExchangeDialogActions({ sending, onCancel }) {
  return (
    <div className="return-exchange-dialog-actions">
      <button
        type="button"
        className="app-button secondary"
        disabled={sending}
        onClick={onCancel}
      >
        Cancel
      </button>
      <button type="submit" className="app-button" disabled={sending}>
        {sending ? "Sending request…" : "Email care team"}
      </button>
    </div>
  );
}
