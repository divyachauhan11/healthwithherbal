import { Package } from "lucide-react";
import { orderItemImage } from "./account-utils";

/**
 * Order line thumbnail: a package icon with the product image on top (the
 * image hides itself if it fails to load).
 * @param {object} props
 * @param {object} [props.item] Order line.
 * @param {string} [props.className] Wrapper class.
 */
export function OrderItemThumbnail({ item, className = "order-item-img-placeholder" }) {
  const image = orderItemImage(item);

  return (
    <div className={className}>
      <Package size={20} />
      {image && (
        <img
          src={image}
          alt={item?.title || "Ordered product"}
          loading="lazy"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
    </div>
  );
}
