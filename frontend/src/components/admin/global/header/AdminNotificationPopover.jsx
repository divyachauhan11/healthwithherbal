import { X } from "lucide-react";
import { AdminNotificationItem } from "./AdminNotificationItem";

/**
 * Notifications popover: header with Refresh/Close, the list (or a loading /
 * empty message) and a footer note.
 * @param {object} props
 * @param {Array<object>} props.notifications
 * @param {boolean} props.loading
 * @param {() => void} [props.onRefresh]
 * @param {() => void} props.onClose
 * @param {(notification: object) => void} [props.onSelect]
 */
export function AdminNotificationPopover({ notifications, loading, onRefresh, onClose, onSelect }) {
  return (
    <section className="admin-notification-popover" role="dialog" aria-label="Recent notifications">
      <header>
        <div><strong>Notifications</strong><small>Recent store activity</small></div>
        <div>
          <button type="button" onClick={onRefresh} aria-label="Refresh notifications" disabled={loading}>{loading ? "…" : "Refresh"}</button>
          <button type="button" className="admin-notification-close" onClick={onClose} aria-label="Close notifications"><X size={16} /></button>
        </div>
      </header>
      <div className="admin-notification-list">
        {loading && notifications.length === 0 ? (
          <p className="admin-notification-empty">Loading recent activity…</p>
        ) : notifications.length === 0 ? (
          <p className="admin-notification-empty">No recent notifications.</p>
        ) : notifications.map((notification) => (
          <AdminNotificationItem key={notification.id} notification={notification} onSelect={onSelect} />
        ))}
      </div>
      <footer>Latest order, payment, return, review, comment, and stock activity</footer>
    </section>
  );
}
