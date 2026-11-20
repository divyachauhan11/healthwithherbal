import { BlogAdminCard } from "./BlogAdminCard";

/**
 * Grid of blog post cards.
 * @param {{blogs: Array<Object>, onEdit?: Function, onDelete?: Function, onManageComments?: Function}} props
 */
export function BlogAdminCardGrid({ blogs, onEdit, onDelete, onManageComments }) {
  return (
    <div className="blog-admin-card-grid">
      {blogs.map((blog) => (
        <BlogAdminCard
          key={blog._id || blog.slug}
          blog={blog}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageComments={onManageComments}
        />
      ))}
    </div>
  );
}
