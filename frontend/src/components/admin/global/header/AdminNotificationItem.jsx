import { ArrowRight } from "lucide-react";
import { dateTimeLabelShort } from "../admin-utils";

/**
 * One entry of the notifications popover.
 * @param {object} props
 * @param {{id: string, type?: string, title: string, message: string, createdAt?: string}} props.notification
 * @param {(notification: object) => void} [props.onSelect] Opens the related page.
 */
export function AdminNotificationItem({ notification, onSelect }) {
  return (
    <button type="button" className={`admin-notification-item ${notification.type || ""}`} onClick={() => onSelect?.(notification)}>
      <span className="admin-notification-dot" />
      <span className="admin-notification-copy"><strong>{notification.title}</strong><small>{notification.message}</small><time>{dateTimeLabelShort(notification.createdAt)}</time></span>
      <ArrowRight size={14} />
    </button>
  );
}
