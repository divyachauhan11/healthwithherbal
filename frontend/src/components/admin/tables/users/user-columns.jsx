import { dateLabel } from "../../global/admin-utils";
import { RecordStatusBadge } from "../shared";
import { UserRowActions } from "./UserRowActions";

/**
 * DataTable column definitions for the staff users table.
 * @param {{onEdit?: Function, onDelete?: Function, currentUserId?: string, currentUserEmail?: string}} options
 * @returns {Array<Object>}
 */
export function getUserColumns({ onEdit, onDelete, currentUserId, currentUserEmail }) {
  return [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (person) => <b>{person.name}</b>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (person) => person.email || "—",
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (person) => person.role || "—",
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (person) => <RecordStatusBadge status={person.isActive ? "Active" : "Disabled"} />,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (person) => dateLabel(person.createdAt),
    },
    {
      key: "actions",
      label: "Action",
      render: (person) => (
        <UserRowActions
          person={person}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
        />
      ),
    },
  ];
}
