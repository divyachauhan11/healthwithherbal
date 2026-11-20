import { Menu } from "lucide-react";
import { AdminAccountActions, AdminNotificationsMenu, AdminSearchBox } from "./header";

/**
 * Admin top bar: mobile menu button, global search, notifications menu and
 * the signed-in staff member with sign-out.
 * @param {object} props
 * @param {string} props.query
 * @param {(query: string) => void} props.setQuery
 * @param {object|null} props.user
 * @param {() => void} props.onOpenMenu Opens the mobile sidebar.
 * @param {() => void} props.onLogout
 * @param {Array<object>} [props.notifications=[]]
 * @param {boolean} [props.notificationsOpen=false]
 * @param {boolean} [props.notificationsLoading=false]
 * @param {(open: boolean) => void} [props.onToggleNotifications]
 * @param {(notification: object) => void} [props.onSelectNotification]
 * @param {() => void} [props.onRefreshNotifications]
 */
export function AdminHeader({
  query,
  setQuery,
  user,
  onOpenMenu,
  onLogout,
  notifications = [],
  notificationsOpen = false,
  notificationsLoading = false,
  onToggleNotifications,
  onSelectNotification,
  onRefreshNotifications,
}) {
  return (
    <header>
      <button
        className="menu-button"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>
      <AdminSearchBox query={query} setQuery={setQuery} />
      <div className="header-actions">
        <AdminNotificationsMenu
          notifications={notifications}
          open={notificationsOpen}
          loading={notificationsLoading}
          onToggle={onToggleNotifications}
          onSelect={onSelectNotification}
          onRefresh={onRefreshNotifications}
        />
        <AdminAccountActions user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
