import { Eye, Heart, MessageCircle } from "lucide-react";

/**
 * Likes and views counts plus the comments button (with pending count).
 * @param {{blog: Object, onManageComments?: (blog: Object) => void}} props
 */
export function BlogAdminCardMetrics({ blog, onManageComments }) {
  return (
    <div className="blog-admin-card-metrics">
      <span title="Likes"><Heart size={14} /> {blog.likesCount || 0}</span>
      <span title="Views"><Eye size={14} /> {blog.viewsCount || 0}</span>
      <button
        type="button"
        className="blog-admin-comment-count"
        title={blog.pendingCommentsCount ? `${blog.pendingCommentsCount} new comments awaiting approval` : "Manage comments"}
        aria-label={`${blog.commentsCount || 0} comments${blog.pendingCommentsCount ? `, ${blog.pendingCommentsCount} new awaiting approval` : ""}`}
        onClick={() => onManageComments?.(blog)}
      >
        <MessageCircle size={14} /> {blog.commentsCount || 0}
        {!!blog.pendingCommentsCount && <small className="blog-admin-pending-count">{blog.pendingCommentsCount} new</small>}
      </button>
    </div>
  );
}
