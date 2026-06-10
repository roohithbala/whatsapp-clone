require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");
const Group = require("./models/Group");
const Channel = require("./models/Channel");
const ChannelMessage = require("./models/ChannelMessage");
const { handleMetaAiDirectChat, handleMetaAiGroupChat, handleMetaAiDirectMention } = require("./services/metaAiService");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./middleware/authMiddleware");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
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
const adminRoutes = require("./routes/adminRoutes");
const backendLandingPage = require("./views/backendLandingPage");

app.get("/", (req, res) => {
  res.type("html").send(backendLandingPage({ frontendUrl: FRONTEND_URL }));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "relay-backend",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/meta-ai", metaAiRoutes);
app.use("/api/admin", adminRoutes);

// Create server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"], credentials: true },
});

const onlineUsers = new Map();

// Expose io and onlineUsers so routes can emit events
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId }).select("userId isSuspended role").lean();

    if (!user || user.isSuspended) return next(new Error("Account unavailable"));

    socket.data.userId = user.userId;
    socket.data.role = user.role || "user";
    next();
  } catch (_) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  if (socket.data.role === "admin") {
    socket.join("admins");
  }

  socket.on("register-user", async (userId) => {
    if (!userId || userId !== socket.data.userId) {
      return;
    }

    const isReconnecting = onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;

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

    if (!isReconnecting) {
      const deliveredAt = new Date();

      // 1. Relational 1-on-1 undelivered messages
      const undeliveredMessages = await Message.find({
        receiverId: userId,
        status: "sent",
        isGroup: false
      })
        .select("_id senderId receiverId")
        .lean();

      if (undeliveredMessages.length > 0) {
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

      // 2. Group Messages delivery mapping
      try {
        const userGroups = await Group.find({ members: userId }).distinct("groupId");
        if (userGroups.length > 0) {
          const groupIds = userGroups.map(g => g.toString());
          // Fetch messages sent to these groups where the current user is not in userDeliveryList
          const undeliveredGroupMsgs = await Message.find({
            receiverId: { $in: groupIds },
            isGroup: true,
            senderId: { $ne: userId },
            "userDeliveryList.userId": { $ne: userId }
          }).select("_id senderId receiverId");

          for (const msg of undeliveredGroupMsgs) {
            await Message.updateOne(
              { _id: msg._id },
              { $push: { userDeliveryList: { userId, deliveredAt } } }
            );

            // Notify sender
            const senderSockets = onlineUsers.get(msg.senderId) || new Set();
            senderSockets.forEach((socketId) => {
              io.to(socketId).emit("messageDelivered", {
                messageId: msg._id.toString(),
                status: "delivered",
                deliveredAt,
                senderId: msg.senderId,
                receiverId: msg.receiverId,
                userId
              });
            });
          }
        }
      } catch (err) {
        console.error("Failed to update group delivery on register:", err);
      }

      // 3. Channel Messages delivery mapping
      try {
        const userChannels = await Channel.find({ followers: userId }).distinct("channelId");
        if (userChannels.length > 0) {
          const channelIds = userChannels.map(c => c.toString());
          const undeliveredChannelMsgs = await ChannelMessage.find({
            channelId: { $in: channelIds },
            "userDeliveryList.userId": { $ne: userId }
          });

          for (const msg of undeliveredChannelMsgs) {
            await ChannelMessage.updateOne(
              { _id: msg._id },
              { $push: { userDeliveryList: { userId, deliveredAt } } }
            );

            // Notify channel admin if they are online
            const channel = await Channel.findOne({ channelId: msg.channelId }).lean();
            if (channel && channel.adminId) {
              const adminSockets = onlineUsers.get(channel.adminId) || new Set();
              adminSockets.forEach((socketId) => {
                io.to(socketId).emit("messageDelivered", {
                  messageId: msg._id.toString(),
                  status: "delivered",
                  deliveredAt,
                  receiverId: msg.channelId,
                  userId
                });
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to update channel delivery on register:", err);
      }
    }

    try {
      const currentUserDoc = await User.findOne({ userId });
      const allOnlineIds = Array.from(onlineUsers.keys());
      const visibleOnlineIds = [];
      
      const onlineDocs = await User.find({ userId: { $in: allOnlineIds } }).select("userId contacts privacy");
      
      for (const doc of onlineDocs) {
        const privacyVal = doc.privacy?.lastSeen || "everyone";
        if (doc.userId === userId) {
          visibleOnlineIds.push(doc.userId);
        } else if (privacyVal === "everyone") {
          visibleOnlineIds.push(doc.userId);
        } else if (privacyVal === "contacts") {
          const isContact = currentUserDoc && doc.contacts && doc.contacts.some(cId => String(cId) === String(currentUserDoc._id));
          if (isContact) {
            visibleOnlineIds.push(doc.userId);
          }
        }
      }

      socket.emit("presence:sync", {
        onlineUserIds: visibleOnlineIds,
      });

      if (currentUserDoc) {
        await User.updateOne({ userId }, { isOnline: true });
        
        const broadcastPresence = async (user, isOnline, lastSeenVal) => {
          const payload = {
            userId: user.userId,
            isOnline,
            lastSeen: lastSeenVal
          };

          const privacyVal = user.privacy?.lastSeen || "everyone";

          if (privacyVal === "everyone") {
            io.emit("presence:update", payload);
          } else if (privacyVal === "contacts") {
            if (user.contacts && user.contacts.length > 0) {
              const contactUsers = await User.find({ _id: { $in: user.contacts } }).select("userId");
              contactUsers.forEach(c => {
                const sockets = onlineUsers.get(c.userId);
                if (sockets) {
                  sockets.forEach(sId => io.to(sId).emit("presence:update", payload));
                }
              });
            }
            // Send to own sockets
            const mySockets = onlineUsers.get(user.userId);
            if (mySockets) {
              mySockets.forEach(sId => io.to(sId).emit("presence:update", payload));
            }
          } else if (privacyVal === "nobody") {
            const mySockets = onlineUsers.get(user.userId);
            if (mySockets) {
              mySockets.forEach(sId => io.to(sId).emit("presence:update", payload));
            }
          }
        };

        await broadcastPresence(currentUserDoc, true);
      }
    } catch (err) {
      console.error("Failed to manage presence sync/update on connect:", err);
    }
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
      // Find all online members in this group to record real-time delivery
      const deliveredAt = new Date();
      try {
        const group = await Group.findOne({ $or: [{ groupId: message.receiverId }, { _id: message.receiverId }] }).lean();
        if (group && message._id) {
          const onlineGroupMemberIds = group.members.filter(mId => mId !== message.senderId && onlineUsers.has(mId));
          if (onlineGroupMemberIds.length > 0) {
            const deliveryObjects = onlineGroupMemberIds.map(mId => ({ userId: mId, deliveredAt }));
            await Message.updateOne(
              { _id: message._id },
              { $push: { userDeliveryList: { $each: deliveryObjects } } }
            );

            // Add these to the message object so receivers get the updated list
            message.userDeliveryList = [
              ...(message.userDeliveryList || []),
              ...deliveryObjects
            ];

            // Notify the sender's sockets
            const senderSockets = onlineUsers.get(message.senderId) || new Set();
            onlineGroupMemberIds.forEach((mId) => {
              senderSockets.forEach((socketId) => {
                io.to(socketId).emit("messageDelivered", {
                  messageId: message._id.toString(),
                  status: "delivered",
                  deliveredAt,
                  senderId: message.senderId,
                  receiverId: message.receiverId,
                  userId: mId
                });
              });
            });
          }
        }
      } catch (err) {
        console.error("Error setting group message delivery status:", err);
      }

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

    const textContent = message.text || "";
    if (textContent.toLowerCase().includes("@meta ai") || textContent.toLowerCase().includes("@metaai") || textContent.toLowerCase().includes("@meta")) {
      senderSockets.forEach(socketId => {
        io.to(socketId).emit("typing", { senderId: "meta-ai", receiverId: message.senderId, isTyping: true });
      });
      receiverSockets.forEach(socketId => {
        io.to(socketId).emit("typing", { senderId: "meta-ai", receiverId: message.receiverId, isTyping: true });
      });

      handleMetaAiDirectMention(message, onlineUsers, io);
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

  socket.on("editMessage", ({ message, receiverId, isGroup, isChannel }) => {
    if (!message || !receiverId) return;
    if (isGroup || isChannel) {
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

  socket.on("sendChannelMessage", async (message) => {
    if (!message?.channelId) return;
    const deliveredAt = new Date();
    try {
      const channel = await Channel.findOne({ channelId: message.channelId }).lean();
      if (channel && message._id) {
        const onlineFollowers = channel.followers.filter(fId => fId !== socket.data.userId && onlineUsers.has(fId));
        if (onlineFollowers.length > 0) {
          const deliveryObjects = onlineFollowers.map(fId => ({ userId: fId, deliveredAt }));
          await ChannelMessage.updateOne(
            { _id: message._id },
            { $push: { userDeliveryList: { $each: deliveryObjects } } }
          );

          // Update message payload so other online followers get it with delivery list
          message.userDeliveryList = [
            ...(message.userDeliveryList || []),
            ...deliveryObjects
          ];

          // Notify the channel admin's sockets
          const adminSockets = onlineUsers.get(socket.data.userId) || new Set();
          onlineFollowers.forEach((fId) => {
            adminSockets.forEach((socketId) => {
              io.to(socketId).emit("messageDelivered", {
                messageId: message._id.toString(),
                status: "delivered",
                deliveredAt,
                receiverId: message.channelId,
                userId: fId
              });
            });
          });
        }
      }
    } catch (err) {
      console.error("Error setting channel message delivery status:", err);
    }
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

  socket.on("messageSeen", async ({ messageIds, senderId, receiverId, isGroup, isChannel }) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return;
    }

    if (!receiverId) {
      return;
    }

    const seenAt = new Date();

    if (isChannel) {
      for (const mId of messageIds) {
        await ChannelMessage.updateOne(
          { _id: mId, channelId: receiverId },
          {
            $addToSet: {
              userSeenList: { userId: socket.data.userId, seenAt }
            }
          }
        );
      }

      const payload = { messageIds, receiverId, seenAt, isChannel: true, userId: socket.data.userId };
      socket.to(receiverId).emit("messageSeen", payload);

      // Explicitly notify channel admin of read receipt
      try {
        const channel = await Channel.findOne({ channelId: receiverId }).lean();
        if (channel && channel.adminId) {
          const adminSockets = onlineUsers.get(channel.adminId) || new Set();
          adminSockets.forEach((socketId) => {
            if (socketId !== socket.id) {
              io.to(socketId).emit("messageSeen", payload);
            }
          });
        }
      } catch (err) {
        console.error("Error notifying channel admin of read receipt:", err);
      }
    } else if (isGroup) {
      for (const mId of messageIds) {
        await Message.updateOne(
          { _id: mId, receiverId },
          {
            $addToSet: {
              userSeenList: { userId: socket.data.userId, seenAt }
            }
          }
        );
      }

      const payload = { messageIds, receiverId, seenAt, isGroup: true, userId: socket.data.userId };
      socket.to(receiverId).emit("messageSeen", payload);
    } else {
      if (!senderId) {
        return;
      }

      if (socket.data.userId && socket.data.userId !== receiverId) {
        return;
      }

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
    }
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
      const userDoc = await User.findOneAndUpdate({ userId }, { isOnline: false, updatedAt: lastSeen }, { returnDocument: 'after' });
      if (userDoc) {
        const privacyVal = userDoc.privacy?.lastSeen || "everyone";
        const payload = { userId, isOnline: false, lastSeen };
        
        if (privacyVal === "everyone") {
          io.emit("presence:update", payload);
        } else if (privacyVal === "contacts") {
          if (userDoc.contacts && userDoc.contacts.length > 0) {
            const contactUsers = await User.find({ _id: { $in: userDoc.contacts } }).select("userId");
            contactUsers.forEach(c => {
              const sockets = onlineUsers.get(c.userId);
              if (sockets) {
                sockets.forEach(sId => io.to(sId).emit("presence:update", payload));
              }
            });
          }
        }
      }
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


// Meta AI functions have been moved to services/metaAiService.js

// --- Admin Seed ---
const bcrypt = require("bcryptjs");

const seedAdminUser = async () => {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn("[DB SEED] Admin seed skipped. Configure ADMIN_EMAIL and ADMIN_PASSWORD to create an admin account.");
      return;
    }

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      adminUser = new User({
        userId: "admin-seed-" + Date.now(),
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        status: "System Administrator",
        authProvider: "local",
      });
      await adminUser.save();
      console.log(`[DB SEED] Admin user created: ${ADMIN_EMAIL}`);
    } else if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`[DB SEED] Existing user ${ADMIN_EMAIL} elevated to admin.`);
    } else {
      console.log(`[DB SEED] Admin user ${ADMIN_EMAIL} already exists and is admin.`);
    }
  } catch (err) {
    console.error("[DB SEED] Failed to seed admin user:", err);
  }
};


const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    // Run database synchronization
    await syncDatabases();

    // Seed Meta AI virtual contact
    await seedMetaAIUser();

    // Seed default admin account
    await seedAdminUser();

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

// ======================
// Global Express Error Handler
// ======================
// Must be defined AFTER all routes (4-arg signature is required by Express)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err.stack || err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});
