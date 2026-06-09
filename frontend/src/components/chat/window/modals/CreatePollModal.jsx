import React, { useState } from "react";

const CreatePollModal = ({ isOpen, onClose, onSendPayload }) => {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    setPollQuestion("");
    setPollOptions(["", ""]);
    setAllowMultiple(true);
    onClose();
  };

  const handleCreate = () => {
    const finalOptions = pollOptions.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: [] }));
    onSendPayload({
      text: JSON.stringify({ 
        question: pollQuestion.trim(), 
        options: finalOptions,
        allowMultiple
      }),
      messageType: "poll",
      timestamp: new Date().toISOString()
    });
    handleClose();
  };

  return (
    <div className="whatsapp-modal-overlay select-none" onClick={handleClose}>
      <div 
        className="whatsapp-modal max-w-[420px] !bg-[var(--bg-sidebar)] border border-[var(--border-strong)] rounded-3xl p-6 relative flex flex-col text-left shadow-[var(--shadow-heavy)] h-auto max-h-[85vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header: Fixed */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">Create Poll</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Ask your contacts a question</p>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-full border-none bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition text-base"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4" style={{ scrollbarWidth: "thin" }}>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Question</label>
            <input
              type="text"
              placeholder="Ask a question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[14px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Options</label>
            <div className="flex flex-col gap-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    className="flex-1 px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[13.5px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border-none bg-transparent hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 flex items-center justify-center cursor-pointer transition shrink-0"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 5 && (
              <button
                type="button"
                className="w-fit text-[11px] font-bold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] bg-transparent border-none cursor-pointer hover:underline self-start mt-1 flex items-center gap-1.5"
                onClick={() => setPollOptions([...pollOptions, ""])}
              >
                <span>+</span> Add Option ({pollOptions.length}/5)
              </button>
            )}
          </div>

          {/* Allow Multiple Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-[var(--border-light)] mt-1 select-none">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">Allow multiple answers</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={allowMultiple} 
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--whatsapp-green)]"></div>
            </label>
          </div>
        </div>

        {/* Footer: Fixed */}
        <div className="flex justify-end gap-2 border-t border-[var(--border-light)] pt-4 mt-4 shrink-0">
          <button
            type="button"
            className="px-4 py-2 bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold rounded-full border-none cursor-pointer transition"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
            className={`px-5 py-2.5 text-xs font-bold rounded-full border-none shadow-md transition cursor-pointer ${
              (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2)
                ? "bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-emerald-500 to-teal-650 text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/10"
            }`}
            onClick={handleCreate}
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
