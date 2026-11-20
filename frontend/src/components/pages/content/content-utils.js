import {
  CONTACT_EMAIL,
  CONTENT_HERO_MODIFIERS,
  POLICY_BREADCRUMB_PAGES,
  POLICY_PAGES,
  POLICY_REMINDERS,
} from "./content-data";

/** Plain mailto link of the customer-care inbox. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Describe which blocks a content page renders.
 * @param {string} page Content page label, e.g. "Shipping Policy".
 * @returns {{
 *   heroClassName: string,
 *   isStoryPage: boolean,
 *   isContactPage: boolean,
 *   isPolicyPage: boolean,
 *   showPolicyBreadcrumb: boolean,
 *   reminders: Array<[string, string]>|null,
 *   showReturnContactLink: boolean,
 * }}
 */
export function getContentPageLayout(page) {
  const isPolicyPage = POLICY_PAGES.includes(page);
  return {
    heroClassName: `content-hero${hasOwn(CONTENT_HERO_MODIFIERS, page) ? CONTENT_HERO_MODIFIERS[page] : ""}`,
    isStoryPage: page === "Our Story",
    isContactPage: page === "Contact Us",
    isPolicyPage,
    showPolicyBreadcrumb: POLICY_BREADCRUMB_PAGES.includes(page),
    reminders: isPolicyPage ? POLICY_REMINDERS[page] : null,
    showReturnContactLink: page === "Returns & Refunds",
  };
}

/**
 * Read the trimmed contact form values from a submitted form element.
 * @param {HTMLFormElement} formElement
 * @returns {{name: string, email: string, topic: string, message: string, website: string}}
 */
export function readContactForm(formElement) {
  const form = new FormData(formElement);
  return {
    name: String(form.get("name") || "").trim(),
    email: String(form.get("email") || "").trim(),
    topic: String(form.get("topic") || "General enquiry").trim(),
    message: String(form.get("message") || "").trim(),
    website: String(form.get("website") || ""),
  };
}

/**
 * Build a mailto link prefilled with a contact form enquiry (used as the
 * fallback when the message cannot be sent).
 * @param {{name: string, email: string, topic: string, message: string}} enquiry
 * @returns {string}
 */
export function buildContactMailto({ name, email, topic, message }) {
  const subject = `Website enquiry: ${topic}`;
  const body = `Name: ${name}\nEmail: ${email}\nEnquiry type: ${topic}\n\nMessage:\n${message}`;
  return `${CONTACT_MAILTO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Initial topic and message of the contact form; prefilled as a return
 * request when an order number is given.
 * @param {string} returnOrderNumber
 * @returns {{topic: string, message: string}}
 */
export function getContactFormDefaults(returnOrderNumber) {
  return {
    topic: returnOrderNumber ? "Returns" : "Product question",
    message: returnOrderNumber
      ? `I would like to request a return or exchange for order ${returnOrderNumber}. Please contact me with the next steps.`
      : "",
  };
}
