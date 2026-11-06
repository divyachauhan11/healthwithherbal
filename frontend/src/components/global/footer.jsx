"use client";
import { LOGO_URL } from "../../lib/store-data";
import { InstagramIcon, FacebookIcon } from "./icons";
export function Footer({ navigate, openCatalog, openContent, openAuthModal }) {
  return (
    <footer>
      <div className="page-width footer-grid">
        <div className="footer-brand">
          <div className="brandmark logo-brandmark">
            <img
              src={LOGO_URL}
              alt="Health With Herbal"
              className="site-logo-img footer-logo"
            />
          </div>
          <p>
            Authentic herbal and Ayurvedic care, selected for modern life and
            delivered worldwide.
          </p>
          <div className="footer-social">
            <button
              type="button"
              aria-label="Instagram"
              onClick={() =>
                window.open(
                  "https://www.instagram.com/",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <InstagramIcon />
            </button>
            <button
              type="button"
              aria-label="Facebook"
              onClick={() =>
                window.open(
                  "https://www.facebook.com/",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <FacebookIcon />
            </button>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          {[
            "Ayurvedic Care",
            "Herbal Care",
            "Health & Beauty",
            "OTC Medicines",
            "All Products",
          ].map((item) => (
            <button type="button" key={item} onClick={() => openCatalog(item)}>
              {item === "All Products" ? "Shop All" : item}
            </button>
          ))}
        </div>
        <div>
          <h4>Customer care</h4>
          <button type="button" onClick={openAuthModal}>
            My Account
          </button>
          <button type="button" onClick={() => openContent("Order History")}>
            Order History
          </button>
          <button type="button" onClick={() => navigate("wishlist")}>
            Wishlist
          </button>
          <button type="button" onClick={() => openContent("Shipping Policy")}>
            Shipping Policy
          </button>
          <button
            type="button"
            onClick={() => openContent("Returns & Refunds")}
          >
            Returns & Refunds
          </button>
        </div>
        <div>
          <h4>About</h4>
          {["Our Story", "Contact Us", "Privacy Policy", "Disclaimer"].map(
            (item) => (
              <button
                type="button"
                key={item}
                onClick={() => openContent(item)}
              >
                {item}
              </button>
            ),
          )}
          <button type="button" onClick={() => navigate("blog")}>
            Blog
          </button>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>© 2026 Health with Herbal. All rights reserved.</span>
        <span>Natural care, sent with love worldwide.</span>
      </div>
    </footer>
  );
}
