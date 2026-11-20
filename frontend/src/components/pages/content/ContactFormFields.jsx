import { CONTACT_TOPICS } from "./content-data";
import { getContactFormDefaults } from "./content-utils";

/**
 * Uncontrolled fields of the contact form: hidden honeypot, name, email,
 * topic and message (prefilled for return requests).
 * @param {object} props
 * @param {string} props.returnOrderNumber Order number of a return request, or "".
 */
export function ContactFormFields({ returnOrderNumber }) {
  const defaults = getContactFormDefaults(returnOrderNumber);
  return (
    <>
      <label className="contact-website-field" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="contact-form-grid">
        <div className="contact-form-fields">
          <label>
            Your name
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Enter your name"
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            How can we help?
            <select
              name="topic"
              defaultValue={defaults.topic}
              required
            >
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="contact-message-field">
          Your message
          <textarea
            name="message"
            required
            rows={8}
            defaultValue={defaults.message}
            placeholder="Write your message here…"
          />
        </label>
      </div>
    </>
  );
}
