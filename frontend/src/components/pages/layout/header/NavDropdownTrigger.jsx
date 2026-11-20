"use client";
import { ChevronDown } from "lucide-react";

/**
 * Main-navigation item that opens a mega menu on hover or focus.
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} props.open Whether this item's mega menu is shown.
 * @param {() => void} props.onOpen Shows this item's mega menu (hover/focus).
 * @param {() => void} props.onClick
 */
export function NavDropdownTrigger({ label, open, onOpen, onClick }) {
  return (
    <div
      className={`nav-dropdown-item ${open ? "open" : ""}`}
      onMouseEnter={onOpen}
    >
      <button
        type="button"
        className="nav-dropdown-trigger"
        aria-expanded={open}
        onFocus={onOpen}
        onClick={onClick}
      >
        <span>{label}</span>
        <ChevronDown size={13} className="dropdown-chevron" />
      </button>
    </div>
  );
}
