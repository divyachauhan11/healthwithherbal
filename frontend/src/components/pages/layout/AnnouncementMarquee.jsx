"use client";
import { AnnouncementMarqueeGroup } from "./AnnouncementMarqueeGroup";

/**
 * Scrolling announcement bar; renders nothing without announcements. The items
 * are rendered twice so the CSS animation loops seamlessly.
 * @param {{announcements?: string[]}} props
 */
export function AnnouncementMarquee({ announcements = [] }) {
  const allItems = announcements
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (!allItems.length) return null;

  return (
    <div className="announcement-marquee-wrapper" role="region" aria-label="Announcements">
      <div className="announcement-marquee-track">
        <AnnouncementMarqueeGroup items={allItems} keyPrefix="ann-1" />

        <AnnouncementMarqueeGroup items={allItems} keyPrefix="ann-2" ariaHidden="true" />
      </div>
    </div>
  );
}
