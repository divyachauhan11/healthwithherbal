"use client";

/**
 * Footer bottom bar with the copyright line.
 */
export function FooterBottom() {
  return (
    <div className="page-width footer-bottom">
      <span>
        © {new Date().getFullYear()} Health with Herbal. All rights reserved.
      </span>
      <span>Natural care, sent with love worldwide.</span>
    </div>
  );
}
