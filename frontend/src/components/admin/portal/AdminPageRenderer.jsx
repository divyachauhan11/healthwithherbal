import { ADMIN_PAGE_IDS } from "../../../constants/admin-pages";
import {
  BlogsPage,
  BrandsPage,
  CategoriesPage,
  CouponsPage,
  CustomersPage,
  DashboardPage,
  LowStockPage,
  OrdersPage,
  PaymentsPage,
  ProductsPage,
  ProfilePage,
  ReturnsPage,
  ReviewsPage,
  SettingsPage,
  UsersPage,
} from "../pages";

/**
 * Renders the admin page module for the active page with the props it expects.
 * @param {object} props
 * @param {string} props.page Active page.
 * @param {object} props.pageProps Props shared by list pages (rows, catalog, query, form, save, remove, ...).
 * @param {string} props.token Admin token.
 * @param {object|null} props.user Signed-in staff member.
 * @param {{brands: Array, categories: Array}} props.catalog
 * @param {object} props.dashboard Dashboard payload.
 * @param {object} props.stats Dashboard stats.
 * @param {(message: string, type?: string) => void} props.notify
 * @param {(target?: string) => Promise<void>} props.load Reloads a page's data.
 * @param {(page: string) => void} props.setPage
 * @param {string} props.categoryScopeName Parent category the product list is scoped to.
 * @param {() => void} props.onClearCategoryScope
 * @param {(body: object) => Promise<boolean>} props.onCreateUser
 * @param {(id: string, body: object) => Promise<boolean>} props.onUpdateUser
 * @param {(item: object) => void} props.onDeleteUser
 * @param {boolean} props.isAddUserOpen
 * @param {() => void} props.onOpenAddUser
 * @param {() => void} props.onCloseAddUser
 * @param {(user: object) => void} props.onUserUpdated
 */
export function AdminPageRenderer({
  page,
  pageProps,
  token,
  user,
  catalog,
  dashboard,
  stats,
  notify,
  load,
  setPage,
  categoryScopeName,
  onClearCategoryScope,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  isAddUserOpen,
  onOpenAddUser,
  onCloseAddUser,
  onUserUpdated,
}) {
  switch (page) {
    case ADMIN_PAGE_IDS.DASHBOARD:
      return (
        <DashboardPage
          dashboard={dashboard}
          stats={stats}
          onNavigate={setPage}
          onRefresh={() => load("Dashboard")}
        />
      );
    case ADMIN_PAGE_IDS.PRODUCTS:
      return (
        <ProductsPage
          {...pageProps}
          catalog={catalog}
          categoryScopeName={categoryScopeName}
          onClearCategoryScope={onClearCategoryScope}
        />
      );
    case ADMIN_PAGE_IDS.LOW_STOCK:
      return (
        <LowStockPage
          {...pageProps}
          catalog={catalog}
          token={token}
          onRefresh={() => {
            load("Low Stock");
            load("Dashboard");
          }}
          onNavigate={setPage}
        />
      );
    case ADMIN_PAGE_IDS.CATEGORIES:
      return <CategoriesPage {...pageProps} />;
    case ADMIN_PAGE_IDS.BRANDS:
      return <BrandsPage {...pageProps} />;
    case ADMIN_PAGE_IDS.ORDERS:
      return <OrdersPage {...pageProps} onRefresh={() => load("Orders")} />;
    case ADMIN_PAGE_IDS.PAYMENTS:
      return <PaymentsPage {...pageProps} token={token} notify={notify} onRefresh={() => load("Payments")} />;
    case ADMIN_PAGE_IDS.RETURNS_EXCHANGES:
      return (
        <ReturnsPage
          {...pageProps}
          token={token}
          notify={notify}
          onRefresh={() => load("Returns & Exchanges")}
        />
      );
    case ADMIN_PAGE_IDS.COUPONS:
      return <CouponsPage {...pageProps} />;
    case ADMIN_PAGE_IDS.REVIEWS:
      return (
        <ReviewsPage
          {...pageProps}
          token={token}
          onRefresh={() => load("Reviews")}
          notify={notify}
        />
      );
    case ADMIN_PAGE_IDS.CUSTOMERS:
      return (
        <CustomersPage
          {...pageProps}
          token={token}
          onRefresh={() => {
            load("Customers");
            load("Dashboard");
          }}
        />
      );
    case ADMIN_PAGE_IDS.BLOGS:
      return <BlogsPage {...pageProps} token={token} onRefresh={() => load("Blogs")} />;
    case ADMIN_PAGE_IDS.USERS:
      return (
        <UsersPage
          {...pageProps}
          currentUser={user}
          onCreateUser={onCreateUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          isOpen={isAddUserOpen}
          onOpen={onOpenAddUser}
          onClose={onCloseAddUser}
        />
      );
    case ADMIN_PAGE_IDS.SETTINGS:
      return <SettingsPage token={token} user={user} />;
    case ADMIN_PAGE_IDS.PROFILE:
      return (
        <ProfilePage
          user={user}
          token={token}
          onUserUpdated={onUserUpdated}
        />
      );
    default:
      return null;
  }
}
