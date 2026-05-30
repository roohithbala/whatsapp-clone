const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { Groq } = require("groq-sdk");

const router = express.Router();

router.post("/chat", verifyToken, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on server" });
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const groq = new Groq({ apiKey });

    // Format message history for Groq. Map user messages to 'user' and others to 'assistant'.
    const groqMessages = [
      {
        role: "system",
        content: "You are Meta AI, a helpful, intelligent assistant integrated into WhatsApp. Keep your responses structured, interactive, engaging, and friendly. Use formatting like bullet points and bold text where appropriate to make responses readable.",
      },
      ...messages.map((m) => ({
        role: m.sent ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of chatCompletion) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Groq API Chat Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to generate response from Groq API" })}\n\n`);
    res.end();
  }
});

router.post("/summarize", verifyToken, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on server" });
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const groq = new Groq({ apiKey });

    // Format transcripts for Groq
    const transcript = messages
      .map((m) => `${m.sender || "Unknown"}: ${m.text || ""}`)
      .join("\n");

    const groqMessages = [
      {
        role: "system",
        content: `You are Meta AI, a helpful, intelligent assistant integrated into WhatsApp. 
You are given a transcript of a chat history. Generate a concise, highly-structured Markdown summary of the conversation. 
Use the following format exactly:
### 📝 Topic Overview
[1-2 sentences summarizing the core theme discussed]

### 🔑 Key Discussion Points
- [Key point 1]
- [Key point 2]
- [Key point 3]

### 🚀 Action Items & Next Steps
- [Action item 1, or "None identified" if none]

Keep the tone helpful and professional. Do not refer to the chat metadata or say "Here is the summary". Go straight to the markdown content.`,
      },
      {
        role: "user",
        content: `Here is the chat transcript:\n\n${transcript}`,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.3,
      max_completion_tokens: 1000,
    });

    const summaryText = chatCompletion.choices[0]?.message?.content || "No summary could be generated.";
    res.json({ summary: summaryText });
  } catch (error) {
    console.error("Groq API Summarize Error:", error);
    res.status(500).json({ error: "Failed to generate summary from Groq API" });
  }
});

router.post("/translate", verifyToken, async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "text and targetLanguage are required" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on server" });
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const groq = new Groq({ apiKey });

    const groqMessages = [
      {
        role: "system",
        content: `You are Meta AI, an expert real-time translator built into WhatsApp. 
Translate the provided text accurately into the target language. 
Ensure you:
1. Retain the exact tone, style, slang, and emotion (e.g. casual, formal, excited).
2. Keep all emojis, symbols, links, and formatting exactly as they are in original text.
3. Respond ONLY with the translated text. Do not write any explanations, preambles, or quotes.`,
      },
      {
        role: "user",
        content: `Target Language: ${targetLanguage}\nText to translate: ${text}`,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.3,
      max_completion_tokens: 1024,
    });

    const translatedText = chatCompletion.choices[0]?.message?.content?.trim() || "";
    res.json({ translation: translatedText });
  } catch (error) {
    console.error("Groq API Translate Error:", error);
    res.status(500).json({ error: "Failed to generate translation from Groq API" });
  }
});

module.exports = router;

