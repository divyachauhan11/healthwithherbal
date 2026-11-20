import { Loader2 } from "lucide-react";

/** Placeholder shown while the invoice's order loads. */
export function InvoiceLoadingState() {
  return <div className="invoice-state"><Loader2 className="spin-animate" /> Loading invoice…</div>;
}
