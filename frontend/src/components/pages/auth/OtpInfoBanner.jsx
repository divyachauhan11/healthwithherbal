/**
 * Delivery information banner of the code step.
 * @param {object} props
 * @param {string} props.message
 */
export function OtpInfoBanner({ message }) {
  return (
    <div
      className="auth-info-banner"
      style={{
        background: "#fbf6ee",
        border: "1px solid #ebdccb",
        padding: "9px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#6a4a2b",
        marginBottom: "14px",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}
