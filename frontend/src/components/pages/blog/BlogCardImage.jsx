import { Sparkles } from "lucide-react";

/**
 * Clickable cover of a blog card with its category badge; shows a sparkle
 * placeholder when the post has no image.
 * @param {object} props
 * @param {{title: string, image: string, category: string}} props.post
 * @param {() => void} props.onOpen Opens the article.
 */
export function BlogCardImage({ post, onOpen }) {
  return (
    <div
      className="blog-card-image-wrap"
      onClick={onOpen}
      role="button"
      tabIndex={0}
    >
      {post.image ? (
        <img src={post.image} alt={post.title} />
      ) : (
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "var(--cream, #f5efe6)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Sparkles
            size={32}
            style={{
              color: "var(--forest, #2d5a27)",
              opacity: 0.5,
            }}
          />
        </div>
      )}
      <span className="blog-badge">{post.category}</span>
    </div>
  );
}
