import { XCircle } from "lucide-react";

/** Notice shown in place of the delivery timeline when the order was cancelled. */
export function OrderCancelledNotice() {
  return (
    <div className="order-cancelled-box">
      <XCircle size={22} color="#dc2626" />
      <div>
        <strong>
          This order has been cancelled by the store administrator.
        </strong>
        <p>
          If you have any questions or require assistance, please contact
          our herbal care team.
        </p>
      </div>
    </div>
  );
}
