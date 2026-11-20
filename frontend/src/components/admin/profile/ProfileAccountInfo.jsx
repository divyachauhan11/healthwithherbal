import { CalendarDays, Check } from "lucide-react";
import { ProfileInfoRow } from "./ProfileInfoRow";
import { formatMemberSince } from "./profile-utils";

/**
 * Account information card: role, status, member-since date, page access and session note.
 * @param {{profile: object, roleLabel: string}} props
 */
export function ProfileAccountInfo({ profile, roleLabel }) {
  return (
    <aside className="admin-profile-info-card">
      <h3>Account information</h3>
      <ProfileInfoRow label="Account type">{roleLabel}</ProfileInfoRow>
      <ProfileInfoRow label="Account status" valueClassName="admin-profile-active"><i /> Active</ProfileInfoRow>
      <ProfileInfoRow label="Member since"><CalendarDays size={14} /> {formatMemberSince(profile.createdAt)}</ProfileInfoRow>
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
