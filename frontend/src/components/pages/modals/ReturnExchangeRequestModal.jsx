"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  ReturnExchangeDialogActions,
  ReturnExchangeOrderSummary,
  ReturnExchangePhotoField,
  ReturnExchangePhotoList,
  ReturnExchangeProductField,
  ReturnExchangeQuantityField,
  ReturnExchangeReasonField,
  ReturnExchangeSuccess,
  ReturnExchangeTypeOptions,
  useReturnExchangeEmailRequest,
} from "./return-exchange";

/**
 * Dialog (portalled to `document.body`) that emails a return or exchange
 * request for an order to the care team, then confirms it was sent.
 * Pressing on the backdrop closes it unless the request is being sent.
 * @param {object} props
 * @param {object|null} props.order Order the request is about (renders nothing without one).
 * @param {object|null} [props.currentUser] Signed-in customer.
 * @param {number|null} [props.initialItemIndex] Order line preselected in the product field.
 * @param {() => void} [props.onClose] Closes the dialog.
 */
export function ReturnExchangeRequestModal({
  order,
  currentUser,
  initialItemIndex,
  onClose,
}) {
  const request = useReturnExchangeEmailRequest({ order, currentUser, initialItemIndex, onClose });

  if (!order || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="return-exchange-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && request.close()}
    >
      <section
        className="return-exchange-dialog return-exchange-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-exchange-title"
      >
        <button
          type="button"
          className="return-exchange-close"
          onClick={request.close}
          disabled={request.sending}
          aria-label="Close request form"
        >
          <X size={22} />
        </button>
        <span className="return-exchange-eyebrow">
          Order {order.orderNumber || "—"}
        </span>
        <h2 id="return-exchange-title">Return or exchange request</h2>
        <p className="return-exchange-help">
          Submitting sends your request directly to our care team. Please wait
          for return instructions before mailing the product.
        </p>
        {request.sent ? (
          <ReturnExchangeSuccess customerEmail={request.customerEmail} onDone={onClose} />
        ) : <>
        <ReturnExchangeOrderSummary order={order} />
        <form onSubmit={request.submit}>
          <ReturnExchangeTypeOptions value={request.requestType} onChange={request.setRequestType} />
          <ReturnExchangeProductField
            items={order.items}
            value={request.productChoice}
            onChange={request.chooseProduct}
          />
          {request.selectedProduct && (
            <ReturnExchangeQuantityField
              product={request.selectedProduct}
              value={request.quantity}
              onChange={request.setQuantity}
            />
          )}
          <ReturnExchangeReasonField value={request.reason} onChange={request.setReason} />
          <ReturnExchangePhotoField disabled={request.sending} onChange={request.handlePhotoInput} />
          {request.photos.length > 0 && (
            <ReturnExchangePhotoList
              photos={request.photos}
              disabled={request.sending}
              onRemove={request.removePhoto}
            />
          )}
          {request.error && (
            <p className="return-exchange-error" role="alert">
              {request.error}
            </p>
          )}
          <ReturnExchangeDialogActions sending={request.sending} onCancel={request.close} />
        </form>
        </>}
      </section>
    </div>,
    document.body,
  );
}
