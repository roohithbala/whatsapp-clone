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

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/calls", callRoutes);

// Create server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

const onlineUsers = new Map();

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

    if (socket.data.userId && socket.data.userId !== message.senderId) {
      return;
    }

    // Direct room/broadcast for Group messages
    if (message.isGroup) {
      socket.to(message.receiverId).emit("receiveMessage", message);
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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    // Run database synchronization
    await syncDatabases();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
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
