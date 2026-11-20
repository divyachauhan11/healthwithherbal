import { dateLabelLong } from "@/components/admin/global/admin-utils";

/**
 * Rupee amount with two decimals (non-numeric values count as 0).
 * @param {*} value
 * @returns {string} e.g. "₹729.00"
 */
export const money = (value) => `₹${(Number(value) || 0).toFixed(2)}`;

/** Long date label used on the invoice. */
export const invoiceDate = dateLabelLong;

/**
 * Invoice number: "HWH-" + the order number, or the last 8 characters of the order id.
 * @param {object} order
 * @returns {string}
 */
export const getInvoiceNumber = (order) =>
  `HWH-${order.orderNumber || String(order._id).slice(-8).toUpperCase()}`;

/**
 * Full name from the present `firstName` / `lastName` parts ("" when none).
 * @param {object} person
 * @returns {string}
 */
export const joinName = (person) => [person.firstName, person.lastName].filter(Boolean).join(" ");

/**
 * One-line address from the present street, city, state, postal code and country ("" when none).
 * @param {object} address
 * @returns {string}
 */
export const joinAddress = (address) =>
  [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ");
