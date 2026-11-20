import { Plus } from "lucide-react";
import { cartListPrice, formatPrice } from "./cart-utils";

/**
 * Compact recommended-product card with prices and an add-to-cart button.
 * @param {object} props
 * @param {object} props.product Product to recommend.
 * @param {(id: string|number) => void} props.onAdd Adds the product to the cart.
 */
export function CartRecommendationCard({ product, onAdd }) {
  const orig = cartListPrice(product);
  const price = Number(product.price);

  return (
    <div className="cart-rec-card">
      <img
        src={product.image}
        alt={product.title}
        className="cart-rec-thumb"
      />
      <div className="cart-rec-info">
        <h4 className="cart-rec-title" title={product.title}>
          {product.title}
        </h4>
        <div className="cart-rec-pricing">
          {orig > price && (
            <span className="cart-rec-strike">
              {formatPrice(orig)}
            </span>
          )}
          <span className="cart-rec-price">
            {formatPrice(price)}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="cart-rec-add-btn"
        onClick={() =>
          onAdd(product.id || product.legacyId)
        }
        aria-label={`Add ${product.title} to cart`}
        title="Add to cart"
      >
        <Plus size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}
