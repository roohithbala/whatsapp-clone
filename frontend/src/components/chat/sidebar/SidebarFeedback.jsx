import React, { useState } from 'react';

const SidebarFeedback = ({ setRailMode }) => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFeedback("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)]">
        {setRailMode && (
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Feedback</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6 text-left">
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-secondary)] h-full">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Thank you!</h3>
            <p className="text-xs text-[var(--text-secondary)]">Your feedback helps us make WhatsApp better.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Have a suggestion or found a bug? Let us know below.
            </p>
            <div className="mb-4">
              <textarea 
                className="w-full h-44 px-4 py-3 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-xl text-sm focus:border-whatsapp-green focus:bg-[var(--bg-sidebar)] focus:outline-none transition duration-200 resize-none" 
                placeholder="Type your feedback here..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <button 
              className="px-5 py-2.5 bg-whatsapp-green hover:bg-whatsapp-dark-green text-white text-xs font-semibold rounded-full shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full mt-4" 
              onClick={handleSubmit}
              disabled={!feedback.trim()}
            >
              Send Feedback
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarFeedback;
