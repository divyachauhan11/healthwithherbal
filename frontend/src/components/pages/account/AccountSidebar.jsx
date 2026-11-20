import { AccountNavigationMenu } from "./AccountNavigationMenu";
import { UserProfileCard } from "./UserProfileCard";

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
