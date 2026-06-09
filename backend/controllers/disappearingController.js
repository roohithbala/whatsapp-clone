const Message = require("../models/Message");
const User = require("../models/User");
const ChatSetting = require("../models/ChatSetting");

// GET DISAPPEARING SETTING FOR A CHAT
exports.getDisappearingSetting = async (req, res) => {
  try {
    const setting = await ChatSetting.findOne({ chatId: req.params.chatId });
    res.json({ disappearingMessages: setting ? setting.disappearingMessages : "off" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE DISAPPEARING SETTING FOR A CHAT
exports.updateDisappearingSetting = async (req, res) => {
  try {
    const { receiverId, isGroup, duration } = req.body;
    const senderId = req.userId;

    if (!receiverId || !duration) {
      return res.status(400).json({ error: "receiverId and duration are required" });
    }

    const validDurations = ["off", "24h", "7d", "90d"];
    if (!validDurations.includes(duration)) {
      return res.status(400).json({ error: "Invalid duration value" });
    }

    const chatId = isGroup ? receiverId : [senderId, receiverId].sort().join('_');

    const setting = await ChatSetting.findOneAndUpdate(
      { chatId },
      { disappearingMessages: duration },
      { returnDocument: "after", upsert: true }
    );

    const sender = await User.findOne({ userId: senderId });
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    let displayText = "";
    if (duration === "off") {
      displayText = `${sender.username} turned off disappearing messages.`;
    } else {
      const displayDurations = { "24h": "24 hours", "7d": "7 days", "90d": "90 days" };
      displayText = `${sender.username} set messages to disappear after ${displayDurations[duration]}.`;
    }

    const systemMessage = new Message({
      senderId,
      senderUsername: "System",
      receiverId,
      text: displayText,
      messageType: "system",
      isGroup: !!isGroup,
      status: "seen"
    });

    await systemMessage.save();

    // Emit to both parties via server-side socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (io && onlineUsers) {
      const msgPayload = systemMessage.toObject();
      msgPayload._id = systemMessage._id.toString();

      const settingPayload = { chatId, duration };

      if (isGroup) {
        io.to(receiverId).emit("receiveMessage", msgPayload);
        io.to(receiverId).emit("disappearingSettingChanged", settingPayload);
      } else {
        const senderSockets = onlineUsers.get(senderId) || new Set();
        const receiverSockets = onlineUsers.get(receiverId) || new Set();
        senderSockets.forEach(id => io.to(id).emit("receiveMessage", msgPayload));
        senderSockets.forEach(id => io.to(id).emit("disappearingSettingChanged", settingPayload));
        receiverSockets.forEach(id => io.to(id).emit("receiveMessage", msgPayload));
        receiverSockets.forEach(id => io.to(id).emit("disappearingSettingChanged", settingPayload));
      }
    }

    res.json({
      success: true,
      disappearingMessages: setting.disappearingMessages,
      systemMessage
    });
  } catch (err) {
    console.error("Error setting disappearing messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};
