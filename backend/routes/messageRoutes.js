const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getDisappearingSetting,
  updateDisappearingSetting,
  toggleStarMessage,
  getStarredMessages,
  getConversations,
  fetchGroupMessages,
  reactToMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  legacyDeleteMessage,
  editMessage,
  votePoll,
  sendEncryptedMessage,
  broadcastMessage,
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/disappearing/:chatId", verifyToken, getDisappearingSetting);
router.post("/disappearing", verifyToken, updateDisappearingSetting);
router.post("/toggle-star/:messageId", verifyToken, toggleStarMessage);
router.get("/starred", verifyToken, getStarredMessages);
router.get("/conversations/:userId", verifyToken, getConversations);
router.get("/fetch-group/:groupId", verifyToken, fetchGroupMessages);
router.post("/react/:messageId", verifyToken, reactToMessage);
router.post("/delete-for-me/:messageId", verifyToken, deleteMessageForMe);
router.post("/delete-for-everyone/:messageId", verifyToken, deleteMessageForEveryone);
router.delete("/:messageId", verifyToken, legacyDeleteMessage);
router.put("/:messageId", verifyToken, editMessage);
router.post("/poll-vote/:messageId", verifyToken, votePoll);
router.post("/send", verifyToken, sendEncryptedMessage);
router.post("/broadcast", verifyToken, broadcastMessage);
router.post("/", verifyToken, sendMessage);
router.get("/:senderId/:receiverId", verifyToken, getMessages);

module.exports = router;
