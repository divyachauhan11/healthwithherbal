/**
 * The floating list that holds the row action buttons. Clicks inside it never
 * reach the table row underneath.
 * @param {{dropdownRef: Object, openUpwards: boolean, position: Object, children: React.ReactNode}} props
 */
export function RowActionsDropdown({ dropdownRef, openUpwards, position, children }) {
  return (
    <div
      ref={dropdownRef}
      className={`row-actions-dropdown ${openUpwards ? "upwards" : "downwards"}`}
      style={position}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
