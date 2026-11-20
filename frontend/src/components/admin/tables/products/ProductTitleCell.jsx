import { TableThumbImage } from "../shared";

/**
 * Product thumbnail (or initial), title and extra photo count.
 * @param {{product: Object}} props
 */
export function ProductTitleCell({ product }) {
  return (
    <div className="product-cell">
      <div className="product-thumb">
        {product.image || product.images?.[0] ? (
          <TableThumbImage src={product.image || product.images?.[0]} alt={product.title} />
        ) : (
          product.title?.slice(0, 1)
        )}
      </div>
      <div>
        <b>{product.title}</b>
        {product.images?.length > 1 && (
          <small className="product-photo-count">
            +{product.images.length - 1} photos
          </small>
        )}
      </div>
    </div>
  );
}
