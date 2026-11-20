"use client";
import { useEffect, useState } from "react";
import {
  contentLabel,
  contentSlug,
  findSelectedProduct,
  pageFromLocation,
  pagePath,
} from "./storefront-utils";

/**
 * Owns client-side routing: the active page and its parameters (catalogue
 * view/search, selected product, content page, account tab), kept in sync with
 * the URL through `history.pushState` and `popstate`. It also enforces the
 * sign-in gates of routes that need an account.
 * @param {object} options
 * @param {Array<object>} options.products Catalogue, used to resolve product slugs.
 * @param {object|null} options.currentUser
 * @param {boolean} options.sessionReady Whether the saved session has been restored.
 * @param {(open: boolean) => void} options.setCartOpen Stable cart-drawer state setter.
 * @param {(open: boolean) => void} options.setAuthModalOpen Stable sign-in modal state setter.
 * @param {(message: string) => void} options.notify
 * @returns {{
 *   page: string, catalogView: string, catalogSearch: string, selectedProduct: object|null,
 *   contentPage: string, contentContext: object|null, accountStartTab: string,
 *   navigate: (next: string, options?: {tab?: string, orderId?: string}) => void,
 *   openCatalog: (view: string, searchTerm?: string) => void,
 *   openContent: (next: string, context?: object|null) => void,
 *   openProduct: (id: string|number) => void,
 *   openOrderHistory: () => void, openAccount: () => void, startCheckout: () => void,
 *   search: (value: string) => void,
 * }}
 */
export function useStorefrontNavigation({
  products,
  currentUser,
  sessionReady,
  setCartOpen,
  setAuthModalOpen,
  notify,
}) {
  const [page, setPage] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [catalogView, setCatalogView] = useState("All Products");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [contentPage, setContentPage] = useState("Our Story");
  const [contentContext, setContentContext] = useState(null);
  const [accountStartTab, setAccountStartTab] = useState("overview");

  // A checkout URL can be opened directly, so enforce the same sign-in gate
  // used by the cart's checkout button after the saved session is restored.
  useEffect(() => {
    if (sessionReady && page === "checkout" && !currentUser) {
      setAuthModalOpen(true);
    }
  }, [sessionReady, page, currentUser, setAuthModalOpen]);

  // Legacy `/pages/order-history` links open the account's orders tab.
  useEffect(() => {
    if (!sessionReady || window.location.pathname !== "/pages/order-history") return;
    setAccountStartTab("orders");
    if (!currentUser) setAuthModalOpen(true);
    window.history.replaceState({ page: "account" }, "", "/account");
  }, [sessionReady, currentUser, page, setAuthModalOpen]);

  // Read the page from the initial URL and follow back/forward navigation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncPageFromLocation = () => {
      setPage(pageFromLocation());
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (segments[0] === "pages" && segments[1]) {
        setContentPage(contentLabel(segments[1]));
      }
      if (segments[0] === "product" && segments[1]) setSelectedId(decodeURIComponent(segments[1]));
    };
    syncPageFromLocation();
    const cartParam = params.get("cart");
    if (cartParam) setCartOpen(true);

    window.addEventListener("popstate", syncPageFromLocation);

    return () => {
      window.removeEventListener("popstate", syncPageFromLocation);
    };
  }, [setCartOpen]);

  const navigate = (next, options = {}) => {
    if (next === "cart") {
      setCartOpen(true);
      return;
    }
    setPage(next);
    if (next === "account") setAccountStartTab(options.tab || "overview");
    setCartOpen(false);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(pagePath(next, options, contentPage), window.location.origin);
        window.history.pushState({ page: next }, "", url.toString());
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCatalog = (view, searchTerm = "") => {
    setCatalogView(view);
    setCatalogSearch(searchTerm);
    navigate("shop");
  };

  const openContent = (next, context = null) => {
    setContentPage(next);
    setContentContext(context);
    setPage("content");
    setCartOpen(false);
    window.history.pushState({ page: "content", contentPage: next }, "", `/pages/${contentSlug(next)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOrderHistory = () => {
    navigate("account", { tab: "orders" });
    if (!currentUser) setAuthModalOpen(true);
  };

  const openAccount = () => {
    if (currentUser) {
      navigate("account");
    } else {
      setAuthModalOpen(true);
    }
  };

  const startCheckout = () => {
    navigate("checkout");
    if (!currentUser) setAuthModalOpen(true);
  };

  const openProduct = (id) => {
    setSelectedId(id);
    setPage("product");
    setCartOpen(false);
    const product = products.find((item) => item.id === id || item._id === id);
    const slug = product?.slug || product?.id || product?._id || id;
    window.history.pushState({ page: "product", product: slug }, "", `/product/${encodeURIComponent(slug)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const search = (value) => {
    openCatalog("All Products", value.trim());
    notify(
      value.trim()
        ? `Showing results for “${value.trim()}”`
        : "Showing all products",
    );
  };

  return {
    page,
    catalogView,
    catalogSearch,
    selectedProduct: findSelectedProduct(products, selectedId),
    contentPage,
    contentContext,
    accountStartTab,
    navigate,
    openCatalog,
    openContent,
    openProduct,
    openOrderHistory,
    openAccount,
    startCheckout,
    search,
  };
}
