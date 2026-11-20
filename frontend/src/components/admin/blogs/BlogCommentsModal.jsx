/**
 * Dialog frame for a post's comment manager; closes on a backdrop press.
 * @param {{blog: object, onClose: () => void, children: import("react").ReactNode}} props
 */
export function BlogCommentsModal({ blog, onClose, children }) {
  return (
    <div
      className="blog-comments-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="blog-comments-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Comments for ${blog.title}`}
      >
        {children}
      </section>
    </div>
  );
}
