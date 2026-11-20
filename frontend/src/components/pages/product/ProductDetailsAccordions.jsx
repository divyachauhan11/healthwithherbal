"use client";
import { ChevronDown } from "lucide-react";

/**
 * "Why you'll love it" (open) and "Ingredients & directions" disclosures.
 */
export function ProductDetailsAccordions() {
  return (
    <>
      <details open>
        <summary>
          Why you’ll love it <ChevronDown />
        </summary>
        <p>
          A grounding addition to your routine, traditionally used to
          support balance and whole-body wellbeing.
        </p>
      </details>
      <details>
        <summary>
          Ingredients & directions <ChevronDown />
        </summary>
        <p>
          Refer to package directions. Keep in a cool, dry place and consult
          your healthcare provider when needed.
        </p>
      </details>
    </>
  );
}
