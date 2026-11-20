import { OrderItemThumbnail } from "./OrderItemThumbnail";

/**
 * Preview of an order's first product, shown while its card is collapsed.
 * @param {object} props
 * @param {object} [props.item] First order line.
 */
export function OrderCollapsedProduct({ item }) {
  return (
    <div className="order-collapsed-product">
      <OrderItemThumbnail
        item={item}
        className="order-item-img-placeholder order-collapsed-product-image"
      />
      <div className="order-collapsed-product-info">
        <strong>{item?.title || item?.product?.title || "Ordered product"}</strong>
        <span>{item?.brand || item?.product?.brand || "Health with Herbal"}</span>
        <small>Qty: {item?.quantity || 1}</small>
      </div>
    </div>
  );
}
