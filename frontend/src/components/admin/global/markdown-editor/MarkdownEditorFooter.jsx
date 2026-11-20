/**
 * Footer of the markdown editor with the character counter.
 * @param {{length: number, maxLength?: number}} props
 */
export function MarkdownEditorFooter({ length, maxLength }) {
  return (
    <div className="markdown-editor-footer">
      <span>Markdown formatting</span>
      <span>
        {length}
        {maxLength ? ` / ${maxLength}` : ""}
      </span>
    </div>
  );
}
