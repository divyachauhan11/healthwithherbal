import { CartSubmodal } from "./CartSubmodal";

/**
 * "Share cart" panel with the cart link and a copy button.
 * @param {object} props
 * @param {string} props.url Shareable cart URL.
 * @param {boolean} props.copied Shows the copied confirmation.
 * @param {() => void} props.onCopy Copies the link.
 * @param {() => void} props.onClose Closes the panel.
 */
export function CartSharePanel({ url, copied, onCopy, onClose }) {
  return (
    <CartSubmodal title="Share cart" onClose={onClose}>
      <label className="cart-submodal-label">Share link</label>
      <div className="cart-share-input-wrap">
        <input
          type="text"
          readOnly
          value={url}
          className="cart-share-input"
          onClick={(e) => e.target.select()}
        />
      </div>

      <button
        type="button"
        className="cart-submodal-btn"
        onClick={onCopy}
      >
        {copied ? "Copied! ✓" : "Copy link"}
      </button>
    </CartSubmodal>
  );
}
