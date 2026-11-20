import { LogOut } from "lucide-react";

/**
 * Signed-in staff member in the header: avatar (photo or initials), name,
 * email and the sign-out button.
 * @param {object} props
 * @param {{name?: string, email?: string, avatarUrl?: string}|null} props.user
 * @param {() => void} props.onLogout
 */
export function AdminAccountActions({ user, onLogout }) {
  return (
    <>
      <div className="avatar">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          (user?.name || "Admin").slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="admin">
        <b>{user?.name || "Administrator"}</b>
        <span>{user?.email}</span>
      </div>
      <button className="icon-button" title="Sign out" onClick={onLogout}>
        <LogOut size={16} />
      </button>
    </>
  );
}
