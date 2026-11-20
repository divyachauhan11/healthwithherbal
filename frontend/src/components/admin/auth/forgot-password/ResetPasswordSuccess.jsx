import Link from "next/link";
import { Check } from "lucide-react";

/** Confirmation shown after the password was reset, with a link to the admin login. */
export function ResetPasswordSuccess() {
  return (
    <div role="status">
      <div className="fp-success-icon"><Check size={24} aria-hidden="true" /></div>
      <h1 className="fp-title text-3xl font-bold">Password updated</h1>
      <p className="fp-subtitle text-[var(--fp-text-muted)]">Your password has been reset. Sign in with your new password.</p>
      <Link href="/admin" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]">Back to admin login</Link>
    </div>
  );
}
