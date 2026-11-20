import { ContactBusinessCard } from "./ContactBusinessCard";
import { ContactForm } from "./ContactForm";
import { ContentBreadcrumb } from "./ContentBreadcrumb";

/**
 * Body of the Contact Us page: breadcrumb, business card and enquiry form.
 * @param {object} props
 * @param {string} props.returnOrderNumber Prefills a return request when set.
 * @param {ReturnType<typeof import("./useContactForm").useContactForm>} props.form Contact form state.
 */
export function ContactPageSections({ returnOrderNumber, form }) {
  return (
    <>
      <ContentBreadcrumb className="contact-breadcrumb" current="Contact Us" />
      <ContactBusinessCard />
      <ContactForm
        returnOrderNumber={returnOrderNumber}
        sending={form.sending}
        sent={form.sent}
        error={form.error}
        fallbackHref={form.fallbackHref}
        onSubmit={form.handleSubmit}
      />
    </>
  );
}
