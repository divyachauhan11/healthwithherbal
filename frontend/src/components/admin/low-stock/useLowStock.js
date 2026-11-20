"use client";

import { useMemo, useState } from "react";
import { updateAdminProductStock } from "@/lib/admin-api";
import { filterLowStockProducts, isLowStockProduct } from "./low-stock-utils";

/**
 * Owns the low-stock view: products at or below their threshold, the stock-band filter,
 * per-row "set exact stock" inputs and stock updates (quick restock or exact quantity).
 * @param {{rows: Array<object>, query: string, token: string, onRefresh?: Function}} options
 * @returns {{
 *   lowStockItems: Array<object>, displayedItems: Array<object>, stockFilter: string,
 *   setStockFilter: Function, restockingId: string|null, customStockInputs: Object<string, string>,
 *   setCustomStockInput: (productId: string, value: string) => void,
 *   quickRestock: (productId: string, addAmount: number) => Promise<void>,
 *   setExactStock: (productId: string) => Promise<void>
 * }}
 */
export function useLowStock({ rows, query, token, onRefresh }) {
  const [stockFilter, setStockFilter] = useState("all");
  const [restockingId, setRestockingId] = useState(null);
  const [customStockInputs, setCustomStockInputs] = useState({});

  const lowStockItems = useMemo(
    () => (rows || []).filter(isLowStockProduct),
    [rows],
  );

  const displayedItems = useMemo(
    () => filterLowStockProducts(lowStockItems, stockFilter, query),
    [lowStockItems, stockFilter, query],
  );

  const updateStockQuantity = async ({ productId, quantity, reason, onSuccess }) => {
    setRestockingId(productId);
    try {
      await updateAdminProductStock(productId, { stockQty: quantity, reason }, token);
      onSuccess?.();
      onRefresh?.();
    } catch (error) {
      alert(error.message || "Failed to update stock");
    } finally {
      setRestockingId(null);
    }
  };

  const quickRestock = async (productId, addAmount) => {
    const product = lowStockItems.find((item) => item._id === productId);
    if (!product || !token) return;

    await updateStockQuantity({
      productId,
      quantity: Number(product.stockQty ?? 0) + addAmount,
      reason: `Quick restock (+${addAmount})`,
    });
  };

  const setExactStock = async (productId) => {
    const quantity = Number(customStockInputs[productId]);
    if (!Number.isFinite(quantity) || quantity < 0) {
      alert("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    await updateStockQuantity({
      productId,
      quantity,
      reason: "Manual stock adjustment",
      onSuccess: () =>
        setCustomStockInputs((current) => ({ ...current, [productId]: "" })),
    });
  };

  const setCustomStockInput = (productId, value) =>
    setCustomStockInputs((current) => ({
      ...current,
      [productId]: value,
    }));

  return {
    lowStockItems,
    displayedItems,
    stockFilter,
    setStockFilter,
    restockingId,
    customStockInputs,
    setCustomStockInput,
    quickRestock,
    setExactStock,
  };
}
