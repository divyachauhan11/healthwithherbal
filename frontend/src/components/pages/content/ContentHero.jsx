/**
 * Hero banner of a content page: eyebrow, title and intro copy.
 * @param {object} props
 * @param {string} props.className Hero class list (`content-hero` plus the page modifier).
 * @param {{eyebrow: string, title: string, intro: string}} props.content Page copy.
 * @param {import("react").ReactNode} [props.children] Extra hero content rendered after the intro.
 */
export function ContentHero({ className, content, children }) {
  return (
    <section className={className}>
      <div className="page-width">
        <span className="eyebrow light">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        {children}
      </div>
    </section>
  );
}
