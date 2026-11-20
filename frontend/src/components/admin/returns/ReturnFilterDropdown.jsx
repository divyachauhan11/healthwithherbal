"use client";

import { Check, ChevronDown } from "lucide-react";
import { useFilterDropdown } from "./useFilterDropdown";

/**
 * Labelled single-select dropdown (button + listbox menu) used by the returns filter bar.
 * @param {{label: string, value: string, options: Array<[string, string]>, onChange: (value: string) => void}} props
 *   `options` are `[value, label]` pairs; the first one shows when `value` matches none.
 */
export function ReturnFilterDropdown({ label, value, options, onChange }) {
  const { open, setOpen, rootRef } = useFilterDropdown();
  const selected = options.find(([optionValue]) => optionValue === value) || options[0];

  return (
    <div className="return-filter-field">
      <span className="return-filter-label">{label}</span>
      <div className="return-filter-dropdown" ref={rootRef}>
        <button
          type="button"
          className={`return-filter-trigger${open ? " is-open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{selected?.[1]}</span><ChevronDown size={16} aria-hidden="true" />
        </button>
        {open && (
          <div className="return-filter-menu" role="listbox" aria-label={label}>
            {options.map(([optionValue, optionLabel]) => (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={value === optionValue}
                className={value === optionValue ? "selected" : ""}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <span>{optionLabel}</span>
                {value === optionValue && <Check size={15} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
