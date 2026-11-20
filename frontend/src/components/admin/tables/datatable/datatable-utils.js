/**
 * Safely resolves nested property keys (e.g. "category.name" or "user.email")
 * @param {Object} obj Row object.
 * @param {string} path Property name or dot path.
 * @returns {*} The value, or undefined when missing.
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (!path.includes(".")) return obj[path];
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * Columns that should be rendered: drops empty entries and hidden columns.
 * @param {Array<Object>} columns Column definitions (`hide` may be a boolean or `(data) => boolean`).
 * @param {Array<Object>} data Table rows passed to `hide` predicates.
 * @returns {Array<Object>}
 */
export function getVisibleColumns(columns, data) {
  return columns.filter((col) => {
    if (!col) return false;
    if (typeof col.hide === "function") return !col.hide(data);
    return !col.hide;
  });
}

/**
 * Next sort state for a header click: ascending, then descending, then unsorted.
 * @param {{key: string|null, direction: "asc"|"desc"|null}} prev Current sort state.
 * @param {string} key Clicked column key.
 * @returns {{key: string|null, direction: "asc"|"desc"|null}}
 */
export function getNextSortConfig(prev, key) {
  if (prev.key !== key) {
    return { key, direction: "asc" };
  }
  if (prev.direction === "asc") {
    return { key, direction: "desc" };
  }
  return { key: null, direction: null };
}

/**
 * Client-side sort of table rows. Uses the column's `sortFn` when present,
 * otherwise compares numbers, strings (natural order) or stringified values.
 * Missing values always sort last.
 * @param {Array<Object>} rows Rows to sort (not mutated).
 * @param {{key: string|null, direction: "asc"|"desc"|null}} sortConfig
 * @param {Array<Object>} columns Visible columns.
 * @returns {Array<Object>} The same array when unsorted, else a sorted copy.
 */
export function sortRows(rows, sortConfig, columns) {
  if (!sortConfig.key || !sortConfig.direction) {
    return rows;
  }

  const activeCol = columns.find((c) => c.key === sortConfig.key);
  const customSort = activeCol?.sortFn;

  return [...rows].sort((a, b) => {
    if (customSort) {
      const res = customSort(a, b);
      return sortConfig.direction === "asc" ? res : -res;
    }

    const valA = getNestedValue(a, sortConfig.key);
    const valB = getNestedValue(b, sortConfig.key);

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    let comparison = 0;
    if (typeof valA === "number" && typeof valB === "number") {
      comparison = valA - valB;
    } else if (typeof valA === "string" && typeof valB === "string") {
      comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" });
    } else {
      comparison = String(valA) > String(valB) ? 1 : -1;
    }

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * React key for a table row.
 * @param {string|Function} [rowKey] Key field name or `(row, index) => key`.
 * @param {Object} row
 * @param {number} index Index within the current page.
 * @returns {*} The key (falls back to `_id`, `id`, then the index).
 */
export function resolveRowKey(rowKey, row, index) {
  if (typeof rowKey === "function") return rowKey(row, index);
  if (typeof rowKey === "string" && row?.[rowKey] !== undefined) return row[rowKey];
  return row?._id || row?.id || index;
}
