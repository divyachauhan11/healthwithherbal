import { useEffect, useMemo, useState } from "react";
import {
  filterPostsByCategory,
  getArticleSlugFromLocation,
  getBlogCategories,
  toBlogPost,
} from "./blog-utils";

/**
 * Own the blog posts, the category filter and the open article, kept in sync
 * with the URL (`/blog/<slug>`, browser back/forward included).
 * @param {Array<object>} blogs Raw blog posts from the store data.
 * @returns {{
 *   posts: Array<object>,
 *   categories: string[],
 *   selectedCategory: string,
 *   setSelectedCategory: (category: string) => void,
 *   filteredPosts: Array<object>,
 *   activeArticle: object|null,
 *   openArticle: (post: object) => void,
 *   closeArticle: () => void,
 * }}
 */
export function useBlogPosts(blogs) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState(null);

  const posts = useMemo(() => {
    if (!Array.isArray(blogs) || blogs.length === 0) {
      return [];
    }
    return blogs.map(toBlogPost);
  }, [blogs]);

  const categories = useMemo(() => getBlogCategories(posts), [posts]);

  const filteredPosts = filterPostsByCategory(posts, selectedCategory);

  useEffect(() => {
    const syncArticleFromUrl = () => {
      const slug = getArticleSlugFromLocation();
      setActiveArticle(slug ? posts.find((post) => post.slug === slug) || null : null);
    };
    syncArticleFromUrl();
    window.addEventListener("popstate", syncArticleFromUrl);
    return () => window.removeEventListener("popstate", syncArticleFromUrl);
  }, [posts]);

  const openArticle = (post) => {
    setActiveArticle(post);
    if (post.slug) {
      const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, window.location.origin);
      window.history.pushState({ page: "blog", blog: post.slug }, "", url);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeArticle = () => {
    setActiveArticle(null);
    const url = new URL("/?page=blog", window.location.origin);
    window.history.replaceState({ page: "blog" }, "", url);
  };

  return {
    posts,
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredPosts,
    activeArticle,
    openArticle,
    closeArticle,
  };
}
