import { CartRecommendationCard } from "./CartRecommendationCard";

/**
 * Drawer side column "You'll love this too" with recommended products.
 * @param {object} props
 * @param {object[]} props.products Products to recommend.
 * @param {(id: string|number) => void} props.onAdd Adds a product to the cart.
 */
export function CartRecommendations({ products, onAdd }) {
  return (
    <div className="cart-right-column">
      <h3 className="cart-rec-heading">You&apos;ll love this too</h3>

      <div className="cart-rec-list">
        {products.map((prod) => (
          <CartRecommendationCard
            key={prod.id || prod._id}
            product={prod}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}
