/**
 * "Price Details" lines: MRP, MRP discount, coupon, shipping and total.
 * @param {object} props
 * @param {number} props.itemCount Units in the order.
 * @param {{totalMrp: number, mrpSavings: number, discountAmount: number, shippingFee: number, finalTotal: number}} props.totals Order totals.
 * @param {object|null} props.appliedCoupon Applied coupon, if any.
 * @param {string} [props.shippingLabel] Shipping option name.
 * @param {() => void} props.onApplyCouponClick Focuses the coupon input.
 */
export function CheckoutPriceDetails({
  itemCount,
  totals,
  appliedCoupon,
  shippingLabel,
  onApplyCouponClick,
}) {
  const { totalMrp, mrpSavings, discountAmount, shippingFee, finalTotal } = totals;

  return (
    <div className="summary-lines">
      <h3 className="summary-lines-title">
        Price Details ({itemCount}{" "}
        {itemCount === 1 ? "Item" : "Items"})
      </h3>
      <div className="summary-line-row">
        <span>Total MRP</span>
        <b>₹{totalMrp.toFixed(2)}</b>
      </div>

      <div className="summary-line-row discount-row">
        <span>Discount on MRP</span>
        <b>-₹{mrpSavings.toFixed(2)}</b>
      </div>

      <div className="summary-line-row coupon-discount-row">
        <span>Coupon Discount</span>
        {appliedCoupon ? (
          <b>
            {discountAmount > 0
              ? `-₹${discountAmount.toFixed(2)}`
              : appliedCoupon.discountType === "free_shipping"
                ? "Free shipping"
                : "Applied"}
          </b>
        ) : (
          <button
            type="button"
            onClick={onApplyCouponClick}
          >
            Apply Coupon
          </button>
        )}
      </div>

      <div className="summary-line-row">
        <span>{shippingLabel || "Shipping"}</span>
        <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}</b>
      </div>

      <div className="summary-line-row total-row">
        <span>Total Amount</span>
        <b>₹{finalTotal.toFixed(2)}</b>
      </div>
    </div>
  );
}
