"use client";

import {
  InvoiceCustomerDetails,
  InvoiceFooter,
  InvoiceHeading,
  InvoiceItemsSection,
  InvoiceLoadingState,
  InvoiceNotFoundState,
  InvoiceOrderDetails,
  InvoiceToolbar,
  useInvoiceOrder,
} from "@/components/pages/orders";
import { getInvoiceNumber } from "@/components/pages/orders/invoice-utils";

/**
 * Printable customer invoice for an order (`/account/orders/:orderId/invoice`).
 * Uses the `order` prop when available, otherwise loads the order in the URL.
 */
export function OrderInvoicePage({ order, navigate }) {
  const { loadedOrder, loading, error } = useInvoiceOrder(order);

  if (loading) {
    return <InvoiceLoadingState />;
  }
  if (!loadedOrder) {
    return (
      <InvoiceNotFoundState
        message={error || "Order not found."}
        onBack={() => navigate("account", { tab: "orders" })}
      />
    );
  }

  return (
    <main className="invoice-page page-width">
      <InvoiceToolbar
        onBack={() => navigate("order-details", { orderId: loadedOrder.orderNumber || loadedOrder._id })}
      />

      <article className="invoice-paper invoice-print">
        <InvoiceHeading invoiceNumber={getInvoiceNumber(loadedOrder)} />

        <section className="invoice-info-grid">
          <InvoiceCustomerDetails order={loadedOrder} />
          <InvoiceOrderDetails order={loadedOrder} />
        </section>

        <InvoiceItemsSection order={loadedOrder} />

        <InvoiceFooter />
      </article>
    </main>
  );
}
