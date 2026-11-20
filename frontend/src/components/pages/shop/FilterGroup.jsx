"use client";
import { ChevronDown } from "lucide-react";
import { FilterOption } from "./FilterOption";

/**
 * Collapsible shop filter group of checkbox options.
 * @param {object} props
 * @param {string} props.label Group title; the option count is appended.
 * @param {string[]} props.options
 * @param {Record<string, number>} props.counts Product counts keyed by lower-cased option.
 * @param {string[]} props.selected Checked options.
 * @param {(option: string) => void} props.onToggle
 */
export function FilterGroup({ label, options, counts, selected, onToggle }) {
  return (
    <details open>
      <summary>
        {`${label} (`}{options.length}) <ChevronDown size={16} />
      </summary>
      <div className="filter-scrollable-list">
        {options.map((item) => (
          <FilterOption
            key={item}
            label={item}
            count={counts[item.toLowerCase().trim()] || 0}
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
          />
        ))}
      </div>
    </details>
  );
}
