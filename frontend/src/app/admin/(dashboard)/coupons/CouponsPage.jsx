import { Plus } from "lucide-react";
import { SearchField, FormModal } from "@/components/admin/global";
import { CouponTable } from "@/components/admin/tables";

/**
 * Coupons page: search, add button, coupon table and coupon form.
 */
export default function CouponsPage({
  rows,
  query,
  setQuery,
  form,
  setForm,
  save,
  remove,
  busy,
}) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search coupons"
        />
        <button
          className="primary"
          onClick={() => setForm({ kind: "coupons", item: null })}
        >
          <Plus size={16} /> Add coupon
        </button>
      </div>

      <CouponTable
        rows={rows}
        onEdit={(item) => setForm({ kind: "coupons", item })}
        onDelete={(item) => remove("coupons", item)}
      />

      <FormModal
        entity="coupon"
        isOpen={Boolean(form?.kind === "coupons")}
        initial={form?.item}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />
    </section>
  );
}

