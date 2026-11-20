"use client";
import { clearCustomerSession, getCartSessionId, getCustomerSession, saveCustomerSession } from "@/lib/session";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check } from "lucide-react";
import { fetchStoreInit, fetchCartFromBackend, syncCartWithBackend, fetchUserWishlist, addUserWishlistItem, removeUserWishlistItem } from "../lib/api";
import { Header, Footer } from "../components/pages/layout";
import { AuthModal, CartDrawer } from "../components/pages/modals";
import { BlogPage } from "./(pages)/blog/blog-page";
import { HomePage as StoreHomePage } from "./(pages)/home/home-page";
import { ShopPage } from "./(pages)/shop/shop-page";
import { ProductPage } from "./(pages)/products/product-page";
import { WishlistPage } from "./(pages)/wishlist/wishlist-page";
import { ContentPage } from "./(pages)/content/content-page";
import { CheckoutPage } from "./(pages)/checkout/checkout-page";
import { AccountPage } from "./(pages)/account/account-page";
import { OrderPlacedPage } from "./(pages)/order-confirmation/order-placed-page";
import { OrderInvoicePage } from "./(pages)/order-confirmation/order-invoice-page";

const contentSlug = (value) =>
  String(value || "our-story")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const contentPages = ["Our Story", "Contact Us", "Shipping Policy", "Returns & Refunds", "Privacy Policy", "Terms & Conditions", "Disclaimer"];
const contentLabel = (slug) => contentPages.find((label) => contentSlug(label) === slug) || slug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

const normalizeStoreData = (data = {}) => ({
  products: Array.isArray(data.products) ? data.products : [],
  categories: Array.isArray(data.categories) ? data.categories : [],
  navigationCategories: Array.isArray(data.navigationCategories)
    ? data.navigationCategories
    : Array.isArray(data.categories) ? data.categories : [],
  featuredCategoryIds: Array.isArray(data.featuredCategoryIds) ? data.featuredCategoryIds : [],
  brands: Array.isArray(data.brands) ? data.brands : [],
  coupons: Array.isArray(data.coupons) ? data.coupons : [],
  announcements: Array.isArray(data.announcements) ? data.announcements : [],
  blogs: Array.isArray(data.blogs) ? data.blogs : [],
  reviews: Array.isArray(data.reviews) ? data.reviews : [],
});

function pageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "account" && segments[1] === "orders" && segments[2] && segments[3] === "invoice") return "order-invoice";
  if (segments[0] === "account" && segments[1] === "orders" && segments[2]) return "order-details";
  if (segments[0] === "pages" && segments[1] === "order-history") return "account";
  const routes = {
    shop: "shop", wishlist: "wishlist", blog: "blog", info: "content",
    pages: "content", checkout: "checkout", account: "account",
    "order-confirmation": "order-placed", product: "product",
  };
  return segments[0]
    ? routes[segments[0]] || new URLSearchParams(window.location.search).get("page") || "home"
    : new URLSearchParams(window.location.search).get("page") || "home";
}

