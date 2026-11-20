/**
 * Delete dialog heading and explanation (blocked vs. permanent delete).
 * @param {object} props
 * @param {string} props.kind Admin collection, e.g. "users".
 * @param {string} props.kindSingular Human-readable singular kind.
 * @param {boolean} props.isBlocked Whether deletion is blocked by linked products.
 */
export function DeleteModalIntro({ kind, kindSingular, isBlocked }) {
  return (
    <>
      <h2 id="delete-modal-title" className="admin-delete-modal-title">
        {isBlocked
          ? `Cannot Delete ${kindSingular}`
          : `Delete ${kindSingular}?`}
      </h2>

      <p className="admin-delete-modal-desc">
        {isBlocked ? (
          <>
            This {kindSingular.toLowerCase()} cannot be deleted because it is
            actively assigned to store products. Please reassign or delete
            the linked products first.
          </>
        ) : (
          <>
            Are you sure you want to permanently delete this{" "}
            <strong>{kindSingular.toLowerCase()}</strong>? This action is
            irreversible{kind === "users"
              ? " and will remove this user's admin portal account."
              : " and will remove all related data from your live catalog."}
          </>
        )}
      </p>
    </>
  );
}
