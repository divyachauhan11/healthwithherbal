import { ArrowRight, FileText, ShoppingBag } from "lucide-react";

/**
 * Bottom actions of the order page: invoice (delivered orders in detail mode),
 * continue shopping and back to the account's orders.
 * @param {object} props
 * @param {boolean} props.detailMode Order details mode instead of confirmation.
 * @param {boolean} props.showInvoice Show the "Generate Invoice" button.
 * @param {() => void} props.onGenerateInvoice Opens the invoice page.
 * @param {(page: string, options?: object) => void} props.navigate Storefront navigation.
 */
export function OrderActionsRow({ detailMode, showInvoice, onGenerateInvoice, navigate }) {
  return (
    <div className="order-placed-actions-row">
      {showInvoice && (
        <button
          type="button"
          className="app-button continue-btn"
          onClick={onGenerateInvoice}
        >
          <FileText size={17} /> Generate Invoice
        </button>
      )}
      <button
        type="button"
        className="app-button continue-btn"
        onClick={() => navigate("shop")}
      >
        <ShoppingBag size={17} /> Continue Shopping
      </button>

      <button
        type="button"
        className="account-orders-cta-btn"
        onClick={() => navigate("account", { tab: "orders" })}
      >
        {detailMode ? "Back to My Orders" : "View in My Orders"}{" "}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
