"use client";

import { useRef } from "react";
import { Bell } from "lucide-react";
import { AdminNotificationPopover } from "./AdminNotificationPopover";
import { useNotificationsDismiss } from "./useNotificationsDismiss";

/**
 * Header bell with the unread count; opening it refreshes the notifications
 * and shows the popover, which closes on outside click or Escape.
 * @param {object} props
 * @param {Array<object>} props.notifications
 * @param {boolean} props.open
 * @param {boolean} props.loading
 * @param {(open: boolean) => void} [props.onToggle]
 * @param {(notification: object) => void} [props.onSelect]
 * @param {() => void} [props.onRefresh]
 */
export function AdminNotificationsMenu({ notifications, open, loading, onToggle, onSelect, onRefresh }) {
  const notificationRef = useRef(null);

  useNotificationsDismiss({ containerRef: notificationRef, open, onToggle });

  return (
    <div className="admin-notification-wrap" ref={notificationRef}>
      <button
        type="button"
        className="icon-button notification"
        aria-label={`${notifications.length} notifications`}
        aria-expanded={open}
        onClick={() => {
          const opening = !open;
          onToggle?.(opening);
          if (opening) onRefresh?.();
        }}
      >
        <Bell size={18} />
        {notifications.length > 0 && <i />}
        {notifications.length > 0 && <span className="admin-notification-count">{notifications.length > 99 ? "99+" : notifications.length}</span>}
      </button>
      {open && (
        <AdminNotificationPopover
          notifications={notifications}
          loading={loading}
          onRefresh={onRefresh}
          onClose={() => onToggle?.(false)}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
