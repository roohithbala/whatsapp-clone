import React from "react";

const LANGUAGES = [
  { name: "Spanish", code: "Spanish" },
  { name: "French", code: "French" },
  { name: "German", code: "German" },
  { name: "Hindi", code: "Hindi" },
  { name: "Japanese", code: "Japanese" },
  { name: "Chinese", code: "Chinese" },
  { name: "Arabic", code: "Arabic" },
  { name: "Portuguese", code: "Portuguese" }
];

const MessageLangPicker = ({ isSent, onClose, onTranslate }) => {
  return (
    <div className={`mt-2 pt-2 border-t select-none text-[12px] animate-slideUp ${isSent ? "border-white/20" : "border-[var(--border-light)]/40"}`}>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
        <span className={`flex items-center gap-1 ${isSent ? "text-white/65" : "text-[var(--text-secondary)]"}`}>
          🌐 Select Target Language
        </span>
        <button 
          className={`cursor-pointer border-none bg-transparent font-bold ${isSent ? "text-white/65 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`} 
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap gap-1 mt-1 max-w-full">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border-none cursor-pointer transition ${
              isSent 
                ? "bg-white/10 hover:bg-white/25 text-white" 
                : "bg-[var(--bg-input)] hover:bg-[var(--whatsapp-green)]/15 text-[var(--text-primary)] hover:text-[var(--whatsapp-green)]"
            }`}
            onClick={() => onTranslate(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageLangPicker;
