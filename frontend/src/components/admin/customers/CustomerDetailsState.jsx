/**
 * Neutral status block of the customer details dialog (loading, no orders).
 * @param {{children: import("react").ReactNode}} props
 */
export function CustomerDetailsState({ children }) {
  return <div className="customer-details-state">{children}</div>;
}
