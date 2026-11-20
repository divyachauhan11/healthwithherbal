"use client";
import { Menu } from "lucide-react";

/**
 * Hamburger button that opens the mobile menu drawer.
 * @param {{onClick: () => void}} props
 */
export function MobileMenuTrigger({ onClick }) {
  return (
    <button
      type="button"
      className="mobile-trigger"
      onClick={onClick}
      aria-label="Open mobile menu"
    >
      <Menu />
    </button>
  );
}
