import { ReviewFieldGroup } from "./ReviewFieldGroup";

/**
 * Optional review title input.
 * @param {object} props
 * @param {string} props.value Current title.
 * @param {(value: string) => void} props.onChange
 */
export function ReviewHeadlineField({ value, onChange }) {
  return (
    <ReviewFieldGroup
      htmlFor="review-headline"
      label={<>Review Title <span className="optional">(optional)</span></>}
    >
      <input
        id="review-headline"
        type="text"
        className="review-input"
        placeholder="e.g. Authentic herbs, noticed results in one week!"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={100}
      />
    </ReviewFieldGroup>
  );
}
