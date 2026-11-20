/**
 * "Home / <current>" breadcrumb shown on the contact and policy pages.
 * @param {object} props
 * @param {string} props.className Breadcrumb variant class (`contact-breadcrumb` or `privacy-breadcrumb`).
 * @param {string} props.current Label of the current page.
 */
export function ContentBreadcrumb({ className, current }) {
  return (
    <nav className={className} aria-label="Breadcrumb">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload resets the client-side storefront */}
      <a href="/">Home</a>
      <span aria-hidden="true">/</span>
      <span>{current}</span>
    </nav>
  );
}
