import { BlogAdminCardActions } from "./BlogAdminCardActions";
import { BlogAdminCardBody } from "./BlogAdminCardBody";
import { BlogAdminCardCover } from "./BlogAdminCardCover";
import { BlogAdminCardMetrics } from "./BlogAdminCardMetrics";

/**
 * One blog post card in the admin blog manager.
 * @param {{blog: Object, onEdit?: Function, onDelete?: Function, onManageComments?: Function}} props
 */
export function BlogAdminCard({ blog, onEdit, onDelete, onManageComments }) {
  return (
    <article className="blog-admin-card">
      <BlogAdminCardCover blog={blog} />
      <BlogAdminCardBody blog={blog} />
      <div className="blog-admin-card-footer">
        <BlogAdminCardMetrics blog={blog} onManageComments={onManageComments} />
        <BlogAdminCardActions blog={blog} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}
