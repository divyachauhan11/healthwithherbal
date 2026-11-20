import { ExternalLink } from "lucide-react";

/**
 * Thumbnails of the photos a customer attached to a request; each opens in a new tab.
 * @param {{photos: string[]}} props
 */
export function ReturnReviewAttachments({ photos }) {
  return (
    <div className="return-review-attachments">
      <span>Photos ({photos.length})</span>
      <div>{photos.map((url, index) => (
        <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" aria-label={`Open customer photo ${index + 1}`}>
          <img src={url} alt={`Customer return attachment ${index + 1}`} /><ExternalLink size={13} />
        </a>
      ))}</div>
    </div>
  );
}
