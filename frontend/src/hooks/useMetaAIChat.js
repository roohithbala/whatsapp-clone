import { useState, useRef, useEffect } from "react";

export const useMetaAIChat = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Meta AI. How can I help you today?", sent: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const msgText = text || input;
    if (!msgText.trim() || isLoading) return;
    
    const updatedMessages = [...messages, { text: msgText, sent: true }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/meta-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Add a placeholder message for Meta AI response
      setMessages(prev => [...prev, { text: "", sent: false }]);
      setIsLoading(false);

      let buffer = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            const lines = trimmed.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim();
                if (dataStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    setMessages(prev => {
                      if (prev.length === 0) return prev;
                      const next = [...prev];
                      const lastIdx = next.length - 1;
                      const lastMsg = next[lastIdx];
                      if (lastMsg && !lastMsg.sent) {
                        next[lastIdx] = {
                          ...lastMsg,
                          text: lastMsg.text + parsed.text
                        };
                      }
                      return next;
                    });
                  } else if (parsed.error) {
                    setMessages(prev => {
                      if (prev.length === 0) return prev;
                      const next = [...prev];
                      const lastIdx = next.length - 1;
                      const lastMsg = next[lastIdx];
                      if (lastMsg && !lastMsg.sent) {
                        next[lastIdx] = {
                          ...lastMsg,
                          text: "⚠️ Error: " + parsed.error
                        };
                      }
                      return next;
                    });
                  }
                } catch (e) {
                  // Partial JSON chunk
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error sending to Meta AI:", err);
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        text: "⚠️ Sorry, I had trouble reaching my brain. Please check your connection and try again.", 
        sent: false 
      }]);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    textareaRef,
    messagesEndRef,
    handleSend
  };
};
