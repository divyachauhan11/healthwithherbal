import { ReturnRequestDetailsFields } from "./ReturnRequestDetailsFields";
import { ReturnRequestFooter } from "./ReturnRequestFooter";
import { ReturnRequestHeading } from "./ReturnRequestHeading";
import { ReturnRequestPhotoField } from "./ReturnRequestPhotoField";
import { ReturnRequestPhotoList } from "./ReturnRequestPhotoList";

/**
 * Return/exchange request dialog of the account page for one order line.
 * Clicking the backdrop closes it unless the request is being sent.
 * @param {object} props
 * @param {ReturnType<import("./useReturnRequest").useReturnRequest>} props.form
 *   State and handlers from `useReturnRequest` (with `form.request` set).
 * @param {boolean} props.returnExchangeEnabled Submit online (else draft an email).
 */
export function ReturnRequestModal({ form, returnExchangeEnabled }) {
  const { request, saving, close } = form;

  return (
    <div
      className="return-request-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving)
          close();
      }}
    >
      <form className="return-request-modal" onSubmit={form.submit}>
        <ReturnRequestHeading orderNumber={request.order.orderNumber} onClose={close} />
        <p className="return-request-product">
          {returnExchangeEnabled
            ? "Submit your request for review by our care team."
            : "Your email app will open with your request. Photo links will be included."}
        </p>
        <p className="return-request-product">
          {request.item.title} · Ordered quantity {request.item.quantity}
        </p>
        <ReturnRequestDetailsFields
          type={form.type}
          quantity={form.quantity}
          maxQuantity={request.item.quantity}
          reason={form.reason}
          onTypeChange={form.setType}
          onQuantityChange={form.setQuantity}
          onReasonChange={form.setReason}
        />
        <ReturnRequestPhotoField disabled={saving} onChange={form.handlePhotoInput} />
        {form.photos.length > 0 && (
          <ReturnRequestPhotoList photos={form.photos} disabled={saving} onRemove={form.removePhoto} />
        )}
        <ReturnRequestFooter
          saving={saving}
          returnExchangeEnabled={returnExchangeEnabled}
          onCancel={close}
        />
      </form>
    </div>
  );
}
