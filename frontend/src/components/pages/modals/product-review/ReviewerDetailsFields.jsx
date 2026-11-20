import { ReviewFieldGroup } from "./ReviewFieldGroup";

/**
 * Reviewer display name and email inputs, side by side.
 * @param {object} props
 * @param {string} props.name Display name.
 * @param {string} props.email Email address.
 * @param {(value: string) => void} props.onNameChange
 * @param {(value: string) => void} props.onEmailChange
 */
export function ReviewerDetailsFields({ name, email, onNameChange, onEmailChange }) {
  return (
    <div className="review-form-row">
      <ReviewFieldGroup htmlFor="reviewer-name" label="Your Display Name">
        <input
          id="reviewer-name"
          type="text"
          className="review-input"
          placeholder="e.g. Priya S."
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </ReviewFieldGroup>

      <ReviewFieldGroup htmlFor="reviewer-email" label="Email Address">
        <input
          id="reviewer-email"
          type="email"
          className="review-input"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </ReviewFieldGroup>
    </div>
  );
}
