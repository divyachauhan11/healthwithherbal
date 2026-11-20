"use client";

import dynamic from "next/dynamic";
import { StorefrontLoadingScreen } from "@/components/pages/storefront/StorefrontLoadingScreen";

const Storefront = dynamic(() => import("./storefront"), {
  ssr: false,
  loading: () => <StorefrontLoadingScreen />,
});

export default function HomePage() {
  return <Storefront />;
}
