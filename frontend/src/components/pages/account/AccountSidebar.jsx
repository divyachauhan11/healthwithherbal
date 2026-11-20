import { AccountNavigationMenu } from "./AccountNavigationMenu";
import { UserProfileCard } from "./UserProfileCard";

/**
 * Account sidebar: customer profile card and tab navigation.
 * @param {object} props
 * @param {object} props.currentUser Signed-in customer.
 * @param {string} props.displayPhone Contact shown under the greeting.
 * @param {number} props.orderCount Number of orders.
 * @param {string} props.activeTab Id of the selected tab.
 * @param {(tab: string) => void} props.onTabChange Selects a tab.
 * @param {() => void} props.onLogout Asks to log out.
 */
export function AccountSidebar({ currentUser, displayPhone, orderCount, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="account-sidebar">
      <UserProfileCard
        name={currentUser.name}
        displayPhone={displayPhone}
        orderCount={orderCount}
      />
      <AccountNavigationMenu
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />
    </aside>
  );
}
