import { InventoryValuationModal, StatCardGrid, usePageStats } from "../stats";

/**
 * Stat cards for the current admin page plus the inventory valuation
 * breakdown opened from the Products "Inventory value" card. Renders nothing
 * for pages without statistics.
 * @param {Object} props
 * @param {string} props.page Admin page id.
 * @param {Object} [props.stats={}] Store totals from the dashboard API.
 * @param {Array<Object>} [props.rows=[]] Filtered rows of the page.
 * @param {Array<Object>} [props.allRows=[]] All rows of the page.
 * @param {Object} [props.catalog={}] Catalog categories and brands.
 * @param {(page: string) => void} [props.onNavigate]
 * @param {string} [props.query=""] Current search text.
 * @param {(query: string) => void} [props.setQuery]
 * @param {string} [props.activeFilter] Low stock filter in use.
 * @param {(filter: string) => void} [props.onStockFilterChange]
 */
export function PageStats({
  page,
  stats = {},
  rows = [],
  allRows = [],
  catalog = {},
  onNavigate,
  query = "",
  setQuery,
  activeFilter,
  onStockFilterChange,
}) {
  const { cards, inventory, isValuationOpen, closeValuation, manageLowStock } = usePageStats({
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
  });

  if (!cards.length) return null;

  return (
    <>
      <StatCardGrid cards={cards} />

      {/* Interactive Inventory Valuation Breakdown Modal */}
      {isValuationOpen && (
        <InventoryValuationModal
          inventory={inventory}
          onClose={closeValuation}
          onManageLowStock={manageLowStock}
        />
      )}
    </>
  );
}
