/**
 * Product cell of the low-stock table: thumbnail (or initial), title and brand.
 * @param {{product: object}} props
 */
export function LowStockProductCell({ product }) {
  return (
    <div className="product-cell">
      <div className="product-thumb low-stock-product-thumb">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="low-stock-product-image"
          />
        ) : (
          product.title?.slice(0, 1)
        )}
      </div>
      <div>
        <b>{product.title}</b>
        <small className="cell-subtitle">{product.brand}</small>
      </div>
    </div>
  );
}
