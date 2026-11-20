/**
 * Icon button of the markdown toolbar; keeps the textarea selection on mouse down.
 * @param {object} props
 * @param {string} props.label Tooltip and accessible name.
 * @param {import("react").ComponentType<{size?: number}>} props.icon Lucide icon.
 * @param {() => void} props.onClick Formatting action.
 */
export function MarkdownToolButton({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      className="markdown-tool-button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon size={16} />
    </button>
  );
}
