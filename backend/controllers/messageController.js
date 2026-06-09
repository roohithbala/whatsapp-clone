const Message = require("../models/Message");
const User = require("../models/User");
const ChatSetting = require("../models/ChatSetting");

const calculateExpiryDate = (duration) => {
  if (!duration || duration === "off") return null;
  const now = Date.now();
  if (duration === "24h") return new Date(now + 24 * 60 * 60 * 1000);
  if (duration === "7d") return new Date(now + 7 * 24 * 60 * 60 * 1000);
  if (duration === "90d") return new Date(now + 90 * 24 * 60 * 60 * 1000);
  return null;
};


// GET group messages
exports.fetchGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({
      receiverId: groupId,
      isGroup: true,
      hiddenFor: { $ne: req.userId },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// SEND encrypted 1-on-1 message
exports.sendEncryptedMessage = async (req, res) => {
  try {
    const { senderId, receiverId, encryptedContent, iv, algorithm, replyTo, messageType, mediaUrl } = req.body;

    if (req.userId !== senderId) return res.status(403).json({ error: "Unauthorized sender" });
    if (!senderId || !receiverId || !encryptedContent || !iv) {
      return res.status(400).json({ error: "senderId, receiverId, encryptedContent, and iv are required" });
    }

    const [sender, receiver] = await Promise.all([
      User.findOne({ userId: senderId }).select("userId username"),
      User.findOne({ userId: receiverId }).select("userId username"),
    ]);

    if (!sender || !receiver) return res.status(404).json({ error: "Sender or receiver not found" });

    const chatId = [senderId, receiverId].sort().join('_');
    const setting = await ChatSetting.findOne({ chatId });
    const duration = setting ? setting.disappearingMessages : "off";
    const expiresAt = calculateExpiryDate(duration);

    const message = new Message({
      senderId: sender.userId,
      senderUsername: sender.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      encryptedContent,
      iv,
      algorithm: algorithm || "AES-GCM",
      replyTo: replyTo || null,
      messageType: messageType || "text",
      mediaUrl: mediaUrl || null,
      expiresAt,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Server error while sending message" });
  }
};

// BROADCAST messages
exports.broadcastMessage = async (req, res) => {
  try {
    const { senderId, receiverIds, encryptedContent, iv, algorithm } = req.body;

    if (req.userId !== senderId) return res.status(403).json({ error: "Unauthorized sender" });
    if (!senderId || !Array.isArray(receiverIds) || !encryptedContent || !iv) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sender = await User.findOne({ userId: senderId }).select("userId username");
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    const receivers = await User.find({ userId: { $in: receiverIds } }).select("userId username");
    const messages = receivers.map(receiver => ({
      senderId: sender.userId,
      senderUsername: sender.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      encryptedContent,
      iv,
      algorithm: algorithm || "AES-GCM",
    }));

    const inserted = await Message.insertMany(messages);
    res.status(201).json({ message: "Broadcast sent", count: inserted.length });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Generic send (group or 1-on-1 plain text / media)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, mediaUrl, isGroup, replyTo, messageType } = req.body;
    const senderId = req.userId;

    const sender = await User.findOne({ userId: senderId });
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    const chatId = isGroup ? receiverId : [senderId, receiverId].sort().join('_');
    const setting = await ChatSetting.findOne({ chatId });
    const duration = setting ? setting.disappearingMessages : "off";
    const expiresAt = calculateExpiryDate(duration);

    const message = new Message({
      senderId,
      senderUsername: sender.username,
      receiverId,
      text,
      mediaUrl,
      isGroup: !!isGroup,
      replyTo: replyTo ? {
        id: replyTo.id || null,
        text: replyTo.text || null,
        senderName: replyTo.senderName || null,
        mediaUrl: replyTo.mediaUrl || null,
        messageType: replyTo.messageType || "text",
        statusId: replyTo.statusId || null
      } : null,
      messageType: messageType || "text",
      status: senderId === receiverId ? "seen" : "sent",
      expiresAt,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET 1-on-1 messages
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (req.userId !== senderId && req.userId !== receiverId) {
      return res.status(403).json({ error: "Unauthorized conversation access" });
    }

    const chatId = [senderId, receiverId].sort().join('_');

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
            { receiverId: chatId },
          ]
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ],
      hiddenFor: { $ne: req.userId }
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching messages" });
  }
};

