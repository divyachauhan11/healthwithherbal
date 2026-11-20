"use client";

/**
 * Footer social icon button that opens the profile in a new tab.
 * @param {object} props
 * @param {string} props.label Accessible name ("Instagram").
 * @param {string} props.href Profile URL.
 * @param {React.ReactNode} props.icon
 */
export function FooterSocialButton({ label, href, icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() =>
        window.open(
          href,
          "_blank",
          "noopener,noreferrer",
        )
      }
    >
      {icon}
    </button>
  );
}
