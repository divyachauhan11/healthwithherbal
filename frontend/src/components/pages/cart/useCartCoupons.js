"use client";
import { useEffect, useMemo, useState } from "react";
import { listCoupons, validateCoupon } from "@/lib/api";
import { couponDiscountFor, couponSavingsLabel, toCouponOffers } from "./cart-utils";

/**
 * Cart drawer discount state: the available offers (refreshed from the API on
 * mount), the code input, live coupon validation and the applied coupon.
 * @param {object} options
 * @param {object[]} options.initialCoupons Offers to show until the API answers.
 * @param {number} options.subtotal Cart total at selling prices.
 * @returns {{
 *   discountInput: string, setDiscountInput: Function,
 *   appliedCoupon: object|null, couponDiscount: number,
 *   discountMsg: {type: string, text: string}, validatingCoupon: boolean,
 *   availableCoupons: object[],
 *   applyCoupon: (code?: string) => Promise<void>, removeCoupon: () => void,
 * }}
 */
export function useCartCoupons({ initialCoupons, subtotal }) {
  const [discountInput, setDiscountInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountMsg, setDiscountMsg] = useState({ type: "", text: "" });
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [backendCoupons, setBackendCoupons] = useState(initialCoupons);

  useEffect(() => {
    let active = true;
    listCoupons()
      .then((result) => {
        if (active && Array.isArray(result)) setBackendCoupons(result);
      })
      .catch((err) => {
        console.error("Failed to load available coupons:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const availableCoupons = useMemo(
    () => toCouponOffers(backendCoupons),
    [backendCoupons],
  );

  const couponDiscount = useMemo(
    () => couponDiscountFor(appliedCoupon, subtotal),
    [appliedCoupon, subtotal],
  );

  const applyCoupon = async (codeToApply) => {
    const code = (codeToApply || discountInput).trim().toUpperCase();
    if (!code) {
      setDiscountMsg({ type: "error", text: "Please enter a discount code" });
      return;
    }

    setValidatingCoupon(true);
    setDiscountMsg({ type: "", text: "" });

    try {
      const dbCoupon = await validateCoupon(code);

      if (dbCoupon.minOrderAmount && subtotal < dbCoupon.minOrderAmount) {
        setDiscountMsg({
          type: "error",
          text: `This coupon requires a minimum cart total of Rs. ${dbCoupon.minOrderAmount}`,
        });
        return;
      }

      setAppliedCoupon(dbCoupon);
      setDiscountInput(dbCoupon.code);
      setDiscountMsg({
        type: "success",
        text: `Coupon “${dbCoupon.code}” applied! You saved ${couponSavingsLabel(dbCoupon)}!`,
      });
    } catch (err) {
      setDiscountMsg({
        type: "error",
        text: err.message || `“${code}” is not a valid coupon code`,
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountInput("");
    setDiscountMsg({ type: "", text: "" });
  };

  return {
    discountInput,
    setDiscountInput,
    appliedCoupon,
    couponDiscount,
    discountMsg,
    validatingCoupon,
    availableCoupons,
    applyCoupon,
    removeCoupon,
  };
}
