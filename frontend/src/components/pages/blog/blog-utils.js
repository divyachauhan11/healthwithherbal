import { dateLabelCompact } from "@/components/admin/global/admin-utils";

/**
 * Normalize a blog post from the store data into the shape the blog views use.
 * @param {object} blog Raw blog post.
 * @returns {{id: string, slug: string, title: string, excerpt: string, content: string|string[],
 *   category: string, tags: string[], readTime: string, date: string, author: string, image: string,
 *   likesCount: number, viewsCount: number, commentsCount: number}}
 */
export const toBlogPost = (blog) => ({
  id: blog._id || blog.id || blog.slug,
  slug: blog.slug,
  title: blog.title,
  excerpt: blog.excerpt,
  content: blog.content,
  category: blog.category || (blog.tags && blog.tags[0]) || "Wellness",
  tags: blog.tags || [],
  readTime: blog.readTime || "5 min read",
  date:
    blog.date ||
    (blog.publishedAt ? dateLabelCompact(blog.publishedAt, "Recent") : "Recent"),
  author: blog.author || "Health With Herbal",
  image: blog.coverImage || blog.image || "",
  likesCount: Number(blog.likesCount) || 0,
  viewsCount: Number(blog.viewsCount) || 0,
  commentsCount: Number(blog.commentsCount) || 0,
});

/**
 * Category filter options: "All" followed by each post category in order of appearance.
 * @param {Array<{category: string}>} posts
 * @returns {string[]}
 */
export function getBlogCategories(posts) {
  const set = new Set(["All"]);
  posts.forEach((post) => {
    if (post.category) set.add(post.category);
  });
  return Array.from(set);
}

/**
 * Posts matching a category (by category or tag); "All" keeps every post.
 * @param {Array<{category: string, tags: string[]}>} posts
 * @param {string} category
 */
export const filterPostsByCategory = (posts, category) =>
  category === "All"
    ? posts
    : posts.filter(
        (post) =>
          post.category === category ||
          (post.tags && post.tags.includes(category)),
      );

/**
 * Up to three other posts to suggest below an article.
 * @param {Array<{id: string}>} posts
 * @param {{id: string}} article
 */
export const getRelatedPosts = (posts, article) =>
  posts.filter((post) => post.id !== article.id).slice(0, 3);

/**
 * Slug of the article addressed by the current URL (`/blog/<slug>` or `?blog=<slug>`).
 * @returns {string|null}
 */
export function getArticleSlugFromLocation() {
  const pathMatch = window.location.pathname.match(/^\/blog\/([^/]+)\/?$/);
  return pathMatch
    ? decodeURIComponent(pathMatch[1])
    : new URLSearchParams(window.location.search).get("blog");
}

/** Format a comment timestamp as e.g. "5 Nov 2026". */
export const formatCommentDate = (createdAt) =>
  new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
