"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Minus,
  ShoppingBag,
  Truck,
  Heart,
  Star,
  Sparkles,
} from "lucide-react";
import { listReviews } from "@/lib/api";
import {
  AppButton,
  Rating,
  SectionHeading,
  ProductCard,
} from "@/components/pages/shared/primitives";
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
  const [quantity, setQuantity] = useState(1);
  const activeProducts = products;
  const stockLimit = Number(product?.stockQty);
  const hasStockLimit = product?.stockQty != null && Number.isFinite(stockLimit);
  const alreadyInCart = (cart || []).filter((id) =>
    [product?.id, product?._id, product?.legacyId].some((productId) =>
      productId != null && String(productId) === String(id),
    ),
  ).length;
  const maxAddQuantity = hasStockLimit
    ? Math.max(0, stockLimit - alreadyInCart)
    : Number.MAX_SAFE_INTEGER;

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, maxAddQuantity)));
  }, [product?.id, product?._id, maxAddQuantity]);

  const galleryImages = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  }, [product]);

  const [displayedImage, setDisplayedImage] = useState(
    () => galleryImages[0] || product?.image || "",
  );

  useEffect(() => {
    setDisplayedImage(galleryImages[0] || product?.image || "");
  }, [galleryImages, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = activeProducts.filter(
      (p) => p.category === product.category && p.id !== product.id,
    );
    const sameBrand = activeProducts.filter(
      (p) => p.brand === product.brand && p.id !== product.id,
    );
    const others = activeProducts.filter((p) => p.id !== product.id);
    const merged = Array.from(
      new Set([...sameCategory, ...sameBrand, ...others]),
    );
    return merged.slice(0, 4);
  }, [product, activeProducts]);

  const [fetchedReviews, setFetchedReviews] = useState(null);

  useEffect(() => {
    if (!product) return;
    let active = true;
    const prodId = product._id || product.id;
    listReviews(prodId)
      .then((data) => {
        if (active && Array.isArray(data)) setFetchedReviews(data);
      })
      .catch((error) => {
        console.warn("Could not load product reviews:", error);
      });

    return () => {
      active = false;
    };
  }, [product?._id, product?.id]);

  // Baseline matches from initial storefront reviews
  const directMatches = useMemo(() => {
    if (!reviews || reviews.length === 0 || !product) return [];
    return reviews.filter(
      (r) =>
        String(r.productId) === String(product.id) ||
        String(r.productId) === String(product._id) ||
        (product.legacyId && String(r.productId) === String(product.legacyId)),
    );
  }, [reviews, product]);

  const productReviews =
    fetchedReviews !== null ? fetchedReviews : directMatches;

  const realReviewsCount =
    fetchedReviews !== null
      ? fetchedReviews.length
      : directMatches.length > 0
      ? directMatches.length
      : Number(product?.reviews) || 0;

  const realRating =
    productReviews.length > 0
      ? Number(
          (
            productReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
            productReviews.length
          ).toFixed(1),
        )
      : Number(product?.rating) || 0;

  if (!product) {
    return (
      <main className="page-width product-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <p style={{ marginTop: "12px", color: "#666" }}>The requested remedy may have been updated or moved.</p>
      </main>
    );
  }

  const productBadges = (product?.badge || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <main className="page-width product-page">
      <div className="breadcrumbs"></div>

      <div className="product-detail">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap", zIndex: 2 }}>
              {productBadges.length > 0 ? (
                productBadges.map((b, idx) => (
                  <span key={idx} className="product-badge" style={{ position: "static" }}>
                    {b}
                  </span>
                ))
              ) : (
                <span className="product-badge" style={{ position: "static" }}>
                  Natural care
                </span>
              )}
            </div>
            <img
              src={displayedImage || product?.image || "/fallback-product.jpg"}
              alt={product?.title || "Product image"}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="thumbnail-row">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={displayedImage === imgUrl ? "active" : ""}
                  onClick={() => setDisplayedImage(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`${product?.title || "Product"} view ${idx + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.brand}</span>
          <h1>{product.title}</h1>
          <div className="detail-rating">
            <Rating value={realRating} reviews={realReviewsCount} />
            <span>In stock & ready to ship</span>
          </div>
          <div className="detail-price">
            <strong>₹{product.price.toFixed(2)}</strong>
            <del>₹{product.original.toFixed(2)}</del>
            <span>Save ₹{(product.original - product.price).toFixed(2)}</span>
          </div>
          <p className="detail-description">
            {product.description ||
              "A carefully selected herbal formulation inspired by the ancient science of Ayurveda. Made with plant-based ingredients to gently support your daily wellness ritual."}
          </p>

          <div className="detail-feature-list">
            <span>
              <Check /> Authentic heritage formula
            </span>
            <span>
              <Check /> No harsh chemicals
            </span>
            <span>
              <Check /> Responsibly sourced ingredients
            </span>
          </div>

          <div className="purchase-row">
            <div className="quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxAddQuantity, quantity + 1))}
                disabled={quantity >= maxAddQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <AppButton
              className={`add-detail ${added ? "already-added" : ""}${product.stockQty !== undefined && product.stockQty !== null && Number(product.stockQty) <= 0 ? " out-of-stock-detail" : ""}`}
              onClick={() => onAdd(product.id, quantity)}
              disabled={added || maxAddQuantity <= 0}
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}{" "}
              {added
                ? "Already in your bag"
                : maxAddQuantity <= 0
                  ? "OUT OF STOCK"
                  : `Add to bag · ₹${(product.price * quantity).toFixed(2)}`}
            </AppButton>
            <AppButton
              variant="outline"
              className="detail-wish"
              onClick={() => onWish(product.id)}
            >
              <Heart
                size={18}
                fill={wished.includes(product.id) ? "currentColor" : "none"}
              />
            </AppButton>
          </div>

          <div className="delivery-notes">
            <span>
              <Truck />
              <p>
                <strong>Free delivery</strong>
                <small>On orders over ₹75</small>
              </p>
            </span>
            <span>
              <Clock3 />
              <p>
                <strong>Dispatches in 24–48 hours</strong>
                <small>Tracked from our door to yours</small>
              </p>
            </span>
          </div>

          <details open>
            <summary>
              Why you’ll love it <ChevronDown />
            </summary>
            <p>
              A grounding addition to your routine, traditionally used to
              support balance and whole-body wellbeing.
            </p>
          </details>
          <details>
            <summary>
              Ingredients & directions <ChevronDown />
            </summary>
            <p>
              Refer to package directions. Keep in a cool, dry place and consult
              your healthcare provider when needed.
            </p>
          </details>
        </div>
      </div>

      <section className="product-reviews-section">
        <div className="section-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <SectionHeading
            eyebrow="Real feedback"
            title="Customer Reviews & Ratings"
            copy="Authentic experiences from verified wellness seekers who used this herbal remedy."
          />
          <div className="reviews-summary-badge">
            <Rating value={realRating} reviews={realReviewsCount} />
            <span>
              {realReviewsCount > 0
                ? `${realRating.toFixed(1)} / 5 Rating`
                : "No ratings yet"}
            </span>
          </div>
        </div>

        {productReviews.length > 0 ? (
          <div className="reviews-cards-grid">
            {productReviews.map((rev, idx) => (
              <div className="review-card-item" key={rev._id || idx}>
                <div className="review-card-top">
                  <Rating value={rev.rating || 5} />
                  <span className="review-date">
                    {rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Verified"}
                  </span>
                </div>
                {rev.title && <h4 className="review-card-title">{rev.title}</h4>}
                <p className="review-card-comment">“{rev.comment}”</p>
                <div className="review-card-author">
                  <span className="reviewer-avatar">
                    {(rev.reviewerName || rev.userName || "V")[0].toUpperCase()}
                  </span>
                  <div>
                    <strong>{rev.reviewerName || rev.userName || "Verified Buyer"}</strong>
                    <small>Verified Buyer · {rev.productTitle || product.title}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="empty-reviews-box"
            style={{
              padding: "36px 20px",
              textAlign: "center",
              background: "#fbf8f3",
              border: "1px dashed rgba(29, 58, 43, 0.2)",
              borderRadius: "14px",
              marginTop: "24px",
            }}
          >
            <Sparkles size={26} color="var(--forest, #1d3a2b)" style={{ marginBottom: "8px", opacity: 0.8 }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "var(--forest, #1d3a2b)", fontFamily: "var(--font-serif, serif)" }}>
              No reviews yet for {product.title}
            </h4>
            <p style={{ margin: "0 auto", maxWidth: "460px", color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
              Be the first to share your honest herbal experience! After your order arrives, you can write a verified review directly from your delivered order receipt.
            </p>
          </div>
        )}
      </section>

      <section className="related-products-section">
        <div className="related-products-header">
          <SectionHeading
            eyebrow="Complete your ritual"
            title="You may also like"
            copy="Carefully paired botanical remedies tailored to your wellness needs."
          />
        </div>

        <div className="products-grid related-products-grid">
          {relatedProducts.map((relProduct) => (
            <ProductCard
              key={relProduct.id}
              product={relProduct}
              wished={wished.includes(relProduct.id)}
              added={cart.includes(relProduct.id)}
              onWish={() => onWish(relProduct.id)}
              onAdd={() => onAdd(relProduct.id)}
              onSimilar={() => openCatalog?.(relProduct.category || product.category || "All Products")}
              onOpen={() => {
                openProduct(relProduct.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
