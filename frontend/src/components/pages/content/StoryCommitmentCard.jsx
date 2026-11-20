/**
 * Numbered commitment card of the Our Story promise grid.
 * @param {object} props
 * @param {{title: string, copy: string}} props.section
 * @param {number} props.index Zero-based position.
 */
export function StoryCommitmentCard({ section, index }) {
  return (
    <article className="story-commitment-card">
      <span className="story-commitment-number">0{index + 1}</span>
      <h3>{section.title}</h3>
      <p>{section.copy}</p>
    </article>
  );
}
