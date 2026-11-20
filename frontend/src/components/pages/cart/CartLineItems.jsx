import { CartLineItem } from "./CartLineItem";

/**
 * Scrollable list of the cart's line items.
 * @param {object} props
 * @param {object[]} props.items Line items from `buildCartLineItems`.
 * @param {{start: string, end: string}} props.deliveryDates Estimated delivery window.
 * @param {(id: string|number, change: number) => void} props.onChangeQuantity Changes a quantity by ±1.
 * @param {(id: string|number) => void} props.onRemove Removes a product.
 */
export function CartLineItems({ items, deliveryDates, onChangeQuantity, onRemove }) {
  return (
    <div className="cart-items-scroll">
      {items.map((item) => (
        <CartLineItem
          key={item.product.id || item.product._id}
          item={item}
          deliveryDates={deliveryDates}
          onChangeQuantity={onChangeQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
