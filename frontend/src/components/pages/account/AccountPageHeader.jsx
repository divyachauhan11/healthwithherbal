/**
 * Title row of an account tab with an optional description and actions.
 * @param {object} props
 * @param {string} props.title Tab title.
 * @param {string} [props.description] Text under the title.
 * @param {import("react").ReactNode} [props.children] Actions on the right.
 */
export function AccountPageHeader({ title, description, children }) {
  return (
    <div className="account-section-header">
      <div>
        <h1 className="account-view-title">{title}</h1>
        {description && <p className="account-view-sub">{description}</p>}
      </div>
      {children}
    </div>
  );
}
