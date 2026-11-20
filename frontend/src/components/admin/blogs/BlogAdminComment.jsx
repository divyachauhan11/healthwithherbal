import { Check, CircleX, Clock3, Trash2 } from "lucide-react";
import { BLOG_COMMENT_STATUSES } from "@/constants/statuses";
import { STATUS_BADGE_MAPS } from "@/constants/status-badges";
import { StatusBadge } from "@/components/shared/StatusBadge";

/**
 * One visitor comment with its status and approve/unapprove and delete actions.
 * @param {{
 *   comment: object, busy: boolean,
 *   onChangeStatus: (comment: object, status: string) => void, onDelete: (comment: object) => void
 * }} props `busy` disables the actions while this comment is being saved.
 */
export function BlogAdminComment({ comment, busy, onChangeStatus, onDelete }) {
  return (
    <article className="blog-admin-comment">
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
          {comment.status !== BLOG_COMMENT_STATUSES[1] ? <button type="button" className="blog-comment-approve" disabled={busy} onClick={() => onChangeStatus(comment, BLOG_COMMENT_STATUSES[1])}><Check size={14} /> Approve</button> : <button type="button" className="blog-comment-unapprove" disabled={busy} onClick={() => onChangeStatus(comment, BLOG_COMMENT_STATUSES[0])}><CircleX size={14} /> Unapprove</button>}
          <button type="button" className="blog-comment-delete" disabled={busy} onClick={() => onDelete(comment)}><Trash2 size={14} /> Delete</button>
          {busy && <small>Saving…</small>}
        </div>
      </div>
    </article>
  );
}
