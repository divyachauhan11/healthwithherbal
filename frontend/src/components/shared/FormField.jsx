/**
 * Reusable wrapper for existing labelled-field markup variants.
 * The variant controls the wrapper and label structure; children retain the
 * field's existing control markup and attributes.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  variant = "profile",
}) {
  // Required constraints remain on the child controls to preserve their DOM.
  void required;

  if (variant === "auth-email") {
    return (
      <>
        <label htmlFor={id} className="fp-label">{label}</label>
        <div className={className}>{children}</div>
        {error}
      </>
    );
  }

  if (variant === "auth-password") {
    return (
      <div className={className}>
        <label htmlFor={id} className="fp-label">{label}</label>
        {children}
        {hint}
        {error}
      </div>
    );
  }

  if (variant === "admin-form") {
    return (
      <label className={className || undefined}>
        {label}
        {children}
        {hint != null && <small className="field-hint">{hint}</small>}
        {error}
      </label>
    );
  }

  if (variant === "form-modal") {
    return (
      <label className={className || undefined}>
        {label}
        {children}
        {hint != null && <small className="field-hint">{hint}</small>}
        {error}
      </label>
    );
  }

  if (variant === "form-modal-markdown") {
    return (
      <div className={`markdown-field ${className || ""}`}>
        {label}
        {children}
        {hint != null && <small className="field-hint">{hint}</small>}
        {error}
      </div>
    );
  }

  return (
    <label className={className}>
      <span>{label}</span>
      {children}
      {hint != null && <small>{hint}</small>}
      {error}
    </label>
  );
}

export default FormField;
