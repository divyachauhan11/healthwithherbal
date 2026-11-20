import { AdminFormActions } from "./AdminFormActions";
import { AdminFormHeading } from "./AdminFormHeading";
import { useAdminFormFields } from "./useAdminFormFields";

/**
 * Inline blog post form (title, excerpt, article, cover URL, tags, status).
 * @param {object} props
 * @param {(body: object) => void} props.onSave Receives the values with tags split into a list.
 * @param {() => void} props.onClose
 * @param {boolean} [props.busy]
 */
export function BlogForm({ onSave, onClose, busy }) {
  const { form, update } = useAdminFormFields(() => ({ title: "", excerpt: "", content: "", coverImage: "", tags: "", status: "draft" }));
  return (
    <form className="admin-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }); }}>
      <AdminFormHeading title="Write a blog post" description="Posts are saved with draft or published status." onClose={onClose} />
      <div className="form-section">
        <div className="form-grid">
          <label className="wide">Title<input required minLength="4" value={form.title} onChange={update("title")} /></label>
          <label className="wide">Excerpt<textarea rows={2} value={form.excerpt} onChange={update("excerpt")} /></label>
          <label className="wide">Article<textarea rows={10} required minLength="20" value={form.content} onChange={update("content")} /></label>
          <label>Cover image URL<input type="url" value={form.coverImage} onChange={update("coverImage")} /></label>
          <label>Tags (comma separated)<input value={form.tags} onChange={update("tags")} /></label>
          <label>Status<select value={form.status} onChange={update("status")}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        </div>
      </div>
      <AdminFormActions busy={busy} submitLabel="Save post" onClose={onClose} />
    </form>
  );
}
