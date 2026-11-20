/**
 * Button wrapping a count badge. Clicking it never triggers the row click.
 * @param {{title: string, onActivate: () => void, children: React.ReactNode}} props
 */
export function CountActionButton({ title, onActivate, children }) {
  return (
    <button
      type="button"
      className="category-count-action"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onActivate();
      }}
    >
      {children}
    </button>
  );
}
