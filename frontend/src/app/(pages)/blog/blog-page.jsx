"use client";
import {
  ArticleView,
  BlogCategoryFilter,
  BlogHero,
  BlogPostsSection,
  useArticleShare,
  useBlogCommunity,
  useBlogPosts,
} from "@/components/pages/blog";
import { getRelatedPosts } from "@/components/pages/blog/blog-utils";

/**
 * Storefront blog: the article list with category filter, or a single
 * article (with likes, comments and related posts) when one is open.
 * @param {object} props
 * @param {(view: string) => void} [props.openCatalog] Opens the shop catalog (empty state).
 * @param {Array<object>} [props.blogs] Published blog posts from the store data.
 */
export function BlogPage({ openCatalog, blogs: blogsProp = [] }) {
  const {
    posts,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredPosts,
    activeArticle,
    openArticle,
    closeArticle,
  } = useBlogPosts(blogsProp);
  const activity = useBlogCommunity(activeArticle);
  const share = useArticleShare(activeArticle, activity.showCommentError);

  if (activeArticle) {
    return (
      <main className="blog-page article-page">
        <ArticleView
          article={activeArticle}
          relatedPosts={getRelatedPosts(posts, activeArticle)}
          activity={activity}
          share={share}
          onBack={closeArticle}
          onOpenArticle={openArticle}
        />
      </main>
    );
  }

  return (
    <main className="blog-page">
      <BlogHero />

      <BlogCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <BlogPostsSection
        posts={filteredPosts}
        cardMetrics={activity.cardMetrics}
        onOpenArticle={openArticle}
        openCatalog={openCatalog}
      />
    </main>
  );
}
