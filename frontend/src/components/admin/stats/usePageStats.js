import { useState } from "react";
import { getPageStatCards } from "./page-stat-cards";
import { resolveStatsRows, summarizeInventory } from "./stats-utils";

/**
 * Owns the page statistics: the stat cards for the current admin page, the
 * inventory summary and whether the inventory valuation breakdown is open.
 * @param {Object} options PageStats props (page, stats, rows, allRows, catalog, onNavigate, query, setQuery, activeFilter, onStockFilterChange).
 * @returns {{cards: Array<Object>, inventory: Object, isValuationOpen: boolean, closeValuation: () => void, manageLowStock: () => void}}
 */
export function usePageStats({
  page,
  stats,
  rows,
  allRows,
  catalog,
  onNavigate,
  query,
  setQuery,
  activeFilter,
  onStockFilterChange,
}) {
  const [valuationModal, setValuationModal] = useState(false);

  const targetRows = resolveStatsRows({ page, rows, allRows, catalog });
  const inventory = summarizeInventory(targetRows);
  const cards = getPageStatCards(page, {
    stats,
    rows,
    allRows,
    targetRows,
    inventory,
    onNavigate,
    query,
    setQuery,
    activeFilter,
    onStockFilterChange,
    openValuation: () => setValuationModal(true),
  });

  return {
    cards,
    inventory,
    isValuationOpen: valuationModal,
    closeValuation: () => setValuationModal(false),
    manageLowStock: () => {
      setValuationModal(false);
      onNavigate?.("Low Stock");
    },
  };
}
