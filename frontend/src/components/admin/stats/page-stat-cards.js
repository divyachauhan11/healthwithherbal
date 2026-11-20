import { ADMIN_PAGE_IDS } from "@/constants/admin-pages";
import { getBrandStatCards } from "./brand-stat-cards";
import { getCategoryStatCards } from "./category-stat-cards";
import { getCustomerStatCards } from "./customer-stat-cards";
import { getDashboardStatCards } from "./dashboard-stat-cards";
import { getLowStockStatCards } from "./low-stock-stat-cards";
import { getOrderStatCards } from "./order-stat-cards";
import { getProductStatCards } from "./product-stat-cards";
import { getReturnStatCards } from "./return-stat-cards";
import { getReviewStatCards } from "./review-stat-cards";

const STAT_CARD_BUILDERS = new Map([
  [ADMIN_PAGE_IDS.DASHBOARD, getDashboardStatCards],
  [ADMIN_PAGE_IDS.RETURNS_EXCHANGES, getReturnStatCards],
  [ADMIN_PAGE_IDS.LOW_STOCK, getLowStockStatCards],
  [ADMIN_PAGE_IDS.PRODUCTS, getProductStatCards],
  [ADMIN_PAGE_IDS.ORDERS, getOrderStatCards],
  [ADMIN_PAGE_IDS.REVIEWS, getReviewStatCards],
  [ADMIN_PAGE_IDS.CUSTOMERS, getCustomerStatCards],
  [ADMIN_PAGE_IDS.CATEGORIES, getCategoryStatCards],
  [ADMIN_PAGE_IDS.BRANDS, getBrandStatCards],
]);

/**
 * Stat cards for an admin page (empty for pages without statistics).
 * @param {string} page Admin page id.
 * @param {Object} context Values the page's cards are built from (stats, rows, handlers...).
 * @returns {Array<Object>} StatCard props.
 */
export function getPageStatCards(page, context) {
  const buildCards = STAT_CARD_BUILDERS.get(page);
  return buildCards ? buildCards(context) : [];
}
