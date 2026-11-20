import { RotateCcw } from "lucide-react";
import { DashboardPanel } from "@/components/admin/dashboard";
import { ReturnExchangeSwitch } from "./ReturnExchangeSwitch";
import { SettingsCardTitle } from "./SettingsCardTitle";
import { SettingsFeedback } from "./SettingsFeedback";

/**
 * "Return & exchange requests" settings card: status pill and the online-requests switch.
 * @param {{settings: object}} props State and actions returned by `useReturnExchangeSetting`.
 */
export function ReturnExchangeSettingsCard({ settings }) {
  const { enabled, loading, saving, message } = settings;

  return (
    <DashboardPanel
      title={<SettingsCardTitle eyebrow={<><RotateCcw size={13} /> CUSTOMER SERVICE</>}>Return &amp; exchange requests</SettingsCardTitle>}
      description="Control whether customers can submit requests online from their delivered orders."
      className="settings-card"
      action={<span style={{ padding: "7px 11px", borderRadius: 20, background: enabled ? "#e8f3e9" : "#f5e9e5", color: enabled ? "#397047" : "#934f40", fontSize: 11, fontWeight: 750 }}>
          {enabled ? "ONLINE REQUESTS ON" : "EMAIL SUPPORT ONLY"}
        </span>}
    >
      <SettingsFeedback message={message} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: 18, border: "1px solid #e7e2dc", borderRadius: 12, background: "#fff", marginTop: 18 }}>
        <div><strong style={{ color: "#402514", fontSize: 14 }}>Enable online return & exchange</strong><p style={{ margin: "5px 0 0", color: "#718076", fontSize: 12 }}>{enabled ? "The admin queue and customer request forms are available." : "The admin queue is hidden and customers see the support email option."}</p></div>
        <ReturnExchangeSwitch enabled={enabled} busy={loading || saving} onToggle={() => settings.save(!enabled)} />
      </div>
      <small className="announcement-help">Changes publish immediately. Existing requests remain stored when the feature is turned off.</small>
    </DashboardPanel>
  );
}
