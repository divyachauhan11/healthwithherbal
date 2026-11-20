/**
 * Heading of a customer details section with an icon, a title and an item count.
 * @param {{icon: import("react").ElementType, title: string, count: number, countLabel: string}} props
 */
export function CustomerSectionHeading({ icon: Icon, title, count, countLabel }) {
  return (
    <div className="customer-details-section-heading">
      <div><Icon size={17} /><h3>{title}</h3></div>
      <span>{count} {countLabel}</span>
    </div>
  );
}
