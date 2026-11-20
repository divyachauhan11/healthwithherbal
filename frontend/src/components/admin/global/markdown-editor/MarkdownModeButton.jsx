/**
 * "Write" / "Preview" mode switch button of the markdown toolbar.
 * @param {object} props
 * @param {boolean} props.active Whether this mode is shown.
 * @param {boolean} [props.disabled]
 * @param {() => void} props.onClick
 * @param {import("react").ReactNode} props.children Button text.
 */
export function MarkdownModeButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className={`markdown-mode-button ${active ? "active" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
