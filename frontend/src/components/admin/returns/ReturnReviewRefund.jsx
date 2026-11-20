import { Banknote } from "lucide-react";
import { REFUND_STATUSES } from "@/constants/statuses";
import { currencyFixed, dateLabel } from "@/components/admin/global/admin-utils";
import { ReturnReviewSectionHeading } from "./ReturnReviewSectionHeading";
import {
  REFUND_METHOD_OPTIONS,
  REFUND_STATUS_OPTIONS,
  getSuggestedRefund,
  isReturnTypeRequest,
} from "./returns-utils";

/**
 * "Refund tracking" form section. Fields are disabled for exchanges, and amount/method
 * only apply while a refund is tracked.
 * @param {{request: object, form: object, onFieldChange: (name: string) => Function, onRefundStatusChange: Function}} props
 */
export function ReturnReviewRefund({ request, form, onFieldChange, onRefundStatusChange }) {
  const suggestedRefund = getSuggestedRefund(request);
  const isReturnRequest = isReturnTypeRequest(request);
  const tracksRefund = (form.refundStatus || REFUND_STATUSES[0]) !== REFUND_STATUSES[0];

  return (
    <section className={`return-review-refund${isReturnRequest ? "" : " return-review-refund-disabled"}`} aria-disabled={!isReturnRequest}>
      <ReturnReviewSectionHeading eyebrow={<><Banknote size={14} /> Refund tracking</>} title="Record refund details">
        <strong className="return-review-suggested">Item value · {currencyFixed(suggestedRefund)}</strong>
      </ReturnReviewSectionHeading>
      <p className="return-review-refund-help">{isReturnRequest ? "Tracking only. Saving this information does not transfer money or issue a refund." : "Refund tracking is only available for return requests. This exchange request does not require a refund."}</p>
      <div className="return-review-fields return-review-refund-fields">
        <label>Refund status
          <select required={isReturnRequest} disabled={!isReturnRequest} value={form.refundStatus || REFUND_STATUSES[0]} onChange={onRefundStatusChange}>
            {REFUND_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Refund amount
          <div className="return-review-money-input"><span>₹</span><input type="number" min="0" step="0.01" max={suggestedRefund || undefined} required={isReturnRequest && tracksRefund} disabled={!isReturnRequest || !tracksRefund} value={form.refundAmount ?? ""} onChange={onFieldChange("refundAmount")} placeholder="0.00" /></div>
        </label>
        <label>Refund method
          <select required={isReturnRequest && tracksRefund} disabled={!isReturnRequest || !tracksRefund} value={tracksRefund ? (form.refundMethod || "not_applicable") : "not_applicable"} onChange={onFieldChange("refundMethod")}>
            {REFUND_METHOD_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Refund reference <span className="return-review-optional">Optional</span>
          <input type="text" maxLength={120} disabled={!isReturnRequest} value={form.refundReference || ""} onChange={onFieldChange("refundReference")} placeholder="Transaction or bank reference" />
        </label>
      </div>
      {request.refundProcessedAt && <p className="return-review-processed">Refund recorded as processed on {dateLabel(request.refundProcessedAt)}.</p>}
    </section>
  );
}
