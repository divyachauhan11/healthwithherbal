"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { adminRequest } from "../../lib/admin-api";
import {
  ADMIN_PAGE_DESCRIPTIONS,
  ADMIN_PAGE_IDS,
  ADMIN_PAGE_LIST,
} from "../../constants/admin-pages";
import { RETURN_EXCHANGE_STATUSES } from "../../constants/statuses";
import {
  clearAdminSession,
  getAdminSessionToken,
  getAdminUser,
  saveAdminSession,
  saveAdminUser,
} from "../../lib/session";
import {
  Login,
  PageStats,
  AdminSidebar,
  AdminHeader,
  DeleteConfirmationModal,
} from "./global";
import { ConfirmModal } from "../pages/modals/ConfirmModal";
import {
  DashboardPage,
  ProductsPage,
  CategoriesPage,
  BrandsPage,
  OrdersPage,
  PaymentsPage,
  ReturnsPage,
  CouponsPage,
  ReviewsPage,
  CustomersPage,
  BlogsPage,
  UsersPage,
  SettingsPage,
  ProfilePage,
  LowStockPage,
} from "./pages";

const normalizePageKey = (value) => String(value || "")
  .toLowerCase()
  .replace(/\s*&\s*/g, "-and-")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const getValidPageName = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  const match = ADMIN_PAGE_LIST.find(
    (p) => normalizePageKey(p) === normalizePageKey(candidate),
  );
  return match || null;
};

const getLoginErrorMessage = (error) => {
  if (error?.status === 401) return error.message || "Email or password is incorrect, or this account is disabled.";
  if (error?.status === 429) return "Too many sign-in attempts. Wait a few minutes, then try again.";
  if (error?.status === 503) return error.message || "Admin sign-in is temporarily unavailable. Check the server configuration.";
  if (error?.status >= 500) {
    return error.message && error.message !== "An unexpected server error occurred."
      ? error.message
      : "The sign-in service had a problem. Please try again in a moment.";
  }
  if (error?.code === "INVALID_JSON") return "The sign-in service returned an unexpected response. Please try again or contact your administrator.";
  if (error instanceof TypeError || /fetch failed|failed to fetch|network|load failed|connection/i.test(error?.message || "")) {
    return "Could not reach the sign-in service. Check your connection and try again.";
  }
  return error?.message || "Could not sign in. Please check your details and try again.";
};

