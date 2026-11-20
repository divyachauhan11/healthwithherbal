import { ChevronRight } from "lucide-react";

/**
 * "View all (N)" header link of the inventory alert panel.
 * @param {{count: number, onViewAll?: () => void}} props
 */
export function InventoryAlertViewAll({ count, onViewAll }) {
  return <button type="button" className="text-button" onClick={onViewAll}>View all {count ? `(${count})` : ""}<ChevronRight size={15} /></button>;
}
