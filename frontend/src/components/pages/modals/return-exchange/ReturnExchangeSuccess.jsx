import { CheckCircle2 } from "lucide-react";

/**
 * Confirmation shown once the return/exchange request email was sent.
 * @param {object} props
 * @param {string} props.customerEmail Address copied on the email ("" when none).
 * @param {() => void} [props.onDone] Closes the dialog.
 */
export function ReturnExchangeSuccess({ customerEmail, onDone }) {
  return (
    <div className="return-exchange-send-success" role="status">
      <CheckCircle2 size={34} />
      <h3>Request sent to our care team</h3>
      <p>We emailed healthwithherbalindia@gmail.com{customerEmail ? ` and copied ${customerEmail}` : ""}.</p>
      <button type="button" className="app-button" onClick={onDone}>Done</button>
    </div>
  );
}
