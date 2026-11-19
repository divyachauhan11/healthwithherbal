"use client";

import dynamic from "next/dynamic";

const Storefront = dynamic(() => import("../../../../storefront"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", background: "#fbf8f3" }} />,
});

export default function OrderInvoiceRoute() {
  return <Storefront />;
}
