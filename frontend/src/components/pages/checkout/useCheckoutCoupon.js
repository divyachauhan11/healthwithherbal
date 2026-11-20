"use client";
import { useMemo, useRef, useState } from "react";
import { validateCoupon } from "@/lib/api";
import { couponDiscountFor } from "@/components/pages/cart/cart-utils";

/**
 * Checkout coupon state: the code input (and its ref), live validation
 * against the API, the applied coupon and its discount on the subtotal.
 * @param {object} options
 * @param {number} options.subtotal Order subtotal at selling prices.
 * @returns {{
 *   codeInput: string, setCodeInput: Function, inputRef: {current: HTMLInputElement|null},
 *   appliedCoupon: object|null, discountAmount: number, error: string, success: string,
 *   applyCoupon: (code?: string) => Promise<void>, removeCoupon: () => void, focusInput: () => void,
 * }}
 */
export function useCheckoutCoupon({ subtotal }) {
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const couponInputRef = useRef(null);

  const discountAmount = useMemo(
    () => couponDiscountFor(appliedCoupon, subtotal),
    [appliedCoupon, subtotal],
  );

  const applyCoupon = async (codeToTry) => {
    const code = (codeToTry || couponCodeInput).trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setCouponSuccess("");

    try {
      const coupon = await validateCoupon(code);
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        setCouponError(
          `This coupon requires a minimum order of ₹${coupon.minOrderAmount}`,
        );
        return;
      }
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon ${coupon.code} applied!`);
      setCouponCodeInput("");
    } catch (err) {
      setCouponError(err.message || "Invalid or expired coupon code.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  return {
    codeInput: couponCodeInput,
    setCodeInput: setCouponCodeInput,
    inputRef: couponInputRef,
    appliedCoupon,
    discountAmount,
    error: couponError,
    success: couponSuccess,
    applyCoupon,
    removeCoupon,
    focusInput: () => couponInputRef.current?.focus(),
  };
}
