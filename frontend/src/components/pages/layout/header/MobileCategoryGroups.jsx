"use client";

/**
 * Category groups listed inside the mobile menu's "Category" section.
 * @param {object} props
 * @param {Array<{key: string, name: string, categories: Array<object>}>} props.groups
 * @param {(categoryName: string) => void} props.onSelect
 */
export function MobileCategoryGroups({ groups, onSelect }) {
  return (
    <div className="mobile-category-groups">
      {groups.map((group) => (
        <section className="mobile-category-group" key={group.key}>
          <h3>{group.name}</h3>
          {group.categories.map((category) => (
            <button
              type="button"
              key={category._id || category.name}
              onClick={() => onSelect(category.name)}
            >
              {category.name}
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
