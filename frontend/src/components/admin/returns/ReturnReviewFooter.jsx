/**
 * Cancel / save actions of the return review form.
 * @param {{saving: boolean, onClose: () => void}} props
 */
export function ReturnReviewFooter({ saving, onClose }) {
  return (
    <footer className="return-review-footer">
      <button type="button" className="return-review-cancel" onClick={onClose} disabled={saving}>Cancel</button>
      <button type="submit" className="return-review-save" disabled={saving}>{saving ? "Saving…" : "Save review"}</button>
    </footer>
  );
}
