/**
 * Full-width row shown when there are no rows to display.
 * @param {{colSpan: number, children: React.ReactNode}} props
 */
export function DataTableEmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
