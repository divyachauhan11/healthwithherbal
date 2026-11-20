"use client";

import { useState } from "react";
import { ADMIN_PAGE_IDS } from "../../../constants/admin-pages";
import { useAdminDeleteDialog } from "./useAdminDeleteDialog";
import { useAdminLogout } from "./useAdminLogout";
import { useAdminMutations } from "./useAdminMutations";
import { useAdminNavigation } from "./useAdminNavigation";
import { useAdminNotifications } from "./useAdminNotifications";
import { useAdminPageAccess } from "./useAdminPageAccess";
import { useAdminPageData } from "./useAdminPageData";
import { useAdminSession } from "./useAdminSession";
import { useAdminToast } from "./useAdminToast";
import { useAdminUrlSync } from "./useAdminUrlSync";

/**
 * All state and side effects of the admin portal, composed from the portal
 * hooks. Effects run in this order: session restore, invalid-session listener,
 * 15 s session check, 60 s notification polling, page access guard, page data
 * load, URL/storage sync, back/forward listener.
 * @returns {{
 *   busy: boolean, toast: object|null, notify: Function,
 *   navigation: ReturnType<typeof useAdminNavigation>,
 *   session: ReturnType<typeof useAdminSession>,
 *   notifications: ReturnType<typeof useAdminNotifications>,
 *   pageData: ReturnType<typeof useAdminPageData>,
 *   mutations: ReturnType<typeof useAdminMutations>,
 *   deletion: ReturnType<typeof useAdminDeleteDialog>,
 *   logoutDialog: ReturnType<typeof useAdminLogout>,
 *   addingUser: boolean, setAddingUser: Function,
 *   pageProps: object, selectNotification: (notification: object) => void,
 *   showAssignedProducts: (name: string) => void,
 * }}
 */
export function useAdminPortal() {
  const { toast, notify } = useAdminToast();
  const navigation = useAdminNavigation();
  const { page, setPage, query, setQuery, productCategoryScope, setSidebarOpen } = navigation;
  const [busy, setBusy] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  const session = useAdminSession({ busy, setBusy, notify, setPage });
  const notifications = useAdminNotifications(session.token);
  useAdminPageAccess({ user: session.user, page, setPage, setQuery });
  const pageData = useAdminPageData({
    token: session.token,
    page,
    query,
    productCategoryScope,
    notify,
    onSessionExpired: session.expireSession,
  });
  useAdminUrlSync({ page, query, setPage, setQuery });

  const mutations = useAdminMutations({
    token: session.token,
    page,
    load: pageData.load,
    setData: pageData.setData,
    notify,
    setBusy,
  });
  const deletion = useAdminDeleteDialog({
    token: session.token,
    page,
    load: pageData.load,
    notify,
  });
  const logoutDialog = useAdminLogout({
    signOut: session.signOut,
    resetNavigation: navigation.resetNavigation,
  });

  /** Props shared by the list-style admin page modules. */
  const pageProps = {
    rows: pageData.filtered,
    catalog: pageData.catalog,
    query,
    setQuery,
    form: mutations.form,
    setForm: mutations.setForm,
    save: mutations.save,
    remove: deletion.remove,
    onToggleActive: mutations.toggleProductActive,
    busy,
    onNavigate: navigation.navigateTo,
  };

  const selectNotification = (notification) => {
    setPage(notification.page || "Dashboard");
    setQuery(notification.query || "");
    notifications.setNotificationsOpen(false);
    setSidebarOpen(false);
  };

  const showAssignedProducts = (name) => {
    setPage(ADMIN_PAGE_IDS.PRODUCTS);
    setQuery(name || "");
  };

  return {
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
  };
}
