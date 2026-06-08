const Message = require("../models/Message");
const User = require("../models/User");
const { Groq } = require("groq-sdk");

async function handleMetaAiDirectChat(userMessage, senderSockets, io) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined");
    }

    const groq = new Groq({ apiKey });

    // Fetch last 15 messages between user and meta-ai
    const chatHistory = await Message.find({
      $or: [
        { senderId: userMessage.senderId, receiverId: "meta-ai" },
        { senderId: "meta-ai", receiverId: userMessage.senderId }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(15)
      .lean();

    const groqMessages = [
      {
        role: "system",
        content: "You are Meta AI, a helpful, intelligent assistant integrated into WhatsApp. Keep your responses concise, interactive, and friendly. Use formatting like bullet points and bold text where appropriate to make responses readable.",
      },
      ...chatHistory.map((msg) => ({
        role: msg.senderId === "meta-ai" ? "assistant" : "user",
        content: msg.text || "",
      })),
    ];

    if (groqMessages[groqMessages.length - 1]?.content !== userMessage.text) {
      groqMessages.push({ role: "user", content: userMessage.text });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.7,
      max_completion_tokens: 1500,
    });

    const replyText = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process that.";

    const aiMessage = new Message({
      senderId: "meta-ai",
      senderUsername: "Meta AI",
      receiverId: userMessage.senderId,
      receiverUsername: userMessage.senderUsername,
      text: replyText,
      messageType: "text",
      status: "seen",
    });

    await aiMessage.save();

    // Turn off typing indicator
    senderSockets.forEach(socketId => {
      io.to(socketId).emit("typing", { senderId: "meta-ai", receiverId: userMessage.senderId, isTyping: false });
    });

    const payload = aiMessage.toObject();
    payload._id = aiMessage._id.toString();

    senderSockets.forEach(socketId => {
      io.to(socketId).emit("receiveMessage", payload);
    });

  } catch (error) {
    console.error("Error in handleMetaAiDirectChat:", error);
    // Turn off typing indicator
    senderSockets.forEach(socketId => {
      io.to(socketId).emit("typing", { senderId: "meta-ai", receiverId: userMessage.senderId, isTyping: false });
    });

    const errorMsg = {
      senderId: "meta-ai",
      senderUsername: "Meta AI",
      receiverId: userMessage.senderId,
      text: "⚠️ Sorry, I ran into an issue communicating with my brain. Please try again later.",
      messageType: "text",
      status: "seen",
      createdAt: new Date()
    };
    senderSockets.forEach(socketId => {
      io.to(socketId).emit("receiveMessage", errorMsg);
    });
  }
}

async function handleMetaAiGroupChat(userMessage, io) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined");
    }

    const groq = new Groq({ apiKey });

    const cleanedQuery = userMessage.text
      .replace(/@meta\s+ai/gi, "")
      .replace(/@meta/gi, "")
      .trim();

    const recentGroupMessages = await Message.find({
      receiverId: userMessage.receiverId,
      isGroup: true
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const groqMessages = [
      {
        role: "system",
        content: `You are Meta AI, a helpful, intelligent assistant integrated into a WhatsApp group chat.
You are replying to a query from ${userMessage.senderUsername || "a group member"} in the group.
Here is the context of recent messages in the group. Use them if relevant, but answer the query directly. Keep responses brief, structured, and informative.`,
      },
      ...recentGroupMessages.map((msg) => ({
        role: msg.senderId === "meta-ai" ? "assistant" : "user",
        name: (msg.senderUsername || "user").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "user",
        content: msg.text || "",
      })),
    ];

    if (groqMessages[groqMessages.length - 1]?.content !== cleanedQuery) {
      groqMessages.push({
        role: "user",
        name: (userMessage.senderUsername || "user").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "user",
        content: cleanedQuery
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.7,
      max_completion_tokens: 1500,
    });

    const replyText = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process that.";

    const aiMessage = new Message({
      senderId: "meta-ai",
      senderUsername: "Meta AI",
      receiverId: userMessage.receiverId,
      text: replyText,
      messageType: "text",
      isGroup: true,
      status: "sent",
    });

    await aiMessage.save();

    // Turn off typing indicator in group
    io.to(userMessage.receiverId).emit("typing", { senderId: "meta-ai", receiverId: userMessage.receiverId, isTyping: false, isGroup: true });

    const payload = aiMessage.toObject();
    payload._id = aiMessage._id.toString();

    io.to(userMessage.receiverId).emit("receiveMessage", payload);

  } catch (error) {
    console.error("Error in handleMetaAiGroupChat:", error);
    // Turn off typing indicator
    io.to(userMessage.receiverId).emit("typing", { senderId: "meta-ai", receiverId: userMessage.receiverId, isTyping: false, isGroup: true });

    const errorMsg = {
      senderId: "meta-ai",
      senderUsername: "Meta AI",
      receiverId: userMessage.receiverId,
      text: "⚠️ Sorry, I ran into an issue communicating with my brain. Please try again later.",
      messageType: "text",
      isGroup: true,
      status: "sent",
      createdAt: new Date()
    };
    io.to(userMessage.receiverId).emit("receiveMessage", errorMsg);
  }
}

module.exports = {
  handleMetaAiDirectChat,
  handleMetaAiGroupChat
};
