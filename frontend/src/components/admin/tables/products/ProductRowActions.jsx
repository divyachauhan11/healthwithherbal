import { Eye, EyeOff } from "lucide-react";
import { RowActionsMenu } from "../row-actions";
import { isProductPaused } from "./product-utils";

/**
 * Row menu for a product: edit, hide/unhide (when supported) and delete.
 * @param {{product: Object, onEdit: Function, onDelete: Function, onToggleStatus?: Function}} props
 */
export function ProductRowActions({ product, onEdit, onDelete, onToggleStatus }) {
  const isPaused = isProductPaused(product);
  return (
    <RowActionsMenu
      onEdit={() => onEdit(product)}
      onHide={
        onToggleStatus ? () => onToggleStatus(product) : undefined
      }
      hideLabel={isPaused ? "Unhide product" : "Hide product"}
      hideIcon={isPaused ? Eye : EyeOff}
      hideVariant={isPaused ? "success" : "warning"}
      onDelete={() => onDelete(product)}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );
}
