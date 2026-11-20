/**
 * Titled card holding a definition list of invoice details.
 * @param {object} props
 * @param {string} props.title Card title.
 * @param {import("react").ReactNode} props.children `<dt>`/`<dd>` pairs.
 */
export function InvoiceInfoCard({ title, children }) {
  return (
    <div className="invoice-info-card">
      <h2>{title}</h2>
      <dl>
        {children}
      </dl>
    </div>
  );
}
