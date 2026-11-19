const config = require("../config");

const STORE_TIME_ZONE = config.storeTimeZone;

function dateInStoreTimeZone(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isCouponExpired(expiresAt, now = new Date()) {
  if (!expiresAt) return false;
  const expiration = new Date(expiresAt);
  if (Number.isNaN(expiration.getTime())) return true;

  // Admin date inputs are stored as UTC dates; compare calendar dates so a
  // coupon remains valid through its expiry date in the store's time zone.
  return expiration.toISOString().slice(0, 10) < dateInStoreTimeZone(now);
}

module.exports = { isCouponExpired };
