require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");
const Group = require("./models/Group");
const Channel = require("./models/Channel");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statusRoutes = require("./routes/statusRoutes");
const channelRoutes = require("./routes/channelRoutes");
const groupRoutes = require("./routes/groupRoutes");
const communityRoutes = require("./routes/communityRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const callRoutes = require("./routes/callRoutes");
const metaAiRoutes = require("./routes/metaAiRoutes");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/meta-ai", metaAiRoutes);

// Create server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

const onlineUsers = new Map();

// Expose io and onlineUsers so routes can emit events
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("register-user", async (userId) => {
    if (!userId) {
      return;
    }

    socket.data.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    await User.updateOne({ userId }, { isOnline: true });

    // Auto-join group and channel rooms for real-time updates
    try {
      const userGroups = await Group.find({ members: userId }).distinct("groupId");
      userGroups.forEach(gId => {
        if (gId) {
          socket.join(gId.toString());
          console.log(`User ${userId} socket joined group room: ${gId}`);
        }
      });

      const userChannels = await Channel.find({ followers: userId }).distinct("channelId");
      userChannels.forEach(cId => {
        if (cId) {
          socket.join(cId.toString());
          console.log(`User ${userId} socket joined channel room: ${cId}`);
        }
      });
    } catch (err) {
      console.error("Error joining rooms on register:", err);
    }

    const undeliveredMessages = await Message.find({
      receiverId: userId,
      status: "sent",
    })
      .select("_id senderId receiverId")
      .lean();

    if (undeliveredMessages.length > 0) {
      const deliveredAt = new Date();
      const undeliveredMessageIds = undeliveredMessages.map((message) => message._id);

      await Message.updateMany(
        { _id: { $in: undeliveredMessageIds } },
        { status: "delivered", deliveredAt }
      );

      undeliveredMessages.forEach((message) => {
        const payload = {
          messageId: message._id.toString(),
          status: "delivered",
          deliveredAt,
          senderId: message.senderId,
          receiverId: message.receiverId,
        };

        io.to(socket.id).emit("messageDelivered", payload);

        const senderSockets = onlineUsers.get(message.senderId) || new Set();
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit("messageDelivered", payload);
        });
      });
    }

    socket.emit("presence:sync", {
      onlineUserIds: Array.from(onlineUsers.keys()),
    });

    io.emit("presence:update", {
      userId,
      isOnline: true,
    });
  });

  socket.on("sendMessage", async (message) => {
    if (!message?.senderId || !message?.receiverId) {
      return;
    }

    // Allow system messages (e.g. from disappearing messages toggle) to pass through
    const isSystemMessage = message.messageType === "system" || message.senderId === "system";

    if (!isSystemMessage && socket.data.userId && socket.data.userId !== message.senderId) {
      return;
    }

    // For system messages in 1-on-1 chats, send to both parties
    if (isSystemMessage && !message.isGroup) {
      const senderSockets = onlineUsers.get(message.senderId) || new Set();
      const receiverSockets = onlineUsers.get(message.receiverId) || new Set();
      senderSockets.forEach(id => { if (id !== socket.id) io.to(id).emit("receiveMessage", message); });
      receiverSockets.forEach(id => io.to(id).emit("receiveMessage", message));
      return;
    }

    // Direct room/broadcast for Group messages
    if (message.isGroup) {
      socket.to(message.receiverId).emit("receiveMessage", message);

      // Check if it's a mention of Meta AI
      const textContent = message.text || "";
      if (textContent.toLowerCase().includes("@meta ai") || textContent.toLowerCase().includes("@meta")) {
        // Send typing indicator from Meta AI to group room
        io.to(message.receiverId).emit("typing", { senderId: "meta-ai", receiverId: message.receiverId, isTyping: true, isGroup: true });
        
        handleMetaAiGroupChat(message, io);
      }
      return;
    }

    // Intercept Direct Message to Meta AI
    if (message.receiverId === "meta-ai") {
      const senderSockets = onlineUsers.get(message.senderId) || new Set();
      senderSockets.forEach((socketId) => {
        io.to(socketId).emit("typing", { senderId: "meta-ai", receiverId: message.senderId, isTyping: true });
      });

      handleMetaAiDirectChat(message, senderSockets, io);
      return;
    }

    const receiverSockets = onlineUsers.get(message.receiverId) || new Set();
    const senderSockets = onlineUsers.get(message.senderId) || new Set();
    const receiverIsOnline = receiverSockets.size > 0;

    let deliveredPayload = null;

    if (receiverIsOnline && message._id) {
      const deliveredAt = new Date();

      await Message.updateOne(
        {
          _id: message._id,
          status: "sent",
        },
        {
          status: "delivered",
          deliveredAt,
        }
      );

      deliveredPayload = {
        messageId: message._id,
        status: "delivered",
        deliveredAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
      };
    }

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("receiveMessage", {
        ...message,
        status: receiverIsOnline ? "delivered" : message.status || "sent",
      });
    });

    senderSockets.forEach((socketId) => {
      if (socketId !== socket.id) {
        io.to(socketId).emit("receiveMessage", {
          ...message,
          status: receiverIsOnline ? "delivered" : message.status || "sent",
        });
      }
    });

    if (deliveredPayload) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("messageDelivered", deliveredPayload);
      });

      senderSockets.forEach((socketId) => {
        io.to(socketId).emit("messageDelivered", deliveredPayload);
      });
    }
  });

  socket.on("typing", ({ senderId, receiverId, isTyping, isGroup }) => {
    if (!senderId || !receiverId) {
      return;
    }

    if (socket.data.userId && socket.data.userId !== senderId) {
      return;
    }

    if (isGroup) {
      socket.to(receiverId).emit("typing", { senderId, receiverId, isTyping: Boolean(isTyping), isGroup: true });
    } else {
      const receiverSockets = onlineUsers.get(receiverId) || new Set();
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("typing", { senderId, receiverId, isTyping: Boolean(isTyping) });
      });
    }
  });

  socket.on("deleteMessage", ({ messageId, senderId, receiverId, isGroup }) => {
    if (!messageId || !receiverId) return;
    if (isGroup) {
      socket.to(receiverId).emit("messageDeleted", messageId);
    } else {
      const receiverSockets = onlineUsers.get(receiverId) || new Set();
      const senderSockets = onlineUsers.get(senderId) || new Set();

      receiverSockets.forEach(id => io.to(id).emit("messageDeleted", messageId));
      senderSockets.forEach(id => {
         if (id !== socket.id) io.to(id).emit("messageDeleted", messageId);
      });
    }
  });

  socket.on("editMessage", ({ message, receiverId, isGroup }) => {
    if (!message || !receiverId) return;
    if (isGroup) {
      socket.to(receiverId).emit("messageEdited", message);
    } else {
      const receiverSockets = onlineUsers.get(receiverId) || new Set();
      const senderSockets = onlineUsers.get(message.senderId) || new Set();

      receiverSockets.forEach(id => io.to(id).emit("messageEdited", message));
      senderSockets.forEach(id => {
         if (id !== socket.id) io.to(id).emit("messageEdited", message);
      });
    }
  });

  socket.on("sendChannelMessage", (message) => {
    if (!message?.channelId) return;
    socket.to(message.channelId).emit("receiveChannelMessage", message);
  });

  socket.on("disappearingUpdate", ({ receiverId, isGroup, duration, systemMessage }) => {
    if (!receiverId) return;
    const chatId = isGroup ? receiverId : [socket.data.userId, receiverId].sort().join('_');
    const payload = { chatId, duration, systemMessage };

    if (isGroup) {
      socket.to(receiverId).emit("disappearingMessagesUpdated", payload);
    } else {
      const receiverSockets = onlineUsers.get(receiverId) || new Set();
      const senderSockets = onlineUsers.get(socket.data.userId) || new Set();

      receiverSockets.forEach(id => io.to(id).emit("disappearingMessagesUpdated", payload));
      senderSockets.forEach(id => {
        if (id !== socket.id) io.to(id).emit("disappearingMessagesUpdated", payload);
      });
    }
  });

  // Unified disappearing setting changed event
  socket.on("disappearingSettingChanged", ({ chatId, duration, receiverId, isGroup }) => {
    if (!receiverId) return;
    const payload = { chatId, duration };

    if (isGroup) {
      socket.to(receiverId).emit("disappearingSettingChanged", payload);
    } else {
      const receiverSockets = onlineUsers.get(receiverId) || new Set();
      const senderSockets = onlineUsers.get(socket.data.userId) || new Set();

      receiverSockets.forEach(id => io.to(id).emit("disappearingSettingChanged", payload));
      senderSockets.forEach(id => {
        if (id !== socket.id) io.to(id).emit("disappearingSettingChanged", payload);
      });
    }
  });

  // --- Call Signaling ---
  socket.on("call-offer", ({ to, offer, type }) => {
    const receiverSockets = onlineUsers.get(to) || new Set();
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("call-offer", { from: socket.data.userId, offer, type });
    });
  });

  socket.on("call-answer", ({ to, answer }) => {
    const receiverSockets = onlineUsers.get(to) || new Set();
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("call-answer", { from: socket.data.userId, answer });
    });
  });

  socket.on("call-candidate", ({ to, candidate }) => {
    const receiverSockets = onlineUsers.get(to) || new Set();
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("call-candidate", { from: socket.data.userId, candidate });
    });
  });

  socket.on("call-reject", async ({ to, type }) => {
    const receiverSockets = onlineUsers.get(to) || new Set();
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("call-reject", { from: socket.data.userId });
    });
    if (socket.data.userId) {
      try {
        const Call = require("./models/Call");
        const User = require("./models/User");
        const [caller, receiver] = await Promise.all([
          User.findOne({ userId: to }).select("userId username"),
          User.findOne({ userId: socket.data.userId }).select("userId username"),
        ]);
        if (caller && receiver) {
          const callType = type || "audio";
          await new Call({
            callerId: caller.userId,
            callerUsername: caller.username,
            receiverId: receiver.userId,
            receiverUsername: receiver.username,
            type: callType,
            status: "declined",
            duration: 0,
            startedAt: new Date(),
            endedAt: new Date(),
          }).save();

          // Log inside the chat history as a system message
          const Message = require("./models/Message");
          const callLabel = callType === "video" ? "Video Call" : "Voice Call";
          const savedMsg = await new Message({
            senderId: caller.userId,
            senderUsername: caller.username,
            receiverId: receiver.userId,
            receiverUsername: receiver.username,
            text: `🚫 Declined ${callLabel}`,
            messageType: "text",
            status: "delivered",
            deliveredAt: new Date()
          }).save();

          const payload = savedMsg.toObject();
          payload._id = savedMsg._id.toString();

          const callerSockets = onlineUsers.get(caller.userId) || new Set();
          const receiverSockets = onlineUsers.get(receiver.userId) || new Set();
          callerSockets.forEach(id => io.to(id).emit("receiveMessage", payload));
          receiverSockets.forEach(id => io.to(id).emit("receiveMessage", payload));
        }
      } catch (err) {
        console.error("Failed to log declined call:", err);
      }
    }
  });

  socket.on("call-end", async ({ to, callData }) => {
    const receiverSockets = onlineUsers.get(to) || new Set();
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("call-end", { from: socket.data.userId });
    });
    // Persist call log
    if (socket.data.userId) {
      try {
        const Call = require("./models/Call");
        const User = require("./models/User");
        const data = callData || {};
        
        // Use explicit callerId and receiverId if sent by the client, otherwise fallback
        const callerUserId = data.callerId || socket.data.userId;
        const receiverUserId = data.receiverId || to;
        
        const [caller, receiver] = await Promise.all([
          User.findOne({ userId: callerUserId }).select("userId username"),
          User.findOne({ userId: receiverUserId }).select("userId username"),
        ]);
        if (caller && receiver) {
          // Map frontend 'completed' to 'ended' to satisfy CallSchema enum
          let dbStatus = data.status || "ended";
          if (dbStatus === "completed") {
            dbStatus = "ended";
          }
          
          await new Call({
            callerId: caller.userId,
            callerUsername: caller.username,
            receiverId: receiver.userId,
            receiverUsername: receiver.username,
            type: data.type || "audio",
            status: dbStatus,
            duration: data.duration || 0,
            startedAt: data.startedAt ? new Date(data.startedAt) : new Date(Date.now() - (data.duration || 0) * 1000),
            endedAt: new Date(),
          }).save();

          // Log inside the chat history as a system message
          const Message = require("./models/Message");
          const isVideo = data.type === "video";
          const callLabel = isVideo ? "Video Call" : "Voice Call";
          
          let msgText = "";
          if (dbStatus === "ended") {
            const minutes = Math.floor((data.duration || 0) / 60);
            const seconds = (data.duration || 0) % 60;
            const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            msgText = `${isVideo ? "📹" : "📞"} ${callLabel} · ${durationStr}`;
          } else if (dbStatus === "missed") {
            msgText = `🚫 Missed ${callLabel}`;
          } else {
            msgText = `🚫 Declined ${callLabel}`;
          }

          const savedMsg = await new Message({
            senderId: caller.userId,
            senderUsername: caller.username,
            receiverId: receiver.userId,
            receiverUsername: receiver.username,
            text: msgText,
            messageType: "text",
            status: "delivered",
            deliveredAt: new Date()
          }).save();

          const payload = savedMsg.toObject();
          payload._id = savedMsg._id.toString();

          const callerSockets = onlineUsers.get(caller.userId) || new Set();
          const receiverSockets = onlineUsers.get(receiver.userId) || new Set();
          callerSockets.forEach(id => io.to(id).emit("receiveMessage", payload));
          receiverSockets.forEach(id => io.to(id).emit("receiveMessage", payload));
        }
      } catch (err) {
        console.error("Failed to log call:", err);
      }
    }
  });

  socket.on("call-missed", async ({ to, type }) => {
    // Log missed call
    if (socket.data.userId) {
      try {
        const Call = require("./models/Call");
        const User = require("./models/User");
        const [caller, receiver] = await Promise.all([
          User.findOne({ userId: socket.data.userId }).select("userId username"),
          User.findOne({ userId: to }).select("userId username"),
        ]);
        if (caller && receiver) {
          await new Call({
            callerId: caller.userId,
            callerUsername: caller.username,
            receiverId: receiver.userId,
            receiverUsername: receiver.username,
            type: type || "audio",
            status: "missed",
            duration: 0,
          }).save();
        }
      } catch (err) {
        console.error("Failed to log missed call:", err);
      }
    }
  });
  // ----------------------

  socket.on("messageSeen", async ({ messageIds, senderId, receiverId }) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return;
    }

    if (!senderId || !receiverId) {
      return;
    }

    if (socket.data.userId && socket.data.userId !== receiverId) {
      return;
    }

    const seenAt = new Date();

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiverId,
        senderId,
        status: { $in: ["sent", "delivered"] },
      },
      {
        status: "seen",
        seenAt,
        deliveredAt: seenAt,
      }
    );

    const payload = { messageIds, senderId, receiverId, seenAt };
    const senderSockets = onlineUsers.get(senderId) || new Set();
    const receiverSockets = onlineUsers.get(receiverId) || new Set();

    senderSockets.forEach((socketId) => {
      io.to(socketId).emit("messageSeen", payload);
    });

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("messageSeen", payload);
    });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected");

    const { userId } = socket.data;

    if (!userId || !onlineUsers.has(userId)) {
      return;
    }

    const socketIds = onlineUsers.get(userId);
    socketIds.delete(socket.id);

    if (socketIds.size === 0) {
      onlineUsers.delete(userId);
      const lastSeen = new Date();
      await User.updateOne({ userId }, { isOnline: false, updatedAt: lastSeen });
      io.emit("presence:update", {
        userId,
        isOnline: false,
        lastSeen,
      });
    }
  });
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

