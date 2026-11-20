import { RowActionsMenu } from "../row-actions";

/**
 * Row menu for a coupon: edit (when supported) and delete.
 * @param {{coupon: Object, onEdit?: Function, onDelete: Function}} props
 */
export function CouponRowActions({ coupon, onEdit, onDelete }) {
  return (
    <RowActionsMenu
      onEdit={onEdit ? () => onEdit(coupon) : undefined}
      onDelete={() => onDelete(coupon)}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );
}
