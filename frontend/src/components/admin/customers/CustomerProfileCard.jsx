import { CalendarDays, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { formatCustomerAddress, formatCustomerDateTime } from "./customer-utils";

/**
 * Customer contact card: name, email, phone, primary address and join date.
 * @param {{account: object}} props
 */
export function CustomerProfileCard({ account }) {
  return (
    <section className="customer-profile-card">
      <div className="customer-profile-avatar"><UserRound size={23} /></div>
      <div className="customer-profile-main">
        <strong>{account.name || "Customer"}</strong>
        <span><Mail size={14} /> {account.email || "—"}</span>
        <span><Phone size={14} /> {account.phone || "No phone provided"}</span>
        <span><MapPin size={14} /> {formatCustomerAddress(account.address)}</span>
      </div>
      <div className="customer-profile-created"><CalendarDays size={14} /> Joined {account.createdAt ? formatCustomerDateTime(account.createdAt) : "Guest checkout"}</div>
    </section>
  );
}
