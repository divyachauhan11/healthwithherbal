"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const requestStatuses = [
  ["all", "All request statuses"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["completed", "Completed"],
];

const refundStatuses = [
  ["all", "All refund statuses"],
  ["pending", "Refund pending"],
  ["processed", "Refund completed"],
  ["not_required", "No refund required"],
];

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find(([optionValue]) => optionValue === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

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

export function ReturnRequestFilterBar({
  requestType,
  onRequestTypeChange,
  requestStatus,
  onRequestStatusChange,
  refundStatus,
  onRefundStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  pendingCount = 0,
}) {
  return (
    <div className="return-request-filter-bar" aria-label="Filter return and exchange requests">
      <FilterDropdown
        label="Request type"
        value={requestType}
        onChange={onRequestTypeChange}
        options={[["all", "All types"], ["return", "Returns"], ["exchange", "Exchanges"]]}
      />
      <FilterDropdown
        label="Request status"
        value={requestStatus}
        onChange={onRequestStatusChange}
        options={requestStatuses.map(([value, label]) => [value, value === "pending" && pendingCount ? `${label} (${pendingCount})` : label])}
      />
      <FilterDropdown
        label="Refund status"
        value={refundStatus}
        onChange={onRefundStatusChange}
        options={refundStatuses}
      />
      <label>
        <span>Requested from</span>
        <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
      </label>
      <label>
        <span>Requested to</span>
        <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
      </label>
    </div>
  );
}
