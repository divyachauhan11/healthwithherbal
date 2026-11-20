import { ADMIN_PAGE_LIST } from "@/constants/admin-pages";
import { isLockedPage } from "./user-utils";

/**
 * Checkbox grid of the admin pages a staff account can open. Employees always keep
 * their profile page.
 * @param {{role: string, pageAccess: string[], onTogglePage: (pageName: string) => void}} props
 */
export function UserPageAccessFieldset({ role, pageAccess, onTogglePage }) {
  return (
    <fieldset className="user-access-list">
      <legend>Pages access</legend>
      <p>Choose which admin portal pages this user can access.</p>
      <div className="user-access-grid">
        {ADMIN_PAGE_LIST.map((pageName) => (
          <label key={pageName}>
            <input
              type="checkbox"
              checked={isLockedPage(pageName, role) || pageAccess.includes(pageName)}
              onChange={() => onTogglePage(pageName)}
              disabled={isLockedPage(pageName, role)}
            />
            <span>{pageName}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
