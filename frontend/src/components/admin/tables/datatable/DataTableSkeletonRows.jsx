/**
 * Placeholder rows shown while a table is loading.
 * @param {{columns: Array<Object>, rowCount: number}} props
 */
export function DataTableSkeletonRows({ columns, rowCount }) {
  return Array.from({ length: rowCount }).map((_, rIdx) => (
    <tr key={`skeleton-${rIdx}`}>
      {columns.map((col, cIdx) => (
        <td key={`skeleton-${rIdx}-${cIdx}`}>
          <div
            className="datatable-skeleton-cell"
            style={{
              width: cIdx === 0 ? "70%" : cIdx === 1 ? "45%" : "60%",
            }}
          />
        </td>
      ))}
    </tr>
  ));
}
