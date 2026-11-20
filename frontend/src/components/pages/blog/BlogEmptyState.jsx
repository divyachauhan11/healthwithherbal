import { ArrowRight, Sparkles } from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";

/**
 * Content of the blog empty state (icon, message and a link to the store);
 * rendered inside the centred container of `BlogPostsSection`.
 * @param {object} props
 * @param {(view: string) => void} [props.openCatalog] Opens the shop catalog.
 */
export function BlogEmptyState({ openCatalog }) {
  return (
    <>
      <Sparkles
        size={40}
        style={{
          color: "var(--forest)",
          opacity: 0.6,
          margin: "0 auto 16px",
        }}
      />
      <h3
        style={{
          fontSize: "22px",
          margin: "0 0 8px",
          color: "var(--forest-deep)",
        }}
      >
        No articles published yet
      </h3>
      <p
        style={{
          color: "var(--muted, #666)",
          fontSize: "14px",
          margin: "0 0 24px",
        }}
      >
        Check back soon for herbal wisdom, wellness guides, and Ayurvedic
        rituals.
      </p>
      <AppButton
        variant="outline"
        onClick={() => openCatalog && openCatalog("All Products")}
      >
        Browse Store Catalog <ArrowRight size={16} />
      </AppButton>
    </>
  );
}
