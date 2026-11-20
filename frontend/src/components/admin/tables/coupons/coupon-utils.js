import { currency } from "../../global/admin-utils";
import { toCalendarDateKey } from "../shared/date-utils";

const STORE_TIME_ZONE = process.env.NEXT_PUBLIC_STORE_TIME_ZONE || "Asia/Kolkata";

/**
 * Calendar date ("YYYY-MM-DD") of a moment in the store's time zone.
 * @param {Date} date
 * @returns {string}
 */
export const storeCalendarDate = (date) => toCalendarDateKey(date, STORE_TIME_ZONE);

/**
 * Whether a coupon's expiry date is before today (store time zone).
 * @param {string|Date} [expiresAt]
 * @returns {boolean}
 */
export const isCouponExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return false;
  return expiryDate.toISOString().slice(0, 10) < storeCalendarDate(new Date());
};

/**
 * Coupon status label: Expired, Active or Paused.
 * @param {Object} coupon
 * @returns {string}
 */
export const getCouponStatus = (coupon) => {
  const expired = isCouponExpired(coupon.expiresAt);
  return expired
    ? "Expired"
    : coupon.isActive
      ? "Active"
      : "Paused";
};

/**
 * Discount value: "10%" for percent coupons, else a currency amount.
 * @param {Object} coupon
 * @returns {string}
 */
export const formatCouponValue = (coupon) =>
  coupon.discountType === "percent"
    ? `${coupon.discountValue}%`
    : currency(coupon.discountValue);

/**
 * Usage count, with the limit when there is one ("3 / 100").
 * @param {Object} coupon
 * @returns {string}
 */
export const formatCouponUsage = (coupon) =>
  `${coupon.usedCount || 0}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}`;
