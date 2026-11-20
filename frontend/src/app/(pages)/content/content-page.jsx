"use client";
import {
  ContactPageSections,
  ContentBreadcrumb,
  ContentHero,
  ContentHighlights,
  ContentSectionList,
  PolicyAccordion,
  ReturnPolicyContactLink,
  StoryHeroArt,
  StoryHeroLink,
  StoryPageSections,
  useContactForm,
} from "@/components/pages/content";
import { CONTENT_PAGES } from "@/components/pages/content/content-data";
import {
  getContentPageLayout,
  resolveContentPage,
} from "@/components/pages/content/content-utils";

/**
 * Storefront content page: Our Story, Contact Us and the store policies.
 * (The storefront also passes `openCatalog`; this page does not use it.)
 * @param {object} props
 * @param {string} props.page Content page label, e.g. "Shipping Policy"; labels without
 *   copy fall back via `resolveContentPage`.
 * @param {{orderNumber?: string}|null} [props.contactContext] Prefills a return request on Contact Us.
 */
export function ContentPage({ page: requestedPage, contactContext }) {
  const page = resolveContentPage(requestedPage);
  const content = CONTENT_PAGES[page];
  const contactForm = useContactForm();
  const layout = getContentPageLayout(page);
  const returnOrderNumber = contactContext?.orderNumber || "";

  return (
    <main className="content-page">
      <ContentHero className={layout.heroClassName} content={content}>
        {layout.isStoryPage && <StoryHeroLink />}
        {layout.isStoryPage && <StoryHeroArt />}
      </ContentHero>
      {layout.isStoryPage ? (
        <StoryPageSections content={content} />
      ) : (
        <section
          className={`page-width content-body${layout.isPolicyPage ? " policy-body" : ""}`}
        >
          {layout.isContactPage && (
            <ContactPageSections
              returnOrderNumber={returnOrderNumber}
              form={contactForm}
            />
          )}
          {layout.showPolicyBreadcrumb && (
            <ContentBreadcrumb className="privacy-breadcrumb" current={content.title} />
          )}
          {layout.isPolicyPage && (
            <ContentHighlights
              className="disclaimer-reminders"
              label="Important reminders"
              items={layout.reminders}
            />
          )}
          {layout.isPolicyPage ? (
            <PolicyAccordion sections={content.sections} />
          ) : (
            <ContentSectionList content={content} />
          )}
          {layout.showReturnContactLink && <ReturnPolicyContactLink />}
        </section>
      )}
    </main>
  );
}
