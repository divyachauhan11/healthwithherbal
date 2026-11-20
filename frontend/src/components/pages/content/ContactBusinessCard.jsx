import { Fragment } from "react";
import { MapPin } from "lucide-react";
import { CONTACT_BUSINESS } from "./content-data";
import { ContactMethodLink } from "./ContactMethodLink";

/** Customer-care business card of the Contact Us page (email, phones, address). */
export function ContactBusinessCard() {
  const { address } = CONTACT_BUSINESS;
  return (
    <section
      className="contact-business-card"
      aria-labelledby="contact-business-title"
    >
      <div className="contact-business-heading">
        <span className="contact-business-mark">{CONTACT_BUSINESS.mark}</span>
        <div>
          <span className="contact-card-eyebrow">{CONTACT_BUSINESS.eyebrow}</span>
          <h2 id="contact-business-title">{CONTACT_BUSINESS.name}</h2>
        </div>
      </div>
      <div className="contact-methods">
        {CONTACT_BUSINESS.methods.map((method) => (
          <ContactMethodLink key={method.href} method={method} />
        ))}
        <div className="contact-address">
          <MapPin size={18} />
          <span>
            <small>{address.label}</small>
            <strong>
              {address.lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}
