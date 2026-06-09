import React, { useState } from "react";
import { forgotPassword } from "../../services/authService";
import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import AuthAlert from "./AuthAlert";

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
      <AuthHeader title="Forgot Password" subtitle="Enter your email to recover your account" />

      <AuthAlert type="success" message={message} />
      <AuthAlert type="error" message={error} />

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />

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
