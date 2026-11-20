"use client";
import {
  CartDiscountPanel,
  CartDrawerHeader,
  CartEmptyState,
  CartLineItems,
  CartNotePanel,
  CartRecommendations,
  CartSharePanel,
  CartShippingPanel,
  CartSummary,
  CartToolbar,
  useCartDrawer,
} from "@/components/pages/cart";

/**
 * Cart drawer: line items, cart tools (share, order note, shipping estimate,
 * discount), totals, checkout button and recommendations. State lives in
 * {@link useCartDrawer}, which also syncs the cart to the backend.
 * @param {object} props
 * @param {Array<string|number>} [props.cart] Cart product IDs, one entry per unit.
 * @param {() => void} props.close Closes the drawer.
 * @param {(id: string|number) => void} props.remove Removes a product from the cart.
 * @param {(id: string|number, change: number) => void} props.changeQuantity Changes a quantity by ±1.
 * @param {() => void} props.checkout Starts checkout.
 * @param {object[]} [props.products] Store products.
 * @param {object[]} [props.coupons] Offers shown until the coupon API answers.
 * @param {(id: string|number) => void} [props.onAdd] Adds a recommended product.
 * @param {(message: string) => void} [props.notify] Shows a toast.
 * @param {object|null} [props.currentUser] Signed-in customer.
 * @param {object} [props.shippingOption] Selected shipping option.
 * @param {(option: object) => void} [props.onSelectShipping] Selects a shipping option.
 */
export function CartDrawer({
  cart = [],
  close,
  remove,
  changeQuantity,
  checkout,
  products = [],
  coupons = [],
  onAdd,
  notify,
  currentUser,
  shippingOption = { method: "standard", name: "Standard Shipping", price: 0 },
  onSelectShipping = () => {},
}) {
  const {
    activeModal,
    openModal,
    closeModal,
    lineItems,
    deliveryDates,
    recommendedProducts,
    addRecommended,
    totals,
    showBreakdown,
    toggleBreakdown,
    note,
    share,
    discount,
    shipping,
  } = useCartDrawer({
    cart, products, coupons, currentUser, shippingOption,
    onSelectShipping, onAdd, changeQuantity, notify,
  });

  return (
    <div className="cart-modal-backdrop" onClick={close}>
      <div
        className="cart-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Your Cart"
      >
        <CartDrawerHeader itemCount={cart.length} onClose={close} />

        {/* The free-shipping progress strip (.cart-shipping-banner) is disabled; see git history. */}

        {cart.length === 0 ? (
          <CartEmptyState onStartShopping={close} />
        ) : (
          <div className="cart-modal-body">
            <div className="cart-left-column">
              <CartLineItems
                items={lineItems}
                deliveryDates={deliveryDates}
                onChangeQuantity={changeQuantity}
                onRemove={remove}
              />
              <CartToolbar
                hasOrderNote={Boolean(note.value)}
                hasCoupon={Boolean(discount.appliedCoupon)}
                onOpen={openModal}
              />
              <CartSummary
                totals={totals}
                appliedCoupon={discount.appliedCoupon}
                showBreakdown={showBreakdown}
                onToggleBreakdown={toggleBreakdown}
                onCheckout={() => {
                  close();
                  checkout();
                }}
              />
            </div>

            <CartRecommendations
              products={recommendedProducts}
              onAdd={addRecommended}
            />
          </div>
        )}

        {activeModal === "share" && (
          <CartSharePanel
            url={share.url}
            copied={share.copied}
            onCopy={share.copy}
            onClose={closeModal}
          />
        )}
        {activeModal === "note" && (
          <CartNotePanel
            note={note.value}
            onNoteChange={note.setValue}
            saved={note.saved}
            onSave={note.save}
            onClose={closeModal}
          />
        )}
        {activeModal === "shipping" && (
          <CartShippingPanel
            showSavedAddresses={Boolean(currentUser)}
            estimate={shipping}
            selectedMethod={shippingOption.method}
            onSelectShipping={onSelectShipping}
            onClose={closeModal}
          />
        )}
        {activeModal === "discount" && (
          <CartDiscountPanel discount={discount} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}
