import { createPortal } from "react-dom";
import { EyeOff, Pencil, Trash2 } from "lucide-react";
import { RowActionItem } from "./RowActionItem";
import { RowActionsDropdown } from "./RowActionsDropdown";
import { RowActionsTrigger } from "./RowActionsTrigger";
import { useRowActionsMenu } from "./useRowActionsMenu";

/**
 * Three-dots menu for a table row with optional edit, hide/unhide, extra and
 * delete actions. The dropdown is portalled into the admin shell (or body).
 * @param {Object} props
 * @param {() => void} [props.onEdit] Edit handler; shows the edit entry.
 * @param {() => void} [props.onHide] Hide handler; shows the hide entry.
 * @param {string} [props.hideLabel="Hide"]
 * @param {React.ComponentType} [props.hideIcon] Icon for the hide entry (EyeOff by default).
 * @param {string} [props.hideVariant="warning"] Extra class for the hide entry.
 * @param {() => void} [props.onDelete] Delete handler; shows the delete entry.
 * @param {string} [props.editLabel="Edit"]
 * @param {React.ComponentType} [props.editIcon=Pencil]
 * @param {string} [props.deleteLabel="Delete"]
 * @param {Array<{label: string, icon?: React.ComponentType, danger?: boolean, onClick?: () => void}>} [props.extraActions=[]]
 * @param {"left"|"right"} [props.align="right"] Dropdown edge aligned with the trigger.
 */
export function RowActionsMenu({
  onEdit,
  onHide,
  hideLabel = "Hide",
  hideIcon: HideIcon,
  hideVariant = "warning",
  onDelete,
  editLabel = "Edit",
  editIcon: EditIcon = Pencil,
  deleteLabel = "Delete",
  extraActions = [],
  align = "right",
}) {
  const menu = useRowActionsMenu({
    actionCount: [onEdit, onHide, ...extraActions, onDelete].filter(Boolean).length,
    align,
  });

  return (
    <div
      className={`row-actions-container ${menu.isOpen ? "active" : ""}`}
      ref={menu.menuRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <RowActionsTrigger isOpen={menu.isOpen} onToggle={menu.toggle} />

      {menu.isOpen && menu.dropdownPosition && typeof document !== "undefined" && createPortal(
        <RowActionsDropdown
          dropdownRef={menu.dropdownRef}
          openUpwards={menu.openUpwards}
          position={menu.dropdownPosition}
        >
          {onEdit && (
            <RowActionItem
              className="row-action-item"
              icon={<EditIcon size={13} />}
              label={editLabel}
              onClose={menu.close}
              onSelect={onEdit}
            />
          )}

          {onHide && (
            <RowActionItem
              className={`row-action-item ${hideVariant || ""}`}
              icon={HideIcon ? <HideIcon size={13} /> : <EyeOff size={13} />}
              label={hideLabel}
              onClose={menu.close}
              onSelect={onHide}
            />
          )}

          {extraActions.map((action, idx) => (
            <RowActionItem
              key={idx}
              className={`row-action-item ${action.danger ? "danger" : ""}`}
              icon={action.icon && <action.icon size={13} />}
              label={action.label}
              onClose={menu.close}
              onSelect={action.onClick}
            />
          ))}

          {onDelete && (
            <RowActionItem
              className="row-action-item danger"
              icon={<Trash2 size={13} />}
              label={deleteLabel}
              onClose={menu.close}
              onSelect={onDelete}
            />
          )}
        </RowActionsDropdown>,
        menu.menuRef.current?.closest(".admin-shell") || document.body,
      )}
    </div>
  );
}
