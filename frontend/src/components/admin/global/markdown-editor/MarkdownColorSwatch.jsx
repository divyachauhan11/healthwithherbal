/**
 * Colour swatch button of the markdown toolbar.
 * @param {{color: string, onClick: () => void}} props
 */
export function MarkdownColorSwatch({ color, onClick }) {
  return (
    <button
      type="button"
      className="markdown-color-button"
      style={{ backgroundColor: color }}
      title={`Text color ${color}`}
      aria-label={`Text color ${color}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    />
  );
}
