import React, { useState } from 'react';

const MessageBody = ({ message, searchTerm, isSent }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const highlightText = (txt) => {
      if (!searchTerm) return txt;
      const parts = txt.split(new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() 
          ? <mark key={index} className="bg-yellow-400/80 text-zinc-950 px-0.5 rounded font-semibold">{part}</mark>
          : <span key={index}>{part}</span>
      );
    };

    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-whatsapp-blue underline break-all font-medium" 
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{highlightText(part)}</span>;
    });
  };

  const renderMedia = () => {
    if (message.isDeleted) {
      return (
        <div className="italic text-[var(--text-muted)] flex items-center gap-2 text-sm select-none">
          <span>🚫</span> {message.text || "This message was deleted"}
        </div>
      );
    }

    const url = message.mediaUrl || message.audioData || message.fileData || message.imageData || message.videoData;
    
    if (!url) return <div className="whitespace-pre-wrap break-words">{renderTextWithLinks(message.text)}</div>;

    if (message.messageType === "audio") {
      return (
        <div className="p-1 max-w-[280px]">
          <audio controls src={url} className="w-full h-10 outline-none rounded-lg bg-black/10" />
        </div>
      );
    }

    if (message.messageType === "image") {
      return (
        <div className="-mx-2 -mt-1.5 overflow-hidden rounded-lg cursor-zoom-in" onClick={() => setIsPreviewOpen(true)}>
          <img src={url} alt="Attachment" className="max-w-full max-h-[300px] object-cover hover:scale-101 transition duration-300" />
          {message.text && (
            <div className="px-2 pt-2 pb-1 whitespace-pre-wrap break-words text-sm border-t border-black/5 mt-1.5">
              {renderTextWithLinks(message.text)}
            </div>
          )}
        </div>
      );
    }

    if (message.messageType === "video") {
      return (
        <div className="-mx-2 -mt-1.5 overflow-hidden rounded-lg cursor-zoom-in relative group" onClick={() => setIsPreviewOpen(true)}>
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white text-3xl opacity-100 group-hover:bg-black/50 transition">▶</div>
          <video src={url} className="max-w-full max-h-[300px] object-cover" />
          {message.text && (
            <div className="px-2 pt-2 pb-1 whitespace-pre-wrap break-words text-sm border-t border-black/5 mt-1.5">
              {renderTextWithLinks(message.text)}
            </div>
          )}
        </div>
      );
    }

    if (message.messageType === "document") {
      return (
        <div className="flex items-center gap-3 bg-black/15 p-3 rounded-xl min-w-[220px] select-none">
          <div className="text-2xl">📄</div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold truncate ${isSent ? "text-white" : "text-[var(--text-primary)]"}`}>
              {message.text || "Document"}
            </div>
            <a 
              href={url} 
              download={message.text || "file"} 
              className={`text-xs font-bold hover:underline ${isSent ? "text-white/80" : "text-[var(--whatsapp-green)]"}`}
            >
              Download
            </a>
          </div>
        </div>
      );
    }

    return <div className="whitespace-pre-wrap break-words">{renderTextWithLinks(message.text)}</div>;
  };

  return (
    <>
      {renderMedia()}
      
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-md animate-overlay-fade" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh] animate-modal-appear" onClick={(e) => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 bg-transparent border-0 text-white text-4xl cursor-pointer hover:opacity-80 transition" onClick={() => setIsPreviewOpen(false)}>&times;</button>
            {message.messageType === 'image' && <img src={message.mediaUrl || message.imageData} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />}
            {message.messageType === 'video' && <video controls autoPlay src={message.mediaUrl || message.videoData} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBody;
