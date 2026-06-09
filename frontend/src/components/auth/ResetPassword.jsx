import React, { useState } from "react";
import api from "../../services/api";
import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import AuthAlert from "./AuthAlert";

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
      setMessage(response.data.message || "Password has been reset successfully! Redirecting to login...");
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
      <AuthHeader title="Reset Password" subtitle="Create a new secure password for your account" />

      <AuthAlert type="success" message={message} />
      <AuthAlert type="error" message={error} />

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
          showPasswordToggle={true}
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          showPasswordToggle={true}
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          className="mt-4"
        />

        <button type="submit" className="auth-button mt-6" disabled={loading}>
          {loading ? "Updating Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
