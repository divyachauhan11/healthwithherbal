"use client";

import { useEffect, useState } from "react";

/**
 * Owns which blog post's comment manager is open; Escape closes it.
 * @returns {{commentsBlog: object|null, setCommentsBlog: Function}}
 */
export function useBlogCommentsDialog() {
  const [commentsBlog, setCommentsBlog] = useState(null);

  useEffect(() => {
    if (!commentsBlog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setCommentsBlog(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [commentsBlog]);

  return { commentsBlog, setCommentsBlog };
}
