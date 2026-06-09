import React from "react";

const MessageTranslationSection = ({
  translationLoading,
  translationError,
  translation,
  translationLanguage,
  isSent,
  onCloseError,
  onHideTranslation
}) => {
  return (
    <>
      {translationLoading && (
        <div className={`mt-2 pt-2 border-t flex items-center gap-2 text-xs select-none ${isSent ? "border-white/20 text-white/70" : "border-[var(--border-light)]/30 text-[var(--text-secondary)]"}`}>
          <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0 ${isSent ? "border-white border-t-transparent" : "border-[var(--whatsapp-green)] border-t-transparent"}`} />
          <span className="italic animate-pulse">Translating...</span>
        </div>
      )}

      {translationError && (
        <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] select-none ${isSent ? "border-white/20 text-white/90" : "border-[var(--border-light)]/30 text-red-400"}`}>
          <span>⚠️ {translationError}</span>
          <button className={`cursor-pointer border-none bg-transparent hover:underline text-[10px] font-bold ${isSent ? "text-white/60 hover:text-white" : "text-[var(--text-secondary)] hover:text-red-400"}`} onClick={onCloseError}>Dismiss</button>
        </div>
      )}

      {translation && (
        <div className={`mt-2 pt-2 border-t select-text leading-relaxed ${isSent ? "border-white/20" : "border-[var(--border-light)]/40"}`}>
          <div className="flex items-center justify-between text-[10px] select-none font-bold uppercase tracking-wider mb-1">
            <span className={`flex items-center gap-1 ${isSent ? "text-white/65" : "text-[var(--text-secondary)]"}`}>
              🌐 Translated to {translationLanguage}
            </span>
            <button 
              className={`cursor-pointer border-none bg-transparent text-[10px] font-bold hover:underline ${isSent ? "text-white/65 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`} 
              onClick={onHideTranslation}
            >
              Hide
            </button>
          </div>
          <div className={`text-[13.5px] italic text-left ${isSent ? "text-white" : "text-[var(--text-primary)]"}`}>{translation}</div>
        </div>
      )}
    </>
  );
};

export default MessageTranslationSection;
