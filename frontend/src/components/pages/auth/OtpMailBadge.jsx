import { Mail } from "lucide-react";

/** Round mail icon at the top of the code step. */
export function OtpMailBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "#f4f8f5",
        color: "var(--forest)",
        marginBottom: "12px",
        border: "1px solid #d9e6dd",
      }}
    >
      <Mail size={22} />
    </div>
  );
}
