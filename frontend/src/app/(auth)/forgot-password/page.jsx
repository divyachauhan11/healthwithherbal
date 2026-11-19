"use client";

import { useRouter } from "next/navigation";
import ForgotPasswordPage from "@/components/admin/auth/forgot-password/ForgotPasswordPage";
import { apiPost } from "@/lib/api-client";

export default function Page() {
  const router = useRouter();

  const requestReset = async (email) => {
    await apiPost("/admin/auth/forgot-password", { email });
  };

  return (
    <ForgotPasswordPage
      onSubmit={requestReset}
      onBackToLogin={() => router.push("/admin")}
      loginHref="/admin"
      brandLogo="/admin-login-logo-clean.png"
      title="Reset your password"
      subtitle="Enter your admin or employee email address and we’ll send a reset link if the account is eligible."
    />
  );
}
