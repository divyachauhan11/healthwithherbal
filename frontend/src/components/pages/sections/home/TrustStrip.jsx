"use client";
import { Leaf, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { TrustStripItem } from "./TrustStripItem";

/**
 * Home strip of store promises (delivery, guarantee, sourcing, packing).
 */
export function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="page-width">
        <TrustStripItem icon={<Truck />} title="Free delivery" caption="On orders over ₹75" />
        <TrustStripItem icon={<ShieldCheck />} title="30-day guarantee" caption="Love it or return it" />
        <TrustStripItem icon={<Leaf />} title="Authentic & natural" caption="Carefully sourced" />
        <TrustStripItem icon={<PackageCheck />} title="Securely packed" caption="With earth-kind materials" />
      </div>
    </section>
  );
}
