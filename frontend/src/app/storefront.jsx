"use client";
import { Header, Footer } from "../components/pages/layout";
import { AuthModal, CartDrawer } from "../components/pages/modals";
import {
  FloatingHomeButton,
  StorefrontPages,
  StorefrontToast,
  useCart,
  useCustomerSession,
  useStoreData,
  useStorefrontDialogs,
  useStorefrontNavigation,
  useStorefrontOrders,
  useToast,
  useWishlist,
} from "../components/pages/storefront";

/**
 * Client-side storefront: composes the shell state hooks and renders the
 * header, the active page, the footer, the sign-in modal, the cart drawer and
 * the toast.
 *
 * Keep the hook order: it is the order their effects run in on every render
 * (session restore -> wishlist -> store data -> routing -> cart restore -> cart sync).
 */
export default function App() {
  const { toast, notify } = useToast();
  const dialogs = useStorefrontDialogs();
  const session = useCustomerSession({ notify });
  const { currentUser } = session;
  const { wishlist, toggleWish, handleAuthSuccess, handleLogout } = useWishlist({
    session,
    notify,
    openAuthModal: dialogs.openAuthModal,
  });
  const storeData = useStoreData();
  const { products, categories, navigationCategories, brands, coupons } = storeData;
  const navigation = useStorefrontNavigation({
    products,
    currentUser,
    sessionReady: session.sessionReady,
    setCartOpen: dialogs.setCartOpen,
    setAuthModalOpen: dialogs.setAuthModalOpen,
    notify,
  });
  const { page, navigate, openCatalog, openContent } = navigation;
  const {
    cart,
    total,
    shippingOption,
    setShippingOption,
    updateCart,
    addToCart,
    removeFromCart,
    changeQuantity,
  } = useCart({ products, notify, setCartOpen: dialogs.setCartOpen });
  const orders = useStorefrontOrders({ updateCart, navigate, notify });

  return (
    <div className="app-shell">
      {page !== "checkout" && <Header
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        navigate={navigate}
        openCatalog={openCatalog}
        currentPage={page}
        openCart={dialogs.openCart}
        openAuthModal={dialogs.openAuthModal}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSearch={navigation.search}
        categories={categories}
        navigationCategories={navigationCategories}
        brands={brands}
        coupons={coupons}
        announcements={storeData.announcements}
      />}
      {page !== "home" && page !== "checkout" && (
        <FloatingHomeButton onClick={() => navigate("home")} />
      )}
      <StorefrontPages
        navigation={navigation}
        storeData={storeData}
        cart={cart}
        total={total}
        shippingOption={shippingOption}
        onAdd={addToCart}
        wishlist={wishlist}
        onWish={toggleWish}
        currentUser={currentUser}
        onLogout={handleLogout}
        orders={orders}
        openAuthModal={dialogs.openAuthModal}
        notify={notify}
      />
      {page !== "checkout" && <Footer
        navigate={navigate}
        openCatalog={openCatalog}
        categories={navigationCategories}
        openContent={openContent}
        openOrderHistory={navigation.openOrderHistory}
        openAuthModal={navigation.openAccount}
      />}

      <AuthModal
        isOpen={dialogs.authModalOpen}
        onClose={dialogs.closeAuthModal}
        onSuccess={handleAuthSuccess}
      />

      {dialogs.cartOpen && (
        <CartDrawer
          cart={cart}
          products={products}
          coupons={coupons}
          currentUser={currentUser}
          shippingOption={shippingOption}
          onSelectShipping={setShippingOption}
          close={dialogs.closeCart}
          remove={removeFromCart}
          changeQuantity={changeQuantity}
          checkout={navigation.startCheckout}
          onAdd={addToCart}
          notify={notify}
        />
      )}
      <StorefrontToast message={toast} />
    </div>
  );
}
