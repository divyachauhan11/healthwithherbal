import { couponOffLabel } from "./cart-utils";

/**
 * Pill showing the active coupon with a remove button.
 * @param {object} props
 * @param {{code: string, discountType: string, discountValue: number}} props.coupon Applied coupon.
 * @param {() => void} props.onRemove Removes the coupon.
 */
export function CartAppliedCoupon({ coupon, onRemove }) {
  return (
    <div className="cart-applied-coupon-pill">
      <span>
        Active: <strong>{coupon.code}</strong> (
        {couponOffLabel(coupon, "FREE SHIPPING")}
        )
      </span>
      <button
        type="button"
        className="cart-remove-coupon-btn"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}
