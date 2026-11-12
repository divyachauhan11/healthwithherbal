"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { adminRequest } from "../../lib/admin-api";
import {
  Login,
  PageStats,
  AdminSidebar,
  AdminHeader,
  DeleteConfirmationModal,
} from "./global";
import {
  DashboardPage,
  ProductsPage,
  CategoriesPage,
  BrandsPage,
  OrdersPage,
  CouponsPage,
  ReviewsPage,
  CustomersPage,
  BlogsPage,
  UsersPage,
  SettingsPage,
  ProfilePage,
  LowStockPage,
} from "./pages";

const VALID_PAGES = [
  "Dashboard",
  "Products",
  "Low Stock",
  "Categories",
  "Brands",
  "Orders",
  "Coupons",
  "Reviews",
  "Customers",
  "Blogs",
  "Users",
  "Settings",
  "Profile",
];

const getValidPageName = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  const match = VALID_PAGES.find(
    (p) =>
      p.toLowerCase() === candidate.toLowerCase() ||
      p.toLowerCase().replace(/\s+/g, "-") === candidate.toLowerCase().replace(/\s+/g, "-"),
  );
  return match || null;
};

const pageDescriptions = {
  Dashboard: "Here’s what’s happening with your store today.",
  Products: "Manage inventory, pricing and product visibility.",
  "Low Stock":
    "Monitor, restock, and manage products with inventory below 10 units.",
  Orders: "Track, fulfil and manage customer orders.",
  Customers: "Understand customer activity and purchase history.",
};

