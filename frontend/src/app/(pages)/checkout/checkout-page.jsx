"use client";
import {
  CHECKOUT_FORM_ID,
  CheckoutAddressFormModal,
  CheckoutAddressStep,
  CheckoutHeader,
  CheckoutIntro,
  CheckoutOrderSummary,
  CheckoutPaymentStep,
  CheckoutRemoveAddressModal,
  useCheckout,
} from "@/components/pages/checkout";

/**
 * Checkout page: delivery address step, then payment (cash on delivery or
 * PayU), beside the order summary. State lives in {@link useCheckout}.
 * @param {object} props
 * @param {Array<string|number>} props.cart Cart product IDs, one entry per unit.
 * @param {number} [props.total] Storefront cart total (unused; totals are computed here).
 * @param {(order: object) => void} props.onComplete Called with the placed cash-on-delivery order.
 * @param {object[]} [props.products] Store products.
 * @param {object[]} [props.coupons] Store coupons offered as chips.
 * @param {object|null} [props.currentUser] Signed-in customer.
 * @param {object} [props.shippingOption] Selected shipping option.
 * @param {(page: string) => void} [props.navigate] Storefront navigation.
 * @param {(label: string) => void} [props.openContent] Opens a content page.
 */
export function CheckoutPage({
  cart,
  onComplete,
  products = [],
  coupons = [],
  currentUser = null,
  shippingOption = { method: "standard", name: "Standard Shipping", price: 0 },
  navigate,
  openContent,
}) {
  const {
    step,
    backToAddress,
    error,
    submitting,
    lineItems,
    totals,
    coupon,
    addresses,
    payment,
    placeOrder,
    submitDisabled,
    submitStep,
  } = useCheckout({ cart, products, currentUser, shippingOption, onComplete });

  return (
    <div className="checkout-flow-page">
      <CheckoutHeader step={step} onLogoClick={() => navigate?.("home")} />

      <main className="checkout-page page-width">
        <div className="checkout-form">
          <CheckoutIntro step={step} />

          {step === "address" && (
            <CheckoutAddressStep
              loading={addresses.loadingAddresses}
              defaultAddress={addresses.defaultAddress}
              otherAddresses={addresses.otherAddresses}
              selectedAddressId={addresses.selectedAddressId}
              error={addresses.addressError}
              onAddAddress={addresses.startNewAddress}
              onSelectAddress={addresses.selectAddress}
              onEditAddress={addresses.editAddress}
              onRemoveAddress={addresses.requestRemoveAddress}
            />
          )}

          <form id={CHECKOUT_FORM_ID} onSubmit={placeOrder}>
            {step === "payment" && (
              <CheckoutPaymentStep
                paymentMethod={payment.method}
                payuAvailable={payment.payuAvailable}
                submitting={submitting}
                onBack={backToAddress}
                onSelectCashOnDelivery={payment.selectCashOnDelivery}
                onPayWithPayu={payment.payWithPayu}
              />
            )}
          </form>
        </div>

        <CheckoutOrderSummary
          itemCount={cart.length}
          lineItems={lineItems}
          coupons={coupons}
          coupon={coupon}
          totals={totals}
          shippingLabel={shippingOption.name}
          error={error}
          onOpenContent={openContent}
          step={step}
          paymentMethod={payment.method}
          submitting={submitting}
          submitDisabled={submitDisabled}
          onSubmitStep={submitStep}
        />
      </main>

      <CheckoutAddressFormModal
        isOpen={addresses.isAddressModalOpen}
        isEditing={Boolean(addresses.editingAddressId)}
        initial={addresses.addressModalInitial}
        busy={addresses.savingAddress}
        error={addresses.addressError}
        onSave={addresses.saveAddress}
        onClose={addresses.closeAddressModal}
      />

      <CheckoutRemoveAddressModal
        address={addresses.addressToDelete}
        loading={addresses.deletingAddress}
        onCancel={addresses.cancelRemoveAddress}
        onConfirm={addresses.confirmRemoveAddress}
      />
    </div>
  );
}
