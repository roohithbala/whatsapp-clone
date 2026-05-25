import React, { useState } from "react";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || "Password reset instructions sent.");
    } catch (err) {
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card animate-modal-appear">
      {/* Brand Logo & Header */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] opacity-20 blur-md animate-pulse"></div>
        <div className="w-16 h-16 bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,217,166,0.25)] relative z-10">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Forgot Password</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">Enter your email to recover your account</p>

      {/* Success Message */}
      {message && (
        <div className="bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20 text-[var(--whatsapp-green)] p-3.5 rounded-2xl text-xs text-left mb-5 animate-slideUp flex items-start gap-2.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs text-left mb-5 animate-slideUp flex items-start gap-2.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="auth-form-group">
          <label className="auth-label">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <div className="auth-input-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="auth-input"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : "Send Reset Link"}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-8 flex justify-center border-t border-[var(--border-light)] pt-6">
        <button
          className="text-xs font-bold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] hover:underline bg-transparent border-0 cursor-pointer transition-colors duration-200"
          onClick={() => onNavigate("login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
