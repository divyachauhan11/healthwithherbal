import { StoryCommitments } from "./StoryCommitments";
import { StoryPurpose } from "./StoryPurpose";
import { StoryValues } from "./StoryValues";

/**
 * Body of the Our Story page: purpose card, the first three sections as
 * value cards and the rest as commitments.
 * @param {object} props
 * @param {{purpose: string, sections: Array<{title: string, copy: string}>}} props.content Our Story copy.
 */
export function StoryPageSections({ content }) {
  return (
    <>
      <StoryPurpose purpose={content.purpose} />
      <StoryValues sections={content.sections.slice(0, 3)} />
      <StoryCommitments sections={content.sections.slice(3)} />
    </>
  );
}
