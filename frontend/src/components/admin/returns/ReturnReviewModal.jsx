"use client";

import { createPortal } from "react-dom";
import { ReturnReviewFooter } from "./ReturnReviewFooter";
import { ReturnReviewHeader } from "./ReturnReviewHeader";
import { ReturnReviewOrderCard } from "./ReturnReviewOrderCard";
import { ReturnReviewReasonCard } from "./ReturnReviewReasonCard";
import { ReturnReviewRefund } from "./ReturnReviewRefund";
import { ReturnReviewResolution } from "./ReturnReviewResolution";
import { ReturnReviewSummary } from "./ReturnReviewSummary";
import { useReturnReviewForm } from "./useReturnReviewForm";

/**
 * Dialog (portalled to `document.body`) for reviewing a return/exchange request:
 * request summary, linked order, customer reason, resolution and refund tracking.
 * @param {{request: object|null, saving: boolean, onClose: () => void, onSave: (values: object) => void}} props
 *   Renders nothing while `request` is null.
 */
export function ReturnReviewModal({ request, saving, onClose, onSave }) {
  const { form, update, changeRefundStatus, submit } = useReturnReviewForm({ request, saving, onClose, onSave });

  if (!request || typeof document === "undefined") return null;

  return createPortal(
    <div className="return-review-overlay" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="return-review-modal" role="dialog" aria-modal="true" aria-labelledby="return-review-title">
        <ReturnReviewHeader request={request} saving={saving} onClose={onClose} />

        <form className="return-review-form" onSubmit={submit}>
          <div className="return-review-body">
            <ReturnReviewSummary request={request} />
            <ReturnReviewOrderCard request={request} />
            <ReturnReviewReasonCard request={request} />
            <ReturnReviewResolution form={form} onFieldChange={update} />
            <ReturnReviewRefund
              request={request}
              form={form}
              onFieldChange={update}
              onRefundStatusChange={changeRefundStatus}
            />
          </div>
          <ReturnReviewFooter saving={saving} onClose={onClose} />
        </form>
      </section>
    </div>,
    document.body,
  );
}
