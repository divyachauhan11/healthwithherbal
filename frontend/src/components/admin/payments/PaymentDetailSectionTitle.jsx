/**
 * Numbered title of a payment details section.
 * @param {{index: string, title: string, description: string}} props
 */
export function PaymentDetailSectionTitle({ index, title, description }) {
  return <div className="payment-detail-section-title"><span className="payment-detail-section-icon">{index}</span><div><h3>{title}</h3><p>{description}</p></div></div>;
}
