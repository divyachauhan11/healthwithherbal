import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * "Back to login" control: a button when a handler is given, otherwise a link.
 * @param {object} props
 * @param {() => void} [props.onBackToLogin]
 * @param {string} props.loginHref Link target when no handler is given.
 * @param {boolean} props.disabled Disables the button variant.
 */
export function BackToLoginControl({ onBackToLogin, loginHref, disabled }) {
  return onBackToLogin ? (
    <button type="button" onClick={onBackToLogin} className="fp-back" disabled={disabled}>
      <ArrowLeft size={15} aria-hidden="true" />
      Back to login
    </button>
  ) : (
    <Link href={loginHref} className="fp-back">
      <ArrowLeft size={15} aria-hidden="true" />
      Back to login
    </Link>
  );
}
