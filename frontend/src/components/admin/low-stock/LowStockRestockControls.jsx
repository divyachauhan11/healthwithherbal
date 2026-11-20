import { Loader2 } from "lucide-react";

/**
 * Quick restock buttons (+10, +25) and an input to set an exact stock quantity.
 * @param {{
 *   product: object, isRestocking: boolean, customValue: string|undefined,
 *   onQuickRestock: (productId: string, amount: number) => void,
 *   onCustomValueChange: (productId: string, value: string) => void,
 *   onSetExactStock: (productId: string) => void
 * }} props
 */
export function LowStockRestockControls({
  product,
  isRestocking,
  customValue,
  onQuickRestock,
  onCustomValueChange,
  onSetExactStock,
}) {
  return (
    <div className="low-stock-restock-controls">
      {[10, 25].map((amount) => (
        <button
          key={amount}
          type="button"
          className="outline low-stock-restock-button"
          disabled={isRestocking}
          onClick={() => onQuickRestock(product._id, amount)}
          title={`Add ${amount} units`}
        >
          +{amount}
        </button>
      ))}
      <div className="low-stock-exact-controls">
        <input
          type="number"
          min="0"
          placeholder="Set"
          value={customValue ?? ""}
          onChange={(event) => onCustomValueChange(product._id, event.target.value)}
          className="low-stock-quantity-input"
          aria-label={`Set stock quantity for ${product.title}`}
        />
        <button
          type="button"
          className="primary low-stock-set-button"
          disabled={
            isRestocking ||
            customValue === undefined ||
            customValue === ""
          }
          onClick={() => onSetExactStock(product._id)}
        >
          {isRestocking ? (
            <Loader2 size={12} className="spin-animate" />
          ) : "Set"}
        </button>
      </div>
    </div>
  );
}
