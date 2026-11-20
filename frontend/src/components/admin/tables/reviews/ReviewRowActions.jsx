import { CheckCircle2, EyeOff } from "lucide-react";
import { REVIEW_STATUSES } from "@/constants/statuses";
import { RowActionsMenu } from "../row-actions";

/**
 * Row menu for a review: approve and/or reject depending on its current
 * status, plus delete.
 * @param {Object} props
 * @param {Object} props.review
 * @param {(review: Object, isApproved: boolean, status: string) => void} props.onModerate
 * @param {(review: Object) => void} props.onDelete
 */
export function ReviewRowActions({ review, onModerate, onDelete }) {
  return (
    <RowActionsMenu
      extraActions={[
        ...(review.isApproved
          ? [
              {
                label: "Reject / Hide review",
                icon: EyeOff,
                onClick: () => onModerate(review, false, REVIEW_STATUSES[2]),
              },
            ]
          : [
              {
                label: "Approve (Publish to store)",
                icon: CheckCircle2,
                onClick: () => onModerate(review, true, REVIEW_STATUSES[1]),
              },
              ...(review.status !== REVIEW_STATUSES[2]
                ? [
                    {
                      label: "Reject review",
                      icon: EyeOff,
                      onClick: () => onModerate(review, false, REVIEW_STATUSES[2]),
                    },
                  ]
                : []),
            ]),
      ]}
      onDelete={() => onDelete(review)}
      deleteLabel="Delete"
    />
  );
}
