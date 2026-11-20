/**
 * Amount in the given currency with up to two decimals; falls back to a rupee string when
 * the currency code is not supported.
 * @param {number|string} amount
 * @param {string} [currency="INR"]
 * @returns {string}
 */
export const formatCustomerMoney = (amount, currency = "INR") => {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
};

/**
 * Date with a two-digit day, short month and year plus hour and minute, or "—" when missing.
 * @param {string|number|Date} [value]
 * @returns {string}
 */
export const formatCustomerDateTime = (value) => value
  ? new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "—";

/**
 * One-line customer address, or "No saved delivery address".
 * @param {object} [address]
 * @returns {string}
 */
export const formatCustomerAddress = (address) => {
  if (!address) return "No saved delivery address";
  return [
    address.street || address.address1 || address.line1,
    address.address2 || address.line2,
    address.city,
    address.state,
    address.postalCode || address.zip,
    address.country,
  ].filter(Boolean).join(", ") || "No saved delivery address";
};

/**
 * Stored line total of an order item, or unit price × quantity (at least one).
 * @param {object} item
 * @returns {number}
 */
export const getCustomerOrderItemTotal = (item) =>
  item.lineTotal ?? (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);

/**
 * Sum of the order totals.
 * @param {Array<object>} orders
 * @returns {number}
 */
export const getTotalSpent = (orders) =>
  orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
