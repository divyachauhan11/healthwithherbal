import { Sparkles } from "lucide-react";

/** Note that reviews are moderated before they are published. */
export function ReviewModerationNote() {
  return (
    <p className="review-moderation-note">
      <Sparkles size={13} color="var(--forest)" />
      All reviews are verified by our apothecary team to protect our community against automated spam before going live.
    </p>
  );
}
