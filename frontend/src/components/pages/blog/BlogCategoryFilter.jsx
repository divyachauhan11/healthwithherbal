/**
 * "Explore by category" section with one toggle button per category.
 * @param {object} props
 * @param {string[]} props.categories Category names ("All" first).
 * @param {string} props.selectedCategory Active category.
 * @param {(category: string) => void} props.onSelect
 */
export function BlogCategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <section
      className="blog-categories-section"
      aria-label="Browse blog categories"
    >
      <div className="page-width">
        <div className="blog-section-heading">
          <span>Find your next read</span>
          <h2>Explore by category</h2>
        </div>
        <div className="blog-category-filter">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => onSelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
