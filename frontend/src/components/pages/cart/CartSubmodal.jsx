import { X } from "lucide-react";

/**
 * Overlay card used by the cart tool panels: a titled header with a close
 * button and a body holding the panel content.
 * @param {object} props
 * @param {string} props.title Panel heading.
 * @param {() => void} props.onClose Closes the panel (close button).
 * @param {(event: object) => void} [props.onOverlayClick] Overlay click handler; defaults to `onClose`.
 * @param {string} [props.overlayClassName] Overlay classes.
 * @param {string} [props.cardClassName] Card classes.
 * @param {React.ReactNode} props.children Panel body content.
 */
export function CartSubmodal({
  title,
  onClose,
  onOverlayClick = onClose,
  overlayClassName = "cart-submodal-overlay",
  cardClassName = "cart-submodal-card",
  children,
}) {
  return (
    <div
      className={overlayClassName}
      onClick={onOverlayClick}
    >
      <div
        className={cardClassName}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-submodal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="cart-submodal-close"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <div className="cart-submodal-body">{children}</div>
      </div>
    </div>
  );
}
