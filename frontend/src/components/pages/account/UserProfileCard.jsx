import { ChevronRight } from "lucide-react";

export function UserProfileCard({ name, displayPhone, orderCount }) {
  const initial = (name || "User").trim().charAt(0).toUpperCase();

  return (
    <div className="account-user-card">
      <div className="account-user-card-top">
        <div className="account-user-meta">
          <div className="account-user-greeting">
            <strong>Hey, {name || "User"}</strong>
            <ChevronRight size={16} />
          </div>
          <div className="account-user-phone">Logged with {displayPhone}</div>
        </div>
        <div className="account-avatar-badge">{initial}</div>
      </div>
      <div className="account-stat-box">
        <div className="account-stat-num">{orderCount}</div>
        <div className="account-stat-label">Total Orders</div>
      </div>
    </div>
  );
}