const { syncDatabases } = require("./db/sync");

// --- Meta AI Integrations ---
const seedMetaAIUser = async () => {
  try {
    let user = await User.findOne({ userId: "meta-ai" });
    if (!user) {
      user = new User({
        userId: "meta-ai",
        username: "Meta AI",
        email: "meta-ai@whatsapp.com",
        status: "Ask Meta AI anything",
        isOnline: true,
        profilePicture: "/uploads/meta-ai.png"
      });
      await user.save();
      console.log("[DB SEED] Meta AI virtual user created and cached in SQLite.");
    } else {
      let changed = false;
      if (user.username !== "Meta AI") { user.username = "Meta AI"; changed = true; }
      if (user.email !== "meta-ai@whatsapp.com") { user.email = "meta-ai@whatsapp.com"; changed = true; }
      if (user.status !== "Ask Meta AI anything") { user.status = "Ask Meta AI anything"; changed = true; }
      if (user.isOnline !== true) { user.isOnline = true; changed = true; }
      if (user.profilePicture !== "/uploads/meta-ai.png") { user.profilePicture = "/uploads/meta-ai.png"; changed = true; }
      if (changed) {
        await user.save();
        console.log("[DB SEED] Meta AI virtual user updated and cached.");
      }
    }
  } catch (err) {
    console.error("[DB SEED] Failed to seed Meta AI virtual user:", err);
  }
};

async function handleMetaAiDirectChat(userMessage, senderSockets, io) {
  try {
    const { Groq } = require("groq-sdk");
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
    const { Groq } = require("groq-sdk");
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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    // Run database synchronization
    await syncDatabases();

    // Seed Meta AI virtual contact
    await seedMetaAIUser();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Start background pruner for expiring messages (runs every 60 seconds)
    setInterval(async () => {
      try {
        const result = await Message.deleteMany({ expiresAt: { $lt: new Date() } });
        if (result.deletedCount > 0) {
          console.log(`[Pruner] Purged ${result.deletedCount} expired disappearing messages.`);
        }
      } catch (err) {
        console.error("[Pruner] Pruning expired messages failed:", err);
      }
    }, 60000);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Closed out remaining connections.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
  
  // Force close after 10s
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
