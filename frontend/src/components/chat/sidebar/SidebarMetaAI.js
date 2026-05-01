import React, { useState } from 'react';
import './SidebarMetaAI.css';

const SidebarMetaAI = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Meta AI. How can I help you today?", sent: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, sent: true }];
    setMessages(newMessages);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "That's an interesting question! I'm currently in demo mode, but I can help you with styling and logic queries.", sent: false }]);
    }, 1000);
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Meta AI</h2>
      </div>
      
      <div className="meta-chat-container">
        <div className="meta-messages">
          {messages.map((m, i) => (
            <div key={i} className={`meta-bubble ${m.sent ? 'sent' : 'received'}`}>
              {m.text}
            </div>
          ))}
        </div>
        
        <div className="meta-input-area">
          <input 
            type="text" 
            placeholder="Ask Meta AI anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default SidebarMetaAI;
