import { MapPin, Plus } from "lucide-react";

export function NoSavedAddresses({
  onAddAddress,
  title = "No Saved Addresses",
  description = "Add your shipping address for one-click checkout.",
  actionLabel = "Add Address",
  inlineAction = false,
  Icon = MapPin,
  actionIcon: ActionIcon = Plus,
  iconWrapperClassName = "mock-pin-3d",
  className = "",
  style = { marginTop: "24px" },
}) {
  return (
    <div className={`account-empty-card ${className}`.trim()} style={style}>
      <div className="account-empty-icon-box">
        <div className={iconWrapperClassName}>
          <Icon size={38} />
        </div>
      </div>
      <div className="account-empty-card-content">
        <h3 className="account-empty-title">{title}</h3>
        <p className="account-empty-desc">
          {description}{inlineAction && " "}
          {inlineAction && (
            <button type="button" className="account-inline-cta" onClick={onAddAddress}>
              {actionLabel}
            </button>
          )}
        </p>
        {!inlineAction && (
          <button type="button" className="app-button" style={{ marginTop: "14px" }} onClick={onAddAddress}>
            {ActionIcon && <ActionIcon size={16} />} {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
