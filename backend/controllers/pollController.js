const Message = require("../models/Message");

// VOTE on poll message
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.userId;

    if (optionIndex === undefined || typeof optionIndex !== "number") {
      return res.status(400).json({ error: "optionIndex is required and must be a number" });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (message.messageType !== "poll") {
      return res.status(400).json({ error: "Message is not a poll" });
    }

    let pollData;
    try {
      pollData = JSON.parse(message.text);
    } catch (e) {
      return res.status(400).json({ error: "Invalid poll data content" });
    }

    if (!pollData.options || !pollData.options[optionIndex]) {
      return res.status(400).json({ error: "Invalid optionIndex" });
    }

    const option = pollData.options[optionIndex];
    if (!option.votes) option.votes = [];

    const votedIndex = option.votes.indexOf(userId);
    if (votedIndex > -1) {
      option.votes.splice(votedIndex, 1);
    } else {
      if (pollData.allowMultiple === false) {
        pollData.options.forEach((opt, idx) => {
          if (idx !== optionIndex && opt.votes) {
            opt.votes = opt.votes.filter(id => id !== userId);
          }
        });
      }
      option.votes.push(userId);
    }

    message.text = JSON.stringify(pollData);
    await message.save();

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (io && onlineUsers) {
      const msgObj = message.toObject();
      msgObj._id = message._id.toString();

      if (message.isGroup) {
        io.to(message.receiverId).emit("messageEdited", msgObj);
      } else {
        const senderSockets = onlineUsers.get(message.senderId) || new Set();
        const receiverSockets = onlineUsers.get(message.receiverId) || new Set();

        senderSockets.forEach(id => io.to(id).emit("messageEdited", msgObj));
        receiverSockets.forEach(id => io.to(id).emit("messageEdited", msgObj));
      }
    }

    res.json(message);
  } catch (err) {
    console.error("Poll vote error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
