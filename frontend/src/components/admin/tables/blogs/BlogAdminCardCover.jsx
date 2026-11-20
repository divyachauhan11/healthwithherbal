import { Star } from "lucide-react";

/**
 * Blog card cover image (or placeholder) with category and status labels.
 * @param {{blog: Object}} props
 */
export function BlogAdminCardCover({ blog }) {
  return (
    <div className="blog-admin-card-cover">
      {blog.coverImage || blog.image ? (
        <img src={blog.coverImage || blog.image} alt={blog.title || "Blog cover"} />
      ) : (
        <div className="blog-admin-card-placeholder"><Star size={34} /></div>
      )}
      <span className="blog-admin-card-category">{blog.category || blog.tags?.[0] || "Wellness"}</span>
      <span className={`blog-admin-card-status ${blog.status === "published" ? "published" : "draft"}`}>{blog.status || "draft"}</span>
    </div>
  );
}
