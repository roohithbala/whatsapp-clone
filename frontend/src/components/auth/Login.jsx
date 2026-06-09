import React, { useState } from "react";
import userService from "../../services/userService";
import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import AuthAlert from "./AuthAlert";
import GoogleAuthBtn from "./GoogleAuthBtn";
import BannedScreen from "./BannedScreen";

export default function Login({ onSuccess, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannedInfo, setBannedInfo] = useState(null); // { userId, email, username }

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

    try {
      const data = await userService.loginUser(email, password);
      userService.setCurrentUser(data.user);
      onSuccess(data);
    } catch (err) {
      // Check if the account is suspended — show the appeal screen
      const axiosErr = err?.response || err?._axiosError;
      const respData = axiosErr?.data || {};
      if (axiosErr?.status === 403 && respData.code === "ACCOUNT_SUSPENDED") {
        setBannedInfo({ userId: respData.userId, email: respData.email, username: respData.username });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (bannedInfo) {
    return (
      <BannedScreen
        userId={bannedInfo.userId}
        email={bannedInfo.email}
        username={bannedInfo.username}
        onBack={() => setBannedInfo(null)}
      />
    );
  }

  return (
    <div className="auth-card animate-modal-appear">
      <AuthHeader title="Welcome Back" subtitle="Connect securely to start chatting" />

      <form onSubmit={handleSubmit}>
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
          placeholder="Enter your password"
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
              Verifying details...
            </>
          ) : "Login"}
        </button>
      </form>

      <GoogleAuthBtn buttonId="google-signin-btn" textKey="signin_with" onResponse={handleGoogleResponse} />

      <div className="mt-8 flex justify-center items-center gap-4 border-t border-[var(--border-light)] pt-6">
        <button
          className="text-xs font-bold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] hover:underline bg-transparent border-0 cursor-pointer transition-colors duration-200"
          onClick={() => onNavigate("register")}
        >
          Create an Account
        </button>
        <span className="text-[var(--text-muted)] text-[10px] select-none">|</span>
        <button
          className="text-xs font-bold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] hover:underline bg-transparent border-0 cursor-pointer transition-colors duration-200"
          onClick={() => onNavigate("forgotPassword")}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
