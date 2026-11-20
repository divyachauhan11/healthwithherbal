import { ArrowLeft, X } from "lucide-react";

/**
 * Heading of the comment manager with back and close buttons.
 * @param {{title: string, onBack: () => void}} props `title` is the blog post title.
 */
export function BlogCommentsHeading({ title, onBack }) {
  return (
    <div className="blog-comments-panel-heading">
      <div>
        <button type="button" className="blog-comments-back" onClick={onBack}><ArrowLeft size={16} /> All blog posts</button>
        <h2>Comments for: {title}</h2>
        <p>Approve or reject visitor comments before they appear on the public website.</p>
      </div>
      <button type="button" className="blog-comments-modal-close" aria-label="Close comment management" onClick={onBack}><X size={20} /></button>
    </div>
  );
}
