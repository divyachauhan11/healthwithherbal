/**
 * Cancel / submit buttons of the account return/exchange dialog.
 * @param {object} props
 * @param {boolean} props.saving The request is being sent.
 * @param {boolean} props.returnExchangeEnabled Submit online (else continue to an email draft).
 * @param {() => void} props.onCancel Closes the dialog.
 */
export function ReturnRequestFooter({ saving, returnExchangeEnabled, onCancel }) {
  return (
    <footer>
      <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      <button type="submit" disabled={saving}>{saving ? "Uploading…" : returnExchangeEnabled ? "Submit request" : "Continue to email"}</button>
    </footer>
  );
}
