/**
 * Static copy for the storefront content pages (Our Story, Contact Us and
 * the store policies). Keys are the content page labels used by the
 * storefront router (`/pages/<slug>` resolves to these labels).
 *
 * Each entry: `{ eyebrow, title, intro, purpose?, sections: [{ title, summary?,
 * copy, destinations?, note?, steps? }] }`.
 */
export const CONTENT_PAGES = {
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

/** Hero modifier class appended to `content-hero` for each page. */
export const CONTENT_HERO_MODIFIERS = {
  Disclaimer: " disclaimer-hero",
  "Privacy Policy": " privacy-hero",
  "Shipping Policy": " shipping-hero",
  "Returns & Refunds": " returns-hero",
  "Contact Us": " contact-hero",
  "Our Story": " story-hero",
};

/** Policy pages rendered as numbered accordions with reminder highlights. */
export const POLICY_PAGES = [
  "Disclaimer",
  "Privacy Policy",
  "Shipping Policy",
  "Returns & Refunds",
];

/** Policy pages that show the "Home / <title>" breadcrumb. */
export const POLICY_BREADCRUMB_PAGES = [
  "Privacy Policy",
  "Shipping Policy",
  "Returns & Refunds",
];

/** `[title, detail]` reminder highlights shown above each policy accordion. */
export const POLICY_REMINDERS = {
  Disclaimer: [
    ["For information only", "Not diagnosis or treatment"],
    ["Ask a professional", "Discuss your personal health"],
    ["Read product labels", "Follow manufacturer guidance"],
  ],
  "Shipping Policy": [
    ["Worldwide shipping", "Ships through India Post"],
    ["Free Standard Airmail", "Tracking details are provided"],
    ["Mobile number required", "Needed for standard shipping"],
  ],
  "Returns & Refunds": [
    ["10-day return window", "For eligible unopened products"],
    ["100% refund", "For eligible product returns"],
    ["Contact us first", "We can assist with your return"],
  ],
  "Privacy Policy": [
    ["Order details", "Used to process and serve orders"],
    ["Order fulfillment", "Shared with service providers as needed"],
    ["Secure ordering", "Information encrypted in transit"],
  ],
};

/** Section headings used by the Our Story layout. */
export const STORY_HEADINGS = {
  purpose: "Our Purpose",
  values: {
    eyebrow: "Our beliefs",
    title: "What guides our herbal care",
    copy: "Explore the principles behind the products and care we bring to our customers.",
  },
  commitment: {
    eyebrow: "Our promise to customers",
    title: "We want to keep improving",
    copy: "We welcome your feedback and are committed to serving you with satisfaction.",
  },
};

/** Customer-care email used by the contact page and its mailto fallback. */
export const CONTACT_EMAIL = "healthwithherbalindia@gmail.com";

/** Business card shown on the Contact Us page. */
export const CONTACT_BUSINESS = {
  mark: "H",
  eyebrow: "Customer care",
  name: "HEALTHWITHHERBAL INDIA",
  methods: [
    { kind: "email", href: `mailto:${CONTACT_EMAIL}`, label: "Email", value: CONTACT_EMAIL },
    { kind: "phone", href: "tel:+919811652642", label: "Phone", value: "+91-9811652642" },
    { kind: "phone", href: "tel:+919891098027", label: "Phone", value: "+91-9891098027" },
  ],
  address: { label: "Address", lines: ["New Delhi, India", "110091"] },
};

/** Options of the contact form "How can we help?" select. */
export const CONTACT_TOPICS = [
  "Product question",
  "Order support",
  "Returns",
  "Something else",
];
