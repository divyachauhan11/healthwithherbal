import { MARKDOWN_FONT_SIZES } from "./markdown-utils";

/**
 * "T" text size menu of the markdown toolbar; resets itself after each choice.
 * @param {{onSizeChange: (size: string) => void}} props
 */
export function MarkdownFontSizeSelect({ onSizeChange }) {
  return (
    <div className="markdown-font-size" title="Text size">
      <span>T</span>
      <select
        defaultValue=""
        aria-label="Text size"
        onChange={(event) => {
          if (event.target.value)
            onSizeChange(event.target.value);
          event.target.value = "";
        }}
      >
        <option value="" disabled>
          Font Size
        </option>
        {MARKDOWN_FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
