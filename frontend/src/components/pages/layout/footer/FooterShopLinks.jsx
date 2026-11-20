"use client";

/**
 * Footer "Shop" links: one per top-level category, then "Shop All".
 * @param {object} props
 * @param {Array<object>} props.categories Navigation categories; children of a parent are skipped.
 * @param {(view: string) => void} props.openCatalog
 */
export function FooterShopLinks({ categories, openCatalog }) {
  const shopCategories = categories.filter(
    (category) => category && (category.isParent || category.parentId == null),
  );
  return (
    <div className="footer-category-links">
      {shopCategories.map((category) => (
        <button
          type="button"
          key={
            category._id || category.id || category.slug || category.name
          }
          onClick={() => openCatalog(category.name)}
          title={category.name}
        >
          {category.name}
        </button>
      ))}
      <button type="button" onClick={() => openCatalog("All Products")}>
        Shop All
      </button>
    </div>
  );
}
