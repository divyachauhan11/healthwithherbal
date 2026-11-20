import { Leaf, Lock, Truck } from "lucide-react";

const TRUST_BADGES = [
  { Icon: Leaf, label: "100% Herbal Purity" },
  { Icon: Truck, label: "Safe Doorstep Delivery" },
  { Icon: Lock, label: "Secure Checkout" },
];

/** Row of trust guarantees shown under the payment options. */
export function CheckoutTrustBadges() {
  return (
    <div className="checkout-trust-guarantee">
      {TRUST_BADGES.map(({ Icon, label }) => (
        <div className="guarantee-item" key={label}>
          <Icon size={16} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
