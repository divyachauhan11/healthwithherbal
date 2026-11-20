import { Heart } from "lucide-react";

/**
 * Like toggle of the article activity bar with the like count.
 * @param {object} props
 * @param {boolean} props.liked This visitor already likes the article.
 * @param {number} props.likes Like count.
 * @param {boolean} props.disabled
 * @param {() => void} props.onToggle
 */
export function ArticleLikeButton({ liked, likes, disabled, onToggle }) {
  return (
    <button type="button" className={liked ? "liked" : ""} onClick={onToggle} disabled={disabled}>
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
      {liked ? "Liked" : "Like"} <span>{likes}</span>
    </button>
  );
}
