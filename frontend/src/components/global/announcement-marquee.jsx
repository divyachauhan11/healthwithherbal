"use client";

export function AnnouncementMarquee({ announcements = [] }) {
  const allItems = announcements
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (!allItems.length) return null;

  return (
    <div className="announcement-marquee-wrapper" role="region" aria-label="Announcements">
      <div className="announcement-marquee-track">
        <div className="announcement-marquee-content">
          {allItems.map((text, i) => (
            <span key={`ann-1-${i}`} className="marquee-item">
              <span className="marquee-divider" aria-hidden="true" />
              <strong>{text}</strong>
            </span>
          ))}
        </div>

        <div className="announcement-marquee-content" aria-hidden="true">
          {allItems.map((text, i) => (
            <span key={`ann-2-${i}`} className="marquee-item">
              <span className="marquee-divider" aria-hidden="true" />
              <strong>{text}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
