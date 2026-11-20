"use client";
import { useMemo, useState } from "react";
import {
  buildCartLineItems,
  estimateDeliveryWindow,
  pickRecommendedProducts,
  shippingCostFor,
  sumLineItems,
} from "./cart-utils";
import { useCartCoupons } from "./useCartCoupons";
import { useCartShippingEstimate } from "./useCartShippingEstimate";
import { useCartSync } from "./useCartSync";

/**
 * State for the cart drawer: the open toolbar panel, line items and totals,
 * the order note, share link, price breakdown toggle, recommendations, plus
 * the discount ({@link useCartCoupons}) and shipping
 * ({@link useCartShippingEstimate}) panels and the debounced backend sync
 * ({@link useCartSync}).
 * @param {object} options CartDrawer props used by the drawer state.
 * @returns {{
 *   activeModal: null|"share"|"note"|"shipping"|"discount",
 *   openModal: (modal: string) => void, closeModal: () => void,
 *   lineItems: object[], deliveryDates: {start: string, end: string},
 *   recommendedProducts: object[], addRecommended: (id: string|number) => void,
 *   totals: {rawMrpTotal: number, itemSavings: number, couponDiscount: number, shippingCost: number, toPay: number, totalSaved: number},
 *   showBreakdown: boolean, toggleBreakdown: () => void,
 *   note: {value: string, setValue: Function, saved: boolean, save: () => void},
 *   share: {url: string, copied: boolean, copy: () => void},
 *   discount: ReturnType<typeof useCartCoupons>,
 *   shipping: ReturnType<typeof useCartShippingEstimate>,
 * }}
 */
export function useCartDrawer({
  cart,
  products,
  coupons,
  currentUser,
  shippingOption,
  onSelectShipping,
  onAdd,
  changeQuantity,
  notify,
}) {
  // Active sub-modal: null | "share" | "note" | "shipping" | "discount"
  const [activeModal, setActiveModal] = useState(null);
  const [orderNote, setOrderNote] = useState("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const lineItems = useMemo(
    () => buildCartLineItems(cart, products),
    [cart, products],
  );
  const rawMrpTotal = useMemo(
    () => sumLineItems(lineItems, "totalOriginal"),
    [lineItems],
  );
  const rawSellingTotal = useMemo(
    () => sumLineItems(lineItems, "totalSelling"),
    [lineItems],
  );

  // Effect order matters: coupons load, then saved addresses, then cart sync.
  const discount = useCartCoupons({ initialCoupons: coupons, subtotal: rawSellingTotal });
  const shipping = useCartShippingEstimate({
    activeModal,
    currentUser,
    subtotal: rawSellingTotal,
    onSelectShipping,
  });
  useCartSync({ cart, lineItems, orderNote, appliedCoupon: discount.appliedCoupon });

  const itemSavings = Math.max(0, rawMrpTotal - rawSellingTotal);
  const { couponDiscount } = discount;
  const shippingCost = shippingCostFor(shippingOption, discount.appliedCoupon);
  const toPay = Math.max(0, rawSellingTotal - couponDiscount + shippingCost);
  const totalSaved = itemSavings + couponDiscount;

  const deliveryDates = useMemo(() => estimateDeliveryWindow(), []);

  const recommendedProducts = useMemo(
    () => pickRecommendedProducts(products, cart),
    [products, cart],
  );

  const shareCartUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://healthwithherbal.com";
    return `${window.location.origin}${window.location.pathname}?cart=${cart.join(",")}`;
  }, [cart]);

  const addRecommended = (id) => {
    if (onAdd) {
      onAdd(id);
    } else if (changeQuantity) {
      changeQuantity(id, 1);
    }
    if (notify) {
      notify("Item added to cart!");
    }
  };

  const copyShareLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareCartUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    }
  };

  const saveNote = () => {
    setNoteSavedFeedback(true);
    setTimeout(() => {
      setNoteSavedFeedback(false);
      setActiveModal(null);
    }, 900);
  };

  return {
    activeModal,
    openModal: setActiveModal,
    closeModal: () => setActiveModal(null),
    lineItems,
    deliveryDates,
    recommendedProducts,
    addRecommended,
    totals: { rawMrpTotal, itemSavings, couponDiscount, shippingCost, toPay, totalSaved },
    showBreakdown,
    toggleBreakdown: () => setShowBreakdown((prev) => !prev),
    note: { value: orderNote, setValue: setOrderNote, saved: noteSavedFeedback, save: saveNote },
    share: { url: shareCartUrl, copied: copyFeedback, copy: copyShareLink },
    discount,
    shipping,
  };
}
