import { Sparkles } from "lucide-react";
import { OrderHeroMedia } from "./OrderHeroMedia";
import { OrderReferenceBadge } from "./OrderReferenceBadge";
import { getOrderHeroCopy } from "./order-utils";

/**
 * Top banner of the order confirmation / details page: product artwork,
 * eyebrow, heading and subtitle (adapted to the PayU result and page mode)
 * and the order reference badge.
 * @param {object} props
 * @param {object} props.order Order being shown.
 * @param {boolean} props.detailMode Order details mode instead of confirmation.
 * @param {""|"success"|"failed"|"pending"} props.paymentResult PayU payment result.
 * @param {boolean} props.copied The order reference was just copied.
 * @param {() => void} props.onCopyOrderNumber Copies the order reference.
 */
export function OrderConfirmationHero({
  order,
  detailMode,
  paymentResult,
  copied,
  onCopyOrderNumber,
}) {
  const { title, subtitle } = getOrderHeroCopy(paymentResult, detailMode);

  return (
    <div className="order-placed-hero">
      <OrderHeroMedia items={order.items} />
      <span className="order-placed-eyebrow">
        <Sparkles size={14} />{" "}
        {detailMode ? "ORDER DETAILS" : "ORDER CONFIRMED"}
      </span>
      <h1 className="order-placed-title">
        {title}
      </h1>
      <p className="order-placed-subtitle">
        {subtitle}
      </p>

      <OrderReferenceBadge
        orderNumber={order.orderNumber}
        createdAt={order.createdAt}
        copied={copied}
        onCopy={onCopyOrderNumber}
      />
    </div>
  );
}
