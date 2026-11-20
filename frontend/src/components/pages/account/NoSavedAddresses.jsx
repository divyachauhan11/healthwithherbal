import { MapPin, Plus } from "lucide-react";

/**
 * Empty-state card of the account page (used for addresses and orders) with an
 * icon, title, description and an inline or button action.
 * @param {object} props
 * @param {() => void} props.onAddAddress Action handler.
 * @param {string} [props.title] Heading.
 * @param {string} [props.description] Text under the heading.
 * @param {string} [props.actionLabel] Action label.
 * @param {boolean} [props.inlineAction=false] Render the action as an inline link.
 * @param {Function} [props.Icon] Lucide icon of the illustration.
 * @param {Function|null} [props.actionIcon] Icon of the action button (null for none).
 * @param {string} [props.iconWrapperClassName] Illustration class.
 * @param {string} [props.className] Extra card class.
 * @param {object} [props.style] Inline card style.
 */
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
