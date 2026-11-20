import Link from "next/link";

/** Shown when the reset link lacks its token or email; links to a new request. */
export function ResetLinkUnavailable() {
  return (
    <div>
      <h1 className="fp-title text-3xl font-bold">Reset link unavailable</h1>
      <p className="fp-subtitle text-[var(--fp-text-muted)]">This link is incomplete. Request a new password reset link.</p>
      <Link href="/forgot-password" className="fp-button fp-button-full w-full bg-[var(--fp-primary)]">Request a new link</Link>
    </div>
  );
}
