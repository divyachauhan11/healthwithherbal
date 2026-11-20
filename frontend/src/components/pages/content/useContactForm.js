import { useState } from "react";
import { submitContactMessage } from "@/lib/api";
import { buildContactMailto, CONTACT_MAILTO, readContactForm } from "./content-utils";

/**
 * Own the Contact Us form submission: sends the message and keeps a prefilled
 * mailto fallback for when sending fails.
 * @returns {{
 *   sent: boolean,
 *   sending: boolean,
 *   error: string,
 *   fallbackHref: string,
 *   handleSubmit: (event: import("react").FormEvent<HTMLFormElement>) => Promise<void>,
 * }}
 */
export function useContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [fallbackHref, setFallbackHref] = useState(CONTACT_MAILTO);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const contactForm = event.currentTarget;
    const enquiry = readContactForm(contactForm);
    setFallbackHref(buildContactMailto(enquiry));
    setSending(true);
    setError("");
    setSent(false);
    try {
      await submitContactMessage(enquiry);
      setSent(true);
      contactForm.reset();
    } catch (submitError) {
      setError(submitError.message || "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  return { sent, sending, error, fallbackHref, handleSubmit };
}
