"use client";

/**
 * Footer "Customer care" links: account, order history, wishlist and policies.
 * @param {object} props
 * @param {() => void} props.openAuthModal Opens the account (or sign-in for guests).
 * @param {() => void} props.openOrderHistory
 * @param {(page: string) => void} props.navigate
 * @param {(page: string) => void} props.openContent
 */
export function FooterCustomerCareLinks({
  openAuthModal,
  openOrderHistory,
  navigate,
  openContent,
}) {
  return (
    <>
      <button type="button" onClick={openAuthModal}>
        My Account
      </button>
      <button type="button" onClick={openOrderHistory}>
        Order History
      </button>
      <button type="button" onClick={() => navigate("wishlist")}>
        Wishlist
      </button>
      <button type="button" onClick={() => openContent("Shipping Policy")}>
        Shipping Policy
      </button>
      <button
        type="button"
        onClick={() => openContent("Returns & Refunds")}
      >
        Returns & Refunds
      </button>
    </>
  );
}
