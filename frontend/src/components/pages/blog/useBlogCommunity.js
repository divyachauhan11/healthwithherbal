import { useEffect, useRef, useState } from "react";
import {
  fetchBlogCommunity,
  getBlogVisitorId,
  recordBlogView,
  setBlogLike,
  submitBlogComment,
} from "@/lib/api";

/**
 * Own the community activity of the open article: records one view per
 * article per visit, loads likes/views/approved comments, toggles this
 * visitor's like and submits comments. Also keeps the latest counts per slug
 * for the blog cards.
 * @param {{slug: string}|null} activeArticle The open article, or null on the list view.
 * @returns {{
 *   community: {likes: number, comments: number, views: number, liked: boolean, allowComments: boolean, items: Array<object>},
 *   cardMetrics: Object<string, {likes?: number, views?: number, comments?: number}>,
 *   communityBusy: boolean,
 *   commentForm: {authorName: string, authorEmail: string, content: string},
 *   updateCommentField: (field: "authorName"|"authorEmail"|"content", value: string) => void,
 *   commentNotice: string,
 *   commentNoticeIsError: boolean,
 *   showCommentError: (message: string) => void,
 *   toggleLike: () => Promise<void>,
 *   sendComment: (event: import("react").FormEvent<HTMLFormElement>) => Promise<void>,
 * }}
 */
export function useBlogCommunity(activeArticle) {
  const [community, setCommunity] = useState({ likes: 0, comments: 0, views: 0, liked: false, allowComments: true, items: [] });
  const [cardMetrics, setCardMetrics] = useState({});
  const [communityBusy, setCommunityBusy] = useState(false);
  const [commentForm, setCommentForm] = useState({ authorName: "", authorEmail: "", content: "" });
  const [commentNotice, setCommentNotice] = useState("");
  const [commentNoticeIsError, setCommentNoticeIsError] = useState(false);
  const viewedArticles = useRef(new Set());
  const activeSlug = activeArticle?.slug;

  useEffect(() => {
    if (!activeSlug) return;
    let active = true;
    const sessionId = getBlogVisitorId();
    setCommunityBusy(true);
    setCommentNotice("");
    setCommentNoticeIsError(false);
    setCommentForm((form) => ({ ...form, content: "" }));
    const loadCommunity = async () => {
      try {
        if (!viewedArticles.current.has(activeSlug)) {
          viewedArticles.current.add(activeSlug);
          try {
            await recordBlogView(activeSlug, sessionId);
          } catch (error) {
            if (active) {
              setCommentNotice(error.message || "Could not record this article view.");
              setCommentNoticeIsError(true);
            }
          }
        }
        const data = await fetchBlogCommunity(activeSlug, sessionId);
        if (active) {
          setCommunity({ ...data, items: data.items || [] });
          setCardMetrics((current) => ({
            ...current,
            [activeSlug]: { likes: data.likes, views: data.views, comments: data.comments },
          }));
        }
      } catch (error) {
        if (active) {
          setCommentNotice(error.message || "Could not load article activity.");
          setCommentNoticeIsError(true);
        }
      } finally {
        if (active) setCommunityBusy(false);
      }
    };
    loadCommunity();
    return () => { active = false; };
  }, [activeSlug]);

  const showCommentError = (message) => {
    setCommentNotice(message);
    setCommentNoticeIsError(true);
  };

  const updateCommentField = (field, value) => {
    setCommentForm((form) => ({ ...form, [field]: value }));
  };

  const toggleLike = async () => {
    setCommunityBusy(true);
    try {
      const result = await setBlogLike(activeArticle.slug, getBlogVisitorId(), !community.liked);
      setCommunity((current) => ({ ...current, liked: result.liked, likes: result.likes }));
      setCardMetrics((current) => ({
        ...current,
        [activeArticle.slug]: {
          ...current[activeArticle.slug],
          likes: result.likes,
        },
      }));
    } catch (error) {
      showCommentError(error.message || "Could not update your like.");
    } finally {
      setCommunityBusy(false);
    }
  };

  const sendComment = async (event) => {
    event.preventDefault();
    setCommunityBusy(true);
    setCommentNotice("");
    setCommentNoticeIsError(false);
    try {
      const result = await submitBlogComment(activeArticle.slug, commentForm);
      setCommentForm((form) => ({ ...form, content: "" }));
      setCommentNotice(result.message || "Your comment is awaiting approval.");
    } catch (error) {
      showCommentError(error.message || "Could not submit your comment.");
    } finally {
      setCommunityBusy(false);
    }
  };

  return {
    community,
    cardMetrics,
    communityBusy,
    commentForm,
    updateCommentField,
    commentNotice,
    commentNoticeIsError,
    showCommentError,
    toggleLike,
    sendComment,
  };
}
