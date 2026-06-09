import React from 'react';

const SmartReplies = ({ text, lastMessageReceived, onSendPayload }) => {
  if (text.trim() || !lastMessageReceived || !lastMessageReceived.text || lastMessageReceived.isDeleted) {
    return null;
  }

  const getSmartReplies = (msg) => {
    const t = msg.text.toLowerCase().trim();
    if (t.includes("hi") || t.includes("hello") || t.includes("hey")) {
      return ["Hi!", "Hello! How are you?", "Hey there!"];
    }
    if (t.includes("how are you") || t.includes("how's it going")) {
      return ["I'm doing great, thanks!", "All good! You?", "Pretty good!"];
    }
    if (t.includes("where")) {
      return ["At home", "On my way!", "At work"];
    }
    if (t.includes("free") || t.includes("meet") || t.includes("busy")) {
      return ["Yes, sure!", "Sorry, a bit busy", "I'll ping you in a bit"];
    }
    if (t.includes("ok") || t.includes("okay") || t.includes("got it")) {
      return ["Sounds good!", "Perfect", "Awesome!"];
    }
    if (t.includes("thanks") || t.includes("thank you")) {
      return ["You're welcome!", "Anytime!", "No problem!"];
    }
    return ["Awesome!", "Got it", "Talk to you soon!"];
  };

  const replies = getSmartReplies(lastMessageReceived);

  return (
    <div className="flex gap-2.5 pt-1.5 pb-3 mb-3.5 overflow-x-auto select-none scrollbar-none animate-slideUp">
      {replies.map((reply, i) => (
        <button
          key={i}
          className="px-3.5 py-1.5 bg-[var(--bg-input)] hover:bg-whatsapp-green/10 hover:text-whatsapp-green text-xs font-semibold text-[var(--text-primary)] rounded-full border border-[var(--border-light)] hover:border-whatsapp-green/20 transition cursor-pointer shrink-0"
          onClick={() => {
            onSendPayload({ text: reply, messageType: "text", timestamp: new Date().toISOString() });
          }}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default SmartReplies;
