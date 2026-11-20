import { dateLabel } from "../../global/admin-utils";
import { BlogAdminCardTags } from "./BlogAdminCardTags";

/**
 * Blog card date, title, excerpt and tags.
 * @param {{blog: Object}} props
 */
export function BlogAdminCardBody({ blog }) {
  return (
    <div className="blog-admin-card-body">
      <div className="blog-admin-card-date">{dateLabel(blog.publishedAt || blog.updatedAt || blog.createdAt)}</div>
      <h2>{blog.title}</h2>
      <p>{blog.excerpt || "No excerpt has been added yet."}</p>
      {!!blog.tags?.length && (
        <BlogAdminCardTags tags={blog.tags} />
      )}
    </div>
  );
}
