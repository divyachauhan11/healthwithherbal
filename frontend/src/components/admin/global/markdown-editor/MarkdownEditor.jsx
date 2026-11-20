"use client";

import { ArticleMarkdown } from "./ArticleMarkdown";
import { MarkdownEditorFooter } from "./MarkdownEditorFooter";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { useMarkdownEditor } from "./useMarkdownEditor";

/**
 * Markdown article editor: formatting toolbar, textarea or rendered preview,
 * and a character counter.
 * @param {object} props
 * @param {string} [props.value=""] Markdown text.
 * @param {(value: string) => void} props.onChange Receives the new markdown.
 * @param {boolean} [props.required] Also blocks the preview until `minLength` is reached.
 * @param {number} [props.minLength]
 * @param {number} [props.maxLength]
 * @param {string} [props.placeholder]
 */
export function MarkdownEditor({
  value = "",
  onChange,
  required,
  minLength,
  maxLength,
  placeholder,
}) {
  const { textareaRef, preview, setPreview, wrapSelection, prefixLines } =
    useMarkdownEditor({ value, onChange });

  return (
    <div className="markdown-editor">
      <MarkdownToolbar
        wrapSelection={wrapSelection}
        prefixLines={prefixLines}
        preview={preview}
        setPreview={setPreview}
        previewDisabled={required && value.trim().length < (minLength || 0)}
      />
      {preview ? (
        <div className="markdown-editor-preview">
          <ArticleMarkdown content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={12}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      <MarkdownEditorFooter length={value.length} maxLength={maxLength} />
    </div>
  );
}
