import React, { useState } from 'react';
import './SidebarMetaAI.css';

const SidebarMetaAI = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Meta AI. How can I help you today?", sent: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text) => {
    const msgText = text || input;
    if (!msgText.trim()) return;
    
    const newMessages = [...messages, { text: msgText, sent: true }];
    setMessages(newMessages);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `That's an interesting question about "${msgText}"! I'm currently in demo mode, but I can help you with styling and logic queries.`, 
        sent: false 
      }]);
    }, 1000);
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            background: 'linear-gradient(45deg, #0080fb, #00f2fe)',
            display: 'grid', placeItems: 'center', fontSize: '18px'
          }}>🌐</div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Meta AI</h2>
        </div>
      </div>
      
      <div className="meta-chat-container">
        <div className="meta-messages">
          {messages.map((m, i) => (
            <div key={i} className={`meta-bubble ${m.sent ? 'sent' : 'received'}`}>
              {m.text}
            </div>
          ))}
          
          {messages.length === 1 && (
            <div className="meta-suggestions">
              <button className="meta-suggestion" onClick={() => handleSend("Tell me a joke")}>Tell me a joke</button>
              <button className="meta-suggestion" onClick={() => handleSend("What's the weather?")}>What's the weather?</button>
              <button className="meta-suggestion" onClick={() => handleSend("Write a poem")}>Write a poem</button>
            </div>
          )}
        </div>
        
        <div className="meta-input-area">
          <input 
            type="text" 
            className="meta-input"
            placeholder="Ask Meta AI anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="meta-send-btn" onClick={() => handleSend()}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default SidebarMetaAI;
