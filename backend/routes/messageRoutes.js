const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");

const messageController = require("../controllers/messageController");
const pollController = require("../controllers/pollController");
const disappearingController = require("../controllers/disappearingController");
const actionController = require("../controllers/actionController");

const router = express.Router();

router.get("/disappearing/:chatId", verifyToken, disappearingController.getDisappearingSetting);
router.post("/disappearing", verifyToken, disappearingController.updateDisappearingSetting);
router.post("/toggle-star/:messageId", verifyToken, actionController.toggleStarMessage);
router.get("/starred", verifyToken, actionController.getStarredMessages);
router.get("/conversations/:userId", verifyToken, messageController.getConversations);
router.get("/fetch-group/:groupId", verifyToken, messageController.fetchGroupMessages);
router.post("/react/:messageId", verifyToken, actionController.reactToMessage);
router.post("/delete-for-me/:messageId", verifyToken, actionController.deleteMessageForMe);
router.post("/delete-for-everyone/:messageId", verifyToken, actionController.deleteMessageForEveryone);
router.delete("/clear/:chatId", verifyToken, messageController.clearChat);
router.delete("/:messageId", verifyToken, actionController.legacyDeleteMessage);
router.put("/:messageId", verifyToken, actionController.editMessage);
router.post("/poll-vote/:messageId", verifyToken, pollController.votePoll);
router.post("/send", verifyToken, messageController.sendEncryptedMessage);
router.post("/broadcast", verifyToken, messageController.broadcastMessage);
router.post("/", verifyToken, messageController.sendMessage);
router.get("/:senderId/:receiverId", verifyToken, messageController.getMessages);

module.exports = router;
