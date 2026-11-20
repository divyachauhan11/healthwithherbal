"use client";
import { CatalogHeading } from "@/components/pages/shared/CatalogHeading";
import {
  WishlistBreadcrumbs,
  WishlistItems,
  getWishlistProducts,
} from "@/components/pages/wishlist";

/**
 * Wishlist page: breadcrumbs, heading with the item count and the saved products.
 * @param {object} props
 * @param {Array<string|number>} props.wished Wishlist product IDs.
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.onWish
 * @param {(id: string|number) => void} props.onAdd
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} [props.openCatalog]
 * @param {Array<object>} [props.products]
 */
export function WishlistPage({
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
  products: productsProp = [],
}) {
  const wishedItems = getWishlistProducts(productsProp || [], wished);
  return (
    <main className="page-width wishlist-page" style={{ padding: "40px 0" }}>
      <WishlistBreadcrumbs />
      <CatalogHeading
        eyebrow="Your Saved Remedies"
        title="My Wishlist"
        copy="Herbal formulations and wellness essentials you've bookmarked."
      >
        {wishedItems.length} items
      </CatalogHeading>

      <WishlistItems
        items={wishedItems}
        cart={cart}
        onWish={onWish}
        onAdd={onAdd}
        openProduct={openProduct}
        openCatalog={openCatalog}
      />
    </main>
  );
}
