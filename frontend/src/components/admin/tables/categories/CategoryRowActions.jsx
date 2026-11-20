import { Eye } from "lucide-react";
import { RowActionsMenu } from "../row-actions";

/**
 * Row menu for a category: edit, delete and (in the parent view) view details.
 * @param {{item: Object, isParentCategoryView: boolean, onEdit: Function, onDelete: Function, onViewParent: Function}} props
 */
export function CategoryRowActions({ item, isParentCategoryView, onEdit, onDelete, onViewParent }) {
  return (
    <RowActionsMenu
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
      extraActions={isParentCategoryView
        ? [{ label: "View", icon: Eye, onClick: () => onViewParent(item) }]
        : []}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );
}
