import { Pencil, Trash2 } from "lucide-react";

/**
 * Edit and delete icon buttons of a blog card (each shown when its handler is set).
 * @param {{blog: Object, onEdit?: (blog: Object) => void, onDelete?: (blog: Object) => void}} props
 */
export function BlogAdminCardActions({ blog, onEdit, onDelete }) {
  return (
    <div className="blog-admin-card-actions">
      {onEdit && <button type="button" aria-label="Edit blog post" title="Edit" onClick={() => onEdit(blog)}><Pencil size={15} /></button>}
      {onDelete && <button type="button" className="delete" aria-label="Delete blog post" title="Delete" onClick={() => onDelete(blog)}><Trash2 size={15} /></button>}
    </div>
  );
}
