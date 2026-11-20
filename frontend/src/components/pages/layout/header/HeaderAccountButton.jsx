"use client";
import { CircleUserRound } from "lucide-react";

/**
 * Header account button labelled with the customer's first name, or
 * "Account" for guests.
 * @param {{currentUser: object|null, onClick: () => void}} props
 */
export function HeaderAccountButton({ currentUser, onClick }) {
  return (
    <button
      type="button"
      className="icon-action"
      onClick={onClick}
      aria-label={
        currentUser
          ? `View Account for ${currentUser.name}`
          : "Account Login / Signup"
      }
      title={
        currentUser
          ? `Signed in as ${currentUser.name} • View My Account`
          : "Login / Create Account"
      }
    >
      <CircleUserRound />
      <span>
        {currentUser
          ? currentUser.name.trim().split(" ")[0]
          : "Account"}
      </span>
    </button>
  );
}
