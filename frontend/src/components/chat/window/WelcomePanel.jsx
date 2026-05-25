import React from "react";

const WelcomePanel = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-between bg-transparent text-center relative select-none p-8 md:p-12 h-full overflow-hidden">
      {/* Premium Animated Background Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute w-[600px] h-[600px] rounded-full border border-[var(--whatsapp-green)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_120s_linear_infinite]" />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-dashed border-[var(--whatsapp-green)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_80s_linear_infinite]" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-[var(--whatsapp-green)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Spacer to push center content down */}
      <div className="flex-grow" />

      <div className="flex flex-col items-center justify-center max-w-md relative z-10 shrink-0 my-6 animate-modal-appear">
        {/* Glowing glass logo container */}
        <div className="w-[180px] h-[180px] rounded-full bg-[var(--bg-sidebar-alt)] border border-[var(--border-light)] flex items-center justify-center mb-8 shadow-xl transition-all duration-500 hover:scale-105 hover:border-[var(--whatsapp-green)]/30 group relative">
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] opacity-10 blur-sm group-hover:opacity-20 transition-opacity"></div>
          <svg viewBox="0 0 24 24" className="w-20 h-20 fill-[var(--whatsapp-green)] relative z-10 drop-shadow-[0_4px_12px_rgba(0,217,166,0.25)]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3 leading-tight">
          WhatsApp Web
        </h2>
        <p className="text-[14.5px] text-[var(--text-secondary)] leading-relaxed max-w-sm mb-2 font-medium">
          Send and receive messages without keeping your phone online.
        </p>
        <p className="text-[12.5px] text-[var(--text-muted)] leading-relaxed max-w-sm font-medium">
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        {/* Premium feature chips */}
        <div className="flex flex-wrap gap-2.5 justify-center mt-8">
          {[
            { icon: "🔒", text: "End-to-end encrypted" },
            { icon: "📱", text: "Multi-device" },
            { icon: "🌐", text: "Web access" },
          ].map((chip) => (
            <div
              key={chip.text}
              className="flex items-center gap-2 bg-[var(--bg-input)] hover:bg-[var(--bg-sidebar-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[12px] font-semibold px-4 py-2 rounded-full border border-[var(--border-input)] shadow-sm transition-all duration-300 hover:scale-105"
            >
              <span>{chip.icon}</span>
              <span>{chip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer to push bottom lock indicator down */}
      <div className="flex-grow" />

      {/* Bottom lock indicator */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-6 border-t border-[var(--border-light)] w-full max-w-xs justify-center select-none shrink-0 font-medium tracking-wide">
        <svg viewBox="0 0 24 24" width="14" height="14" className="fill-current text-[var(--text-muted)]">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
        </svg>
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
};

export default WelcomePanel;
