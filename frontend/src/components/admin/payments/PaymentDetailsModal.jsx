"use client";

import { createPortal } from "react-dom";
import { PaymentCustomerSection } from "./PaymentCustomerSection";
import { PaymentDetailHeader } from "./PaymentDetailHeader";
import { PaymentDetailHero } from "./PaymentDetailHero";
import { PaymentOrderSection } from "./PaymentOrderSection";
import { PaymentRecordSection } from "./PaymentRecordSection";
import { getCustomerDisplayName } from "./payment-utils";

/**
 * Dialog (portalled to `document.body`) with a payment's customer, order and payment record.
 * @param {{payment: object|null, onClose: () => void}} props Renders nothing while `payment` is null.
 */
export function PaymentDetailsModal({ payment, onClose }) {
  if (!payment || typeof document === "undefined") return null;
  const order = payment.order || {};
  const customer = order.customer || payment.customer || {};
  const shipping = order.shippingAddress || customer;
  const customerName = getCustomerDisplayName(customer);

  return createPortal(
    <div className="payment-detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="payment-detail-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
        <PaymentDetailHeader payment={payment} customerName={customerName} onClose={onClose} />
        <div className="payment-detail-body">
          <PaymentDetailHero payment={payment} />
          <div className="payment-detail-section-grid">
            <PaymentCustomerSection
              payment={payment}
              order={order}
              customer={customer}
              shipping={shipping}
              customerName={customerName}
            />
            <PaymentOrderSection payment={payment} order={order} />
          </div>
          <PaymentRecordSection payment={payment} order={order} />
        </div>
      </section>
    </div>,
    document.body,
  );
}
