"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, Trash2, X, CircleX } from "lucide-react";
import { adminRequest } from "@/lib/admin-api";

export default function BlogCommentsPanel({ blog, token, onBack, onChanged }) {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminRequest(`/blogs/${encodeURIComponent(blog._id)}/comments`, { token })
      .then((result) => { if (active) setItems(result.items || []); })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load comments."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [blog._id, token]);

  const changeStatus = async (comment, status) => {
    setBusyId(comment._id);
    setError("");
    try {
      const result = await adminRequest(`/blogs/${encodeURIComponent(blog._id)}/comments/${encodeURIComponent(comment._id)}`, {
        token,
        method: "PATCH",
        body: { status },
      });
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
      await adminRequest(`/blogs/${encodeURIComponent(blog._id)}/comments/${encodeURIComponent(comment._id)}`, {
        token,
        method: "DELETE",
      });
      setItems((current) => current.filter((item) => item._id !== comment._id));
      onChanged?.();
    } catch (requestError) {
      setError(requestError.message || "Could not delete comment.");
    } finally {
      setBusyId("");
    }
  };

  const pendingCount = items.filter((item) => item.status === "pending").length;
  const approvedCount = items.filter((item) => item.status === "approved").length;
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
        <button type="button" className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending <span>{pendingCount}</span></button>
        <button type="button" className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>Approved <span>{approvedCount}</span></button>
      </div>
      {loading ? <p className="blog-comments-empty">Loading comments…</p> : visibleItems.length ? (
        <div className="blog-comments-list">
          {visibleItems.map((comment) => (
            <article className="blog-admin-comment" key={comment._id}>
              <div className="blog-admin-comment-top">
                <div><strong>{comment.authorName}</strong><small>{comment.authorEmail || "No email provided"}</small></div>
                <span className={`blog-comment-status ${comment.status}`}>{comment.status === "pending" ? "Pending approval" : comment.status}</span>
              </div>
              <p>{comment.content}</p>
              <div className="blog-admin-comment-footer">
                <span><Clock3 size={13} /> {new Date(comment.createdAt).toLocaleDateString()}</span>
                <div>
                  {comment.status !== "approved" ? <button type="button" className="blog-comment-approve" disabled={busyId === comment._id} onClick={() => changeStatus(comment, "approved")}><Check size={14} /> Approve</button> : <button type="button" className="blog-comment-unapprove" disabled={busyId === comment._id} onClick={() => changeStatus(comment, "pending")}><CircleX size={14} /> Unapprove</button>}
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
