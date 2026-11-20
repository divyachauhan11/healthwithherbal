"use client";
import { BlogPage } from "@/app/(pages)/blog/blog-page";
import { HomePage as StoreHomePage } from "@/app/(pages)/home/home-page";
import { ShopPage } from "@/app/(pages)/shop/shop-page";
import { ProductPage } from "@/app/(pages)/products/product-page";
import { WishlistPage } from "@/app/(pages)/wishlist/wishlist-page";
import { ContentPage } from "@/app/(pages)/content/content-page";
import { CheckoutPage } from "@/app/(pages)/checkout/checkout-page";
import { AccountPage } from "@/app/(pages)/account/account-page";
import { OrderPlacedPage } from "@/app/(pages)/order-confirmation/order-placed-page";
import { OrderInvoicePage } from "@/app/(pages)/order-confirmation/order-invoice-page";

/**
 * Renders the page component for the active storefront page. Each page keeps
 * its own conditional slot, so switching pages unmounts the previous page.
 * @param {object} props
 * @param {object} props.navigation Result of `useStorefrontNavigation`.
 * @param {object} props.storeData Result of `useStoreData`.
 * @param {Array<string|number>} props.cart Product IDs in the bag (one per unit).
 * @param {number} props.total Bag total.
 * @param {object} props.shippingOption Selected shipping option.
 * @param {(id: string|number, quantity?: number) => void} props.onAdd Add to bag.
 * @param {Array<string|number>} props.wishlist Saved product IDs.
 * @param {(id: string|number) => void} props.onWish Toggle a wishlist item.
 * @param {object|null} props.currentUser
 * @param {() => void} props.onLogout
 * @param {object} props.orders Result of `useStorefrontOrders`.
 * @param {() => void} props.openAuthModal
 * @param {(message: string) => void} props.notify
 */
export function StorefrontPages({
  navigation,
  storeData,
  cart,
  total,
  shippingOption,
  onAdd,
  wishlist,
  onWish,
  currentUser,
  onLogout,
  orders,
  openAuthModal,
  notify,
}) {
  const {
    page,
    navigate,
    openCatalog,
    openContent,
    openProduct,
    catalogView,
    catalogSearch,
    selectedProduct,
    contentPage,
    contentContext,
    accountStartTab,
  } = navigation;
  const { products, categories, navigationCategories, brands, coupons, blogs, reviews } = storeData;

  return (
    <>
      {page === "home" && (
        <StoreHomePage
          navigate={navigate}
          openCatalog={openCatalog}
          openContent={openContent}
          cart={cart}
          onAdd={onAdd}
          wished={wishlist}
          onWish={onWish}
          openProduct={openProduct}
          products={products}
          categories={categories}
          navigationCategories={navigationCategories}
          featuredCategoryIds={storeData.featuredCategoryIds}
          brands={brands}
          coupons={coupons}
          blogs={blogs}
          reviews={reviews}
        />
      )}
      {page === "shop" && (
        <ShopPage
          key={`${catalogView}-${catalogSearch}`}
          view={catalogView}
          initialTerm={catalogSearch}
          cart={cart}
          wished={wishlist}
          onWish={onWish}
          onAdd={onAdd}
          openProduct={openProduct}
          openCatalog={openCatalog}
          products={products}
          categories={categories}
          brands={brands}
        />
      )}
      {page === "product" && (
        <ProductPage
          product={selectedProduct}
          products={products}
          reviews={reviews}
          onAdd={onAdd}
          added={cart.includes(selectedProduct?.id)}
          wished={wishlist}
          onWish={onWish}
          cart={cart}
          openProduct={openProduct}
          openCatalog={openCatalog}
        />
      )}
      {page === "wishlist" && (
        <WishlistPage
          wished={wishlist}
          cart={cart}
          onWish={onWish}
          onAdd={onAdd}
          openProduct={openProduct}
          openCatalog={openCatalog}
          products={products}
        />
      )}
      {page === "blog" && <BlogPage openCatalog={openCatalog} blogs={blogs} />}
      {page === "content" && (
        <ContentPage page={contentPage} openCatalog={openCatalog} contactContext={contentContext} />
      )}
      {page === "checkout" && currentUser && (
        <CheckoutPage
          navigate={navigate}
          openContent={openContent}
          cart={cart}
          total={total}
          products={products}
          coupons={coupons}
          currentUser={currentUser}
          shippingOption={shippingOption}
          onComplete={orders.completeOrder}
        />
      )}
      {page === "order-placed" && (
        <OrderPlacedPage
          order={orders.placedOrder}
          navigate={navigate}
          openContent={openContent}
          currentUser={currentUser}
        />
      )}
      {page === "order-details" && (
        <OrderPlacedPage
          order={orders.selectedOrder}
          navigate={navigate}
          openContent={openContent}
          currentUser={currentUser}
          detailMode
        />
      )}
      {page === "order-invoice" && (
        <OrderInvoicePage order={orders.selectedOrder} navigate={navigate} />
      )}
      {page === "account" && (
        <AccountPage
          currentUser={currentUser}
          returnExchangeEnabled={storeData.returnExchangeEnabled !== false}
          initialTab={accountStartTab}
          onLogout={onLogout}
          navigate={navigate}
          openContent={openContent}
          openAuthModal={openAuthModal}
          notify={notify}
          onViewOrder={orders.viewOrder}
        />
      )}
    </>
  );
}
