"use client";
import { Rating } from "@/components/pages/shared/primitives";
import { ProductDeliveryNotes } from "./ProductDeliveryNotes";
import { ProductDetailsAccordions } from "./ProductDetailsAccordions";
import { ProductFeatureList } from "./ProductFeatureList";
import { ProductPrice } from "./ProductPrice";
import { ProductPurchaseRow } from "./ProductPurchaseRow";

/**
 * Product details column: brand, title, rating, price, description,
 * promises, purchase row, delivery notes and details disclosures.
 * @param {object} props
 * @param {object} props.product
 * @param {number} props.rating Average rating.
 * @param {number} props.reviewsCount
 * @param {number} props.quantity
 * @param {(quantity: number) => void} props.setQuantity
 * @param {number} props.maxAddQuantity
 * @param {boolean} props.added
 * @param {(id: string|number, quantity: number) => void} props.onAdd
 * @param {Array<string|number>} props.wished
 * @param {(id: string|number) => void} props.onWish
 */
export function ProductSummary({
  product,
  rating,
  reviewsCount,
  quantity,
  setQuantity,
  maxAddQuantity,
  added,
  onAdd,
  wished,
  onWish,
}) {
  return (
    <div className="detail-copy">
      <span className="eyebrow">{product.brand}</span>
      <h1>{product.title}</h1>
      <div className="detail-rating">
        <Rating value={rating} reviews={reviewsCount} />
        <span>In stock & ready to ship</span>
      </div>
      <ProductPrice product={product} />
      <p className="detail-description">
        {product.description ||
          "A carefully selected herbal formulation inspired by the ancient science of Ayurveda. Made with plant-based ingredients to gently support your daily wellness ritual."}
      </p>

      <ProductFeatureList />

      <ProductPurchaseRow
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        maxAddQuantity={maxAddQuantity}
        added={added}
        onAdd={onAdd}
        wished={wished}
        onWish={onWish}
      />

      <ProductDeliveryNotes />

      <ProductDetailsAccordions />
    </div>
  );
}
