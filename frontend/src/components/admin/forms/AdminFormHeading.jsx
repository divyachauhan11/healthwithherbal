import { X } from "lucide-react";

/**
 * Heading of an inline admin form with its title, description and Close button.
 * @param {object} props
 * @param {import("react").ReactNode} props.title
 * @param {import("react").ReactNode} props.description
 * @param {() => void} props.onClose
 */
export function AdminFormHeading({ title, description, onClose }) {
  return (
    <div className="admin-form-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button type="button" className="outline" onClick={onClose}>
        <X size={16} /> Close
      </button>
    </div>
  );
}
