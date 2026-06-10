import React, { useState } from "react";
import api from "../../services/api";

export default function BannedScreen({ userId, email, username, suspensionReason, onBack }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(
    () => sessionStorage.getItem("bannedAppealSubmittedFor") === userId
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError("Please explain your situation before submitting."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/users/ban-appeal", { userId, reason: reason.trim() });
      sessionStorage.setItem("bannedAppealSubmittedFor", userId);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit appeal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card animate-modal-appear">
      {/* Red ban icon */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/30 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Account Suspended</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1 text-center">
          Your account <span className="font-semibold text-red-400">@{username || email}</span> has been suspended by an administrator.
        </p>
      </div>

      {suspensionReason && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Suspension reason</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{suspensionReason}</p>
        </div>
      )}

      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-[var(--whatsapp-green)]/15 border-2 border-[var(--whatsapp-green)]/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-semibold text-center">Appeal Submitted!</p>
          <p className="text-xs text-[var(--text-secondary)] text-center leading-relaxed">
            Your reconsideration request has been sent to the admin team. You will be notified via a message once reviewed.
          </p>
          <button
            onClick={onBack}
            className="mt-2 text-xs font-bold text-[var(--whatsapp-green)] hover:underline bg-transparent border-0 cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      ) : (
        <>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
            <p className="text-xs text-amber-300 leading-relaxed text-center">
              If you believe this is a mistake, you can submit a reconsideration request below. The admin will review your appeal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Your Appeal / Explanation
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you believe this ban should be reconsidered..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)] resize-none transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Appeal...
                </span>
              ) : "Submit Reconsideration Request"}
            </button>
          </form>

          <button
            onClick={onBack}
            className="mt-5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0 cursor-pointer w-full text-center transition"
          >
            ← Back to Login
          </button>
        </>
      )}
    </div>
  );
}