const clearStoredAdminSession = () => {
  try {
    clearAdminSession();
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
};

export default function AdminPortal() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionCheckError, setSessionCheckError] = useState("");
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return ADMIN_PAGE_IDS.DASHBOARD;
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
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    kind: "",
    item: null,
    isBlocked: false,
    blockedCount: 0,
    busy: false,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    try {
      const saved = getAdminSessionToken();
      if (saved) {
        setToken(saved);
        setUser(
          JSON.parse(getAdminUser() || "null"),
        );
      } else {
        setSessionReady(true);
      }
    } catch {
      clearStoredAdminSession();
      setToken("");
      setUser(null);
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    const handleInvalidSession = (event) => {
      clearStoredAdminSession();
      setToken("");
      setUser(null);
      setSessionReady(true);
      setSessionCheckError("");
      setLoginError(event.detail?.message || "Your admin session is no longer valid. Please sign in again.");
    };
    window.addEventListener("hwh-admin-session-invalid", handleInvalidSession);
    return () => window.removeEventListener("hwh-admin-session-invalid", handleInvalidSession);
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    let active = true;
    let hasValidatedSession = false;
    const refreshStaffAccess = async () => {
      try {
        const result = await adminRequest("/auth/session", { token });
        if (!active) return;
        if (!result?.user) throw new Error("The admin session service did not return a valid user.");
        setUser(result.user);
        try {
          saveAdminUser(result.user);
        } catch {
          // The verified in-memory session can continue if browser storage is blocked.
        }
        hasValidatedSession = true;
        setSessionCheckError("");
      } catch (error) {
        if (!active) return;
        if (error.status !== 401 && !hasValidatedSession) {
          setSessionCheckError(error.message || "Could not reach the admin session service.");
        }
      } finally {
        if (active) setSessionReady(true);
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
    if (!token) {
      setNotifications([]);
      return undefined;
    }
    let active = true;
    const refresh = async () => {
      if (active) setNotificationsLoading(true);
      try {
        const result = await adminRequest("/notifications", { token });
        if (active) setNotifications(Array.isArray(result.items) ? result.items : []);
      } catch (error) {
        if (active) console.warn("Could not load admin notifications:", error.message);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };
    refresh();
    const intervalId = window.setInterval(refresh, 60000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    const isRootAdmin = user?.role === "admin" && !user?._id;
    const canViewPage = page === ADMIN_PAGE_IDS.PROFILE
      || isRootAdmin
      || !Array.isArray(user?.pageAccess)
      || user.pageAccess.includes(page);
    if (!canViewPage) {
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
      if ([ADMIN_PAGE_IDS.SETTINGS, ADMIN_PAGE_IDS.PROFILE].includes(target)) {
        setLoading(false);
        return;
      }
      let route =
        target === "Dashboard"
          ? "/dashboard"
          : target === "Low Stock"
            ? "/low-stock"
            : target === "Returns & Exchanges"
              ? "/return-exchange"
            : `/${target.toLowerCase()}`;
      if (target === "Products" && productCategoryScope?.id) {
        route += `?parentCategoryId=${encodeURIComponent(productCategoryScope.id)}`;
      }
      const result = await adminRequest(route, { token: activeToken });
      setData((current) => ({
        ...current,
        [target]: result.stats ? result : result.items || [],
      }));
      if ([
        ADMIN_PAGE_IDS.PRODUCTS,
        ADMIN_PAGE_IDS.CATEGORIES,
        ADMIN_PAGE_IDS.BRANDS,
        ADMIN_PAGE_IDS.LOW_STOCK,
      ].includes(target)) {
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
        error.status === 401 ||
        String(error.message || "").toLowerCase().includes("session") ||
        String(error.message || "").toLowerCase().includes("sign in")
      ) {
        clearStoredAdminSession();
        setToken("");
        setUser(null);
        setLoginError(error.message || "Your admin session expired. Sign in again to continue.");
      }
      notify(error.message || "Could not load this admin page. Please try again.", "error");
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
      const slugPage = normalizePageKey(page);
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
    if (busy) return;
    setBusy(true);
    setLoginError("");
    try {
      const formData = new FormData(event.currentTarget);
      const result = await adminRequest("/auth/login", {
        method: "POST",
        body: {
          email: String(formData.get("email") || "").trim().toLowerCase(),
          password: formData.get("password"),
        },
      });
      if (!result?.token || !result?.user || !result.user.role) {
        throw new Error("The sign-in service did not return a valid admin session. Please try again.");
      }
      let sessionSaved = true;
      try {
        saveAdminSession(result.token, result.user);
      } catch {
        sessionSaved = false;
        clearStoredAdminSession();
      }
      setUser(result.user);
      setToken(result.token);
      setSessionReady(true);
      setSessionCheckError("");
      if (!sessionSaved) {
        notify("Signed in, but this browser could not save the session. You may need to sign in again after refreshing.", "error");
      }
      if (result.user.role === "employee") {
        setPage(result.user.pageAccess?.[0] || "Products");
      }
    } catch (error) {
      console.error("Admin sign-in failed:", error);
      setLoginError(getLoginErrorMessage(error));
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
    if (page === ADMIN_PAGE_IDS.CATEGORIES && needle === "hidden") {
      return rows.filter((row) => row.isActive === false);
    }
    if (page === ADMIN_PAGE_IDS.CATEGORIES && needle === "active") {
      return rows.filter((row) => row.isActive !== false);
    }
    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(needle),
    );
  }, [data, page, query]);

  if (!sessionReady) {
    return <main className="admin-login-wrap" aria-busy="true" />;
  }

  if (sessionCheckError && token) {
    return (
      <main className="admin-login-wrap">
        <section className="admin-login" role="alert">
          <span className="eyebrow">ADMIN PORTAL</span>
          <h1>Could not verify your session</h1>
          <p>{sessionCheckError}</p>
          <button className="primary" type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
          <button
            className="admin-session-signout"
            type="button"
            onClick={() => {
              clearStoredAdminSession();
              setToken("");
              setUser(null);
              setSessionCheckError("");
              setLoginError("");
            }}
          >
            Return to sign in
          </button>
        </section>
      </main>
    );
  }

  if (!token) return <Login onLogin={onLogin} busy={busy} error={loginError} />;

  const dashboard = data.Dashboard || {};
  const stats = dashboard.stats || {};
  const titleCopy =
    ADMIN_PAGE_DESCRIPTIONS[page] ||
    `Manage ${page.toLowerCase()} for HealthwithHerbal.`;
  const logout = () => {
    clearStoredAdminSession();
    try {
      window.localStorage.removeItem("hwh-admin-page");
      window.localStorage.removeItem("hwh-admin-query");
    } catch {
      // The local session is also cleared from memory below.
    }
    setToken("");
    setUser(null);
    setSessionReady(true);
    setSessionCheckError("");
    setPage(ADMIN_PAGE_IDS.DASHBOARD);
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
    Payments: <PaymentsPage {...sharedPageProps} token={token} notify={notify} onRefresh={() => load("Payments")} />,
    "Returns & Exchanges": (
      <ReturnsPage
        {...sharedPageProps}
        token={token}
        notify={notify}
        onRefresh={() => load("Returns & Exchanges")}
      />
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
    Customers: (
      <CustomersPage
        {...sharedPageProps}
        token={token}
        onRefresh={() => {
          load("Customers");
          load("Dashboard");
        }}
      />
    ),
    Blogs: <BlogsPage {...sharedPageProps} token={token} onRefresh={() => load("Blogs")} />,
    Users: (
      <UsersPage
        {...sharedPageProps}
        currentUser={user}
        onCreateUser={createStaffUser}
        onUpdateUser={updateStaffUser}
        onDeleteUser={(item) => remove("users", item)}
        isOpen={addingUser}
        onOpen={() => setAddingUser(true)}
        onClose={() => setAddingUser(false)}
      />
    ),
    Settings: <SettingsPage token={token} user={user} />,
    Profile: (
      <ProfilePage
        user={user}
        token={token}
        onUserUpdated={(updatedUser) => {
          setUser(updatedUser);
          saveAdminUser(updatedUser);
        }}
      />
    ),
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
        pendingReturns={(data[ADMIN_PAGE_IDS.RETURNS_EXCHANGES] || []).filter((request) => request.status === RETURN_EXCHANGE_STATUSES[0]).length}
        allowedPages={Array.isArray(user?.pageAccess)
          ? user.role === "admin" && !user?._id
            ? undefined
            : [...new Set([...user.pageAccess, ...(user.role === "employee" ? [ADMIN_PAGE_IDS.PROFILE] : [])])]
          : undefined}
      />
      <main>
        <AdminHeader
          query={query}
          setQuery={setQuery}
          user={user}
          onOpenMenu={() => setSidebar(true)}
          onLogout={() => setShowLogoutConfirm(true)}
          notifications={notifications}
          notificationsOpen={notificationsOpen}
          notificationsLoading={notificationsLoading}
          onToggleNotifications={setNotificationsOpen}
          onRefreshNotifications={() => {
            if (!token) return;
            setNotificationsLoading(true);
            adminRequest("/notifications", { token })
              .then((result) => setNotifications(Array.isArray(result.items) ? result.items : []))
              .catch((error) => console.warn("Could not refresh admin notifications:", error.message))
              .finally(() => setNotificationsLoading(false));
          }}
          onSelectNotification={(notification) => {
            setPage(notification.page || "Dashboard");
            setQuery(notification.query || "");
            setNotificationsOpen(false);
            setSidebar(false);
          }}
        />
        <div className="content">
          <div className="title-row">
            <div>
              <span className="eyebrow">STORE OVERVIEW</span>
              <h1>{page}</h1>
              <p>{titleCopy}</p>
            </div>
            {page === ADMIN_PAGE_IDS.USERS ? (
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
          {page !== ADMIN_PAGE_IDS.DASHBOARD && page !== ADMIN_PAGE_IDS.LOW_STOCK && page !== ADMIN_PAGE_IDS.RETURNS_EXCHANGES && (
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
          setPage(ADMIN_PAGE_IDS.PRODUCTS);
          setQuery(name || "");
        }}
      />

      {/* Admin Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Log Out of Admin Portal?"
        message="Are you sure you want to end your administrative session?"
        confirmLabel="Log Out"
        variant="warning"
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
