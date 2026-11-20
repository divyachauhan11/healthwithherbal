"use client";

import { useRef, useState } from "react";
import { prefixSelectedLines, wrapTextSelection } from "./markdown-utils";

/**
 * Owns the markdown editor's textarea ref and write/preview mode, and applies
 * toolbar formatting to the current selection.
 * @param {{value: string, onChange: (value: string) => void}} options
 * @returns {{
 *   textareaRef: import("react").RefObject<HTMLTextAreaElement>,
 *   preview: boolean,
 *   setPreview: (preview: boolean) => void,
 *   wrapSelection: (before: string, after?: string, fallback?: string) => void,
 *   prefixLines: (prefix: string) => void,
 * }}
 */
export function useMarkdownEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(false);

  const applyEdit = (area, edit) => {
    onChange(edit.text);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  };

  const wrapSelection = (before, after = "", fallback = "text") => {
    const area = textareaRef.current;
    if (!area) return;
    applyEdit(
      area,
      wrapTextSelection(value, area.selectionStart, area.selectionEnd, before, after, fallback),
    );
  };

  const prefixLines = (prefix) => {
    const area = textareaRef.current;
    if (!area) return;
    applyEdit(
      area,
      prefixSelectedLines(value, area.selectionStart, area.selectionEnd, prefix),
    );
  };

  return { textareaRef, preview, setPreview, wrapSelection, prefixLines };
}
