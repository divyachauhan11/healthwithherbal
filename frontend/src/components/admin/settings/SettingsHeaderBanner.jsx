import { Settings } from "lucide-react";

/**
 * Settings page banner with the storefront connection badge and the signed-in email.
 * @param {{email?: string}} props
 */
export function SettingsHeaderBanner({ email }) {
  return (
    <section className="settings-header-banner">
      <div>
        <h2>
          <Settings size={26} /> Store Settings & Configuration
        </h2>
        <p>
          Admin access, security policies, and environment parameters for Health with Herbal.
        </p>
      </div>
      <div className="settings-header-meta">
        <div className="settings-live-badge">
          <span className="settings-live-dot" /> Live Storefront Connected
        </div>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
          Signed in as <b>{email}</b>
        </span>
      </div>
    </section>
  );
}
