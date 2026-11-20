import { Package } from "lucide-react";

/**
 * Header of the review form: brand, product name (the dialog's label) and order reference.
 * @param {object} props
 * @param {string} props.brandName Product brand.
 * @param {string} props.productTitle Product name.
 * @param {string} props.orderNumber Order reference ("" hides it).
 */
export function ReviewProductPreview({ brandName, productTitle, orderNumber }) {
  return (
    <div className="review-modal-header">
      <div className="review-product-preview">
        <div className="preview-icon-box">
          <Package size={22} color="var(--forest)" />
        </div>
        <div>
          <span className="preview-brand">{brandName}</span>
          <h3 id="review-modal-title" className="preview-title">
            {productTitle}
          </h3>
          {orderNumber && (
            <span className="preview-order-ref">
              Order #{orderNumber} • Delivered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
