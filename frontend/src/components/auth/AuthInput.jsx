import React, { useState } from "react";

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  className = "",
  showPasswordToggle = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`auth-form-group ${className}`}>
      {label && <label className="auth-label">{label}</label>}
      <div className="auth-input-wrapper">
        {icon && <div className="auth-input-icon">{icon}</div>}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`auth-input ${!icon ? "pl-4" : ""}`}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className="auth-input-eye"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
