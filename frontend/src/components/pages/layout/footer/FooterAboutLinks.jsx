"use client";

/**
 * Footer "About" links: brand content pages and the blog.
 * @param {object} props
 * @param {(page: string) => void} props.openContent
 * @param {(page: string) => void} props.navigate
 */
export function FooterAboutLinks({ openContent, navigate }) {
  return (
    <>
      {["Our Story", "Contact Us", "Privacy Policy", "Disclaimer"].map(
        (item) => (
          <button
            type="button"
            key={item}
            onClick={() => openContent(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" onClick={() => navigate("blog")}>
        Blog
      </button>
    </>
  );
}
