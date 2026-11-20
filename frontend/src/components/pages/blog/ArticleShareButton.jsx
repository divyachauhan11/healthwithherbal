import { Check, Share2 } from "lucide-react";

/**
 * Share button of the article header; shows "Copied" after the link was copied.
 * @param {object} props
 * @param {boolean} props.copied
 * @param {() => void} props.onShare
 */
export function ArticleShareButton({ copied, onShare }) {
  return (
    <button
      type="button"
      className="article-share-button"
      onClick={onShare}
    >
      {copied ? "Copied" : "Share"}
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
