import { ChevronDown } from "lucide-react";

/**
 * Numbered, initially open value card of the Our Story beliefs grid.
 * @param {object} props
 * @param {{title: string, copy: string}} props.section
 * @param {number} props.index Zero-based position (drives the number and colour modifier).
 */
export function StoryValueCard({ section, index }) {
  return (
    <details className={`story-value-card story-value-${index + 1}`} open>
      <summary>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{section.title}</strong>
        <ChevronDown size={19} />
      </summary>
      <p>{section.copy}</p>
    </details>
  );
}
