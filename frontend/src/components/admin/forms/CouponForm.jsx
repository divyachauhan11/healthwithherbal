import { AdminFormActions } from "./AdminFormActions";
import { AdminFormHeading } from "./AdminFormHeading";
import { useAdminFormFields } from "./useAdminFormFields";

/**
 * Inline coupon create/edit form (code, discount, limits, expiry, description).
 * @param {object} props
 * @param {object|null} [props.initial] Coupon being edited.
 * @param {(body: object) => void} props.onSave Receives the uppercased code and set fields.
 * @param {() => void} props.onClose
 * @param {boolean} [props.busy]
 */
export function CouponForm({ initial, onSave, onClose, busy }) {
  const { form, update } = useAdminFormFields(() => ({
    code: initial?.code || "",
    description: initial?.description || "",
    discountType: initial?.discountType || "percent",
    discountValue: initial?.discountValue ?? "",
    minOrderAmount: initial?.minOrderAmount ?? "",
    expiresAt: initial?.expiresAt
      ? new Date(initial.expiresAt).toISOString().slice(0, 10)
      : "",
    usageLimit: initial?.usageLimit ?? "",
  }));
  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        const body = { ...form, code: form.code.toUpperCase() };
        if (!body.expiresAt) delete body.expiresAt;
        if (!body.usageLimit) delete body.usageLimit;
        onSave(body);
      }}
    >
      <AdminFormHeading
        title={initial?._id ? "Edit coupon" : "Create coupon"}
        description="Set a code and discount rules for your customers."
        onClose={onClose}
      />
      <div className="form-section">
        <div className="form-grid">
          <label>
            Coupon code
            <input required value={form.code} onChange={update("code")} />
          </label>
          <label>
            Discount type
            <select
              value={form.discountType}
              onChange={update("discountType")}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </label>
          <label>
            Discount value (₹ / %)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.discountValue}
              onChange={update("discountValue")}
            />
          </label>
          <label>
            Minimum order amount (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderAmount}
              onChange={update("minOrderAmount")}
            />
          </label>
          <label>
            Usage limit
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={update("usageLimit")}
            />
          </label>
          <label>
            Expiry date
            <input
              type="date"
              value={form.expiresAt}
              onChange={update("expiresAt")}
            />
          </label>
          <label className="wide">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
            />
          </label>
        </div>
      </div>
      <AdminFormActions
        busy={busy}
        submitLabel={initial?._id ? "Save changes" : "Create coupon"}
        onClose={onClose}
      />
    </form>
  );
}
