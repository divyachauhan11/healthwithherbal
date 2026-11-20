import { ShieldCheck } from "lucide-react";
import { CheckoutCouponCard } from "./CheckoutCouponCard";
import { CheckoutPriceDetails } from "./CheckoutPriceDetails";
import { CheckoutSubmitButton } from "./CheckoutSubmitButton";
import { CheckoutSummaryItem } from "./CheckoutSummaryItem";
import { CheckoutTermsNote } from "./CheckoutTermsNote";

/**
 * Order review sidebar: items, coupon card, price details, checkout error,
 * terms note, the primary checkout button and the packaging badge.
 * @param {object} props
 * @param {number} props.itemCount Units in the cart.
 * @param {{product: object, quantity: number}[]} props.lineItems Order line items.
 * @param {object[]} [props.coupons] Store coupons offered as chips.
 * @param {ReturnType<import("./useCheckoutCoupon").useCheckoutCoupon>} props.coupon Coupon state.
 * @param {object} props.totals Order totals (see `useCheckout`).
 * @param {string} [props.shippingLabel] Shipping option name.
 * @param {string} props.error Checkout error message.
 * @param {(label: string) => void} [props.onOpenContent] Opens a content page.
 * @param {"address"|"payment"} props.step Current checkout step.
 * @param {string} props.paymentMethod Selected payment method.
 * @param {boolean} props.submitting An order is being placed.
 * @param {boolean} props.submitDisabled Disables the checkout button.
 * @param {() => void} props.onSubmitStep Continues or submits the current step.
 */
export function CheckoutOrderSummary({
  itemCount,
  lineItems,
  coupons,
  coupon,
  totals,
  shippingLabel,
  error,
  onOpenContent,
  step,
  paymentMethod,
  submitting,
  submitDisabled,
  onSubmitStep,
}) {
  return (
    <aside className="order-summary">
      <div className="order-summary-header">
        <h2>Order Summary</h2>
        <span className="order-summary-item-count">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="summary-items-list">
        {lineItems.map(({ product, quantity }) => (
          <CheckoutSummaryItem
            key={product.id}
            product={product}
            quantity={quantity}
          />
        ))}
      </div>

      <CheckoutCouponCard coupons={coupons} coupon={coupon} />

      <CheckoutPriceDetails
        itemCount={itemCount}
        totals={totals}
        appliedCoupon={coupon.appliedCoupon}
        shippingLabel={shippingLabel}
        onApplyCouponClick={coupon.focusInput}
      />

      {error && (
        <p role="alert" className="checkout-error">
          {error}
        </p>
      )}

      <CheckoutTermsNote onOpenContent={onOpenContent} />

      <CheckoutSubmitButton
        step={step}
        paymentMethod={paymentMethod}
        total={totals.finalTotal}
        submitting={submitting}
        disabled={submitDisabled}
        onClick={onSubmitStep}
      />

      <div className="checkout-secure-badge">
        <ShieldCheck size={16} color="var(--forest)" />
        <span>Guaranteed Authentic & Discreet Packaging</span>
      </div>
    </aside>
  );
}
