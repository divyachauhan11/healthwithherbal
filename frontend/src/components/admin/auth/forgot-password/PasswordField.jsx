import { Eye, EyeOff, KeyRound } from "lucide-react";
import { FormField } from "@/components/shared/FormField";

/**
 * Password input with a key icon, a show/hide toggle and a hint slot.
 * @param {object} props
 * @param {string} props.id Input id (also used by the label).
 * @param {string} props.label
 * @param {string} props.className Field wrapper class.
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {boolean} props.visible Show the password as text.
 * @param {() => void} props.onToggleVisible
 * @param {string} props.showLabel Toggle label while hidden.
 * @param {string} props.hideLabel Toggle label while visible.
 * @param {boolean} props.disabled
 * @param {import("react").ReactNode} [props.children] Hint rendered below the input.
 */
export function PasswordField({
  id,
  label,
  className,
  value,
  onChange,
  visible,
  onToggleVisible,
  showLabel,
  hideLabel,
  disabled,
  children,
}) {
  return (
    <FormField
      variant="auth-password"
      id={id}
      label={label}
      className={className}
    >
      <div className="fp-password-wrap">
        <KeyRound className="fp-password-icon" size={17} aria-hidden="true" />
        <input
          id={id}
          className="fp-input fp-password-input"
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required
        />
        <button type="button" className="fp-password-toggle" onClick={onToggleVisible} aria-label={visible ? hideLabel : showLabel} aria-pressed={visible} disabled={disabled}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {children}
    </FormField>
  );
}
