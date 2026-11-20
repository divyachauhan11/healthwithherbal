import { Search } from "lucide-react";

/**
 * Global admin search input of the header.
 * @param {{query: string, setQuery: (query: string) => void}} props
 */
export function AdminSearchBox({ query, setQuery }) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search orders, products, customers…"
      />
      <kbd>⌘ K</kbd>
    </label>
  );
}
