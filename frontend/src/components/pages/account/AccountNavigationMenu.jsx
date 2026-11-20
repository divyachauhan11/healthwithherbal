import { ChevronRight, Inbox, LogOut, MapPin, ShoppingBag } from "lucide-react";

const NAVIGATION_ITEMS = [
  { id: "overview", title: "Overview", description: "All details at one place, easy to access", Icon: Inbox },
  { id: "orders", title: "My Orders", description: "Track your recent purchases", Icon: ShoppingBag },
  { id: "addresses", title: "My Address", description: "Manage shipping addresses", Icon: MapPin },
];

/**
 * Account tab navigation (overview, orders, addresses) and the logout item.
 * @param {object} props
 * @param {string} props.activeTab Id of the selected tab.
 * @param {(tab: string) => void} props.onTabChange Selects a tab.
 * @param {() => void} props.onLogout Asks to log out.
 */
export function AccountNavigationMenu({ activeTab, onTabChange, onLogout }) {
  return (
    <div className="account-nav-group">
      <div className="account-nav-heading">Account</div>
      {NAVIGATION_ITEMS.map(({ id, title, description, Icon }) => (
        <button
          key={id}
          type="button"
          className={`account-nav-item ${activeTab === id ? "active" : ""}`}
          onClick={() => onTabChange(id)}
        >
          <span className="account-nav-icon"><Icon size={19} /></span>
          <div className="account-nav-text">
            <span className="account-nav-title">{title}</span>
            <span className="account-nav-sub">{description}</span>
          </div>
          <ChevronRight size={16} className="account-nav-arrow" />
        </button>
      ))}
      <button type="button" className="account-nav-item account-logout-item" onClick={onLogout}>
        <span className="account-nav-icon logout-icon"><LogOut size={19} /></span>
        <div className="account-nav-text"><span className="account-nav-title logout-text">Logout</span></div>
      </button>
    </div>
  );
}
