import { currency } from "../admin-utils";

/**
 * Format human-readable singular name from kind string
 * @param {string} [kind] Admin collection, e.g. "products", "categories".
 * @returns {string}
 */
export function getKindSingular(kind = "") {
  const map = {
    products: "Product",
    categories: "Category",
    brands: "Brand",
    coupons: "Coupon",
    reviews: "Review",
    blogs: "Blog Post",
    users: "User",
    customers: "Customer",
  };
  if (map[kind]) return map[kind];
  if (kind.endsWith("ies")) return kind.slice(0, -3) + "y";
  if (kind.endsWith("s")) return kind.slice(0, -1);
  return kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : "Record";
}

/**
 * Extract display data (title, subtitle, thumbnail, badges) from any entity
 * @param {object|null} item
 * @param {string} kind
 * @returns {{title: string, subtitle: string, image: string|null, badges?: string[]}}
 */
export function getItemDetails(item, kind) {
  if (!item) return { title: "Selected Item", subtitle: "", image: null };

  let title = item.title || item.name || item.code || "Unnamed Record";
  let subtitle = "";
  let image = null;
  let badges = [];

  // Thumbnail extraction
  if (item.images && item.images.length > 0) {
    const firstImg = item.images[0];
    image = typeof firstImg === "string" ? firstImg : firstImg?.url;
  } else if (item.image) {
    image = typeof item.image === "string" ? item.image : item.image?.url;
  } else if (item.logo) {
    image = item.logo;
  } else if (item.thumbnail) {
    image = item.thumbnail;
  }

  // Kind-specific enrichments
  if (kind === "products") {
    if (item.sku) badges.push(`SKU: ${item.sku}`);
    if (item.price != null) badges.push(currency(item.price));
    if (item.category) badges.push(item.category);
    const stock = item.stockQty ?? item.stock;
    if (stock != null) badges.push(`${stock} in stock`);
  } else if (kind === "categories" || kind === "brands") {
    if (item.slug) badges.push(`/${item.slug}`);
    const count = item.productCount ?? item.count ?? 0;
    badges.push(`${count} product${count === 1 ? "" : "s"}`);
  } else if (kind === "coupons") {
    title = `Coupon: ${item.code || title}`;
    const percentOff = item.discountType === "percent"
      ? item.discountValue
      : item.discountPercent ?? item.discount;
    if (percentOff) badges.push(`${percentOff}% OFF`);
    const minSpend = item.minOrderAmount ?? item.minSpend;
    if (minSpend) badges.push(`Min: ${currency(minSpend)}`);
  } else if (kind === "reviews") {
    title = item.productId?.title
      ? `Review for "${item.productId.title}"`
      : item.title || "Customer Review";
    const author = item.userId?.name || item.name || "Verified Customer";
    subtitle = `By ${author}`;
    if (item.rating) badges.push(`${item.rating} ★`);
    if (item.comment) {
      subtitle += ` — "${item.comment.slice(0, 50)}${item.comment.length > 50 ? "…" : ""}"`;
    }
  } else if (kind === "blogs") {
    if (item.slug) badges.push(`/${item.slug}`);
    if (item.status) badges.push(item.status);
    if (item.viewsCount != null) badges.push(`${item.viewsCount} views`);
  }

  return { title, subtitle, image, badges };
}
