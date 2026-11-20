/**
 * Work out where the row actions dropdown opens: below the trigger, or above it
 * when there is not enough room below. The dropdown is positioned `fixed` so it
 * can escape scrolling table containers.
 * @param {DOMRect} rect Trigger container bounds.
 * @param {{actionCount: number, align: "left"|"right", viewportWidth: number, viewportHeight: number}} options
 * @returns {{openUpwards: boolean, position: Object}} Direction and inline style for the dropdown.
 */
export function getDropdownPlacement(rect, { actionCount, align, viewportWidth, viewportHeight }) {
  const estimatedHeight = actionCount * 34 + 12;
  const spaceBelow = viewportHeight - rect.bottom;
  const openUpwards = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
  return {
    openUpwards,
    position: {
      position: "fixed",
      ...(align === "left"
        ? { left: rect.left }
        : { right: viewportWidth - rect.right }),
      top: openUpwards
        ? Math.max(8, rect.top - estimatedHeight - 4)
        : rect.bottom + 4,
      maxHeight: "calc(100vh - 16px)",
      zIndex: 100000,
    },
  };
}
