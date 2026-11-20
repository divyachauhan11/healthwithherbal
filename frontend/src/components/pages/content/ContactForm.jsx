import { ArrowRight, Check } from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";
import { ContactFormFields } from "./ContactFormFields";

/**
 * Contact Us enquiry form with its send button and status messages.
 * @param {object} props
 * @param {string} props.returnOrderNumber Prefills a return request when set.
 * @param {boolean} props.sending Request in flight.
 * @param {boolean} props.sent Last message was sent.
 * @param {string} props.error Send error message, or "".
 * @param {string} props.fallbackHref Prefilled mailto link offered on error.
 * @param {(event: import("react").FormEvent<HTMLFormElement>) => void} props.onSubmit
 */
export function ContactForm({
  returnOrderNumber,
  sending,
  sent,
  error,
  fallbackHref,
  onSubmit,
}) {
  return (
    <form
      className="contact-form contact-form-reference"
      onSubmit={onSubmit}
    >
      <ContactFormFields returnOrderNumber={returnOrderNumber} />
      <div className="contact-form-actions">
        <AppButton
          type="submit"
          className="contact-send-btn"
          disabled={sending}
        >
          {sending ? (
            "Sending…"
          ) : sent ? (
            <>
              <Check size={16} /> Message sent
            </>
          ) : (
            <>
              Send Message <ArrowRight size={16} />
            </>
          )}
        </AppButton>
        <span>
          Your message will be sent securely to our care team.
        </span>
      </div>
      {sent && (
        <p className="contact-form-status" role="status">
          Your message has been sent. We will get back to you soon.
        </p>
      )}
      {error && (
        <p className="contact-form-error" role="alert">
          {error}{" "}
          <a href={fallbackHref}>Open a prefilled email</a>.
        </p>
      )}
    </form>
  );
}
