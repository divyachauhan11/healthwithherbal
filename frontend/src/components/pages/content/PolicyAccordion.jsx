import { PolicyAccordionItem } from "./PolicyAccordionItem";

/**
 * List of expandable policy sections.
 * @param {object} props
 * @param {Array<{title: string}>} props.sections Policy sections (see `PolicyAccordionItem`).
 */
export function PolicyAccordion({ sections }) {
  return (
    <div className="disclaimer-accordion-list">
      {sections.map((section, index) => (
        <PolicyAccordionItem key={section.title} section={section} index={index} />
      ))}
    </div>
  );
}
