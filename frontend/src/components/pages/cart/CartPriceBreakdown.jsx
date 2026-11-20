import { formatPrice } from "./cart-utils";

/**
 * Expanded price breakdown: MRP total, product discounts, coupon and shipping.
 * @param {object} props
 * @param {number} props.rawMrpTotal MRP total of all line items.
 * @param {number} props.itemSavings MRP minus selling total.
 * @param {object|null} props.appliedCoupon Applied coupon, if any.
 * @param {number} props.couponDiscount Coupon discount amount.
 * @param {number} props.shippingCost Shipping charge (0 shows "FREE").
 */
export function CartPriceBreakdown({
  rawMrpTotal,
  itemSavings,
  appliedCoupon,
  couponDiscount,
  shippingCost,
}) {
  return (
    <div className="cart-breakdown-panel">
      <div className="cart-breakdown-row">
        <span>Original MRP Total</span>
        <span>{formatPrice(rawMrpTotal)}</span>
      </div>
      {itemSavings > 0 && (
        <div className="cart-breakdown-row discount">
          <span>Product Discounts</span>
          <span>-{formatPrice(itemSavings)}</span>
        </div>
      )}
      {appliedCoupon && (
        <div className="cart-breakdown-row discount">
          <span>Coupon ({appliedCoupon.code})</span>
          <span>-{formatPrice(couponDiscount)}</span>
        </div>
      )}
      <div className="cart-breakdown-row">
        <span>Shipping</span>
        <span>
          {shippingCost === 0
            ? "FREE"
            : formatPrice(shippingCost)}
        </span>
      </div>
    </div>
  );
}
