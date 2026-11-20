import { PhotoCountNote, TableThumbImage } from "../shared";

/**
 * Brand logo (or initial), name and extra photo count.
 * @param {{brand: Object}} props
 */
export function BrandNameCell({ brand }) {
  return (
    <div className="product-cell">
      {brand.image || brand.logoUrl || brand.images?.[0] ? (
        <div className="product-thumb">
          <TableThumbImage src={brand.image || brand.logoUrl || brand.images[0]} alt={brand.name} />
        </div>
      ) : (
        <div className="product-thumb">{brand.name?.slice(0, 1)}</div>
      )}
      <div>
        <b>{brand.name}</b>
        {brand.images?.length > 1 && (
          <PhotoCountNote photoCount={brand.images.length} />
        )}
      </div>
    </div>
  );
}
