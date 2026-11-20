import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "./cart-utils";
import { CartPriceBreakdown } from "./CartPriceBreakdown";

/**
 * Cart total with savings, the price breakdown toggle and the checkout button.
 * @param {object} props
 * @param {{rawMrpTotal: number, itemSavings: number, couponDiscount: number, shippingCost: number, toPay: number, totalSaved: number}} props.totals Drawer totals.
 * @param {object|null} props.appliedCoupon Applied coupon, if any.
 * @param {boolean} props.showBreakdown Whether the breakdown is expanded.
 * @param {() => void} props.onToggleBreakdown Expands/collapses the breakdown.
 * @param {() => void} props.onCheckout Starts checkout.
 */
export function CartSummary({
  totals,
  appliedCoupon,
  showBreakdown,
  onToggleBreakdown,
  onCheckout,
}) {
  const { rawMrpTotal, itemSavings, couponDiscount, shippingCost, toPay, totalSaved } = totals;

  return (
    <div className="cart-summary-section">
      <div className="cart-summary-main-row">
        <div className="cart-summary-left-labels">
          <span className="cart-total-label">Total</span>
          {totalSaved > 0 && (
            <span className="cart-savings-highlight">
              You&apos;ve saved {formatPrice(totalSaved)}!
            </span>
          )}
        </div>

        <div className="cart-summary-right-prices">
          <button
            type="button"
            className="cart-total-toggle-btn"
            onClick={onToggleBreakdown}
            aria-label="Toggle price breakdown"
          >
            <strong className="cart-total-amount">
              {formatPrice(toPay)}
            </strong>
            {showBreakdown ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          {rawMrpTotal > toPay && (
            <span className="cart-total-mrp-strike">
              {formatPrice(rawMrpTotal)}
            </span>
          )}
        </div>
      </div>

      {showBreakdown && (
        <CartPriceBreakdown
          rawMrpTotal={rawMrpTotal}
          itemSavings={itemSavings}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          shippingCost={shippingCost}
        />
      )}

      <button
        type="button"
        className="cart-primary-action-btn checkout-btn"
        onClick={onCheckout}
      >
        <span>Check out</span>
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
