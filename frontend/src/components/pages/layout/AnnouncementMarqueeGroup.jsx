"use client";

/**
 * One run of announcement items inside the scrolling marquee track.
 * @param {object} props
 * @param {string[]} props.items Announcement texts.
 * @param {string} props.keyPrefix Prefix for item keys ("ann-1").
 * @param {"true"} [props.ariaHidden] Hides the duplicate run from assistive tech.
 */
export function AnnouncementMarqueeGroup({ items, keyPrefix, ariaHidden }) {
  return (
    <div className="announcement-marquee-content" aria-hidden={ariaHidden}>
      {items.map((text, i) => (
        <span key={`${keyPrefix}-${i}`} className="marquee-item">
          <span className="marquee-divider" aria-hidden="true" />
          <strong>{text}</strong>
        </span>
      ))}
    </div>
  );
}
