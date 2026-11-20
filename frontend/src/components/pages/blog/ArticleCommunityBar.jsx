import { Eye, MessageCircle } from "lucide-react";
import { ArticleLikeButton } from "./ArticleLikeButton";

/**
 * Activity bar under the article header: like toggle, jump to comments and view count.
 * @param {object} props
 * @param {{liked: boolean, likes: number, comments: number, views: number}} props.community
 * @param {boolean} props.busy Disables the like toggle while a request runs.
 * @param {() => void} props.onToggleLike
 */
export function ArticleCommunityBar({ community, busy, onToggleLike }) {
  return (
    <div className="article-community-bar" aria-label="Article activity">
      <ArticleLikeButton
        liked={community.liked}
        likes={community.likes}
        disabled={busy}
        onToggle={onToggleLike}
      />
      <button type="button" onClick={() => document.getElementById("article-comments")?.scrollIntoView({ behavior: "smooth" })}>
        <MessageCircle size={18} /> Comment <span>{community.comments}</span>
      </button>
      <span className="article-view-count"><Eye size={17} /> {community.views} views</span>
    </div>
  );
}
