"use client";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/pages/shared/primitives";

/**
 * "Support for the way you feel" cloud of concern links.
 * @param {object} props
 * @param {string[]} props.concerns Concern category names.
 * @param {(view: string, searchTerm?: string) => void} props.openCatalog
 */
export function ConcernsSection({ concerns, openCatalog }) {
  return (
    <section className="section soft-section">
      <div className="page-width">
        <SectionHeading
          eyebrow="Shop your concern"
          title="Support for the way you feel"
          centered
        />
        <div className="concern-cloud">
          {concerns.map((concern) => (
            <button
              type="button"
              key={concern}
              onClick={() => openCatalog("Shop by Concern", concern)}
            >
              {concern}
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