export default function AdminPortal() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return "Dashboard";
    try {
      const params = new URLSearchParams(window.location.search);
      const paramPage = params.get("page") || params.get("tab");
      const validParam = getValidPageName(paramPage);
      if (validParam) return validParam;

      const saved = window.localStorage.getItem("hwh-admin-page");
      const validSaved = getValidPageName(saved);
      if (validSaved) return validSaved;
    } catch {
      // Ignore
    }
    return "Dashboard";
  });
  const [sidebar, setSidebar] = useState(false);
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("q") ||
        params.get("query") ||
        window.localStorage.getItem("hwh-admin-query") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [productCategoryScope, setProductCategoryScope] = useState(null);
  const [data, setData] = useState({});
  const [catalog, setCatalog] = useState({ brands: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    kind: "",
    item: null,
    isBlocked: false,
    blockedCount: 0,
    busy: false,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("hwh-admin-session");
    if (saved) {
      setToken(saved);
      try {
        setUser(
          JSON.parse(window.localStorage.getItem("hwh-admin-user") || "null"),
        );
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const refreshStaffAccess = async () => {
      try {
        const result = await adminRequest("/auth/session", { token });
        if (!active || !result.user) return;
        setUser(result.user);
        window.localStorage.setItem("hwh-admin-user", JSON.stringify(result.user));
      } catch (error) {
        if (!active) return;
        if (/no longer active|session has expired|session is invalid/i.test(error.message)) {
          window.localStorage.removeItem("hwh-admin-session");
          window.localStorage.removeItem("hwh-admin-user");
          setToken("");
          setUser(null);
          setLoginError(error.message);
        }
      }
    };
    refreshStaffAccess();
    const intervalId = window.setInterval(refreshStaffAccess, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    if (Array.isArray(user?.pageAccess) && !user.pageAccess.includes(page)) {
      setPage(user.pageAccess?.[0] || "Products");
      setQuery("");
    }
  }, [user, page]);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4500);
  };
  const load = async (target = page, activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    try {
      if (["Settings", "Profile"].includes(target)) {
        setLoading(false);
        return;
      }
      let route =
        target === "Dashboard"
          ? "/dashboard"
          : target === "Low Stock"
            ? "/low-stock"
            : `/${target.toLowerCase()}`;
      if (target === "Products" && productCategoryScope?.id) {
        route += `?parentCategoryId=${encodeURIComponent(productCategoryScope.id)}`;
      }
      const result = await adminRequest(route, { token: activeToken });
      setData((current) => ({
        ...current,
        [target]: result.stats ? result : result.items || [],
      }));
      if (["Products", "Categories", "Brands", "Low Stock"].includes(target)) {
        const [brands, categories] = await Promise.all([
          adminRequest("/brands", { token: activeToken }),
          adminRequest("/categories", { token: activeToken }),
        ]);
        setCatalog({
          brands: brands.items || [],
          categories: categories.items || [],
        });
      }
      if (target !== "Dashboard" && !data.Dashboard) {
        adminRequest("/dashboard", { token: activeToken })
          .then((dashResult) => {
            setData((cur) => ({
              ...cur,
              Dashboard: dashResult,
            }));
          })
          .catch(() => {});
      }
    } catch (error) {
      if (
        error.message.toLowerCase().includes("session") ||
        error.message.toLowerCase().includes("sign in")
      ) {
        window.localStorage.removeItem("hwh-admin-session");
        window.localStorage.removeItem("hwh-admin-user");
        setToken("");
        setUser(null);
      }
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(page, token);
  }, [token, page, productCategoryScope]);

  // Synchronize active page and search query to URL and localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("hwh-admin-page", page);
      if (query.trim()) {
        window.localStorage.setItem("hwh-admin-query", query.trim());
      } else {
        window.localStorage.removeItem("hwh-admin-query");
      }

      const params = new URLSearchParams(window.location.search);
      const slugPage = page.toLowerCase().replace(/\s+/g, "-");
      params.set("page", slugPage);
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } catch {
      // Ignore storage/history exceptions if any
    }
  }, [page, query]);

  // Handle browser back and forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlPage = getValidPageName(params.get("page") || params.get("tab"));
        if (urlPage && urlPage !== page) {
          setPage(urlPage);
        }
        const urlQuery = params.get("q") || params.get("query") || "";
        if (urlQuery !== query) {
          setQuery(urlQuery);
        }
      } catch {
        // Ignore
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [page, query]);

  const onLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    const formData = new FormData(event.currentTarget);
    try {
      const result = await adminRequest("/auth/login", {
        method: "POST",
        body: {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      });
      window.localStorage.setItem("hwh-admin-session", result.token);
      window.localStorage.setItem(
        "hwh-admin-user",
        JSON.stringify(result.user),
      );
      setUser(result.user);
      setToken(result.token);
      if (result.user.role === "employee") {
        setPage(result.user.pageAccess?.[0] || "Products");
      }
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async (body) => {
    setBusy(true);
    try {
      const kind = form.kind;
      const route = `/${kind}${form.item?._id ? `/${form.item._id}` : ""}`;
      const result = await adminRequest(route, {
        token,
        method: form.item?._id ? "PUT" : "POST",
        body,
      });
      setForm(null);
      await load(page);
      notify(`${kind.slice(0, -1)} saved successfully.`);
      return result;
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const createStaffUser = async (body) => {
    setBusy(true);
    try {
      await adminRequest("/users", { token, method: "POST", body });
      await load("Users");
      notify("User created successfully.");
      return true;
    } catch (error) {
      notify(error.message || "Could not create user.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateStaffUser = async (id, body) => {
    setBusy(true);
    try {
      await adminRequest(`/users/${id}`, { token, method: "PUT", body });
      await load("Users");
      notify("User updated successfully.");
      return true;
    } catch (error) {
      notify(error.message || "Could not update user.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const remove = (kind, item) => {
    if (!item) return;
    const count = item.productCount ?? item.count ?? 0;
    const isBlocked = (kind === "brands" || kind === "categories") && count > 0;
    setDeleteModal({
      isOpen: true,
      kind,
      item,
      isBlocked,
      blockedCount: count,
      busy: false,
    });
  };

  const confirmDelete = async () => {
    const { kind, item } = deleteModal;
    if (!kind || !item?._id) return;
    setDeleteModal((prev) => ({ ...prev, busy: true }));
    try {
      await adminRequest(`/${kind}/${item._id}`, { token, method: "DELETE" });
      await load(page);
      notify(
        `${item.name || item.title || item.code || "Record"} removed successfully.`,
        "success",
      );
      setDeleteModal({
        isOpen: false,
        kind: "",
        item: null,
        isBlocked: false,
        blockedCount: 0,
        busy: false,
      });
    } catch (error) {
      notify(error.message, "error");
      setDeleteModal((prev) => ({ ...prev, busy: false }));
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.busy) return;
    setDeleteModal({
      isOpen: false,
      kind: "",
      item: null,
      isBlocked: false,
      blockedCount: 0,
      busy: false,
    });
  };

  const toggleProductActive = async (product) => {
    if (!product?._id) return;
    const nextActive = product.active === false ? true : false;
    setData((prev) => {
      const currentList = prev[page];
      if (!Array.isArray(currentList)) return prev;
      return {
        ...prev,
        [page]: currentList.map((item) =>
          item._id === product._id ? { ...item, active: nextActive } : item,
        ),
      };
    });

    try {
      await adminRequest(`/products/${product._id}/toggle-active`, {
        token,
        method: "PATCH",
        body: { active: nextActive },
      });
      notify(
        nextActive
          ? `"${product.title || "Product"}" is now unhidden and visible in the store.`
          : `"${product.title || "Product"}" has been paused and hidden from the store.`,
        "success",
      );
      await load(page);
    } catch (error) {
      await load(page);
      notify(error.message || "Failed to update product visibility.", "error");
    }
  };


  const filtered = useMemo(() => {
    let rows = Array.isArray(data[page]) ? data[page] : [];
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    if (page === "Categories" && needle === "hidden") {
      return rows.filter((row) => row.isActive === false);
    }
    if (page === "Categories" && needle === "active") {
      return rows.filter((row) => row.isActive !== false);
    }
    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(needle),
    );
  }, [data, page, query]);

  if (!token) return <Login onLogin={onLogin} busy={busy} error={loginError} />;

  const dashboard = data.Dashboard || {};
  const stats = dashboard.stats || {};
  const titleCopy =
    pageDescriptions[page] ||
    `Manage ${page.toLowerCase()} for HealthwithHerbal.`;
  const logout = () => {
    window.localStorage.removeItem("hwh-admin-session");
    window.localStorage.removeItem("hwh-admin-user");
    window.localStorage.removeItem("hwh-admin-page");
    window.localStorage.removeItem("hwh-admin-query");
    setToken("");
    setUser(null);
    setPage("Dashboard");
    setQuery("");
    setProductCategoryScope(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };
  const sharedPageProps = {
    rows: filtered,
    catalog,
    query,
    setQuery,
    form,
    setForm,
    save,
    remove,
    onToggleActive: toggleProductActive,
    busy,
    onNavigate: (targetPage, filterQuery) => {
      setPage(targetPage);
      if (targetPage === "Products" && filterQuery?.parentCategoryId) {
        setProductCategoryScope({
          id: filterQuery.parentCategoryId,
          name: filterQuery.parentCategoryName || "Parent category",
        });
        setQuery("");
      } else {
        setProductCategoryScope(null);
        if (filterQuery !== undefined) setQuery(filterQuery);
      }
    },
  };

  const contentByPage = {
    Dashboard: (
      <DashboardPage
        dashboard={dashboard}
        stats={stats}
        onNavigate={setPage}
        onRefresh={() => load("Dashboard")}
      />
    ),
    Products: (
      <ProductsPage
        {...sharedPageProps}
        catalog={catalog}
        categoryScopeName={productCategoryScope?.name || ""}
        onClearCategoryScope={() => setProductCategoryScope(null)}
      />
    ),
    "Low Stock": (
      <LowStockPage
        {...sharedPageProps}
        catalog={catalog}
        token={token}
        onRefresh={() => {
          load("Low Stock");
          load("Dashboard");
        }}
        onNavigate={setPage}
      />
    ),
    Categories: <CategoriesPage {...sharedPageProps} />,
    Brands: <BrandsPage {...sharedPageProps} />,
    Orders: (
      <OrdersPage {...sharedPageProps} onRefresh={() => load("Orders")} />
    ),
    Coupons: <CouponsPage {...sharedPageProps} />,
    Reviews: (
      <ReviewsPage
        {...sharedPageProps}
        token={token}
        onRefresh={() => load("Reviews")}
        notify={notify}
      />
    ),
    Customers: <CustomersPage {...sharedPageProps} />,
    Blogs: <BlogsPage {...sharedPageProps} />,
    Users: (
      <UsersPage
        {...sharedPageProps}
        onCreateUser={createStaffUser}
        onUpdateUser={updateStaffUser}
        onDeleteUser={(item) => remove("users", item)}
        isOpen={addingUser}
        onOpen={() => setAddingUser(true)}
        onClose={() => setAddingUser(false)}
      />
    ),
    Settings: <SettingsPage token={token} />,
    Profile: <ProfilePage user={user} />,
  };

  return (
    <div className="app admin-app">
      <AdminSidebar
        page={page}
        setPage={setPage}
        query={query}
        setQuery={setQuery}
        sidebarOpen={sidebar}
        setSidebarOpen={setSidebar}
        pendingOrders={stats.pendingOrders || 0}
        allowedPages={Array.isArray(user?.pageAccess) ? user.pageAccess : undefined}
      />
      <main>
        <AdminHeader
          query={query}
          setQuery={setQuery}
          user={user}
          onOpenMenu={() => setSidebar(true)}
          onLogout={logout}
        />
        <div className="content">
          <div className="title-row">
            <div>
              <span className="eyebrow">STORE OVERVIEW</span>
              <h1>{page}</h1>
              <p>{titleCopy}</p>
            </div>
            {page === "Users" ? (
              <button type="button" className="primary" onClick={() => setAddingUser(true)}>
                <span aria-hidden="true">+</span> Add New User
              </button>
            ) : (
              <div className="admin-updated">
                {loading ? "Syncing…" : "Live data"}
                <span className="live-dot" />
              </div>
            )}
          </div>
          {page !== "Dashboard" && (
            <PageStats
              page={page}
              stats={stats}
              rows={filtered}
              allRows={Array.isArray(data[page]) ? data[page] : []}
              catalog={catalog}
              onNavigate={setPage}
              query={query}
              setQuery={setQuery}
            />
          )}
          {contentByPage[page]}
          {loading && (
            <div className="admin-loading">
              <span /> Refreshing data from your store…
            </div>
          )}
        </div>
      </main>
      {/* Global Delete Confirmation Popup Screen */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        item={deleteModal.item}
        kind={deleteModal.kind}
        isBlocked={deleteModal.isBlocked}
        blockedCount={deleteModal.blockedCount}
        busy={deleteModal.busy}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        onNavigateToAssigned={(name) => {
          setPage("Products");
          setQuery(name || "");
        }}
      />

      {toast && (
        <div
          className={`admin-toast ${toast.type === "error" ? "danger" : ""}`}
        >
          {toast.type === "error" ? (
            <X size={16} aria-hidden="true" />
          ) : (
            <Check size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
