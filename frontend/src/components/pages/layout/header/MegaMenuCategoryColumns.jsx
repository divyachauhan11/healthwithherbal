"use client";

/**
 * Columns of category groups in the "Shop by category" mega menu.
 * @param {object} props
 * @param {Array<Array<{key: string, name: string, categories: Array<object>}>>} props.columns
 * @param {() => void} props.onHover Keeps the category menu open.
 * @param {(categoryName: string) => void} props.onSelect
 */
export function MegaMenuCategoryColumns({ columns, onHover, onSelect }) {
  return columns.map((column, columnIndex) => (
    <div className="header-category-column" key={`category-column-${columnIndex}`}>
      {column.map((group) => (
        <section className="header-category-group" key={group.key}>
          <h3>{group.name}</h3>
          <ul>
            {group.categories.map((category) => (
              <li key={category._id || category.name}>
                <button
                  type="button"
                  onMouseEnter={onHover}
                  onClick={() => onSelect(category.name)}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ));
}
