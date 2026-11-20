/**
 * Image that fills a `.product-thumb` square in a table cell.
 * @param {{src: string, alt?: string}} props
 */
export function TableThumbImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
    />
  );
}
