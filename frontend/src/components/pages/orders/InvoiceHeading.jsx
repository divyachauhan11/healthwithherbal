/**
 * Invoice letterhead: store brand and the invoice title and number.
 * @param {object} props
 * @param {string} props.invoiceNumber Invoice number to show.
 */
export function InvoiceHeading({ invoiceNumber }) {
  return (
    <header className="invoice-heading">
      <div className="invoice-brand">
        <img src="/health-with-herbal-logo-tight.png" alt="Health With Herbal" />
        <span>Health With Herbal</span>
      </div>
      <div className="invoice-title-block">
        <span>Customer copy</span>
        <h1>INVOICE</h1>
        <strong>{invoiceNumber}</strong>
      </div>
    </header>
  );
}
