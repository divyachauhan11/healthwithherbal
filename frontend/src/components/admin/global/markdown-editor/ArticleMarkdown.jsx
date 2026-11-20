/**
 * Render inline markdown (images, sized/coloured spans, links, bold, italic, code).
 * @param {string} text
 * @returns {Array<string|import("react").ReactElement>}
 */
const renderInline = (text) =>
  text
    .split(
      /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]*\)|\[[^\]]+\]\{(?:size|color)=[^}]+\}|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g,
    )
    .map((part, index) => {
      const image = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
      if (image)
        return (
          <img
            key={index}
            src={image[2]}
            alt={image[1]}
            className="blog-content-inline-image"
          />
        );
      const styled = part.match(/^\[([^\]]+)\]\{(size|color)=([^}]+)\}$/);
      if (
        styled &&
        styled[2] === "size" &&
        /^(\d{1,2}(?:\.\d+)?)(px|rem|em|%)$/.test(styled[3])
      )
        return (
          <span key={index} style={{ fontSize: styled[3] }}>
            {styled[1]}
          </span>
        );
      if (
        styled &&
        styled[2] === "color" &&
        /^#[0-9a-f]{6}$/i.test(styled[3])
      )
        return (
          <span key={index} style={{ color: styled[3] }}>
            {styled[1]}
          </span>
        );
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (link)
        return (
          <a key={index} href={link[2]} target="_blank" rel="noreferrer">
            {link[1]}
          </a>
        );
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={index}>{part.slice(1, -1)}</em>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={index}>{part.slice(1, -1)}</code>;
      return part;
    });

/**
 * Preview renderer for the admin article editor: code fences, `#`/`##`
 * headings, quotes, bulleted/numbered lists and paragraphs with inline markdown.
 * @param {{content?: string}} props
 */
export function ArticleMarkdown({ content = "" }) {
  const lines = String(content).split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```"))
        code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(
        <pre key={`code-${index}`}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const heading = line.match(/^(#{1,2})\s+(.*)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h1" : "h2";
      blocks.push(<Tag key={index}>{renderInline(heading[2])}</Tag>);
      index += 1;
    } else if (/^>\s?/.test(line)) {
      blocks.push(
        <blockquote key={index}>
          {renderInline(line.replace(/^>\s?/, ""))}
        </blockquote>,
      );
      index += 1;
    } else if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index]))
        items.push(
          <li key={index}>
            {renderInline(lines[index++].replace(/^[-*+]\s+/, ""))}
          </li>,
        );
      blocks.push(<ul key={`ul-${index}`}>{items}</ul>);
    } else if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index]))
        items.push(
          <li key={index}>
            {renderInline(lines[index++].replace(/^\d+\.\s+/, ""))}
          </li>,
        );
      blocks.push(<ol key={`ol-${index}`}>{items}</ol>);
    } else {
      blocks.push(<p key={index}>{renderInline(line)}</p>);
      index += 1;
    }
  }
  return <div className="markdown-content">{blocks}</div>;
}
