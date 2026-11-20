"use client";
import { ArrowLeft } from "lucide-react";

/**
 * Floating "Home" back button shown on every page except home and checkout.
 * @param {{onClick: () => void}} props
 */
export function FloatingHomeButton({ onClick }) {
  return (
    <button
      type="button"
      className="floating-back"
      onClick={onClick}
    >
      <ArrowLeft size={16} /> Home
    </button>
  );
}
