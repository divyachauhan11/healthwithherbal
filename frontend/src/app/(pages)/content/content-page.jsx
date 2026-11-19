"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";
import { DataTable } from "@/components/admin/tables";
import { submitContactMessage } from "@/lib/api";
const contentPages = {
  "Shipping Policy": {
    eyebrow: "Delivery information",
    title: "Shipping Policy",
    intro:
      "Our shipping policy is to provide our customers efficient, dependable order delivery at reasonable prices.",
    sections: [
      {
        title: "Shipping and delivery overview",
        summary:
          "We ship worldwide through India Post and dispatch after payment confirmation.",
        copy: "We ship through India Post worldwide. We dispatch the goods within 2 to 3 working days after confirmation that payment has been received. Goods are delivered within 30 days from the date of dispatch. If, for reasons beyond our control, your area is not serviceable by our logistics partners, we will refund the money.",
      },
      {
        title: "Mobile number required",
        summary:
          "Please provide your mobile number when you make payment; it is mandatory for standard shipping services.",
        copy: "Kindly provide your mobile number whenever you make payment because it is mandatory for standard shipping services to ship the article.",
      },
      {
        title: "Shipping charges and tracking",
        summary:
          "Standard Airmail is free; Priority Shipping is $12.99 per order.",
        copy: "Standard Airmail shipping is free for all orders. You can track the shipment with the tracking information provided to you. Priority Shipping is available if required; the charge is $12.99 per order, and you can track the shipment with the tracking information provided to you.",
      },
      {
        title: "Standard shipping method",
        summary:
          "Most orders are sent by Airmail and take 10 to 25 business days to arrive.",
        copy: "Most orders are shipped via Airmail Shipping, which could take between 10 to 25 business days for parcels to reach your doorstep.",
      },
      {
        title: "Dispatch schedule and delivery times",
        summary:
          "Dispatch timing depends on the order day; transit estimates vary by shipping method.",
        copy: "Most orders are shipped the next day if the order is placed Monday to Friday. Orders placed on Saturday and Sunday will be shipped on Monday. Orders placed before a public holiday will be shipped by the next business day. For example, if you place an order on 24 December, it will be shipped on 26 December if that day is not a Sunday. Typical delivery times from the shipping date are 3 to 7 days with Priority Shipping and 10 to 25 days with Standard Airmail Shipping. If a product is back-ordered or we expect an unusual shipping delay of more than 4 days, we will promptly notify you by email.",
      },
      {
        title: "General delivery estimates by destination",
        summary:
          "These general estimates are counted from the dispatch date and can vary.",
        copy: "General delivery estimates from the date of dispatch are as follows for different countries:",
        destinations: [
          ["UK", "10–12 days"],
          [
            "USA",
            "16–18 days (Alaska, Puerto Rico and Hawaii may take up to 25 days)",
          ],
          ["Australia", "15 days"],
          ["Russia", "22 days"],
          [
            "Lithuania, Belarus, Bulgaria, Kazakhstan and Ukraine",
            "25–28 days",
          ],
          [
            "Croatia, Bosnia & Herzegovina, Estonia, Azerbaijan and Armenia",
            "22–25 days",
          ],
          ["Western Europe", "12–18 days"],
          ["Israel", "18–20 days"],
          ["Turkey", "16–20 days"],
          ["Malaysia, Indonesia and the Philippines", "15–20 days"],
          ["Singapore", "10–12 days"],
          ["Japan", "10–12 days"],
          ["Sri Lanka", "10 days"],
          ["Thailand", "16–18 days"],
          ["Argentina", "28–30 days"],
          ["Brazil", "25–27 days"],
          [
            "Costa Rica, Peru, Ecuador, Chile, El Salvador and Panama",
            "22–27 days",
          ],
          ["All other countries", "25–30 days"],
        ],
        note: "These are general estimates and apply to 98% of orders. Two percent of orders may sometimes be delayed due to postal or customs complexities and other reasons beyond our control and knowledge. Heavy snow in winter, festivals in India or Christmas holidays in destination countries may occasionally make delivery take longer than the general estimate.",
      },
      {
        title: "Customs, order status and fees",
        summary:
          "Local customs can delay delivery; customers are responsible for import charges in the destination country.",
        copy: "Please do not contact us to speed up your order through customs, as we have no control over local customs delays. HEALTHWITHHERBALDOTCOM may be unable to ship to some international destinations due to local customs regulations. You, the customer, are responsible for all shipping charges, taxes, duties or other customs fees assessed in the country of delivery. Check your local customs regulations before ordering.",
      },
      {
        title: "Address changes and questions",
        summary:
          "Additional charges may apply for incorrect addresses or forwarding; email support with questions.",
        copy: "Additional charges may be applied if the delivery address is incorrect or if the package needs to be forwarded to a different location. For questions about our shipping policy or to inquire about your order, please email support@healthwithherbal.com.",
      },
    ],
  },
  "Returns & Refunds": {
    eyebrow: "Returns policy",
    title: "Return / Refund Policy",
    intro:
      "We are committed to being fair and protecting your financial interests under all circumstances. All our transactions are insured at no additional cost to you.",
    sections: [
      {
        title: "Lost or undelivered orders",
        summary:
          "If a postal order is lost and not delivered, we will issue a 100% refund or send a replacement.",
        copy: "If your order is lost in the postal system and is not delivered to you, we will either refund you 100% or send you a replacement. In such cases, the refund or replacement shall be processed on the 30th day from the date of dispatch of your transaction.",
      },
      {
        title: "Eligible product returns",
        summary:
          "Return unopened and unused products in new condition with original packaging and accessories within 10 days of receipt.",
        copy: "You can return an unopened and unused product purchased from us in new condition, with its original packaging and accessories, for a refund within 10 days of receipt of the product.",
      },
      {
        title: "Refund and return costs",
        summary:
          "Eligible product returns receive a 100% refund; the buyer pays return shipping, insurance and any duties.",
        copy: "You will receive a 100% refund. Expenses related to sending the product back to us, such as shipping charges, insurance charges and duties, if any, must be paid by the buyer.",
      },
      {
        title: "Before you return an item",
        summary:
          "Please inform us before returning goods so we can assist you with the return.",
        copy: "Please inform us before returning the goods so that we can assist you with the return.",
        steps: [
          "Enclose your order details (invoice or order copy).",
          "Pack the item well.",
          "Mail it to us after contacting us for assistance.",
        ],
      },
    ],
  },
  "Our Story": {
    eyebrow: "About Healthwithherbal",
    title: "Herbal & Ayurvedic care, shared worldwide",
    intro:
      "Healthwithherbal is an online shop for quality Herbal & ayurvedic Heath products, delivered in the USA, UK and worldwide.",
    purpose:
      "Our aim is to spread our knowledge about health with herbals such as Ayurveda and Herbalism in the whole world.",
    sections: [
      {
        title: "Classical & patent medicines",
        summary:
          "Our moto is to brings you only 100% safe top quality classical and patent medicines.",
        copy: "Our moto is to brings you only 100% safe top quality classical and patent medicines.",
      },
      {
        title: "Herbal care for health & skin care",
        summary:
          "We believe in the ability of Herbal care products and their goodness for health and skin care.",
        copy: "Herbs are making their evaluation, believe in the ability of Herbal care products and their goodness for health and skin care.",
      },
      {
        title: "A holistic approach",
        summary:
          "Herbal medicine works on a extra holistic level or targeting the cause.",
        copy: "Herbal medicine works on a extra holistic level or targeting the cause and treating perhaps more mildly but over long term use has shown to offer good results for many.",
      },
      {
        title: "Your feedback matters",
        summary:
          "Queries, complaints, suggestions and feedback help us improve and serve you better.",
        copy: "You can get in touch with us for any query, complaints, suggestions that you may have. We would be glad to have your feedback on our products and quality of service that would help us improve and serve you better.",
      },
      {
        title: "Our goal",
        summary:
          "We want to be a quality player in the Indian health and beauty segment.",
        copy: "It is our goal to be a quality player in the Indian health and beauty segment and we are committed to serve you with 100% satisfaction!",
      },
    ],
  },
  "Contact Us": {
    eyebrow: "We are here to help",
    title: "Contact Us",
    intro:
      "Questions about a product, delivery or your daily ritual? Get in touch with the HealthWithHerbal India team.",
    sections: [],
  },
  "Privacy Policy": {
    eyebrow: "How we handle your information",
    title: "Privacy Policy",
    intro:
      "HEALTHWITHHERBAL DOT COM is committed to safeguarding your privacy online. We value your trust in us.",
    sections: [
      {
        title: "Information needed for orders",
        summary:
          "We collect the contact and delivery details needed to process and serve your orders.",
        copy: "When you place an order, we need to know your first name, last name, address, city, ZIP code, state, country, phone number and contact email address. We use these details to speed up your orders and serve you better. All customer data we collect is protected against unauthorized access. Under special circumstances, such as when we believe in good faith that the law requires it, we may disclose customer data.",
      },
      {
        title: "Sharing information to fulfill orders",
        summary:
          "Some order information is shared with shipping companies and vendors so they can perform order-related functions.",
        copy: "To some extent, information has to be passed on to shipping companies, vendors and others to enable them to perform functions related to fulfilling your order.",
      },
      {
        title: "Cookies and non-personal information",
        summary:
          "Cookie technology is used to track non-personal technical information to improve the Site.",
        copy: "Cookie technology will only be used to track non-personal information such as IP address, browser type, operating system and domain names to improve our Site. Personal information is not extracted through this process.",
      },
      {
        title: "Secure ordering",
        summary:
          "Order information is encrypted by secure server software before it is sent to us.",
        copy: "When you place orders, they are processed through a secure server. The secure server software (SSL) encrypts all information you input before it is sent to us. This makes the information unreadable as it travels across the Internet.",
      },
      {
        title: "Changes to this policy",
        summary:
          "Any changes to our Privacy Policy will be posted on this page.",
        copy: "If we decide to change our Privacy Policy, we will post those changes on this page so that you are always aware of what information we collect, how we use it and under what circumstances we disclose it.",
      },
      {
        title: "Links to other websites",
        summary:
          "Third-party websites may have their own privacy policies, which we do not control.",
        copy: "Our Site may contain links that lead you to other sites. Those sites may have their own privacy policies over which we have no control. Once you leave our Site, our Privacy Policy no longer applies.",
      },
    ],
  },
  Disclaimer: {
    eyebrow: "Please read before using our site",
    title: "Disclaimer",
    intro:
      "Health information and product content on this website is provided for general information only. Please read this disclaimer and speak with a qualified healthcare professional about your individual needs.",
    sections: [
      {
        title: "FDA statement",
        summary:
          "Our products and product claims have not been evaluated or approved by the U.S. FDA.",
        copy: "The products and claims made about specific products on or through this Site have not been evaluated by the United States Food and Drug Administration (FDA) and are not approved to diagnose, treat, cure or prevent disease. Dietary products are not intended to diagnose, treat, prevent or cure disease.",
      },
      {
        title: "Information is for general purposes",
        summary:
          "Website and third-party content is informational, not a diagnosis or treatment plan.",
        copy: "This Site is not intended to provide diagnosis, treatment or medical advice. Products, services, information and other content provided on this Site, including information provided directly or through links to third-party websites, are for informational purposes only. Information about medical and health conditions, treatments and products may be provided in summary form. Information on this Site is not comprehensive and does not cover all diseases, ailments, physical conditions or their treatment.",
      },
      {
        title: "Talk with a healthcare professional",
        summary:
          "Do not use this Site to diagnose or manage a health issue or delay professional care.",
        copy: "Information on this Site, including product labels and packaging, is not a substitute for advice from a healthcare professional. This Site does not recommend self-management of health issues. Do not use information or services on this Site to diagnose or treat a health issue or to prescribe medication or another treatment. Contact your healthcare professional promptly if you have health-related questions. Never disregard or delay medical advice because of information you have read on this Site. Consult a physician or other healthcare professional about diagnoses, treatment options and interactions between your medicines and nutritional supplements.",
      },
      {
        title: "Read product information and use care",
        summary:
          "Read the manufacturer’s information and product packaging before use; individual reactions can differ.",
        copy: "Before using any medication, nutritional, herbal or homeopathic product, or before beginning an exercise or diet program or starting treatment for a health issue, consult your healthcare professional and read the information provided by the product manufacturer and the product label or packaging. Individuals are different and may react differently to products. Consult your physician about possible interactions between medicines you take and nutritional supplements.",
      },
      {
        title: "Liability and product claims",
        summary:
          "HealthWithHerbal.com makes no guarantee or warranty regarding products or services sold.",
        copy: "Healthwithherbal.com is not liable for information provided on this Site, including recommendations regarding supplements for health purposes. Product and nutrient claims have not been evaluated by the United States Food and Drug Administration. Products are not intended to diagnose, treat, prevent or cure disease. Consult a healthcare professional before starting any diet, supplement or exercise program. Healthwithherbal.com makes no guarantee or warranty with respect to products or services sold.",
      },
    ],
  },
};
export function ContentPage({ page, openCatalog, contactContext }) {
  const content = contentPages[page];
  const [sent, setSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactFallbackHref, setContactFallbackHref] = useState(
    "mailto:healthwithherbalindia@gmail.com",
  );
  const isInteractivePolicy =
    page === "Disclaimer" ||
    page === "Privacy Policy" ||
    page === "Shipping Policy" ||
    page === "Returns & Refunds";
  const isExpandablePage = isInteractivePolicy;
  const isStoryPage = page === "Our Story";
  const returnOrderNumber = contactContext?.orderNumber || "";
  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const contactForm = event.currentTarget;
    const form = new FormData(contactForm);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const topic = String(form.get("topic") || "General enquiry").trim();
    const message = String(form.get("message") || "").trim();
    const website = String(form.get("website") || "");
    const subject = `Website enquiry: ${topic}`;
    const body = `Name: ${name}\nEmail: ${email}\nEnquiry type: ${topic}\n\nMessage:\n${message}`;
    setContactFallbackHref(
      `mailto:healthwithherbalindia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
    setContactSending(true);
    setContactError("");
    setSent(false);
    try {
      await submitContactMessage({ name, email, topic, message, website });
      setSent(true);
      contactForm.reset();
    } catch (error) {
      setContactError(error.message || "Could not send your message.");
    } finally {
      setContactSending(false);
    }
  };
  return (
    <main className="content-page">
      <section
        className={`content-hero${page === "Disclaimer" ? " disclaimer-hero" : page === "Privacy Policy" ? " privacy-hero" : page === "Shipping Policy" ? " shipping-hero" : page === "Returns & Refunds" ? " returns-hero" : page === "Contact Us" ? " contact-hero" : isStoryPage ? " story-hero" : ""}`}
      >
        <div className="page-width">
          <span className="eyebrow light">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          {isStoryPage && (
            <a className="story-hero-link" href="#story-purpose">
              Discover our purpose <ArrowRight size={16} />
            </a>
          )}
          {isStoryPage && (
            <div className="story-hero-art" aria-hidden="true">
              <div className="story-art-orbit">
                <span>H</span>
              </div>
              <i />
              <i />
              <i />
              <b>
                AYURVEDA
                <br />& HERBALISM
              </b>
            </div>
          )}
        </div>
      </section>
      {isStoryPage ? (
        <>
          <section className="story-purpose-wrap" id="story-purpose">
            <div className="story-purpose-card">
              <span>Our Purpose</span>
              <p>{content.purpose}</p>
              <div className="story-purpose-flower" aria-hidden="true">
                ✳
              </div>
            </div>
          </section>
          <section className="story-values-section">
            <div className="page-width">
              <header className="story-section-heading">
                <span>Our beliefs</span>
                <h2>What guides our herbal care</h2>
                <p>
                  Explore the principles behind the products and care we bring
                  to our customers.
                </p>
              </header>
              <div className="story-values-grid">
                {content.sections.slice(0, 3).map((section, index) => (
                  <details
                    className={`story-value-card story-value-${index + 1}`}
                    key={section.title}
                    open={index === 0}
                  >
                    <summary>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{section.title}</strong>
                      <ChevronDown size={19} />
                    </summary>
                    <p>{section.copy}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
          <section className="story-commitment-section page-width">
            <header className="story-section-heading">
              <span>Our promise to customers</span>
              <h2>We want to keep improving</h2>
              <p>
                We welcome your feedback and are committed to serving you with
                satisfaction.
              </p>
            </header>
            <div className="story-commitment-grid">
              {content.sections.slice(3).map((section, index) => (
                <article className="story-commitment-card" key={section.title}>
                  <span className="story-commitment-number">0{index + 1}</span>
                  <h3>{section.title}</h3>
                  <p>{section.copy}</p>
                </article>
              ))}
            </div>
            <a className="story-contact-link" href="/pages/contact-us">
              Share your feedback <ArrowRight size={16} />
            </a>
          </section>
        </>
      ) : (
        <section
          className={`page-width content-body${isExpandablePage ? " policy-body" : ""}`}
        >
          {page === "Contact Us" && (
            <>
              <nav className="contact-breadcrumb" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span aria-hidden="true">/</span>
                <span>Contact Us</span>
              </nav>
              <section
                className="contact-business-card"
                aria-labelledby="contact-business-title"
              >
                <div className="contact-business-heading">
                  <span className="contact-business-mark">H</span>
                  <div>
                    <span className="contact-card-eyebrow">Customer care</span>
                    <h2 id="contact-business-title">HEALTHWITHHERBAL INDIA</h2>
                  </div>
                </div>
                <div className="contact-methods">
                  <a href="mailto:healthwithherbalindia@gmail.com">
                    <Mail size={18} />
                    <span>
                      <small>Email</small>
                      <strong>healthwithherbalindia@gmail.com</strong>
                    </span>
                    <ArrowRight size={15} className="contact-method-arrow" />
                  </a>
                  <a href="tel:+919811652642">
                    <Phone size={18} />
                    <span>
                      <small>Phone</small>
                      <strong>+91-9811652642</strong>
                    </span>
                    <ArrowRight size={15} className="contact-method-arrow" />
                  </a>
                  <a href="tel:+919891098027">
                    <Phone size={18} />
                    <span>
                      <small>Phone</small>
                      <strong>+91-9891098027</strong>
                    </span>
                    <ArrowRight size={15} className="contact-method-arrow" />
                  </a>
                  <div className="contact-address">
                    <MapPin size={18} />
                    <span>
                      <small>Address</small>
                      <strong>
                        New Delhi, India
                        <br />
                        110091
                      </strong>
                    </span>
                  </div>
                </div>
              </section>
              <form
                className="contact-form contact-form-reference"
                onSubmit={handleContactSubmit}
              >
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
                        defaultValue={returnOrderNumber ? "Returns" : "Product question"}
                        required
                      >
                        <option>Product question</option>
                        <option>Order support</option>
                        <option>Returns</option>
                        <option>Something else</option>
                      </select>
                    </label>
                  </div>
                  <label className="contact-message-field">
                    Your message
                    <textarea
                      name="message"
                      required
                      rows={8}
                      defaultValue={returnOrderNumber ? `I would like to request a return or exchange for order ${returnOrderNumber}. Please contact me with the next steps.` : ""}
                      placeholder="Write your message here…"
                    />
                  </label>
                </div>
                <div className="contact-form-actions">
                  <AppButton
                    type="submit"
                    className="contact-send-btn"
                    disabled={contactSending}
                  >
                    {contactSending ? (
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
                {contactError && (
                  <p className="contact-form-error" role="alert">
                    {contactError}{" "}
                    <a href={contactFallbackHref}>Open a prefilled email</a>.
                  </p>
                )}
              </form>
            </>
          )}
          {(page === "Privacy Policy" ||
            page === "Shipping Policy" ||
            page === "Returns & Refunds") && (
            <nav className="privacy-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>{content.title}</span>
            </nav>
          )}
          {isInteractivePolicy && (
            <div
              className="disclaimer-reminders"
              aria-label="Important reminders"
            >
              {(page === "Disclaimer"
                ? [
                    ["For information only", "Not diagnosis or treatment"],
                    ["Ask a professional", "Discuss your personal health"],
                    ["Read product labels", "Follow manufacturer guidance"],
                  ]
                : page === "Shipping Policy"
                  ? [
                      ["Worldwide shipping", "Ships through India Post"],
                      [
                        "Free Standard Airmail",
                        "Tracking details are provided",
                      ],
                      [
                        "Mobile number required",
                        "Needed for standard shipping",
                      ],
                    ]
                  : page === "Returns & Refunds"
                    ? [
                        [
                          "10-day return window",
                          "For eligible unopened products",
                        ],
                        ["100% refund", "For eligible product returns"],
                        ["Contact us first", "We can assist with your return"],
                      ]
                    : [
                        ["Order details", "Used to process and serve orders"],
                        [
                          "Order fulfillment",
                          "Shared with service providers as needed",
                        ],
                        ["Secure ordering", "Information encrypted in transit"],
                      ]
              ).map(([title, detail], index) => (
                <div key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              ))}
            </div>
          )}
          {page === "Our Story" && (
            <div
              className="story-highlights"
              aria-label="About Healthwithherbal"
            >
              <div>
                <span>01</span>
                <strong>Herbal & Ayurvedic</strong>
                <small>Our area of knowledge and products</small>
              </div>
              <div>
                <span>02</span>
                <strong>USA, UK & worldwide</strong>
                <small>Delivering herbal and Ayurvedic products</small>
              </div>
              <div>
                <span>03</span>
                <strong>Feedback welcome</strong>
                <small>Help us improve and serve you better</small>
              </div>
            </div>
          )}
          {isExpandablePage ? (
            <div className="disclaimer-accordion-list">
              {content.sections.map((section, index) => (
                <details
                  key={section.title}
                  className="disclaimer-accordion"
                  open={index === 0}
                >
                  <summary>
                    <span className="disclaimer-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="disclaimer-summary-copy">
                      <strong>{section.title}</strong>
                      <small>{section.summary}</small>
                    </span>
                    <ChevronDown
                      className="disclaimer-chevron"
                      size={20}
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="disclaimer-accordion-content">
                    <p>{section.copy}</p>
                    {section.destinations && (
                      <div className="shipping-estimate-table-wrap">
                        <DataTable
                          data={section.destinations.map(
                            ([destination, estimate]) => ({
                              destination,
                              estimate,
                            }),
                          )}
                          rowKey="destination"
                          pagination={false}
                          tableClassName="shipping-estimate-table"
                          columns={[
                            { key: "destination", label: "Destination" },
                            { key: "estimate", label: "General estimate" },
                          ]}
                        />
                      </div>
                    )}
                    {section.note && (
                      <p className="shipping-estimate-note">{section.note}</p>
                    )}
                    {section.steps && (
                      <ol className="return-policy-steps">
                        {section.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            content.sections.map((section) => (
              <article key={section.title} className="content-section">
                <h2>{section.title}</h2>
                <p>{section.copy}</p>
              </article>
            ))
          )}
          {page === "Returns & Refunds" && (
            <a
              className="story-contact-link return-policy-contact-link"
              href="/pages/contact-us"
            >
              Contact us before returning an item <ArrowRight size={16} />
            </a>
          )}
        </section>
      )}
    </main>
  );
}
