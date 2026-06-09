const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Guard all endpoints under /api/admin with verifyToken and verifyAdmin
router.use(verifyToken, verifyAdmin);

// Admin Moderation Endpoints
router.get("/reports", adminController.getReports);
router.post("/reports/:reportId/resolve", adminController.resolveReport);
router.post("/users/:userId/toggle-suspend", adminController.toggleSuspendUser);
router.get("/users", adminController.getUsersList);

// Ban Appeal Endpoints
router.get("/appeals", adminController.getAppeals);
router.post("/appeals/:appealId/approve", adminController.approveAppeal);
router.post("/appeals/:appealId/deny", adminController.denyAppeal);

// Chat Monitoring Endpoints
router.get(
  "/users/:userId/conversations",
  adminController.getUserConversations,
);
router.get(
  "/users/:userId/thread/:partnerId",
  adminController.getConversationThread,
);

// Admin Message
router.delete("/messages/:messageId", adminController.deleteMessage);
router.post("/users/:userId/silent-ban", adminController.silentBanUser);

// Group & Channel Monitoring Endpoints
router.get("/groups", adminController.getAllGroups);
router.get("/groups/:groupId/messages", adminController.getGroupMessages);
router.get("/groups/:groupId/members", adminController.getGroupMembers);
router.delete("/groups/:groupId/members/:userId", adminController.removeGroupMember);

router.get("/channels", adminController.getAllChannels);
router.get("/channels/:channelId/messages", adminController.getChannelMessages);
router.get("/channels/:channelId/followers", adminController.getChannelFollowers);
router.delete("/channels/:channelId/followers/:userId", adminController.removeChannelFollower);

module.exports = router;
