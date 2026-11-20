"use client";
import { Search } from "lucide-react";

/**
 * Product search form, used for the desktop header search and the mobile
 * search bar.
 * @param {object} props
 * @param {string} props.className Form class ("header-search" or "mobile-searchbar").
 * @param {string} props.placeholder
 * @param {boolean} [props.autoFocus] Focus the input when it mounts.
 * @param {string} props.query Current search text.
 * @param {(value: string) => void} props.onQueryChange
 * @param {(event: Event) => void} props.onSubmit
 * @param {React.ReactNode} [props.children] Controls after the input (the submit button).
 */
export function HeaderSearchForm({
  className,
  placeholder,
  autoFocus,
  query,
  onQueryChange,
  onSubmit,
  children,
}) {
  return (
    <form className={className} onSubmit={onSubmit}>
      <Search size={18} />
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
      />
      {children}
    </form>
  );
}
