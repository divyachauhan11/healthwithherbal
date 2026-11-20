/**
 * Logo block at the top of the password recovery cards.
 * @param {object} props
 * @param {string|import("react").ReactNode} props.logo Image URL, or a custom logo node.
 * @param {string} props.alt Alt text used for an image URL.
 */
export function PasswordCardBrand({ logo, alt }) {
  return <div className="fp-brand">{typeof logo === "string" ? <img src={logo} alt={alt} /> : logo}</div>;
}
