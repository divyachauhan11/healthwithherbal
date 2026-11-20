import { X } from "lucide-react";
import { appliedCouponLabel } from "./checkout-utils";

/**
 * Banner for the applied coupon with a remove button.
 * @param {object} props
 * @param {{code: string, discountType: string, discountValue: number}} props.coupon Applied coupon.
 * @param {() => void} props.onRemove Removes the coupon.
 */
export function CheckoutAppliedCoupon({ coupon, onRemove }) {
  return (
    <div className="checkout-applied-banner">
      <div>
        <span className="checkout-applied-code">
          {coupon.code}
        </span>
        <span className="checkout-applied-desc">
          {appliedCouponLabel(coupon)}
        </span>
      </div>
      <button
        type="button"
        className="checkout-coupon-remove-btn"
        onClick={onRemove}
        title="Remove coupon"
      >
        <X size={16} />
      </button>
    </div>
  );
}
