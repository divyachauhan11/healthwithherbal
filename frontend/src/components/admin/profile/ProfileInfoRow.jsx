/**
 * Label/value row of the profile account information card.
 * @param {{label: string, valueClassName?: string, children: import("react").ReactNode}} props
 */
export function ProfileInfoRow({ label, valueClassName, children }) {
  return (
    <div className="admin-profile-info-row">
      <span>{label}</span>
      <b className={valueClassName}>{children}</b>
    </div>
  );
}
