import { ChevronDown } from "lucide-react";
import { ShippingEstimateTable } from "./ShippingEstimateTable";

/**
 * Numbered policy section rendered as a disclosure; only the first one starts open.
 * @param {object} props
 * @param {{title: string, summary: string, copy: string, destinations?: Array<[string, string]>, note?: string, steps?: string[]}} props.section
 * @param {number} props.index Zero-based position.
 */
export function PolicyAccordionItem({ section, index }) {
  return (
    <details className="disclaimer-accordion" open={index === 0}>
      <summary>
        <span className="disclaimer-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="disclaimer-summary-copy">
          <strong>{section.title}</strong>
          <small>{section.summary}</small>
        </span>
        <ChevronDown
          className="disclaimer-chevron"
          size={20}
          aria-hidden="true"
        />
      </summary>
      <div className="disclaimer-accordion-content">
        <p>{section.copy}</p>
        {section.destinations && (
          <ShippingEstimateTable destinations={section.destinations} />
        )}
        {section.note && (
          <p className="shipping-estimate-note">{section.note}</p>
        )}
        {section.steps && (
          <ol className="return-policy-steps">
            {section.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
