"use client";
import { Leaf } from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";

/**
 * Shown in the results grid when no product matches the filters.
 * @param {{onReset: () => void}} props
 */
export function ShopEmptyState({ onReset }) {
  return (
    <div className="empty-state">
      <Leaf size={40} />
      <h3>No remedies found</h3>
      <p>Try clearing filters or search with another herbal term.</p>
      <AppButton onClick={onReset}>Reset all filters</AppButton>
    </div>
  );
}
