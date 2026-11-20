"use client";
import { Check } from "lucide-react";

/**
 * Checklist of product promises on the product page.
 */
export function ProductFeatureList() {
  return (
    <div className="detail-feature-list">
      <span>
        <Check /> Authentic heritage formula
      </span>
      <span>
        <Check /> No harsh chemicals
      </span>
      <span>
        <Check /> Responsibly sourced ingredients
      </span>
    </div>
  );
}
