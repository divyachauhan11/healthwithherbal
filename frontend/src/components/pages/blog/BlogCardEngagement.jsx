import { Eye, Heart, MessageCircle } from "lucide-react";

/**
 * Likes, views and approved comments counters of a blog card; prefers the
 * latest counts loaded for the article over the counts from the store data.
 * @param {object} props
 * @param {{likesCount: number, viewsCount: number, commentsCount: number}} props.post
 * @param {{likes?: number, views?: number, comments?: number}} [props.metrics] Latest counts.
 */
export function BlogCardEngagement({ post, metrics }) {
  return (
    <div className="blog-card-engagement" aria-label="Article activity">
      <span title="Likes"><Heart size={14} /> {metrics?.likes ?? post.likesCount}</span>
      <span title="Views"><Eye size={14} /> {metrics?.views ?? post.viewsCount}</span>
      <span title="Approved comments"><MessageCircle size={14} /> {metrics?.comments ?? post.commentsCount}</span>
    </div>
  );
}
