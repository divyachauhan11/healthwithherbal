import { AlertCircle, AlertTriangle } from "lucide-react";

/**
 * Warning box of the delete dialog: linked-products notice when blocked,
 * otherwise the permanent removal notice.
 * @param {object} props
 * @param {boolean} props.isBlocked
 * @param {number} props.blockedCount Number of linked products.
 * @param {string} props.kindSingular Human-readable singular kind.
 */
export function DeleteNotice({ isBlocked, blockedCount, kindSingular }) {
  return isBlocked ? (
    <div className="admin-delete-warning-box blocked">
      <AlertTriangle size={18} className="warning-icon" />
      <div>
        <strong>Active Dependency Detected</strong>
        <p>
          Found <b>{blockedCount}</b> active product
          {blockedCount === 1 ? "" : "s"} linked to this{" "}
          {kindSingular.toLowerCase()}. Deleting it would leave orphaned
          records on your live customer storefront.
        </p>
      </div>
    </div>
  ) : (
    <div className="admin-delete-warning-box danger">
      <AlertCircle size={18} className="warning-icon" />
      <div>
        <strong>Permanent Removal Notice</strong>
        <p>
          Once confirmed, this record will be purged from the database
          immediately. Customer orders referencing this product will retain
          their historical order records.
        </p>
      </div>
    </div>
  );
}
