import { ReviewFieldGroup } from "./ReviewFieldGroup";

/**
 * Required review text area ("Detailed Experience").
 * @param {object} props
 * @param {string} props.value Current review text.
 * @param {(value: string) => void} props.onChange
 */
export function ReviewCommentField({ value, onChange }) {
  return (
    <ReviewFieldGroup
      htmlFor="review-body"
      label={<>Detailed Experience <span className="required">*</span></>}
    >
      <textarea
        id="review-body"
        className="review-textarea"
        rows={4}
        placeholder="What did you like or dislike? How did you consume this product? How did it help your wellness routine?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        maxLength={2000}
      />
    </ReviewFieldGroup>
  );
}
