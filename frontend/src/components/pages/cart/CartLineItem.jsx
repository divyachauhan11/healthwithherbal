import { Trash2 } from "lucide-react";
import { formatPrice } from "./cart-utils";
import { CartQuantityStepper } from "./CartQuantityStepper";

/**
 * One product row in the cart: thumbnail, name, delivery estimate, quantity
 * stepper, remove button and line prices.
 * @param {object} props
 * @param {{product: object, quantity: number, originalPrice: number, sellingPrice: number, weight: string}} props.item Line item.
 * @param {{start: string, end: string}} props.deliveryDates Estimated delivery window.
 * @param {(id: string|number, change: number) => void} props.onChangeQuantity Changes the quantity by ±1.
 * @param {(id: string|number) => void} props.onRemove Removes the product from the cart.
 */
export function CartLineItem({ item, deliveryDates, onChangeQuantity, onRemove }) {
  const { product, quantity, originalPrice, sellingPrice, weight } = item;

  return (
    <div className="cart-product-item">
      <img
        src={product.image}
        alt={product.title}
        className="cart-product-thumb"
      />

      <div className="cart-product-middle">
        <h4 className="cart-product-name">{product.title}</h4>
        <p className="cart-product-delivery">
          {weight}, Estimated delivery between{" "}
          {deliveryDates.start} and {deliveryDates.end}. Order
          within 29 minutes.
        </p>

        <CartQuantityStepper
          quantity={quantity}
          onDecrease={() => onChangeQuantity(product.id, -1)}
          onIncrease={() => onChangeQuantity(product.id, 1)}
        />
      </div>

      <div className="cart-product-right">
        <button
          type="button"
          className="cart-trash-btn"
          onClick={() => onRemove(product.id)}
          aria-label="Remove item"
        >
          <Trash2 size={17} />
        </button>
        <div className="cart-product-prices">
          {originalPrice > sellingPrice && (
            <span className="cart-price-strike">
              {formatPrice(originalPrice * quantity)}
            </span>
          )}
          <span className="cart-price-selling">
            {formatPrice(sellingPrice * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
