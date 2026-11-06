"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { fetchStoreInit, fetchCartFromBackend } from "../lib/api";
import { Header, AuthModal, CartDrawer, Footer } from "../components/global";
import {
  BlogPage,
  HomePage as StoreHomePage,
  ShopPage,
  ProductPage,
  WishlistPage,
  InfoPage,
  ContentPage,
  CheckoutPage,
  AccountPage,
  OrderPlacedPage,
} from "../components/custom";

const contentSlug = (value) =>
  String(value || "our-story")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const contentPages = ["Our Story", "Contact Us", "Order History", "Shipping Policy", "Returns & Refunds", "Privacy Policy", "Terms & Conditions"];
const contentLabel = (slug) => contentPages.find((label) => contentSlug(label) === slug) || slug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

function pageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  const routes = {
    shop: "shop", wishlist: "wishlist", blog: "blog", info: "info",
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
    brands: [],
    coupons: [],
    announcements: [],
    blogs: [],
    reviews: [],
  });
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const [catalogView, setCatalogView] = useState("All Products");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [contentPage, setContentPage] = useState("Our Story");
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwh_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load stored user session:", e);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem("hwh_user", JSON.stringify(user));
      }
    } catch (e) {}
    notify(`Welcome back, ${user?.name || "Seeker"}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("hwh_user");
    } catch (e) {}
    notify("You have been signed out.");
  };

  useEffect(() => {
    let active = true;
    fetchStoreInit()
      .then((data) => {
        if (!active || !data) return;
        setStoreData({
          products: Array.isArray(data.products) ? data.products : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          brands: Array.isArray(data.brands) ? data.brands : [],
          coupons: Array.isArray(data.coupons) ? data.coupons : [],
          announcements: Array.isArray(data.announcements) ? data.announcements : [],
          blogs: Array.isArray(data.blogs) ? data.blogs : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        });
      })
      .catch((err) => {
        console.error("Failed to load live store data:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const products = storeData.products;
  const categories = storeData.categories;
  const brands = storeData.brands;
  const coupons = storeData.coupons;
  const blogs = storeData.blogs;
  const reviews = storeData.reviews;

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
    if (cartParam) {
      const ids = cartParam
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      if (ids.length > 0) {
        setCart(ids);
        setCartOpen(true);
        return;
      }
    }

    const handlePop = () => {
      setPage(pageFromLocation());
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (segments[0] === "pages" && segments[1]) {
        setContentPage(contentLabel(segments[1]));
      }
      if (segments[0] === "product" && segments[1]) setSelectedId(decodeURIComponent(segments[1]));
    };
    window.addEventListener("popstate", handlePop);

    // Restore cart from MongoDB backend session
    const sessionId = localStorage.getItem("hwh_cart_session");
    if (sessionId) {
      fetchCartFromBackend(sessionId)
        .then((res) => {
          if (res?.items && res.items.length > 0) {
            const loadedIds = [];
            res.items.forEach((item) => {
              for (let i = 0; i < (item.quantity || 1); i++) {
                loadedIds.push(item.id);
              }
            });
            if (loadedIds.length > 0) {
              setCart(loadedIds);
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("popstate", handlePop);
    };
  }, []);

  const navigate = (next) => {
    if (next === "cart") {
      setCartOpen(true);
      return;
    }
    setPage(next);
    setCartOpen(false);
    if (typeof window !== "undefined") {
      try {
        const paths = {
          home: "/", shop: "/shop", wishlist: "/wishlist", blog: "/blog",
          info: "/info", content: `/pages/${contentSlug(contentPage)}`,
          checkout: "/checkout", "order-placed": "/order-confirmation", account: "/account",
        };
        const url = new URL(paths[next] || `/${contentSlug(next)}`, window.location.origin);
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
  const openContent = (next) => {
    setContentPage(next);
    setPage("content");
    setCartOpen(false);
    window.history.pushState({ page: "content", contentPage: next }, "", `/pages/${contentSlug(next)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const addToCart = (id, quantity = 1) => {
    if (cart.includes(id)) {
      setCartOpen(true);
      notify("This product is already in your bag");
      return;
    }
    setCart((current) => [...current, ...Array(quantity).fill(id)]);
    notify(
      quantity > 1
        ? `${quantity} products added to your bag`
        : "Added to your bag",
    );
  };
  const toggleWish = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    notify(
      wishlist.includes(id) ? "Removed from wishlist" : "Saved to wishlist",
    );
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
      <Header
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
        brands={brands}
        coupons={coupons}
        announcements={storeData.announcements}
      />
      {page !== "home" && (
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
          cart={cart}
          onAdd={addToCart}
          wished={wishlist}
          onWish={toggleWish}
          openProduct={openProduct}
          products={products}
          categories={categories}
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
      {page === "info" && <InfoPage />}
      {page === "content" && (
        <ContentPage page={contentPage} openCatalog={openCatalog} />
      )}
      {page === "checkout" && (
        <CheckoutPage
          cart={cart}
          total={total}
          products={products}
          coupons={coupons}
          currentUser={currentUser}
          onComplete={(order) => {
            setCart([]);
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
          currentUser={currentUser}
        />
      )}
      {page === "account" && (
        <AccountPage
          currentUser={currentUser}
          onLogout={handleLogout}
          navigate={navigate}
          openAuthModal={() => setAuthModalOpen(true)}
          notify={notify}
        />
      )}
      <Footer
        navigate={navigate}
        openCatalog={openCatalog}
        openContent={openContent}
        openAuthModal={() => {
          if (currentUser) {
            navigate("account");
          } else {
            setAuthModalOpen(true);
          }
        }}
      />

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
          close={() => setCartOpen(false)}
          remove={(id) =>
            setCart((current) => current.filter((item) => item !== id))
          }
          changeQuantity={(id, change) =>
            setCart((current) => {
              if (change > 0) return [...current, id];
              const index = current.lastIndexOf(id);
              return index === -1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index);
            })
          }
          checkout={() => navigate("checkout")}
          onAdd={(id) => {
            setCart((current) => [...current, id]);
            notify("Item added to cart");
          }}
          notify={notify}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
