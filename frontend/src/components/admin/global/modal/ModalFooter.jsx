import { Loader2 } from "lucide-react";

/**
 * Admin modal footer: a custom `footer`, or Cancel plus an optional submit
 * button that shows a spinner while busy.
 * @param {object} props
 * @param {import("react").ReactNode} [props.footer] Replaces the default buttons.
 * @param {boolean} props.busy
 * @param {() => void} [props.onClose]
 * @param {string} props.cancelLabel
 * @param {boolean} props.showSubmit Whether the modal is a form with a submit button.
 * @param {import("react").ReactNode} props.submitLabel
 */
export function ModalFooter({
  footer,
  busy,
  onClose,
  cancelLabel,
  showSubmit,
  submitLabel,
}) {
  return (
    <div className="admin-modal-footer">
      {footer ? (
        footer
      ) : (
        <>
          <button
            type="button"
            className="outline"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          {showSubmit && (
            <button type="submit" className="primary" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={15} className="spin-animate" />
                  Saving…
                </>
              ) : (
                submitLabel
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
