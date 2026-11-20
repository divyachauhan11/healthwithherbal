"use client";

/**
 * Storefront button (`.app-button`).
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {"primary"|"outline"|"light"|"ghost"} [props.variant="primary"]
 * @param {string} [props.className] Extra classes.
 * @param {(event: Event) => void} [props.onClick]
 * @param {"button"|"submit"|"reset"} [props.type="button"]
 * @param {boolean} [props.disabled=false]
 */
export function AppButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`app-button ${variant} ${className}`}
    >
      {children}
    </button>
  );
}
