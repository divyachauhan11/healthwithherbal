"use client";

/**
 * One promise in the home trust strip: icon, title and caption.
 * @param {object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} props.caption
 */
export function TrustStripItem({ icon, title, caption }) {
  return (
    <div>
      {icon}
      <span>
        <strong>{title}</strong>
        <small>{caption}</small>
      </span>
    </div>
  );
}
