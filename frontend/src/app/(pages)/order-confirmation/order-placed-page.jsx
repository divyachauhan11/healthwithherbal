"use client";
import { useState } from "react";
import { ProductReviewModal } from "@/components/pages/modals";
import {
  OrderActionsRow,
  OrderBillingAddressCard,
  OrderConfirmationHero,
  OrderDeliveryAddressCard,
  OrderHelpCard,
  OrderItemsCard,
  OrderPaymentMethodCard,
  OrderReturnExchangePanel,
  OrderStatusTimeline,
  OrderTrackingCard,
  OrderUnavailableState,
  useCopyToClipboard,
  useLiveOrder,
  useOrderSource,
} from "@/components/pages/orders";
import { ORDER_STATUSES } from "@/constants/statuses";

/**
 * Order confirmation (after checkout / PayU) and order details page
 * (`detailMode`, `/account/orders/:orderId`). The order comes from the
 * `order` prop, the PayU return, the URL or the last saved order, and its
 * status stays live (SSE, polling and cross-tab updates).
 */
export function OrderPlacedPage({
  order,
  navigate,
  openContent,
  currentUser,
  detailMode = false,
}) {
  const { copied, copy } = useCopyToClipboard();
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const { rawOrder, loadingDetail, paymentResult } = useOrderSource({ order, detailMode });
  const { displayOrder, currentStatus } = useLiveOrder(rawOrder);

  if (!displayOrder) {
    return (
      <div
        className="order-placed-wrapper page-width"
        style={{ padding: "80px 20px", textAlign: "center" }}
      >
        <OrderUnavailableState
          loading={loadingDetail}
          detailMode={detailMode}
          navigate={navigate}
        />
      </div>
    );
  }

  const orderId = displayOrder.orderNumber || displayOrder._id;
  const showDeliveredSupport = detailMode && currentStatus === ORDER_STATUSES[3];

  return (
    <div className="order-placed-wrapper page-width">
      <OrderConfirmationHero
        order={displayOrder}
        detailMode={detailMode}
        paymentResult={paymentResult}
        copied={copied}
        onCopyOrderNumber={() => copy(displayOrder.orderNumber)}
      />

      <OrderStatusTimeline
        status={currentStatus}
        returnExchangeRequests={displayOrder.returnExchangeRequests}
      />

      <div className="order-placed-details-grid">
        <div className="order-placed-main-col">
          <OrderItemsCard
            order={displayOrder}
            status={currentStatus}
            onReviewItem={setReviewModalItem}
          />
        </div>

        <div className="order-placed-side-col">
          <OrderDeliveryAddressCard
            address={displayOrder.shippingAddress || displayOrder.customer || {}}
          />
          <OrderPaymentMethodCard
            paymentMethod={displayOrder.paymentMethod}
            paymentStatus={displayOrder.paymentStatus}
            total={displayOrder.total}
          />
          {displayOrder.trackingId && (
            <OrderTrackingCard trackingId={displayOrder.trackingId} />
          )}
          {displayOrder.billingAddress && (
            <OrderBillingAddressCard address={displayOrder.billingAddress} />
          )}
          <OrderHelpCard orderNumber={displayOrder.orderNumber} />
        </div>
      </div>

      {showDeliveredSupport && (
        <OrderReturnExchangePanel
          onRequest={() => openContent?.("Contact Us", { orderNumber: orderId })}
        />
      )}
      <OrderActionsRow
        detailMode={detailMode}
        showInvoice={showDeliveredSupport}
        onGenerateInvoice={() => navigate("order-invoice", { orderId })}
        navigate={navigate}
      />

      <ProductReviewModal
        isOpen={Boolean(reviewModalItem)}
        onClose={() => setReviewModalItem(null)}
        product={reviewModalItem}
        order={displayOrder}
        currentUser={currentUser}
      />
    </div>
  );
}
