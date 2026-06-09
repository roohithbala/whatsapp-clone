import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-xs animate-overlay-fade" onClick={onClose}>
      <div className="bg-[var(--bg-sidebar)] w-[90%] max-w-[420px] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-modal-appear" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-[var(--border-light)] pb-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)] m-0">{title}</h3>
          <button className="bg-transparent border-0 text-2xl font-light cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 leading-none transition" onClick={onClose}>&times;</button>
        </div>
        <div className="text-[var(--text-primary)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
