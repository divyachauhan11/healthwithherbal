/**
 * Plain article list of a content page's sections (pages without the
 * policy accordion).
 * @param {object} props
 * @param {{sections: Array<{title: string, copy: string}>}} props.content Page copy.
 */
export function ContentSectionList({ content }) {
  return content.sections.map((section) => (
    <article key={section.title} className="content-section">
      <h2>{section.title}</h2>
      <p>{section.copy}</p>
    </article>
  ));
}
