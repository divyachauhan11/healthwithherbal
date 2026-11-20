/**
 * Side-column card of the order page with an icon + title header.
 * @param {object} props
 * @param {Function} props.icon Lucide icon component for the header.
 * @param {string} props.title Card title.
 * @param {import("react").ReactNode} props.children Card body content.
 */
export function OrderInfoCard({ icon: Icon, title, children }) {
  return (
    <div className="order-info-card">
      <div className="info-card-header">
        <Icon size={17} color="var(--forest)" />
        <h3>{title}</h3>
      </div>
      <div className="info-card-body">
        {children}
      </div>
    </div>
  );
}
