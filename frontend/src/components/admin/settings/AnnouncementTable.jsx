import { Pencil, Save, Trash2, X } from "lucide-react";
import { DataTable } from "@/components/admin/tables";
import { toAnnouncementRows } from "./settings-utils";

/**
 * Announcements table with inline add/edit inputs and per-row save, cancel, edit and delete actions.
 * @param {{
 *   announcements: string[], editing: "new"|number|null, draft: string, saving: boolean,
 *   onDraftChange: (value: string) => void, onSave: Function, onCancel: Function,
 *   onEdit: (row: object) => void, onDelete: (index: number) => void
 * }} props
 */
export function AnnouncementTable({ announcements, editing, draft, saving, onDraftChange, onSave, onCancel, onEdit, onDelete }) {
  return (
    <DataTable
      data={toAnnouncementRows(announcements, editing)}
      rowKey="id"
      pagination={false}
      tableClassName="announcement-table"
      emptyState={announcements.length === 0 && editing !== "new" ? (
        <div className="announcement-empty">
          No announcements yet. Add one to show the announcement bar on your storefront.
        </div>
      ) : null}
      columns={[
        {
          key: "index",
          label: "#",
          render: (row) => row.isNew ? "New" : String(row.index + 1).padStart(2, "0"),
        },
        {
          key: "announcement",
          label: "Announcement",
          render: (row) => row.isNew || editing === row.index ? (
            <input
              autoFocus
              maxLength={180}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder={row.isNew ? "Enter announcement text" : undefined}
              aria-label={row.isNew ? "New announcement text" : `Edit announcement ${row.index + 1}`}
            />
          ) : (
            <span className="announcement-table-message">{row.announcement}</span>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          cellClassName: "announcement-row-actions",
          render: (row) => row.isNew || editing === row.index ? (
            <>
              <button type="button" disabled={saving} onClick={onSave} aria-label={row.isNew ? "Save new announcement" : "Save announcement"}><Save size={16} /></button>
              <button type="button" onClick={onCancel} aria-label="Cancel"><X size={16} /></button>
            </>
          ) : (
            <>
              <button type="button" disabled={saving} onClick={() => onEdit(row)} aria-label={`Edit announcement ${row.index + 1}`}><Pencil size={16} /></button>
              <button type="button" disabled={saving} onClick={() => onDelete(row.index)} aria-label={`Delete announcement ${row.index + 1}`}><Trash2 size={16} /></button>
            </>
          ),
        },
      ]}
    />
  );
}
