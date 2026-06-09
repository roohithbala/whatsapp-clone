import React, { useState } from "react";
import api from "../../../../services/api";

const MessagePoll = ({ message, currentUser, users = [], time, renderStatusTicks, isSent }) => {
  const [showVotesModal, setShowVotesModal] = useState(false);

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
                  ? "border-emerald-500/40 bg-emerald-500/10" 
                  : "border-[var(--border-light)] hover:border-[var(--text-muted)] bg-[var(--bg-chat)]/35 hover:bg-[var(--bg-chat)]/50"
              }`}
              onClick={(e) => handleVote(e, idx)}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all duration-350" 
                style={{ width: `${percent}%` }}
              />
              
              <div className="flex items-center justify-between z-10 text-[13px] font-semibold leading-none">
                <span className={`${hasVoted ? "text-emerald-500 font-bold" : "text-[var(--text-primary)]"}`}>{option.text}</span>
                <span className="text-[11px] text-[var(--text-secondary)] font-bold">{voteCount} vote{voteCount !== 1 ? "s" : ""}</span>
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

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div className="bg-[var(--bg-chat)]/35 p-3 rounded-xl border border-[var(--border-light)]/40">
                <h4 className="text-[13px] font-bold text-[var(--text-primary)] break-words">{pollData.question}</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">{totalVotes} total vote{totalVotes !== 1 ? "s" : ""}</p>
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
                        <span className="text-[var(--text-secondary)]">{voteCount} vote{voteCount !== 1 ? "s" : ""} ({percent}%)</span>
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
};

export default MessagePoll;
