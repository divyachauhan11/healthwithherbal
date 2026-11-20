/**
 * A category listed in the parent category details: name, slug, description,
 * section, status and product count.
 * @param {{category: Object}} props
 */
export function CategoryDetailRow({ category }) {
  return (
    <article className="category-detail-row">
      <div className="category-detail-main">
        <strong>{category.name}</strong>
        <span>/{category.slug}</span>
        {category.description && <small>{category.description}</small>}
      </div>
      <span className="category-detail-type">{category.type === "concern" ? "Health concern" : "Product form"}</span>
      <span className={`category-detail-status${category.isActive === false ? " inactive" : ""}`}>
        {category.isActive === false ? "Inactive" : "Active"}
      </span>
      <span className="category-detail-products">{category.productCount || 0} products</span>
    </article>
  );
}
