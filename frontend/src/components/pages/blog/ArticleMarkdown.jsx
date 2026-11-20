import { InlineMarkdown } from "./InlineMarkdown";

/**
 * Block-level markdown renderer for blog articles: fenced code, `#` headings,
 * `>` quotes, `-`/`1.` lists and paragraphs (one per line). Inline syntax is
 * rendered by `InlineMarkdown`.
 * @param {object} props
 * @param {string|string[]} [props.content] Markdown source; arrays are joined as paragraphs.
 */
export function ArticleMarkdown({ content = "" }) {
  const source = Array.isArray(content) ? content.join("\n\n") : String(content);
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      blocks.push(<Tag key={index}><InlineMarkdown text={heading[2]} /></Tag>);
      index += 1;
    } else if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${index}`}><InlineMarkdown text={quote.join("\n")} /></blockquote>);
    } else if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*+]\s+(.*)$/;
      while (index < lines.length && pattern.test(lines[index])) items.push(<li key={index}><InlineMarkdown text={lines[index++].replace(pattern, "$1")} /></li>);
      const Tag = ordered ? "ol" : "ul";
      blocks.push(<Tag key={`list-${index}`}>{items}</Tag>);
    } else {
      blocks.push(<p key={index}><InlineMarkdown text={line} /></p>);
      index += 1;
    }
  }
  return <div className="markdown-content">{blocks}</div>;
}
