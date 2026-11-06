"use client";
import { ArrowRight, ChevronRight, Heart } from "lucide-react";
import { AppButton, ProductCard } from "../../../components/global/primitives";
export function WishlistPage({
  wished,
  cart,
  onWish,
  onAdd,
  openProduct,
  openCatalog,
  products: productsProp = [],
}) {
  const activeProducts = productsProp || [];
  const wishedItems = activeProducts.filter((p) => wished.includes(p.id) || wished.includes(p._id));
  return (
    <main className="page-width wishlist-page" style={{ padding: "40px 0" }}>
      <div className="breadcrumbs">
        Home <ChevronRight size={13} /> Wishlist
      </div>
      <div className="shop-heading">
        <div>
          <span className="eyebrow">Your Saved Remedies</span>
          <h1>My Wishlist</h1>
          <p>Herbal formulations and wellness essentials you've bookmarked.</p>
        </div>
        <div className="shop-count">{wishedItems.length} items</div>
      </div>

      {wishedItems.length === 0 ? (
        <div
          className="empty-state"
          style={{ textAlign: "center", padding: "60px 20px" }}
        >
          <Heart
            size={48}
            strokeWidth={1.5}
            style={{ margin: "0 auto 16px", opacity: 0.4 }}
          />
          <h3>Your wishlist is empty</h3>
          <p>
            Explore our Ayurvedic remedies and save your favourites for later.
          </p>
          <AppButton onClick={() => openCatalog?.("All Products")}>
            Explore Remedies <ArrowRight size={16} />
          </AppButton>
        </div>
      ) : (
        <div className="products-grid">
          {wishedItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wished={true}
              added={cart.includes(product.id)}
              onWish={() => onWish(product.id)}
              onAdd={() => onAdd(product.id)}
              onOpen={() => openProduct(product.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
