import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  RotateCcw,
  Settings,
  Shield,
  Star,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { ADMIN_PAGE_IDS } from "../../../../constants/admin-pages";

/** Sidebar entries in display order: [page name, icon]. */
export const ADMIN_NAVIGATION = [
  [ADMIN_PAGE_IDS.DASHBOARD, LayoutDashboard],
  [ADMIN_PAGE_IDS.PRODUCTS, Package],
  [ADMIN_PAGE_IDS.LOW_STOCK, AlertTriangle],
  [ADMIN_PAGE_IDS.CATEGORIES, BookOpen],
  [ADMIN_PAGE_IDS.BRANDS, Star],
  [ADMIN_PAGE_IDS.COUPONS, Tag],
  [ADMIN_PAGE_IDS.REVIEWS, Star],
  [ADMIN_PAGE_IDS.ORDERS, Truck],
  [ADMIN_PAGE_IDS.PAYMENTS, CreditCard],
  [ADMIN_PAGE_IDS.RETURNS_EXCHANGES, RotateCcw],
  [ADMIN_PAGE_IDS.CUSTOMERS, Users],
  [ADMIN_PAGE_IDS.BLOGS, FileText],
  [ADMIN_PAGE_IDS.USERS, Shield],
  [ADMIN_PAGE_IDS.SETTINGS, Settings],
  [ADMIN_PAGE_IDS.PROFILE, Users],
];

/**
 * Sidebar entries the staff member may open.
 * @param {string[]|undefined} allowedPages Undefined shows every page.
 * @param {boolean} returnExchangeEnabled Hides "Returns & Exchanges" when false.
 * @returns {Array<[string, import("react").ComponentType]>}
 */
export const getVisibleNavigation = (allowedPages, returnExchangeEnabled) =>
  ADMIN_NAVIGATION.filter(
    ([label]) =>
      (label !== ADMIN_PAGE_IDS.RETURNS_EXCHANGES || returnExchangeEnabled) &&
      (!allowedPages || allowedPages.includes(label)),
  );
