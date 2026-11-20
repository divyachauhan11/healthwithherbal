"use client";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";
import { isProductOutOfStock } from "@/components/pages/shared/product-utils";
import { QuantityStepper } from "./QuantityStepper";

/**
 * Quantity stepper, "Add to bag" button (with the line total) and wishlist toggle.
 * @param {object} props
 * @param {object} props.product
 * @param {number} props.quantity
 * @param {(quantity: number) => void} props.setQuantity
 * @param {number} props.maxAddQuantity Units that can still be added.
 * @param {boolean} props.added Whether the product is already in the bag.
 * @param {(id: string|number, quantity: number) => void} props.onAdd
 * @param {Array<string|number>} props.wished Wishlist product IDs.
 * @param {(id: string|number) => void} props.onWish
 */
export function ProductPurchaseRow({
  product,
  quantity,
  setQuantity,
  maxAddQuantity,
  added,
  onAdd,
  wished,
  onWish,
}) {
  return (
    <div className="purchase-row">
      <QuantityStepper
        quantity={quantity}
        onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
        onIncrease={() => setQuantity(Math.min(maxAddQuantity, quantity + 1))}
        increaseDisabled={quantity >= maxAddQuantity}
      />
      <AppButton
        className={`add-detail ${added ? "already-added" : ""}${isProductOutOfStock(product) ? " out-of-stock-detail" : ""}`}
        onClick={() => onAdd(product.id, quantity)}
        disabled={added || maxAddQuantity <= 0}
      >
        {added ? <Check size={17} /> : <ShoppingBag size={17} />}{" "}
        {added
          ? "Already in your bag"
          : maxAddQuantity <= 0
            ? "OUT OF STOCK"
            : `Add to bag · ₹${(product.price * quantity).toFixed(2)}`}
      </AppButton>
      <AppButton
        variant="outline"
        className="detail-wish"
        onClick={() => onWish(product.id)}
      >
        <Heart
          size={18}
          fill={wished.includes(product.id) ? "currentColor" : "none"}
        />
      </AppButton>
    </div>
  );
}
