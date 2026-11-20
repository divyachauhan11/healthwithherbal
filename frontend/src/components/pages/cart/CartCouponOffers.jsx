import { Tag } from "lucide-react";
import { couponOffLabel } from "./cart-utils";

/**
 * "Available Offers" chips; clicking one applies that coupon.
 * @param {object} props
 * @param {object[]} props.offers Offers from `toCouponOffers`.
 * @param {string|undefined} props.appliedCode Code of the applied coupon.
 * @param {(code: string) => void} props.onApply Applies a coupon code.
 */
export function CartCouponOffers({ offers, appliedCode, onApply }) {
  return (
    <div className="cart-available-offers-section">
      <span className="cart-offers-heading">
        Available Offers ({offers.length}):
      </span>
      <div className="cart-offers-chips-list">
        {offers.map((c) => {
          const isCurr = appliedCode === c.code;
          return (
            <button
              key={c.code}
              type="button"
              className={`cart-offer-chip ${isCurr ? "active" : ""}`}
              onClick={() => onApply(c.code)}
              title={c.description}
            >
              <Tag size={12} />
              <strong>{c.code}</strong>
              <small>
                (
                {couponOffLabel(c, "FREE SHIP")}
                )
              </small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
