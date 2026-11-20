import { Boxes, Check, Package, TrendingUp } from "lucide-react";
import { livePercentage } from "./stats-utils";

/**
 * Stat cards of the Brands page: total (clears the search), active, brands
 * with a logo and trusted makers.
 * @param {{targetRows: Array<Object>, query: string, setQuery?: (query: string) => void}} context
 * @returns {Array<Object>} StatCard props.
 */
export function getBrandStatCards({ targetRows, query, setQuery }) {
  const totalBrands = targetRows.length;
  const activeBrands = targetRows.filter((b) => b.isActive !== false).length;
  const activePct = livePercentage(activeBrands, totalBrands);
  const withImages = targetRows.filter(
    (b) =>
      b.image ||
      b.logoUrl ||
      (Array.isArray(b.images) && b.images.length > 0),
  ).length;

  return [
    {
      id: "brand_all",
      label: "Brands",
      value: totalBrands,
      badge: query ? "Filtered" : "All items",
      pulseAlert: Boolean(query),
      sub: query ? `Filter: "${query}"` : "Total in catalog",
      tone: "forest",
      icon: Package,
      onClick: query && setQuery ? () => setQuery("") : undefined,
      hint: query ? "Clear" : undefined,
    },
    {
      id: "brand_active",
      label: "Active",
      value: activeBrands,
      badge: `${activePct}% live`,
      pulseDot: true,
      sub: "Storefront visible",
      tone: "emerald",
      icon: Check,
    },
    {
      id: "brand_logos",
      label: "Branded Media",
      value: withImages,
      badge: `${withImages} with logo`,
      sub: "Verified brand identity",
      tone: "amber",
      icon: TrendingUp,
    },
    {
      id: "brand_catalog",
      label: "Ayurvedic Makers",
      value: totalBrands,
      badge: "Trusted partners",
      sub: "Certified herbal houses",
      tone: "gold",
      icon: Boxes,
    },
  ];
}
