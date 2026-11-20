"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Password input of the admin sign-in form with a show/hide toggle. */
export function AdminPasswordField() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label>
      Password
      <span className="admin-login-password-field">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
        <button
          type="button"
          className="admin-login-password-toggle"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
