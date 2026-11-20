import { DeletePreviewThumb } from "./DeletePreviewThumb";

/**
 * Preview card of the record being deleted: thumbnail, kind, title, subtitle and badges.
 * @param {object} props
 * @param {string} props.kind Admin collection.
 * @param {string} props.kindSingular Human-readable singular kind.
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string|null} props.image
 * @param {string[]} props.badges
 */
export function DeletePreviewCard({
  kind,
  kindSingular,
  title,
  subtitle,
  image,
  badges,
}) {
  return (
    <div className="admin-delete-preview-box">
      <DeletePreviewThumb image={image} title={title} kind={kind} />

      <div className="admin-delete-preview-content">
        <span className="admin-delete-preview-type">
          {kindSingular}
        </span>
        <h4 className="admin-delete-preview-title" title={title}>
          {title}
        </h4>
        {subtitle && (
          <p className="admin-delete-preview-sub">{subtitle}</p>
        )}

        {badges.length > 0 && (
          <div className="admin-delete-preview-badges">
            {badges.map((b, i) => (
              <span key={i} className="admin-delete-pill">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
