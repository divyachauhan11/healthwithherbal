import { isProductPaused } from "./product-utils";

/**
 * Active/Paused pill with a tooltip explaining storefront visibility.
 * @param {{product: Object}} props
 */
export function ProductStatusBadge({ product }) {
  const isPaused = isProductPaused(product);
  return (
    <span
      className={`status ${isPaused ? "paused" : ""}`}
      title={
        isPaused
          ? "Paused / Hidden from customer storefront. Click 3 dots to unhide."
          : "Active and visible in storefront. Click 3 dots to hide."
      }
    >
      {isPaused ? "Paused" : "Active"}
    </span>
  );
}
