import { ADMIN_PAGE_IDS } from "../../../constants/admin-pages";
import { AdminSidebarBrand, AdminSidebarNavItem, getVisibleNavigation } from "./sidebar";

/**
 * Admin navigation sidebar (slides in on mobile): logo and the pages the staff
 * member may open, with pending order/return counts. Choosing a page clears
 * the search and closes the mobile sidebar.
 * @param {object} props
 * @param {string} props.page Active page.
 * @param {(page: string) => void} props.setPage
 * @param {string} [props.query]
 * @param {(query: string) => void} props.setQuery
 * @param {boolean} props.sidebarOpen
 * @param {(open: boolean) => void} props.setSidebarOpen
 * @param {number} props.pendingOrders
 * @param {number} [props.pendingReturns=0]
 * @param {string[]} [props.allowedPages] Undefined shows every page.
 * @param {boolean} [props.returnExchangeEnabled=true]
 */
export function AdminSidebar({
  page,
  setPage,
  setQuery,
  sidebarOpen,
  setSidebarOpen,
  pendingOrders,
  pendingReturns = 0,
  allowedPages,
  returnExchangeEnabled = true,
}) {
  const openPage = (label) => {
    setPage(label);
    setQuery("");
    setSidebarOpen(false);
  };

  return (
    <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
      <AdminSidebarBrand
        onHome={() => openPage(ADMIN_PAGE_IDS.DASHBOARD)}
        onClose={() => setSidebarOpen(false)}
      />
      <nav>
        {getVisibleNavigation(allowedPages, returnExchangeEnabled).map(([label, Icon]) => (
          <AdminSidebarNavItem
            key={label}
            label={label}
            icon={Icon}
            active={page === label}
            badge={
              label === ADMIN_PAGE_IDS.ORDERS
                ? pendingOrders
                : label === ADMIN_PAGE_IDS.RETURNS_EXCHANGES
                  ? pendingReturns
                  : 0
            }
            onSelect={() => openPage(label)}
          />
        ))}
      </nav>
    </aside>
  );
}
