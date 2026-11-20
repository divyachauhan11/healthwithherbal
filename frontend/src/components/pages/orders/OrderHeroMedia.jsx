import { CheckCircle2 } from "lucide-react";
import { orderProductImage } from "./order-utils";

/**
 * Hero artwork of the order page: the first product's image with a confirmed
 * tick and a "+N" badge for further items, or a large tick when the first
 * item has no image.
 * @param {object} props
 * @param {object[]} [props.items] Order lines.
 */
export function OrderHeroMedia({ items }) {
  const firstItemImage = orderProductImage(items?.[0]);
  const additionalItemCount = Math.max(
    0,
    (items?.length || 0) - 1,
  );

  return firstItemImage ? (
    <div className="order-placed-product-cover">
      <img
        src={firstItemImage}
        alt={
          items?.[0]?.titleSnapshot ||
          items?.[0]?.title ||
          "Ordered product"
        }
      />
      <span className="order-product-confirmed">
        <CheckCircle2 size={22} strokeWidth={2.4} />
      </span>
      {additionalItemCount > 0 && (
        <span className="order-product-more">+{additionalItemCount}</span>
      )}
    </div>
  ) : (
    <div className="order-placed-check-circle">
      <CheckCircle2 size={46} strokeWidth={2.2} />
    </div>
  );
}
