"use client";
import { useEffect, useState } from "react";
import { countProductInCart } from "./product-utils";

/**
 * Owns the quantity selected on the product page, kept between 1 and what
 * stock still allows after the units already in the bag.
 * @param {object} options
 * @param {object|null} options.product
 * @param {Array<string|number>} options.cart
 * @returns {{quantity: number, setQuantity: Function, maxAddQuantity: number}}
 *   `maxAddQuantity` is `Number.MAX_SAFE_INTEGER` for products without a stock limit.
 */
export function useProductQuantity({ product, cart }) {
  const [quantity, setQuantity] = useState(1);
  const stockLimit = Number(product?.stockQty);
  const hasStockLimit = product?.stockQty != null && Number.isFinite(stockLimit);
  const alreadyInCart = countProductInCart(cart, product);
  const maxAddQuantity = hasStockLimit
    ? Math.max(0, stockLimit - alreadyInCart)
    : Number.MAX_SAFE_INTEGER;

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, maxAddQuantity)));
  }, [product?.id, product?._id, maxAddQuantity]);

  return { quantity, setQuantity, maxAddQuantity };
}
