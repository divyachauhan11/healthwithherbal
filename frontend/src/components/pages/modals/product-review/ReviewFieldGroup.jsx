/**
 * Labelled field wrapper of the review form.
 * @param {object} props
 * @param {string} props.htmlFor Id of the labelled control.
 * @param {import("react").ReactNode} props.label Label content.
 * @param {import("react").ReactNode} props.children The control.
 */
export function ReviewFieldGroup({ htmlFor, label, children }) {
  return (
    <div className="review-field-group">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
