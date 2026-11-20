import { ArrowRight } from "lucide-react";
import { STORY_HEADINGS } from "./content-data";
import { StoryCommitmentCard } from "./StoryCommitmentCard";
import { StorySectionHeading } from "./StorySectionHeading";

/**
 * "Our promise to customers" section of the Our Story page, ending with a
 * link to the contact page.
 * @param {object} props
 * @param {Array<{title: string, copy: string}>} props.sections Commitment cards to show.
 */
export function StoryCommitments({ sections }) {
  return (
    <section className="story-commitment-section page-width">
      <StorySectionHeading {...STORY_HEADINGS.commitment} />
      <div className="story-commitment-grid">
        {sections.map((section, index) => (
          <StoryCommitmentCard key={section.title} section={section} index={index} />
        ))}
      </div>
      <a className="story-contact-link" href="/pages/contact-us">
        Share your feedback <ArrowRight size={16} />
      </a>
    </section>
  );
}
