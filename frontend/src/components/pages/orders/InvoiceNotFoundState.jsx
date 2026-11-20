/**
 * Message shown when the invoice's order cannot be loaded, with a way back.
 * @param {object} props
 * @param {string} props.message Error to show.
 * @param {() => void} props.onBack Returns to the account's orders.
 */
export function InvoiceNotFoundState({ message, onBack }) {
  return <div className="invoice-state"><p>{message}</p><button type="button" className="app-button" onClick={onBack}>Back to My Orders</button></div>;
}
