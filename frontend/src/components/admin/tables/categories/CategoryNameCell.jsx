import { PhotoCountNote, TableThumbImage } from "../shared";

/**
 * Category thumbnail, name link and extra photo count. The name opens the
 * parent category details, or the category's products for normal categories.
 * @param {{item: Object, onViewParent: (category: Object) => void, onNavigate?: Function}} props
 */
export function CategoryNameCell({ item, onViewParent, onNavigate }) {
  return (
    <div className="product-cell">
      {(item.image || item.images?.[0]) && (
        <div className="product-thumb">
          <TableThumbImage src={item.image || item.images[0]} alt={item.name} />
        </div>
      )}
      <div>
        <button
          type="button"
          className="category-name-link"
          title={item.isParent ? `View categories under ${item.name}` : `View products in ${item.name}`}
          onClick={(event) => {
            event.stopPropagation();
            if (item.isParent) onViewParent(item);
            else onNavigate?.("Products", item.name);
          }}
        >
          {item.name}
        </button>
        {item.images?.length > 1 && (
          <PhotoCountNote photoCount={item.images.length} />
        )}
      </div>
    </div>
  );
}
