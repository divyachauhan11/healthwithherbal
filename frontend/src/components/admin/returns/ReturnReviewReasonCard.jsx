import { ReturnReviewAttachments } from "./ReturnReviewAttachments";

/**
 * The customer's reason for a request and any attached photos.
 * @param {{request: object}} props
 */
export function ReturnReviewReasonCard({ request }) {
  return (
    <section className="return-review-reason-card">
      <div><span>Customer reason</span><p>{request.reason || "No reason provided."}</p></div>
      {request.photos?.length > 0 && (
        <ReturnReviewAttachments photos={request.photos} />
      )}
    </section>
  );
}
