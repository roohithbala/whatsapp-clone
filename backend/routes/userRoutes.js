const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");

const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const contactsController = require("../controllers/contactsController");
const sessionController = require("../controllers/sessionController");
const securityController = require("../controllers/securityController");

const router = express.Router();

// Auth Endpoints
router.post("/google-auth", authController.googleAuth);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Profile Endpoints
router.get("/:userId", verifyToken, profileController.getUserById);
router.put("/:userId", verifyToken, profileController.updateProfile);
router.put("/:userId/settings", verifyToken, profileController.updateSettings);
router.put("/:userId/privacy", verifyToken, profileController.updatePrivacy);

// Contacts Endpoints
router.get("/", verifyToken, contactsController.getAllUsers);
router.get("/search", verifyToken, contactsController.searchUsers);
router.get("/:userId/contacts", verifyToken, contactsController.getContacts);
router.post("/:userId/contacts", verifyToken, contactsController.addContact);
router.delete("/:userId/contacts/:contactId", verifyToken, contactsController.removeContact);

// Session Endpoints
router.get("/sessions", verifyToken, sessionController.getSessions);
router.delete("/sessions/:sessionId", verifyToken, sessionController.revokeSession);
router.delete("/sessions-others", verifyToken, sessionController.revokeOtherSessions);
router.post("/logout/:userId", verifyToken, sessionController.logout);

// Security Endpoints
router.post("/archive/:targetId", verifyToken, securityController.toggleArchive);
router.post("/unarchive/:targetId", verifyToken, securityController.unarchiveChat);
router.post("/favorite/:targetId", verifyToken, securityController.toggleFavorite);
router.post("/block/:targetId", verifyToken, securityController.toggleBlock);
router.post("/unblock/:targetId", verifyToken, securityController.unblock);
router.post("/lock/:targetId", verifyToken, securityController.toggleLock);
router.post("/unlock/:targetId", verifyToken, securityController.unlock);
router.post("/set-pin", verifyToken, securityController.setPin);
router.post("/verify-pin", verifyToken, securityController.verifyPin);
router.post("/:userId/verify-pin", verifyToken, securityController.verifyPinParam);
router.post("/report", verifyToken, securityController.reportUser);
router.post("/mute/:targetId", verifyToken, securityController.toggleMuteChat);
router.patch("/:userId/mute/:targetId", verifyToken, securityController.toggleMuteChat);
router.get("/:userId/starred-messages", verifyToken, securityController.getStarredMessages);

module.exports = router;
