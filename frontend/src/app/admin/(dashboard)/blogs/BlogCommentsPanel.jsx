"use client";

import {
  BlogAdminComment,
  BlogCommentFilters,
  BlogCommentsHeading,
  BlogCommentsMessage,
  useBlogCommentModeration,
} from "@/components/admin/blogs";

/**
 * Comment manager for one blog post: filters and the moderated comment list.
 */
export default function BlogCommentsPanel({ blog, token, onBack, onChanged }) {
  const {
    items,
    visibleItems,
    loading,
    error,
    filter,
    setFilter,
    busyId,
    pendingCount,
    approvedCount,
    changeStatus,
    deleteComment,
  } = useBlogCommentModeration({ blog, token, onChanged });

  return (
    <section className="blog-comments-panel">
      <BlogCommentsHeading title={blog.title} onBack={onBack} />
      {error && <p className="blog-comments-error" role="alert">{error}</p>}
      <BlogCommentFilters
        filter={filter}
        onFilterChange={setFilter}
        total={items.length}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
      />
      {loading ? <BlogCommentsMessage>Loading comments…</BlogCommentsMessage> : visibleItems.length ? (
        <div className="blog-comments-list">
          {visibleItems.map((comment) => (
            <BlogAdminComment
              key={comment._id}
              comment={comment}
              busy={busyId === comment._id}
              onChangeStatus={changeStatus}
              onDelete={deleteComment}
            />
          ))}
        </div>
      ) : <BlogCommentsMessage>{items.length ? `No ${filter} comments.` : "No comments submitted for this article yet."}</BlogCommentsMessage>}
    </section>
  );
}
