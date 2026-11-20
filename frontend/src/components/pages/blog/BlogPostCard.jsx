import { ArrowRight, Calendar, Clock3 } from "lucide-react";
import { BlogCardEngagement } from "./BlogCardEngagement";
import { BlogCardImage } from "./BlogCardImage";

/**
 * Blog grid card: cover, date and read time, title, excerpt, activity
 * counters and a "Read article" action.
 * @param {object} props
 * @param {object} props.post Normalized post (see `toBlogPost`).
 * @param {{likes?: number, views?: number, comments?: number}} [props.metrics] Latest counts for the post.
 * @param {(post: object) => void} props.onOpen Opens the article.
 */
export function BlogPostCard({ post, metrics, onOpen }) {
  return (
    <article className="blog-card-item">
      <BlogCardImage post={post} onOpen={() => onOpen(post)} />

      <div className="blog-card-copy">
        <div className="blog-card-meta">
          <span>
            <Calendar size={13} /> {post.date}
          </span>
          <span>
            <Clock3 size={13} /> {post.readTime}
          </span>
        </div>

        <h2 onClick={() => onOpen(post)}>{post.title}</h2>
        <p>{post.excerpt}</p>

        <BlogCardEngagement post={post} metrics={metrics} />

        <div className="blog-card-footer">
          <small>By {post.author}</small>
          <button
            type="button"
            className="blog-read-button"
            onClick={() => onOpen(post)}
          >
            Read article <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
