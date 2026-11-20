"use client";

import {
  Login,
  PageStats,
  AdminSidebar,
  AdminHeader,
  AdminPageHeader,
  DeleteConfirmationModal,
} from "./global";
import {
  AdminLoadingNotice,
  AdminLogoutConfirm,
  AdminPageRenderer,
  AdminPortalShell,
  AdminSessionCheckError,
  AdminSessionPending,
  AdminToast,
  countPendingReturns,
  getAdminPageDescription,
  getAllowedAdminPages,
  getPageRows,
  hasPageStats,
  useAdminPortal,
} from "./portal";

/**
 * Admin portal: restores and verifies the admin session, then shows the
 * sign-in screen or the portal (sidebar, header, active page, dialogs, toast).
 * State and side effects live in `useAdminPortal`.
 */
export default function AdminPortal() {
  const {
    busy,
    toast,
    notify,
    navigation,
    session,
    notifications,
    pageData,
    mutations,
    deletion,
    logoutDialog,
    addingUser,
    setAddingUser,
    pageProps,
    selectNotification,
    showAssignedProducts,
  } = useAdminPortal();
  const { page, setPage, query, setQuery, productCategoryScope } = navigation;
  const { token, user } = session;
  const { deleteModal } = deletion;

  if (!session.sessionReady) return <AdminSessionPending />;

  if (session.sessionCheckError && token) {
    return (
      <AdminSessionCheckError
        message={session.sessionCheckError}
        onReturnToSignIn={session.returnToSignIn}
      />
    );
  }

  if (!token) return <Login onLogin={session.login} busy={busy} error={session.loginError} />;

  const dashboard = pageData.data.Dashboard || {};
  const stats = dashboard.stats || {};

  return (
    <AdminPortalShell
      sidebar={
        <AdminSidebar
          page={page}
          setPage={setPage}
          query={query}
          setQuery={setQuery}
          sidebarOpen={navigation.sidebarOpen}
          setSidebarOpen={navigation.setSidebarOpen}
          pendingOrders={stats.pendingOrders || 0}
          pendingReturns={countPendingReturns(pageData.data)}
          allowedPages={getAllowedAdminPages(user)}
        />
      }
      header={
        <AdminHeader
          query={query}
          setQuery={setQuery}
          user={user}
          onOpenMenu={() => navigation.setSidebarOpen(true)}
          onLogout={logoutDialog.open}
          notifications={notifications.notifications}
          notificationsOpen={notifications.notificationsOpen}
          notificationsLoading={notifications.notificationsLoading}
          onToggleNotifications={notifications.setNotificationsOpen}
          onRefreshNotifications={notifications.refreshNotifications}
          onSelectNotification={selectNotification}
        />
      }
      overlays={
        <>
          <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            item={deleteModal.item}
            kind={deleteModal.kind}
            isBlocked={deleteModal.isBlocked}
            blockedCount={deleteModal.blockedCount}
            busy={deleteModal.busy}
            onClose={deletion.closeDeleteModal}
            onConfirm={deletion.confirmDelete}
            onNavigateToAssigned={showAssignedProducts}
          />
          <AdminLogoutConfirm
            isOpen={logoutDialog.isOpen}
            onClose={logoutDialog.close}
            onConfirm={logoutDialog.confirm}
          />
          <AdminToast toast={toast} />
        </>
      }
    >
      <AdminPageHeader
        title={page}
        description={getAdminPageDescription(page)}
        loading={pageData.loading}
        onAddUser={() => setAddingUser(true)}
      />
      {hasPageStats(page) && (
        <PageStats
          page={page}
          stats={stats}
          rows={pageData.filtered}
          allRows={getPageRows(pageData.data, page)}
          catalog={pageData.catalog}
          onNavigate={setPage}
          query={query}
          setQuery={setQuery}
        />
      )}
      <AdminPageRenderer
        page={page}
        pageProps={pageProps}
        token={token}
        user={user}
        catalog={pageData.catalog}
        dashboard={dashboard}
        stats={stats}
        notify={notify}
        load={pageData.load}
        setPage={setPage}
        categoryScopeName={productCategoryScope?.name || ""}
        onClearCategoryScope={() => navigation.setProductCategoryScope(null)}
        onCreateUser={mutations.createStaffUser}
        onUpdateUser={mutations.updateStaffUser}
        onDeleteUser={(item) => deletion.remove("users", item)}
        isAddUserOpen={addingUser}
        onOpenAddUser={() => setAddingUser(true)}
        onCloseAddUser={() => setAddingUser(false)}
        onUserUpdated={session.updateUser}
      />
      {pageData.loading && <AdminLoadingNotice />}
    </AdminPortalShell>
  );
}
