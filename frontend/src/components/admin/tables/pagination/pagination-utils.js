/**
 * Number of pages needed for a list (never less than one).
 * @param {number} totalItems
 * @param {number} pageSize
 * @returns {number}
 */
export function getTotalPages(totalItems, pageSize) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Page buttons to show: every page when there are at most 7, otherwise the
 * first and last page around a window of nearby pages, with "..." gaps.
 * @param {number} page Current page (1-based).
 * @param {number} totalPages
 * @returns {Array<number|"...">}
 */
export function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (page >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}
