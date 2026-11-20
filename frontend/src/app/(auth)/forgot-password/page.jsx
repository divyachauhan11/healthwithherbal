"use client";

import { useRouter } from "next/navigation";
import ForgotPasswordPage from "@/components/admin/auth/forgot-password/ForgotPasswordPage";
import { requestAdminPasswordReset } from "@/lib/admin-api";

export default function Page() {
  const router = useRouter();

  const requestReset = async (email) => {
    await requestAdminPasswordReset(email);
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
