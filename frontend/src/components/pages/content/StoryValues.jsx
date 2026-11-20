import { STORY_HEADINGS } from "./content-data";
import { StorySectionHeading } from "./StorySectionHeading";
import { StoryValueCard } from "./StoryValueCard";

/**
 * "Our beliefs" section of the Our Story page.
 * @param {object} props
 * @param {Array<{title: string, copy: string}>} props.sections Value cards to show.
 */
export function StoryValues({ sections }) {
  return (
    <section className="story-values-section">
      <div className="page-width">
        <StorySectionHeading {...STORY_HEADINGS.values} />
        <div className="story-values-grid">
          {sections.map((section, index) => (
            <StoryValueCard key={section.title} section={section} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
