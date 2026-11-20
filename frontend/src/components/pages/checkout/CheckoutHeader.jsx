import { ShieldCheck } from "lucide-react";
import { CheckoutProgress } from "./CheckoutProgress";

/**
 * Checkout top bar: home logo button, progress steps and the security badge.
 * @param {object} props
 * @param {"address"|"payment"} props.step Current checkout step.
 * @param {() => void} props.onLogoClick Navigates home.
 */
export function CheckoutHeader({ step, onLogoClick }) {
  return (
    <header className="checkout-flow-header">
      <button
        type="button"
        className="checkout-flow-logo"
        onClick={onLogoClick}
        aria-label="Health With Herbal home"
      >
        <img src="/health-with-herbal-logo-checkout.png" alt="Health With Herbal" />
      </button>
      <CheckoutProgress step={step} />
      <span className="checkout-flow-security">
        <ShieldCheck size={20} />
        <span>100% Secure</span>
      </span>
    </header>
  );
}
