import { CategoryDetailRow } from "./CategoryDetailRow";

/**
 * Categories grouped under a parent category, or an empty note.
 * @param {{category: Object, subcategories: Array<Object>}} props
 */
export function ParentCategoryChildList({ category, subcategories }) {
  return (
    <section className="category-details-list" aria-label="Categories in this parent category">
      <div className="category-details-list-heading">
        <div><span>Grouped categories</span><h3>Categories under {category.name}</h3></div>
        <span className="category-details-total">{subcategories.length} total</span>
      </div>
      {subcategories.length ? subcategories.map((child) => (
        <CategoryDetailRow key={child._id} category={child} />
      )) : (
        <div className="category-details-empty">No categories have been assigned to this parent yet.</div>
      )}
    </section>
  );
}
