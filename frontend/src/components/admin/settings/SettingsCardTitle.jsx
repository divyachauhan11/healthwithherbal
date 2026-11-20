/**
 * Title of a settings card: an eyebrow line above the card name.
 * @param {{eyebrow: import("react").ReactNode, children: import("react").ReactNode}} props
 */
export function SettingsCardTitle({ eyebrow, children }) {
  return <><span className="settings-eyebrow">{eyebrow}</span><br />{children}</>;
}
