import { RETURN_EXCHANGE_STATUSES } from "@/constants/statuses";
import { ReturnReviewSectionHeading } from "./ReturnReviewSectionHeading";
import { ReturnStatusBadge } from "./ReturnStatusBadge";
import { REQUEST_STATUS_OPTIONS } from "./returns-utils";

/**
 * "Resolution" form section: request status and internal admin note.
 * @param {{form: object, onFieldChange: (name: string) => Function}} props
 *   `onFieldChange(name)` returns the change handler for that form field.
 */
export function ReturnReviewResolution({ form, onFieldChange }) {
  return (
    <section className="return-review-resolution">
      <ReturnReviewSectionHeading eyebrow="Resolution" title="Update request"><ReturnStatusBadge status={form.status} /></ReturnReviewSectionHeading>
      <div className="return-review-fields">
        <label>Request status
          <select required value={form.status || RETURN_EXCHANGE_STATUSES[0]} onChange={onFieldChange("status")}>
            {REQUEST_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="return-review-note">Internal admin note
          <textarea rows={3} maxLength={1000} value={form.adminNote || ""} onChange={onFieldChange("adminNote")} placeholder="Add handling notes or next steps" />
          <small>Visible to admins only</small>
        </label>
      </div>
    </section>
  );
}
