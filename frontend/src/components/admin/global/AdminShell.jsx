import {
  Bell,
  AlertTriangle,
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Shield,
  Star,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";

const navigation = [
  ["Dashboard", LayoutDashboard],
  ["Products", Package],
  ["Low Stock", AlertTriangle],
  ["Categories", BookOpen],
  ["Brands", Star],
  ["Coupons", Tag],
  ["Reviews", Star],
  ["Orders", Truck],
  ["Customers", Users],
  ["Blogs", FileText],
  ["Users", Shield],
  ["Settings", Settings],
  ["Profile", Users],
];

export function AdminSidebar({
  page,
  setPage,
  query,
  setQuery,
  sidebarOpen,
  setSidebarOpen,
  pendingOrders,
  allowedPages,
}) {
  return (
    <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
      <div className="brand admin-brand">
        <div
          className="admin-brand-wrap"
          onClick={() => {
            setPage("Dashboard");
            setQuery("");
            setSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          title="Health With Herbal - Admin Portal"
        >
          <div
            className="admin-brand-logo-card"
            style={{
              height: "80px",
              maxHeight: "80px",
              width: "fit-content",
              padding: "2px 6px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/health-with-herbal-logo-tight.png"
              alt="Health With Herbal"
              className="admin-brand-logo-img"
              style={{
                height: "70px",
                maxHeight: "70px",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <div className="admin-portal-badge">
            <span>ADMIN PORTAL</span>
          </div>
        </div>
        <button
          className="mobile-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={17} />
        </button>
      </div>
      <nav>
        {navigation.filter(([label]) => !allowedPages || allowedPages.includes(label)).map(([label, Icon]) => (
          <button
            key={label}
            className={page === label ? "active" : ""}
            onClick={() => {
              setPage(label);
              setQuery("");
              setSidebarOpen(false);
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === "Orders" && pendingOrders > 0 && (
              <em>{pendingOrders}</em>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function AdminHeader({ query, setQuery, user, onOpenMenu, onLogout }) {
  return (
    <header>
      <button
        className="menu-button"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>
      <label className="search">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search orders, products, customers…"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="header-actions">
        <button className="icon-button notification" aria-label="Notifications">
          <Bell size={18} />
          <i />
        </button>
        <div className="avatar">
          {(user?.name || "Admin").slice(0, 2).toUpperCase()}
        </div>
        <div className="admin">
          <b>{user?.name || "Administrator"}</b>
          <span>{user?.email}</span>
        </div>
        <button className="icon-button" title="Sign out" onClick={onLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
