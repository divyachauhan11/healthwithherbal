import { Tag } from "lucide-react";
import { CheckoutAppliedCoupon } from "./CheckoutAppliedCoupon";
import { CheckoutCouponOffers } from "./CheckoutCouponOffers";

/**
 * "Have a Coupon Code?" card: code entry with offer chips, or the applied
 * coupon banner, plus the validation message.
 * @param {object} props
 * @param {object[]} [props.coupons] Store coupons offered as chips.
 * @param {ReturnType<import("./useCheckoutCoupon").useCheckoutCoupon>} props.coupon Coupon state.
 */
export function CheckoutCouponCard({ coupons, coupon }) {
  const {
    appliedCoupon,
    codeInput,
    setCodeInput,
    inputRef,
    error,
    success,
    applyCoupon,
    removeCoupon,
  } = coupon;

  return (
    <div className="checkout-coupon-card">
      <div className="checkout-coupon-title">
        <Tag size={16} color="var(--forest)" />
        <span>Have a Coupon Code?</span>
      </div>

      {appliedCoupon ? (
        <CheckoutAppliedCoupon coupon={appliedCoupon} onRemove={removeCoupon} />
      ) : (
        <div>
          <div className="checkout-coupon-input-group">
            <input
              ref={inputRef}
              type="text"
              className="checkout-coupon-input"
              placeholder="Enter discount code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
            />
            <button
              type="button"
              className="checkout-coupon-apply-btn"
              onClick={() => applyCoupon()}
            >
              Apply
            </button>
          </div>

          {coupons && coupons.length > 0 && (
            <CheckoutCouponOffers coupons={coupons} onApply={applyCoupon} />
          )}
        </div>
      )}

      {error && (
        <p className="checkout-coupon-msg error">{error}</p>
      )}
      {success && (
        <p className="checkout-coupon-msg success">{success}</p>
      )}
    </div>
  );
}
