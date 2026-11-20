import { CartAppliedCoupon } from "./CartAppliedCoupon";
import { CartCouponOffers } from "./CartCouponOffers";
import { CartSubmodal } from "./CartSubmodal";

/**
 * "Discount" panel: code entry, validation message, the active coupon and
 * the available offers.
 * @param {object} props
 * @param {ReturnType<import("./useCartCoupons").useCartCoupons>} props.discount Discount state.
 * @param {() => void} props.onClose Closes the panel.
 */
export function CartDiscountPanel({ discount, onClose }) {
  const {
    discountInput,
    setDiscountInput,
    appliedCoupon,
    discountMsg,
    validatingCoupon,
    availableCoupons,
    applyCoupon,
    removeCoupon,
  } = discount;

  return (
    <CartSubmodal title="Discount" onClose={onClose}>
      <div className="cart-discount-input-row">
        <input
          type="text"
          className="cart-discount-input"
          placeholder="Please enter discount code"
          value={discountInput}
          onChange={(e) => setDiscountInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyCoupon();
          }}
        />
        <button
          type="button"
          className="cart-discount-apply-btn"
          onClick={() => applyCoupon()}
          disabled={validatingCoupon}
        >
          {validatingCoupon ? "Applying..." : "Apply"}
        </button>
      </div>

      {discountMsg.text && (
        <div className={`cart-discount-alert ${discountMsg.type}`}>
          {discountMsg.text}
        </div>
      )}

      {appliedCoupon && (
        <CartAppliedCoupon coupon={appliedCoupon} onRemove={removeCoupon} />
      )}

      {availableCoupons.length > 0 && (
        <CartCouponOffers
          offers={availableCoupons}
          appliedCode={appliedCoupon?.code}
          onApply={applyCoupon}
        />
      )}
    </CartSubmodal>
  );
}
