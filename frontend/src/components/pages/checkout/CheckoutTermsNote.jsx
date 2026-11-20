/**
 * Agreement note linking to the Privacy Policy.
 * @param {object} props
 * @param {(label: string) => void} [props.onOpenContent] Opens a content page.
 */
export function CheckoutTermsNote({ onOpenContent }) {
  return (
    <p className="checkout-terms-note">
      By placing the order, you agree to our{" "}
      {/* <button type="button" onClick={() => onOpenContent?.("Terms & Conditions")}>
      Terms of Use
    </button>{" "}
    and{" "} */}
      <button
        type="button"
        onClick={() => onOpenContent?.("Privacy Policy")}
      >
        Privacy Policy
      </button>
      .
    </p>
  );
}
