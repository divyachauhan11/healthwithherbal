"use client";
import {
  FooterAboutLinks,
  FooterBottom,
  FooterBrand,
  FooterColumn,
  FooterCustomerCareLinks,
  FooterShopLinks,
} from "./footer";

/**
 * Storefront footer: brand block, Shop / Customer care / About link columns
 * and the copyright bar.
 * @param {object} props
 * @param {(page: string) => void} props.navigate
 * @param {(view: string) => void} props.openCatalog
 * @param {(page: string) => void} props.openContent
 * @param {() => void} props.openOrderHistory
 * @param {() => void} props.openAuthModal Opens the account (or sign-in for guests).
 * @param {Array<object>} [props.categories] Navigation categories for the Shop column.
 */
export function Footer({
  navigate,
  openCatalog,
  openContent,
  openOrderHistory,
  openAuthModal,
  categories = [],
}) {
  return (
    <footer>
      <div className="page-width footer-grid">
        <FooterBrand />
        <FooterColumn title="Shop">
          <FooterShopLinks categories={categories} openCatalog={openCatalog} />
        </FooterColumn>
        <FooterColumn title="Customer care">
          <FooterCustomerCareLinks
            openAuthModal={openAuthModal}
            openOrderHistory={openOrderHistory}
            navigate={navigate}
            openContent={openContent}
          />
        </FooterColumn>
        <FooterColumn title="About">
          <FooterAboutLinks openContent={openContent} navigate={navigate} />
        </FooterColumn>
      </div>
      <FooterBottom />
    </footer>
  );
}
