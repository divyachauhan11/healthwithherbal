import { Modal } from "../../global/Modal";
import { ParentCategoryChildList } from "./ParentCategoryChildList";
import { ParentCategoryOverview } from "./ParentCategoryOverview";

/**
 * Details dialog for a parent category and the categories grouped under it.
 * @param {{category: Object|null, subcategories: Array<Object>, productCount: number, onClose: () => void}} props
 */
export function ParentCategoryModal({ category, subcategories, productCount, onClose }) {
  return (
    <Modal
      isOpen={Boolean(category)}
      onClose={onClose}
      title={category?.name || "Parent category details"}
      subtitle="Parent category information and all categories grouped under it."
      showFooter={false}
      maxWidth="780px"
      className="category-details-modal"
    >
      {category && (
        <div className="category-details-content">
          <ParentCategoryOverview
            category={category}
            categoryCount={subcategories.length}
            productCount={productCount}
          />
          <ParentCategoryChildList category={category} subcategories={subcategories} />
        </div>
      )}
    </Modal>
  );
}
