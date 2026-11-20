import { STORY_HEADINGS } from "./content-data";

/**
 * "Our Purpose" card of the Our Story page (target of the hero link).
 * @param {object} props
 * @param {string} props.purpose Purpose statement.
 */
export function StoryPurpose({ purpose }) {
  return (
    <section className="story-purpose-wrap" id="story-purpose">
      <div className="story-purpose-card">
        <span>{STORY_HEADINGS.purpose}</span>
        <p>{purpose}</p>
        <div className="story-purpose-flower" aria-hidden="true">
          ✳
        </div>
      </div>
    </section>
  );
}
