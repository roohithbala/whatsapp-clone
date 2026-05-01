import React, { useState } from 'react';

const SidebarFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFeedback("");
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Feedback</h2>
      </div>
      
      <div className="sidebar-scrollable" style={{ padding: '24px' }}>
        {submitted ? (
          <div className="empty-state-centered">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3>Thank you!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your feedback helps us make WhatsApp better.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Have a suggestion or found a bug? Let us know below.
            </p>
            <div className="form-group">
              <textarea 
                className="whatsapp-input" 
                placeholder="Type your feedback here..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{ height: '180px', resize: 'none' }}
              />
            </div>
            <button 
              className="professional-button" 
              onClick={handleSubmit}
              disabled={!feedback.trim()}
              style={{ marginTop: '16px' }}
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
