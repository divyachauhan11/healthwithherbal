import ResetPasswordForm from "@/components/admin/auth/forgot-password/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  return (
    <ResetPasswordForm
      token={typeof params?.token === "string" ? params.token : ""}
      email={typeof params?.email === "string" ? params.email : ""}
    />
  );
}
