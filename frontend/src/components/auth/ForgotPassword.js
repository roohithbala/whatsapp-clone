import React, { useState } from "react";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = ({ onBackToLogin }) => {
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
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {error && <div className="error-message" style={{ marginBottom: "15px" }}>{error}</div>}
      {message && <div style={{ color: "#00a884", marginBottom: "15px" }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      
      <div style={{ marginTop: "20px" }}>
        <button className="text-button" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
