import { RowActionsMenu } from "../row-actions";
import { isCurrentAdminUser } from "./user-utils";

/**
 * Row menu for a staff account: edit and delete (never for the signed-in admin).
 * @param {{person: Object, onEdit?: Function, onDelete?: Function, currentUserId?: string, currentUserEmail?: string}} props
 */
export function UserRowActions({ person, onEdit, onDelete, currentUserId, currentUserEmail }) {
  const isCurrentUser = isCurrentAdminUser(person, currentUserId, currentUserEmail);
  return (
    <RowActionsMenu
      onEdit={onEdit ? () => onEdit(person) : undefined}
      onDelete={onDelete && !isCurrentUser ? () => onDelete(person) : undefined}
    />
  );
}
