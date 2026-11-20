import { RelatedArticleCard } from "./RelatedArticleCard";

/**
 * "Read more of our articles" section below an article.
 * @param {object} props
 * @param {Array<{id: string}>} props.posts Related posts.
 * @param {(post: object) => void} props.onOpenArticle
 */
export function RelatedArticles({ posts, onOpenArticle }) {
  return (
    <section
      className="article-related"
      aria-labelledby="article-related-heading"
    >
      <h2 id="article-related-heading">Read more of our articles</h2>
      <div className="article-related-grid">
        {posts.map((post) => (
          <RelatedArticleCard key={post.id} post={post} onOpen={onOpenArticle} />
        ))}
      </div>
    </section>
  );
}
