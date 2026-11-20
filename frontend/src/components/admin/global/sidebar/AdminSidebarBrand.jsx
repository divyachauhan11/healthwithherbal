import { X } from "lucide-react";

/**
 * Sidebar logo block (links to the dashboard) with the mobile close button.
 * @param {object} props
 * @param {() => void} props.onHome Opens the dashboard.
 * @param {() => void} props.onClose Closes the mobile sidebar.
 */
export function AdminSidebarBrand({ onHome, onClose }) {
  return (
    <div className="brand admin-brand">
      <div
        className="admin-brand-wrap"
        onClick={onHome}
        role="button"
        tabIndex={0}
        title="Health With Herbal - Admin Portal"
      >
        <div
          className="admin-brand-logo-card"
          style={{
            height: "80px",
            maxHeight: "80px",
            width: "fit-content",
            padding: "2px 6px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/health-with-herbal-logo-tight.png"
            alt="Health With Herbal"
            className="admin-brand-logo-img"
            style={{
              height: "70px",
              maxHeight: "70px",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
        <div className="admin-portal-badge">
          <span>ADMIN PORTAL</span>
        </div>
      </div>
      <button
        className="mobile-close"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={17} />
      </button>
    </div>
  );
}
