"use client";
import { Check, ShoppingBag, Star, Heart } from "lucide-react";
export function AppButton({ children, variant = "primary", className = "", onClick, type = "button", disabled = false, }) {
    return (<button type={type} disabled={disabled} onClick={onClick} className={`app-button ${variant} ${className}`}>
      {children}
    </button>);
}
export function Rating({ value, reviews }) {
  const numVal = Number(value) || 0;
  const numReviews = reviews !== undefined && reviews !== null ? Number(reviews) : undefined;

  return (
    <div
      className={`rating ${numVal > 0 ? "has-rating" : "no-rating"}`}
      aria-label={`${numVal > 0 ? numVal.toFixed(1) : 0} out of 5 stars`}
    >
      <Star
        size={14}
        fill={numVal > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <span>{numVal > 0 ? numVal.toFixed(1) : "0.0"}</span>
      {numReviews !== undefined && !isNaN(numReviews) && (
        <small className="reviews-count">({numReviews})</small>
      )}
    </div>
  );
}
export function SectionHeading({ eyebrow, title, copy, centered }) {
    return (<div className={`section-heading ${centered ? "centered" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>);
}
export function ProductCard({ product, wished, added, onWish, onAdd, onOpen, }) {
    const badges = (product.badge || "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    return (<article className="product-card">
      <div className="product-image-wrap">
        {badges.length > 0 && (
          <div className="product-badge-group" style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 2, alignItems: "flex-start" }}>
            {badges.map((b, idx) => (
              <span key={idx} className="product-badge" style={{ position: "static" }}>{b}</span>
            ))}
          </div>
        )}
        <button type="button" className={`wish-button ${wished ? "active" : ""}`} onClick={onWish} aria-label="Toggle wishlist">
          <Heart size={18} fill={wished ? "currentColor" : "none"}/>
        </button>
        <button type="button" className="image-button" onClick={onOpen}>
          <img src={product.image} alt={product.title}/>
        </button>
      </div>
      <div className="product-copy">
        <div className="product-meta">
          <span>{product.brand}</span>
          <Rating value={product.rating} reviews={product.reviews}/>
        </div>
        <button type="button" className="product-title" onClick={onOpen}>
          {product.title}
        </button>
        <span className="product-category">{product.category}</span>
        <div className="product-bottom">
          <div className="price">
            <strong>₹{product.price.toFixed(2)}</strong>
            <del>₹{product.original.toFixed(2)}</del>
          </div>
          <button type="button" className={`quick-add ${added ? "added" : ""}`} onClick={onAdd} aria-label={added ? "Already in bag" : "Add to bag"}>
            {added ? <Check size={16}/> : <ShoppingBag size={17}/>}
            {added && <span>In bag</span>}
          </button>
        </div>
      </div>
    </article>);
}
