/**
 * One labelled value in the parent category overview.
 * @param {{label: string, children: React.ReactNode}} props
 */
export function ParentCategoryStat({ label, children }) {
  return <div><span>{label}</span><strong>{children}</strong></div>;
}
