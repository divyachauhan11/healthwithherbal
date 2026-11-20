/**
 * "+N photo(s)" note under a record name when it has more than one image.
 * @param {{photoCount: number}} props Total number of images.
 */
export function PhotoCountNote({ photoCount }) {
  return (
    <small className="cell-subtitle" style={{ color: "#347055", fontWeight: 600 }}>
      +{photoCount - 1} photo{photoCount > 2 ? "s" : ""}
    </small>
  );
}
