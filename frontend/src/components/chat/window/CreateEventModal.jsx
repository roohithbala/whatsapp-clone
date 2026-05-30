import React, { useState } from "react";

const CreateEventModal = ({ isOpen, onClose, onSendPayload }) => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setEventTitle("");
    setEventDateTime("");
    setEventLocation("");
    onClose();
  };

  const handleCreate = () => {
    onSendPayload({
      text: JSON.stringify({ 
        title: eventTitle.trim(), 
        dateTime: eventDateTime, 
        location: eventLocation.trim() 
      }),
      messageType: "event",
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
            <span className="text-xl">📅</span>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">Create Event</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Organize an event</p>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-full border-none bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition text-base"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4" style={{ scrollbarWidth: "thin" }}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Event Name</label>
            <input
              type="text"
              placeholder="Add title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[14px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date & Time</label>
            <input
              type="datetime-local"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-xl text-[14px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Location</label>
            <input
              type="text"
              placeholder="Add location (optional)"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[14px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
            />
          </div>
        </div>

        {/* Footer: Fixed */}
        <div className="flex justify-end gap-2 border-t border-[var(--border-light)] pt-4 mt-4 shrink-0">
          <button
            type="button"
            className="px-4 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-bold rounded-full border-none cursor-pointer transition"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!eventTitle.trim() || !eventDateTime}
            className={`px-5 py-2.5 text-xs font-bold rounded-full border-none shadow-md transition cursor-pointer ${
              (!eventTitle.trim() || !eventDateTime)
                ? "bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-emerald-500 to-teal-650 text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/10"
            }`}
            onClick={handleCreate}
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
