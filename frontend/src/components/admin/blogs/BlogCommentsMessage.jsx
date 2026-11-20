/**
 * Placeholder text of the comment list (loading or empty).
 * @param {{children: import("react").ReactNode}} props
 */
export function BlogCommentsMessage({ children }) {
  return <p className="blog-comments-empty">{children}</p>;
}
