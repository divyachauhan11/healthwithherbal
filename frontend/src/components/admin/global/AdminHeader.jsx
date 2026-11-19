import { useEffect, useRef } from "react";
import { ArrowRight, Bell, LogOut, Menu, Search, X } from "lucide-react";

const notificationDate = (value) => value
  ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  : "";

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
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const handleOutside = (event) => {
      if (!notificationRef.current?.contains(event.target)) onToggleNotifications?.(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") onToggleNotifications?.(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [notificationsOpen, onToggleNotifications]);

  return (
    <header>
      <button
        className="menu-button"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>
      <label className="search">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search orders, products, customers…"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="header-actions">
        <div className="admin-notification-wrap" ref={notificationRef}>
          <button
            type="button"
            className="icon-button notification"
            aria-label={`${notifications.length} notifications`}
            aria-expanded={notificationsOpen}
            onClick={() => {
              const opening = !notificationsOpen;
              onToggleNotifications?.(opening);
              if (opening) onRefreshNotifications?.();
            }}
          >
            <Bell size={18} />
            {notifications.length > 0 && <i />}
            {notifications.length > 0 && <span className="admin-notification-count">{notifications.length > 99 ? "99+" : notifications.length}</span>}
          </button>
          {notificationsOpen && (
            <section className="admin-notification-popover" role="dialog" aria-label="Recent notifications">
              <header>
                <div><strong>Notifications</strong><small>Recent store activity</small></div>
                <div>
                  <button type="button" onClick={onRefreshNotifications} aria-label="Refresh notifications" disabled={notificationsLoading}>{notificationsLoading ? "…" : "Refresh"}</button>
                  <button type="button" className="admin-notification-close" onClick={() => onToggleNotifications?.(false)} aria-label="Close notifications"><X size={16} /></button>
                </div>
              </header>
              <div className="admin-notification-list">
                {notificationsLoading && notifications.length === 0 ? (
                  <p className="admin-notification-empty">Loading recent activity…</p>
                ) : notifications.length === 0 ? (
                  <p className="admin-notification-empty">No recent notifications.</p>
                ) : notifications.map((notification) => (
                  <button type="button" key={notification.id} className={`admin-notification-item ${notification.type || ""}`} onClick={() => onSelectNotification?.(notification)}>
                    <span className="admin-notification-dot" />
                    <span className="admin-notification-copy"><strong>{notification.title}</strong><small>{notification.message}</small><time>{notificationDate(notification.createdAt)}</time></span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
              <footer>Latest order, payment, return, review, comment, and stock activity</footer>
            </section>
          )}
        </div>
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
      </div>
    </header>
  );
}
