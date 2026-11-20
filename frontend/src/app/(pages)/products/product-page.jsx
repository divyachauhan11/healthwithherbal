"use client";
import { parseProductBadges } from "@/components/pages/shared/product-utils";
import {
  ProductGallery,
  ProductNotFound,
  ProductReviewsSection,
  ProductSummary,
  RelatedProductsSection,
  useProductGallery,
  useProductQuantity,
  useProductReviews,
  useRelatedProducts,
} from "@/components/pages/product";

/**
 * Product detail page: gallery, purchase details, reviews and related products.
 * @param {object} props
 * @param {object|null} props.product Product to show; null renders "Product not found".
 * @param {(id: string|number, quantity?: number) => void} props.onAdd
 * @param {Array<string|number>} props.wished
 * @param {(id: string|number) => void} props.onWish
 * @param {boolean} props.added Whether the product is already in the bag.
 * @param {Array<string|number>} props.cart
 * @param {(id: string|number) => void} props.openProduct
 * @param {(view: string) => void} [props.openCatalog]
 * @param {Array<object>} [props.products]
 * @param {Array<object>} [props.reviews] Reviews from the store data.
 */
export function ProductPage({
  product,
  onAdd,
  wished,
  onWish,
  added,
  cart,
  openProduct,
  openCatalog,
  products = [],
  reviews = [],
}) {
  const { quantity, setQuantity, maxAddQuantity } = useProductQuantity({ product, cart });
  const { galleryImages, displayedImage, setDisplayedImage } = useProductGallery(product);
  const relatedProducts = useRelatedProducts(product, products);
  const { productReviews, realReviewsCount, realRating } = useProductReviews({ product, reviews });

  if (!product) {
    return (
      <main className="page-width product-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <ProductNotFound />
      </main>
    );
  }

  return (
    <main className="page-width product-page">
      <div className="breadcrumbs"></div>

      <div className="product-detail">
        <ProductGallery
          product={product}
          badges={parseProductBadges(product?.badge)}
          galleryImages={galleryImages}
          displayedImage={displayedImage}
          onSelectImage={setDisplayedImage}
        />

        <ProductSummary
          product={product}
          rating={realRating}
          reviewsCount={realReviewsCount}
          quantity={quantity}
          setQuantity={setQuantity}
          maxAddQuantity={maxAddQuantity}
          added={added}
          onAdd={onAdd}
          wished={wished}
          onWish={onWish}
        />
      </div>

      <ProductReviewsSection
        product={product}
        reviews={productReviews}
        rating={realRating}
        reviewsCount={realReviewsCount}
      />

      <RelatedProductsSection
        product={product}
        products={relatedProducts}
        wished={wished}
        cart={cart}
        onWish={onWish}
        onAdd={onAdd}
        openProduct={openProduct}
        openCatalog={openCatalog}
      />
    </main>
  );
}
