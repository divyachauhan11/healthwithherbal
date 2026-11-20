/** Font sizes offered by the editor's text size menu. */
export const MARKDOWN_FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "28px"];

/** Text colours offered by the editor's colour swatches. */
export const MARKDOWN_TEXT_COLORS = [
  "#d97706",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#7c3aed",
  "#111827",
  "#000000",
];

/**
 * Wrap the selected text (or a fallback) with markers.
 * @param {string} value Full text.
 * @param {number} start Selection start.
 * @param {number} end Selection end.
 * @param {string} before Text inserted before the selection.
 * @param {string} after Text inserted after the selection.
 * @param {string} fallback Text used when nothing is selected.
 * @returns {{text: string, selectionStart: number, selectionEnd: number}}
 *   New text and the range of the wrapped content.
 */
export function wrapTextSelection(value, start, end, before, after, fallback) {
  const selected = value.slice(start, end) || fallback;
  return {
    text: `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

/**
 * Prefix every line touched by the selection (or a placeholder line).
 * @param {string} value Full text.
 * @param {number} start Selection start.
 * @param {number} end Selection end.
 * @param {string} prefix Line prefix, e.g. "# " or "- ".
 * @returns {{text: string, selectionStart: number, selectionEnd: number}}
 *   New text and the range of the formatted lines.
 */
export function prefixSelectedLines(value, start, end, prefix) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndAt = value.indexOf("\n", end);
  const lineEnd = lineEndAt < 0 ? value.length : lineEndAt;
  const selected = value.slice(lineStart, lineEnd) || "Write your text here";
  const formatted = selected
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  return {
    text: `${value.slice(0, lineStart)}${formatted}${value.slice(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + formatted.length,
  };
}
