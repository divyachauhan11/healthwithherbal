/**
 * "Available offers" coupon chips; clicking one applies it.
 * @param {object} props
 * @param {object[]} props.coupons Store coupons.
 * @param {(code: string) => void} props.onApply Applies a coupon code.
 */
export function CheckoutCouponOffers({ coupons, onApply }) {
  return (
    <div className="checkout-coupon-suggestions">
      <span className="checkout-coupon-suggestions-label">
        Available offers:
      </span>
      <div className="checkout-coupon-chips">
        {coupons.map((c) => (
          <button
            key={c._id || c.code}
            type="button"
            className="checkout-coupon-chip"
            onClick={() => onApply(c.code)}
          >
            {c.code}
          </button>
        ))}
      </div>
    </div>
  );
}
