"use client";
import { ArrowRight } from "lucide-react";
import { AppButton } from "@/components/pages/shared/primitives";

/**
 * Outline "View all" button next to a home section heading.
 * @param {{onClick: () => void}} props
 */
export function ViewAllButton({ onClick }) {
  return (
    <AppButton variant="outline" onClick={onClick}>
      View all <ArrowRight size={16} />
    </AppButton>
  );
}
