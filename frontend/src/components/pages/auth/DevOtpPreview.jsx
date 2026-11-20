/**
 * Development-only preview of the emailed code (shown when the API returns `devOtp`).
 * @param {object} props
 * @param {string} props.code
 */
export function DevOtpPreview({ code }) {
  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "1px dashed #86efac",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "11.5px",
        color: "#166534",
        marginBottom: "14px",
        textAlign: "center",
      }}
    >
      ⚡ <strong>Dev Mode Preview:</strong> Code is{" "}
      <code>{code}</code>
    </div>
  );
}
