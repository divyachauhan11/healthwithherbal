import { ArrowRight, Mail, Phone } from "lucide-react";

/**
 * Email or phone row of the contact business card.
 * @param {object} props
 * @param {{kind: "email"|"phone", href: string, label: string, value: string}} props.method
 */
export function ContactMethodLink({ method }) {
  return (
    <a href={method.href}>
      {method.kind === "email" ? <Mail size={18} /> : <Phone size={18} />}
      <span>
        <small>{method.label}</small>
        <strong>{method.value}</strong>
      </span>
      <ArrowRight size={15} className="contact-method-arrow" />
    </a>
  );
}
