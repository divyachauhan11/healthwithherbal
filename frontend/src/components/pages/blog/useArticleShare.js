import { useState } from "react";

/**
 * Own the article share action: uses the Web Share API when available,
 * otherwise copies the page URL and briefly flags it as copied.
 * @param {{title: string}|null} activeArticle The open article.
 * @param {(message: string) => void} onUnavailable Reports that sharing is not possible.
 * @returns {{shareCopied: boolean, shareArticle: () => Promise<void>}}
 */
export function useArticleShare(activeArticle, onUnavailable) {
  const [shareCopied, setShareCopied] = useState(false);

  const shareArticle = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: activeArticle.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      } catch {
        onUnavailable("Sharing is unavailable in this browser.");
      }
    }
  };

  return { shareCopied, shareArticle };
}
