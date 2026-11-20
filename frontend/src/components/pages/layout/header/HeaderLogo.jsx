"use client";
import { LOGO_URL } from "@/lib/store-data";

/**
 * Site logo button. If the logo image fails to load it is hidden and the
 * text fallback is shown instead.
 * @param {{onClick: () => void}} props
 */
export function HeaderLogo({ onClick }) {
  return (
    <button
      type="button"
      className="brandmark logo-brandmark"
      onClick={onClick}
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
  );
}
