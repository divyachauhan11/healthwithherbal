"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AppButton } from "../../../components/global/primitives";
const contentPages = {
  "Order History": {
    eyebrow: "Your account",
    title: "Order History",
    intro:
      "Review your recent herbal wellness orders and their delivery status.",
    sections: [
      {
        title: "No past orders yet",
        copy: "When you place your first order, its products, tracking information and receipt will appear here.",
      },
    ],
  },
  "Shipping Policy": {
    eyebrow: "Delivery with care",
    title: "Shipping Policy",
    intro:
      "We securely deliver authentic herbal care to more than 60 countries.",
    sections: [
      {
        title: "Processing times",
        copy: "Orders are carefully packed and dispatched within 24–48 business hours. You will receive tracking details by email as soon as your parcel leaves us.",
      },
      {
        title: "International delivery",
        copy: "Standard international delivery usually takes 7–14 business days. Local customs checks can occasionally extend this estimate.",
      },
      {
        title: "Shipping costs",
        copy: "Shipping is free on orders over ₹75. A flat ₹8 shipping fee applies to smaller orders and is shown before payment.",
      },
    ],
  },
  "Returns & Refunds": {
    eyebrow: "Shop confidently",
    title: "Returns & Refunds",
    intro:
      "If something is not right, our care team will make the return process simple.",
    sections: [
      {
        title: "30-day returns",
        copy: "Unopened and unused products in their original packaging may be returned within 30 days of delivery.",
      },
      {
        title: "Damaged deliveries",
        copy: "Send us a photo within 48 hours of receiving a damaged item and we will arrange a replacement or refund.",
      },
      {
        title: "Refund timing",
        copy: "Approved refunds are returned to your original payment method within 5–10 business days.",
      },
    ],
  },
  "Our Story": {
    eyebrow: "Rooted in tradition",
    title: "Our Story",
    intro:
      "Health with Herbal began with one belief: ancient plant wisdom should be easier to trust, understand and enjoy.",
    sections: [
      {
        title: "A thoughtful herbal shelf",
        copy: "We partner with respected Ayurvedic makers and carefully review every product for authenticity, ingredient integrity and traditional relevance.",
      },
      {
        title: "Old wisdom, modern standards",
        copy: "Our collection respects generations of herbal knowledge while meeting the clarity, convenience and transparency expected today.",
      },
      {
        title: "Wellness without pressure",
        copy: "We are here to help you create small, meaningful rituals—not to prescribe a single path to feeling well.",
      },
    ],
  },
  "Contact Us": {
    eyebrow: "We are here to help",
    title: "Contact Us",
    intro:
      "Questions about a product, delivery or your daily ritual? Our herbal care team would love to hear from you.",
    sections: [
      {
        title: "Customer care",
        copy: "Email care@healthwithherbal.com or use the form below. We reply Monday to Friday, usually within two business days.",
      },
    ],
  },
  "Privacy Policy": {
    eyebrow: "Your data, respected",
    title: "Privacy Policy",
    intro:
      "We collect only what we need to provide a safe, useful and personal shopping experience.",
    sections: [
      {
        title: "Information we collect",
        copy: "We collect account, contact, payment and delivery details when you shop, plus limited technical information needed to operate our website.",
      },
      {
        title: "How information is used",
        copy: "Your information helps us fulfill orders, provide support, prevent fraud and improve the shopping experience. We never sell your personal data.",
      },
      {
        title: "Your choices",
        copy: "You can request a copy, correction or deletion of your personal information by contacting our care team.",
      },
    ],
  },
  Disclaimer: {
    eyebrow: "Important information",
    title: "Disclaimer",
    intro:
      "Our content and products are intended to support informed everyday wellness choices.",
    sections: [
      {
        title: "Not medical advice",
        copy: "Information on this website is educational and is not a substitute for diagnosis, treatment or advice from a qualified healthcare professional.",
      },
      {
        title: "Product information",
        copy: "Herbal products are not intended to diagnose, treat, cure or prevent disease. Always follow label directions and consult your healthcare provider when appropriate.",
      },
      {
        title: "Individual results",
        copy: "Every person is different. Experiences and outcomes may vary based on individual health, lifestyle and product use.",
      },
    ],
  },
};
export function ContentPage({ page, openCatalog }) {
  const content = contentPages[page];
  const [sent, setSent] = useState(false);
  return (
    <main className="content-page">
      <section className="content-hero">
        <div className="page-width">
          <span className="eyebrow light">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </div>
      </section>
      <section className="page-width content-body">
        {content.sections.map((section) => (
          <article key={section.title} className="content-section">
            <h2>{section.title}</h2>
            <p>{section.copy}</p>
          </article>
        ))}
        {page === "Contact Us" && (
          <form
            className="contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <div className="form-grid">
              <label>
                Your name
                <input required placeholder="Full name" />
              </label>
              <label>
                Email address
                <input type="email" required placeholder="you@example.com" />
              </label>
            </div>
            <label>
              How can we help?
              <select required>
                <option>Product question</option>
                <option>Order support</option>
                <option>Returns</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              Message
              <textarea required placeholder="Tell us a little more..." />
            </label>
            <AppButton type="submit">
              {sent ? (
                <>
                  <Check size={16} /> Message sent
                </>
              ) : (
                <>
                  Send message <ArrowRight size={16} />
                </>
              )}
            </AppButton>
          </form>
        )}
        {page === "Order History" && (
          <AppButton onClick={() => openCatalog("All Products")}>
            Start shopping <ArrowRight size={16} />
          </AppButton>
        )}
      </section>
    </main>
  );
}
