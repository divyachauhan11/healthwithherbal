"use client";
import { X } from "lucide-react";
import { SHOP_SORT_OPTIONS } from "./shop-utils";

/**
 * Toolbar above the shop results: active filter label (with a clear button
 * while filters are active) and the sort select.
 * @param {object} props
 * @param {string} props.label Active filter or search label.
 * @param {boolean} props.showClear Whether any filter is active.
 * @param {() => void} props.onClear
 * @param {string} props.sort One of {@link SHOP_SORT_OPTIONS}.
 * @param {(sort: string) => void} props.onSortChange
 */
export function ShopResultsToolbar({ label, showClear, onClear, sort, onSortChange }) {
  return (
    <div className="results-tools">
      <div className="active-filter">
        {label}{" "}
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear active filter"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <label>
        Sort by
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {SHOP_SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
