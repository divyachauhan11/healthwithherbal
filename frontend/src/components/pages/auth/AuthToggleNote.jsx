/**
 * "New here? / Already have an account?" line with a link-style action.
 * @param {object} props
 * @param {string} props.prompt Leading text.
 * @param {string} props.actionLabel Button label.
 * @param {() => void} props.onAction
 * @param {import("react").CSSProperties} [props.style] Optional inline style of the line.
 */
export function AuthToggleNote({ prompt, actionLabel, onAction, style }) {
  return (
    <p className="auth-toggle-note" style={style}>
      {prompt}{" "}
      <button
        type="button"
        onClick={onAction}
        className="auth-link-btn"
      >
        {actionLabel}
      </button>
    </p>
  );
}
