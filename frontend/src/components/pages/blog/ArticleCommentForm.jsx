import { Send } from "lucide-react";

/**
 * Controlled comment form (name, optional email, comment) with its status notice.
 * @param {object} props
 * @param {{authorName: string, authorEmail: string, content: string}} props.form
 * @param {(field: "authorName"|"authorEmail"|"content", value: string) => void} props.onFieldChange
 * @param {(event: import("react").FormEvent<HTMLFormElement>) => void} props.onSubmit
 * @param {string} props.notice Status or error message, or "".
 * @param {boolean} props.noticeIsError
 * @param {boolean} props.busy Disables submitting while a request runs.
 */
export function ArticleCommentForm({ form, onFieldChange, onSubmit, notice, noticeIsError, busy }) {
  return (
    <form className="article-comment-form" onSubmit={onSubmit}>
      <div className="article-comment-fields">
        <label>Name<input required minLength={2} maxLength={100} value={form.authorName} onChange={(event) => onFieldChange("authorName", event.target.value)} /></label>
        <label>Email (optional)<input type="email" maxLength={254} value={form.authorEmail} onChange={(event) => onFieldChange("authorEmail", event.target.value)} /></label>
      </div>
      <label className="article-comment-message">Your comment<textarea required minLength={3} maxLength={2000} rows={4} value={form.content} onChange={(event) => onFieldChange("content", event.target.value)} /></label>
      {notice && <p className={`article-comment-notice ${noticeIsError ? "error" : ""}`} role="status">{notice}</p>}
      <button className="article-comment-submit" type="submit" disabled={busy}><Send size={15} /> Submit comment</button>
    </form>
  );
}
