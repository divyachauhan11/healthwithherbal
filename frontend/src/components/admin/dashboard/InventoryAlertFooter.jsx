import { ChevronRight } from "lucide-react";

/**
 * "Showing 7 of N" note with a link to all low stock products.
 * @param {{total: number, onViewAll?: () => void}} props
 */
export function InventoryAlertFooter({ total, onViewAll }) {
  return <div className="stock-footer"><span>Showing 7 of {total} low stock products</span><button type="button" className="text-button" onClick={onViewAll}>View all products <ChevronRight size={13} /></button></div>;
}
