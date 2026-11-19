import { Search } from "lucide-react";

export function SearchField({ value, onChange, placeholder = "Search…" }) {
  return (
    <label className="search small">
      <Search size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
