"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createOrder, createPayuCheckout, fetchPayuStatus } from "@/lib/api";
import { saveLastOrder } from "@/lib/session";
import { shippingCostFor } from "@/components/pages/cart/cart-utils";
import {
  CHECKOUT_FORM_ID,
  MISSING_ADDRESS_MESSAGE,
  buildCheckoutLineItems,
  buildOrderPayload,
  checkoutMrpTotal,
  checkoutSubtotal,
  hasDeliveryAddress,
  shippingOptionForDestination,
} from "./checkout-utils";
import { useCheckoutAddresses } from "./useCheckoutAddresses";
import { useCheckoutCoupon } from "./useCheckoutCoupon";

/** Submit the checkout form (runs its submit handler, which places the order). */
const requestCheckoutSubmit = () =>
  document.getElementById(CHECKOUT_FORM_ID)?.requestSubmit();

/** How long "Pay Now" stays disabled while the browser leaves for PayU. */
const PAYU_REDIRECT_GRACE_MS = 20000;

/**
 * Post the PayU payment fields through a hidden form, leaving the page.
 * @param {{action: string, fields: Record<string, *>}} payment
 */
function submitPayuForm(payment) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payment.action;
  Object.entries(payment.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

/**
 * Checkout page state: the address → payment step, PayU availability,
 * line items and totals (coupon via {@link useCheckoutCoupon}, addresses via
 * {@link useCheckoutAddresses}), address validation and order placement
 * (cash on delivery, or a redirect to PayU).
 * @param {object} options
 * @param {Array<string|number>} options.cart Cart product IDs, one per unit.
 * @param {object[]} options.products Store products.
 * @param {object|null} options.currentUser Signed-in customer.
 * @param {{method?: string, name?: string, price?: number}} options.shippingOption Selected shipping option.
 * @param {(order: object) => void} options.onComplete Called with the placed cash-on-delivery order.
 * @returns {{
 *   step: "address"|"payment", backToAddress: () => void, error: string, submitting: boolean,
 *   lineItems: object[],
 *   totals: {totalMrp: number, mrpSavings: number, discountAmount: number, shippingFee: number, finalTotal: number},
 *   coupon: ReturnType<typeof useCheckoutCoupon>, addresses: ReturnType<typeof useCheckoutAddresses>,
 *   payment: {method: string, payuAvailable: boolean, selectCashOnDelivery: () => void, payWithPayu: () => void},
 *   placeOrder: (event: Event) => Promise<void>, submitDisabled: boolean, submitStep: () => void,
 * }}
 */
export function useCheckout({ cart, products, currentUser, shippingOption, onComplete }) {
  const [checkoutStep, setCheckoutStep] = useState("address");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  // Read at submit time: the PayU button sets it and submits in one click.
  const paymentMethodRef = useRef("cash_on_delivery");
  const [payuAvailable, setPayuAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPayuStatus()
      .then((result) => { if (active) setPayuAvailable(Boolean(result.available)); })
      .catch(() => { if (active) setPayuAvailable(false); });
    return () => { active = false; };
  }, []);

  // Coming back from PayU with the browser's Back button can restore this page
  // from the back/forward cache with the place-order buttons still disabled.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) setSubmitting(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const lineItems = useMemo(
    () => buildCheckoutLineItems(cart, products),
    [cart, products],
  );
  const rawSubtotal = useMemo(() => checkoutSubtotal(lineItems), [lineItems]);
  const totalMrp = useMemo(() => checkoutMrpTotal(lineItems), [lineItems]);
  const mrpSavings = Math.max(0, totalMrp - rawSubtotal);

  const coupon = useCheckoutCoupon({ subtotal: rawSubtotal });
  const addresses = useCheckoutAddresses({ currentUser });
  const { selectedAddressId, formData } = addresses;
  const { appliedCoupon, discountAmount } = coupon;

  // The option chosen in the bag may not ship to the selected address.
  const deliveryShippingOption = useMemo(
    () => shippingOptionForDestination(shippingOption, formData.country),
    [shippingOption, formData.country],
  );
  const shippingFee = shippingCostFor(deliveryShippingOption, appliedCoupon);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const continueToPayment = () => {
    if (!hasDeliveryAddress(selectedAddressId, formData)) {
      setError(MISSING_ADDRESS_MESSAGE);
      return;
    }
    setError("");
    setCheckoutStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (checkoutStep !== "payment") return;
    const selectedPaymentMethod = paymentMethodRef.current;
    if (!hasDeliveryAddress(selectedAddressId, formData)) {
      setError(MISSING_ADDRESS_MESSAGE);
      return;
    }
    setSubmitting(true);
    setError("");
    let leavingForPayu = false;

    try {
      const orderPayload = buildOrderPayload({
        formData,
        currentUser,
        lineItems,
        appliedCoupon,
        shippingOption: deliveryShippingOption,
      });
      if (selectedPaymentMethod === "payu") {
        const checkout = await createPayuCheckout(orderPayload);
        try {
          saveLastOrder(checkout.order);
        } catch {}
        submitPayuForm(checkout.payment);
        leavingForPayu = true;
        // If the browser never leaves (navigation stopped or blocked), let the
        // customer try again after a grace period instead of staying stuck.
        window.setTimeout(() => setSubmitting(false), PAYU_REDIRECT_GRACE_MS);
        return;
      }
      const order = await createOrder(orderPayload);
      onComplete(order);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not place your order.",
      );
    } finally {
      // While the browser is leaving for PayU, keep the buttons disabled so a
      // second click cannot create a duplicate order.
      if (!leavingForPayu) setSubmitting(false);
    }
  };

  const selectCashOnDelivery = () => {
    paymentMethodRef.current = "cash_on_delivery";
    setPaymentMethod("cash_on_delivery");
    setError("");
  };

  const payWithPayu = () => {
    paymentMethodRef.current = "payu";
    setPaymentMethod("payu");
    setError("");
    requestCheckoutSubmit();
  };

  const submitStep = () => {
    if (checkoutStep === "address") {
      continueToPayment();
      return;
    }
    requestCheckoutSubmit();
  };

  return {
    step: checkoutStep,
    backToAddress: () => setCheckoutStep("address"),
    error,
    submitting,
    lineItems,
    totals: { totalMrp, mrpSavings, discountAmount, shippingFee, finalTotal },
    shippingOption: deliveryShippingOption,
    coupon,
    addresses,
    payment: { method: paymentMethod, payuAvailable, selectCashOnDelivery, payWithPayu },
    placeOrder,
    submitDisabled:
      submitting ||
      lineItems.length === 0 ||
      (checkoutStep === "address" && !selectedAddressId),
    submitStep,
  };
}
