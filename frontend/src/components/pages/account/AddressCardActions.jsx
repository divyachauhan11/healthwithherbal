import { Pencil, Trash2 } from "lucide-react";

/**
 * Edit / delete buttons of a saved address card.
 * @param {object} props
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDelete
 */
export function AddressCardActions({ onEdit, onDelete }) {
  return (
    <div className="address-card-actions">
      <button type="button" className="address-edit-btn" onClick={onEdit} title="Edit address">
        <Pencil size={14} /> Edit
      </button>
      <button type="button" className="address-delete-btn" onClick={onDelete} title="Delete address">
        <Trash2 size={15} /> Delete
      </button>
    </div>
  );
}
