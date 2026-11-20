/** Empty sign-in backdrop shown while the stored session is being restored. */
export function AdminSessionPending() {
  return <main className="admin-login-wrap" aria-busy="true" />;
}
