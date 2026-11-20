"use client";

import { useCallback, useState } from "react";
import {
  deleteAdminBlogComment,
  fetchAdminBlogComments,
  updateAdminBlogCommentStatus,
} from "@/lib/admin-api";
import { BLOG_COMMENT_STATUSES } from "@/constants/statuses";
import { useAsyncResource } from "@/hooks";

/**
 * Loads a blog post's comments and moderates them (approve, unapprove, delete after
 * confirmation), with an all/pending/approved filter.
 * @param {{blog: object, token: string, onChanged?: () => void}} options
 * @returns {{
 *   items: Array<object>, visibleItems: Array<object>, loading: boolean, error: string,
 *   filter: string, setFilter: Function, busyId: string, pendingCount: number, approvedCount: number,
 *   changeStatus: (comment: object, status: string) => Promise<void>, deleteComment: (comment: object) => Promise<void>
 * }}
 */
export function useBlogCommentModeration({ blog, token, onChanged }) {
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("all");
  const loadComments = useCallback(
    () => fetchAdminBlogComments(blog._id, token)
      .then((result) => result.items || []),
    [blog._id, token],
  );
  const {
    data: items,
    setData: setItems,
    loading,
    error,
    setError,
  } = useAsyncResource({
    load: loadComments,
    deps: [blog._id, token],
    enabled: true,
    initialData: [],
    errorMessage: (requestError) => requestError.message || "Could not load comments.",
  });

  const changeStatus = async (comment, status) => {
    setBusyId(comment._id);
    setError("");
    try {
      const result = await updateAdminBlogCommentStatus(blog._id, comment._id, status, token);
      setItems((current) => current.map((item) => item._id === comment._id ? result.item : item));
      onChanged?.();
    } catch (requestError) {
      setError(requestError.message || "Could not update comment status.");
    } finally {
      setBusyId("");
    }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    setBusyId(comment._id);
    setError("");
    try {
      await deleteAdminBlogComment(blog._id, comment._id, token);
      setItems((current) => current.filter((item) => item._id !== comment._id));
      onChanged?.();
    } catch (requestError) {
      setError(requestError.message || "Could not delete comment.");
    } finally {
      setBusyId("");
    }
  };

  const pendingCount = items.filter((item) => item.status === BLOG_COMMENT_STATUSES[0]).length;
  const approvedCount = items.filter((item) => item.status === BLOG_COMMENT_STATUSES[1]).length;
  const visibleItems = filter === "all" ? items : items.filter((item) => item.status === filter);

  return {
    items,
    visibleItems,
    loading,
    error,
    filter,
    setFilter,
    busyId,
    pendingCount,
    approvedCount,
    changeStatus,
    deleteComment,
  };
}
