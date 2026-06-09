import React, { useState } from "react";
import userService from "../../services/userService";
import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import AuthAlert from "./AuthAlert";
import GoogleAuthBtn from "./GoogleAuthBtn";

export default function Register({ onSuccess, onNavigate }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleResponse = async (response) => {
    setError("");
    setLoading(true);
    try {
      const data = await userService.googleLogin(response.credential);
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const data = await userService.registerUser(
        username,
        email,
        password,
        confirmPassword
      );
      userService.setCurrentUser(data.user);
      onSuccess(data); // Notify parent component of successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card animate-modal-appear">
      <AuthHeader title="Create Account" subtitle="Join us to start real-time messaging" />

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username (min 3 chars)"
          required
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />

        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
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
          placeholder="Confirm your password"
          required
          showPasswordToggle={true}
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />

        <AuthAlert type="error" message={error} />

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
              Creating Account...
            </>
          ) : "Register"}
        </button>
      </form>

      <GoogleAuthBtn buttonId="google-signup-btn" textKey="signup_with" onResponse={handleGoogleResponse} />

      <div className="mt-8 flex justify-center items-center gap-2 border-t border-[var(--border-light)] pt-6">
        <span className="text-xs text-[var(--text-secondary)] font-medium">Already have an account?</span>
        <button
          className="text-xs font-bold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] hover:underline bg-transparent border-0 cursor-pointer transition-colors duration-200"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}
