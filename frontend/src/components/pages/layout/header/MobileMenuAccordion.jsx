"use client";
import { ChevronDown } from "lucide-react";

/**
 * Expandable section of the mobile menu; `children` render only while expanded.
 * @param {object} props
 * @param {React.ReactNode} props.label
 * @param {boolean} props.expanded
 * @param {() => void} props.onToggle
 * @param {React.ReactNode} props.children
 */
export function MobileMenuAccordion({ label, expanded, onToggle, children }) {
  return (
    <div className="mobile-brands-accordion">
      <button
        type="button"
        className="mobile-accordion-trigger"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{label}</span>
        <ChevronDown size={18} />
      </button>
      {expanded && children}
    </div>
  );
}
