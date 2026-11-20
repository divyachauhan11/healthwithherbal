import { BlogEmptyState } from "./BlogEmptyState";
import { BlogPostCard } from "./BlogPostCard";

/**
 * Article grid of the blog list, or the empty state when nothing matches.
 * Both are rendered in the same `div` slot, so the element is reused when
 * the posts arrive (as before).
 * @param {object} props
 * @param {Array<object>} props.posts Posts of the selected category.
 * @param {Object<string, object>} props.cardMetrics Latest counts per post slug.
 * @param {(post: object) => void} props.onOpenArticle
 * @param {(view: string) => void} [props.openCatalog] Used by the empty state.
 */
export function BlogPostsSection({ posts, cardMetrics, onOpenArticle, openCatalog }) {
  return (
    <section
      className="page-width blog-grid-section"
      aria-label="Blog articles"
    >
      {posts.length > 0 ? (
        <div className="blog-posts-grid">
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              metrics={cardMetrics[post.slug]}
              onOpen={onOpenArticle}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "70px 20px" }}>
          <BlogEmptyState openCatalog={openCatalog} />
        </div>
      )}
    </section>
  );
}
