/**
 * Titled card in the order details view.
 * @param {{title: string, children: React.ReactNode}} props
 */
export function OrderDetailCard({ title, children }) {
  return (
    <section className="order-detail-card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
