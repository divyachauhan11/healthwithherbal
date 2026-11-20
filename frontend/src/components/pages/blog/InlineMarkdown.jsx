/** Splits text into plain runs and inline tokens (images, styled spans, links, bold, italic, code). */
const INLINE_TOKEN_PATTERN = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]*\)|\[[^\]]+\]\{(?:size|color)=[^}]+\}|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;

/**
 * Inline markdown of the blog renderer: `![alt](https://img)`, `[text]{size=18px}`,
 * `[text]{color=#2d5a27}`, `[text](https://link)`, `**bold**`, `*italic*` and `` `code` ``.
 * Unsupported or unsafe tokens render as plain text.
 * @param {object} props
 * @param {string} props.text Source text of one block.
 */
export function InlineMarkdown({ text }) {
  return text.split(INLINE_TOKEN_PATTERN).map((part, index) => {
    const image = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (image) return <img key={index} src={image[2]} alt={image[1]} className="blog-content-inline-image" />;
    const styled = part.match(/^\[([^\]]+)\]\{(size|color)=([^}]+)\}$/);
    if (styled?.[2] === "size" && /^(\d{1,2}(?:\.\d+)?)(px|rem|em|%)$/.test(styled[3])) return <span key={index} style={{ fontSize: styled[3] }}>{styled[1]}</span>;
    if (styled?.[2] === "color" && /^#[0-9a-f]{6}$/i.test(styled[3])) return <span key={index} style={{ color: styled[3] }}>{styled[1]}</span>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}