export default function App() {
  const [storeData, setStoreData] = useState({
    products: [],
    categories: [],
    navigationCategories: [],
    featuredCategoryIds: [],
    brands: [],
    coupons: [],
    announcements: [],
    returnExchangeEnabled: true,
    blogs: [],
    reviews: [],
  });
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const cartRef = useRef([]);
  const [cartSessionId, setCartSessionId] = useState("");
  const [cartReady, setCartReady] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const [catalogView, setCatalogView] = useState("All Products");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [contentPage, setContentPage] = useState("Our Story");
  const [contentContext, setContentContext] = useState(null);
  const [accountStartTab, setAccountStartTab] = useState("overview");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingOption, setShippingOption] = useState({
    method: "standard",
    name: "Standard Shipping",
    price: 0,
    estimatedDays: "3-5 business days",
  });

  const updateCart = (updater) => {
    const requestedCart = typeof updater === "function" ? updater(cartRef.current) : updater;
    const usedByProduct = new Map();
    const nextCart = requestedCart.filter((id) => {
      const product = storeData.products.find((item) =>
        [item.id, item._id, item.legacyId].some((productId) =>
          productId != null && String(productId) === String(id),
        ),
      );
      const stock = Number(product?.stockQty);
      if (!product || product.stockQty == null || !Number.isFinite(stock)) return true;
      const key = String(product.id ?? product._id ?? product.legacyId);
      const used = usedByProduct.get(key) || 0;
      if (used >= Math.max(0, stock)) return false;
      usedByProduct.set(key, used + 1);
      return true;
    });
    cartRef.current = nextCart;
    setCart(nextCart);
    try {
      localStorage.setItem("hwh_cart", JSON.stringify(nextCart));
    } catch (error) {
      console.warn("Could not save local cart:", error);
    }
  };

  useEffect(() => {
    try {
      const { user: stored, token } = getCustomerSession();
      localStorage.removeItem("hwh_wishlist");
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      } else {
        clearCustomerSession();
      }
    } catch (e) {
      console.warn("Could not load stored user session:", e);
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    const clearCartAfterOnlinePayment = () => updateCart([]);
    window.addEventListener("hwh-payment-order-complete", clearCartAfterOnlinePayment);
    return () => window.removeEventListener("hwh-payment-order-complete", clearCartAfterOnlinePayment);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    let active = true;
    setWishlist([]);
    if (currentUser) {
      fetchUserWishlist()
        .then((items) => { if (active) setWishlist(items); })
        .catch((error) => {
          if (!active) return;
          if (error.status === 401 || /sign in|session|account is unavailable/i.test(error.message)) {
            handleLogout();
            return;
          }
          console.warn("Could not load account wishlist:", error);
          notify(error.message || "Could not load your wishlist. Please try again.");
        });
    }
    return () => { active = false; };
  }, [sessionReady, currentUser?._id]);

  const handleAuthSuccess = (user) => {
    setWishlist([]);
    setCurrentUser(user);
    try {
      if (user) {
        saveCustomerSession(user);
      }
    } catch (e) {}
    notify(`Welcome back, ${user?.name || "Seeker"}!`);
  };

  const handleLogout = () => {
    setWishlist([]);
    setCurrentUser(null);
    try {
      clearCustomerSession();
    } catch (e) {}
    notify("You have been signed out.");
  };

  // A checkout URL can be opened directly, so enforce the same sign-in gate
  // used by the cart's checkout button after the saved session is restored.
  useEffect(() => {
    if (sessionReady && page === "checkout" && !currentUser) {
      setAuthModalOpen(true);
    }
  }, [sessionReady, page, currentUser]);

  useEffect(() => {
    if (!sessionReady || window.location.pathname !== "/pages/order-history") return;
    setAccountStartTab("orders");
    if (!currentUser) setAuthModalOpen(true);
    window.history.replaceState({ page: "account" }, "", "/account");
  }, [sessionReady, currentUser, page]);

  const startCheckout = () => {
    navigate("checkout");
    if (!currentUser) setAuthModalOpen(true);
  };

  useEffect(() => {
    let active = true;
    let hasCachedCatalog = false;
    try {
      const cachedCatalog = JSON.parse(localStorage.getItem("hwh_store_init") || "null");
      if (cachedCatalog && Array.isArray(cachedCatalog.products)) {
        setStoreData(normalizeStoreData(cachedCatalog));
        hasCachedCatalog = true;
      }
    } catch (error) {
      console.warn("Could not restore cached store data:", error);
    }

    fetchStoreInit()
      .then((data) => {
        if (!active || !data) return;
        const freshCatalog = normalizeStoreData(data);
        setStoreData(freshCatalog);
        try {
          localStorage.setItem("hwh_store_init", JSON.stringify(freshCatalog));
        } catch (error) {
          console.warn("Could not cache store data:", error);
        }
      })
      .catch((err) => {
        if (hasCachedCatalog) {
          console.warn("Store API is unavailable; showing the last saved catalog:", err);
        } else {
          console.error("Failed to load live store data:", err);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const products = storeData.products;
  const categories = storeData.categories;
  const navigationCategories = storeData.navigationCategories;
  const brands = storeData.brands;
  const coupons = storeData.coupons;
  const blogs = storeData.blogs;
  const reviews = storeData.reviews;

  useEffect(() => {
    if (!products.length || !cart.length) return;
    const keptCounts = new Map();
    const withinStock = cart.filter((id) => {
      const product = products.find((item) =>
        [item.id, item._id, item.legacyId].some((productId) =>
          productId != null && String(productId) === String(id),
        ),
      );
      const stock = Number(product?.stockQty);
      if (!product || product.stockQty == null || !Number.isFinite(stock)) return true;
      const key = String(product.id ?? product._id ?? product.legacyId);
      const kept = keptCounts.get(key) || 0;
      if (kept >= Math.max(0, stock)) return false;
      keptCounts.set(key, kept + 1);
      return true;
    });
    if (withinStock.length !== cart.length) {
      updateCart(withinStock);
      notify("Your bag was updated to match current stock levels");
    }
  }, [products, cart]);

  const selectedProduct =
    (selectedId ? products.find((product) => product.id === selectedId || product._id === selectedId || product.slug === selectedId) : null) ||
    products[0] ||
    null;

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, id) =>
          sum + (products.find((product) => product.id === id)?.price || 0),
        0,
      ),
    [cart, products],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(pageFromLocation());
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments[0] === "pages" && segments[1]) {
      setContentPage(contentLabel(segments[1]));
    }
    if (segments[0] === "product" && segments[1]) setSelectedId(decodeURIComponent(segments[1]));
    const cartParam = params.get("cart");
    if (cartParam) setCartOpen(true);

    const handlePop = () => {
      setPage(pageFromLocation());
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (segments[0] === "pages" && segments[1]) {
        setContentPage(contentLabel(segments[1]));
      }
      if (segments[0] === "product" && segments[1]) setSelectedId(decodeURIComponent(segments[1]));
    };
    window.addEventListener("popstate", handlePop);

    return () => {
      window.removeEventListener("popstate", handlePop);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const normalizeIds = (values) => (Array.isArray(values) ? values : [])
      .filter((id) => typeof id === "string" || typeof id === "number")
      .map((id) => /^\d+$/.test(String(id)) ? Number(id) : String(id));
    const sessionId = getCartSessionId("storefront");
    setCartSessionId(sessionId);

    const queryCart = new URLSearchParams(window.location.search).get("cart");
    const queryIds = queryCart ? normalizeIds(queryCart.split(",")) : [];
    const hasLocalCart = localStorage.getItem("hwh_cart") !== null;
    let localIds = [];
    try {
      localIds = normalizeIds(JSON.parse(localStorage.getItem("hwh_cart") || "[]"));
    } catch (error) {
      console.warn("Could not restore local cart:", error);
    }

    const preferredIds = queryIds.length ? queryIds : hasLocalCart ? localIds : null;
    if (preferredIds) {
      cartRef.current = preferredIds;
      setCart(preferredIds);
    }

    const restore = async () => {
      try {
        if (!preferredIds) {
          const result = await fetchCartFromBackend(sessionId);
          const restoredIds = [];
          (result?.items || []).forEach((item) => {
            const id = item.id;
            for (let i = 0; i < (item.quantity || 1); i += 1) restoredIds.push(id);
          });
          if (active && cartRef.current.length === 0 && restoredIds.length > 0) {
            cartRef.current = restoredIds;
            setCart(restoredIds);
          }
        }
      } catch (error) {
        console.warn("Could not restore cart from database:", error);
      } finally {
        if (active) setCartReady(true);
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!cartReady || !cartSessionId) return;
    const quantities = new Map();
    cart.forEach((id) => {
      const key = String(id);
      const entry = quantities.get(key) || { id: /^\d+$/.test(key) ? Number(key) : key, quantity: 0 };
      entry.quantity += 1;
      quantities.set(key, entry);
    });
    const timeout = window.setTimeout(() => {
      syncCartWithBackend({ sessionId: cartSessionId, items: [...quantities.values()] })
        .catch((error) => console.warn("Background cart sync failed:", error.message));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [cart, cartReady, cartSessionId]);

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
        const paths = {
          home: "/", shop: "/shop", wishlist: "/wishlist", blog: "/blog",
          info: `/pages/${contentSlug("Our Story")}`, content: `/pages/${contentSlug(contentPage)}`,
          checkout: "/checkout", "order-placed": "/order-confirmation", account: "/account",
        };
        const path = (next === "order-details" || next === "order-invoice") && options.orderId
          ? `/account/orders/${encodeURIComponent(options.orderId)}${next === "order-invoice" ? "/invoice" : ""}`
          : paths[next] || `/${contentSlug(next)}`;
        const url = new URL(path, window.location.origin);
        window.history.pushState({ page: next }, "", url.toString());
      } catch (e) {}
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
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const addToCart = (id, quantity = 1) => {
    const product = products.find((item) =>
      [item.id, item._id, item.legacyId].some((productId) =>
        productId != null && String(productId) === String(id),
      ),
    );
    const stock = Number(product?.stockQty);
    const inCart = cartRef.current.filter((item) => String(item) === String(id)).length;
    if (product?.stockQty != null && Number.isFinite(stock)) {
      const remaining = Math.max(0, stock - inCart);
      const requested = Math.max(1, Math.floor(Number(quantity) || 1));
      if (remaining < requested) {
        notify(remaining > 0
          ? `Only ${remaining} more available for this product`
          : "This product has reached its available stock limit");
        setCartOpen(true);
        return;
      }
    }
    if (cart.includes(id)) {
      setCartOpen(true);
      notify("This product is already in your bag");
      return;
    }
    updateCart((current) => [...current, ...Array(quantity).fill(id)]);
    notify(
      quantity > 1
        ? `${quantity} products added to your bag`
        : "Added to your bag",
    );
  };
  const toggleWish = async (id) => {
    if (!currentUser) { setAuthModalOpen(true); return; }
    const isSaved = wishlist.some((item) => String(item) === String(id));
    try {
      if (isSaved) await removeUserWishlistItem(id);
      else await addUserWishlistItem(id);
      setWishlist((current) => isSaved
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id]);
      notify(isSaved ? "Removed from wishlist" : "Saved to wishlist");
    } catch (error) {
      notify(error.message || "Could not update wishlist");
    }
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
  return (
    <div className="app-shell">
      {page !== "checkout" && <Header
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        navigate={navigate}
        openCatalog={openCatalog}
        currentPage={page}
        openCart={() => setCartOpen(true)}
        openAuthModal={() => setAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSearch={search}
        categories={categories}
        navigationCategories={navigationCategories}
        brands={brands}
        coupons={coupons}
        announcements={storeData.announcements}
      />}
      {page !== "home" && page !== "checkout" && (
        <button
          type="button"
          className="floating-back"
          onClick={() => navigate("home")}
        >
          <ArrowLeft size={16} /> Home
        </button>
      )}
      {page === "home" && (
        <StoreHomePage
          navigate={navigate}
          openCatalog={openCatalog}
          openContent={openContent}
          cart={cart}
          onAdd={addToCart}
          wished={wishlist}
          onWish={toggleWish}
          openProduct={openProduct}
          products={products}
          categories={categories}
          navigationCategories={navigationCategories}
          featuredCategoryIds={storeData.featuredCategoryIds}
          brands={brands}
          coupons={coupons}
          blogs={blogs}
          reviews={reviews}
        />
      )}
      {page === "shop" && (
        <ShopPage
          key={`${catalogView}-${catalogSearch}`}
          view={catalogView}
          initialTerm={catalogSearch}
          cart={cart}
          wished={wishlist}
          onWish={toggleWish}
          onAdd={addToCart}
          openProduct={openProduct}
          openCatalog={openCatalog}
          products={products}
          categories={categories}
          brands={brands}
        />
      )}
      {page === "product" && (
        <ProductPage
          product={selectedProduct}
          products={products}
          reviews={reviews}
          onAdd={addToCart}
          added={cart.includes(selectedProduct?.id)}
          wished={wishlist}
          onWish={toggleWish}
          cart={cart}
          openProduct={openProduct}
          openCatalog={openCatalog}
        />
      )}
      {page === "wishlist" && (
        <WishlistPage
          wished={wishlist}
          cart={cart}
          onWish={toggleWish}
          onAdd={addToCart}
          openProduct={openProduct}
          openCatalog={openCatalog}
          products={products}
        />
      )}
      {page === "blog" && <BlogPage openCatalog={openCatalog} blogs={blogs} />}
      {page === "content" && (
          <ContentPage page={contentPage} openCatalog={openCatalog} contactContext={contentContext} />
      )}
      {page === "checkout" && currentUser && (
        <CheckoutPage
          navigate={navigate}
          openContent={openContent}
          cart={cart}
          total={total}
          products={products}
          coupons={coupons}
          currentUser={currentUser}
          shippingOption={shippingOption}
          onComplete={(order) => {
            updateCart([]);
            setPlacedOrder(order);
            try {
              localStorage.setItem("hwh_last_order", JSON.stringify(order));
            } catch (e) {}
            navigate("order-placed");
            notify(`Order ${order.orderNumber} placed successfully!`);
          }}
        />
      )}
      {page === "order-placed" && (
        <OrderPlacedPage
          order={placedOrder}
          navigate={navigate}
          openContent={openContent}
          currentUser={currentUser}
        />
      )}
      {page === "order-details" && (
        <OrderPlacedPage
          order={selectedOrder}
          navigate={navigate}
          openContent={openContent}
          currentUser={currentUser}
          detailMode
        />
      )}
      {page === "order-invoice" && (
        <OrderInvoicePage order={selectedOrder} navigate={navigate} />
      )}
      {page === "account" && (
        <AccountPage
          currentUser={currentUser}
          returnExchangeEnabled={storeData.returnExchangeEnabled !== false}
          initialTab={accountStartTab}
          onLogout={handleLogout}
          navigate={navigate}
          openContent={openContent}
          openAuthModal={() => setAuthModalOpen(true)}
          notify={notify}
          onViewOrder={(order) => {
            setSelectedOrder(order);
            navigate("order-details", { orderId: order.orderNumber || order._id });
          }}
        />
      )}
      {page !== "checkout" && <Footer
        navigate={navigate}
        openCatalog={openCatalog}
        categories={navigationCategories}
        openContent={openContent}
        openOrderHistory={openOrderHistory}
        openAuthModal={() => {
          if (currentUser) {
            navigate("account");
          } else {
            setAuthModalOpen(true);
          }
        }}
      />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          products={products}
          coupons={coupons}
          currentUser={currentUser}
          shippingOption={shippingOption}
          onSelectShipping={setShippingOption}
          close={() => setCartOpen(false)}
          remove={(id) =>
            updateCart((current) => current.filter((item) => String(item) !== String(id)))
          }
          changeQuantity={(id, change) => {
            const currentQuantity = cartRef.current.filter((item) => String(item) === String(id)).length;
            const product = products.find((item) => [item.id, item._id, item.legacyId].some((productId) => productId != null && String(productId) === String(id)));
            const stock = Number(product?.stockQty);
            if (change > 0 && product?.stockQty != null && Number.isFinite(stock) && currentQuantity >= stock) {
              notify("You have reached the available stock limit for this product");
              return;
            }
            updateCart((current) => {
              if (change > 0) return [...current, id];
              const index = current.findLastIndex((item) => String(item) === String(id));
              return index === -1 ? current : current.filter((_, itemIndex) => itemIndex !== index);
            });
          }}
          checkout={startCheckout}
          onAdd={addToCart}
          notify={notify}
        />
      )}
      {toast && typeof document !== "undefined" && createPortal(
        <div className="toast" role="status" aria-live="polite">
          <Check size={16} />
          {toast}
        </div>,
        document.body,
      )}
    </div>
  );
}
