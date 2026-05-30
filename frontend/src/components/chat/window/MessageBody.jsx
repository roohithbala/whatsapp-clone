import React, { useState } from 'react';
import api from '../../../services/api';

const MessageBody = ({ message, searchTerm, isSent, currentUser, users = [] }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showVotesModal, setShowVotesModal] = useState(false);

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
      let pollData = { question: "Poll", options: [] };
      try {
        pollData = JSON.parse(message.text);
      } catch (e) {
        console.error("Failed to parse poll data:", e);
      }

      const totalVotes = (pollData.options || []).reduce((acc, opt) => acc + (opt.votes || []).length, 0);

      const handleVote = async (e, optionIndex) => {
        e.stopPropagation();
        if (message.isDeleted) return;
        try {
          await api.post(`/messages/poll-vote/${message._id}`, { optionIndex });
        } catch (err) {
          console.error("Failed to cast vote:", err);
        }
      };

      const selectInstructions = pollData.allowMultiple === false ? "Select one" : "Select one or more";

      return (
        <div className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-light)] p-4 rounded-2xl flex flex-col gap-3 w-[280px] max-w-full text-left select-none shadow-sm text-[var(--text-primary)] animate-slideUp">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">📊</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-snug break-words">{pollData.question}</h4>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 block">{selectInstructions}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {(pollData.options || []).map((option, idx) => {
              const votesList = option.votes || [];
              const hasVoted = votesList.includes(currentUser?.userId);
              const voteCount = votesList.length;
              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

              return (
                <div 
                  key={idx}
                  className={`group flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition relative overflow-hidden ${
                    hasVoted 
                      ? 'border-emerald-500/40 bg-emerald-500/10' 
                      : 'border-[var(--border-light)] hover:border-[var(--text-muted)] bg-[var(--bg-chat)]/35 hover:bg-[var(--bg-chat)]/50'
                  }`}
                  onClick={(e) => handleVote(e, idx)}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all duration-350" 
                    style={{ width: `${percent}%` }}
                  />
                  
                  <div className="flex items-center justify-between z-10 text-[13px] font-semibold leading-none">
                    <span className={`${hasVoted ? 'text-emerald-500 font-bold' : 'text-[var(--text-primary)]'}`}>{option.text}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-bold">{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center justify-between z-10 text-[10px] text-[var(--text-muted)] leading-none mt-1 font-bold">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {votesList.slice(0, 3).map((voterId) => {
                        const voter = users.find(u => u.userId === voterId) || { username: voterId };
                        return (
                          <div key={voterId} className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border border-[var(--bg-sidebar-alt)] flex items-center justify-center text-[9px] text-white font-bold" title={voter.username}>
                            {voter.username?.[0]?.toUpperCase()}
                          </div>
                        );
                      })}
                      {voteCount > 3 && (
                        <div className="w-5 h-5 rounded-full bg-[var(--bg-input)] border border-[var(--bg-sidebar-alt)] flex items-center justify-center text-[9px] text-[var(--text-secondary)] font-bold">
                          +{voteCount - 3}
                        </div>
                      )}
                    </div>
                    <span>{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            className="w-full mt-2 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[11px] font-bold text-whatsapp-green border border-whatsapp-green/20 hover:border-whatsapp-green/45 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              setShowVotesModal(true);
            }}
          >
            📊 View Votes ({totalVotes})
          </button>

          <div className="flex items-center justify-end gap-0.5 mt-1.5 select-none text-[10px] text-[var(--text-muted)] font-medium">
            {message.isEdited && <span className="italic mr-1">edited</span>}
            <span>{time}</span>
            {isSent && renderStatusTicks()}
          </div>

          {showVotesModal && (
            <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-sm animate-overlay-fade" onClick={(e) => { e.stopPropagation(); setShowVotesModal(false); }}>
              <div className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-strong)] rounded-2xl max-w-sm w-full max-h-[75vh] flex flex-col overflow-hidden animate-modal-appear shadow-2xl text-[var(--text-primary)]" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border-light)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Poll Results</h3>
                      <p className="text-[10px] text-[var(--text-secondary)]">Voters details</p>
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 rounded-full bg-[var(--bg-hover)] border-0 text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-input)] transition flex items-center justify-center text-xl leading-none shrink-0" 
                    onClick={() => setShowVotesModal(false)}
                  >
                    &times;
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  <div className="bg-[var(--bg-chat)]/35 p-3 rounded-xl border border-[var(--border-light)]/40">
                    <h4 className="text-[13px] font-bold text-[var(--text-primary)] break-words">{pollData.question}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {(pollData.options || []).map((option, idx) => {
                      const votesList = option.votes || [];
                      const voteCount = votesList.length;
                      const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                      return (
                        <div key={idx} className="flex flex-col gap-2 p-2.5 rounded-xl bg-[var(--bg-chat)]/20 border border-[var(--border-light)]/30">
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span className="text-[var(--text-primary)]">{option.text}</span>
                            <span className="text-[var(--text-secondary)]">{voteCount} vote{voteCount !== 1 ? 's' : ''} ({percent}%)</span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                            <div className="h-full bg-whatsapp-green rounded-full transition-all duration-350" style={{ width: `${percent}%` }} />
                          </div>

                          {votesList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {votesList.map((voterId) => {
                                const voter = users.find(u => u.userId === voterId) || { username: voterId };
                                const initial = voter.username?.[0]?.toUpperCase() || "?";
                                return (
                                  <div key={voterId} className="flex items-center gap-1.5 bg-[var(--bg-input)] px-2 py-1 rounded-lg border border-[var(--border-light)]">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                                      {initial}
                                    </div>
                                    <span className="text-[11px] text-[var(--text-primary)] font-semibold">{voter.username}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-[var(--text-muted)] italic pl-1">No votes yet</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-[var(--border-light)] flex justify-end">
                  <button 
                    className="px-3.5 py-1.5 bg-whatsapp-green hover:bg-whatsapp-dark-green text-white text-[11px] font-bold rounded-xl shadow-sm transition border-none cursor-pointer"
                    onClick={() => setShowVotesModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
      const month = eventDate ? eventDate.toLocaleString('default', { month: 'short' }).toUpperCase() : "EVENT";
      const day = eventDate ? eventDate.getDate() : "📅";
      const timeStr = eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
      const dateStr = eventDate ? eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : "";

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
    
    if (!url) return <div className="whitespace-pre-wrap break-words leading-relaxed">{renderTextWithLinks(message.text)}</div>;

    if (message.messageType === "sticker") {
      return (
        <div className="w-[125px] h-[125px] flex items-center justify-center p-1 select-none">
          <img src={url} alt="Sticker" className="max-w-full max-h-full object-contain hover:scale-105 transition duration-200" />
        </div>
      );
    }

    if (message.messageType === "audio") {
      return (
        <div className="p-1 min-w-[240px] max-w-[280px]">
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
        <div className="flex items-center gap-3 bg-black/15 px-4 py-3.5 rounded-xl min-w-[220px] select-none">
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

    return <div className="whitespace-pre-wrap break-words leading-relaxed">{renderTextWithLinks(message.text)}</div>;
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
