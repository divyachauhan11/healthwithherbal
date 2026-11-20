"use client";

/**
 * "Why Health with Herbal" card: title, badge icon and text.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.glow Glow colour class ("glow-amber", ...).
 * @param {React.ReactNode} props.icon
 * @param {React.ReactNode} props.text
 */
export function WhyCard({ title, glow, icon, text }) {
  return (
    <div className={`why-card ${glow}`}>
      <div className="why-card-top">
        <h3>{title}</h3>
        {icon}
      </div>
      <p className="why-card-text">{text}</p>
    </div>
  );
}
