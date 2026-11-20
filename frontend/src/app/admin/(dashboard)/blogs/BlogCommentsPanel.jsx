"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, Check, Clock3, Trash2, X, CircleX } from "lucide-react";
import {
  deleteAdminBlogComment,
  fetchAdminBlogComments,
  updateAdminBlogCommentStatus,
} from "@/lib/admin-api";
import { BLOG_COMMENT_STATUSES } from "@/constants/statuses";
import { STATUS_BADGE_MAPS } from "@/constants/status-badges";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAsyncResource } from "@/hooks";

export default function BlogCommentsPanel({ blog, token, onBack, onChanged }) {
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("all");
  const loadComments = useCallback(
    () => fetchAdminBlogComments(blog._id, token)
      .then((result) => result.items || []),
    [blog._id, token],
  );
  const {
    data: items,
    setData: setItems,
    loading,
    error,
    setError,
  } = useAsyncResource({
    load: loadComments,
    deps: [blog._id, token],
    enabled: true,
    initialData: [],
    errorMessage: (requestError) => requestError.message || "Could not load comments.",
  });

  const changeStatus = async (comment, status) => {
    setBusyId(comment._id);
    setError("");
    try {
      const result = await updateAdminBlogCommentStatus(blog._id, comment._id, status, token);
      setItems((current) => current.map((item) => item._id === comment._id ? result.item : item));
      onChanged?.();
    } catch (requestError) {
      setError(requestError.message || "Could not update comment status.");
    } finally {
      setBusyId("");
    }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    setBusyId(comment._id);
    setError("");
    try {
      await deleteAdminBlogComment(blog._id, comment._id, token);
      setItems((current) => current.filter((item) => item._id !== comment._id));
      onChanged?.();
    } catch (requestError) {
      setError(requestError.message || "Could not delete comment.");
    } finally {
      setBusyId("");
    }
  };

  const pendingCount = items.filter((item) => item.status === BLOG_COMMENT_STATUSES[0]).length;
  const approvedCount = items.filter((item) => item.status === BLOG_COMMENT_STATUSES[1]).length;
  const visibleItems = filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <section className="blog-comments-panel">
      <div className="blog-comments-panel-heading">
        <div>
          <button type="button" className="blog-comments-back" onClick={onBack}><ArrowLeft size={16} /> All blog posts</button>
          <h2>Comments for: {blog.title}</h2>
          <p>Approve or reject visitor comments before they appear on the public website.</p>
        </div>
        <button type="button" className="blog-comments-modal-close" aria-label="Close comment management" onClick={onBack}><X size={20} /></button>
      </div>
      {error && <p className="blog-comments-error" role="alert">{error}</p>}
      <div className="blog-comment-filters" role="group" aria-label="Filter comments">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All <span>{items.length}</span></button>
        <button type="button" className={filter === BLOG_COMMENT_STATUSES[0] ? "active" : ""} onClick={() => setFilter(BLOG_COMMENT_STATUSES[0])}>Pending <span>{pendingCount}</span></button>
        <button type="button" className={filter === BLOG_COMMENT_STATUSES[1] ? "active" : ""} onClick={() => setFilter(BLOG_COMMENT_STATUSES[1])}>Approved <span>{approvedCount}</span></button>
      </div>
      {loading ? <p className="blog-comments-empty">Loading comments…</p> : visibleItems.length ? (
        <div className="blog-comments-list">
          {visibleItems.map((comment) => (
            <article className="blog-admin-comment" key={comment._id}>
              <div className="blog-admin-comment-top">
                <div><strong>{comment.authorName}</strong><small>{comment.authorEmail || "No email provided"}</small></div>
                <StatusBadge
                  status={comment.status}
                  statusMap={STATUS_BADGE_MAPS.comment}
                  className="blog-comment-status"
                />
              </div>
              <p>{comment.content}</p>
              <div className="blog-admin-comment-footer">
                <span><Clock3 size={13} /> {new Date(comment.createdAt).toLocaleDateString()}</span>
                <div>
                  {comment.status !== BLOG_COMMENT_STATUSES[1] ? <button type="button" className="blog-comment-approve" disabled={busyId === comment._id} onClick={() => changeStatus(comment, BLOG_COMMENT_STATUSES[1])}><Check size={14} /> Approve</button> : <button type="button" className="blog-comment-unapprove" disabled={busyId === comment._id} onClick={() => changeStatus(comment, BLOG_COMMENT_STATUSES[0])}><CircleX size={14} /> Unapprove</button>}
                  <button type="button" className="blog-comment-delete" disabled={busyId === comment._id} onClick={() => deleteComment(comment)}><Trash2 size={14} /> Delete</button>
                  {busyId === comment._id && <small>Saving…</small>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="blog-comments-empty">{items.length ? `No ${filter} comments.` : "No comments submitted for this article yet."}</p>}
    </section>
  );
}
