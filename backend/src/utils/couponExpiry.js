const config = require("../config");
const { dateKeyInTimeZone } = require("./dateTime");

const STORE_TIME_ZONE = config.storeTimeZone;

function isCouponExpired(expiresAt, now = new Date()) {
  if (!expiresAt) return false;
  const expiration = new Date(expiresAt);
  if (Number.isNaN(expiration.getTime())) return true;

  // Admin date inputs are stored as UTC dates; compare calendar dates so a
  // coupon remains valid through its expiry date in the store's time zone.
  return expiration.toISOString().slice(0, 10) < dateKeyInTimeZone(now, STORE_TIME_ZONE);
}

module.exports = { isCouponExpired };
