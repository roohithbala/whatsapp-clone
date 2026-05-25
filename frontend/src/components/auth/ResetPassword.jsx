import React, { useState } from "react";
import api from "../../services/api";

const ResetPassword = ({ token, onNavigate }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/users/reset-password", {
        token,
        newPassword: password,
      });
      setMessage(response.data.message || "Password has been reset successfully!");
      setTimeout(() => {
        onNavigate("login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to reset password");
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

      <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Reset Password</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">Create a new secure password for your account</p>

      {/* Success Message */}
      {message && (
        <div className="bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20 text-[var(--whatsapp-green)] p-3.5 rounded-2xl text-xs text-left mb-5 animate-slideUp flex items-start gap-2.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{message} Redirecting to login...</span>
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
        {/* Password Field */}
        <div className="auth-form-group">
          <label className="auth-label">New Password</label>
          <div className="auth-input-wrapper">
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input pl-4"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="auth-form-group mt-4">
          <label className="auth-label">Confirm Password</label>
          <div className="auth-input-wrapper">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input pl-4"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="auth-button mt-6" disabled={loading}>
          {loading ? "Updating Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
