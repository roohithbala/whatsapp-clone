require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statusRoutes = require("./routes/statusRoutes");
const channelRoutes = require("./routes/channelRoutes");
const groupRoutes = require("./routes/groupRoutes");
const communityRoutes = require("./routes/communityRoutes");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/communities", communityRoutes);

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

  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    if (!senderId || !receiverId) {
      return;
    }

    if (socket.data.userId && socket.data.userId !== senderId) {
      return;
    }

    const receiverSockets = onlineUsers.get(receiverId) || new Set();

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("typing", { senderId, receiverId, isTyping: Boolean(isTyping) });
    });
  });

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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
