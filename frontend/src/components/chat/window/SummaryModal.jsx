import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const SummaryModal = ({ isOpen, onClose, messages, chatName }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSummary("");
      setError("");
      setCopied(false);
      return;
    }

    const generateSummary = async () => {
      setLoading(true);
      setError("");
      try {
        // Only summarize text messages and exclude deleted ones
        const validMessages = messages
          .filter(m => !m.isDeleted && m.text)
          .slice(-40) // Last 40 messages
          .map(m => ({
            sender: m.senderUsername || (m.senderId === "meta-ai" ? "Meta AI" : "User"),
            text: m.text
          }));

        if (validMessages.length === 0) {
          setError("No readable messages in recent history to summarize.");
          setLoading(false);
          return;
        }

        const response = await api.post('/meta-ai/summarize', { messages: validMessages });
        setSummary(response.data.summary);
      } catch (err) {
        console.error("Error generating summary:", err);
        setError(err.response?.data?.error || "Failed to generate summary. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="whatsapp-modal-overlay">
      <div className="whatsapp-modal max-w-[500px] !bg-[var(--glass-bg)] backdrop-blur-[24px] border border-[var(--border-light)] shadow-[var(--glass-shadow)] rounded-3xl p-6 relative flex flex-col gap-4 text-left select-text">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">Meta AI Chat Summary</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Summarizing recent messages with {chatName}</p>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-full border-none bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto max-h-[350px] pr-1 py-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 select-none">
              {/* Glowing circular AI loader */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 animate-spin flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/10">
                <div className="w-full h-full bg-[var(--bg-sidebar)] rounded-full" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[var(--text-primary)] animate-pulse">Analyzing conversation...</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Generating structured insights with Groq Llama AI</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 px-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-2.5 select-none">
              <span className="text-2xl">⚠️</span>
              <p className="text-xs font-semibold text-red-400">{error}</p>
            </div>
          ) : (
            <div className="prose prose-invert text-xs leading-relaxed text-[var(--text-primary)] space-y-4 whitespace-pre-wrap select-text selection:bg-[var(--whatsapp-green)]/20">
              {summary}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && summary && (
          <div className="flex justify-end gap-2.5 border-t border-[var(--border-light)] pt-3.5 mt-1 select-none">
            <button 
              className="px-4 py-2 bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold rounded-full border-none cursor-pointer transition shrink-0" 
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-bold rounded-full border-none shadow-md shadow-emerald-500/10 cursor-pointer transition shrink-0 flex items-center gap-1.5" 
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryModal;
