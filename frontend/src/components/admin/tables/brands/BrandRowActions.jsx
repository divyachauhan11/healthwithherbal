import { RowActionsMenu } from "../row-actions";

/**
 * Row menu for a brand: edit and delete.
 * @param {{brand: Object, onEdit: Function, onDelete: Function}} props
 */
export function BrandRowActions({ brand, onEdit, onDelete }) {
  return (
    <RowActionsMenu
      onEdit={() => onEdit(brand)}
      onDelete={() => onDelete(brand)}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );
}
