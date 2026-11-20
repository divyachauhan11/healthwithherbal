import { ArrowRight } from "lucide-react";

/** Link from the returns policy to the contact page. */
export function ReturnPolicyContactLink() {
  return (
    <a
      className="story-contact-link return-policy-contact-link"
      href="/pages/contact-us"
    >
      Contact us before returning an item <ArrowRight size={16} />
    </a>
  );
}
