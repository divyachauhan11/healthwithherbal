/**
 * Heading of the account return/exchange dialog with its close button.
 * @param {object} props
 * @param {string} props.orderNumber Order the request is for.
 * @param {() => void} props.onClose Closes the dialog.
 */
export function ReturnRequestHeading({ orderNumber, onClose }) {
  return (
    <div className="return-request-heading">
      <div>
        <span>ORDER {orderNumber}</span>
        <h2>Return or exchange</h2>
      </div>
      <button type="button" onClick={onClose} aria-label="Close request form">×</button>
    </div>
  );
}
