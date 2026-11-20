import { ShoppingBag } from "lucide-react";

/**
 * Prompt shown on the account page to signed-out visitors.
 * @param {object} props
 * @param {() => void} props.onLogin Opens the login / sign-up dialog.
 */
export function AccountLoggedOutCard({ onLogin }) {
  return (
    <div className="account-logged-out-card">
      <div className="account-avatar-placeholder">
        <ShoppingBag size={32} />
      </div>
      <h2>Please Log In</h2>
      <p>Sign in to view your orders, addresses, and account details.</p>
      <button
        type="button"
        className="app-button"
        style={{ marginTop: "16px", minWidth: "200px" }}
        onClick={onLogin}
      >
        Log In or Sign Up
      </button>
    </div>
  );
}
