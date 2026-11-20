import { CartSubmodal } from "./CartSubmodal";

/**
 * "Order note" panel for special instructions.
 * @param {object} props
 * @param {string} props.note Current note.
 * @param {(note: string) => void} props.onNoteChange Updates the note.
 * @param {boolean} props.saved Shows the saved confirmation.
 * @param {() => void} props.onSave Saves the note (the panel then closes).
 * @param {() => void} props.onClose Closes the panel.
 */
export function CartNotePanel({ note, onNoteChange, saved, onSave, onClose }) {
  return (
    <CartSubmodal title="Order note" onClose={onClose}>
      <label className="cart-submodal-label">
        Order special instructions
      </label>
      <textarea
        className="cart-submodal-textarea"
        placeholder="Order special instructions"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        rows={4}
      />

      <button
        type="button"
        className="cart-submodal-btn"
        onClick={onSave}
      >
        {saved ? "Saved! ✓" : "Save"}
      </button>
    </CartSubmodal>
  );
}
