"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Menu,
  Search,
  ShoppingBag,
  Heart,
  X,
} from "lucide-react";
import { LOGO_URL } from "../../lib/store-data";
import { AnnouncementMarquee } from "./announcement-marquee";
export function Header({
  cartCount,
  wishlistCount,
  navigate,
  openCatalog,
  currentPage,
  openCart,
  openAuthModal,
  currentUser,
  onLogout,
  onSearch,
  categories = [],
  brands: brandsProp = [],
  announcements = [],
}) {
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMegaMenu, setActiveMegaMenu] = useState("");
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState("");

  const activeBrands = brandsProp.length
    ? brandsProp
        .map((b) => (typeof b === "string" ? b : b?.name || ""))
        .filter(Boolean)
    : [];
  const activeCategories = categories
    .map((category) =>
      typeof category === "string" ? { name: category, type: "form" } : category,
    )
    .filter((category) => category?.name);
  const submitSearch = (event) => {
    event.preventDefault();
    onSearch(query);
    setSearchOpen(false);
  };
  return (
    <>
      <AnnouncementMarquee announcements={announcements} />

      <header className="site-header">
        <div className="header-main page-width">
          <button
            type="button"
            className="mobile-trigger"
            onClick={() => setMobile(true)}
            aria-label="Open mobile menu"
          >
            <Menu />
          </button>

          <button
            type="button"
            className="brandmark logo-brandmark"
            onClick={() => navigate("home")}
          >
            <img
              src={LOGO_URL}
              alt="Health With Herbal - The art of healthy Living"
              className="site-logo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback =
                  e.currentTarget.parentElement?.querySelector(
                    ".fallback-text",
                  );
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span className="fallback-text" style={{ display: "none" }}>
              <strong>Health with Herbal</strong>
              <small>The art of healthy Living</small>
            </span>
          </button>

          <form className="header-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search remedies, brands, concerns..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="header-actions">
            <button
              type="button"
              className="icon-action mobile-search"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <Search />
            </button>
            <button
              type="button"
              className="icon-action"
              onClick={() => {
                if (currentUser) {
                  navigate("account");
                } else {
                  openAuthModal();
                }
              }}
              aria-label={
                currentUser
                  ? `View Account for ${currentUser.name}`
                  : "Account Login / Signup"
              }
              title={
                currentUser
                  ? `Signed in as ${currentUser.name} • View My Account`
                  : "Login / Create Account"
              }
            >
              <CircleUserRound />
              <span>
                {currentUser
                  ? currentUser.name.trim().split(" ")[0]
                  : "Account"}
              </span>
            </button>
            <button
              type="button"
              className="icon-action count-wrap"
              onClick={() => navigate("wishlist")}
            >
              <Heart />
              <span>Wishlist</span>
              {wishlistCount > 0 && <b>{wishlistCount}</b>}
            </button>
            <button
              type="button"
              className="icon-action count-wrap"
              onClick={openCart}
            >
              <ShoppingBag />
              <span>Bag</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className="mobile-searchbar" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search herbal wellness..."
            />
          </form>
        )}

        <nav
          className="main-nav"
          onMouseLeave={() => setActiveMegaMenu("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveMegaMenu("");
          }}
        >
          <div className="page-width">
            <button
              type="button"
              className={currentPage === "home" ? "active" : ""}
              onMouseEnter={() => setActiveMegaMenu("")}
              onClick={() => navigate("home")}
            >
              Home
            </button>

            <div
              className={`nav-dropdown-item ${activeMegaMenu === "category" ? "open" : ""}`}
              onMouseEnter={() => setActiveMegaMenu("category")}
            >
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={activeMegaMenu === "category"}
                onFocus={() => setActiveMegaMenu("category")}
                onClick={() => {
                  openCatalog("All Products");
                  setActiveMegaMenu("");
                }}
              >
                <span>Category</span>
                <ChevronDown size={13} className="dropdown-chevron" />
              </button>
            </div>

            <div
              className={`nav-dropdown-item ${activeMegaMenu === "brand" ? "open" : ""}`}
              onMouseEnter={() => setActiveMegaMenu("brand")}
            >
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={activeMegaMenu === "brand"}
                onFocus={() => setActiveMegaMenu("brand")}
                onClick={() => {
                  openCatalog("Brands");
                  setActiveMegaMenu("");
                }}
              >
                <span>Brand</span>
                <ChevronDown size={13} className="dropdown-chevron" />
              </button>
            </div>

            <button
              type="button"
              className={currentPage === "blog" ? "active" : ""}
              onMouseEnter={() => setActiveMegaMenu("")}
              onClick={() => navigate("blog")}
            >
              Blog
            </button>

            {activeMegaMenu && (
              <div
                className="header-mega-menu"
                onMouseEnter={() =>
                  setActiveMegaMenu((current) => current || "category")
                }
              >
                <div className="header-mega-menu-heading">
                  <span>{activeMegaMenu === "brand" ? "Shop by brand" : "Shop by category"}</span>
                </div>
                <div className="header-mega-link-list">
                  {activeMegaMenu === "brand"
                    ? activeBrands.map((brand) => (
                        <button
                          type="button"
                          key={brand}
                          onMouseEnter={() => setActiveMegaMenu("brand")}
                          onClick={() => {
                            openCatalog("Brands", brand);
                            setActiveMegaMenu("");
                          }}
                        >
                          {brand}
                        </button>
                      ))
                    : activeCategories.map((category) => (
                      <button
                        type="button"
                        key={category._id || category.name}
                        onMouseEnter={() => setActiveMegaMenu("category")}
                        onClick={() => {
                          openCatalog("All Products", category.name);
                          setActiveMegaMenu("");
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobile && (
        <div className="mobile-menu">
          <div className="mobile-menu-head">
            <img
              src={LOGO_URL}
              alt="Health With Herbal"
              className="mobile-menu-logo"
            />
            <button
              type="button"
              onClick={() => setMobile(false)}
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>

          <div className="mobile-menu-links">
            <button
              type="button"
              onClick={() => {
                navigate("home");
                setMobile(false);
              }}
            >
              Home <ChevronRight size={18} />
            </button>

            <div className="mobile-brands-accordion">
              <button
                type="button"
                className="mobile-accordion-trigger"
                aria-expanded={mobileExpandedMenu === "category"}
                onClick={() =>
                  setMobileExpandedMenu(mobileExpandedMenu === "category" ? "" : "category")
                }
              >
                <span>Category</span>
                <ChevronDown size={18} />
              </button>
              {mobileExpandedMenu === "category" && (
                <div className="mobile-brands-subgrid">
                  {activeCategories.map((category) => (
                    <button
                      type="button"
                      key={category._id || category.name}
                      className="mobile-brand-pill"
                      onClick={() => {
                        openCatalog("All Products", category.name);
                        setMobile(false);
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mobile-brands-accordion">
              <button
                type="button"
                className="mobile-accordion-trigger"
                aria-expanded={mobileExpandedMenu === "brand"}
                onClick={() =>
                  setMobileExpandedMenu(mobileExpandedMenu === "brand" ? "" : "brand")
                }
              >
                <span>Brand ({activeBrands.length})</span>
                <ChevronDown size={18} />
              </button>
              {mobileExpandedMenu === "brand" && (
                <div className="mobile-brands-subgrid">
                  {activeBrands.map((brand) => (
                    <button
                      type="button"
                      key={brand}
                      className="mobile-brand-pill"
                      onClick={() => {
                        openCatalog("Brands", brand);
                        setMobile(false);
                      }}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                navigate("blog");
                setMobile(false);
              }}
            >
              Blog <ChevronRight size={18} />
            </button>

          </div>
        </div>
      )}
    </>
  );
}
