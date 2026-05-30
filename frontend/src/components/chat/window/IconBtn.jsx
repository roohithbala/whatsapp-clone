import React from "react";

const IconBtn = ({ onClick, title, children, active }) => (
  <button
    className={`w-10 h-10 rounded-full bg-transparent border-none flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${
      active
        ? "text-[var(--whatsapp-green)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
    }`}
    onClick={onClick}
    title={title}
    type="button"
  >
    {children}
  </button>
);

export default IconBtn;
