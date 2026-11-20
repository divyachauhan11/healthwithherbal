/** Explains why the invoice shows no GST breakdown. */
export function InvoiceTaxNote() {
  return (
    <div className="invoice-tax-note">
      <strong>Tax information</strong>
      <p>Product HSN codes, GST rates, and seller GST registration details are not stored with this order. This invoice therefore shows the recorded order amounts and does not calculate or represent a GST tax breakdown.</p>
    </div>
  );
}
