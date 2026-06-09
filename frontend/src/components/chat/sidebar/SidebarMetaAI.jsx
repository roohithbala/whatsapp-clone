import React from "react";
import { useMetaAIChat } from "../../../hooks/useMetaAIChat";

const SidebarMetaAI = ({ setRailMode }) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    textareaRef,
    messagesEndRef,
    handleSend
  } = useMetaAIChat();

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-transparent shrink-0">
        {setRailMode && (
          <button 
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition duration-200 border-none bg-transparent" 
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-base shadow-sm shrink-0">
            🌐
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Meta AI</h2>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.06),transparent_60%)]">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`max-w-[80%] p-3 rounded-2xl text-[14.5px] leading-relaxed shadow-sm transition-all duration-200 whitespace-pre-wrap ${
                m.sent 
                  ? "bg-blue-600 text-white rounded-br-none self-end" 
                  : "bg-[var(--bg-panel)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-bl-none self-start"
              }`}
            >
              {m.text}
            </div>
          ))}

          {isLoading && (
            <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-2xl rounded-bl-none p-3.5 max-w-[80%] self-start shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
          
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-col gap-2 mt-4 max-w-[80%]">
              {["Tell me a joke", "What's the weather?", "Write a poem"].map((sug) => (
                <button 
                  key={sug}
                  className="w-fit text-left px-3.5 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-blue-500 hover:text-blue-600 text-[13px] font-medium rounded-xl border border-[var(--border-light)] hover:border-blue-500/30 transition-all duration-200 cursor-pointer shadow-sm"
                  onClick={() => handleSend(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Floating Frosted Input Area */}
        <div className="p-3 bg-transparent shrink-0">
          <div className="flex items-center gap-2 bg-[var(--bg-panel)] backdrop-blur-[24px] border border-[var(--border-light)] rounded-2xl p-1.5 shadow-[var(--shadow-medium)] transition-all duration-300 focus-within:border-blue-500/30 focus-within:shadow-[0_8px_32px_rgba(59,130,246,0.08)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Meta AI anything..." 
              rows={1}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] border-0 outline-none resize-none max-h-[100px] min-h-[38px] text-[13.5px] leading-[1.4] self-center"
              style={{ scrollbarWidth: "none" }}
            />
            <button 
              className={`w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${
                input.trim() && !isLoading
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-500 hover:scale-105 active:scale-95"
                  : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              onClick={() => handleSend()}
              type="button"
              disabled={!input.trim() || isLoading}
              title="Send"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarMetaAI;
