import { CalendarDays, Check } from "lucide-react";

const dateText = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export function ProfileAccountInfo({ profile, roleLabel }) {
  return (
    <aside className="admin-profile-info-card">
      <h3>Account information</h3>
      <div className="admin-profile-info-row">
        <span>Account type</span>
        <b>{roleLabel}</b>
      </div>
      <div className="admin-profile-info-row">
        <span>Account status</span>
        <b className="admin-profile-active"><i /> Active</b>
      </div>
      <div className="admin-profile-info-row">
        <span>Member since</span>
        <b><CalendarDays size={14} /> {dateText(profile.createdAt)}</b>
      </div>
      <div className="admin-profile-access">
        <span>Page access</span>
        <p>
          {profile.role === "admin"
            ? "Full admin portal access"
            : (profile.pageAccess || []).join(", ") || "No pages assigned"}
        </p>
      </div>
      <div className="admin-profile-session">
        <Check size={15} /> Signed in with a secure admin session
      </div>
    </aside>
  );
}
