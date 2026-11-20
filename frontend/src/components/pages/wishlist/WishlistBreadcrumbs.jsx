"use client";
import { ChevronRight } from "lucide-react";

/**
 * "Home > Wishlist" breadcrumb trail.
 */
export function WishlistBreadcrumbs() {
  return (
    <div className="breadcrumbs">
      Home <ChevronRight size={13} /> Wishlist
    </div>
  );
}
