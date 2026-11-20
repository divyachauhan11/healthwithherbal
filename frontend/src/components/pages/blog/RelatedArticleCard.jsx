import { Sparkles } from "lucide-react";

/**
 * Compact card of a related article (thumbnail, title, date).
 * @param {object} props
 * @param {{title: string, image: string, date: string}} props.post
 * @param {(post: object) => void} props.onOpen
 */
export function RelatedArticleCard({ post, onOpen }) {
  return (
    <button
      type="button"
      className="article-related-card"
      onClick={() => onOpen(post)}
    >
      <span className="article-related-image">
        {post.image ? (
          <img src={post.image} alt="" />
        ) : (
          <Sparkles size={26} aria-hidden="true" />
        )}
      </span>
      <span className="article-related-title">{post.title}</span>
      <span className="article-related-date">{post.date}</span>
    </button>
  );
}
