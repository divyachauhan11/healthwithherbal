import { BLOG_COMMENT_STATUSES } from "@/constants/statuses";

/**
 * All / pending / approved comment filter buttons with counts.
 * @param {{filter: string, onFilterChange: (status: string) => void, total: number, pendingCount: number, approvedCount: number}} props
 */
export function BlogCommentFilters({ filter, onFilterChange, total, pendingCount, approvedCount }) {
  return (
    <div className="blog-comment-filters" role="group" aria-label="Filter comments">
      <button type="button" className={filter === "all" ? "active" : ""} onClick={() => onFilterChange("all")}>All <span>{total}</span></button>
      <button type="button" className={filter === BLOG_COMMENT_STATUSES[0] ? "active" : ""} onClick={() => onFilterChange(BLOG_COMMENT_STATUSES[0])}>Pending <span>{pendingCount}</span></button>
      <button type="button" className={filter === BLOG_COMMENT_STATUSES[1] ? "active" : ""} onClick={() => onFilterChange(BLOG_COMMENT_STATUSES[1])}>Approved <span>{approvedCount}</span></button>
    </div>
  );
}
