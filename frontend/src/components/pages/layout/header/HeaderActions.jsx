"use client";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { HeaderAccountButton } from "./HeaderAccountButton";
import { HeaderCountButton } from "./HeaderCountButton";

/**
 * Right-hand header actions: mobile search toggle, account, wishlist and bag.
 * @param {object} props
 * @param {object|null} props.currentUser
 * @param {number} props.wishlistCount
 * @param {number} props.cartCount
 * @param {() => void} props.onToggleSearch Toggles the mobile search bar.
 * @param {() => void} props.onAccount
 * @param {() => void} props.onWishlist
 * @param {() => void} props.onBag
 */
export function HeaderActions({
  currentUser,
  wishlistCount,
  cartCount,
  onToggleSearch,
  onAccount,
  onWishlist,
  onBag,
}) {
  return (
    <div className="header-actions">
      <button
        type="button"
        className="icon-action mobile-search"
        onClick={onToggleSearch}
        aria-label="Toggle search"
      >
        <Search />
      </button>
      <HeaderAccountButton currentUser={currentUser} onClick={onAccount} />
      <HeaderCountButton
        icon={<Heart />}
        label="Wishlist"
        count={wishlistCount}
        onClick={onWishlist}
      />
      <HeaderCountButton
        icon={<ShoppingBag />}
        label="Bag"
        count={cartCount}
        onClick={onBag}
      />
    </div>
  );
}
