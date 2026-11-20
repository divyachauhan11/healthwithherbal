import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Quote,
} from "lucide-react";
import { MarkdownColorSwatch } from "./MarkdownColorSwatch";
import { MarkdownFontSizeSelect } from "./MarkdownFontSizeSelect";
import { MarkdownModeButton } from "./MarkdownModeButton";
import { MarkdownToolButton } from "./MarkdownToolButton";
import { MARKDOWN_TEXT_COLORS } from "./markdown-utils";

/**
 * Formatting toolbar of the markdown editor: inline styles, headings, lists,
 * code/link/image inserts, text size, text colour and the write/preview switch.
 * @param {object} props
 * @param {(before: string, after?: string, fallback?: string) => void} props.wrapSelection
 * @param {(prefix: string) => void} props.prefixLines
 * @param {boolean} props.preview Whether the preview is shown.
 * @param {(preview: boolean) => void} props.setPreview
 * @param {boolean} [props.previewDisabled] Disables the preview button.
 */
export function MarkdownToolbar({
  wrapSelection,
  prefixLines,
  preview,
  setPreview,
  previewDisabled,
}) {
  return (
    <div
      className="markdown-editor-toolbar"
      role="toolbar"
      aria-label="Article formatting"
    >
      <MarkdownToolButton label="Bold" icon={Bold} onClick={() => wrapSelection("**", "**")} />
      <MarkdownToolButton label="Italic" icon={Italic} onClick={() => wrapSelection("*", "*")} />
      <span className="markdown-tool-divider" />
      <MarkdownToolButton label="Heading 1" icon={Heading1} onClick={() => prefixLines("# ")} />
      <MarkdownToolButton label="Heading 2" icon={Heading2} onClick={() => prefixLines("## ")} />
      <span className="markdown-tool-divider" />
      <MarkdownToolButton label="Bulleted list" icon={List} onClick={() => prefixLines("- ")} />
      <MarkdownToolButton label="Numbered list" icon={ListOrdered} onClick={() => prefixLines("1. ")} />
      <MarkdownToolButton label="Quote" icon={Quote} onClick={() => prefixLines("> ")} />
      <MarkdownToolButton
        label="Code block"
        icon={Code2}
        onClick={() => wrapSelection("\n```\n", "\n```\n", "code")}
      />
      <MarkdownToolButton
        label="Insert link"
        icon={Link2}
        onClick={() => wrapSelection("[", "](https://example.com)", "link text")}
      />
      <MarkdownToolButton
        label="Insert image"
        icon={Image}
        onClick={() =>
          wrapSelection(
            "![",
            "](https://example.com/image.jpg)",
            "image description",
          )
        }
      />
      <span className="markdown-tool-divider" />
      <MarkdownFontSizeSelect
        onSizeChange={(size) => wrapSelection("[", `]{size=${size}}`)}
      />
      <span className="markdown-tool-divider" />
      <span className="markdown-color-label" title="Text color">
        <Palette size={16} />
      </span>
      {MARKDOWN_TEXT_COLORS.map((color) => (
        <MarkdownColorSwatch
          key={color}
          color={color}
          onClick={() => wrapSelection("[", `]{color=${color}}`)}
        />
      ))}
      <span className="markdown-tool-divider" />
      <MarkdownModeButton active={!preview} onClick={() => setPreview(false)}>
        Write
      </MarkdownModeButton>
      <MarkdownModeButton
        active={preview}
        disabled={previewDisabled}
        onClick={() => setPreview(true)}
      >
        Preview
      </MarkdownModeButton>
    </div>
  );
}
