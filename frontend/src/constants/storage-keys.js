/**
 * Every browser-storage key used by the frontend. Values are persisted in
 * users' browsers, so never rename one without a migration.
 */
export const STORAGE_KEYS = Object.freeze({
  /** Customer bearer token. */
  USER_SESSION_TOKEN: "hwh_session_token",
  /** Customer profile JSON (without the token). */
  USER: "hwh_user",
  /** Anonymous cart session ID shared with the backend cart. */
  CART_SESSION: "hwh_cart_session",
  /** Cart contents: JSON array of product IDs (one entry per unit). */
  CART: "hwh_cart",
  /** Legacy local wishlist; removed on startup now that wishlists live on the server. */
  LEGACY_WISHLIST: "hwh_wishlist",
  /** Last successful `/store/init` payload, shown while the API reloads. */
  STORE_INIT_CACHE: "hwh_store_init",
  /** Most recently placed order, used by the order-confirmation page. */
  LAST_ORDER: "hwh_last_order",
  /** Anonymous visitor ID used for blog views and likes. */
  BLOG_VISITOR_ID: "hwh_blog_visitor_id",
  /** Cross-tab order status broadcast (written by admin, read by customer tabs). */
  ORDER_STATUS_UPDATE: "hwh_order_status_update",
  /** Admin bearer token. */
  ADMIN_SESSION: "hwh-admin-session",
  /** Admin profile JSON. */
  ADMIN_USER: "hwh-admin-user",
  /** Last admin portal page. */
  ADMIN_PAGE: "hwh-admin-page",
  /** Last admin portal search query. */
  ADMIN_QUERY: "hwh-admin-query",
});
