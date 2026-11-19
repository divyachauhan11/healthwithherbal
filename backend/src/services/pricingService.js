/**
 * Checks the same truthy minimum-order rule used by coupon checkout logic.
 * @param {number} subtotal Cart subtotal.
 * @param {number} minOrderAmount Coupon minimum amount.
 * @returns {boolean} Whether the subtotal meets the minimum.
 */
function meetsMinimumOrderAmount(subtotal, minOrderAmount) {
  return !minOrderAmount || subtotal >= minOrderAmount;
}

/**
 * Calculates a coupon adjustment using the existing rounding and cap rules.
 * @param {object} options Coupon and current shipping details.
 * @param {number} options.subtotal Cart subtotal.
 * @param {number} options.shipping Current shipping amount.
 * @param {string} options.discountType Coupon discount type.
 * @param {number} options.discountValue Coupon discount value.
 * @param {number} [options.maxDiscountAmount] Optional percentage cap.
 * @returns {{ discount: number, shipping: number }} Discount and adjusted shipping.
 */
function calculateCouponAdjustment({
  subtotal,
  shipping,
  discountType,
  discountValue,
  maxDiscountAmount,
}) {
  let discount = 0;
  let adjustedShipping = shipping;

  if (discountType === "percent") {
    discount = Number(((subtotal * discountValue) / 100).toFixed(2));
    if (maxDiscountAmount) {
      discount = Math.min(discount, maxDiscountAmount);
    }
  } else if (discountType === "fixed") {
    discount = Number(Math.min(discountValue, subtotal).toFixed(2));
  } else if (discountType === "free_shipping") {
    adjustedShipping = 0;
  }

  return { discount, shipping: adjustedShipping };
}

/**
 * Calculates the existing final order total with a zero floor and cent rounding.
 * @param {object} options Amounts used for the final total.
 * @param {number} options.subtotal Cart subtotal.
 * @param {number} options.discount Applied discount.
 * @param {number} options.shipping Shipping cost.
 * @returns {number} Final order total.
 */
function calculateOrderTotal({ subtotal, discount, shipping }) {
  return Number(Math.max(0, subtotal - discount + shipping).toFixed(2));
}

module.exports = {
  meetsMinimumOrderAmount,
  calculateCouponAdjustment,
  calculateOrderTotal,
};
