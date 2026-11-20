import { useEffect, useRef, useState } from "react";
import { getDropdownPlacement } from "./row-actions-utils";

/**
 * Owns the open state of a row actions menu: dropdown placement, refs for the
 * trigger container and the portalled dropdown, and the outside-click, Escape
 * and scroll listeners that close it.
 * @param {{actionCount: number, align: "left"|"right"}} options
 * @returns {{isOpen: boolean, openUpwards: boolean, dropdownPosition: Object|null, menuRef: Object, dropdownRef: Object, toggle: (event: Event) => void, close: () => void}}
 */
export function useRowActionsMenu({ actionCount, align }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      const placement = getDropdownPlacement(menuRef.current.getBoundingClientRect(), {
        actionCount,
        align,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      setOpenUpwards(placement.openUpwards);
      setDropdownPosition(placement.position);
    }
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    openUpwards,
    dropdownPosition,
    menuRef,
    dropdownRef,
    toggle,
    close: () => setIsOpen(false),
  };
}
