import React, { useState } from "react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import MessagePoll from "./MessagePoll";

const MessageBody = ({ message, searchTerm, isSent, currentUser, users = [] }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const time = new Date(message.createdAt || message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderStatusTicks = () => {
    if (message.status === "seen") {
      return (
        <svg viewBox="0 0 16 15" width="15" height="14" className="fill-[#34b7f1] shrink-0 ml-0.5 inline-block align-middle">
          <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 16 15" width="15" height="14" className="fill-[var(--text-muted)] shrink-0 ml-0.5 inline-block align-middle">
        <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
        {message.status === "delivered" && (
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
        )}
      </svg>
    );
  };

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const highlightText = (txt) => {
      if (!searchTerm) return txt;
      const parts = txt.split(new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
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

    if (message.messageType === "contact") {
      const handleMessageClick = (e) => {
        e.stopPropagation();
        const event = new CustomEvent("startChatWithUser", { detail: message.text });
        window.dispatchEvent(event);
      };

      return (
        <div className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-light)] px-4 py-3.5 rounded-2xl flex flex-col gap-3 w-[260px] max-w-full select-none text-left animate-slideUp shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-base bg-gradient-to-tr from-[var(--avatar-bg)] to-[var(--text-muted)] shrink-0 shadow-sm relative">
              <span>{message.text?.[0]?.toUpperCase() || "👤"}</span>
              {message.mediaUrl && (
                <img src={message.mediaUrl} alt="" className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] truncate">{message.text}</h4>
              <span className="text-[11px] text-[var(--text-secondary)]">Contact Card</span>
            </div>
          </div>
          <button 
            className="w-full py-2 bg-whatsapp-green hover:bg-whatsapp-dark-green text-white text-xs font-bold rounded-xl shadow-sm transition border-none cursor-pointer"
            onClick={handleMessageClick}
          >
            Message
          </button>
          <div className="flex items-center justify-end gap-0.5 mt-1 select-none text-[10px] text-[var(--text-muted)] font-medium">
            {message.isEdited && <span className="italic mr-1">edited</span>}
            <span>{time}</span>
            {isSent && renderStatusTicks()}
          </div>
        </div>
      );
    }

    if (message.messageType === "poll") {
      return (
        <MessagePoll 
          message={message} 
          currentUser={currentUser} 
          users={users} 
          time={time} 
          renderStatusTicks={renderStatusTicks} 
          isSent={isSent} 
        />
      );
    }

    if (message.messageType === "event") {
      let eventData = { title: "Event", dateTime: "", location: "" };
      try {
        eventData = JSON.parse(message.text);
      } catch (e) {
        console.error("Failed to parse event data:", e);
      }

      const eventDate = eventData.dateTime ? new Date(eventData.dateTime) : null;
      const month = eventDate ? eventDate.toLocaleString("default", { month: "short" }).toUpperCase() : "EVENT";
      const day = eventDate ? eventDate.getDate() : "📅";
      const timeStr = eventDate ? eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      const dateStr = eventDate ? eventDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "";

      return (
        <div className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-light)] px-4 py-4 rounded-2xl flex gap-4 w-[280px] max-w-full text-left select-none relative overflow-hidden animate-slideUp shadow-sm text-[var(--text-primary)]">
          <div className="w-12 h-[52px] bg-red-500 rounded-xl flex flex-col overflow-hidden border border-red-600 shadow-sm shrink-0 items-center justify-center text-white">
            <div className="bg-red-600 w-full text-[9px] py-0.5 text-center font-bold tracking-wider leading-none uppercase">{month}</div>
            <div className="flex-1 flex items-center justify-center text-lg font-extrabold leading-none">{day}</div>
          </div>
          <div className="flex-1 flex flex-col min-w-0 py-0.5 gap-1">
            <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight truncate" title={eventData.title}>{eventData.title}</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium leading-none mt-0.5">
              <span>🕒</span>
              <span>{dateStr} · {timeStr}</span>
            </div>
            {eventData.location && (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium leading-none truncate" title={eventData.location}>
                <span>📍</span>
                <span className="truncate">{eventData.location}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-0.5 mt-2.5 select-none text-[10px] text-[var(--text-muted)] font-medium">
              {message.isEdited && <span className="italic mr-1">edited</span>}
              <span>{time}</span>
              {isSent && renderStatusTicks()}
            </div>
          </div>
        </div>
      );
    }

    const url = message.mediaUrl || message.audioData || message.fileData || message.imageData || message.videoData;
    
    if (!url) return <div className="whitespace-pre-wrap break-words leading-relaxed text-left">{renderTextWithLinks(message.text)}</div>;

    if (message.messageType === "sticker") {
      return (
        <div className="w-[125px] h-[125px] flex items-center justify-center p-1 select-none">
          <img src={url} alt="Sticker" className="max-w-full max-h-full object-contain hover:scale-105 transition duration-200" />
        </div>
      );
    }

    if (message.messageType === "audio") {
      return (
        <div className="p-1">
          <CustomAudioPlayer src={url} />
        </div>
      );
    }

    if (message.messageType === "image") {
      return (
        <div className="-mx-2 -mt-1.5 overflow-hidden rounded-lg cursor-zoom-in" onClick={() => setIsPreviewOpen(true)}>
          <img src={url} alt="Attachment" className="max-w-full max-h-[300px] object-cover hover:scale-101 transition duration-300" />
          {message.text && (
            <div className="px-2 pt-2 pb-1 whitespace-pre-wrap break-words text-sm border-t border-black/5 mt-1.5 text-left">
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
            <div className="px-2 pt-2 pb-1 whitespace-pre-wrap break-words text-sm border-t border-black/5 mt-1.5 text-left">
              {renderTextWithLinks(message.text)}
            </div>
          )}
        </div>
      );
    }

    if (message.messageType === "document") {
      return (
        <div className="flex items-center gap-3 bg-black/15 px-4 py-3.5 rounded-xl min-w-[220px] select-none">
          <div className="text-2xl">📄</div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold truncate text-left ${isSent ? "text-white" : "text-[var(--text-primary)]"}`}>
              {message.text || "Document"}
            </div>
            <a 
              href={url} 
              download={message.text || "file"} 
              className={`text-[11px] font-bold block text-left mt-0.5 hover:underline ${isSent ? "text-white/85" : "text-whatsapp-green"}`}
              onClick={e => e.stopPropagation()}
            >
              Download
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderMedia()}

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-overlay-fade select-none"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="absolute top-4 right-4 flex gap-3 z-[10000]">
            <a 
              href={message.mediaUrl || message.videoData || message.imageData} 
              download 
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              onClick={e => e.stopPropagation()}
            >
              ⬇️
            </a>
            <button 
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 text-xl font-bold flex items-center justify-center cursor-pointer transition"
              onClick={() => setIsPreviewOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className="max-w-[90%] max-h-[80%] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {message.messageType === "image" ? (
              <img src={message.mediaUrl || message.imageData} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-modal-appear" />
            ) : (
              <video src={message.mediaUrl || message.videoData} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl animate-modal-appear" />
            )}
          </div>
          {message.text && (
            <p className="text-white text-sm max-w-[600px] text-center mt-6 leading-relaxed select-text px-4 py-2 bg-black/40 rounded-xl backdrop-blur-sm">
              {message.text}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default MessageBody;
