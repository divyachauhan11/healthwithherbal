import { CountActionButton, ProductCountBadge, getRecordProductCount } from "../shared";

/**
 * Product count of a brand; links to the brand's products when there are any.
 * @param {{brand: Object, onNavigate?: Function}} props
 */
export function BrandProductCount({ brand, onNavigate }) {
  const count = getRecordProductCount(brand);
  const badge = <ProductCountBadge count={count} />;
  if (!onNavigate || count <= 0) return badge;
  return (
    <CountActionButton
      title={`View ${count} products for ${brand.name}`}
      onActivate={() => onNavigate("Products", brand.name)}
    >
      {badge}
    </CountActionButton>
  );
}
