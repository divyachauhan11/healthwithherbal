/**
 * One labelled value in the order details overview.
 * @param {{label: string, valueClassName?: string, children: React.ReactNode}} props
 */
export function OrderSummaryTile({ label, valueClassName, children }) {
  return <article><span>{label}</span><strong className={valueClassName}>{children}</strong></article>;
}
