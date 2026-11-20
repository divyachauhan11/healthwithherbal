/**
 * Up to three blog tags plus "+N more".
 * @param {{tags: Array<string>}} props
 */
export function BlogAdminCardTags({ tags }) {
  return (
    <div className="blog-admin-card-tags">
      {tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
      {tags.length > 3 && <small>+{tags.length - 3} more</small>}
    </div>
  );
}
