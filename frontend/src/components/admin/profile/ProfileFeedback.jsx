/**
 * Error or success message of the profile form; renders nothing without a message.
 * @param {{tone: "error"|"success", message: string}} props Errors are announced as alerts.
 */
export function ProfileFeedback({ tone, message }) {
  if (!message) return null;
  return (
    <p className={`admin-profile-feedback ${tone}`} role={tone === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}
