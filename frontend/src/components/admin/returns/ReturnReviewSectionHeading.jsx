/**
 * Eyebrow + title heading of a return review section, with optional trailing content.
 * @param {{eyebrow: import("react").ReactNode, title: import("react").ReactNode, children?: import("react").ReactNode}} props
 */
export function ReturnReviewSectionHeading({ eyebrow, title, children }) {
  return <div className="return-review-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div>{children}</div>;
}
